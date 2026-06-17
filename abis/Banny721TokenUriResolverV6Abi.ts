import { parseAbi } from "viem";

export const Banny721TokenUriResolverV6Abi = parseAbi([
  "event DecorateBanny(address indexed hook, uint256 indexed bannyBodyId, uint256 indexed backgroundId, uint256[] outfitIds, address caller)",
  "event SetMetadata(string description, string externalUrl, string baseUri, address caller)",
  "event SetProductName(uint256 indexed upc, string name, address caller)",
  "event SetSvgContent(uint256 indexed upc, string svgContent, address caller)",
  "function svgOf(address hook, uint256 tokenId, bool shouldDressBannyBody, bool shouldIncludeBackgroundOnBannyBody) view returns (string)",
]);
