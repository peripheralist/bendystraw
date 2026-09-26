// Events emitted by HomerunDeployer (mejango/homerun src/HomerunDeployer.sol). It launches a FUND, hands
// the project to its owner in the same transaction, and later launches the FUND's INCOME revnet, which
// the REVOwner owns. The project owner therefore never shows a Homerun project; these events do.
export const HomerunDeployerAbi = [
  {
    type: "event",
    name: "FundLaunched",
    inputs: [
      { name: "projectId", type: "uint256", indexed: true },
      { name: "owner", type: "address", indexed: true },
      { name: "caller", type: "address", indexed: false },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "IncomeDeployed",
    inputs: [
      { name: "fundProjectId", type: "uint256", indexed: true },
      { name: "incomeProjectId", type: "uint256", indexed: true },
      { name: "owner", type: "address", indexed: true },
    ],
    anonymous: false,
  },
] as const;
