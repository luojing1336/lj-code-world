# LJ Code World

---

基于 [Rspress](https://rspress.dev/) 构建的个人知识库与工具站点，涵盖代码、金融、娱乐、健康、工具等多个板块，支持 Markdown 与 MDX，集成 React 组件如判决利息计算器等实用功能。

## 目录结构

```
docs/
  code/           # 代码技术
  finance/         # 金融知识
  entertainment/  # 娱乐内容
  health/         # 健康知识
  tools/          # 实用工具
  others/         # 其他杂项
  components/     # 自定义 React 组件（便于 mdx 文件引用）
  public/         # 静态资源
rspress.config.ts  # Rspress 配置
tsconfig.json      # TypeScript 配置
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
- 响应式设计，适配多端浏览
- 主题与导航自定义，集成社交链接
- 使用 Ant Design 组件库构建交互界面

## 技术栈

- [Rspress](https://rspress.dev/) - 基于 React 和 Vite 的静态站点生成器
- [React](https://react.dev/) - 用于构建用户界面的 JavaScript 库
- [TypeScript](https://www.typescriptlang.org/) - JavaScript 的超集，添加了静态类型
- [Ant Design](https://ant.design/) - 企业级 UI 设计语言和 React 组件库
- [Day.js](https://day.js.org/) - 轻量级日期处理库

## 内容板块

1. **代码世界** - 技术文章、编程技巧、架构设计
2. **金融知识** - 投资理财、市场分析、财经解读
3. **娱乐天地** - 游戏攻略、影视推荐、生活趣事
4. **健康之路** - 工作生活平衡、健康观念、营养知识
5. **实用工具** - 开发工具、学习资源、实用网站
6. **杂物乱谈** - 个人兴趣、知识记录、杂项内容


## 自定义内容
如需自定义内容或添加新工具，请在 `docs/` 目录下新建对应的 Markdown/MDX 文件，并根据需要编写 React 组件。

---

## 相关链接

- [Rspress 官方文档](https://rspress.dev/)
- [项目主页（GitHub）](https://github.com/luojing1336)
