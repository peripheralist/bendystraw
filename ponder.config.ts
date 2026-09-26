import { createConfig, factory } from "ponder";
import { erc20Abi, fallback, getAbiItem, http } from "viem";

import {
  arbitrum,
  arbitrumSepolia,
  base,
  baseSepolia,
  mainnet,
  optimism,
  optimismSepolia,
  sepolia,
} from "viem/chains";
import { Banny721TokenUriResolverAbi } from "./abis/Banny721TokenUriResolverAbi";
import { Banny721TokenUriResolverV6Abi } from "./abis/Banny721TokenUriResolverV6Abi";
import { JB721TiersHookAbi } from "./abis/JB721TiersHookAbi";
import { JB721TiersHookDeployerAbi } from "./abis/JB721TiersHookDeployerAbi";
import { JB721TiersHookV6Abi } from "./abis/JB721TiersHookV6Abi";
import { JBControllerAbi } from "./abis/JBControllerAbi";
import { JBMultiTerminalAbi } from "./abis/JBMultiTerminalAbi";
import { JBPermissionsAbi } from "./abis/JBPermissionsAbi";
import { JBProjectsAbi } from "./abis/JBProjectsAbi";
import { JBSuckersRegistryAbi } from "./abis/JBSuckersRegistryAbi";
import { JBTokensAbi } from "./abis/JBTokensAbi";
import { REVDeployerAbi } from "./abis/REVDeployerAbi";
import { REVOwnerAbi } from "./abis/REVOwnerAbi";
import { ADDRESS } from "./src/constants/address";
import { REVLoansAbi } from "./abis/REVLoansAbi";
import { REVLoansV6Abi } from "./abis/REVLoansV6Abi";
import { JBSuckerAbi } from "./abis/JBSuckerAbi";
import { JBSuckerV6Abi } from "./abis/JBSuckerV6Abi";
import { JBRulesetsAbi } from "./abis/JBRulesetsAbi";
import { JBSuckersRegistryV6Abi } from "./abis/JBSuckersRegistryV6Abi";
import { JBBuybackHookV6Abi } from "./abis/JBBuybackHookV6Abi";
import { JBRouterTerminalV6Abi } from "./abis/JBRouterTerminalV6Abi";
import { JBRouterTerminalGatewayV6Abi } from "./abis/JBRouterTerminalGatewayV6Abi";
import { rolloutChains } from "./src/constants/rollout";
import { JBProjectPayerDeployerAbi } from "./abis/JBProjectPayerDeployerAbi";
import { HomerunDeployerAbi } from "./abis/HomerunDeployerAbi";
import { StickyHookAbi } from "./abis/StickyHookAbi";
import { JBUniswapV4HookV6Abi } from "./abis/JBUniswapV4HookV6Abi";
import { UniswapV4PoolManagerAbi } from "./abis/UniswapV4PoolManagerAbi";
import { UniswapV4PositionManagerAbi } from "./abis/UniswapV4PositionManagerAbi";
import {
  JB_UNISWAP_V4_POOL_MANAGER,
  JB_UNISWAP_V4_POSITION_MANAGER,
} from "./src/constants/uniswapV4";

const addresses = (...items: (`0x${string}` | undefined)[]) =>
  items.filter((item): item is `0x${string}` => !!item);

// Viem 2.55 caps HTTP response bodies at 10 MB and throws
// ResponseBodyTooLargeError past it. A wide eth_getLogs over a filter matching
// hundreds of factory children clears that easily, and the error is not
// retryable in any useful sense — Ponder just retries the identical request and
// wedges. Ponder's own HTTP client (used when `rpc` is a URL string) imposes no
// limit, and neither did the viem we ran before the 0.17 upgrade, so opting out
// restores prior behaviour rather than loosening anything.
const httpTransport = (url: string) =>
  http(url, { maxResponseBodySize: false });

const rpc = (
  dwellirNetwork: string,
  infuraNetwork: string,
  legacyRpc: string | undefined,
) => {
  const dwellirApiKey = process.env.DWELLIR_API_KEY?.trim();

  if (!dwellirApiKey) {
    throw new Error("DWELLIR_API_KEY is required");
  }

  const transports = [
    httpTransport(
      `https://api-${dwellirNetwork}.n.dwellir.com/${encodeURIComponent(
        dwellirApiKey,
      )}`,
    ),
  ];
  const infuraApiKey = process.env.INFURA_API_KEY?.trim();

  if (infuraApiKey) {
    transports.push(
      httpTransport(
        `https://${infuraNetwork}.infura.io/v3/${encodeURIComponent(
          infuraApiKey,
        )}`,
      ),
    );
  } else if (legacyRpc) {
    // Preserve existing deployments which provide a complete backup URL.
    transports.push(httpTransport(legacyRpc));
  }

  // Keep Dwellir primary. Viem tries these transports in order, only falling
  // through to Infura (or the legacy per-chain URL) after a request fails.
  return fallback(transports, { rank: false });
};

const ws = (dwellirNetwork: string) => {
  const dwellirApiKey = process.env.DWELLIR_API_KEY?.trim();

  if (!dwellirApiKey) {
    throw new Error("DWELLIR_API_KEY is required");
  }

  return `wss://api-${dwellirNetwork}.n.dwellir.com/${encodeURIComponent(
    dwellirApiKey,
  )}`;
};

// Infura caps eth_getLogs at 10k blocks. Since `rpc` puts Dwellir and Infura behind a
// single viem `fallback` transport, Ponder can't tell which backend served a request, so
// the range it infers from Dwellir can drift past Infura's limit and wedge the backfill.
// Pin a range that both accept instead of letting Ponder tune it.
const ETH_GET_LOGS_BLOCK_RANGE = 10_000;

