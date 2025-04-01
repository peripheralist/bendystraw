import { createConfig, factory } from "ponder";
import { http, parseAbiItem } from "viem";

import { Banny721TokenUriResolverAbi } from "./abis/Banny721TokenUriResolverAbi";
import { JB721TiersHookAbi } from "./abis/JB721TiersHookAbi";
import { JB721TiersHookDeployerAbi } from "./abis/JB721TiersHookDeployerAbi";
import { JBControllerAbi } from "./abis/JBControllerAbi";
import { JBMultiTerminalAbi } from "./abis/JBMultiTerminalAbi";
import { JBProjectsAbi } from "./abis/JBProjectsAbi";

const transportUrl = (prefix: string) =>
  http(`https://${prefix}.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`);

export default createConfig({
  networks: {
    mainnet: { chainId: 1, transport: transportUrl("eth-mainnet") },
    base: { chainId: 8453, transport: transportUrl("base-mainnet") },
  },
  contracts: {
    JBProjects: {
      abi: JBProjectsAbi,
      address: "0x0b538a02610d7d3cc91ce2870f423e0a34d646ad",
      network: {
        mainnet: {
          startBlock: 21863142,
        },
        base: {
          startBlock: 26484953,
        },
      },
    },
    JBController: {
      abi: JBControllerAbi,
      address: "0xb291844f213047eb9e1621ae555b1eae6700d553",
      network: {
        mainnet: {
          startBlock: 21863191,
        },
        base: {
          startBlock: 26485017,
        },
      },
    },
    JBMultiTerminal: {
      abi: JBMultiTerminalAbi,
      address: "0xdb9644369c79c3633cde70d2df50d827d7dc7dbc",
      network: {
        mainnet: {
          startBlock: 21863215,
        },
        base: {
          startBlock: 26485049,
        },
      },
    },
    // JBTokens: {
    //   network: "mainnet",
    //   address: "0xa59e9f424901fb9dbd8913a9a32a081f9425bf36",
    //   abi: JBTokensAbi,
    //   startBlock: 21863179,
    // },
    JB721TiersHookDeployer: {
      abi: JB721TiersHookDeployerAbi,
      address: "0xdefb489d101bf74bbf8f60eec6ff2f078c9d5206",
      network: {
        mainnet: {
          startBlock: 21863981,
        },
        base: {
          startBlock: 26490148,
        },
      },
    },
    JB721TiersHook: {
      abi: JB721TiersHookAbi,
      network: {
        mainnet: {
          address: factory({
            address: "0xdefb489d101bf74bbf8f60eec6ff2f078c9d5206",
            event: parseAbiItem(
              "event HookDeployed(uint256 projectId, address hook, address caller)"
            ),
            parameter: "projectId",
          }),
          startBlock: 21863215,
        },
        base: {
          address: factory({
            address: "0xdefb489d101bf74bbf8f60eec6ff2f078c9d5206",
            event: parseAbiItem(
              "event HookDeployed(uint256 projectId, address hook, address caller)"
            ),
            parameter: "projectId",
          }),
          startBlock: 26490148,
        },
      },
    },
    // JBPermissions: {
    //   network: "mainnet",
    //   address: "0xf5ca295dc286a176e35ebb7833031fd95550eb14",
    //   abi: JBPermissionsAbi,
    //   startBlock: 21863136,
    // },
    Banny721TokenUriResolver: {
      abi: Banny721TokenUriResolverAbi,
      address: "0xa5f8911d4cfd60a6697479f078409434424fe666",
      network: {
        mainnet: {
          startBlock: 22039034,
        },
        base: {
          startBlock: 27545253,
        },
      },
    },
    // RevDeployer: {
    //   network: "mainnet",
    //   address: "0x027f1684c6d31066c3f2468117f2508e8134fdfc",
    //   abi: REVDeployerAbi,
    //   startBlock: 21869094,
    // },
  },
});
