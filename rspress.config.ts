import * as path from 'node:path';
import { defineConfig } from 'rspress/config';

export default defineConfig({
  root: path.join(__dirname, 'docs'),
  title: 'LJ Code World',
  icon: '/icon-lj-light-logo-512.png',
  logo: {
    light: '/icon-lj-light-logo-512.png',
    dark: '/icon-lj-dark-logo-512.png',
  },
  logoText: 'LJ Code World',
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
