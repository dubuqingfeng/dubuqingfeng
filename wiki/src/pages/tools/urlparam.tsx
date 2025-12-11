import React, { useState, useEffect, useRef } from "react";
import clsx from "clsx";
import Layout from "@theme/Layout";
import Center from "@site/src/components/Center/center";
import { ToolsSidebarData } from "@site/src/data";
import PageSidebar from "@site/src/components/PageSidebar/index";
import MainStyles from "@docusaurus/theme-classic/lib/theme/DocRoot/Layout/Main/styles.module.css";
import DocRootStyles from "@docusaurus/theme-classic/lib/theme/DocRoot/Layout/styles.module.css";
import { useHistory, useLocation } from "@docusaurus/router";

// 简单的加密密钥（可以根据需要修改）
const ENCRYPTION_KEY = "URLParamTool2024";

// 简单的 XOR 加密
function simpleEncrypt(text: string): string {
  if (!text) return "";
  try {
    let result = "";
    for (let i = 0; i < text.length; i++) {
      const charCode =
        text.charCodeAt(i) ^
        ENCRYPTION_KEY.charCodeAt(i % ENCRYPTION_KEY.length);
      result += String.fromCharCode(charCode);
    }
    // 使用 base64 编码使其 URL 安全
    return btoa(encodeURIComponent(result));
  } catch (e) {
    console.error("加密失败:", e);
    return text;
  }
}

// 简单的 XOR 解密
function simpleDecrypt(encrypted: string): string {
  if (!encrypted) return "";
  try {
    // 先 base64 解码
    const decoded = decodeURIComponent(atob(encrypted));
    let result = "";
    for (let i = 0; i < decoded.length; i++) {
      const charCode =
        decoded.charCodeAt(i) ^
        ENCRYPTION_KEY.charCodeAt(i % ENCRYPTION_KEY.length);
      result += String.fromCharCode(charCode);
    }
    return result;
  } catch (e) {
    console.error("解密失败:", e);
    return encrypted;
  }
}

