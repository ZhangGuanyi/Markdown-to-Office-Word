# Markdown to Word Converter / Markdown to Word 转换器

一款简洁高效的在线工具，可将 Markdown 格式文档转换为 Word 格式，并支持 LaTeX 数学公式的转换与渲染。

A simple yet powerful online tool for converting Markdown documents to Word format with full LaTeX math formula support.

## 功能特性 / Features

- **Markdown 编辑与预览**：左侧编辑，右侧实时预览，所见即所得
- **Markdown Editing & Preview**: Edit on the left, preview on the right in real-time
- **LaTeX 数学公式支持**：支持行内公式 `$E=mc^2$` 和块级公式 `$$\int_0^1 x^2 dx$$`
- **LaTeX Math Formula Support**: Inline `$E=mc^2$` and block `$$\int_0^1 x^2 dx$$` formulas
- **文件上传**：支持拖拽或点击上传 `.md` 文件
- **File Upload**: Drag & drop or click to upload `.md` files
- **一键转换下载**：点击按钮即可生成并下载 Word 文档
- **One-Click Conversion**: Generate and download Word documents with one click
- **自动保存**：编辑内容自动保存到浏览器本地存储
- **Auto-Save**: Content is automatically saved to browser local storage

## 使用说明 / Usage

### 方式一：在线使用（推荐）/ Method 1: Online Use (Recommended)

直接访问部署的网页应用即可使用。

Simply visit the deployed web application to use it.

### 方式二：本地运行 / Method 2: Local Running

1. 克隆或下载本项目 / Clone or download this project
2. 在浏览器中直接打开 `dist/index.html` 文件 / Open `dist/index.html` directly in a browser

## LaTeX 公式语法 / LaTeX Formula Syntax

### 行内公式 / Inline Formulas

使用单个 `$` 包裹公式，公式会嵌入在文本中：

Use single `$` to wrap formulas, which will be embedded in text:

```markdown
当 $E = mc^2$ 时，质量与能量等价。
When $E = mc^2$, mass and energy are equivalent.
```

### 块级公式 / Block Formulas

使用双个 `$$` 包裹公式，公式会单独成行居中显示：

Use double `$$` to wrap formulas, which will be displayed centered on a separate line:

```markdown
$$
\int_{0}^{\infty} e^{-x^2} dx = \frac{\sqrt{\pi}}{2}
$$
```

### 支持的公式元素 / Supported Formula Elements

| 类型 / Type | 示例语法 / Syntax | 说明 / Description |
|-------------|------------------|-------------------|
| 分数 / Fraction | `\frac{a}{b}` | 分数表示 / Fraction representation |
| 平方根 / Square Root | `\sqrt{x}` | 平方根 / Square root |
| 积分 / Integral | `\int_{a}^{b}` | 定积分 / Definite integral |
| 无穷 / Infinity | `\infty` | 无穷符号 / Infinity symbol |
| 求和 / Summation | `\sum_{i=1}^{n}` | 求和符号 / Summation symbol |
| 希腊字母 / Greek Letters | `\alpha`, `\beta`, `\gamma` | 希腊字母 / Greek letters |

## 技术栈 / Tech Stack

- **前端框架 / Frontend**: 原生 HTML/CSS/JavaScript / Vanilla HTML/CSS/JavaScript
- **Markdown 解析 / Markdown Parsing**: marked.js
- **LaTeX 渲染 / LaTeX Rendering**: KaTeX
- **Word 生成 / Word Generation**: docx.js
- **文件保存 / File Saving**: FileSaver.js

## 浏览器兼容性 / Browser Compatibility

推荐使用以下浏览器的最新版本：

Latest versions of the following browsers are recommended:

- Chrome / Chromium
- Firefox
- Safari
- Edge

## 文件结构 / File Structure

```
markdown-to-word/
├── dist/
│   └── index.html          # 已构建的单文件应用 / Built single-file application
├── src/
│   ├── App.tsx             # React 组件源码 / React component source
│   ├── main.tsx            # 入口文件 / Entry file
│   └── index.css           # 样式文件 / Stylesheet
├── SPEC.md                 # 项目规格文档 / Project specification
├── package.json            # Node.js 依赖配置 / Node.js dependencies
├── tsconfig.json           # TypeScript 配置 / TypeScript config
├── vite.config.ts          # Vite 构建配置 / Vite build config
└── README.md               # 本文件 / This file
```

## 转换功能说明 / Conversion Features

### 支持的 Markdown 元素 / Supported Markdown Elements

- 标题（H1-H6）/ Headers (H1-H6)
- 段落与换行 / Paragraphs and line breaks
- 粗体、斜体文本 / Bold, italic text
- 有序列表与无序列表 / Ordered and unordered lists
- 引用块 / Blockquotes
- 代码块（带语法高亮）/ Code blocks (with syntax highlighting)
- 水平分隔线 / Horizontal rules
- 链接与图片 / Links and images

### Word 转换说明 / Word Conversion Guide

1. 点击「转换为 Word 并下载」按钮 / Click the "Convert to Word" button
2. 系统会处理 Markdown 内容并生成 `.docx` 文件 / System processes Markdown and generates `.docx`
3. 浏览器会自动下载文件 / Browser automatically downloads the file

### LaTeX 公式转换 / LaTeX Conversion

LaTeX 公式在转换为 Word 时会被简化为可读文本格式保留在文档中，确保最大兼容性。

LaTeX formulas are simplified to readable text format when converting to Word for maximum compatibility.

## 隐私说明 / Privacy

- 所有编辑操作在本地浏览器完成 / All editing is done locally in browser
- 内容不会上传到任何服务器 / Content is never uploaded to any server
- 本地存储的数据可通过清除浏览器缓存清除 / Local storage can be cleared by clearing browser cache

## License

Apache 2.0 License
