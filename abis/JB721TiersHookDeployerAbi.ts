export const JB721TiersHookDeployerAbi = [
  {
    inputs: [
      {
        internalType: "contract JB721TiersHook",
        name: "hook",
        type: "address",
      },
      {
        internalType: "contract IJB721TiersHookStore",
        name: "store",
        type: "address",
      },
      {
        internalType: "contract IJBAddressRegistry",
        name: "addressRegistry",
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
    name: "ADDRESS_REGISTRY",
    outputs: [
      {
        internalType: "contract IJBAddressRegistry",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "HOOK",
    outputs: [
      {
        internalType: "contract JB721TiersHook",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "STORE",
    outputs: [
      {
        internalType: "contract IJB721TiersHookStore",
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
        components: [
          {
            internalType: "string",
            name: "name",
            type: "string",
          },
          {
            internalType: "string",
            name: "symbol",
            type: "string",
          },
          {
            internalType: "string",
            name: "baseUri",
            type: "string",
          },
          {
            internalType: "contract IJB721TokenUriResolver",
            name: "tokenUriResolver",
            type: "address",
          },
          {
            internalType: "string",
            name: "contractUri",
            type: "string",
          },
          {
            components: [
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
                name: "tiers",
                type: "tuple[]",
              },
              {
                internalType: "uint32",
                name: "currency",
                type: "uint32",
              },
              {
                internalType: "uint8",
                name: "decimals",
                type: "uint8",
              },
              {
                internalType: "contract IJBPrices",
                name: "prices",
                type: "address",
              },
            ],
            internalType: "struct JB721InitTiersConfig",
            name: "tiersConfig",
            type: "tuple",
          },
          {
            internalType: "address",
            name: "reserveBeneficiary",
            type: "address",
          },
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
        internalType: "struct JBDeploy721TiersHookConfig",
        name: "deployTiersHookConfig",
        type: "tuple",
      },
      {
        internalType: "bytes32",
        name: "salt",
        type: "bytes32",
      },
    ],
    name: "deployHookFor",
    outputs: [
      {
        internalType: "contract IJB721TiersHook",
        name: "newHook",
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
        internalType: "uint256",
        name: "projectId",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "contract IJB721TiersHook",
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
    name: "HookDeployed",
    type: "event",
  },
] as const;
