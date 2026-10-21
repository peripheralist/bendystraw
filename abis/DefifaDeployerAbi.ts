import { parseAbi } from "viem";

// @ballkidz/defifa 1.0.2 and 2.0.0 share these IDefifaDeployer events and views.
export const DefifaDeployerAbi = parseAbi([
  "event LaunchGame(uint256 indexed gameId, address indexed hook, address indexed governor, address tokenUriResolver, address caller)",
  "event FulfilledCommitments(uint256 indexed gameId, uint256 pot, address caller)",
  "event QueuedNoContest(uint256 indexed gameId, address caller)",
  "function timesFor(uint256 gameId) view returns (uint48 start, uint24 mintPeriodDuration, uint24 refundPeriodDuration)",
  "function safetyParamsOf(uint256 gameId) view returns (uint256 minParticipation, uint32 scorecardTimeout)",
]);
