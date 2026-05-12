import { parseAbi } from "viem";

export const JBSuckersRegistryV6Abi = parseAbi([
  "event SuckerDeployedFor(uint256 projectId, address sucker, (address deployer, bytes32 peer, (address localToken, uint32 minGas, bytes32 remoteToken)[] mappings) configuration, address caller)",
]);
