import {
  CalldataError,
  base58ToBytes,
  base64ToBytes,
  bytesToBase58,
  bytesToHex,
  hexToBytes,
  formatAmount,
  formatLamports,
  isHexString,
  readUint8,
  readUint32LE,
  readUint64LE,
  shorten,
  utf8Decode,
} from "../bytes";
import { anchorDiscriminator } from "../crypto";
import {
  BorshReader,
  buildIdlEnv,
  decodeBorshValue,
  stringifyBorshValue,
  type Idl,
  type IdlInstruction,
} from "./borsh";
import {
  describeProgram,
  PROGRAM_KIND_LABEL,
  type SolanaProgramKind,
} from "./programs";

export type RiskLevel = "info" | "low" | "medium" | "high";

export interface SolanaRisk {
  level: RiskLevel;
  title: string;
  detail?: string;
}

export interface SolanaArg {
  name: string;
  type: string;
  value: string;
}

export interface SolanaAccountView {
  index: number;
  pubkey: string;
  label?: string;
  signer?: boolean;
  writable?: boolean;
}

export type SolanaEffectType =
  | "sol-transfer"
  | "token-transfer"
  | "token-approve"
  | "token-mint"
  | "token-burn"
  | "account-create"
  | "account-close"
  | "authority-change"
  | "compute-budget"
  | "memo";

export interface SolanaEffect {
  type: SolanaEffectType;
  from?: string;
  to?: string;
  amount?: bigint;
  mint?: string;
  decimals?: number;
  label?: string;
  unlimited?: boolean;
}

export interface SolanaCompute {
  unitLimit?: number;
  unitPrice?: bigint;
  heapFrame?: number;
  loadedAccountsDataSize?: number;
}

export interface SolanaInstructionView {
  index: number;
  programId: string;
  programName: string;
  programKind: SolanaProgramKind;
  programKnown: boolean;
  name: string;
  known: boolean;
  accounts: SolanaAccountView[];
  args: SolanaArg[];
  dataHex: string;
  summary: string[];
  effects: SolanaEffect[];
  compute?: SolanaCompute;
  note?: string;
}

export interface SolanaDecodeContext {
  idl?: Idl;
  idlEnv?: ReturnType<typeof buildIdlEnv>;
}

function arg(name: string, type: string, value: string): SolanaArg {
  return { name, type, value };
}

function accountViews(
  keys: string[],
  labels: Record<number, string>
): SolanaAccountView[] {
  return keys.map((pubkey, index) => ({
    index,
    pubkey,
    label: labels[index],
  }));
}

const ZERO_KEY = "11111111111111111111111111111111";

// ------------------------------------------------------------------ System

const SYSTEM_INSTRUCTIONS = [
  "CreateAccount",
  "Assign",
  "Transfer",
  "CreateAccountWithSeed",
  "AdvanceNonceAccount",
  "WithdrawNonceAccount",
  "InitializeNonceAccount",
  "AuthorizeNonceAccount",
  "Allocate",
  "AllocateWithSeed",
  "AssignWithSeed",
  "TransferWithSeed",
  "UpgradeNonceAccount",
];

function decodeSystemInstruction(
  data: Uint8Array,
  keys: string[]
): Partial<SolanaInstructionView> & { name: string } {
  const tag = readUint32LE(data, 0);
  const name = SYSTEM_INSTRUCTIONS[tag] ?? `UnknownSystemInstruction(${tag})`;
  const args: SolanaArg[] = [];
  const labels: Record<number, string> = {};
  const effects: SolanaEffect[] = [];
  let summary = `系统指令 ${name}`;

  switch (tag) {
    case 0: {
      const lamports = readUint64LE(data, 4);
      const space = readUint64LE(data, 12);
      const owner = bytesToBase58(data.slice(20, 52));
      args.push(
        arg("lamports", "u64", lamports.toString()),
        arg("space", "u64", space.toString()),
        arg("owner", "pubkey", owner)
      );
      labels[0] = "付款人";
      labels[1] = "新账户";
      summary = `创建账户：租金 ${formatLamports(lamports)}，数据空间 ${space} 字节`;
      effects.push({
        type: "account-create",
        from: keys[0],
        to: keys[1],
        amount: lamports,
        label: `创建账户并转入 ${formatLamports(lamports)}`,
      });
      break;
    }
    case 1: {
      const owner = bytesToBase58(data.slice(4, 36));
      args.push(arg("owner", "pubkey", owner));
      labels[0] = "账户";
      summary = `把账户的 owner 改为 ${shorten(owner)}`;
      effects.push({ type: "authority-change", from: keys[0], label: "变更账户 owner" });
      break;
    }
    case 2: {
      const lamports = readUint64LE(data, 4);
      args.push(arg("lamports", "u64", lamports.toString()));
      labels[0] = "付款方";
      labels[1] = "接收方";
      summary = `SOL 转账 ${formatLamports(lamports)}：${shorten(keys[0] ?? "?")} → ${shorten(
        keys[1] ?? "?"
      )}`;
      effects.push({
        type: "sol-transfer",
        from: keys[0],
        to: keys[1],
        amount: lamports,
      });
      break;
    }
    case 3: {
      const base = bytesToBase58(data.slice(4, 36));
      const reader = new BorshReader(data.slice(36));
      const seed = reader.string();
      const lamports = reader.u64();
      const space = reader.u64();
      const owner = reader.publicKey();
      args.push(
        arg("base", "pubkey", base),
        arg("seed", "string", seed),
        arg("lamports", "u64", lamports.toString()),
        arg("space", "u64", space.toString()),
        arg("owner", "pubkey", owner)
      );
      labels[0] = "付款人";
      labels[1] = "新账户";
      summary = `用种子 "${seed}" 创建账户，租金 ${formatLamports(lamports)}`;
      effects.push({
        type: "account-create",
        from: keys[0],
        to: keys[1],
        amount: lamports,
      });
      break;
    }
    case 4:
      labels[0] = "Nonce 账户";
      labels[1] = "RecentBlockhashes";
      labels[2] = "权限账户";
      summary = "推进 Nonce 账户（用于持久化交易）";
      break;
    case 5: {
      const lamports = readUint64LE(data, 4);
      args.push(arg("lamports", "u64", lamports.toString()));
      labels[0] = "Nonce 账户";
      labels[1] = "接收方";
      labels[2] = "权限账户";
      summary = `从 Nonce 账户提取 ${formatLamports(lamports)}`;
      effects.push({
        type: "sol-transfer",
        from: keys[0],
        to: keys[1],
        amount: lamports,
      });
      break;
    }
    case 6: {
      const authority = bytesToBase58(data.slice(4, 36));
      args.push(arg("authority", "pubkey", authority));
      labels[0] = "Nonce 账户";
      labels[1] = "RecentBlockhashes";
      labels[2] = "租金";
      summary = "初始化 Nonce 账户";
      break;
    }
    case 7: {
      const authority = bytesToBase58(data.slice(4, 36));
      args.push(arg("authority", "pubkey", authority));
      labels[0] = "Nonce 账户";
      labels[1] = "权限账户";
      summary = `把 Nonce 账户权限转让给 ${shorten(authority)}`;
      effects.push({ type: "authority-change", label: "变更 Nonce 权限" });
      break;
    }
    case 8: {
      const space = readUint64LE(data, 4);
      args.push(arg("space", "u64", space.toString()));
      labels[0] = "账户";
      summary = `为账户分配 ${space} 字节空间`;
      break;
    }
    case 9: {
      const base = bytesToBase58(data.slice(4, 36));
      const reader = new BorshReader(data.slice(36));
      const seed = reader.string();
      const space = reader.u64();
      const owner = reader.publicKey();
      args.push(
        arg("base", "pubkey", base),
        arg("seed", "string", seed),
        arg("space", "u64", space.toString()),
        arg("owner", "pubkey", owner)
      );
      labels[0] = "账户";
      summary = `用种子 "${seed}" 分配 ${space} 字节空间`;
      break;
    }
    case 10: {
      const base = bytesToBase58(data.slice(4, 36));
      const reader = new BorshReader(data.slice(36));
      const seed = reader.string();
      const owner = reader.publicKey();
      args.push(
        arg("base", "pubkey", base),
        arg("seed", "string", seed),
        arg("owner", "pubkey", owner)
      );
      labels[0] = "账户";
      summary = `用种子 "${seed}" 设置账户 owner`;
      effects.push({ type: "authority-change", label: "变更账户 owner" });
      break;
    }
    case 11: {
      const lamports = readUint64LE(data, 4);
      const reader = new BorshReader(data.slice(12));
      const seed = reader.string();
      const owner = reader.publicKey();
      args.push(
        arg("lamports", "u64", lamports.toString()),
        arg("fromSeed", "string", seed),
        arg("fromOwner", "pubkey", owner)
      );
      labels[0] = "来源账户";
      labels[1] = "接收方";
      summary = `带种子的 SOL 转账 ${formatLamports(lamports)}`;
      effects.push({
        type: "sol-transfer",
        from: keys[0],
        to: keys[1],
        amount: lamports,
      });
      break;
    }
    case 12:
      labels[0] = "Nonce 账户";
      summary = "升级 Nonce 账户版本";
      break;
    default:
      break;
  }

  return {
    name,
    known: SYSTEM_INSTRUCTIONS[tag] !== undefined,
    args,
    accounts: accountViews(keys, labels),
    effects,
    summary: [summary],
  };
}

