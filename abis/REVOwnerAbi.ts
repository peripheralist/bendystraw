// Events emitted by the V6 REVOwner contract (revnet-core-v6 IREVOwner.sol). In V6 the REVDeployer mints
// a revnet's project then hands ownership to REVOwner, which thereafter manages the revnet — so events
// like AutoIssue that lived on the REVDeployer in V4/V5 are emitted by REVOwner in V6.
export const REVOwnerAbi = [
  {
    type: "event",
    name: "AutoIssue",
    inputs: [
      { name: "revnetId", type: "uint256", indexed: true },
      { name: "stageId", type: "uint256", indexed: true },
      { name: "beneficiary", type: "address", indexed: true },
      { name: "count", type: "uint256", indexed: false },
      { name: "caller", type: "address", indexed: false },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "BurnHeldTokens",
    inputs: [
      { name: "revnetId", type: "uint256", indexed: true },
      { name: "count", type: "uint256", indexed: false },
      { name: "caller", type: "address", indexed: false },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "InitializeRevnet",
    inputs: [
      { name: "revnetId", type: "uint256", indexed: true },
      { name: "caller", type: "address", indexed: false },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "ReplaceOperator",
    inputs: [
      { name: "revnetId", type: "uint256", indexed: true },
      { name: "newOperator", type: "address", indexed: true },
      { name: "caller", type: "address", indexed: false },
    ],
    anonymous: false,
  },
] as const;
