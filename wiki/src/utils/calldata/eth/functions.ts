import { CalldataError } from "../bytes";
import { selectorOf } from "../crypto";
import {
  abiJsonParams,
  parseParamList,
  parseSignatureLine,
  typeToString,
  type AbiJsonParam,
  type AbiParam,
} from "./abi";

interface AbiJsonItem {
  type?: string;
  name?: string;
  inputs?: AbiJsonParam[];
}

export type EthCategory =
  | "ERC-20"
  | "ERC-721 / 1155"
  | "WETH"
  | "DEX"
  | "Permit2"
  | "Safe"
  | "Lending"
  | "Vault"
  | "Staking"
  | "Governance"
  | "Proxy"
  | "Multicall"
  | "Bridge"
  | "Other";

export interface EthFunctionDef {
  name: string;
  signature: string;
  selector: string;
  category: EthCategory;
  action: string;
  params: AbiParam[];
  note?: string;
}

interface RawDef {
  name: string;
  params: string;
  category: EthCategory;
  action: string;
  note?: string;
}

const RAW_DEFS: RawDef[] = [
  // ---------------------------------------------------------------- ERC-20
  {
    name: "transfer",
    params: "to:address, amount:uint256",
    category: "ERC-20",
    action: "代币转账",
  },
  {
    name: "transferFrom",
    params: "from:address, to:address, value:uint256",
    category: "ERC-20",
    action: "代币转账（代扣）",
    note: "ERC-721 的 transferFrom 使用相同选择器，第三个参数为 tokenId。",
  },
  {
    name: "approve",
    params: "spender:address, amount:uint256",
    category: "ERC-20",
    action: "代币授权",
    note: "ERC-721 的 approve 使用相同选择器，第三个参数为 tokenId。",
  },
  {
    name: "increaseAllowance",
    params: "spender:address, addedValue:uint256",
    category: "ERC-20",
    action: "增加授权额度",
  },
  {
    name: "decreaseAllowance",
    params: "spender:address, subtractedValue:uint256",
    category: "ERC-20",
    action: "减少授权额度",
  },
  {
    name: "permit",
    params:
      "owner:address, spender:address, value:uint256, deadline:uint256, v:uint8, r:bytes32, s:bytes32",
    category: "ERC-20",
    action: "离线授权（EIP-2612）",
  },
  {
    name: "balanceOf",
    params: "account:address",
    category: "ERC-20",
    action: "查询余额",
  },
  {
    name: "allowance",
    params: "owner:address, spender:address",
    category: "ERC-20",
    action: "查询授权额度",
  },
  { name: "totalSupply", params: "", category: "ERC-20", action: "查询总供应量" },
  { name: "decimals", params: "", category: "ERC-20", action: "查询精度" },
  { name: "symbol", params: "", category: "ERC-20", action: "查询代币符号" },
  { name: "name", params: "", category: "ERC-20", action: "查询代币名称" },
  {
    name: "mint",
    params: "to:address, amount:uint256",
    category: "ERC-20",
    action: "增发代币",
  },
  {
    name: "burn",
    params: "amount:uint256",
    category: "ERC-20",
    action: "销毁代币",
  },
  {
    name: "burnFrom",
    params: "account:address, amount:uint256",
    category: "ERC-20",
    action: "销毁他人代币",
  },

  // ------------------------------------------------------------ ERC-721/1155
  {
    name: "safeTransferFrom",
    params: "from:address, to:address, tokenId:uint256",
    category: "ERC-721 / 1155",
    action: "转移 NFT",
  },
  {
    name: "safeTransferFrom",
    params: "from:address, to:address, tokenId:uint256, data:bytes",
    category: "ERC-721 / 1155",
    action: "转移 NFT（带回调数据）",
  },
  {
    name: "setApprovalForAll",
    params: "operator:address, approved:bool",
    category: "ERC-721 / 1155",
    action: "批量授权 NFT 操作权",
  },
  { name: "ownerOf", params: "tokenId:uint256", category: "ERC-721 / 1155", action: "查询 NFT 持有人" },
  { name: "tokenURI", params: "tokenId:uint256", category: "ERC-721 / 1155", action: "查询 NFT 元数据" },
  { name: "getApproved", params: "tokenId:uint256", category: "ERC-721 / 1155", action: "查询 NFT 授权" },
  {
    name: "isApprovedForAll",
    params: "owner:address, operator:address",
    category: "ERC-721 / 1155",
    action: "查询批量授权",
  },
  {
    name: "safeTransferFrom",
    params: "from:address, to:address, id:uint256, amount:uint256, data:bytes",
    category: "ERC-721 / 1155",
    action: "转移 ERC-1155 资产",
  },
  {
    name: "safeBatchTransferFrom",
    params: "from:address, to:address, ids:uint256[], amounts:uint256[], data:bytes",
    category: "ERC-721 / 1155",
    action: "批量转移 ERC-1155 资产",
  },
  {
    name: "balanceOfBatch",
    params: "accounts:address[], ids:uint256[]",
    category: "ERC-721 / 1155",
    action: "批量查询 ERC-1155 余额",
  },

  // ------------------------------------------------------------------- WETH
  { name: "deposit", params: "", category: "WETH", action: "包装 ETH → WETH" },
  {
    name: "withdraw",
    params: "wad:uint256",
    category: "WETH",
    action: "解包 WETH → ETH",
  },

  // ------------------------------------------------------- Uniswap V2 / 通用
  {
    name: "swapExactTokensForTokens",
    params:
      "amountIn:uint256, amountOutMin:uint256, path:address[], to:address, deadline:uint256",
    category: "DEX",
    action: "Swap（固定输入）",
  },
  {
    name: "swapTokensForExactTokens",
    params:
      "amountOut:uint256, amountInMax:uint256, path:address[], to:address, deadline:uint256",
    category: "DEX",
    action: "Swap（固定输出）",
  },
  {
    name: "swapExactETHForTokens",
    params: "amountOutMin:uint256, path:address[], to:address, deadline:uint256",
    category: "DEX",
    action: "Swap ETH → 代币",
  },
  {
    name: "swapTokensForExactETH",
    params:
      "amountOut:uint256, amountInMax:uint256, path:address[], to:address, deadline:uint256",
    category: "DEX",
    action: "Swap 代币 → 精确 ETH",
  },
  {
    name: "swapExactTokensForETH",
    params:
      "amountIn:uint256, amountOutMin:uint256, path:address[], to:address, deadline:uint256",
    category: "DEX",
    action: "Swap 代币 → ETH",
  },
  {
    name: "swapETHForExactTokens",
    params: "amountOut:uint256, path:address[], to:address, deadline:uint256",
    category: "DEX",
    action: "Swap 精确 ETH → 代币",
  },
  {
    name: "swapExactTokensForTokensSupportingFeeOnTransferTokens",
    params:
      "amountIn:uint256, amountOutMin:uint256, path:address[], to:address, deadline:uint256",
    category: "DEX",
    action: "Swap（支持转账税）",
  },
  {
    name: "swapExactETHForTokensSupportingFeeOnTransferTokens",
    params: "amountOutMin:uint256, path:address[], to:address, deadline:uint256",
    category: "DEX",
    action: "Swap ETH → 代币（支持转账税）",
  },
  {
    name: "swapExactTokensForETHSupportingFeeOnTransferTokens",
    params:
      "amountIn:uint256, amountOutMin:uint256, path:address[], to:address, deadline:uint256",
    category: "DEX",
    action: "Swap 代币 → ETH（支持转账税）",
  },
  {
    name: "addLiquidity",
    params:
      "tokenA:address, tokenB:address, amountADesired:uint256, amountBDesired:uint256, amountAMin:uint256, amountBMin:uint256, to:address, deadline:uint256",
    category: "DEX",
    action: "添加流动性",
  },
  {
    name: "addLiquidityETH",
    params:
      "token:address, amountTokenDesired:uint256, amountTokenMin:uint256, amountETHMin:uint256, to:address, deadline:uint256",
    category: "DEX",
    action: "添加 ETH 流动性",
  },
  {
    name: "removeLiquidity",
    params:
      "tokenA:address, tokenB:address, liquidity:uint256, amountAMin:uint256, amountBMin:uint256, to:address, deadline:uint256",
    category: "DEX",
    action: "移除流动性",
  },
  {
    name: "removeLiquidityETH",
    params:
      "token:address, liquidity:uint256, amountTokenMin:uint256, amountETHMin:uint256, to:address, deadline:uint256",
    category: "DEX",
    action: "移除 ETH 流动性",
  },

  // ------------------------------------------------------------- Uniswap V3
  {
    name: "exactInputSingle",
    params:
      "params:(tokenIn:address, tokenOut:address, fee:uint24, recipient:address, deadline:uint256, amountIn:uint256, amountOutMinimum:uint256, sqrtPriceLimitX96:uint160)",
    category: "DEX",
    action: "V3 Swap（单池，固定输入）",
    note: "Uniswap V3 SwapRouter（带 deadline）",
  },
  {
    name: "exactInputSingle",
    params:
      "params:(tokenIn:address, tokenOut:address, fee:uint24, recipient:address, amountIn:uint256, amountOutMinimum:uint256, sqrtPriceLimitX96:uint160)",
    category: "DEX",
    action: "V3 Swap（单池，固定输入）",
    note: "SwapRouter02（无 deadline）",
  },
  {
    name: "exactInput",
    params:
      "params:(path:bytes, recipient:address, deadline:uint256, amountIn:uint256, amountOutMinimum:uint256)",
    category: "DEX",
    action: "V3 Swap（多池，固定输入）",
    note: "Uniswap V3 SwapRouter（带 deadline）",
  },
  {
    name: "exactInput",
    params: "params:(path:bytes, recipient:address, amountIn:uint256, amountOutMinimum:uint256)",
    category: "DEX",
    action: "V3 Swap（多池，固定输入）",
    note: "SwapRouter02（无 deadline）",
  },
  {
    name: "exactOutputSingle",
    params:
      "params:(tokenIn:address, tokenOut:address, fee:uint24, recipient:address, deadline:uint256, amountOut:uint256, amountInMaximum:uint256, sqrtPriceLimitX96:uint160)",
    category: "DEX",
    action: "V3 Swap（单池，固定输出）",
    note: "Uniswap V3 SwapRouter（带 deadline）",
  },
  {
    name: "exactOutputSingle",
    params:
      "params:(tokenIn:address, tokenOut:address, fee:uint24, recipient:address, amountOut:uint256, amountInMaximum:uint256, sqrtPriceLimitX96:uint160)",
    category: "DEX",
    action: "V3 Swap（单池，固定输出）",
    note: "SwapRouter02（无 deadline）",
  },
  {
    name: "exactOutput",
    params:
      "params:(path:bytes, recipient:address, deadline:uint256, amountOut:uint256, amountInMaximum:uint256)",
    category: "DEX",
    action: "V3 Swap（多池，固定输出）",
    note: "Uniswap V3 SwapRouter（带 deadline）",
  },
  {
    name: "exactOutput",
    params: "params:(path:bytes, recipient:address, amountOut:uint256, amountInMaximum:uint256)",
    category: "DEX",
    action: "V3 Swap（多池，固定输出）",
    note: "SwapRouter02（无 deadline）",
  },
  {
    name: "multicall",
    params: "data:bytes[]",
    category: "Multicall",
    action: "批量调用",
    note: "Uniswap V3 / 通用 multicall，逐条解码子调用。",
  },
  {
    name: "multicall",
    params: "deadline:uint256, data:bytes[]",
    category: "Multicall",
    action: "批量调用（带 deadline）",
  },
  {
    name: "unwrapWETH9",
    params: "amountMinimum:uint256, recipient:address",
    category: "DEX",
    action: "把 WETH 解包成 ETH",
  },
  { name: "refundETH", params: "", category: "DEX", action: "退还未使用的 ETH" },
  {
    name: "sweepToken",
    params: "token:address, amountMinimum:uint256, recipient:address",
    category: "DEX",
    action: "扫走合约内代币",
  },
  {
    name: "wrapETH",
    params: "amount:uint256",
    category: "DEX",
    action: "把 ETH 包装成 WETH",
  },

  // ------------------------------------------------- Universal Router / 1inch
  {
    name: "execute",
    params: "commands:bytes, inputs:bytes[], deadline:uint256",
    category: "DEX",
    action: "Universal Router 批量执行",
  },
  {
    name: "execute",
    params: "commands:bytes, inputs:bytes[]",
    category: "DEX",
    action: "Universal Router 批量执行",
  },
  {
    name: "swap",
    params:
      "executor:address, desc:(srcToken:address, dstToken:address, srcReceiver:address, dstReceiver:address, amount:uint256, minReturnAmount:uint256, flags:uint256), permit:bytes, data:bytes",
    category: "DEX",
    action: "1inch 聚合兑换",
    note: "1inch AggregationRouter V5 的 swap。",
  },

  // ------------------------------------------------------------------ Permit2
  {
    name: "approve",
    params: "token:address, spender:address, amount:uint160, expiration:uint48",
    category: "Permit2",
    action: "Permit2 授权",
  },
  {
    name: "permit",
    params:
      "owner:address, permitSingle:((token:address, amount:uint160, expiration:uint48, nonce:uint48), spender:address, sigDeadline:uint256), signature:bytes",
    category: "Permit2",
    action: "Permit2 离线授权",
  },
  {
    name: "transferFrom",
    params: "from:address, to:address, amount:uint160, token:address",
    category: "Permit2",
    action: "Permit2 转账",
  },

  // --------------------------------------------------------------------- Safe
  {
    name: "execTransaction",
    params:
      "to:address, value:uint256, data:bytes, operation:uint8, safeTxGas:uint256, baseGas:uint256, gasPrice:uint256, gasToken:address, refundReceiver:address, signatures:bytes",
    category: "Safe",
    action: "Safe 多签执行",
  },
  {
    name: "multiSend",
    params: "transactions:bytes",
    category: "Safe",
    action: "Safe 批量交易",
  },
  {
    name: "addOwnerWithThreshold",
    params: "owner:address, _threshold:uint256",
    category: "Safe",
    action: "新增 Safe 所有者",
  },
  {
    name: "removeOwner",
    params: "prevOwner:address, owner:address, _threshold:uint256",
    category: "Safe",
    action: "移除 Safe 所有者",
  },
  {
    name: "changeThreshold",
    params: "_threshold:uint256",
    category: "Safe",
    action: "修改 Safe 确认阈值",
  },
  {
    name: "enableModule",
    params: "module:address",
    category: "Safe",
    action: "启用 Safe 模块",
  },
  {
    name: "execTransactionFromModule",
    params: "to:address, value:uint256, data:bytes, operation:uint8",
    category: "Safe",
    action: "通过模块执行交易",
  },

  // -------------------------------------------------------------------- Aave
  {
    name: "supply",
    params: "asset:address, amount:uint256, onBehalfOf:address, referralCode:uint16",
    category: "Lending",
    action: "Aave 存款",
  },
  {
    name: "withdraw",
    params: "asset:address, amount:uint256, to:address",
    category: "Lending",
    action: "Aave 取款",
  },
  {
    name: "borrow",
    params:
      "asset:address, amount:uint256, interestRateMode:uint256, referralCode:uint16, onBehalfOf:address",
    category: "Lending",
    action: "Aave 借款",
  },
  {
    name: "repay",
    params: "asset:address, amount:uint256, interestRateMode:uint256, onBehalfOf:address",
    category: "Lending",
    action: "Aave 还款",
  },
  {
    name: "flashLoanSimple",
    params: "receiverAddress:address, asset:address, amount:uint256, params:bytes, referralCode:uint16",
    category: "Lending",
    action: "Aave 闪电贷",
  },

  // ------------------------------------------------------------------- Vault
  {
    name: "deposit",
    params: "assets:uint256, receiver:address",
    category: "Vault",
    action: "ERC-4626 存入资产",
  },
  {
    name: "withdraw",
    params: "assets:uint256, receiver:address, owner:address",
    category: "Vault",
    action: "ERC-4626 取出资产",
  },
  {
    name: "redeem",
    params: "shares:uint256, receiver:address, owner:address",
    category: "Vault",
    action: "ERC-4626 赎回份额",
  },
  {
    name: "mint",
    params: "shares:uint256, receiver:address",
    category: "Vault",
    action: "ERC-4626 铸造份额",
  },

  // ----------------------------------------------------------------- Staking
  {
    name: "submit",
    params: "referral:address",
    category: "Staking",
    action: "Lido 质押 ETH",
  },
  { name: "wrap", params: "amount:uint256", category: "Staking", action: "包装质押凭证" },
  { name: "unwrap", params: "amount:uint256", category: "Staking", action: "解包质押凭证" },

  // -------------------------------------------------------------- Governance
  { name: "delegate", params: "delegatee:address", category: "Governance", action: "委托投票权" },
  {
    name: "castVote",
    params: "proposalId:uint256, support:uint8",
    category: "Governance",
    action: "治理投票",
  },
  {
    name: "propose",
    params: "targets:address[], values:uint256[], calldatas:bytes[], description:string",
    category: "Governance",
    action: "发起治理提案",
  },
  {
    name: "transferOwnership",
    params: "newOwner:address",
    category: "Governance",
    action: "转移合约所有权",
  },
  { name: "renounceOwnership", params: "", category: "Governance", action: "放弃合约所有权" },
  {
    name: "upgradeTo",
    params: "newImplementation:address",
    category: "Proxy",
    action: "升级合约实现",
  },
  {
    name: "upgradeToAndCall",
    params: "newImplementation:address, data:bytes",
    category: "Proxy",
    action: "升级合约并调用",
  },

  // ----------------------------------------------------------------- 多签聚合
  {
    name: "aggregate",
    params: "calls:(target:address, callData:bytes)[]",
    category: "Multicall",
    action: "Multicall 聚合调用",
  },
  {
    name: "aggregate3",
    params: "calls:(target:address, allowFailure:bool, callData:bytes)[]",
    category: "Multicall",
    action: "Multicall3 聚合调用",
  },
];

