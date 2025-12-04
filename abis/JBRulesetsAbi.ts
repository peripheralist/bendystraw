export const JBRulesetsAbi = [
  {
    inputs: [
      {
        internalType: "contract IJBDirectory",
        name: "directory",
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
    name: "allOf",
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
        internalType: "struct JBRuleset[]",
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
        internalType: "uint256",
        name: "projectId",
        type: "uint256",
      },
    ],
    name: "currentApprovalStatusForLatestRulesetOf",
    outputs: [
      {
        internalType: "enum JBApprovalStatus",
        name: "",
        type: "uint8",
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
    name: "currentOf",
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
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "baseRulesetCycleNumber",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "baseRulesetStart",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "baseRulesetDuration",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "start",
        type: "uint256",
      },
    ],
    name: "deriveCycleNumberFrom",
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
        internalType: "uint256",
        name: "baseRulesetStart",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "baseRulesetDuration",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "mustStartAtOrAfter",
        type: "uint256",
      },
    ],
    name: "deriveStartFrom",
    outputs: [
      {
        internalType: "uint256",
        name: "start",
        type: "uint256",
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
      {
        internalType: "uint256",
        name: "baseRulesetStart",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "baseRulesetDuration",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "baseRulesetWeight",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "baseRulesetWeightCutPercent",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "baseRulesetCacheId",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "start",
        type: "uint256",
      },
    ],
    name: "deriveWeightFrom",
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
    name: "latestQueuedOf",
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
        internalType: "uint256",
        name: "projectId",
        type: "uint256",
      },
    ],
    name: "latestRulesetIdOf",
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
        internalType: "uint256",
        name: "duration",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "weight",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "weightCutPercent",
        type: "uint256",
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
      {
        internalType: "uint256",
        name: "mustStartAtOrAfter",
        type: "uint256",
      },
    ],
    name: "queueFor",
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
        name: "",
        type: "tuple",
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
    name: "upcomingOf",
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
    name: "updateRulesetWeightCache",
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
        name: "rulesetId",
        type: "uint256",
      },
      {
        indexed: true,
        internalType: "uint256",
        name: "projectId",
        type: "uint256",
      },
      {
        indexed: true,
        internalType: "uint256",
        name: "basedOnId",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "address",
        name: "caller",
        type: "address",
      },
    ],
    name: "RulesetInitialized",
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
        name: "projectId",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "duration",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "weight",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "weightCutPercent",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "contract IJBRulesetApprovalHook",
        name: "approvalHook",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "metadata",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "mustStartAtOrAfter",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "address",
        name: "caller",
        type: "address",
      },
    ],
    name: "RulesetQueued",
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
        internalType: "uint112",
        name: "weight",
        type: "uint112",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "weightCutMultiple",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "address",
        name: "caller",
        type: "address",
      },
    ],
    name: "WeightCacheUpdated",
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
        internalType: "contract IJBRulesetApprovalHook",
        name: "hook",
        type: "address",
      },
    ],
    name: "JBRulesets_InvalidRulesetApprovalHook",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "duration",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "limit",
        type: "uint256",
      },
    ],
    name: "JBRulesets_InvalidRulesetDuration",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "timestamp",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "limit",
        type: "uint256",
      },
    ],
    name: "JBRulesets_InvalidRulesetEndTime",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "weight",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "limit",
        type: "uint256",
      },
    ],
    name: "JBRulesets_InvalidWeight",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "percent",
        type: "uint256",
      },
    ],
    name: "JBRulesets_InvalidWeightCutPercent",
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
