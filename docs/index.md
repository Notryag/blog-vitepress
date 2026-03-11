---
title: 项目说明
outline: false
---

# 项目说明

这个仓库负责 VitePress 站点本身，不负责真正的笔记内容。

## 目录约定

- `myBlog/`：通过 git submodule 挂载的 Markdown 内容仓库
- `.vitepress/`：站点配置
- `docs/`：站点说明和运维文档
- `scripts/`：构建前辅助脚本

## 本地开发

```bash
git submodule update --init --recursive
pnpm install
pnpm dev
```

如果 `myBlog` 还没有初始化，站点仍然可以启动，但不会生成笔记导航。

## 代码示例页面

执行 `pnpm dev` 或 `pnpm build` 时，仓库会先运行 `scripts/generate-snippets.mjs`：

- 扫描 `myBlog` 中的 `.js`、`.ts`、`.html` 文件
- 生成 `snippets/` 下的 Markdown 包装页
- 让导航里的代码文件链接跳到 `/snippets/...` 路由

`snippets/` 是构建产物源文件，不需要手工维护，也不需要提交到 git。

## 部署

仓库内置了 GitHub Pages workflow。`master` 分支收到 push 后会自动安装依赖、构建站点并部署到 Pages。