export default function URLParam() {
  const history = useHistory();
  const location = useLocation();
  const [inputValue, setInputValue] = useState("");
  const [useEncryption, setUseEncryption] = useState(true);
  const [copySuccess, setCopySuccess] = useState(false);
  const [copyContentSuccess, setCopyContentSuccess] = useState(false);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isInitialMount = useRef(true);

  // 页面加载时从 URL 参数读取内容
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const paramValue = searchParams.get("content");
    const encryptedValue = searchParams.get("e");

    if (encryptedValue) {
      // 如果有加密参数，解密它
      const decrypted = simpleDecrypt(encryptedValue);
      setInputValue(decrypted);
      setUseEncryption(true);
    } else if (paramValue) {
      // 否则使用普通参数
      setInputValue(paramValue);
      setUseEncryption(false);
    }
    
    isInitialMount.current = false;
  }, []);

  // 更新 URL（使用 replace 避免历史记录堆积）
  const updateURL = (value: string, encrypt: boolean) => {
    const searchParams = new URLSearchParams();

    if (value) {
      if (encrypt) {
        // 使用加密模式
        const encrypted = simpleEncrypt(value);
        searchParams.set("e", encrypted);
      } else {
        // 使用普通模式
        searchParams.set("content", value);
      }
    }

    history.replace({
      pathname: location.pathname,
      search: searchParams.toString(),
    });
  };

  // 处理输入框变化（使用防抖）
  const handleInputChange = (e) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    
    // 清除之前的定时器
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    
    // 设置新的定时器，500ms 后更新 URL
    debounceTimerRef.current = setTimeout(() => {
      updateURL(newValue, useEncryption);
    }, 500);
  };

  // 清理定时器
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  // 切换加密模式
  const toggleEncryption = () => {
    const newEncryption = !useEncryption;
    setUseEncryption(newEncryption);
    // 切换加密模式时更新 URL
    updateURL(inputValue, newEncryption);
  };

  // 复制 URL 到剪贴板
  const handleCopyURL = async () => {
    const fullURL = window.location.origin + location.pathname + location.search;
    try {
      await navigator.clipboard.writeText(fullURL);
      setCopySuccess(true);
      // 2秒后隐藏成功提示
      setTimeout(() => {
        setCopySuccess(false);
      }, 2000);
    } catch (err) {
      console.error("复制失败:", err);
    }
  };

  // 复制输入框内容到剪贴板
  const handleCopyContent = async () => {
    try {
      await navigator.clipboard.writeText(inputValue);
      setCopyContentSuccess(true);
      // 2秒后隐藏成功提示
      setTimeout(() => {
        setCopyContentSuccess(false);
      }, 2000);
    } catch (err) {
      console.error("复制失败:", err);
    }
  };

  return (
    <Layout
      title="URL Parameter Tool"
      description="A tool to sync input with URL parameters"
    >
      <div className={DocRootStyles.docRoot}>
        <PageSidebar
          sidebar={ToolsSidebarData}
          path="/tools/urlparam"
        ></PageSidebar>
        <main className={clsx(MainStyles.docMainContainer)}>
          <div
            className={clsx(
              "container",
              "padding-top--md",
              "padding-bottom--lg"
            )}
          >
            <div>
              <div>
                <Center>
                  <h1 style={{ marginTop: "16px" }}>URL Parameter Tool</h1>
                </Center>
              </div>
            </div>
            <div>
              <div>
                <Center>
                  <textarea
                    name="inputarea"
                    id="inputarea"
                    value={inputValue}
                    onChange={handleInputChange}
                    placeholder="输入内容..."
                    rows={10}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2"
                    style={{
                      maxWidth: "100%",
                      width: "100%",
                      boxSizing: "border-box",
                      resize: "vertical",
                    }}
                  />
                </Center>
              </div>
              <div style={{ marginTop: "16px" }}>
                <Center>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                      flexWrap: "wrap",
                      justifyContent: "center",
                    }}
                  >
                    <label
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        cursor: "pointer",
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={useEncryption}
                        onChange={toggleEncryption}
                        className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                      />
                      <span style={{ fontSize: "14px" }}>启用加密</span>
                    </label>
                    <button
                      type="button"
                      onClick={handleCopyContent}
                      className="inline-flex justify-center rounded-md border border-transparent py-2 px-4 text-sm font-medium shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                      style={{
                        backgroundColor: copyContentSuccess ? "#10b981" : "#6366f1",
                        color: "#ffffff",
                        transition: "background-color 0.2s",
                      }}
                      onMouseEnter={(e) => {
                        if (!copyContentSuccess) {
                          e.currentTarget.style.backgroundColor = "#4f46e5";
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!copyContentSuccess) {
                          e.currentTarget.style.backgroundColor = "#6366f1";
                        }
                      }}
                    >
                      {copyContentSuccess ? "✓ 已复制" : "复制内容"}
                    </button>
                    <button
                      type="button"
                      onClick={handleCopyURL}
                      className="inline-flex justify-center rounded-md border border-transparent py-2 px-4 text-sm font-medium shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                      style={{
                        backgroundColor: copySuccess ? "#10b981" : "#6366f1",
                        color: "#ffffff",
                        transition: "background-color 0.2s",
                      }}
                      onMouseEnter={(e) => {
                        if (!copySuccess) {
                          e.currentTarget.style.backgroundColor = "#4f46e5";
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!copySuccess) {
                          e.currentTarget.style.backgroundColor = "#6366f1";
                        }
                      }}
                    >
                      {copySuccess ? "✓ 已复制" : "复制 URL"}
                    </button>
                  </div>
                </Center>
              </div>
              <div style={{ marginTop: "24px", padding: "0 16px" }}>
                <Center>
                  <div
                    style={{
                      backgroundColor: "var(--ifm-background-surface-color)",
                      padding: "16px",
                      borderRadius: "8px",
                      width: "100%",
                      maxWidth: "600px",
                      wordBreak: "break-all",
                    }}
                  >
                    <strong>当前 URL:</strong>
                    <br />
                    <code style={{ fontSize: "12px" }}>
                      {location.pathname}
                      {location.search}
                    </code>
                  </div>
                </Center>
              </div>
            </div>
          </div>
        </main>
      </div>
    </Layout>
  );
}
