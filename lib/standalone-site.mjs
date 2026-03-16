import { createHash } from "node:crypto"
import { mkdirSync, readFileSync, readdirSync, rmSync, symlinkSync, writeFileSync } from "node:fs"
import { basename, dirname, join, resolve } from "node:path"
import { fileURLToPath, pathToFileURL } from "node:url"

import { generateSnippetPages, IGNORED_DIRS } from "./snippets.mjs"

const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..")

function workspaceIdFor(contentDir) {
  const hash = createHash("sha1").update(contentDir).digest("hex").slice(0, 8)
  return `${basename(contentDir)}-${hash}`
}

function ensureDir(dir) {
  mkdirSync(dir, { recursive: true })
}

function writeStandaloneConfig(workspaceRoot, options) {
  const configDir = join(workspaceRoot, ".vitepress")
  const themeDir = join(configDir, "theme")
  const configModuleUrl = pathToFileURL(join(REPO_ROOT, "lib", "standalone-config.mjs")).href
  const customCss = readFileSync(join(REPO_ROOT, "assets", "theme", "custom.css"), "utf8")

  ensureDir(themeDir)
  writeFileSync(
    join(configDir, "config.mjs"),
    `import { createStandaloneSiteConfig } from ${JSON.stringify(configModuleUrl)}

export default createStandaloneSiteConfig(${JSON.stringify(options, null, 2)})
`,
  )
  writeFileSync(
    join(themeDir, "index.js"),
    `import DefaultTheme from "vitepress/theme"
import "./custom.css"

export default DefaultTheme
`,
  )
  writeFileSync(join(themeDir, "custom.css"), customCss)
}

function mirrorContentEntries(contentDir, workspaceRoot) {
  for (const entry of readdirSync(contentDir, { withFileTypes: true })) {
    if (entry.name.startsWith(".") || IGNORED_DIRS.has(entry.name)) {
      continue
    }

    const targetPath = join(contentDir, entry.name)
    const linkPath = join(workspaceRoot, entry.name)
    const linkType = entry.isDirectory() ? "dir" : "file"

    symlinkSync(targetPath, linkPath, linkType)
  }
}

export function resolveRepositoryRoot() {
  return REPO_ROOT
}

export function prepareStandaloneWorkspace(options = {}) {
  const contentDir = resolve(options.contentDir ?? process.cwd())
  const stateRoot = resolve(options.stateDir ?? join(contentDir, ".blog-cli"))
  const workspaceRoot =
    options.workspaceDir ??
    join(stateRoot, "workspaces", workspaceIdFor(contentDir))
  const outDir = resolve(options.outDir ?? join(contentDir, "dist"))
  const cacheDir = resolve(options.cacheDir ?? join(stateRoot, "cache", workspaceIdFor(contentDir)))

  rmSync(workspaceRoot, { recursive: true, force: true })
  ensureDir(workspaceRoot)
  ensureDir(dirname(cacheDir))

  mirrorContentEntries(contentDir, workspaceRoot)
  generateSnippetPages({
    contentDir,
    outputDir: join(workspaceRoot, "snippets"),
    routeBase: "",
    snippetRouteBase: "/snippets",
    sourceLinkPrefix: "",
  })
  writeStandaloneConfig(workspaceRoot, {
    contentDir,
    title: options.title,
    description: options.description,
    base: options.base,
    outDir,
    cacheDir,
  })

  return {
    root: workspaceRoot,
    outDir,
    cacheDir,
    contentDir,
  }
}
