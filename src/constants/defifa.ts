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

// @ballkidz/defifa@2.0.0, from deploy-all-v6's v6-deployment Safe (deploy-all-v6 PR #250). CREATE2 places every
// contract at the same address on every chain. Start blocks are the receipt-backed creation block of each chain's
// earliest 2.0 contract (deploy-all-v6 deployments/<chain>/). 2.0 hooks keep tiers in DefifaTiersHookStore, not the canonical
// JB721TiersHookStore, so tier reads go to `store`.
const DEFIFA_V2_CONTRACTS = {
  deployer: "0x32cd7d0c378a45a27cd7e361bce0ba882efe87a9",
  deployer1155: "0x7a62383b50aaa8b212bd965c426490625068ba80",
  governor: "0xd8debb4e66c11cd72643e450b3beaced73ff7b78",
  governor1155: "0x53eede0488861cb6c7c643cd77d7f92f4ede2879",
  votingReferee: "0xf6552cc178042e9ed13c768929983e7d93254640",
  store: "0xf65dd3adbac3d776cfa025458cac730aa52adb7d",
} as const;

export const DEFIFA_V2_DEPLOYMENTS = {
  mainnet: {
    ...DEFIFA_V2_CONTRACTS,
    address: DEFIFA_V2_CONTRACTS.deployer,
    chain: {
      ethereum: { startBlock: 26280781 },
      arbitrum: { startBlock: 518605659 },
      base: { startBlock: 53137696 },
      optimism: { startBlock: 158732986 },
    },
  },
  testnet: {
    ...DEFIFA_V2_CONTRACTS,
    address: DEFIFA_V2_CONTRACTS.deployer,
    chain: {
      ethereumSepolia: { startBlock: 12015043 },
      arbitrumSepolia: { startBlock: 323803586 },
      baseSepolia: { startBlock: 51506348 },
      optimismSepolia: { startBlock: 50710273 },
    },
  },
} as const;
