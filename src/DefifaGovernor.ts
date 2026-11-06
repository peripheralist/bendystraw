import { Context, ponder } from "ponder:registry";
import { defifaAttestation, defifaGame, defifaScorecard } from "ponder:schema";
import { DefifaVotingRefereeAbi } from "../abis/DefifaGovernorAbi";
import { insertDefifaEvent } from "./util/defifa";

type TierWeights = readonly { id: bigint; cashOutWeight: bigint }[];
const toTierWeights = (weights: TierWeights) =>
  weights.map(({ id, cashOutWeight }) => ({ tierId: Number(id), cashOutWeight: cashOutWeight.toString() }));

/**
 * Whether a game was launched by a 2.0 deployer. Anyone can initialize the shared voting referee for a game of
 * their own, so its events can name games this index does not track.
 */
async function isTrackedGame(context: Context, projectId: number) {
  return !!await context.db.find(defifaGame, { chainId: context.chain.id, projectId });
}

/** Create a scorecard row the first time any contract reports it, and count it on its game. */
async function ensureScorecard({
  context, projectId, scorecardId, tierWeights, proposer, timestamp, txHash, quorum, attestationsBegin, gracePeriodEnds,
}: {
  context: Context; projectId: number; scorecardId: bigint; tierWeights: TierWeights; proposer: `0x${string}`;
  timestamp: number; txHash: `0x${string}`; quorum?: bigint; attestationsBegin?: bigint; gracePeriodEnds?: bigint;
}) {
  const key = { chainId: context.chain.id, projectId, scorecardId };
  if (await context.db.find(defifaScorecard, key)) return key;
  await context.db.insert(defifaScorecard).values({
    ...key, tierWeights: toTierWeights(tierWeights), proposer, proposedAt: timestamp, proposalTxHash: txHash, quorum,
    attestationsBegin, gracePeriodEnds, attestationWeight: 0n, attestationsCount: 0,
  });
  await context.db.update(defifaGame, { chainId: context.chain.id, projectId })
    .set((game) => ({ scorecardsCount: game.scorecardsCount + 1 }));
  return key;
}

// ── Governor: accepts its game's referee's submission, then anyone ratifies after the timelock. ──

ponder.on("DefifaGovernorV2:ScorecardSubmitted", async ({ event, context }) => {
  const { gameId, scorecardId, tierWeights, caller } = event.args;
  const projectId = Number(gameId);
  const timestamp = Number(event.block.timestamp);
  // A referee other than the voting referee submits scorecards nobody proposed on-chain first.
  const key = await ensureScorecard({ context, projectId, scorecardId, tierWeights, proposer: caller, timestamp, txHash: event.transaction.hash });
  await context.db.update(defifaScorecard, key).set({ submittedAt: timestamp });
  // A new submission replaces the pending one.
  await context.db.update(defifaGame, { chainId: context.chain.id, projectId })
    .set({ pendingScorecardId: scorecardId, pendingSubmittedAt: timestamp });
  await insertDefifaEvent({ event, context, projectId, type: "scorecardSubmitted", account: caller, scorecardId });
});

ponder.on("DefifaGovernorV2:ScorecardRatified", async ({ event, context }) => {
  const { gameId, scorecardId, caller } = event.args;
  const projectId = Number(gameId);
  const timestamp = Number(event.block.timestamp);
  await context.db.update(defifaScorecard, { chainId: context.chain.id, projectId, scorecardId }).set({ ratifiedAt: timestamp });
  await context.db.update(defifaGame, { chainId: context.chain.id, projectId })
    .set({ ratifiedScorecardId: scorecardId, ratifiedAt: timestamp });
  await insertDefifaEvent({ event, context, projectId, type: "scorecardRatified", account: caller, scorecardId });
});

// ── DefifaVotingReferee: holders propose and attest; the first scorecard to pass is forwarded. ──

