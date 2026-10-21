# Defifa NFT indexing

Defifa V6 projects are ordinary Juicebox projects, but their NFT hooks are created by
`DefifaDeployer.LaunchGame`, not `JB721TiersHookDeployer.HookDeployed`.
Bendystraw discovers these hooks from receipt-backed `@ballkidz/defifa@1.0.2`
deployers in `src/constants/defifa.ts`. The factory addresses, creation blocks and
event ABI come from the package's `deployments/defifa/*/DefifaDeployer.json` artifacts
and `src/interfaces/IDefifaDeployer.sol` (source revision
`d3c46dd4fe9a093cc46ed5eb2106395d2a19b860`).

## Defifa 2.0

`@ballkidz/defifa@2.0.0` adds a second 721 game deployer at
`0x32cD7d0C378a45A27cd7E361BCe0ba882efE87A9` on all eight chains (deploy-all-v6
PR #250), indexed as `DefifaDeployerV2` / `DefifaHookV2`. Its `LaunchGame`, `Mint`,
`MintReservedToken` and `Transfer` events match 1.0.2, so the same handlers run. 2.0
hooks keep tiers in their own `DefifaTiersHookStore`
(`0xF65dd3aDBaC3D776cfA025458Cac730Aa52ADb7D`), not the canonical
`JB721TiersHookStore`, so the V2 handlers read `maxTierIdOf`, `tierOf` and
`tierOfTokenId` from that store. Start blocks are chain heads read before the
deploy executed, so they precede every 2.0 launch. 1.0.2 games are unchanged.

The 2.0 ERC-1155 game type (`Defifa1155Deployer`) is not indexed: its positions are
fungible per tier (`TransferSingle`/`TransferBatch`, count-based `Mint`), which the
token-ID-keyed `nft` table does not model.

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
