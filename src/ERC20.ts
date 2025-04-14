import { ponder } from "ponder:registry";
import { burnEvent, deployErc20Event, participant } from "ponder:schema";
import { zeroAddress } from "viem";

ponder.on("ERC20:Transfer", async ({ event, context }) => {
  try {
    const { from, to, value } = event.args;
    const { address: token } = event.log;
    const { chainId } = context.network;

    const _deployErc20Event = await context.db.find(deployErc20Event, {
      token,
      chainId,
    });

    if (!_deployErc20Event) {
      // TODO here we use the deployErc20Event as the source of truth connecting the token to the project. We must also handle the case where an ERC20 is "added to" a project, where there is no deployErc20Event.
      throw new Error("Missing deployErc20Event");
    }

    const { projectId } = _deployErc20Event;

    const toParticipant = await context.db.find(participant, {
      chainId,
      projectId,
      address: to,
    });

    await Promise.all([
      // update from participant
      from === zeroAddress
        ? Promise.resolve()
        : context.db
            .update(participant, { chainId, projectId, address: from })
            .set((p) => ({
              erc20Balance: p.erc20Balance - value,
              balance: p.erc20Balance - value + p.creditBalance,
            })),

      to === zeroAddress
        ? // create burn event
          context.db.insert(burnEvent).values({
            id: event.id,
            chainId,
            txHash: event.transaction.hash,
            timestamp: Number(event.block.timestamp),
            from,
            projectId,
            amount: value,
            erc20Amount: value,
            creditAmount: BigInt(0),
          })
        : // update `to` participant
        toParticipant
        ? context.db
            .update(participant, { chainId, projectId, address: to })
            .set((p) => ({
              erc20Balance: p.erc20Balance + value,
              balance: p.erc20Balance + value + p.creditBalance,
            }))
        : context.db.insert(participant).values({
            chainId,
            projectId,
            address: to,
            erc20Balance: value,
            balance: value,
          }),
    ]);
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
