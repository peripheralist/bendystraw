import { isAddressEqual, parseEventLogs, type Log } from "viem";
import { JBMultiTerminalAbi } from "../../abis/JBMultiTerminalAbi";
import { ADDRESS } from "../constants/address";

/**
 * The amount the terminal forwarded to a buyback hook whose Mint is at
 * `mintLogIndex`. The terminal emits HookAfterRecordPay for that call right
 * after the hook returns, so it is the first one after the Mint naming this
 * hook and project; a nested payment's comes before the Mint.
 */
export function buybackMintForwardedAmount({
  logs,
  mintLogIndex,
  hook,
  projectId,
}: {
  logs: Log[];
  mintLogIndex: number;
  hook: `0x${string}`;
  projectId: bigint;
}) {
  return parseEventLogs({
    abi: JBMultiTerminalAbi,
    eventName: "HookAfterRecordPay",
    logs: logs.filter((log) => isAddressEqual(log.address, ADDRESS.jbMultiTerminal6)),
  }).find(
    (log) =>
      log.logIndex !== null &&
      log.logIndex > mintLogIndex &&
      isAddressEqual(log.args.hook, hook) &&
      log.args.context.projectId === projectId
  )?.args.context.forwardedAmount;
}
