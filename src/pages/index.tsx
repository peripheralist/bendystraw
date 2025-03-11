import Head from "next/head";
import SCHEMA_TYPES from "@/graphql/schemaTypes";
import { QUERY_NAMES } from "@/constants/queryNames";
import Link from "next/link";

export default function Home() {
  return (
    <>
      <Head>
        <title>Juicebox Graphql API</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div style={{ padding: 40, maxWidth: 600, margin: "0 auto" }}>
        <h1>BendyStraw</h1>
        <h4>Juicebox Graphql API</h4>
        <br />
        <p>
          BendyStraw enables querying Juicebox subgraph data from multiple
          blockchains in a single graphql query. Each entity includes a{" "}
          <code>chain</code> (chain ID) property, which can also be used as an
          argument to filter or sort entities.
        </p>
        <br />
        <code style={{ whiteSpace: "pre", display: "block", padding: 10 }}>
          {`query {
  nfts(where: { chain: 1 }) {
    id
    tokenId
  }

  projects(where: { chain_in: [1, 8453] }) {
    id
    chain
  }
}`}
        </code>
        <br />
        <br />
        <Link href={"/api/graphql"}>Explore the API</Link>
        <br />
        <br />
        <br />
        <br />
        <br />
        <div style={{ fontSize: "0.8rem" }}>
          <span style={{ fontWeight: "bold" }}>Supported</span> |{" "}
          <span style={{ color: "gray" }}>Not yet supported</span>
        </div>
        <br />
        <h2>Chains:</h2>
        <br />
        <ul>
          <li style={{ fontWeight: "bold" }}>Ethereum</li>
          <li style={{ color: "gray" }}>Ethereum Sepolia</li>
          <li style={{ fontWeight: "bold" }}>Base</li>
          <li style={{ color: "gray" }}>Base Sepolia</li>
          <li style={{ color: "gray" }}>Optimism</li>
          <li style={{ color: "gray" }}>Optimism Sepolia</li>
          <li style={{ color: "gray" }}>Arbitrum</li>
          <li style={{ color: "gray" }}>Arbitrum Sepolia</li>
        </ul>
        <br />
        <h2>Queries:</h2>
        <br />
        <ul>
          {SCHEMA_TYPES?.sort().map((n) => {
            const supported = QUERY_NAMES.some(
              (_n) => _n.toLowerCase().slice(0, -1) === n.toLowerCase()
            );

            return (
              <li
                key={n}
                style={{
                  color: supported ? undefined : "gray",
                  fontWeight: supported ? "bold" : undefined,
                }}
              >
                {n}
              </li>
            );
          })}
        </ul>
      </div>
    </>
  );
}
