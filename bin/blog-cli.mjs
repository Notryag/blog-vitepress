#!/usr/bin/env node

import { createServer, build, serve } from "vitepress"

import { generateSnippetPages } from "../lib/snippets.mjs"
import { prepareStandaloneWorkspace, resolveRepositoryRoot } from "../lib/standalone-site.mjs"

function printHelp() {
  process.stdout.write(`notespress

Usage:
  notespress build [content-dir] [--out-dir dir] [--base /path/]
  notespress dev [content-dir] [--port 5173] [--host 0.0.0.0]
  notespress preview [content-dir] [--port 4173]
  notespress prepare-content [content-dir] [--output-dir dir] [--route-base /myBlog]

Aliases:
  build-site -> build
`)
}

function parseArgs(argv) {
  const [command = "help", ...rest] = argv
  const options = {}
  const positionals = []

  for (let index = 0; index < rest.length; index += 1) {
    const token = rest[index]

    if (!token.startsWith("--")) {
      positionals.push(token)
      continue
    }

    const [rawKey, inlineValue] = token.slice(2).split("=", 2)

    if (inlineValue != null) {
      options[rawKey] = inlineValue
      continue
    }

    const nextToken = rest[index + 1]

    if (nextToken == null || nextToken.startsWith("--")) {
      options[rawKey] = true
      continue
    }

    options[rawKey] = nextToken
    index += 1
  }

  return { command, options, positionals }
}

function resolveContentDir(positionals, options) {
  return positionals[0] ?? options["content-dir"] ?? process.cwd()
}

function resolvePort(value, fallback) {
  if (value == null) {
    return fallback
  }

  const port = Number(value)

  if (!Number.isInteger(port) || port <= 0) {
    throw new Error(`Invalid port: ${value}`)
  }

  return port
}

async function runPrepareContent(positionals, options) {
  const result = generateSnippetPages({
    contentDir: resolveContentDir(positionals, options),
    outputDir: options["output-dir"] ?? "snippets",
    routeBase: options["route-base"] ?? "/myBlog",
    snippetRouteBase: options["snippet-route-base"] ?? "/snippets",
    sourceLinkPrefix: options["source-link-prefix"] ?? "myBlog",
  })

  process.stdout.write(`Generated ${result.count} snippet pages in ${result.outputDir}\n`)
}

async function runBuild(positionals, options) {
  const workspace = prepareStandaloneWorkspace({
    contentDir: resolveContentDir(positionals, options),
    outDir: options["out-dir"],
    base: options.base,
    title: options.title,
    description: options.description,
  })

  process.chdir(resolveRepositoryRoot())
  await build(workspace.root)
}

async function runDev(positionals, options) {
  const workspace = prepareStandaloneWorkspace({
    contentDir: resolveContentDir(positionals, options),
    outDir: options["out-dir"],
    base: options.base,
    title: options.title,
    description: options.description,
  })

  process.chdir(resolveRepositoryRoot())
  const server = await createServer(workspace.root, {
    host: options.host,
    port: resolvePort(options.port, 5173),
  })

  const closeServer = async () => {
    await server.close()
    process.exit(0)
  }

  process.on("SIGINT", closeServer)
  process.on("SIGTERM", closeServer)

  await server.listen()
  server.printUrls()
}

async function runPreview(positionals, options) {
  const workspace = prepareStandaloneWorkspace({
    contentDir: resolveContentDir(positionals, options),
    outDir: options["out-dir"],
    base: options.base,
    title: options.title,
    description: options.description,
  })

  process.chdir(resolveRepositoryRoot())
  await serve({
    root: workspace.root,
    port: resolvePort(options.port, 4173),
    base: options.base,
  })
}

async function main() {
  const { command, options, positionals } = parseArgs(process.argv.slice(2))

  switch (command) {
    case "build":
    case "build-site":
      await runBuild(positionals, options)
      return
    case "dev":
      await runDev(positionals, options)
      return
    case "preview":
      await runPreview(positionals, options)
      return
    case "prepare-content":
      await runPrepareContent(positionals, options)
      return
    case "help":
    case "--help":
    case "-h":
      printHelp()
      return
    default:
      process.stderr.write(`Unknown command: ${command}\n\n`)
      printHelp()
      process.exitCode = 1
  }
}

main().catch((error) => {
  process.stderr.write(`${error.stack ?? error.message}\n`)
  process.exit(1)
})
