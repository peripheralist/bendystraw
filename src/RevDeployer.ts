import { ponder } from "ponder:registry";
import { autoIssueEvent } from "../schema/autoIssueEvent";
import { storeAutoIssuanceAmountEvent } from "../schema/storeAutoIssuanceAmountEvent";
import { getEventParams } from "./util/getEventParams";

ponder.on("RevDeployer:AutoIssue", async ({ event, context }) => {
  try {
    const { revnetId, beneficiary, count, stageId } = event.args;

    await context.db.insert(autoIssueEvent).values({
      ...getEventParams({ event, context }),
      projectId: Number(revnetId),
      beneficiary,
      count,
      stageId,
    });
  } catch (e) {
    console.error("RevDeployer:AutoIssue", e);
  }
});

ponder.on("RevDeployer:StoreAutoIssuanceAmount", async ({ event, context }) => {
  try {
    const { revnetId, beneficiary, count, stageId } = event.args;

    await context.db.insert(storeAutoIssuanceAmountEvent).values({
      ...getEventParams({ event, context }),
      projectId: Number(revnetId),
      beneficiary,
      count,
      stageId,
    });
  } catch (e) {
    console.error("RevDeployer:StoreAutoIssuanceAmount", e);
  }
});
