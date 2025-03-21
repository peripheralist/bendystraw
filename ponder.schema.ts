import { onchainTable, primaryKey } from "ponder";

export const nft = onchainTable(
  "nft",
  (t) => ({
    chainId: t.integer().notNull(),
    hook: t.hex().notNull(),
    tokenId: t.bigint().notNull(),
    projectId: t.bigint().notNull(),
    owner: t.hex().notNull(),
    category: t.integer().notNull(),
    createdAt: t.bigint().notNull(),
    tokenUri: t.text(),
  }),
  (table) => ({
    pk: primaryKey({ columns: [table.chainId, table.hook, table.tokenId] }),
  })
);

export const nftTier = onchainTable(
  "nft_tier",
  (t) => ({
    chainId: t.integer().notNull(),
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
    votingUnits: t.integer(),
    createdAt: t.bigint().notNull(),
    category: t.integer(),
    reserveFrequency: t.integer(),
    reserveBeneficiary: t.hex(),
    svg: t.text(), // only Banny,
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
    projectId: t.bigint().notNull(),
    name: t.text(),
    symbol: t.text(),
    createdAt: t.bigint().notNull(),
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

export const decorateBannyEvent = onchainTable(
  "decorate_banny_event",
  (t) => ({
    chainId: t.integer().notNull(),
    txHash: t.hex().notNull(),
    timestamp: t.bigint(),
    caller: t.hex().notNull(),
    hook: t.hex().notNull(),
    bannyBodyId: t.bigint().notNull(),
    outfitIds: t.bigint().array(),
    backgroundId: t.bigint(),
    tokenUri: t.text(),
  }),
  (table) => ({ pk: primaryKey({ columns: [table.chainId, table.txHash] }) })
);
