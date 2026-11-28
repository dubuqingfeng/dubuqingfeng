import {
  CalldataError,
  bytesToHex,
  formatAmount,
  hexToBytes,
  hexWords,
  isHexString,
  readBigIntBE,
  shorten,
} from "../bytes";
import { toChecksumAddress } from "../crypto";
import {
  decodeParams,
  findAddress,
  findAddressArray,
  findArray,
  findBool,
  findBytes,
  findString,
  findTuple,
  findUint,
  isEmptyAddress,
  measureParams,
  paramsToJson,
  parseParamList,
  valueToString,
  type DecodedParam,
  type DecodedValue,
} from "./abi";
import {
  defsFromUserInput,
  ETH_FUNCTION_BY_SELECTOR,
  type EthFunctionDef,
} from "./functions";

export type RiskLevel = "info" | "low" | "medium" | "high";

export interface EthRisk {
  level: RiskLevel;
  title: string;
  detail?: string;
}

export interface EthChildCall {
  label: string;
  summary?: string[];
  risks?: EthRisk[];
  call?: EthCallResult;
  raw?: string;
  error?: string;
}

export interface EthWord {
  index: number;
  hex: string;
  uint: string;
  address?: string;
}

export interface EthCallResult {
  selector: string;
  signature?: string;
  name?: string;
  category: string;
  action: string;
  known: boolean;
  params: DecodedParam[];
  summary: string[];
  risks: EthRisk[];
  notes: string[];
  children: EthChildCall[];
  words?: EthWord[];
  error?: string;
  calldata: string;
  args: string;
  extraBytes?: number;
}

export interface EthDecodeOptions {
  /** 代币精度，用于数量换算显示，默认 18 */
  decimals?: number;
  /** 可选：ABI JSON 或函数签名文本，用于识别内置库之外的方法 */
  abi?: string;
  /** 当前时间（秒），用于判断 deadline */
  now?: number;
}

interface DecodeContext {
  decimals: number;
  now: number;
  extra: Record<string, EthFunctionDef>;
}

const MAX_DEPTH = 3;
const MAX_CHILDREN = 24;
const INFINITE_APPROVAL = 1n << 255n;

const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

function buildContext(options: EthDecodeOptions): DecodeContext {
  const extra: Record<string, EthFunctionDef> = {};
  if (options.abi && options.abi.trim()) {
    for (const def of defsFromUserInput(options.abi)) {
      const key = def.selector.toLowerCase();
      if (!extra[key]) {
        extra[key] = def;
      }
    }
  }
  return {
    decimals: Number.isFinite(options.decimals) ? Number(options.decimals) : 18,
    now: options.now ?? Math.floor(Date.now() / 1000),
    extra,
  };
}

function emptyCallResult(): EthCallResult {
  return {
    selector: "0x",
    category: "Other",
    action: "空 calldata",
    known: false,
    params: [],
    summary: [
      "没有 calldata：这是一笔纯 ETH 转账，或调用了没有参数的 fallback / receive 函数。",
    ],
    risks: [],
    notes: [],
    children: [],
    calldata: "0x",
    args: "0x",
  };
}

function heuristicWords(args: Uint8Array): EthWord[] {
  return hexWords(args).map((hex, index) => {
    const value = BigInt(`0x${hex}`);
    const isAddressLike = /^0{24}/.test(hex);
    return {
      index,
      hex: `0x${hex}`,
      uint: value.toString(),
      address: isAddressLike ? toChecksumAddress(`0x${hex.slice(24)}`) : undefined,
    };
  });
}

export function decodeEthCalldata(
  input: string,
  options: EthDecodeOptions = {}
): EthCallResult {
  const text = input.trim();
  if (!text || /^0x$/i.test(text)) {
    return emptyCallResult();
  }
  if (!isHexString(text)) {
    throw new CalldataError(
      "Ethereum calldata 必须是十六进制字符串（可以带 0x 前缀），请不要粘贴序列化后的完整交易。"
    );
  }
  const bytes = hexToBytes(text);
  if (bytes.length === 0) {
    return emptyCallResult();
  }
  if (bytes.length < 4) {
    return {
      ...emptyCallResult(),
      selector: bytesToHex(bytes),
      action: "数据过短",
      summary: [
        `只有 ${bytes.length} 字节，不足以构成 4 字节函数选择器，可能是自定义格式或截断的数据。`,
      ],
    };
  }
  return decodeCallBytes(bytes, buildContext(options), 0);
}