const V6_MAINNET_START_BLOCKS = {
  jb721TiersHookDeployer: {
    ethereum: 25329907,
    arbitrum: 473988826,
    base: 47398871,
    optimism: 152994145,
  },
  jbSuckersRegistry: {
    ethereum: 25329930,
    arbitrum: 474171863,
    base: 47398931,
    optimism: 152994203,
  },
  revLoans: {
    ethereum: 25330064,
    arbitrum: 474173960,
    base: 47399198,
    optimism: 152994459,
  },
  revOwner: {
    ethereum: 25330066,
    arbitrum: 474174004,
    base: 47399204,
    optimism: 152994464,
  },
  banny721TokenUriResolver: {
    ethereum: 25330084,
    arbitrum: 474174392,
    base: 47399252,
    optimism: 152994511,
  },
  jbProjectPayerDeployer: {
    ethereum: 25330122,
    arbitrum: 474175118,
    base: 47399351,
    optimism: 152994600,
  },
  // The first HomerunDeployer (homerunDeployer6_old_mainnet); the current one came later.
  homerunDeployer: {
    ethereum: 26028493,
    arbitrum: 507567289,
    base: 51617944,
    optimism: 157213225,
  },
  stickyHook: {
    ethereum: 26057164,
    arbitrum: 508887149,
    base: 51791252,
    optimism: 157386536,
  },
} as const;

const V6_TESTNET_START_BLOCKS = {
  jb721TiersHookDeployer: {
    ethereumSepolia: 11070569,
    arbitrumSepolia: 277724815,
    baseSepolia: 42909261,
    optimismSepolia: 44892141,
  },
  jbSuckersRegistry: {
    ethereumSepolia: 11070591,
    arbitrumSepolia: 277725286,
    baseSepolia: 42909320,
    optimismSepolia: 44892163,
  },
  revLoans: {
    ethereumSepolia: 11070713,
    arbitrumSepolia: 277727361,
    baseSepolia: 42909580,
    optimismSepolia: 44892414,
  },
  revOwner: {
    ethereumSepolia: 11070715,
    arbitrumSepolia: 277727404,
    baseSepolia: 42909585,
    optimismSepolia: 44892420,
  },
  banny721TokenUriResolver: {
    ethereumSepolia: 11070733,
    arbitrumSepolia: 277727786,
    baseSepolia: 42909633,
    optimismSepolia: 44892469,
  },
  jbProjectPayerDeployer: {
    ethereumSepolia: 11070767,
    arbitrumSepolia: 277728511,
    baseSepolia: 42909729,
    optimismSepolia: 44892556,
  },
  // The first HomerunDeployer (homerunDeployer6_old_testnet); the current one came later.
  homerunDeployer: {
    ethereumSepolia: 11753408,
    arbitrumSepolia: 311333957,
    baseSepolia: 47128207,
    optimismSepolia: 49111081,
  },
  stickyHook: {
    ethereumSepolia: 11781859,
    arbitrumSepolia: 312706619,
    baseSepolia: 47301559,
    optimismSepolia: 49284433,
  },
} as const;

const deployErc20FactoryConfig = factory({
  address: addresses(ADDRESS.jbTokens, ADDRESS.jbTokens5, ADDRESS.jbTokens6),
  event: getAbiItem({ abi: JBTokensAbi, name: "DeployERC20" }),
  parameter: "token",
});
const hookDeployedFactoryConfig = factory({
  address: ADDRESS.jb721TiersHookDeployer,
  event: getAbiItem({ abi: JB721TiersHookDeployerAbi, name: "HookDeployed" }),
  parameter: "hook",
});
const hookDeployedFactoryConfig5 = factory({
  address: ADDRESS.jb721TiersHookDeployer5,
  event: getAbiItem({ abi: JB721TiersHookDeployerAbi, name: "HookDeployed" }),
  parameter: "hook",
});
const hookDeployedFactoryConfig6 = factory({
  address: addresses(ADDRESS.jb721TiersHookDeployer6),
  event: getAbiItem({ abi: JB721TiersHookDeployerAbi, name: "HookDeployed" }),
  parameter: "hook",
});
const suckerDeployedFactoryConfig = factory({
  address: addresses(ADDRESS.jbSuckersRegistry, ADDRESS.jbSuckersRegistry5),
  event: getAbiItem({ abi: JBSuckersRegistryAbi, name: "SuckerDeployedFor" }),
  parameter: "sucker",
});
const suckerDeployedFactoryConfig6 = factory({
  address: addresses(ADDRESS.jbSuckersRegistry6),
  event: getAbiItem({ abi: JBSuckersRegistryV6Abi, name: "SuckerDeployedFor" }),
  parameter: "sucker",
});

const JB721TiersHookDeployer = {
  mainnet: {
    abi: JB721TiersHookDeployerAbi,
    address: addresses(
      ADDRESS.jb721TiersHookDeployer,
      ADDRESS.jb721TiersHookDeployer5,
      ADDRESS.jb721TiersHookDeployer6,
    ),
    chain: {
      ethereum: {
        startBlock: 21863981,
      },
      arbitrum: {
        startBlock: 306898627,
      },
      base: {
        startBlock: 26490148,
      },
      optimism: {
        startBlock: 132085433,
      },
    },
  },
  testnet: {
    abi: JB721TiersHookDeployerAbi,
    address: addresses(
      ADDRESS.jb721TiersHookDeployer,
      ADDRESS.jb721TiersHookDeployer5,
      ADDRESS.jb721TiersHookDeployer6,
    ),
    chain: {
      ethereumSepolia: {
        startBlock: 7724790,
      },
      arbitrumSepolia: {
        startBlock: 124513119,
      },
      baseSepolia: {
        startBlock: 22000652,
      },
      optimismSepolia: {
        startBlock: 23983526,
      },
    },
  },
} as const;

