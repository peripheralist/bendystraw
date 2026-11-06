import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { runInNewContext } from "node:vm";
import ts from "typescript";
import { ADDRESS } from "../src/constants/address";
import { bannyRetailHookForVersion } from "../src/constants/bannyHook";
import { getVersion } from "../src/util/getVersion";

for (const address of [ADDRESS.banny721TokenUriResolver6, ADDRESS.banny721TokenUriResolver6_upgraded]) {
  assert.equal(getVersion({ log: { address } }, "banny721TokenUriResolver"), 6);
}
assert.equal(getVersion({ log: { address: ADDRESS.banny721TokenUriResolver5 } }, "banny721TokenUriResolver"), 5);
assert.equal(getVersion({ log: { address: ADDRESS.banny721TokenUriResolver } }, "banny721TokenUriResolver"), 4);

// Mainnet and testnet collections both moved to the upgraded resolver, so both sources watch both addresses.
const config = readFileSync("ponder.config.ts", "utf8");
assert.equal(
  config.split("address: [ADDRESS.banny721TokenUriResolver6, ADDRESS.banny721TokenUriResolver6_upgraded]").length - 1,
  2,
);

// Exercise the actual SVG reader: a V6 collection can switch resolvers without
// changing protocol version, and replay must follow the resolver at each block.
const source = readFileSync(new URL("../src/util/getBannySvg.ts", import.meta.url), "utf8");
const compiled = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
}).outputText;
const exported: Record<string, (...args: any[]) => Promise<unknown>> = {};
runInNewContext(compiled, {
  exports: exported,
  require(name: string) {
    if (name.endsWith("/constants/address")) return { ADDRESS };
    if (name.endsWith("/constants/bannyHook")) return { bannyRetailHookForVersion };
    if (name.includes("Abi")) return new Proxy({}, { get: () => [] });
    throw new Error(`Unexpected import ${name}`);
  },
});
const store = "0x1111111111111111111111111111111111111111";
for (const resolver of [ADDRESS.banny721TokenUriResolver6, ADDRESS.banny721TokenUriResolver6_upgraded]) {
  const calls: any[] = [];
  const context = {
    chain: { id: 1, name: "ethereum" },
    client: { async readContract(call: any) {
      calls.push(call);
      if (call.functionName === "STORE") return store;
      if (call.functionName === "tokenUriResolverOf") return resolver;
      return "<svg/>";
    } },
  };
  const getSvg = exported.getBannySvg!;
  assert.equal(await getSvg({ context, tierId: 3n, block: 26279307n, version: 6 }), "<svg/>");
  assert.deepEqual(calls.map(({ functionName }) => functionName), ["STORE", "tokenUriResolverOf", "svgOf"]);
  assert.equal(calls[0].address, bannyRetailHookForVersion(6, 1));
  assert.equal(calls[1].address, store);
  assert.equal(calls[1].args[0], bannyRetailHookForVersion(6, 1));
  assert.equal(calls[2].address, resolver);
  assert.equal(calls[2].args[1], 3_000_000_000n);
  calls.length = 0;
  assert.equal(await getSvg({ context, tierId: 3n, block: 1n, version: 6 }), null);
  assert.equal(calls.length, 0);
  await getSvg({ context, tierId: 3n, block: 26279307n, version: 5 });
  assert.equal(calls.length, 1);
  assert.equal(calls[0].address, ADDRESS.banny721TokenUriResolver5);
}
console.log("Banny resolver upgrades retain V6 classification and follow collection SVG resolution.");
