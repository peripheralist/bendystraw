import axios from "axios";

export type ProjectMetadata = {
  name?: string;
  infoUri?: string;
  logoUri?: string;
  coverImageUri?: string;
  description?: string;
  twitter?: string;
  farcaster?: string;
  telegram?: string;
  tokens?: string[];
  tags?: string[];
  domain?: string;
  projectTagline?: string;
  payDisclosure?: string;
  discord?: string;
};

type MetadataRequest = {
  method: "get" | "post";
  url: string;
  headers?: { Authorization: string };
};

export async function parseProjectMetadata(uri: string) {
  const requests = projectMetadataRequests(uri);
  if (!requests.length) {
    return null;
  }

  try {
    return await Promise.any(
      requests.map(async (request) => {
        const response = await axios.request({
          ...request,
          timeout: 5000,
          responseType: "text",
          transformResponse: [(data) => data],
        });
        const metadata = parseProjectMetadataPayload(response.data);

        if (!metadata) {
          throw new Error(`Invalid metadata response from ${request.url}`);
        }

        return metadata;
      })
    );
  } catch {
    console.warn("Unable to fetch or parse project metadata", uri);
    return null;
  }
}

export function projectMetadataRequests(
  uri: string,
  infuraApiKey = process.env.INFURA_API_KEY,
  infuraApiKeySecret = process.env.INFURA_API_KEY_SECRET
): MetadataRequest[] {
  const path = projectMetadataPath(uri);
  if (!path) return [];

  const encodedPath = path
    .split("/")
    .map((segment) => encodeURIComponent(segment))
    .join("/");
  const requests: MetadataRequest[] = [];

  if (infuraApiKey && infuraApiKeySecret) {
    requests.push({
      method: "post",
      url: `https://ipfs.infura.io:5001/api/v0/cat?arg=${encodeURIComponent(path)}`,
      headers: {
        Authorization: `Basic ${Buffer.from(
          `${infuraApiKey}:${infuraApiKeySecret}`
        ).toString("base64")}`,
      },
    });
  }

  requests.push(
    {
      method: "get",
      url: `https://dweb.link/ipfs/${encodedPath}`,
    },
    {
      method: "get",
      url: `https://ipfs.io/ipfs/${encodedPath}`,
    }
  );

  return requests;
}

export function projectMetadataPath(uri: string) {
  const trimmedUri = uri.trim();
  if (!trimmedUri) return null;

  let path = trimmedUri;

  if (trimmedUri.startsWith("ipfs://")) {
    path = trimmedUri.slice("ipfs://".length);
  } else if (/^https?:\/\//i.test(trimmedUri)) {
    try {
      const url = new URL(trimmedUri);
      const marker = "/ipfs/";
      const markerIndex = url.pathname.indexOf(marker);
      if (markerIndex === -1) return null;
      path = url.pathname.slice(markerIndex + marker.length);
    } catch {
      return null;
    }
  }

  path = path.replace(/^ipfs\//, "").replace(/^\/+|\/+$/g, "");

  // Only accept an IPFS CID and an optional path. This keeps gateway requests
  // scoped to IPFS instead of turning an onchain URI into an arbitrary request.
  if (
    !/^(?:Qm[1-9A-HJ-NP-Za-km-z]{44}|b[a-z2-7]{20,})(?:\/[^?#\s]+)*$/i.test(
      path
    )
  ) {
    return null;
  }

  return path;
}

export function parseProjectMetadataPayload(
  payload: unknown
): ProjectMetadata | null {
  if (
    typeof payload === "object" &&
    payload !== null &&
    !Array.isArray(payload) &&
    !Buffer.isBuffer(payload)
  ) {
    return payload as ProjectMetadata;
  }

  const value = Buffer.isBuffer(payload)
    ? payload.toString("utf8")
    : typeof payload === "string"
      ? payload
      : null;

  if (!value) return null;

  try {
    const parsed = JSON.parse(normalizeMetadataString(value.trim()));
    return typeof parsed === "object" && parsed !== null && !Array.isArray(parsed)
      ? (parsed as ProjectMetadata)
      : null;
  } catch {
    return null;
  }
}

export function projectMetadataUpdate(
  metadataUri: string,
  metadata: ProjectMetadata | null
) {
  return {
    metadataUri,
    metadata,
    name: metadata?.name ?? null,
    infoUri: metadata?.infoUri ?? null,
    logoUri: metadata?.logoUri ?? null,
    coverImageUri: metadata?.coverImageUri ?? null,
    twitter: metadata?.twitter ?? null,
    farcaster: metadata?.farcaster ?? null,
    discord: metadata?.discord ?? null,
    telegram: metadata?.telegram ?? null,
    tokens: metadata?.tokens ?? null,
    domain: metadata?.domain ?? null,
    description: metadata?.description ?? null,
    tags: metadata?.tags ?? null,
    projectTagline: metadata?.projectTagline ?? null,
    payDisclosure: metadata?.payDisclosure ?? null,
  };
}

// fix known errors, etc
function normalizeMetadataString(str: string) {
  return str.replace(`,"nftPaymentSuccessModal":}`, "}");
}
