import { onchainTable } from "ponder";

export * from "./schema/addToBalanceEvent";
export * from "./schema/autoIssueEvent";
export * from "./schema/burnEvent";
export * from "./schema/cashOutTokensEvent";
export * from "./schema/decorateBannyEvent";
export * from "./schema/deployErc20Event";
export * from "./schema/mintNftEvent";
export * from "./schema/mintTokensEvent";
export * from "./schema/nft";
export * from "./schema/nftHook";
export * from "./schema/nftTier";
export * from "./schema/participant";
export * from "./schema/payEvent";
export * from "./schema/permissionHolder";
export * from "./schema/project";
export * from "./schema/projectCreateEvent";
export * from "./schema/relations";
export * from "./schema/sendPayoutsEvent";
export * from "./schema/sendPayoutToSplitEvent";
export * from "./schema/sendReservedTokensToSplitEvent";
export * from "./schema/sendReservedTokensToSplitsEvent";
export * from "./schema/stats";
export * from "./schema/storeAutoIssuanceAmountEvent";
export * from "./schema/useAllowanceEvent";
// export * from "./schema/wallet";

export const wallet = onchainTable("wallet", (t) => ({
  address: t.hex().primaryKey(),
  volume: t.bigint().notNull().default(BigInt(0)),
  volumeUsd: t.bigint().notNull().default(BigInt(0)),
  lastPaidTimestamp: t.integer().notNull().default(0),
}));

// export const walletRelations = relations(wallet, ({ many }) => ({
//   participants: many(participant),
//   nfts: many(nft),
// }));