// ------------------------------------------------------------------- Token

const TOKEN_INSTRUCTION_NAMES = [
  "InitializeMint",
  "InitializeAccount",
  "InitializeMultisig",
  "Transfer",
  "Approve",
  "Revoke",
  "SetAuthority",
  "MintTo",
  "Burn",
  "CloseAccount",
  "FreezeAccount",
  "ThawAccount",
  "TransferChecked",
  "ApproveChecked",
  "MintToChecked",
  "BurnChecked",
  "InitializeAccount2",
  "SyncNative",
  "InitializeAccount3",
  "InitializeMultisig2",
  "InitializeMint2",
  "GetAccountDataSize",
  "InitializeImmutableOwner",
  "AmountToUiAmount",
  "UiAmountToAmount",
];

const AUTHORITY_TYPE_LABEL: Record<number, string> = {
  0: "mintTokens",
  1: "freezeAccount",
  2: "accountOwner",
  3: "closeAccount",
};

function decodeTokenInstruction(
  data: Uint8Array,
  keys: string[]
): Partial<SolanaInstructionView> & { name: string } {
  const tag = readUint8(data, 0);
  const name = TOKEN_INSTRUCTION_NAMES[tag] ?? `UnknownTokenInstruction(${tag})`;
  const args: SolanaArg[] = [];
  const labels: Record<number, string> = {};
  const effects: SolanaEffect[] = [];
  let summary = `SPL Token ${name}`;
  let known = TOKEN_INSTRUCTION_NAMES[tag] !== undefined;

  const readAmount = (): bigint => readUint64LE(data, 1);
  const decimalsAt = (offset: number): number => readUint8(data, offset);

  switch (tag) {
    case 3: {
      const amount = readAmount();
      args.push(arg("amount", "u64", amount.toString()));
      labels[0] = "来源账户";
      labels[1] = "目标账户";
      labels[2] = "owner";
      summary = `代币转账 ${amount.toString()}（Transfer，未带精度）：${shorten(
        keys[0] ?? "?"
      )} → ${shorten(keys[1] ?? "?")}`;
      effects.push({
        type: "token-transfer",
        from: keys[0],
        to: keys[1],
        amount,
      });
      break;
    }
    case 4: {
      const amount = readAmount();
      args.push(arg("amount", "u64", amount.toString()));
      labels[0] = "来源账户";
      labels[1] = "被授权方";
      labels[2] = "owner";
      summary = `授权 ${shorten(keys[1] ?? "?")} 使用 ${amount.toString()} 个代币单位`;
      effects.push({
        type: "token-approve",
        from: keys[0],
        to: keys[1],
        amount,
        unlimited: amount === 2n ** 64n - 1n,
      });
      break;
    }
    case 5: {
      labels[0] = "来源账户";
      labels[1] = "owner";
      summary = "撤销代币授权";
      break;
    }
    case 6: {
      const authorityType = readUint8(data, 1);
      const hasNew = readUint8(data, 2);
      args.push(arg("authorityType", "u8", `${authorityType}（${AUTHORITY_TYPE_LABEL[authorityType] ?? "未知"}）`));
      args.push(arg("hasNewAuthority", "u8", hasNew.toString()));
      if (hasNew === 1) {
        const newAuthority =
          data.length >= 35 ? bytesToBase58(data.slice(3, 35)) : "(数据不足)";
        args.push(arg("newAuthority", "pubkey", newAuthority));
        summary = `变更代币权限（${AUTHORITY_TYPE_LABEL[authorityType] ?? authorityType}）→ ${shorten(
          newAuthority
        )}`;
      } else {
        summary = `清除代币权限（${AUTHORITY_TYPE_LABEL[authorityType] ?? authorityType}）`;
      }
      labels[0] = "被修改账户";
      labels[1] = "当前权限账户";
      effects.push({ type: "authority-change", label: "变更 SPL Token 权限" });
      break;
    }
    case 7: {
      const amount = readAmount();
      args.push(arg("amount", "u64", amount.toString()));
      labels[0] = "Mint";
      labels[1] = "目标账户";
      labels[2] = "mint 权限";
      summary = `增发代币 ${amount.toString()} 单位`;
      effects.push({ type: "token-mint", mint: keys[0], to: keys[1], amount });
      break;
    }
    case 8: {
      const amount = readAmount();
      args.push(arg("amount", "u64", amount.toString()));
      labels[0] = "代币账户";
      labels[1] = "Mint";
      labels[2] = "owner";
      summary = `销毁代币 ${amount.toString()} 单位`;
      effects.push({ type: "token-burn", mint: keys[1], from: keys[0], amount });
      break;
    }
    case 9: {
      labels[0] = "代币账户";
      labels[1] = "接收租金账户";
      labels[2] = "owner";
      summary = `关闭代币账户，租金退回 ${shorten(keys[1] ?? "?")}`;
      effects.push({ type: "account-close", from: keys[0], to: keys[1] });
      break;
    }
    case 10:
    case 11: {
      labels[0] = "代币账户";
      labels[1] = "Mint";
      labels[2] = "freeze 权限";
      summary = tag === 10 ? "冻结代币账户" : "解冻代币账户";
      break;
    }
    case 12: {
      const amount = readAmount();
      const decimals = decimalsAt(9);
      args.push(arg("amount", "u64", amount.toString()), arg("decimals", "u8", decimals.toString()));
      labels[0] = "来源账户";
      labels[1] = "Mint";
      labels[2] = "目标账户";
      labels[3] = "owner";
      summary = `代币转账 ${formatAmount(amount, decimals)}（精度 ${decimals}）：${shorten(
        keys[0] ?? "?"
      )} → ${shorten(keys[2] ?? "?")}`;
      effects.push({
        type: "token-transfer",
        from: keys[0],
        to: keys[2],
        mint: keys[1],
        amount,
        decimals,
      });
      break;
    }
    case 13: {
      const amount = readAmount();
      const decimals = decimalsAt(9);
      args.push(arg("amount", "u64", amount.toString()), arg("decimals", "u8", decimals.toString()));
      labels[0] = "来源账户";
      labels[1] = "Mint";
      labels[2] = "被授权方";
      labels[3] = "owner";
      summary = `授权 ${shorten(keys[2] ?? "?")} 使用 ${formatAmount(amount, decimals)} 代币`;
      effects.push({
        type: "token-approve",
        from: keys[0],
        to: keys[2],
        mint: keys[1],
        amount,
        decimals,
        unlimited: amount === 2n ** 64n - 1n,
      });
      break;
    }
    case 14: {
      const amount = readAmount();
      const decimals = decimalsAt(9);
      args.push(arg("amount", "u64", amount.toString()), arg("decimals", "u8", decimals.toString()));
      labels[0] = "Mint";
      labels[1] = "目标账户";
      labels[2] = "mint 权限";
      summary = `增发 ${formatAmount(amount, decimals)} 代币`;
      effects.push({ type: "token-mint", mint: keys[0], to: keys[1], amount, decimals });
      break;
    }
    case 15: {
      const amount = readAmount();
      const decimals = decimalsAt(9);
      args.push(arg("amount", "u64", amount.toString()), arg("decimals", "u8", decimals.toString()));
      labels[0] = "代币账户";
      labels[1] = "Mint";
      labels[2] = "owner";
      summary = `销毁 ${formatAmount(amount, decimals)} 代币`;
      effects.push({ type: "token-burn", mint: keys[1], from: keys[0], amount, decimals });
      break;
    }
    case 16:
    case 18: {
      const owner = data.length >= 33 ? bytesToBase58(data.slice(1, 33)) : "(数据不足)";
      args.push(arg("owner", "pubkey", owner));
      labels[0] = "代币账户";
      labels[1] = "Mint";
      summary = `初始化代币账户，owner = ${shorten(owner)}`;
      break;
    }
    case 17: {
      labels[0] = "代币账户";
      summary = "同步原生 SOL 余额（SyncNative）";
      break;
    }
    case 19: {
      const m = readUint8(data, 1);
      args.push(arg("m", "u8", m.toString()));
      labels[0] = "多签账户";
      summary = `初始化 ${m}-of-N 多签账户`;
      break;
    }
    case 20: {
      const decimals = decimalsAt(1);
      const mintAuthority = data.length >= 34 ? bytesToBase58(data.slice(2, 34)) : "(数据不足)";
      args.push(arg("decimals", "u8", decimals.toString()), arg("mintAuthority", "pubkey", mintAuthority));
      labels[0] = "Mint";
      summary = `初始化 Mint（精度 ${decimals}），增发权限 ${shorten(mintAuthority)}`;
      break;
    }
    case 21: {
      labels[0] = "Mint";
      summary = "查询账户所需数据长度";
      break;
    }
    case 22: {
      labels[0] = "代币账户";
      summary = "初始化不可变 owner 标记";
      break;
    }
    case 23: {
      const amount = readAmount();
      args.push(arg("amount", "u64", amount.toString()));
      labels[0] = "Mint";
      summary = `金额换算为 UI 数量：${amount.toString()}`;
      break;
    }
    case 24: {
      const text = data.length > 1 ? utf8Decode(data.slice(1)) : "";
      args.push(arg("amount", "string", text));
      labels[0] = "Mint";
      summary = `UI 数量换算为最小单位："${text}"`;
      break;
    }
    default:
      known = false;
      break;
  }

  return {
    name,
    known,
    args,
    accounts: accountViews(keys, labels),
    effects,
    summary: [summary],
  };
}

