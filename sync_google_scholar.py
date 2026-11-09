#!/usr/bin/env python3
"""
Google Scholar Publications Sync Script
Fetches publications from Google Scholar and ADDS new entries to the website.

Design notes:
- Only appends papers that are not already present (matched by normalized title),
  so hand-curated formatting of existing entries is never overwritten.
- Emits a short report (.sync_report.md) used as the Pull Request body.
"""

import json
import re
import os
import sys
from datetime import datetime

# Configuration
GOOGLE_SCHOLAR_ID = os.environ.get("GOOGLE_SCHOLAR_ID") or "gMVDb5wAAAAJ"
CONTENT_FILE = "content/_index.md"
REPORT_FILE = ".sync_report.md"
MIN_YEAR = 2025          # only consider recent publications for the "Selected" list
MAX_FETCH = 15           # how many Scholar entries to inspect


def _norm(text):
    """Normalize text for fuzzy comparison (strip html, punctuation, case)."""
    text = re.sub(r"<[^>]+>", " ", text or "")
    return re.sub(r"[^a-z0-9]+", "", text.lower())


def fetch_google_scholar_publications(scholar_id, max_results=MAX_FETCH):
    from scholarly import scholarly

    # Fail fast: default retry/backoff makes a blocked runner hang for many minutes
    for setter, value in (("set_retries", 0), ("set_timeout", 20)):
        try:
            getattr(scholarly, setter)(value)
        except Exception:  # noqa: BLE001 - older versions may not expose these
            pass

    print(f"Fetching publications for scholar ID: {scholar_id}")
    try:
        result = scholarly.search_author(scholar_id)
        # scholarly >= 1.5 returns a generator, older versions return a dict
        if not isinstance(result, dict):
            result = next(iter(result))
        author = scholarly.fill(result, sections=["publications"])

        publications = []
        for pub in author.get("publications", [])[:max_results]:
            try:
                pub_data = scholarly.fill(pub)
            except Exception as exc:  # noqa: BLE001 - single entry failure is non-fatal
                print(f"  skip one entry ({exc})")
                continue
            bib = pub_data.get("bib", {})
            info = {
                "title": (bib.get("title") or "").strip(),
                "year": str(bib.get("pub_year") or ""),
                "venue": (bib.get("citation") or "").strip(),
                "authors": (bib.get("author") or "").strip(),
                "url": pub_data.get("pub_url", ""),
                "doi": extract_doi(pub_data),
            }
            if info["title"]:
                publications.append(info)
                print(f"  found: {info['title']} ({info['year']})")

        print(f"Total publications fetched: {len(publications)}")
        return publications
    except Exception as exc:  # noqa: BLE001
        print(f"Error fetching publications: {exc}")
        return []


def extract_doi(pub_data):
    url = pub_data.get("pub_url", "") or ""
    citation = pub_data.get("bib", {}).get("citation", "") or ""

    doi_match = re.search(r"doi\.org/(10\.\d{4,}/[^\s&]+)", url)
    if doi_match:
        return f"https://doi.org/{doi_match.group(1)}"

    doi_match = re.search(r"(10\.\d{4,}/[^\s,;]+)", citation)
    if doi_match:
        return f"https://doi.org/{doi_match.group(1)}"

    ieee = re.search(r"document/(\d+)", url)
    if ieee and "ieeexplore.ieee.org" in url:
        return f"https://doi.org/10.1109/TVCG.{ieee.group(1)}"

    return url or None


def format_publication(pub):
    venue = pub["venue"]
    year = pub["year"]

    venue_match = re.match(r"\[([^\]]+)\]", venue)
    if venue_match:
        abbr = venue_match.group(1)
        venue_full = venue.replace(venue_match.group(0), "").strip()
    else:
        abbr, venue_full = "Paper", venue

    link = f'    [<a href="{pub["doi"]}">Paper</a>]' if pub["doi"] else ""

    authors = pub["authors"]
    if len(authors) > 120:
        authors = authors[:120] + "..."

    head = f"  <li>\n    <p><strong>[{abbr} '{year[-2:]}]</strong> {authors}.\n"
    tail = f"    {pub['title']}. {venue_full}, {year}.\n"
    if link:
        tail += link + "</p>\n"
    else:
        tail = tail.rstrip("\n") + "</p>\n"
    return head + tail + "  </li>\n"


def update_content_file(publications):
    if not os.path.exists(CONTENT_FILE):
        print(f"Error: {CONTENT_FILE} not found")
        return []

    content = open(CONTENT_FILE, encoding="utf-8").read()
    existing_text = _norm(content)

    new_pubs = []
    for pub in publications:
        if not pub["year"].isdigit() or int(pub["year"]) < MIN_YEAR:
            continue
        key = _norm(pub["title"])[:60]
        if not key or key in existing_text:
            continue
        new_pubs.append(pub)
        existing_text += key  # guard against duplicates inside the same fetch

    if not new_pubs:
        print("No new publications detected.")
        return []

    section = content.find('<h5 id="-publications">')
    if section == -1:
        print("Error: publications section not found")
        return []
    list_start = content.find("<ul>", section)
    if list_start == -1:
        print("Error: publications list not found")
        return []

    insert_at = list_start + len("<ul>\n")
    block = "".join(format_publication(p) for p in new_pubs)
    updated = content[:insert_at] + block + content[insert_at:]

    open(CONTENT_FILE, "w", encoding="utf-8").write(updated)
    print(f"Added {len(new_pubs)} new publication(s) to {CONTENT_FILE}")
    return new_pubs


def write_report(new_pubs, publications):
    if not new_pubs:
        return
    lines = [
        "## 本月 Google Scholar 新增论文",
        "",
        f"共检测到 **{len(new_pubs)}** 篇新增论文（来自 Scholar 抓取的 {len(publications)} 条记录）：",
        "",
    ]
    for pub in new_pubs:
        lines.append(f"- **{pub['title']}**")
        lines.append(f"  - 作者：{pub['authors'] or '（未提供）'}")
        lines.append(f"  - 出处：{pub['venue'] or '（未提供）'}")
        lines.append(f"  - 年份：{pub['year']}")
        lines.append(f"  - 链接：{pub['doi'] or '（无）'}")
    lines += [
        "",
        "---",
        "本次只做**追加**，已有条目格式未被改动。确认无误后合并即可，合并后自动部署。",
    ]
    open(REPORT_FILE, "w", encoding="utf-8").write("\n".join(lines))
    print(f"Report written: {REPORT_FILE}")


def main():
    print("=" * 60)
    print("Google Scholar Publications Sync")
    print(f"Run at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("=" * 60)

    if GOOGLE_SCHOLAR_ID in ("", "YOUR_GOOGLE_SCHOLAR_ID"):
        print("Error: GOOGLE_SCHOLAR_ID is not configured")
        sys.exit(1)

    publications = fetch_google_scholar_publications(GOOGLE_SCHOLAR_ID)
    if not publications:
        print("No publications fetched - Google Scholar may be rate-limiting this runner.")
        sys.exit(1)

    new_pubs = update_content_file(publications)
    write_report(new_pubs, publications)

    print("=" * 60)
    print("done: %d new publication(s)" % len(new_pubs))
    print("=" * 60)


if __name__ == "__main__":
    main()
