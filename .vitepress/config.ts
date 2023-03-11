import {defineConfig} from 'vitepress'

console.log('path1')

// https://vitepress.dev/reference/site-config
export default defineConfig({
    title: "My Awesome Project",
    description: "A VitePress Site",
    srcDir: 'src',
    themeConfig: {
        // https://vitepress.dev/reference/default-theme-config
        nav: [
            {text: 'Home', link: '/'},
            {
                text: 'Examples',
                items: [
                    {text: 'markdown-examples', link: '/examples/markdown-examples'},
                    {text: 'api-examples', link: '/examples/api-examples'},
                ]
            },
            {
                text: 'Dropdown Menu',
                items: [
                    {text: 'Item A', link: '/item-1'},
                    {text: 'Item B', link: '/item-2'},
                    {text: 'Item C', link: '/item-3'}
                ]
            }
        ],
        sidebar: {
            '/examples/': [
                {
                    text: 'Guide',
                    items: [
                        {text: 'Markdown Examples', link: '/markdown-examples'},
                        {text: 'Runtime API Examples', link: '/api-examples'}
                    ]
                }
            ],
//        '/config/': [
//            {
//                text: 'Config',
//                items: [
//                    { text: 'Index', link: '/config/' },
//                    { text: 'Three', link: '/config/three' },
//                    { text: 'Four', link: '/config/four' }
//                ]
//            }
//        ]
        },
        socialLinks: [
            {icon: 'github', link: 'https://github.com/vuejs/vitepress'}
        ]
    }
})
