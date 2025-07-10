import {
  arbitrum,
  arbitrumSepolia,
  base,
  baseSepolia,
  mainnet,
  optimism,
  optimismSepolia,
  sepolia,
} from "viem/chains";

export const MAINNETS = [mainnet, arbitrum, base, optimism] as const;

export const TESTNETS = [
  sepolia,
  arbitrumSepolia,
  baseSepolia,
  optimismSepolia,
] as const;

export const NETWORKS = [...MAINNETS, ...TESTNETS] as const;

export type ChainId = (typeof NETWORKS)[number]["id"];
