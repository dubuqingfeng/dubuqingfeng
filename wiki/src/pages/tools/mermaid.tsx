import React, { useCallback, useEffect, useRef, useState } from "react";
import clsx from "clsx";
import Layout from "@theme/Layout";
import Center from "@site/src/components/Center/center";
import { ToolsSidebarData } from "@site/src/data";
import PageSidebar from "@site/src/components/PageSidebar/index";
import MainStyles from "@docusaurus/theme-classic/lib/theme/DocRoot/Layout/Main/styles.module.css";
import DocRootStyles from "@docusaurus/theme-classic/lib/theme/DocRoot/Layout/styles.module.css";
import { useColorMode } from "@docusaurus/theme-common";
import styles from "./mermaid.module.css";

type MermaidTheme = "default" | "dark" | "forest" | "neutral" | "base";
type ThemeChoice = "auto" | MermaidTheme;

interface MermaidApi {
  initialize: (config: Record<string, unknown>) => void;
  parse: (text: string) => Promise<unknown>;
  render: (
    id: string,
    text: string
  ) => Promise<{ svg: string; bindFunctions?: (element: Element) => void }>;
}

const SAMPLES: { label: string; code: string }[] = [
  {
    label: "流程图 Flowchart",
    code: `flowchart LR
  A[用户] --> B{已登录?}
  B -- 是 --> C[进入仪表盘]
  B -- 否 --> D[登录页]
  D --> A`,
  },
  {
    label: "时序图 Sequence",
    code: `sequenceDiagram
  participant U as 用户
  participant A as API
  participant D as 数据库
  U->>A: POST /login
  A->>D: 查询用户
  D-->>A: 返回记录
  A-->>U: 200 + token`,
  },
  {
    label: "类图 Class",
    code: `classDiagram
  class Animal {
    +String name
    +eat() void
  }
  class Dog {
    +bark() void
  }
  Animal <|-- Dog`,
  },
  {
    label: "状态图 State",
    code: `stateDiagram-v2
  [*] --> Idle
  Idle --> Running: start
  Running --> Idle: stop
  Running --> [*]: finish`,
  },
  {
    label: "ER 图",
    code: `erDiagram
  USER ||--o{ ORDER : places
  ORDER ||--|{ ORDER_ITEM : contains
  USER {
    string id
    string email
  }`,
  },
  {
    label: "甘特图 Gantt",
    code: `gantt
  title 项目计划
  dateFormat YYYY-MM-DD
  section 设计
  需求梳理 :a1, 2024-01-01, 7d
  原型设计 :a2, after a1, 5d
  section 开发
  前端实现 :b1, after a2, 10d
  后端实现 :b2, after a2, 12d`,
  },
  {
    label: "饼图 Pie",
    code: `pie title 流量来源
  "搜索" : 45
  "直接访问" : 25
  "社交媒体" : 20
  "其它" : 10`,
  },
  {
    label: "Git 图",
    code: `gitGraph
  commit
  branch feature
  checkout feature
  commit
  checkout main
  merge feature`,
  },
  {
    label: "思维导图 Mindmap",
    code: `mindmap
  root((Mermaid))
    图解
      流程图
      时序图
    工具
      预览`,
  },
  {
    label: "时间线 Timeline",
    code: `timeline
  title 产品演进
  2022 : 立项
  2023 : MVP 上线
  2024 : 规模化`,
  },
  {
    label: "象限图 Quadrant",
    code: `quadrantChart
  title 优先级矩阵
  x-axis 低影响 --> 高影响
  y-axis 低成本 --> 高成本
  quadrant-1 立即做
  quadrant-2 计划做
  quadrant-3 有空再做
  quadrant-4 不做
  "需求A": [0.8, 0.2]
  "需求B": [0.3, 0.7]`,
  },
];

const DEFAULT_CODE = SAMPLES[0].code;
const STORAGE_CODE = "dbqf.mermaid.code";
const STORAGE_THEME = "dbqf.mermaid.theme";

