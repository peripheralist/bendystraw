// Uniswap V4 PositionManager, narrowed to what LP-position indexing needs: the
// ERC-721 Transfer that mints, moves, and burns a position.
export const UniswapV4PositionManagerAbi = [
  {
    type: "event",
    name: "Transfer",
    inputs: [
      { name: "from", type: "address", indexed: true },
      { name: "to", type: "address", indexed: true },
      { name: "id", type: "uint256", indexed: true },
    ],
    anonymous: false,
  },
  {
    type: "function",
    name: "ownerOf",
    stateMutability: "view",
    inputs: [{ name: "id", type: "uint256" }],
    outputs: [{ name: "owner", type: "address" }],
  },
] as const;
