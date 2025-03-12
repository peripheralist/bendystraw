export const JBPricesAbi = [
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
        internalType: "contract IJBProjects",
        name: "projects",
        type: "address",
      },
      {
        internalType: "address",
        name: "owner",
        type: "address",
      },
    ],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    inputs: [],
    name: "DEFAULT_PROJECT_ID",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
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
        internalType: "uint256",
        name: "projectId",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "pricingCurrency",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "unitCurrency",
        type: "uint256",
      },
      {
        internalType: "contract IJBPriceFeed",
        name: "feed",
        type: "address",
      },
    ],
    name: "addPriceFeedFor",
    outputs: [],
    stateMutability: "nonpayable",
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
        internalType: "uint256",
        name: "pricingCurrency",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "unitCurrency",
        type: "uint256",
      },
    ],
    name: "priceFeedFor",
    outputs: [
      {
        internalType: "contract IJBPriceFeed",
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
        internalType: "uint256",
        name: "pricingCurrency",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "unitCurrency",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "decimals",
        type: "uint256",
      },
    ],
    name: "pricePerUnitOf",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
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
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "uint256",
        name: "projectId",
        type: "uint256",
      },
      {
        indexed: true,
        internalType: "uint256",
        name: "pricingCurrency",
        type: "uint256",
      },
      {
        indexed: true,
        internalType: "uint256",
        name: "unitCurrency",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "contract IJBPriceFeed",
        name: "feed",
        type: "address",
      },
      {
        indexed: false,
        internalType: "address",
        name: "caller",
        type: "address",
      },
    ],
    name: "AddPriceFeed",
    type: "event",
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
    inputs: [
      {
        internalType: "address",
        name: "controller",
        type: "address",
      },
    ],
    name: "JBControlled_ControllerUnauthorized",
    type: "error",
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
        internalType: "contract IJBPriceFeed",
        name: "feed",
        type: "address",
      },
    ],
    name: "JBPrices_PriceFeedAlreadyExists",
    type: "error",
  },
  {
    inputs: [],
    name: "JBPrices_PriceFeedNotFound",
    type: "error",
  },
  {
    inputs: [],
    name: "JBPrices_ZeroPricingCurrency",
    type: "error",
  },
  {
    inputs: [],
    name: "JBPrices_ZeroUnitCurrency",
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
  {
    inputs: [
      {
        internalType: "uint256",
        name: "x",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "y",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "denominator",
        type: "uint256",
      },
    ],
    name: "PRBMath_MulDiv_Overflow",
    type: "error",
  },
] as const;
