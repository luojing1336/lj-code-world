# LJ Code World

基于 [Rspress](https://rspress.dev/) 构建的个人知识库与工具站点，涵盖代码、金融、娱乐、思维、工具等多个板块，支持 Markdown 与 MDX，集成 React 组件如判决利息计算器等实用功能。

## 目录结构

```
docs/
  code/           # 技术与代码相关文档
  finance/        # 金融知识与案例
  entertainment/  # 娱乐内容
  thinking/       # 思维随笔
  tools/          # 实用工具
  others/         # 其他杂项与自定义组件
  components/     # React 组件（如判决利息计算器）
  public/         # 静态资源
rspress.config.ts # Rspress 配置
tsconfig.json     # TypeScript 配置
package.json      # 项目依赖与脚本
```

## 快速开始

### 安装依赖

```bash
pnpm install
# 或
npm install
```

### 本地开发

```bash
pnpm dev
# 或
npm run dev
```

### 构建生产环境

```bash
pnpm build
# 或
npm run build
```

### 本地预览

```bash
pnpm preview
# 或
npm run preview
```

## 主要特性

- 支持 Markdown 与 MDX，文档可直接嵌入 React 组件
- 多板块内容分类，便于知识管理
- 判决利息计算器等实用工具
- 响应式设计，适配多端浏览
- 主题与导航自定义，集成社交链接

## 相关链接

- [Rspress 官方文档](https://rspress.dev/)
- [项目主页（GitHub）](https://github.com/luojing1336)

---

如需自定义内容或添加新工具，请在 `docs/` 目录下新建对应的 Markdown/MDX 文件，并根据需要编写 React
