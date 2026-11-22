---
title: LaTeX
slug: /wiki/programming/latex
---

# LaTeX

LaTeX 的本质是“用标记描述结构，由引擎排版”。它适合长文档、公式、交叉引用和版本控制；代价是错误信息不总是直观，中文和字体配置也容易踩坑。

这篇文章给出一套可维护的最小工程：文档结构、数学、图表、引用、中文、构建和常见错误。

## 1. 最小文档结构 {#structure}

```latex
\documentclass[11pt]{ctexart}

\usepackage{amsmath,amssymb}
\usepackage{booktabs}
\usepackage{graphicx}
\usepackage{hyperref}

\title{示例文档}
\author{Your Name}
\date{\today}

\begin{document}
\maketitle
\tableofcontents

\section{引言}
这是一个最小示例。

\section{结论}
\label{sec:conclusion}
见第~\ref{sec:conclusion}~节。

\end{document}
```

- `ctexart`/`ctexrep`/`ctexbook` 处理中文；用 XeLaTeX 或 LuaLaTeX 编译。
- `hyperref` 放最后加载（大多数情况下），避免重定义冲突。
- 文档拆成 `\input{...}`/`\include{...}`，长文更好维护。

## 2. 数学公式 {#math}

```latex
行内公式 $E = mc^2$。

\begin{equation}
  \label{eq:bayes}
  P(A \mid B) = \frac{P(B \mid A)\,P(A)}{P(B)}
\end{equation}

\begin{align}
  f(x) &= (x+1)^2 \\
       &= x^2 + 2x + 1
\end{align}

\begin{cases}
  x > 0, & \text{正数} \\
  x = 0, & \text{零} \\
  x < 0, & \text{负数}
\end{cases}
```

要点：

- 编号公式用 `equation`，多行对齐用 `align`，不要用 `eqnarray`。
- 引用公式用 `\eqref{eq:bayes}`。
- 自定义运算符用 `\DeclareMathOperator`，不要直接写文本。

## 3. 表格与图 {#tables}

```latex
\begin{table}[htbp]
  \centering
  \caption{实验结果}
  \label{tab:result}
  \begin{tabular}{lrr}
    \toprule
    方法 & 准确率 & 耗时/ms \\
    \midrule
    基线 & 0.812 & 120 \\
    优化 & 0.847 & 98 \\
    \bottomrule
  \end{tabular}
\end{table}

\begin{figure}[htbp]
  \centering
  \includegraphics[width=0.8\linewidth]{figures/arch.pdf}
  \caption{系统结构}
  \label{fig:arch}
\end{figure}
```

- 三线表用 `booktabs` 的 `\toprule/\midrule/\bottomrule`。
- 图优先用矢量 PDF/SVG（`svg` 包或先转 PDF）。
- `[htbp]` 是建议位置，不是强制；排版漂移时用 `\FloatBarrier` 或调整位置。

## 4. 引用与交叉引用 {#references}

```latex
\usepackage[backend=biber,style=numeric]{biblatex}
\addbibresource{refs.bib}

据文献~\cite{knuth1984}，\dots

\printbibliography
```

```bibtex
@book{knuth1984,
  author    = {Donald E. Knuth},
  title     = {The TeXbook},
  publisher = {Addison-Wesley},
  year      = {1984}
}
```

编译顺序（biblatex）：

```bash
xelatex main.tex
biber main
xelatex main.tex
xelatex main.tex
```

用 `latexmk` 可以自动处理：

```bash
latexmk -xelatex -interaction=nonstopmode -halt-on-error main.tex
```

## 5. 中文与字体 {#chinese}

- 用 `ctex` 文档类或 `ctex` 宏包；XeLaTeX/LuaLaTeX 编译。
- 字体缺失时，明确指定系统字体：

```latex
\usepackage[UTF8, scheme=plain]{ctex}
\setCJKmainfont{Noto Serif CJK SC}
\setCJKsansfont{Noto Sans CJK SC}
\setCJKmonofont{Noto Sans Mono CJK SC}
```

- 不要用 `pdflatex` 直接编译中文文档；编码/字体问题会很多。
- CI 里固定 TeX Live 版本和字体包，避免“本地能编、CI 不能编”。

## 6. 工程化：Makefile 与 CI {#build}

```makefile
main.pdf: main.tex refs.bib $(wildcard sections/*.tex)
	latexmk -xelatex -interaction=nonstopmode -halt-on-error main.tex

clean:
	latexmk -C

.PHONY: clean
```

CI 建议：

- 固定 TeX Live 镜像/版本；
- 编译失败时上传 `.log`；
- 检查未定义引用/文献（`latexmk` 的 warning）；
- 产物 `main.pdf` 作为 artifact。

## 7. 常见错误 {#errors}

| 错误 | 常见原因 | 处理 |
| --- | --- | --- |
| `Missing $ inserted` | 数学符号写在文本模式 | 用 `$...$` 或 `\(...\)` |
| `Undefined control sequence` | 宏包未加载/拼写错误 | 查宏包文档，确认 `\usepackage` |
| `File ... not found` | 图片/文献路径错误 | 用相对路径，确认编译目录 |
| `Citation ... undefined` | 未跑 biber/bibtex 或 key 错 | 按编译顺序重跑，检查 `.bib` |
| 中文乱码/缺字 | 引擎/字体不对 | 用 XeLaTeX + ctex，指定 CJK 字体 |
| 表格/图跑位 | 浮动体位置 | 调整 `[htbp]`、`\FloatBarrier`、`placeins` |
| 编译很慢 | 大图/复杂 TikZ | 外部化 TikZ，用 `tikzexternalize` |

## 8. 最小检查清单 {#checklist}

- [ ] 使用 `ctex` + XeLaTeX/LuaLaTeX 编译中文。
- [ ] 文档拆分为章节文件，`\input`/`\include` 管理。
- [ ] 公式用 `equation`/`align`，有 `\label` 和 `\eqref`。
- [ ] 表格用 `booktabs`，图用矢量格式。
- [ ] 文献用 biblatex/biber，编译顺序固定。
- [ ] CI 固定 TeX Live 版本，失败上传 `.log`。
- [ ] 提交前清理中间文件，只保留源文件和 PDF。

## 相关阅读 {#related}

- [编程与数据库](./../README.md)
- [Markdown 目录工具](./../../../code/dir/mddir.md)
- [LaTeX 官方文档](https://www.latex-project.org/help/documentation/)
