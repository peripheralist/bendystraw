import { onchainTable } from "ponder";

export const wallet = onchainTable("wallet", (t) => ({
  address: t.hex().notNull().primaryKey(),
  volume: t.bigint().notNull().default(BigInt(0)),
  // volumeUSD: t.bigint().notNull().default(BigInt(0)),
  lastPaidTimestamp: t.integer().notNull().default(0),
}));
