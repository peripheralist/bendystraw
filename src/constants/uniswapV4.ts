export const JB_UNISWAP_V4_HOOK = {
  ethereum: {
    address: "0xd81ece6cf73b18a1b109e48c86ffdbd284f6d5c8",
    startBlock: 25453846,
  },
  arbitrum: {
    address: "0xd21ba44c9c833ccaf70795af7bf00719aa7455c8",
    startBlock: 480050947,
  },
  base: {
    address: "0xf70b71605f1c0a8ff7580557645bb7e29fe495c8",
    startBlock: 48157370,
  },
  optimism: {
    address: "0xae18f78eadfa5addda9026e1ab835381cfdf55c8",
    startBlock: 153752655,
  },
  ethereumSepolia: {
    address: "0x7494930fbfa2fdd06549526c805d48b4f22a15c8",
    startBlock: 11144308,
  },
  arbitrumSepolia: {
    address: "0xd27bd395dfb5741a7cc66df836e3039c563955c8",
    startBlock: 281300426,
  },
  baseSepolia: {
    address: "0xf7ce556c8c10cff2c8da6ea521c6232598f7d5c8",
    startBlock: 43356709,
  },
} as const;

/**
 * Canonical Uniswap V4 PositionManager per chain, paired with the block the JB
 * hook was deployed at: a position in a JB pool cannot predate the hook, so
 * there is nothing to index before it.
 */
export const JB_UNISWAP_V4_POSITION_MANAGER = {
  ethereum: {
    address: "0xbd216513d74c8cf14cf4747e6aaa6420ff64ee9e",
    startBlock: JB_UNISWAP_V4_HOOK.ethereum.startBlock,
  },
  arbitrum: {
    address: "0xd88f38f930b7952f2db2432cb002e7abbf3dd869",
    startBlock: JB_UNISWAP_V4_HOOK.arbitrum.startBlock,
  },
  base: {
    address: "0x7c5f5a4bbd8fd63184577525326123b519429bdc",
    startBlock: JB_UNISWAP_V4_HOOK.base.startBlock,
  },
  optimism: {
    address: "0x3c3ea4b57a46241e54610e5f022e5c45859a1017",
    startBlock: JB_UNISWAP_V4_HOOK.optimism.startBlock,
  },
  ethereumSepolia: {
    address: "0x429ba70129df741b2ca2a85bc3a2a3328e5c09b4",
    startBlock: JB_UNISWAP_V4_HOOK.ethereumSepolia.startBlock,
  },
  arbitrumSepolia: {
    address: "0xac631556d3d4019c95769033b5e719dd77124bac",
    startBlock: JB_UNISWAP_V4_HOOK.arbitrumSepolia.startBlock,
  },
  baseSepolia: {
    address: "0x4b2c77d209d3405f41a037ec6c77f7f5b8e2ca80",
    startBlock: JB_UNISWAP_V4_HOOK.baseSepolia.startBlock,
  },
} as const;

/**
 * Canonical Uniswap V4 PoolManager per chain for event indexing, paired with
 * the JB hook's deploy block. Same addresses as POOL_MANAGER_BY_CHAIN, in the
 * shape ponder's `chain` config takes.
 */
export const JB_UNISWAP_V4_POOL_MANAGER = {
  ethereum: {
    address: "0x000000000004444c5dc75cb358380d2e3de08a90",
    startBlock: JB_UNISWAP_V4_HOOK.ethereum.startBlock,
  },
  arbitrum: {
    address: "0x360e68faccca8ca495c1b759fd9eee466db9fb32",
    startBlock: JB_UNISWAP_V4_HOOK.arbitrum.startBlock,
  },
  base: {
    address: "0x498581ff718922c3f8e6a244956af099b2652b2b",
    startBlock: JB_UNISWAP_V4_HOOK.base.startBlock,
  },
  optimism: {
    address: "0x9a13f98cb987694c9f086b1f5eb990eea8264ec3",
    startBlock: JB_UNISWAP_V4_HOOK.optimism.startBlock,
  },
  ethereumSepolia: {
    address: "0xe03a1074c86cfedd5c142c4f04f1a1536e203543",
    startBlock: JB_UNISWAP_V4_HOOK.ethereumSepolia.startBlock,
  },
  arbitrumSepolia: {
    address: "0xfb3e0c6f74eb1a21cc1da29aec80d2dfe6c9a317",
    startBlock: JB_UNISWAP_V4_HOOK.arbitrumSepolia.startBlock,
  },
  baseSepolia: {
    address: "0x05e73354cfdd6745c338b50bcfdfa3aa6fa03408",
    startBlock: JB_UNISWAP_V4_HOOK.baseSepolia.startBlock,
  },
} as const;

/**
 * Uniswap's StateView lens over PoolManager's `extsload` storage. Each address
 * was verified by calling `poolManager()` on it and matching the result against
 * POOL_MANAGER_BY_CHAIN for that chain.
 */
export const STATE_VIEW_BY_CHAIN: Partial<Record<number, `0x${string}`>> = {
  1: "0x7ffe42c4a5deea5b0fec41c94c136cf115597227",
  10: "0xc18a3169788f4f75a170290584eca6395c75ecdb",
  8453: "0xa3c0c9b65bad0b08107aa264b0f3db444b867a71",
  42161: "0x76fd297e2d437cd7f76d50f01afe6160f86e9990",
  11155111: "0xe1dd9c3fa50edb962e442f60dfbc432e24537e4c",
  84532: "0x571291b572ed32ce6751a2cb2486ebee8defb9b4",
  421614: "0x9d467fa9062b6e9b1a46e26007ad82db116c67cb",
};

/** PositionManager per numeric chain id, for position-key derivation. */
export const POSITION_MANAGER_BY_CHAIN: Partial<
  Record<number, `0x${string}`>
> = {
  1: JB_UNISWAP_V4_POSITION_MANAGER.ethereum.address,
  10: JB_UNISWAP_V4_POSITION_MANAGER.optimism.address,
  8453: JB_UNISWAP_V4_POSITION_MANAGER.base.address,
  42161: JB_UNISWAP_V4_POSITION_MANAGER.arbitrum.address,
  11155111: JB_UNISWAP_V4_POSITION_MANAGER.ethereumSepolia.address,
  84532: JB_UNISWAP_V4_POSITION_MANAGER.baseSepolia.address,
  421614: JB_UNISWAP_V4_POSITION_MANAGER.arbitrumSepolia.address,
};

export const POOL_MANAGER_BY_CHAIN: Partial<
  Record<number, `0x${string}`>
> = {
  1: "0x000000000004444c5dc75cb358380d2e3de08a90",
  10: "0x9a13f98cb987694c9f086b1f5eb990eea8264ec3",
  8453: "0x498581ff718922c3f8e6a244956af099b2652b2b",
  42161: "0x360e68faccca8ca495c1b759fd9eee466db9fb32",
  11155111: "0xe03a1074c86cfedd5c142c4f04f1a1536e203543",
  84532: "0x05e73354cfdd6745c338b50bcfdfa3aa6fa03408",
  421614: "0xfb3e0c6f74eb1a21cc1da29aec80d2dfe6c9a317",
};

export const NATIVE_TOKEN =
  "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee" as const;
