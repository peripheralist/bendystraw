// import axios from "axios";

// export async function parseProjectMetadata(uri: string) {
//   let name = null;
//   let description = null;
//   let tags = null;

//   try {
//     const cid = uri.includes("ipfs://") ? uri.split("ipfs://")[1] : uri;
//     const _uri = `https://dweb.link/ipfs/${cid}`;

//     const metadata = await axios.get(_uri).then((res) => atob(res.data));

//     console.log("ASDF metadata", _uri, metadata);

//     if (typeof metadata.name === "string") {
//       name = metadata.name;
//     }
//     if (typeof metadata.description === "string") {
//       description = metadata.description;
//     }
//     if (Array.isArray(metadata.tags)) {
//       tags = metadata.tags;
//     }

//     return { name, description, tags };
//   } catch (e) {
//     console.warn("Error parsing project metadata", uri, e);
//   }
// }
