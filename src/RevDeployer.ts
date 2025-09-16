import { ponder } from "ponder:registry";
import { autoIssueEvent, storeAutoIssuanceAmountEvent } from "ponder:schema";
import { insertActivityEvent } from "./util/activityEvent";
import { getEventParams } from "./util/getEventParams";
import { getVersion } from "./util/getVersion";

ponder.on("RevDeployer:AutoIssue", async ({ event, context }) => {
  try {
    const { revnetId, beneficiary, count, stageId } = event.args;

    const { id } = await context.db.insert(autoIssueEvent).values({
      ...getEventParams({ event, context }),
      projectId: Number(revnetId),
      beneficiary,
      count,
      stageId,
    });

    const version = getVersion(event, "revDeployer5");

    await insertActivityEvent("autoIssueEvent", {
      id,
      event,
      context,
      projectId: revnetId,
      version,
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

    // note, *i think* storeAutoIssuanceAmount is emitted before project is created, so we can't create an activityEvent
  } catch (e) {
    console.error("RevDeployer:StoreAutoIssuanceAmount", e);
  }
});
