// Position and settings events emitted by StickyHook (mejango/sticky src/interfaces/IStickyHook.sol).
// SetToken is left out because nothing reads it.
export const StickyHookAbi = [
  {
    type: "event",
    name: "Staked",
    inputs: [
      { name: "projectId", type: "uint256", indexed: true },
      { name: "holder", type: "address", indexed: true },
      { name: "payer", type: "address", indexed: false },
      { name: "count", type: "uint256", indexed: false },
      { name: "stakedBalance", type: "uint256", indexed: false },
      { name: "caller", type: "address", indexed: false },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "Unstaked",
    inputs: [
      { name: "projectId", type: "uint256", indexed: true },
      { name: "holder", type: "address", indexed: true },
      { name: "count", type: "uint256", indexed: false },
      { name: "stakedBalance", type: "uint256", indexed: false },
      { name: "caller", type: "address", indexed: false },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "StreakStarted",
    inputs: [
      { name: "projectId", type: "uint256", indexed: true },
      { name: "holder", type: "address", indexed: true },
      { name: "caller", type: "address", indexed: false },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "StreakEnded",
    inputs: [
      { name: "projectId", type: "uint256", indexed: true },
      { name: "holder", type: "address", indexed: true },
      { name: "duration", type: "uint256", indexed: false },
      { name: "caller", type: "address", indexed: false },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "SetGranter",
    inputs: [
      { name: "projectId", type: "uint256", indexed: true },
      { name: "granter", type: "address", indexed: true },
      { name: "caller", type: "address", indexed: false },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "SetTrustedSender",
    inputs: [
      { name: "projectId", type: "uint256", indexed: true },
      { name: "holder", type: "address", indexed: true },
      { name: "sender", type: "address", indexed: true },
      { name: "trusted", type: "bool", indexed: false },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "ExcludeOrphanedBalance",
    inputs: [
      { name: "projectId", type: "uint256", indexed: true },
      { name: "amount", type: "uint256", indexed: false },
      { name: "caller", type: "address", indexed: false },
    ],
    anonymous: false,
  },
] as const;
