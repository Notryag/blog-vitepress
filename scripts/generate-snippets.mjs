import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs"
import { dirname, extname, join, relative } from "node:path"

const BLOG_DIR = "myBlog"
const OUTPUT_DIR = "snippets"
const CODE_EXTENSIONS = new Set([".js", ".ts", ".html"])
const IGNORED_DIRS = new Set([
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

function createSnippetPage(relativePath) {
  const sourcePath = join(BLOG_DIR, relativePath)
  const extension = extname(relativePath).toLowerCase()
  const title = relativePath.split("/").at(-1)
  const code = readFileSync(sourcePath, "utf8")
  const language = LANGUAGE_MAP[extension] ?? "text"
  const outputPath = join(OUTPUT_DIR, relativePath.replace(/\.[^/.]+$/, ".md"))
  const outputDir = dirname(outputPath)
  const originalPath = toPosixPath(sourcePath)

  mkdirSync(outputDir, { recursive: true })
  writeFileSync(
    outputPath,
    `---
title: ${JSON.stringify(title)}
outline: false
---

# ${escapeMarkdown(title)}

- Source: \`${escapeMarkdown(originalPath)}\`

\`\`\`\`${language}
${code}
\`\`\`\`
`,
  )
}

function walk(dir) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith(".") || IGNORED_DIRS.has(entry.name)) {
      continue
    }

    const fullPath = join(dir, entry.name)

    if (entry.isDirectory()) {
      walk(fullPath)
      continue
    }

    if (!entry.isFile()) {
      continue
    }

    const extension = extname(entry.name).toLowerCase()

    if (!CODE_EXTENSIONS.has(extension)) {
      continue
    }

    createSnippetPage(toPosixPath(relative(BLOG_DIR, fullPath)))
  }
}

if (existsSync(OUTPUT_DIR)) {
  rmSync(OUTPUT_DIR, { recursive: true, force: true })
}

if (existsSync(BLOG_DIR)) {
  walk(BLOG_DIR)
}
