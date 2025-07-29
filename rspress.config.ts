import * as path from 'node:path';
import { defineConfig } from 'rspress/config';

export default defineConfig({
  root: path.join(__dirname, 'docs'),
  title: 'lj的代码自留地',
  icon: '/icon-lj-light-logo-192.png',
  logo: {
    light: '/icon-lj-light-logo-192.png',
    dark: '/icon-lj-dark-logo-192.png',
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
