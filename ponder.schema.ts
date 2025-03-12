import { onchainTable, primaryKey } from "ponder";

export const nfts = onchainTable(
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

export const projects = onchainTable(
  "projects",
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
