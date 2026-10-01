import { ponder } from "ponder:registry";
import { stickyFundEvent, stickyToken } from "ponder:schema";
import { getEventParams } from "./util/getEventParams";
import { stickyVersion as version, suckerGroupIdOf } from "./util/sticky";

ponder.on("StickyDistributor:Fund", async ({ event, context }) => {
  try {
    const { hook, groupId, token, round, amount } = event.args;

    // Anyone can fund the default group of any address. Only a Sticky token's funding belongs to a
    // project, so funding of any other address is left out.
    const _stickyToken = await context.db.find(stickyToken, {
      version,
      chainId: context.chain.id,
      token: hook,
    });
    if (!_stickyToken) return;

    const { projectId } = _stickyToken;
    const suckerGroupId = await suckerGroupIdOf({ context, projectId });

    await context.db.insert(stickyFundEvent).values({
      ...getEventParams({ event, context }),
      version,
      projectId,
      suckerGroupId,
      hook,
      groupId,
      token,
      round,
      amount,
      blockNumber: event.block.number,
    });
  } catch (e) {
    console.error("StickyDistributor:Fund", e);
  }
});
