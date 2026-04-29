import { useState, useCallback, useRef, useEffect } from 'react';
import { marked } from 'marked';
import katex from 'katex';
import 'katex/dist/katex.min.css';
import 'highlight.js/styles/github-dark.css';
import { Document, Packer, Paragraph, TextRun, HeadingLevel, BorderStyle } from 'docx';
import { saveAs } from 'file-saver';

// Configure marked with syntax highlighting
marked.setOptions({
  gfm: true,
  breaks: true,
});

const SAMPLE_MARKDOWN = `# 数学公式示例文档

这是一份展示 **Markdown转Word** 功能的示例文档，支持 LaTeX 数学公式。

## 基本数学公式

行内公式示例: 当 $E = mc^2$ 时，质量与能量等价。

块级公式示例:

$$
\\int_{0}^{\\infty} e^{-x^2} dx = \\frac{\\sqrt{\\pi}}{2}
$$

## 复杂公式

傅里叶变换:

$$
\\mathcal{F}\\{f(t)\\} = F(\\omega) = \\int_{-\\infty}^{+\\infty} f(t) e^{-i\\omega t} dt
$$

矩阵表示:

$$
\\begin{pmatrix}
a_{11} & a_{12} & a_{13} \\\\
a_{21} & a_{22} & a_{23} \\\\
a_{31} & a_{32} & a_{33}
\\end{pmatrix}
$$

## 标题与列表

### 有序列表

1. 第一步：输入 Markdown 内容
2. 第二步：预览渲染效果
3. 第三步：点击转换按钮

### 无序列表

- 简洁高效
- 支持公式
- 一键下载

## 代码示例

\`\`\`javascript
function hello() {
  console.log("Hello, World!");
}
\`\`\`

## 表格

| 功能 | 状态 |
|------|------|
| Markdown渲染 | ✅ |
| LaTeX公式 | ✅ |
| Word转换 | ✅ |

## 引用

> 这是一个引用块，用于展示引用样式。
`;

