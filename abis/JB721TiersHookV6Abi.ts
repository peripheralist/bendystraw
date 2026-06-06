import { parseAbi } from "viem";

export const JB721TiersHookV6Abi = parseAbi([
  "event AddTier(uint256 indexed tierId, (uint104 price, uint32 initialSupply, uint32 votingUnits, uint16 reserveFrequency, address reserveBeneficiary, bytes32 encodedIPFSUri, uint24 category, uint8 discountPercent, (bool allowOwnerMint, bool useReserveBeneficiaryAsDefault, bool transfersPausable, bool useVotingUnits, bool cantBeRemoved, bool cantIncreaseDiscountPercent, bool cantBuyWithCredits) flags, uint32 splitPercent, (uint32 percent, uint64 projectId, address beneficiary, bool preferAddToBalance, uint48 lockedUntil, address hook)[] splits) tier, address caller)",
  "event Mint(uint256 indexed tokenId, uint256 indexed tierId, address indexed beneficiary, uint256 totalAmountPaid, address caller)",
  "event RemoveTier(uint256 indexed tierId, address caller)",
  "event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)",
  "function projectId() view returns (uint256)",
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function tokenURI(uint256 tokenId) view returns (string)",
]);
