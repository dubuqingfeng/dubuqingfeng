import React, { useEffect, useRef, useState } from "react";
import clsx from "clsx";
import Layout from "@theme/Layout";
import { ToolsSidebarData } from "@site/src/data";
import PageSidebar from "@site/src/components/PageSidebar/index";
import MainStyles from "@docusaurus/theme-classic/lib/theme/DocRoot/Layout/Main/styles.module.css";
import DocRootStyles from "@docusaurus/theme-classic/lib/theme/DocRoot/Layout/styles.module.css";
import styles from "./realtime.module.css";

type ChatMessage = {
  id: string;
  clientId: string;
  text: string;
  timestamp: number;
};

type RealtimeClient = {
  close: () => void;
};

type RealtimeChannel = {
  publish: (name: string, data: unknown) => Promise<unknown>;
  unsubscribe: () => void;
};

const MESSAGE_EVENT = "chat-message";

function messageText(data: unknown): string {
  if (typeof data === "string") return data;

  if (data && typeof data === "object" && "text" in data) {
    return String(data.text || "");
  }

  return "";
}

export default function Realtime() {
  const realtimeRef = useRef<RealtimeClient | null>(null);
  const channelRef = useRef<RealtimeChannel | null>(null);
  const [apiKey, setApiKey] = useState("");
  const [channelName, setChannelName] = useState("browser-chat");
  const [draft, setDraft] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [status, setStatus] = useState("未连接");
  const [error, setError] = useState("");
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [clientId] = useState(
    () => `web-${Math.random().toString(36).slice(2, 10)}`
  );

  const disconnect = () => {
    channelRef.current?.unsubscribe();
    channelRef.current = null;
    realtimeRef.current?.close();
    realtimeRef.current = null;
    setIsConnected(false);
    setIsConnecting(false);
    setStatus("未连接");
  };

  useEffect(() => disconnect, []);

  const connect = async () => {
    if (!apiKey.trim()) {
      setError("请输入 Ably API Key。");
      return;
    }

    if (!channelName.trim()) {
      setError("请输入频道名称。");
      return;
    }

    disconnect();
    setMessages([]);
    setError("");
    setStatus("正在连接");
    setIsConnecting(true);

    try {
      const Ably = await import("ably");
      const realtime = new Ably.Realtime({
        key: apiKey.trim(),
        clientId,
      });
      realtimeRef.current = realtime;

      realtime.connection.on("connected", () => {
        setStatus("已连接");
        setIsConnected(true);
        setIsConnecting(false);
      });
      realtime.connection.on("disconnected", () => {
        setStatus("连接已断开");
        setIsConnected(false);
        setIsConnecting(false);
      });
      realtime.connection.on("failed", (stateChange) => {
        setStatus("连接失败");
        setError(stateChange.reason?.message || "无法连接到 Ably。");
        setIsConnected(false);
        setIsConnecting(false);
      });

      const channel = realtime.channels.get(channelName.trim());
      channelRef.current = channel;
      await channel.subscribe(MESSAGE_EVENT, (message) => {
        const text = messageText(message.data);
        if (!text) return;

        setMessages((currentMessages) => [
          ...currentMessages.slice(-99),
          {
            id: message.id || `${message.timestamp}-${Math.random()}`,
            clientId: message.clientId || "unknown",
            text,
            timestamp: message.timestamp || Date.now(),
          },
        ]);
      });
    } catch (connectionError) {
      console.error("连接 Ably 失败:", connectionError);
      disconnect();
      setStatus("连接失败");
      setError("无法加载 Ably 或订阅频道，请检查 API Key 和网络连接。");
    }
  };

  const sendMessage = async () => {
    const text = draft.trim();
    if (!text || !channelRef.current) return;

    try {
      await channelRef.current.publish(MESSAGE_EVENT, {
        text,
        sentAt: Date.now(),
      });
      setDraft("");
    } catch (publishError) {
      console.error("发送实时消息失败:", publishError);
      setError("消息发送失败，请检查频道权限与连接状态。");
    }
  };

  return (
    <Layout title="实时消息" description="通过 Ably 在浏览器之间实时发送消息">
      <div className={DocRootStyles.docRoot}>
        <PageSidebar sidebar={ToolsSidebarData} path="/tools/realtime" />
        <main className={clsx(MainStyles.docMainContainer)}>
          <div
            className={clsx(
              "container",
              "padding-top--md",
              "padding-bottom--lg"
            )}
          >
            <div className={styles.page}>
              <h1 className={styles.heading}>实时消息</h1>
              <p className={styles.intro}>
                使用同一 Ably Key 和频道的浏览器会立即收到彼此的消息。
              </p>

              <div className={styles.workspace}>
                <section
                  className={styles.section}
                  aria-labelledby="connection-title"
                >
                  <h2 className={styles.sectionTitle} id="connection-title">
                    连接
                  </h2>
                  <div className={styles.fields}>
                    <label className={styles.field}>
                      Ably API Key
                      <input
                        className={styles.input}
                        type="password"
                        value={apiKey}
                        onChange={(event) => setApiKey(event.target.value)}
                        placeholder="appId.keyId:secret"
                        autoComplete="off"
                        disabled={isConnected || isConnecting}
                      />
                    </label>
                    <label className={styles.field}>
                      频道名称
                      <input
                        className={styles.input}
                        value={channelName}
                        onChange={(event) => setChannelName(event.target.value)}
                        placeholder="browser-chat"
                        autoComplete="off"
                        disabled={isConnected || isConnecting}
                      />
                    </label>
                    <div className={styles.actions}>
                      <button
                        className={styles.button}
                        type="button"
                        onClick={connect}
                        disabled={isConnecting || isConnected}
                      >
                        {isConnecting ? "正在连接" : "连接"}
                      </button>
                      <button
                        className={clsx(styles.button, styles.secondaryButton)}
                        type="button"
                        onClick={disconnect}
                        disabled={!isConnected && !isConnecting}
                      >
                        断开连接
                      </button>
                    </div>
                  </div>
                  <span
                    className={clsx(
                      styles.status,
                      isConnected && styles.connected
                    )}
                    aria-live="polite"
                  >
                    {status}
                  </span>
                  {error && (
                    <p className={styles.error} role="alert">
                      {error}
                    </p>
                  )}
                </section>

                <section
                  className={styles.section}
                  aria-labelledby="messages-title"
                >
                  <h2 className={styles.sectionTitle} id="messages-title">
                    消息
                  </h2>
                  <textarea
                    className={styles.messageInput}
                    value={draft}
                    onChange={(event) => setDraft(event.target.value)}
                    placeholder="输入消息"
                    aria-label="消息内容"
                    disabled={!isConnected}
                  />
                  <div className={styles.actions}>
                    <button
                      className={styles.button}
                      type="button"
                      onClick={sendMessage}
                      disabled={!isConnected || !draft.trim()}
                    >
                      发送消息
                    </button>
                  </div>
                  <div className={styles.messageList} aria-live="polite">
                    {messages.length === 0 ? (
                      <p className={styles.empty}>尚未收到消息</p>
                    ) : (
                      messages.map((message) => (
                        <article className={styles.message} key={message.id}>
                          <div className={styles.messageMeta}>
                            <span>{message.clientId}</span>
                            <time>
                              {new Date(message.timestamp).toLocaleTimeString()}
                            </time>
                          </div>
                          <p className={styles.messageText}>{message.text}</p>
                        </article>
                      ))
                    )}
                  </div>
                </section>
              </div>

              <p className={styles.notice}>
                请使用仅授予目标频道发布与订阅权限的 Ably Key。
              </p>
            </div>
          </div>
        </main>
      </div>
    </Layout>
  );
}
