import { encodePacked, keccak256 } from "viem";

const UINT256_MAX = (1n << 256n) - 1n;

/**
 * Fees a position realized over the interval between two of its checkpoints.
 *
 * The pool's fee-growth accumulators are unchecked uint256 and are expected to
 * wrap, so the difference is taken modulo 2^256 exactly as Solidity computes
 * it. A plain subtraction would read a wrapped accumulator as an enormous
 * balance.
 */
export function feesAccrued(
  liquidity: bigint,
  growthBefore: bigint,
  growthAfter: bigint
): bigint {
  if (liquidity <= 0n) return 0n;
  return (((growthAfter - growthBefore) & UINT256_MAX) * liquidity) >> 128n;
}

/**
 * The pool's position key: `keccak256(abi.encodePacked(owner, tickLower,
 * tickUpper, salt))`. For a position held by the PositionManager the owner is
 * the PositionManager and the salt is the NFT id.
 */
export function positionKey(
  positionManager: `0x${string}`,
  tickLower: number,
  tickUpper: number,
  salt: `0x${string}`
): `0x${string}` {
  return keccak256(
    encodePacked(
      ["address", "int24", "int24", "bytes32"],
      [positionManager, tickLower, tickUpper, salt]
    )
  );
}
