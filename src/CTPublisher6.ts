import { ponder } from "ponder:registry";
import { recordPostingAllowance } from "./util/postingAllowance";

ponder.on("CTPublisher6:ConfigurePostingCriteria", async ({ event, context }) => {
  await recordPostingAllowance(event, context);
});
