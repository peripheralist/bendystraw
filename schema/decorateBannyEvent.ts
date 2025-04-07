import { onchainTable, primaryKey } from "ponder";
import { eventParams } from "../src/util/schema";

export const decorateBannyEvent = onchainTable(
  "decorate_banny_event",
  (t) => ({
    ...eventParams(t),
    bannyBodyId: t.bigint().notNull(),
    outfitIds: t.bigint().array(),
    backgroundId: t.bigint(),
    tokenUri: t.text(),
  }),
  (t) => ({
    pk: primaryKey({ columns: [t.txHash, t.txIndex] }),
  })
);
