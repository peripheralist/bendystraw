export const JBProjectPayerDeployerAbi = [
  {
    type: "event",
    name: "DeployProjectPayer",
    inputs: [
      {
        indexed: true,
        internalType: "contract IJBProjectPayer",
        name: "projectPayer",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "defaultProjectId",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "address",
        name: "defaultBeneficiary",
        type: "address",
      },
      {
        indexed: false,
        internalType: "string",
        name: "defaultMemo",
        type: "string",
      },
      {
        indexed: false,
        internalType: "bytes",
        name: "defaultMetadata",
        type: "bytes",
      },
      {
        indexed: false,
        internalType: "bool",
        name: "defaultAddToBalance",
        type: "bool",
      },
      {
        indexed: false,
        internalType: "contract IJBDirectory",
        name: "directory",
        type: "address",
      },
      {
        indexed: false,
        internalType: "address",
        name: "owner",
        type: "address",
      },
      {
        indexed: false,
        internalType: "address",
        name: "caller",
        type: "address",
      },
    ],
    anonymous: false,
  },
] as const;