function decodeCallBytes(
  bytes: Uint8Array,
  ctx: DecodeContext,
  depth: number
): EthCallResult {
  if (bytes.length === 0) {
    return emptyCallResult();
  }
  const selector = bytesToHex(bytes.slice(0, 4)).toLowerCase();
  const args = bytes.slice(4);
  const def = ctx.extra[selector] ?? ETH_FUNCTION_BY_SELECTOR[selector];

  if (!def) {
    return {
      selector,
      category: "Other",
      action: "未识别的方法",
      known: false,
      params: [],
      summary: [
        `选择器 ${selector} 不在内置函数库中，无法确定参数类型。`,
        args.length > 0
          ? `已按 32 字节字（word）列出 ${Math.floor(args.length / 32)} 个原始数据块，供人工判读。`
          : "该调用没有附带参数数据。",
      ],
      risks: [
        {
          level: "info",
          title: "未知方法",
          detail: "可以在“ABI / 函数签名”里粘贴 ABI，用真实类型重新解码。",
        },
      ],
      notes: [],
      children: [],
      words: heuristicWords(args),
      calldata: bytesToHex(bytes),
      args: bytesToHex(args),
    };
  }

  const result: EthCallResult = {
    selector,
    signature: def.signature,
    name: def.name,
    category: def.category,
    action: def.action,
    known: true,
    params: [],
    summary: [],
    risks: [],
    notes: def.note ? [def.note] : [],
    children: [],
    calldata: bytesToHex(bytes),
    args: bytesToHex(args),
  };

  try {
    result.params = decodeParams(def.params, args);
  } catch (err) {
    result.error = (err as Error).message;
    result.words = heuristicWords(args);
    result.summary = [`已识别方法 ${def.signature}，但参数解码失败：${result.error}`];
    result.risks.push({
      level: "medium",
      title: "参数与 ABI 不匹配",
      detail: "实际数据长度或布局和该函数签名不一致，请确认选择器是否对应正确的合约。",
    });
    return result;
  }

  try {
    const consumed = measureParams(def.params, args);
    const extraBytes = args.length - consumed;
    if (extraBytes > 0) {
      result.extraBytes = extraBytes;
      result.notes.push(
        `calldata 末尾有 ${extraBytes} 字节未被 ABI 解析，可能附加了隐藏数据（需重点核查）。`
      );
      result.risks.push({
        level: "medium",
        title: "存在未解析的尾部数据",
        detail: "函数参数之外还有额外字节，这在正常调用中不会出现。",
      });
    }
  } catch {
    // 长度测量失败不影响主流程
  }

  const analysis = analyzeCall(def, result.params, ctx, depth);
  result.summary = analysis.summary;
  result.risks.push(...analysis.risks);
  result.notes.push(...analysis.notes);
  result.children = analysis.children;
  return result;
}

interface Analysis {
  summary: string[];
  risks: EthRisk[];
  notes: string[];
  children: EthChildCall[];
}

