import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { encodedIpfsUriToCid, toCidV1 } from "./cid";
import {
  parseProjectMetadataPayload,
  projectMetadataPath,
  projectMetadataRequests,
  projectMetadataUpdate,
} from "./projectMetadata";

const CID = "QmYwAPJzv5CZsnAzt8auVZRnGiRAzYvsnKqTn6X8qYwP4S";
const CID_V1 = "bafybeie5nqv6kd3qnfjuprw2scvucpip3oj6oqf4tg37l45jufjhtbxo74";

void describe("project metadata", () => {
  void it("extracts IPFS paths without allowing arbitrary HTTP requests", () => {
    assert.equal(projectMetadataPath(`ipfs://${CID}`), CID);
    assert.equal(
      projectMetadataPath(`https://gateway.example/ipfs/${CID}/metadata.json`),
      `${CID}/metadata.json`
    );
    assert.equal(projectMetadataPath("https://example.com/metadata.json"), null);
  });

  void it("uses the eth.sucks subdomain gateway with public gateway fallbacks", () => {
    const requests = projectMetadataRequests(`ipfs://${CID}/metadata.json`);

    assert.equal(requests.length, 5);
    assert.equal(
      requests[0]!.url,
      `https://${CID_V1}.eth.sucks/metadata.json`
    );
    assert.equal(
      requests[1]!.url,
      `https://ipfs.filebase.io/ipfs/${CID}/metadata.json`
    );
    assert.equal(
      requests[2]!.url,
      `https://gateway.pinata.cloud/ipfs/${CID}/metadata.json`
    );
    assert.equal(
      requests[3]!.url,
      `https://dweb.link/ipfs/${CID}/metadata.json`
    );
    assert.equal(requests[4]!.url, `https://ipfs.io/ipfs/${CID}/metadata.json`);
    assert.ok(requests.every((request) => request.method === "get"));
  });

  void it("omits the /ipfs/ path segment from the subdomain gateway", () => {
    const requests = projectMetadataRequests(`ipfs://${CID}`);

    assert.equal(requests[0]!.url, `https://${CID_V1}.eth.sucks`);
  });

  void it("no longer sends requests to Infura", () => {
    const requests = projectMetadataRequests(`ipfs://${CID}/metadata.json`);

    assert.ok(requests.every((request) => !request.url.includes("infura")));
  });

  void it("converts CIDv0 to the base32 CIDv1 a subdomain label requires", () => {
    // Canonical empty-directory CID, in both representations.
    assert.equal(
      toCidV1("QmUNLLsPACCz1vLxQVkXqqLX5R1X345qqfHbsf67hvA3Nn"),
      "bafybeiczsscdsbs7ffqz55asqdf3smv6klcw3gofszvwlyarci47bgf354"
    );

    // A CIDv1 is already usable as a DNS label.
    const cidV1 = "bafkreiadffzsgn22zdlafgo7hyqhowyz4nyg4ql6ycicw4asxrn7xqngta";
    assert.equal(toCidV1(cidV1), cidV1);

    assert.equal(toCidV1("Qmnotavalidbase58cid"), null);
  });

  void it("parses complete nested JSON instead of truncating at the first brace", () => {
    const metadata = parseProjectMetadataPayload(
      JSON.stringify({
        name: "Updated project",
        configuration: { nested: { enabled: true } },
        logoUri: "ipfs://logo",
      })
    );

    assert.equal(metadata?.name, "Updated project");
    assert.equal(metadata?.logoUri, "ipfs://logo");
  });

  void it("normalizes the known malformed modal field", () => {
    const metadata = parseProjectMetadataPayload(
      `{"name":"Project","nftPaymentSuccessModal":}`
    );

    assert.equal(metadata?.name, "Project");
  });

  void it("clears stale searchable fields when refreshed metadata is unavailable", () => {
    const update = projectMetadataUpdate(`ipfs://${CID}`, null);

    assert.equal(update.metadataUri, `ipfs://${CID}`);
    assert.equal(update.metadata, null);
    assert.equal(update.name, null);
    assert.equal(update.logoUri, null);
    assert.equal(update.payDisclosure, null);
  });

  void it("indexes all searchable metadata fields", () => {
    const update = projectMetadataUpdate(`ipfs://${CID}`, {
      name: "Project",
      logoUri: "ipfs://logo",
      payDisclosure: "Terms apply",
    });

    assert.equal(update.name, "Project");
    assert.equal(update.logoUri, "ipfs://logo");
    assert.equal(update.payDisclosure, "Terms apply");
  });
});

void describe("encodedIpfsUriToCid", () => {
  void it("rebuilds the CIDv0 from a tier's 32-byte digest", () => {
    // base:13 tier 2 — resolvedUri "", metadata null in prod, JSON lives at this CID.
    assert.equal(
      encodedIpfsUriToCid("0x7f3e72a92de253df727f179cd26f0981b56e59c11ea08a25b7e668b8d25a6e82"),
      "QmWuMiWBSsEfK39mdgoYU4ufzaB7y6ahYxN8m1hCza4Jvu"
    );
  });

  void it("round-trips through toCidV1's base58 decoder", () => {
    const hex = "0x9f668ba0fc3a75e8a3cb5c4e32f0a2e3a7d0ea9e1b3c4d5e6f708192a3b4c5d6";
    const cid = encodedIpfsUriToCid(hex)!;
    assert.equal(cid.startsWith("Qm"), true);
    assert.notEqual(toCidV1(cid), null);
  });

  void it("is null for the zero value and malformed input", () => {
    assert.equal(encodedIpfsUriToCid(`0x${"0".repeat(64)}`), null);
    assert.equal(encodedIpfsUriToCid("0x1234"), null);
    assert.equal(encodedIpfsUriToCid(null), null);
  });
});
