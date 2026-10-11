import { parseAbi } from "viem";

// @ballkidz/defifa 1.0.2. Mint's native amount argument is totalAmountContributed;
// the ABI-equivalent name totalAmountPaid lets both hook families share indexed output.
export const DefifaHookAbi = parseAbi([
  "event Mint(uint256 indexed tokenId, uint256 indexed tierId, address indexed beneficiary, uint256 totalAmountPaid, address caller)",
  "event MintReservedToken(uint256 indexed tokenId, uint256 indexed tierId, address indexed beneficiary, address caller)",
  "event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)",
  "function tierNameOf(uint256 tierId) view returns (string)",
]);
