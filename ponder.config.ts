import { createConfig, factory } from "ponder";
import { erc20Abi, getAbiItem, http } from "viem";

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

const rpcUrl = (prefix: string) =>
  http(`https://${prefix}.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`);

const deployErc20FactoryConfig = factory({
  address: ADDRESS.jbTokens,
  event: getAbiItem({ abi: JBTokensAbi, name: "DeployERC20" }),
  parameter: "token",
});

const hookDeployedFactoryConfig = factory({
  address: ADDRESS.jb721TiersHookDeployer,
  event: getAbiItem({ abi: JB721TiersHookDeployerAbi, name: "HookDeployed" }),
  parameter: "hook",
});

const JB721TiersHookDeployer = {
  mainnet: {
    abi: JB721TiersHookDeployerAbi,
    address: ADDRESS.jb721TiersHookDeployer,
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
    address: ADDRESS.jb721TiersHookDeployer,
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
    address: ADDRESS.jbTokens,
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
    address: ADDRESS.jbTokens,
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

export const mainnetConfig = createConfig({
  ordering: "multichain",
  chains: {
    ethereum: { id: mainnet.id, rpc: rpcUrl("eth-mainnet") },
    arbitrum: { id: arbitrum.id, rpc: rpcUrl("arb-mainnet") },
    base: { id: base.id, rpc: rpcUrl("base-mainnet") },
    optimism: { id: optimism.id, rpc: rpcUrl("opt-mainnet") },
  },
  contracts: {
    JBProjects: {
      abi: JBProjectsAbi,
      address: ADDRESS.jbProjects,
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
      address: ADDRESS.jbController,
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
      address: ADDRESS.jbMultiTerminal,
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
    JBTokens: JBTokens.mainnet,
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
      address: ADDRESS.jbPermissions,
      abi: JBPermissionsAbi,
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
      address: ADDRESS.banny721TokenUriResolver,
      chain: {
        ethereum: {
          startBlock: 22039034,
        },
        arbitrum: {
          startBlock: 315299005,
        },
        base: {
          startBlock: 27545253,
        },
        optimism: {
          startBlock: 133140537,
        },
      },
    },
    RevDeployer: {
      abi: REVDeployerAbi,
      address: ADDRESS.revDeployer,
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
      address: ADDRESS.revLoans,
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
      address: ADDRESS.jbSuckersRegistry,
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
  chains: {
    ethereumSepolia: {
      id: sepolia.id,
      rpc: rpcUrl("eth-sepolia"),
    },
    arbitrumSepolia: {
      id: arbitrumSepolia.id,
      rpc: rpcUrl("arb-sepolia"),
    },
    baseSepolia: {
      id: baseSepolia.id,
      rpc: rpcUrl("base-sepolia"),
    },
    optimismSepolia: {
      id: optimismSepolia.id,
      rpc: rpcUrl("opt-sepolia"),
    },
  },
  contracts: {
    JBProjects: {
      abi: JBProjectsAbi,
      address: ADDRESS.jbProjects,
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
      address: ADDRESS.jbController,
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
      address: ADDRESS.jbMultiTerminal,
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
    JBTokens: JBTokens.testnet,
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
      address: ADDRESS.jbPermissions,
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
      address: ADDRESS.banny721TokenUriResolver,
      chain: {
        ethereumSepolia: {
          startBlock: 7894609,
        },
        arbitrumSepolia: {
          startBlock: 132035055,
        },
        baseSepolia: {
          startBlock: 23055756,
        },
        optimismSepolia: {
          startBlock: 25038630,
        },
      },
    },
    RevDeployer: {
      abi: REVDeployerAbi,
      address: ADDRESS.revDeployer,
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
      address: ADDRESS.revLoans,
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
      address: ADDRESS.jbSuckersRegistry,
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
