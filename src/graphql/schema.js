import { gql } from "graphql-tag";

const typeDefs = gql`"""
Marks the GraphQL type as indexable entity.  Each type that should be an entity
is required to be annotated with this directive.
"""
directive @entity on OBJECT

"""Defined a Subgraph ID for an object type"""
directive @subgraphId(id: String!) on OBJECT

"""
creates a virtual field on the entity that may be queried but cannot be set manually through the mappings API.
"""
directive @derivedFrom(field: String!) on FIELD_DEFINITION

type _Block_ {
  chain: Int!
  """The hash of the block"""
  hash: Bytes

  """The block number"""
  number: Int!

  """Integer representation of the timestamp stored in blocks for the chain"""
  timestamp: Int

  """The hash of the parent block"""
  parentHash: Bytes
}

"""The type for the top-level _meta field"""
type _Meta_ {
  chain: Int!
  """
  Information about a specific subgraph block. The hash of the block
  will be null if the _meta field has a block constraint that asks for
  a block number. It will be filled if the _meta field has no block constraint
  and therefore asks for the latest  block
  
  """
  block: _Block_!

  """The deployment ID"""
  deployment: String!

  """If 'true', the subgraph encountered indexing errors at some past block"""
  hasIndexingErrors: Boolean!
}

enum _SubgraphErrorPolicy_ {
  """Data will be returned even if the subgraph has indexing errors"""
  allow

  """
  If the subgraph has indexing errors, data will be omitted. The default.
  """
  deny
}

type AddToBalanceEvent {
  chain: Int!
  id: ID!
  project: Project!
  projectId: Int!
  timestamp: Int!
  txHash: Bytes!
  from: Bytes!
  caller: Bytes!
  amount: BigInt!
  amountUSD: BigInt
  note: String
}

input AddToBalanceEvent_filter {
  chain: Int
  chain_in: [Int]
  id: ID
  id_not: ID
  id_gt: ID
  id_lt: ID
  id_gte: ID
  id_lte: ID
  id_in: [ID!]
  id_not_in: [ID!]
  project: String
  project_not: String
  project_gt: String
  project_lt: String
  project_gte: String
  project_lte: String
  project_in: [String!]
  project_not_in: [String!]
  project_contains: String
  project_contains_nocase: String
  project_not_contains: String
  project_not_contains_nocase: String
  project_starts_with: String
  project_starts_with_nocase: String
  project_not_starts_with: String
  project_not_starts_with_nocase: String
  project_ends_with: String
  project_ends_with_nocase: String
  project_not_ends_with: String
  project_not_ends_with_nocase: String
  project_: Project_filter
  projectId: Int
  projectId_not: Int
  projectId_gt: Int
  projectId_lt: Int
  projectId_gte: Int
  projectId_lte: Int
  projectId_in: [Int!]
  projectId_not_in: [Int!]
  timestamp: Int
  timestamp_not: Int
  timestamp_gt: Int
  timestamp_lt: Int
  timestamp_gte: Int
  timestamp_lte: Int
  timestamp_in: [Int!]
  timestamp_not_in: [Int!]
  txHash: Bytes
  txHash_not: Bytes
  txHash_gt: Bytes
  txHash_lt: Bytes
  txHash_gte: Bytes
  txHash_lte: Bytes
  txHash_in: [Bytes!]
  txHash_not_in: [Bytes!]
  txHash_contains: Bytes
  txHash_not_contains: Bytes
  from: Bytes
  from_not: Bytes
  from_gt: Bytes
  from_lt: Bytes
  from_gte: Bytes
  from_lte: Bytes
  from_in: [Bytes!]
  from_not_in: [Bytes!]
  from_contains: Bytes
  from_not_contains: Bytes
  caller: Bytes
  caller_not: Bytes
  caller_gt: Bytes
  caller_lt: Bytes
  caller_gte: Bytes
  caller_lte: Bytes
  caller_in: [Bytes!]
  caller_not_in: [Bytes!]
  caller_contains: Bytes
  caller_not_contains: Bytes
  amount: BigInt
  amount_not: BigInt
  amount_gt: BigInt
  amount_lt: BigInt
  amount_gte: BigInt
  amount_lte: BigInt
  amount_in: [BigInt!]
  amount_not_in: [BigInt!]
  amountUSD: BigInt
  amountUSD_not: BigInt
  amountUSD_gt: BigInt
  amountUSD_lt: BigInt
  amountUSD_gte: BigInt
  amountUSD_lte: BigInt
  amountUSD_in: [BigInt!]
  amountUSD_not_in: [BigInt!]
  note: String
  note_not: String
  note_gt: String
  note_lt: String
  note_gte: String
  note_lte: String
  note_in: [String!]
  note_not_in: [String!]
  note_contains: String
  note_contains_nocase: String
  note_not_contains: String
  note_not_contains_nocase: String
  note_starts_with: String
  note_starts_with_nocase: String
  note_not_starts_with: String
  note_not_starts_with_nocase: String
  note_ends_with: String
  note_ends_with_nocase: String
  note_not_ends_with: String
  note_not_ends_with_nocase: String

  """Filter for the block changed event."""
  _change_block: BlockChangedFilter
  and: [AddToBalanceEvent_filter]
  or: [AddToBalanceEvent_filter]
}

enum AddToBalanceEvent_orderBy {
  id
  project
  project__id
  project__projectId
  project__handle
  project__deployer
  project__metadataUri
  project__owner
  project__creator
  project__createdAt
  project__paymentsCount
  project__contributorsCount
  project__redeemCount
  project__volume
  project__volumeUSD
  project__redeemVolume
  project__redeemVolumeUSD
  project__currentBalance
  project__tokenSupply
  project__trendingScore
  project__trendingVolume
  project__trendingPaymentsCount
  project__createdWithinTrendingWindow
  project__nftsMintedCount
  projectId
  timestamp
  txHash
  from
  caller
  amount
  amountUSD
  note
}

enum Aggregation_interval {
  hour
  day
}

type AutoIssueEvent {
  chain: Int!
  id: ID!
  revnetId: BigInt!
  stageId: BigInt!
  beneficiary: Bytes!
  count: BigInt!
  caller: Bytes!
}

input AutoIssueEvent_filter {
  chain: Int
  chain_in: [Int]
  id: ID
  id_not: ID
  id_gt: ID
  id_lt: ID
  id_gte: ID
  id_lte: ID
  id_in: [ID!]
  id_not_in: [ID!]
  revnetId: BigInt
  revnetId_not: BigInt
  revnetId_gt: BigInt
  revnetId_lt: BigInt
  revnetId_gte: BigInt
  revnetId_lte: BigInt
  revnetId_in: [BigInt!]
  revnetId_not_in: [BigInt!]
  stageId: BigInt
  stageId_not: BigInt
  stageId_gt: BigInt
  stageId_lt: BigInt
  stageId_gte: BigInt
  stageId_lte: BigInt
  stageId_in: [BigInt!]
  stageId_not_in: [BigInt!]
  beneficiary: Bytes
  beneficiary_not: Bytes
  beneficiary_gt: Bytes
  beneficiary_lt: Bytes
  beneficiary_gte: Bytes
  beneficiary_lte: Bytes
  beneficiary_in: [Bytes!]
  beneficiary_not_in: [Bytes!]
  beneficiary_contains: Bytes
  beneficiary_not_contains: Bytes
  count: BigInt
  count_not: BigInt
  count_gt: BigInt
  count_lt: BigInt
  count_gte: BigInt
  count_lte: BigInt
  count_in: [BigInt!]
  count_not_in: [BigInt!]
  caller: Bytes
  caller_not: Bytes
  caller_gt: Bytes
  caller_lt: Bytes
  caller_gte: Bytes
  caller_lte: Bytes
  caller_in: [Bytes!]
  caller_not_in: [Bytes!]
  caller_contains: Bytes
  caller_not_contains: Bytes

  """Filter for the block changed event."""
  _change_block: BlockChangedFilter
  and: [AutoIssueEvent_filter]
  or: [AutoIssueEvent_filter]
}

enum AutoIssueEvent_orderBy {
  id
  revnetId
  stageId
  beneficiary
  count
  caller
}

scalar BigDecimal

scalar BigInt

input Block_height {
  hash: Bytes
  number: Int
  number_gte: Int
}

input BlockChangedFilter {
  number_gte: Int!
}

type BurnEvent {
  chain: Int!
  id: ID!
  project: Project!
  projectId: Int!
  timestamp: Int!
  txHash: Bytes!
  from: Bytes!
  caller: Bytes
  holder: Bytes!
  amount: BigInt!
  stakedAmount: BigInt!
  erc20Amount: BigInt!
}

input BurnEvent_filter {
  chain: Int
  chain_in: [Int]
  id: ID
  id_not: ID
  id_gt: ID
  id_lt: ID
  id_gte: ID
  id_lte: ID
  id_in: [ID!]
  id_not_in: [ID!]
  project: String
  project_not: String
  project_gt: String
  project_lt: String
  project_gte: String
  project_lte: String
  project_in: [String!]
  project_not_in: [String!]
  project_contains: String
  project_contains_nocase: String
  project_not_contains: String
  project_not_contains_nocase: String
  project_starts_with: String
  project_starts_with_nocase: String
  project_not_starts_with: String
  project_not_starts_with_nocase: String
  project_ends_with: String
  project_ends_with_nocase: String
  project_not_ends_with: String
  project_not_ends_with_nocase: String
  project_: Project_filter
  projectId: Int
  projectId_not: Int
  projectId_gt: Int
  projectId_lt: Int
  projectId_gte: Int
  projectId_lte: Int
  projectId_in: [Int!]
  projectId_not_in: [Int!]
  timestamp: Int
  timestamp_not: Int
  timestamp_gt: Int
  timestamp_lt: Int
  timestamp_gte: Int
  timestamp_lte: Int
  timestamp_in: [Int!]
  timestamp_not_in: [Int!]
  txHash: Bytes
  txHash_not: Bytes
  txHash_gt: Bytes
  txHash_lt: Bytes
  txHash_gte: Bytes
  txHash_lte: Bytes
  txHash_in: [Bytes!]
  txHash_not_in: [Bytes!]
  txHash_contains: Bytes
  txHash_not_contains: Bytes
  from: Bytes
  from_not: Bytes
  from_gt: Bytes
  from_lt: Bytes
  from_gte: Bytes
  from_lte: Bytes
  from_in: [Bytes!]
  from_not_in: [Bytes!]
  from_contains: Bytes
  from_not_contains: Bytes
  caller: Bytes
  caller_not: Bytes
  caller_gt: Bytes
  caller_lt: Bytes
  caller_gte: Bytes
  caller_lte: Bytes
  caller_in: [Bytes!]
  caller_not_in: [Bytes!]
  caller_contains: Bytes
  caller_not_contains: Bytes
  holder: Bytes
  holder_not: Bytes
  holder_gt: Bytes
  holder_lt: Bytes
  holder_gte: Bytes
  holder_lte: Bytes
  holder_in: [Bytes!]
  holder_not_in: [Bytes!]
  holder_contains: Bytes
  holder_not_contains: Bytes
  amount: BigInt
  amount_not: BigInt
  amount_gt: BigInt
  amount_lt: BigInt
  amount_gte: BigInt
  amount_lte: BigInt
  amount_in: [BigInt!]
  amount_not_in: [BigInt!]
  stakedAmount: BigInt
  stakedAmount_not: BigInt
  stakedAmount_gt: BigInt
  stakedAmount_lt: BigInt
  stakedAmount_gte: BigInt
  stakedAmount_lte: BigInt
  stakedAmount_in: [BigInt!]
  stakedAmount_not_in: [BigInt!]
  erc20Amount: BigInt
  erc20Amount_not: BigInt
  erc20Amount_gt: BigInt
  erc20Amount_lt: BigInt
  erc20Amount_gte: BigInt
  erc20Amount_lte: BigInt
  erc20Amount_in: [BigInt!]
  erc20Amount_not_in: [BigInt!]

  """Filter for the block changed event."""
  _change_block: BlockChangedFilter
  and: [BurnEvent_filter]
  or: [BurnEvent_filter]
}

enum BurnEvent_orderBy {
  id
  project
  project__id
  project__projectId
  project__handle
  project__deployer
  project__metadataUri
  project__owner
  project__creator
  project__createdAt
  project__paymentsCount
  project__contributorsCount
  project__redeemCount
  project__volume
  project__volumeUSD
  project__redeemVolume
  project__redeemVolumeUSD
  project__currentBalance
  project__tokenSupply
  project__trendingScore
  project__trendingVolume
  project__trendingPaymentsCount
  project__createdWithinTrendingWindow
  project__nftsMintedCount
  projectId
  timestamp
  txHash
  from
  caller
  holder
  amount
  stakedAmount
  erc20Amount
}

scalar Bytes

type CashOutEvent {
  chain: Int!
  id: ID!
  project: Project!
  projectId: Int!
  timestamp: Int!
  txHash: Bytes!
  from: Bytes!
  caller: Bytes!
  metadata: Bytes
  holder: Bytes!
  beneficiary: Bytes!
  cashOutCount: BigInt!
  reclaimAmount: BigInt!
  reclaimAmountUSD: BigInt
}

input CashOutEvent_filter {
  chain: Int
  chain_in: [Int]
  id: ID
  id_not: ID
  id_gt: ID
  id_lt: ID
  id_gte: ID
  id_lte: ID
  id_in: [ID!]
  id_not_in: [ID!]
  project: String
  project_not: String
  project_gt: String
  project_lt: String
  project_gte: String
  project_lte: String
  project_in: [String!]
  project_not_in: [String!]
  project_contains: String
  project_contains_nocase: String
  project_not_contains: String
  project_not_contains_nocase: String
  project_starts_with: String
  project_starts_with_nocase: String
  project_not_starts_with: String
  project_not_starts_with_nocase: String
  project_ends_with: String
  project_ends_with_nocase: String
  project_not_ends_with: String
  project_not_ends_with_nocase: String
  project_: Project_filter
  projectId: Int
  projectId_not: Int
  projectId_gt: Int
  projectId_lt: Int
  projectId_gte: Int
  projectId_lte: Int
  projectId_in: [Int!]
  projectId_not_in: [Int!]
  timestamp: Int
  timestamp_not: Int
  timestamp_gt: Int
  timestamp_lt: Int
  timestamp_gte: Int
  timestamp_lte: Int
  timestamp_in: [Int!]
  timestamp_not_in: [Int!]
  txHash: Bytes
  txHash_not: Bytes
  txHash_gt: Bytes
  txHash_lt: Bytes
  txHash_gte: Bytes
  txHash_lte: Bytes
  txHash_in: [Bytes!]
  txHash_not_in: [Bytes!]
  txHash_contains: Bytes
  txHash_not_contains: Bytes
  from: Bytes
  from_not: Bytes
  from_gt: Bytes
  from_lt: Bytes
  from_gte: Bytes
  from_lte: Bytes
  from_in: [Bytes!]
  from_not_in: [Bytes!]
  from_contains: Bytes
  from_not_contains: Bytes
  caller: Bytes
  caller_not: Bytes
  caller_gt: Bytes
  caller_lt: Bytes
  caller_gte: Bytes
  caller_lte: Bytes
  caller_in: [Bytes!]
  caller_not_in: [Bytes!]
  caller_contains: Bytes
  caller_not_contains: Bytes
  metadata: Bytes
  metadata_not: Bytes
  metadata_gt: Bytes
  metadata_lt: Bytes
  metadata_gte: Bytes
  metadata_lte: Bytes
  metadata_in: [Bytes!]
  metadata_not_in: [Bytes!]
  metadata_contains: Bytes
  metadata_not_contains: Bytes
  holder: Bytes
  holder_not: Bytes
  holder_gt: Bytes
  holder_lt: Bytes
  holder_gte: Bytes
  holder_lte: Bytes
  holder_in: [Bytes!]
  holder_not_in: [Bytes!]
  holder_contains: Bytes
  holder_not_contains: Bytes
  beneficiary: Bytes
  beneficiary_not: Bytes
  beneficiary_gt: Bytes
  beneficiary_lt: Bytes
  beneficiary_gte: Bytes
  beneficiary_lte: Bytes
  beneficiary_in: [Bytes!]
  beneficiary_not_in: [Bytes!]
  beneficiary_contains: Bytes
  beneficiary_not_contains: Bytes
  cashOutCount: BigInt
  cashOutCount_not: BigInt
  cashOutCount_gt: BigInt
  cashOutCount_lt: BigInt
  cashOutCount_gte: BigInt
  cashOutCount_lte: BigInt
  cashOutCount_in: [BigInt!]
  cashOutCount_not_in: [BigInt!]
  reclaimAmount: BigInt
  reclaimAmount_not: BigInt
  reclaimAmount_gt: BigInt
  reclaimAmount_lt: BigInt
  reclaimAmount_gte: BigInt
  reclaimAmount_lte: BigInt
  reclaimAmount_in: [BigInt!]
  reclaimAmount_not_in: [BigInt!]
  reclaimAmountUSD: BigInt
  reclaimAmountUSD_not: BigInt
  reclaimAmountUSD_gt: BigInt
  reclaimAmountUSD_lt: BigInt
  reclaimAmountUSD_gte: BigInt
  reclaimAmountUSD_lte: BigInt
  reclaimAmountUSD_in: [BigInt!]
  reclaimAmountUSD_not_in: [BigInt!]

  """Filter for the block changed event."""
  _change_block: BlockChangedFilter
  and: [CashOutEvent_filter]
  or: [CashOutEvent_filter]
}

enum CashOutEvent_orderBy {
  id
  project
  project__id
  project__projectId
  project__handle
  project__deployer
  project__metadataUri
  project__owner
  project__creator
  project__createdAt
  project__paymentsCount
  project__contributorsCount
  project__redeemCount
  project__volume
  project__volumeUSD
  project__redeemVolume
  project__redeemVolumeUSD
  project__currentBalance
  project__tokenSupply
  project__trendingScore
  project__trendingVolume
  project__trendingPaymentsCount
  project__createdWithinTrendingWindow
  project__nftsMintedCount
  projectId
  timestamp
  txHash
  from
  caller
  metadata
  holder
  beneficiary
  cashOutCount
  reclaimAmount
  reclaimAmountUSD
}

type DecorateBannyEvent {
  chain: Int!
  id: ID!
  timestamp: Int!
  txHash: Bytes!
  caller: Bytes!
  bannyBodyId: BigInt!
  outfitIds: [BigInt!]!
  backgroundId: BigInt!
  tokenUri: String!
}

input DecorateBannyEvent_filter {
  chain: Int
  chain_in: [Int]
  id: ID
  id_not: ID
  id_gt: ID
  id_lt: ID
  id_gte: ID
  id_lte: ID
  id_in: [ID!]
  id_not_in: [ID!]
  timestamp: Int
  timestamp_not: Int
  timestamp_gt: Int
  timestamp_lt: Int
  timestamp_gte: Int
  timestamp_lte: Int
  timestamp_in: [Int!]
  timestamp_not_in: [Int!]
  txHash: Bytes
  txHash_not: Bytes
  txHash_gt: Bytes
  txHash_lt: Bytes
  txHash_gte: Bytes
  txHash_lte: Bytes
  txHash_in: [Bytes!]
  txHash_not_in: [Bytes!]
  txHash_contains: Bytes
  txHash_not_contains: Bytes
  caller: Bytes
  caller_not: Bytes
  caller_gt: Bytes
  caller_lt: Bytes
  caller_gte: Bytes
  caller_lte: Bytes
  caller_in: [Bytes!]
  caller_not_in: [Bytes!]
  caller_contains: Bytes
  caller_not_contains: Bytes
  bannyBodyId: BigInt
  bannyBodyId_not: BigInt
  bannyBodyId_gt: BigInt
  bannyBodyId_lt: BigInt
  bannyBodyId_gte: BigInt
  bannyBodyId_lte: BigInt
  bannyBodyId_in: [BigInt!]
  bannyBodyId_not_in: [BigInt!]
  outfitIds: [BigInt!]
  outfitIds_not: [BigInt!]
  outfitIds_contains: [BigInt!]
  outfitIds_contains_nocase: [BigInt!]
  outfitIds_not_contains: [BigInt!]
  outfitIds_not_contains_nocase: [BigInt!]
  backgroundId: BigInt
  backgroundId_not: BigInt
  backgroundId_gt: BigInt
  backgroundId_lt: BigInt
  backgroundId_gte: BigInt
  backgroundId_lte: BigInt
  backgroundId_in: [BigInt!]
  backgroundId_not_in: [BigInt!]
  tokenUri: String
  tokenUri_not: String
  tokenUri_gt: String
  tokenUri_lt: String
  tokenUri_gte: String
  tokenUri_lte: String
  tokenUri_in: [String!]
  tokenUri_not_in: [String!]
  tokenUri_contains: String
  tokenUri_contains_nocase: String
  tokenUri_not_contains: String
  tokenUri_not_contains_nocase: String
  tokenUri_starts_with: String
  tokenUri_starts_with_nocase: String
  tokenUri_not_starts_with: String
  tokenUri_not_starts_with_nocase: String
  tokenUri_ends_with: String
  tokenUri_ends_with_nocase: String
  tokenUri_not_ends_with: String
  tokenUri_not_ends_with_nocase: String

  """Filter for the block changed event."""
  _change_block: BlockChangedFilter
  and: [DecorateBannyEvent_filter]
  or: [DecorateBannyEvent_filter]
}

enum DecorateBannyEvent_orderBy {
  id
  timestamp
  txHash
  caller
  bannyBodyId
  outfitIds
  backgroundId
  tokenUri
}

type DeployedERC20Event {
  chain: Int!
  id: ID!
  project: Project!
  projectId: Int!
  timestamp: Int!
  txHash: Bytes!
  from: Bytes!
  caller: Bytes!
  symbol: String!
  address: Bytes!
}

input DeployedERC20Event_filter {
  chain: Int
  chain_in: [Int]
  id: ID
  id_not: ID
  id_gt: ID
  id_lt: ID
  id_gte: ID
  id_lte: ID
  id_in: [ID!]
  id_not_in: [ID!]
  project: String
  project_not: String
  project_gt: String
  project_lt: String
  project_gte: String
  project_lte: String
  project_in: [String!]
  project_not_in: [String!]
  project_contains: String
  project_contains_nocase: String
  project_not_contains: String
  project_not_contains_nocase: String
  project_starts_with: String
  project_starts_with_nocase: String
  project_not_starts_with: String
  project_not_starts_with_nocase: String
  project_ends_with: String
  project_ends_with_nocase: String
  project_not_ends_with: String
  project_not_ends_with_nocase: String
  project_: Project_filter
  projectId: Int
  projectId_not: Int
  projectId_gt: Int
  projectId_lt: Int
  projectId_gte: Int
  projectId_lte: Int
  projectId_in: [Int!]
  projectId_not_in: [Int!]
  timestamp: Int
  timestamp_not: Int
  timestamp_gt: Int
  timestamp_lt: Int
  timestamp_gte: Int
  timestamp_lte: Int
  timestamp_in: [Int!]
  timestamp_not_in: [Int!]
  txHash: Bytes
  txHash_not: Bytes
  txHash_gt: Bytes
  txHash_lt: Bytes
  txHash_gte: Bytes
  txHash_lte: Bytes
  txHash_in: [Bytes!]
  txHash_not_in: [Bytes!]
  txHash_contains: Bytes
  txHash_not_contains: Bytes
  from: Bytes
  from_not: Bytes
  from_gt: Bytes
  from_lt: Bytes
  from_gte: Bytes
  from_lte: Bytes
  from_in: [Bytes!]
  from_not_in: [Bytes!]
  from_contains: Bytes
  from_not_contains: Bytes
  caller: Bytes
  caller_not: Bytes
  caller_gt: Bytes
  caller_lt: Bytes
  caller_gte: Bytes
  caller_lte: Bytes
  caller_in: [Bytes!]
  caller_not_in: [Bytes!]
  caller_contains: Bytes
  caller_not_contains: Bytes
  symbol: String
  symbol_not: String
  symbol_gt: String
  symbol_lt: String
  symbol_gte: String
  symbol_lte: String
  symbol_in: [String!]
  symbol_not_in: [String!]
  symbol_contains: String
  symbol_contains_nocase: String
  symbol_not_contains: String
  symbol_not_contains_nocase: String
  symbol_starts_with: String
  symbol_starts_with_nocase: String
  symbol_not_starts_with: String
  symbol_not_starts_with_nocase: String
  symbol_ends_with: String
  symbol_ends_with_nocase: String
  symbol_not_ends_with: String
  symbol_not_ends_with_nocase: String
  address: Bytes
  address_not: Bytes
  address_gt: Bytes
  address_lt: Bytes
  address_gte: Bytes
  address_lte: Bytes
  address_in: [Bytes!]
  address_not_in: [Bytes!]
  address_contains: Bytes
  address_not_contains: Bytes

  """Filter for the block changed event."""
  _change_block: BlockChangedFilter
  and: [DeployedERC20Event_filter]
  or: [DeployedERC20Event_filter]
}

enum DeployedERC20Event_orderBy {
  id
  project
  project__id
  project__projectId
  project__handle
  project__deployer
  project__metadataUri
  project__owner
  project__creator
  project__createdAt
  project__paymentsCount
  project__contributorsCount
  project__redeemCount
  project__volume
  project__volumeUSD
  project__redeemVolume
  project__redeemVolumeUSD
  project__currentBalance
  project__tokenSupply
  project__trendingScore
  project__trendingVolume
  project__trendingPaymentsCount
  project__createdWithinTrendingWindow
  project__nftsMintedCount
  projectId
  timestamp
  txHash
  from
  caller
  symbol
  address
}

type DistributePayoutsEvent {
  chain: Int!
  id: ID!
  project: Project!
  projectId: Int!
  timestamp: Int!
  txHash: Bytes!
  from: Bytes!
  caller: Bytes!
  amount: BigInt!
  amountUSD: BigInt
  amountPaidOut: BigInt!
  amountPaidOutUSD: BigInt
  rulesetCycleNumber: BigInt!
  rulesetId: BigInt!
  fee: BigInt!
  feeUSD: BigInt
  splitDistributions(skip: Int = 0, first: Int = 100, orderBy: DistributeToPayoutSplitEvent_orderBy, orderDirection: OrderDirection, where: DistributeToPayoutSplitEvent_filter): [DistributeToPayoutSplitEvent!]!
}

input DistributePayoutsEvent_filter {
  chain: Int
  chain_in: [Int]
  id: ID
  id_not: ID
  id_gt: ID
  id_lt: ID
  id_gte: ID
  id_lte: ID
  id_in: [ID!]
  id_not_in: [ID!]
  project: String
  project_not: String
  project_gt: String
  project_lt: String
  project_gte: String
  project_lte: String
  project_in: [String!]
  project_not_in: [String!]
  project_contains: String
  project_contains_nocase: String
  project_not_contains: String
  project_not_contains_nocase: String
  project_starts_with: String
  project_starts_with_nocase: String
  project_not_starts_with: String
  project_not_starts_with_nocase: String
  project_ends_with: String
  project_ends_with_nocase: String
  project_not_ends_with: String
  project_not_ends_with_nocase: String
  project_: Project_filter
  projectId: Int
  projectId_not: Int
  projectId_gt: Int
  projectId_lt: Int
  projectId_gte: Int
  projectId_lte: Int
  projectId_in: [Int!]
  projectId_not_in: [Int!]
  timestamp: Int
  timestamp_not: Int
  timestamp_gt: Int
  timestamp_lt: Int
  timestamp_gte: Int
  timestamp_lte: Int
  timestamp_in: [Int!]
  timestamp_not_in: [Int!]
  txHash: Bytes
  txHash_not: Bytes
  txHash_gt: Bytes
  txHash_lt: Bytes
  txHash_gte: Bytes
  txHash_lte: Bytes
  txHash_in: [Bytes!]
  txHash_not_in: [Bytes!]
  txHash_contains: Bytes
  txHash_not_contains: Bytes
  from: Bytes
  from_not: Bytes
  from_gt: Bytes
  from_lt: Bytes
  from_gte: Bytes
  from_lte: Bytes
  from_in: [Bytes!]
  from_not_in: [Bytes!]
  from_contains: Bytes
  from_not_contains: Bytes
  caller: Bytes
  caller_not: Bytes
  caller_gt: Bytes
  caller_lt: Bytes
  caller_gte: Bytes
  caller_lte: Bytes
  caller_in: [Bytes!]
  caller_not_in: [Bytes!]
  caller_contains: Bytes
  caller_not_contains: Bytes
  amount: BigInt
  amount_not: BigInt
  amount_gt: BigInt
  amount_lt: BigInt
  amount_gte: BigInt
  amount_lte: BigInt
  amount_in: [BigInt!]
  amount_not_in: [BigInt!]
  amountUSD: BigInt
  amountUSD_not: BigInt
  amountUSD_gt: BigInt
  amountUSD_lt: BigInt
  amountUSD_gte: BigInt
  amountUSD_lte: BigInt
  amountUSD_in: [BigInt!]
  amountUSD_not_in: [BigInt!]
  amountPaidOut: BigInt
  amountPaidOut_not: BigInt
  amountPaidOut_gt: BigInt
  amountPaidOut_lt: BigInt
  amountPaidOut_gte: BigInt
  amountPaidOut_lte: BigInt
  amountPaidOut_in: [BigInt!]
  amountPaidOut_not_in: [BigInt!]
  amountPaidOutUSD: BigInt
  amountPaidOutUSD_not: BigInt
  amountPaidOutUSD_gt: BigInt
  amountPaidOutUSD_lt: BigInt
  amountPaidOutUSD_gte: BigInt
  amountPaidOutUSD_lte: BigInt
  amountPaidOutUSD_in: [BigInt!]
  amountPaidOutUSD_not_in: [BigInt!]
  rulesetCycleNumber: BigInt
  rulesetCycleNumber_not: BigInt
  rulesetCycleNumber_gt: BigInt
  rulesetCycleNumber_lt: BigInt
  rulesetCycleNumber_gte: BigInt
  rulesetCycleNumber_lte: BigInt
  rulesetCycleNumber_in: [BigInt!]
  rulesetCycleNumber_not_in: [BigInt!]
  rulesetId: BigInt
  rulesetId_not: BigInt
  rulesetId_gt: BigInt
  rulesetId_lt: BigInt
  rulesetId_gte: BigInt
  rulesetId_lte: BigInt
  rulesetId_in: [BigInt!]
  rulesetId_not_in: [BigInt!]
  fee: BigInt
  fee_not: BigInt
  fee_gt: BigInt
  fee_lt: BigInt
  fee_gte: BigInt
  fee_lte: BigInt
  fee_in: [BigInt!]
  fee_not_in: [BigInt!]
  feeUSD: BigInt
  feeUSD_not: BigInt
  feeUSD_gt: BigInt
  feeUSD_lt: BigInt
  feeUSD_gte: BigInt
  feeUSD_lte: BigInt
  feeUSD_in: [BigInt!]
  feeUSD_not_in: [BigInt!]
  splitDistributions_: DistributeToPayoutSplitEvent_filter

  """Filter for the block changed event."""
  _change_block: BlockChangedFilter
  and: [DistributePayoutsEvent_filter]
  or: [DistributePayoutsEvent_filter]
}

enum DistributePayoutsEvent_orderBy {
  id
  project
  project__id
  project__projectId
  project__handle
  project__deployer
  project__metadataUri
  project__owner
  project__creator
  project__createdAt
  project__paymentsCount
  project__contributorsCount
  project__redeemCount
  project__volume
  project__volumeUSD
  project__redeemVolume
  project__redeemVolumeUSD
  project__currentBalance
  project__tokenSupply
  project__trendingScore
  project__trendingVolume
  project__trendingPaymentsCount
  project__createdWithinTrendingWindow
  project__nftsMintedCount
  projectId
  timestamp
  txHash
  from
  caller
  amount
  amountUSD
  amountPaidOut
  amountPaidOutUSD
  rulesetCycleNumber
  rulesetId
  fee
  feeUSD
  splitDistributions
}

type DistributeReservedTokensEvent {
  chain: Int!
  id: ID!
  project: Project!
  projectId: Int!
  timestamp: Int!
  txHash: Bytes!
  from: Bytes!
  caller: Bytes!
  rulesetCycleNumber: Int!
  tokenCount: BigInt!
  splitDistributions(skip: Int = 0, first: Int = 100, orderBy: DistributeToReservedTokenSplitEvent_orderBy, orderDirection: OrderDirection, where: DistributeToReservedTokenSplitEvent_filter): [DistributeToReservedTokenSplitEvent!]!
}

input DistributeReservedTokensEvent_filter {
  chain: Int
  chain_in: [Int]
  id: ID
  id_not: ID
  id_gt: ID
  id_lt: ID
  id_gte: ID
  id_lte: ID
  id_in: [ID!]
  id_not_in: [ID!]
  project: String
  project_not: String
  project_gt: String
  project_lt: String
  project_gte: String
  project_lte: String
  project_in: [String!]
  project_not_in: [String!]
  project_contains: String
  project_contains_nocase: String
  project_not_contains: String
  project_not_contains_nocase: String
  project_starts_with: String
  project_starts_with_nocase: String
  project_not_starts_with: String
  project_not_starts_with_nocase: String
  project_ends_with: String
  project_ends_with_nocase: String
  project_not_ends_with: String
  project_not_ends_with_nocase: String
  project_: Project_filter
  projectId: Int
  projectId_not: Int
  projectId_gt: Int
  projectId_lt: Int
  projectId_gte: Int
  projectId_lte: Int
  projectId_in: [Int!]
  projectId_not_in: [Int!]
  timestamp: Int
  timestamp_not: Int
  timestamp_gt: Int
  timestamp_lt: Int
  timestamp_gte: Int
  timestamp_lte: Int
  timestamp_in: [Int!]
  timestamp_not_in: [Int!]
  txHash: Bytes
  txHash_not: Bytes
  txHash_gt: Bytes
  txHash_lt: Bytes
  txHash_gte: Bytes
  txHash_lte: Bytes
  txHash_in: [Bytes!]
  txHash_not_in: [Bytes!]
  txHash_contains: Bytes
  txHash_not_contains: Bytes
  from: Bytes
  from_not: Bytes
  from_gt: Bytes
  from_lt: Bytes
  from_gte: Bytes
  from_lte: Bytes
  from_in: [Bytes!]
  from_not_in: [Bytes!]
  from_contains: Bytes
  from_not_contains: Bytes
  caller: Bytes
  caller_not: Bytes
  caller_gt: Bytes
  caller_lt: Bytes
  caller_gte: Bytes
  caller_lte: Bytes
  caller_in: [Bytes!]
  caller_not_in: [Bytes!]
  caller_contains: Bytes
  caller_not_contains: Bytes
  rulesetCycleNumber: Int
  rulesetCycleNumber_not: Int
  rulesetCycleNumber_gt: Int
  rulesetCycleNumber_lt: Int
  rulesetCycleNumber_gte: Int
  rulesetCycleNumber_lte: Int
  rulesetCycleNumber_in: [Int!]
  rulesetCycleNumber_not_in: [Int!]
  tokenCount: BigInt
  tokenCount_not: BigInt
  tokenCount_gt: BigInt
  tokenCount_lt: BigInt
  tokenCount_gte: BigInt
  tokenCount_lte: BigInt
  tokenCount_in: [BigInt!]
  tokenCount_not_in: [BigInt!]
  splitDistributions_: DistributeToReservedTokenSplitEvent_filter

  """Filter for the block changed event."""
  _change_block: BlockChangedFilter
  and: [DistributeReservedTokensEvent_filter]
  or: [DistributeReservedTokensEvent_filter]
}

enum DistributeReservedTokensEvent_orderBy {
  id
  project
  project__id
  project__projectId
  project__handle
  project__deployer
  project__metadataUri
  project__owner
  project__creator
  project__createdAt
  project__paymentsCount
  project__contributorsCount
  project__redeemCount
  project__volume
  project__volumeUSD
  project__redeemVolume
  project__redeemVolumeUSD
  project__currentBalance
  project__tokenSupply
  project__trendingScore
  project__trendingVolume
  project__trendingPaymentsCount
  project__createdWithinTrendingWindow
  project__nftsMintedCount
  projectId
  timestamp
  txHash
  from
  caller
  rulesetCycleNumber
  tokenCount
  splitDistributions
}

type DistributeToPayoutSplitEvent {
  chain: Int!
  id: ID!
  project: Project!
  projectId: Int!
  timestamp: Int!
  txHash: Bytes!
  from: Bytes!
  caller: Bytes!
  amount: BigInt!
  amountUSD: BigInt
  distributePayoutsEvent: DistributePayoutsEvent!
  preferAddToBalance: Boolean!
  percent: Int!
  splitProjectId: Int!
  beneficiary: Bytes!
  lockedUntil: Int!
}

input DistributeToPayoutSplitEvent_filter {
  chain: Int
  chain_in: [Int]
  id: ID
  id_not: ID
  id_gt: ID
  id_lt: ID
  id_gte: ID
  id_lte: ID
  id_in: [ID!]
  id_not_in: [ID!]
  project: String
  project_not: String
  project_gt: String
  project_lt: String
  project_gte: String
  project_lte: String
  project_in: [String!]
  project_not_in: [String!]
  project_contains: String
  project_contains_nocase: String
  project_not_contains: String
  project_not_contains_nocase: String
  project_starts_with: String
  project_starts_with_nocase: String
  project_not_starts_with: String
  project_not_starts_with_nocase: String
  project_ends_with: String
  project_ends_with_nocase: String
  project_not_ends_with: String
  project_not_ends_with_nocase: String
  project_: Project_filter
  projectId: Int
  projectId_not: Int
  projectId_gt: Int
  projectId_lt: Int
  projectId_gte: Int
  projectId_lte: Int
  projectId_in: [Int!]
  projectId_not_in: [Int!]
  timestamp: Int
  timestamp_not: Int
  timestamp_gt: Int
  timestamp_lt: Int
  timestamp_gte: Int
  timestamp_lte: Int
  timestamp_in: [Int!]
  timestamp_not_in: [Int!]
  txHash: Bytes
  txHash_not: Bytes
  txHash_gt: Bytes
  txHash_lt: Bytes
  txHash_gte: Bytes
  txHash_lte: Bytes
  txHash_in: [Bytes!]
  txHash_not_in: [Bytes!]
  txHash_contains: Bytes
  txHash_not_contains: Bytes
  from: Bytes
  from_not: Bytes
  from_gt: Bytes
  from_lt: Bytes
  from_gte: Bytes
  from_lte: Bytes
  from_in: [Bytes!]
  from_not_in: [Bytes!]
  from_contains: Bytes
  from_not_contains: Bytes
  caller: Bytes
  caller_not: Bytes
  caller_gt: Bytes
  caller_lt: Bytes
  caller_gte: Bytes
  caller_lte: Bytes
  caller_in: [Bytes!]
  caller_not_in: [Bytes!]
  caller_contains: Bytes
  caller_not_contains: Bytes
  amount: BigInt
  amount_not: BigInt
  amount_gt: BigInt
  amount_lt: BigInt
  amount_gte: BigInt
  amount_lte: BigInt
  amount_in: [BigInt!]
  amount_not_in: [BigInt!]
  amountUSD: BigInt
  amountUSD_not: BigInt
  amountUSD_gt: BigInt
  amountUSD_lt: BigInt
  amountUSD_gte: BigInt
  amountUSD_lte: BigInt
  amountUSD_in: [BigInt!]
  amountUSD_not_in: [BigInt!]
  distributePayoutsEvent: String
  distributePayoutsEvent_not: String
  distributePayoutsEvent_gt: String
  distributePayoutsEvent_lt: String
  distributePayoutsEvent_gte: String
  distributePayoutsEvent_lte: String
  distributePayoutsEvent_in: [String!]
  distributePayoutsEvent_not_in: [String!]
  distributePayoutsEvent_contains: String
  distributePayoutsEvent_contains_nocase: String
  distributePayoutsEvent_not_contains: String
  distributePayoutsEvent_not_contains_nocase: String
  distributePayoutsEvent_starts_with: String
  distributePayoutsEvent_starts_with_nocase: String
  distributePayoutsEvent_not_starts_with: String
  distributePayoutsEvent_not_starts_with_nocase: String
  distributePayoutsEvent_ends_with: String
  distributePayoutsEvent_ends_with_nocase: String
  distributePayoutsEvent_not_ends_with: String
  distributePayoutsEvent_not_ends_with_nocase: String
  distributePayoutsEvent_: DistributePayoutsEvent_filter
  preferAddToBalance: Boolean
  preferAddToBalance_not: Boolean
  preferAddToBalance_in: [Boolean!]
  preferAddToBalance_not_in: [Boolean!]
  percent: Int
  percent_not: Int
  percent_gt: Int
  percent_lt: Int
  percent_gte: Int
  percent_lte: Int
  percent_in: [Int!]
  percent_not_in: [Int!]
  splitProjectId: Int
  splitProjectId_not: Int
  splitProjectId_gt: Int
  splitProjectId_lt: Int
  splitProjectId_gte: Int
  splitProjectId_lte: Int
  splitProjectId_in: [Int!]
  splitProjectId_not_in: [Int!]
  beneficiary: Bytes
  beneficiary_not: Bytes
  beneficiary_gt: Bytes
  beneficiary_lt: Bytes
  beneficiary_gte: Bytes
  beneficiary_lte: Bytes
  beneficiary_in: [Bytes!]
  beneficiary_not_in: [Bytes!]
  beneficiary_contains: Bytes
  beneficiary_not_contains: Bytes
  lockedUntil: Int
  lockedUntil_not: Int
  lockedUntil_gt: Int
  lockedUntil_lt: Int
  lockedUntil_gte: Int
  lockedUntil_lte: Int
  lockedUntil_in: [Int!]
  lockedUntil_not_in: [Int!]

  """Filter for the block changed event."""
  _change_block: BlockChangedFilter
  and: [DistributeToPayoutSplitEvent_filter]
  or: [DistributeToPayoutSplitEvent_filter]
}

enum DistributeToPayoutSplitEvent_orderBy {
  id
  project
  project__id
  project__projectId
  project__handle
  project__deployer
  project__metadataUri
  project__owner
  project__creator
  project__createdAt
  project__paymentsCount
  project__contributorsCount
  project__redeemCount
  project__volume
  project__volumeUSD
  project__redeemVolume
  project__redeemVolumeUSD
  project__currentBalance
  project__tokenSupply
  project__trendingScore
  project__trendingVolume
  project__trendingPaymentsCount
  project__createdWithinTrendingWindow
  project__nftsMintedCount
  projectId
  timestamp
  txHash
  from
  caller
  amount
  amountUSD
  distributePayoutsEvent
  distributePayoutsEvent__id
  distributePayoutsEvent__projectId
  distributePayoutsEvent__timestamp
  distributePayoutsEvent__txHash
  distributePayoutsEvent__from
  distributePayoutsEvent__caller
  distributePayoutsEvent__amount
  distributePayoutsEvent__amountUSD
  distributePayoutsEvent__amountPaidOut
  distributePayoutsEvent__amountPaidOutUSD
  distributePayoutsEvent__rulesetCycleNumber
  distributePayoutsEvent__rulesetId
  distributePayoutsEvent__fee
  distributePayoutsEvent__feeUSD
  preferAddToBalance
  percent
  splitProjectId
  beneficiary
  lockedUntil
}

type DistributeToReservedTokenSplitEvent {
  chain: Int!
  id: ID!
  project: Project!
  projectId: Int!
  timestamp: Int!
  txHash: Bytes!
  from: Bytes!
  caller: Bytes!
  tokenCount: BigInt!
  distributeReservedTokensEvent: DistributeReservedTokensEvent!
  preferAddToBalance: Boolean!
  percent: Int!
  splitProjectId: Int!
  beneficiary: Bytes!
  lockedUntil: Int!
}

input DistributeToReservedTokenSplitEvent_filter {
  chain: Int
  chain_in: [Int]
  id: ID
  id_not: ID
  id_gt: ID
  id_lt: ID
  id_gte: ID
  id_lte: ID
  id_in: [ID!]
  id_not_in: [ID!]
  project: String
  project_not: String
  project_gt: String
  project_lt: String
  project_gte: String
  project_lte: String
  project_in: [String!]
  project_not_in: [String!]
  project_contains: String
  project_contains_nocase: String
  project_not_contains: String
  project_not_contains_nocase: String
  project_starts_with: String
  project_starts_with_nocase: String
  project_not_starts_with: String
  project_not_starts_with_nocase: String
  project_ends_with: String
  project_ends_with_nocase: String
  project_not_ends_with: String
  project_not_ends_with_nocase: String
  project_: Project_filter
  projectId: Int
  projectId_not: Int
  projectId_gt: Int
  projectId_lt: Int
  projectId_gte: Int
  projectId_lte: Int
  projectId_in: [Int!]
  projectId_not_in: [Int!]
  timestamp: Int
  timestamp_not: Int
  timestamp_gt: Int
  timestamp_lt: Int
  timestamp_gte: Int
  timestamp_lte: Int
  timestamp_in: [Int!]
  timestamp_not_in: [Int!]
  txHash: Bytes
  txHash_not: Bytes
  txHash_gt: Bytes
  txHash_lt: Bytes
  txHash_gte: Bytes
  txHash_lte: Bytes
  txHash_in: [Bytes!]
  txHash_not_in: [Bytes!]
  txHash_contains: Bytes
  txHash_not_contains: Bytes
  from: Bytes
  from_not: Bytes
  from_gt: Bytes
  from_lt: Bytes
  from_gte: Bytes
  from_lte: Bytes
  from_in: [Bytes!]
  from_not_in: [Bytes!]
  from_contains: Bytes
  from_not_contains: Bytes
  caller: Bytes
  caller_not: Bytes
  caller_gt: Bytes
  caller_lt: Bytes
  caller_gte: Bytes
  caller_lte: Bytes
  caller_in: [Bytes!]
  caller_not_in: [Bytes!]
  caller_contains: Bytes
  caller_not_contains: Bytes
  tokenCount: BigInt
  tokenCount_not: BigInt
  tokenCount_gt: BigInt
  tokenCount_lt: BigInt
  tokenCount_gte: BigInt
  tokenCount_lte: BigInt
  tokenCount_in: [BigInt!]
  tokenCount_not_in: [BigInt!]
  distributeReservedTokensEvent: String
  distributeReservedTokensEvent_not: String
  distributeReservedTokensEvent_gt: String
  distributeReservedTokensEvent_lt: String
  distributeReservedTokensEvent_gte: String
  distributeReservedTokensEvent_lte: String
  distributeReservedTokensEvent_in: [String!]
  distributeReservedTokensEvent_not_in: [String!]
  distributeReservedTokensEvent_contains: String
  distributeReservedTokensEvent_contains_nocase: String
  distributeReservedTokensEvent_not_contains: String
  distributeReservedTokensEvent_not_contains_nocase: String
  distributeReservedTokensEvent_starts_with: String
  distributeReservedTokensEvent_starts_with_nocase: String
  distributeReservedTokensEvent_not_starts_with: String
  distributeReservedTokensEvent_not_starts_with_nocase: String
  distributeReservedTokensEvent_ends_with: String
  distributeReservedTokensEvent_ends_with_nocase: String
  distributeReservedTokensEvent_not_ends_with: String
  distributeReservedTokensEvent_not_ends_with_nocase: String
  distributeReservedTokensEvent_: DistributeReservedTokensEvent_filter
  preferAddToBalance: Boolean
  preferAddToBalance_not: Boolean
  preferAddToBalance_in: [Boolean!]
  preferAddToBalance_not_in: [Boolean!]
  percent: Int
  percent_not: Int
  percent_gt: Int
  percent_lt: Int
  percent_gte: Int
  percent_lte: Int
  percent_in: [Int!]
  percent_not_in: [Int!]
  splitProjectId: Int
  splitProjectId_not: Int
  splitProjectId_gt: Int
  splitProjectId_lt: Int
  splitProjectId_gte: Int
  splitProjectId_lte: Int
  splitProjectId_in: [Int!]
  splitProjectId_not_in: [Int!]
  beneficiary: Bytes
  beneficiary_not: Bytes
  beneficiary_gt: Bytes
  beneficiary_lt: Bytes
  beneficiary_gte: Bytes
  beneficiary_lte: Bytes
  beneficiary_in: [Bytes!]
  beneficiary_not_in: [Bytes!]
  beneficiary_contains: Bytes
  beneficiary_not_contains: Bytes
  lockedUntil: Int
  lockedUntil_not: Int
  lockedUntil_gt: Int
  lockedUntil_lt: Int
  lockedUntil_gte: Int
  lockedUntil_lte: Int
  lockedUntil_in: [Int!]
  lockedUntil_not_in: [Int!]

  """Filter for the block changed event."""
  _change_block: BlockChangedFilter
  and: [DistributeToReservedTokenSplitEvent_filter]
  or: [DistributeToReservedTokenSplitEvent_filter]
}

enum DistributeToReservedTokenSplitEvent_orderBy {
  id
  project
  project__id
  project__projectId
  project__handle
  project__deployer
  project__metadataUri
  project__owner
  project__creator
  project__createdAt
  project__paymentsCount
  project__contributorsCount
  project__redeemCount
  project__volume
  project__volumeUSD
  project__redeemVolume
  project__redeemVolumeUSD
  project__currentBalance
  project__tokenSupply
  project__trendingScore
  project__trendingVolume
  project__trendingPaymentsCount
  project__createdWithinTrendingWindow
  project__nftsMintedCount
  projectId
  timestamp
  txHash
  from
  caller
  tokenCount
  distributeReservedTokensEvent
  distributeReservedTokensEvent__id
  distributeReservedTokensEvent__projectId
  distributeReservedTokensEvent__timestamp
  distributeReservedTokensEvent__txHash
  distributeReservedTokensEvent__from
  distributeReservedTokensEvent__caller
  distributeReservedTokensEvent__rulesetCycleNumber
  distributeReservedTokensEvent__tokenCount
  preferAddToBalance
  percent
  splitProjectId
  beneficiary
  lockedUntil
}

type ENSNode {
  chain: Int!
  id: ID!
  projectId: Int
}

input ENSNode_filter {
  chain: Int
  chain_in: [Int]
  id: ID
  id_not: ID
  id_gt: ID
  id_lt: ID
  id_gte: ID
  id_lte: ID
  id_in: [ID!]
  id_not_in: [ID!]
  projectId: Int
  projectId_not: Int
  projectId_gt: Int
  projectId_lt: Int
  projectId_gte: Int
  projectId_lte: Int
  projectId_in: [Int!]
  projectId_not_in: [Int!]

  """Filter for the block changed event."""
  _change_block: BlockChangedFilter
  and: [ENSNode_filter]
  or: [ENSNode_filter]
}

enum ENSNode_orderBy {
  id
  projectId
}

"""
8 bytes signed integer

"""
scalar Int8

type MintTokensEvent {
  chain: Int!
  id: ID!
  project: Project!
  projectId: Int!
  timestamp: Int!
  txHash: Bytes!
  from: Bytes!
  caller: Bytes!
  beneficiary: Bytes!
  amount: BigInt!
  memo: String!
}

input MintTokensEvent_filter {
  chain: Int
  chain_in: [Int]
  id: ID
  id_not: ID
  id_gt: ID
  id_lt: ID
  id_gte: ID
  id_lte: ID
  id_in: [ID!]
  id_not_in: [ID!]
  project: String
  project_not: String
  project_gt: String
  project_lt: String
  project_gte: String
  project_lte: String
  project_in: [String!]
  project_not_in: [String!]
  project_contains: String
  project_contains_nocase: String
  project_not_contains: String
  project_not_contains_nocase: String
  project_starts_with: String
  project_starts_with_nocase: String
  project_not_starts_with: String
  project_not_starts_with_nocase: String
  project_ends_with: String
  project_ends_with_nocase: String
  project_not_ends_with: String
  project_not_ends_with_nocase: String
  project_: Project_filter
  projectId: Int
  projectId_not: Int
  projectId_gt: Int
  projectId_lt: Int
  projectId_gte: Int
  projectId_lte: Int
  projectId_in: [Int!]
  projectId_not_in: [Int!]
  timestamp: Int
  timestamp_not: Int
  timestamp_gt: Int
  timestamp_lt: Int
  timestamp_gte: Int
  timestamp_lte: Int
  timestamp_in: [Int!]
  timestamp_not_in: [Int!]
  txHash: Bytes
  txHash_not: Bytes
  txHash_gt: Bytes
  txHash_lt: Bytes
  txHash_gte: Bytes
  txHash_lte: Bytes
  txHash_in: [Bytes!]
  txHash_not_in: [Bytes!]
  txHash_contains: Bytes
  txHash_not_contains: Bytes
  from: Bytes
  from_not: Bytes
  from_gt: Bytes
  from_lt: Bytes
  from_gte: Bytes
  from_lte: Bytes
  from_in: [Bytes!]
  from_not_in: [Bytes!]
  from_contains: Bytes
  from_not_contains: Bytes
  caller: Bytes
  caller_not: Bytes
  caller_gt: Bytes
  caller_lt: Bytes
  caller_gte: Bytes
  caller_lte: Bytes
  caller_in: [Bytes!]
  caller_not_in: [Bytes!]
  caller_contains: Bytes
  caller_not_contains: Bytes
  beneficiary: Bytes
  beneficiary_not: Bytes
  beneficiary_gt: Bytes
  beneficiary_lt: Bytes
  beneficiary_gte: Bytes
  beneficiary_lte: Bytes
  beneficiary_in: [Bytes!]
  beneficiary_not_in: [Bytes!]
  beneficiary_contains: Bytes
  beneficiary_not_contains: Bytes
  amount: BigInt
  amount_not: BigInt
  amount_gt: BigInt
  amount_lt: BigInt
  amount_gte: BigInt
  amount_lte: BigInt
  amount_in: [BigInt!]
  amount_not_in: [BigInt!]
  memo: String
  memo_not: String
  memo_gt: String
  memo_lt: String
  memo_gte: String
  memo_lte: String
  memo_in: [String!]
  memo_not_in: [String!]
  memo_contains: String
  memo_contains_nocase: String
  memo_not_contains: String
  memo_not_contains_nocase: String
  memo_starts_with: String
  memo_starts_with_nocase: String
  memo_not_starts_with: String
  memo_not_starts_with_nocase: String
  memo_ends_with: String
  memo_ends_with_nocase: String
  memo_not_ends_with: String
  memo_not_ends_with_nocase: String

  """Filter for the block changed event."""
  _change_block: BlockChangedFilter
  and: [MintTokensEvent_filter]
  or: [MintTokensEvent_filter]
}

enum MintTokensEvent_orderBy {
  id
  project
  project__id
  project__projectId
  project__handle
  project__deployer
  project__metadataUri
  project__owner
  project__creator
  project__createdAt
  project__paymentsCount
  project__contributorsCount
  project__redeemCount
  project__volume
  project__volumeUSD
  project__redeemVolume
  project__redeemVolumeUSD
  project__currentBalance
  project__tokenSupply
  project__trendingScore
  project__trendingVolume
  project__trendingPaymentsCount
  project__createdWithinTrendingWindow
  project__nftsMintedCount
  projectId
  timestamp
  txHash
  from
  caller
  beneficiary
  amount
  memo
}

type NFT {
  chain: Int!
  id: ID!
  tokenId: BigInt!
  collection: NFTCollection!
  tier: NFTTier!
  project: Project!
  projectId: Int!
  category: Int!
  createdAt: Int!
  owner: Participant!
  tokenUri: String!
}

input NFT_filter {
  chain: Int
  chain_in: [Int]
  id: ID
  id_not: ID
  id_gt: ID
  id_lt: ID
  id_gte: ID
  id_lte: ID
  id_in: [ID!]
  id_not_in: [ID!]
  tokenId: BigInt
  tokenId_not: BigInt
  tokenId_gt: BigInt
  tokenId_lt: BigInt
  tokenId_gte: BigInt
  tokenId_lte: BigInt
  tokenId_in: [BigInt!]
  tokenId_not_in: [BigInt!]
  collection: String
  collection_not: String
  collection_gt: String
  collection_lt: String
  collection_gte: String
  collection_lte: String
  collection_in: [String!]
  collection_not_in: [String!]
  collection_contains: String
  collection_contains_nocase: String
  collection_not_contains: String
  collection_not_contains_nocase: String
  collection_starts_with: String
  collection_starts_with_nocase: String
  collection_not_starts_with: String
  collection_not_starts_with_nocase: String
  collection_ends_with: String
  collection_ends_with_nocase: String
  collection_not_ends_with: String
  collection_not_ends_with_nocase: String
  collection_: NFTCollection_filter
  tier: String
  tier_not: String
  tier_gt: String
  tier_lt: String
  tier_gte: String
  tier_lte: String
  tier_in: [String!]
  tier_not_in: [String!]
  tier_contains: String
  tier_contains_nocase: String
  tier_not_contains: String
  tier_not_contains_nocase: String
  tier_starts_with: String
  tier_starts_with_nocase: String
  tier_not_starts_with: String
  tier_not_starts_with_nocase: String
  tier_ends_with: String
  tier_ends_with_nocase: String
  tier_not_ends_with: String
  tier_not_ends_with_nocase: String
  tier_: NFTTier_filter
  project: String
  project_not: String
  project_gt: String
  project_lt: String
  project_gte: String
  project_lte: String
  project_in: [String!]
  project_not_in: [String!]
  project_contains: String
  project_contains_nocase: String
  project_not_contains: String
  project_not_contains_nocase: String
  project_starts_with: String
  project_starts_with_nocase: String
  project_not_starts_with: String
  project_not_starts_with_nocase: String
  project_ends_with: String
  project_ends_with_nocase: String
  project_not_ends_with: String
  project_not_ends_with_nocase: String
  project_: Project_filter
  projectId: Int
  projectId_not: Int
  projectId_gt: Int
  projectId_lt: Int
  projectId_gte: Int
  projectId_lte: Int
  projectId_in: [Int!]
  projectId_not_in: [Int!]
  category: Int
  category_not: Int
  category_gt: Int
  category_lt: Int
  category_gte: Int
  category_lte: Int
  category_in: [Int!]
  category_not_in: [Int!]
  createdAt: Int
  createdAt_not: Int
  createdAt_gt: Int
  createdAt_lt: Int
  createdAt_gte: Int
  createdAt_lte: Int
  createdAt_in: [Int!]
  createdAt_not_in: [Int!]
  owner: String
  owner_not: String
  owner_gt: String
  owner_lt: String
  owner_gte: String
  owner_lte: String
  owner_in: [String!]
  owner_not_in: [String!]
  owner_contains: String
  owner_contains_nocase: String
  owner_not_contains: String
  owner_not_contains_nocase: String
  owner_starts_with: String
  owner_starts_with_nocase: String
  owner_not_starts_with: String
  owner_not_starts_with_nocase: String
  owner_ends_with: String
  owner_ends_with_nocase: String
  owner_not_ends_with: String
  owner_not_ends_with_nocase: String
  owner_: Participant_filter
  tokenUri: String
  tokenUri_not: String
  tokenUri_gt: String
  tokenUri_lt: String
  tokenUri_gte: String
  tokenUri_lte: String
  tokenUri_in: [String!]
  tokenUri_not_in: [String!]
  tokenUri_contains: String
  tokenUri_contains_nocase: String
  tokenUri_not_contains: String
  tokenUri_not_contains_nocase: String
  tokenUri_starts_with: String
  tokenUri_starts_with_nocase: String
  tokenUri_not_starts_with: String
  tokenUri_not_starts_with_nocase: String
  tokenUri_ends_with: String
  tokenUri_ends_with_nocase: String
  tokenUri_not_ends_with: String
  tokenUri_not_ends_with_nocase: String

  """Filter for the block changed event."""
  _change_block: BlockChangedFilter
  and: [NFT_filter]
  or: [NFT_filter]
}

enum NFT_orderBy {
  id
  tokenId
  collection
  collection__id
  collection__address
  collection__projectId
  collection__name
  collection__symbol
  collection__createdAt
  tier
  tier__id
  tier__tierId
  tier__allowOwnerMint
  tier__price
  tier__encodedIpfsUri
  tier__resolvedUri
  tier__initialSupply
  tier__cannotBeRemoved
  tier__remainingSupply
  tier__transfersPausable
  tier__votingUnits
  tier__createdAt
  tier__category
  tier__reserveFrequency
  tier__reserveBeneficiary
  tier__svg
  project
  project__id
  project__projectId
  project__handle
  project__deployer
  project__metadataUri
  project__owner
  project__creator
  project__createdAt
  project__paymentsCount
  project__contributorsCount
  project__redeemCount
  project__volume
  project__volumeUSD
  project__redeemVolume
  project__redeemVolumeUSD
  project__currentBalance
  project__tokenSupply
  project__trendingScore
  project__trendingVolume
  project__trendingPaymentsCount
  project__createdWithinTrendingWindow
  project__nftsMintedCount
  projectId
  category
  createdAt
  owner
  owner__id
  owner__projectId
  owner__address
  owner__volume
  owner__volumeUSD
  owner__lastPaidTimestamp
  owner__paymentsCount
  owner__balance
  owner__stakedBalance
  owner__erc20Balance
  tokenUri
}

type NFTCollection {
  chain: Int!
  id: ID!
  address: Bytes!
  project: Project!
  projectId: Int!
  name: String!
  symbol: String!
  createdAt: Int!
  tiers(skip: Int = 0, first: Int = 100, orderBy: NFTTier_orderBy, orderDirection: OrderDirection, where: NFTTier_filter): [NFTTier!]!
  nfts(skip: Int = 0, first: Int = 100, orderBy: NFT_orderBy, orderDirection: OrderDirection, where: NFT_filter): [NFT!]!
}

input NFTCollection_filter {
  chain: Int
  chain_in: [Int]
  id: ID
  id_not: ID
  id_gt: ID
  id_lt: ID
  id_gte: ID
  id_lte: ID
  id_in: [ID!]
  id_not_in: [ID!]
  address: Bytes
  address_not: Bytes
  address_gt: Bytes
  address_lt: Bytes
  address_gte: Bytes
  address_lte: Bytes
  address_in: [Bytes!]
  address_not_in: [Bytes!]
  address_contains: Bytes
  address_not_contains: Bytes
  project: String
  project_not: String
  project_gt: String
  project_lt: String
  project_gte: String
  project_lte: String
  project_in: [String!]
  project_not_in: [String!]
  project_contains: String
  project_contains_nocase: String
  project_not_contains: String
  project_not_contains_nocase: String
  project_starts_with: String
  project_starts_with_nocase: String
  project_not_starts_with: String
  project_not_starts_with_nocase: String
  project_ends_with: String
  project_ends_with_nocase: String
  project_not_ends_with: String
  project_not_ends_with_nocase: String
  project_: Project_filter
  projectId: Int
  projectId_not: Int
  projectId_gt: Int
  projectId_lt: Int
  projectId_gte: Int
  projectId_lte: Int
  projectId_in: [Int!]
  projectId_not_in: [Int!]
  name: String
  name_not: String
  name_gt: String
  name_lt: String
  name_gte: String
  name_lte: String
  name_in: [String!]
  name_not_in: [String!]
  name_contains: String
  name_contains_nocase: String
  name_not_contains: String
  name_not_contains_nocase: String
  name_starts_with: String
  name_starts_with_nocase: String
  name_not_starts_with: String
  name_not_starts_with_nocase: String
  name_ends_with: String
  name_ends_with_nocase: String
  name_not_ends_with: String
  name_not_ends_with_nocase: String
  symbol: String
  symbol_not: String
  symbol_gt: String
  symbol_lt: String
  symbol_gte: String
  symbol_lte: String
  symbol_in: [String!]
  symbol_not_in: [String!]
  symbol_contains: String
  symbol_contains_nocase: String
  symbol_not_contains: String
  symbol_not_contains_nocase: String
  symbol_starts_with: String
  symbol_starts_with_nocase: String
  symbol_not_starts_with: String
  symbol_not_starts_with_nocase: String
  symbol_ends_with: String
  symbol_ends_with_nocase: String
  symbol_not_ends_with: String
  symbol_not_ends_with_nocase: String
  createdAt: Int
  createdAt_not: Int
  createdAt_gt: Int
  createdAt_lt: Int
  createdAt_gte: Int
  createdAt_lte: Int
  createdAt_in: [Int!]
  createdAt_not_in: [Int!]
  tiers_: NFTTier_filter
  nfts_: NFT_filter

  """Filter for the block changed event."""
  _change_block: BlockChangedFilter
  and: [NFTCollection_filter]
  or: [NFTCollection_filter]
}

enum NFTCollection_orderBy {
  id
  address
  project
  project__id
  project__projectId
  project__handle
  project__deployer
  project__metadataUri
  project__owner
  project__creator
  project__createdAt
  project__paymentsCount
  project__contributorsCount
  project__redeemCount
  project__volume
  project__volumeUSD
  project__redeemVolume
  project__redeemVolumeUSD
  project__currentBalance
  project__tokenSupply
  project__trendingScore
  project__trendingVolume
  project__trendingPaymentsCount
  project__createdWithinTrendingWindow
  project__nftsMintedCount
  projectId
  name
  symbol
  createdAt
  tiers
  nfts
}

type NFTTier {
  chain: Int!
  id: ID!
  collection: NFTCollection!
  tierId: Int!
  allowOwnerMint: Boolean!
  price: BigInt!
  encodedIpfsUri: Bytes
  resolvedUri: String
  initialSupply: BigInt!
  cannotBeRemoved: Boolean!
  remainingSupply: BigInt!
  transfersPausable: Boolean!
  votingUnits: BigInt!
  createdAt: Int!
  category: Int!
  reserveFrequency: Int!
  reserveBeneficiary: Bytes!
  svg: String
  nfts(skip: Int = 0, first: Int = 100, orderBy: NFT_orderBy, orderDirection: OrderDirection, where: NFT_filter): [NFT!]!
}

input NFTTier_filter {
  chain: Int
  chain_in: [Int]
  id: ID
  id_not: ID
  id_gt: ID
  id_lt: ID
  id_gte: ID
  id_lte: ID
  id_in: [ID!]
  id_not_in: [ID!]
  collection: String
  collection_not: String
  collection_gt: String
  collection_lt: String
  collection_gte: String
  collection_lte: String
  collection_in: [String!]
  collection_not_in: [String!]
  collection_contains: String
  collection_contains_nocase: String
  collection_not_contains: String
  collection_not_contains_nocase: String
  collection_starts_with: String
  collection_starts_with_nocase: String
  collection_not_starts_with: String
  collection_not_starts_with_nocase: String
  collection_ends_with: String
  collection_ends_with_nocase: String
  collection_not_ends_with: String
  collection_not_ends_with_nocase: String
  collection_: NFTCollection_filter
  tierId: Int
  tierId_not: Int
  tierId_gt: Int
  tierId_lt: Int
  tierId_gte: Int
  tierId_lte: Int
  tierId_in: [Int!]
  tierId_not_in: [Int!]
  allowOwnerMint: Boolean
  allowOwnerMint_not: Boolean
  allowOwnerMint_in: [Boolean!]
  allowOwnerMint_not_in: [Boolean!]
  price: BigInt
  price_not: BigInt
  price_gt: BigInt
  price_lt: BigInt
  price_gte: BigInt
  price_lte: BigInt
  price_in: [BigInt!]
  price_not_in: [BigInt!]
  encodedIpfsUri: Bytes
  encodedIpfsUri_not: Bytes
  encodedIpfsUri_gt: Bytes
  encodedIpfsUri_lt: Bytes
  encodedIpfsUri_gte: Bytes
  encodedIpfsUri_lte: Bytes
  encodedIpfsUri_in: [Bytes!]
  encodedIpfsUri_not_in: [Bytes!]
  encodedIpfsUri_contains: Bytes
  encodedIpfsUri_not_contains: Bytes
  resolvedUri: String
  resolvedUri_not: String
  resolvedUri_gt: String
  resolvedUri_lt: String
  resolvedUri_gte: String
  resolvedUri_lte: String
  resolvedUri_in: [String!]
  resolvedUri_not_in: [String!]
  resolvedUri_contains: String
  resolvedUri_contains_nocase: String
  resolvedUri_not_contains: String
  resolvedUri_not_contains_nocase: String
  resolvedUri_starts_with: String
  resolvedUri_starts_with_nocase: String
  resolvedUri_not_starts_with: String
  resolvedUri_not_starts_with_nocase: String
  resolvedUri_ends_with: String
  resolvedUri_ends_with_nocase: String
  resolvedUri_not_ends_with: String
  resolvedUri_not_ends_with_nocase: String
  initialSupply: BigInt
  initialSupply_not: BigInt
  initialSupply_gt: BigInt
  initialSupply_lt: BigInt
  initialSupply_gte: BigInt
  initialSupply_lte: BigInt
  initialSupply_in: [BigInt!]
  initialSupply_not_in: [BigInt!]
  cannotBeRemoved: Boolean
  cannotBeRemoved_not: Boolean
  cannotBeRemoved_in: [Boolean!]
  cannotBeRemoved_not_in: [Boolean!]
  remainingSupply: BigInt
  remainingSupply_not: BigInt
  remainingSupply_gt: BigInt
  remainingSupply_lt: BigInt
  remainingSupply_gte: BigInt
  remainingSupply_lte: BigInt
  remainingSupply_in: [BigInt!]
  remainingSupply_not_in: [BigInt!]
  transfersPausable: Boolean
  transfersPausable_not: Boolean
  transfersPausable_in: [Boolean!]
  transfersPausable_not_in: [Boolean!]
  votingUnits: BigInt
  votingUnits_not: BigInt
  votingUnits_gt: BigInt
  votingUnits_lt: BigInt
  votingUnits_gte: BigInt
  votingUnits_lte: BigInt
  votingUnits_in: [BigInt!]
  votingUnits_not_in: [BigInt!]
  createdAt: Int
  createdAt_not: Int
  createdAt_gt: Int
  createdAt_lt: Int
  createdAt_gte: Int
  createdAt_lte: Int
  createdAt_in: [Int!]
  createdAt_not_in: [Int!]
  category: Int
  category_not: Int
  category_gt: Int
  category_lt: Int
  category_gte: Int
  category_lte: Int
  category_in: [Int!]
  category_not_in: [Int!]
  reserveFrequency: Int
  reserveFrequency_not: Int
  reserveFrequency_gt: Int
  reserveFrequency_lt: Int
  reserveFrequency_gte: Int
  reserveFrequency_lte: Int
  reserveFrequency_in: [Int!]
  reserveFrequency_not_in: [Int!]
  reserveBeneficiary: Bytes
  reserveBeneficiary_not: Bytes
  reserveBeneficiary_gt: Bytes
  reserveBeneficiary_lt: Bytes
  reserveBeneficiary_gte: Bytes
  reserveBeneficiary_lte: Bytes
  reserveBeneficiary_in: [Bytes!]
  reserveBeneficiary_not_in: [Bytes!]
  reserveBeneficiary_contains: Bytes
  reserveBeneficiary_not_contains: Bytes
  svg: String
  svg_not: String
  svg_gt: String
  svg_lt: String
  svg_gte: String
  svg_lte: String
  svg_in: [String!]
  svg_not_in: [String!]
  svg_contains: String
  svg_contains_nocase: String
  svg_not_contains: String
  svg_not_contains_nocase: String
  svg_starts_with: String
  svg_starts_with_nocase: String
  svg_not_starts_with: String
  svg_not_starts_with_nocase: String
  svg_ends_with: String
  svg_ends_with_nocase: String
  svg_not_ends_with: String
  svg_not_ends_with_nocase: String
  nfts_: NFT_filter

  """Filter for the block changed event."""
  _change_block: BlockChangedFilter
  and: [NFTTier_filter]
  or: [NFTTier_filter]
}

enum NFTTier_orderBy {
  id
  collection
  collection__id
  collection__address
  collection__projectId
  collection__name
  collection__symbol
  collection__createdAt
  tierId
  allowOwnerMint
  price
  encodedIpfsUri
  resolvedUri
  initialSupply
  cannotBeRemoved
  remainingSupply
  transfersPausable
  votingUnits
  createdAt
  category
  reserveFrequency
  reserveBeneficiary
  svg
  nfts
}

"""Defines the order direction, either ascending or descending"""
enum OrderDirection {
  asc
  desc
}

type Participant {
  chain: Int!
  id: ID!
  project: Project!
  projectId: Int!
  address: Bytes!
  wallet: Wallet!
  volume: BigInt!
  volumeUSD: BigInt!
  lastPaidTimestamp: Int!
  paymentsCount: Int!
  balance: BigInt!
  stakedBalance: BigInt!
  erc20Balance: BigInt!
  jb721DelegateTokens(skip: Int = 0, first: Int = 100, orderBy: NFT_orderBy, orderDirection: OrderDirection, where: NFT_filter): [NFT!]!
}

input Participant_filter {
  chain: Int
  chain_in: [Int]
  id: ID
  id_not: ID
  id_gt: ID
  id_lt: ID
  id_gte: ID
  id_lte: ID
  id_in: [ID!]
  id_not_in: [ID!]
  project: String
  project_not: String
  project_gt: String
  project_lt: String
  project_gte: String
  project_lte: String
  project_in: [String!]
  project_not_in: [String!]
  project_contains: String
  project_contains_nocase: String
  project_not_contains: String
  project_not_contains_nocase: String
  project_starts_with: String
  project_starts_with_nocase: String
  project_not_starts_with: String
  project_not_starts_with_nocase: String
  project_ends_with: String
  project_ends_with_nocase: String
  project_not_ends_with: String
  project_not_ends_with_nocase: String
  project_: Project_filter
  projectId: Int
  projectId_not: Int
  projectId_gt: Int
  projectId_lt: Int
  projectId_gte: Int
  projectId_lte: Int
  projectId_in: [Int!]
  projectId_not_in: [Int!]
  address: Bytes
  address_not: Bytes
  address_gt: Bytes
  address_lt: Bytes
  address_gte: Bytes
  address_lte: Bytes
  address_in: [Bytes!]
  address_not_in: [Bytes!]
  address_contains: Bytes
  address_not_contains: Bytes
  wallet: String
  wallet_not: String
  wallet_gt: String
  wallet_lt: String
  wallet_gte: String
  wallet_lte: String
  wallet_in: [String!]
  wallet_not_in: [String!]
  wallet_contains: String
  wallet_contains_nocase: String
  wallet_not_contains: String
  wallet_not_contains_nocase: String
  wallet_starts_with: String
  wallet_starts_with_nocase: String
  wallet_not_starts_with: String
  wallet_not_starts_with_nocase: String
  wallet_ends_with: String
  wallet_ends_with_nocase: String
  wallet_not_ends_with: String
  wallet_not_ends_with_nocase: String
  wallet_: Wallet_filter
  volume: BigInt
  volume_not: BigInt
  volume_gt: BigInt
  volume_lt: BigInt
  volume_gte: BigInt
  volume_lte: BigInt
  volume_in: [BigInt!]
  volume_not_in: [BigInt!]
  volumeUSD: BigInt
  volumeUSD_not: BigInt
  volumeUSD_gt: BigInt
  volumeUSD_lt: BigInt
  volumeUSD_gte: BigInt
  volumeUSD_lte: BigInt
  volumeUSD_in: [BigInt!]
  volumeUSD_not_in: [BigInt!]
  lastPaidTimestamp: Int
  lastPaidTimestamp_not: Int
  lastPaidTimestamp_gt: Int
  lastPaidTimestamp_lt: Int
  lastPaidTimestamp_gte: Int
  lastPaidTimestamp_lte: Int
  lastPaidTimestamp_in: [Int!]
  lastPaidTimestamp_not_in: [Int!]
  paymentsCount: Int
  paymentsCount_not: Int
  paymentsCount_gt: Int
  paymentsCount_lt: Int
  paymentsCount_gte: Int
  paymentsCount_lte: Int
  paymentsCount_in: [Int!]
  paymentsCount_not_in: [Int!]
  balance: BigInt
  balance_not: BigInt
  balance_gt: BigInt
  balance_lt: BigInt
  balance_gte: BigInt
  balance_lte: BigInt
  balance_in: [BigInt!]
  balance_not_in: [BigInt!]
  stakedBalance: BigInt
  stakedBalance_not: BigInt
  stakedBalance_gt: BigInt
  stakedBalance_lt: BigInt
  stakedBalance_gte: BigInt
  stakedBalance_lte: BigInt
  stakedBalance_in: [BigInt!]
  stakedBalance_not_in: [BigInt!]
  erc20Balance: BigInt
  erc20Balance_not: BigInt
  erc20Balance_gt: BigInt
  erc20Balance_lt: BigInt
  erc20Balance_gte: BigInt
  erc20Balance_lte: BigInt
  erc20Balance_in: [BigInt!]
  erc20Balance_not_in: [BigInt!]
  jb721DelegateTokens_: NFT_filter

  """Filter for the block changed event."""
  _change_block: BlockChangedFilter
  and: [Participant_filter]
  or: [Participant_filter]
}

enum Participant_orderBy {
  id
  project
  project__id
  project__projectId
  project__handle
  project__deployer
  project__metadataUri
  project__owner
  project__creator
  project__createdAt
  project__paymentsCount
  project__contributorsCount
  project__redeemCount
  project__volume
  project__volumeUSD
  project__redeemVolume
  project__redeemVolumeUSD
  project__currentBalance
  project__tokenSupply
  project__trendingScore
  project__trendingVolume
  project__trendingPaymentsCount
  project__createdWithinTrendingWindow
  project__nftsMintedCount
  projectId
  address
  wallet
  wallet__id
  wallet__volume
  wallet__volumeUSD
  wallet__lastPaidTimestamp
  volume
  volumeUSD
  lastPaidTimestamp
  paymentsCount
  balance
  stakedBalance
  erc20Balance
  jb721DelegateTokens
}

type PayEvent {
  chain: Int!
  id: ID!
  project: Project!
  projectId: Int!
  timestamp: Int!
  txHash: Bytes!
  from: Bytes!
  caller: Bytes!
  distributionFromProjectId: Int
  beneficiary: Bytes!
  amount: BigInt!
  amountUSD: BigInt
  note: String!
  feeFromProject: Int
  beneficiaryTokenCount: BigInt!
}

input PayEvent_filter {
  chain: Int
  chain_in: [Int]
  id: ID
  id_not: ID
  id_gt: ID
  id_lt: ID
  id_gte: ID
  id_lte: ID
  id_in: [ID!]
  id_not_in: [ID!]
  project: String
  project_not: String
  project_gt: String
  project_lt: String
  project_gte: String
  project_lte: String
  project_in: [String!]
  project_not_in: [String!]
  project_contains: String
  project_contains_nocase: String
  project_not_contains: String
  project_not_contains_nocase: String
  project_starts_with: String
  project_starts_with_nocase: String
  project_not_starts_with: String
  project_not_starts_with_nocase: String
  project_ends_with: String
  project_ends_with_nocase: String
  project_not_ends_with: String
  project_not_ends_with_nocase: String
  project_: Project_filter
  projectId: Int
  projectId_not: Int
  projectId_gt: Int
  projectId_lt: Int
  projectId_gte: Int
  projectId_lte: Int
  projectId_in: [Int!]
  projectId_not_in: [Int!]
  timestamp: Int
  timestamp_not: Int
  timestamp_gt: Int
  timestamp_lt: Int
  timestamp_gte: Int
  timestamp_lte: Int
  timestamp_in: [Int!]
  timestamp_not_in: [Int!]
  txHash: Bytes
  txHash_not: Bytes
  txHash_gt: Bytes
  txHash_lt: Bytes
  txHash_gte: Bytes
  txHash_lte: Bytes
  txHash_in: [Bytes!]
  txHash_not_in: [Bytes!]
  txHash_contains: Bytes
  txHash_not_contains: Bytes
  from: Bytes
  from_not: Bytes
  from_gt: Bytes
  from_lt: Bytes
  from_gte: Bytes
  from_lte: Bytes
  from_in: [Bytes!]
  from_not_in: [Bytes!]
  from_contains: Bytes
  from_not_contains: Bytes
  caller: Bytes
  caller_not: Bytes
  caller_gt: Bytes
  caller_lt: Bytes
  caller_gte: Bytes
  caller_lte: Bytes
  caller_in: [Bytes!]
  caller_not_in: [Bytes!]
  caller_contains: Bytes
  caller_not_contains: Bytes
  distributionFromProjectId: Int
  distributionFromProjectId_not: Int
  distributionFromProjectId_gt: Int
  distributionFromProjectId_lt: Int
  distributionFromProjectId_gte: Int
  distributionFromProjectId_lte: Int
  distributionFromProjectId_in: [Int!]
  distributionFromProjectId_not_in: [Int!]
  beneficiary: Bytes
  beneficiary_not: Bytes
  beneficiary_gt: Bytes
  beneficiary_lt: Bytes
  beneficiary_gte: Bytes
  beneficiary_lte: Bytes
  beneficiary_in: [Bytes!]
  beneficiary_not_in: [Bytes!]
  beneficiary_contains: Bytes
  beneficiary_not_contains: Bytes
  amount: BigInt
  amount_not: BigInt
  amount_gt: BigInt
  amount_lt: BigInt
  amount_gte: BigInt
  amount_lte: BigInt
  amount_in: [BigInt!]
  amount_not_in: [BigInt!]
  amountUSD: BigInt
  amountUSD_not: BigInt
  amountUSD_gt: BigInt
  amountUSD_lt: BigInt
  amountUSD_gte: BigInt
  amountUSD_lte: BigInt
  amountUSD_in: [BigInt!]
  amountUSD_not_in: [BigInt!]
  note: String
  note_not: String
  note_gt: String
  note_lt: String
  note_gte: String
  note_lte: String
  note_in: [String!]
  note_not_in: [String!]
  note_contains: String
  note_contains_nocase: String
  note_not_contains: String
  note_not_contains_nocase: String
  note_starts_with: String
  note_starts_with_nocase: String
  note_not_starts_with: String
  note_not_starts_with_nocase: String
  note_ends_with: String
  note_ends_with_nocase: String
  note_not_ends_with: String
  note_not_ends_with_nocase: String
  feeFromProject: Int
  feeFromProject_not: Int
  feeFromProject_gt: Int
  feeFromProject_lt: Int
  feeFromProject_gte: Int
  feeFromProject_lte: Int
  feeFromProject_in: [Int!]
  feeFromProject_not_in: [Int!]
  beneficiaryTokenCount: BigInt
  beneficiaryTokenCount_not: BigInt
  beneficiaryTokenCount_gt: BigInt
  beneficiaryTokenCount_lt: BigInt
  beneficiaryTokenCount_gte: BigInt
  beneficiaryTokenCount_lte: BigInt
  beneficiaryTokenCount_in: [BigInt!]
  beneficiaryTokenCount_not_in: [BigInt!]

  """Filter for the block changed event."""
  _change_block: BlockChangedFilter
  and: [PayEvent_filter]
  or: [PayEvent_filter]
}

enum PayEvent_orderBy {
  id
  project
  project__id
  project__projectId
  project__handle
  project__deployer
  project__metadataUri
  project__owner
  project__creator
  project__createdAt
  project__paymentsCount
  project__contributorsCount
  project__redeemCount
  project__volume
  project__volumeUSD
  project__redeemVolume
  project__redeemVolumeUSD
  project__currentBalance
  project__tokenSupply
  project__trendingScore
  project__trendingVolume
  project__trendingPaymentsCount
  project__createdWithinTrendingWindow
  project__nftsMintedCount
  projectId
  timestamp
  txHash
  from
  caller
  distributionFromProjectId
  beneficiary
  amount
  amountUSD
  note
  feeFromProject
  beneficiaryTokenCount
}

type PermissionsHolder {
  chain: Int!
  id: ID!
  account: Bytes!
  projectId: Int!
  project: Project!
  permissions: [Int!]!
  operator: Bytes!
}

input PermissionsHolder_filter {
  chain: Int
  chain_in: [Int]
  id: ID
  id_not: ID
  id_gt: ID
  id_lt: ID
  id_gte: ID
  id_lte: ID
  id_in: [ID!]
  id_not_in: [ID!]
  account: Bytes
  account_not: Bytes
  account_gt: Bytes
  account_lt: Bytes
  account_gte: Bytes
  account_lte: Bytes
  account_in: [Bytes!]
  account_not_in: [Bytes!]
  account_contains: Bytes
  account_not_contains: Bytes
  projectId: Int
  projectId_not: Int
  projectId_gt: Int
  projectId_lt: Int
  projectId_gte: Int
  projectId_lte: Int
  projectId_in: [Int!]
  projectId_not_in: [Int!]
  project: String
  project_not: String
  project_gt: String
  project_lt: String
  project_gte: String
  project_lte: String
  project_in: [String!]
  project_not_in: [String!]
  project_contains: String
  project_contains_nocase: String
  project_not_contains: String
  project_not_contains_nocase: String
  project_starts_with: String
  project_starts_with_nocase: String
  project_not_starts_with: String
  project_not_starts_with_nocase: String
  project_ends_with: String
  project_ends_with_nocase: String
  project_not_ends_with: String
  project_not_ends_with_nocase: String
  project_: Project_filter
  permissions: [Int!]
  permissions_not: [Int!]
  permissions_contains: [Int!]
  permissions_contains_nocase: [Int!]
  permissions_not_contains: [Int!]
  permissions_not_contains_nocase: [Int!]
  operator: Bytes
  operator_not: Bytes
  operator_gt: Bytes
  operator_lt: Bytes
  operator_gte: Bytes
  operator_lte: Bytes
  operator_in: [Bytes!]
  operator_not_in: [Bytes!]
  operator_contains: Bytes
  operator_not_contains: Bytes

  """Filter for the block changed event."""
  _change_block: BlockChangedFilter
  and: [PermissionsHolder_filter]
  or: [PermissionsHolder_filter]
}

enum PermissionsHolder_orderBy {
  id
  account
  projectId
  project
  project__id
  project__projectId
  project__handle
  project__deployer
  project__metadataUri
  project__owner
  project__creator
  project__createdAt
  project__paymentsCount
  project__contributorsCount
  project__redeemCount
  project__volume
  project__volumeUSD
  project__redeemVolume
  project__redeemVolumeUSD
  project__currentBalance
  project__tokenSupply
  project__trendingScore
  project__trendingVolume
  project__trendingPaymentsCount
  project__createdWithinTrendingWindow
  project__nftsMintedCount
  permissions
  operator
}

type Project {
  chain: Int!
  id: ID!
  projectId: Int!
  handle: String
  deployer: Bytes
  metadataUri: String
  owner: Bytes!
  creator: Bytes!
  createdAt: Int!
  paymentsCount: Int!
  contributorsCount: Int!
  redeemCount: Int!
  volume: BigInt!
  volumeUSD: BigInt!
  redeemVolume: BigInt!
  redeemVolumeUSD: BigInt!
  currentBalance: BigInt!
  tokenSupply: BigInt!
  trendingScore: BigInt!
  trendingVolume: BigInt!
  trendingPaymentsCount: Int!
  createdWithinTrendingWindow: Boolean
  nftsMintedCount: Int!
  addToBalanceEvents(skip: Int = 0, first: Int = 100, orderBy: AddToBalanceEvent_orderBy, orderDirection: OrderDirection, where: AddToBalanceEvent_filter): [AddToBalanceEvent!]!
  burnEvents(skip: Int = 0, first: Int = 100, orderBy: BurnEvent_orderBy, orderDirection: OrderDirection, where: BurnEvent_filter): [BurnEvent!]!
  deployedERC20Events(skip: Int = 0, first: Int = 100, orderBy: DeployedERC20Event_orderBy, orderDirection: OrderDirection, where: DeployedERC20Event_filter): [DeployedERC20Event!]!
  distributePayoutsEvents(skip: Int = 0, first: Int = 100, orderBy: DistributePayoutsEvent_orderBy, orderDirection: OrderDirection, where: DistributePayoutsEvent_filter): [DistributePayoutsEvent!]!
  distributeReservedTokensEvents(skip: Int = 0, first: Int = 100, orderBy: DistributeReservedTokensEvent_orderBy, orderDirection: OrderDirection, where: DistributeReservedTokensEvent_filter): [DistributeReservedTokensEvent!]!
  distributeToPayoutSplitEvents(skip: Int = 0, first: Int = 100, orderBy: DistributeToPayoutSplitEvent_orderBy, orderDirection: OrderDirection, where: DistributeToPayoutSplitEvent_filter): [DistributeToPayoutSplitEvent!]!
  distributeToReservedTokenSplitEvents(skip: Int = 0, first: Int = 100, orderBy: DistributeToReservedTokenSplitEvent_orderBy, orderDirection: OrderDirection, where: DistributeToReservedTokenSplitEvent_filter): [DistributeToReservedTokenSplitEvent!]!
  mintTokensEvents(skip: Int = 0, first: Int = 100, orderBy: MintTokensEvent_orderBy, orderDirection: OrderDirection, where: MintTokensEvent_filter): [MintTokensEvent!]!
  payEvents(skip: Int = 0, first: Int = 100, orderBy: PayEvent_orderBy, orderDirection: OrderDirection, where: PayEvent_filter): [PayEvent!]!
  projectEvents(skip: Int = 0, first: Int = 100, orderBy: ProjectEvent_orderBy, orderDirection: OrderDirection, where: ProjectEvent_filter): [ProjectEvent!]!
  cashOutEvents(skip: Int = 0, first: Int = 100, orderBy: CashOutEvent_orderBy, orderDirection: OrderDirection, where: CashOutEvent_filter): [CashOutEvent!]!
  useAllowanceEvents(skip: Int = 0, first: Int = 100, orderBy: UseAllowanceEvent_orderBy, orderDirection: OrderDirection, where: UseAllowanceEvent_filter): [UseAllowanceEvent!]!
  jb721DelegateTokens(skip: Int = 0, first: Int = 100, orderBy: NFT_orderBy, orderDirection: OrderDirection, where: NFT_filter): [NFT!]!
  nftCollections(skip: Int = 0, first: Int = 100, orderBy: NFTCollection_orderBy, orderDirection: OrderDirection, where: NFTCollection_filter): [NFTCollection!]!
  participants(skip: Int = 0, first: Int = 100, orderBy: Participant_orderBy, orderDirection: OrderDirection, where: Participant_filter): [Participant!]!
  permissionsHolders(skip: Int = 0, first: Int = 100, orderBy: PermissionsHolder_orderBy, orderDirection: OrderDirection, where: PermissionsHolder_filter): [PermissionsHolder!]!
}

input Project_filter {
  chain: Int
  chain_in: [Int]
  id: ID
  id_not: ID
  id_gt: ID
  id_lt: ID
  id_gte: ID
  id_lte: ID
  id_in: [ID!]
  id_not_in: [ID!]
  projectId: Int
  projectId_not: Int
  projectId_gt: Int
  projectId_lt: Int
  projectId_gte: Int
  projectId_lte: Int
  projectId_in: [Int!]
  projectId_not_in: [Int!]
  handle: String
  handle_not: String
  handle_gt: String
  handle_lt: String
  handle_gte: String
  handle_lte: String
  handle_in: [String!]
  handle_not_in: [String!]
  handle_contains: String
  handle_contains_nocase: String
  handle_not_contains: String
  handle_not_contains_nocase: String
  handle_starts_with: String
  handle_starts_with_nocase: String
  handle_not_starts_with: String
  handle_not_starts_with_nocase: String
  handle_ends_with: String
  handle_ends_with_nocase: String
  handle_not_ends_with: String
  handle_not_ends_with_nocase: String
  deployer: Bytes
  deployer_not: Bytes
  deployer_gt: Bytes
  deployer_lt: Bytes
  deployer_gte: Bytes
  deployer_lte: Bytes
  deployer_in: [Bytes!]
  deployer_not_in: [Bytes!]
  deployer_contains: Bytes
  deployer_not_contains: Bytes
  metadataUri: String
  metadataUri_not: String
  metadataUri_gt: String
  metadataUri_lt: String
  metadataUri_gte: String
  metadataUri_lte: String
  metadataUri_in: [String!]
  metadataUri_not_in: [String!]
  metadataUri_contains: String
  metadataUri_contains_nocase: String
  metadataUri_not_contains: String
  metadataUri_not_contains_nocase: String
  metadataUri_starts_with: String
  metadataUri_starts_with_nocase: String
  metadataUri_not_starts_with: String
  metadataUri_not_starts_with_nocase: String
  metadataUri_ends_with: String
  metadataUri_ends_with_nocase: String
  metadataUri_not_ends_with: String
  metadataUri_not_ends_with_nocase: String
  owner: Bytes
  owner_not: Bytes
  owner_gt: Bytes
  owner_lt: Bytes
  owner_gte: Bytes
  owner_lte: Bytes
  owner_in: [Bytes!]
  owner_not_in: [Bytes!]
  owner_contains: Bytes
  owner_not_contains: Bytes
  creator: Bytes
  creator_not: Bytes
  creator_gt: Bytes
  creator_lt: Bytes
  creator_gte: Bytes
  creator_lte: Bytes
  creator_in: [Bytes!]
  creator_not_in: [Bytes!]
  creator_contains: Bytes
  creator_not_contains: Bytes
  createdAt: Int
  createdAt_not: Int
  createdAt_gt: Int
  createdAt_lt: Int
  createdAt_gte: Int
  createdAt_lte: Int
  createdAt_in: [Int!]
  createdAt_not_in: [Int!]
  paymentsCount: Int
  paymentsCount_not: Int
  paymentsCount_gt: Int
  paymentsCount_lt: Int
  paymentsCount_gte: Int
  paymentsCount_lte: Int
  paymentsCount_in: [Int!]
  paymentsCount_not_in: [Int!]
  contributorsCount: Int
  contributorsCount_not: Int
  contributorsCount_gt: Int
  contributorsCount_lt: Int
  contributorsCount_gte: Int
  contributorsCount_lte: Int
  contributorsCount_in: [Int!]
  contributorsCount_not_in: [Int!]
  redeemCount: Int
  redeemCount_not: Int
  redeemCount_gt: Int
  redeemCount_lt: Int
  redeemCount_gte: Int
  redeemCount_lte: Int
  redeemCount_in: [Int!]
  redeemCount_not_in: [Int!]
  volume: BigInt
  volume_not: BigInt
  volume_gt: BigInt
  volume_lt: BigInt
  volume_gte: BigInt
  volume_lte: BigInt
  volume_in: [BigInt!]
  volume_not_in: [BigInt!]
  volumeUSD: BigInt
  volumeUSD_not: BigInt
  volumeUSD_gt: BigInt
  volumeUSD_lt: BigInt
  volumeUSD_gte: BigInt
  volumeUSD_lte: BigInt
  volumeUSD_in: [BigInt!]
  volumeUSD_not_in: [BigInt!]
  redeemVolume: BigInt
  redeemVolume_not: BigInt
  redeemVolume_gt: BigInt
  redeemVolume_lt: BigInt
  redeemVolume_gte: BigInt
  redeemVolume_lte: BigInt
  redeemVolume_in: [BigInt!]
  redeemVolume_not_in: [BigInt!]
  redeemVolumeUSD: BigInt
  redeemVolumeUSD_not: BigInt
  redeemVolumeUSD_gt: BigInt
  redeemVolumeUSD_lt: BigInt
  redeemVolumeUSD_gte: BigInt
  redeemVolumeUSD_lte: BigInt
  redeemVolumeUSD_in: [BigInt!]
  redeemVolumeUSD_not_in: [BigInt!]
  currentBalance: BigInt
  currentBalance_not: BigInt
  currentBalance_gt: BigInt
  currentBalance_lt: BigInt
  currentBalance_gte: BigInt
  currentBalance_lte: BigInt
  currentBalance_in: [BigInt!]
  currentBalance_not_in: [BigInt!]
  tokenSupply: BigInt
  tokenSupply_not: BigInt
  tokenSupply_gt: BigInt
  tokenSupply_lt: BigInt
  tokenSupply_gte: BigInt
  tokenSupply_lte: BigInt
  tokenSupply_in: [BigInt!]
  tokenSupply_not_in: [BigInt!]
  trendingScore: BigInt
  trendingScore_not: BigInt
  trendingScore_gt: BigInt
  trendingScore_lt: BigInt
  trendingScore_gte: BigInt
  trendingScore_lte: BigInt
  trendingScore_in: [BigInt!]
  trendingScore_not_in: [BigInt!]
  trendingVolume: BigInt
  trendingVolume_not: BigInt
  trendingVolume_gt: BigInt
  trendingVolume_lt: BigInt
  trendingVolume_gte: BigInt
  trendingVolume_lte: BigInt
  trendingVolume_in: [BigInt!]
  trendingVolume_not_in: [BigInt!]
  trendingPaymentsCount: Int
  trendingPaymentsCount_not: Int
  trendingPaymentsCount_gt: Int
  trendingPaymentsCount_lt: Int
  trendingPaymentsCount_gte: Int
  trendingPaymentsCount_lte: Int
  trendingPaymentsCount_in: [Int!]
  trendingPaymentsCount_not_in: [Int!]
  createdWithinTrendingWindow: Boolean
  createdWithinTrendingWindow_not: Boolean
  createdWithinTrendingWindow_in: [Boolean!]
  createdWithinTrendingWindow_not_in: [Boolean!]
  nftsMintedCount: Int
  nftsMintedCount_not: Int
  nftsMintedCount_gt: Int
  nftsMintedCount_lt: Int
  nftsMintedCount_gte: Int
  nftsMintedCount_lte: Int
  nftsMintedCount_in: [Int!]
  nftsMintedCount_not_in: [Int!]
  addToBalanceEvents_: AddToBalanceEvent_filter
  burnEvents_: BurnEvent_filter
  deployedERC20Events_: DeployedERC20Event_filter
  distributePayoutsEvents_: DistributePayoutsEvent_filter
  distributeReservedTokensEvents_: DistributeReservedTokensEvent_filter
  distributeToPayoutSplitEvents_: DistributeToPayoutSplitEvent_filter
  distributeToReservedTokenSplitEvents_: DistributeToReservedTokenSplitEvent_filter
  mintTokensEvents_: MintTokensEvent_filter
  payEvents_: PayEvent_filter
  projectEvents_: ProjectEvent_filter
  cashOutEvents_: CashOutEvent_filter
  useAllowanceEvents_: UseAllowanceEvent_filter
  jb721DelegateTokens_: NFT_filter
  nftCollections_: NFTCollection_filter
  participants_: Participant_filter
  permissionsHolders_: PermissionsHolder_filter

  """Filter for the block changed event."""
  _change_block: BlockChangedFilter
  and: [Project_filter]
  or: [Project_filter]
}

enum Project_orderBy {
  id
  projectId
  handle
  deployer
  metadataUri
  owner
  creator
  createdAt
  paymentsCount
  contributorsCount
  redeemCount
  volume
  volumeUSD
  redeemVolume
  redeemVolumeUSD
  currentBalance
  tokenSupply
  trendingScore
  trendingVolume
  trendingPaymentsCount
  createdWithinTrendingWindow
  nftsMintedCount
  addToBalanceEvents
  burnEvents
  deployedERC20Events
  distributePayoutsEvents
  distributeReservedTokensEvents
  distributeToPayoutSplitEvents
  distributeToReservedTokenSplitEvents
  mintTokensEvents
  payEvents
  projectEvents
  cashOutEvents
  useAllowanceEvents
  jb721DelegateTokens
  nftCollections
  participants
  permissionsHolders
}

type ProjectCreateEvent {
  chain: Int!
  id: ID!
  project: Project!
  projectId: Int!
  timestamp: Int!
  txHash: Bytes!
  from: Bytes!
  caller: Bytes!
}

input ProjectCreateEvent_filter {
  chain: Int
  chain_in: [Int]
  id: ID
  id_not: ID
  id_gt: ID
  id_lt: ID
  id_gte: ID
  id_lte: ID
  id_in: [ID!]
  id_not_in: [ID!]
  project: String
  project_not: String
  project_gt: String
  project_lt: String
  project_gte: String
  project_lte: String
  project_in: [String!]
  project_not_in: [String!]
  project_contains: String
  project_contains_nocase: String
  project_not_contains: String
  project_not_contains_nocase: String
  project_starts_with: String
  project_starts_with_nocase: String
  project_not_starts_with: String
  project_not_starts_with_nocase: String
  project_ends_with: String
  project_ends_with_nocase: String
  project_not_ends_with: String
  project_not_ends_with_nocase: String
  project_: Project_filter
  projectId: Int
  projectId_not: Int
  projectId_gt: Int
  projectId_lt: Int
  projectId_gte: Int
  projectId_lte: Int
  projectId_in: [Int!]
  projectId_not_in: [Int!]
  timestamp: Int
  timestamp_not: Int
  timestamp_gt: Int
  timestamp_lt: Int
  timestamp_gte: Int
  timestamp_lte: Int
  timestamp_in: [Int!]
  timestamp_not_in: [Int!]
  txHash: Bytes
  txHash_not: Bytes
  txHash_gt: Bytes
  txHash_lt: Bytes
  txHash_gte: Bytes
  txHash_lte: Bytes
  txHash_in: [Bytes!]
  txHash_not_in: [Bytes!]
  txHash_contains: Bytes
  txHash_not_contains: Bytes
  from: Bytes
  from_not: Bytes
  from_gt: Bytes
  from_lt: Bytes
  from_gte: Bytes
  from_lte: Bytes
  from_in: [Bytes!]
  from_not_in: [Bytes!]
  from_contains: Bytes
  from_not_contains: Bytes
  caller: Bytes
  caller_not: Bytes
  caller_gt: Bytes
  caller_lt: Bytes
  caller_gte: Bytes
  caller_lte: Bytes
  caller_in: [Bytes!]
  caller_not_in: [Bytes!]
  caller_contains: Bytes
  caller_not_contains: Bytes

  """Filter for the block changed event."""
  _change_block: BlockChangedFilter
  and: [ProjectCreateEvent_filter]
  or: [ProjectCreateEvent_filter]
}

enum ProjectCreateEvent_orderBy {
  id
  project
  project__id
  project__projectId
  project__handle
  project__deployer
  project__metadataUri
  project__owner
  project__creator
  project__createdAt
  project__paymentsCount
  project__contributorsCount
  project__redeemCount
  project__volume
  project__volumeUSD
  project__redeemVolume
  project__redeemVolumeUSD
  project__currentBalance
  project__tokenSupply
  project__trendingScore
  project__trendingVolume
  project__trendingPaymentsCount
  project__createdWithinTrendingWindow
  project__nftsMintedCount
  projectId
  timestamp
  txHash
  from
  caller
}

type ProjectEvent {
  chain: Int!
  id: ID!
  project: Project!
  projectId: Int!
  timestamp: Int!
  from: Bytes!
  caller: Bytes
  payEvent: PayEvent
  addToBalanceEvent: AddToBalanceEvent
  mintTokensEvent: MintTokensEvent
  cashOutEvent: CashOutEvent
  deployedERC20Event: DeployedERC20Event
  projectCreateEvent: ProjectCreateEvent
  distributePayoutsEvent: DistributePayoutsEvent
  distributeReservedTokensEvent: DistributeReservedTokensEvent
  distributeToReservedTokenSplitEvent: DistributeToReservedTokenSplitEvent
  distributeToPayoutSplitEvent: DistributeToPayoutSplitEvent
  useAllowanceEvent: UseAllowanceEvent
  burnEvent: BurnEvent
}

input ProjectEvent_filter {
  chain: Int
  chain_in: [Int]
  id: ID
  id_not: ID
  id_gt: ID
  id_lt: ID
  id_gte: ID
  id_lte: ID
  id_in: [ID!]
  id_not_in: [ID!]
  project: String
  project_not: String
  project_gt: String
  project_lt: String
  project_gte: String
  project_lte: String
  project_in: [String!]
  project_not_in: [String!]
  project_contains: String
  project_contains_nocase: String
  project_not_contains: String
  project_not_contains_nocase: String
  project_starts_with: String
  project_starts_with_nocase: String
  project_not_starts_with: String
  project_not_starts_with_nocase: String
  project_ends_with: String
  project_ends_with_nocase: String
  project_not_ends_with: String
  project_not_ends_with_nocase: String
  project_: Project_filter
  projectId: Int
  projectId_not: Int
  projectId_gt: Int
  projectId_lt: Int
  projectId_gte: Int
  projectId_lte: Int
  projectId_in: [Int!]
  projectId_not_in: [Int!]
  timestamp: Int
  timestamp_not: Int
  timestamp_gt: Int
  timestamp_lt: Int
  timestamp_gte: Int
  timestamp_lte: Int
  timestamp_in: [Int!]
  timestamp_not_in: [Int!]
  from: Bytes
  from_not: Bytes
  from_gt: Bytes
  from_lt: Bytes
  from_gte: Bytes
  from_lte: Bytes
  from_in: [Bytes!]
  from_not_in: [Bytes!]
  from_contains: Bytes
  from_not_contains: Bytes
  caller: Bytes
  caller_not: Bytes
  caller_gt: Bytes
  caller_lt: Bytes
  caller_gte: Bytes
  caller_lte: Bytes
  caller_in: [Bytes!]
  caller_not_in: [Bytes!]
  caller_contains: Bytes
  caller_not_contains: Bytes
  payEvent: String
  payEvent_not: String
  payEvent_gt: String
  payEvent_lt: String
  payEvent_gte: String
  payEvent_lte: String
  payEvent_in: [String!]
  payEvent_not_in: [String!]
  payEvent_contains: String
  payEvent_contains_nocase: String
  payEvent_not_contains: String
  payEvent_not_contains_nocase: String
  payEvent_starts_with: String
  payEvent_starts_with_nocase: String
  payEvent_not_starts_with: String
  payEvent_not_starts_with_nocase: String
  payEvent_ends_with: String
  payEvent_ends_with_nocase: String
  payEvent_not_ends_with: String
  payEvent_not_ends_with_nocase: String
  payEvent_: PayEvent_filter
  addToBalanceEvent: String
  addToBalanceEvent_not: String
  addToBalanceEvent_gt: String
  addToBalanceEvent_lt: String
  addToBalanceEvent_gte: String
  addToBalanceEvent_lte: String
  addToBalanceEvent_in: [String!]
  addToBalanceEvent_not_in: [String!]
  addToBalanceEvent_contains: String
  addToBalanceEvent_contains_nocase: String
  addToBalanceEvent_not_contains: String
  addToBalanceEvent_not_contains_nocase: String
  addToBalanceEvent_starts_with: String
  addToBalanceEvent_starts_with_nocase: String
  addToBalanceEvent_not_starts_with: String
  addToBalanceEvent_not_starts_with_nocase: String
  addToBalanceEvent_ends_with: String
  addToBalanceEvent_ends_with_nocase: String
  addToBalanceEvent_not_ends_with: String
  addToBalanceEvent_not_ends_with_nocase: String
  addToBalanceEvent_: AddToBalanceEvent_filter
  mintTokensEvent: String
  mintTokensEvent_not: String
  mintTokensEvent_gt: String
  mintTokensEvent_lt: String
  mintTokensEvent_gte: String
  mintTokensEvent_lte: String
  mintTokensEvent_in: [String!]
  mintTokensEvent_not_in: [String!]
  mintTokensEvent_contains: String
  mintTokensEvent_contains_nocase: String
  mintTokensEvent_not_contains: String
  mintTokensEvent_not_contains_nocase: String
  mintTokensEvent_starts_with: String
  mintTokensEvent_starts_with_nocase: String
  mintTokensEvent_not_starts_with: String
  mintTokensEvent_not_starts_with_nocase: String
  mintTokensEvent_ends_with: String
  mintTokensEvent_ends_with_nocase: String
  mintTokensEvent_not_ends_with: String
  mintTokensEvent_not_ends_with_nocase: String
  mintTokensEvent_: MintTokensEvent_filter
  cashOutEvent: String
  cashOutEvent_not: String
  cashOutEvent_gt: String
  cashOutEvent_lt: String
  cashOutEvent_gte: String
  cashOutEvent_lte: String
  cashOutEvent_in: [String!]
  cashOutEvent_not_in: [String!]
  cashOutEvent_contains: String
  cashOutEvent_contains_nocase: String
  cashOutEvent_not_contains: String
  cashOutEvent_not_contains_nocase: String
  cashOutEvent_starts_with: String
  cashOutEvent_starts_with_nocase: String
  cashOutEvent_not_starts_with: String
  cashOutEvent_not_starts_with_nocase: String
  cashOutEvent_ends_with: String
  cashOutEvent_ends_with_nocase: String
  cashOutEvent_not_ends_with: String
  cashOutEvent_not_ends_with_nocase: String
  cashOutEvent_: CashOutEvent_filter
  deployedERC20Event: String
  deployedERC20Event_not: String
  deployedERC20Event_gt: String
  deployedERC20Event_lt: String
  deployedERC20Event_gte: String
  deployedERC20Event_lte: String
  deployedERC20Event_in: [String!]
  deployedERC20Event_not_in: [String!]
  deployedERC20Event_contains: String
  deployedERC20Event_contains_nocase: String
  deployedERC20Event_not_contains: String
  deployedERC20Event_not_contains_nocase: String
  deployedERC20Event_starts_with: String
  deployedERC20Event_starts_with_nocase: String
  deployedERC20Event_not_starts_with: String
  deployedERC20Event_not_starts_with_nocase: String
  deployedERC20Event_ends_with: String
  deployedERC20Event_ends_with_nocase: String
  deployedERC20Event_not_ends_with: String
  deployedERC20Event_not_ends_with_nocase: String
  deployedERC20Event_: DeployedERC20Event_filter
  projectCreateEvent: String
  projectCreateEvent_not: String
  projectCreateEvent_gt: String
  projectCreateEvent_lt: String
  projectCreateEvent_gte: String
  projectCreateEvent_lte: String
  projectCreateEvent_in: [String!]
  projectCreateEvent_not_in: [String!]
  projectCreateEvent_contains: String
  projectCreateEvent_contains_nocase: String
  projectCreateEvent_not_contains: String
  projectCreateEvent_not_contains_nocase: String
  projectCreateEvent_starts_with: String
  projectCreateEvent_starts_with_nocase: String
  projectCreateEvent_not_starts_with: String
  projectCreateEvent_not_starts_with_nocase: String
  projectCreateEvent_ends_with: String
  projectCreateEvent_ends_with_nocase: String
  projectCreateEvent_not_ends_with: String
  projectCreateEvent_not_ends_with_nocase: String
  projectCreateEvent_: ProjectCreateEvent_filter
  distributePayoutsEvent: String
  distributePayoutsEvent_not: String
  distributePayoutsEvent_gt: String
  distributePayoutsEvent_lt: String
  distributePayoutsEvent_gte: String
  distributePayoutsEvent_lte: String
  distributePayoutsEvent_in: [String!]
  distributePayoutsEvent_not_in: [String!]
  distributePayoutsEvent_contains: String
  distributePayoutsEvent_contains_nocase: String
  distributePayoutsEvent_not_contains: String
  distributePayoutsEvent_not_contains_nocase: String
  distributePayoutsEvent_starts_with: String
  distributePayoutsEvent_starts_with_nocase: String
  distributePayoutsEvent_not_starts_with: String
  distributePayoutsEvent_not_starts_with_nocase: String
  distributePayoutsEvent_ends_with: String
  distributePayoutsEvent_ends_with_nocase: String
  distributePayoutsEvent_not_ends_with: String
  distributePayoutsEvent_not_ends_with_nocase: String
  distributePayoutsEvent_: DistributePayoutsEvent_filter
  distributeReservedTokensEvent: String
  distributeReservedTokensEvent_not: String
  distributeReservedTokensEvent_gt: String
  distributeReservedTokensEvent_lt: String
  distributeReservedTokensEvent_gte: String
  distributeReservedTokensEvent_lte: String
  distributeReservedTokensEvent_in: [String!]
  distributeReservedTokensEvent_not_in: [String!]
  distributeReservedTokensEvent_contains: String
  distributeReservedTokensEvent_contains_nocase: String
  distributeReservedTokensEvent_not_contains: String
  distributeReservedTokensEvent_not_contains_nocase: String
  distributeReservedTokensEvent_starts_with: String
  distributeReservedTokensEvent_starts_with_nocase: String
  distributeReservedTokensEvent_not_starts_with: String
  distributeReservedTokensEvent_not_starts_with_nocase: String
  distributeReservedTokensEvent_ends_with: String
  distributeReservedTokensEvent_ends_with_nocase: String
  distributeReservedTokensEvent_not_ends_with: String
  distributeReservedTokensEvent_not_ends_with_nocase: String
  distributeReservedTokensEvent_: DistributeReservedTokensEvent_filter
  distributeToReservedTokenSplitEvent: String
  distributeToReservedTokenSplitEvent_not: String
  distributeToReservedTokenSplitEvent_gt: String
  distributeToReservedTokenSplitEvent_lt: String
  distributeToReservedTokenSplitEvent_gte: String
  distributeToReservedTokenSplitEvent_lte: String
  distributeToReservedTokenSplitEvent_in: [String!]
  distributeToReservedTokenSplitEvent_not_in: [String!]
  distributeToReservedTokenSplitEvent_contains: String
  distributeToReservedTokenSplitEvent_contains_nocase: String
  distributeToReservedTokenSplitEvent_not_contains: String
  distributeToReservedTokenSplitEvent_not_contains_nocase: String
  distributeToReservedTokenSplitEvent_starts_with: String
  distributeToReservedTokenSplitEvent_starts_with_nocase: String
  distributeToReservedTokenSplitEvent_not_starts_with: String
  distributeToReservedTokenSplitEvent_not_starts_with_nocase: String
  distributeToReservedTokenSplitEvent_ends_with: String
  distributeToReservedTokenSplitEvent_ends_with_nocase: String
  distributeToReservedTokenSplitEvent_not_ends_with: String
  distributeToReservedTokenSplitEvent_not_ends_with_nocase: String
  distributeToReservedTokenSplitEvent_: DistributeToReservedTokenSplitEvent_filter
  distributeToPayoutSplitEvent: String
  distributeToPayoutSplitEvent_not: String
  distributeToPayoutSplitEvent_gt: String
  distributeToPayoutSplitEvent_lt: String
  distributeToPayoutSplitEvent_gte: String
  distributeToPayoutSplitEvent_lte: String
  distributeToPayoutSplitEvent_in: [String!]
  distributeToPayoutSplitEvent_not_in: [String!]
  distributeToPayoutSplitEvent_contains: String
  distributeToPayoutSplitEvent_contains_nocase: String
  distributeToPayoutSplitEvent_not_contains: String
  distributeToPayoutSplitEvent_not_contains_nocase: String
  distributeToPayoutSplitEvent_starts_with: String
  distributeToPayoutSplitEvent_starts_with_nocase: String
  distributeToPayoutSplitEvent_not_starts_with: String
  distributeToPayoutSplitEvent_not_starts_with_nocase: String
  distributeToPayoutSplitEvent_ends_with: String
  distributeToPayoutSplitEvent_ends_with_nocase: String
  distributeToPayoutSplitEvent_not_ends_with: String
  distributeToPayoutSplitEvent_not_ends_with_nocase: String
  distributeToPayoutSplitEvent_: DistributeToPayoutSplitEvent_filter
  useAllowanceEvent: String
  useAllowanceEvent_not: String
  useAllowanceEvent_gt: String
  useAllowanceEvent_lt: String
  useAllowanceEvent_gte: String
  useAllowanceEvent_lte: String
  useAllowanceEvent_in: [String!]
  useAllowanceEvent_not_in: [String!]
  useAllowanceEvent_contains: String
  useAllowanceEvent_contains_nocase: String
  useAllowanceEvent_not_contains: String
  useAllowanceEvent_not_contains_nocase: String
  useAllowanceEvent_starts_with: String
  useAllowanceEvent_starts_with_nocase: String
  useAllowanceEvent_not_starts_with: String
  useAllowanceEvent_not_starts_with_nocase: String
  useAllowanceEvent_ends_with: String
  useAllowanceEvent_ends_with_nocase: String
  useAllowanceEvent_not_ends_with: String
  useAllowanceEvent_not_ends_with_nocase: String
  useAllowanceEvent_: UseAllowanceEvent_filter
  burnEvent: String
  burnEvent_not: String
  burnEvent_gt: String
  burnEvent_lt: String
  burnEvent_gte: String
  burnEvent_lte: String
  burnEvent_in: [String!]
  burnEvent_not_in: [String!]
  burnEvent_contains: String
  burnEvent_contains_nocase: String
  burnEvent_not_contains: String
  burnEvent_not_contains_nocase: String
  burnEvent_starts_with: String
  burnEvent_starts_with_nocase: String
  burnEvent_not_starts_with: String
  burnEvent_not_starts_with_nocase: String
  burnEvent_ends_with: String
  burnEvent_ends_with_nocase: String
  burnEvent_not_ends_with: String
  burnEvent_not_ends_with_nocase: String
  burnEvent_: BurnEvent_filter

  """Filter for the block changed event."""
  _change_block: BlockChangedFilter
  and: [ProjectEvent_filter]
  or: [ProjectEvent_filter]
}

enum ProjectEvent_orderBy {
  id
  project
  project__id
  project__projectId
  project__handle
  project__deployer
  project__metadataUri
  project__owner
  project__creator
  project__createdAt
  project__paymentsCount
  project__contributorsCount
  project__redeemCount
  project__volume
  project__volumeUSD
  project__redeemVolume
  project__redeemVolumeUSD
  project__currentBalance
  project__tokenSupply
  project__trendingScore
  project__trendingVolume
  project__trendingPaymentsCount
  project__createdWithinTrendingWindow
  project__nftsMintedCount
  projectId
  timestamp
  from
  caller
  payEvent
  payEvent__id
  payEvent__projectId
  payEvent__timestamp
  payEvent__txHash
  payEvent__from
  payEvent__caller
  payEvent__distributionFromProjectId
  payEvent__beneficiary
  payEvent__amount
  payEvent__amountUSD
  payEvent__note
  payEvent__feeFromProject
  payEvent__beneficiaryTokenCount
  addToBalanceEvent
  addToBalanceEvent__id
  addToBalanceEvent__projectId
  addToBalanceEvent__timestamp
  addToBalanceEvent__txHash
  addToBalanceEvent__from
  addToBalanceEvent__caller
  addToBalanceEvent__amount
  addToBalanceEvent__amountUSD
  addToBalanceEvent__note
  mintTokensEvent
  mintTokensEvent__id
  mintTokensEvent__projectId
  mintTokensEvent__timestamp
  mintTokensEvent__txHash
  mintTokensEvent__from
  mintTokensEvent__caller
  mintTokensEvent__beneficiary
  mintTokensEvent__amount
  mintTokensEvent__memo
  cashOutEvent
  cashOutEvent__id
  cashOutEvent__projectId
  cashOutEvent__timestamp
  cashOutEvent__txHash
  cashOutEvent__from
  cashOutEvent__caller
  cashOutEvent__metadata
  cashOutEvent__holder
  cashOutEvent__beneficiary
  cashOutEvent__cashOutCount
  cashOutEvent__reclaimAmount
  cashOutEvent__reclaimAmountUSD
  deployedERC20Event
  deployedERC20Event__id
  deployedERC20Event__projectId
  deployedERC20Event__timestamp
  deployedERC20Event__txHash
  deployedERC20Event__from
  deployedERC20Event__caller
  deployedERC20Event__symbol
  deployedERC20Event__address
  projectCreateEvent
  projectCreateEvent__id
  projectCreateEvent__projectId
  projectCreateEvent__timestamp
  projectCreateEvent__txHash
  projectCreateEvent__from
  projectCreateEvent__caller
  distributePayoutsEvent
  distributePayoutsEvent__id
  distributePayoutsEvent__projectId
  distributePayoutsEvent__timestamp
  distributePayoutsEvent__txHash
  distributePayoutsEvent__from
  distributePayoutsEvent__caller
  distributePayoutsEvent__amount
  distributePayoutsEvent__amountUSD
  distributePayoutsEvent__amountPaidOut
  distributePayoutsEvent__amountPaidOutUSD
  distributePayoutsEvent__rulesetCycleNumber
  distributePayoutsEvent__rulesetId
  distributePayoutsEvent__fee
  distributePayoutsEvent__feeUSD
  distributeReservedTokensEvent
  distributeReservedTokensEvent__id
  distributeReservedTokensEvent__projectId
  distributeReservedTokensEvent__timestamp
  distributeReservedTokensEvent__txHash
  distributeReservedTokensEvent__from
  distributeReservedTokensEvent__caller
  distributeReservedTokensEvent__rulesetCycleNumber
  distributeReservedTokensEvent__tokenCount
  distributeToReservedTokenSplitEvent
  distributeToReservedTokenSplitEvent__id
  distributeToReservedTokenSplitEvent__projectId
  distributeToReservedTokenSplitEvent__timestamp
  distributeToReservedTokenSplitEvent__txHash
  distributeToReservedTokenSplitEvent__from
  distributeToReservedTokenSplitEvent__caller
  distributeToReservedTokenSplitEvent__tokenCount
  distributeToReservedTokenSplitEvent__preferAddToBalance
  distributeToReservedTokenSplitEvent__percent
  distributeToReservedTokenSplitEvent__splitProjectId
  distributeToReservedTokenSplitEvent__beneficiary
  distributeToReservedTokenSplitEvent__lockedUntil
  distributeToPayoutSplitEvent
  distributeToPayoutSplitEvent__id
  distributeToPayoutSplitEvent__projectId
  distributeToPayoutSplitEvent__timestamp
  distributeToPayoutSplitEvent__txHash
  distributeToPayoutSplitEvent__from
  distributeToPayoutSplitEvent__caller
  distributeToPayoutSplitEvent__amount
  distributeToPayoutSplitEvent__amountUSD
  distributeToPayoutSplitEvent__preferAddToBalance
  distributeToPayoutSplitEvent__percent
  distributeToPayoutSplitEvent__splitProjectId
  distributeToPayoutSplitEvent__beneficiary
  distributeToPayoutSplitEvent__lockedUntil
  useAllowanceEvent
  useAllowanceEvent__id
  useAllowanceEvent__projectId
  useAllowanceEvent__timestamp
  useAllowanceEvent__txHash
  useAllowanceEvent__from
  useAllowanceEvent__caller
  useAllowanceEvent__rulesetId
  useAllowanceEvent__rulesetCycleNumber
  useAllowanceEvent__beneficiary
  useAllowanceEvent__amount
  useAllowanceEvent__amountUSD
  useAllowanceEvent__distributedAmount
  useAllowanceEvent__distributedAmountUSD
  useAllowanceEvent__netDistributedamount
  useAllowanceEvent__netDistributedamountUSD
  useAllowanceEvent__memo
  burnEvent
  burnEvent__id
  burnEvent__projectId
  burnEvent__timestamp
  burnEvent__txHash
  burnEvent__from
  burnEvent__caller
  burnEvent__holder
  burnEvent__amount
  burnEvent__stakedAmount
  burnEvent__erc20Amount
}

type ProtocolLog {
  chain: Int!
  id: ID!
  projectsCount: Int!
  volume: BigInt!
  volumeUSD: BigInt!
  volumeRedeemed: BigInt!
  volumeRedeemedUSD: BigInt!
  paymentsCount: Int!
  redeemCount: Int!
  erc20Count: Int!
  trendingLastUpdatedTimestamp: Int!
  oldestTrendingPayEvent: PayEvent
}

input ProtocolLog_filter {
  chain: Int
  chain_in: [Int]
  id: ID
  id_not: ID
  id_gt: ID
  id_lt: ID
  id_gte: ID
  id_lte: ID
  id_in: [ID!]
  id_not_in: [ID!]
  projectsCount: Int
  projectsCount_not: Int
  projectsCount_gt: Int
  projectsCount_lt: Int
  projectsCount_gte: Int
  projectsCount_lte: Int
  projectsCount_in: [Int!]
  projectsCount_not_in: [Int!]
  volume: BigInt
  volume_not: BigInt
  volume_gt: BigInt
  volume_lt: BigInt
  volume_gte: BigInt
  volume_lte: BigInt
  volume_in: [BigInt!]
  volume_not_in: [BigInt!]
  volumeUSD: BigInt
  volumeUSD_not: BigInt
  volumeUSD_gt: BigInt
  volumeUSD_lt: BigInt
  volumeUSD_gte: BigInt
  volumeUSD_lte: BigInt
  volumeUSD_in: [BigInt!]
  volumeUSD_not_in: [BigInt!]
  volumeRedeemed: BigInt
  volumeRedeemed_not: BigInt
  volumeRedeemed_gt: BigInt
  volumeRedeemed_lt: BigInt
  volumeRedeemed_gte: BigInt
  volumeRedeemed_lte: BigInt
  volumeRedeemed_in: [BigInt!]
  volumeRedeemed_not_in: [BigInt!]
  volumeRedeemedUSD: BigInt
  volumeRedeemedUSD_not: BigInt
  volumeRedeemedUSD_gt: BigInt
  volumeRedeemedUSD_lt: BigInt
  volumeRedeemedUSD_gte: BigInt
  volumeRedeemedUSD_lte: BigInt
  volumeRedeemedUSD_in: [BigInt!]
  volumeRedeemedUSD_not_in: [BigInt!]
  paymentsCount: Int
  paymentsCount_not: Int
  paymentsCount_gt: Int
  paymentsCount_lt: Int
  paymentsCount_gte: Int
  paymentsCount_lte: Int
  paymentsCount_in: [Int!]
  paymentsCount_not_in: [Int!]
  redeemCount: Int
  redeemCount_not: Int
  redeemCount_gt: Int
  redeemCount_lt: Int
  redeemCount_gte: Int
  redeemCount_lte: Int
  redeemCount_in: [Int!]
  redeemCount_not_in: [Int!]
  erc20Count: Int
  erc20Count_not: Int
  erc20Count_gt: Int
  erc20Count_lt: Int
  erc20Count_gte: Int
  erc20Count_lte: Int
  erc20Count_in: [Int!]
  erc20Count_not_in: [Int!]
  trendingLastUpdatedTimestamp: Int
  trendingLastUpdatedTimestamp_not: Int
  trendingLastUpdatedTimestamp_gt: Int
  trendingLastUpdatedTimestamp_lt: Int
  trendingLastUpdatedTimestamp_gte: Int
  trendingLastUpdatedTimestamp_lte: Int
  trendingLastUpdatedTimestamp_in: [Int!]
  trendingLastUpdatedTimestamp_not_in: [Int!]
  oldestTrendingPayEvent: String
  oldestTrendingPayEvent_not: String
  oldestTrendingPayEvent_gt: String
  oldestTrendingPayEvent_lt: String
  oldestTrendingPayEvent_gte: String
  oldestTrendingPayEvent_lte: String
  oldestTrendingPayEvent_in: [String!]
  oldestTrendingPayEvent_not_in: [String!]
  oldestTrendingPayEvent_contains: String
  oldestTrendingPayEvent_contains_nocase: String
  oldestTrendingPayEvent_not_contains: String
  oldestTrendingPayEvent_not_contains_nocase: String
  oldestTrendingPayEvent_starts_with: String
  oldestTrendingPayEvent_starts_with_nocase: String
  oldestTrendingPayEvent_not_starts_with: String
  oldestTrendingPayEvent_not_starts_with_nocase: String
  oldestTrendingPayEvent_ends_with: String
  oldestTrendingPayEvent_ends_with_nocase: String
  oldestTrendingPayEvent_not_ends_with: String
  oldestTrendingPayEvent_not_ends_with_nocase: String
  oldestTrendingPayEvent_: PayEvent_filter

  """Filter for the block changed event."""
  _change_block: BlockChangedFilter
  and: [ProtocolLog_filter]
  or: [ProtocolLog_filter]
}

enum ProtocolLog_orderBy {
  id
  projectsCount
  volume
  volumeUSD
  volumeRedeemed
  volumeRedeemedUSD
  paymentsCount
  redeemCount
  erc20Count
  trendingLastUpdatedTimestamp
  oldestTrendingPayEvent
  oldestTrendingPayEvent__id
  oldestTrendingPayEvent__projectId
  oldestTrendingPayEvent__timestamp
  oldestTrendingPayEvent__txHash
  oldestTrendingPayEvent__from
  oldestTrendingPayEvent__caller
  oldestTrendingPayEvent__distributionFromProjectId
  oldestTrendingPayEvent__beneficiary
  oldestTrendingPayEvent__amount
  oldestTrendingPayEvent__amountUSD
  oldestTrendingPayEvent__note
  oldestTrendingPayEvent__feeFromProject
  oldestTrendingPayEvent__beneficiaryTokenCount
}

type Query {
  chain: Int!
  protocolLog(
    id: ID!

    """
    The block at which the query should be executed. Can either be a '{ hash:
    Bytes }' value containing a block hash, a '{ number: Int }' containing the
    block number, or a '{ number_gte: Int }' containing the minimum block
    number. In the case of 'number_gte', the query will be executed on the
    latest block only if the subgraph has progressed to or past the minimum
    block number. Defaults to the latest block when omitted.
    """
    block: Block_height

    """
    Set to 'allow' to receive data even if the subgraph has skipped over errors while syncing.
    """
    subgraphError: _SubgraphErrorPolicy_! = deny
  ): ProtocolLog
  protocolLogs(
    skip: Int = 0
    first: Int = 100
    orderBy: ProtocolLog_orderBy
    orderDirection: OrderDirection
    where: ProtocolLog_filter

    """
    The block at which the query should be executed. Can either be a '{ hash:
    Bytes }' value containing a block hash, a '{ number: Int }' containing the
    block number, or a '{ number_gte: Int }' containing the minimum block
    number. In the case of 'number_gte', the query will be executed on the
    latest block only if the subgraph has progressed to or past the minimum
    block number. Defaults to the latest block when omitted.
    """
    block: Block_height

    """
    Set to 'allow' to receive data even if the subgraph has skipped over errors while syncing.
    """
    subgraphError: _SubgraphErrorPolicy_! = deny
  ): [ProtocolLog!]!
  projectCreateEvent(
    id: ID!

    """
    The block at which the query should be executed. Can either be a '{ hash:
    Bytes }' value containing a block hash, a '{ number: Int }' containing the
    block number, or a '{ number_gte: Int }' containing the minimum block
    number. In the case of 'number_gte', the query will be executed on the
    latest block only if the subgraph has progressed to or past the minimum
    block number. Defaults to the latest block when omitted.
    """
    block: Block_height

    """
    Set to 'allow' to receive data even if the subgraph has skipped over errors while syncing.
    """
    subgraphError: _SubgraphErrorPolicy_! = deny
  ): ProjectCreateEvent
  projectCreateEvents(
    skip: Int = 0
    first: Int = 100
    orderBy: ProjectCreateEvent_orderBy
    orderDirection: OrderDirection
    where: ProjectCreateEvent_filter

    """
    The block at which the query should be executed. Can either be a '{ hash:
    Bytes }' value containing a block hash, a '{ number: Int }' containing the
    block number, or a '{ number_gte: Int }' containing the minimum block
    number. In the case of 'number_gte', the query will be executed on the
    latest block only if the subgraph has progressed to or past the minimum
    block number. Defaults to the latest block when omitted.
    """
    block: Block_height

    """
    Set to 'allow' to receive data even if the subgraph has skipped over errors while syncing.
    """
    subgraphError: _SubgraphErrorPolicy_! = deny
  ): [ProjectCreateEvent!]!
  project(
    id: ID!

    """
    The block at which the query should be executed. Can either be a '{ hash:
    Bytes }' value containing a block hash, a '{ number: Int }' containing the
    block number, or a '{ number_gte: Int }' containing the minimum block
    number. In the case of 'number_gte', the query will be executed on the
    latest block only if the subgraph has progressed to or past the minimum
    block number. Defaults to the latest block when omitted.
    """
    block: Block_height

    """
    Set to 'allow' to receive data even if the subgraph has skipped over errors while syncing.
    """
    subgraphError: _SubgraphErrorPolicy_! = deny
  ): Project
  projects(
    skip: Int = 0
    first: Int = 100
    orderBy: Project_orderBy
    orderDirection: OrderDirection
    where: Project_filter

    """
    The block at which the query should be executed. Can either be a '{ hash:
    Bytes }' value containing a block hash, a '{ number: Int }' containing the
    block number, or a '{ number_gte: Int }' containing the minimum block
    number. In the case of 'number_gte', the query will be executed on the
    latest block only if the subgraph has progressed to or past the minimum
    block number. Defaults to the latest block when omitted.
    """
    block: Block_height

    """
    Set to 'allow' to receive data even if the subgraph has skipped over errors while syncing.
    """
    subgraphError: _SubgraphErrorPolicy_! = deny
  ): [Project!]!
  participant(
    id: ID!

    """
    The block at which the query should be executed. Can either be a '{ hash:
    Bytes }' value containing a block hash, a '{ number: Int }' containing the
    block number, or a '{ number_gte: Int }' containing the minimum block
    number. In the case of 'number_gte', the query will be executed on the
    latest block only if the subgraph has progressed to or past the minimum
    block number. Defaults to the latest block when omitted.
    """
    block: Block_height

    """
    Set to 'allow' to receive data even if the subgraph has skipped over errors while syncing.
    """
    subgraphError: _SubgraphErrorPolicy_! = deny
  ): Participant
  participants(
    skip: Int = 0
    first: Int = 100
    orderBy: Participant_orderBy
    orderDirection: OrderDirection
    where: Participant_filter

    """
    The block at which the query should be executed. Can either be a '{ hash:
    Bytes }' value containing a block hash, a '{ number: Int }' containing the
    block number, or a '{ number_gte: Int }' containing the minimum block
    number. In the case of 'number_gte', the query will be executed on the
    latest block only if the subgraph has progressed to or past the minimum
    block number. Defaults to the latest block when omitted.
    """
    block: Block_height

    """
    Set to 'allow' to receive data even if the subgraph has skipped over errors while syncing.
    """
    subgraphError: _SubgraphErrorPolicy_! = deny
  ): [Participant!]!
  wallet(
    id: ID!

    """
    The block at which the query should be executed. Can either be a '{ hash:
    Bytes }' value containing a block hash, a '{ number: Int }' containing the
    block number, or a '{ number_gte: Int }' containing the minimum block
    number. In the case of 'number_gte', the query will be executed on the
    latest block only if the subgraph has progressed to or past the minimum
    block number. Defaults to the latest block when omitted.
    """
    block: Block_height

    """
    Set to 'allow' to receive data even if the subgraph has skipped over errors while syncing.
    """
    subgraphError: _SubgraphErrorPolicy_! = deny
  ): Wallet
  wallets(
    skip: Int = 0
    first: Int = 100
    orderBy: Wallet_orderBy
    orderDirection: OrderDirection
    where: Wallet_filter

    """
    The block at which the query should be executed. Can either be a '{ hash:
    Bytes }' value containing a block hash, a '{ number: Int }' containing the
    block number, or a '{ number_gte: Int }' containing the minimum block
    number. In the case of 'number_gte', the query will be executed on the
    latest block only if the subgraph has progressed to or past the minimum
    block number. Defaults to the latest block when omitted.
    """
    block: Block_height

    """
    Set to 'allow' to receive data even if the subgraph has skipped over errors while syncing.
    """
    subgraphError: _SubgraphErrorPolicy_! = deny
  ): [Wallet!]!
  projectEvent(
    id: ID!

    """
    The block at which the query should be executed. Can either be a '{ hash:
    Bytes }' value containing a block hash, a '{ number: Int }' containing the
    block number, or a '{ number_gte: Int }' containing the minimum block
    number. In the case of 'number_gte', the query will be executed on the
    latest block only if the subgraph has progressed to or past the minimum
    block number. Defaults to the latest block when omitted.
    """
    block: Block_height

    """
    Set to 'allow' to receive data even if the subgraph has skipped over errors while syncing.
    """
    subgraphError: _SubgraphErrorPolicy_! = deny
  ): ProjectEvent
  projectEvents(
    skip: Int = 0
    first: Int = 100
    orderBy: ProjectEvent_orderBy
    orderDirection: OrderDirection
    where: ProjectEvent_filter

    """
    The block at which the query should be executed. Can either be a '{ hash:
    Bytes }' value containing a block hash, a '{ number: Int }' containing the
    block number, or a '{ number_gte: Int }' containing the minimum block
    number. In the case of 'number_gte', the query will be executed on the
    latest block only if the subgraph has progressed to or past the minimum
    block number. Defaults to the latest block when omitted.
    """
    block: Block_height

    """
    Set to 'allow' to receive data even if the subgraph has skipped over errors while syncing.
    """
    subgraphError: _SubgraphErrorPolicy_! = deny
  ): [ProjectEvent!]!
  payEvent(
    id: ID!

    """
    The block at which the query should be executed. Can either be a '{ hash:
    Bytes }' value containing a block hash, a '{ number: Int }' containing the
    block number, or a '{ number_gte: Int }' containing the minimum block
    number. In the case of 'number_gte', the query will be executed on the
    latest block only if the subgraph has progressed to or past the minimum
    block number. Defaults to the latest block when omitted.
    """
    block: Block_height

    """
    Set to 'allow' to receive data even if the subgraph has skipped over errors while syncing.
    """
    subgraphError: _SubgraphErrorPolicy_! = deny
  ): PayEvent
  payEvents(
    skip: Int = 0
    first: Int = 100
    orderBy: PayEvent_orderBy
    orderDirection: OrderDirection
    where: PayEvent_filter

    """
    The block at which the query should be executed. Can either be a '{ hash:
    Bytes }' value containing a block hash, a '{ number: Int }' containing the
    block number, or a '{ number_gte: Int }' containing the minimum block
    number. In the case of 'number_gte', the query will be executed on the
    latest block only if the subgraph has progressed to or past the minimum
    block number. Defaults to the latest block when omitted.
    """
    block: Block_height

    """
    Set to 'allow' to receive data even if the subgraph has skipped over errors while syncing.
    """
    subgraphError: _SubgraphErrorPolicy_! = deny
  ): [PayEvent!]!
  addToBalanceEvent(
    id: ID!

    """
    The block at which the query should be executed. Can either be a '{ hash:
    Bytes }' value containing a block hash, a '{ number: Int }' containing the
    block number, or a '{ number_gte: Int }' containing the minimum block
    number. In the case of 'number_gte', the query will be executed on the
    latest block only if the subgraph has progressed to or past the minimum
    block number. Defaults to the latest block when omitted.
    """
    block: Block_height

    """
    Set to 'allow' to receive data even if the subgraph has skipped over errors while syncing.
    """
    subgraphError: _SubgraphErrorPolicy_! = deny
  ): AddToBalanceEvent
  addToBalanceEvents(
    skip: Int = 0
    first: Int = 100
    orderBy: AddToBalanceEvent_orderBy
    orderDirection: OrderDirection
    where: AddToBalanceEvent_filter

    """
    The block at which the query should be executed. Can either be a '{ hash:
    Bytes }' value containing a block hash, a '{ number: Int }' containing the
    block number, or a '{ number_gte: Int }' containing the minimum block
    number. In the case of 'number_gte', the query will be executed on the
    latest block only if the subgraph has progressed to or past the minimum
    block number. Defaults to the latest block when omitted.
    """
    block: Block_height

    """
    Set to 'allow' to receive data even if the subgraph has skipped over errors while syncing.
    """
    subgraphError: _SubgraphErrorPolicy_! = deny
  ): [AddToBalanceEvent!]!
  mintTokensEvent(
    id: ID!

    """
    The block at which the query should be executed. Can either be a '{ hash:
    Bytes }' value containing a block hash, a '{ number: Int }' containing the
    block number, or a '{ number_gte: Int }' containing the minimum block
    number. In the case of 'number_gte', the query will be executed on the
    latest block only if the subgraph has progressed to or past the minimum
    block number. Defaults to the latest block when omitted.
    """
    block: Block_height

    """
    Set to 'allow' to receive data even if the subgraph has skipped over errors while syncing.
    """
    subgraphError: _SubgraphErrorPolicy_! = deny
  ): MintTokensEvent
  mintTokensEvents(
    skip: Int = 0
    first: Int = 100
    orderBy: MintTokensEvent_orderBy
    orderDirection: OrderDirection
    where: MintTokensEvent_filter

    """
    The block at which the query should be executed. Can either be a '{ hash:
    Bytes }' value containing a block hash, a '{ number: Int }' containing the
    block number, or a '{ number_gte: Int }' containing the minimum block
    number. In the case of 'number_gte', the query will be executed on the
    latest block only if the subgraph has progressed to or past the minimum
    block number. Defaults to the latest block when omitted.
    """
    block: Block_height

    """
    Set to 'allow' to receive data even if the subgraph has skipped over errors while syncing.
    """
    subgraphError: _SubgraphErrorPolicy_! = deny
  ): [MintTokensEvent!]!
  cashOutEvent(
    id: ID!

    """
    The block at which the query should be executed. Can either be a '{ hash:
    Bytes }' value containing a block hash, a '{ number: Int }' containing the
    block number, or a '{ number_gte: Int }' containing the minimum block
    number. In the case of 'number_gte', the query will be executed on the
    latest block only if the subgraph has progressed to or past the minimum
    block number. Defaults to the latest block when omitted.
    """
    block: Block_height

    """
    Set to 'allow' to receive data even if the subgraph has skipped over errors while syncing.
    """
    subgraphError: _SubgraphErrorPolicy_! = deny
  ): CashOutEvent
  cashOutEvents(
    skip: Int = 0
    first: Int = 100
    orderBy: CashOutEvent_orderBy
    orderDirection: OrderDirection
    where: CashOutEvent_filter

    """
    The block at which the query should be executed. Can either be a '{ hash:
    Bytes }' value containing a block hash, a '{ number: Int }' containing the
    block number, or a '{ number_gte: Int }' containing the minimum block
    number. In the case of 'number_gte', the query will be executed on the
    latest block only if the subgraph has progressed to or past the minimum
    block number. Defaults to the latest block when omitted.
    """
    block: Block_height

    """
    Set to 'allow' to receive data even if the subgraph has skipped over errors while syncing.
    """
    subgraphError: _SubgraphErrorPolicy_! = deny
  ): [CashOutEvent!]!
  deployedERC20Event(
    id: ID!

    """
    The block at which the query should be executed. Can either be a '{ hash:
    Bytes }' value containing a block hash, a '{ number: Int }' containing the
    block number, or a '{ number_gte: Int }' containing the minimum block
    number. In the case of 'number_gte', the query will be executed on the
    latest block only if the subgraph has progressed to or past the minimum
    block number. Defaults to the latest block when omitted.
    """
    block: Block_height

    """
    Set to 'allow' to receive data even if the subgraph has skipped over errors while syncing.
    """
    subgraphError: _SubgraphErrorPolicy_! = deny
  ): DeployedERC20Event
  deployedERC20Events(
    skip: Int = 0
    first: Int = 100
    orderBy: DeployedERC20Event_orderBy
    orderDirection: OrderDirection
    where: DeployedERC20Event_filter

    """
    The block at which the query should be executed. Can either be a '{ hash:
    Bytes }' value containing a block hash, a '{ number: Int }' containing the
    block number, or a '{ number_gte: Int }' containing the minimum block
    number. In the case of 'number_gte', the query will be executed on the
    latest block only if the subgraph has progressed to or past the minimum
    block number. Defaults to the latest block when omitted.
    """
    block: Block_height

    """
    Set to 'allow' to receive data even if the subgraph has skipped over errors while syncing.
    """
    subgraphError: _SubgraphErrorPolicy_! = deny
  ): [DeployedERC20Event!]!
  ensnode(
    id: ID!

    """
    The block at which the query should be executed. Can either be a '{ hash:
    Bytes }' value containing a block hash, a '{ number: Int }' containing the
    block number, or a '{ number_gte: Int }' containing the minimum block
    number. In the case of 'number_gte', the query will be executed on the
    latest block only if the subgraph has progressed to or past the minimum
    block number. Defaults to the latest block when omitted.
    """
    block: Block_height

    """
    Set to 'allow' to receive data even if the subgraph has skipped over errors while syncing.
    """
    subgraphError: _SubgraphErrorPolicy_! = deny
  ): ENSNode
  ensnodes(
    skip: Int = 0
    first: Int = 100
    orderBy: ENSNode_orderBy
    orderDirection: OrderDirection
    where: ENSNode_filter

    """
    The block at which the query should be executed. Can either be a '{ hash:
    Bytes }' value containing a block hash, a '{ number: Int }' containing the
    block number, or a '{ number_gte: Int }' containing the minimum block
    number. In the case of 'number_gte', the query will be executed on the
    latest block only if the subgraph has progressed to or past the minimum
    block number. Defaults to the latest block when omitted.
    """
    block: Block_height

    """
    Set to 'allow' to receive data even if the subgraph has skipped over errors while syncing.
    """
    subgraphError: _SubgraphErrorPolicy_! = deny
  ): [ENSNode!]!
  burnEvent(
    id: ID!

    """
    The block at which the query should be executed. Can either be a '{ hash:
    Bytes }' value containing a block hash, a '{ number: Int }' containing the
    block number, or a '{ number_gte: Int }' containing the minimum block
    number. In the case of 'number_gte', the query will be executed on the
    latest block only if the subgraph has progressed to or past the minimum
    block number. Defaults to the latest block when omitted.
    """
    block: Block_height

    """
    Set to 'allow' to receive data even if the subgraph has skipped over errors while syncing.
    """
    subgraphError: _SubgraphErrorPolicy_! = deny
  ): BurnEvent
  burnEvents(
    skip: Int = 0
    first: Int = 100
    orderBy: BurnEvent_orderBy
    orderDirection: OrderDirection
    where: BurnEvent_filter

    """
    The block at which the query should be executed. Can either be a '{ hash:
    Bytes }' value containing a block hash, a '{ number: Int }' containing the
    block number, or a '{ number_gte: Int }' containing the minimum block
    number. In the case of 'number_gte', the query will be executed on the
    latest block only if the subgraph has progressed to or past the minimum
    block number. Defaults to the latest block when omitted.
    """
    block: Block_height

    """
    Set to 'allow' to receive data even if the subgraph has skipped over errors while syncing.
    """
    subgraphError: _SubgraphErrorPolicy_! = deny
  ): [BurnEvent!]!
  nft(
    id: ID!

    """
    The block at which the query should be executed. Can either be a '{ hash:
    Bytes }' value containing a block hash, a '{ number: Int }' containing the
    block number, or a '{ number_gte: Int }' containing the minimum block
    number. In the case of 'number_gte', the query will be executed on the
    latest block only if the subgraph has progressed to or past the minimum
    block number. Defaults to the latest block when omitted.
    """
    block: Block_height

    """
    Set to 'allow' to receive data even if the subgraph has skipped over errors while syncing.
    """
    subgraphError: _SubgraphErrorPolicy_! = deny
  ): NFT
  nfts(
    skip: Int = 0
    first: Int = 100
    orderBy: NFT_orderBy
    orderDirection: OrderDirection
    where: NFT_filter

    """
    The block at which the query should be executed. Can either be a '{ hash:
    Bytes }' value containing a block hash, a '{ number: Int }' containing the
    block number, or a '{ number_gte: Int }' containing the minimum block
    number. In the case of 'number_gte', the query will be executed on the
    latest block only if the subgraph has progressed to or past the minimum
    block number. Defaults to the latest block when omitted.
    """
    block: Block_height

    """
    Set to 'allow' to receive data even if the subgraph has skipped over errors while syncing.
    """
    subgraphError: _SubgraphErrorPolicy_! = deny
  ): [NFT!]!
  nftcollection(
    id: ID!

    """
    The block at which the query should be executed. Can either be a '{ hash:
    Bytes }' value containing a block hash, a '{ number: Int }' containing the
    block number, or a '{ number_gte: Int }' containing the minimum block
    number. In the case of 'number_gte', the query will be executed on the
    latest block only if the subgraph has progressed to or past the minimum
    block number. Defaults to the latest block when omitted.
    """
    block: Block_height

    """
    Set to 'allow' to receive data even if the subgraph has skipped over errors while syncing.
    """
    subgraphError: _SubgraphErrorPolicy_! = deny
  ): NFTCollection
  nftcollections(
    skip: Int = 0
    first: Int = 100
    orderBy: NFTCollection_orderBy
    orderDirection: OrderDirection
    where: NFTCollection_filter

    """
    The block at which the query should be executed. Can either be a '{ hash:
    Bytes }' value containing a block hash, a '{ number: Int }' containing the
    block number, or a '{ number_gte: Int }' containing the minimum block
    number. In the case of 'number_gte', the query will be executed on the
    latest block only if the subgraph has progressed to or past the minimum
    block number. Defaults to the latest block when omitted.
    """
    block: Block_height

    """
    Set to 'allow' to receive data even if the subgraph has skipped over errors while syncing.
    """
    subgraphError: _SubgraphErrorPolicy_! = deny
  ): [NFTCollection!]!
  nfttier(
    id: ID!

    """
    The block at which the query should be executed. Can either be a '{ hash:
    Bytes }' value containing a block hash, a '{ number: Int }' containing the
    block number, or a '{ number_gte: Int }' containing the minimum block
    number. In the case of 'number_gte', the query will be executed on the
    latest block only if the subgraph has progressed to or past the minimum
    block number. Defaults to the latest block when omitted.
    """
    block: Block_height

    """
    Set to 'allow' to receive data even if the subgraph has skipped over errors while syncing.
    """
    subgraphError: _SubgraphErrorPolicy_! = deny
  ): NFTTier
  nfttiers(
    skip: Int = 0
    first: Int = 100
    orderBy: NFTTier_orderBy
    orderDirection: OrderDirection
    where: NFTTier_filter

    """
    The block at which the query should be executed. Can either be a '{ hash:
    Bytes }' value containing a block hash, a '{ number: Int }' containing the
    block number, or a '{ number_gte: Int }' containing the minimum block
    number. In the case of 'number_gte', the query will be executed on the
    latest block only if the subgraph has progressed to or past the minimum
    block number. Defaults to the latest block when omitted.
    """
    block: Block_height

    """
    Set to 'allow' to receive data even if the subgraph has skipped over errors while syncing.
    """
    subgraphError: _SubgraphErrorPolicy_! = deny
  ): [NFTTier!]!
  distributePayoutsEvent(
    id: ID!

    """
    The block at which the query should be executed. Can either be a '{ hash:
    Bytes }' value containing a block hash, a '{ number: Int }' containing the
    block number, or a '{ number_gte: Int }' containing the minimum block
    number. In the case of 'number_gte', the query will be executed on the
    latest block only if the subgraph has progressed to or past the minimum
    block number. Defaults to the latest block when omitted.
    """
    block: Block_height

    """
    Set to 'allow' to receive data even if the subgraph has skipped over errors while syncing.
    """
    subgraphError: _SubgraphErrorPolicy_! = deny
  ): DistributePayoutsEvent
  distributePayoutsEvents(
    skip: Int = 0
    first: Int = 100
    orderBy: DistributePayoutsEvent_orderBy
    orderDirection: OrderDirection
    where: DistributePayoutsEvent_filter

    """
    The block at which the query should be executed. Can either be a '{ hash:
    Bytes }' value containing a block hash, a '{ number: Int }' containing the
    block number, or a '{ number_gte: Int }' containing the minimum block
    number. In the case of 'number_gte', the query will be executed on the
    latest block only if the subgraph has progressed to or past the minimum
    block number. Defaults to the latest block when omitted.
    """
    block: Block_height

    """
    Set to 'allow' to receive data even if the subgraph has skipped over errors while syncing.
    """
    subgraphError: _SubgraphErrorPolicy_! = deny
  ): [DistributePayoutsEvent!]!
  distributeToPayoutSplitEvent(
    id: ID!

    """
    The block at which the query should be executed. Can either be a '{ hash:
    Bytes }' value containing a block hash, a '{ number: Int }' containing the
    block number, or a '{ number_gte: Int }' containing the minimum block
    number. In the case of 'number_gte', the query will be executed on the
    latest block only if the subgraph has progressed to or past the minimum
    block number. Defaults to the latest block when omitted.
    """
    block: Block_height

    """
    Set to 'allow' to receive data even if the subgraph has skipped over errors while syncing.
    """
    subgraphError: _SubgraphErrorPolicy_! = deny
  ): DistributeToPayoutSplitEvent
  distributeToPayoutSplitEvents(
    skip: Int = 0
    first: Int = 100
    orderBy: DistributeToPayoutSplitEvent_orderBy
    orderDirection: OrderDirection
    where: DistributeToPayoutSplitEvent_filter

    """
    The block at which the query should be executed. Can either be a '{ hash:
    Bytes }' value containing a block hash, a '{ number: Int }' containing the
    block number, or a '{ number_gte: Int }' containing the minimum block
    number. In the case of 'number_gte', the query will be executed on the
    latest block only if the subgraph has progressed to or past the minimum
    block number. Defaults to the latest block when omitted.
    """
    block: Block_height

    """
    Set to 'allow' to receive data even if the subgraph has skipped over errors while syncing.
    """
    subgraphError: _SubgraphErrorPolicy_! = deny
  ): [DistributeToPayoutSplitEvent!]!
  distributeReservedTokensEvent(
    id: ID!

    """
    The block at which the query should be executed. Can either be a '{ hash:
    Bytes }' value containing a block hash, a '{ number: Int }' containing the
    block number, or a '{ number_gte: Int }' containing the minimum block
    number. In the case of 'number_gte', the query will be executed on the
    latest block only if the subgraph has progressed to or past the minimum
    block number. Defaults to the latest block when omitted.
    """
    block: Block_height

    """
    Set to 'allow' to receive data even if the subgraph has skipped over errors while syncing.
    """
    subgraphError: _SubgraphErrorPolicy_! = deny
  ): DistributeReservedTokensEvent
  distributeReservedTokensEvents(
    skip: Int = 0
    first: Int = 100
    orderBy: DistributeReservedTokensEvent_orderBy
    orderDirection: OrderDirection
    where: DistributeReservedTokensEvent_filter

    """
    The block at which the query should be executed. Can either be a '{ hash:
    Bytes }' value containing a block hash, a '{ number: Int }' containing the
    block number, or a '{ number_gte: Int }' containing the minimum block
    number. In the case of 'number_gte', the query will be executed on the
    latest block only if the subgraph has progressed to or past the minimum
    block number. Defaults to the latest block when omitted.
    """
    block: Block_height

    """
    Set to 'allow' to receive data even if the subgraph has skipped over errors while syncing.
    """
    subgraphError: _SubgraphErrorPolicy_! = deny
  ): [DistributeReservedTokensEvent!]!
  distributeToReservedTokenSplitEvent(
    id: ID!

    """
    The block at which the query should be executed. Can either be a '{ hash:
    Bytes }' value containing a block hash, a '{ number: Int }' containing the
    block number, or a '{ number_gte: Int }' containing the minimum block
    number. In the case of 'number_gte', the query will be executed on the
    latest block only if the subgraph has progressed to or past the minimum
    block number. Defaults to the latest block when omitted.
    """
    block: Block_height

    """
    Set to 'allow' to receive data even if the subgraph has skipped over errors while syncing.
    """
    subgraphError: _SubgraphErrorPolicy_! = deny
  ): DistributeToReservedTokenSplitEvent
  distributeToReservedTokenSplitEvents(
    skip: Int = 0
    first: Int = 100
    orderBy: DistributeToReservedTokenSplitEvent_orderBy
    orderDirection: OrderDirection
    where: DistributeToReservedTokenSplitEvent_filter

    """
    The block at which the query should be executed. Can either be a '{ hash:
    Bytes }' value containing a block hash, a '{ number: Int }' containing the
    block number, or a '{ number_gte: Int }' containing the minimum block
    number. In the case of 'number_gte', the query will be executed on the
    latest block only if the subgraph has progressed to or past the minimum
    block number. Defaults to the latest block when omitted.
    """
    block: Block_height

    """
    Set to 'allow' to receive data even if the subgraph has skipped over errors while syncing.
    """
    subgraphError: _SubgraphErrorPolicy_! = deny
  ): [DistributeToReservedTokenSplitEvent!]!
  useAllowanceEvent(
    id: ID!

    """
    The block at which the query should be executed. Can either be a '{ hash:
    Bytes }' value containing a block hash, a '{ number: Int }' containing the
    block number, or a '{ number_gte: Int }' containing the minimum block
    number. In the case of 'number_gte', the query will be executed on the
    latest block only if the subgraph has progressed to or past the minimum
    block number. Defaults to the latest block when omitted.
    """
    block: Block_height

    """
    Set to 'allow' to receive data even if the subgraph has skipped over errors while syncing.
    """
    subgraphError: _SubgraphErrorPolicy_! = deny
  ): UseAllowanceEvent
  useAllowanceEvents(
    skip: Int = 0
    first: Int = 100
    orderBy: UseAllowanceEvent_orderBy
    orderDirection: OrderDirection
    where: UseAllowanceEvent_filter

    """
    The block at which the query should be executed. Can either be a '{ hash:
    Bytes }' value containing a block hash, a '{ number: Int }' containing the
    block number, or a '{ number_gte: Int }' containing the minimum block
    number. In the case of 'number_gte', the query will be executed on the
    latest block only if the subgraph has progressed to or past the minimum
    block number. Defaults to the latest block when omitted.
    """
    block: Block_height

    """
    Set to 'allow' to receive data even if the subgraph has skipped over errors while syncing.
    """
    subgraphError: _SubgraphErrorPolicy_! = deny
  ): [UseAllowanceEvent!]!
  permissionsHolder(
    id: ID!

    """
    The block at which the query should be executed. Can either be a '{ hash:
    Bytes }' value containing a block hash, a '{ number: Int }' containing the
    block number, or a '{ number_gte: Int }' containing the minimum block
    number. In the case of 'number_gte', the query will be executed on the
    latest block only if the subgraph has progressed to or past the minimum
    block number. Defaults to the latest block when omitted.
    """
    block: Block_height

    """
    Set to 'allow' to receive data even if the subgraph has skipped over errors while syncing.
    """
    subgraphError: _SubgraphErrorPolicy_! = deny
  ): PermissionsHolder
  permissionsHolders(
    skip: Int = 0
    first: Int = 100
    orderBy: PermissionsHolder_orderBy
    orderDirection: OrderDirection
    where: PermissionsHolder_filter

    """
    The block at which the query should be executed. Can either be a '{ hash:
    Bytes }' value containing a block hash, a '{ number: Int }' containing the
    block number, or a '{ number_gte: Int }' containing the minimum block
    number. In the case of 'number_gte', the query will be executed on the
    latest block only if the subgraph has progressed to or past the minimum
    block number. Defaults to the latest block when omitted.
    """
    block: Block_height

    """
    Set to 'allow' to receive data even if the subgraph has skipped over errors while syncing.
    """
    subgraphError: _SubgraphErrorPolicy_! = deny
  ): [PermissionsHolder!]!
  storeAutoIssuanceAmountEvent(
    id: ID!

    """
    The block at which the query should be executed. Can either be a '{ hash:
    Bytes }' value containing a block hash, a '{ number: Int }' containing the
    block number, or a '{ number_gte: Int }' containing the minimum block
    number. In the case of 'number_gte', the query will be executed on the
    latest block only if the subgraph has progressed to or past the minimum
    block number. Defaults to the latest block when omitted.
    """
    block: Block_height

    """
    Set to 'allow' to receive data even if the subgraph has skipped over errors while syncing.
    """
    subgraphError: _SubgraphErrorPolicy_! = deny
  ): StoreAutoIssuanceAmountEvent
  storeAutoIssuanceAmountEvents(
    skip: Int = 0
    first: Int = 100
    orderBy: StoreAutoIssuanceAmountEvent_orderBy
    orderDirection: OrderDirection
    where: StoreAutoIssuanceAmountEvent_filter

    """
    The block at which the query should be executed. Can either be a '{ hash:
    Bytes }' value containing a block hash, a '{ number: Int }' containing the
    block number, or a '{ number_gte: Int }' containing the minimum block
    number. In the case of 'number_gte', the query will be executed on the
    latest block only if the subgraph has progressed to or past the minimum
    block number. Defaults to the latest block when omitted.
    """
    block: Block_height

    """
    Set to 'allow' to receive data even if the subgraph has skipped over errors while syncing.
    """
    subgraphError: _SubgraphErrorPolicy_! = deny
  ): [StoreAutoIssuanceAmountEvent!]!
  autoIssueEvent(
    id: ID!

    """
    The block at which the query should be executed. Can either be a '{ hash:
    Bytes }' value containing a block hash, a '{ number: Int }' containing the
    block number, or a '{ number_gte: Int }' containing the minimum block
    number. In the case of 'number_gte', the query will be executed on the
    latest block only if the subgraph has progressed to or past the minimum
    block number. Defaults to the latest block when omitted.
    """
    block: Block_height

    """
    Set to 'allow' to receive data even if the subgraph has skipped over errors while syncing.
    """
    subgraphError: _SubgraphErrorPolicy_! = deny
  ): AutoIssueEvent
  autoIssueEvents(
    skip: Int = 0
    first: Int = 100
    orderBy: AutoIssueEvent_orderBy
    orderDirection: OrderDirection
    where: AutoIssueEvent_filter

    """
    The block at which the query should be executed. Can either be a '{ hash:
    Bytes }' value containing a block hash, a '{ number: Int }' containing the
    block number, or a '{ number_gte: Int }' containing the minimum block
    number. In the case of 'number_gte', the query will be executed on the
    latest block only if the subgraph has progressed to or past the minimum
    block number. Defaults to the latest block when omitted.
    """
    block: Block_height

    """
    Set to 'allow' to receive data even if the subgraph has skipped over errors while syncing.
    """
    subgraphError: _SubgraphErrorPolicy_! = deny
  ): [AutoIssueEvent!]!
  decorateBannyEvent(
    id: ID!

    """
    The block at which the query should be executed. Can either be a '{ hash:
    Bytes }' value containing a block hash, a '{ number: Int }' containing the
    block number, or a '{ number_gte: Int }' containing the minimum block
    number. In the case of 'number_gte', the query will be executed on the
    latest block only if the subgraph has progressed to or past the minimum
    block number. Defaults to the latest block when omitted.
    """
    block: Block_height

    """
    Set to 'allow' to receive data even if the subgraph has skipped over errors while syncing.
    """
    subgraphError: _SubgraphErrorPolicy_! = deny
  ): DecorateBannyEvent
  decorateBannyEvents(
    skip: Int = 0
    first: Int = 100
    orderBy: DecorateBannyEvent_orderBy
    orderDirection: OrderDirection
    where: DecorateBannyEvent_filter

    """
    The block at which the query should be executed. Can either be a '{ hash:
    Bytes }' value containing a block hash, a '{ number: Int }' containing the
    block number, or a '{ number_gte: Int }' containing the minimum block
    number. In the case of 'number_gte', the query will be executed on the
    latest block only if the subgraph has progressed to or past the minimum
    block number. Defaults to the latest block when omitted.
    """
    block: Block_height

    """
    Set to 'allow' to receive data even if the subgraph has skipped over errors while syncing.
    """
    subgraphError: _SubgraphErrorPolicy_! = deny
  ): [DecorateBannyEvent!]!
  projectSearch(
    text: String!
    first: Int = 100
    skip: Int = 0

    """
    The block at which the query should be executed. Can either be a '{ hash:
    Bytes }' value containing a block hash, a '{ number: Int }' containing the
    block number, or a '{ number_gte: Int }' containing the minimum block
    number. In the case of 'number_gte', the query will be executed on the
    latest block only if the subgraph has progressed to or past the minimum
    block number. Defaults to the latest block when omitted.
    """
    block: Block_height
    where: Project_filter

    """
    Set to 'allow' to receive data even if the subgraph has skipped over errors while syncing.
    """
    subgraphError: _SubgraphErrorPolicy_! = deny
  ): [Project!]!

  """Access to subgraph metadata"""
  _meta(block: Block_height): _Meta_
}

type StoreAutoIssuanceAmountEvent {
  chain: Int!
  id: ID!
  revnetId: BigInt!
  stageId: BigInt!
  beneficiary: Bytes!
  count: BigInt!
  caller: Bytes!
}

input StoreAutoIssuanceAmountEvent_filter {
  chain: Int
  chain_in: [Int]
  id: ID
  id_not: ID
  id_gt: ID
  id_lt: ID
  id_gte: ID
  id_lte: ID
  id_in: [ID!]
  id_not_in: [ID!]
  revnetId: BigInt
  revnetId_not: BigInt
  revnetId_gt: BigInt
  revnetId_lt: BigInt
  revnetId_gte: BigInt
  revnetId_lte: BigInt
  revnetId_in: [BigInt!]
  revnetId_not_in: [BigInt!]
  stageId: BigInt
  stageId_not: BigInt
  stageId_gt: BigInt
  stageId_lt: BigInt
  stageId_gte: BigInt
  stageId_lte: BigInt
  stageId_in: [BigInt!]
  stageId_not_in: [BigInt!]
  beneficiary: Bytes
  beneficiary_not: Bytes
  beneficiary_gt: Bytes
  beneficiary_lt: Bytes
  beneficiary_gte: Bytes
  beneficiary_lte: Bytes
  beneficiary_in: [Bytes!]
  beneficiary_not_in: [Bytes!]
  beneficiary_contains: Bytes
  beneficiary_not_contains: Bytes
  count: BigInt
  count_not: BigInt
  count_gt: BigInt
  count_lt: BigInt
  count_gte: BigInt
  count_lte: BigInt
  count_in: [BigInt!]
  count_not_in: [BigInt!]
  caller: Bytes
  caller_not: Bytes
  caller_gt: Bytes
  caller_lt: Bytes
  caller_gte: Bytes
  caller_lte: Bytes
  caller_in: [Bytes!]
  caller_not_in: [Bytes!]
  caller_contains: Bytes
  caller_not_contains: Bytes

  """Filter for the block changed event."""
  _change_block: BlockChangedFilter
  and: [StoreAutoIssuanceAmountEvent_filter]
  or: [StoreAutoIssuanceAmountEvent_filter]
}

enum StoreAutoIssuanceAmountEvent_orderBy {
  id
  revnetId
  stageId
  beneficiary
  count
  caller
}

type Subscription {
  chain: Int!
  protocolLog(
    id: ID!

    """
    The block at which the query should be executed. Can either be a '{ hash:
    Bytes }' value containing a block hash, a '{ number: Int }' containing the
    block number, or a '{ number_gte: Int }' containing the minimum block
    number. In the case of 'number_gte', the query will be executed on the
    latest block only if the subgraph has progressed to or past the minimum
    block number. Defaults to the latest block when omitted.
    """
    block: Block_height

    """
    Set to 'allow' to receive data even if the subgraph has skipped over errors while syncing.
    """
    subgraphError: _SubgraphErrorPolicy_! = deny
  ): ProtocolLog
  protocolLogs(
    skip: Int = 0
    first: Int = 100
    orderBy: ProtocolLog_orderBy
    orderDirection: OrderDirection
    where: ProtocolLog_filter

    """
    The block at which the query should be executed. Can either be a '{ hash:
    Bytes }' value containing a block hash, a '{ number: Int }' containing the
    block number, or a '{ number_gte: Int }' containing the minimum block
    number. In the case of 'number_gte', the query will be executed on the
    latest block only if the subgraph has progressed to or past the minimum
    block number. Defaults to the latest block when omitted.
    """
    block: Block_height

    """
    Set to 'allow' to receive data even if the subgraph has skipped over errors while syncing.
    """
    subgraphError: _SubgraphErrorPolicy_! = deny
  ): [ProtocolLog!]!
  projectCreateEvent(
    id: ID!

    """
    The block at which the query should be executed. Can either be a '{ hash:
    Bytes }' value containing a block hash, a '{ number: Int }' containing the
    block number, or a '{ number_gte: Int }' containing the minimum block
    number. In the case of 'number_gte', the query will be executed on the
    latest block only if the subgraph has progressed to or past the minimum
    block number. Defaults to the latest block when omitted.
    """
    block: Block_height

    """
    Set to 'allow' to receive data even if the subgraph has skipped over errors while syncing.
    """
    subgraphError: _SubgraphErrorPolicy_! = deny
  ): ProjectCreateEvent
  projectCreateEvents(
    skip: Int = 0
    first: Int = 100
    orderBy: ProjectCreateEvent_orderBy
    orderDirection: OrderDirection
    where: ProjectCreateEvent_filter

    """
    The block at which the query should be executed. Can either be a '{ hash:
    Bytes }' value containing a block hash, a '{ number: Int }' containing the
    block number, or a '{ number_gte: Int }' containing the minimum block
    number. In the case of 'number_gte', the query will be executed on the
    latest block only if the subgraph has progressed to or past the minimum
    block number. Defaults to the latest block when omitted.
    """
    block: Block_height

    """
    Set to 'allow' to receive data even if the subgraph has skipped over errors while syncing.
    """
    subgraphError: _SubgraphErrorPolicy_! = deny
  ): [ProjectCreateEvent!]!
  project(
    id: ID!

    """
    The block at which the query should be executed. Can either be a '{ hash:
    Bytes }' value containing a block hash, a '{ number: Int }' containing the
    block number, or a '{ number_gte: Int }' containing the minimum block
    number. In the case of 'number_gte', the query will be executed on the
    latest block only if the subgraph has progressed to or past the minimum
    block number. Defaults to the latest block when omitted.
    """
    block: Block_height

    """
    Set to 'allow' to receive data even if the subgraph has skipped over errors while syncing.
    """
    subgraphError: _SubgraphErrorPolicy_! = deny
  ): Project
  projects(
    skip: Int = 0
    first: Int = 100
    orderBy: Project_orderBy
    orderDirection: OrderDirection
    where: Project_filter

    """
    The block at which the query should be executed. Can either be a '{ hash:
    Bytes }' value containing a block hash, a '{ number: Int }' containing the
    block number, or a '{ number_gte: Int }' containing the minimum block
    number. In the case of 'number_gte', the query will be executed on the
    latest block only if the subgraph has progressed to or past the minimum
    block number. Defaults to the latest block when omitted.
    """
    block: Block_height

    """
    Set to 'allow' to receive data even if the subgraph has skipped over errors while syncing.
    """
    subgraphError: _SubgraphErrorPolicy_! = deny
  ): [Project!]!
  participant(
    id: ID!

    """
    The block at which the query should be executed. Can either be a '{ hash:
    Bytes }' value containing a block hash, a '{ number: Int }' containing the
    block number, or a '{ number_gte: Int }' containing the minimum block
    number. In the case of 'number_gte', the query will be executed on the
    latest block only if the subgraph has progressed to or past the minimum
    block number. Defaults to the latest block when omitted.
    """
    block: Block_height

    """
    Set to 'allow' to receive data even if the subgraph has skipped over errors while syncing.
    """
    subgraphError: _SubgraphErrorPolicy_! = deny
  ): Participant
  participants(
    skip: Int = 0
    first: Int = 100
    orderBy: Participant_orderBy
    orderDirection: OrderDirection
    where: Participant_filter

    """
    The block at which the query should be executed. Can either be a '{ hash:
    Bytes }' value containing a block hash, a '{ number: Int }' containing the
    block number, or a '{ number_gte: Int }' containing the minimum block
    number. In the case of 'number_gte', the query will be executed on the
    latest block only if the subgraph has progressed to or past the minimum
    block number. Defaults to the latest block when omitted.
    """
    block: Block_height

    """
    Set to 'allow' to receive data even if the subgraph has skipped over errors while syncing.
    """
    subgraphError: _SubgraphErrorPolicy_! = deny
  ): [Participant!]!
  wallet(
    id: ID!

    """
    The block at which the query should be executed. Can either be a '{ hash:
    Bytes }' value containing a block hash, a '{ number: Int }' containing the
    block number, or a '{ number_gte: Int }' containing the minimum block
    number. In the case of 'number_gte', the query will be executed on the
    latest block only if the subgraph has progressed to or past the minimum
    block number. Defaults to the latest block when omitted.
    """
    block: Block_height

    """
    Set to 'allow' to receive data even if the subgraph has skipped over errors while syncing.
    """
    subgraphError: _SubgraphErrorPolicy_! = deny
  ): Wallet
  wallets(
    skip: Int = 0
    first: Int = 100
    orderBy: Wallet_orderBy
    orderDirection: OrderDirection
    where: Wallet_filter

    """
    The block at which the query should be executed. Can either be a '{ hash:
    Bytes }' value containing a block hash, a '{ number: Int }' containing the
    block number, or a '{ number_gte: Int }' containing the minimum block
    number. In the case of 'number_gte', the query will be executed on the
    latest block only if the subgraph has progressed to or past the minimum
    block number. Defaults to the latest block when omitted.
    """
    block: Block_height

    """
    Set to 'allow' to receive data even if the subgraph has skipped over errors while syncing.
    """
    subgraphError: _SubgraphErrorPolicy_! = deny
  ): [Wallet!]!
  projectEvent(
    id: ID!

    """
    The block at which the query should be executed. Can either be a '{ hash:
    Bytes }' value containing a block hash, a '{ number: Int }' containing the
    block number, or a '{ number_gte: Int }' containing the minimum block
    number. In the case of 'number_gte', the query will be executed on the
    latest block only if the subgraph has progressed to or past the minimum
    block number. Defaults to the latest block when omitted.
    """
    block: Block_height

    """
    Set to 'allow' to receive data even if the subgraph has skipped over errors while syncing.
    """
    subgraphError: _SubgraphErrorPolicy_! = deny
  ): ProjectEvent
  projectEvents(
    skip: Int = 0
    first: Int = 100
    orderBy: ProjectEvent_orderBy
    orderDirection: OrderDirection
    where: ProjectEvent_filter

    """
    The block at which the query should be executed. Can either be a '{ hash:
    Bytes }' value containing a block hash, a '{ number: Int }' containing the
    block number, or a '{ number_gte: Int }' containing the minimum block
    number. In the case of 'number_gte', the query will be executed on the
    latest block only if the subgraph has progressed to or past the minimum
    block number. Defaults to the latest block when omitted.
    """
    block: Block_height

    """
    Set to 'allow' to receive data even if the subgraph has skipped over errors while syncing.
    """
    subgraphError: _SubgraphErrorPolicy_! = deny
  ): [ProjectEvent!]!
  payEvent(
    id: ID!

    """
    The block at which the query should be executed. Can either be a '{ hash:
    Bytes }' value containing a block hash, a '{ number: Int }' containing the
    block number, or a '{ number_gte: Int }' containing the minimum block
    number. In the case of 'number_gte', the query will be executed on the
    latest block only if the subgraph has progressed to or past the minimum
    block number. Defaults to the latest block when omitted.
    """
    block: Block_height

    """
    Set to 'allow' to receive data even if the subgraph has skipped over errors while syncing.
    """
    subgraphError: _SubgraphErrorPolicy_! = deny
  ): PayEvent
  payEvents(
    skip: Int = 0
    first: Int = 100
    orderBy: PayEvent_orderBy
    orderDirection: OrderDirection
    where: PayEvent_filter

    """
    The block at which the query should be executed. Can either be a '{ hash:
    Bytes }' value containing a block hash, a '{ number: Int }' containing the
    block number, or a '{ number_gte: Int }' containing the minimum block
    number. In the case of 'number_gte', the query will be executed on the
    latest block only if the subgraph has progressed to or past the minimum
    block number. Defaults to the latest block when omitted.
    """
    block: Block_height

    """
    Set to 'allow' to receive data even if the subgraph has skipped over errors while syncing.
    """
    subgraphError: _SubgraphErrorPolicy_! = deny
  ): [PayEvent!]!
  addToBalanceEvent(
    id: ID!

    """
    The block at which the query should be executed. Can either be a '{ hash:
    Bytes }' value containing a block hash, a '{ number: Int }' containing the
    block number, or a '{ number_gte: Int }' containing the minimum block
    number. In the case of 'number_gte', the query will be executed on the
    latest block only if the subgraph has progressed to or past the minimum
    block number. Defaults to the latest block when omitted.
    """
    block: Block_height

    """
    Set to 'allow' to receive data even if the subgraph has skipped over errors while syncing.
    """
    subgraphError: _SubgraphErrorPolicy_! = deny
  ): AddToBalanceEvent
  addToBalanceEvents(
    skip: Int = 0
    first: Int = 100
    orderBy: AddToBalanceEvent_orderBy
    orderDirection: OrderDirection
    where: AddToBalanceEvent_filter

    """
    The block at which the query should be executed. Can either be a '{ hash:
    Bytes }' value containing a block hash, a '{ number: Int }' containing the
    block number, or a '{ number_gte: Int }' containing the minimum block
    number. In the case of 'number_gte', the query will be executed on the
    latest block only if the subgraph has progressed to or past the minimum
    block number. Defaults to the latest block when omitted.
    """
    block: Block_height

    """
    Set to 'allow' to receive data even if the subgraph has skipped over errors while syncing.
    """
    subgraphError: _SubgraphErrorPolicy_! = deny
  ): [AddToBalanceEvent!]!
  mintTokensEvent(
    id: ID!

    """
    The block at which the query should be executed. Can either be a '{ hash:
    Bytes }' value containing a block hash, a '{ number: Int }' containing the
    block number, or a '{ number_gte: Int }' containing the minimum block
    number. In the case of 'number_gte', the query will be executed on the
    latest block only if the subgraph has progressed to or past the minimum
    block number. Defaults to the latest block when omitted.
    """
    block: Block_height

    """
    Set to 'allow' to receive data even if the subgraph has skipped over errors while syncing.
    """
    subgraphError: _SubgraphErrorPolicy_! = deny
  ): MintTokensEvent
  mintTokensEvents(
    skip: Int = 0
    first: Int = 100
    orderBy: MintTokensEvent_orderBy
    orderDirection: OrderDirection
    where: MintTokensEvent_filter

    """
    The block at which the query should be executed. Can either be a '{ hash:
    Bytes }' value containing a block hash, a '{ number: Int }' containing the
    block number, or a '{ number_gte: Int }' containing the minimum block
    number. In the case of 'number_gte', the query will be executed on the
    latest block only if the subgraph has progressed to or past the minimum
    block number. Defaults to the latest block when omitted.
    """
    block: Block_height

    """
    Set to 'allow' to receive data even if the subgraph has skipped over errors while syncing.
    """
    subgraphError: _SubgraphErrorPolicy_! = deny
  ): [MintTokensEvent!]!
  cashOutEvent(
    id: ID!

    """
    The block at which the query should be executed. Can either be a '{ hash:
    Bytes }' value containing a block hash, a '{ number: Int }' containing the
    block number, or a '{ number_gte: Int }' containing the minimum block
    number. In the case of 'number_gte', the query will be executed on the
    latest block only if the subgraph has progressed to or past the minimum
    block number. Defaults to the latest block when omitted.
    """
    block: Block_height

    """
    Set to 'allow' to receive data even if the subgraph has skipped over errors while syncing.
    """
    subgraphError: _SubgraphErrorPolicy_! = deny
  ): CashOutEvent
  cashOutEvents(
    skip: Int = 0
    first: Int = 100
    orderBy: CashOutEvent_orderBy
    orderDirection: OrderDirection
    where: CashOutEvent_filter

    """
    The block at which the query should be executed. Can either be a '{ hash:
    Bytes }' value containing a block hash, a '{ number: Int }' containing the
    block number, or a '{ number_gte: Int }' containing the minimum block
    number. In the case of 'number_gte', the query will be executed on the
    latest block only if the subgraph has progressed to or past the minimum
    block number. Defaults to the latest block when omitted.
    """
    block: Block_height

    """
    Set to 'allow' to receive data even if the subgraph has skipped over errors while syncing.
    """
    subgraphError: _SubgraphErrorPolicy_! = deny
  ): [CashOutEvent!]!
  deployedERC20Event(
    id: ID!

    """
    The block at which the query should be executed. Can either be a '{ hash:
    Bytes }' value containing a block hash, a '{ number: Int }' containing the
    block number, or a '{ number_gte: Int }' containing the minimum block
    number. In the case of 'number_gte', the query will be executed on the
    latest block only if the subgraph has progressed to or past the minimum
    block number. Defaults to the latest block when omitted.
    """
    block: Block_height

    """
    Set to 'allow' to receive data even if the subgraph has skipped over errors while syncing.
    """
    subgraphError: _SubgraphErrorPolicy_! = deny
  ): DeployedERC20Event
  deployedERC20Events(
    skip: Int = 0
    first: Int = 100
    orderBy: DeployedERC20Event_orderBy
    orderDirection: OrderDirection
    where: DeployedERC20Event_filter

    """
    The block at which the query should be executed. Can either be a '{ hash:
    Bytes }' value containing a block hash, a '{ number: Int }' containing the
    block number, or a '{ number_gte: Int }' containing the minimum block
    number. In the case of 'number_gte', the query will be executed on the
    latest block only if the subgraph has progressed to or past the minimum
    block number. Defaults to the latest block when omitted.
    """
    block: Block_height

    """
    Set to 'allow' to receive data even if the subgraph has skipped over errors while syncing.
    """
    subgraphError: _SubgraphErrorPolicy_! = deny
  ): [DeployedERC20Event!]!
  ensnode(
    id: ID!

    """
    The block at which the query should be executed. Can either be a '{ hash:
    Bytes }' value containing a block hash, a '{ number: Int }' containing the
    block number, or a '{ number_gte: Int }' containing the minimum block
    number. In the case of 'number_gte', the query will be executed on the
    latest block only if the subgraph has progressed to or past the minimum
    block number. Defaults to the latest block when omitted.
    """
    block: Block_height

    """
    Set to 'allow' to receive data even if the subgraph has skipped over errors while syncing.
    """
    subgraphError: _SubgraphErrorPolicy_! = deny
  ): ENSNode
  ensnodes(
    skip: Int = 0
    first: Int = 100
    orderBy: ENSNode_orderBy
    orderDirection: OrderDirection
    where: ENSNode_filter

    """
    The block at which the query should be executed. Can either be a '{ hash:
    Bytes }' value containing a block hash, a '{ number: Int }' containing the
    block number, or a '{ number_gte: Int }' containing the minimum block
    number. In the case of 'number_gte', the query will be executed on the
    latest block only if the subgraph has progressed to or past the minimum
    block number. Defaults to the latest block when omitted.
    """
    block: Block_height

    """
    Set to 'allow' to receive data even if the subgraph has skipped over errors while syncing.
    """
    subgraphError: _SubgraphErrorPolicy_! = deny
  ): [ENSNode!]!
  burnEvent(
    id: ID!

    """
    The block at which the query should be executed. Can either be a '{ hash:
    Bytes }' value containing a block hash, a '{ number: Int }' containing the
    block number, or a '{ number_gte: Int }' containing the minimum block
    number. In the case of 'number_gte', the query will be executed on the
    latest block only if the subgraph has progressed to or past the minimum
    block number. Defaults to the latest block when omitted.
    """
    block: Block_height

    """
    Set to 'allow' to receive data even if the subgraph has skipped over errors while syncing.
    """
    subgraphError: _SubgraphErrorPolicy_! = deny
  ): BurnEvent
  burnEvents(
    skip: Int = 0
    first: Int = 100
    orderBy: BurnEvent_orderBy
    orderDirection: OrderDirection
    where: BurnEvent_filter

    """
    The block at which the query should be executed. Can either be a '{ hash:
    Bytes }' value containing a block hash, a '{ number: Int }' containing the
    block number, or a '{ number_gte: Int }' containing the minimum block
    number. In the case of 'number_gte', the query will be executed on the
    latest block only if the subgraph has progressed to or past the minimum
    block number. Defaults to the latest block when omitted.
    """
    block: Block_height

    """
    Set to 'allow' to receive data even if the subgraph has skipped over errors while syncing.
    """
    subgraphError: _SubgraphErrorPolicy_! = deny
  ): [BurnEvent!]!
  nft(
    id: ID!

    """
    The block at which the query should be executed. Can either be a '{ hash:
    Bytes }' value containing a block hash, a '{ number: Int }' containing the
    block number, or a '{ number_gte: Int }' containing the minimum block
    number. In the case of 'number_gte', the query will be executed on the
    latest block only if the subgraph has progressed to or past the minimum
    block number. Defaults to the latest block when omitted.
    """
    block: Block_height

    """
    Set to 'allow' to receive data even if the subgraph has skipped over errors while syncing.
    """
    subgraphError: _SubgraphErrorPolicy_! = deny
  ): NFT
  nfts(
    skip: Int = 0
    first: Int = 100
    orderBy: NFT_orderBy
    orderDirection: OrderDirection
    where: NFT_filter

    """
    The block at which the query should be executed. Can either be a '{ hash:
    Bytes }' value containing a block hash, a '{ number: Int }' containing the
    block number, or a '{ number_gte: Int }' containing the minimum block
    number. In the case of 'number_gte', the query will be executed on the
    latest block only if the subgraph has progressed to or past the minimum
    block number. Defaults to the latest block when omitted.
    """
    block: Block_height

    """
    Set to 'allow' to receive data even if the subgraph has skipped over errors while syncing.
    """
    subgraphError: _SubgraphErrorPolicy_! = deny
  ): [NFT!]!
  nftcollection(
    id: ID!

    """
    The block at which the query should be executed. Can either be a '{ hash:
    Bytes }' value containing a block hash, a '{ number: Int }' containing the
    block number, or a '{ number_gte: Int }' containing the minimum block
    number. In the case of 'number_gte', the query will be executed on the
    latest block only if the subgraph has progressed to or past the minimum
    block number. Defaults to the latest block when omitted.
    """
    block: Block_height

    """
    Set to 'allow' to receive data even if the subgraph has skipped over errors while syncing.
    """
    subgraphError: _SubgraphErrorPolicy_! = deny
  ): NFTCollection
  nftcollections(
    skip: Int = 0
    first: Int = 100
    orderBy: NFTCollection_orderBy
    orderDirection: OrderDirection
    where: NFTCollection_filter

    """
    The block at which the query should be executed. Can either be a '{ hash:
    Bytes }' value containing a block hash, a '{ number: Int }' containing the
    block number, or a '{ number_gte: Int }' containing the minimum block
    number. In the case of 'number_gte', the query will be executed on the
    latest block only if the subgraph has progressed to or past the minimum
    block number. Defaults to the latest block when omitted.
    """
    block: Block_height

    """
    Set to 'allow' to receive data even if the subgraph has skipped over errors while syncing.
    """
    subgraphError: _SubgraphErrorPolicy_! = deny
  ): [NFTCollection!]!
  nfttier(
    id: ID!

    """
    The block at which the query should be executed. Can either be a '{ hash:
    Bytes }' value containing a block hash, a '{ number: Int }' containing the
    block number, or a '{ number_gte: Int }' containing the minimum block
    number. In the case of 'number_gte', the query will be executed on the
    latest block only if the subgraph has progressed to or past the minimum
    block number. Defaults to the latest block when omitted.
    """
    block: Block_height

    """
    Set to 'allow' to receive data even if the subgraph has skipped over errors while syncing.
    """
    subgraphError: _SubgraphErrorPolicy_! = deny
  ): NFTTier
  nfttiers(
    skip: Int = 0
    first: Int = 100
    orderBy: NFTTier_orderBy
    orderDirection: OrderDirection
    where: NFTTier_filter

    """
    The block at which the query should be executed. Can either be a '{ hash:
    Bytes }' value containing a block hash, a '{ number: Int }' containing the
    block number, or a '{ number_gte: Int }' containing the minimum block
    number. In the case of 'number_gte', the query will be executed on the
    latest block only if the subgraph has progressed to or past the minimum
    block number. Defaults to the latest block when omitted.
    """
    block: Block_height

    """
    Set to 'allow' to receive data even if the subgraph has skipped over errors while syncing.
    """
    subgraphError: _SubgraphErrorPolicy_! = deny
  ): [NFTTier!]!
  distributePayoutsEvent(
    id: ID!

    """
    The block at which the query should be executed. Can either be a '{ hash:
    Bytes }' value containing a block hash, a '{ number: Int }' containing the
    block number, or a '{ number_gte: Int }' containing the minimum block
    number. In the case of 'number_gte', the query will be executed on the
    latest block only if the subgraph has progressed to or past the minimum
    block number. Defaults to the latest block when omitted.
    """
    block: Block_height

    """
    Set to 'allow' to receive data even if the subgraph has skipped over errors while syncing.
    """
    subgraphError: _SubgraphErrorPolicy_! = deny
  ): DistributePayoutsEvent
  distributePayoutsEvents(
    skip: Int = 0
    first: Int = 100
    orderBy: DistributePayoutsEvent_orderBy
    orderDirection: OrderDirection
    where: DistributePayoutsEvent_filter

    """
    The block at which the query should be executed. Can either be a '{ hash:
    Bytes }' value containing a block hash, a '{ number: Int }' containing the
    block number, or a '{ number_gte: Int }' containing the minimum block
    number. In the case of 'number_gte', the query will be executed on the
    latest block only if the subgraph has progressed to or past the minimum
    block number. Defaults to the latest block when omitted.
    """
    block: Block_height

    """
    Set to 'allow' to receive data even if the subgraph has skipped over errors while syncing.
    """
    subgraphError: _SubgraphErrorPolicy_! = deny
  ): [DistributePayoutsEvent!]!
  distributeToPayoutSplitEvent(
    id: ID!

    """
    The block at which the query should be executed. Can either be a '{ hash:
    Bytes }' value containing a block hash, a '{ number: Int }' containing the
    block number, or a '{ number_gte: Int }' containing the minimum block
    number. In the case of 'number_gte', the query will be executed on the
    latest block only if the subgraph has progressed to or past the minimum
    block number. Defaults to the latest block when omitted.
    """
    block: Block_height

    """
    Set to 'allow' to receive data even if the subgraph has skipped over errors while syncing.
    """
    subgraphError: _SubgraphErrorPolicy_! = deny
  ): DistributeToPayoutSplitEvent
  distributeToPayoutSplitEvents(
    skip: Int = 0
    first: Int = 100
    orderBy: DistributeToPayoutSplitEvent_orderBy
    orderDirection: OrderDirection
    where: DistributeToPayoutSplitEvent_filter

    """
    The block at which the query should be executed. Can either be a '{ hash:
    Bytes }' value containing a block hash, a '{ number: Int }' containing the
    block number, or a '{ number_gte: Int }' containing the minimum block
    number. In the case of 'number_gte', the query will be executed on the
    latest block only if the subgraph has progressed to or past the minimum
    block number. Defaults to the latest block when omitted.
    """
    block: Block_height

    """
    Set to 'allow' to receive data even if the subgraph has skipped over errors while syncing.
    """
    subgraphError: _SubgraphErrorPolicy_! = deny
  ): [DistributeToPayoutSplitEvent!]!
  distributeReservedTokensEvent(
    id: ID!

    """
    The block at which the query should be executed. Can either be a '{ hash:
    Bytes }' value containing a block hash, a '{ number: Int }' containing the
    block number, or a '{ number_gte: Int }' containing the minimum block
    number. In the case of 'number_gte', the query will be executed on the
    latest block only if the subgraph has progressed to or past the minimum
    block number. Defaults to the latest block when omitted.
    """
    block: Block_height

    """
    Set to 'allow' to receive data even if the subgraph has skipped over errors while syncing.
    """
    subgraphError: _SubgraphErrorPolicy_! = deny
  ): DistributeReservedTokensEvent
  distributeReservedTokensEvents(
    skip: Int = 0
    first: Int = 100
    orderBy: DistributeReservedTokensEvent_orderBy
    orderDirection: OrderDirection
    where: DistributeReservedTokensEvent_filter

    """
    The block at which the query should be executed. Can either be a '{ hash:
    Bytes }' value containing a block hash, a '{ number: Int }' containing the
    block number, or a '{ number_gte: Int }' containing the minimum block
    number. In the case of 'number_gte', the query will be executed on the
    latest block only if the subgraph has progressed to or past the minimum
    block number. Defaults to the latest block when omitted.
    """
    block: Block_height

    """
    Set to 'allow' to receive data even if the subgraph has skipped over errors while syncing.
    """
    subgraphError: _SubgraphErrorPolicy_! = deny
  ): [DistributeReservedTokensEvent!]!
  distributeToReservedTokenSplitEvent(
    id: ID!

    """
    The block at which the query should be executed. Can either be a '{ hash:
    Bytes }' value containing a block hash, a '{ number: Int }' containing the
    block number, or a '{ number_gte: Int }' containing the minimum block
    number. In the case of 'number_gte', the query will be executed on the
    latest block only if the subgraph has progressed to or past the minimum
    block number. Defaults to the latest block when omitted.
    """
    block: Block_height

    """
    Set to 'allow' to receive data even if the subgraph has skipped over errors while syncing.
    """
    subgraphError: _SubgraphErrorPolicy_! = deny
  ): DistributeToReservedTokenSplitEvent
  distributeToReservedTokenSplitEvents(
    skip: Int = 0
    first: Int = 100
    orderBy: DistributeToReservedTokenSplitEvent_orderBy
    orderDirection: OrderDirection
    where: DistributeToReservedTokenSplitEvent_filter

    """
    The block at which the query should be executed. Can either be a '{ hash:
    Bytes }' value containing a block hash, a '{ number: Int }' containing the
    block number, or a '{ number_gte: Int }' containing the minimum block
    number. In the case of 'number_gte', the query will be executed on the
    latest block only if the subgraph has progressed to or past the minimum
    block number. Defaults to the latest block when omitted.
    """
    block: Block_height

    """
    Set to 'allow' to receive data even if the subgraph has skipped over errors while syncing.
    """
    subgraphError: _SubgraphErrorPolicy_! = deny
  ): [DistributeToReservedTokenSplitEvent!]!
  useAllowanceEvent(
    id: ID!

    """
    The block at which the query should be executed. Can either be a '{ hash:
    Bytes }' value containing a block hash, a '{ number: Int }' containing the
    block number, or a '{ number_gte: Int }' containing the minimum block
    number. In the case of 'number_gte', the query will be executed on the
    latest block only if the subgraph has progressed to or past the minimum
    block number. Defaults to the latest block when omitted.
    """
    block: Block_height

    """
    Set to 'allow' to receive data even if the subgraph has skipped over errors while syncing.
    """
    subgraphError: _SubgraphErrorPolicy_! = deny
  ): UseAllowanceEvent
  useAllowanceEvents(
    skip: Int = 0
    first: Int = 100
    orderBy: UseAllowanceEvent_orderBy
    orderDirection: OrderDirection
    where: UseAllowanceEvent_filter

    """
    The block at which the query should be executed. Can either be a '{ hash:
    Bytes }' value containing a block hash, a '{ number: Int }' containing the
    block number, or a '{ number_gte: Int }' containing the minimum block
    number. In the case of 'number_gte', the query will be executed on the
    latest block only if the subgraph has progressed to or past the minimum
    block number. Defaults to the latest block when omitted.
    """
    block: Block_height

    """
    Set to 'allow' to receive data even if the subgraph has skipped over errors while syncing.
    """
    subgraphError: _SubgraphErrorPolicy_! = deny
  ): [UseAllowanceEvent!]!
  permissionsHolder(
    id: ID!

    """
    The block at which the query should be executed. Can either be a '{ hash:
    Bytes }' value containing a block hash, a '{ number: Int }' containing the
    block number, or a '{ number_gte: Int }' containing the minimum block
    number. In the case of 'number_gte', the query will be executed on the
    latest block only if the subgraph has progressed to or past the minimum
    block number. Defaults to the latest block when omitted.
    """
    block: Block_height

    """
    Set to 'allow' to receive data even if the subgraph has skipped over errors while syncing.
    """
    subgraphError: _SubgraphErrorPolicy_! = deny
  ): PermissionsHolder
  permissionsHolders(
    skip: Int = 0
    first: Int = 100
    orderBy: PermissionsHolder_orderBy
    orderDirection: OrderDirection
    where: PermissionsHolder_filter

    """
    The block at which the query should be executed. Can either be a '{ hash:
    Bytes }' value containing a block hash, a '{ number: Int }' containing the
    block number, or a '{ number_gte: Int }' containing the minimum block
    number. In the case of 'number_gte', the query will be executed on the
    latest block only if the subgraph has progressed to or past the minimum
    block number. Defaults to the latest block when omitted.
    """
    block: Block_height

    """
    Set to 'allow' to receive data even if the subgraph has skipped over errors while syncing.
    """
    subgraphError: _SubgraphErrorPolicy_! = deny
  ): [PermissionsHolder!]!
  storeAutoIssuanceAmountEvent(
    id: ID!

    """
    The block at which the query should be executed. Can either be a '{ hash:
    Bytes }' value containing a block hash, a '{ number: Int }' containing the
    block number, or a '{ number_gte: Int }' containing the minimum block
    number. In the case of 'number_gte', the query will be executed on the
    latest block only if the subgraph has progressed to or past the minimum
    block number. Defaults to the latest block when omitted.
    """
    block: Block_height

    """
    Set to 'allow' to receive data even if the subgraph has skipped over errors while syncing.
    """
    subgraphError: _SubgraphErrorPolicy_! = deny
  ): StoreAutoIssuanceAmountEvent
  storeAutoIssuanceAmountEvents(
    skip: Int = 0
    first: Int = 100
    orderBy: StoreAutoIssuanceAmountEvent_orderBy
    orderDirection: OrderDirection
    where: StoreAutoIssuanceAmountEvent_filter

    """
    The block at which the query should be executed. Can either be a '{ hash:
    Bytes }' value containing a block hash, a '{ number: Int }' containing the
    block number, or a '{ number_gte: Int }' containing the minimum block
    number. In the case of 'number_gte', the query will be executed on the
    latest block only if the subgraph has progressed to or past the minimum
    block number. Defaults to the latest block when omitted.
    """
    block: Block_height

    """
    Set to 'allow' to receive data even if the subgraph has skipped over errors while syncing.
    """
    subgraphError: _SubgraphErrorPolicy_! = deny
  ): [StoreAutoIssuanceAmountEvent!]!
  autoIssueEvent(
    id: ID!

    """
    The block at which the query should be executed. Can either be a '{ hash:
    Bytes }' value containing a block hash, a '{ number: Int }' containing the
    block number, or a '{ number_gte: Int }' containing the minimum block
    number. In the case of 'number_gte', the query will be executed on the
    latest block only if the subgraph has progressed to or past the minimum
    block number. Defaults to the latest block when omitted.
    """
    block: Block_height

    """
    Set to 'allow' to receive data even if the subgraph has skipped over errors while syncing.
    """
    subgraphError: _SubgraphErrorPolicy_! = deny
  ): AutoIssueEvent
  autoIssueEvents(
    skip: Int = 0
    first: Int = 100
    orderBy: AutoIssueEvent_orderBy
    orderDirection: OrderDirection
    where: AutoIssueEvent_filter

    """
    The block at which the query should be executed. Can either be a '{ hash:
    Bytes }' value containing a block hash, a '{ number: Int }' containing the
    block number, or a '{ number_gte: Int }' containing the minimum block
    number. In the case of 'number_gte', the query will be executed on the
    latest block only if the subgraph has progressed to or past the minimum
    block number. Defaults to the latest block when omitted.
    """
    block: Block_height

    """
    Set to 'allow' to receive data even if the subgraph has skipped over errors while syncing.
    """
    subgraphError: _SubgraphErrorPolicy_! = deny
  ): [AutoIssueEvent!]!
  decorateBannyEvent(
    id: ID!

    """
    The block at which the query should be executed. Can either be a '{ hash:
    Bytes }' value containing a block hash, a '{ number: Int }' containing the
    block number, or a '{ number_gte: Int }' containing the minimum block
    number. In the case of 'number_gte', the query will be executed on the
    latest block only if the subgraph has progressed to or past the minimum
    block number. Defaults to the latest block when omitted.
    """
    block: Block_height

    """
    Set to 'allow' to receive data even if the subgraph has skipped over errors while syncing.
    """
    subgraphError: _SubgraphErrorPolicy_! = deny
  ): DecorateBannyEvent
  decorateBannyEvents(
    skip: Int = 0
    first: Int = 100
    orderBy: DecorateBannyEvent_orderBy
    orderDirection: OrderDirection
    where: DecorateBannyEvent_filter

    """
    The block at which the query should be executed. Can either be a '{ hash:
    Bytes }' value containing a block hash, a '{ number: Int }' containing the
    block number, or a '{ number_gte: Int }' containing the minimum block
    number. In the case of 'number_gte', the query will be executed on the
    latest block only if the subgraph has progressed to or past the minimum
    block number. Defaults to the latest block when omitted.
    """
    block: Block_height

    """
    Set to 'allow' to receive data even if the subgraph has skipped over errors while syncing.
    """
    subgraphError: _SubgraphErrorPolicy_! = deny
  ): [DecorateBannyEvent!]!

  """Access to subgraph metadata"""
  _meta(block: Block_height): _Meta_
}

"""
A string representation of microseconds UNIX timestamp (16 digits)

"""
scalar Timestamp

type UseAllowanceEvent {
  chain: Int!
  id: ID!
  project: Project!
  projectId: Int!
  timestamp: Int!
  txHash: Bytes!
  from: Bytes!
  caller: Bytes!
  rulesetId: BigInt!
  rulesetCycleNumber: Int!
  beneficiary: Bytes!
  amount: BigInt!
  amountUSD: BigInt
  distributedAmount: BigInt!
  distributedAmountUSD: BigInt
  netDistributedamount: BigInt!
  netDistributedamountUSD: BigInt
  memo: String!
}

input UseAllowanceEvent_filter {
  chain: Int
  chain_in: [Int]
  id: ID
  id_not: ID
  id_gt: ID
  id_lt: ID
  id_gte: ID
  id_lte: ID
  id_in: [ID!]
  id_not_in: [ID!]
  project: String
  project_not: String
  project_gt: String
  project_lt: String
  project_gte: String
  project_lte: String
  project_in: [String!]
  project_not_in: [String!]
  project_contains: String
  project_contains_nocase: String
  project_not_contains: String
  project_not_contains_nocase: String
  project_starts_with: String
  project_starts_with_nocase: String
  project_not_starts_with: String
  project_not_starts_with_nocase: String
  project_ends_with: String
  project_ends_with_nocase: String
  project_not_ends_with: String
  project_not_ends_with_nocase: String
  project_: Project_filter
  projectId: Int
  projectId_not: Int
  projectId_gt: Int
  projectId_lt: Int
  projectId_gte: Int
  projectId_lte: Int
  projectId_in: [Int!]
  projectId_not_in: [Int!]
  timestamp: Int
  timestamp_not: Int
  timestamp_gt: Int
  timestamp_lt: Int
  timestamp_gte: Int
  timestamp_lte: Int
  timestamp_in: [Int!]
  timestamp_not_in: [Int!]
  txHash: Bytes
  txHash_not: Bytes
  txHash_gt: Bytes
  txHash_lt: Bytes
  txHash_gte: Bytes
  txHash_lte: Bytes
  txHash_in: [Bytes!]
  txHash_not_in: [Bytes!]
  txHash_contains: Bytes
  txHash_not_contains: Bytes
  from: Bytes
  from_not: Bytes
  from_gt: Bytes
  from_lt: Bytes
  from_gte: Bytes
  from_lte: Bytes
  from_in: [Bytes!]
  from_not_in: [Bytes!]
  from_contains: Bytes
  from_not_contains: Bytes
  caller: Bytes
  caller_not: Bytes
  caller_gt: Bytes
  caller_lt: Bytes
  caller_gte: Bytes
  caller_lte: Bytes
  caller_in: [Bytes!]
  caller_not_in: [Bytes!]
  caller_contains: Bytes
  caller_not_contains: Bytes
  rulesetId: BigInt
  rulesetId_not: BigInt
  rulesetId_gt: BigInt
  rulesetId_lt: BigInt
  rulesetId_gte: BigInt
  rulesetId_lte: BigInt
  rulesetId_in: [BigInt!]
  rulesetId_not_in: [BigInt!]
  rulesetCycleNumber: Int
  rulesetCycleNumber_not: Int
  rulesetCycleNumber_gt: Int
  rulesetCycleNumber_lt: Int
  rulesetCycleNumber_gte: Int
  rulesetCycleNumber_lte: Int
  rulesetCycleNumber_in: [Int!]
  rulesetCycleNumber_not_in: [Int!]
  beneficiary: Bytes
  beneficiary_not: Bytes
  beneficiary_gt: Bytes
  beneficiary_lt: Bytes
  beneficiary_gte: Bytes
  beneficiary_lte: Bytes
  beneficiary_in: [Bytes!]
  beneficiary_not_in: [Bytes!]
  beneficiary_contains: Bytes
  beneficiary_not_contains: Bytes
  amount: BigInt
  amount_not: BigInt
  amount_gt: BigInt
  amount_lt: BigInt
  amount_gte: BigInt
  amount_lte: BigInt
  amount_in: [BigInt!]
  amount_not_in: [BigInt!]
  amountUSD: BigInt
  amountUSD_not: BigInt
  amountUSD_gt: BigInt
  amountUSD_lt: BigInt
  amountUSD_gte: BigInt
  amountUSD_lte: BigInt
  amountUSD_in: [BigInt!]
  amountUSD_not_in: [BigInt!]
  distributedAmount: BigInt
  distributedAmount_not: BigInt
  distributedAmount_gt: BigInt
  distributedAmount_lt: BigInt
  distributedAmount_gte: BigInt
  distributedAmount_lte: BigInt
  distributedAmount_in: [BigInt!]
  distributedAmount_not_in: [BigInt!]
  distributedAmountUSD: BigInt
  distributedAmountUSD_not: BigInt
  distributedAmountUSD_gt: BigInt
  distributedAmountUSD_lt: BigInt
  distributedAmountUSD_gte: BigInt
  distributedAmountUSD_lte: BigInt
  distributedAmountUSD_in: [BigInt!]
  distributedAmountUSD_not_in: [BigInt!]
  netDistributedamount: BigInt
  netDistributedamount_not: BigInt
  netDistributedamount_gt: BigInt
  netDistributedamount_lt: BigInt
  netDistributedamount_gte: BigInt
  netDistributedamount_lte: BigInt
  netDistributedamount_in: [BigInt!]
  netDistributedamount_not_in: [BigInt!]
  netDistributedamountUSD: BigInt
  netDistributedamountUSD_not: BigInt
  netDistributedamountUSD_gt: BigInt
  netDistributedamountUSD_lt: BigInt
  netDistributedamountUSD_gte: BigInt
  netDistributedamountUSD_lte: BigInt
  netDistributedamountUSD_in: [BigInt!]
  netDistributedamountUSD_not_in: [BigInt!]
  memo: String
  memo_not: String
  memo_gt: String
  memo_lt: String
  memo_gte: String
  memo_lte: String
  memo_in: [String!]
  memo_not_in: [String!]
  memo_contains: String
  memo_contains_nocase: String
  memo_not_contains: String
  memo_not_contains_nocase: String
  memo_starts_with: String
  memo_starts_with_nocase: String
  memo_not_starts_with: String
  memo_not_starts_with_nocase: String
  memo_ends_with: String
  memo_ends_with_nocase: String
  memo_not_ends_with: String
  memo_not_ends_with_nocase: String

  """Filter for the block changed event."""
  _change_block: BlockChangedFilter
  and: [UseAllowanceEvent_filter]
  or: [UseAllowanceEvent_filter]
}

enum UseAllowanceEvent_orderBy {
  id
  project
  project__id
  project__projectId
  project__handle
  project__deployer
  project__metadataUri
  project__owner
  project__creator
  project__createdAt
  project__paymentsCount
  project__contributorsCount
  project__redeemCount
  project__volume
  project__volumeUSD
  project__redeemVolume
  project__redeemVolumeUSD
  project__currentBalance
  project__tokenSupply
  project__trendingScore
  project__trendingVolume
  project__trendingPaymentsCount
  project__createdWithinTrendingWindow
  project__nftsMintedCount
  projectId
  timestamp
  txHash
  from
  caller
  rulesetId
  rulesetCycleNumber
  beneficiary
  amount
  amountUSD
  distributedAmount
  distributedAmountUSD
  netDistributedamount
  netDistributedamountUSD
  memo
}

type Wallet {
  chain: Int!
  id: ID!
  volume: BigInt!
  volumeUSD: BigInt!
  lastPaidTimestamp: Int!
  participants(skip: Int = 0, first: Int = 100, orderBy: Participant_orderBy, orderDirection: OrderDirection, where: Participant_filter): [Participant!]!
}

input Wallet_filter {
  chain: Int
  chain_in: [Int]
  id: ID
  id_not: ID
  id_gt: ID
  id_lt: ID
  id_gte: ID
  id_lte: ID
  id_in: [ID!]
  id_not_in: [ID!]
  volume: BigInt
  volume_not: BigInt
  volume_gt: BigInt
  volume_lt: BigInt
  volume_gte: BigInt
  volume_lte: BigInt
  volume_in: [BigInt!]
  volume_not_in: [BigInt!]
  volumeUSD: BigInt
  volumeUSD_not: BigInt
  volumeUSD_gt: BigInt
  volumeUSD_lt: BigInt
  volumeUSD_gte: BigInt
  volumeUSD_lte: BigInt
  volumeUSD_in: [BigInt!]
  volumeUSD_not_in: [BigInt!]
  lastPaidTimestamp: Int
  lastPaidTimestamp_not: Int
  lastPaidTimestamp_gt: Int
  lastPaidTimestamp_lt: Int
  lastPaidTimestamp_gte: Int
  lastPaidTimestamp_lte: Int
  lastPaidTimestamp_in: [Int!]
  lastPaidTimestamp_not_in: [Int!]
  participants_: Participant_filter

  """Filter for the block changed event."""
  _change_block: BlockChangedFilter
  and: [Wallet_filter]
  or: [Wallet_filter]
}

enum Wallet_orderBy {
  id
  volume
  volumeUSD
  lastPaidTimestamp
  participants
}

`;

export default typeDefs;