function buildDef(raw: RawDef): EthFunctionDef {
  const params = parseParamList(raw.params);
  const signature = `${raw.name}(${params.map((param) => typeToString(param.typeInfo)).join(",")})`;
  return {
    name: raw.name,
    params,
    signature,
    selector: selectorOf(signature),
    category: raw.category,
    action: raw.action,
    note: raw.note,
  };
}

export const ETH_FUNCTIONS: EthFunctionDef[] = RAW_DEFS.map(buildDef);

export const ETH_FUNCTION_BY_SELECTOR: Record<string, EthFunctionDef> = (() => {
  const map: Record<string, EthFunctionDef> = {};
  for (const def of ETH_FUNCTIONS) {
    map[def.selector.toLowerCase()] = map[def.selector.toLowerCase()] ?? def;
  }
  return map;
})();

/** 由用户输入的 ABI JSON / 签名文本构建函数定义。 */
export function buildDefFromAbi(
  name: string,
  params: AbiParam[],
  category: EthCategory = "Other",
  action?: string
): EthFunctionDef {
  const signature = `${name}(${params.map((param) => typeToString(param.typeInfo)).join(",")})`;
  return {
    name,
    params,
    signature,
    selector: selectorOf(signature),
    category,
    action: action ?? name,
  };
}

