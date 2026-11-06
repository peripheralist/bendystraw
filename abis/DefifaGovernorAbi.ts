import { parseAbi } from "viem";

// @ballkidz/defifa 2.0.0 DefifaGovernor: ratifies what each game's referee submits, after a timelock.
export const DefifaGovernorAbi = parseAbi([
  "struct DefifaTierCashOutWeight { uint256 id; uint256 cashOutWeight; }",
  "function refereeOf(uint256 gameId) view returns (address)",
  "function timelockDurationOf(uint256 gameId) view returns (uint256)",
  "event ScorecardSubmitted(uint256 indexed gameId, uint256 indexed scorecardId, DefifaTierCashOutWeight[] tierWeights, address caller)",
  "event ScorecardRatified(uint256 indexed gameId, uint256 indexed scorecardId, address caller)",
]);

// @ballkidz/defifa 2.0.0 DefifaVotingReferee: the sample referee carrying 1.0.2's attestation voting.
export const DefifaVotingRefereeAbi = parseAbi([
  "struct DefifaTierCashOutWeight { uint256 id; uint256 cashOutWeight; }",
  "function attestationStartTimeOf(uint256 gameId) view returns (uint256)",
  "function attestationGracePeriodOf(uint256 gameId) view returns (uint256)",
  "event ScorecardSubmitted(uint256 indexed gameId, uint256 indexed scorecardId, DefifaTierCashOutWeight[] tierWeights, address caller)",
  "event ScorecardAttested(uint256 indexed gameId, uint256 indexed scorecardId, uint256 weight, address caller)",
  "event AttestationRevoked(uint256 indexed gameId, uint256 indexed scorecardId, address account, uint256 weight, address caller)",
  "event ScorecardForwarded(uint256 indexed gameId, uint256 indexed scorecardId, address caller)",
  "function quorumOf(uint256 gameId, uint256 scorecardId) view returns (uint256)",
]);
