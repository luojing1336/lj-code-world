import * as path from "node:path";
import { defineConfig } from "rspress/config";
import { customFontPlugin } from "./docs/components/CustomFonts";

export default defineConfig({
  root: path.join(__dirname, "docs"),
  title: "LJ Code World",
  icon: "/icon-512-light.png",
  logo: {
    light: "/icon-512-light.png",
    dark: "/icon-512-dark.png",
  },
  logoText: "LJ Code World",
  themeConfig: {
    searchPlaceholderText: "搜索文档...",
    socialLinks: [
      {
        icon: "github",
        mode: "link",
        content: "https://github.com/luojing1336",
      },
    ],
  },
  plugins: [
    customFontPlugin({
      fontName: "ComingSoon",
    }),
  ],
});