// --------------------------------------------------------------------- ATA

const ATA_INSTRUCTIONS = ["Create", "CreateIdempotent", "RecoverNested"];

function decodeAtaInstruction(
  data: Uint8Array,
  keys: string[]
): Partial<SolanaInstructionView> & { name: string } {
  const tag = data.length > 0 ? readUint8(data, 0) : 0;
  const name = ATA_INSTRUCTIONS[tag] ?? `UnknownAtaInstruction(${tag})`;
  const labels: Record<number, string> = {
    0: "付款人",
    1: "关联代币账户",
    2: "钱包地址",
    3: "Mint",
    4: "System Program",
    5: "Token Program",
  };
  if (tag === 2) {
    labels[3] = "目标 owner";
    labels[4] = "嵌套 ATA";
    labels[5] = "Token Program";
  }
  return {
    name,
    known: ATA_INSTRUCTIONS[tag] !== undefined,
    args: [],
    accounts: accountViews(keys, labels),
    effects: [],
    summary: [
      `${name}：为 ${shorten(keys[2] ?? "?")} 创建/关联 ${shorten(keys[3] ?? "?")} 的代币账户 ${shorten(
        keys[1] ?? "?"
      )}`,
    ],
  };
}

// ---------------------------------------------------------- Compute Budget