const JBTokens = {
  mainnet: {
    abi: JBTokensAbi,
    address: addresses(ADDRESS.jbTokens, ADDRESS.jbTokens5, ADDRESS.jbTokens6),
    chain: {
      ethereum: {
        startBlock: 21863179,
      },
      arbitrum: {
        startBlock: 306857750,
      },
      base: {
        startBlock: 26485001,
      },
      optimism: {
        startBlock: 132080297,
      },
    },
  },
  testnet: {
    abi: JBTokensAbi,
    address: addresses(ADDRESS.jbTokens, ADDRESS.jbTokens5, ADDRESS.jbTokens6),
    chain: {
      ethereumSepolia: {
        startBlock: 7724144,
      },
      arbitrumSepolia: {
        startBlock: 124457695,
      },
      baseSepolia: {
        startBlock: 21993057,
      },
      optimismSepolia: {
        startBlock: 23975934,
      },
    },
  },
} as const;

const JBRulesets = {
  mainnet: {
    abi: JBRulesetsAbi,
    address: addresses(
      ADDRESS.jbRulesets,
      ADDRESS.jbRulesets5,
      ADDRESS.jbRulesets6,
    ),
    chain: {
      ethereum: {
        startBlock: 21863161,
      },
      arbitrum: {
        startBlock: 306857614,
      },
      base: {
        startBlock: 26484977,
      },
      optimism: {
        startBlock: 132080269,
      },
    },
  },
  testnet: {
    abi: JBRulesetsAbi,
    address: addresses(
      ADDRESS.jbRulesets,
      ADDRESS.jbRulesets5,
      ADDRESS.jbRulesets6,
    ),
    chain: {
      ethereumSepolia: {
        startBlock: 7724135,
      },
      arbitrumSepolia: {
        startBlock: 124457558,
      },
      baseSepolia: {
        startBlock: 21993032,
      },
      optimismSepolia: {
        startBlock: 23975908,
      },
    },
  },
} as const;

