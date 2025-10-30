import { ponder } from "ponder:registry";
import { project, suckerTransaction } from "ponder:schema";
import { JBSuckerAbi } from "../abis/JBSuckerAbi";
import { ADDRESS } from "./constants/address";
import { isAddressEqual } from "viem";
import { and, eq } from "ponder";

ponder.on("JBSucker:InsertToOutboxTree", async ({ event, context }) => {
  try {
    const address = event.log.address;
    const chainId = Number(context.chain.id);

    const projectId = await context.client.readContract({
      abi: JBSuckerAbi,
      functionName: "projectId",
      address,
    });
    const peer = await context.client.readContract({
      abi: JBSuckerAbi,
      functionName: "peer",
      address,
    });
    const peerChainId = await context.client.readContract({
      abi: JBSuckerAbi,
      functionName: "peerChainId",
      address,
    });
    const directoryAddress = await context.client.readContract({
      abi: JBSuckerAbi,
      functionName: "DIRECTORY",
      address,
    });

    const version = isAddressEqual(directoryAddress, ADDRESS.jbDirectory5)
      ? 5
      : 4;

    const _project = await context.db.find(project, {
      projectId: Number(projectId),
      chainId,
      version,
    });

    if (!_project) {
      throw new Error("Missing project");
    }

    await context.db.insert(suckerTransaction).values({
      projectId: _project.projectId,
      chainId,
      version,
      suckerGroupId: _project.suckerGroupId,
      sucker: event.log.address,
      peer,
      peerChainId: Number(peerChainId),
      beneficiary: event.args.beneficiary,
      token: event.args.token,
      projectTokenCount: event.args.projectTokenCount,
      terminalTokenAmount: event.args.terminalTokenAmount,
      index: Number(event.args.index),
      root: event.args.root,
      createdAt: Number(event.block.timestamp),
      status: "pending",
    });
  } catch (e) {
    console.error("JBSucker:InsertToOutboxTree", e);
  }
});

ponder.on("JBSucker:RootToRemote", async ({ event, context }) => {
  try {
    await context.db
      .update(suckerTransaction, {
        token: event.args.token,
        index: Number(event.args.index),
        chainId: context.chain.id,
        sucker: event.log.address,
      })
      .set({ status: "claimable" });
  } catch (e) {
    console.error("JBSucker:RootToRemote", e);
  }
});

ponder.on("JBSucker:Claimed", async ({ event, context }) => {
  try {
    await context.db.sql
      .update(suckerTransaction)
      .set({ status: "claimed" })
      .where(
        and(
          eq(suckerTransaction.token, event.args.token),
          eq(suckerTransaction.index, Number(event.args.index)),
          eq(suckerTransaction.peerChainId, context.chain.id), // use PEER chain here
          eq(suckerTransaction.sucker, event.log.address)
        )
      );
  } catch (e) {
    console.error("JBSucker:Claimed", e);
  }
});