function decodeComputeInstruction(
  data: Uint8Array,
  keys: string[]
): Partial<SolanaInstructionView> & { name: string } {
  const tag = readUint8(data, 0);
  const names = [
    "RequestUnitsDeprecated",
    "RequestHeapFrame",
    "SetComputeUnitLimit",
    "SetComputeUnitPrice",
    "SetLoadedAccountsDataSizeLimit",
  ];
  const name = names[tag] ?? `UnknownComputeBudgetInstruction(${tag})`;
  const args: SolanaArg[] = [];
  const compute: SolanaCompute = {};
  let summary = name;

  switch (tag) {
    case 0: {
      const units = readUint32LE(data, 1);
      const fee = readUint32LE(data, 5);
      args.push(arg("units", "u32", units.toString()), arg("additionalFee", "u32", fee.toString()));
      compute.unitLimit = units;
      summary = `请求计算单元 ${units}`;
      break;
    }
    case 1: {
      const bytes = readUint32LE(data, 1);
      args.push(arg("bytes", "u32", bytes.toString()));
      compute.heapFrame = bytes;
      summary = `请求堆内存 ${bytes} 字节`;
      break;
    }
    case 2: {
      const units = readUint32LE(data, 1);
      args.push(arg("units", "u32", units.toString()));
      compute.unitLimit = units;
      summary = `设置计算单元上限 ${units}`;
      break;
    }
    case 3: {
      const price = readUint64LE(data, 1);
      args.push(arg("microLamports", "u64", price.toString()));
      compute.unitPrice = price;
      summary = `设置计算单元价格 ${price.toString()} micro-lamports`;
      break;
    }
    case 4: {
      const bytes = readUint32LE(data, 1);
      args.push(arg("bytes", "u32", bytes.toString()));
      compute.loadedAccountsDataSize = bytes;
      summary = `设置账户数据加载上限 ${bytes} 字节`;
      break;
    }
    default:
      break;
  }

  return {
    name,
    known: names[tag] !== undefined,
    args,
    accounts: accountViews(keys, {}),
    effects: [],
    compute,
    summary: [summary],
  };
}

// ----------------------------------------------------------------- loader

const LOADER_INSTRUCTIONS = [
  "InitializeBuffer",
  "Write",
  "DeployWithMaxDataLen",
  "Upgrade",
  "SetAuthority",
  "Close",
  "ExtendProgram",
  "SetAuthorityChecked",
];

function decodeLoaderInstruction(
  data: Uint8Array,
  keys: string[]
): Partial<SolanaInstructionView> & { name: string } {
  const tag = data.length >= 4 ? readUint32LE(data, 0) : 0;
  const name = LOADER_INSTRUCTIONS[tag] ?? `UnknownLoaderInstruction(${tag})`;
  const labels: Record<number, string> = { 0: "程序数据账户" };
  return {
    name,
    known: LOADER_INSTRUCTIONS[tag] !== undefined,
    args: [],
    accounts: accountViews(keys, labels),
    effects: [],
    summary: [`程序加载器 ${name}：对 ${shorten(keys[0] ?? "?")} 执行升级相关操作`],
  };
}

// ------------------------------------------------------------ stake / vote

const STAKE_INSTRUCTIONS = [
  "Initialize",
  "Authorize",
  "DelegateStake",
  "Split",
  "Withdraw",
  "Deactivate",
  "SetLockup",
  "Merge",
  "AuthorizeWithSeed",
  "InitializeChecked",
  "AuthorizeChecked",
  "AuthorizeCheckedWithSeed",
  "SetLockupChecked",
  "GetMinimumDelegation",
  "DeactivateDelinquent",
  "Redelegate",
];

const VOTE_INSTRUCTIONS = [
  "Initialize",
  "Authorize",
  "AuthorizeWithSeed",
  "InitializeAccount",
  "AuthorizeCheckedWithSeed",
  "CompactUpdateVoteState",
  "CompactUpdateVoteStateSwitch",
  "TowerSync",
  "TowerSyncSwitch",
  "UpdateVoteState",
  "UpdateVoteStateSwitch",
  "Vote",
  "Withdraw",
  "UpdateValidatorIdentity",
  "UpdateCommission",
  "VoteSwitch",
];

function decodeStakeOrVote(
  data: Uint8Array,
  keys: string[],
  isVote: boolean
): Partial<SolanaInstructionView> & { name: string } {
  const tag = data.length >= 4 ? readUint32LE(data, 0) : 0;
  const names = isVote ? VOTE_INSTRUCTIONS : STAKE_INSTRUCTIONS;
  const name = names[tag] ?? `${isVote ? "Vote" : "Stake"}Instruction(${tag})`;
  return {
    name,
    known: names[tag] !== undefined,
    args: [],
    accounts: accountViews(keys, {}),
    effects: [],
    summary: [`${isVote ? "投票" : "质押"}指令 ${name}`],
  };
}

// ---------------------------------------------------------------- Anchor

function instructionDiscriminator(instruction: IdlInstruction): Uint8Array {
  if (instruction.discriminator && instruction.discriminator.length === 8) {
    return Uint8Array.from(instruction.discriminator);
  }
  return anchorDiscriminator(instruction.name);
}

function decodeAnchorInstruction(
  data: Uint8Array,
  keys: string[],
  idl: Idl,
  env: ReturnType<typeof buildIdlEnv>
): (Partial<SolanaInstructionView> & { name: string }) | null {
  if (data.length < 8) {
    return null;
  }
  const discriminator = bytesToHex(data.slice(0, 8), false);
  const instruction = idl.instructions.find(
    (item) => bytesToHex(instructionDiscriminator(item), false) === discriminator
  );
  if (!instruction) {
    return null;
  }
  const reader = new BorshReader(data.slice(8));
  const args: SolanaArg[] = [];
  for (const field of instruction.args ?? []) {
    const value = decodeBorshValue(reader, field.type, env);
    args.push(arg(field.name, typeof field.type === "string" ? field.type : "borsh", stringifyBorshValue(value)));
  }
  const labels: Record<number, string> = {};
  (instruction.accounts ?? []).forEach((meta, index) => {
    labels[index] = `${meta.name}${meta.isSigner || meta.signer ? "（签名）" : ""}${
      meta.isMut || meta.writable ? "（可写）" : ""
    }`;
  });
  return {
    name: instruction.name,
    known: true,
    args,
    accounts: accountViews(keys, labels),
    effects: [],
    summary: [`Anchor 指令 ${instruction.name}（IDL 解码）`],
  };
}

