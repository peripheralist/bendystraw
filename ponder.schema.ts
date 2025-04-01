import { onchainTable, primaryKey } from "ponder";

// hacky extraction of `PgColumnsBuilders` type that isn't exported by ponder
type PGCB<
  name extends string = string,
  columns extends Record<string, any> = Record<string, any>,
  record extends Record<string, any> = Record<string, any>
> = Parameters<typeof onchainTable<name, columns, record>>[1] extends
  | columns
  | ((columnTypes: infer ColumnTypes) => columns)
  ? ColumnTypes
  : never;

const projectId = (t: PGCB) => ({ projectId: t.bigint().notNull() });
const chainId = (t: PGCB) => ({ chainId: t.integer().notNull() });
const timestamp = (t: PGCB) => ({ timestamp: t.bigint().notNull() });
const createdAt = (t: PGCB) => ({ createdAt: t.bigint().notNull() });
const txHash = (t: PGCB) => ({ txHash: t.hex().notNull() });
const txIndex = (t: PGCB) => ({ txIndex: t.integer().notNull() });
const caller = (t: PGCB) => ({ caller: t.hex().notNull() });
const from = (t: PGCB) => ({ from: t.hex().notNull() });

const eventParams = (t: PGCB) => ({
  ...chainId(t),
  ...txHash(t),
  ...txIndex(t),
  ...timestamp(t),
  ...caller(t),
  ...from(t),
});

export const internal = onchainTable("internal", (t) => ({
  totalPaid: t.bigint().notNull(),
}));

export const nft = onchainTable(
  "nft",
  (t) => ({
    ...chainId(t),
    ...projectId(t),
    ...createdAt(t),
    hook: t.hex().notNull(),
    tokenId: t.bigint().notNull(),
    owner: t.hex().notNull(),
    category: t.integer().notNull(),
    tokenUri: t.text(),
  }),
  (t) => ({
    pk: primaryKey({ columns: [t.chainId, t.hook, t.tokenId] }),
  })
);

export const nftTier = onchainTable(
  "nft_tier",
  (t) => ({
    ...chainId(t),
    ...projectId(t),
    hook: t.hex().notNull(),
    tierId: t.bigint().notNull(),
    price: t.bigint().notNull(),
    allowOnwerMint: t.boolean(),
    encodedIpfsUri: t.hex(),
    resolvedUri: t.text(),
    initialSupply: t.integer(),
    remainingSupply: t.integer(),
    cannotBeRemoved: t.boolean(),
    transfersPausable: t.boolean(),
    votingUnits: t.bigint(),
    createdAt: t.bigint().notNull(),
    category: t.integer(),
    reserveFrequency: t.integer(),
    reserveBeneficiary: t.hex(),
    svg: t.text(), // only Banny,
  }),
  (t) => ({
    pk: primaryKey({ columns: [t.chainId, t.hook, t.tierId] }),
  })
);

export const nftHook = onchainTable(
  "nft_hook",
  (t) => ({
    ...chainId(t),
    ...projectId(t),
    ...createdAt(t),
    address: t.hex().notNull(),
    name: t.text(),
    symbol: t.text(),
  }),
  (t) => ({
    pk: primaryKey({ columns: [t.chainId, t.address] }),
  })
);

export const project = onchainTable(
  "project",
  (t) => ({
    ...chainId(t),
    ...projectId(t),
    ...createdAt(t),
    handle: t.text(),
    deployer: t.hex().notNull(),
    metadataUri: t.text(),
    owner: t.hex().notNull(),
    creator: t.hex().notNull(),
    // paymentsCount: t.integer().notNull().default(0),
    contributorsCount: t.integer().notNull().default(0),
    // redeemCount: t.integer().notNull().default(0),
    totalPaid: t.bigint().notNull().default(BigInt(0)),
    totalPaidUSD: t.bigint().notNull().default(BigInt(0)),
    totalRedeemed: t.bigint().notNull().default(BigInt(0)),
    totalRedeemedUsd: t.bigint().notNull().default(BigInt(0)),
    // nftsMintedCount: t.integer().notNull().default(0),
    balance: t.bigint().notNull().default(BigInt(0)),
    tokenSupply: t.bigint().notNull().default(BigInt(0)),
    // trendingScore: t.bigint().notNull().default(BigInt(0)),
    // trendingVolume: t.bigint().notNull().default(BigInt(0)),
    // trendingPaymentsCount: t.integer().notNull().default(0),
    // createdWithinTrendingWindow: t.boolean(),
  }),
  (t) => ({ pk: primaryKey({ columns: [t.chainId, t.projectId] }) })
);

export const mintTokensEvent = onchainTable(
  "mint_tokens_event",
  (t) => ({
    ...eventParams(t),
    ...projectId(t),
    beneficiary: t.hex().notNull(),
    beneficiaryTokenCount: t.bigint().notNull(),
    reservedPercent: t.bigint().notNull(),
    tokenCount: t.bigint().notNull(),
    memo: t.text(),
  }),
  (t) => ({
    pk: primaryKey({ columns: [t.chainId, t.txHash, t.txIndex] }),
  })
);

export const decorateBannyEvent = onchainTable(
  "decorate_banny_event",
  (t) => ({
    ...eventParams(t),
    bannyBodyId: t.bigint().notNull(),
    outfitIds: t.bigint().array(),
    backgroundId: t.bigint(),
    tokenUri: t.text(),
  }),
  (t) => ({
    pk: primaryKey({ columns: [t.chainId, t.txHash, t.txIndex] }),
  })
);

