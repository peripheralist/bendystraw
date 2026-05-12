import { parseAbi } from "viem";

export const JBSuckerV6Abi = parseAbi([
  "event Claimed(bytes32 beneficiary, address token, uint256 projectTokenCount, uint256 terminalTokenAmount, uint256 index, address caller)",
  "event InsertToOutboxTree(bytes32 beneficiary, address token, bytes32 hashed, uint256 index, bytes32 root, uint256 projectTokenCount, uint256 terminalTokenAmount, address caller)",
  "event RootToRemote(bytes32 root, address token, uint256 index, uint64 nonce, address caller)",
  "function DIRECTORY() view returns (address)",
  "function peer() view returns (bytes32)",
  "function peerChainId() view returns (uint256)",
  "function projectId() view returns (uint256)",
]);
