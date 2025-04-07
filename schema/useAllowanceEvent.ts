import { onchainTable, primaryKey } from "ponder";
import { eventParams, projectId } from "../src/util/schema";

export const useAllowanceEvent = onchainTable(
  "use_allowance_event",
  (t) => ({
    ...eventParams(t),
    ...projectId(t),
    amount: t.bigint().notNull(),
    amountPaidOut: t.bigint().notNull(),
    netAmountPaidOut: t.bigint().notNull(),
    beneficiary: t.hex().notNull(),
    feeBeneficiary: t.hex().notNull(),
    memo: t.text(),
    rulesetCycleNumber: t.integer().notNull(),
    rulesetId: t.integer().notNull(),
  }),
  (t) => ({
    pk: primaryKey({ columns: [t.txHash, t.txIndex] }),
  })
);
