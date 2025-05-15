import { and, eq } from "ponder";
import { ponder } from "ponder:registry";
import {
  burnEvent,
  deployErc20Event,
  participant,
  project,
} from "ponder:schema";
import { zeroAddress } from "viem";
import { insertActivityEvent } from "./util/activityEvent";
import { setParticipantSnapshot } from "./util/participantSnapshot";

ponder.on("ERC20:Transfer", async ({ event, context }) => {
  try {
    const { from, to, value } = event.args;
    const { address: token } = event.log;
    const { chainId } = context.network;

    const _deployErc20Event =
      await context.db.sql.query.deployErc20Event.findFirst({
        where: and(
          eq(deployErc20Event.chainId, chainId),
          eq(deployErc20Event.token, token)
        ),
      });

    if (!_deployErc20Event) {
      // TODO here we use the deployErc20Event as the source of truth connecting the token to the project. We must also handle the case where an ERC20 is "added to" a project, where there is no deployErc20Event.
      throw new Error("Missing deployErc20Event");
    }

    const { projectId } = _deployErc20Event;

    const _project = await context.db.find(project, { projectId, chainId });

    if (!_project) {
      throw new Error("Missing project");
    }

    if (to === zeroAddress) {
      // create burn event
      const { id } = await context.db.insert(burnEvent).values({
        chainId,
        suckerGroupId: _project.suckerGroupId,
        txHash: event.transaction.hash,
        timestamp: Number(event.block.timestamp),
        from,
        projectId,
        amount: value,
        erc20Amount: value,
        creditAmount: BigInt(0),
      });

      await insertActivityEvent("burnEvent", {
        id,
        event,
        context,
        projectId,
      });
    } else {
      // insert/update `to` participant
      const _to = await context.db
        .insert(participant)
        .values({
          chainId,
          projectId,
          address: to,
          erc20Balance: value,
          balance: value,
          suckerGroupId: _project.suckerGroupId,
        })
        .onConflictDoUpdate((p) => ({
          erc20Balance: p.erc20Balance + value,
          balance: p.erc20Balance + value + p.creditBalance,
          suckerGroupId: _project.suckerGroupId,
        }));

      await setParticipantSnapshot({
        participant: _to,
        context,
        event,
      });
    }

    if (from !== zeroAddress) {
      // update `from` participant
      await context.db
        .update(participant, { chainId, projectId, address: from })
        .set((p) => ({
          erc20Balance: p.erc20Balance - value,
          balance: p.erc20Balance - value + p.creditBalance,
          suckerGroupId: _project.suckerGroupId,
        }));
    }
  } catch (e) {
    console.error(
      "ERC20: Transfer",
      context.network.chainId,
      event.log.address,
      event.transaction.hash,
      e
    );
  }
});
