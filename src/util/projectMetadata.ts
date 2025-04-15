import axios from "axios";
import { projectMetadata } from "ponder:schema";

export type ProjectMetadata = Omit<
  typeof projectMetadata.$inferInsert,
  "chainId" | "projectId"
>;

const API_KEY = process.env.INFURA_API_KEY;
const API_KEY_SECRET = process.env.INFURA_API_KEY_SECRET;

export async function parseProjectMetadata(uri: string) {
  const metadata: ProjectMetadata = {};

  try {
    if (!API_KEY || !API_KEY_SECRET) {
      throw new Error("Missing API key or API key secret");
    }

    const cid = uri.includes("ipfs://") ? uri.split("ipfs://")[1] : uri;

    const _uri = `https://ipfs.infura.io:5001/api/v0/get?arg=${cid}`;

    const _metadata: ProjectMetadata = await axios
      .post(
        _uri,
        {},
        {
          headers: {
            Authorization: `Basic ${btoa(`${API_KEY}:${API_KEY_SECRET}`)}`,
          },
        }
      )
      .then((res) => JSON.parse(`{${res.data.split("{")[1].split("}")[0]}}`));

    const propNames: (keyof ProjectMetadata)[] = [
      "coverImageUri",
      "description",
      "discord",
      "domain",
      "infoUri",
      "logoUri",
      "name",
      "payDisclosure",
      "projectTagline",
      "tags",
      "telegram",
      "twitter",
      "version",
    ] as const;

    // manually copy props to ensure any removed props will overwrite any exising row
    for (const n of propNames) {
      metadata[n] = (_metadata[n] ?? null) as any;
    }
  } catch (e) {
    console.warn("Error parsing project metadata", uri, e);
  }

  return metadata;
}
