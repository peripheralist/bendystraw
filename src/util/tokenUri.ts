export const parseTokenUri = (tokenUri: string) => {
  try {
    const base64 = tokenUri.split("data:application/json;base64,")[1];
    return base64 ? JSON.parse(atob(base64)) : undefined;
  } catch (e) {
    console.warn("Failed to parse tokenUri", tokenUri);
  }
};
