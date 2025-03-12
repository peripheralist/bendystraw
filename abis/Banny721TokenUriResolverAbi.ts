export const Banny721TokenUriResolverAbi = [
  {
    inputs: [
      {
        internalType: "string",
        name: "bannyBody",
        type: "string",
      },
      {
        internalType: "string",
        name: "defaultNecklace",
        type: "string",
      },
      {
        internalType: "string",
        name: "defaultMouth",
        type: "string",
      },
      {
        internalType: "string",
        name: "defaultStandardEyes",
        type: "string",
      },
      {
        internalType: "string",
        name: "defaultAlienEyes",
        type: "string",
      },
      {
        internalType: "address",
        name: "owner",
        type: "address",
      },
      {
        internalType: "address",
        name: "trustedForwarder",
        type: "address",
      },
    ],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    inputs: [],
    name: "BANNY_BODY",
    outputs: [
      {
        internalType: "string",
        name: "",
        type: "string",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "DEFAULT_ALIEN_EYES",
    outputs: [
      {
        internalType: "string",
        name: "",
        type: "string",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "DEFAULT_MOUTH",
    outputs: [
      {
        internalType: "string",
        name: "",
        type: "string",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "DEFAULT_NECKLACE",
    outputs: [
      {
        internalType: "string",
        name: "",
        type: "string",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "DEFAULT_STANDARD_EYES",
    outputs: [
      {
        internalType: "string",
        name: "",
        type: "string",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "hook",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "bannyBodyId",
        type: "uint256",
      },
    ],
    name: "assetIdsOf",
    outputs: [
      {
        internalType: "uint256",
        name: "backgroundId",
        type: "uint256",
      },
      {
        internalType: "uint256[]",
        name: "outfitIds",
        type: "uint256[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "hook",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "bannyBodyId",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "backgroundId",
        type: "uint256",
      },
      {
        internalType: "uint256[]",
        name: "outfitIds",
        type: "uint256[]",
      },
    ],
    name: "decorateBannyWith",
    outputs: [],
    stateMutability: "nonpayable",
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
    inputs: [
      {
        internalType: "address",
        name: "hook",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "bannyBodyId",
        type: "uint256",
      },
    ],
    name: "lockOutfitChangesFor",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "hook",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "tokenId",
        type: "uint256",
      },
    ],
    name: "namesOf",
    outputs: [
      {
        internalType: "string",
        name: "",
        type: "string",
      },
      {
        internalType: "string",
        name: "",
        type: "string",
      },
      {
        internalType: "string",
        name: "",
        type: "string",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "operator",
        type: "address",
      },
      {
        internalType: "address",
        name: "from",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "tokenId",
        type: "uint256",
      },
      {
        internalType: "bytes",
        name: "data",
        type: "bytes",
      },
    ],
    name: "onERC721Received",
    outputs: [
      {
        internalType: "bytes4",
        name: "",
        type: "bytes4",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "hook",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "upc",
        type: "uint256",
      },
    ],
    name: "outfitLockedUntil",
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
    inputs: [],
    name: "renounceOwnership",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256[]",
        name: "upcs",
        type: "uint256[]",
      },
      {
        internalType: "string[]",
        name: "names",
        type: "string[]",
      },
    ],
    name: "setProductNames",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "string",
        name: "baseUri",
        type: "string",
      },
    ],
    name: "setSvgBaseUri",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256[]",
        name: "upcs",
        type: "uint256[]",
      },
      {
        internalType: "string[]",
        name: "svgContents",
        type: "string[]",
      },
    ],
    name: "setSvgContentsOf",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256[]",
        name: "upcs",
        type: "uint256[]",
      },
      {
        internalType: "bytes32[]",
        name: "svgHashs",
        type: "bytes32[]",
      },
    ],
    name: "setSvgHashsOf",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "svgBaseUri",
    outputs: [
      {
        internalType: "string",
        name: "",
        type: "string",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "upc",
        type: "uint256",
      },
    ],
    name: "svgHashOf",
    outputs: [
      {
        internalType: "bytes32",
        name: "",
        type: "bytes32",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "hook",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "tokenId",
        type: "uint256",
      },
      {
        internalType: "bool",
        name: "shouldDressBannyBody",
        type: "bool",
      },
      {
        internalType: "bool",
        name: "shouldIncludeBackgroundOnBannyBody",
        type: "bool",
      },
    ],
    name: "svgOf",
    outputs: [
      {
        internalType: "string",
        name: "",
        type: "string",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "hook",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "tokenId",
        type: "uint256",
      },
    ],
    name: "tokenUriOf",
    outputs: [
      {
        internalType: "string",
        name: "",
        type: "string",
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
    inputs: [
      {
        internalType: "address",
        name: "hook",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "backgroundId",
        type: "uint256",
      },
    ],
    name: "userOf",
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
    inputs: [
      {
        internalType: "address",
        name: "hook",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "outfitId",
        type: "uint256",
      },
    ],
    name: "wearerOf",
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
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "hook",
        type: "address",
      },
      {
        indexed: true,
        internalType: "uint256",
        name: "bannyBodyId",
        type: "uint256",
      },
      {
        indexed: true,
        internalType: "uint256",
        name: "backgroundId",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256[]",
        name: "outfitIds",
        type: "uint256[]",
      },
      {
        indexed: false,
        internalType: "address",
        name: "caller",
        type: "address",
      },
    ],
    name: "DecorateBanny",
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
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "uint256",
        name: "upc",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "string",
        name: "name",
        type: "string",
      },
      {
        indexed: false,
        internalType: "address",
        name: "caller",
        type: "address",
      },
    ],
    name: "SetProductName",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "string",
        name: "baseUri",
        type: "string",
      },
      {
        indexed: false,
        internalType: "address",
        name: "caller",
        type: "address",
      },
    ],
    name: "SetSvgBaseUri",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "uint256",
        name: "upc",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "string",
        name: "svgContent",
        type: "string",
      },
      {
        indexed: false,
        internalType: "address",
        name: "caller",
        type: "address",
      },
    ],
    name: "SetSvgContent",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "uint256",
        name: "upc",
        type: "uint256",
      },
      {
        indexed: true,
        internalType: "bytes32",
        name: "svgHash",
        type: "bytes32",
      },
      {
        indexed: false,
        internalType: "address",
        name: "caller",
        type: "address",
      },
    ],
    name: "SetSvgHash",
    type: "event",
  },
  {
    inputs: [],
    name: "Banny721TokenUriResolver_CantAccelerateTheLock",
    type: "error",
  },
  {
    inputs: [],
    name: "Banny721TokenUriResolver_ContentsAlreadyStored",
    type: "error",
  },
  {
    inputs: [],
    name: "Banny721TokenUriResolver_ContentsMismatch",
    type: "error",
  },
  {
    inputs: [],
    name: "Banny721TokenUriResolver_HashAlreadyStored",
    type: "error",
  },
  {
    inputs: [],
    name: "Banny721TokenUriResolver_HashNotFound",
    type: "error",
  },
  {
    inputs: [],
    name: "Banny721TokenUriResolver_HeadAlreadyAdded",
    type: "error",
  },
  {
    inputs: [],
    name: "Banny721TokenUriResolver_OutfitChangesLocked",
    type: "error",
  },
  {
    inputs: [],
    name: "Banny721TokenUriResolver_SuitAlreadyAdded",
    type: "error",
  },
  {
    inputs: [],
    name: "Banny721TokenUriResolver_UnauthorizedBackground",
    type: "error",
  },
  {
    inputs: [],
    name: "Banny721TokenUriResolver_UnauthorizedBannyBody",
    type: "error",
  },
  {
    inputs: [],
    name: "Banny721TokenUriResolver_UnauthorizedOutfit",
    type: "error",
  },
  {
    inputs: [],
    name: "Banny721TokenUriResolver_UnauthorizedTransfer",
    type: "error",
  },
  {
    inputs: [],
    name: "Banny721TokenUriResolver_UnorderedCategories",
    type: "error",
  },
  {
    inputs: [],
    name: "Banny721TokenUriResolver_UnrecognizedBackground",
    type: "error",
  },
  {
    inputs: [],
    name: "Banny721TokenUriResolver_UnrecognizedCategory",
    type: "error",
  },
  {
    inputs: [],
    name: "Banny721TokenUriResolver_UnrecognizedProduct",
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
    inputs: [],
    name: "ReentrancyGuardReentrantCall",
    type: "error",
  },
] as const;
