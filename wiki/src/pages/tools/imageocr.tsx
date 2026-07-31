import React, { useEffect, useRef, useState } from "react";
import clsx from "clsx";
import Layout from "@theme/Layout";
import { ToolsSidebarData } from "@site/src/data";
import PageSidebar from "@site/src/components/PageSidebar/index";
import MainStyles from "@docusaurus/theme-classic/lib/theme/DocRoot/Layout/Main/styles.module.css";
import DocRootStyles from "@docusaurus/theme-classic/lib/theme/DocRoot/Layout/styles.module.css";
import { useHistory, useLocation } from "@docusaurus/router";
import styles from "./imageocr.module.css";

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const ENCRYPTION_KEY = "URLParamTool2024";

function simpleEncrypt(text: string): string {
  if (!text) return "";

  try {
    let result = "";
    for (let index = 0; index < text.length; index += 1) {
      const charCode =
        text.charCodeAt(index) ^
        ENCRYPTION_KEY.charCodeAt(index % ENCRYPTION_KEY.length);
      result += String.fromCharCode(charCode);
    }
    return btoa(encodeURIComponent(result));
  } catch (encryptionError) {
    console.error("加密识别结果失败:", encryptionError);
    return text;
  }
}

function simpleDecrypt(encrypted: string): string {
  if (!encrypted) return "";

  try {
    const decoded = decodeURIComponent(atob(encrypted));
    let result = "";
    for (let index = 0; index < decoded.length; index += 1) {
      const charCode =
        decoded.charCodeAt(index) ^
        ENCRYPTION_KEY.charCodeAt(index % ENCRYPTION_KEY.length);
      result += String.fromCharCode(charCode);
    }
    return result;
  } catch (decryptionError) {
    console.error("解密识别结果失败:", decryptionError);
    return encrypted;
  }
}

