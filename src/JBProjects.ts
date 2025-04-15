import { ponder } from "ponder:registry";
import { project, projectCreateEvent } from "ponder:schema";
import { getEventParams } from "./util/getEventParams";

ponder.on("JBProjects:Create", async ({ event, context }) => {
  try {
    const { args, transaction, block } = event;
    const { projectId: _projectId, owner, caller } = args;
    const { chainId } = context.network;
    const projectId = Number(_projectId);

    await Promise.all([
      context.db.insert(project).values({
        projectId,
        owner,
        deployer: caller,
        creator: transaction.from,
        createdAt: Number(block.timestamp),
        chainId,
      }),
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
