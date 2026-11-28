import React, { useCallback, useMemo, useState } from "react";
import clsx from "clsx";
import Layout from "@theme/Layout";
import Center from "@site/src/components/Center/center";
import { ToolsSidebarData } from "@site/src/data";
import PageSidebar from "@site/src/components/PageSidebar/index";
import MainStyles from "@docusaurus/theme-classic/lib/theme/DocRoot/Layout/Main/styles.module.css";
import DocRootStyles from "@docusaurus/theme-classic/lib/theme/DocRoot/Layout/styles.module.css";
import styles from "./calldata.module.css";
import {
  decodeEthCalldata,
  decodeSolanaInstructionData,
  decodeSolanaTransaction,
  ethResultToJson,
  renderParamValue,
  solanaTransactionToJson,
} from "@site/src/utils/calldata";
import type {
  EthCallResult,
  EthChildCall,
  EthWord,
  SolanaInstructionDataResult,
  SolanaInstructionView,
  SolanaTransactionResult,
} from "@site/src/utils/calldata";

type Mode = "eth" | "sol-instruction" | "sol-tx";
type Encoding = "auto" | "hex" | "base58" | "base64";
type RiskNode = { level: "info" | "low" | "medium" | "high"; title: string; detail?: string };

const SYSTEM_PROGRAM = "11111111111111111111111111111111";
const TOKEN_PROGRAM = "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA";
const COMPUTE_PROGRAM = "ComputeBudget111111111111111111111111111111";
const MEMO_PROGRAM = "MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr";

const MODES: { id: Mode; label: string; hint: string }[] = [
  {
    id: "eth",
    label: "Ethereum Calldata",
    hint: "粘贴十六进制 calldata（含 4 字节选择器）。支持 ERC-20/721/1155、Uniswap V2/V3/Universal Router、Permit2、Safe、Aave、Multicall 等常见方法，并自动解读操作与风险。",
  },
  {
    id: "sol-instruction",
    label: "Solana 指令数据",
    hint: "粘贴单条指令的 data（十六进制 / Base58 / Base64），填写程序 ID 即可解码。内置 System、SPL Token、ATA、ComputeBudget、Memo 解码器；DeFi 程序可粘贴 Anchor IDL。",
  },
  {
    id: "sol-tx",
    label: "Solana 交易",
    hint: "粘贴完整的序列化交易（浏览器/钱包导出的 Base58 或 Base64），自动拆分 message、解析每个指令并汇总资金流向。",
  },
];

const ETH_SAMPLES = [
  {
    label: "ERC-20 转账 10 USDC",
    value:
      "0xa9059cbb00000000000000000000000011111111111111111111111111111111111111110000000000000000000000000000000000000000000000000000000000989680",
    decimals: 6,
  },
  {
    label: "无限授权（风险示例）",
    value:
      "0x095ea7b3000000000000000000000000e592427a0aece92de3edee1f18e0157c05861564ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff",
    decimals: 18,
  },
  {
    label: "Uniswap V3 兑换",
    value:
      "0x414bf389000000000000000000000000a0b86991c6218b36c1d19d4a2e9eb0ce3606eb48000000000000000000000000c02aaa39b223fe8d0a0e5c4f27ead9083c756cc200000000000000000000000000000000000000000000000000000000000001f400000000000000000000000011111111111111111111111111111111111111110000000000000000000000000000000000000000000000000000000070dbd880000000000000000000000000000000000000000000000000000000003b9aca00000000000000000000000000000000000000000000000000058d15e1762800000000000000000000000000000000000000000000000000000000000000000000",
    decimals: 6,
  },
  {
    label: "Multicall 批量调用",
    value:
      "0xac9650d800000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000004000000000000000000000000000000000000000000000000000000000000000c00000000000000000000000000000000000000000000000000000000000000044a9059cbb000000000000000000000000111111111111111111111111111111111111111100000000000000000000000000000000000000000000000000000000006acfc000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000044095ea7b3000000000000000000000000e592427a0aece92de3edee1f18e0157c05861564ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff",
    decimals: 6,
  },
  {
    label: "未知选择器（人工判读）",
    value:
      "0xdeadbeef00000000000000000000000000000000000000000000000000000000000000c80000000000000000000000001111111111111111111111111111111111111111",
    decimals: 18,
  },
];

