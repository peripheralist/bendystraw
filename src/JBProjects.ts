import { ponder } from "ponder:registry";
import { project } from "ponder:schema";

ponder.on("JBProjects:Approval", async ({ event, context }) => {
  // console.log(event.args);
});

ponder.on("JBProjects:ApprovalForAll", async ({ event, context }) => {
  // console.log(event.args);
});

ponder.on("JBProjects:Create", async ({ event, context }) => {
  const { args, transaction, block } = event;
  const { projectId, owner, caller } = args;
  const { chainId } = context.network;

  await context.db.insert(project).values({
    projectId,
    owner,
    deployer: caller,
    creator: transaction.from,
    createdAt: block.timestamp,
    chainId,
  });
});

ponder.on("JBProjects:OwnershipTransferred", async ({ event, context }) => {
  // console.log(event.args);
});
