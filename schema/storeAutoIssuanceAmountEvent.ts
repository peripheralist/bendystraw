import { onchainTable, primaryKey } from "ponder";
import { eventParams, projectId } from "../src/util/schema";

export const storeAutoIssuanceAmountEvent = onchainTable(
  "store_auto_issuance_amount_event",
  (t) => ({
    ...eventParams(t),
    ...projectId(t),
    stageId: t.bigint().notNull(),
    beneficiary: t.hex().notNull(),
    count: t.bigint().notNull(),
  }),
  (t) => ({
    pk: primaryKey({ columns: [t.txHash, t.txIndex] }),
  })
);
