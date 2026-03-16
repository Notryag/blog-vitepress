import { existsSync, mkdirSync, readFileSync, statSync, writeFileSync } from "node:fs"
import { basename, join, resolve } from "node:path"
import { fileURLToPath } from "node:url"

const GENERATED_SCRIPTS = {
  dev: "notespress dev .",
  build: "notespress build .",
  preview: "notespress preview .",
}

const GITIGNORE_ENTRIES = [".blog-cli", "dist", "node_modules"]

function packageRoot() {
  return resolve(fileURLToPath(new URL("..", import.meta.url)))
}

function readOwnPackageMeta() {
  const packageJsonPath = join(packageRoot(), "package.json")
  return JSON.parse(readFileSync(packageJsonPath, "utf8"))
}

function ensureDirectory(targetDir) {
  if (!existsSync(targetDir)) {
    mkdirSync(targetDir, { recursive: true })
    return
  }

  if (!statSync(targetDir).isDirectory()) {
    throw new Error(`Target is not a directory: ${targetDir}`)
  }
}

function readJson(filePath) {
  return JSON.parse(readFileSync(filePath, "utf8"))
}

function writeJson(filePath, value) {
  writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`)
}

function upsertPackageJson(targetDir, options) {
  const packageJsonPath = join(targetDir, "package.json")
  const ownPackage = readOwnPackageMeta()
  const force = options.force === true
  const changes = []
  let packageJson

  if (existsSync(packageJsonPath)) {
    packageJson = readJson(packageJsonPath)
  } else {
    packageJson = {
      name: basename(targetDir),
      private: true,
    }
    changes.push("created package.json")
  }

  if (packageJson.private == null) {
    packageJson.private = true
    changes.push("set package.json private=true")
  }

  packageJson.scripts ??= {}

  for (const [name, command] of Object.entries(GENERATED_SCRIPTS)) {
    if (packageJson.scripts[name] == null || force) {
      packageJson.scripts[name] = command
      changes.push(`set script ${name}`)
      continue
    }
  }

  packageJson.devDependencies ??= {}

  if (packageJson.devDependencies.notespress == null || force) {
    packageJson.devDependencies.notespress = `^${ownPackage.version}`
    changes.push(`set devDependency notespress=^${ownPackage.version}`)
  }

  writeJson(packageJsonPath, packageJson)

  return {
    packageJsonPath,
    changes,
  }
}

function upsertGitignore(targetDir) {
  const gitignorePath = join(targetDir, ".gitignore")
  const existing = existsSync(gitignorePath) ? readFileSync(gitignorePath, "utf8") : ""
  const normalized = existing.replace(/\r\n/g, "\n")
  const lines = normalized === "" ? [] : normalized.split("\n")
  const existingEntries = new Set(lines.filter(Boolean))
  const additions = []

  for (const entry of GITIGNORE_ENTRIES) {
    if (existingEntries.has(entry)) {
      continue
    }

    additions.push(entry)
    lines.push(entry)
  }

  const output = `${lines.filter((line, index) => index < lines.length - 1 || line !== "").join("\n")}\n`
  writeFileSync(gitignorePath, output)

  return {
    gitignorePath,
    additions,
  }
}

function hasRootIndexPage(targetDir) {
  return existsSync(join(targetDir, "README.md")) || existsSync(join(targetDir, "index.md"))
}

function createStarterReadme(targetDir, options) {
  const readmePath = join(targetDir, "README.md")

  if (hasRootIndexPage(targetDir) && options.force !== true) {
    return {
      readmePath,
      created: false,
    }
  }

  const title = basename(targetDir)
  writeFileSync(
    readmePath,
    `# ${title}

Welcome to your notes site.

- Run \`notespress dev\` for local preview
- Run \`notespress build\` to generate \`dist/\`
- Put Markdown files into this directory and organize them by folders
`,
  )

  return {
    readmePath,
    created: true,
  }
}

export function initNotespressProject(targetDir, options = {}) {
  const resolvedDir = resolve(targetDir)

  ensureDirectory(resolvedDir)

  const packageResult = upsertPackageJson(resolvedDir, options)
  const gitignoreResult = upsertGitignore(resolvedDir)
  const readmeResult = createStarterReadme(resolvedDir, options)

  return {
    targetDir: resolvedDir,
    packageResult,
    gitignoreResult,
    readmeResult,
  }
}
