export function idOfProject({
  chainId,
  projectId,
}: {
  chainId: number;
  projectId: bigint;
}) {
  return `${chainId}-${projectId.toString()}`;
}
