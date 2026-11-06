# Defifa NFT indexing

Defifa V6 projects are ordinary Juicebox projects, but their NFT hooks are created by
`DefifaDeployer.LaunchGame`, not `JB721TiersHookDeployer.HookDeployed`.
Bendystraw discovers these hooks from receipt-backed `@ballkidz/defifa@1.0.2`
deployers in `src/constants/defifa.ts`. The factory addresses, creation blocks and
event ABI come from the package's `deployments/defifa/*/DefifaDeployer.json` artifacts
and `src/interfaces/IDefifaDeployer.sol` (source revision
`d3c46dd4fe9a093cc46ed5eb2106395d2a19b860`).

## Defifa 2.0

`@ballkidz/defifa@2.0.0` (deploy-all-v6 PR #250) is indexed end to end so a client can render every 2.0 game,
721 and ERC-1155, without per-game RPC fan-out. 1.0.2 keeps only the NFT indexing below. All 2.0 contracts sit
at the same address on every chain (`src/constants/defifa.ts`). Start blocks are the receipt-backed creation
blocks of each chain's earliest 2.0 contract.

| Source | Address | Events |
|---|---|---|
| `DefifaDeployerV2` | 721 deployer `0x32cD…87A9`, 1155 deployer `0x7A62…ba80` | `LaunchGame`, `FulfilledCommitments`, `QueuedNoContest` |
| `DefifaHookV2` | factory on the 721 deployer's `LaunchGame.hook` | `Transfer`, `Mint`, `MintReservedToken`, delegation, `ClaimedTokens`, `TierCashOutWeightsSet` |
| `Defifa1155Hook` | factory on the 1155 deployer's `LaunchGame.hook` | `Mint`/`MintReservedToken` (count-based), `TransferSingle`, `TransferBatch`, delegation, claims, weights |
| `DefifaGovernorV2` | `0xd8de…7b78` (721), `0x53EE…2879` (1155) | `ScorecardSubmitted`, `ScorecardRatified` |
| `DefifaVotingReferee` | `0xf655…4640` | `ScorecardSubmitted` (proposal), `ScorecardAttested`, `AttestationRevoked`, `ScorecardForwarded`; games the 2.0 deployers did not launch are ignored |

2.0 hooks keep tiers in `DefifaTiersHookStore` (`0xF65d…Db7D`), so 2.0 tier reads (`maxTierIdOf`, `tierOf`,
`tierOfTokenId`) go there. Governor and referee settings are read at the `LaunchGame` block: their
`GameInitialized` events fire before `LaunchGame` in the same transaction. A referee's `initializeGameFor`
callback also runs before `LaunchGame`, so hook events can precede the seed: they resolve their game through the
hook's `projectId`, and anything the seed reads (tier supply, `totalMintCost`) is stored as the block's final
value rather than incremented, so launch-block events are never counted twice.

### Tables

- `defifaGame` (`chainId`, `projectId` = gameId): game type, deployer, hook, governor, referee, resolver, name,
  symbol, tier count; `mintStartsAt`, `refundStartsAt` (null without a refund period) and `scoringStartsAt`,
  the starts JBRulesets derived for the game's rulesets (a late launch shifts them from the scheduled `start`);
  `mintPeriodDuration`, `refundPeriodDuration`; `minParticipation`, `scorecardTimeout`, `timelockDuration`;
  voting-referee `attestationStartTime` and `attestationGracePeriod` (null for other referees); `totalMintCost`
  (refreshed on every mint and burn), `scorecardsCount`; `pendingScorecardId` and
  `pendingSubmittedAt`; `ratifiedScorecardId`/`ratifiedAt`; `cashOutWeights`/`cashOutWeightsSetAt`; `pot` and
  `commitmentsFulfilledAt`; `noContestQueuedAt`. Relations: `project` (balance, payments, cash-outs), `nftHook`
  (tiers, 721 tokens), `scorecards`, `holdings`, `tierDelegates`, `events`.
- `defifaScorecard`: `tierWeights`, `proposer`, `proposedAt`, `quorum` (the voting referee's `quorumOf`, frozen at
  proposal; null for other referees), `attestationsBegin` and `gracePeriodEnds` (voting referee), `attestationWeight`, `attestationsCount`, `forwardedAt`, `submittedAt`
  (to the governor), `ratifiedAt`. Relation: `attestations`.
- `defifaAttestation`: one row per (scorecard, account): current `weight` (0 once revoked), `attestedAt`,
  `revokedAt`.
- `defifaHolding`: positions per (hook, owner, tier) for both game types; `reserveCount` (ERC-1155 only) counts
  reserve-minted positions, which cannot be refunded. Rows stay at 0 after a full exit.
- `defifaTierDelegate`: attestation units delegated to each account per tier.
- `defifaEvent`: append-only feed (`launched`, `minted`, `reserveMinted`, `scorecardProposed`,
  `scorecardAttested`, `attestationRevoked`, `scorecardForwarded`, `scorecardSubmitted`, `scorecardRatified`,
  `cashOutWeightsSet`, `commitmentsFulfilled`, `noContestQueued`, `feeTokensClaimed`, `delegateChanged`) with
  transaction hash and timestamp. Mint rows repeat the transaction's total contribution per tier; never sum
  `amount` as revenue.

ERC-1155 positions update `nftTier.remainingSupply`, holdings and participants, but not
`project.nftsMintedCount` (an int a cheap tier could overflow); 721
positions keep using `nft`, `nftTier` and `mintNftEvent`. A game's entry count is the sum over its tiers of
`initialSupply - remainingSupply` (paid and reserve mints; burns do not restore supply).

### Values clients derive

Phase and scorecard state depend on the current time, so they are not stored. These mirror
`DefifaDeployer.currentGamePhaseOf` and `DefifaGovernor.stateOf`; they belong in the SDK, not in each client.

- Phase: before `mintStartsAt` COUNTDOWN; before `refundStartsAt` (or `scoringStartsAt` without a refund
  period) MINT; before `scoringStartsAt` REFUND; then COMPLETE if `cashOutWeightsSetAt` is set; else NO_CONTEST
  if `noContestQueuedAt` is set, or `minParticipation > 0 && totalMintCost < minParticipation`, or
  `scorecardTimeout > 0 && now > scoringStartsAt + scorecardTimeout`; else SCORING.
- Scorecard state: RATIFIED if it is `ratifiedScorecardId`, DEFEATED if another one is; DEFEATED if it is not
  `pendingScorecardId`; QUEUED until `pendingSubmittedAt + timelockDuration`; then SUCCEEDED (anyone can ratify).
  Before submission, a voting-referee proposal is PENDING before `attestationsBegin`, ACTIVE before
  `gracePeriodEnds`, then SUCCEEDED (anyone can forward it; the first forwarded wins) once
  `attestationWeight >= quorum`, else ACTIVE.

### Query recipes (GraphQL)

- Game list: `defifaGames(orderBy: "createdAt", orderDirection: "desc")`. This replaces the project-ID probe.
- Game page: `defifaGame(chainId, projectId) { …, project { balance }, nftHook { nftTiers { items { tierId price
  initialSupply remainingSupply metadata } } } }`. This replaces the 5 to 12 summary reads and the per-tier
  reads.
- Holders and picks: `defifaHoldings(where: { chainId, projectId, count_gt: 0 })`. This replaces the ownerOf
  brute force.
- A wallet's positions: `defifaHoldings(where: { owner, count_gt: 0 })`.
- Scorecards: `defifaScorecards(where: { chainId, projectId }) { items { …, attestations { items { account
  weight } } } }`. This replaces the `ScorecardSubmitted` getLogs and the per-scorecard reads.
- Voters: `defifaTierDelegates(where: { chainId, projectId })`.
- Activity: `defifaEvents(where: { chainId, projectId }, orderBy: "timestamp")`. This replaces the per-mint
  receipt fetches.

Values that still need a live read: `tokensClaimableFor` and the cash-out reclaim simulation (both
time-dependent and per account), and a wallet's chosen delegate per tier (`DelegateChanged` carries no tier ID,
so `getTierDelegateOf` stays the source).

