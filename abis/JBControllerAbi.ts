export const JBControllerAbi = [
  {
    inputs: [
      {
        internalType: "contract IJBDirectory",
        name: "directory",
        type: "address",
      },
      {
        internalType: "contract IJBFundAccessLimits",
        name: "fundAccessLimits",
        type: "address",
      },
      {
        internalType: "contract IJBPermissions",
        name: "permissions",
        type: "address",
      },
      {
        internalType: "contract IJBPrices",
        name: "prices",
        type: "address",
      },
      {
        internalType: "contract IJBProjects",
        name: "projects",
        type: "address",
      },
      {
        internalType: "contract IJBRulesets",
        name: "rulesets",
        type: "address",
      },
      {
        internalType: "contract IJBSplits",
        name: "splits",
        type: "address",
      },
      {
        internalType: "contract IJBTokens",
        name: "tokens",
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
    name: "FUND_ACCESS_LIMITS",
    outputs: [
      {
        internalType: "contract IJBFundAccessLimits",
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
    name: "PRICES",
    outputs: [
      {
        internalType: "contract IJBPrices",
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
    inputs: [],
    name: "RULESETS",
    outputs: [
      {
        internalType: "contract IJBRulesets",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "SPLITS",
    outputs: [
      {
        internalType: "contract IJBSplits",
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
    name: "addPriceFeed",
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
    name: "allRulesetsOf",
    outputs: [
      {
        components: [
          {
            components: [
              {
                internalType: "uint48",
                name: "cycleNumber",
                type: "uint48",
              },
              {
                internalType: "uint48",
                name: "id",
                type: "uint48",
              },
              {
                internalType: "uint48",
                name: "basedOnId",
                type: "uint48",
              },
              {
                internalType: "uint48",
                name: "start",
                type: "uint48",
              },
              {
                internalType: "uint32",
                name: "duration",
                type: "uint32",
              },
              {
                internalType: "uint112",
                name: "weight",
                type: "uint112",
              },
              {
                internalType: "uint32",
                name: "weightCutPercent",
                type: "uint32",
              },
              {
                internalType: "contract IJBRulesetApprovalHook",
                name: "approvalHook",
                type: "address",
              },
              {
                internalType: "uint256",
                name: "metadata",
                type: "uint256",
              },
            ],
            internalType: "struct JBRuleset",
            name: "ruleset",
            type: "tuple",
          },
          {
            components: [
              {
                internalType: "uint16",
                name: "reservedPercent",
                type: "uint16",
              },
              {
                internalType: "uint16",
                name: "cashOutTaxRate",
                type: "uint16",
              },
              {
                internalType: "uint32",
                name: "baseCurrency",
                type: "uint32",
              },
              {
                internalType: "bool",
                name: "pausePay",
                type: "bool",
              },
              {
                internalType: "bool",
                name: "pauseCreditTransfers",
                type: "bool",
              },
              {
                internalType: "bool",
                name: "allowOwnerMinting",
                type: "bool",
              },
              {
                internalType: "bool",
                name: "allowSetCustomToken",
                type: "bool",
              },
              {
                internalType: "bool",
                name: "allowTerminalMigration",
                type: "bool",
              },
              {
                internalType: "bool",
                name: "allowSetTerminals",
                type: "bool",
              },
              {
                internalType: "bool",
                name: "allowSetController",
                type: "bool",
              },
              {
                internalType: "bool",
                name: "allowAddAccountingContext",
                type: "bool",
              },
              {
                internalType: "bool",
                name: "allowAddPriceFeed",
                type: "bool",
              },
              {
                internalType: "bool",
                name: "ownerMustSendPayouts",
                type: "bool",
              },
              {
                internalType: "bool",
                name: "holdFees",
                type: "bool",
              },
              {
                internalType: "bool",
                name: "useTotalSurplusForCashOuts",
                type: "bool",
              },
              {
                internalType: "bool",
                name: "useDataHookForPay",
                type: "bool",
              },
              {
                internalType: "bool",
                name: "useDataHookForCashOut",
                type: "bool",
              },
              {
                internalType: "address",
                name: "dataHook",
                type: "address",
              },
              {
                internalType: "uint16",
                name: "metadata",
                type: "uint16",
              },
            ],
            internalType: "struct JBRulesetMetadata",
            name: "metadata",
            type: "tuple",
          },
        ],
        internalType: "struct JBRulesetWithMetadata[]",
        name: "rulesets",
        type: "tuple[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "contract IERC165",
        name: "from",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "projectId",
        type: "uint256",
      },
    ],
    name: "beforeReceiveMigrationFrom",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "holder",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "projectId",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "tokenCount",
        type: "uint256",
      },
      {
        internalType: "string",
        name: "memo",
        type: "string",
      },
    ],
    name: "burnTokensOf",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "holder",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "projectId",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "tokenCount",
        type: "uint256",
      },
      {
        internalType: "address",
        name: "beneficiary",
        type: "address",
      },
    ],
    name: "claimTokensFor",
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
    ],
    name: "currentRulesetOf",
    outputs: [
      {
        components: [
          {
            internalType: "uint48",
            name: "cycleNumber",
            type: "uint48",
          },
          {
            internalType: "uint48",
            name: "id",
            type: "uint48",
          },
          {
            internalType: "uint48",
            name: "basedOnId",
            type: "uint48",
          },
          {
            internalType: "uint48",
            name: "start",
            type: "uint48",
          },
          {
            internalType: "uint32",
            name: "duration",
            type: "uint32",
          },
          {
            internalType: "uint112",
            name: "weight",
            type: "uint112",
          },
          {
            internalType: "uint32",
            name: "weightCutPercent",
            type: "uint32",
          },
          {
            internalType: "contract IJBRulesetApprovalHook",
            name: "approvalHook",
            type: "address",
          },
          {
            internalType: "uint256",
            name: "metadata",
            type: "uint256",
          },
        ],
        internalType: "struct JBRuleset",
        name: "ruleset",
        type: "tuple",
      },
      {
        components: [
          {
            internalType: "uint16",
            name: "reservedPercent",
            type: "uint16",
          },
          {
            internalType: "uint16",
            name: "cashOutTaxRate",
            type: "uint16",
          },
          {
            internalType: "uint32",
            name: "baseCurrency",
            type: "uint32",
          },
          {
            internalType: "bool",
            name: "pausePay",
            type: "bool",
          },
          {
            internalType: "bool",
            name: "pauseCreditTransfers",
            type: "bool",
          },
          {
            internalType: "bool",
            name: "allowOwnerMinting",
            type: "bool",
          },
          {
            internalType: "bool",
            name: "allowSetCustomToken",
            type: "bool",
          },
          {
            internalType: "bool",
            name: "allowTerminalMigration",
            type: "bool",
          },
          {
            internalType: "bool",
            name: "allowSetTerminals",
            type: "bool",
          },
          {
            internalType: "bool",
            name: "allowSetController",
            type: "bool",
          },
          {
            internalType: "bool",
            name: "allowAddAccountingContext",
            type: "bool",
          },
          {
            internalType: "bool",
            name: "allowAddPriceFeed",
            type: "bool",
          },
          {
            internalType: "bool",
            name: "ownerMustSendPayouts",
            type: "bool",
          },
          {
            internalType: "bool",
            name: "holdFees",
            type: "bool",
          },
          {
            internalType: "bool",
            name: "useTotalSurplusForCashOuts",
            type: "bool",
          },
          {
            internalType: "bool",
            name: "useDataHookForPay",
            type: "bool",
          },
          {
            internalType: "bool",
            name: "useDataHookForCashOut",
            type: "bool",
          },
          {
            internalType: "address",
            name: "dataHook",
            type: "address",
          },
          {
            internalType: "uint16",
            name: "metadata",
            type: "uint16",
          },
        ],
        internalType: "struct JBRulesetMetadata",
        name: "metadata",
        type: "tuple",
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
        internalType: "bytes32",
        name: "salt",
        type: "bytes32",
      },
    ],
    name: "deployERC20For",
    outputs: [
      {
        internalType: "contract IJBToken",
        name: "token",
        type: "address",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "contract IJBTerminal",
        name: "terminal",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "projectId",
        type: "uint256",
      },
      {
        internalType: "contract IJBToken",
        name: "token",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "splitTokenCount",
        type: "uint256",
      },
      {
        internalType: "address",
        name: "beneficiary",
        type: "address",
      },
      {
        internalType: "bytes",
        name: "metadata",
        type: "bytes",
      },
    ],
    name: "executePayReservedTokenToTerminal",
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
        internalType: "uint256",
        name: "rulesetId",
        type: "uint256",
      },
    ],
    name: "getRulesetOf",
    outputs: [
      {
        components: [
          {
            internalType: "uint48",
            name: "cycleNumber",
            type: "uint48",
          },
          {
            internalType: "uint48",
            name: "id",
            type: "uint48",
          },
          {
            internalType: "uint48",
            name: "basedOnId",
            type: "uint48",
          },
          {
            internalType: "uint48",
            name: "start",
            type: "uint48",
          },
          {
            internalType: "uint32",
            name: "duration",
            type: "uint32",
          },
          {
            internalType: "uint112",
            name: "weight",
            type: "uint112",
          },
          {
            internalType: "uint32",
            name: "weightCutPercent",
            type: "uint32",
          },
          {
            internalType: "contract IJBRulesetApprovalHook",
            name: "approvalHook",
            type: "address",
          },
          {
            internalType: "uint256",
            name: "metadata",
            type: "uint256",
          },
        ],
        internalType: "struct JBRuleset",
        name: "ruleset",
        type: "tuple",
      },
      {
        components: [
          {
            internalType: "uint16",
            name: "reservedPercent",
            type: "uint16",
          },
          {
            internalType: "uint16",
            name: "cashOutTaxRate",
            type: "uint16",
          },
          {
            internalType: "uint32",
            name: "baseCurrency",
            type: "uint32",
          },
          {
            internalType: "bool",
            name: "pausePay",
            type: "bool",
          },
          {
            internalType: "bool",
            name: "pauseCreditTransfers",
            type: "bool",
          },
          {
            internalType: "bool",
            name: "allowOwnerMinting",
            type: "bool",
          },
          {
            internalType: "bool",
            name: "allowSetCustomToken",
            type: "bool",
          },
          {
            internalType: "bool",
            name: "allowTerminalMigration",
            type: "bool",
          },
          {
            internalType: "bool",
            name: "allowSetTerminals",
            type: "bool",
          },
          {
            internalType: "bool",
            name: "allowSetController",
            type: "bool",
          },
          {
            internalType: "bool",
            name: "allowAddAccountingContext",
            type: "bool",
          },
          {
            internalType: "bool",
            name: "allowAddPriceFeed",
            type: "bool",
          },
          {
            internalType: "bool",
            name: "ownerMustSendPayouts",
            type: "bool",
          },
          {
            internalType: "bool",
            name: "holdFees",
            type: "bool",
          },
          {
            internalType: "bool",
            name: "useTotalSurplusForCashOuts",
            type: "bool",
          },
          {
            internalType: "bool",
            name: "useDataHookForPay",
            type: "bool",
          },
          {
            internalType: "bool",
            name: "useDataHookForCashOut",
            type: "bool",
          },
          {
            internalType: "address",
            name: "dataHook",
            type: "address",
          },
          {
            internalType: "uint16",
            name: "metadata",
            type: "uint16",
          },
        ],
        internalType: "struct JBRulesetMetadata",
        name: "metadata",
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
        internalType: "uint256",
        name: "projectId",
        type: "uint256",
      },
    ],
    name: "latestQueuedRulesetOf",
    outputs: [
      {
        components: [
          {
            internalType: "uint48",
            name: "cycleNumber",
            type: "uint48",
          },
          {
            internalType: "uint48",
            name: "id",
            type: "uint48",
          },
          {
            internalType: "uint48",
            name: "basedOnId",
            type: "uint48",
          },
          {
            internalType: "uint48",
            name: "start",
            type: "uint48",
          },
          {
            internalType: "uint32",
            name: "duration",
            type: "uint32",
          },
          {
            internalType: "uint112",
            name: "weight",
            type: "uint112",
          },
          {
            internalType: "uint32",
            name: "weightCutPercent",
            type: "uint32",
          },
          {
            internalType: "contract IJBRulesetApprovalHook",
            name: "approvalHook",
            type: "address",
          },
          {
            internalType: "uint256",
            name: "metadata",
            type: "uint256",
          },
        ],
        internalType: "struct JBRuleset",
        name: "ruleset",
        type: "tuple",
      },
      {
        components: [
          {
            internalType: "uint16",
            name: "reservedPercent",
            type: "uint16",
          },
          {
            internalType: "uint16",
            name: "cashOutTaxRate",
            type: "uint16",
          },
          {
            internalType: "uint32",
            name: "baseCurrency",
            type: "uint32",
          },
          {
            internalType: "bool",
            name: "pausePay",
            type: "bool",
          },
          {
            internalType: "bool",
            name: "pauseCreditTransfers",
            type: "bool",
          },
          {
            internalType: "bool",
            name: "allowOwnerMinting",
            type: "bool",
          },
          {
            internalType: "bool",
            name: "allowSetCustomToken",
            type: "bool",
          },
          {
            internalType: "bool",
            name: "allowTerminalMigration",
            type: "bool",
          },
          {
            internalType: "bool",
            name: "allowSetTerminals",
            type: "bool",
          },
          {
            internalType: "bool",
            name: "allowSetController",
            type: "bool",
          },
          {
            internalType: "bool",
            name: "allowAddAccountingContext",
            type: "bool",
          },
          {
            internalType: "bool",
            name: "allowAddPriceFeed",
            type: "bool",
          },
          {
            internalType: "bool",
            name: "ownerMustSendPayouts",
            type: "bool",
          },
          {
            internalType: "bool",
            name: "holdFees",
            type: "bool",
          },
          {
            internalType: "bool",
            name: "useTotalSurplusForCashOuts",
            type: "bool",
          },
          {
            internalType: "bool",
            name: "useDataHookForPay",
            type: "bool",
          },
          {
            internalType: "bool",
            name: "useDataHookForCashOut",
            type: "bool",
          },
          {
            internalType: "address",
            name: "dataHook",
            type: "address",
          },
          {
            internalType: "uint16",
            name: "metadata",
            type: "uint16",
          },
        ],
        internalType: "struct JBRulesetMetadata",
        name: "metadata",
        type: "tuple",
      },
      {
        internalType: "enum JBApprovalStatus",
        name: "approvalStatus",
        type: "uint8",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "owner",
        type: "address",
      },
      {
        internalType: "string",
        name: "projectUri",
        type: "string",
      },
      {
        components: [
          {
            internalType: "uint48",
            name: "mustStartAtOrAfter",
            type: "uint48",
          },
          {
            internalType: "uint32",
            name: "duration",
            type: "uint32",
          },
          {
            internalType: "uint112",
            name: "weight",
            type: "uint112",
          },
          {
            internalType: "uint32",
            name: "weightCutPercent",
            type: "uint32",
          },
          {
            internalType: "contract IJBRulesetApprovalHook",
            name: "approvalHook",
            type: "address",
          },
          {
            components: [
              {
                internalType: "uint16",
                name: "reservedPercent",
                type: "uint16",
              },
              {
                internalType: "uint16",
                name: "cashOutTaxRate",
                type: "uint16",
              },
              {
                internalType: "uint32",
                name: "baseCurrency",
                type: "uint32",
              },
              {
                internalType: "bool",
                name: "pausePay",
                type: "bool",
              },
              {
                internalType: "bool",
                name: "pauseCreditTransfers",
                type: "bool",
              },
              {
                internalType: "bool",
                name: "allowOwnerMinting",
                type: "bool",
              },
              {
                internalType: "bool",
                name: "allowSetCustomToken",
                type: "bool",
              },
              {
                internalType: "bool",
                name: "allowTerminalMigration",
                type: "bool",
              },
              {
                internalType: "bool",
                name: "allowSetTerminals",
                type: "bool",
              },
              {
                internalType: "bool",
                name: "allowSetController",
                type: "bool",
              },
              {
                internalType: "bool",
                name: "allowAddAccountingContext",
                type: "bool",
              },
              {
                internalType: "bool",
                name: "allowAddPriceFeed",
                type: "bool",
              },
              {
                internalType: "bool",
                name: "ownerMustSendPayouts",
                type: "bool",
              },
              {
                internalType: "bool",
                name: "holdFees",
                type: "bool",
              },
              {
                internalType: "bool",
                name: "useTotalSurplusForCashOuts",
                type: "bool",
              },
              {
                internalType: "bool",
                name: "useDataHookForPay",
                type: "bool",
              },
              {
                internalType: "bool",
                name: "useDataHookForCashOut",
                type: "bool",
              },
              {
                internalType: "address",
                name: "dataHook",
                type: "address",
              },
              {
                internalType: "uint16",
                name: "metadata",
                type: "uint16",
              },
            ],
            internalType: "struct JBRulesetMetadata",
            name: "metadata",
            type: "tuple",
          },
          {
            components: [
              {
                internalType: "uint256",
                name: "groupId",
                type: "uint256",
              },
              {
                components: [
                  {
                    internalType: "uint32",
                    name: "percent",
                    type: "uint32",
                  },
                  {
                    internalType: "uint64",
                    name: "projectId",
                    type: "uint64",
                  },
                  {
                    internalType: "address payable",
                    name: "beneficiary",
                    type: "address",
                  },
                  {
                    internalType: "bool",
                    name: "preferAddToBalance",
                    type: "bool",
                  },
                  {
                    internalType: "uint48",
                    name: "lockedUntil",
                    type: "uint48",
                  },
                  {
                    internalType: "contract IJBSplitHook",
                    name: "hook",
                    type: "address",
                  },
                ],
                internalType: "struct JBSplit[]",
                name: "splits",
                type: "tuple[]",
              },
            ],
            internalType: "struct JBSplitGroup[]",
            name: "splitGroups",
            type: "tuple[]",
          },
          {
            components: [
              {
                internalType: "address",
                name: "terminal",
                type: "address",
              },
              {
                internalType: "address",
                name: "token",
                type: "address",
              },
              {
                components: [
                  {
                    internalType: "uint224",
                    name: "amount",
                    type: "uint224",
                  },
                  {
                    internalType: "uint32",
                    name: "currency",
                    type: "uint32",
                  },
                ],
                internalType: "struct JBCurrencyAmount[]",
                name: "payoutLimits",
                type: "tuple[]",
              },
              {
                components: [
                  {
                    internalType: "uint224",
                    name: "amount",
                    type: "uint224",
                  },
                  {
                    internalType: "uint32",
                    name: "currency",
                    type: "uint32",
                  },
                ],
                internalType: "struct JBCurrencyAmount[]",
                name: "surplusAllowances",
                type: "tuple[]",
              },
            ],
            internalType: "struct JBFundAccessLimitGroup[]",
            name: "fundAccessLimitGroups",
            type: "tuple[]",
          },
        ],
        internalType: "struct JBRulesetConfig[]",
        name: "rulesetConfigurations",
        type: "tuple[]",
      },
      {
        components: [
          {
            internalType: "contract IJBTerminal",
            name: "terminal",
            type: "address",
          },
          {
            components: [
              {
                internalType: "address",
                name: "token",
                type: "address",
              },
              {
                internalType: "uint8",
                name: "decimals",
                type: "uint8",
              },
              {
                internalType: "uint32",
                name: "currency",
                type: "uint32",
              },
            ],
            internalType: "struct JBAccountingContext[]",
            name: "accountingContextsToAccept",
            type: "tuple[]",
          },
        ],
        internalType: "struct JBTerminalConfig[]",
        name: "terminalConfigurations",
        type: "tuple[]",
      },
      {
        internalType: "string",
        name: "memo",
        type: "string",
      },
    ],
    name: "launchProjectFor",
    outputs: [
      {
        internalType: "uint256",
        name: "projectId",
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
        name: "projectId",
        type: "uint256",
      },
      {
        components: [
          {
            internalType: "uint48",
            name: "mustStartAtOrAfter",
            type: "uint48",
          },
          {
            internalType: "uint32",
            name: "duration",
            type: "uint32",
          },
          {
            internalType: "uint112",
            name: "weight",
            type: "uint112",
          },
          {
            internalType: "uint32",
            name: "weightCutPercent",
            type: "uint32",
          },
          {
            internalType: "contract IJBRulesetApprovalHook",
            name: "approvalHook",
            type: "address",
          },
          {
            components: [
              {
                internalType: "uint16",
                name: "reservedPercent",
                type: "uint16",
              },
              {
                internalType: "uint16",
                name: "cashOutTaxRate",
                type: "uint16",
              },
              {
                internalType: "uint32",
                name: "baseCurrency",
                type: "uint32",
              },
              {
                internalType: "bool",
                name: "pausePay",
                type: "bool",
              },
              {
                internalType: "bool",
                name: "pauseCreditTransfers",
                type: "bool",
              },
              {
                internalType: "bool",
                name: "allowOwnerMinting",
                type: "bool",
              },
              {
                internalType: "bool",
                name: "allowSetCustomToken",
                type: "bool",
              },
              {
                internalType: "bool",
                name: "allowTerminalMigration",
                type: "bool",
              },
              {
                internalType: "bool",
                name: "allowSetTerminals",
                type: "bool",
              },
              {
                internalType: "bool",
                name: "allowSetController",
                type: "bool",
              },
              {
                internalType: "bool",
                name: "allowAddAccountingContext",
                type: "bool",
              },
              {
                internalType: "bool",
                name: "allowAddPriceFeed",
                type: "bool",
              },
              {
                internalType: "bool",
                name: "ownerMustSendPayouts",
                type: "bool",
              },
              {
                internalType: "bool",
                name: "holdFees",
                type: "bool",
              },
              {
                internalType: "bool",
                name: "useTotalSurplusForCashOuts",
                type: "bool",
              },
              {
                internalType: "bool",
                name: "useDataHookForPay",
                type: "bool",
              },
              {
                internalType: "bool",
                name: "useDataHookForCashOut",
                type: "bool",
              },
              {
                internalType: "address",
                name: "dataHook",
                type: "address",
              },
              {
                internalType: "uint16",
                name: "metadata",
                type: "uint16",
              },
            ],
            internalType: "struct JBRulesetMetadata",
            name: "metadata",
            type: "tuple",
          },
          {
            components: [
              {
                internalType: "uint256",
                name: "groupId",
                type: "uint256",
              },
              {
                components: [
                  {
                    internalType: "uint32",
                    name: "percent",
                    type: "uint32",
                  },
                  {
                    internalType: "uint64",
                    name: "projectId",
                    type: "uint64",
                  },
                  {
                    internalType: "address payable",
                    name: "beneficiary",
                    type: "address",
                  },
                  {
                    internalType: "bool",
                    name: "preferAddToBalance",
                    type: "bool",
                  },
                  {
                    internalType: "uint48",
                    name: "lockedUntil",
                    type: "uint48",
                  },
                  {
                    internalType: "contract IJBSplitHook",
                    name: "hook",
                    type: "address",
                  },
                ],
                internalType: "struct JBSplit[]",
                name: "splits",
                type: "tuple[]",
              },
            ],
            internalType: "struct JBSplitGroup[]",
            name: "splitGroups",
            type: "tuple[]",
          },
          {
            components: [
              {
                internalType: "address",
                name: "terminal",
                type: "address",
              },
              {
                internalType: "address",
                name: "token",
                type: "address",
              },
              {
                components: [
                  {
                    internalType: "uint224",
                    name: "amount",
                    type: "uint224",
                  },
                  {
                    internalType: "uint32",
                    name: "currency",
                    type: "uint32",
                  },
                ],
                internalType: "struct JBCurrencyAmount[]",
                name: "payoutLimits",
                type: "tuple[]",
              },
              {
                components: [
                  {
                    internalType: "uint224",
                    name: "amount",
                    type: "uint224",
                  },
                  {
                    internalType: "uint32",
                    name: "currency",
                    type: "uint32",
                  },
                ],
                internalType: "struct JBCurrencyAmount[]",
                name: "surplusAllowances",
                type: "tuple[]",
              },
            ],
            internalType: "struct JBFundAccessLimitGroup[]",
            name: "fundAccessLimitGroups",
            type: "tuple[]",
          },
        ],
        internalType: "struct JBRulesetConfig[]",
        name: "rulesetConfigurations",
        type: "tuple[]",
      },
      {
        components: [
          {
            internalType: "contract IJBTerminal",
            name: "terminal",
            type: "address",
          },
          {
            components: [
              {
                internalType: "address",
                name: "token",
                type: "address",
              },
              {
                internalType: "uint8",
                name: "decimals",
                type: "uint8",
              },
              {
                internalType: "uint32",
                name: "currency",
                type: "uint32",
              },
            ],
            internalType: "struct JBAccountingContext[]",
            name: "accountingContextsToAccept",
            type: "tuple[]",
          },
        ],
        internalType: "struct JBTerminalConfig[]",
        name: "terminalConfigurations",
        type: "tuple[]",
      },
      {
        internalType: "string",
        name: "memo",
        type: "string",
      },
    ],
    name: "launchRulesetsFor",
    outputs: [
      {
        internalType: "uint256",
        name: "rulesetId",
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
        name: "projectId",
        type: "uint256",
      },
      {
        internalType: "contract IERC165",
        name: "to",
        type: "address",
      },
    ],
    name: "migrate",
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
        internalType: "uint256",
        name: "tokenCount",
        type: "uint256",
      },
      {
        internalType: "address",
        name: "beneficiary",
        type: "address",
      },
      {
        internalType: "string",
        name: "memo",
        type: "string",
      },
      {
        internalType: "bool",
        name: "useReservedPercent",
        type: "bool",
      },
    ],
    name: "mintTokensOf",
    outputs: [
      {
        internalType: "uint256",
        name: "beneficiaryTokenCount",
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
        name: "projectId",
        type: "uint256",
      },
    ],
    name: "pendingReservedTokenBalanceOf",
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
        name: "projectId",
        type: "uint256",
      },
      {
        components: [
          {
            internalType: "uint48",
            name: "mustStartAtOrAfter",
            type: "uint48",
          },
          {
            internalType: "uint32",
            name: "duration",
            type: "uint32",
          },
          {
            internalType: "uint112",
            name: "weight",
            type: "uint112",
          },
          {
            internalType: "uint32",
            name: "weightCutPercent",
            type: "uint32",
          },
          {
            internalType: "contract IJBRulesetApprovalHook",
            name: "approvalHook",
            type: "address",
          },
          {
            components: [
              {
                internalType: "uint16",
                name: "reservedPercent",
                type: "uint16",
              },
              {
                internalType: "uint16",
                name: "cashOutTaxRate",
                type: "uint16",
              },
              {
                internalType: "uint32",
                name: "baseCurrency",
                type: "uint32",
              },
              {
                internalType: "bool",
                name: "pausePay",
                type: "bool",
              },
              {
                internalType: "bool",
                name: "pauseCreditTransfers",
                type: "bool",
              },
              {
                internalType: "bool",
                name: "allowOwnerMinting",
                type: "bool",
              },
              {
                internalType: "bool",
                name: "allowSetCustomToken",
                type: "bool",
              },
              {
                internalType: "bool",
                name: "allowTerminalMigration",
                type: "bool",
              },
              {
                internalType: "bool",
                name: "allowSetTerminals",
                type: "bool",
              },
              {
                internalType: "bool",
                name: "allowSetController",
                type: "bool",
              },
              {
                internalType: "bool",
                name: "allowAddAccountingContext",
                type: "bool",
              },
              {
                internalType: "bool",
                name: "allowAddPriceFeed",
                type: "bool",
              },
              {
                internalType: "bool",
                name: "ownerMustSendPayouts",
                type: "bool",
              },
              {
                internalType: "bool",
                name: "holdFees",
                type: "bool",
              },
              {
                internalType: "bool",
                name: "useTotalSurplusForCashOuts",
                type: "bool",
              },
              {
                internalType: "bool",
                name: "useDataHookForPay",
                type: "bool",
              },
              {
                internalType: "bool",
                name: "useDataHookForCashOut",
                type: "bool",
              },
              {
                internalType: "address",
                name: "dataHook",
                type: "address",
              },
              {
                internalType: "uint16",
                name: "metadata",
                type: "uint16",
              },
            ],
            internalType: "struct JBRulesetMetadata",
            name: "metadata",
            type: "tuple",
          },
          {
            components: [
              {
                internalType: "uint256",
                name: "groupId",
                type: "uint256",
              },
              {
                components: [
                  {
                    internalType: "uint32",
                    name: "percent",
                    type: "uint32",
                  },
                  {
                    internalType: "uint64",
                    name: "projectId",
                    type: "uint64",
                  },
                  {
                    internalType: "address payable",
                    name: "beneficiary",
                    type: "address",
                  },
                  {
                    internalType: "bool",
                    name: "preferAddToBalance",
                    type: "bool",
                  },
                  {
                    internalType: "uint48",
                    name: "lockedUntil",
                    type: "uint48",
                  },
                  {
                    internalType: "contract IJBSplitHook",
                    name: "hook",
                    type: "address",
                  },
                ],
                internalType: "struct JBSplit[]",
                name: "splits",
                type: "tuple[]",
              },
            ],
            internalType: "struct JBSplitGroup[]",
            name: "splitGroups",
            type: "tuple[]",
          },
          {
            components: [
              {
                internalType: "address",
                name: "terminal",
                type: "address",
              },
              {
                internalType: "address",
                name: "token",
                type: "address",
              },
              {
                components: [
                  {
                    internalType: "uint224",
                    name: "amount",
                    type: "uint224",
                  },
                  {
                    internalType: "uint32",
                    name: "currency",
                    type: "uint32",
                  },
                ],
                internalType: "struct JBCurrencyAmount[]",
                name: "payoutLimits",
                type: "tuple[]",
              },
              {
                components: [
                  {
                    internalType: "uint224",
                    name: "amount",
                    type: "uint224",
                  },
                  {
                    internalType: "uint32",
                    name: "currency",
                    type: "uint32",
                  },
                ],
                internalType: "struct JBCurrencyAmount[]",
                name: "surplusAllowances",
                type: "tuple[]",
              },
            ],
            internalType: "struct JBFundAccessLimitGroup[]",
            name: "fundAccessLimitGroups",
            type: "tuple[]",
          },
        ],
        internalType: "struct JBRulesetConfig[]",
        name: "rulesetConfigurations",
        type: "tuple[]",
      },
      {
        internalType: "string",
        name: "memo",
        type: "string",
      },
    ],
    name: "queueRulesetsOf",
    outputs: [
      {
        internalType: "uint256",
        name: "rulesetId",
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
        name: "projectId",
        type: "uint256",
      },
    ],
    name: "sendReservedTokensToSplitsOf",
    outputs: [
      {
        internalType: "uint256",
        name: "",
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
        name: "projectId",
        type: "uint256",
      },
    ],
    name: "setControllerAllowed",
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
      {
        internalType: "uint256",
        name: "rulesetId",
        type: "uint256",
      },
      {
        components: [
          {
            internalType: "uint256",
            name: "groupId",
            type: "uint256",
          },
          {
            components: [
              {
                internalType: "uint32",
                name: "percent",
                type: "uint32",
              },
              {
                internalType: "uint64",
                name: "projectId",
                type: "uint64",
              },
              {
                internalType: "address payable",
                name: "beneficiary",
                type: "address",
              },
              {
                internalType: "bool",
                name: "preferAddToBalance",
                type: "bool",
              },
              {
                internalType: "uint48",
                name: "lockedUntil",
                type: "uint48",
              },
              {
                internalType: "contract IJBSplitHook",
                name: "hook",
                type: "address",
              },
            ],
            internalType: "struct JBSplit[]",
            name: "splits",
            type: "tuple[]",
          },
        ],
        internalType: "struct JBSplitGroup[]",
        name: "splitGroups",
        type: "tuple[]",
      },
    ],
    name: "setSplitGroupsOf",
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
    ],
    name: "setTerminalsAllowed",
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
      {
        internalType: "contract IJBToken",
        name: "token",
        type: "address",
      },
    ],
    name: "setTokenFor",
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
        internalType: "string",
        name: "uri",
        type: "string",
      },
    ],
    name: "setUriOf",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes4",
        name: "interfaceId",
        type: "bytes4",
      },
    ],
    name: "supportsInterface",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "pure",
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
    name: "totalTokenSupplyWithReservedTokensOf",
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
        name: "holder",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "projectId",
        type: "uint256",
      },
      {
        internalType: "address",
        name: "recipient",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "creditCount",
        type: "uint256",
      },
    ],
    name: "transferCreditsFrom",
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
        internalType: "uint256",
        name: "projectId",
        type: "uint256",
      },
    ],
    name: "upcomingRulesetOf",
    outputs: [
      {
        components: [
          {
            internalType: "uint48",
            name: "cycleNumber",
            type: "uint48",
          },
          {
            internalType: "uint48",
            name: "id",
            type: "uint48",
          },
          {
            internalType: "uint48",
            name: "basedOnId",
            type: "uint48",
          },
          {
            internalType: "uint48",
            name: "start",
            type: "uint48",
          },
          {
            internalType: "uint32",
            name: "duration",
            type: "uint32",
          },
          {
            internalType: "uint112",
            name: "weight",
            type: "uint112",
          },
          {
            internalType: "uint32",
            name: "weightCutPercent",
            type: "uint32",
          },
          {
            internalType: "contract IJBRulesetApprovalHook",
            name: "approvalHook",
            type: "address",
          },
          {
            internalType: "uint256",
            name: "metadata",
            type: "uint256",
          },
        ],
        internalType: "struct JBRuleset",
        name: "ruleset",
        type: "tuple",
      },
      {
        components: [
          {
            internalType: "uint16",
            name: "reservedPercent",
            type: "uint16",
          },
          {
            internalType: "uint16",
            name: "cashOutTaxRate",
            type: "uint16",
          },
          {
            internalType: "uint32",
            name: "baseCurrency",
            type: "uint32",
          },
          {
            internalType: "bool",
            name: "pausePay",
            type: "bool",
          },
          {
            internalType: "bool",
            name: "pauseCreditTransfers",
            type: "bool",
          },
          {
            internalType: "bool",
            name: "allowOwnerMinting",
            type: "bool",
          },
          {
            internalType: "bool",
            name: "allowSetCustomToken",
            type: "bool",
          },
          {
            internalType: "bool",
            name: "allowTerminalMigration",
            type: "bool",
          },
          {
            internalType: "bool",
            name: "allowSetTerminals",
            type: "bool",
          },
          {
            internalType: "bool",
            name: "allowSetController",
            type: "bool",
          },
          {
            internalType: "bool",
            name: "allowAddAccountingContext",
            type: "bool",
          },
          {
            internalType: "bool",
            name: "allowAddPriceFeed",
            type: "bool",
          },
          {
            internalType: "bool",
            name: "ownerMustSendPayouts",
            type: "bool",
          },
          {
            internalType: "bool",
            name: "holdFees",
            type: "bool",
          },
          {
            internalType: "bool",
            name: "useTotalSurplusForCashOuts",
            type: "bool",
          },
          {
            internalType: "bool",
            name: "useDataHookForPay",
            type: "bool",
          },
          {
            internalType: "bool",
            name: "useDataHookForCashOut",
            type: "bool",
          },
          {
            internalType: "address",
            name: "dataHook",
            type: "address",
          },
          {
            internalType: "uint16",
            name: "metadata",
            type: "uint16",
          },
        ],
        internalType: "struct JBRulesetMetadata",
        name: "metadata",
        type: "tuple",
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
    name: "uriOf",
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
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "holder",
        type: "address",
      },
      {
        indexed: true,
        internalType: "uint256",
        name: "projectId",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "tokenCount",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "string",
        name: "memo",
        type: "string",
      },
      {
        indexed: false,
        internalType: "address",
        name: "caller",
        type: "address",
      },
    ],
    name: "BurnTokens",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "uint256",
        name: "rulesetId",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "projectId",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "string",
        name: "projectUri",
        type: "string",
      },
      {
        indexed: false,
        internalType: "string",
        name: "memo",
        type: "string",
      },
      {
        indexed: false,
        internalType: "address",
        name: "caller",
        type: "address",
      },
    ],
    name: "LaunchProject",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "uint256",
        name: "rulesetId",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "projectId",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "string",
        name: "memo",
        type: "string",
      },
      {
        indexed: false,
        internalType: "address",
        name: "caller",
        type: "address",
      },
    ],
    name: "LaunchRulesets",
    type: "event",
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
        internalType: "contract IERC165",
        name: "to",
        type: "address",
      },
      {
        indexed: false,
        internalType: "address",
        name: "caller",
        type: "address",
      },
    ],
    name: "Migrate",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "beneficiary",
        type: "address",
      },
      {
        indexed: true,
        internalType: "uint256",
        name: "projectId",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "tokenCount",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "beneficiaryTokenCount",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "string",
        name: "memo",
        type: "string",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "reservedPercent",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "address",
        name: "caller",
        type: "address",
      },
    ],
    name: "MintTokens",
    type: "event",
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
        internalType: "address",
        name: "from",
        type: "address",
      },
      {
        indexed: false,
        internalType: "address",
        name: "caller",
        type: "address",
      },
    ],
    name: "PrepMigration",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "uint256",
        name: "rulesetId",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "projectId",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "string",
        name: "memo",
        type: "string",
      },
      {
        indexed: false,
        internalType: "address",
        name: "caller",
        type: "address",
      },
    ],
    name: "QueueRulesets",
    type: "event",
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
        components: [
          {
            internalType: "uint32",
            name: "percent",
            type: "uint32",
          },
          {
            internalType: "uint64",
            name: "projectId",
            type: "uint64",
          },
          {
            internalType: "address payable",
            name: "beneficiary",
            type: "address",
          },
          {
            internalType: "bool",
            name: "preferAddToBalance",
            type: "bool",
          },
          {
            internalType: "uint48",
            name: "lockedUntil",
            type: "uint48",
          },
          {
            internalType: "contract IJBSplitHook",
            name: "hook",
            type: "address",
          },
        ],
        indexed: false,
        internalType: "struct JBSplit",
        name: "split",
        type: "tuple",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "tokenCount",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "bytes",
        name: "reason",
        type: "bytes",
      },
      {
        indexed: false,
        internalType: "address",
        name: "caller",
        type: "address",
      },
    ],
    name: "ReservedDistributionReverted",
    type: "event",
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
        name: "rulesetId",
        type: "uint256",
      },
      {
        indexed: true,
        internalType: "uint256",
        name: "groupId",
        type: "uint256",
      },
      {
        components: [
          {
            internalType: "uint32",
            name: "percent",
            type: "uint32",
          },
          {
            internalType: "uint64",
            name: "projectId",
            type: "uint64",
          },
          {
            internalType: "address payable",
            name: "beneficiary",
            type: "address",
          },
          {
            internalType: "bool",
            name: "preferAddToBalance",
            type: "bool",
          },
          {
            internalType: "uint48",
            name: "lockedUntil",
            type: "uint48",
          },
          {
            internalType: "contract IJBSplitHook",
            name: "hook",
            type: "address",
          },
        ],
        indexed: false,
        internalType: "struct JBSplit",
        name: "split",
        type: "tuple",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "tokenCount",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "address",
        name: "caller",
        type: "address",
      },
    ],
    name: "SendReservedTokensToSplit",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "uint256",
        name: "rulesetId",
        type: "uint256",
      },
      {
        indexed: true,
        internalType: "uint256",
        name: "rulesetCycleNumber",
        type: "uint256",
      },
      {
        indexed: true,
        internalType: "uint256",
        name: "projectId",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "address",
        name: "owner",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "tokenCount",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "leftoverAmount",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "address",
        name: "caller",
        type: "address",
      },
    ],
    name: "SendReservedTokensToSplits",
    type: "event",
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
        internalType: "string",
        name: "uri",
        type: "string",
      },
      {
        indexed: false,
        internalType: "address",
        name: "caller",
        type: "address",
      },
    ],
    name: "SetUri",
    type: "event",
  },
  {
    inputs: [],
    name: "JBController_AddingPriceFeedNotAllowed",
    type: "error",
  },
  {
    inputs: [],
    name: "JBController_CreditTransfersPaused",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "rate",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "limit",
        type: "uint256",
      },
    ],
    name: "JBController_InvalidCashOutTaxRate",
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
    name: "JBController_InvalidReservedPercent",
    type: "error",
  },
  {
    inputs: [],
    name: "JBController_MintNotAllowedAndNotTerminalOrHook",
    type: "error",
  },
  {
    inputs: [],
    name: "JBController_NoReservedTokens",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "sender",
        type: "address",
      },
      {
        internalType: "contract IJBDirectory",
        name: "directory",
        type: "address",
      },
    ],
    name: "JBController_OnlyDirectory",
    type: "error",
  },
  {
    inputs: [],
    name: "JBController_RulesetSetTokenNotAllowed",
    type: "error",
  },
  {
    inputs: [],
    name: "JBController_RulesetsAlreadyLaunched",
    type: "error",
  },
  {
    inputs: [],
    name: "JBController_RulesetsArrayEmpty",
    type: "error",
  },
  {
    inputs: [],
    name: "JBController_ZeroTokensToBurn",
    type: "error",
  },
  {
    inputs: [],
    name: "JBController_ZeroTokensToMint",
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
  {
    inputs: [
      {
        internalType: "address",
        name: "token",
        type: "address",
      },
    ],
    name: "SafeERC20FailedOperation",
    type: "error",
  },
] as const;