export const sendReservedTokensToSplitsEvent = onchainTable(
  "send_reserved_tokens_to_splits_event",
  (t) => ({
    ...eventParams(t),
    ...projectId(t),
    rulesetCycleNumber: t.bigint().notNull(),
    rulesetId: t.bigint().notNull(),
    tokenCount: t.bigint().notNull(),
    leftoverAmount: t.bigint().notNull(),
    owner: t.hex().notNull(),
  }),
  (t) => ({
    pk: primaryKey({ columns: [t.chainId, t.txHash, t.txIndex] }),
  })
);

export const sendReservedTokensToSplitEvent = onchainTable(
  "send_reserved_tokens_to_split_event",
  (t) => ({
    ...eventParams(t),
    ...projectId(t),
    rulesetId: t.bigint().notNull(),
    tokenCount: t.bigint().notNull(),
    groupId: t.bigint().notNull(),
    beneficiary: t.hex().notNull(),
    hook: t.hex().notNull(),
    lockedUntil: t.integer().notNull(),
    percent: t.integer().notNull(),
    preferAddToBalance: t.boolean().notNull(),
    splitProjectId: t.bigint().notNull(),
  }),
  (t) => ({
    pk: primaryKey({ columns: [t.chainId, t.txHash, t.txIndex] }),
  })
);

export const sendPayoutToSplitEvent = onchainTable(
  "send_payout_to_split_event",
  (t) => ({
    ...eventParams(t),
    ...projectId(t),
    amount: t.bigint().notNull(),
    netAmount: t.bigint().notNull(),
    // amountUsd: t.bigint().notNull(),
    beneficiary: t.hex().notNull(),
    lockedUntil: t.integer().notNull(),
    percent: t.integer().notNull(),
    preferAddToBalance: t.boolean().notNull(),
    splitProjectId: t.bigint().notNull(),
    hook: t.hex().notNull(),
    group: t.bigint().notNull(),
    rulesetId: t.bigint().notNull(),
  }),
  (t) => ({
    pk: primaryKey({ columns: [t.chainId, t.txHash, t.txIndex] }),
  })
);

export const addToBalanceEvent = onchainTable(
  "add_to_balance_event",
  (t) => ({
    ...eventParams(t),
    ...projectId(t),
    amount: t.bigint().notNull(),
    memo: t.text(),
    metadata: t.hex().notNull(),
    returnedFees: t.bigint().notNull(),
  }),
  (t) => ({
    pk: primaryKey({ columns: [t.chainId, t.txHash, t.txIndex] }),
  })
);

export const sendPayoutsEvent = onchainTable(
  "send_payouts_event",
  (t) => ({
    ...eventParams(t),
    ...projectId(t),
    amount: t.bigint().notNull(),
    amountPaidOut: t.bigint().notNull(),
    netLeftoverPayoutAmount: t.bigint().notNull(),
    // amountUsd: t.bigint().notNull(),
    // amountPaidOutUsd: t.bigint().notNull(),
    fee: t.bigint().notNull(),
    // feeUsd: t.bigint().notNull(),
    rulesetId: t.bigint().notNull(),
    rulesetCycleNumber: t.bigint().notNull(),
  }),
  (t) => ({
    pk: primaryKey({ columns: [t.chainId, t.txHash, t.txIndex] }),
  })
);

export const cashOutTokensEvent = onchainTable(
  "cash_out_tokens_event",
  (t) => ({
    ...eventParams(t),
    ...projectId(t),
    cashOutCount: t.bigint().notNull(),
    beneficiary: t.hex().notNull(),
    holder: t.hex().notNull(),
    reclaimAmount: t.bigint().notNull(),
    cashOutTaxRate: t.bigint().notNull(),
    // reclaimAmountUsd: t.bigint().notNull(),
    metadata: t.hex().notNull(),
    rulesetCycleNumber: t.bigint().notNull(),
    rulesetId: t.bigint().notNull(),
  }),
  (t) => ({
    pk: primaryKey({ columns: [t.chainId, t.txHash, t.txIndex] }),
  })
);

export const useAllowanceEvent = onchainTable(
  "use_allowance_event",
  (t) => ({
    ...eventParams(t),
    ...projectId(t),
    amount: t.bigint().notNull(),
    amountPaidOut: t.bigint().notNull(),
    netAmountPaidOut: t.bigint().notNull(),
    beneficiary: t.hex().notNull(),
    feeBeneficiary: t.hex().notNull(),
    memo: t.text(),
    rulesetCycleNumber: t.bigint().notNull(),
    rulesetId: t.bigint().notNull(),
  }),
  (t) => ({
    pk: primaryKey({ columns: [t.chainId, t.txHash, t.txIndex] }),
  })
);

// type TypeOfPg = {
//   ["PgHex"]: `0x${string}`;
//   ["PgEvmBigint"]: bigint;
//   ["PgInteger"]: number;
//   ["PgBytes"]: Buffer;
//   ["PgText"]: string;
// };

// export type PgRowType<Table> = {
//   [ColumnName in keyof Table as Table[ColumnName] extends {
//     columnType: keyof TypeOfPg;
//   }
//     ? ColumnName
//     : never]: Table[ColumnName] extends {
//     columnType: keyof TypeOfPg;
//   }
//     ? Table[ColumnName] extends { notNull: infer NotNull }
//       ? NotNull extends true
//         ? TypeOfPg[Table[ColumnName]["columnType"]]
//         : TypeOfPg[Table[ColumnName]["columnType"]] | null
//       : never
//     : never;
// };
