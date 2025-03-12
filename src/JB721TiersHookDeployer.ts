import { ponder } from "ponder:registry";

ponder.on("JB721TiersHookDeployer:HookDeployed", async ({ event, context }) => {
  console.log(event.args);
});
