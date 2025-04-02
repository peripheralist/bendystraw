import { onchainTable, primaryKey, relations } from "ponder";

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

const projectId = (t: PGCB) => ({ projectId: t.integer().notNull() });
const chainId = (t: PGCB) => ({ chainId: t.integer().notNull() });
const timestamp = (t: PGCB) => ({ timestamp: t.integer().notNull() });
const createdAt = (t: PGCB) => ({ createdAt: t.integer().notNull() });
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
  chainId: t.integer().notNull().primaryKey(),
  totalPaid: t.bigint().notNull(),
}));

export const nft = onchainTable(
  "nft",
  (t) => ({
    ...chainId(t),
    ...projectId(t),
    ...createdAt(t),
    hook: t.hex().notNull(),
    tokenId: t.integer().notNull(),
    owner: t.hex().notNull(),
    category: t.integer().notNull(),
    tokenUri: t.text(),
    tierId: t.integer().notNull(),
  }),
  (t) => ({
    pk: primaryKey({ columns: [t.chainId, t.hook, t.tokenId] }),
  })
);

export const nftRelations = relations(nft, ({ one }) => ({
  tier: one(nftTier, {
    fields: [nft.tierId, nft.chainId],
    references: [nftTier.tierId, nftTier.chainId],
  }),
  project: one(project, {
    fields: [nft.projectId, nft.chainId],
    references: [project.projectId, project.chainId],
  }),
  hook: one(nftHook, {
    fields: [nft.hook, nft.chainId],
    references: [nftHook.address, nftHook.chainId],
  }),
  // owner TODO
}));

export const nftTier = onchainTable(
  "nft_tier",
  (t) => ({
    ...chainId(t),
    ...projectId(t),
    hook: t.hex().notNull(),
    tierId: t.integer().notNull(),
    price: t.bigint().notNull(),
    allowOnwerMint: t.boolean(),
    encodedIpfsUri: t.hex(),
    resolvedUri: t.text(),
    initialSupply: t.integer().notNull(),
    remainingSupply: t.integer().notNull(),
    cannotBeRemoved: t.boolean(),
    transfersPausable: t.boolean(),
    votingUnits: t.bigint(),
    createdAt: t.integer().notNull(),
    category: t.integer().notNull(),
    reserveFrequency: t.integer(),
    reserveBeneficiary: t.hex(),
    svg: t.text(), // only Banny,
  }),
  (t) => ({
    pk: primaryKey({ columns: [t.chainId, t.hook, t.tierId] }),
  })
);

export const nftTierRelations = relations(nftTier, ({ many, one }) => ({
  nfts: many(nft),
  project: one(project, {
    fields: [nftTier.projectId, nftTier.chainId],
    references: [project.projectId, project.chainId],
  }),
  hook: one(nftHook, {
    fields: [nftTier.hook, nftTier.chainId],
    references: [nftHook.address, nftHook.chainId],
  }),
}));

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

export const nftHookRelations = relations(nftHook, ({ many, one }) => ({
  nfts: many(nft),
  nftTiers: many(nftTier),
  project: one(project, {
    fields: [nftHook.projectId, nftHook.chainId],
    references: [project.projectId, project.chainId],
  }),
}));

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

export const projectRelations = relations(project, ({ many, one }) => ({
  nfts: many(nft),
  nftHooks: many(nftHook),
  mintTokensEvents: many(mintTokensEvent),
  sendPayoutsEvents: many(sendPayoutsEvent),
  sendPayoutToSplitEvents: many(sendPayoutToSplitEvent),
  sendReservedTokensToSplitsEvents: many(sendReservedTokensToSplitsEvent),
  sendReservedTokensToSplitEvents: many(sendReservedTokensToSplitEvent),
  addToBalanceEvents: many(addToBalanceEvent),
  cashOutTokensEvents: many(cashOutTokensEvent),
  useAllowanceEvents: many(useAllowanceEvent),
  payEvents: many(payEvent),
  mintNftEvents: many(mintNftEvent),
}));

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

export const mintTokensEventRelations = relations(
  mintTokensEvent,
  ({ one }) => ({
    project: one(project, {
      fields: [mintTokensEvent.projectId, mintTokensEvent.chainId],
      references: [project.projectId, project.chainId],
    }),
  })
);

export const decorateBannyEvent = onchainTable(
  "decorate_banny_event",
  (t) => ({
    ...eventParams(t),
    bannyBodyId: t.integer().notNull(),
    outfitIds: t.integer().array(),
    backgroundId: t.integer(),
    tokenUri: t.text(),
  }),
  (t) => ({
    pk: primaryKey({ columns: [t.chainId, t.txHash, t.txIndex] }),
  })
);

export const decorateBannyEventRelations = relations(
  decorateBannyEvent,
  ({ one }) => ({
    bannyNft: one(nft, {
      fields: [decorateBannyEvent.bannyBodyId, decorateBannyEvent.chainId],
      references: [nft.tokenId, nft.chainId],
    }),
  })
);

export const sendReservedTokensToSplitsEvent = onchainTable(
  "send_reserved_tokens_to_splits_event",
  (t) => ({
    ...eventParams(t),
    ...projectId(t),
    rulesetCycleNumber: t.integer().notNull(),
    rulesetId: t.integer().notNull(),
    tokenCount: t.bigint().notNull(),
    leftoverAmount: t.bigint().notNull(),
    owner: t.hex().notNull(),
  }),
  (t) => ({
    pk: primaryKey({ columns: [t.chainId, t.txHash, t.txIndex] }),
  })
);