function analyzeCall(
  def: EthFunctionDef,
  params: DecodedParam[],
  ctx: DecodeContext,
  depth: number
): Analysis {
  const summary: string[] = [];
  const risks: EthRisk[] = [];
  const notes: string[] = [];
  const children: EthChildCall[] = [];

  const fmt = (value?: bigint, decimals = ctx.decimals): string =>
    value === undefined ? "?" : formatAmount(value, decimals, 8);
  const fmtEth = (value?: bigint): string =>
    value === undefined ? "?" : `${formatAmount(value, 18, 9)} ETH`;

  const to = findAddress(params, "to") ?? findAddress(params, "recipient");
  const path = findAddressArray(params, "path");
  const deadline = findUint(params, "deadline");
  const amountIn = findUint(params, "amountIn");
  const amountOutMin = findUint(params, "amountOutMin");
  const amountOut = findUint(params, "amountOut");
  const amountInMax = findUint(params, "amountInMax");

  const checkDeadline = (value?: bigint): void => {
    if (value === undefined) {
      return;
    }
    if (value === 0n) {
      risks.push({
        level: "low",
        title: "deadline 为 0",
        detail: "部分协议把 0 视为不过期，也可能直接导致交易失败。",
      });
    } else if (value < BigInt(ctx.now)) {
      risks.push({
        level: "medium",
        title: "deadline 已过期",
        detail: `参数中的截止时间为 ${new Date(Number(value) * 1000).toLocaleString("zh-CN")}，交易会回滚。`,
      });
    }
  };

  const checkSlippage = (minOut?: bigint): void => {
    if (minOut === 0n) {
      risks.push({
        level: "medium",
        title: "没有滑点保护",
        detail: "amountOutMin = 0，任何价格成交都算成功，容易被三明治攻击。",
      });
    }
  };

  const checkRecipient = (): void => {
    if (to && isEmptyAddress(to)) {
      risks.push({
        level: "high",
        title: "接收地址为零地址",
        detail: "资产将永久锁死。",
      });
    }
  };

  if (path.length >= 2) {
    summary.push(`路径：${path.map((address) => shorten(address)).join(" → ")}`);
  }

  switch (def.name) {
    case "transfer": {
      const asset = findUint(params, "amount");
      summary.unshift(`代币转账：${fmt(asset)} → ${to ?? "?"}`);
      checkRecipient();
      if (asset === 0n) {
        risks.push({ level: "low", title: "转账金额为 0", detail: "常见于地址投毒/钓鱼测试交易。" });
      }
      break;
    }
    case "transferFrom": {
      if (def.category === "Permit2") {
        const token = findAddress(params, "token");
        summary.unshift(
          `Permit2 划转 ${shorten(token ?? "?")}：${shorten(findAddress(params, "from") ?? "?")} → ${shorten(
            to ?? "?"
          )}，数量 ${fmt(findUint(params, "amount"))}`
        );
        break;
      }
      const from = findAddress(params, "from");
      const value = findUint(params, "value");
      summary.unshift(`代扣转账：${shorten(from ?? "?")} → ${shorten(to ?? "?")}，数量 ${fmt(value)}`);
      if (from && to && from.toLowerCase() === to.toLowerCase()) {
        notes.push("from 与 to 相同时，交易通常只是触发一次特殊的转账回调。");
      }
      break;
    }
    case "approve": {
      if (def.category === "Permit2") {
        const token = findAddress(params, "token");
        const spender = findAddress(params, "spender");
        const permit2Amount = findUint(params, "amount");
        const expiration = findUint(params, "expiration");
        summary.unshift(
          `Permit2 授权：${shorten(token ?? "?")} 允许 ${shorten(spender ?? "?")} 使用 ${fmt(permit2Amount)}`
        );
        if (expiration !== undefined && expiration !== 0n) {
          summary.push(`到期时间：${new Date(Number(expiration) * 1000).toLocaleString("zh-CN")}`);
        }
        if (permit2Amount !== undefined && permit2Amount >= (1n << 160n) - 1n) {
          risks.push({
            level: "high",
            title: "Permit2 无限授权",
            detail: "uint160 上限意味着该 spender 可以划转你在 Permit2 中存入的全部该代币。",
          });
        }
        break;
      }
      const spender = findAddress(params, "spender");
      const amount = findUint(params, "amount");
      const unlimited = amount !== undefined && amount >= INFINITE_APPROVAL;
      summary.unshift(
        unlimited
          ? `授权 ${shorten(spender ?? "?")} 无限额度（uint256 上限附近）`
          : `授权 ${shorten(spender ?? "?")} 可支配 ${fmt(amount)}`
      );
      if (unlimited) {
        risks.push({
          level: "high",
          title: "无限授权（Unlimited Approval）",
          detail:
            "被授权地址可以在你不再操作的情况下转走该代币的全部余额。若金额接近 2^256-1，请确认对方是否可信。",
        });
      }
      if (spender && isEmptyAddress(spender)) {
        risks.push({ level: "high", title: "授权给零地址", detail: "额度无人可用，通常是配置错误。" });
      }
      if (amount !== undefined && amount < 1_000_000n) {
        notes.push(
          "数值很小：如果这是 ERC-721 合约，第二个参数实际是 tokenId（approve(address,uint256) 选择器与 ERC-20 相同）。"
        );
      }
      break;
    }
    case "increaseAllowance":
    case "decreaseAllowance": {
      const spender = findAddress(params, "spender");
      const delta =
        findUint(params, "addedValue") ?? findUint(params, "subtractedValue");
      summary.unshift(
        `${def.name === "increaseAllowance" ? "增加" : "减少"} ${shorten(spender ?? "?")} 的授权额度 ${fmt(delta)}`
      );
      break;
    }
    case "permit": {
      const permitSingle = findTuple(params, "permitSingle");
      if (permitSingle) {
        const details = permitSingle.find((field) => field.name === "details");
        const detailFields = details && details.value.kind === "tuple" ? details.value.fields : permitSingle;
        summary.unshift(
          `Permit2 离线授权：${shorten(findAddress(detailFields, "token") ?? "?")} → ${shorten(
            findAddress(permitSingle, "spender") ?? "?"
          )}，数量 ${fmt(findUint(detailFields, "amount"))}`
        );
        const sigDeadline = findUint(permitSingle, "sigDeadline");
        if (sigDeadline !== undefined) {
          summary.push(`签名截止：${new Date(Number(sigDeadline) * 1000).toLocaleString("zh-CN")}`);
        }
        notes.push("Permit2 permit：签名一旦上链即可被任意第三方代为提交。");
        break;
      }
      const owner = findAddress(params, "owner");
      const spender = findAddress(params, "spender");
      const value = findUint(params, "value");
      const permitDeadline = findUint(params, "deadline");
      summary.unshift(
        `离线授权：${shorten(owner ?? "?")} 允许 ${shorten(spender ?? "?")} 使用 ${fmt(value)}`
      );
      checkDeadline(permitDeadline);
      notes.push("EIP-2612 permit：授权通过签名写入，任何持有该签名的人都可以代为提交。");
      break;
    }
    case "setApprovalForAll": {
      const operator = findAddress(params, "operator");
      const approved = findBool(params, "approved");
      summary.unshift(
        approved
          ? `批量授权：${shorten(operator ?? "?")} 可操作你的全部 NFT`
          : `撤销 ${shorten(operator ?? "?")} 的批量 NFT 授权`
      );
      if (approved) {
        risks.push({
          level: "high",
          title: "全量 NFT 授权",
          detail: "被授权方可以转走你持有的该集合中所有 NFT，包括之后买入的。",
        });
      }
      break;
    }
    case "safeTransferFrom": {
      const from = findAddress(params, "from");
      const tokenId = findUint(params, "tokenId");
      const id = findUint(params, "id");
      const amount = findUint(params, "amount");
      if (id !== undefined) {
        summary.unshift(
          `转移 ERC-1155 资产 id=${id.toString()} 数量 ${fmt(amount)}：${shorten(from ?? "?")} → ${shorten(to ?? "?")}`
        );
      } else {
        summary.unshift(`转移 NFT #${tokenId?.toString() ?? "?"}：${shorten(from ?? "?")} → ${shorten(to ?? "?")}`);
      }
      checkRecipient();
      break;
    }
    case "safeBatchTransferFrom": {
      const ids = findArray(params, "ids") ?? [];
      const amounts = findArray(params, "amounts") ?? [];
      const from = findAddress(params, "from");
      summary.unshift(
        `批量转移 ${ids.length} 种 ERC-1155 资产：${shorten(from ?? "?")} → ${shorten(to ?? "?")}`
      );
      if (ids.length !== amounts.length) {
        risks.push({
          level: "medium",
          title: "ids 与 amounts 长度不一致",
          detail: "标准实现会直接回滚，可能是构造异常的交易。",
        });
      }
      break;
    }
    case "deposit": {
      const assets = findUint(params, "assets");
      const receiver = findAddress(params, "receiver");
      if (assets === undefined) {
        summary.unshift("包装 ETH：把随交易附带的 ETH 换成 WETH");
        notes.push("实际数量取决于交易的 msg.value，需要结合交易 value 字段。");
      } else {
        summary.unshift(`ERC-4626 存入 ${fmt(assets)}，份额接收人 ${shorten(receiver ?? "?")}`);
      }
      break;
    }
    case "withdraw": {
      const wad = findUint(params, "wad");
      const assets = findUint(params, "assets");
      if (wad !== undefined) {
        summary.unshift(`解包 WETH：取回 ${fmtEth(wad)}`);
      } else if (assets !== undefined) {
        summary.unshift(`取款 ${fmt(assets)} 给 ${shorten(to ?? findAddress(params, "receiver") ?? "?")}`);
      } else if (findUint(params, "amount") !== undefined) {
        summary.unshift(
          `取款 ${fmt(findUint(params, "amount"))} ${shorten(findAddress(params, "asset") ?? "?")} 给 ${
            to ?? "?"
          }`
        );
      }
      break;
    }
    case "redeem": {
      const shares = findUint(params, "shares");
      summary.unshift(`赎回 ${fmt(shares)} 份额`);
      break;
    }
    case "mint": {
      const shares = findUint(params, "shares");
      const toAddr = findAddress(params, "to");
      if (shares !== undefined) {
        summary.unshift(`铸造 ${fmt(shares)} 份额`);
      } else {
        summary.unshift(`增发代币 ${fmt(findUint(params, "amount"))} → ${shorten(toAddr ?? "?")}`);
      }
      break;
    }
    case "burn":
    case "burnFrom": {
      summary.unshift(`销毁 ${fmt(findUint(params, "amount"))} 代币`);
      break;
    }
    case "submit": {
      summary.unshift("质押 ETH（Lido submit），提交数量取自交易的 value 字段");
      notes.push("calldata 中不包含质押数量，需结合交易的 value 判断。");
      break;
    }
    case "wrap":
    case "unwrap": {
      summary.unshift(
        `${def.name === "wrap" ? "包装" : "解包"} ${fmt(findUint(params, "amount"))}`
      );
      break;
    }
    case "exactInputSingle":
    case "exactOutputSingle": {
      const tuple = findTuple(params, "params") ?? params;
      const tokenIn = findAddress(tuple, "tokenIn");
      const tokenOut = findAddress(tuple, "tokenOut");
      const fee = findUint(tuple, "fee");
      const recipient = findAddress(tuple, "recipient");
      const innerAmountIn = findUint(tuple, "amountIn");
      const innerOutMin = findUint(tuple, "amountOutMinimum");
      const innerAmountOut = findUint(tuple, "amountOut");
      const innerInMax = findUint(tuple, "amountInMaximum");
      const innerDeadline = findUint(tuple, "deadline");
      summary.unshift(
        `V3 单池兑换 ${shorten(tokenIn ?? "?")} → ${shorten(tokenOut ?? "?")}（费率 ${
          fee === undefined ? "?" : `${Number(fee) / 10000}%`
        }）`
      );
      if (def.name === "exactInputSingle") {
        summary.push(`输入 ${fmt(innerAmountIn)}，最少得到 ${fmt(innerOutMin)}`);
        checkSlippage(innerOutMin);
      } else {
        summary.push(`输出 ${fmt(innerAmountOut)}，最多支付 ${fmt(innerInMax)}`);
      }
      summary.push(`接收地址：${recipient ?? "?"}`);
      checkDeadline(innerDeadline);
      const priceLimit = findUint(tuple, "sqrtPriceLimitX96");
      if (priceLimit !== undefined && priceLimit !== 0n) {
        notes.push("设置了 sqrtPriceLimitX96（限价单式调用），价格会在此处截断。");
      }
      break;
    }
    case "exactInput":
    case "exactOutput": {
      const tuple = findTuple(params, "params") ?? params;
      const packedPath = findBytes(tuple, "path");
      const recipient = findAddress(tuple, "recipient");
      const innerDeadline = findUint(tuple, "deadline");
      const decodedPath = packedPath ? decodeV3Path(packedPath) : null;
      if (decodedPath) {
        summary.push(`路径：${formatV3Path(decodedPath)}`);
      }
      if (def.name === "exactInput") {
        summary.unshift(
          `V3 多池兑换：输入 ${fmt(findUint(tuple, "amountIn"))}，最少得到 ${fmt(
            findUint(tuple, "amountOutMinimum")
          )}`
        );
        checkSlippage(findUint(tuple, "amountOutMinimum"));
      } else {
        summary.unshift(
          `V3 多池兑换：输出 ${fmt(findUint(tuple, "amountOut"))}，最多支付 ${fmt(
            findUint(tuple, "amountInMaximum")
          )}`
        );
      }
      summary.push(`接收地址：${recipient ?? "?"}`);
      checkDeadline(innerDeadline);
      break;
    }
    case "multicall":
    case "aggregate":
    case "aggregate3": {
      const calls = findArray(params, "data");
      const tuples = findArray(params, "calls") ?? findArray(params, "data");
      summary.unshift(
        `批量调用：共 ${
          (tuples ?? calls ?? []).length
        } 条子调用，下面逐条解码`
      );
      if (depth >= MAX_DEPTH) {
        risks.push({
          level: "low",
          title: "嵌套层级过深",
          detail: "为避免无限递归，更深的子调用没有继续展开。",
        });
        break;
      }
      const items = tuples ?? calls ?? [];
      items.slice(0, MAX_CHILDREN).forEach((item, index) => {
        if (def.name === "multicall") {
          const raw = item.kind === "bytes" ? item.value : undefined;
          if (!raw) {
            return;
          }
          try {
            children.push({
              label: `#${index} 子调用 ${bytesToHex(raw.slice(0, 4))}`,
              call: decodeCallBytes(raw, ctx, depth + 1),
            });
          } catch (err) {
            children.push({
              label: `#${index} 子调用`,
              error: (err as Error).message,
              raw: bytesToHex(raw),
            });
          }
          return;
        }
        if (item.kind !== "tuple") {
          return;
        }
        const target = item.fields.find((field) => field.name === "target");
        const callData = item.fields.find((field) => field.name === "callData");
        const targetAddress = target?.value.kind === "address" ? target.value.value : "?";
        const payload = callData?.value.kind === "bytes" ? callData.value.value : undefined;
        const allowFailureField = item.fields.find((field) => field.name === "allowFailure");
        const allowFailure =
          allowFailureField && allowFailureField.value.kind === "bool"
            ? allowFailureField.value.value
            : undefined;
        const label = `#${index} → ${targetAddress}${allowFailure ? "（允许失败）" : ""}`;
        if (!payload || payload.length === 0) {
          children.push({ label: `${label} 纯 ETH 转账` });
        } else {
          try {
            children.push({ label, call: decodeCallBytes(payload, ctx, depth + 1) });
          } catch (err) {
            children.push({ label, error: (err as Error).message, raw: bytesToHex(payload) });
          }
        }
      });
      break;
    }
    case "execute": {
      const commands = findBytes(params, "commands");
      const inputs = findArray(params, "inputs") ?? [];
      if (!commands) {
        break;
      }
      summary.unshift(`Universal Router 批量执行：${commands.length} 条命令`);
      children.push(...decodeUniversalRouter(commands, inputs, ctx));
      checkDeadline(findUint(params, "deadline"));
      break;
    }
    case "swap": {
      const desc = findTuple(params, "desc");
      const srcToken = desc ? findAddress(desc, "srcToken") : undefined;
      const dstToken = desc ? findAddress(desc, "dstToken") : undefined;
      const amount = desc ? findUint(desc, "amount") : undefined;
      const minReturn = desc ? findUint(desc, "minReturnAmount") : undefined;
      const receiver = desc ? findAddress(desc, "dstReceiver") : undefined;
      summary.unshift(
        `聚合兑换 ${shorten(srcToken ?? "?")} → ${shorten(dstToken ?? "?")}，数量 ${fmt(amount)}`
      );
      summary.push(`最少获得 ${fmt(minReturn)}，接收地址 ${receiver ?? "?"}`);
      checkSlippage(minReturn);
      break;
    }
    case "execTransaction": {
      const operation = findUint(params, "operation");
      const data = findBytes(params, "data");
      const value = findUint(params, "value");
      summary.unshift(`Safe 多签执行 → ${to ?? "?"}，附带 ${fmtEth(value)}`);
      if (operation === 1n) {
        risks.push({
          level: "high",
          title: "DELEGATECALL 执行",
          detail: "内层调用以 Safe 自身的存储上下文执行，可以修改 Safe 的所有者/模块配置。",
        });
      }
      if (data && data.length >= 4) {
        try {
          children.push({
            label: `内层调用 ${shorten(to ?? "?")}`,
            call: decodeCallBytes(data, ctx, depth + 1),
          });
        } catch (err) {
          children.push({ label: "内层调用", error: (err as Error).message, raw: bytesToHex(data) });
        }
      } else if (value !== undefined && value > 0n) {
        summary.push("内层没有 calldata，这是一笔单纯的 ETH 转账。");
      }
      break;
    }
    case "execTransactionFromModule": {
      summary.unshift(`模块执行交易 → ${to ?? "?"}`);
      const data = findBytes(params, "data");
      if (data && data.length >= 4) {
        try {
          children.push({ label: `内层调用 ${shorten(to ?? "?")}`, call: decodeCallBytes(data, ctx, depth + 1) });
        } catch (err) {
          children.push({ label: "内层调用", error: (err as Error).message });
        }
      }
      break;
    }
    case "multiSend": {
      const packed = findBytes(params, "transactions");
      if (!packed) {
        break;
      }
      const txs = decodeMultiSend(packed);
      summary.unshift(`Safe MultiSend：打包了 ${txs.length} 笔交易`);
      txs.slice(0, MAX_CHILDREN).forEach((tx, index) => {
        const label = `#${index} ${tx.operation === 1 ? "DELEGATECALL" : "CALL"} → ${shorten(tx.to)}`;
        if (tx.operation === 1) {
          risks.push({
            level: "high",
            title: "MultiSend 中含 DELEGATECALL",
            detail: "打包的调用可以改写 Safe 自身状态（例如替换实现或所有者）。",
          });
        }
        if (tx.data.length === 0) {
          children.push({ label: `${label}，附带 ${fmtEth(tx.value)}` });
          return;
        }
        try {
          children.push({ label, call: decodeCallBytes(tx.data, ctx, depth + 1) });
        } catch (err) {
          children.push({ label, error: (err as Error).message, raw: bytesToHex(tx.data) });
        }
      });
      break;
    }
    case "addOwnerWithThreshold":
    case "removeOwner":
    case "changeThreshold":
    case "enableModule": {
      summary.unshift(`${def.action}：${findAddress(params, "owner") ?? findAddress(params, "module") ?? "?"}`);
      risks.push({
        level: "high",
        title: "多签控制权变更",
        detail: "该调用会改变谁能控制这个 Safe，务必核对签名人。",
      });
      break;
    }
    case "transferOwnership":
    case "renounceOwnership": {
      summary.unshift(
        def.name === "transferOwnership"
          ? `合约所有权转移给 ${findAddress(params, "newOwner") ?? "?"}`
          : "放弃合约所有权（不可逆）"
      );
      risks.push({
        level: "medium",
        title: "所有权变更",
        detail: "只有合约 owner 才能执行，若你是普通用户，说明调用目标可能被伪造。",
      });
      break;
    }
    case "upgradeTo":
    case "upgradeToAndCall": {
      summary.unshift(`代理合约升级实现 → ${findAddress(params, "newImplementation") ?? "?"}`);
      risks.push({
        level: "high",
        title: "合约实现升级",
        detail: "升级后逻辑完全改变，是新实现地址可以任意处置用户资产的高风险操作。",
      });
      break;
    }
    case "supply":
    case "borrow":
    case "repay": {
      const asset = findAddress(params, "asset");
      summary.unshift(`${def.action}：${fmt(findUint(params, "amount"))} ${shorten(asset ?? "?")}`);
      if (def.name === "borrow") {
        const mode = findUint(params, "interestRateMode");
        summary.push(`利率模式：${mode === 1n ? "稳定利率" : mode === 2n ? "浮动利率" : mode?.toString() ?? "?"}`);
        risks.push({
          level: "medium",
          title: "产生借贷头寸",
          detail: "借款会以存入的抵押品作担保，价格波动可能触发清算。",
        });
      }
      break;
    }
    case "flashLoanSimple": {
      summary.unshift(
        `闪电贷 ${fmt(findUint(params, "amount"))} ${shorten(findAddress(params, "asset") ?? "?")}`
      );
      notes.push("闪电贷必须在同一笔交易内归还，因此通常伴随复杂的嵌套调用。");
      break;
    }
    case "delegate": {
      summary.unshift(`委托投票权给 ${findAddress(params, "delegatee") ?? "?"}`);
      break;
    }
    case "castVote": {
      const support = findUint(params, "support");
      const label = support === 0n ? "反对" : support === 1n ? "赞成" : support === 2n ? "弃权" : "未知";
      summary.unshift(
        `治理投票：提案 ${findUint(params, "proposalId")?.toString() ?? "?"}，${label}`
      );
      break;
    }
    case "propose": {
      const targets = findAddressArray(params, "targets");
      summary.unshift(`发起治理提案，包含 ${targets.length} 个调用目标`);
      break;
    }
    case "unwrapWETH9": {
      summary.unshift(`解包 ${fmtEth(findUint(params, "amountMinimum"))} 给 ${findAddress(params, "recipient") ?? "?"}`);
      break;
    }
    case "wrapETH": {
      summary.unshift(`包装 ${fmtEth(findUint(params, "amount"))}`);
      break;
    }
    case "sweepToken": {
      summary.unshift(`扫走 ${shorten(findAddress(params, "token") ?? "?")} 至少 ${fmt(findUint(params, "amountMinimum"))}`);
      break;
    }
    case "refundETH": {
      summary.unshift("退还交易中剩余的 ETH");
      break;
    }
    case "swapExactTokensForTokens":
    case "swapExactTokensForTokensSupportingFeeOnTransferTokens":
    case "swapExactETHForTokens":
    case "swapExactETHForTokensSupportingFeeOnTransferTokens":
    case "swapExactTokensForETH":
    case "swapExactTokensForETHSupportingFeeOnTransferTokens":
    case "swapTokensForExactTokens":
    case "swapTokensForExactETH":
    case "swapETHForExactTokens": {
      const sellingEth = def.name.includes("ETHFor") || def.name.includes("ETHForTokens");
      const exactIn = !def.name.startsWith("swapTokensForExact") && !def.name.startsWith("swapETHForExact");
      if (exactIn) {
        summary.unshift(
          `Swap ${sellingEth ? "ETH（数量取自交易 value）" : fmt(amountIn)} → 最少得到 ${fmt(
            amountOutMin
          )}`
        );
        checkSlippage(amountOutMin);
      } else {
        summary.unshift(
          `Swap 换取 ${fmt(amountOut)} → 最多支付 ${fmt(amountInMax)}`
        );
      }
      summary.push(`接收地址：${to ?? "?"}`);
      checkDeadline(deadline);
      checkRecipient();
      if (def.name.includes("SupportingFeeOnTransferTokens")) {
        notes.push("该变体支持带转账税的代币，实际到账金额可能与返回值略有差异。");
      }
      break;
    }
    case "addLiquidity":
    case "addLiquidityETH": {
      const tokenA = findAddress(params, "tokenA") ?? findAddress(params, "token");
      const tokenB = findAddress(params, "tokenB");
      summary.unshift(
        `添加流动性 ${shorten(tokenA ?? "?")}${tokenB ? ` + ${shorten(tokenB)}` : " + ETH"}`
      );
      summary.push(
        `期望数量 ${fmt(findUint(params, "amountADesired") ?? findUint(params, "amountTokenDesired"))}${
          tokenB ? ` / ${fmt(findUint(params, "amountBDesired"))}` : " + ETH（取自 value）"
        }`
      );
      checkDeadline(deadline);
      break;
    }
    case "removeLiquidity":
    case "removeLiquidityETH": {
      summary.unshift(`移除流动性 ${fmt(findUint(params, "liquidity"))}`);
      checkDeadline(deadline);
      break;
    }
    default: {
      if (def.category === "Permit2") {
        const token = findAddress(params, "token");
        const spender = findAddress(params, "spender");
        const amount = findUint(params, "amount");
        const expiration = findUint(params, "expiration");
        summary.unshift(
          `Permit2：${shorten(token ?? "?")} 授权 ${shorten(spender ?? "?")} ${fmt(amount)}`
        );
        if (expiration !== undefined && expiration !== 0n) {
          summary.push(`授权到期时间：${new Date(Number(expiration) * 1000).toLocaleString("zh-CN")}`);
        }
        if (amount !== undefined && amount >= INFINITE_APPROVAL) {
          risks.push({
            level: "high",
            title: "Permit2 无限授权",
            detail: "Permit2 授权会覆盖该代币的全部额度，需确认 spender 可信。",
          });
        }
        break;
      }
      summary.unshift(`调用 ${def.signature}`);
      notes.push("该函数不在内置分析规则内，参数已按 ABI 完整解码，请参考参数明细。");
      break;
    }
  }

  return { summary, risks, notes, children };
}

