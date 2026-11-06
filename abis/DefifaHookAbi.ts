import { parseAbi } from "viem";

// @ballkidz/defifa 1.0.2 and 2.0.0 721 hooks emit the same events. Mint's native amount argument is
// totalAmountContributed; the ABI-equivalent name totalAmountPaid lets both hook families share indexed output.
export const DefifaHookAbi = parseAbi([
  "struct DefifaTierCashOutWeight { uint256 id; uint256 cashOutWeight; }",
  "event Mint(uint256 indexed tokenId, uint256 indexed tierId, address indexed beneficiary, uint256 totalAmountPaid, address caller)",
  "event MintReservedToken(uint256 indexed tokenId, uint256 indexed tierId, address indexed beneficiary, address caller)",
  "event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)",
  "event TierDelegateAttestationsChanged(address indexed delegate, uint256 indexed tierId, uint256 previousBalance, uint256 newBalance, address caller)",
  "event DelegateChanged(address indexed delegator, address indexed fromDelegate, address indexed toDelegate, address caller)",
  "event ClaimedTokens(address indexed beneficiary, uint256 defifaTokenAmount, uint256 baseProtocolTokenAmount, address caller)",
  "event TierCashOutWeightsSet(DefifaTierCashOutWeight[] tierWeights, address caller)",
  "function tierNameOf(uint256 tierId) view returns (string)",
  "function totalMintCost() view returns (uint256)",
  "function projectId() view returns (uint256)",
]);
