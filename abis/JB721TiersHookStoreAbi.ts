export const JB721TiersHookStoreAbi = [
  {
    inputs: [
      {
        internalType: "address",
        name: "hook",
        type: "address",
      },
      {
        internalType: "address",
        name: "owner",
        type: "address",
      },
    ],
    name: "balanceOf",
    outputs: [
      {
        internalType: "uint256",
        name: "balance",
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
        internalType: "uint256[]",
        name: "tokenIds",
        type: "uint256[]",
      },
    ],
    name: "cashOutWeightOf",
    outputs: [
      {
        internalType: "uint256",
        name: "weight",
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
    ],
    name: "cleanTiers",
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
    ],
    name: "defaultReserveBeneficiaryOf",
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
        name: "tierId",
        type: "uint256",
      },
    ],
    name: "encodedIPFSUriOf",
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
    ],
    name: "encodedTierIPFSUriOf",
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
    ],
    name: "flagsOf",
    outputs: [
      {
        components: [
          {
            internalType: "bool",
            name: "noNewTiersWithReserves",
            type: "bool",
          },
          {
            internalType: "bool",
            name: "noNewTiersWithVotes",
            type: "bool",
          },
          {
            internalType: "bool",
            name: "noNewTiersWithOwnerMinting",
            type: "bool",
          },
          {
            internalType: "bool",
            name: "preventOverspending",
            type: "bool",
          },
        ],
        internalType: "struct JB721TiersHookFlags",
        name: "",
        type: "tuple",
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
        name: "tierId",
        type: "uint256",
      },
    ],
    name: "isTierRemoved",
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
    ],
    name: "maxTierIdOf",
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
        name: "tierId",
        type: "uint256",
      },
    ],
    name: "numberOfBurnedFor",
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
        name: "tierId",
        type: "uint256",
      },
    ],
    name: "numberOfPendingReservesFor",
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
        name: "tierId",
        type: "uint256",
      },
    ],
    name: "numberOfReservesMintedFor",
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
        components: [
          {
            internalType: "uint104",
            name: "price",
            type: "uint104",
          },
          {
            internalType: "uint32",
            name: "initialSupply",
            type: "uint32",
          },
          {
            internalType: "uint32",
            name: "votingUnits",
            type: "uint32",
          },
          {
            internalType: "uint16",
            name: "reserveFrequency",
            type: "uint16",
          },
          {
            internalType: "address",
            name: "reserveBeneficiary",
            type: "address",
          },
          {
            internalType: "bytes32",
            name: "encodedIPFSUri",
            type: "bytes32",
          },
          {
            internalType: "uint24",
            name: "category",
            type: "uint24",
          },
          {
            internalType: "uint8",
            name: "discountPercent",
            type: "uint8",
          },
          {
            internalType: "bool",
            name: "allowOwnerMint",
            type: "bool",
          },
          {
            internalType: "bool",
            name: "useReserveBeneficiaryAsDefault",
            type: "bool",
          },
          {
            internalType: "bool",
            name: "transfersPausable",
            type: "bool",
          },
          {
            internalType: "bool",
            name: "useVotingUnits",
            type: "bool",
          },
          {
            internalType: "bool",
            name: "cannotBeRemoved",
            type: "bool",
          },
          {
            internalType: "bool",
            name: "cannotIncreaseDiscountPercent",
            type: "bool",
          },
        ],
        internalType: "struct JB721TierConfig[]",
        name: "tiersToAdd",
        type: "tuple[]",
      },
    ],
    name: "recordAddTiers",
    outputs: [
      {
        internalType: "uint256[]",
        name: "tierIds",
        type: "uint256[]",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256[]",
        name: "tokenIds",
        type: "uint256[]",
      },
    ],
    name: "recordBurn",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        components: [
          {
            internalType: "bool",
            name: "noNewTiersWithReserves",
            type: "bool",
          },
          {
            internalType: "bool",
            name: "noNewTiersWithVotes",
            type: "bool",
          },
          {
            internalType: "bool",
            name: "noNewTiersWithOwnerMinting",
            type: "bool",
          },
          {
            internalType: "bool",
            name: "preventOverspending",
            type: "bool",
          },
        ],
        internalType: "struct JB721TiersHookFlags",
        name: "flags",
        type: "tuple",
      },
    ],
    name: "recordFlags",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
      {
        internalType: "uint16[]",
        name: "tierIds",
        type: "uint16[]",
      },
      {
        internalType: "bool",
        name: "isOwnerMint",
        type: "bool",
      },
    ],
    name: "recordMint",
    outputs: [
      {
        internalType: "uint256[]",
        name: "tokenIds",
        type: "uint256[]",
      },
      {
        internalType: "uint256",
        name: "leftoverAmount",
        type: "uint256",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "tierId",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "count",
        type: "uint256",
      },
    ],
    name: "recordMintReservesFor",
    outputs: [
      {
        internalType: "uint256[]",
        name: "tokenIds",
        type: "uint256[]",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256[]",
        name: "tierIds",
        type: "uint256[]",
      },
    ],
    name: "recordRemoveTierIds",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "tierId",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "discountPercent",
        type: "uint256",
      },
    ],
    name: "recordSetDiscountPercentOf",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "tierId",
        type: "uint256",
      },
      {
        internalType: "bytes32",
        name: "encodedIPFSUri",
        type: "bytes32",
      },
    ],
    name: "recordSetEncodedIPFSUriOf",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "contract IJB721TokenUriResolver",
        name: "resolver",
        type: "address",
      },
    ],
    name: "recordSetTokenUriResolver",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "tierId",
        type: "uint256",
      },
      {
        internalType: "address",
        name: "from",
        type: "address",
      },
      {
        internalType: "address",
        name: "to",
        type: "address",
      },
    ],
    name: "recordTransferForTier",
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
        name: "tierId",
        type: "uint256",
      },
    ],
    name: "reserveBeneficiaryOf",
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
        internalType: "address",
        name: "owner",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "tierId",
        type: "uint256",
      },
    ],
    name: "tierBalanceOf",
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
        internalType: "uint256",
        name: "tokenId",
        type: "uint256",
      },
    ],
    name: "tierIdOfToken",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "pure",
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
        name: "id",
        type: "uint256",
      },
      {
        internalType: "bool",
        name: "includeResolvedUri",
        type: "bool",
      },
    ],
    name: "tierOf",
    outputs: [
      {
        components: [
          {
            internalType: "uint32",
            name: "id",
            type: "uint32",
          },
          {
            internalType: "uint104",
            name: "price",
            type: "uint104",
          },
          {
            internalType: "uint32",
            name: "remainingSupply",
            type: "uint32",
          },
          {
            internalType: "uint32",
            name: "initialSupply",
            type: "uint32",
          },
          {
            internalType: "uint104",
            name: "votingUnits",
            type: "uint104",
          },
          {
            internalType: "uint16",
            name: "reserveFrequency",
            type: "uint16",
          },
          {
            internalType: "address",
            name: "reserveBeneficiary",
            type: "address",
          },
          {
            internalType: "bytes32",
            name: "encodedIPFSUri",
            type: "bytes32",
          },
          {
            internalType: "uint24",
            name: "category",
            type: "uint24",
          },
          {
            internalType: "uint8",
            name: "discountPercent",
            type: "uint8",
          },
          {
            internalType: "bool",
            name: "allowOwnerMint",
            type: "bool",
          },
          {
            internalType: "bool",
            name: "transfersPausable",
            type: "bool",
          },
          {
            internalType: "bool",
            name: "cannotBeRemoved",
            type: "bool",
          },
          {
            internalType: "bool",
            name: "cannotIncreaseDiscountPercent",
            type: "bool",
          },
          {
            internalType: "string",
            name: "resolvedUri",
            type: "string",
          },
        ],
        internalType: "struct JB721Tier",
        name: "",
        type: "tuple",
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
        name: "includeResolvedUri",
        type: "bool",
      },
    ],
    name: "tierOfTokenId",
    outputs: [
      {
        components: [
          {
            internalType: "uint32",
            name: "id",
            type: "uint32",
          },
          {
            internalType: "uint104",
            name: "price",
            type: "uint104",
          },
          {
            internalType: "uint32",
            name: "remainingSupply",
            type: "uint32",
          },
          {
            internalType: "uint32",
            name: "initialSupply",
            type: "uint32",
          },
          {
            internalType: "uint104",
            name: "votingUnits",
            type: "uint104",
          },
          {
            internalType: "uint16",
            name: "reserveFrequency",
            type: "uint16",
          },
          {
            internalType: "address",
            name: "reserveBeneficiary",
            type: "address",
          },
          {
            internalType: "bytes32",
            name: "encodedIPFSUri",
            type: "bytes32",
          },
          {
            internalType: "uint24",
            name: "category",
            type: "uint24",
          },
          {
            internalType: "uint8",
            name: "discountPercent",
            type: "uint8",
          },
          {
            internalType: "bool",
            name: "allowOwnerMint",
            type: "bool",
          },
          {
            internalType: "bool",
            name: "transfersPausable",
            type: "bool",
          },
          {
            internalType: "bool",
            name: "cannotBeRemoved",
            type: "bool",
          },
          {
            internalType: "bool",
            name: "cannotIncreaseDiscountPercent",
            type: "bool",
          },
          {
            internalType: "string",
            name: "resolvedUri",
            type: "string",
          },
        ],
        internalType: "struct JB721Tier",
        name: "",
        type: "tuple",
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
        internalType: "address",
        name: "account",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "tierId",
        type: "uint256",
      },
    ],
    name: "tierVotingUnitsOf",
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
        internalType: "uint256[]",
        name: "categories",
        type: "uint256[]",
      },
      {
        internalType: "bool",
        name: "includeResolvedUri",
        type: "bool",
      },
      {
        internalType: "uint256",
        name: "startingId",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "size",
        type: "uint256",
      },
    ],
    name: "tiersOf",
    outputs: [
      {
        components: [
          {
            internalType: "uint32",
            name: "id",
            type: "uint32",
          },
          {
            internalType: "uint104",
            name: "price",
            type: "uint104",
          },
          {
            internalType: "uint32",
            name: "remainingSupply",
            type: "uint32",
          },
          {
            internalType: "uint32",
            name: "initialSupply",
            type: "uint32",
          },
          {
            internalType: "uint104",
            name: "votingUnits",
            type: "uint104",
          },
          {
            internalType: "uint16",
            name: "reserveFrequency",
            type: "uint16",
          },
          {
            internalType: "address",
            name: "reserveBeneficiary",
            type: "address",
          },
          {
            internalType: "bytes32",
            name: "encodedIPFSUri",
            type: "bytes32",
          },
          {
            internalType: "uint24",
            name: "category",
            type: "uint24",
          },
          {
            internalType: "uint8",
            name: "discountPercent",
            type: "uint8",
          },
          {
            internalType: "bool",
            name: "allowOwnerMint",
            type: "bool",
          },
          {
            internalType: "bool",
            name: "transfersPausable",
            type: "bool",
          },
          {
            internalType: "bool",
            name: "cannotBeRemoved",
            type: "bool",
          },
          {
            internalType: "bool",
            name: "cannotIncreaseDiscountPercent",
            type: "bool",
          },
          {
            internalType: "string",
            name: "resolvedUri",
            type: "string",
          },
        ],
        internalType: "struct JB721Tier[]",
        name: "tiers",
        type: "tuple[]",
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
    ],
    name: "tokenUriResolverOf",
    outputs: [
      {
        internalType: "contract IJB721TokenUriResolver",
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
    ],
    name: "totalCashOutWeight",
    outputs: [
      {
        internalType: "uint256",
        name: "weight",
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
    ],
    name: "totalSupplyOf",
    outputs: [
      {
        internalType: "uint256",
        name: "supply",
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
        internalType: "address",
        name: "account",
        type: "address",
      },
    ],
    name: "votingUnitsOf",
    outputs: [
      {
        internalType: "uint256",
        name: "units",
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
        indexed: false,
        internalType: "address",
        name: "caller",
        type: "address",
      },
    ],
    name: "CleanTiers",
    type: "event",
  },
  {
    inputs: [],
    name: "JB721TiersHookStore_CantMintManually",
    type: "error",
  },
  {
    inputs: [],
    name: "JB721TiersHookStore_CantRemoveTier",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "percent",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "limit",
        type: "uint256",
      },
    ],
    name: "JB721TiersHookStore_DiscountPercentExceedsBounds",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "percent",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "storedPercent",
        type: "uint256",
      },
    ],
    name: "JB721TiersHookStore_DiscountPercentIncreaseNotAllowed",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "count",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "numberOfPendingReserves",
        type: "uint256",
      },
    ],
    name: "JB721TiersHookStore_InsufficientPendingReserves",
    type: "error",
  },
  {
    inputs: [],
    name: "JB721TiersHookStore_InsufficientSupplyRemaining",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "tierCategory",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "previousTierCategory",
        type: "uint256",
      },
    ],
    name: "JB721TiersHookStore_InvalidCategorySortOrder",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "quantity",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "limit",
        type: "uint256",
      },
    ],
    name: "JB721TiersHookStore_InvalidQuantity",
    type: "error",
  },
  {
    inputs: [],
    name: "JB721TiersHookStore_ManualMintingNotAllowed",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "numberOfTiers",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "limit",
        type: "uint256",
      },
    ],
    name: "JB721TiersHookStore_MaxTiersExceeded",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "price",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "leftoverAmount",
        type: "uint256",
      },
    ],
    name: "JB721TiersHookStore_PriceExceedsAmount",
    type: "error",
  },
  {
    inputs: [],
    name: "JB721TiersHookStore_ReserveFrequencyNotAllowed",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "tierId",
        type: "uint256",
      },
    ],
    name: "JB721TiersHookStore_TierRemoved",
    type: "error",
  },
  {
    inputs: [],
    name: "JB721TiersHookStore_UnrecognizedTier",
    type: "error",
  },
  {
    inputs: [],
    name: "JB721TiersHookStore_VotingUnitsNotAllowed",
    type: "error",
  },
  {
    inputs: [],
    name: "JB721TiersHookStore_ZeroInitialSupply",
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
