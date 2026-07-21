export const JBUniswapV4HookV6Abi = [
  {
    type: "event",
    name: "RouteSelected",
    inputs: [
      {
        name: "poolId",
        type: "bytes32",
        indexed: true,
        internalType: "PoolId",
      },
      {
        name: "useJuicebox",
        type: "bool",
        indexed: false,
        internalType: "bool",
      },
      {
        name: "expectedTokens",
        type: "uint256",
        indexed: false,
        internalType: "uint256",
      },
      {
        name: "caller",
        type: "address",
        indexed: false,
        internalType: "address",
      },
    ],
    anonymous: false,
  },
] as const;
