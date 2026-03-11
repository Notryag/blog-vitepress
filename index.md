---
layout: home

hero:
  name: "My Note"
  text: "基于 VitePress 的个人笔记站"
  tagline: 站点外壳和 Markdown 内容分离，适合把博客内容托管在独立仓库中。
  actions:
    - theme: brand
      text: 项目说明
      link: /docs/
    - theme: alt
      text: GitHub
      link: https://github.com/Notryag/blog-vitepress

features:
  - title: 内容与站点解耦
    details: 博客内容放在 myBlog 子模块中，站点仓库只负责构建、导航和部署。
  - title: 自动导航
    details: 通过 vitepress-auto-navigation 从 Markdown 目录生成 nav 和 sidebar，减少手工维护。
  - title: 直接部署到 Pages
    details: 提供 GitHub Actions workflow，push 到主分支后即可重新构建并发布。
---
