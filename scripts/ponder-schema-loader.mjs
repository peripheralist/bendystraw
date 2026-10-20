// Resolves Ponder's virtual `ponder:schema` to the real schema so checks can
// import handler utilities outside Ponder. Use: node --import tsx --import ./scripts/ponder-schema-loader.mjs
import { register } from "node:module";

register(
  `data:text/javascript,export async function resolve(specifier, context, next) {
    if (specifier === "ponder:schema") return next(${JSON.stringify(new URL("../ponder.schema.ts", import.meta.url).href)}, context);
    return next(specifier, context);
  }`
);
