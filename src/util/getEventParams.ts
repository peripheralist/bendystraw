type Args = {
  event: {
    args: { caller: `0x${string}` };
    block: { timestamp: bigint };
    transaction: {
      from: `0x${string}`;
      hash: `0x${string}`;
      transactionIndex: number;
    };
  };
  context: {
    network: {
      chainId: number;
    };
  };
};

export const getEventParams = ({ event, context }: Args) => ({
  chainId: context.network.chainId,
  txHash: event.transaction.hash,
  txIndex: event.transaction.transactionIndex,
  timestamp: Number(event.block.timestamp),
  caller: event.args.caller,
  from: event.transaction.from,
});
