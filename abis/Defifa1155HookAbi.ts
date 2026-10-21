import { parseAbi } from "viem";

// @ballkidz/defifa 2.0.0 Defifa1155Hook. Paid positions use token ID = tier ID; reserve-minted positions use
// tier ID + 65536 (Defifa1155HookLib.RESERVE_TOKEN_ID_OFFSET).
export const Defifa1155HookAbi = parseAbi([
  "struct DefifaTierCashOutWeight { uint256 id; uint256 cashOutWeight; }",
  "event Mint(uint256 indexed tierId, address indexed beneficiary, uint256 count, uint256 totalAmountContributed, address caller)",
  "event MintReservedToken(uint256 indexed tierId, address indexed beneficiary, uint256 count, address caller)",
  "event TransferSingle(address indexed operator, address indexed from, address indexed to, uint256 id, uint256 value)",
  "event TransferBatch(address indexed operator, address indexed from, address indexed to, uint256[] ids, uint256[] values)",
  "event TierDelegateAttestationsChanged(address indexed delegate, uint256 indexed tierId, uint256 previousBalance, uint256 newBalance, address caller)",
  "event DelegateChanged(address indexed delegator, address indexed fromDelegate, address indexed toDelegate, address caller)",
  "event ClaimedTokens(address indexed beneficiary, uint256 defifaTokenAmount, uint256 baseProtocolTokenAmount, address caller)",
  "event TierCashOutWeightsSet(DefifaTierCashOutWeight[] tierWeights, address caller)",
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function tierNameOf(uint256 tierId) view returns (string)",
  "function totalMintCost() view returns (uint256)",
]);
