export function parseProjectMetadata(uri: string) {
  let name;
  let description;
  let tags;

  try {
    const metadata = JSON.parse(atob(uri));

    console.log("ASDF metadata");

    if (typeof metadata.name === "string") {
      name = metadata.name;
    }
    if (typeof metadata.description === "string") {
      description = metadata.description;
    }
    if (Array.isArray(metadata.tags)) {
      tags = metadata.tags;
    }
  } catch (e) {
    console.warn("Error parsing project metadata", uri);
  }

  return { name, description, tags };
}
