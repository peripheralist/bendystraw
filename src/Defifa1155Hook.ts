import { Context, Event, ponder } from "ponder:registry";
import { nftTier } from "ponder:schema";
import { DEFIFA_V2_DEPLOYMENTS } from "./constants/defifa";
import { tierOf } from "./util/tierOf";
import { zeroAddress } from "viem";
import { registerDefifaHookEvents } from "./util/defifaHookEvents";
import { DEFIFA_VERSION, gameIdOfHook, insertDefifaEvent, moveDefifaHolding, syncDefifaTotalMintCost, tierOf1155TokenId } from "./util/defifa";
import { recordNftRecipient } from "./util/v6Nft";

// ERC-1155 games mint fungible positions per tier: `count` positions per Mint, one balance per token ID.
// Positions stay out of project.nftsMintedCount, an int column a cheap tier could overflow (up to 999,999,999
// positions per tier); tier supply and holdings carry the counts, each below 1e9.
async function recordMint({
  event, context, tierId, beneficiary, count, amount, reserved,
}: {
  // Mint's args are a superset of MintReservedToken's.
  event: Event<"Defifa1155Hook:MintReservedToken">;
  context: Context; tierId: bigint; beneficiary: `0x${string}`; count: bigint; amount?: bigint; reserved: boolean;
}) {
  const hook = event.log.address;
  const chainId = context.chain.id;
  const projectId = await gameIdOfHook(context, hook);
  const minted = Number(count);
  // The store's remaining supply at this block, not a decrement: the launch seed already read the launch
  // block's final supply, so a decrement would count a launch-block mint twice. Before the seed there is no row.
  const tierKey = { chainId, hook, tierId: Number(tierId), version: DEFIFA_VERSION };
  if (await context.db.find(nftTier, tierKey)) {
    const tier = await tierOf({ context, hook, tierId, version: DEFIFA_VERSION, includeResolvedUri: false, store: DEFIFA_V2_DEPLOYMENTS.mainnet.store });
    await context.db.update(nftTier, tierKey).set({ remainingSupply: tier.remainingSupply });
  }
  await insertDefifaEvent({
    event, context, projectId, type: reserved ? "reserveMinted" : "minted", account: beneficiary,
    tierId: Number(tierId), count: minted, amount,
  });
}

ponder.on("Defifa1155Hook:Mint", ({ event, context }) => {
  const { tierId, beneficiary, count, totalAmountContributed } = event.args;
  return recordMint({ event, context, tierId, beneficiary, count, amount: totalAmountContributed, reserved: false });
});

ponder.on("Defifa1155Hook:MintReservedToken", ({ event, context }) => {
  const { tierId, beneficiary, count } = event.args;
  return recordMint({ event, context, tierId, beneficiary, count, reserved: true });
});

// Holdings and participants follow the standard ERC-1155 transfer events (mints come from the zero address).
async function recordTransfer({
  context, timestamp, blockNumber, hook, from, to, ids, values,
}: {
  context: Context; timestamp: number; blockNumber: bigint; hook: `0x${string}`; from: `0x${string}`; to: `0x${string}`;
  ids: readonly bigint[]; values: readonly bigint[];
}) {
  const projectId = await gameIdOfHook(context, hook);
  for (let i = 0; i < ids.length; i++) {
    const { tierId, reserve } = tierOf1155TokenId(ids[i]!);
    const count = Number(values[i]!);
    await moveDefifaHolding({ context, timestamp, projectId, hook, owner: from, tierId, delta: -count, reserveDelta: reserve ? -count : 0 });
    await moveDefifaHolding({ context, timestamp, projectId, hook, owner: to, tierId, delta: count, reserveDelta: reserve ? count : 0 });
  }
  await syncDefifaTotalMintCost({ context, blockNumber, projectId, hook, from, to });
  return projectId;
}

ponder.on("Defifa1155Hook:TransferSingle", async ({ event, context }) => {
  const { from, to, id, value } = event.args;
  const projectId = await recordTransfer({
    context, timestamp: Number(event.block.timestamp), blockNumber: event.block.number, hook: event.log.address, from, to, ids: [id], values: [value],
  });
  if (to !== zeroAddress) await recordNftRecipient({ context, event, projectId, to });
});

ponder.on("Defifa1155Hook:TransferBatch", async ({ event, context }) => {
  const { from, to, ids, values } = event.args;
  const projectId = await recordTransfer({
    context, timestamp: Number(event.block.timestamp), blockNumber: event.block.number, hook: event.log.address, from, to, ids, values,
  });
  if (to !== zeroAddress) await recordNftRecipient({ context, event, projectId, to });
});

registerDefifaHookEvents("Defifa1155Hook");