// ----------------------------------------------------------- entry point

export function decodeInstructionView(
  programId: string,
  data: Uint8Array,
  accountKeys: string[],
  context: SolanaDecodeContext = {}
): SolanaInstructionView {
  const program = programId
    ? describeProgram(programId)
    : { id: "", name: "未指定程序", kind: "other" as SolanaProgramKind, known: false };
  const base: SolanaInstructionView = {
    index: 0,
    programId,
    programName: program.name,
    programKind: program.kind,
    programKnown: program.known,
    name: "未知指令",
    known: false,
    accounts: accountViews(accountKeys, {}),
    args: [],
    dataHex: bytesToHex(data),
    summary: [],
    effects: [],
  };

  if (data.length === 0) {
    base.summary = ["空指令数据（可能只是转账或创建账户的占位指令）"];
    return base;
  }

  try {
    let decoded: (Partial<SolanaInstructionView> & { name: string }) | null = null;

    switch (program.kind) {
      case "system":
        decoded = decodeSystemInstruction(data, accountKeys);
        break;
      case "token":
        decoded = decodeTokenInstruction(data, accountKeys);
        break;
      case "ata":
        decoded = decodeAtaInstruction(data, accountKeys);
        break;
      case "compute":
        decoded = decodeComputeInstruction(data, accountKeys);
        break;
      case "loader":
        decoded = decodeLoaderInstruction(data, accountKeys);
        break;
      case "stake":
        decoded = decodeStakeOrVote(data, accountKeys, false);
        break;
      case "vote":
        decoded = decodeStakeOrVote(data, accountKeys, true);
        break;
      case "memo":
        decoded = {
          name: "Memo",
          known: true,
          args: [arg("memo", "string", utf8Decode(data))],
          accounts: accountViews(accountKeys, {}),
          effects: [{ type: "memo", label: utf8Decode(data) }],
          summary: [`链上备注："${utf8Decode(data)}"`],
        };
        break;
      default:
        break;
    }

    if (!decoded && context.idl) {
      const env = context.idlEnv ?? buildIdlEnv(context.idl);
      decoded = decodeAnchorInstruction(data, accountKeys, context.idl, env);
    }

    if (decoded) {
      base.name = decoded.name;
      base.known = decoded.known ?? true;
      base.args = decoded.args ?? [];
      base.accounts = decoded.accounts ?? base.accounts;
      base.effects = decoded.effects ?? [];
      base.compute = decoded.compute;
      base.summary = decoded.summary ?? [];
      if (decoded.note) {
        base.note = decoded.note;
      }
      return base;
    }
  } catch (err) {
    base.note = `指令数据解析失败：${(err as Error).message}`;
    base.summary = [`无法解析该指令，原始数据 ${data.length} 字节`];
    return base;
  }

  // 未识别的程序 / 指令
  if (!programId) {
    base.name = "未提供程序 ID";
    base.summary = [
      `原始数据 ${data.length} 字节，前 8 字节：0x${bytesToHex(data.slice(0, 8), false)}`,
    ];
    base.note = "填写程序 ID 后可以使用内置的 System / SPL Token / ATA / ComputeBudget 解码器；DeFi 程序需要对应 IDL。";
    return base;
  }

  if (program.kind === "defi" || program.known) {
    base.name = "程序内部指令（未知 IDL）";
    base.summary = [
      `${program.name} 指令，需要该程序的 IDL 才能解析参数。`,
      `前 8 字节鉴别器：0x${bytesToHex(data.slice(0, 8), false)}${data.length > 8 ? `，参数区 ${data.length - 8} 字节` : ""}`,
    ];
    base.note = `前 8 字节通常是 Anchor discriminator；可在“Anchor IDL”中粘贴该程序 IDL 以解析参数。`;
  } else {
    base.name = `未知程序指令（tag ${data[0]}）`;
    base.summary = [`未识别的程序 ${shorten(programId)}，原始数据 ${data.length} 字节。`];
  }
  if (program.note) {
    base.note = base.note ? `${base.note} ${program.note}` : program.note;
  }
  return base;
}

// ------------------------------------------------------- transaction parse

function readShortVec(bytes: Uint8Array, offset: number): { value: number; size: number } {
  let value = 0;
  let size = 0;
  for (;;) {
    if (offset + size >= bytes.length) {
      throw new CalldataError("compact-u16 读取越界");
    }
    const byte = bytes[offset + size];
    value |= (byte & 0x7f) << (size * 7);
    size += 1;
    if ((byte & 0x80) === 0) {
      break;
    }
    if (size > 3) {
      throw new CalldataError("compact-u16 长度异常");
    }
  }
  return { value, size };
}

export interface SolanaInstructionCompiled {
  programIdIndex: number;
  accountIndexes: number[];
  data: Uint8Array;
}

export interface SolanaAddressLookup {
  accountKey: string;
  writableIndexes: number[];
  readonlyIndexes: number[];
}

export interface SolanaMessage {
  version: "legacy" | number;
  header: {
    numRequiredSignatures: number;
    numReadonlySignedAccounts: number;
    numReadonlyUnsignedAccounts: number;
  };
  staticAccountKeys: string[];
  recentBlockhash: string;
  instructions: SolanaInstructionCompiled[];
  addressTableLookups: SolanaAddressLookup[];
}

export interface ParsedSolanaTransaction {
  signatures: string[];
  message: SolanaMessage;
}

