---
title: 仓库说明
outline: false
---

# 仓库说明

这个仓库有两个角色：

1. 发布 `notespress` npm 包
2. 维护一个自用的 `blog-vitepress` VitePress 站点壳

## 目录约定

- `bin/`：CLI 入口
- `lib/`：CLI 运行时逻辑
- `assets/`：随包发布的主题资源
- `myBlog/`：笔记内容子仓库，使用 git submodule 管理
- `.vitepress/`：当前演示站点配置
- `docs/`：仓库说明文档
- `scripts/`：构建前辅助脚本

## 本地开发

```bash
git submodule update --init --recursive
pnpm install
pnpm dev
```

如果 `myBlog` 还没有初始化，站点仍然可以启动，但不会生成笔记导航。

## 站点构建

根仓库的站点构建仍然服务于 `blog-vitepress` 这个演示壳站点：

```bash
pnpm build
pnpm preview
```

执行构建时会先运行 `scripts/generate-snippets.mjs`，扫描 `myBlog` 中的 `.js`、`.ts`、`.html` 文件，并生成 `snippets/` 下的包装页。

## 子仓库 myBlog

`myBlog/` 是独立仓库，也可以直接使用上层的 `notespress`：

```bash
cd myBlog
pnpm build
pnpm dev
pnpm preview
```

## 部署

`.github/workflows/deploy.yml` 会在 `master` 分支收到 push 后自动安装依赖、构建站点并发布到 GitHub Pages。
