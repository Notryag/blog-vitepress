import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs"
import { dirname, extname, join, relative } from "node:path"

export const CODE_EXTENSIONS = new Set([".js", ".ts", ".html"])
export const IGNORED_DIRS = new Set([
  ".blog-cli",
  ".git",
  ".github",
  ".vitepress",
  "node_modules",
  "dist",
  "build",
])

const LANGUAGE_MAP = {
  ".html": "html",
  ".js": "js",
  ".ts": "ts",
}

function toPosixPath(filePath) {
  return filePath.replace(/\\/g, "/")
}

function escapeMarkdown(value) {
  return value.replace(/\\/g, "\\\\").replace(/`/g, "\\`")
}

function escapeHtml(value) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
}

function normalizeRouteBase(routeBase = "") {
  const normalized = routeBase.replace(/\\/g, "/").trim().replace(/\/+$/g, "")

  if (normalized === "" || normalized === "/") {
    return ""
  }

  return normalized.startsWith("/") ? normalized : `/${normalized}`
}

function createSectionRoute(routeBase, section) {
  const normalizedBase = normalizeRouteBase(routeBase)
  return `${normalizedBase}/${section}/`.replace(/\/+/g, "/")
}

function createSnippetRoute(snippetRouteBase, relativePath) {
  const normalizedBase = normalizeRouteBase(snippetRouteBase) || "/snippets"
  const routePath = relativePath.replace(/\.[^/.]+$/, "")
  return `${normalizedBase}/${routePath}`.replace(/\/+/g, "/")
}

function createSnippetPage(relativePath, options) {
  const {
    contentDir,
    outputDir,
    routeBase,
    snippetRouteBase,
    sourceLinkPrefix,
  } = options
  const sourcePath = join(contentDir, relativePath)
  const extension = extname(relativePath).toLowerCase()
  const title = relativePath.split("/").at(-1)
  const code = readFileSync(sourcePath, "utf8")
  const language = LANGUAGE_MAP[extension] ?? "text"
  const outputPath = join(outputDir, relativePath.replace(/\.[^/.]+$/, ".md"))
  const outputDirname = dirname(outputPath)
  const originalPath = toPosixPath(sourcePath)
  const pathSegments = relativePath.split("/")
  const lineCount = code === "" ? 0 : code.split(/\r?\n/).length
  const section = pathSegments[0] ?? "snippet"
  const sectionRoute = createSectionRoute(routeBase, section)
  const snippetRoute = createSnippetRoute(snippetRouteBase, relativePath)
  const includeSourcePath = [sourceLinkPrefix, relativePath]
    .filter(Boolean)
    .map(toPosixPath)
    .join("/")
  const breadcrumbItems = pathSegments.map((segment, index) => {
    const href =
      index === pathSegments.length - 1
        ? snippetRoute
        : createSnippetRoute(snippetRouteBase, pathSegments.slice(0, index + 1).join("/"))

    return `<a class="snippet-breadcrumb__link" href="${escapeHtml(href)}">${escapeHtml(segment)}</a>`
  })

  mkdirSync(outputDirname, { recursive: true })
  writeFileSync(
    outputPath,
    `---
title: ${JSON.stringify(title)}
outline: false
pageClass: snippet-page
---

<div class="snippet-breadcrumb">
  <a class="snippet-breadcrumb__link" href="${escapeHtml(sectionRoute)}">Back to ${escapeHtml(section)}</a>
  <span class="snippet-breadcrumb__divider">/</span>
  ${breadcrumbItems.join('\n  <span class="snippet-breadcrumb__divider">/</span>\n  ')}
</div>

<div class="snippet-hero">
  <span class="snippet-hero__chip">${escapeHtml(language.toUpperCase())}</span>
  <span class="snippet-hero__chip">${lineCount} lines</span>
  <span class="snippet-hero__chip">${escapeHtml(section)}</span>
</div>

# ${escapeMarkdown(title)}

<div class="snippet-meta">
  <div class="snippet-meta__item">
    <span class="snippet-meta__label">Source</span>
    <code>${escapeHtml(originalPath)}</code>
  </div>
  <div class="snippet-meta__item">
    <span class="snippet-meta__label">Route</span>
    <code>${escapeHtml(snippetRoute)}</code>
  </div>
  <div class="snippet-meta__item">
    <span class="snippet-meta__label">Section</span>
    <a href="${escapeHtml(sectionRoute)}">${escapeHtml(sectionRoute)}</a>
  </div>
</div>

<<< @/${includeSourcePath}
`,
  )
}

function walk(dir, options) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith(".") || IGNORED_DIRS.has(entry.name)) {
      continue
    }

    const fullPath = join(dir, entry.name)

    if (entry.isDirectory()) {
      walk(fullPath, options)
      continue
    }

    if (!entry.isFile()) {
      continue
    }

    const extension = extname(entry.name).toLowerCase()

    if (!CODE_EXTENSIONS.has(extension)) {
      continue
    }

    createSnippetPage(toPosixPath(relative(options.contentDir, fullPath)), options)
  }
}

export function generateSnippetPages(options = {}) {
  const contentDir = options.contentDir ?? "myBlog"
  const outputDir = options.outputDir ?? "snippets"
  const routeBase = options.routeBase ?? "/myBlog"
  const snippetRouteBase = options.snippetRouteBase ?? "/snippets"
  const sourceLinkPrefix = options.sourceLinkPrefix ?? ""

  if (existsSync(outputDir)) {
    rmSync(outputDir, { recursive: true, force: true })
  }

  if (!existsSync(contentDir)) {
    return { count: 0 }
  }

  const generationOptions = {
    contentDir,
    outputDir,
    routeBase,
    snippetRouteBase,
    sourceLinkPrefix,
  }

  walk(contentDir, generationOptions)

  let count = 0

  if (existsSync(outputDir)) {
    const stack = [outputDir]

    while (stack.length > 0) {
      const currentDir = stack.pop()

      for (const entry of readdirSync(currentDir, { withFileTypes: true })) {
        const fullPath = join(currentDir, entry.name)

        if (entry.isDirectory()) {
          stack.push(fullPath)
          continue
        }

        if (entry.isFile() && extname(entry.name) === ".md") {
          count += 1
        }
      }
    }
  }

  return {
    count,
    contentDir,
    outputDir,
    routeBase,
    snippetRouteBase,
    sourceLinkPrefix,
  }
}
