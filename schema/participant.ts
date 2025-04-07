import { onchainTable, primaryKey } from "ponder";
import { chainId, projectId } from "../src/util/schema";

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