export const mainnetConfig = createConfig({
  ordering: "omnichain",
  chains: {
    ethereum: {
      id: mainnet.id,
      rpc: rpc("ethereum-mainnet", "mainnet", process.env.RPC_URL_ETHEREUM),
      ws: ws("ethereum-mainnet"),
      ethGetLogsBlockRange: ETH_GET_LOGS_BLOCK_RANGE,
    },
    arbitrum: {
      id: arbitrum.id,
      rpc: rpc(
        "arbitrum-mainnet-archive",
        "arbitrum-mainnet",
        process.env.RPC_URL_ARBITRUM,
      ),
      pollingInterval: 2000,
      // No ws for arb due to websocket connection errors (possibly on Dwellir's end)
      // ws: ws("arbitrum-mainnet-archive"),
      ethGetLogsBlockRange: ETH_GET_LOGS_BLOCK_RANGE,
    },
    base: {
      id: base.id,
      rpc: rpc(
        "base-mainnet-archive",
        "base-mainnet",
        process.env.RPC_URL_BASE,
      ),
      ws: ws("base-mainnet-archive"),
      ethGetLogsBlockRange: ETH_GET_LOGS_BLOCK_RANGE,
    },
    optimism: {
      id: optimism.id,
      rpc: rpc(
        "optimism-mainnet-archive",
        "optimism-mainnet",
        process.env.RPC_URL_OPTIMISM,
      ),
      ws: ws("optimism-mainnet-archive"),
      ethGetLogsBlockRange: ETH_GET_LOGS_BLOCK_RANGE,
    },
  },
  contracts: {
    JBProjects: {
      abi: JBProjectsAbi,
      address: addresses(
        ADDRESS.jbProjects,
        ADDRESS.jbProjects5,
        ADDRESS.jbProjects6,
      ),
      chain: {
        ethereum: {
          startBlock: 21863142,
        },
        arbitrum: {
          startBlock: 306857479,
        },
        base: {
          startBlock: 26484953,
        },
        optimism: {
          startBlock: 132080242,
        },
      },
    },
    JBController: {
      abi: JBControllerAbi,
      address: addresses(
        ADDRESS.jbController,
        ADDRESS.jbController4_1,
        ADDRESS.jbController5,
        ADDRESS.jbController6,
      ),
      chain: {
        ethereum: {
          startBlock: 21863191,
        },
        arbitrum: {
          startBlock: 306857842,
        },
        base: {
          startBlock: 26485017,
        },
        optimism: {
          startBlock: 132080314,
        },
      },
    },
    JBMultiTerminal: {
      abi: JBMultiTerminalAbi,
      address: addresses(
        ADDRESS.jbMultiTerminal,
        ADDRESS.jbMultiTerminal5,
        ADDRESS.jbMultiTerminal6,
      ),
      chain: {
        ethereum: {
          startBlock: 21863215,
        },
        arbitrum: {
          startBlock: 306858028,
        },
        base: {
          startBlock: 26485049,
        },
        optimism: {
          startBlock: 132080347,
        },
      },
    },
    JB721TiersHookDeployer: JB721TiersHookDeployer.mainnet,
    JB721TiersHook: {
      abi: JB721TiersHookAbi,
      address: hookDeployedFactoryConfig,
      chain: {
        ethereum: {
          startBlock: JB721TiersHookDeployer.mainnet.chain.ethereum.startBlock,
        },
        arbitrum: {
          startBlock: JB721TiersHookDeployer.mainnet.chain.arbitrum.startBlock,
        },
        base: {
          startBlock: JB721TiersHookDeployer.mainnet.chain.base.startBlock,
        },
        optimism: {
          startBlock: JB721TiersHookDeployer.mainnet.chain.optimism.startBlock,
        },
      },
    },
    JB721TiersHook5: {
      abi: JB721TiersHookAbi,
      address: hookDeployedFactoryConfig5,
      chain: {
        ethereum: {
          startBlock: JB721TiersHookDeployer.mainnet.chain.ethereum.startBlock,
        },
        arbitrum: {
          startBlock: JB721TiersHookDeployer.mainnet.chain.arbitrum.startBlock,
        },
        base: {
          startBlock: JB721TiersHookDeployer.mainnet.chain.base.startBlock,
        },
        optimism: {
          startBlock: JB721TiersHookDeployer.mainnet.chain.optimism.startBlock,
        },
      },
    },
    JB721TiersHook6: {
      abi: JB721TiersHookV6Abi,
      address: hookDeployedFactoryConfig6,
      chain: {
        ethereum: {
          startBlock: V6_MAINNET_START_BLOCKS.jb721TiersHookDeployer.ethereum,
        },
        arbitrum: {
          startBlock: V6_MAINNET_START_BLOCKS.jb721TiersHookDeployer.arbitrum,
        },
        base: {
          startBlock: V6_MAINNET_START_BLOCKS.jb721TiersHookDeployer.base,
        },
        optimism: {
          startBlock: V6_MAINNET_START_BLOCKS.jb721TiersHookDeployer.optimism,
        },
      },
    },
    JBTokens: JBTokens.mainnet,
    JBRulesets: JBRulesets.mainnet,
    ERC20: {
      abi: erc20Abi,
      address: deployErc20FactoryConfig,
      chain: {
        ethereum: {
          startBlock: JBTokens.mainnet.chain.ethereum.startBlock,
        },
        arbitrum: {
          startBlock: JBTokens.mainnet.chain.arbitrum.startBlock,
        },
        base: {
          startBlock: JBTokens.mainnet.chain.base.startBlock,
        },
        optimism: {
          startBlock: JBTokens.mainnet.chain.optimism.startBlock,
        },
      },
    },
    JBPermissions: {
      abi: JBPermissionsAbi,
      address: addresses(
        ADDRESS.jbPermissions,
        ADDRESS.jbPermissions5,
        ADDRESS.jbPermissions6,
      ),
      chain: {
        ethereum: {
          startBlock: 21863136,
        },
        arbitrum: {
          startBlock: 306857433,
        },
        base: {
          startBlock: 26484945,
        },
        optimism: {
          startBlock: 132080233,
        },
      },
    },
    Banny721TokenUriResolver: {
      abi: Banny721TokenUriResolverAbi,
      address: [ADDRESS.banny721TokenUriResolver5],
      chain: {
        ethereum: {
          startBlock: 23971096,
        },
        arbitrum: {
          startBlock: 408615445,
        },
        base: {
          startBlock: 39221996,
        },
        optimism: {
          startBlock: 144817281,
        },
      },
    },
    Banny721TokenUriResolver6: {
      abi: Banny721TokenUriResolverV6Abi,
      address: [ADDRESS.banny721TokenUriResolver6],
      chain: {
        ethereum: {
          startBlock: V6_MAINNET_START_BLOCKS.banny721TokenUriResolver.ethereum,
        },
        arbitrum: {
          startBlock: V6_MAINNET_START_BLOCKS.banny721TokenUriResolver.arbitrum,
        },
        base: {
          startBlock: V6_MAINNET_START_BLOCKS.banny721TokenUriResolver.base,
        },
        optimism: {
          startBlock: V6_MAINNET_START_BLOCKS.banny721TokenUriResolver.optimism,
        },
      },
    },
    RevDeployer: {
      abi: REVDeployerAbi,
      address: addresses(
        ADDRESS.revDeployer,
        ADDRESS.revDeployer5,
        ADDRESS.revDeployer6,
      ),
      chain: {
        ethereum: {
          startBlock: 21869094,
        },
        arbitrum: {
          startBlock: 307144912,
        },
        base: {
          startBlock: 26521040,
        },
        optimism: {
          startBlock: 132116325,
        },
      },
    },
    // V6-only: REVOwner emits AutoIssue (V4/V5 emit it from the REVDeployer).
    REVOwner: {
      abi: REVOwnerAbi,
      address: addresses(ADDRESS.revOwner6),
      chain: {
        ethereum: { startBlock: V6_MAINNET_START_BLOCKS.revOwner.ethereum },
        arbitrum: { startBlock: V6_MAINNET_START_BLOCKS.revOwner.arbitrum },
        base: { startBlock: V6_MAINNET_START_BLOCKS.revOwner.base },
        optimism: { startBlock: V6_MAINNET_START_BLOCKS.revOwner.optimism },
      },
    },
    RevLoans: {
      abi: REVLoansAbi,
      address: addresses(
        ADDRESS.revLoans,
        ADDRESS.revLoans1_1,
        ADDRESS.revLoans5,
      ),
      chain: {
        ethereum: {
          startBlock: 21869096,
        },
        arbitrum: {
          startBlock: 307144959,
        },
        base: {
          startBlock: 26521046,
        },
        optimism: {
          startBlock: 132116331,
        },
      },
    },
    // V6-only: the REVLoan struct changed (source tuple -> sourceToken address), so V6 loan events have
    // different topic0s and need their own ABI.
    RevLoans6: {
      abi: REVLoansV6Abi,
      address: addresses(ADDRESS.revLoans6),
      chain: {
        ethereum: { startBlock: V6_MAINNET_START_BLOCKS.revLoans.ethereum },
        arbitrum: { startBlock: V6_MAINNET_START_BLOCKS.revLoans.arbitrum },
        base: { startBlock: V6_MAINNET_START_BLOCKS.revLoans.base },
        optimism: { startBlock: V6_MAINNET_START_BLOCKS.revLoans.optimism },
      },
    },
    JBSuckersRegistry: {
      abi: JBSuckersRegistryAbi,
      address: addresses(ADDRESS.jbSuckersRegistry, ADDRESS.jbSuckersRegistry5),
      chain: {
        ethereum: {
          startBlock: 21863660,
        },
        arbitrum: {
          startBlock: 306881281,
        },
        base: {
          startBlock: 26487986,
        },
        optimism: {
          startBlock: 132083296,
        },
      },
    },
    JBSuckersRegistry6: {
      abi: JBSuckersRegistryV6Abi,
      address: addresses(ADDRESS.jbSuckersRegistry6),
      chain: {
        ethereum: {
          startBlock: V6_MAINNET_START_BLOCKS.jbSuckersRegistry.ethereum,
        },
        arbitrum: {
          startBlock: V6_MAINNET_START_BLOCKS.jbSuckersRegistry.arbitrum,
        },
        base: {
          startBlock: V6_MAINNET_START_BLOCKS.jbSuckersRegistry.base,
        },
        optimism: {
          startBlock: V6_MAINNET_START_BLOCKS.jbSuckersRegistry.optimism,
        },
      },
    },
    JBSucker: {
      abi: JBSuckerAbi,
      address: suckerDeployedFactoryConfig,
      chain: {
        ethereum: {
          startBlock: 21863660,
        },
        arbitrum: {
          startBlock: 306881281,
        },
        base: {
          startBlock: 26487986,
        },
        optimism: {
          startBlock: 132083296,
        },
      },
    },
    JBSucker6: {
      abi: JBSuckerV6Abi,
      address: suckerDeployedFactoryConfig6,
      chain: {
        ethereum: {
          startBlock: V6_MAINNET_START_BLOCKS.jbSuckersRegistry.ethereum,
        },
        arbitrum: {
          startBlock: V6_MAINNET_START_BLOCKS.jbSuckersRegistry.arbitrum,
        },
        base: {
          startBlock: V6_MAINNET_START_BLOCKS.jbSuckersRegistry.base,
        },
        optimism: {
          startBlock: V6_MAINNET_START_BLOCKS.jbSuckersRegistry.optimism,
        },
      },
    },
    JBBuybackHook6: {
      abi: JBBuybackHookV6Abi,
      chain: rolloutChains("JBBuybackHook", false),
    },
    JBRouterTerminal6: {
      abi: JBRouterTerminalV6Abi,
      chain: rolloutChains("JBRouterTerminal", false),
    },
    JBRouterTerminalGateway6: {
      abi: JBRouterTerminalGatewayV6Abi,
      chain: rolloutChains("JBRouterTerminalGateway", false),
    },
    JBUniswapV4Hook6: {
      abi: JBUniswapV4HookV6Abi,
      chain: rolloutChains("JBUniswapV4Hook", false),
    },
    UniswapV4PositionManager6: {
      abi: UniswapV4PositionManagerAbi,
      chain: {
        ethereum: JB_UNISWAP_V4_POSITION_MANAGER.ethereum,
        arbitrum: JB_UNISWAP_V4_POSITION_MANAGER.arbitrum,
        base: JB_UNISWAP_V4_POSITION_MANAGER.base,
        optimism: JB_UNISWAP_V4_POSITION_MANAGER.optimism,
      },
    },
    // Only modifications made through the canonical PositionManager can belong
    // to a Juicebox pool position, and the handler drops every pool that is not
    // a registered buyback pool before it makes an RPC call.
    UniswapV4PoolManager6: {
      abi: UniswapV4PoolManagerAbi,
      chain: {
        ethereum: {
          ...JB_UNISWAP_V4_POOL_MANAGER.ethereum,
          filter: {
            event: "ModifyLiquidity",
            args: { sender: JB_UNISWAP_V4_POSITION_MANAGER.ethereum.address },
          },
        },
        arbitrum: {
          ...JB_UNISWAP_V4_POOL_MANAGER.arbitrum,
          filter: {
            event: "ModifyLiquidity",
            args: { sender: JB_UNISWAP_V4_POSITION_MANAGER.arbitrum.address },
          },
        },
        base: {
          ...JB_UNISWAP_V4_POOL_MANAGER.base,
          filter: {
            event: "ModifyLiquidity",
            args: { sender: JB_UNISWAP_V4_POSITION_MANAGER.base.address },
          },
        },
        optimism: {
          ...JB_UNISWAP_V4_POOL_MANAGER.optimism,
          filter: {
            event: "ModifyLiquidity",
            args: { sender: JB_UNISWAP_V4_POSITION_MANAGER.optimism.address },
          },
        },
      },
    },
    JBProjectPayerDeployer: {
      abi: JBProjectPayerDeployerAbi,
      address: addresses(ADDRESS.jbProjectPayerDeployer6),
      chain: {
        ethereum: {
          startBlock: V6_MAINNET_START_BLOCKS.jbProjectPayerDeployer.ethereum,
        },
        arbitrum: {
          startBlock: V6_MAINNET_START_BLOCKS.jbProjectPayerDeployer.arbitrum,
        },
        base: {
          startBlock: V6_MAINNET_START_BLOCKS.jbProjectPayerDeployer.base,
        },
        optimism: {
          startBlock: V6_MAINNET_START_BLOCKS.jbProjectPayerDeployer.optimism,
        },
      },
    },
    // V6-only: marks FUND and INCOME projects launched through Homerun.
    HomerunDeployer: {
      abi: HomerunDeployerAbi,
      address: addresses(
        ADDRESS.homerunDeployer6_old_mainnet,
        ADDRESS.homerunDeployer6,
      ),
      chain: {
        ethereum: { startBlock: V6_MAINNET_START_BLOCKS.homerunDeployer.ethereum },
        arbitrum: { startBlock: V6_MAINNET_START_BLOCKS.homerunDeployer.arbitrum },
        base: { startBlock: V6_MAINNET_START_BLOCKS.homerunDeployer.base },
        optimism: { startBlock: V6_MAINNET_START_BLOCKS.homerunDeployer.optimism },
      },
    },
    // V6-only: Sticky positions and streaks.
    StickyHook: {
      abi: StickyHookAbi,
      address: addresses(ADDRESS.stickyHook6),
      chain: {
        ethereum: { startBlock: V6_MAINNET_START_BLOCKS.stickyHook.ethereum },
        arbitrum: { startBlock: V6_MAINNET_START_BLOCKS.stickyHook.arbitrum },
        base: { startBlock: V6_MAINNET_START_BLOCKS.stickyHook.base },
        optimism: { startBlock: V6_MAINNET_START_BLOCKS.stickyHook.optimism },
      },
    },
  },
});

