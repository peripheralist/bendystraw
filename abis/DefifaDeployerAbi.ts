import { parseAbi } from "viem";

// @ballkidz/defifa 1.0.2, IDefifaDeployer.sol.
export const DefifaDeployerAbi = parseAbi([
  "event LaunchGame(uint256 indexed gameId, address indexed hook, address indexed governor, address tokenUriResolver, address caller)",
]);
