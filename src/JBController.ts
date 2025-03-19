import { ponder } from "ponder:registry";
import { project } from "ponder:schema";

ponder.on("JBController:SetUri", async ({ event, context }) => {
  await context.db
    .update(project, {
      chainId: context.network.chainId,
      projectId: event.args.projectId,
    })
    .set({ metadataUri: event.args.uri });
});

ponder.on("JBController:BurnTokens", async ({ event, context }) => {
  // console.log(event.args);
});

ponder.on("JBController:LaunchProject", async ({ event, context }) => {
  await context.db
    .update(project, {
      chainId: context.network.chainId,
      projectId: event.args.projectId,
    })
    .set({ deployer: event.args.caller, metadataUri: event.args.projectUri });
});

ponder.on("JBController:LaunchRulesets", async ({ event, context }) => {
  // console.log(event.args);
});

ponder.on("JBController:Migrate", async ({ event, context }) => {
  // console.log(event.args);
});
