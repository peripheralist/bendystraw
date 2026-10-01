// Funding events emitted by StickyDistributor (mejango/sticky src/interfaces/IStickyDistributor.sol).
// `hook` is the Sticky token whose holders share the rewards.
export const StickyDistributorAbi = [
  {
    type: "event",
    name: "Fund",
    inputs: [
      { name: "hook", type: "address", indexed: true },
      { name: "groupId", type: "uint256", indexed: true },
      { name: "token", type: "address", indexed: true },
      { name: "round", type: "uint256", indexed: false },
      { name: "amount", type: "uint256", indexed: false },
      { name: "caller", type: "address", indexed: false },
    ],
    anonymous: false,
  },
] as const;
