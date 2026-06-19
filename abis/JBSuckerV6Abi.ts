import { parseAbi } from "viem";

export const JBSuckerV6Abi = parseAbi([
  "event AccountingDataSynced(uint256 sourceTimestamp, address caller)",
  "event Claimed(bytes32 beneficiary, address token, uint256 projectTokenCount, uint256 terminalTokenAmount, uint256 index, bytes32 metadata, address caller)",
  "event InsertToOutboxTree(bytes32 indexed beneficiary, address indexed token, bytes32 hashed, uint256 index, bytes32 root, uint256 projectTokenCount, uint256 terminalTokenAmount, bytes32 metadata, address caller)",
  "event NewInboxTreeRoot(address indexed token, uint64 nonce, bytes32 root, address caller)",
  "event RootToRemote(bytes32 indexed root, address indexed token, uint256 index, uint64 nonce, address caller)",
  "function DIRECTORY() view returns (address)",
  "function peer() view returns (bytes32)",
  "function peerChainId() view returns (uint256)",
  "function projectId() view returns (uint256)",
]);
