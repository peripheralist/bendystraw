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

- Return a single row from a table. Must define primary key for table (e.g. for projects, primary key is compound `projectId` + `chainId`). Response contains only the row data.

  <table>
    <tr>
      <th>GraphQL</th>
      <th>Response</th>
    </tr>
    <tr>
      <td>
      <code>project(projectId, chainId) {
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