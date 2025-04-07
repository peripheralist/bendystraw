import { onchainTable, primaryKey } from "ponder";
import { chainId, createdAt, projectId } from "../src/util/schema";

export const nft = onchainTable(
  "nft",
  (t) => ({
    ...chainId(t),
    ...projectId(t),
    ...createdAt(t),
    hook: t.hex().notNull(),
    tokenId: t.bigint().notNull(),
    owner: t.hex().notNull(),
    category: t.integer().notNull(),
    tokenUri: t.text(),
    tierId: t.integer().notNull(),
  }),
  (t) => ({
    pk: primaryKey({ columns: [t.chainId, t.hook, t.tokenId] }),
  })
);