const THEME_OPTIONS: { value: ThemeChoice; label: string }[] = [
  { value: "auto", label: "跟随站点配色" },
  { value: "default", label: "default（浅色）" },
  { value: "dark", label: "dark（深色）" },
  { value: "forest", label: "forest（绿色）" },
  { value: "neutral", label: "neutral（黑白）" },
  { value: "base", label: "base" },
];

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function formatError(err: unknown): string {
  const message = err instanceof Error ? err.message : String(err);
  // mermaid 的解析错误通常带较长上下文，保留有用的前几行
  return message.replace(/^\s+/, "").split("\n").slice(0, 12).join("\n");
}

function readViewBox(svg: SVGSVGElement): { width: number; height: number } | null {
  const viewBox = svg.getAttribute("viewBox");
  if (viewBox) {
    const parts = viewBox.split(/[\s,]+/).map(Number);
    if (parts.length === 4 && parts[2] > 0 && parts[3] > 0) {
      return { width: parts[2], height: parts[3] };
    }
  }
  const width = Number.parseFloat(svg.getAttribute("width") ?? "");
  const height = Number.parseFloat(svg.getAttribute("height") ?? "");
  if (Number.isFinite(width) && Number.isFinite(height) && width > 0 && height > 0) {
    return { width, height };
  }
  return null;
}