ponder.on("DefifaVotingReferee:ScorecardSubmitted", async ({ event, context }) => {
  const { gameId, scorecardId, tierWeights, caller } = event.args;
  const projectId = Number(gameId);
  if (!await isTrackedGame(context, projectId)) return;
  // The quorum each scorecard needs is frozen at its proposal.
  const quorum = await context.client.readContract({
    abi: DefifaVotingRefereeAbi, address: event.log.address, functionName: "quorumOf", args: [gameId, scorecardId],
    blockNumber: event.block.number,
  });
  // DefifaVotingReferee: attestations open at the game's attestation start, or one second after proposal once that
  // start has passed; the grace period runs from there.
  const timestamp = Number(event.block.timestamp);
  const game = await context.db.find(defifaGame, { chainId: context.chain.id, projectId });
  if (!game || game.attestationStartTime == null || game.attestationGracePeriod == null) {
    throw new Error(`Defifa game ${projectId} has no voting-referee settings`);
  }
  const now = BigInt(timestamp);
  const attestationsBegin = now >= game.attestationStartTime ? now + 1n : game.attestationStartTime;
  await ensureScorecard({
    context, projectId, scorecardId, tierWeights, proposer: caller, timestamp, txHash: event.transaction.hash, quorum,
    attestationsBegin, gracePeriodEnds: attestationsBegin + game.attestationGracePeriod,
  });
  await insertDefifaEvent({ event, context, projectId, type: "scorecardProposed", account: caller, scorecardId });
});

ponder.on("DefifaVotingReferee:ScorecardAttested", async ({ event, context }) => {
  const { gameId, scorecardId, weight, caller } = event.args;
  const projectId = Number(gameId);
  if (!await isTrackedGame(context, projectId)) return;
  const chainId = context.chain.id;
  const timestamp = Number(event.block.timestamp);
  const key = { chainId, projectId, scorecardId, account: caller };
  // A revoked attestation can be made again; it then counts as a new attester.
  const previous = await context.db.find(defifaAttestation, key);
  const isNewAttester = !previous || previous.weight === 0n;
  const row = { weight, attestedAt: timestamp, revokedAt: null };
  await context.db.insert(defifaAttestation).values({ ...key, ...row }).onConflictDoUpdate(row);
  await context.db.update(defifaScorecard, { chainId, projectId, scorecardId }).set((card) => ({
    attestationWeight: card.attestationWeight + weight,
    attestationsCount: card.attestationsCount + (isNewAttester ? 1 : 0),
  }));
  await insertDefifaEvent({ event, context, projectId, type: "scorecardAttested", account: caller, scorecardId, weight });
});

ponder.on("DefifaVotingReferee:AttestationRevoked", async ({ event, context }) => {
  const { gameId, scorecardId, account, weight } = event.args;
  const projectId = Number(gameId);
  if (!await isTrackedGame(context, projectId)) return;
  const chainId = context.chain.id;
  await context.db.update(defifaAttestation, { chainId, projectId, scorecardId, account })
    .set({ weight: 0n, revokedAt: Number(event.block.timestamp) });
  await context.db.update(defifaScorecard, { chainId, projectId, scorecardId }).set((card) => ({
    attestationWeight: card.attestationWeight - weight,
    attestationsCount: card.attestationsCount - 1,
  }));
  await insertDefifaEvent({ event, context, projectId, type: "attestationRevoked", account, scorecardId, weight });
});

ponder.on("DefifaVotingReferee:ScorecardForwarded", async ({ event, context }) => {
  const { gameId, scorecardId, caller } = event.args;
  const projectId = Number(gameId);
  if (!await isTrackedGame(context, projectId)) return;
  await context.db.update(defifaScorecard, { chainId: context.chain.id, projectId, scorecardId })
    .set({ forwardedAt: Number(event.block.timestamp) });
  await insertDefifaEvent({ event, context, projectId, type: "scorecardForwarded", account: caller, scorecardId });
});
