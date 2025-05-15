import { ponder } from "ponder:registry";
import { project, projectCreateEvent, suckerGroup } from "ponder:schema";
import { getEventParams } from "./util/getEventParams";
import { insertActivityEvent } from "./util/activityEvent";
import { projectMoment } from "ponder:schema";
import { tryUpdateSuckerGroup } from "./util/suckerGroup";
import { generateId } from "./util/id";

ponder.on("JBProjects:Create", async ({ event, context }) => {
  try {
    const { args, transaction, block } = event;
    const { projectId: _projectId, owner, caller } = args;
    const { chainId } = context.network;
    const projectId = Number(_projectId);

    const suckerGroupId = generateId();

    // create project
    let _project = await context.db.insert(project).values({
      projectId,
      owner,
      deployer: caller,
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

    // // insert project moment
    // await context.db
    //   .insert(projectMoment)
    //   .values({
    //     ..._project,
    //     block: Number(event.block.number),
    //     timestamp: Number(event.block.timestamp),
    //   })
    //   .onConflictDoUpdate(() => ({
    //     ..._project,
    //     block: Number(event.block.number),
    //     timestamp: Number(event.block.timestamp),
    //   }));

    await tryUpdateSuckerGroup({
      suckerGroupId,
      event,
      context,
    });

    // insert event
    const { id } = await context.db.insert(projectCreateEvent).values({
      ...getEventParams({ event, context }),
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
        chainId: context.network.chainId,
        projectId: Number(event.args.tokenId),
      })
      .set({
        owner: event.args.to,
      });
  } catch (e) {
    console.error("JBProjects:Transfer", e);
  }
});
