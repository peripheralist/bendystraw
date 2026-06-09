// V6 REVLoans events + tokenURI. In V6 the REVLoan struct was flattened: the V5 `REVLoanSource source`
// tuple ({ token, terminal }) became a single `address sourceToken` (the canonical multi terminal is
// implicit), and the Borrow event's standalone `source` tuple became an `address token`. Because the
// struct types are part of each event's canonical signature, the V6 topic0s differ from V5 — so V6 loan
// events need this dedicated ABI (the bundled V5 REVLoansAbi can't decode them).
const REVLoanTuple = {
  type: "tuple",
  name: "loan",
  components: [
    { name: "amount", type: "uint112" },
    { name: "collateral", type: "uint112" },
    { name: "createdAt", type: "uint48" },
    { name: "prepaidFeePercent", type: "uint16" },
    { name: "prepaidDuration", type: "uint32" },
    { name: "sourceToken", type: "address" },
  ],
} as const;

export const REVLoansV6Abi = [
  {
    type: "event",
    name: "Borrow",
    inputs: [
      { name: "loanId", type: "uint256", indexed: true },
      { name: "revnetId", type: "uint256", indexed: true },
      { ...REVLoanTuple, indexed: false },
      { name: "token", type: "address", indexed: false },
      { name: "borrowAmount", type: "uint256", indexed: false },
      { name: "collateralCount", type: "uint256", indexed: false },
      { name: "sourceFeeAmount", type: "uint256", indexed: false },
      { name: "beneficiary", type: "address", indexed: false },
      { name: "caller", type: "address", indexed: false },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "Liquidate",
    inputs: [
      { name: "loanId", type: "uint256", indexed: true },
      { name: "revnetId", type: "uint256", indexed: true },
      { ...REVLoanTuple, indexed: false },
      { name: "caller", type: "address", indexed: false },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "ReallocateCollateral",
    inputs: [
      { name: "loanId", type: "uint256", indexed: true },
      { name: "revnetId", type: "uint256", indexed: true },
      { name: "reallocatedLoanId", type: "uint256", indexed: true },
      { ...REVLoanTuple, name: "reallocatedLoan", indexed: false },
      { name: "removedCollateralCount", type: "uint256", indexed: false },
      { name: "caller", type: "address", indexed: false },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "RepayLoan",
    inputs: [
      { name: "loanId", type: "uint256", indexed: true },
      { name: "revnetId", type: "uint256", indexed: true },
      { name: "paidOffLoanId", type: "uint256", indexed: true },
      { ...REVLoanTuple, name: "loan", indexed: false },
      { ...REVLoanTuple, name: "paidOffLoan", indexed: false },
      { name: "repayBorrowAmount", type: "uint256", indexed: false },
      { name: "sourceFeeAmount", type: "uint256", indexed: false },
      { name: "collateralCountToReturn", type: "uint256", indexed: false },
      { name: "beneficiary", type: "address", indexed: false },
      { name: "caller", type: "address", indexed: false },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "SetTokenUriResolver",
    inputs: [
      { name: "resolver", type: "address", indexed: true },
      { name: "caller", type: "address", indexed: false },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "Transfer",
    inputs: [
      { name: "from", type: "address", indexed: true },
      { name: "to", type: "address", indexed: true },
      { name: "tokenId", type: "uint256", indexed: true },
    ],
    anonymous: false,
  },
  {
    type: "function",
    name: "tokenURI",
    stateMutability: "view",
    inputs: [{ name: "tokenId", type: "uint256" }],
    outputs: [{ name: "", type: "string" }],
  },
] as const;
