import { onchainTable } from "ponder";

export const internal = onchainTable("internal", (t) => ({
  chainId: t.integer().notNull().primaryKey(),
  volume: t.bigint().notNull(),
  volumeUsd: t.bigint().notNull(),
}));
