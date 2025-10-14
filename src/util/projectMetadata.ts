import axios from "axios";
import { project } from "ponder:schema";

const API_KEY = process.env.INFURA_API_KEY;
const API_KEY_SECRET = process.env.INFURA_API_KEY_SECRET;

type ProjectMetadata = Pick<
  typeof project.$inferSelect,
  | "name"
  | "infoUri"
  | "logoUri"
  | "coverImageUri"
  | "description"
  | "twitter"
  | "farcaster"
  | "telegram"
  | "tokens"
  | "tags"
  | "domain"
  | "projectTagline"
  | "payDisclosure"
  | "discord"
>;

export async function parseProjectMetadata(uri: string) {
  try {
    if (!API_KEY || !API_KEY_SECRET) {
      throw new Error("Missing API key or API key secret");
    }

    const cid = uri.includes("ipfs://") ? uri.split("ipfs://")[1] : uri;

    if (!cid?.length) {
      return null;
    }

    const _uri = `https://ipfs.infura.io:5001/api/v0/get?arg=${cid}`;

    return await axios
      .post(
        _uri,
        {},
        {
          headers: {
            Authorization: `Basic ${btoa(`${API_KEY}:${API_KEY_SECRET}`)}`,
          },
          timeout: 5000,
        }
      )
      .then((res) => {
        const formattedRes = `{${res.data.split("{")[1].split("}")[0]}}`;
        const normalized = normalizeMetadataString(formattedRes);
        try {
          return JSON.parse(normalized) as ProjectMetadata;
        } catch (e) {
          console.log("Error formatting metadata response", formattedRes);
          return null;
        }
      });
  } catch (e) {
    console.warn("Error parsing project metadata", uri, e);
    return null;
  }
}

// fix known errors, etc
function normalizeMetadataString(str: string) {
  return str.replace(`,"nftPaymentSuccessModal":}`, "}");
}
