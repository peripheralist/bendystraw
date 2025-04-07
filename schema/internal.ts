import { onchainTable } from "ponder";

export const internal = onchainTable("internal", (t) => ({
  chainId: t.integer().notNull().primaryKey(),
  totalPaid: t.bigint().notNull(),
}));
