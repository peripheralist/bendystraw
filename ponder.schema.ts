import { onchainTable, primaryKey } from "ponder";

export const nft = onchainTable(
  "nft",
  (t) => ({
    chainId: t.integer(),
    tokenId: t.bigint(),
    projectId: t.integer(),
    hook: t.hex(),
  }),
  (table) => ({
    pk: primaryKey({ columns: [table.chainId, table.hook, table.tokenId] }),
  })
);

export const nftTier = onchainTable(
  "nft_tier",
  (t) => ({
    tierId: t.bigint().notNull(),
    chainId: t.integer().notNull(),
    hook: t.hex(),
    price: t.bigint().notNull(),
    allowOnwerMint: t.boolean(),
    encodedIpfsUri: t.hex(),
    resolvedUri: t.text(),
    initialSupply: t.integer(),
    remainingSupply: t.integer(),
    cannotBeRemoved: t.boolean(),
    transfersPausable: t.boolean(),
    votingUnits: t.integer(),
    createdAt: t.bigint(),
    category: t.integer(),
    reserveFrequency: t.integer(),
    reserveBeneficiary: t.hex(),
    svg: t.text(), // only used for bannyverse,
  }),
  (table) => ({
    pk: primaryKey({ columns: [table.chainId, table.hook, table.tierId] }),
  })
);

export const nftHook = onchainTable(
  "nft_hook",
  (t) => ({
    chainId: t.integer().notNull(),
    address: t.hex().notNull(),
    projectId: t.bigint(),
    name: t.text(),
    symbol: t.text(),
    createdAt: t.bigint(),
  }),
  (table) => ({
    pk: primaryKey({ columns: [table.chainId, table.address] }),
  })
);

export const project = onchainTable(
  "project",
  (t) => ({
    chainId: t.integer().notNull(),
    projectId: t.bigint().notNull(),
    handle: t.text(),
    deployer: t.hex().notNull(),
    metadataUri: t.text(),
    owner: t.hex().notNull(),
    creator: t.hex().notNull(),
    createdAt: t.bigint().notNull(),
    // paymentsCount: t.integer().notNull().default(0),
    contributorsCount: t.integer().notNull().default(0),
    // redeemCount: t.integer().notNull().default(0),
    volume: t.bigint().notNull().default(BigInt(0)),
    volumeUSD: t.bigint().notNull().default(BigInt(0)),
    redeemVolume: t.bigint().notNull().default(BigInt(0)),
    redeemVolumeUsd: t.bigint().notNull().default(BigInt(0)),
    // nftsMintedCount: t.integer().notNull().default(0),
    balance: t.bigint().notNull().default(BigInt(0)),
    tokenSupply: t.bigint().notNull().default(BigInt(0)),
    // trendingScore: t.bigint().notNull().default(BigInt(0)),
    // trendingVolume: t.bigint().notNull().default(BigInt(0)),
    // trendingPaymentsCount: t.integer().notNull().default(0),
    // createdWithinTrendingWindow: t.boolean(),
  }),
  (table) => ({ pk: primaryKey({ columns: [table.chainId, table.projectId] }) })
);