// ---------------------------------------------------------------- Universal Router

const UR_COMMAND_NAMES: Record<number, string> = {
  0x00: "V3_SWAP_EXACT_IN",
  0x01: "V3_SWAP_EXACT_OUT",
  0x02: "PERMIT2_TRANSFER_FROM",
  0x03: "PERMIT2_PERMIT_BATCH",
  0x04: "SWEEP",
  0x05: "TRANSFER",
  0x06: "PAY_PORTION",
  0x08: "V2_SWAP_EXACT_IN",
  0x09: "V2_SWAP_EXACT_OUT",
  0x0a: "PERMIT2_PERMIT",
  0x0b: "WRAP_ETH",
  0x0c: "UNWRAP_WETH",
  0x0d: "PERMIT2_TRANSFER_FROM_BATCH",
  0x0e: "BALANCE_CHECK_ERC20",
  0x0f: "V4_SWAP",
  0x10: "V3_POSITION_MANAGER_PERMIT",
  0x11: "V3_POSITION_MANAGER_CALL",
  0x12: "V4_INITIALIZE_POOL",
  0x13: "V4_POSITION_MANAGER_CALL",
};

const UR_COMMAND_INPUTS: Record<number, string> = {
  0x00: "recipient:address, amountIn:uint256, amountOutMin:uint256, path:bytes, payerIsUser:bool",
  0x01: "recipient:address, amountOut:uint256, amountInMax:uint256, path:bytes, payerIsUser:bool",
  0x02: "token:address, recipient:address, amount:uint160",
  0x04: "token:address, recipient:address, amountMin:uint256",
  0x05: "token:address, recipient:address, amount:uint256",
  0x06: "token:address, recipient:address, bips:uint256",
  0x08: "recipient:address, amountIn:uint256, amountOutMin:uint256, path:address[], payerIsUser:bool",
  0x09: "recipient:address, amountOut:uint256, amountInMax:uint256, path:address[], payerIsUser:bool",
  0x0b: "recipient:address, amount:uint256",
  0x0c: "recipient:address, amountMin:uint256",
  0x0e: "owner:address, token:address, minBalance:uint256",
};

