---
# Leave the homepage title empty to use the site title
title: ''
date: 2024-03-31
type: landing

sections:
  - block: hero
    id: hero
    content:
      title: Yang Gao
      subtitle: Director of VIGA Lab
      text: |-
        Virtual Intelligence and Graphical Animation Laboratory
        
        Research in VR, fluid simulation, realistic rendering, and rehabilitation.
      cta:
        label: Research
        url: /#research
      cta_alt:
        label: Contact
        url: /#contact
    design:
      background:
        gradient_end: '#1976d2'
        gradient_start: '#004ba0'
        text_color_light: true
  - block: collection
    id: about
    content:
      title: About
      text: ''
      filters:
        folders:
          - authors
        author: ""
        category: ""
        tag: ""
        exclude_featured: false
        exclude_future: false
        exclude_past: false
        publication_type: ""
      count: 1
      offset: 0
      order: desc
    design:
      view: article-default
      columns: '1'
  - block: collection
    id: research
    content:
      title: Research
      subtitle: ''
      text: ''
      count: 5
      filters:
        folders:
          - research
        author: ""
        category: ""
        tag: ""
        exclude_featured: false
        exclude_future: false
        exclude_past: false
        publication_type: ""
      offset: 0
      order: desc
    design:
      view: article-default
      columns: '2'
  - block: collection
    id: publications
    content:
      title: Recent Publications
      text: ''
      filters:
        folders:
          - publication
        exclude_featured: true
    design:
      columns: '2'
  - block: collection
    id: news
    content:
      title: Recent News
      subtitle: ''
      text: ''
      count: 5
      filters:
        folders:
          - post
        author: ""
        category: ""
        tag: ""
        exclude_featured: false
        exclude_future: false
        exclude_past: false
        publication_type: ""
      offset: 0
      order: desc
    design:
      view: article-default
      columns: '2'
  - block: markdown
    id: contact
    content:
      title: Contact
      subtitle: ''
      text: |-
        **Email:** honggaoyang@anspxhj999.onexmail.com

        **Phone:** 400-9699-180

        **Address:** 903 Chunshenhu West Road, Xiangcheng District, Suzhou, Jiangsu 215000, China
    design:
      columns: '1'
---