function parseMessage(bytes: Uint8Array, start: number): SolanaMessage {
  let offset = start;
  const first = bytes[offset];
  let version: "legacy" | number = "legacy";
  let headerOffset = offset;
  if ((first & 0x80) !== 0) {
    version = first & 0x7f;
    headerOffset = offset + 1;
  }
  const header = {
    numRequiredSignatures: bytes[headerOffset],
    numReadonlySignedAccounts: bytes[headerOffset + 1],
    numReadonlyUnsignedAccounts: bytes[headerOffset + 2],
  };
  if (!header.numRequiredSignatures) {
    throw new CalldataError("消息头无效（签名为 0）");
  }
  offset = headerOffset + 3;

  const keyCount = readShortVec(bytes, offset);
  offset += keyCount.size;
  if (keyCount.value > 256) {
    throw new CalldataError("账户数量异常");
  }
  const staticAccountKeys: string[] = [];
  for (let i = 0; i < keyCount.value; i += 1) {
    if (offset + 32 > bytes.length) {
      throw new CalldataError("账户公钥数据不足");
    }
    staticAccountKeys.push(bytesToBase58(bytes.slice(offset, offset + 32)));
    offset += 32;
  }

  if (offset + 32 > bytes.length) {
    throw new CalldataError("缺少 recentBlockhash");
  }
  const recentBlockhash = bytesToBase58(bytes.slice(offset, offset + 32));
  offset += 32;

  const instructionCount = readShortVec(bytes, offset);
  offset += instructionCount.size;
  const instructions: SolanaInstructionCompiled[] = [];
  for (let i = 0; i < instructionCount.value; i += 1) {
    const programIdIndex = bytes[offset];
    offset += 1;
    const accountsLen = readShortVec(bytes, offset);
    offset += accountsLen.size;
    if (offset + accountsLen.value > bytes.length) {
      throw new CalldataError("指令账户索引数据不足");
    }
    const accountIndexes = Array.from(bytes.slice(offset, offset + accountsLen.value));
    offset += accountsLen.value;
    const dataLen = readShortVec(bytes, offset);
    offset += dataLen.size;
    if (offset + dataLen.value > bytes.length) {
      throw new CalldataError("指令数据不足");
    }
    const data = bytes.slice(offset, offset + dataLen.value);
    offset += dataLen.value;
    instructions.push({ programIdIndex, accountIndexes, data });
  }

  const addressTableLookups: SolanaAddressLookup[] = [];
  if (version !== "legacy") {
    const lookupCount = readShortVec(bytes, offset);
    offset += lookupCount.size;
    for (let i = 0; i < lookupCount.value; i += 1) {
      if (offset + 32 > bytes.length) {
        throw new CalldataError("地址查找表数据不足");
      }
      const accountKey = bytesToBase58(bytes.slice(offset, offset + 32));
      offset += 32;
      const writable = readShortVec(bytes, offset);
      offset += writable.size;
      const writableIndexes = Array.from(bytes.slice(offset, offset + writable.value));
      offset += writable.value;
      const readonly = readShortVec(bytes, offset);
      offset += readonly.size;
      const readonlyIndexes = Array.from(bytes.slice(offset, offset + readonly.value));
      offset += readonly.value;
      addressTableLookups.push({ accountKey, writableIndexes, readonlyIndexes });
    }
  }

  if (offset !== bytes.length) {
    throw new CalldataError(
      `消息解析结束位置（${offset}）与数据长度（${bytes.length}）不一致`
    );
  }

  return {
    version,
    header,
    staticAccountKeys,
    recentBlockhash,
    instructions,
    addressTableLookups,
  };
}

export function parseSolanaTransaction(bytes: Uint8Array): ParsedSolanaTransaction {
  const signatureCount = readShortVec(bytes, 0);
  if (signatureCount.value === 0 || signatureCount.value > 32) {
    throw new CalldataError("签名数量异常，可能不是一笔完整交易");
  }
  let offset = signatureCount.size;
  const signatures: string[] = [];
  for (let i = 0; i < signatureCount.value; i += 1) {
    if (offset + 64 > bytes.length) {
      throw new CalldataError("签名数据不足");
    }
    signatures.push(bytesToBase58(bytes.slice(offset, offset + 64)));
    offset += 64;
  }
  const message = parseMessage(bytes, offset);
  if (message.header.numRequiredSignatures !== signatureCount.value) {
    throw new CalldataError("签名数量与消息头不一致");
  }
  return { signatures, message };
}

function resolveAccountKeys(message: SolanaMessage): string[] {
  const keys = [...message.staticAccountKeys];
  message.addressTableLookups.forEach((lookup, index) => {
    lookup.writableIndexes.forEach((slot) => keys.push(`ALT#${index}·w${slot}`));
    lookup.readonlyIndexes.forEach((slot) => keys.push(`ALT#${index}·r${slot}`));
  });
  return keys;
}

function accountFlags(
  message: SolanaMessage,
  index: number
): { signer: boolean; writable: boolean } {
  const {
    numRequiredSignatures: signers,
    numReadonlySignedAccounts: readonlySigners,
    numReadonlyUnsignedAccounts: readonlyUnsigned,
  } = message.header;
  const total = message.staticAccountKeys.length;
  if (index < signers) {
    return { signer: true, writable: index < signers - readonlySigners };
  }
  const unsignedWritable = total - signers - readonlyUnsigned;
  return { signer: false, writable: index < signers + unsignedWritable };
}

// ------------------------------------------------------------- analysis

export interface SolanaAnalysis {
  summary: string[];
  risks: SolanaRisk[];
  solTransfers: { from?: string; to?: string; lamports: bigint }[];
  tokenTransfers: {
    mint?: string;
    from?: string;
    to?: string;
    amount: bigint;
    decimals?: number;
  }[];
  approvals: { mint?: string; from?: string; delegate?: string; amount: bigint; unlimited?: boolean }[];
  programs: { id: string; name: string; count: number }[];
  compute: SolanaCompute;
  priorityFeeLamports?: bigint;
  notes: string[];
  unknownInstructions: number;
}

