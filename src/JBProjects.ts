import { ponder } from "ponder:registry";
import { project, projectCreateEvent, suckerGroup } from "ponder:schema";
import { getEventParams } from "./util/getEventParams";

ponder.on("JBProjects:Create", async ({ event, context }) => {
  try {
    const { args, transaction, block } = event;
    const { projectId: _projectId, owner, caller } = args;
    const { chainId } = context.network;
    const projectId = Number(_projectId);

    // create project
    const _project = await context.db.insert(project).values({
      projectId,
      owner,
      deployer: caller,
      creator: transaction.from,
      createdAt: Number(block.timestamp),
      chainId,
    });

    // create sucker group. creating a sucker group for all projects ensures we can query all projects by querying sucker groups
    const _suckerGroup = await context.db
      .insert(suckerGroup)
      .values({ projects: [_project.id] });

    await Promise.all([
      // update project to point to sucker group
      context.db
        .update(project, { projectId, chainId })
        .set({ suckerGroup: _suckerGroup.id }),
      // create project create event
      context.db.insert(projectCreateEvent).values({
        ...getEventParams({ event, context }),
        projectId,
      }),
    ]);
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
