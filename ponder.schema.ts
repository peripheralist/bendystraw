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

export const projectId = (t: PGCB) => ({ projectId: t.integer().notNull() });
export const chainId = (t: PGCB) => ({ chainId: t.integer().notNull() });
export const timestamp = (t: PGCB) => ({ timestamp: t.integer().notNull() });
export const createdAt = (t: PGCB) => ({ createdAt: t.integer().notNull() });
export const txHash = (t: PGCB) => ({ txHash: t.hex().notNull() });
export const txIndex = (t: PGCB) => ({ txIndex: t.integer().notNull() });
export const caller = (t: PGCB) => ({ caller: t.hex().notNull() });
export const from = (t: PGCB) => ({ from: t.hex().notNull() });

export const eventParams = (t: PGCB) => ({
  ...chainId(t),
  ...txHash(t),
  ...txIndex(t),
  ...timestamp(t),
  ...caller(t),
  ...from(t),
});

// export * from "./schema/addToBalanceEvent";
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
    pk: primaryKey({ columns: [t.txHash, t.txIndex] }),
  })
);

// export * from "./schema/autoIssueEvent";
export const autoIssueEvent = onchainTable(
  "auto_issue_event",
  (t) => ({
    ...eventParams(t),
    ...projectId(t),
    stageId: t.bigint().notNull(),
    beneficiary: t.hex().notNull(),
    count: t.bigint().notNull(),
  }),
  (t) => ({
    pk: primaryKey({ columns: [t.txHash, t.txIndex] }),
  })
);

// export * from "./schema/burnEvent";
export const burnEvent = onchainTable(
  "burn_event",
  (t) => ({
    ...chainId(t),
    ...from(t),
    ...timestamp(t),
    ...txHash(t),
    ...txIndex(t),
    ...projectId(t),
    amount: t.bigint().notNull(),
    creditAmount: t.bigint().notNull(),
    erc20Amount: t.bigint().notNull(),
  }),
  (t) => ({
    pk: primaryKey({ columns: [t.txHash, t.txIndex] }),
  })
);

// export * from "./schema/cashOutTokensEvent";
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
    reclaimAmountUsd: t.bigint().notNull(),
    metadata: t.hex().notNull(),
    rulesetCycleNumber: t.bigint().notNull(),
    rulesetId: t.bigint().notNull(),
  }),
  (t) => ({
    pk: primaryKey({ columns: [t.txHash, t.txIndex] }),
  })
);

// export * from "./schema/decorateBannyEvent";
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
    pk: primaryKey({ columns: [t.txHash, t.txIndex] }),
  })
);

// export * from "./schema/deployErc20Event";
export const deployErc20Event = onchainTable(
  "deploy_erc20_event",
  (t) => ({
    ...eventParams(t),
    ...projectId(t),
    symbol: t.text().notNull(),
    name: t.text().notNull(),
    token: t.hex().notNull(),
  }),
  (t) => ({
    pk: primaryKey({ columns: [t.chainId, t.token] }),
  })
);

// export * from "./schema/mintNftEvent";
export const mintNftEvent = onchainTable(
  "mint_nft_event",
  (t) => ({
    ...eventParams(t),
    ...projectId(t),
    hook: t.hex().notNull(),
    beneficiary: t.hex().notNull(),
    tierId: t.integer().notNull(),
    tokenId: t.bigint().notNull(),
    totalAmountPaid: t.bigint().notNull(),
  }),
  (t) => ({
    pk: primaryKey({ columns: [t.txHash, t.tokenId] }),
  })
);

// export * from "./schema/mintTokensEvent";
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
    pk: primaryKey({ columns: [t.txHash, t.txIndex] }),
  })
);

// export * from "./schema/nft";
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
    tierId: t.integer().notNull(),
  }),
  (t) => ({
    pk: primaryKey({ columns: [t.chainId, t.hook, t.tokenId] }),
  })
);

// export * from "./schema/nftHook";
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

// export * from "./schema/nftTier";
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

// export * from "./schema/participant";
export const participant = onchainTable(
  "participant",
  (t) => ({
    ...chainId(t),
    ...projectId(t),
    address: t.hex().notNull(),
    volume: t.bigint().notNull().default(BigInt(0)),
    volumeUsd: t.bigint().notNull().default(BigInt(0)),
    lastPaidTimestamp: t.integer().notNull().default(0),
    paymentsCount: t.integer().notNull().default(0),
    balance: t.bigint().notNull().default(BigInt(0)),
    creditBalance: t.bigint().notNull().default(BigInt(0)),
    erc20Balance: t.bigint().notNull().default(BigInt(0)),
  }),
  (t) => ({
    pk: primaryKey({ columns: [t.chainId, t.projectId, t.address] }),
  })
);