## Defifa 1.0.2 NFT indexing

`LaunchGame` seeds the existing `nftHook` and `nftTier` tables. Defifa's
`tierNameOf` populates `nftTier.metadata.name`, including when `encodedIPFSUri`
is zero. Inventory seeding does not resolve every tier's native SVG/font payload;
`resolvedUri` is empty until resolved separately. A tier with no available IPFS
metadata still has its exact native name. Minted NFTs retain their native
`tokenURI` and parsed metadata through the shared V6 transfer handler.

Existing NFT ownership, participant snapshots and mint activity tables are reused.
Defifa's ABI-compatible paid `Mint` event records its native contributed amount in
`mintNftEvent.totalAmountPaid`. `MintReservedToken` records zero contributed amount.
Reserved mints also refresh the existing sucker-group aggregate and historical
moment when that group is established; they have no terminal payment event to
perform that refresh. Each event is one minted NFT; a transaction's total contribution may repeat across
several mint events, so these amounts must not be summed as project revenue.
Terminal payments remain the revenue source. Burns retain historical NFT rows with
the zero address as owner. `nftsMintedCount` is cumulative mints, not current supply.

Critical Defifa RPC/database failures propagate to Ponder instead of silently
omitting inventory. The ordinary JB721 handler behavior is unchanged. Discovery
via the native factory does not enable generic JB721 payment/cash-out management;
clients must use the SDK's protocol discriminator and native Defifa lifecycle.
Ratification and observation rules remain contract/Metalog concerns; this change
adds no guessed scorecard data or new GraphQL schema fields.

