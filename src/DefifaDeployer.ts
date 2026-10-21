import { Context, Event, ponder } from "ponder:registry";
import { defifaGame, nftHook, nftTier } from "ponder:schema";
import { isAddressEqual } from "viem";
import { JB721TiersHookV6Abi } from "../abis/JB721TiersHookV6Abi";
import { DefifaHookAbi } from "../abis/DefifaHookAbi";
import { DefifaDeployerAbi } from "../abis/DefifaDeployerAbi";
import { DefifaGovernorAbi, DefifaVotingRefereeAbi } from "../abis/DefifaGovernorAbi";
import { DEFIFA_V2_DEPLOYMENTS } from "./constants/defifa";
import { getAllTiers } from "./util/getAllTiers";
import { parseTierMetadata } from "./util/tokenUri";
import { DEFIFA_VERSION, insertDefifaEvent } from "./util/defifa";

// Defifa does not emit JB721 AddTier/HookDeployed. LaunchGame is its canonical
// discovery event; native names remain authoritative even without IPFS metadata.
// 1.0.2 hooks keep tiers in the canonical store; 2.0 hooks pass their DefifaTiersHookStore.
async function seedGame({ event, context, store }: { event: Event<"DefifaDeployer:LaunchGame">; context: Context; store?: `0x${string}` }) {
  const { hook, gameId } = event.args;
  const version = 6;
  const [name, symbol] = await Promise.all([
    context.client.readContract({ abi: JB721TiersHookV6Abi, address: hook, functionName: "name" }),
    context.client.readContract({ abi: JB721TiersHookV6Abi, address: hook, functionName: "symbol" }),
  ]);
  await context.db.insert(nftHook).values({
    chainId: context.chain.id, address: hook, projectId: Number(gameId),
    createdAt: Number(event.block.timestamp), name, symbol, version,
  });
  const tiers = await getAllTiers({ context, hook, version, includeResolvedUri: false, store });
  const tiersCount = tiers.length;
  // Keep Ponder DB writes sequential; parallel writes share its transaction/savepoints.
  for (const tier of tiers) {
    if (!("flags" in tier)) throw new Error("Expected the V6 tier format for Defifa");
    const name = await context.client.readContract({ abi: DefifaHookAbi, address: hook, functionName: "tierNameOf", args: [BigInt(tier.id)] });
    const metadata = await parseTierMetadata({ resolvedUri: tier.resolvedUri, encodedIpfsUri: tier.encodedIPFSUri });
    await context.db.insert(nftTier).values({
      tierId: tier.id, chainId: context.chain.id, price: tier.price, hook, projectId: Number(gameId),
      allowOwnerMint: tier.flags.allowOwnerMint, createdAt: Number(event.block.timestamp),
      cannotBeRemoved: tier.flags.cantBeRemoved, reserveBeneficiary: tier.reserveBeneficiary,
      reserveFrequency: tier.reserveFrequency, category: tier.category, encodedIpfsUri: tier.encodedIPFSUri,
      initialSupply: tier.initialSupply, remainingSupply: tier.remainingSupply,
      transfersPausable: tier.flags.transfersPausable, votingUnits: BigInt(tier.votingUnits),
      resolvedUri: tier.resolvedUri, metadata: { ...metadata, name }, version,
    });
  }
  return { name, symbol, tiersCount };
}

ponder.on("DefifaDeployer:LaunchGame", async (args) => {
  await seedGame(args);
});

// 2.0: seed the NFT inventory from the 2.0 store, then the game row. Governor and referee settings are read at
// the launch block because their GameInitialized events fire before LaunchGame in the launch transaction.
ponder.on("DefifaDeployerV2:LaunchGame", async ({ event, context }) => {
  const { gameId, hook, governor, tokenUriResolver, caller } = event.args;
  const deployer = event.log.address;
  const deployments = DEFIFA_V2_DEPLOYMENTS.mainnet;
  const { name, symbol, tiersCount } = await seedGame({ event, context, store: deployments.store });
  const blockNumber = event.block.number;
  const [[start, mintPeriodDuration, refundPeriodDuration], [minParticipation, scorecardTimeout], referee, timelockDuration] =
    await Promise.all([
      context.client.readContract({ abi: DefifaDeployerAbi, address: deployer, functionName: "timesFor", args: [gameId], blockNumber }),
      context.client.readContract({ abi: DefifaDeployerAbi, address: deployer, functionName: "safetyParamsOf", args: [gameId], blockNumber }),
      context.client.readContract({ abi: DefifaGovernorAbi, address: governor, functionName: "refereeOf", args: [gameId], blockNumber }),
      context.client.readContract({ abi: DefifaGovernorAbi, address: governor, functionName: "timelockDurationOf", args: [gameId], blockNumber }),
    ]);
  // Attestation timing exists only on the sample voting referee.
  const isVotingReferee = isAddressEqual(referee, deployments.votingReferee);
  const [attestationStartTime, attestationGracePeriod] = isVotingReferee
    ? await Promise.all([
      context.client.readContract({ abi: DefifaVotingRefereeAbi, address: referee, functionName: "attestationStartTimeOf", args: [gameId], blockNumber }),
      context.client.readContract({ abi: DefifaVotingRefereeAbi, address: referee, functionName: "attestationGracePeriodOf", args: [gameId], blockNumber }),
    ])
    : [undefined, undefined];
  const projectId = Number(gameId);
  await context.db.insert(defifaGame).values({
    chainId: context.chain.id, projectId, version: DEFIFA_VERSION,
    gameType: isAddressEqual(deployer, deployments.deployer1155) ? "erc1155" : "erc721",
    deployer, hook, governor, referee, tokenUriResolver, name, symbol, tiersCount, entriesCount: 0, totalMintCost: 0n, scorecardsCount: 0,
    start: Number(start), mintPeriodDuration: Number(mintPeriodDuration), refundPeriodDuration: Number(refundPeriodDuration),
    minParticipation, scorecardTimeout: Number(scorecardTimeout), timelockDuration: Number(timelockDuration),
    attestationStartTime: attestationStartTime === undefined ? undefined : Number(attestationStartTime),
    attestationGracePeriod: attestationGracePeriod === undefined ? undefined : Number(attestationGracePeriod),
    launchedBy: caller, launchTxHash: event.transaction.hash, createdAt: Number(event.block.timestamp),
  });
  await insertDefifaEvent({ event, context, projectId, type: "launched", account: caller });
});

ponder.on("DefifaDeployerV2:FulfilledCommitments", async ({ event, context }) => {
  const { gameId, pot } = event.args;
  const projectId = Number(gameId);
  await context.db.update(defifaGame, { chainId: context.chain.id, projectId })
    .set({ pot, commitmentsFulfilledAt: Number(event.block.timestamp) });
  await insertDefifaEvent({ event, context, projectId, type: "commitmentsFulfilled", amount: pot });
});

ponder.on("DefifaDeployerV2:QueuedNoContest", async ({ event, context }) => {
  const projectId = Number(event.args.gameId);
  await context.db.update(defifaGame, { chainId: context.chain.id, projectId })
    .set({ noContestQueuedAt: Number(event.block.timestamp) });
  await insertDefifaEvent({ event, context, projectId, type: "noContestQueued" });
});
