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
import { JBRulesetsAbi } from "./abis/JBRulesetsAbi";

const deployErc20FactoryConfig = factory({
  address: [ADDRESS.jbTokens, ADDRESS.jbTokens5],
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
const suckerDeployedFactoryConfig = factory({
  address: [ADDRESS.jbSuckersRegistry, ADDRESS.jbSuckersRegistry5],
  event: getAbiItem({ abi: JBSuckersRegistryAbi, name: "SuckerDeployedFor" }),
  parameter: "sucker",
});

const JB721TiersHookDeployer = {
  mainnet: {
    abi: JB721TiersHookDeployerAbi,
    address: [ADDRESS.jb721TiersHookDeployer, ADDRESS.jb721TiersHookDeployer5],
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
    address: [ADDRESS.jb721TiersHookDeployer, ADDRESS.jb721TiersHookDeployer5],
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
    address: [ADDRESS.jbTokens, ADDRESS.jbTokens5],
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
    address: [ADDRESS.jbTokens, ADDRESS.jbTokens5],
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
    address: [ADDRESS.jbRulesets, ADDRESS.jbRulesets5],
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
    address: [ADDRESS.jbRulesets, ADDRESS.jbRulesets5],
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
      address: [ADDRESS.jbProjects, ADDRESS.jbProjects5],
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
      address: [
        ADDRESS.jbController,
        ADDRESS.jbController4_1,
        ADDRESS.jbController5,
      ],
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
      address: [ADDRESS.jbMultiTerminal, ADDRESS.jbMultiTerminal5],
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
      address: [ADDRESS.jbPermissions, ADDRESS.jbPermissions5],
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
      address: [
        ADDRESS.banny721TokenUriResolver,
        ADDRESS.banny721TokenUriResolver5,
      ],
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
      address: [ADDRESS.revDeployer, ADDRESS.revDeployer5],
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
      address: [ADDRESS.revLoans, ADDRESS.revLoans1_1, ADDRESS.revLoans5],
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
      address: [ADDRESS.jbSuckersRegistry, ADDRESS.jbSuckersRegistry5],
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
      address: [ADDRESS.jbProjects, ADDRESS.jbProjects5],
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
      address: [
        ADDRESS.jbController,
        ADDRESS.jbController4_1,
        ADDRESS.jbController5,
      ],
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
      address: [ADDRESS.jbMultiTerminal, ADDRESS.jbMultiTerminal5],
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
      address: [ADDRESS.jbPermissions, ADDRESS.jbPermissions5],
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
    RevDeployer: {
      abi: REVDeployerAbi,
      address: [ADDRESS.revDeployer, ADDRESS.revDeployer5],
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
      address: [ADDRESS.revLoans, ADDRESS.revLoans1_1, ADDRESS.revLoans5],
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
      address: [ADDRESS.jbSuckersRegistry, ADDRESS.jbSuckersRegistry5],
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
  },
});

export default process.env.TESTNET === "true" ? testnetConfig : mainnetConfig;
