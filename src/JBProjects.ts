import { ponder } from "ponder:registry";
import { project, projectCreateEvent, suckerGroup } from "ponder:schema";
import { isAddressEqual } from "viem";
import { ADDRESS } from "./constants/address";
import { insertActivityEvent } from "./util/activityEvent";
import { getEventParams } from "./util/getEventParams";
import { getVersion } from "./util/getVersion";
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

    const revDeployerAddress =
      version === 5 ? ADDRESS.revDeployer5 : ADDRESS.revDeployer;

    // create project
    await context.db.insert(project).values({
      id: idForProject(version, projectId, chainId),
      suckerGroupId: idOfSuckerGroup,
      projectId,
      owner,
      deployer: caller,
      isRevnet: isAddressEqual(owner, revDeployerAddress),
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
      version,
    });
  } catch (e) {
    console.error("JBProjects:Create", e);
  }
});

ponder.on("JBProjects:Transfer", async ({ event, context }) => {
  try {
    const version = getVersion(event, "jbProjects");

    const revDeployerAddress =
      version === 5 ? ADDRESS.revDeployer5 : ADDRESS.revDeployer;

    const owner = event.args.to;

    await context.db
      .update(project, {
        chainId: context.chain.id,
        projectId: Number(event.args.tokenId),
        version,
      })
      .set({
        owner,
        isRevnet: isAddressEqual(owner, revDeployerAddress),
      });
  } catch (e) {
    console.error("JBProjects:Transfer", e);
  }
});