// export * from "./schema/payEvent";
export const payEvent = onchainTable(
  "pay_event",
  (t) => ({
    ...eventParams(t),
    ...projectId(t),
    distributionFromProjectId: t.integer(),
    beneficiary: t.hex().notNull(),
    amount: t.bigint().notNull(),
    amountUsd: t.bigint().notNull(),
    memo: t.text(),
    feeFromProject: t.integer(), // Int # Indicates payment is a fee from project with this ID
    newlyIssuedTokenCount: t.bigint().notNull(),
  }),
  (t) => ({
    pk: primaryKey({ columns: [t.txHash, t.txIndex] }),
  })
);

// export * from "./schema/permissionHolder";
export const permissionHolder = onchainTable(
  "permission_holder",
  (t) => ({
    ...chainId(t),
    ...projectId(t),
    account: t.hex().notNull(),
    operator: t.hex().notNull(),
    permissions: t.integer().notNull().array(),
  }),
  (t) => ({
    pk: primaryKey({
      columns: [t.chainId, t.account, t.projectId, t.operator],
    }),
  })
);

// export * from "./schema/project";
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
    paymentsCount: t.integer().notNull().default(0),
    contributorsCount: t.integer().notNull().default(0),
    redeemCount: t.integer().notNull().default(0),
    volume: t.bigint().notNull().default(BigInt(0)),
    volumeUsd: t.bigint().notNull().default(BigInt(0)),
    redeemVolume: t.bigint().notNull().default(BigInt(0)),
    redeemVolumeUsd: t.bigint().notNull().default(BigInt(0)),
    nftsMintedCount: t.integer().notNull().default(0),
    balance: t.bigint().notNull().default(BigInt(0)),
    tokenSupply: t.bigint().notNull().default(BigInt(0)),
    // trendingScore: t.bigint().notNull().default(BigInt(0)),
    // trendingVolume: t.bigint().notNull().default(BigInt(0)),
    // trendingPaymentsCount: t.integer().notNull().default(0),
    // createdWithinTrendingWindow: t.boolean(),
  }),
  (t) => ({ pk: primaryKey({ columns: [t.chainId, t.projectId] }) })
);

// export * from "./schema/projectCreateEvent";
export const projectCreateEvent = onchainTable(
  "project_create_event",
  (t) => ({
    ...eventParams(t),
    ...projectId(t),
  }),
  (t) => ({ pk: primaryKey({ columns: [t.chainId, t.projectId] }) })
);

// export * from "./schema/relations";

// export * from "./schema/sendPayoutsEvent";
export const sendPayoutsEvent = onchainTable(
  "send_payouts_event",
  (t) => ({
    ...eventParams(t),
    ...projectId(t),
    amount: t.bigint().notNull(),
    amountUsd: t.bigint().notNull(),
    amountPaidOut: t.bigint().notNull(),
    amountPaidOutUsd: t.bigint().notNull(),
    netLeftoverPayoutAmount: t.bigint().notNull(),
    fee: t.bigint().notNull(),
    feeUsd: t.bigint().notNull(),
    rulesetId: t.integer().notNull(),
    rulesetCycleNumber: t.integer().notNull(),
  }),
  (t) => ({
    pk: primaryKey({ columns: [t.txHash, t.txIndex] }),
  })
);

// export * from "./schema/sendPayoutToSplitEvent";
export const sendPayoutToSplitEvent = onchainTable(
  "send_payout_to_split_event",
  (t) => ({
    ...eventParams(t),
    ...projectId(t),
    amount: t.bigint().notNull(),
    netAmount: t.bigint().notNull(),
    amountUsd: t.bigint().notNull(),
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
    pk: primaryKey({ columns: [t.txHash, t.txIndex] }),
  })
);

// export * from "./schema/sendReservedTokensToSplitEvent";
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
    pk: primaryKey({ columns: [t.txHash, t.txIndex] }),
  })
);

// export * from "./schema/sendReservedTokensToSplitsEvent";
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
    pk: primaryKey({ columns: [t.txHash, t.txIndex] }),
  })
);

// export * from "./schema/stats";
export const stats = onchainTable("stats", (t) => ({
  chainId: t.integer().notNull().primaryKey(),
  volume: t.bigint().notNull(),
  volumeUsd: t.bigint().notNull(),
}));

// export * from "./schema/storeAutoIssuanceAmountEvent";
export const storeAutoIssuanceAmountEvent = onchainTable(
  "store_auto_issuance_amount_event",
  (t) => ({
    ...eventParams(t),
    ...projectId(t),
    stageId: t.bigint().notNull(),
    beneficiary: t.hex().notNull(),
    count: t.bigint().notNull(),
  }),
  (t) => ({
    pk: primaryKey({ columns: [t.txHash, t.txIndex] }),
  })
);

