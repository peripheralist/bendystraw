import { ponder } from "ponder:registry";
import { project } from "ponder:schema";

ponder.on("JBProjects:Create", async ({ event, context }) => {
  const { args, transaction, block } = event;
  const { projectId, owner, caller } = args;
  const { chainId } = context.network;

  await context.db.insert(project).values({
    projectId: Number(projectId),
    owner,
    deployer: caller,
    creator: transaction.from,
    createdAt: Number(block.timestamp),
    chainId,
  });
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