function decodeUniversalRouter(
  commands: Uint8Array,
  inputs: DecodedValue[],
  ctx: DecodeContext
): EthChildCall[] {
  const children: EthChildCall[] = [];
  for (let i = 0; i < commands.length && children.length < MAX_CHILDREN; i += 1) {
    const raw = commands[i];
    const allowRevert = (raw & 0x80) !== 0;
    const command = raw & 0x3f;
    const name = UR_COMMAND_NAMES[command] ?? `UNKNOWN_CMD_0x${command.toString(16)}`;
    const label = `#${i} ${name}${allowRevert ? "（允许失败）" : ""}`;
    const input = inputs[i];
    if (!input || input.kind !== "bytes") {
      children.push({ label, error: "缺少对应的 inputs 数据" });
      continue;
    }
    const spec = UR_COMMAND_INPUTS[command];
    if (!spec) {
      children.push({ label, raw: bytesToHex(input.value) });
      continue;
    }
    try {
      const fields = decodeParams(parseParamList(spec), input.value);
      children.push({ label, ...describeUrCommand(command, fields, ctx) });
    } catch (err) {
      children.push({ label, error: (err as Error).message, raw: bytesToHex(input.value) });
    }
  }
  return children;
}

function describeUrCommand(
  command: number,
  fields: DecodedParam[],
  ctx: DecodeContext
): { summary: string[]; risks: EthRisk[] } {
  const summary: string[] = [];
  const risks: EthRisk[] = [];
  const recipient = findAddress(fields, "recipient");
  const token = findAddress(fields, "token");
  const amount = findUint(fields, "amount");
  const amountIn = findUint(fields, "amountIn");
  const amountOutMin = findUint(fields, "amountOutMin");
  const amountOut = findUint(fields, "amountOut");
  const amountInMax = findUint(fields, "amountInMax");
  const amountMin = findUint(fields, "amountMin");
  const packedPath = findBytes(fields, "path");
  const addressPath = findAddressArray(fields, "path");
  const fmt = (value?: bigint): string =>
    value === undefined ? "?" : formatAmount(value, ctx.decimals, 8);

  if (command === 0x00 || command === 0x01) {
    const decoded = packedPath ? decodeV3Path(packedPath) : null;
    if (decoded) {
      summary.push(`路径：${formatV3Path(decoded)}`);
    }
    if (command === 0x00) {
      summary.unshift(`V3 兑换：输入 ${fmt(amountIn)}，最少得到 ${fmt(amountOutMin)}`);
      if (amountOutMin === 0n) {
        risks.push({
          level: "medium",
          title: "没有滑点保护",
          detail: "amountOutMin = 0，容易被三明治攻击。",
        });
      }
    } else {
      summary.unshift(`V3 兑换：输出 ${fmt(amountOut)}，最多支付 ${fmt(amountInMax)}`);
    }
    summary.push(`接收地址：${recipient ?? "?"}`);
    return { summary, risks };
  }

  if (command === 0x08 || command === 0x09) {
    if (addressPath.length > 0) {
      summary.push(`路径：${addressPath.map((address) => shorten(address)).join(" → ")}`);
    }
    if (command === 0x08) {
      summary.unshift(`V2 兑换：输入 ${fmt(amountIn)}，最少得到 ${fmt(amountOutMin)}`);
      if (amountOutMin === 0n) {
        risks.push({
          level: "medium",
          title: "没有滑点保护",
          detail: "amountOutMin = 0，容易被三明治攻击。",
        });
      }
    } else {
      summary.unshift(`V2 兑换：输出 ${fmt(amountOut)}，最多支付 ${fmt(amountInMax)}`);
    }
    summary.push(`接收地址：${recipient ?? "?"}`);
    return { summary, risks };
  }

  if (command === 0x0b) {
    summary.push(`包装 ${formatAmount(amount ?? 0n, 18, 9)} ETH → ${recipient ?? "?"}`);
    return { summary, risks };
  }
  if (command === 0x0c) {
    summary.push(`解包至少 ${formatAmount(amountMin ?? 0n, 18, 9)} ETH → ${recipient ?? "?"}`);
    return { summary, risks };
  }
  if (command === 0x02) {
    summary.push(`Permit2 划转 ${shorten(token ?? "?")} 数量 ${fmt(amount)} → ${recipient ?? "?"}`);
    return { summary, risks };
  }
  if (command === 0x05) {
    summary.push(`转账 ${shorten(token ?? "?")} 数量 ${fmt(amount)} → ${recipient ?? "?"}`);
    return { summary, risks };
  }
  if (command === 0x04) {
    summary.push(`扫走 ${shorten(token ?? "?")} 至少 ${fmt(amountMin)} → ${recipient ?? "?"}`);
    return { summary, risks };
  }
  if (command === 0x06) {
    const bips = findUint(fields, "bips");
    summary.push(
      `按 ${bips === undefined ? "?" : Number(bips) / 100}% 分账 ${shorten(token ?? "?")} → ${
        recipient ?? "?"
      }`
    );
    return { summary, risks };
  }
  if (command === 0x0e) {
    summary.push(`余额检查：${shorten(token ?? "?")} 至少 ${fmt(findUint(fields, "minBalance"))}`);
    return { summary, risks };
  }
  summary.push(fields.map((field) => `${field.name}=${valueToString(field.value, ctx.decimals)}`).join(", "));
  return { summary, risks };
}

