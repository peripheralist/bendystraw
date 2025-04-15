export const JBSuckersRegistryAbi = [
  {
    inputs: [
      {
        internalType: "contract IJBDirectory",
        name: "directory",
        type: "address",
      },
      {
        internalType: "contract IJBPermissions",
        name: "permissions",
        type: "address",
      },
      {
        internalType: "address",
        name: "initialOwner",
        type: "address",
      },
      {
        internalType: "address",
        name: "trusted_forwarder",
        type: "address",
      },
    ],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    inputs: [],
    name: "DIRECTORY",
    outputs: [
      {
        internalType: "contract IJBDirectory",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "PERMISSIONS",
    outputs: [
      {
        internalType: "contract IJBPermissions",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "PROJECTS",
    outputs: [
      {
        internalType: "contract IJBProjects",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "deployer",
        type: "address",
      },
    ],
    name: "allowSuckerDeployer",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address[]",
        name: "deployers",
        type: "address[]",
      },
    ],
    name: "allowSuckerDeployers",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "projectId",
        type: "uint256",
      },
      {
        internalType: "bytes32",
        name: "salt",
        type: "bytes32",
      },
      {
        components: [
          {
            internalType: "contract IJBSuckerDeployer",
            name: "deployer",
            type: "address",
          },
          {
            components: [
              {
                internalType: "address",
                name: "localToken",
                type: "address",
              },
              {
                internalType: "uint32",
                name: "minGas",
                type: "uint32",
              },
              {
                internalType: "address",
                name: "remoteToken",
                type: "address",
              },
              {
                internalType: "uint256",
                name: "minBridgeAmount",
                type: "uint256",
              },
            ],
            internalType: "struct JBTokenMapping[]",
            name: "mappings",
            type: "tuple[]",
          },
        ],
        internalType: "struct JBSuckerDeployerConfig[]",
        name: "configurations",
        type: "tuple[]",
      },
    ],
    name: "deploySuckersFor",
    outputs: [
      {
        internalType: "address[]",
        name: "suckers",
        type: "address[]",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "projectId",
        type: "uint256",
      },
      {
        internalType: "address",
        name: "addr",
        type: "address",
      },
    ],
    name: "isSuckerOf",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "forwarder",
        type: "address",
      },
    ],
    name: "isTrustedForwarder",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "owner",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "projectId",
        type: "uint256",
      },
      {
        internalType: "address",
        name: "sucker",
        type: "address",
      },
    ],
    name: "removeDeprecatedSucker",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "deployer",
        type: "address",
      },
    ],
    name: "removeSuckerDeployer",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "renounceOwnership",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "deployer",
        type: "address",
      },
    ],
    name: "suckerDeployerIsAllowed",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "projectId",
        type: "uint256",
      },
    ],
    name: "suckerPairsOf",
    outputs: [
      {
        components: [
          {
            internalType: "address",
            name: "local",
            type: "address",
          },
          {
            internalType: "address",
            name: "remote",
            type: "address",
          },
          {
            internalType: "uint256",
            name: "remoteChainId",
            type: "uint256",
          },
        ],
        internalType: "struct JBSuckersPair[]",
        name: "pairs",
        type: "tuple[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "projectId",
        type: "uint256",
      },
    ],
    name: "suckersOf",
    outputs: [
      {
        internalType: "address[]",
        name: "",
        type: "address[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "newOwner",
        type: "address",
      },
    ],
    name: "transferOwnership",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "trustedForwarder",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "previousOwner",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "newOwner",
        type: "address",
      },
    ],
    name: "OwnershipTransferred",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "uint256",
        name: "projectId",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "address",
        name: "sucker",
        type: "address",
      },
      {
        components: [
          {
            internalType: "contract IJBSuckerDeployer",
            name: "deployer",
            type: "address",
          },
          {
            components: [
              {
                internalType: "address",
                name: "localToken",
                type: "address",
              },
              {
                internalType: "uint32",
                name: "minGas",
                type: "uint32",
              },
              {
                internalType: "address",
                name: "remoteToken",
                type: "address",
              },
              {
                internalType: "uint256",
                name: "minBridgeAmount",
                type: "uint256",
              },
            ],
            internalType: "struct JBTokenMapping[]",
            name: "mappings",
            type: "tuple[]",
          },
        ],
        indexed: false,
        internalType: "struct JBSuckerDeployerConfig",
        name: "configuration",
        type: "tuple",
      },
      {
        indexed: false,
        internalType: "address",
        name: "caller",
        type: "address",
      },
    ],
    name: "SuckerDeployedFor",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "address",
        name: "deployer",
        type: "address",
      },
      {
        indexed: false,
        internalType: "address",
        name: "caller",
        type: "address",
      },
    ],
    name: "SuckerDeployerAllowed",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "address",
        name: "deployer",
        type: "address",
      },
      {
        indexed: false,
        internalType: "address",
        name: "caller",
        type: "address",
      },
    ],
    name: "SuckerDeployerRemoved",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "uint256",
        name: "projectId",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "address",
        name: "sucker",
        type: "address",
      },
      {
        indexed: false,
        internalType: "address",
        name: "caller",
        type: "address",
      },
    ],
    name: "SuckerDeprecated",
    type: "event",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "account",
        type: "address",
      },
      {
        internalType: "address",
        name: "sender",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "projectId",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "permissionId",
        type: "uint256",
      },
    ],
    name: "JBPermissioned_Unauthorized",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "contract IJBSuckerDeployer",
        name: "deployer",
        type: "address",
      },
    ],
    name: "JBSuckerRegistry_InvalidDeployer",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "projectId",
        type: "uint256",
      },
    ],
    name: "JBSuckerRegistry_RulesetDoesNotAllowAddingSucker",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "projectId",
        type: "uint256",
      },
      {
        internalType: "address",
        name: "sucker",
        type: "address",
      },
    ],
    name: "JBSuckerRegistry_SuckerDoesNotBelongToProject",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "sucker",
        type: "address",
      },
      {
        internalType: "enum JBSuckerState",
        name: "suckerState",
        type: "uint8",
      },
    ],
    name: "JBSuckerRegistry_SuckerIsNotDeprecated",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "owner",
        type: "address",
      },
    ],
    name: "OwnableInvalidOwner",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "account",
        type: "address",
      },
    ],
    name: "OwnableUnauthorizedAccount",
    type: "error",
  },
] as const;
