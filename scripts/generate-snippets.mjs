import { generateSnippetPages } from "../lib/snippets.mjs"

generateSnippetPages({
  contentDir: "myBlog",
  outputDir: "snippets",
  routeBase: "/myBlog",
  snippetRouteBase: "/snippets",
  sourceLinkPrefix: "myBlog",
})
