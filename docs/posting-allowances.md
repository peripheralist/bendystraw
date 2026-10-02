# Croptop v6 posting allowances

`CTPublisher6:ConfigurePostingCriteria` indexes the complete allowance tuple emitted by every receipt-backed v6 publisher on Ethereum, Optimism, Base, Arbitrum and their Sepolia networks. The generator accepts successful deployment receipts only and starts at the earliest publisher receipt on each chain, including events in the deployment block. Previous publisher generations remain separate by address.

Two GraphQL collections are available through the existing authenticated GraphQL routes:

- `postingAllowances`: latest configuration for each `(chainId, publisher, hook, category, version)`.
- `configurePostingCriteriaEvents`: complete configuration event history, including caller, transaction, block and log position.

Both have direct project and collection relations. A missing collection row is resolved with `projectId()` at the event block and inserted; failed resolution fails indexing so it can retry. Updates replace all fields, including an empty allowlist. Prices and all uint32 values are bigint columns; GraphQL represents them as decimal strings. Ponder handles canonical event ordering and transactional rollback on reorgs.

Example (one exact publisher/collection identity; paginate until `hasNextPage` is false):

```graphql
query Allowances($chainId: Int!, $publisher: String!, $hook: String!, $cursor: String) {
  postingAllowances(
    where: { chainId: $chainId, publisher: $publisher, hook: $hook, version: 6 }
    after: $cursor
    limit: 100
  ) {
    items {
      chainId projectId publisher hook category version
      minimumPrice minimumTotalSupply maximumTotalSupply maximumSplitPercent
      allowedAddresses updatedAtBlock updatedAt logIndex txHash caller
    }
    pageInfo { hasNextPage endCursor }
  }
}
```

Group projects across chains using project relations, but match the **currently selected collection hook and publisher** on each chain. A project may have historical collection hooks, and configurations on those hooks do not establish current posting permissions. All successfully configured categories are reserved, including configurations not currently selected by a project's ruleset. The v6 contract requires nonzero minimum supply; it does not emit a deletion event.

## Rollout and completeness

Adding these sources/tables requires deployment and backfill before clients can rely on them. An empty GraphQL collection is **not evidence of a complete empty allowance list** while the indexer is catching up. This PR deliberately does not add a custom endpoint claiming per-source completeness: use the existing indexer readiness/status checks and only cut over clients after the new publisher sources have finished backfilling. GraphQL pagination must also finish before a client reports a complete list.

This eliminates browser explorer log scanning and per-category reads for summaries. Collection/bridge discovery remains separate. Before signing, read current collection selection, owner/operator/publisher permissions, allowance values and currency directly from the chain. Indexed summaries do not authorize wallet transactions.

Regenerate deployment evidence and ABIs with:

```sh
npm run generate:rollout -- --deployments ../deploy-all-v6/deployments --ref <canonical-deployment-commit>
```

The checked-in manifest records its source revision. `npm test` verifies replacement, allowlist clearing, same-transaction ordering, precision, identity isolation, hook resolution failure and all eight receipt-backed sources.
