export const camelToSnakeCase = (str: string) =>
  str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);

export const snakeToCamelCase = (str: string) =>
  str[0] +
  str
    .slice(1)
    .toLowerCase()
    .replace(/_([a-z])/g, (match, letter) => letter.toUpperCase());

export const idOfChainName = (chainName: string) => {
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

export const nameOfChainId = (chainId: number) => {
  switch (chainId) {
    case 1:
      return "mainnet";
    case 8453:
      return "base";
    case 42161:
      return "arbitrum-one";
    case 10:
      return "op-mainnet";
  }
};
