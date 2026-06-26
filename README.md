# Korean Sentence Analyzer 🇰🇷

韩语文章逐句语法分析工具，帮助中文母语者学习韩语。

**在线访问**: https://kr.os.kg/

## 功能

- **逐句语法分析** — 粘贴韩语文章，自动拆解每个句子的语法结构
- **词性标注** — 识别助词、词尾活用，标注词干和语法含义
- **中文解释** — 每个词汇和语法点都有中文注释
- **单词发音** — 点击任意单词，浏览器朗读标准韩语发音
- **活用还原** — 自动还原动词/形容词变形为词典形
- **在线翻译兜底** — 本地词典未收录的词汇自动调用翻译 API 补全

## 技术栈

- React 18 + TypeScript
- Vite 5
- Tailwind CSS + shadcn/ui (Radix UI)
- Web Speech API (TTS)
- MyMemory Translation API (翻译兜底)

## 本地开发

```bash
npm install
npm run dev
```

访问 http://localhost:5173

## 构建

```bash
npm run build
```

产物输出到 `dist/` 目录。

## 部署

项目通过 GitHub Actions 自动部署到 GitHub Pages。每次 push 到 `main` 分支会自动触发构建和部署。

## License

MIT