function App() {
  const [markdown, setMarkdown] = useState<string>(SAMPLE_MARKDOWN);
  const [previewHtml, setPreviewHtml] = useState<string>('');
  const [isConverting, setIsConverting] = useState<boolean>(false);
  const [isDragOver, setIsDragOver] = useState<boolean>(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Parse LaTeX in text
  const parseLatex = useCallback((text: string): string => {
    // Block formulas $$...$$
    text = text.replace(/\$\$([\s\S]+?)\$\$/g, (match, formula) => {
      try {
        const rendered = katex.renderToString(formula.trim(), {
          displayMode: true,
          throwOnError: false,
          output: 'html',
        });
        return `<div class="katex-display">${rendered}</div>`;
      } catch {
        return `<div class="katex-error">公式解析错误: ${formula}</div>`;
      }
    });

    // Inline formulas $...$
    text = text.replace(/\$([^\$\n]+?)\$/g, (match, formula) => {
      try {
        const rendered = katex.renderToString(formula.trim(), {
          displayMode: false,
          throwOnError: false,
          output: 'html',
        });
        return rendered;
      } catch {
        return `<span class="katex-error">${formula}</span>`;
      }
    });

    return text;
  }, []);

  // Render markdown to HTML
  const renderMarkdown = useCallback((md: string): string => {
    let html = marked.parse(md, { async: false }) as string;
    html = parseLatex(html);
    return html;
  }, [parseLatex]);

  // Update preview when markdown changes
  useEffect(() => {
    const html = renderMarkdown(markdown);
    setPreviewHtml(html);
    localStorage.setItem('markdown-content', markdown);
  }, [markdown, renderMarkdown]);

  // Handle file upload
  const handleFileUpload = useCallback((file: File) => {
    if (file.type === 'text/markdown' || file.name.endsWith('.md')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        setMarkdown(content);
      };
      reader.readAsText(file);
    } else {
      alert('请上传 .md 格式的 Markdown 文件');
    }
  }, []);

  // Drag and drop handlers
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileUpload(file);
    }
  }, [handleFileUpload]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  }, [handleFileUpload]);

  // Convert LaTeX to OMML (simplified version)
  const latexToOmml = (latex: string): any => {
    // Basic LaTeX to simple text conversion for Word
    // For a full implementation, you would use a proper LaTeX-to-OMML converter
    const simpleLatex = latex
      .replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, '$1/$2')
      .replace(/\\sqrt\{([^}]+)\}/g, 'sqrt($1)')
      .replace(/\\int_\{([^}]+)\}/g, 'integral from $1')
      .replace(/\\infty/g, 'infinity')
      .replace(/\\pi/g, 'pi')
      .replace(/\\alpha/g, 'alpha')
      .replace(/\\beta/g, 'beta')
      .replace(/\\gamma/g, 'gamma')
      .replace(/\\delta/g, 'delta')
      .replace(/\\sum/g, 'sum')
      .replace(/\\prod/g, 'product')
      .replace(/\{/g, '')
      .replace(/\}/g, '')
      .replace(/\\/g, '');

    return new TextRun({ text: `[公式: ${simpleLatex}]` });
  };

  // Convert markdown to Word document
  const convertToWord = useCallback(async () => {
    setIsConverting(true);

    try {
      const children: Paragraph[] = [];
      const lines = markdown.split('\n');
      let inCodeBlock = false;
      let codeBlockContent: string[] = [];

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];

        // Code block start/end
        if (line.startsWith('```')) {
          if (!inCodeBlock) {
            inCodeBlock = true;
            codeBlockContent = [];
          } else {
            inCodeBlock = false;
            children.push(new Paragraph({
              children: [new TextRun({ text: codeBlockContent.join('\n'), font: 'Courier New', size: 24 })],
              shading: { fill: '1e1e1e', color: '1e1e1e' },
              spacing: { before: 100, after: 100 },
            }));
          }
          continue;
        }

        if (inCodeBlock) {
          codeBlockContent.push(line);
          continue;
        }

        // Process LaTeX formulas for Word
        const processLineForWord = (text: string): TextRun[] => {
          const runs: TextRun[] = [];
          let remaining = text;

          // Block formula
          const blockMatch = remaining.match(/\$\$([\s\S]+?)\$\$/);
          if (blockMatch) {
            const parts = remaining.split(/\$\$[\s\S]+?\$\$/);
            parts.forEach((part, idx) => {
              if (part.trim()) {
                runs.push(...processInlineLatex(part));
              }
              if (idx < parts.length - 1) {
                runs.push(latexToOmml(blockMatch[1]));
              }
            });
            return runs;
          }

          return processInlineLatex(remaining);
        };

        const processInlineLatex = (text: string): TextRun[] => {
          const runs: TextRun[] = [];
          const parts = text.split(/(\$[^$\n]+?\$)/g);

          parts.forEach(part => {
            if (part.startsWith('$') && part.endsWith('$') && part.length > 2) {
              runs.push(latexToOmml(part.slice(1, -1)));
            } else if (part.trim()) {
              runs.push(new TextRun({ text: part }));
            }
          });

          return runs;
        };

        // Empty line
        if (line.trim() === '') {
          children.push(new Paragraph({ children: [new TextRun({ text: '' })] }));
          continue;
        }

        // Headers
        if (line.startsWith('# ')) {
          children.push(new Paragraph({
            children: [new TextRun({ text: line.slice(2), bold: true, size: 48 })],
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 300, after: 200 },
          }));
        } else if (line.startsWith('## ')) {
          children.push(new Paragraph({
            children: [new TextRun({ text: line.slice(3), bold: true, size: 36 })],
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 240, after: 160 },
          }));
        } else if (line.startsWith('### ')) {
          children.push(new Paragraph({
            children: [new TextRun({ text: line.slice(4), bold: true, size: 28 })],
            heading: HeadingLevel.HEADING_3,
            spacing: { before: 200, after: 120 },
          }));
        }
        // Blockquote
        else if (line.startsWith('> ')) {
          children.push(new Paragraph({
            children: [new TextRun({ text: line.slice(2), italics: true, color: '636e72' })],
            indent: { left: 720 },
            border: {
              left: { color: 'e94560', space: 4, style: BorderStyle.SINGLE, size: 12 },
            },
            spacing: { before: 100, after: 100 },
          }));
        }
        // Unordered list
        else if (line.match(/^[\-\*]\s/)) {
          children.push(new Paragraph({
            children: [new TextRun({ text: line.replace(/^[\-\*]\s/, '') })],
            bullet: { level: 0 },
            spacing: { before: 60, after: 60 },
          }));
        }
        // Ordered list
        else if (line.match(/^\d+\.\s/)) {
          children.push(new Paragraph({
            children: [new TextRun({ text: line.replace(/^\d+\.\s/, '') })],
            spacing: { before: 60, after: 60 },
          }));
        }
        // Table row
        else if (line.startsWith('|')) {
          const cells = line.split('|').filter(c => c.trim() && !c.trim().match(/^-+$/));
          if (cells.length > 0) {
            children.push(new Paragraph({
              children: cells.map(cell => new TextRun({ text: cell.trim(), size: 22 })),
              spacing: { before: 40, after: 40 },
            }));
          }
        }
        // Horizontal rule
        else if (line.match(/^---+$/)) {
          children.push(new Paragraph({
            children: [new TextRun({ text: '' })],
            border: {
              bottom: { color: 'c4c4c4', space: 1, style: BorderStyle.SINGLE, size: 6 },
            },
            spacing: { before: 200, after: 200 },
          }));
        }
        // Regular paragraph with formatting
        else {
          const runs = processLineForWord(line);
          children.push(new Paragraph({
            children: runs,
            spacing: { before: 100, after: 100 },
          }));
        }
      }

      const doc = new Document({
        sections: [{
          properties: {},
          children: children,
        }],
      });

      const blob = await Packer.toBlob(doc);
      saveAs(blob, 'converted_document.docx');
    } catch (error) {
      console.error('Conversion error:', error);
      alert('转换失败，请检查控制台错误信息');
    } finally {
      setIsConverting(false);
    }
  }, [markdown]);

  // Load saved content on mount
  useEffect(() => {
    const saved = localStorage.getItem('markdown-content');
    if (saved) {
      setMarkdown(saved);
    }
  }, []);

  return (
    <div className="min-h-screen bg-surface">
      {/* Header */}
      <header className="bg-primary text-white py-6 px-8 shadow-lg">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-serif font-bold mb-2">
            Markdown to Word 转换器
          </h1>
          <p className="text-gray-300 text-sm">
            支持 LaTeX 数学公式 | 一键转换下载
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto p-6">
        {/* File Upload Area */}
        <div
          className={`file-drop-zone rounded-lg p-4 mb-6 bg-white ${isDragOver ? 'drag-over' : ''}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".md,text/markdown"
            onChange={handleFileSelect}
            className="hidden"
          />
          <div className="flex items-center justify-center gap-3 text-gray-500 cursor-pointer">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            <span className="text-sm">拖拽上传 .md 文件 或 点击选择文件</span>
          </div>
        </div>

        {/* Editor and Preview */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Editor */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden flex flex-col">
            <div className="bg-secondary text-white px-4 py-3 flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
              </svg>
              <span className="font-medium">Markdown 编辑器</span>
            </div>
            <textarea
              ref={textareaRef}
              value={markdown}
              onChange={(e) => setMarkdown(e.target.value)}
              className="editor-textarea flex-1 w-full p-4 border-0 focus:ring-0 resize-none"
              placeholder="在这里输入 Markdown 内容..."
              spellCheck={false}
            />
          </div>

          {/* Preview */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="bg-secondary text-white px-4 py-3 flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              <span className="font-medium">实时预览</span>
            </div>
            <div
              className="markdown-preview p-4 overflow-auto"
              style={{ maxHeight: '500px' }}
              dangerouslySetInnerHTML={{ __html: previewHtml }}
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center gap-4">
          <button
            onClick={convertToWord}
            disabled={isConverting}
            className="btn-primary px-8 py-3 rounded-lg font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isConverting ? (
              <>
                <svg className="w-5 h-5 animate-spin-slow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span>转换中...</span>
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
                <span>转换为 Word 并下载</span>
              </>
            )}
          </button>
        </div>

        {/* LaTeX Usage Tips */}
        <div className="mt-8 bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-primary mb-4 flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            LaTeX 公式使用说明
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-secondary mb-2">行内公式</h4>
              <code className="bg-code px-3 py-2 rounded block text-sm">
                $E = mc^2$
              </code>
              <p className="text-gray-600 text-sm mt-2">
                使用单个 $ 包裹公式，公式会嵌入在文本中
              </p>
            </div>
            <div>
              <h4 className="font-medium text-secondary mb-2">块级公式</h4>
              <code className="bg-code px-3 py-2 rounded block text-sm">
                $$\\int_0^1 x^2 dx$$
              </code>
              <p className="text-gray-600 text-sm mt-2">
                使用双个 $$ 包裹公式，公式会单独成行居中显示
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-primary text-gray-400 py-4 mt-8">
        <div className="max-w-7xl mx-auto px-8 text-center text-sm">
          Markdown to Word Converter | 支持 LaTeX 数学公式转换
        </div>
      </footer>
    </div>
  );
}

export default App;
