import { ponder } from "ponder:registry";
import { nftHook, nftTier } from "ponder:schema";
import { JB721TiersHookV6Abi } from "../abis/JB721TiersHookV6Abi";
import { DefifaHookAbi } from "../abis/DefifaHookAbi";
import { getAllTiers } from "./util/getAllTiers";
import { parseTierMetadata } from "./util/tokenUri";

// Defifa does not emit JB721 AddTier/HookDeployed. LaunchGame is its canonical
// discovery event; native names remain authoritative even without IPFS metadata.
ponder.on("DefifaDeployer:LaunchGame", async ({ event, context }) => {
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
  const tiers = await getAllTiers({ context, hook, version, includeResolvedUri: false });
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
});
