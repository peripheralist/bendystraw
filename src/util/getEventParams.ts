type Args = {
  event: {
    id: string;
    args: { caller: `0x${string}` };
    block: { timestamp: bigint };
    log: { logIndex: number };
    transaction: {
      from: `0x${string}`;
      hash: `0x${string}`;
    };
  };
  context: {
    network: {
      chainId: number;
    };
  };
};

export const getEventParams = ({ event, context }: Args) => ({
  id: event.id,
  chainId: context.network.chainId,
  txHash: event.transaction.hash,
  logIndex: event.log.logIndex,
  timestamp: Number(event.block.timestamp),
  caller: event.args.caller,
  from: event.transaction.from,
});
