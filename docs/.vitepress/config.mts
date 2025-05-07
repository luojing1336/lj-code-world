import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "LJ code world",
  description: "A code world website",
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: '首页', link: '/' },
      { text: '代码', link: '/code/' },
      { text: '知识', link: '/knowledge/' },
      { text: '娱乐', link: '/entertainment/' },
      { text: '杂记', link: '/others/markdown-examples' }
    ],

    sidebar: [
      {
        text: 'Examples',
        items: [
          { text: 'Markdown Examples', link: '/others/markdown-examples' },
          { text: 'Runtime API Examples', link: '/others/api-examples' }
        ]
      }
    ],

    socialLinks: [
      { icon: 'github', link: 'https://github.com/luojing1336' }
    ]
  }
})