// export * from "./schema/useAllowanceEvent";
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
    pk: primaryKey({ columns: [t.txHash, t.txIndex] }),
  })
);

// export * from "./schema/wallet";
export const wallet = onchainTable("wallet", (t) => ({
  address: t.hex().primaryKey(),
  volume: t.bigint().notNull().default(BigInt(0)),
  volumeUsd: t.bigint().notNull().default(BigInt(0)),
  lastPaidTimestamp: t.integer().notNull().default(0),
}));

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
  owner: one(participant, {
    fields: [nft.owner, nft.chainId],
    references: [participant.address, participant.chainId],
  }),
  wallet: one(wallet, {
    fields: [nft.owner],
    references: [wallet.address],
  }),
}));

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

export const nftHookRelations = relations(nftHook, ({ many, one }) => ({
  nfts: many(nft),
  nftTiers: many(nftTier),
  project: one(project, {
    fields: [nftHook.projectId, nftHook.chainId],
    references: [project.projectId, project.chainId],
  }),
}));

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
  burnEvents: many(burnEvent),
  deployErc20Events: many(deployErc20Event),
  permissionHolders: many(permissionHolder),
}));

export const projectCreateEventRelations = relations(
  projectCreateEvent,
  ({ one }) => ({
    project: one(project, {
      fields: [projectCreateEvent.projectId, projectCreateEvent.chainId],
      references: [project.projectId, project.chainId],
    }),
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

export const decorateBannyEventRelations = relations(
  decorateBannyEvent,
  ({ one }) => ({
    bannyNft: one(nft, {
      fields: [decorateBannyEvent.bannyBodyId, decorateBannyEvent.chainId],
      references: [nft.tokenId, nft.chainId],
    }),
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

export const addToBalanceEventRelations = relations(
  addToBalanceEvent,
  ({ one }) => ({
    project: one(project, {
      fields: [addToBalanceEvent.projectId, addToBalanceEvent.chainId],
      references: [project.projectId, project.chainId],
    }),
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

export const cashOutTokensEventRelations = relations(
  cashOutTokensEvent,
  ({ one }) => ({
    project: one(project, {
      fields: [cashOutTokensEvent.projectId, cashOutTokensEvent.chainId],
      references: [project.projectId, project.chainId],
    }),
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

export const payEventRelations = relations(payEvent, ({ one }) => ({
  project: one(project, {
    fields: [payEvent.projectId, payEvent.chainId],
    references: [project.projectId, project.chainId],
  }),
}));

export const burnEventRelations = relations(burnEvent, ({ one }) => ({
  project: one(project, {
    fields: [burnEvent.projectId, burnEvent.chainId],
    references: [project.projectId, project.chainId],
  }),
}));

export const deployErc20EventRelations = relations(
  deployErc20Event,
  ({ one }) => ({
    project: one(project, {
      fields: [deployErc20Event.projectId, deployErc20Event.chainId],
      references: [project.projectId, project.chainId],
    }),
  })
);

export const mintNftEventRelations = relations(mintNftEvent, ({ one }) => ({
  project: one(project, {
    fields: [mintNftEvent.projectId, mintNftEvent.chainId],
    references: [project.projectId, project.chainId],
  }),
  tier: one(nftTier, {
    fields: [mintNftEvent.tierId, mintNftEvent.chainId],
    references: [nftTier.tierId, nftTier.chainId],
  }),
  nft: one(nft, {
    fields: [mintNftEvent.tokenId, mintNftEvent.chainId],
    references: [nft.tokenId, nft.chainId],
  }),
}));

export const walletRelations = relations(wallet, ({ many }) => ({
  participants: many(participant),
  nfts: many(nft),
}));

export const storeAutoIssuanceAmountEventRelations = relations(
  storeAutoIssuanceAmountEvent,
  ({ one }) => ({
    project: one(project, {
      fields: [
        storeAutoIssuanceAmountEvent.chainId,
        storeAutoIssuanceAmountEvent.projectId,
      ],
      references: [project.chainId, project.projectId],
    }),
  })
);

export const autoIssueEventRelations = relations(autoIssueEvent, ({ one }) => ({
  project: one(project, {
    fields: [autoIssueEvent.chainId, autoIssueEvent.projectId],
    references: [project.chainId, project.projectId],
  }),
}));

export const participantRelations = relations(participant, ({ one, many }) => ({
  wallet: one(wallet, {
    fields: [participant.address],
    references: [wallet.address],
  }),
  nfts: many(nft),
}));

export const permissionHolderRelations = relations(
  permissionHolder,
  ({ one }) => ({
    project: one(project, {
      fields: [permissionHolder.chainId, permissionHolder.projectId],
      references: [project.chainId, project.projectId],
    }),
  })
);
