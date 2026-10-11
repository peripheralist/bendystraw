// Receipt-backed @ballkidz/defifa@1.0.2 deployment artifacts, deployments/defifa.
// Keep factory discovery at the deployer's creation block so earlier games replay too.
export const DEFIFA_DEPLOYMENTS = {
  mainnet: {
    address: "0x375afb2a4b1cadae99f8863f96fc1aebcbaf8bde",
    chain: {
      ethereum: { startBlock: 25330110 },
      arbitrum: { startBlock: 474174861 },
      base: { startBlock: 47399313 },
      optimism: { startBlock: 152994569 },
    },
  },
  testnet: {
    address: "0xbfa54a97099485c134f06c9a08a4909c26fd7318",
    chain: {
      ethereumSepolia: { startBlock: 11070755 },
      arbitrumSepolia: { startBlock: 277728251 },
      baseSepolia: { startBlock: 42909692 },
      optimismSepolia: { startBlock: 44892523 },
    },
  },
} as const;
