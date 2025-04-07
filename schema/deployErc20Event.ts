import { onchainTable, primaryKey } from "ponder";
import { eventParams, projectId } from "../src/util/schema";

export const deployErc20Event = onchainTable(
  "deploy_erc20_event",
  (t) => ({
    ...eventParams(t),
    ...projectId(t),
    symbol: t.text().notNull(),
    name: t.text().notNull(),
    token: t.hex().notNull(),
  }),
  (t) => ({
    pk: primaryKey({ columns: [t.chainId, t.token] }),
  })
);
