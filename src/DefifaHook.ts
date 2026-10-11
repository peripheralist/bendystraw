import { ponder } from "ponder:registry";
import { project, suckerGroup } from "ponder:schema";
import { JB721TiersHookV6Abi } from "../abis/JB721TiersHookV6Abi";
import { onProjectStatsUpdated } from "./util/onProjectStatsUpdated";
import { recordV6NftTransfer, recordV6NftMint } from "./util/v6Nft";

ponder.on("DefifaHook:Transfer", (args) => recordV6NftTransfer({ ...args, strict: true }));
ponder.on("DefifaHook:Mint", (args) => recordV6NftMint({ ...args, strict: true }));
ponder.on("DefifaHook:MintReservedToken", async ({ event, context }) => {
  await recordV6NftMint({ event: { ...event, args: { ...event.args, totalAmountPaid: 0n } }, context, strict: true });
  // Reserved mints have no terminal Pay event to refresh group aggregates.
  const projectId = Number(await context.client.readContract({
    abi: JB721TiersHookV6Abi, address: event.log.address, functionName: "projectId",
  }));
  const _project = await context.db.find(project, { projectId, chainId: context.chain.id, version: 6 });
  if (_project && await context.db.find(suckerGroup, { id: _project.suckerGroupId })) {
    await onProjectStatsUpdated({ projectId, version: 6, context, event, _project });
  }
});
