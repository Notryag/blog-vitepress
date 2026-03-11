import { existsSync, readdirSync } from "node:fs"
import { basename, extname, resolve } from "node:path"
import { defineConfig } from "vitepress"
import genNav from "vitepress-auto-navigation"

const CODE_EXTENSIONS = [".js", ".ts", ".html"]

function hasMarkdownContent(dir: string): boolean {
  if (!existsSync(dir)) {
    return false
  }

  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith(".")) {
      continue
    }

    const fullPath = resolve(dir, entry.name)

    if (entry.isFile() && entry.name.endsWith(".md")) {
      return true
    }

    if (entry.isDirectory() && hasMarkdownContent(fullPath)) {
      return true
    }
  }

  return false
}

const hasBlogContent = hasMarkdownContent(resolve(process.cwd(), "myBlog"))
const autoNavigation = hasBlogContent
  ? genNav({
      sourceDir: "./myBlog",
      routeBase: "/myBlog",
      extensions: [".md", ...CODE_EXTENSIONS],
      resolveText: (file) => {
        const extension = extname(file.relativePath).toLowerCase()

        if (!CODE_EXTENSIONS.includes(extension)) {
          return file.name
        }

        return basename(file.relativePath)
      },
      resolveLink: (file) => {
        const extension = extname(file.relativePath).toLowerCase()

        if (!CODE_EXTENSIONS.includes(extension)) {
          return file.routePath
        }

        return `/snippets/${file.relativePath.replace(/\.[^/.]+$/, "")}`
      },
    })
  : { nav: [], sidebar: {} }
const snippetSidebar = Object.fromEntries(
  Object.entries(autoNavigation.sidebar).map(([path, items]) => [
    path.replace(/^\/myBlog\//, "/snippets/"),
    items,
  ]),
)

// https://vitepress.dev/reference/site-config
export default defineConfig({
  base: "/blog-vitepress/",
  cleanUrls: true,
  srcExclude: ["README.md"],
  title: "My Note",
  description: "A VitePress site for personal notes managed with a git submodule.",
  lastUpdated: true,
  themeConfig: {
    nav: [
      { text: "项目说明", link: "/docs/" },
      ...(hasBlogContent ? autoNavigation.nav : []),
    ],
    sidebar: {
      "/docs/": [
        {
          text: "开始使用",
          items: [{ text: "项目说明", link: "/docs/" }],
        },
      ],
      ...(hasBlogContent ? autoNavigation.sidebar : {}),
      ...(hasBlogContent ? snippetSidebar : {}),
    },
    search: {
      provider: "local",
    },
    socialLinks: [{ icon: "github", link: "https://github.com/Notryag" }],
  },
})
