import { onchainTable, primaryKey } from "ponder";
import { eventParams, projectId } from "../src/util/schema";

export const addToBalanceEvent = onchainTable(
  "add_to_balance_event",
  (t) => ({
    ...eventParams(t),
    ...projectId(t),
    amount: t.bigint().notNull(),
    memo: t.text(),
    metadata: t.hex().notNull(),
    returnedFees: t.bigint().notNull(),
  }),
  (t) => ({
    pk: primaryKey({ columns: [t.txHash, t.txIndex] }),
  })
);