function analyzeTransaction(
  message: SolanaMessage,
  instructions: SolanaInstructionView[]
): SolanaAnalysis {
  const solTransfers: SolanaAnalysis["solTransfers"] = [];
  const tokenTransfers: SolanaAnalysis["tokenTransfers"] = [];
  const approvals: SolanaAnalysis["approvals"] = [];
  const risks: SolanaRisk[] = [];
  const notes: string[] = [];
  const summary: string[] = [];
  const compute: SolanaCompute = {};
  const programCounts = new Map<string, number>();
  let unknownInstructions = 0;

  for (const instruction of instructions) {
    programCounts.set(instruction.programId, (programCounts.get(instruction.programId) ?? 0) + 1);
    if (!instruction.known) {
      unknownInstructions += 1;
    }
    if (instruction.compute) {
      Object.assign(compute, instruction.compute);
    }
    for (const effect of instruction.effects) {
      switch (effect.type) {
        case "sol-transfer":
          if (effect.amount !== undefined) {
            solTransfers.push({ from: effect.from, to: effect.to, lamports: effect.amount });
          }
          break;
        case "account-create":
          if (effect.amount !== undefined) {
            solTransfers.push({ from: effect.from, to: effect.to, lamports: effect.amount });
          }
          break;
        case "token-transfer":
          if (effect.amount !== undefined) {
            tokenTransfers.push({
              mint: effect.mint,
              from: effect.from,
              to: effect.to,
              amount: effect.amount,
              decimals: effect.decimals,
            });
          }
          break;
        case "token-approve":
          if (effect.amount !== undefined) {
            approvals.push({
              mint: effect.mint,
              from: effect.from,
              delegate: effect.to,
              amount: effect.amount,
              unlimited: effect.unlimited,
            });
            if (effect.unlimited) {
              risks.push({
                level: "high",
                title: "无限代币授权",
                detail: `授权额度为 u64 上限，${shorten(effect.to ?? "?")} 可以转走该代币账户的全部余额。`,
              });
            }
          }
          break;
        case "authority-change":
          risks.push({
            level: "high",
            title: "变更权限（SetAuthority）",
            detail: "该指令会改变代币或账户的控制权，请确认新权限方是否可信。",
          });
          break;
        case "account-close":
          risks.push({
            level: "medium",
            title: "关闭账户",
            detail: `账户 ${shorten(effect.from ?? "?")} 被关闭，剩余租金转给 ${
              effect.to ? shorten(effect.to) : "?"
            }。`,
          });
          break;
        case "token-mint":
          notes.push(
            `存在增发指令：${effect.amount?.toString() ?? "?"} 单位${
              effect.decimals !== undefined && effect.amount !== undefined
                ? `（${formatAmount(effect.amount, effect.decimals)}）`
                : ""
            }。`
          );
          break;
        default:
          break;
      }
    }
  }

  // 计算优先费
  let priorityFeeLamports: bigint | undefined;
  if (compute.unitPrice !== undefined && compute.unitLimit !== undefined) {
    priorityFeeLamports = (compute.unitPrice * BigInt(compute.unitLimit)) / 1_000_000n;
  }

  // 汇总
  summary.push(
    `共 ${instructions.length} 条指令，涉及 ${programCounts.size} 个程序${
      message.addressTableLookups.length > 0
        ? `，并使用 ${message.addressTableLookups.length} 张地址查找表`
        : ""
    }。`
  );

  if (solTransfers.length > 0) {
    const total = solTransfers.reduce((sum, item) => sum + item.lamports, 0n);
    summary.push(`SOL 流动 ${solTransfers.length} 笔，合计 ${formatLamports(total)}。`);
    for (const transfer of solTransfers.slice(0, 6)) {
      summary.push(
        `· ${formatLamports(transfer.lamports)}：${shorten(transfer.from ?? "?")} → ${shorten(
          transfer.to ?? "?"
        )}`
      );
    }
  } else {
    summary.push("没有发现直接的 SOL 转账。");
  }

  if (tokenTransfers.length > 0) {
    const grouped = new Map<string, { total: bigint; decimals?: number; mint?: string }>();
    for (const transfer of tokenTransfers) {
      const key = transfer.mint ?? "(未知 mint)";
      const current = grouped.get(key) ?? { total: 0n, decimals: transfer.decimals, mint: transfer.mint };
      current.total += transfer.amount;
      if (transfer.decimals !== undefined) {
        current.decimals = transfer.decimals;
      }
      grouped.set(key, current);
    }
    for (const [key, item] of grouped) {
      const amountText =
        item.decimals !== undefined
          ? `${formatAmount(item.total, item.decimals)}（精度 ${item.decimals}）`
          : `${item.total.toString()}（原始单位，未使用 TransferChecked）`;
      summary.push(`代币转移：${shorten(item.mint ?? key)} 合计 ${amountText}。`);
    }
  }

  if (approvals.length > 0) {
    for (const approval of approvals) {
      const amountText =
        approval.unlimited
          ? "无上限"
          : approval.mint
          ? `${approval.amount.toString()} 单位`
          : approval.amount.toString();
      summary.push(
        `代币授权：${shorten(approval.from ?? "?")} 授权 ${shorten(
          approval.delegate ?? "?"
        )} ${amountText}。`
      );
    }
  }

  if (compute.unitLimit !== undefined || compute.unitPrice !== undefined) {
    const parts: string[] = [];
    if (compute.unitLimit !== undefined) {
      parts.push(`上限 ${compute.unitLimit} CU`);
    }
    if (compute.unitPrice !== undefined) {
      parts.push(`单价 ${compute.unitPrice.toString()} micro-lamports`);
    }
    if (priorityFeeLamports !== undefined) {
      parts.push(`预计优先费 ≈ ${formatLamports(priorityFeeLamports)}`);
    }
    summary.push(`计算预算：${parts.join("，")}。`);
  }

  if (message.addressTableLookups.length > 0) {
    notes.push(
      "该交易使用了地址查找表（ALT），部分账户地址由链上表格解析，本工具未读取链上数据，因此以 ALT#… 占位显示。"
    );
  }

  if (unknownInstructions > 0) {
    notes.push(`${unknownInstructions} 条指令无法完整解析，可能涉及 DeFi 程序的内部逻辑。`);
    risks.push({
      level: "info",
      title: "存在未解析指令",
      detail: "DeFi 协议的 CPI 内部调用不在交易指令列表中，资金最终流向需要结合程序日志判断。",
    });
  }

  const unknownPrograms = instructions.filter((item) => !item.programKnown);
  if (unknownPrograms.length > 0) {
    risks.push({
      level: "medium",
      title: "存在未知程序",
      detail: `本次交易调用了 ${new Set(unknownPrograms.map((i) => i.programId)).size} 个未收录的程序，请核对其 ID。`,
    });
  }

  const programs = Array.from(programCounts.entries())
    .map(([id, count]) => ({ id, name: describeProgram(id).name, count }))
    .sort((a, b) => b.count - a.count);

  return {
    summary,
    risks,
    solTransfers,
    tokenTransfers,
    approvals,
    programs,
    compute,
    priorityFeeLamports,
    notes,
    unknownInstructions,
  };
}

// ------------------------------------------------------------- public API

export type SolanaEncoding = "auto" | "hex" | "base58" | "base64";

function decodeByEncoding(input: string, encoding: SolanaEncoding): { bytes: Uint8Array; encoding: string } {
  const text = input.trim();
  if (!text) {
    throw new CalldataError("请输入 Solana 指令数据或交易");
  }
  if (encoding === "hex") {
    return { bytes: hexToBytesFromText(text), encoding: "hex" };
  }
  if (encoding === "base58") {
    return { bytes: fromBase58(text), encoding: "base58" };
  }
  if (encoding === "base64") {
    return { bytes: fromBase64(text), encoding: "base64" };
  }
  // auto
  if (/^0x/i.test(text) || (isHexString(text) && text.length % 2 === 0 && /^[0-9a-fA-F]+$/.test(text))) {
    return { bytes: hexToBytesFromText(text), encoding: "hex" };
  }
  if (/[+/=]/.test(text)) {
    return { bytes: fromBase64(text), encoding: "base64" };
  }
  try {
    return { bytes: fromBase58(text), encoding: "base58" };
  } catch {
    return { bytes: fromBase64(text), encoding: "base64" };
  }
}

