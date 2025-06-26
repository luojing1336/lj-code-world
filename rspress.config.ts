import * as path from 'node:path';
import { defineConfig } from 'rspress/config';

export default defineConfig({
  root: path.join(__dirname, 'docs'),
  title: 'lj的代码自留地',
  icon: '/lj-light-logo.png',
  logo: {
    light: '/lj-light-logo.png',
    dark: '/lj-dark-logo.png',
  },
  themeConfig: {
    socialLinks: [
      {
        icon: 'github',
        mode: 'link',
        content: 'https://github.com/luojing1336',
      },
    ],
  },
});
