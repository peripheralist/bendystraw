import { onchainTable } from "ponder";

export const stats = onchainTable("stats", (t) => ({
  chainId: t.integer().notNull().primaryKey(),
  volume: t.bigint().notNull(),
  volumeUsd: t.bigint().notNull(),
}));
