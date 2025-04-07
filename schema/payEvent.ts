import { onchainTable, primaryKey } from "ponder";
import { eventParams, projectId } from "../src/util/schema";

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
