import { defineConfig } from "vitepress"
import genNav from "vitepress-auto-navigation"

const { nav, sidebar } = genNav({
  baseurl: "./myBolg",
})
// https://vitepress.dev/reference/site-config
export default defineConfig({
  base: "/blog-vitepress/",
  title: "My Note",
  description: "A VitePress Site",
  themeConfig: {
    nav,
    sidebar,
    socialLinks: [{ icon: "github", link: "https://github.com/Notryag" }],
  },
})