/** 解析用户粘贴的 ABI JSON 或 Solidity 函数签名文本。 */
export function defsFromUserInput(input: string): EthFunctionDef[] {
  const text = input.trim();
  if (!text) {
    return [];
  }
  if (text.startsWith("[") || text.startsWith("{")) {
    return defsFromAbiJson(text);
  }
  return defsFromSignatureText(text);
}

export function defsFromAbiJson(text: string): EthFunctionDef[] {
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch (err) {
    throw new CalldataError(`ABI JSON 解析失败：${(err as Error).message}`);
  }
  const container = parsed as { abi?: unknown };
  const items = Array.isArray(parsed)
    ? parsed
    : Array.isArray(container?.abi)
    ? container.abi
    : null;
  if (!items) {
    throw new CalldataError("ABI JSON 需要是数组，或包含 abi 字段的对象");
  }
  const defs: EthFunctionDef[] = [];
  for (const item of items as AbiJsonItem[]) {
    if (!item || (item.type && item.type !== "function") || !item.name) {
      continue;
    }
    defs.push(buildDefFromAbi(item.name, abiJsonParams(item.inputs)));
  }
  if (defs.length === 0) {
    throw new CalldataError("ABI 中没有任何函数定义");
  }
  return defs;
}

export function defsFromSignatureText(text: string): EthFunctionDef[] {
  const lines = text
    .split(/[;\n]+/)
    .map((line) => line.trim())
    .filter(Boolean);
  const defs: EthFunctionDef[] = [];
  for (const line of lines) {
    const { name, params } = parseSignatureLine(line);
    defs.push(buildDefFromAbi(name, params));
  }
  return defs;
}