function hexToBytesFromText(text: string): Uint8Array {
  return hexToBytes(text);
}

function fromBase58(text: string): Uint8Array {
  return base58ToBytes(text);
}

function fromBase64(text: string): Uint8Array {
  return base64ToBytes(text);
}

export interface SolanaInstructionDataResult {
  encoding: string;
  byteLength: number;
  dataHex: string;
  programId?: string;
  programName?: string;
  programKnown?: boolean;
  instruction: SolanaInstructionView;
  analysis: { summary: string[]; risks: SolanaRisk[] };
}

export interface SolanaInstructionDataOptions {
  programId?: string;
  encoding?: SolanaEncoding;
  idl?: string;
}

export function parseIdl(text?: string): Idl | undefined {
  if (!text || !text.trim()) {
    return undefined;
  }
  try {
    const parsed = JSON.parse(text) as Idl;
    if (!parsed || !Array.isArray(parsed.instructions)) {
      throw new CalldataError("IDL 需要包含 instructions 数组");
    }
    return parsed;
  } catch (err) {
    throw new CalldataError(`Anchor IDL 解析失败：${(err as Error).message}`);
  }
}

export function decodeSolanaInstructionData(
  input: string,
  options: SolanaInstructionDataOptions = {}
): SolanaInstructionDataResult {
  const { bytes, encoding } = decodeByEncoding(input, options.encoding ?? "auto");
  const idl = parseIdl(options.idl);
  const programId = options.programId?.trim() ?? "";
  const view = decodeInstructionView(programId, bytes, [], {
    idl,
    idlEnv: idl ? buildIdlEnv(idl) : undefined,
  });
  const risks: SolanaRisk[] = [];
  for (const effect of view.effects) {
    if (effect.type === "token-approve" && effect.unlimited) {
      risks.push({
        level: "high",
        title: "无限代币授权",
        detail: "授权额度为 u64 上限，被授权方可以转走账户全部余额。",
      });
    }
    if (effect.type === "authority-change") {
      risks.push({
        level: "high",
        title: "变更权限",
        detail: "该指令会改变代币或账户的控制权。",
      });
    }
  }
  return {
    encoding,
    byteLength: bytes.length,
    dataHex: bytesToHex(bytes),
    programId: programId || undefined,
    programName: view.programName,
    programKnown: view.programKnown,
    instruction: view,
    analysis: { summary: view.summary, risks },
  };
}

export interface SolanaTransactionResult {
  encoding: string;
  version: "legacy" | number;
  signatures: string[];
  header: SolanaMessage["header"];
  recentBlockhash: string;
  accountKeys: string[];
  addressTableLookups: SolanaAddressLookup[];
  instructions: SolanaInstructionView[];
  analysis: SolanaAnalysis;
}

export interface SolanaTransactionOptions {
  encoding?: SolanaEncoding;
  idl?: string;
}

export function decodeSolanaTransaction(
  input: string,
  options: SolanaTransactionOptions = {}
): SolanaTransactionResult {
  const { bytes, encoding } = decodeByEncoding(input, options.encoding ?? "auto");
  let parsed: ParsedSolanaTransaction | null = null;
  let lastError: Error | null = null;
  try {
    parsed = parseSolanaTransaction(bytes);
  } catch (err) {
    lastError = err as Error;
  }
  if (!parsed) {
    throw new CalldataError(
      `交易解析失败：${lastError?.message ?? "未知错误"}。请确认粘贴的是完整的序列化交易（base58/base64），而不是单条指令数据。`
    );
  }

  const idl = parseIdl(options.idl);
  const env = idl ? buildIdlEnv(idl) : undefined;
  const accountKeys = resolveAccountKeys(parsed.message);

  const instructions = parsed.message.instructions.map((instruction, index) => {
    const programId = parsed!.message.staticAccountKeys[instruction.programIdIndex] ?? "?";
    const keys = instruction.accountIndexes.map((slot) => accountKeys[slot] ?? `#${slot}`);
    const view = decodeInstructionView(programId, instruction.data, keys, { idl, idlEnv: env });
    const flags = instruction.accountIndexes.map((slot) => accountFlags(parsed!.message, slot));
    view.index = index;
    view.accounts = view.accounts.map((account, position) => ({
      ...account,
      ...flags[position],
    }));
    return view;
  });

  const analysis = analyzeTransaction(parsed.message, instructions);

  return {
    encoding,
    version: parsed.message.version,
    signatures: parsed.signatures,
    header: parsed.message.header,
    recentBlockhash: parsed.message.recentBlockhash,
    accountKeys,
    addressTableLookups: parsed.message.addressTableLookups,
    instructions,
    analysis,
  };
}

export function solanaTransactionToJson(result: SolanaTransactionResult): Record<string, unknown> {
  return {
    encoding: result.encoding,
    version: result.version,
    signatures: result.signatures,
    recentBlockhash: result.recentBlockhash,
    header: result.header,
    accountKeys: result.accountKeys,
    addressTableLookups: result.addressTableLookups,
    instructions: result.instructions.map((instruction) => ({
      index: instruction.index,
      programId: instruction.programId,
      programName: instruction.programName,
      name: instruction.name,
      known: instruction.known,
      accounts: instruction.accounts,
      args: instruction.args,
      summary: instruction.summary,
      data: instruction.dataHex,
      note: instruction.note,
    })),
    analysis: {
      ...result.analysis,
      priorityFeeLamports: result.analysis.priorityFeeLamports?.toString(),
      solTransfers: result.analysis.solTransfers.map((item) => ({
        from: item.from,
        to: item.to,
        lamports: item.lamports.toString(),
      })),
      tokenTransfers: result.analysis.tokenTransfers.map((item) => ({
        ...item,
        amount: item.amount.toString(),
      })),
      approvals: result.analysis.approvals.map((item) => ({
        ...item,
        amount: item.amount.toString(),
      })),
      compute: {
        ...result.analysis.compute,
        unitPrice: result.analysis.compute.unitPrice?.toString(),
      },
    },
  };
}

export { ZERO_KEY, PROGRAM_KIND_LABEL };
