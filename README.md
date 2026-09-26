# Bendystraw

Bendystraw is a GraphQL API for the [Juicebox protocol](https://juicebox.money) built using [Ponder](https://ponder.sh), an open-source framework for indexing on-chain events, and maintained by [Peri](https://x.com/peripheralist).

Ponder indexes events emitted by the protocol, and stores data in two databases with identical schemas—one for mainnets, and one for testnets. Each has its own URL, and a playground where you can browse the schema and make queries against real data.

| Base URL | <code>bendystraw.xyz</code> | <code>testnet.bendystraw.xyz</code> |
| -- | -- | -- |
| Chains | Ethereum<br/>Arbitrum<br/>Base<br/>Optimism | Sepolia<br/>Arbitrum Sepolia<br/>Base Sepolia<br/>Optimism Sepolia |
| Status | ![mainnets status](https://bendystraw.xyz/status.svg) | ![testnets status](https://testnet.bendystraw.xyz/status.svg) |
| | [Playground](https://bendystraw.xyz/schema) | [Playground](https://testnet.bendystraw.xyz/schema) |

---

## Getting Started

### Authentication

To make queries, first contact [Peri](https://x.com/peripheralist) for an API key. **API keys should not be exposed.** If you need to make requests from a frontend, consider using a server side proxy.

### Schema

To download the schema (e.g. for generating graphql types in your frontend):

`GET https://bendystraw.xyz/schema` (no API key)

> Schemas are the same for both mainnet and testnet databases.

### GraphQL Queries

`POST https://<base-url>/<api-key>/graphql`

**Singular queries**

- Return a single row from a table. Must define primary key for table (e.g. for projects, primary key is compound `projectId` + `chainId` + `version`). Response contains only the row data.

  <table>
    <tr>
      <th>GraphQL</th>
      <th>Response</th>
    </tr>
    <tr>
      <td>
      <code>project(projectId, chainId, version) {
    balance
    volume
    suckerGroupId
    ...
  }</code>
      </td>
      <td>
      <code>{ 
    project: { 
      balance,
      volume,
      suckerGroup,
      ... 
    }
  }</code>
      </td>
    </tr>
  </table>

**Plural queries**

- Return multiple rows from a table. Must define at least one of: `where`, `limit`, `orderBy`, `orderDirection`. Also supports `pageInfo` and `totalCount` (see [Ponder docs](https://ponder.sh/docs/query/graphql#pagination) for details).

  <table>
    <tr>
      <th>GraphQL</th>
      <th>Response</th>
    </tr>
    <tr>
      <td>
      <code>projects(
    where: { chainId: 1 }, 
    orderBy: "createdAt", 
    orderDirection: "desc", 
    limit: 10
  ) {
    items {
      balance
      volume
      suckerGroupId
      ...
    }
    pageInfo {
      endCursor
      hasNextPage
      ...
    }
    totalCount
  }</code>
      </td>
      <td>
      <code>{
    projects: {
      totalCount,
      pageInfo: {
        endCursor,
        hasNextPage,
        ...
      },
      items: { 
        balance, 
        volume, 
        suckerGroupId, 
        ... 
      }[]
    }
  }</code>
      </td>
    </tr>
  </table>

### V6 routing deployments and retained custody

`GET /deployments` returns this indexer's receipt-backed contract records for its network, including each address, deployment block, package version, artifact path, and generation (`current`, `previous`, or `v1`). `current` means the canonical deployment artifact; an individual project's registry selection can still point to a previous generation. Historical buyback and router addresses remain indexed after retirement.

Canonical artifact commit `a6ab40c5806b52ff4cb21f9eaefe275e621796f9` records executed buyback 1.4.0, router 1.3.0, gateway, and ratio-feed deployments on Ethereum, Arbitrum, Base, Optimism, Sepolia, Base Sepolia, and Arbitrum Sepolia. Optimism Sepolia has the ratio price feed only. The generated records now enable the gateway on all four mainnets at each chain's actual deployment block; existing project pins can still select a retired generation. All V6 activity keeps `version: 6`, including records from retired V6 contracts.

Gateway custody is available through these GraphQL collections:

| Collection | Contents |
| --- | --- |
| `routerPendingCalls` | Original call, memo, metadata, commitment, amount, source/destination project, retry state, and terminal status. Resolved calls stay in history with `retainedAmount: 0`. |
| `routerPendingCallEvents` | Ordered queue, failed retry, settlement, and refund history, including exact emitted failure-class hashes and custody deltas. Sort by block number and log index within a chain. |
| `routerRetainedBalances` | Original-token custody grouped by chain, gateway, source project, and token, with cumulative queued, settled, and refunded amounts. |
| `routerPermitFailureEvents` | Permit2 failures emitted by current and retired routers. These events have no project ID and do not by themselves imply retained custody. |

For example, inspect a source project's custody separately from its recorded terminal balance:

```graphql
query {
  routerRetainedBalances(where: { chainId: 11155111, sourceProjectId: 2, version: 6 }) {
    items { gateway token retainedAmount pendingCallCount queuedAmount settledAmount refundedAmount }
  }
  routerPendingCalls(where: { chainId: 11155111, sourceProjectId: 2, version: 6 }) {
    items { pendingCallId gateway projectId token amount retainedAmount status latestErrorHash failureCount nextAttemptAt }
  }
}
```

A queued call retains the original input token. Its first failure is unqualified (`failureCount: 0`); later qualified failures update the emitted streak and next retry time. A changed error class resets the streak. `settled` means the retry reached the destination, and `refunded` means the gateway returned funds through source-project accounting. These amounts are separate from destination revenue and must not be counted as a successful payment while retained. Full revert bytes and retry gas budgets are not emitted by the gateway; use the onchain failure-state read when preparing an executable retry.

After canonical artifacts change, regenerate from the sibling deployment repository and reindex:

```sh
npm run generate:rollout -- --ref a6ab40c5806b52ff4cb21f9eaefe275e621796f9
npm run codegen
npm run typecheck
npm test
```

The generator reads `../deploy-all-v6/deployments` (override with `--deployments /path/to/deployments`). `--ref` selects a committed artifact snapshot; without it, the current files are read. The example pins the executed production snapshot; choose the newer verified artifact commit for later rollouts, and do not regenerate from an older checkout or branch that predates deployed generations. A successful deployment receipt is required for every included address. Proposed addresses are never indexing sources. The generated ABIs and manifest should be committed together. Changing the schema or restoring older deployment blocks requires the normal Ponder reindex; run `TESTNET=true npm run dev` against a testnet RPC before production rollout.

### Sticky and Homerun projects

`project` and `participant` rows carry `isSticky` and `isHomerun` next to `isRevnet`. `isSticky` means the V6 StickyDeployer owns the project, which it does for every project it launches. `isHomerun` marks FUND projects and their INCOME revnets launched through HomerunDeployer, taken from its `FundLaunched` and `IncomeDeployed` events, because a FUND is handed to its owner at launch and INCOME is owned by the REVOwner. An INCOME revnet has both `isHomerun` and `isRevnet`.

StickyHook positions are available through these GraphQL collections:

| Collection | Contents |
| --- | --- |
| `stickyPositions` | Each holder's staked balance per project, the start of their current streak (null when they have none), and their longest completed streak in seconds. |
| `stickyEvents` | Ordered `staked`, `unstaked`, `streakStarted`, and `streakEnded` history with the resulting staked balance. A transfer between holders is an `unstaked` row for the sender and a `staked` row for the receiver, whose payer is the sender. |

A holder's current streak is the current time minus `streakStartedAt`; their longest streak is the larger of that and `longestCompletedStreak`, as `StickyHook.longestStreakOf` reports.

### Special Queries

Some data is not conveniently accessible via GraphQL, but may be requested via other endpoints.

- `/participants` **Participants snapshot at timestamp**

  Retrieve every `participantSnapshot` object for a sucker group, at a particular **timestamp**, de-duped by wallet address. Useful for checking all wallets' token balances at a particular point in time. 
  
  > Note: Retrieving participants for a particular **block height** is impractical here, as block numbers are not consistent across chains.

  <table>
    <tr>
      <th>Request</th>
      <th>Response</th>
    </tr>
    <tr>
      <td>
        <code>POST https://&lt;url&gt;/&lt;api-key&gt;/participants</code>
        <br/>
        <br/>
        <code>// body <br/>{
    suckerGroupId: "",
    timestamp: 42069, // unix timestamp (seconds)
  }</code>
      </td>
      <td>
        <code>{
    chainId,
    projectId,
    suckerGroupId,
    timestamp,
    block,
    address,
    volume,
    volumeUsd,
    balance,
    creditBalance,
    erc20Balance,
  }[]</code>
      </td>
    </tr>
  </table>

---

## Guides & Patterns

### ChainId

Because Bendystraw indexes data from multiple chains, nearly every table includes a `chainId` property. This is useful for filtering data by chain, or simply differentiating which chain a table row was created from. Nearly every compound primary key also makes use of `chainId`.

### Sucker Groups

A sucker group is a group of linked projects on different chains. These projects act as a single omnichain project, with shared revenue and tokens. While the `projects` table has a compound primary key of `projectId` + `chainId`, the `suckerGroups` table uses a single `id` primary key.

Most tables (`participants`, `activityEvents`, etc) include a `suckerGroupId` column, which can be used to filter rows in a graphQL response.

### Deterministic unique IDs

`project.id` and `suckerGroup.id` are deterministic and will not change. They may be stored or computed to avoid real-time lookups.
- `project.id` is a string computed from `project.projectId`, `project.version`, and `project.chainId`.
- `suckerGroup.id` is a hash of the `id`s of the group's contained `project`s.

See the [Source code](https://github.com/peripheralist/bendystraw/blob/main/src/util/id.ts) for how these `id`s are computed.

All other unique `id`s are not deterministic, and may change anytime Bendystraw is reindexed.

### Manual events

Two extra `manual` event tables are indexed for convenience, and have the same schema as their non-manual counterparts:
- `manualBurnEvent`: Tokens are burned by a project operator, NOT as a result of a `cashOut` event. `burnEvent`s include ALL token burns.
- `manualMintTokensEvent`: Tokens are minted by a project operator, NOT as a result of a `pay` event. `mintTokensEvent`s include ALL token mints.


---

## Links

- [Github](https://github.com/peripheralist/bendystraw)
- [Legal](/legal)