const SOL_IX_SAMPLES = [
  {
    label: "System Transfer 0.5 SOL",
    value: "0x020000000065cd1d00000000",
    programId: SYSTEM_PROGRAM,
  },
  {
    label: "SPL TransferChecked 2.5（精度 6）",
    value: "0x0ca02526000000000006",
    programId: TOKEN_PROGRAM,
  },
  {
    label: "无限代币授权（风险示例）",
    value: "0x04ffffffffffffffff",
    programId: TOKEN_PROGRAM,
  },
  {
    label: "Compute Unit Price 2500",
    value: "0x03c409000000000000",
    programId: COMPUTE_PROGRAM,
  },
  {
    label: "Memo",
    value: "0x68656c6c6f20736f6c616e61",
    programId: MEMO_PROGRAM,
  },
];

const SOL_TX_SAMPLE = {
  label: "示例交易：ComputeBudget + SOL 转账 + SPL 转账",
  value:
    "4GyuWabqFsR8ZTTW1tXwNUEvqPDyPJnFbpEeAxJ2wubRaqrPHJ33dzUpUvJVMiuugP2ZkXZeowGhEeyRoVeff52E9Fd7taa3nyKs8L1X64y8Ux2uenAAqz7QA2K5exv6aRgUMoDu4So1eWvnciz2pGa5EVgBcs1Jhi595Rm3SYgvwZwySpmzS8EWNDquoS2u5PYvJYHE1QzmYuwkV9bPC54f8uw6LbiPcYrQVPbV3idhcogAX72a7DMHaseugyeBxAewtRpf9L3ijNcSJdxWJj5QuH3h5DjrExWVbffFQhDNKoBKYZpKfPZNEfaxZHrbCLw3sqMnWSNgT8L7PqrFswRbiNYcw4JnjpF3a5GQkutvqwgaTj1age25AUiL9qt2FqocjYs7e44nSeZG2mhLXcswt1MnFomzKJNy37siDGFZQLaGS2mwRWsZBTGqEVbQiQJkmaqqwfbqTJRhpq89g1vkLYazECRFyUHvPXPn7k1WQwPfNCUfK12j5k38TmvBxiDoLEu2mHDrmVKjUiX88xgAzEoKKiRnWAuebrMZGXtsCVNsmX",
  programId: "",
};

const RISK_LABEL: Record<string, string> = {
  high: "高风险",
  medium: "中风险",
  low: "低风险",
  info: "提示",
};

function Badge({
  tone = "neutral",
  children,
}: {
  tone?: "ok" | "warn" | "neutral" | "primary";
  children: React.ReactNode;
}) {
  return <span className={clsx(styles.badge, styles[`badge_${tone}`])}>{children}</span>;
}

function Summary({ lines }: { lines?: string[] }) {
  if (!lines || lines.length === 0) {
    return null;
  }
  return (
    <ul className={styles.summaryList}>
      {lines.map((line, index) => (
        <li key={index}>{line}</li>
      ))}
    </ul>
  );
}

function RiskList({ risks }: { risks?: RiskNode[] }) {
  if (!risks || risks.length === 0) {
    return null;
  }
  return (
    <ul className={styles.riskList}>
      {risks.map((risk, index) => (
        <li key={index} className={clsx(styles.riskItem, styles[`risk_${risk.level}`])}>
          <span className={styles.riskLevel}>{RISK_LABEL[risk.level] ?? risk.level}</span>
          <div>
            <strong>{risk.title}</strong>
            {risk.detail ? <p className={styles.riskDetail}>{risk.detail}</p> : null}
          </div>
        </li>
      ))}
    </ul>
  );
}

