import { ponder } from "ponder:registry";
import { project, projectCreateEvent, suckerGroup } from "ponder:schema";
import { insertActivityEvent } from "./util/activityEvent";
import { getEventParams } from "./util/getEventParams";
import { onProjectStatsUpdated } from "./util/onProjectStatsUpdated";
import { generateId } from "./util/id";
import { ADDRESS } from "./constants/address";

ponder.on("JBProjects:Create", async ({ event, context }) => {
  try {
    const { args, transaction, block } = event;
    const { projectId: _projectId, owner, caller } = args;
    const { id: chainId } = context.chain;
    const projectId = Number(_projectId);

    // generate suckerGroupId manually so we can create project + suckerGroup simultaneously
    const suckerGroupId = generateId();

    // create project
    let _project = await context.db.insert(project).values({
      projectId,
      owner,
      deployer: caller,
      isRevnet: caller.toLowerCase() === ADDRESS.revDeployer.toLowerCase(),
      creator: transaction.from,
      createdAt: Number(block.timestamp),
      chainId,
      suckerGroupId,
    });

    // create sucker group. creating a sucker group for all projects ensures we can query all projects by querying sucker groups
    await context.db.insert(suckerGroup).values({
      projects: [_project.id],
      tokenSupply: _project.tokenSupply,
      id: suckerGroupId,
      createdAt: Number(block.timestamp),
    });

    await onProjectStatsUpdated({
      projectId,
      event,
      context,
    });

    // insert event
    const { id } = await context.db.insert(projectCreateEvent).values({
      ...getEventParams({ event, context }),
      suckerGroupId,
      projectId,
    });
    await insertActivityEvent("projectCreateEvent", {
      id,
      event,
      context,
      projectId,
    });
  } catch (e) {
    console.error("JBProjects:Create", e);
  }
});

ponder.on("JBProjects:Transfer", async ({ event, context }) => {
  try {
    await context.db
      .update(project, {
        chainId: context.chain.id,
        projectId: Number(event.args.tokenId),
      })
      .set({
        owner: event.args.to,
      });
  } catch (e) {
    console.error("JBProjects:Transfer", e);
  }
});
