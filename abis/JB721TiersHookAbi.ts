export const JB721TiersHookAbi = [
  {
    type: "constructor",
    inputs: [
      {
        name: "directory",
        type: "address",
        internalType: "contract IJBDirectory",
      },
      {
        name: "permissions",
        type: "address",
        internalType: "contract IJBPermissions",
      },
      {
        name: "rulesets",
        type: "address",
        internalType: "contract IJBRulesets",
      },
      {
        name: "store",
        type: "address",
        internalType: "contract IJB721TiersHookStore",
      },
      {
        name: "trustedForwarder",
        type: "address",
        internalType: "address",
      },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "DIRECTORY",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "address",
        internalType: "contract IJBDirectory",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "METADATA_ID_TARGET",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "address",
        internalType: "address",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "PERMISSIONS",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "address",
        internalType: "contract IJBPermissions",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "PROJECTS",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "address",
        internalType: "contract IJBProjects",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "PROJECT_ID",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "RULESETS",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "address",
        internalType: "contract IJBRulesets",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "STORE",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "address",
        internalType: "contract IJB721TiersHookStore",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "adjustTiers",
    inputs: [
      {
        name: "tiersToAdd",
        type: "tuple[]",
        internalType: "struct JB721TierConfig[]",
        components: [
          {
            name: "price",
            type: "uint104",
            internalType: "uint104",
          },
          {
            name: "initialSupply",
            type: "uint32",
            internalType: "uint32",
          },
          {
            name: "votingUnits",
            type: "uint32",
            internalType: "uint32",
          },
          {
            name: "reserveFrequency",
            type: "uint16",
            internalType: "uint16",
          },
          {
            name: "reserveBeneficiary",
            type: "address",
            internalType: "address",
          },
          {
            name: "encodedIPFSUri",
            type: "bytes32",
            internalType: "bytes32",
          },
          {
            name: "category",
            type: "uint24",
            internalType: "uint24",
          },
          {
            name: "discountPercent",
            type: "uint8",
            internalType: "uint8",
          },
          {
            name: "allowOwnerMint",
            type: "bool",
            internalType: "bool",
          },
          {
            name: "useReserveBeneficiaryAsDefault",
            type: "bool",
            internalType: "bool",
          },
          {
            name: "transfersPausable",
            type: "bool",
            internalType: "bool",
          },
          {
            name: "useVotingUnits",
            type: "bool",
            internalType: "bool",
          },
          {
            name: "cannotBeRemoved",
            type: "bool",
            internalType: "bool",
          },
          {
            name: "cannotIncreaseDiscountPercent",
            type: "bool",
            internalType: "bool",
          },
        ],
      },
      {
        name: "tierIdsToRemove",
        type: "uint256[]",
        internalType: "uint256[]",
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "afterPayRecordedWith",
    inputs: [
      {
        name: "context",
        type: "tuple",
        internalType: "struct JBAfterPayRecordedContext",
        components: [
          {
            name: "payer",
            type: "address",
            internalType: "address",
          },
          {
            name: "projectId",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "rulesetId",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "amount",
            type: "tuple",
            internalType: "struct JBTokenAmount",
            components: [
              {
                name: "token",
                type: "address",
                internalType: "address",
              },
              {
                name: "decimals",
                type: "uint8",
                internalType: "uint8",
              },
              {
                name: "currency",
                type: "uint32",
                internalType: "uint32",
              },
              {
                name: "value",
                type: "uint256",
                internalType: "uint256",
              },
            ],
          },
          {
            name: "forwardedAmount",
            type: "tuple",
            internalType: "struct JBTokenAmount",
            components: [
              {
                name: "token",
                type: "address",
                internalType: "address",
              },
              {
                name: "decimals",
                type: "uint8",
                internalType: "uint8",
              },
              {
                name: "currency",
                type: "uint32",
                internalType: "uint32",
              },
              {
                name: "value",
                type: "uint256",
                internalType: "uint256",
              },
            ],
          },
          {
            name: "weight",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "projectTokenCount",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "beneficiary",
            type: "address",
            internalType: "address",
          },
          {
            name: "hookMetadata",
            type: "bytes",
            internalType: "bytes",
          },
          {
            name: "payerMetadata",
            type: "bytes",
            internalType: "bytes",
          },
        ],
      },
    ],
    outputs: [],
    stateMutability: "payable",
  },
  {
    type: "function",
    name: "afterRedeemRecordedWith",
    inputs: [
      {
        name: "context",
        type: "tuple",
        internalType: "struct JBAfterRedeemRecordedContext",
        components: [
          {
            name: "holder",
            type: "address",
            internalType: "address",
          },
          {
            name: "projectId",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "rulesetId",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "redeemCount",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "reclaimedAmount",
            type: "tuple",
            internalType: "struct JBTokenAmount",
            components: [
              {
                name: "token",
                type: "address",
                internalType: "address",
              },
              {
                name: "decimals",
                type: "uint8",
                internalType: "uint8",
              },
              {
                name: "currency",
                type: "uint32",
                internalType: "uint32",
              },
              {
                name: "value",
                type: "uint256",
                internalType: "uint256",
              },
            ],
          },
          {
            name: "forwardedAmount",
            type: "tuple",
            internalType: "struct JBTokenAmount",
            components: [
              {
                name: "token",
                type: "address",
                internalType: "address",
              },
              {
                name: "decimals",
                type: "uint8",
                internalType: "uint8",
              },
              {
                name: "currency",
                type: "uint32",
                internalType: "uint32",
              },
              {
                name: "value",
                type: "uint256",
                internalType: "uint256",
              },
            ],
          },
          {
            name: "redemptionRate",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "beneficiary",
            type: "address",
            internalType: "address payable",
          },
          {
            name: "hookMetadata",
            type: "bytes",
            internalType: "bytes",
          },
          {
            name: "redeemerMetadata",
            type: "bytes",
            internalType: "bytes",
          },
        ],
      },
    ],
    outputs: [],
    stateMutability: "payable",
  },
  {
    type: "function",
    name: "approve",
    inputs: [
      {
        name: "to",
        type: "address",
        internalType: "address",
      },
      {
        name: "tokenId",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "balanceOf",
    inputs: [
      {
        name: "owner",
        type: "address",
        internalType: "address",
      },
    ],
    outputs: [
      {
        name: "balance",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "baseURI",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "string",
        internalType: "string",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "beforePayRecordedWith",
    inputs: [
      {
        name: "context",
        type: "tuple",
        internalType: "struct JBBeforePayRecordedContext",
        components: [
          {
            name: "terminal",
            type: "address",
            internalType: "address",
          },
          {
            name: "payer",
            type: "address",
            internalType: "address",
          },
          {
            name: "amount",
            type: "tuple",
            internalType: "struct JBTokenAmount",
            components: [
              {
                name: "token",
                type: "address",
                internalType: "address",
              },
              {
                name: "decimals",
                type: "uint8",
                internalType: "uint8",
              },
              {
                name: "currency",
                type: "uint32",
                internalType: "uint32",
              },
              {
                name: "value",
                type: "uint256",
                internalType: "uint256",
              },
            ],
          },
          {
            name: "projectId",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "rulesetId",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "beneficiary",
            type: "address",
            internalType: "address",
          },
          {
            name: "weight",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "reservedPercent",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "metadata",
            type: "bytes",
            internalType: "bytes",
          },
        ],
      },
    ],
    outputs: [
      {
        name: "weight",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "hookSpecifications",
        type: "tuple[]",
        internalType: "struct JBPayHookSpecification[]",
        components: [
          {
            name: "hook",
            type: "address",
            internalType: "contract IJBPayHook",
          },
          {
            name: "amount",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "metadata",
            type: "bytes",
            internalType: "bytes",
          },
        ],
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "beforeRedeemRecordedWith",
    inputs: [
      {
        name: "context",
        type: "tuple",
        internalType: "struct JBBeforeRedeemRecordedContext",
        components: [
          {
            name: "terminal",
            type: "address",
            internalType: "address",
          },
          {
            name: "holder",
            type: "address",
            internalType: "address",
          },
          {
            name: "projectId",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "rulesetId",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "redeemCount",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "totalSupply",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "surplus",
            type: "tuple",
            internalType: "struct JBTokenAmount",
            components: [
              {
                name: "token",
                type: "address",
                internalType: "address",
              },
              {
                name: "decimals",
                type: "uint8",
                internalType: "uint8",
              },
              {
                name: "currency",
                type: "uint32",
                internalType: "uint32",
              },
              {
                name: "value",
                type: "uint256",
                internalType: "uint256",
              },
            ],
          },
          {
            name: "useTotalSurplus",
            type: "bool",
            internalType: "bool",
          },
          {
            name: "redemptionRate",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "metadata",
            type: "bytes",
            internalType: "bytes",
          },
        ],
      },
    ],
    outputs: [
      {
        name: "redemptionRate",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "redeemCount",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "totalSupply",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "hookSpecifications",
        type: "tuple[]",
        internalType: "struct JBRedeemHookSpecification[]",
        components: [
          {
            name: "hook",
            type: "address",
            internalType: "contract IJBRedeemHook",
          },
          {
            name: "amount",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "metadata",
            type: "bytes",
            internalType: "bytes",
          },
        ],
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "contractURI",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "string",
        internalType: "string",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "firstOwnerOf",
    inputs: [
      {
        name: "tokenId",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    outputs: [
      {
        name: "",
        type: "address",
        internalType: "address",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getApproved",
    inputs: [
      {
        name: "tokenId",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    outputs: [
      {
        name: "",
        type: "address",
        internalType: "address",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "hasMintPermissionFor",
    inputs: [
      {
        name: "",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "",
        type: "address",
        internalType: "address",
      },
    ],
    outputs: [
      {
        name: "",
        type: "bool",
        internalType: "bool",
      },
    ],
    stateMutability: "pure",
  },
  {
    type: "function",
    name: "initialize",
    inputs: [
      {
        name: "projectId",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "name",
        type: "string",
        internalType: "string",
      },
      {
        name: "symbol",
        type: "string",
        internalType: "string",
      },
      {
        name: "baseUri",
        type: "string",
        internalType: "string",
      },
      {
        name: "tokenUriResolver",
        type: "address",
        internalType: "contract IJB721TokenUriResolver",
      },
      {
        name: "contractUri",
        type: "string",
        internalType: "string",
      },
      {
        name: "tiersConfig",
        type: "tuple",
        internalType: "struct JB721InitTiersConfig",
        components: [
          {
            name: "tiers",
            type: "tuple[]",
            internalType: "struct JB721TierConfig[]",
            components: [
              {
                name: "price",
                type: "uint104",
                internalType: "uint104",
              },
              {
                name: "initialSupply",
                type: "uint32",
                internalType: "uint32",
              },
              {
                name: "votingUnits",
                type: "uint32",
                internalType: "uint32",
              },
              {
                name: "reserveFrequency",
                type: "uint16",
                internalType: "uint16",
              },
              {
                name: "reserveBeneficiary",
                type: "address",
                internalType: "address",
              },
              {
                name: "encodedIPFSUri",
                type: "bytes32",
                internalType: "bytes32",
              },
              {
                name: "category",
                type: "uint24",
                internalType: "uint24",
              },
              {
                name: "discountPercent",
                type: "uint8",
                internalType: "uint8",
              },
              {
                name: "allowOwnerMint",
                type: "bool",
                internalType: "bool",
              },
              {
                name: "useReserveBeneficiaryAsDefault",
                type: "bool",
                internalType: "bool",
              },
              {
                name: "transfersPausable",
                type: "bool",
                internalType: "bool",
              },
              {
                name: "useVotingUnits",
                type: "bool",
                internalType: "bool",
              },
              {
                name: "cannotBeRemoved",
                type: "bool",
                internalType: "bool",
              },
              {
                name: "cannotIncreaseDiscountPercent",
                type: "bool",
                internalType: "bool",
              },
            ],
          },
          {
            name: "currency",
            type: "uint32",
            internalType: "uint32",
          },
          {
            name: "decimals",
            type: "uint8",
            internalType: "uint8",
          },
          {
            name: "prices",
            type: "address",
            internalType: "contract IJBPrices",
          },
        ],
      },
      {
        name: "flags",
        type: "tuple",
        internalType: "struct JB721TiersHookFlags",
        components: [
          {
            name: "noNewTiersWithReserves",
            type: "bool",
            internalType: "bool",
          },
          {
            name: "noNewTiersWithVotes",
            type: "bool",
            internalType: "bool",
          },
          {
            name: "noNewTiersWithOwnerMinting",
            type: "bool",
            internalType: "bool",
          },
          {
            name: "preventOverspending",
            type: "bool",
            internalType: "bool",
          },
        ],
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "isApprovedForAll",
    inputs: [
      {
        name: "owner",
        type: "address",
        internalType: "address",
      },
      {
        name: "operator",
        type: "address",
        internalType: "address",
      },
    ],
    outputs: [
      {
        name: "",
        type: "bool",
        internalType: "bool",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "isTrustedForwarder",
    inputs: [
      {
        name: "forwarder",
        type: "address",
        internalType: "address",
      },
    ],
    outputs: [
      {
        name: "",
        type: "bool",
        internalType: "bool",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "jbOwner",
    inputs: [],
    outputs: [
      {
        name: "owner",
        type: "address",
        internalType: "address",
      },
      {
        name: "projectId",
        type: "uint88",
        internalType: "uint88",
      },
      {
        name: "permissionId",
        type: "uint8",
        internalType: "uint8",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "mintFor",
    inputs: [
      {
        name: "tierIds",
        type: "uint16[]",
        internalType: "uint16[]",
      },
      {
        name: "beneficiary",
        type: "address",
        internalType: "address",
      },
    ],
    outputs: [
      {
        name: "tokenIds",
        type: "uint256[]",
        internalType: "uint256[]",
      },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "mintPendingReservesFor",
    inputs: [
      {
        name: "tierId",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "count",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "mintPendingReservesFor",
    inputs: [
      {
        name: "reserveMintConfigs",
        type: "tuple[]",
        internalType: "struct JB721TiersMintReservesConfig[]",
        components: [
          {
            name: "tierId",
            type: "uint32",
            internalType: "uint32",
          },
          {
            name: "count",
            type: "uint16",
            internalType: "uint16",
          },
        ],
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "name",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "string",
        internalType: "string",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "owner",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "address",
        internalType: "address",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "ownerOf",
    inputs: [
      {
        name: "tokenId",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    outputs: [
      {
        name: "",
        type: "address",
        internalType: "address",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "payCreditsOf",
    inputs: [
      {
        name: "addr",
        type: "address",
        internalType: "address",
      },
    ],
    outputs: [
      {
        name: "",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "pricingContext",
    inputs: [],
    outputs: [
      {
        name: "currency",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "decimals",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "prices",
        type: "address",
        internalType: "contract IJBPrices",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "redemptionWeightOf",
    inputs: [
      {
        name: "tokenIds",
        type: "uint256[]",
        internalType: "uint256[]",
      },
      {
        name: "",
        type: "tuple",
        internalType: "struct JBBeforeRedeemRecordedContext",
        components: [
          {
            name: "terminal",
            type: "address",
            internalType: "address",
          },
          {
            name: "holder",
            type: "address",
            internalType: "address",
          },
          {
            name: "projectId",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "rulesetId",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "redeemCount",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "totalSupply",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "surplus",
            type: "tuple",
            internalType: "struct JBTokenAmount",
            components: [
              {
                name: "token",
                type: "address",
                internalType: "address",
              },
              {
                name: "decimals",
                type: "uint8",
                internalType: "uint8",
              },
              {
                name: "currency",
                type: "uint32",
                internalType: "uint32",
              },
              {
                name: "value",
                type: "uint256",
                internalType: "uint256",
              },
            ],
          },
          {
            name: "useTotalSurplus",
            type: "bool",
            internalType: "bool",
          },
          {
            name: "redemptionRate",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "metadata",
            type: "bytes",
            internalType: "bytes",
          },
        ],
      },
    ],
    outputs: [
      {
        name: "",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "renounceOwnership",
    inputs: [],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "safeTransferFrom",
    inputs: [
      {
        name: "from",
        type: "address",
        internalType: "address",
      },
      {
        name: "to",
        type: "address",
        internalType: "address",
      },
      {
        name: "tokenId",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "safeTransferFrom",
    inputs: [
      {
        name: "from",
        type: "address",
        internalType: "address",
      },
      {
        name: "to",
        type: "address",
        internalType: "address",
      },
      {
        name: "tokenId",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "data",
        type: "bytes",
        internalType: "bytes",
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "setApprovalForAll",
    inputs: [
      {
        name: "operator",
        type: "address",
        internalType: "address",
      },
      {
        name: "approved",
        type: "bool",
        internalType: "bool",
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "setDiscountPercentOf",
    inputs: [
      {
        name: "tierId",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "discountPercent",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "setDiscountPercentsOf",
    inputs: [
      {
        name: "configs",
        type: "tuple[]",
        internalType: "struct JB721TiersSetDiscountPercentConfig[]",
        components: [
          {
            name: "tierId",
            type: "uint32",
            internalType: "uint32",
          },
          {
            name: "discountPercent",
            type: "uint16",
            internalType: "uint16",
          },
        ],
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "setMetadata",
    inputs: [
      {
        name: "baseUri",
        type: "string",
        internalType: "string",
      },
      {
        name: "contractUri",
        type: "string",
        internalType: "string",
      },
      {
        name: "tokenUriResolver",
        type: "address",
        internalType: "contract IJB721TokenUriResolver",
      },
      {
        name: "encodedIPFSTUriTierId",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "encodedIPFSUri",
        type: "bytes32",
        internalType: "bytes32",
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "setPermissionId",
    inputs: [
      {
        name: "permissionId",
        type: "uint8",
        internalType: "uint8",
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "supportsInterface",
    inputs: [
      {
        name: "interfaceId",
        type: "bytes4",
        internalType: "bytes4",
      },
    ],
    outputs: [
      {
        name: "",
        type: "bool",
        internalType: "bool",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "symbol",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "string",
        internalType: "string",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "tokenURI",
    inputs: [
      {
        name: "tokenId",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    outputs: [
      {
        name: "",
        type: "string",
        internalType: "string",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "totalRedemptionWeight",
    inputs: [
      {
        name: "",
        type: "tuple",
        internalType: "struct JBBeforeRedeemRecordedContext",
        components: [
          {
            name: "terminal",
            type: "address",
            internalType: "address",
          },
          {
            name: "holder",
            type: "address",
            internalType: "address",
          },
          {
            name: "projectId",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "rulesetId",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "redeemCount",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "totalSupply",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "surplus",
            type: "tuple",
            internalType: "struct JBTokenAmount",
            components: [
              {
                name: "token",
                type: "address",
                internalType: "address",
              },
              {
                name: "decimals",
                type: "uint8",
                internalType: "uint8",
              },
              {
                name: "currency",
                type: "uint32",
                internalType: "uint32",
              },
              {
                name: "value",
                type: "uint256",
                internalType: "uint256",
              },
            ],
          },
          {
            name: "useTotalSurplus",
            type: "bool",
            internalType: "bool",
          },
          {
            name: "redemptionRate",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "metadata",
            type: "bytes",
            internalType: "bytes",
          },
        ],
      },
    ],
    outputs: [
      {
        name: "",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "transferFrom",
    inputs: [
      {
        name: "from",
        type: "address",
        internalType: "address",
      },
      {
        name: "to",
        type: "address",
        internalType: "address",
      },
      {
        name: "tokenId",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "transferOwnership",
    inputs: [
      {
        name: "newOwner",
        type: "address",
        internalType: "address",
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "transferOwnershipToProject",
    inputs: [
      {
        name: "projectId",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "trustedForwarder",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "address",
        internalType: "address",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "event",
    name: "AddPayCredits",
    inputs: [
      {
        name: "amount",
        type: "uint256",
        indexed: true,
        internalType: "uint256",
      },
      {
        name: "newTotalCredits",
        type: "uint256",
        indexed: true,
        internalType: "uint256",
      },
      {
        name: "account",
        type: "address",
        indexed: true,
        internalType: "address",
      },
      {
        name: "caller",
        type: "address",
        indexed: false,
        internalType: "address",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "AddTier",
    inputs: [
      {
        name: "tierId",
        type: "uint256",
        indexed: true,
        internalType: "uint256",
      },
      {
        name: "tier",
        type: "tuple",
        indexed: false,
        internalType: "struct JB721TierConfig",
        components: [
          {
            name: "price",
            type: "uint104",
            internalType: "uint104",
          },
          {
            name: "initialSupply",
            type: "uint32",
            internalType: "uint32",
          },
          {
            name: "votingUnits",
            type: "uint32",
            internalType: "uint32",
          },
          {
            name: "reserveFrequency",
            type: "uint16",
            internalType: "uint16",
          },
          {
            name: "reserveBeneficiary",
            type: "address",
            internalType: "address",
          },
          {
            name: "encodedIPFSUri",
            type: "bytes32",
            internalType: "bytes32",
          },
          {
            name: "category",
            type: "uint24",
            internalType: "uint24",
          },
          {
            name: "discountPercent",
            type: "uint8",
            internalType: "uint8",
          },
          {
            name: "allowOwnerMint",
            type: "bool",
            internalType: "bool",
          },
          {
            name: "useReserveBeneficiaryAsDefault",
            type: "bool",
            internalType: "bool",
          },
          {
            name: "transfersPausable",
            type: "bool",
            internalType: "bool",
          },
          {
            name: "useVotingUnits",
            type: "bool",
            internalType: "bool",
          },
          {
            name: "cannotBeRemoved",
            type: "bool",
            internalType: "bool",
          },
          {
            name: "cannotIncreaseDiscountPercent",
            type: "bool",
            internalType: "bool",
          },
        ],
      },
      {
        name: "caller",
        type: "address",
        indexed: false,
        internalType: "address",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "Approval",
    inputs: [
      {
        name: "owner",
        type: "address",
        indexed: true,
        internalType: "address",
      },
      {
        name: "approved",
        type: "address",
        indexed: true,
        internalType: "address",
      },
      {
        name: "tokenId",
        type: "uint256",
        indexed: true,
        internalType: "uint256",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "ApprovalForAll",
    inputs: [
      {
        name: "owner",
        type: "address",
        indexed: true,
        internalType: "address",
      },
      {
        name: "operator",
        type: "address",
        indexed: true,
        internalType: "address",
      },
      {
        name: "approved",
        type: "bool",
        indexed: false,
        internalType: "bool",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "Mint",
    inputs: [
      {
        name: "tokenId",
        type: "uint256",
        indexed: true,
        internalType: "uint256",
      },
      {
        name: "tierId",
        type: "uint256",
        indexed: true,
        internalType: "uint256",
      },
      {
        name: "beneficiary",
        type: "address",
        indexed: true,
        internalType: "address",
      },
      {
        name: "totalAmountPaid",
        type: "uint256",
        indexed: false,
        internalType: "uint256",
      },
      {
        name: "caller",
        type: "address",
        indexed: false,
        internalType: "address",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "MintReservedNft",
    inputs: [
      {
        name: "tokenId",
        type: "uint256",
        indexed: true,
        internalType: "uint256",
      },
      {
        name: "tierId",
        type: "uint256",
        indexed: true,
        internalType: "uint256",
      },
      {
        name: "beneficiary",
        type: "address",
        indexed: true,
        internalType: "address",
      },
      {
        name: "caller",
        type: "address",
        indexed: false,
        internalType: "address",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "OwnershipTransferred",
    inputs: [
      {
        name: "previousOwner",
        type: "address",
        indexed: true,
        internalType: "address",
      },
      {
        name: "newOwner",
        type: "address",
        indexed: true,
        internalType: "address",
      },
      {
        name: "caller",
        type: "address",
        indexed: false,
        internalType: "address",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "PermissionIdChanged",
    inputs: [
      {
        name: "newId",
        type: "uint8",
        indexed: false,
        internalType: "uint8",
      },
      {
        name: "caller",
        type: "address",
        indexed: false,
        internalType: "address",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "RemoveTier",
    inputs: [
      {
        name: "tierId",
        type: "uint256",
        indexed: true,
        internalType: "uint256",
      },
      {
        name: "caller",
        type: "address",
        indexed: false,
        internalType: "address",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "SetBaseUri",
    inputs: [
      {
        name: "baseUri",
        type: "string",
        indexed: true,
        internalType: "string",
      },
      {
        name: "caller",
        type: "address",
        indexed: false,
        internalType: "address",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "SetContractUri",
    inputs: [
      {
        name: "uri",
        type: "string",
        indexed: true,
        internalType: "string",
      },
      {
        name: "caller",
        type: "address",
        indexed: false,
        internalType: "address",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "SetDiscountPercent",
    inputs: [
      {
        name: "tierId",
        type: "uint256",
        indexed: true,
        internalType: "uint256",
      },
      {
        name: "discountPercent",
        type: "uint256",
        indexed: false,
        internalType: "uint256",
      },
      {
        name: "caller",
        type: "address",
        indexed: false,
        internalType: "address",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "SetEncodedIPFSUri",
    inputs: [
      {
        name: "tierId",
        type: "uint256",
        indexed: true,
        internalType: "uint256",
      },
      {
        name: "encodedUri",
        type: "bytes32",
        indexed: false,
        internalType: "bytes32",
      },
      {
        name: "caller",
        type: "address",
        indexed: false,
        internalType: "address",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "SetTokenUriResolver",
    inputs: [
      {
        name: "resolver",
        type: "address",
        indexed: true,
        internalType: "contract IJB721TokenUriResolver",
      },
      {
        name: "caller",
        type: "address",
        indexed: false,
        internalType: "address",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "Transfer",
    inputs: [
      {
        name: "from",
        type: "address",
        indexed: true,
        internalType: "address",
      },
      {
        name: "to",
        type: "address",
        indexed: true,
        internalType: "address",
      },
      {
        name: "tokenId",
        type: "uint256",
        indexed: true,
        internalType: "uint256",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "UsePayCredits",
    inputs: [
      {
        name: "amount",
        type: "uint256",
        indexed: true,
        internalType: "uint256",
      },
      {
        name: "newTotalCredits",
        type: "uint256",
        indexed: true,
        internalType: "uint256",
      },
      {
        name: "account",
        type: "address",
        indexed: true,
        internalType: "address",
      },
      {
        name: "caller",
        type: "address",
        indexed: false,
        internalType: "address",
      },
    ],
    anonymous: false,
  },
  {
    type: "error",
    name: "ERC721IncorrectOwner",
    inputs: [
      {
        name: "sender",
        type: "address",
        internalType: "address",
      },
      {
        name: "tokenId",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "owner",
        type: "address",
        internalType: "address",
      },
    ],
  },
  {
    type: "error",
    name: "ERC721InsufficientApproval",
    inputs: [
      {
        name: "operator",
        type: "address",
        internalType: "address",
      },
      {
        name: "tokenId",
        type: "uint256",
        internalType: "uint256",
      },
    ],
  },
  {
    type: "error",
    name: "ERC721InvalidApprover",
    inputs: [
      {
        name: "approver",
        type: "address",
        internalType: "address",
      },
    ],
  },
  {
    type: "error",
    name: "ERC721InvalidOperator",
    inputs: [
      {
        name: "operator",
        type: "address",
        internalType: "address",
      },
    ],
  },
  {
    type: "error",
    name: "ERC721InvalidOwner",
    inputs: [
      {
        name: "owner",
        type: "address",
        internalType: "address",
      },
    ],
  },
  {
    type: "error",
    name: "ERC721InvalidReceiver",
    inputs: [
      {
        name: "receiver",
        type: "address",
        internalType: "address",
      },
    ],
  },
  {
    type: "error",
    name: "ERC721InvalidSender",
    inputs: [
      {
        name: "sender",
        type: "address",
        internalType: "address",
      },
    ],
  },
  {
    type: "error",
    name: "ERC721NonexistentToken",
    inputs: [
      {
        name: "tokenId",
        type: "uint256",
        internalType: "uint256",
      },
    ],
  },
  {
    type: "error",
    name: "JB721Hook_InvalidPay",
    inputs: [],
  },
  {
    type: "error",
    name: "JB721Hook_InvalidRedeem",
    inputs: [],
  },
  {
    type: "error",
    name: "JB721Hook_UnauthorizedToken",
    inputs: [
      {
        name: "tokenId",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "holder",
        type: "address",
        internalType: "address",
      },
    ],
  },
  {
    type: "error",
    name: "JB721Hook_UnexpectedTokenRedeemed",
    inputs: [],
  },
  {
    type: "error",
    name: "JB721TiersHook_AlreadyInitialized",
    inputs: [
      {
        name: "projectId",
        type: "uint256",
        internalType: "uint256",
      },
    ],
  },
  {
    type: "error",
    name: "JB721TiersHook_MintReserveNftsPaused",
    inputs: [],
  },
  {
    type: "error",
    name: "JB721TiersHook_NoProjectId",
    inputs: [],
  },
  {
    type: "error",
    name: "JB721TiersHook_Overspending",
    inputs: [
      {
        name: "leftoverAmount",
        type: "uint256",
        internalType: "uint256",
      },
    ],
  },
  {
    type: "error",
    name: "JB721TiersHook_TierTransfersPaused",
    inputs: [],
  },
  {
    type: "error",
    name: "JBOwnableOverrides_InvalidNewOwner",
    inputs: [],
  },
  {
    type: "error",
    name: "JBPermissioned_Unauthorized",
    inputs: [
      {
        name: "account",
        type: "address",
        internalType: "address",
      },
      {
        name: "sender",
        type: "address",
        internalType: "address",
      },
      {
        name: "projectId",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "permissionId",
        type: "uint256",
        internalType: "uint256",
      },
    ],
  },
  {
    type: "error",
    name: "PRBMath_MulDiv_Overflow",
    inputs: [
      {
        name: "x",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "y",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "denominator",
        type: "uint256",
        internalType: "uint256",
      },
    ],
  },
] as const;
