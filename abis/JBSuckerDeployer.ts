export const JBSuckerDeployerAbi = [
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
        internalType: "contract IJBTokens",
        name: "tokens",
        type: "address",
      },
      {
        internalType: "address",
        name: "configurator",
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
    name: "LAYER_SPECIFIC_CONFIGURATOR",
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
    name: "TOKENS",
    outputs: [
      {
        internalType: "contract IJBTokens",
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
        internalType: "contract JBSucker",
        name: "_singleton",
        type: "address",
      },
    ],
    name: "configureSingleton",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "localProjectId",
        type: "uint256",
      },
      {
        internalType: "bytes32",
        name: "salt",
        type: "bytes32",
      },
    ],
    name: "createForSender",
    outputs: [
      {
        internalType: "contract IJBSucker",
        name: "sucker",
        type: "address",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    name: "isSucker",
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
    name: "opBridge",
    outputs: [
      {
        internalType: "contract IOPStandardBridge",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "opMessenger",
    outputs: [
      {
        internalType: "contract IOPMessenger",
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
        internalType: "contract IOPMessenger",
        name: "messenger",
        type: "address",
      },
      {
        internalType: "contract IOPStandardBridge",
        name: "bridge",
        type: "address",
      },
    ],
    name: "setChainSpecificConstants",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "singleton",
    outputs: [
      {
        internalType: "contract JBSucker",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
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
    inputs: [],
    name: "JBSuckerDeployer_AlreadyConfigured",
    type: "error",
  },
  {
    inputs: [],
    name: "JBSuckerDeployer_DeployerIsNotConfigured",
    type: "error",
  },
  {
    inputs: [],
    name: "JBSuckerDeployer_InvalidLayerSpecificConfiguration",
    type: "error",
  },
  {
    inputs: [],
    name: "JBSuckerDeployer_LayerSpecificNotConfigured",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "caller",
        type: "address",
      },
      {
        internalType: "address",
        name: "expected",
        type: "address",
      },
    ],
    name: "JBSuckerDeployer_Unauthorized",
    type: "error",
  },
  {
    inputs: [],
    name: "JBSuckerDeployer_ZeroConfiguratorAddress",
    type: "error",
  },
] as const;
