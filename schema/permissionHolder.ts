import { onchainTable, primaryKey } from "ponder";
import { chainId, projectId } from "../src/util/schema";

export const permissionHolder = onchainTable(
  "permission_holder",
  (t) => ({
    ...chainId(t),
    ...projectId(t),
    account: t.hex().notNull(),
    operator: t.hex().notNull(),
    permissions: t.integer().notNull().array(),
  }),
  (t) => ({
    pk: primaryKey({
      columns: [t.chainId, t.account, t.projectId, t.operator],
    }),
  })
);
