export const REVLoansAbi = [
  {
    inputs: [
      {
        internalType: "contract IREVDeployer",
        name: "revnets",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "revId",
        type: "uint256",
      },
      {
        internalType: "address",
        name: "owner",
        type: "address",
      },
      {
        internalType: "contract IPermit2",
        name: "permit2",
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
    stateMutability: "payable",
    type: "fallback",
  },
  {
    stateMutability: "payable",
    type: "receive",
  },
  {
    inputs: [],
    name: "CONTROLLER",
    outputs: [
      {
        internalType: "contract IJBController",
        name: "",
        type: "address",
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
    name: "LOAN_LIQUIDATION_DURATION",
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
    name: "MAX_PREPAID_FEE_PERCENT",
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
    name: "MIN_PREPAID_FEE_PERCENT",
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
    name: "PERMIT2",
    outputs: [
      {
        internalType: "contract IPermit2",
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
    name: "REVNETS",
    outputs: [
      {
        internalType: "contract IREVDeployer",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "REV_ID",
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
    name: "REV_PREPAID_FEE_PERCENT",
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
        name: "to",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "tokenId",
        type: "uint256",
      },
    ],
    name: "approve",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
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
        name: "revnetId",
        type: "uint256",
      },
      {
        components: [
          {
            internalType: "address",
            name: "token",
            type: "address",
          },
          {
            internalType: "contract IJBPayoutTerminal",
            name: "terminal",
            type: "address",
          },
        ],
        internalType: "struct REVLoanSource",
        name: "source",
        type: "tuple",
      },
      {
        internalType: "uint256",
        name: "minBorrowAmount",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "collateralCount",
        type: "uint256",
      },
      {
        internalType: "address payable",
        name: "beneficiary",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "prepaidFeePercent",
        type: "uint256",
      },
    ],
    name: "borrowFrom",
    outputs: [
      {
        internalType: "uint256",
        name: "loanId",
        type: "uint256",
      },
      {
        components: [
          {
            internalType: "uint112",
            name: "amount",
            type: "uint112",
          },
          {
            internalType: "uint112",
            name: "collateral",
            type: "uint112",
          },
          {
            internalType: "uint48",
            name: "createdAt",
            type: "uint48",
          },
          {
            internalType: "uint16",
            name: "prepaidFeePercent",
            type: "uint16",
          },
          {
            internalType: "uint32",
            name: "prepaidDuration",
            type: "uint32",
          },
          {
            components: [
              {
                internalType: "address",
                name: "token",
                type: "address",
              },
              {
                internalType: "contract IJBPayoutTerminal",
                name: "terminal",
                type: "address",
              },
            ],
            internalType: "struct REVLoanSource",
            name: "source",
            type: "tuple",
          },
        ],
        internalType: "struct REVLoan",
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
        name: "revnetId",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "collateralCount",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "decimals",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "currency",
        type: "uint256",
      },
    ],
    name: "borrowableAmountFrom",
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
            internalType: "uint112",
            name: "amount",
            type: "uint112",
          },
          {
            internalType: "uint112",
            name: "collateral",
            type: "uint112",
          },
          {
            internalType: "uint48",
            name: "createdAt",
            type: "uint48",
          },
          {
            internalType: "uint16",
            name: "prepaidFeePercent",
            type: "uint16",
          },
          {
            internalType: "uint32",
            name: "prepaidDuration",
            type: "uint32",
          },
          {
            components: [
              {
                internalType: "address",
                name: "token",
                type: "address",
              },
              {
                internalType: "contract IJBPayoutTerminal",
                name: "terminal",
                type: "address",
              },
            ],
            internalType: "struct REVLoanSource",
            name: "source",
            type: "tuple",
          },
        ],
        internalType: "struct REVLoan",
        name: "loan",
        type: "tuple",
      },
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "determineSourceFeeAmount",
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
    name: "getApproved",
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
        name: "owner",
        type: "address",
      },
      {
        internalType: "address",
        name: "operator",
        type: "address",
      },
    ],
    name: "isApprovedForAll",
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
        name: "revnetId",
        type: "uint256",
      },
      {
        internalType: "contract IJBPayoutTerminal",
        name: "terminal",
        type: "address",
      },
      {
        internalType: "address",
        name: "token",
        type: "address",
      },
    ],
    name: "isLoanSourceOf",
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
    inputs: [
      {
        internalType: "uint256",
        name: "revnetId",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "startingLoanId",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "count",
        type: "uint256",
      },
    ],
    name: "liquidateExpiredLoansFrom",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "loanId",
        type: "uint256",
      },
    ],
    name: "loanOf",
    outputs: [
      {
        components: [
          {
            internalType: "uint112",
            name: "amount",
            type: "uint112",
          },
          {
            internalType: "uint112",
            name: "collateral",
            type: "uint112",
          },
          {
            internalType: "uint48",
            name: "createdAt",
            type: "uint48",
          },
          {
            internalType: "uint16",
            name: "prepaidFeePercent",
            type: "uint16",
          },
          {
            internalType: "uint32",
            name: "prepaidDuration",
            type: "uint32",
          },
          {
            components: [
              {
                internalType: "address",
                name: "token",
                type: "address",
              },
              {
                internalType: "contract IJBPayoutTerminal",
                name: "terminal",
                type: "address",
              },
            ],
            internalType: "struct REVLoanSource",
            name: "source",
            type: "tuple",
          },
        ],
        internalType: "struct REVLoan",
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
        internalType: "uint256",
        name: "revnetId",
        type: "uint256",
      },
    ],
    name: "loanSourcesOf",
    outputs: [
      {
        components: [
          {
            internalType: "address",
            name: "token",
            type: "address",
          },
          {
            internalType: "contract IJBPayoutTerminal",
            name: "terminal",
            type: "address",
          },
        ],
        internalType: "struct REVLoanSource[]",
        name: "",
        type: "tuple[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "name",
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
        name: "revnetId",
        type: "uint256",
      },
    ],
    name: "numberOfLoansFor",
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
    inputs: [
      {
        internalType: "uint256",
        name: "tokenId",
        type: "uint256",
      },
    ],
    name: "ownerOf",
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
        name: "loanId",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "collateralCountToTransfer",
        type: "uint256",
      },
      {
        components: [
          {
            internalType: "address",
            name: "token",
            type: "address",
          },
          {
            internalType: "contract IJBPayoutTerminal",
            name: "terminal",
            type: "address",
          },
        ],
        internalType: "struct REVLoanSource",
        name: "source",
        type: "tuple",
      },
      {
        internalType: "uint256",
        name: "minBorrowAmount",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "collateralCountToAdd",
        type: "uint256",
      },
      {
        internalType: "address payable",
        name: "beneficiary",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "prepaidFeePercent",
        type: "uint256",
      },
    ],
    name: "reallocateCollateralFromLoan",
    outputs: [
      {
        internalType: "uint256",
        name: "reallocatedLoanId",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "newLoanId",
        type: "uint256",
      },
      {
        components: [
          {
            internalType: "uint112",
            name: "amount",
            type: "uint112",
          },
          {
            internalType: "uint112",
            name: "collateral",
            type: "uint112",
          },
          {
            internalType: "uint48",
            name: "createdAt",
            type: "uint48",
          },
          {
            internalType: "uint16",
            name: "prepaidFeePercent",
            type: "uint16",
          },
          {
            internalType: "uint32",
            name: "prepaidDuration",
            type: "uint32",
          },
          {
            components: [
              {
                internalType: "address",
                name: "token",
                type: "address",
              },
              {
                internalType: "contract IJBPayoutTerminal",
                name: "terminal",
                type: "address",
              },
            ],
            internalType: "struct REVLoanSource",
            name: "source",
            type: "tuple",
          },
        ],
        internalType: "struct REVLoan",
        name: "reallocatedLoan",
        type: "tuple",
      },
      {
        components: [
          {
            internalType: "uint112",
            name: "amount",
            type: "uint112",
          },
          {
            internalType: "uint112",
            name: "collateral",
            type: "uint112",
          },
          {
            internalType: "uint48",
            name: "createdAt",
            type: "uint48",
          },
          {
            internalType: "uint16",
            name: "prepaidFeePercent",
            type: "uint16",
          },
          {
            internalType: "uint32",
            name: "prepaidDuration",
            type: "uint32",
          },
          {
            components: [
              {
                internalType: "address",
                name: "token",
                type: "address",
              },
              {
                internalType: "contract IJBPayoutTerminal",
                name: "terminal",
                type: "address",
              },
            ],
            internalType: "struct REVLoanSource",
            name: "source",
            type: "tuple",
          },
        ],
        internalType: "struct REVLoan",
        name: "newLoan",
        type: "tuple",
      },
    ],
    stateMutability: "payable",
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
        internalType: "uint256",
        name: "loanId",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "maxRepayBorrowAmount",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "collateralCountToReturn",
        type: "uint256",
      },
      {
        internalType: "address payable",
        name: "beneficiary",
        type: "address",
      },
      {
        components: [
          {
            internalType: "uint256",
            name: "sigDeadline",
            type: "uint256",
          },
          {
            internalType: "uint160",
            name: "amount",
            type: "uint160",
          },
          {
            internalType: "uint48",
            name: "expiration",
            type: "uint48",
          },
          {
            internalType: "uint48",
            name: "nonce",
            type: "uint48",
          },
          {
            internalType: "bytes",
            name: "signature",
            type: "bytes",
          },
        ],
        internalType: "struct JBSingleAllowance",
        name: "allowance",
        type: "tuple",
      },
    ],
    name: "repayLoan",
    outputs: [
      {
        internalType: "uint256",
        name: "paidOffLoanId",
        type: "uint256",
      },
      {
        components: [
          {
            internalType: "uint112",
            name: "amount",
            type: "uint112",
          },
          {
            internalType: "uint112",
            name: "collateral",
            type: "uint112",
          },
          {
            internalType: "uint48",
            name: "createdAt",
            type: "uint48",
          },
          {
            internalType: "uint16",
            name: "prepaidFeePercent",
            type: "uint16",
          },
          {
            internalType: "uint32",
            name: "prepaidDuration",
            type: "uint32",
          },
          {
            components: [
              {
                internalType: "address",
                name: "token",
                type: "address",
              },
              {
                internalType: "contract IJBPayoutTerminal",
                name: "terminal",
                type: "address",
              },
            ],
            internalType: "struct REVLoanSource",
            name: "source",
            type: "tuple",
          },
        ],
        internalType: "struct REVLoan",
        name: "paidOffloan",
        type: "tuple",
      },
    ],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "loanId",
        type: "uint256",
      },
    ],
    name: "revnetIdOfLoanWith",
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
        name: "from",
        type: "address",
      },
      {
        internalType: "address",
        name: "to",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "tokenId",
        type: "uint256",
      },
    ],
    name: "safeTransferFrom",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
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
    name: "safeTransferFrom",
    outputs: [],
    stateMutability: "nonpayable",
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
        internalType: "bool",
        name: "approved",
        type: "bool",
      },
    ],
    name: "setApprovalForAll",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "contract IJBTokenUriResolver",
        name: "resolver",
        type: "address",
      },
    ],
    name: "setTokenUriResolver",
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
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "symbol",
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
        name: "loanId",
        type: "uint256",
      },
    ],
    name: "tokenURI",
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
    name: "tokenUriResolver",
    outputs: [
      {
        internalType: "contract IJBTokenUriResolver",
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
        name: "revnetId",
        type: "uint256",
      },
      {
        internalType: "contract IJBPayoutTerminal",
        name: "terminal",
        type: "address",
      },
      {
        internalType: "address",
        name: "token",
        type: "address",
      },
    ],
    name: "totalBorrowedFrom",
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
        name: "revnetId",
        type: "uint256",
      },
    ],
    name: "totalCollateralOf",
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
        name: "from",
        type: "address",
      },
      {
        internalType: "address",
        name: "to",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "tokenId",
        type: "uint256",
      },
    ],
    name: "transferFrom",
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
        name: "owner",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "approved",
        type: "address",
      },
      {
        indexed: true,
        internalType: "uint256",
        name: "tokenId",
        type: "uint256",
      },
    ],
    name: "Approval",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "owner",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "operator",
        type: "address",
      },
      {
        indexed: false,
        internalType: "bool",
        name: "approved",
        type: "bool",
      },
    ],
    name: "ApprovalForAll",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "uint256",
        name: "loanId",
        type: "uint256",
      },
      {
        indexed: true,
        internalType: "uint256",
        name: "revnetId",
        type: "uint256",
      },
      {
        components: [
          {
            internalType: "uint112",
            name: "amount",
            type: "uint112",
          },
          {
            internalType: "uint112",
            name: "collateral",
            type: "uint112",
          },
          {
            internalType: "uint48",
            name: "createdAt",
            type: "uint48",
          },
          {
            internalType: "uint16",
            name: "prepaidFeePercent",
            type: "uint16",
          },
          {
            internalType: "uint32",
            name: "prepaidDuration",
            type: "uint32",
          },
          {
            components: [
              {
                internalType: "address",
                name: "token",
                type: "address",
              },
              {
                internalType: "contract IJBPayoutTerminal",
                name: "terminal",
                type: "address",
              },
            ],
            internalType: "struct REVLoanSource",
            name: "source",
            type: "tuple",
          },
        ],
        indexed: false,
        internalType: "struct REVLoan",
        name: "loan",
        type: "tuple",
      },
      {
        components: [
          {
            internalType: "address",
            name: "token",
            type: "address",
          },
          {
            internalType: "contract IJBPayoutTerminal",
            name: "terminal",
            type: "address",
          },
        ],
        indexed: false,
        internalType: "struct REVLoanSource",
        name: "source",
        type: "tuple",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "borrowAmount",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "collateralCount",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "sourceFeeAmount",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "address payable",
        name: "beneficiary",
        type: "address",
      },
      {
        indexed: false,
        internalType: "address",
        name: "caller",
        type: "address",
      },
    ],
    name: "Borrow",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "uint256",
        name: "loanId",
        type: "uint256",
      },
      {
        indexed: true,
        internalType: "uint256",
        name: "revnetId",
        type: "uint256",
      },
      {
        components: [
          {
            internalType: "uint112",
            name: "amount",
            type: "uint112",
          },
          {
            internalType: "uint112",
            name: "collateral",
            type: "uint112",
          },
          {
            internalType: "uint48",
            name: "createdAt",
            type: "uint48",
          },
          {
            internalType: "uint16",
            name: "prepaidFeePercent",
            type: "uint16",
          },
          {
            internalType: "uint32",
            name: "prepaidDuration",
            type: "uint32",
          },
          {
            components: [
              {
                internalType: "address",
                name: "token",
                type: "address",
              },
              {
                internalType: "contract IJBPayoutTerminal",
                name: "terminal",
                type: "address",
              },
            ],
            internalType: "struct REVLoanSource",
            name: "source",
            type: "tuple",
          },
        ],
        indexed: false,
        internalType: "struct REVLoan",
        name: "loan",
        type: "tuple",
      },
      {
        indexed: false,
        internalType: "address",
        name: "caller",
        type: "address",
      },
    ],
    name: "Liquidate",
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
        name: "loanId",
        type: "uint256",
      },
      {
        indexed: true,
        internalType: "uint256",
        name: "revnetId",
        type: "uint256",
      },
      {
        indexed: true,
        internalType: "uint256",
        name: "reallocatedLoanId",
        type: "uint256",
      },
      {
        components: [
          {
            internalType: "uint112",
            name: "amount",
            type: "uint112",
          },
          {
            internalType: "uint112",
            name: "collateral",
            type: "uint112",
          },
          {
            internalType: "uint48",
            name: "createdAt",
            type: "uint48",
          },
          {
            internalType: "uint16",
            name: "prepaidFeePercent",
            type: "uint16",
          },
          {
            internalType: "uint32",
            name: "prepaidDuration",
            type: "uint32",
          },
          {
            components: [
              {
                internalType: "address",
                name: "token",
                type: "address",
              },
              {
                internalType: "contract IJBPayoutTerminal",
                name: "terminal",
                type: "address",
              },
            ],
            internalType: "struct REVLoanSource",
            name: "source",
            type: "tuple",
          },
        ],
        indexed: false,
        internalType: "struct REVLoan",
        name: "reallocatedLoan",
        type: "tuple",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "removedcollateralCount",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "address",
        name: "caller",
        type: "address",
      },
    ],
    name: "ReallocateCollateral",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "uint256",
        name: "loanId",
        type: "uint256",
      },
      {
        indexed: true,
        internalType: "uint256",
        name: "revnetId",
        type: "uint256",
      },
      {
        indexed: true,
        internalType: "uint256",
        name: "paidOffLoanId",
        type: "uint256",
      },
      {
        components: [
          {
            internalType: "uint112",
            name: "amount",
            type: "uint112",
          },
          {
            internalType: "uint112",
            name: "collateral",
            type: "uint112",
          },
          {
            internalType: "uint48",
            name: "createdAt",
            type: "uint48",
          },
          {
            internalType: "uint16",
            name: "prepaidFeePercent",
            type: "uint16",
          },
          {
            internalType: "uint32",
            name: "prepaidDuration",
            type: "uint32",
          },
          {
            components: [
              {
                internalType: "address",
                name: "token",
                type: "address",
              },
              {
                internalType: "contract IJBPayoutTerminal",
                name: "terminal",
                type: "address",
              },
            ],
            internalType: "struct REVLoanSource",
            name: "source",
            type: "tuple",
          },
        ],
        indexed: false,
        internalType: "struct REVLoan",
        name: "loan",
        type: "tuple",
      },
      {
        components: [
          {
            internalType: "uint112",
            name: "amount",
            type: "uint112",
          },
          {
            internalType: "uint112",
            name: "collateral",
            type: "uint112",
          },
          {
            internalType: "uint48",
            name: "createdAt",
            type: "uint48",
          },
          {
            internalType: "uint16",
            name: "prepaidFeePercent",
            type: "uint16",
          },
          {
            internalType: "uint32",
            name: "prepaidDuration",
            type: "uint32",
          },
          {
            components: [
              {
                internalType: "address",
                name: "token",
                type: "address",
              },
              {
                internalType: "contract IJBPayoutTerminal",
                name: "terminal",
                type: "address",
              },
            ],
            internalType: "struct REVLoanSource",
            name: "source",
            type: "tuple",
          },
        ],
        indexed: false,
        internalType: "struct REVLoan",
        name: "paidOffLoan",
        type: "tuple",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "repayBorrowAmount",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "sourceFeeAmount",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "collateralCountToReturn",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "address payable",
        name: "beneficiary",
        type: "address",
      },
      {
        indexed: false,
        internalType: "address",
        name: "caller",
        type: "address",
      },
    ],
    name: "RepayLoan",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "contract IJBTokenUriResolver",
        name: "resolver",
        type: "address",
      },
      {
        indexed: false,
        internalType: "address",
        name: "caller",
        type: "address",
      },
    ],
    name: "SetTokenUriResolver",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "from",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "to",
        type: "address",
      },
      {
        indexed: true,
        internalType: "uint256",
        name: "tokenId",
        type: "uint256",
      },
    ],
    name: "Transfer",
    type: "event",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "sender",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "tokenId",
        type: "uint256",
      },
      {
        internalType: "address",
        name: "owner",
        type: "address",
      },
    ],
    name: "ERC721IncorrectOwner",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "operator",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "tokenId",
        type: "uint256",
      },
    ],
    name: "ERC721InsufficientApproval",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "approver",
        type: "address",
      },
    ],
    name: "ERC721InvalidApprover",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "operator",
        type: "address",
      },
    ],
    name: "ERC721InvalidOperator",
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
    name: "ERC721InvalidOwner",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "receiver",
        type: "address",
      },
    ],
    name: "ERC721InvalidReceiver",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "sender",
        type: "address",
      },
    ],
    name: "ERC721InvalidSender",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "tokenId",
        type: "uint256",
      },
    ],
    name: "ERC721NonexistentToken",
    type: "error",
  },
  {
    inputs: [],
    name: "FailedCall",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "balance",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "needed",
        type: "uint256",
      },
    ],
    name: "InsufficientBalance",
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
  {
    inputs: [
      {
        internalType: "uint256",
        name: "collateralToReturn",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "loanCollateral",
        type: "uint256",
      },
    ],
    name: "REVLoans_CollateralExceedsLoan",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "prepaidFeePercent",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "min",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "max",
        type: "uint256",
      },
    ],
    name: "REVLoans_InvalidPrepaidFeePercent",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "timeSinceLoanCreated",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "loanLiquidationDuration",
        type: "uint256",
      },
    ],
    name: "REVLoans_LoanExpired",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "newBorrowAmount",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "loanAmount",
        type: "uint256",
      },
    ],
    name: "REVLoans_NewBorrowAmountGreaterThanLoanAmount",
    type: "error",
  },
  {
    inputs: [],
    name: "REVLoans_NoMsgValueAllowed",
    type: "error",
  },
  {
    inputs: [],
    name: "REVLoans_NotEnoughCollateral",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "maxRepayBorrowAmount",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "repayBorrowAmount",
        type: "uint256",
      },
    ],
    name: "REVLoans_OverMaxRepayBorrowAmount",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "value",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "limit",
        type: "uint256",
      },
    ],
    name: "REVLoans_OverflowAlert",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "allowanceAmount",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "requiredAmount",
        type: "uint256",
      },
    ],
    name: "REVLoans_PermitAllowanceNotEnough",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "newBorrowAmount",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "loanAmount",
        type: "uint256",
      },
    ],
    name: "REVLoans_ReallocatingMoreCollateralThanBorrowedAmountAllows",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "revnetOwner",
        type: "address",
      },
      {
        internalType: "address",
        name: "revnets",
        type: "address",
      },
    ],
    name: "REVLoans_RevnetsMismatch",
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
        name: "owner",
        type: "address",
      },
    ],
    name: "REVLoans_Unauthorized",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "minBorrowAmount",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "borrowAmount",
        type: "uint256",
      },
    ],
    name: "REVLoans_UnderMinBorrowAmount",
    type: "error",
  },
  {
    inputs: [],
    name: "REVLoans_ZeroCollateralLoanIsInvalid",
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
