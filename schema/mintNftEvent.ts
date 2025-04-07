import { onchainTable, primaryKey } from "ponder";
import { eventParams, projectId } from "../src/util/schema";

export const mintNftEvent = onchainTable(
  "mint_nft_event",
  (t) => ({
    ...eventParams(t),
    ...projectId(t),
    hook: t.hex().notNull(),
    beneficiary: t.hex().notNull(),
    tierId: t.integer().notNull(),
    tokenId: t.bigint().notNull(),
    totalAmountPaid: t.bigint().notNull(),
  }),
  (t) => ({
    pk: primaryKey({ columns: [t.txHash, t.tokenId] }),
  })
);
