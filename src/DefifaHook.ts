import { Context, Event, ponder } from "ponder:registry";
import { defifaGame, project, suckerGroup } from "ponder:schema";
import { JB721TiersHookV6Abi } from "../abis/JB721TiersHookV6Abi";
import { DEFIFA_V2_DEPLOYMENTS } from "./constants/defifa";
import { registerDefifaHookEvents } from "./util/defifaHookEvents";
import { gameIdOfHook, insertDefifaEvent, moveDefifaHolding, syncDefifaTotalMintCost, tierOf721TokenId } from "./util/defifa";
import { onProjectStatsUpdated } from "./util/onProjectStatsUpdated";
import { recordV6NftTransfer, recordV6NftMint } from "./util/v6Nft";

ponder.on("DefifaHook:Transfer", (args) => recordV6NftTransfer({ ...args, strict: true }));
ponder.on("DefifaHook:Mint", (args) => recordV6NftMint({ ...args, strict: true }));

// Reserved mints have no terminal Pay event to refresh group aggregates.
async function recordReservedMint({ event, context }: { event: Event<"DefifaHook:MintReservedToken">; context: Context }) {
  await recordV6NftMint({ event: { ...event, args: { ...event.args, totalAmountPaid: 0n } }, context, strict: true });
  const projectId = Number(await context.client.readContract({
    abi: JB721TiersHookV6Abi, address: event.log.address, functionName: "projectId",
  }));
  const _project = await context.db.find(project, { projectId, chainId: context.chain.id, version: 6 });
  if (_project && await context.db.find(suckerGroup, { id: _project.suckerGroupId })) {
    await onProjectStatsUpdated({ projectId, version: 6, context, event, _project });
  }
}

ponder.on("DefifaHook:MintReservedToken", recordReservedMint);

// 2.0 721 games: the shared NFT rows (tiers read from the 2.0 store), plus holdings, entry counts and the feed.
ponder.on("DefifaHookV2:Transfer", async (args) => {
  await recordV6NftTransfer({ ...args, strict: true, store: DEFIFA_V2_DEPLOYMENTS.mainnet.store });
  const { event, context } = args;
  const { from, to, tokenId } = event.args;
  const hook = event.log.address;
  const projectId = await gameIdOfHook(context, hook);
  const tierId = tierOf721TokenId(tokenId);
  const timestamp = Number(event.block.timestamp);
  await moveDefifaHolding({ context, timestamp, projectId, hook, owner: from, tierId, delta: -1 });
  await moveDefifaHolding({ context, timestamp, projectId, hook, owner: to, tierId, delta: 1 });
  await syncDefifaTotalMintCost({ context, blockNumber: event.block.number, projectId, hook, from, to });
});

async function recordV2Mint({ event, context, reserved }: { event: Event<"DefifaHookV2:Mint">; context: Context; reserved: boolean }) {
  const { beneficiary, tierId, totalAmountPaid } = event.args;
  const projectId = await gameIdOfHook(context, event.log.address);
  await context.db.update(defifaGame, { chainId: context.chain.id, projectId }).set((game) => ({ entriesCount: game.entriesCount + 1 }));
  await insertDefifaEvent({
    event, context, projectId, type: reserved ? "reserveMinted" : "minted", account: beneficiary,
    tierId: Number(tierId), count: 1, amount: reserved ? undefined : totalAmountPaid,
  });
}

ponder.on("DefifaHookV2:Mint", async (args) => {
  await recordV6NftMint({ ...args, strict: true });
  await recordV2Mint({ ...args, reserved: false });
});

ponder.on("DefifaHookV2:MintReservedToken", async (args) => {
  await recordReservedMint(args);
  await recordV2Mint({ event: { ...args.event, args: { ...args.event.args, totalAmountPaid: 0n } }, context: args.context, reserved: true });
});

registerDefifaHookEvents("DefifaHookV2");