function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function MermaidTool() {
  const { colorMode } = useColorMode();
  const [code, setCode] = useState(DEFAULT_CODE);
  const [themeChoice, setThemeChoice] = useState<ThemeChoice>("auto");
  const [svg, setSvg] = useState("");
  const [error, setError] = useState("");
  const [diagramType, setDiagramType] = useState("");
  const [rendering, setRendering] = useState(false);
  const [renderMs, setRenderMs] = useState<number | null>(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [ready, setReady] = useState(false);
  const [notice, setNotice] = useState("");
  const [lastRenderedCode, setLastRenderedCode] = useState("");

  const mermaidRef = useRef<MermaidApi | null>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<HTMLTextAreaElement>(null);
  const dragRef = useRef<{ x: number; y: number; panX: number; panY: number } | null>(null);
  const renderSeq = useRef(0);
  const shouldFitRef = useRef(true);
  const bindRef = useRef<((element: Element) => void) | null>(null);

  // 1. 懒加载 mermaid（只在浏览器执行，避免 SSR 触碰 DOM）
  useEffect(() => {
    let cancelled = false;
    import("mermaid")
      .then((mod: unknown) => {
        if (cancelled) {
          return;
        }
        const api = (mod as { default?: MermaidApi }).default ?? (mod as MermaidApi);
        api.initialize({ startOnLoad: false, securityLevel: "strict" });
        mermaidRef.current = api;
        setReady(true);
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(`Mermaid 加载失败：${formatError(err)}`);
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // 2. 恢复本地保存的内容
  useEffect(() => {
    try {
      const savedCode = window.localStorage.getItem(STORAGE_CODE);
      if (savedCode && savedCode.trim()) {
        setCode(savedCode);
      }
      const savedTheme = window.localStorage.getItem(STORAGE_THEME);
      if (savedTheme) {
        setThemeChoice(savedTheme as ThemeChoice);
      }
    } catch {
      // 隐私模式下 localStorage 可能不可用
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) {
      return;
    }
    try {
      window.localStorage.setItem(STORAGE_CODE, code);
    } catch {
      // ignore
    }
  }, [code, hydrated]);

  useEffect(() => {
    if (!hydrated) {
      return;
    }
    try {
      window.localStorage.setItem(STORAGE_THEME, themeChoice);
    } catch {
      // ignore
    }
  }, [themeChoice, hydrated]);

  const render = useCallback(
    async (source: string) => {
      const mermaid = mermaidRef.current;
      if (!mermaid) {
        return;
      }
      const trimmed = source.trim();
      if (!trimmed) {
        setSvg("");
        setError("");
        setDiagramType("");
        setRenderMs(null);
        setLastRenderedCode("");
        return;
      }
      const theme: MermaidTheme =
        themeChoice === "auto" ? (colorMode === "dark" ? "dark" : "default") : themeChoice;
      const seq = renderSeq.current + 1;
      renderSeq.current = seq;
      setRendering(true);
      const started = typeof performance !== "undefined" ? performance.now() : Date.now();
      try {
        mermaid.initialize({
          startOnLoad: false,
          theme,
          securityLevel: "strict",
          // 用纯 SVG <text> 渲染标签：foreignObject 在 canvas 转 PNG 时不会被绘制
          htmlLabels: false,
          fontFamily:
            '-apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", "Microsoft YaHei", sans-serif',
          flowchart: { useMaxWidth: false, htmlLabels: false },
          sequence: { useMaxWidth: false },
          gantt: { useMaxWidth: false },
        });
        const parsed = await mermaid.parse(trimmed);
        const nextType =
          parsed && typeof parsed === "object" && "diagramType" in parsed
            ? String((parsed as { diagramType: unknown }).diagramType)
            : "";
        const id = `mermaid-preview-${seq}-${Date.now().toString(36)}`;
        const { svg: nextSvg, bindFunctions } = await mermaid.render(id, trimmed);
        if (renderSeq.current !== seq) {
          return;
        }
        setSvg(nextSvg);
        setDiagramType(nextType);
        setError("");
        setNotice("");
        setLastRenderedCode(trimmed);
        const ended = typeof performance !== "undefined" ? performance.now() : Date.now();
        setRenderMs(Math.max(1, Math.round(ended - started)));
        bindRef.current = bindFunctions ?? null;
      } catch (err) {
        if (renderSeq.current !== seq) {
          return;
        }
        setError(formatError(err));
        setNotice("渲染失败，左侧内容已保留；修正语法后会自动重新渲染。");
        // mermaid 失败时可能在 body 留下临时节点
        document
          .querySelectorAll('[id^="dmermaid-preview-"], [id^="mermaid-preview-"]')
          .forEach((node) => node.remove());
      } finally {
        if (renderSeq.current === seq) {
          setRendering(false);
        }
      }
    },
    [colorMode, themeChoice]
  );

  // 3. 输入变化后防抖渲染
  useEffect(() => {
    if (!ready || !hydrated) {
      return;
    }
    const timer = setTimeout(() => {
      void render(code);
    }, 400);
    return () => clearTimeout(timer);
  }, [code, ready, hydrated, render]);

  // 3.1 SVG 提交后：绑定交互回调，并在首次渲染时适应窗口
  useEffect(() => {
    if (!svg) {
      return;
    }
    const host = canvasRef.current;
    const svgEl = host?.querySelector("svg") as SVGSVGElement | null;
    if (host && bindRef.current) {
      bindRef.current(host);
      bindRef.current = null;
    }
    if (shouldFitRef.current && svgEl) {
      shouldFitRef.current = false;
      const box = readViewBox(svgEl);
      const viewport = viewportRef.current;
      if (box && viewport) {
        const scale = Math.min(
          (viewport.clientWidth - 48) / box.width,
          (viewport.clientHeight - 48) / box.height
        );
        setZoom(clamp(scale, 0.2, 5));
        setPan({ x: 0, y: 0 });
      }
    }
  }, [svg]);

  // 4. Ctrl/Cmd + 滚轮缩放（需要非 passive 监听才能 preventDefault）
  useEffect(() => {
    const element = viewportRef.current;
    if (!element) {
      return;
    }
    const onWheel = (event: WheelEvent) => {
      if (!(event.ctrlKey || event.metaKey)) {
        return;
      }
      event.preventDefault();
      setZoom((current) => clamp(current * (event.deltaY > 0 ? 0.9 : 1.1), 0.2, 5));
    };
    element.addEventListener("wheel", onWheel, { passive: false });
    return () => element.removeEventListener("wheel", onWheel);
  }, []);

  const resetView = useCallback(() => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  }, []);

  const fitView = useCallback(() => {
    const svgEl = canvasRef.current?.querySelector("svg") as SVGSVGElement | null;
    const viewport = viewportRef.current;
    if (!svgEl || !viewport) {
      return;
    }
    const box = readViewBox(svgEl);
    if (!box) {
      resetView();
      return;
    }
    const scale = Math.min(
      (viewport.clientWidth - 48) / box.width,
      (viewport.clientHeight - 48) / box.height
    );
    setZoom(clamp(scale, 0.2, 5));
    setPan({ x: 0, y: 0 });
  }, [resetView]);

  const onPointerDown = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      if (event.button !== 0) {
        return;
      }
      dragRef.current = {
        x: event.clientX,
        y: event.clientY,
        panX: pan.x,
        panY: pan.y,
      };
      setDragging(true);
      event.currentTarget.setPointerCapture?.(event.pointerId);
    },
    [pan.x, pan.y]
  );

  const onPointerMove = useCallback((event: React.PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag) {
      return;
    }
    setPan({
      x: drag.panX + (event.clientX - drag.x),
      y: drag.panY + (event.clientY - drag.y),
    });
  }, []);

  const endDrag = useCallback((event: React.PointerEvent<HTMLDivElement>) => {
    dragRef.current = null;
    setDragging(false);
    event.currentTarget.releasePointerCapture?.(event.pointerId);
  }, []);

  const onEditorKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (event.key === "Tab") {
        event.preventDefault();
        const target = event.currentTarget;
        const start = target.selectionStart;
        const end = target.selectionEnd;
        const next = `${code.slice(0, start)}  ${code.slice(end)}`;
        setCode(next);
        window.requestAnimationFrame(() => {
          if (editorRef.current) {
            editorRef.current.selectionStart = start + 2;
            editorRef.current.selectionEnd = start + 2;
          }
        });
        return;
      }
      if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
        event.preventDefault();
        void render(code);
      }
    },
    [code, render]
  );

  const getSvgElement = useCallback((): SVGSVGElement | null => {
    return (canvasRef.current?.querySelector("svg") as SVGSVGElement | null) ?? null;
  }, []);

  const buildSvgText = useCallback(
    (withSize?: { width: number; height: number }): string => {
      const svgEl = getSvgElement();
      if (!svgEl) {
        return "";
      }
      const clone = svgEl.cloneNode(true) as SVGSVGElement;
      clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
      if (withSize) {
        clone.setAttribute("width", String(withSize.width));
        clone.setAttribute("height", String(withSize.height));
      }
      return new XMLSerializer().serializeToString(clone);
    },
    [getSvgElement]
  );

  const copy = useCallback(async (text: string, label: string) => {
    if (!text) {
      return;
    }
    try {
      await navigator.clipboard.writeText(text);
      setNotice(`${label}已复制到剪贴板`);
    } catch {
      setNotice("复制失败，请手动选择内容复制");
    }
    setTimeout(() => setNotice(""), 2000);
  }, []);

  const downloadSvg = useCallback(() => {
    const text = buildSvgText();
    if (!text) {
      return;
    }
    downloadBlob(new Blob([text], { type: "image/svg+xml;charset=utf-8" }), "mermaid-diagram.svg");
    setNotice("SVG 已开始下载");
    setTimeout(() => setNotice(""), 2000);
  }, [buildSvgText]);

  const downloadPng = useCallback(async () => {
    const svgEl = getSvgElement();
    if (!svgEl) {
      return;
    }
    const box = readViewBox(svgEl) ?? { width: 1200, height: 800 };
    const scale = 2;
    const width = Math.round(box.width * scale);
    const height = Math.round(box.height * scale);
    const text = buildSvgText({ width, height });
    const blob = new Blob([text], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    try {
      const image = new Image();
      image.decoding = "sync";
      await new Promise<void>((resolve, reject) => {
        image.onload = () => resolve();
        image.onerror = () => reject(new Error("SVG 转图片失败"));
        image.src = url;
      });
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        throw new Error("当前浏览器不支持 canvas");
      }
      ctx.fillStyle = colorMode === "dark" ? "#1b1b1d" : "#ffffff";
      ctx.fillRect(0, 0, width, height);
      ctx.drawImage(image, 0, 0, width, height);
      const pngBlob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob((value) => resolve(value), "image/png")
      );
      if (pngBlob) {
        downloadBlob(pngBlob, "mermaid-diagram.png");
        setNotice("PNG 已开始下载（2x 高清）");
        setTimeout(() => setNotice(""), 2000);
      }
    } catch (err) {
      setNotice(`导出 PNG 失败：${formatError(err)}`);
    } finally {
      URL.revokeObjectURL(url);
    }
  }, [buildSvgText, colorMode, getSvgElement]);

  const loadSample = useCallback((value: string) => {
    shouldFitRef.current = true;
    setCode(value);
    resetView();
  }, [resetView]);

  const zoomPercent = Math.round(zoom * 100);
  const isEmpty = !svg && !error;
  const isStale = Boolean(lastRenderedCode) && lastRenderedCode !== code.trim();

  return (
    <>
      <Center>
        <h1 className={styles.title}>Mermaid Preview</h1>
      </Center>
            <p className={styles.subtitle}>
              左侧编辑 Mermaid 源码，右侧实时预览。支持拖动平移、缩放与导出 SVG / PNG，内容自动保存在本地浏览器。
            </p>

            <div className={styles.toolbar}>
              <div className={styles.toolbarGroup}>
                <select
                  className={styles.select}
                  value=""
                  onChange={(event) => {
                    const sample = SAMPLES.find((item) => item.label === event.target.value);
                    if (sample) {
                      loadSample(sample.code);
                    }
                  }}
                  aria-label="载入示例"
                >
                  <option value="">载入示例…</option>
                  {SAMPLES.map((sample) => (
                    <option key={sample.label} value={sample.label}>
                      {sample.label}
                    </option>
                  ))}
                </select>
                <select
                  className={styles.select}
                  value={themeChoice}
                  onChange={(event) => setThemeChoice(event.target.value as ThemeChoice)}
                  aria-label="图表主题"
                >
                  {THEME_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className={styles.divider} />

              <div className={styles.toolbarGroup}>
                <button
                  type="button"
                  className={clsx(styles.button, styles.buttonPrimary)}
                  onClick={() => void render(code)}
                  disabled={!ready}
                >
                  {rendering ? "渲染中…" : "重新渲染"}
                </button>
                <button type="button" className={styles.button} onClick={resetView}>
                  重置视图
                </button>
              </div>

              <div className={styles.spacer} />

              <div className={styles.toolbarGroup}>
                <button
                  type="button"
                  className={styles.button}
                  onClick={() => void copy(code, "源码")}
                >
                  复制源码
                </button>
                <button
                  type="button"
                  className={styles.button}
                  onClick={downloadSvg}
                  disabled={!svg}
                >
                  导出 SVG
                </button>
                <button
                  type="button"
                  className={styles.button}
                  onClick={() => void downloadPng()}
                  disabled={!svg}
                >
                  导出 PNG
                </button>
              </div>
            </div>

            <div className={styles.split}>
              <div className={styles.pane}>
                <div className={styles.paneHeader}>
                  <span>源码</span>
                  <span className={styles.badge + " " + styles.badgeNeutral}>{code.length} 字符</span>
                  <span className={styles.spacer} />
                  <span>Tab 缩进 · ⌘/Ctrl + Enter 立即渲染</span>
                </div>
                <textarea
                  ref={editorRef}
                  className={styles.editor}
                  value={code}
                  onChange={(event) => setCode(event.target.value)}
                  onKeyDown={onEditorKeyDown}
                  spellCheck={false}
                  autoCapitalize="off"
                  autoCorrect="off"
                  aria-label="Mermaid 源码"
                />
                {error ? <pre className={styles.error}>{error}</pre> : null}
              </div>

              <div className={styles.pane}>
                <div className={styles.paneHeader}>
                  <span>预览</span>
                  {diagramType ? (
                    <span className={clsx(styles.badge, styles.badgeOk)}>{diagramType}</span>
                  ) : null}
                  {isStale && !rendering ? (
                    <span className={clsx(styles.badge, styles.badgeWarn)}>内容已修改</span>
                  ) : null}
                  <span className={styles.spacer} />
                  <span>
                    {!ready
                      ? "加载渲染引擎…"
                      : rendering
                      ? "渲染中…"
                      : renderMs !== null
                      ? `${renderMs} ms`
                      : ""}
                  </span>
                </div>

                <div
                  ref={viewportRef}
                  className={clsx(styles.viewport, dragging && styles.viewportDragging)}
                  onPointerDown={onPointerDown}
                  onPointerMove={onPointerMove}
                  onPointerUp={endDrag}
                  onPointerCancel={endDrag}
                  onDoubleClick={resetView}
                >
                  <div className={styles.stage}>
                    {isEmpty ? (
                      <div className={styles.placeholder}>
                        {ready ? "在左侧输入 Mermaid 代码，这里会实时显示图表" : "正在加载 Mermaid…"}
                      </div>
                    ) : (
                      <div
                        ref={canvasRef}
                        className={styles.canvas}
                        style={{ transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})` }}
                        // mermaid 输出已由 securityLevel: strict 消毒
                        dangerouslySetInnerHTML={{ __html: svg }}
                      />
                    )}
                  </div>
                </div>

                <div className={styles.zoomBar}>
                  <button
                    type="button"
                    className={styles.zoomButton}
                    onClick={() => setZoom((current) => clamp(current * 1.2, 0.2, 5))}
                    aria-label="放大"
                  >
                    +
                  </button>
                  <button
                    type="button"
                    className={styles.zoomButton}
                    onClick={() => setZoom((current) => clamp(current / 1.2, 0.2, 5))}
                    aria-label="缩小"
                  >
                    −
                  </button>
                  <button type="button" className={styles.button} onClick={resetView}>
                    100%
                  </button>
                  <button type="button" className={styles.button} onClick={fitView}>
                    适应窗口
                  </button>
                  <span className={styles.zoomValue}>{zoomPercent}%</span>
                  <span className={styles.spacer} />
                  <span>拖动平移 · Ctrl/⌘ + 滚轮缩放 · 双击复位</span>
                </div>
              </div>
            </div>

            {notice ? <div className={styles.hint}>{notice}</div> : null}

      <div className={styles.hint}>
        <strong>支持的图表类型</strong>：flowchart / sequenceDiagram / classDiagram / stateDiagram-v2 /
        erDiagram / gantt / pie / gitGraph / mindmap / timeline / quadrantChart / journey / sankey-beta /
        block-beta 等（由 Mermaid 11 提供）。语法参考{" "}
        <a href="https://mermaid.js.org/intro/" target="_blank" rel="noreferrer">
          mermaid.js.org
        </a>
        。渲染在浏览器本地完成，图表内容不会上传；为安全起见使用{" "}
        <code>securityLevel: strict</code>，标签里的 HTML 与脚本会被过滤；同时以纯 SVG 文本渲染，
        因此导出的 PNG 不会因 <code>foreignObject</code> 而空白。
      </div>
    </>
  );
}

export default function MermaidPreview() {
  return (
    <Layout
      title="Mermaid Preview"
      description="在线编辑并实时预览 Mermaid 图表，支持缩放、导出 SVG/PNG"
    >
      <div className={DocRootStyles.docRoot}>
        <PageSidebar sidebar={ToolsSidebarData} path="/tools/mermaid" />
        <main className={clsx(MainStyles.docMainContainer)}>
          <div className={clsx("container", "padding-top--md", "padding-bottom--lg", styles.page)}>
            <MermaidTool />
          </div>
        </main>
      </div>
    </Layout>
  );
}
