import { onchainTable, primaryKey } from "ponder";
import { eventParams, projectId } from "../src/util/schema";

export const mintTokensEvent = onchainTable(
  "mint_tokens_event",
  (t) => ({
    ...eventParams(t),
    ...projectId(t),
    beneficiary: t.hex().notNull(),
    beneficiaryTokenCount: t.bigint().notNull(),
    reservedPercent: t.bigint().notNull(),
    tokenCount: t.bigint().notNull(),
    memo: t.text(),
  }),
  (t) => ({
    pk: primaryKey({ columns: [t.txHash, t.txIndex] }),
  })
);
