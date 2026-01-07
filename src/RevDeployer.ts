import { ponder } from "ponder:registry";
import { autoIssueEvent, project, storeAutoIssuanceAmountEvent } from "ponder:schema";
import { insertActivityEvent } from "./util/activityEvent";
import { getEventParams } from "./util/getEventParams";
import { getVersion } from "./util/getVersion";

ponder.on("RevDeployer:AutoIssue", async ({ event, context }) => {
  try {
    const { revnetId, beneficiary, count, stageId } = event.args;

    const version = getVersion(event, "revDeployer");

    const _project = await context.db.find(project, {
      projectId: Number(revnetId),
      chainId: context.chain.id,
      version,
    });

    if (!_project) {
      throw new Error("Missing project");
    }

    const { id } = await context.db.insert(autoIssueEvent).values({
      ...getEventParams({ event, context }),
      projectId: Number(revnetId),
      suckerGroupId: _project.suckerGroupId,
      beneficiary,
      count,
      stageId,
      version,
    });

    await insertActivityEvent("autoIssueEvent", {
      id,
      event,
      context,
      projectId: revnetId,
      suckerGroupId: _project.suckerGroupId,
      version,
    });
  } catch (e) {
    console.error("RevDeployer:AutoIssue", e);
  }
});

ponder.on("RevDeployer:StoreAutoIssuanceAmount", async ({ event, context }) => {
  try {
    const { revnetId, beneficiary, count, stageId } = event.args;

    const version = getVersion(event, "revDeployer");

    await context.db.insert(storeAutoIssuanceAmountEvent).values({
      ...getEventParams({ event, context }),
      projectId: Number(revnetId),
      beneficiary,
      count,
      stageId,
      version,
    });

    // note, *i think* storeAutoIssuanceAmount is emitted before project is created, so we can't create an activityEvent
  } catch (e) {
    console.error("RevDeployer:StoreAutoIssuanceAmount", e);
  }
});
