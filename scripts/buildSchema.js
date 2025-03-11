import { readFileSync, writeFileSync } from "fs";

// write schema
const content = readFileSync("schema.graphql");

const schema =
  `import { gql } from "graphql-tag";

const typeDefs = gql${"`"}` +
  content
    .toString()
    .replaceAll("`", "'")
    .replaceAll(/type .* {\s/g, "$&  chain: Int!\n")
    .replaceAll(/filter {\s/g, "$&  chain: Int\n  chain_in: [Int]\n") +
  `${"`"};

export default typeDefs;
`;

writeFileSync("src/graphql/schema.js", schema);

// write list of schema types
const matches = schema.toString().match(/type .* {/g);

const schemaTypes = `const SCHEMA_TYPES = ${JSON.stringify(
  matches
    .map((match) => match.split("type")[1].split("{")[0].trim())
    .filter((m) => !m.startsWith("_"))
)}
  
export default SCHEMA_TYPES`;

writeFileSync("src/graphql/schemaTypes.js", schemaTypes);
