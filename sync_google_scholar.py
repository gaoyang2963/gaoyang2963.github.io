#!/usr/bin/env python3
"""
Google Scholar Publications Sync Script
Fetches publications from Google Scholar and updates the website content.
Run this monthly via GitHub Actions automation.
"""

import json
import re
from datetime import datetime
from scholarly import scholarly, ProxyGenerator
import requests
import os

# Configuration
GOOGLE_SCHOLAR_ID = "gMVDb5wAAAAJ"  # Replace with actual ID
CONTENT_FILE = "content/_index.md"
BACKUP_FILE = f"content/_index.md.backup.{datetime.now().strftime('%Y%m%d_%H%M%S')}"

def fetch_google_scholar_publications(scholar_id, max_results=50):
    """Fetch publications from Google Scholar profile"""
    print(f"Fetching publications for scholar ID: {scholar_id}")

    try:
        search_query = scholarly.search_author(scholar_id)
        author = scholarly.fill(search_query, sections=['publications'])

        publications = []
        for pub in author['publications'][:max_results]:
            # Fill publication details
            pub_data = scholarly.fill(pub)

            # Extract publication info
            pub_info = {
                'title': pub_data.get('bib', {}).get('title', ''),
                'year': str(pub_data.get('bib', {}).get('pub_year', '2025')),
                'venue': pub_data.get('bib', {}).get('citation', ''),
                'authors': pub_data.get('bib', {}).get('author', ''),
                'url': pub_data.get('pub_url', ''),
                'doi': extract_doi(pub_data),
                'citation_count': pub_data.get('num_citations', 0)
            }
            publications.append(pub_info)
            print(f"  Found: {pub_info['title']} ({pub_info['year']})")

        print(f"Total publications fetched: {len(publications)}")
        return publications

    except Exception as e:
        print(f"Error fetching publications: {e}")
        return []

def extract_doi(pub_data):
    """Extract DOI from publication data"""
    # Try to extract DOI from pub_url or citation
    url = pub_data.get('pub_url', '')
    citation = pub_data.get('bib', {}).get('citation', '')

    # Pattern 1: DOI in URL
    doi_match = re.search(r'doi\.org/(10\.\d{4,}/[^\s]+)', url)
    if doi_match:
        return f"https://doi.org/{doi_match.group(1)}"

    # Pattern 2: DOI in citation text
    doi_match = re.search(r'(10\.\d{4,}/[^\s,]+)', citation)
    if doi_match:
        return f"https://doi.org/{doi_match.group(1)}"

    # Pattern 3: IEEE Xplore DOI
    doi_match = re.search(r'document/(\d+)', url)
    if doi_match and 'ieeexplore.ieee.org' in url:
        doc_id = doi_match.group(1)
        # Map to approximate DOI (this is a simplified approach)
        return f"https://doi.org/10.1109/TVCG.{doc_id}"

    return None

def format_publication_for_website(pub):
    """Format publication data for website Markdown"""
    # Extract venue from citation
    venue = pub['venue']
    year = pub['year']

    # Try to extract conference/journal abbreviation
    venue_match = re.match(r'\[([^\]]+)\]', venue)
    if venue_match:
        venue_abbr = venue_match.group(1)
        venue_full = venue.replace(venue_abbr, '').strip()
    else:
        venue_abbr = 'Unknown'
        venue_full = venue

    # Format paper link
    paper_link = ""
    if pub['doi']:
        paper_link = f'    [<a href="{pub["doi"]}">Paper</a>]\n'
    elif pub['url']:
        paper_link = f'    [<a href="{pub["url"]}">Paper</a>]\n'

    # Format author list
    authors = pub['authors']
    if len(authors) > 100:  # Truncate if too long
        authors = authors[:100] + '...'

    # Create markdown entry
    markdown = f'''  <li>
    <p><strong>[{venue_abbr} '{year[-2:]}]</strong> {authors}.
    {pub['title']}. {venue_full}, {year}.
    {paper_link}</p>
  </li>'''

    return markdown

def update_content_file(publications, content_file):
    """Update the content file with new publications"""
    print(f"Updating content file: {content_file}")

    # Backup original file
    if os.path.exists(content_file):
        import shutil
        shutil.copy2(content_file, BACKUP_FILE)
        print(f"Backup created: {BACKUP_FILE}")

    # Read current content
    with open(content_file, 'r', encoding='utf-8') as f:
        content = f.read()

    # Find publications section
    pub_section_start = content.find('<h5 id="-publications">')
    if pub_section_start == -1:
        print("Error: Publications section not found!")
        return False

    pub_list_start = content.find('<ul>', pub_section_start)
    pub_list_end = content.find('</ul>', pub_list_start)

    if pub_list_start == -1 or pub_list_end == -1:
        print("Error: Publications list not found!")
        return False

    # Generate new publications list
    new_publications_html = "<ul>\n"
    for pub in publications[:15]:  # Limit to top 15 for selected publications
        new_publications_html += format_publication_for_website(pub)
    new_publications_html += "</ul>\n"

    # Update content
    updated_content = (
        content[:pub_list_start] +
        new_publications_html +
        content[pub_list_end + 5:]  # Skip closing </ul>
    )

    # Write updated content
    with open(content_file, 'w', encoding='utf-8') as f:
        f.write(updated_content)

    print(f"Content file updated successfully!")
    print(f"Updated {len(publications[:15])} publications")
    return True

def main():
    """Main function"""
    print("=" * 60)
    print("Google Scholar Publications Sync")
    print(f"Run at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("=" * 60)

    # Check if Google Scholar ID is configured
    if GOOGLE_SCHOLAR_ID == "YOUR_GOOGLE_SCHOLAR_ID":
        print("Error: Please configure GOOGLE_SCHOLAR_ID in the script")
        print("You can find your Scholar ID at: https://scholar.google.com/citations?user=YOUR_ID")
        return

    # Fetch publications
    publications = fetch_google_scholar_publications(GOOGLE_SCHOLAR_ID)

    if not publications:
        print("No publications fetched, exiting...")
        return

    # Sort by year (newest first)
    publications.sort(key=lambda x: x['year'], reverse=True)

    # Update content file
    success = update_content_file(publications, CONTENT_FILE)

    if success:
        print("\n" + "=" * 60)
        print("✓ Publications sync completed successfully!")
        print("=" * 60)
    else:
        print("\n" + "=" * 60)
        print("✗ Publications sync failed!")
        print("=" * 60)

if __name__ == "__main__":
    main()
