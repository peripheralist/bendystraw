import { ponder } from "ponder:registry";
import { autoIssueEvent, project } from "ponder:schema";
import { insertActivityEvent } from "./util/activityEvent";
import { getEventParams } from "./util/getEventParams";

// In V6 the AutoIssue event is emitted by REVOwner (not the REVDeployer, as in V4/V5). REVOwner only
// exists for V6, so the version is always 6. The configured allocation amounts (StoreAutoIssuanceAmount)
// remain on the REVDeployer — see src/RevDeployer.ts.
ponder.on("REVOwner:AutoIssue", async ({ event, context }) => {
  try {
    const { revnetId, beneficiary, count, stageId } = event.args;
    const version = 6 as const;

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
    console.error("REVOwner:AutoIssue", e);
  }
});
