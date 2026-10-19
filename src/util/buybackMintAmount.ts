import { decodeFunctionData, isAddressEqual } from "viem";
import { JBBuybackHookV6Abi } from "../../abis/JBBuybackHookV6Abi";
import { sameLog, type CallFrame, type TargetLog } from "./terminalEventToken";

/**
 * The amount the terminal forwarded to the buyback hook call that emitted a
 * Mint: the `afterPayRecordedWith` frame whose own logs (delegatecalls
 * included, nested calls excluded) hold it. Its input names the forwarded
 * token and currency, so no other payment in the transaction, nested before
 * or after the Mint, can stand in for it. Null when no frame, or more than
 * one, holds an identical Mint.
 */
export function buybackMintForwardedAmount({
  trace,
  hook,
  mint,
}: {
  trace: CallFrame;
  hook: `0x${string}`;
  mint: TargetLog;
}) {
  const found: { token: `0x${string}`; decimals: number; currency: number; value: bigint }[] = [];
  const holds = (frame: CallFrame): number =>
    (frame.logs ?? []).filter((l) => sameLog(l, mint)).length +
    (frame.calls ?? [])
      .filter((c) => c.type === "DELEGATECALL" && !c.error)
      .reduce((n, c) => n + holds(c), 0);
  const visit = (frame: CallFrame) => {
    if (frame.error) return;
    if (frame.to && isAddressEqual(frame.to as `0x${string}`, hook) && frame.type !== "DELEGATECALL") {
      try {
        const call = decodeFunctionData({ abi: JBBuybackHookV6Abi, data: frame.input });
        if (call.functionName === "afterPayRecordedWith") {
          const amount = (call.args[0] as { forwardedAmount: (typeof found)[number] }).forwardedAmount;
          for (let i = holds(frame); i > 0; i--) found.push(amount);
        }
      } catch {}
    }
    for (const c of frame.calls ?? []) visit(c);
  };
  visit(trace);
  return found.length === 1 ? found[0]! : null;
}
