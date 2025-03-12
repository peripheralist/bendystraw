import { ponder } from "ponder:registry";
import { projects } from "ponder:schema";

ponder.on("JBMultiTerminal:AddToBalance", async ({ event, context }) => {
  const row = await context.db.find(projects, {
    chainId: context.network.chainId,
    projectId: event.args.projectId,
  });

  if (!row) return;

  await context.db
    .update(projects, {
      chainId: context.network.chainId,
      projectId: event.args.projectId,
    })
    .set({ balance: row.balance + event.args.amount });
});

ponder.on("JBMultiTerminal:CashOutTokens", async ({ event, context }) => {
  console.log(event.args);
});

ponder.on("JBMultiTerminal:FeeReverted", async ({ event, context }) => {
  console.log(event.args);
});

ponder.on("JBMultiTerminal:HoldFee", async ({ event, context }) => {
  console.log(event.args);
});
