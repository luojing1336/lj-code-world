# 📚 lj-code-world

> A documentation or code examples site powered by VitePress.

This project is used to showcase code examples, markdown guides, and API references. It uses [VitePress](https://vitepress.dev) for static site generation and supports deployment to GitHub Pages.

## 🧩 项目结构

```
.
├── docs
│   ├── api-examples.md       # API 使用示例
│   ├── index.md              # 首页
│   └── markdown-examples.md  # Markdown 示例文档
├── README.md
├── package.json
└── package-lock.json
```

## 🛠️ 开发环境搭建

### 安装依赖

确保你已经安装了 [Node.js](https://nodejs.org) 和 `npm`。然后运行：

```bash
npm install
```

如果你使用的是其他包管理器（如 `yarn` 或 `pnpm`），请相应地调整命令。

## 🏃‍♂️ 运行项目

在本地启动开发服务器：

```bash
npm run docs:dev
```

访问 `http://localhost:5173` 查看文档站点。

## 🧱 构建静态文件

构建生产环境的静态资源：

```bash
npm run docs:build
```

构建结果会输出到 `docs/.vitepress/dist` 目录。

## 🔐 许可证

MIT License. See the [LICENSE](LICENSE) file for details.