export const testnetConfig = createConfig({
  ordering: "omnichain",
  chains: {
    ethereumSepolia: {
      id: sepolia.id,
      rpc: rpc(
        "ethereum-sepolia",
        "sepolia",
        process.env.RPC_URL_ETHEREUM_SEPOLIA,
      ),
      ws: ws("ethereum-sepolia"),
      ethGetLogsBlockRange: ETH_GET_LOGS_BLOCK_RANGE,
    },
    arbitrumSepolia: {
      id: arbitrumSepolia.id,
      rpc: rpc(
        "arbitrum-sepolia",
        "arbitrum-sepolia",
        process.env.RPC_URL_ARBITRUM_SEPOLIA,
      ),
      pollingInterval: 2000,
      // No ws for arb due to websocket connection errors (possibly on Dwellir's end)
      // ws: ws("arbitrum-sepolia"),
      ethGetLogsBlockRange: ETH_GET_LOGS_BLOCK_RANGE,
    },
    baseSepolia: {
      id: baseSepolia.id,
      rpc: rpc(
        "base-sepolia-archive",
        "base-sepolia",
        process.env.RPC_URL_BASE_SEPOLIA,
      ),
      ws: ws("base-sepolia-archive"),
      ethGetLogsBlockRange: ETH_GET_LOGS_BLOCK_RANGE,
    },
    optimismSepolia: {
      id: optimismSepolia.id,
      rpc: rpc(
        "optimism-sepolia",
        "optimism-sepolia",
        process.env.RPC_URL_OPTIMISM_SEPOLIA,
      ),
      ws: ws("optimism-sepolia"),
      ethGetLogsBlockRange: ETH_GET_LOGS_BLOCK_RANGE,
    },
  },
  contracts: {
    JBProjects: {
      abi: JBProjectsAbi,
      address: addresses(
        ADDRESS.jbProjects,
        ADDRESS.jbProjects5,
        ADDRESS.jbProjects6,
      ),
      chain: {
        ethereumSepolia: {
          startBlock: 7724105,
        },
        arbitrumSepolia: {
          startBlock: 124457424,
        },
        baseSepolia: {
          startBlock: 21993006,
        },
        optimismSepolia: {
          startBlock: 23975881,
        },
      },
    },
    JBController: {
      abi: JBControllerAbi,
      address: addresses(
        ADDRESS.jbController,
        ADDRESS.jbController4_1,
        ADDRESS.jbController5,
        ADDRESS.jbController6,
      ),
      chain: {
        ethereumSepolia: {
          startBlock: 7724149,
        },
        arbitrumSepolia: {
          startBlock: 124457787,
        },
        baseSepolia: {
          startBlock: 21993075,
        },
        optimismSepolia: {
          startBlock: 23975952,
        },
      },
    },
    JBMultiTerminal: {
      abi: JBMultiTerminalAbi,
      address: addresses(
        ADDRESS.jbMultiTerminal,
        ADDRESS.jbMultiTerminal5,
        ADDRESS.jbMultiTerminal6,
      ),
      chain: {
        ethereumSepolia: {
          startBlock: 7724161,
        },
        arbitrumSepolia: {
          startBlock: 124457968,
        },
        baseSepolia: {
          startBlock: 21993109,
        },
        optimismSepolia: {
          startBlock: 23975987,
        },
      },
    },
    JB721TiersHookDeployer: JB721TiersHookDeployer.testnet,
    JB721TiersHook: {
      abi: JB721TiersHookAbi,
      address: hookDeployedFactoryConfig,
      chain: {
        ethereumSepolia: {
          startBlock:
            JB721TiersHookDeployer.testnet.chain.ethereumSepolia.startBlock,
        },
        arbitrumSepolia: {
          startBlock:
            JB721TiersHookDeployer.testnet.chain.arbitrumSepolia.startBlock,
        },
        baseSepolia: {
          startBlock:
            JB721TiersHookDeployer.testnet.chain.baseSepolia.startBlock,
        },
        optimismSepolia: {
          startBlock:
            JB721TiersHookDeployer.testnet.chain.optimismSepolia.startBlock,
        },
      },
    },
    JB721TiersHook5: {
      abi: JB721TiersHookAbi,
      address: hookDeployedFactoryConfig5,
      chain: {
        ethereumSepolia: {
          startBlock:
            JB721TiersHookDeployer.testnet.chain.ethereumSepolia.startBlock,
        },
        arbitrumSepolia: {
          startBlock:
            JB721TiersHookDeployer.testnet.chain.arbitrumSepolia.startBlock,
        },
        baseSepolia: {
          startBlock:
            JB721TiersHookDeployer.testnet.chain.baseSepolia.startBlock,
        },
        optimismSepolia: {
          startBlock:
            JB721TiersHookDeployer.testnet.chain.optimismSepolia.startBlock,
        },
      },
    },
    JB721TiersHook6: {
      abi: JB721TiersHookV6Abi,
      address: hookDeployedFactoryConfig6,
      chain: {
        ethereumSepolia: {
          startBlock:
            V6_TESTNET_START_BLOCKS.jb721TiersHookDeployer.ethereumSepolia,
        },
        arbitrumSepolia: {
          startBlock:
            V6_TESTNET_START_BLOCKS.jb721TiersHookDeployer.arbitrumSepolia,
        },
        baseSepolia: {
          startBlock:
            V6_TESTNET_START_BLOCKS.jb721TiersHookDeployer.baseSepolia,
        },
        optimismSepolia: {
          startBlock:
            V6_TESTNET_START_BLOCKS.jb721TiersHookDeployer.optimismSepolia,
        },
      },
    },
    JBTokens: JBTokens.testnet,
    JBRulesets: JBRulesets.testnet,
    ERC20: {
      abi: erc20Abi,
      address: deployErc20FactoryConfig,
      chain: {
        ethereumSepolia: {
          startBlock: JBTokens.testnet.chain.ethereumSepolia.startBlock,
        },
        arbitrumSepolia: {
          startBlock: JBTokens.testnet.chain.arbitrumSepolia.startBlock,
        },
        baseSepolia: {
          startBlock: JBTokens.testnet.chain.baseSepolia.startBlock,
        },
        optimismSepolia: {
          startBlock: JBTokens.testnet.chain.optimismSepolia.startBlock,
        },
      },
    },
    JBPermissions: {
      address: addresses(
        ADDRESS.jbPermissions,
        ADDRESS.jbPermissions5,
        ADDRESS.jbPermissions6,
      ),
      abi: JBPermissionsAbi,
      chain: {
        ethereumSepolia: {
          startBlock: 7724077,
        },
        arbitrumSepolia: {
          startBlock: 124457375,
        },
        baseSepolia: {
          startBlock: 21992998,
        },
        optimismSepolia: {
          startBlock: 23975872,
        },
      },
    },
    Banny721TokenUriResolver: {
      abi: Banny721TokenUriResolverAbi,
      address: [
        ADDRESS.banny721TokenUriResolver,
        ADDRESS.banny721TokenUriResolver5,
      ],
      chain: {
        ethereumSepolia: {
          startBlock: 9823930,
        },
        arbitrumSepolia: {
          startBlock: 223948198,
        },
        baseSepolia: {
          startBlock: 34884744,
        },
        optimismSepolia: {
          startBlock: 36867619,
        },
      },
    },
    Banny721TokenUriResolver6: {
      abi: Banny721TokenUriResolverV6Abi,
      address: [ADDRESS.banny721TokenUriResolver6],
      chain: {
        ethereumSepolia: {
          startBlock:
            V6_TESTNET_START_BLOCKS.banny721TokenUriResolver.ethereumSepolia,
        },
        arbitrumSepolia: {
          startBlock:
            V6_TESTNET_START_BLOCKS.banny721TokenUriResolver.arbitrumSepolia,
        },
        baseSepolia: {
          startBlock:
            V6_TESTNET_START_BLOCKS.banny721TokenUriResolver.baseSepolia,
        },
        optimismSepolia: {
          startBlock:
            V6_TESTNET_START_BLOCKS.banny721TokenUriResolver.optimismSepolia,
        },
      },
    },
    RevDeployer: {
      abi: REVDeployerAbi,
      address: addresses(
        ADDRESS.revDeployer,
        ADDRESS.revDeployer5,
        ADDRESS.revDeployer6,
      ),
      chain: {
        ethereumSepolia: {
          startBlock: 7729792,
        },
        arbitrumSepolia: {
          startBlock: 124752297,
        },
        baseSepolia: {
          startBlock: 22031613,
        },
        optimismSepolia: {
          startBlock: 24014488,
        },
      },
    },
    // V6-only: REVOwner emits AutoIssue (V4/V5 emit it from the REVDeployer).
    REVOwner: {
      abi: REVOwnerAbi,
      address: addresses(ADDRESS.revOwner6),
      chain: {
        ethereumSepolia: {
          startBlock: V6_TESTNET_START_BLOCKS.revOwner.ethereumSepolia,
        },
        arbitrumSepolia: {
          startBlock: V6_TESTNET_START_BLOCKS.revOwner.arbitrumSepolia,
        },
        baseSepolia: {
          startBlock: V6_TESTNET_START_BLOCKS.revOwner.baseSepolia,
        },
        optimismSepolia: {
          startBlock: V6_TESTNET_START_BLOCKS.revOwner.optimismSepolia,
        },
      },
    },
    RevLoans: {
      abi: REVLoansAbi,
      address: addresses(
        ADDRESS.revLoans,
        ADDRESS.revLoans1_1,
        ADDRESS.revLoans5,
      ),
      chain: {
        ethereumSepolia: {
          startBlock: 7729794,
        },
        arbitrumSepolia: {
          startBlock: 124752346,
        },
        baseSepolia: {
          startBlock: 22031619,
        },
        optimismSepolia: {
          startBlock: 24014494,
        },
      },
    },
    // V6-only: REVLoan struct changed (source tuple -> sourceToken), different topic0s, own ABI.
    RevLoans6: {
      abi: REVLoansV6Abi,
      address: addresses(ADDRESS.revLoans6),
      chain: {
        ethereumSepolia: {
          startBlock: V6_TESTNET_START_BLOCKS.revLoans.ethereumSepolia,
        },
        arbitrumSepolia: {
          startBlock: V6_TESTNET_START_BLOCKS.revLoans.arbitrumSepolia,
        },
        baseSepolia: {
          startBlock: V6_TESTNET_START_BLOCKS.revLoans.baseSepolia,
        },
        optimismSepolia: {
          startBlock: V6_TESTNET_START_BLOCKS.revLoans.optimismSepolia,
        },
      },
    },
    JBSuckersRegistry: {
      abi: JBSuckersRegistryAbi,
      address: addresses(ADDRESS.jbSuckersRegistry, ADDRESS.jbSuckersRegistry5),
      chain: {
        ethereumSepolia: {
          startBlock: 7724468,
        },
        arbitrumSepolia: {
          startBlock: 124497109,
        },
        baseSepolia: {
          startBlock: 21998497,
        },
        optimismSepolia: {
          startBlock: 23981375,
        },
      },
    },
    JBSuckersRegistry6: {
      abi: JBSuckersRegistryV6Abi,
      address: addresses(ADDRESS.jbSuckersRegistry6),
      chain: {
        ethereumSepolia: {
          startBlock: V6_TESTNET_START_BLOCKS.jbSuckersRegistry.ethereumSepolia,
        },
        arbitrumSepolia: {
          startBlock: V6_TESTNET_START_BLOCKS.jbSuckersRegistry.arbitrumSepolia,
        },
        baseSepolia: {
          startBlock: V6_TESTNET_START_BLOCKS.jbSuckersRegistry.baseSepolia,
        },
        optimismSepolia: {
          startBlock: V6_TESTNET_START_BLOCKS.jbSuckersRegistry.optimismSepolia,
        },
      },
    },
    JBSucker: {
      abi: JBSuckerAbi,
      address: suckerDeployedFactoryConfig,
      chain: {
        ethereumSepolia: {
          startBlock: 7724468,
        },
        arbitrumSepolia: {
          startBlock: 124497109,
        },
        baseSepolia: {
          startBlock: 21998497,
        },
        optimismSepolia: {
          startBlock: 23981375,
        },
      },
    },
    JBSucker6: {
      abi: JBSuckerV6Abi,
      address: suckerDeployedFactoryConfig6,
      chain: {
        ethereumSepolia: {
          startBlock: V6_TESTNET_START_BLOCKS.jbSuckersRegistry.ethereumSepolia,
        },
        arbitrumSepolia: {
          startBlock: V6_TESTNET_START_BLOCKS.jbSuckersRegistry.arbitrumSepolia,
        },
        baseSepolia: {
          startBlock: V6_TESTNET_START_BLOCKS.jbSuckersRegistry.baseSepolia,
        },
        optimismSepolia: {
          startBlock: V6_TESTNET_START_BLOCKS.jbSuckersRegistry.optimismSepolia,
        },
      },
    },
    JBBuybackHook6: {
      abi: JBBuybackHookV6Abi,
      chain: rolloutChains("JBBuybackHook", true),
    },
    JBRouterTerminal6: {
      abi: JBRouterTerminalV6Abi,
      chain: rolloutChains("JBRouterTerminal", true),
    },
    JBRouterTerminalGateway6: {
      abi: JBRouterTerminalGatewayV6Abi,
      chain: rolloutChains("JBRouterTerminalGateway", true),
    },
    JBUniswapV4Hook6: {
      abi: JBUniswapV4HookV6Abi,
      chain: rolloutChains("JBUniswapV4Hook", true),
    },
    UniswapV4PositionManager6: {
      abi: UniswapV4PositionManagerAbi,
      chain: {
        ethereumSepolia: JB_UNISWAP_V4_POSITION_MANAGER.ethereumSepolia,
        arbitrumSepolia: JB_UNISWAP_V4_POSITION_MANAGER.arbitrumSepolia,
        baseSepolia: JB_UNISWAP_V4_POSITION_MANAGER.baseSepolia,
      },
    },
    UniswapV4PoolManager6: {
      abi: UniswapV4PoolManagerAbi,
      chain: {
        ethereumSepolia: {
          ...JB_UNISWAP_V4_POOL_MANAGER.ethereumSepolia,
          filter: {
            event: "ModifyLiquidity",
            args: {
              sender: JB_UNISWAP_V4_POSITION_MANAGER.ethereumSepolia.address,
            },
          },
        },
        arbitrumSepolia: {
          ...JB_UNISWAP_V4_POOL_MANAGER.arbitrumSepolia,
          filter: {
            event: "ModifyLiquidity",
            args: {
              sender: JB_UNISWAP_V4_POSITION_MANAGER.arbitrumSepolia.address,
            },
          },
        },
        baseSepolia: {
          ...JB_UNISWAP_V4_POOL_MANAGER.baseSepolia,
          filter: {
            event: "ModifyLiquidity",
            args: {
              sender: JB_UNISWAP_V4_POSITION_MANAGER.baseSepolia.address,
            },
          },
        },
      },
    },
    JBProjectPayerDeployer: {
      abi: JBProjectPayerDeployerAbi,
      address: addresses(ADDRESS.jbProjectPayerDeployer6),
      chain: {
        ethereumSepolia: {
          startBlock:
            V6_TESTNET_START_BLOCKS.jbProjectPayerDeployer.ethereumSepolia,
        },
        arbitrumSepolia: {
          startBlock:
            V6_TESTNET_START_BLOCKS.jbProjectPayerDeployer.arbitrumSepolia,
        },
        baseSepolia: {
          startBlock:
            V6_TESTNET_START_BLOCKS.jbProjectPayerDeployer.baseSepolia,
        },
        optimismSepolia: {
          startBlock:
            V6_TESTNET_START_BLOCKS.jbProjectPayerDeployer.optimismSepolia,
        },
      },
    },
    // V6-only: marks FUND and INCOME projects launched through Homerun.
    HomerunDeployer: {
      abi: HomerunDeployerAbi,
      address: addresses(
        ADDRESS.homerunDeployer6_old_testnet,
        ADDRESS.homerunDeployer6,
      ),
      chain: {
        ethereumSepolia: {
          startBlock: V6_TESTNET_START_BLOCKS.homerunDeployer.ethereumSepolia,
        },
        arbitrumSepolia: {
          startBlock: V6_TESTNET_START_BLOCKS.homerunDeployer.arbitrumSepolia,
        },
        baseSepolia: {
          startBlock: V6_TESTNET_START_BLOCKS.homerunDeployer.baseSepolia,
        },
        optimismSepolia: {
          startBlock: V6_TESTNET_START_BLOCKS.homerunDeployer.optimismSepolia,
        },
      },
    },
    // V6-only: Sticky positions and streaks.
    StickyHook: {
      abi: StickyHookAbi,
      address: addresses(ADDRESS.stickyHook6),
      chain: {
        ethereumSepolia: {
          startBlock: V6_TESTNET_START_BLOCKS.stickyHook.ethereumSepolia,
        },
        arbitrumSepolia: {
          startBlock: V6_TESTNET_START_BLOCKS.stickyHook.arbitrumSepolia,
        },
        baseSepolia: {
          startBlock: V6_TESTNET_START_BLOCKS.stickyHook.baseSepolia,
        },
        optimismSepolia: {
          startBlock: V6_TESTNET_START_BLOCKS.stickyHook.optimismSepolia,
        },
      },
    },
  },
});

export default process.env.TESTNET === "true" ? testnetConfig : mainnetConfig;
