---
title: ''
date: 2024-03-31
type: landing

sections:
  # Hero Section - 简洁的个人介绍
  - block: hero
    id: about
    content:
      title: Yang Gao
      subtitle: Ph.D., Director of VIGA Lab
      text: |
        **Virtual Intelligence and Graphical Animation Laboratory**
        
        School of Computer Science and Technology  
        Suzhou City University of Applied Sciences
        
        Research interests: Virtual Reality, Physics-based Fluid Simulation, Realistic Rendering, VR Rehabilitation
    design:
      background:
        color: '#ffffff'
      spacing:
        padding: ['100px', '0', '60px', '0']

  # Biography Section
  - block: resume-biography
    id: biography
    content:
      title: Biography
      username: admin
    design:
      background:
        color: '#f8f9fa'
      spacing:
        padding: ['60px', '0', '60px', '0']

  # Research Section - 研究方向
  - block: collection
    id: research
    content:
      title: Research
      subtitle: Research Directions
      text: ''
      count: 4
      filters:
        folders:
          - research
    design:
      view: article-grid
      columns: '2'
      spacing:
        padding: ['60px', '0', '60px', '0']

  # Publications Section
  - block: collection
    id: publications
    content:
      title: Publications
      text: |-
        Selected publications in computer graphics, virtual reality, and human-computer interaction.
      count: 5
      filters:
        folders:
          - publication
    design:
      view: article-grid
      columns: '1'
      spacing:
        padding: ['60px', '0', '60px', '0']

  # News Section
  - block: collection
    id: news
    content:
      title: News
      subtitle: Latest Updates
      text: ''
      count: 3
      filters:
        folders:
          - post
    design:
      view: article-grid
      columns: '1'
      spacing:
        padding: ['60px', '0', '60px', '0']

  # Contact Section
  - block: markdown
    id: contact
    content:
      title: Contact
      subtitle: ''
      text: |
        **Email:** [honggaoyang@anspxhj999.onexmail.com](mailto:honggaoyang@anspxhj999.onexmail.com)
        
        **Phone:** +86 400-9699-180
        
        **Address:**  
        Virtual Intelligence and Graphical Animation Laboratory  
        School of Computer Science and Technology  
        Suzhou City University of Applied Sciences  
        903 Chunshenhu West Road, Xiangcheng District  
        Suzhou, Jiangsu 215000, China
    design:
      background:
        color: '#f8f9fa'
      spacing:
        padding: ['60px', '0', '100px', '0']
---
