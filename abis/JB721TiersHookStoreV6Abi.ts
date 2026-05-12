import { parseAbi } from "viem";

export const JB721TiersHookStoreV6Abi = parseAbi([
  "function maxTierIdOf(address hook) view returns (uint256)",
  "function tierOf(address hook, uint256 id, bool includeResolvedUri) view returns ((uint32 id, uint104 price, uint32 remainingSupply, uint32 initialSupply, uint104 votingUnits, uint16 reserveFrequency, address reserveBeneficiary, bytes32 encodedIPFSUri, uint24 category, uint8 discountPercent, (bool allowOwnerMint, bool transfersPausable, bool cantBeRemoved, bool cantIncreaseDiscountPercent, bool cantBuyWithCredits) flags, uint32 splitPercent, string resolvedUri))",
  "function tierOfTokenId(address hook, uint256 tokenId, bool includeResolvedUri) view returns ((uint32 id, uint104 price, uint32 remainingSupply, uint32 initialSupply, uint104 votingUnits, uint16 reserveFrequency, address reserveBeneficiary, bytes32 encodedIPFSUri, uint24 category, uint8 discountPercent, (bool allowOwnerMint, bool transfersPausable, bool cantBeRemoved, bool cantIncreaseDiscountPercent, bool cantBuyWithCredits) flags, uint32 splitPercent, string resolvedUri))",
]);
