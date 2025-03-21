import { createConfig, factory } from "ponder";
import { http, parseAbiItem } from "viem";

import { JBProjectsAbi } from "./abis/JBProjectsAbi";
import { JBControllerAbi } from "./abis/JBControllerAbi";
import { JBMultiTerminalAbi } from "./abis/JBMultiTerminalAbi";
import { JBTokensAbi } from "./abis/JBTokensAbi";
import { JB721TiersHookDeployerAbi } from "./abis/JB721TiersHookDeployerAbi";
import { JBPermissionsAbi } from "./abis/JBPermissionsAbi";
import { Banny721TokenUriResolverAbi } from "./abis/Banny721TokenUriResolverAbi";
import { REVDeployerAbi } from "./abis/REVDeployerAbi";
import { JB721TiersHookAbi } from "./abis/JB721TiersHookAbi";

export default createConfig({
  networks: {
    mainnet: { chainId: 1, transport: http(process.env.PONDER_RPC_URL_1) },
  },
  contracts: {
    JBProjects: {
      network: "mainnet",
      address: "0x0b538a02610d7d3cc91ce2870f423e0a34d646ad",
      abi: JBProjectsAbi,
      startBlock: 21863142,
    },
    JBController: {
      network: "mainnet",
      address: "0xb291844f213047eb9e1621ae555b1eae6700d553",
      abi: JBControllerAbi,
      startBlock: 21863191,
    },
    JBMultiTerminal: {
      network: "mainnet",
      address: "0xdb9644369c79c3633cde70d2df50d827d7dc7dbc",
      abi: JBMultiTerminalAbi,
      startBlock: 21863215,
    },
    // JBTokens: {
    //   network: "mainnet",
    //   address: "0xa59e9f424901fb9dbd8913a9a32a081f9425bf36",
    //   abi: JBTokensAbi,
    //   startBlock: 21863179,
    // },
    JB721TiersHookDeployer: {
      network: "mainnet",
      address: "0xdefb489d101bf74bbf8f60eec6ff2f078c9d5206",
      abi: JB721TiersHookDeployerAbi,
      startBlock: 21863981,
    },
    JB721TiersHook: {
      network: "mainnet",
      abi: JB721TiersHookAbi,
      address: factory({
        address: "0xdefb489d101bf74bbf8f60eec6ff2f078c9d5206",
        event: parseAbiItem(
          "event HookDeployed(uint256 projectId, address hook, address caller)"
        ),
        parameter: "projectId",
      }),
      startBlock: 21863981,
    },
    // JBPermissions: {
    //   network: "mainnet",
    //   address: "0xf5ca295dc286a176e35ebb7833031fd95550eb14",
    //   abi: JBPermissionsAbi,
    //   startBlock: 21863136,
    // },
    Banny721TokenUriResolver: {
      network: "mainnet",
      address: "0xa5f8911d4cfd60a6697479f078409434424fe666",
      abi: Banny721TokenUriResolverAbi,
      startBlock: 22039034,
    },
    // RevDeployer: {
    //   network: "mainnet",
    //   address: "0x027f1684c6d31066c3f2468117f2508e8134fdfc",
    //   abi: REVDeployerAbi,
    //   startBlock: 21869094,
    // },
  },
});
