import { onchainTable, primaryKey } from "ponder";
import { eventParams, projectId } from "../src/util/schema";

export const projectCreateEvent = onchainTable(
  "project_create_event",
  (t) => ({
    ...eventParams(t),
    ...projectId(t),
  }),
  (t) => ({ pk: primaryKey({ columns: [t.chainId, t.projectId] }) })
);