// ------------------------------------------------------------------ 辅助解析

export interface V3Path {
  tokens: string[];
  fees: number[];
  valid: boolean;
}

/** 解析 Uniswap V3 打包路径：token(20) + fee(3) + token(20) + ... */
export function decodeV3Path(bytes: Uint8Array): V3Path {
  const tokens: string[] = [];
  const fees: number[] = [];
  let offset = 0;
  let valid = bytes.length >= 43 && (bytes.length - 20) % 23 === 0;
  while (offset + 20 <= bytes.length) {
    tokens.push(toChecksumAddress(bytesToHex(bytes.slice(offset, offset + 20))));
    offset += 20;
    if (offset + 3 > bytes.length) {
      break;
    }
    fees.push((bytes[offset] << 16) | (bytes[offset + 1] << 8) | bytes[offset + 2]);
    offset += 3;
  }
  if (offset !== bytes.length) {
    valid = false;
  }
  return { tokens, fees, valid };
}

export function formatV3Path(path: V3Path): string {
  if (path.tokens.length === 0) {
    return "（空路径）";
  }
  let out = shorten(path.tokens[0]);
  path.fees.forEach((fee, index) => {
    out += ` --${fee / 10000}%--> ${shorten(path.tokens[index + 1] ?? "?")}`;
  });
  return path.valid ? out : `${out}（路径长度异常）`;
}

