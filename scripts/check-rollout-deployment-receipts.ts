import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { resolve } from "node:path";

// Exercise the actual generator's deployment gate. An address copied out of a
// proposal must never turn into an indexer source without a successful receipt.
const directory = mkdtempSync(resolve(tmpdir(), "bendystraw-receipt-gate-"));
const generator = resolve("scripts/generate-rollout-deployments.ts");
const tsx = resolve("node_modules/tsx/dist/esm/index.mjs");
try {
  for (const subdirectory of ["deployments/sepolia", "src/constants", "abis"]) {
    mkdirSync(resolve(directory, subdirectory), { recursive: true });
  }
  const contracts = ["JBBuybackHook", "JBRouterTerminal", "JBRouterTerminalGateway", "CTPublisher"];
  const artifact = {
    address: "0x1111111111111111111111111111111111111111",
    chainId: "0xaa36a7",
    gitCommit: "npm:@bananapus/router-terminal-v6@1.3.0",
    abi: [],
    receipt: { blockNumber: "0x1234", status: "0x1", transactionHash: `0x${"22".repeat(32)}` },
  };
  const writeArtifact = (value: unknown) => writeFileSync(resolve(directory, "deployments/sepolia/JBRouterTerminalGateway.json"), JSON.stringify(value));
  for (const contract of contracts) writeFileSync(resolve(directory, `deployments/sepolia/${contract}.json`), JSON.stringify(artifact));
  const run = () => spawnSync(process.execPath, ["--import", tsx, generator, "--deployments", resolve(directory, "deployments")], { cwd: directory, encoding: "utf8" });
  let result = run();
  assert.equal(result.status, 0, result.stderr);
  const validManifest = readFileSync(resolve(directory, "src/constants/rolloutDeployments.ts"), "utf8");
  assert.match(validManifest, /"startBlock": 4660/);
  for (const invalid of [
    { ...artifact, receipt: undefined },
    { ...artifact, receipt: { ...artifact.receipt, status: "0x0" } },
    { ...artifact, receipt: { ...artifact.receipt, blockNumber: "0x0" } },
    { ...artifact, chainId: "0x1" },
  ]) {
    writeArtifact(invalid);
    result = run();
    assert.notEqual(result.status, 0, "Invalid deployment must fail generation");
    assert.equal(readFileSync(resolve(directory, "src/constants/rolloutDeployments.ts"), "utf8"), validManifest, "Rejected artifact must leave the previous manifest intact");
  }
  console.log("Deployment receipt gate rejects proposed, failed, and wrong-chain artifacts.");
} finally {
  rmSync(directory, { recursive: true, force: true });
}
