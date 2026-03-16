# notespress

`notespress` 是一个把 Markdown 笔记目录直接生成为 VitePress 博客站点的 CLI。

它默认把当前目录当作内容目录，自动生成导航、侧边栏和代码片段页面，不要求你手工维护 `.vitepress` 配置。

## 安装

```bash
npm install -D notespress
```

一次性运行也可以：

```bash
pnpm dlx notespress build
```

## 快速开始

在你的 Markdown 笔记目录里执行：

```bash
notespress dev
notespress build
notespress preview
```

如果你没有全局安装，可以改用：

```bash
npx notespress dev
npx notespress build
npx notespress preview
```

## 默认行为

- 当前目录作为内容目录
- 构建产物输出到 `dist/`
- 临时工作区输出到 `.blog-cli/`
- `.js`、`.ts`、`.html` 会自动生成 `snippets/` 页面
- 不会把 `.vitepress` 配置写回你的笔记目录

## 常用命令

```bash
notespress dev [content-dir]
notespress build [content-dir]
notespress preview [content-dir]
notespress prepare-content [content-dir]
```

示例：

```bash
notespress build .
notespress build ./notes --out-dir ./site-dist
notespress dev ./notes --port 3000
notespress preview ./notes --port 4173
```

## 适用目录

适合这类目录结构：

```text
notes
├─ README.md
├─ frontend
│  ├─ react.md
│  └─ vue.md
└─ code
   └─ demo.ts
```

`notespress` 会根据目录结构生成导航，并把代码文件挂到 `/snippets/...` 路由下。

## 高级用法

如果你希望把当前目录初始化成一个长期维护的本地项目，再使用：

```bash
notespress init
```

它会尽量保守地初始化当前目录：

- 创建或合并 `package.json`
- 写入 `dev`、`build`、`preview` 脚本
- 添加 `.gitignore` 中的 `node_modules`、`dist`、`.blog-cli`
- 如果根目录没有 `README.md` 或 `index.md`，创建一个起始首页

如果要覆盖已有脚本或首页，可以加 `--force`。

## 仓库说明

当前仓库除了发布 `notespress` 包，也保留了一个用于自用和演示的 `blog-vitepress` 站点壳。

仓库结构和本地开发说明放在：

- [docs/index.md](/home/dev/workplace/github-repositories/blog-vitepress/docs/index.md)
- [docs/repository.md](/home/dev/workplace/github-repositories/blog-vitepress/docs/repository.md)
