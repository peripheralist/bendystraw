import { ponder } from "ponder:registry";
import {
  project,
  projectCreateEvent,
  projectTransferEvent,
  suckerGroup,
} from "ponder:schema";
import { zeroAddress } from "viem";
import { insertActivityEvent } from "./util/activityEvent";
import { getEventParams } from "./util/getEventParams";
import { getVersion, isRevnetOwner } from "./util/getVersion";
import { idForProject, idForSuckerGroup } from "./util/id";
import { onProjectStatsUpdated } from "./util/onProjectStatsUpdated";

ponder.on("JBProjects:Create", async ({ event, context }) => {
  try {
    const { args, transaction, block } = event;
    const { projectId: _projectId, owner, caller } = args;
    const { id: chainId } = context.chain;
    const projectId = Number(_projectId);

    const version = getVersion(event, "jbProjects");

    // generate ids so we can create project + suckerGroup simultaneously
    const idOfProject = idForProject(version, projectId, chainId);
    const idOfSuckerGroup = idForSuckerGroup([idOfProject]);

    // create project
    await context.db.insert(project).values({
      id: idForProject(version, projectId, chainId),
      suckerGroupId: idOfSuckerGroup,
      projectId,
      owner,
      deployer: caller,
      isRevnet: isRevnetOwner(owner, version),
      creator: transaction.from,
      createdAt: Number(block.timestamp),
      chainId,
      version,
    });

    // create sucker group. creating a sucker group for all projects ensures we can query all projects by querying sucker groups
    await context.db.insert(suckerGroup).values({
      projects: [idOfProject],
      id: idOfSuckerGroup,
      createdAt: Number(block.timestamp),
      version,
    });

    await onProjectStatsUpdated({
      projectId,
      version,
      event,
      context,
    });

    // insert event
    const { id } = await context.db.insert(projectCreateEvent).values({
      ...getEventParams({ event, context }),
      suckerGroupId: idOfSuckerGroup,
      projectId,
      version,
    });
    await insertActivityEvent("projectCreateEvent", {
      id,
      event,
      context,
      projectId,
      suckerGroupId: idOfSuckerGroup,
      version,
    });
  } catch (e) {
    console.error("JBProjects:Create", e);
  }
});

ponder.on("JBProjects:Transfer", async ({ event, context }) => {
  try {
    const version = getVersion(event, "jbProjects");

    const { from: previousOwner, to: owner, tokenId } = event.args;
    const projectId = Number(tokenId);

    const updatedProject = await context.db
      .update(project, {
        chainId: context.chain.id,
        projectId,
        version,
      })
      .set({
        owner,
        isRevnet: isRevnetOwner(owner, version),
      });

    if (previousOwner === zeroAddress) return;

    const { id } = await context.db.insert(projectTransferEvent).values({
      chainId: context.chain.id,
      version,
      txHash: event.transaction.hash,
      timestamp: Number(event.block.timestamp),
      from: event.transaction.from,
      logIndex: event.log.logIndex,
      projectId,
      suckerGroupId: updatedProject.suckerGroupId,
      previousOwner,
      owner,
    });

    await insertActivityEvent("projectTransferEvent", {
      id,
      event,
      context,
      projectId,
      suckerGroupId: updatedProject.suckerGroupId,
      version,
    });
  } catch (e) {
    console.error("JBProjects:Transfer", e);
  }
});
