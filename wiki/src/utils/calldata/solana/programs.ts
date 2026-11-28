export type SolanaProgramKind =
  | "system"
  | "token"
  | "ata"
  | "compute"
  | "memo"
  | "stake"
  | "vote"
  | "loader"
  | "sysvar"
  | "defi"
  | "other";

export interface SolanaProgramInfo {
  id: string;
  name: string;
  kind: SolanaProgramKind;
  note?: string;
}

const PROGRAMS: SolanaProgramInfo[] = [
  {
    id: "11111111111111111111111111111111",
    name: "System Program",
    kind: "system",
  },
  {
    id: "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA",
    name: "SPL Token Program",
    kind: "token",
  },
  {
    id: "TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb",
    name: "SPL Token-2022",
    kind: "token",
    note: "Token-2022 在基础指令之外还有扩展指令。",
  },
  {
    id: "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL",
    name: "Associated Token Account",
    kind: "ata",
  },
  {
    id: "ComputeBudget111111111111111111111111111111",
    name: "Compute Budget",
    kind: "compute",
  },
  {
    id: "Memo1UhkJRfHyvLMcVucJwxXeuD728EqVDDwQDxFMNo",
    name: "Memo v1",
    kind: "memo",
  },
  {
    id: "MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr",
    name: "Memo v2",
    kind: "memo",
  },
  {
    id: "Stake11111111111111111111111111111111111111",
    name: "Stake Program",
    kind: "stake",
  },
  {
    id: "Vote111111111111111111111111111111111111111",
    name: "Vote Program",
    kind: "vote",
  },
  {
    id: "BPFLoaderUpgradeab1e11111111111111111111111",
    name: "BPF Loader (Upgradeable)",
    kind: "loader",
  },
  {
    id: "AddressLookupTab1e1111111111111111111111111",
    name: "Address Lookup Table",
    kind: "sysvar",
  },
  {
    id: "Ed25519SigVerify111111111111111111111111111",
    name: "Ed25519 SigVerify",
    kind: "other",
  },
  {
    id: "KeccakSecp256k11111111111111111111111111111",
    name: "Secp256k1 SigVerify",
    kind: "other",
  },
  {
    id: "JUP6LkbZbjS1jKKwapdHNy74zcZ3tLUZoi5QNyVTaV4",
    name: "Jupiter Aggregator v6",
    kind: "defi",
    note: "聚合器，通常包含深层的 CPI 调用。",
  },
  {
    id: "JUP4Fb2cqiRUcaTHdrPC8h2gNsA2ETXiPDD33WcGuJB",
    name: "Jupiter Aggregator v4",
    kind: "defi",
  },
  {
    id: "675kPX9MHTjS2zt1qfr1NYHuzeLXfQM9H24wFSUt1Mp8",
    name: "Raydium AMM v4",
    kind: "defi",
  },
  {
    id: "CAMMCzo5YL8w4VFF8KVHrK22GGUsp5VTaW7grrKgrWqK",
    name: "Raydium CLMM",
    kind: "defi",
  },
  {
    id: "CPMMoo8L3F4NbTegBCKVNunggL7H1ZpdTHKxQB5qKP1C",
    name: "Raydium CPMM",
    kind: "defi",
  },
  {
    id: "whirLbMiicVdio4qvUfM5KAg6Ct8VwpYzGff3uctyCc",
    name: "Orca Whirlpool",
    kind: "defi",
  },
  {
    id: "LBUZKhRxPF3XUpBCjp4YzTKgLccjZhTSDM9YuVaPwxo",
    name: "Meteora DLMM",
    kind: "defi",
  },
  {
    id: "Eo7WjKq67rjJQSZxS6z3YkapzY3eMj6Xy8X5EQVn5UaB",
    name: "Meteora Dynamic Pools",
    kind: "defi",
  },
  {
    id: "6EF8rrecthR5Dkzon8Nwu78hRvfCKubJ14M5uBEwF6P",
    name: "pump.fun",
    kind: "defi",
  },
  {
    id: "pAMMBay6oceH9fJKBRHGP5D4bD4sWpmSwMn52FMfXEA",
    name: "pump.fun AMM (PumpSwap)",
    kind: "defi",
  },
  {
    id: "GovER5Lthms3bLBqWub97yVrMmEogzX7xNjdXpPPCVZw",
    name: "SPL Governance",
    kind: "defi",
  },
  {
    id: "MarBmsSgKXdrN1egZf5sqe1TMai9K1rChYNDJgjq7aD",
    name: "Marinade Finance",
    kind: "defi",
  },
  {
    id: "Jito4APyf642JPZPx3hGc6WWJ8zPKtRbRs4P815Awbb",
    name: "Jito Stake Pool",
    kind: "defi",
  },
  {
    id: "worm2ZoG2kUd4vFXhvjh93UUH596ayRfgQ2MgjNMTth",
    name: "Wormhole Token Bridge",
    kind: "defi",
  },
  {
    id: "metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s",
    name: "Metaplex Token Metadata",
    kind: "other",
  },
  {
    id: "SysvarRent111111111111111111111111111111111",
    name: "Rent Sysvar",
    kind: "sysvar",
  },
  {
    id: "SysvarC1ock11111111111111111111111111111111",
    name: "Clock Sysvar",
    kind: "sysvar",
  },
  {
    id: "Sysvar1nstructions1111111111111111111111111",
    name: "Instructions Sysvar",
    kind: "sysvar",
  },
  {
    id: "SysvarRecentB1ockHashes11111111111111111111",
    name: "Recent Blockhashes Sysvar",
    kind: "sysvar",
  },
];

export const SOLANA_PROGRAMS: SolanaProgramInfo[] = PROGRAMS;

export const SOLANA_PROGRAM_BY_ID: Record<string, SolanaProgramInfo> = PROGRAMS.reduce(
  (acc, program) => {
    acc[program.id] = program;
    return acc;
  },
  {} as Record<string, SolanaProgramInfo>
);

export function describeProgram(id: string): {
  id: string;
  name: string;
  kind: SolanaProgramKind;
  known: boolean;
  note?: string;
} {
  const info = SOLANA_PROGRAM_BY_ID[id];
  if (info) {
    return { ...info, known: true };
  }
  return { id, name: "未知程序", kind: "other", known: false };
}

export const PROGRAM_KIND_LABEL: Record<SolanaProgramKind, string> = {
  system: "系统程序",
  token: "代币程序",
  ata: "关联代币账户",
  compute: "计算预算",
  memo: "备注",
  stake: "质押",
  vote: "投票",
  loader: "程序加载器",
  sysvar: "系统变量",
  defi: "DeFi 协议",
  other: "其它",
};
