import { ponder } from "ponder:registry";
import { nftTier } from "ponder:schema";
import { JB721TiersHookStoreAbi } from "../abis/JB721TiersHookStoreAbi";
import { Banny721TokenUriResolverAbi } from "../abis/Banny721TokenUriResolverAbi";

ponder.on("JB721TiersHook:AddTier", async ({ event, context }) => {
  const hook = event.log.address;

  const { tier, tierId } = event.args;

  try {
    const tierCall = await context.client.readContract({
      abi: JB721TiersHookStoreAbi,
      address: "0xdc162a8a6decc7f27fd4cff58d69b9cc0c7c2ea1",
      functionName: "tierOf",
      args: [hook, tierId, true],
    });

    // Will only succeed for Banny tiers
    const svgCall = await context.client.readContract({
      abi: Banny721TokenUriResolverAbi,
      address: context.contracts.Banny721TokenUriResolver.address,
      functionName: "svgOf",
      args: [
        "0x2da41cdc79ae49f2725ab549717b2dbcfc42b958", // banny hook
        tierId * BigInt(1000000000),
        false,
        false,
      ],
    });

    await context.db.insert(nftTier).values({
      tierId,
      chainId: context.network.chainId,
      price: tier.price,
      hook,
      allowOwnerMint: tier.allowOwnerMint,
      createdAt: event.block.timestamp,
      cannotBeRemoved: tier.cannotBeRemoved,
      reserveBeneficiary: tier.reserveBeneficiary,
      reserveFrequency: tier.reserveFrequency,
      category: tier.category,
      encodedIpfsUri: tier.encodedIPFSUri,
      initialSupply: tier.initialSupply,
      remainingSupply: tier.initialSupply,
      transfersPausable: tier.transfersPausable,
      votingUnits: tier.votingUnits,
      resolvedUri: tierCall.resolvedUri,
      svg: svgCall ? svgCall : undefined,
    });
  } catch (e) {
    console.error("JB721TiersHook:AddTier", e);
  }
});
