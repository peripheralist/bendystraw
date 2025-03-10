export const camelToSnakeCase = (str: string) =>
  str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);

export const snakeToCamelCase = (str: string) =>
  str[0] +
  str
    .slice(1)
    .toLowerCase()
    .replace(/_([a-z])/g, (match, letter) => letter.toUpperCase());

export const formatChain = (chainName: string) => {
  switch (chainName.toLowerCase()) {
    case "mainnet":
      return 1;
    case "base":
      return 8453;
    case "arbitrum-one":
      return 42161;
    case "op-mainnet":
      return 10;
    default:
      return 0;
  }
};
