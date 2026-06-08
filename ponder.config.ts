import { createConfig, factory } from "ponder";
import { erc20Abi, getAbiItem } from "viem";

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
import { ADDRESS } from "./src/constants/address";
import { REVLoansAbi } from "./abis/REVLoansAbi";
import { JBSuckerAbi } from "./abis/JBSuckerAbi";
import { JBSuckerV6Abi } from "./abis/JBSuckerV6Abi";
import { JBRulesetsAbi } from "./abis/JBRulesetsAbi";
import { JBSuckersRegistryV6Abi } from "./abis/JBSuckersRegistryV6Abi";

const addresses = (...items: (`0x${string}` | undefined)[]) =>
  items.filter((item): item is `0x${string}` => !!item);

const V6_TESTNET_START_BLOCKS = {
  jb721TiersHookDeployer: {
    ethereumSepolia: 11017538,
    arbitrumSepolia: 275180617,
    baseSepolia: 42589987,
    optimismSepolia: 44572765,
  },
  jbSuckersRegistry: {
    ethereumSepolia: 11017560,
    arbitrumSepolia: 275181065,
    baseSepolia: 42590048,
    optimismSepolia: 44572786,
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
  address: addresses(
    ADDRESS.jbSuckersRegistry,
    ADDRESS.jbSuckersRegistry5
  ),
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
      ADDRESS.jb721TiersHookDeployer6
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
      ADDRESS.jb721TiersHookDeployer6
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
    address: addresses(ADDRESS.jbRulesets, ADDRESS.jbRulesets5, ADDRESS.jbRulesets6),
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
    address: addresses(ADDRESS.jbRulesets, ADDRESS.jbRulesets5, ADDRESS.jbRulesets6),
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
      rpc: process.env.RPC_URL_ETHEREUM,
    },
    arbitrum: {
      id: arbitrum.id,
      rpc: process.env.RPC_URL_ARBITRUM,
    },
    base: {
      id: base.id,
      rpc: process.env.RPC_URL_BASE,
    },
    optimism: {
      id: optimism.id,
      rpc: process.env.RPC_URL_OPTIMISM,
    },
  },
  contracts: {
    JBProjects: {
      abi: JBProjectsAbi,
      address: addresses(ADDRESS.jbProjects, ADDRESS.jbProjects5, ADDRESS.jbProjects6),
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
        ADDRESS.jbController6
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
        ADDRESS.jbMultiTerminal6
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
        ADDRESS.jbPermissions6
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
    RevDeployer: {
      abi: REVDeployerAbi,
      address: addresses(ADDRESS.revDeployer, ADDRESS.revDeployer5, ADDRESS.revDeployer6),
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
    RevLoans: {
      abi: REVLoansAbi,
      address: addresses(
        ADDRESS.revLoans,
        ADDRESS.revLoans1_1,
        ADDRESS.revLoans5,
        ADDRESS.revLoans6
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
    JBSuckersRegistry: {
      abi: JBSuckersRegistryAbi,
      address: addresses(
        ADDRESS.jbSuckersRegistry,
        ADDRESS.jbSuckersRegistry5
      ),
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
  },
});

export const testnetConfig = createConfig({
  ordering: "omnichain",
  chains: {
    ethereumSepolia: {
      id: sepolia.id,
      rpc: process.env.RPC_URL_ETHEREUM_SEPOLIA,
    },
    arbitrumSepolia: {
      id: arbitrumSepolia.id,
      rpc: process.env.RPC_URL_ARBITRUM_SEPOLIA,
    },
    baseSepolia: {
      id: baseSepolia.id,
      rpc: process.env.RPC_URL_BASE_SEPOLIA,
    },
    optimismSepolia: {
      id: optimismSepolia.id,
      rpc: process.env.RPC_URL_OPTIMISM_SEPOLIA,
    },
  },
  contracts: {
    JBProjects: {
      abi: JBProjectsAbi,
      address: addresses(ADDRESS.jbProjects, ADDRESS.jbProjects5, ADDRESS.jbProjects6),
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
        ADDRESS.jbController6
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
        ADDRESS.jbMultiTerminal6
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
          startBlock: V6_TESTNET_START_BLOCKS.jb721TiersHookDeployer.ethereumSepolia,
        },
        arbitrumSepolia: {
          startBlock: V6_TESTNET_START_BLOCKS.jb721TiersHookDeployer.arbitrumSepolia,
        },
        baseSepolia: {
          startBlock: V6_TESTNET_START_BLOCKS.jb721TiersHookDeployer.baseSepolia,
        },
        optimismSepolia: {
          startBlock: V6_TESTNET_START_BLOCKS.jb721TiersHookDeployer.optimismSepolia,
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
        ADDRESS.jbPermissions6
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
        ADDRESS.banny721TokenUriResolver6,
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
    RevDeployer: {
      abi: REVDeployerAbi,
      address: addresses(ADDRESS.revDeployer, ADDRESS.revDeployer5, ADDRESS.revDeployer6),
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
    RevLoans: {
      abi: REVLoansAbi,
      address: addresses(
        ADDRESS.revLoans,
        ADDRESS.revLoans1_1,
        ADDRESS.revLoans5,
        ADDRESS.revLoans6
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
    JBSuckersRegistry: {
      abi: JBSuckersRegistryAbi,
      address: addresses(
        ADDRESS.jbSuckersRegistry,
        ADDRESS.jbSuckersRegistry5
      ),
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
  },
});

export default process.env.TESTNET === "true" ? testnetConfig : mainnetConfig;
