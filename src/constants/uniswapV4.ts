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
