---
title: ''
date: 2024-03-31
type: landing

sections:
  # Hero Section - 简洁的个人介绍，类似 miaowang.me
  - block: hero
    id: about
    content:
      title: Yang Gao
      subtitle: Ph.D., Director of VIGA Lab
      text: |
        **Virtual Intelligence and Graphical Animation Laboratory**
        
        School of Computer Science and Technology  
        Suzhou City University of Applied Sciences
        
        **Research Interests:** Virtual Reality, Physics-based Fluid Simulation, Realistic Rendering, VR Rehabilitation
    design:
      background:
        color: '#ffffff'
      spacing:
        padding: ['80px', '0', '40px', '0']

  # Biography Section
  - block: resume-biography
    id: biography
    content:
      title: Biography
      username: admin
    design:
      background:
        color: '#ffffff'
      spacing:
        padding: ['40px', '0', '40px', '0']

  # Research Section - 研究方向
  - block: collection
    id: research
    content:
      title: Research
      subtitle: ''
      text: ''
      count: 4
      filters:
        folders:
          - research
    design:
      view: article-grid
      columns: '2'
      spacing:
        padding: ['40px', '0', '40px', '0']

  # Publications Section
  - block: collection
    id: publications
    content:
      title: Publications
      text: ''
      count: 5
      filters:
        folders:
          - publication
    design:
      view: article-grid
      columns: '1'
      spacing:
        padding: ['40px', '0', '40px', '0']

  # News Section
  - block: collection
    id: news
    content:
      title: News
      subtitle: ''
      text: ''
      count: 3
      filters:
        folders:
          - post
    design:
      view: article-grid
      columns: '1'
      spacing:
        padding: ['40px', '0', '40px', '0']

  # Contact Section
  - block: markdown
    id: contact
    content:
      title: Contact
      subtitle: ''
      text: |
        **Email:** [honggaoyang@anspxhj999.onexmail.com](mailto:honggaoyang@anspxhj999.onexmail.com)
        
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
        padding: ['40px', '0', '60px', '0']
---