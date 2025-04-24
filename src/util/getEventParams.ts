import { Context } from "ponder:registry";

type Args = { caller: `0x${string}` } | {};

type GetEventParamsArgs<A extends Args> = {
  event: {
    id: string;
    args: A;
    block: { timestamp: bigint };
    log: { logIndex: number };
    transaction: {
      from: `0x${string}`;
      hash: `0x${string}`;
    };
  };
  context: Context;
};

// Utility typing enables conditionally returning params with `caller` property
export const getEventParams = <A extends Args>({
  event,
  context,
}: GetEventParamsArgs<A>) =>
  ({
    chainId: context.network.chainId,
    txHash: event.transaction.hash,
    logIndex: event.log.logIndex,
    timestamp: Number(event.block.timestamp),
    from: event.transaction.from,
    ...((event.args as { caller: `0x${string}` }).caller
      ? { caller: (event.args as { caller: `0x${string}` }).caller }
      : {}),
  } as {
    chainId: number;
    txHash: `0x${string}`;
    logIndex: number;
    timestamp: number;
    from: `0x${string}`;
    caller: `0x${string}` | never; // TODO fix dumb type
    // caller: typeof event.args extends { caller: `0x${string}` }
    //   ? `0x${string}`
    //   : never;
  });
