export const BANNY_RETAIL_HOOK = "0x2da41cdc79ae49f2725ab549717b2dbcfc42b958";
export const BANNY_RETAIL_HOOK_5 = "0xb4ec363c2e7db0ceca9aa1759338d7d1b49d1750";

export const BANNY_RETAIL_HOOK_6_MAINNET = "0x37e35937ecf949d7a44a9fe878107de264618b8f";
export const BANNY_RETAIL_HOOK_6_TESTNET = "0xe2193b4375a4a1e77fbf120699742ef0107f6084";

const BANNY_RETAIL_HOOK_6_BY_CHAIN_ID = {
  1: BANNY_RETAIL_HOOK_6_MAINNET,
  10: BANNY_RETAIL_HOOK_6_MAINNET,
  8453: BANNY_RETAIL_HOOK_6_MAINNET,
  42161: BANNY_RETAIL_HOOK_6_MAINNET,
  11155111: BANNY_RETAIL_HOOK_6_TESTNET,
  11155420: BANNY_RETAIL_HOOK_6_TESTNET,
  84532: BANNY_RETAIL_HOOK_6_TESTNET,
  421614: BANNY_RETAIL_HOOK_6_TESTNET,
} as const;

export function bannyRetailHookForVersion(
  version: 4 | 5 | 6,
  chainId: number,
): `0x${string}` {
  if (version === 4) return BANNY_RETAIL_HOOK;
  if (version === 5) return BANNY_RETAIL_HOOK_5;

  const hook =
    BANNY_RETAIL_HOOK_6_BY_CHAIN_ID[
      chainId as keyof typeof BANNY_RETAIL_HOOK_6_BY_CHAIN_ID
    ];

  if (!hook) {
    throw new Error(`Missing V6 Banny retail hook for chain ${chainId}`);
  }

  return hook;
}