## Verification

Run `npm run codegen`, `npm run typecheck`, `npm test` and `npm run lint`.
`scripts/check-defifa-nfts.ts` replays real handlers through launch, paid mint,
transfer, reserved mint and burn; checks exact native names with no IPFS/resolver
metadata; checks failed native reads propagate; and compares ordinary JB721
mint/transfer/burn output with the checked-in pre-extraction golden fixture.

## Production rollout and historical backfill

Changing Ponder's sources or indexing code changes its build identity even without
a schema change. Ponder 0.17.6 normally refuses to reuse a schema initialized by a
different build. Merging this code alone does not make historical NFT rows appear.
Do not drop/reset the production database or restart the existing schema as a
shortcut.

1. Keep the existing production reader serving its schema.
2. Start the new revision against a separately named, writable schema using the
   deployment's normal Ponder schema configuration. Keep access to the existing
   sync cache where the deployment supports it; never write concurrently to the
   existing indexed schema.
3. Replay all configured sources from their configured creation blocks. The
   receipt-backed Defifa start blocks include earlier launches; starting at the
   current head would permanently omit them. There is no one-off SQL patch.
4. Verify mainnet Base project 27 has seven tiers with native names and reconcile
   its NFT owners/mint count against the actual finalized chain snapshot. Verify
   Base Sepolia project 46 has 21 tiers. Its minted count depends on the snapshot;
   do not treat the initial observed zero count as a permanent expectation.
5. Wait until historical replay finishes and indexing catches up. Verify both
   mainnet and testnet endpoints, graph relations, payments and ordinary JB721
   projects before switching readers to the new schema/deployment.
6. Retain the old schema/deployment for rollback until acceptance is complete.

No production database reset, restart, reindex or reader cutover is performed by
this source change. A deployment operator must select the actual schema names and
cutover mechanism; the repository has no linked Railway rollout configuration.
