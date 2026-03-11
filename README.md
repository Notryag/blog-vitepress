# blog-vitepress

一个用于托管个人笔记站的 VitePress 外壳仓库。

Markdown 内容放在 `myBlog` 子模块中，当前仓库负责：

- 站点配置
- 自动生成导航
- 代码示例包装页生成
- GitHub Pages 部署

## 快速开始

```bash
git clone <repo-url>
cd blog-vitepress
git submodule update --init --recursive
pnpm install
pnpm dev
```

## 目录结构

- `myBlog/`：Markdown 内容仓库，使用 git submodule 管理
- `.vitepress/`：VitePress 配置
- `docs/`：项目说明页
- `scripts/`：构建前生成代码示例页面

## 自动导航

站点使用 `vitepress-auto-navigation` 根据 `myBlog` 目录自动生成 `nav` 和 `sidebar`。如果本地还没有拉取子模块，站点仍能启动，但不会显示笔记导航。

除了 Markdown 页面，站点还会在构建前扫描 `myBlog` 里的 `.js`、`.ts` 和 `.html` 文件，并自动生成 `snippets/` 下的包装页，让这些代码文件也能通过导航访问。

## 部署

`.github/workflows/deploy.yml` 会在 `master` 分支收到 push 后自动：

1. 拉取仓库和子模块
2. 安装依赖
3. 构建 VitePress 站点
4. 发布到 GitHub Pages