function Notes({ notes }: { notes?: string[] }) {
  if (!notes || notes.length === 0) {
    return null;
  }
  return (
    <ul className={styles.noteList}>
      {notes.map((note, index) => (
        <li key={index}>{note}</li>
      ))}
    </ul>
  );
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const onCopy = useCallback(() => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(text).then(
        () => {
          setCopied(true);
          setTimeout(() => setCopied(false), 1500);
        },
        () => undefined
      );
    }
  }, [text]);
  return (
    <button type="button" className={styles.button} onClick={onCopy}>
      {copied ? "已复制" : "复制"}
    </button>
  );
}

function JsonPanel({ data, label = "原始 JSON" }: { data: unknown; label?: string }) {
  const text = useMemo(() => JSON.stringify(data, null, 2), [data]);
  return (
    <details className={styles.details}>
      <summary>{label}</summary>
      <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
        <CopyButton text={text} />
      </div>
      <pre className={styles.pre}>{text}</pre>
    </details>
  );
}

function ParamTable({ params, decimals }: { params: EthCallResult["params"]; decimals: number }) {
  if (!params || params.length === 0) {
    return null;
  }
  return (
    <div className={styles.tableWrap}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>参数</th>
            <th>类型</th>
            <th>值</th>
          </tr>
        </thead>
        <tbody>
          {params.map((param, index) => (
            <tr key={index}>
              <td className={styles.mono}>{param.name}</td>
              <td>
                <code>{param.type}</code>
              </td>
              <td className={styles.valueCell}>{renderParamValue(param, decimals)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function WordsTable({ words }: { words: EthWord[] }) {
  if (!words || words.length === 0) {
    return null;
  }
  return (
    <div className={styles.tableWrap}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>#</th>
            <th>32 字节数据块</th>
            <th>按 uint256 解读</th>
            <th>按 address 解读</th>
          </tr>
        </thead>
        <tbody>
          {words.map((word) => (
            <tr key={word.index}>
              <td className={styles.tabular}>{word.index}</td>
              <td className={styles.valueCell}>{word.hex}</td>
              <td className={styles.valueCell}>{word.uint}</td>
              <td className={styles.valueCell}>{word.address ?? "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ChildBlock({ child, decimals }: { child: EthChildCall; decimals: number }) {
  return (
    <div className={styles.childBlock}>
      <div className={styles.childLabel}>{child.label}</div>
      {child.error ? <p className={styles.error}>{child.error}</p> : null}
      {child.summary ? <Summary lines={child.summary} /> : null}
      <RiskList risks={child.risks as RiskNode[]} />
      {child.raw ? <pre className={styles.pre}>{child.raw}</pre> : null}
      {child.call ? <CallCard call={child.call} decimals={decimals} nested /> : null}
    </div>
  );
}

function CallCard({
  call,
  decimals,
  nested = false,
}: {
  call: EthCallResult;
  decimals: number;
  nested?: boolean;
}) {
  return (
    <div className={clsx(styles.callCard, nested && styles.callCardNested)}>
      <div className={styles.callHeader}>
        <span className={styles.callAction}>{call.action}</span>
        <Badge tone="primary">{call.category}</Badge>
        {call.known ? null : <Badge tone="warn">未识别</Badge>}
        {call.selector ? <code className={styles.callSignature}>{call.selector}</code> : null}
      </div>
      {call.signature ? <div className={styles.callSignature}>{call.signature}</div> : null}
      <Summary lines={call.summary} />
      <RiskList risks={call.risks as RiskNode[]} />
      <ParamTable params={call.params} decimals={decimals} />
      {call.words ? <WordsTable words={call.words} /> : null}
      <Notes notes={call.notes} />
      {call.error ? <p className={styles.error}>{call.error}</p> : null}
      {call.extraBytes ? (
        <p className={styles.note}>尾部未解析字节：{call.extraBytes} 字节</p>
      ) : null}
      {call.children && call.children.length > 0 ? (
        <details className={styles.details} open={!nested}>
          <summary>子调用（{call.children.length}）</summary>
          <div className={styles.children}>
            {call.children.map((child, index) => (
              <ChildBlock key={index} child={child} decimals={decimals} />
            ))}
          </div>
        </details>
      ) : null}
      {!nested ? <JsonPanel data={ethResultToJson(call)} /> : null}
    </div>
  );
}

function SolanaInstructionCard({
  instruction,
}: {
  instruction: SolanaInstructionView;
}) {
  const risks: RiskNode[] = [];
  for (const effect of instruction.effects) {
    if (effect.type === "token-approve" && effect.unlimited) {
      risks.push({
        level: "high",
        title: "无限代币授权",
        detail: "授权额度为 u64 上限，被授权方可以转走该账户全部余额。",
      });
    }
    if (effect.type === "authority-change") {
      risks.push({
        level: "high",
        title: "变更权限",
        detail: "该指令会改变代币或账户的控制权。",
      });
    }
    if (effect.type === "account-close") {
      risks.push({
        level: "medium",
        title: "关闭账户",
        detail: "账户被关闭，剩余租金会转给指定地址。",
      });
    }
  }

  return (
    <div className={styles.callCard} style={{ marginBottom: 12 }}>
      <div className={styles.callHeader}>
        <span className={styles.ixIndex}>#{instruction.index}</span>
        <span className={styles.callAction}>{instruction.name}</span>
        <Badge tone={instruction.programKnown ? "ok" : "warn"}>{instruction.programName}</Badge>
        {instruction.known ? null : <Badge tone="warn">未完全解析</Badge>}
        <code className={styles.callSignature}>{instruction.programId}</code>
      </div>
      <Summary lines={instruction.summary} />
      <RiskList risks={risks} />
      {instruction.args.length > 0 ? (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>字段</th>
                <th>类型</th>
                <th>值</th>
              </tr>
            </thead>
            <tbody>
              {instruction.args.map((item, index) => (
                <tr key={index}>
                  <td className={styles.mono}>{item.name}</td>
                  <td>
                    <code>{item.type}</code>
                  </td>
                  <td className={styles.valueCell}>{item.value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
      {instruction.accounts.length > 0 ? (
        <details className={styles.details}>
          <summary>账户列表（{instruction.accounts.length}）</summary>
          <ul className={styles.accountList}>
            {instruction.accounts.map((account) => (
              <li key={account.index} className={styles.accountItem}>
                <span className={styles.accountLabel}>
                  {account.label ?? `账户 ${account.index}`}
                </span>
                <span className={styles.mono}>{account.pubkey}</span>
                {account.signer ? <Badge tone="primary">签名</Badge> : null}
                {account.writable ? <Badge tone="neutral">可写</Badge> : null}
              </li>
            ))}
          </ul>
        </details>
      ) : null}
      {instruction.note ? <p className={styles.note}>{instruction.note}</p> : null}
      <details className={styles.details}>
        <summary>原始指令数据（{instruction.dataHex.length / 2 - 1} 字节）</summary>
        <pre className={styles.pre}>{instruction.dataHex}</pre>
      </details>
    </div>
  );
}

export default function CalldataDecoder() {
  const [mode, setMode] = useState<Mode>("eth");
  const [input, setInput] = useState("");
  const [error, setError] = useState("");
  const [decimals, setDecimals] = useState(18);
  const [abi, setAbi] = useState("");
  const [programId, setProgramId] = useState("");
  const [encoding, setEncoding] = useState<Encoding>("auto");
  const [idl, setIdl] = useState("");

  const [ethResult, setEthResult] = useState<EthCallResult | null>(null);
  const [ixResult, setIxResult] = useState<SolanaInstructionDataResult | null>(null);
  const [txResult, setTxResult] = useState<SolanaTransactionResult | null>(null);

  const currentMode = MODES.find((item) => item.id === mode) ?? MODES[0];

  const reset = useCallback(() => {
    setError("");
    setEthResult(null);
    setIxResult(null);
    setTxResult(null);
  }, []);

  const switchMode = useCallback(
    (next: Mode) => {
      setMode(next);
      reset();
    },
    [reset]
  );

  const decode = useCallback(() => {
    reset();
    try {
      if (mode === "eth") {
        setEthResult(decodeEthCalldata(input, { decimals, abi }));
      } else if (mode === "sol-instruction") {
        setIxResult(
          decodeSolanaInstructionData(input, { programId, encoding, idl })
        );
      } else {
        setTxResult(decodeSolanaTransaction(input, { encoding, idl }));
      }
    } catch (err) {
      setError((err as Error).message);
    }
  }, [mode, input, decimals, abi, programId, encoding, idl, reset]);

  const loadSample = useCallback(
    (sample: { value: string; programId?: string; decimals?: number }) => {
      setInput(sample.value);
      if (sample.programId !== undefined) {
        setProgramId(sample.programId);
      }
      if (sample.decimals !== undefined) {
        setDecimals(sample.decimals);
      }
      reset();
    },
    [reset]
  );

  const onKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
        event.preventDefault();
        decode();
      }
    },
    [decode]
  );

  const samples: { label: string; sample: { value: string; programId?: string; decimals?: number } }[] =
    mode === "eth"
      ? ETH_SAMPLES.map((item) => ({ label: item.label, sample: item }))
      : mode === "sol-instruction"
      ? SOL_IX_SAMPLES.map((item) => ({ label: item.label, sample: item }))
      : [{ label: SOL_TX_SAMPLE.label, sample: SOL_TX_SAMPLE }];

  const riskCount =
    (ethResult?.risks.length ?? 0) + (txResult?.analysis.risks.length ?? 0) + (ixResult?.analysis.risks.length ?? 0);

  return (
    <Layout
      title="Calldata Decoder"
      description="解码 Ethereum calldata 与 Solana 指令/交易，分析其中的操作与风险"
    >
      <div className={DocRootStyles.docRoot}>
        <PageSidebar sidebar={ToolsSidebarData} path="/tools/blockchain/calldata" />
        <main className={clsx(MainStyles.docMainContainer)}>
          <div className={clsx("container", "padding-top--md", "padding-bottom--lg", styles.page)}>
            <Center>
              <div className={styles.header}>
                <h1 className={styles.title} style={{ marginTop: 16 }}>
                  Calldata Decoder
                </h1>
              </div>
            </Center>

            <p className={styles.subtitle}>
              输入链上调用数据，自动解析函数、参数，并给出可读的操作说明与风险提示。全部在浏览器本地计算，不上传任何数据。
            </p>

            <div className={styles.tabs}>
              {MODES.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className={clsx(styles.tab, item.id === mode && styles.tabActive)}
                  onClick={() => switchMode(item.id)}
                >
                  {item.label}
                </button>
              ))}
            </div>

            <div className={styles.panel}>
              <p className={styles.note} style={{ marginTop: 0 }}>
                {currentMode.hint}
              </p>
              <textarea
                className={styles.textarea}
                value={input}
                onChange={(event) => setInput(event.target.value)}
                onKeyDown={onKeyDown}
                placeholder={
                  mode === "eth"
                    ? "0xa9059cbb000000000000000000000000..."
                    : mode === "sol-instruction"
                    ? "0x0ca02526000000000006"
                    : "4GyuWabqFsR8ZTTW1tXwNUEvqPDyPJnFbpEeAx..."
                }
                spellCheck={false}
                rows={10}
              />

              <div className={styles.samples}>
                <span>示例：</span>
                {samples.map(({ label, sample }) => (
                  <button
                    key={label}
                    type="button"
                    className={styles.chip}
                    onClick={() => loadSample(sample)}
                  >
                    {label}
                  </button>
                ))}
              </div>

              {mode === "eth" ? (
                <>
                  <div className={styles.row}>
                    <label className={styles.field}>
                      代币精度（用于数量换算）
                      <input
                        className={styles.input}
                        type="number"
                        min={0}
                        max={36}
                        value={decimals}
                        onChange={(event) => setDecimals(Number(event.target.value))}
                      />
                    </label>
                    <div className={styles.spacer} />
                    <button type="button" className={clsx(styles.button, styles.buttonPrimary)} onClick={decode}>
                      解码分析
                    </button>
                    <button type="button" className={styles.button} onClick={() => { setInput(""); reset(); }}>
                      清空
                    </button>
                  </div>
                  <details className={styles.details}>
                    <summary>可选：粘贴 ABI JSON 或函数签名（用于识别内置库之外的方法）</summary>
                    <textarea
                      className={styles.textarea}
                      style={{ minHeight: 100, marginTop: 8 }}
                      value={abi}
                      onChange={(event) => setAbi(event.target.value)}
                      placeholder={`[{"type":"function","name":"swap","inputs":[{"name":"amountIn","type":"uint256"}]}]`}
                      spellCheck={false}
                    />
                  </details>
                </>
              ) : (
                <>
                  <div className={styles.row}>
                    {mode === "sol-instruction" ? (
                      <label className={styles.field}>
                        程序 ID（Program ID）
                        <input
                          className={clsx(styles.input, styles.inputMono)}
                          value={programId}
                          onChange={(event) => setProgramId(event.target.value)}
                          placeholder="TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
                          spellCheck={false}
                        />
                      </label>
                    ) : null}
                    <label className={styles.field}>
                      输入编码
                      <select
                        className={styles.select}
                        value={encoding}
                        onChange={(event) => setEncoding(event.target.value as Encoding)}
                      >
                        <option value="auto">自动识别</option>
                        <option value="hex">十六进制</option>
                        <option value="base58">Base58</option>
                        <option value="base64">Base64</option>
                      </select>
                    </label>
                    <div className={styles.spacer} />
                    <button type="button" className={clsx(styles.button, styles.buttonPrimary)} onClick={decode}>
                      解码分析
                    </button>
                    <button type="button" className={styles.button} onClick={() => { setInput(""); reset(); }}>
                      清空
                    </button>
                  </div>
                  <details className={styles.details}>
                    <summary>可选：粘贴 Anchor IDL（解析 DeFi 程序的自定义指令）</summary>
                    <textarea
                      className={styles.textarea}
                      style={{ minHeight: 100, marginTop: 8 }}
                      value={idl}
                      onChange={(event) => setIdl(event.target.value)}
                      placeholder={`{"address":"JUP6Lkb...","instructions":[{"name":"swap","args":[{"name":"amountIn","type":"u64"}]}]}`}
                      spellCheck={false}
                    />
                  </details>
                </>
              )}
            </div>

            {error ? <div className={styles.error}>{error}</div> : null}

            {ethResult ? (
              <div className={styles.card}>
                <div className={styles.cardHeader}>
                  <h2 className={styles.cardTitle}>解码结果</h2>
                  <Badge tone="primary">{ethResult.action}</Badge>
                  {riskCount > 0 ? <Badge tone="warn">{riskCount} 条风险提示</Badge> : null}
                </div>
                <CallCard call={ethResult} decimals={decimals} />
              </div>
            ) : null}

            {ixResult ? (
              <div className={styles.card}>
                <div className={styles.cardHeader}>
                  <h2 className={styles.cardTitle}>指令解码结果</h2>
                  <Badge tone={ixResult.programKnown ? "ok" : "warn"}>{ixResult.programName}</Badge>
                  <Badge tone="neutral">{ixResult.encoding}</Badge>
                  <Badge tone="neutral">{ixResult.byteLength} 字节</Badge>
                  {riskCount > 0 ? <Badge tone="warn">{riskCount} 条风险提示</Badge> : null}
                </div>
                <SolanaInstructionCard instruction={ixResult.instruction} />
                <JsonPanel
                  label="原始 JSON"
                  data={{
                    encoding: ixResult.encoding,
                    byteLength: ixResult.byteLength,
                    programId: ixResult.programId,
                    programName: ixResult.programName,
                    instruction: {
                      name: ixResult.instruction.name,
                      known: ixResult.instruction.known,
                      args: ixResult.instruction.args,
                      summary: ixResult.instruction.summary,
                      data: ixResult.instruction.dataHex,
                      note: ixResult.instruction.note,
                    },
                    analysis: ixResult.analysis,
                  }}
                />
              </div>
            ) : null}

            {txResult ? (
              <div className={styles.card}>
                <div className={styles.cardHeader}>
                  <h2 className={styles.cardTitle}>交易解析结果</h2>
                  <Badge tone="primary">
                    {txResult.version === "legacy" ? "legacy" : `v${txResult.version}`}
                  </Badge>
                  <Badge tone="neutral">{txResult.encoding}</Badge>
                  <Badge tone="neutral">{txResult.instructions.length} 条指令</Badge>
                  {riskCount > 0 ? <Badge tone="warn">{riskCount} 条风险提示</Badge> : null}
                </div>

                <div className={styles.metaGrid}>
                  <div className={styles.metaItem}>
                    <span className={styles.metaLabel}>签名数量</span>
                    <span className={styles.metaValue}>{txResult.signatures.length}</span>
                  </div>
                  <div className={styles.metaItem}>
                    <span className={styles.metaLabel}>账户数量</span>
                    <span className={styles.metaValue}>{txResult.accountKeys.length}</span>
                  </div>
                  <div className={styles.metaItem}>
                    <span className={styles.metaLabel}>Recent Blockhash</span>
                    <span className={styles.metaValue}>{txResult.recentBlockhash}</span>
                  </div>
                  <div className={styles.metaItem}>
                    <span className={styles.metaLabel}>地址查找表</span>
                    <span className={styles.metaValue}>{txResult.addressTableLookups.length}</span>
                  </div>
                </div>

                <Summary lines={txResult.analysis.summary} />
                <RiskList risks={txResult.analysis.risks as RiskNode[]} />
                <Notes notes={txResult.analysis.notes} />

                <div className={styles.tableWrap}>
                  <table className={styles.table}>
                    <thead>
                      <tr>
                        <th>程序</th>
                        <th>指令数</th>
                        <th>Program ID</th>
                      </tr>
                    </thead>
                    <tbody>
                      {txResult.analysis.programs.map((program) => (
                        <tr key={program.id}>
                          <td>{program.name}</td>
                          <td className={styles.tabular}>{program.count}</td>
                          <td className={styles.valueCell}>{program.id}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <details className={styles.details} open>
                  <summary>指令明细（{txResult.instructions.length}）</summary>
                  <div className={styles.children}>
                    {txResult.instructions.map((instruction) => (
                      <SolanaInstructionCard key={instruction.index} instruction={instruction} />
                    ))}
                  </div>
                </details>

                <JsonPanel data={solanaTransactionToJson(txResult)} />
              </div>
            ) : null}

            <div className={styles.card}>
              <h2 className={styles.cardTitle} style={{ fontSize: "1rem" }}>
                说明
              </h2>
              <ul className={styles.summaryList} style={{ marginBottom: 0 }}>
                <li>所有解码在浏览器本地完成，不会把 calldata 发送到任何服务器。</li>
                <li>
                  数量换算依赖你填写的代币精度（默认 18）；原始整数始终在“raw”中展示，NFT tokenId 等场景请忽略换算值。
                </li>
                <li>
                  Solana 交易只能看到指令本身，程序内部的 CPI 调用与日志需要结合链上数据；使用地址查找表（ALT）时部分账户会以占位符显示。
                </li>
                <li>
                  风险提示基于常见模式（无限授权、零滑点、权限变更等）的启发式判断，不能替代完整审计。
                </li>
              </ul>
            </div>
          </div>
        </main>
      </div>
    </Layout>
  );
}
