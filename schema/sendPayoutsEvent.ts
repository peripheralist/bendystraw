import { onchainTable, primaryKey } from "ponder";
import { eventParams, projectId } from "../src/util/schema";

export const sendPayoutsEvent = onchainTable(
  "send_payouts_event",
  (t) => ({
    ...eventParams(t),
    ...projectId(t),
    amount: t.bigint().notNull(),
    amountPaidOut: t.bigint().notNull(),
    netLeftoverPayoutAmount: t.bigint().notNull(),
    // amountUsd: t.bigint().notNull(),
    // amountPaidOutUsd: t.bigint().notNull(),
    fee: t.bigint().notNull(),
    // feeUsd: t.bigint().notNull(),
    rulesetId: t.integer().notNull(),
    rulesetCycleNumber: t.integer().notNull(),
  }),
  (t) => ({
    pk: primaryKey({ columns: [t.txHash, t.txIndex] }),
  })
);
