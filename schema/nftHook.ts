import { onchainTable, primaryKey } from "ponder";
import { chainId, createdAt, projectId } from "../src/util/schema";

export const nftHook = onchainTable(
  "nft_hook",
  (t) => ({
    ...chainId(t),
    ...projectId(t),
    ...createdAt(t),
    address: t.hex().notNull(),
    name: t.text(),
    symbol: t.text(),
  }),
  (t) => ({
    pk: primaryKey({ columns: [t.chainId, t.address] }),
  })
);