export interface MultiSendTx {
  operation: number;
  to: string;
  value: bigint;
  data: Uint8Array;
}

/** 解析 Safe MultiSend 的紧凑打包格式。 */
export function decodeMultiSend(bytes: Uint8Array): MultiSendTx[] {
  const txs: MultiSendTx[] = [];
  let offset = 0;
  while (offset + 85 <= bytes.length) {
    const operation = bytes[offset];
    offset += 1;
    const to = toChecksumAddress(bytesToHex(bytes.slice(offset, offset + 20)));
    offset += 20;
    const value = readBigIntBE(bytes, offset, 32);
    offset += 32;
    const dataLength = Number(readBigIntBE(bytes, offset, 32));
    offset += 32;
    if (dataLength < 0 || offset + dataLength > bytes.length) {
      throw new CalldataError("MultiSend 数据长度字段越界");
    }
    txs.push({ operation, to, value, data: bytes.slice(offset, offset + dataLength) });
    offset += dataLength;
  }
  return txs;
}

// -------------------------------------------------------------------- 输出

/** 页面上单行展示参数值的格式。 */
export function renderParamValue(param: DecodedParam, decimals = 18): string {
  const value = param.value;
  if (value.kind === "uint" || value.kind === "int") {
    const raw = value.value.toString();
    const scaled = formatAmount(value.value, decimals, 8);
    return scaled === raw ? raw : `${scaled}（raw ${raw}）`;
  }
  return valueToString(value, decimals);
}

export function ethResultToJson(result: EthCallResult): Record<string, unknown> {
  return {
    selector: result.selector,
    signature: result.signature,
    name: result.name,
    category: result.category,
    action: result.action,
    known: result.known,
    params: paramsToJson(result.params),
    summary: result.summary,
    risks: result.risks,
    notes: result.notes,
    extraBytes: result.extraBytes,
    error: result.error,
    words: result.words,
    children: result.children.map((child) => ({
      label: child.label,
      summary: child.summary,
      error: child.error,
      raw: child.raw,
      call: child.call ? ethResultToJson(child.call) : undefined,
    })),
    calldata: result.calldata,
  };
}

export { ZERO_ADDRESS };
