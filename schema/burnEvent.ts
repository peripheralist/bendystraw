import { onchainTable, primaryKey } from "ponder";
import {
  chainId,
  from,
  projectId,
  timestamp,
  txHash,
  txIndex,
} from "../src/util/schema";

export const burnEvent = onchainTable(
  "burn_event",
  (t) => ({
    ...chainId(t),
    ...from(t),
    ...timestamp(t),
    ...txHash(t),
    ...txIndex(t),
    ...projectId(t),
    amount: t.bigint().notNull(),
    creditAmount: t.bigint().notNull(),
    erc20Amount: t.bigint().notNull(),
  }),
  (t) => ({
    pk: primaryKey({ columns: [t.txHash, t.txIndex] }),
  })
);
