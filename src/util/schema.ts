import { onchainTable } from "ponder";

// hacky extraction of `PgColumnsBuilders` type that isn't exported by ponder
type PGCB<
  name extends string = string,
  columns extends Record<string, any> = Record<string, any>,
  record extends Record<string, any> = Record<string, any>
> = Parameters<typeof onchainTable<name, columns, record>>[1] extends
  | columns
  | ((columnTypes: infer ColumnTypes) => columns)
  ? ColumnTypes
  : never;

export const projectId = (t: PGCB) => ({ projectId: t.integer().notNull() });
export const chainId = (t: PGCB) => ({ chainId: t.integer().notNull() });
export const timestamp = (t: PGCB) => ({ timestamp: t.integer().notNull() });
export const createdAt = (t: PGCB) => ({ createdAt: t.integer().notNull() });
export const txHash = (t: PGCB) => ({ txHash: t.hex().notNull() });
export const txIndex = (t: PGCB) => ({ txIndex: t.integer().notNull() });
export const caller = (t: PGCB) => ({ caller: t.hex().notNull() });
export const from = (t: PGCB) => ({ from: t.hex().notNull() });

export const eventParams = (t: PGCB) => ({
  ...chainId(t),
  ...txHash(t),
  ...txIndex(t),
  ...timestamp(t),
  ...caller(t),
  ...from(t),
});