export const sendReservedTokensToSplitsEventRelations = relations(
  sendReservedTokensToSplitsEvent,
  ({ one }) => ({
    project: one(project, {
      fields: [
        sendReservedTokensToSplitsEvent.projectId,
        sendReservedTokensToSplitsEvent.chainId,
      ],
      references: [project.projectId, project.chainId],
    }),
  })
);

export const sendReservedTokensToSplitEvent = onchainTable(
  "send_reserved_tokens_to_split_event",
  (t) => ({
    ...eventParams(t),
    ...projectId(t),
    rulesetId: t.integer().notNull(),
    tokenCount: t.bigint().notNull(),
    groupId: t.bigint().notNull(),
    beneficiary: t.hex().notNull(),
    hook: t.hex().notNull(),
    lockedUntil: t.integer().notNull(),
    percent: t.integer().notNull(),
    preferAddToBalance: t.boolean().notNull(),
    splitProjectId: t.integer().notNull(),
  }),
  (t) => ({
    pk: primaryKey({ columns: [t.chainId, t.txHash, t.txIndex] }),
  })
);

export const sendReservedTokensToSplitEventRelations = relations(
  sendReservedTokensToSplitEvent,
  ({ one }) => ({
    project: one(project, {
      fields: [
        sendReservedTokensToSplitEvent.projectId,
        sendReservedTokensToSplitEvent.chainId,
      ],
      references: [project.projectId, project.chainId],
    }),
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
    splitProjectId: t.integer().notNull(),
    hook: t.hex().notNull(),
    group: t.bigint().notNull(),
    rulesetId: t.integer().notNull(),
  }),
  (t) => ({
    pk: primaryKey({ columns: [t.chainId, t.txHash, t.txIndex] }),
  })
);

export const sendPayoutToSplitEventRelations = relations(
  sendPayoutToSplitEvent,
  ({ one }) => ({
    project: one(project, {
      fields: [
        sendPayoutToSplitEvent.projectId,
        sendPayoutToSplitEvent.chainId,
      ],
      references: [project.projectId, project.chainId],
    }),
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

export const addToBalanceEventRelations = relations(
  addToBalanceEvent,
  ({ one }) => ({
    project: one(project, {
      fields: [addToBalanceEvent.projectId, addToBalanceEvent.chainId],
      references: [project.projectId, project.chainId],
    }),
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
    rulesetId: t.integer().notNull(),
    rulesetCycleNumber: t.integer().notNull(),
  }),
  (t) => ({
    pk: primaryKey({ columns: [t.chainId, t.txHash, t.txIndex] }),
  })
);

export const sendPayoutsEventRelations = relations(
  sendPayoutsEvent,
  ({ one }) => ({
    project: one(project, {
      fields: [sendPayoutsEvent.projectId, sendPayoutsEvent.chainId],
      references: [project.projectId, project.chainId],
    }),
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

export const cashOutTokensEventRelations = relations(
  cashOutTokensEvent,
  ({ one }) => ({
    project: one(project, {
      fields: [cashOutTokensEvent.projectId, cashOutTokensEvent.chainId],
      references: [project.projectId, project.chainId],
    }),
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
    rulesetCycleNumber: t.integer().notNull(),
    rulesetId: t.integer().notNull(),
  }),
  (t) => ({
    pk: primaryKey({ columns: [t.chainId, t.txHash, t.txIndex] }),
  })
);

export const useAllowanceEventRelations = relations(
  useAllowanceEvent,
  ({ one }) => ({
    project: one(project, {
      fields: [useAllowanceEvent.projectId, useAllowanceEvent.chainId],
      references: [project.projectId, project.chainId],
    }),
  })
);

export const payEvent = onchainTable(
  "pay_event",
  (t) => ({
    ...eventParams(t),
    ...projectId(t),
    distributionFromProjectId: t.integer(),
    beneficiary: t.hex().notNull(),
    amount: t.bigint().notNull(),
    // amountUSD: BigInt
    memo: t.text(),
    feeFromProject: t.integer(), // Int # Indicates payment is a fee from project with this ID
    newlyIssuedTokenCount: t.bigint().notNull(),
  }),
  (t) => ({
    pk: primaryKey({ columns: [t.chainId, t.txHash, t.txIndex] }),
  })
);

export const payEventRelations = relations(payEvent, ({ one }) => ({
  project: one(project, {
    fields: [payEvent.projectId, payEvent.chainId],
    references: [project.projectId, project.chainId],
  }),
}));

export const mintNftEvent = onchainTable(
  "mint_nft_event",
  (t) => ({
    ...eventParams(t),
    ...projectId(t),
    hook: t.hex().notNull(),
    beneficiary: t.hex().notNull(),
    tierId: t.integer().notNull(),
    tokenId: t.integer().notNull(),
    totalAmountPaid: t.bigint().notNull(),
  }),
  (t) => ({
    pk: primaryKey({ columns: [t.chainId, t.txHash, t.caller] }),
  })
);

export const mintNftEventRelations = relations(mintNftEvent, ({ one }) => ({
  project: one(project, {
    fields: [mintNftEvent.projectId, mintNftEvent.chainId],
    references: [project.projectId, project.chainId],
  }),
}));