function formatFileSize(size: number) {
  if (size < 1024 * 1024) {
    return `${Math.round(size / 1024)} KB`;
  }

  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

function readFileAsDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

export default function ImageOCR() {
  const history = useHistory();
  const location = useLocation();
  const inputRef = useRef<HTMLInputElement>(null);
  const previewUrlRef = useRef<string | null>(null);
  const base64FileRef = useRef<File | null>(null);
  const urlUpdateTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [language, setLanguage] = useState("chi_sim+eng");
  const [result, setResult] = useState("");
  const [useEncryption, setUseEncryption] = useState(true);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [isRecognizing, setIsRecognizing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [urlCopied, setUrlCopied] = useState(false);
  const [base64Content, setBase64Content] = useState("");
  const [showBase64, setShowBase64] = useState(false);
  const [isLoadingBase64, setIsLoadingBase64] = useState(false);
  const [base64Copied, setBase64Copied] = useState(false);

  const updateURL = (value: string, encrypt: boolean) => {
    if (urlUpdateTimerRef.current) {
      clearTimeout(urlUpdateTimerRef.current);
      urlUpdateTimerRef.current = null;
    }

    const searchParams = new URLSearchParams();

    if (value) {
      searchParams.set(
        encrypt ? "e" : "content",
        encrypt ? simpleEncrypt(value) : value
      );
    }

    history.replace({
      pathname: location.pathname,
      search: searchParams.toString(),
    });
  };

  const scheduleURLUpdate = (value: string, encrypt: boolean) => {
    if (urlUpdateTimerRef.current) {
      clearTimeout(urlUpdateTimerRef.current);
    }

    urlUpdateTimerRef.current = window.setTimeout(() => {
      updateURL(value, encrypt);
    }, 500);
  };

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const encryptedValue = searchParams.get("e");
    const content = encryptedValue || searchParams.get("content");

    if (encryptedValue) {
      setResult(simpleDecrypt(encryptedValue));
      setUseEncryption(true);
    } else if (content) {
      setResult(content);
      setUseEncryption(false);
    }
  }, []);

  useEffect(() => {
    return () => {
      if (previewUrlRef.current) {
        URL.revokeObjectURL(previewUrlRef.current);
      }

      if (urlUpdateTimerRef.current) {
        clearTimeout(urlUpdateTimerRef.current);
      }
    };
  }, []);

  const setImage = (file: File) => {
    if (!file.type.startsWith("image/")) {
      setError("请选择图片文件。");
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setError("图片不能超过 10 MB。");
      return;
    }

    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current);
    }

    const nextPreviewUrl = URL.createObjectURL(file);
    previewUrlRef.current = nextPreviewUrl;
    setImageFile(file);
    setPreviewUrl(nextPreviewUrl);
    base64FileRef.current = null;
    setBase64Content("");
    setShowBase64(false);
    setIsLoadingBase64(false);
    setBase64Copied(false);
    setResult("");
    updateURL("", useEncryption);
    setError("");
    setStatus("");
    setCopied(false);
  };

  const handlePaste = (event: React.ClipboardEvent<HTMLDivElement>) => {
    const image = Array.from(event.clipboardData.files).find((file) =>
      file.type.startsWith("image/")
    );

    if (!image) {
      setError("剪贴板中没有可识别的图片，请复制图片后重试。");
      return;
    }

    event.preventDefault();
    setImage(image);
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
    const image = Array.from(event.dataTransfer.files).find((file) =>
      file.type.startsWith("image/")
    );

    if (image) {
      setImage(image);
    } else {
      setError("请拖入图片文件。");
    }
  };

  const recognizeImage = async () => {
    if (!imageFile) {
      setError("请先粘贴、拖入或选择一张图片。");
      return;
    }

    setIsRecognizing(true);
    setError("");
    setResult("");
    setStatus("正在准备识别引擎...");

    try {
      const { createWorker } = await import("tesseract.js");
      const worker = await createWorker(language, 1, {
        logger: (message) => {
          if (message.status === "recognizing text") {
            setStatus(`正在识别文字... ${Math.round(message.progress * 100)}%`);
          } else if (message.status) {
            setStatus("正在加载识别模型...");
          }
        },
      });

      const {
        data: { text },
      } = await worker.recognize(imageFile);
      await worker.terminate();
      const recognizedText = text.trim();
      setResult(recognizedText);
      updateURL(recognizedText, useEncryption);
      setStatus(
        recognizedText ? "识别完成。" : "识别完成，未找到可提取的文字。"
      );
    } catch (recognitionError) {
      console.error("图片文字识别失败:", recognitionError);
      setStatus("");
      setError("识别失败，请检查网络连接或换一张更清晰的图片后重试。");
    } finally {
      setIsRecognizing(false);
    }
  };

  const copyResult = async () => {
    if (!result) return;

    try {
      await navigator.clipboard.writeText(result);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch (copyError) {
      console.error("复制识别结果失败:", copyError);
      setError("复制失败，请手动选择结果文本复制。");
    }
  };

  const handleResultChange = (value: string) => {
    setResult(value);
    scheduleURLUpdate(value, useEncryption);
  };

  const toggleEncryption = () => {
    const nextEncryption = !useEncryption;
    setUseEncryption(nextEncryption);
    updateURL(result, nextEncryption);
  };

  const copyURL = async () => {
    const fullURL =
      window.location.origin + location.pathname + location.search;

    try {
      await navigator.clipboard.writeText(fullURL);
      setUrlCopied(true);
      window.setTimeout(() => setUrlCopied(false), 2000);
    } catch (copyError) {
      console.error("复制识别结果 URL 失败:", copyError);
      setError("复制 URL 失败，请手动复制浏览器地址。");
    }
  };

  const toggleBase64 = async () => {
    if (!imageFile) return;

    if (showBase64) {
      setShowBase64(false);
      return;
    }

    if (base64Content) {
      setShowBase64(true);
      return;
    }

    const fileToRead = imageFile;
    base64FileRef.current = fileToRead;
    setIsLoadingBase64(true);
    setError("");

    try {
      const content = await readFileAsDataURL(fileToRead);
      if (base64FileRef.current === fileToRead) {
        setBase64Content(content);
        setShowBase64(true);
      }
    } catch (readError) {
      console.error("读取图片 Base64 失败:", readError);
      setError("读取图片 Base64 失败，请重新选择图片后重试。");
    } finally {
      if (base64FileRef.current === fileToRead) {
        setIsLoadingBase64(false);
      }
    }
  };

  const copyBase64 = async () => {
    if (!base64Content) return;

    try {
      await navigator.clipboard.writeText(base64Content);
      setBase64Copied(true);
      window.setTimeout(() => setBase64Copied(false), 2000);
    } catch (copyError) {
      console.error("复制图片 Base64 失败:", copyError);
      setError("复制图片 Base64 失败，请手动选择内容复制。");
    }
  };

  return (
    <Layout title="图片文字识别" description="从粘贴或上传的图片中提取文字">
      <div className={DocRootStyles.docRoot}>
        <PageSidebar sidebar={ToolsSidebarData} path="/tools/imageocr" />
        <main className={clsx(MainStyles.docMainContainer)}>
          <div
            className={clsx(
              "container",
              "padding-top--md",
              "padding-bottom--lg"
            )}
          >
            <div className={styles.page}>
              <h1 className={styles.heading}>图片文字识别</h1>
              <p className={styles.intro}>
                粘贴图片、拖入图片或选择本地文件，提取其中的文字。
              </p>

              <div className={styles.workspace}>
                <section
                  className={styles.panel}
                  aria-labelledby="image-input-title"
                >
                  <h2 className={styles.panelTitle} id="image-input-title">
                    图片
                  </h2>
                  <div
                    className={clsx(
                      styles.dropzone,
                      isDragging && styles.dropzoneActive
                    )}
                    tabIndex={0}
                    onClick={(event) => event.currentTarget.focus()}
                    onPaste={handlePaste}
                    onDragEnter={(event) => {
                      event.preventDefault();
                      setIsDragging(true);
                    }}
                    onDragOver={(event) => event.preventDefault()}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={handleDrop}
                    aria-label="粘贴、拖入或选择图片"
                  >
                    {previewUrl ? (
                      <img
                        className={styles.preview}
                        src={previewUrl}
                        alt="待识别图片预览"
                      />
                    ) : (
                      <div className={styles.dropzoneContent}>
                        <strong>在这里粘贴图片</strong>
                        <span>也可以拖入图片或点击选择文件</span>
                      </div>
                    )}
                  </div>
                  <input
                    ref={inputRef}
                    type="file"
                    accept="image/*"
                    hidden
                    onChange={(event) => {
                      const [file] = Array.from(event.target.files || []);
                      if (file) setImage(file);
                      event.currentTarget.value = "";
                    }}
                  />
                  {imageFile && (
                    <p className={styles.imageMeta}>
                      {imageFile.name} · {formatFileSize(imageFile.size)}
                    </p>
                  )}
                  <div className={styles.controls}>
                    <button
                      className={clsx(styles.button, styles.secondaryButton)}
                      type="button"
                      onClick={() => inputRef.current?.click()}
                      disabled={isRecognizing}
                    >
                      选择图片
                    </button>
                    <label className={styles.selectLabel}>
                      识别语言
                      <select
                        className={styles.select}
                        value={language}
                        onChange={(event) => setLanguage(event.target.value)}
                        disabled={isRecognizing}
                      >
                        <option value="chi_sim+eng">简体中文 + English</option>
                        <option value="eng">English</option>
                        <option value="chi_sim">简体中文</option>
                      </select>
                    </label>
                    <button
                      className={styles.button}
                      type="button"
                      onClick={recognizeImage}
                      disabled={!imageFile || isRecognizing}
                    >
                      {isRecognizing ? "正在识别" : "识别文字"}
                    </button>
                  </div>
                  {imageFile && (
                    <div className={styles.base64Controls}>
                      <button
                        className={clsx(styles.button, styles.secondaryButton)}
                        type="button"
                        onClick={toggleBase64}
                        disabled={isLoadingBase64}
                      >
                        {isLoadingBase64
                          ? "正在读取 Base64"
                          : showBase64
                          ? "隐藏 Base64"
                          : "显示 Base64"}
                      </button>
                      {showBase64 && base64Content && (
                        <button
                          className={clsx(
                            styles.button,
                            styles.secondaryButton
                          )}
                          type="button"
                          onClick={copyBase64}
                        >
                          {base64Copied ? "Base64 已复制" : "复制 Base64"}
                        </button>
                      )}
                    </div>
                  )}
                  {showBase64 && base64Content && (
                    <div className={styles.base64Section}>
                      <label className={styles.base64Label}>
                        原始图片 Data URL（Base64）
                        <textarea
                          className={styles.base64Result}
                          value={base64Content}
                          readOnly
                          aria-label="原始图片 Data URL（Base64）"
                        />
                      </label>
                    </div>
                  )}
                  {status && (
                    <p className={styles.status} aria-live="polite">
                      {status}
                    </p>
                  )}
                  {error && (
                    <p
                      className={clsx(styles.status, styles.error)}
                      role="alert"
                    >
                      {error}
                    </p>
                  )}
                </section>

                <section
                  className={styles.panel}
                  aria-labelledby="result-title"
                >
                  <h2 className={styles.panelTitle} id="result-title">
                    识别结果
                  </h2>
                  <textarea
                    className={styles.result}
                    value={result}
                    onChange={(event) => handleResultChange(event.target.value)}
                    placeholder="识别结果会显示在这里"
                    aria-label="识别结果"
                  />
                  <div className={styles.copyRow}>
                    <button
                      className={clsx(styles.button, styles.secondaryButton)}
                      type="button"
                      onClick={copyResult}
                      disabled={!result}
                    >
                      复制结果
                    </button>
                    {copied && <span className={styles.copyHint}>已复制</span>}
                  </div>
                  <div className={styles.urlControls}>
                    <label className={styles.encryptionLabel}>
                      <input
                        type="checkbox"
                        checked={useEncryption}
                        onChange={toggleEncryption}
                      />
                      加密 URL 参数
                    </label>
                    <button
                      className={clsx(styles.button, styles.secondaryButton)}
                      type="button"
                      onClick={copyURL}
                      disabled={!result}
                    >
                      {urlCopied ? "URL 已复制" : "复制 URL"}
                    </button>
                  </div>
                </section>
              </div>

              <p className={styles.privacy}>
                图片仅在浏览器中处理，不会上传到本网站的服务器。
              </p>
            </div>
          </div>
        </main>
      </div>
    </Layout>
  );
}
