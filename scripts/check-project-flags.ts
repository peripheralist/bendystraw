// Checks how projects are marked as Sticky and Homerun projects, running the real HomerunDeployer
// handlers against an in-memory database. Run: yarn tsx scripts/check-project-flags.ts
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { runInNewContext } from "node:vm";
import ts from "typescript";
import { ADDRESS } from "../src/constants/address";
import { isRevnetOwner, isStickyOwner } from "../src/util/getVersion";

type Row = Record<string, any>;

// isSticky follows the owner, like isRevnet, and only on V6.
assert.equal(isStickyOwner(ADDRESS.stickyDeployer6, 6), true);
assert.equal(isStickyOwner("0xdA38Ec48B5b1d186B02BA99F297e95153BEE33a9", 6), true);
assert.equal(isStickyOwner(ADDRESS.stickyDeployer6, 5), false);
assert.equal(isStickyOwner(ADDRESS.revOwner6, 6), false);
assert.equal(isRevnetOwner(ADDRESS.stickyDeployer6, 6), false);

// isHomerun comes from HomerunDeployer events, for the FUND and its INCOME revnet.
const projects = new Map<string, Row>();
const participants: Row[] = [];
const projectKey = (key: Row) => `${key.version}:${key.chainId}:${key.projectId}`;
for (const projectId of [1, 2, 3]) {
  projects.set(projectKey({ version: 6, chainId: 8453, projectId }), { projectId, isHomerun: false });
  participants.push({ version: 6, chainId: 8453, projectId, isHomerun: false });
}
participants.push({ version: 5, chainId: 8453, projectId: 2, isHomerun: false });
participants.push({ version: 6, chainId: 10, projectId: 2, isHomerun: false });

const db = {
  update(_table: string, key: Row) {
    return {
      async set(update: Row) {
        const row = projects.get(projectKey(key));
        assert.ok(row, `Missing project ${projectKey(key)}`);
        Object.assign(row, update);
      },
    };
  },
  sql: {
    update(table: unknown) {
      assert.equal(String(table), "participant");
      return {
        set(update: Row) {
          return {
            async where(conditions: { column: string; value: unknown }[]) {
              for (const row of participants) {
                if (conditions.every(({ column, value }) => row[column] === value)) Object.assign(row, update);
              }
            },
          };
        },
      };
    },
  },
};

const handlers = new Map<string, (input: Row) => Promise<void>>();
const source = readFileSync(new URL("../src/HomerunDeployer.ts", import.meta.url), "utf8");
const compiled = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
}).outputText;
runInNewContext(compiled, {
  exports: {},
  console,
  require(name: string) {
    if (name === "ponder") {
      return {
        and: (...conditions: unknown[]) => conditions,
        eq: (column: string, value: unknown) => ({ column, value }),
      };
    }
    if (name === "ponder:registry") {
      return { ponder: { on: (event: string, handler: (input: Row) => Promise<void>) => handlers.set(event, handler) } };
    }
    if (name === "ponder:schema") {
      return {
        project: "project",
        participant: { chainId: "chainId", projectId: "projectId", version: "version", toString: () => "participant" },
      };
    }
    throw new Error(`Unexpected import ${name}`);
  },
});

const context = { chain: { id: 8453 }, db };
await handlers.get("HomerunDeployer:FundLaunched")!({ event: { args: { projectId: 1n } }, context });
await handlers.get("HomerunDeployer:IncomeDeployed")!({
  event: { args: { fundProjectId: 1n, incomeProjectId: 2n } },
  context,
});

assert.deepEqual(
  [1, 2, 3].map((projectId) => projects.get(projectKey({ version: 6, chainId: 8453, projectId }))!.isHomerun),
  [true, true, false]
);
assert.deepEqual(
  participants.map((row) => row.isHomerun),
  [true, true, false, false, false]
);

console.log("Sticky and Homerun project flags verified.");
