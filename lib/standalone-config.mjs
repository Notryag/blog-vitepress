import { existsSync, readdirSync } from "node:fs"
import { basename, extname, join } from "node:path"
import { defineConfig } from "vitepress"
import genNav from "vitepress-auto-navigation"

const CODE_EXTENSIONS = [".js", ".ts", ".html"]

function hasMarkdownContent(dir) {
  if (!existsSync(dir)) {
    return false
  }

  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith(".")) {
      continue
    }

    if (entry.isFile() && entry.name.endsWith(".md")) {
      return true
    }

    if (entry.isDirectory() && hasMarkdownContent(join(dir, entry.name))) {
      return true
    }
  }

  return false
}

function createSnippetSidebar(autoNavigation) {
  return Object.fromEntries(
    Object.entries(autoNavigation.sidebar).map(([path, items]) => [`/snippets${path}`, items]),
  )
}

export function createStandaloneSiteConfig(options = {}) {
  const contentDir = options.contentDir ?? process.cwd()
  const siteTitle = options.title ?? basename(contentDir)
  const description =
    options.description ?? `Static site generated from ${basename(contentDir)} with notespress.`
  const siteBase = options.base ?? "/"
  const hasContent = hasMarkdownContent(contentDir)
  const autoNavigation = hasContent
    ? genNav({
        sourceDir: contentDir,
        routeBase: "",
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
  const snippetSidebar = createSnippetSidebar(autoNavigation)

  return defineConfig({
    base: siteBase,
    cleanUrls: true,
    title: siteTitle,
    description,
    lastUpdated: true,
    outDir: options.outDir,
    cacheDir: options.cacheDir,
    themeConfig: {
      nav: autoNavigation.nav,
      sidebar: {
        ...(hasContent ? autoNavigation.sidebar : {}),
        ...(hasContent ? snippetSidebar : {}),
      },
      search: {
        provider: "local",
      },
      socialLinks: [{ icon: "github", link: "https://github.com/Notryag" }],
    },
  })
}
