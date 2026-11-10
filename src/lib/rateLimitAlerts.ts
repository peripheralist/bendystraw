import axios from "axios";

const webhookUrl = process.env.STATUS_WEBHOOK;

const FLUSH_INTERVAL_MS = 60_000;
// Don't re-alert for the same IP more than once per hour (per replica).
const IP_COOLDOWN_MS = 60 * 60_000;
// Discord allows at most 25 embed fields.
const MAX_FIELDS = 25;

type Exceeded = { ip: string; origin?: string; path: string; limit: number };

const pending = new Map<string, Exceeded>();
const lastAlertedAt = new Map<string, number>();

/**
 * Queue a Discord alert for an IP that just exceeded its rate limit. Alerts are
 * batched into one message per minute and de-duplicated per IP per hour, so a
 * client hammering the API can't flood the channel or Discord's webhook limits.
 */
export function reportRateLimitExceeded(e: Exceeded) {
  if (!webhookUrl) return;

  const last = lastAlertedAt.get(e.ip);
  if (last && Date.now() - last < IP_COOLDOWN_MS) return;

  lastAlertedAt.set(e.ip, Date.now());
  pending.set(e.ip, e);
}

async function flush() {
  // Forget cooldowns that have expired so the map doesn't grow unbounded.
  const now = Date.now();
  for (const [ip, at] of lastAlertedAt) {
    if (now - at >= IP_COOLDOWN_MS) lastAlertedAt.delete(ip);
  }

  if (!webhookUrl || !pending.size) return;

  const batch = [...pending.values()];
  pending.clear();

  const fields = batch.slice(0, MAX_FIELDS).map((e) => ({
    name: e.ip,
    value: `${e.limit}/min exceeded on \`${e.path}\`\nOrigin: ${e.origin ?? "none"}`,
  }));

  const host =
    process.env.TESTNET === "true" ? "testnet.bendystraw.xyz" : "bendystraw.xyz";
  const replica = process.env.RAILWAY_REPLICA_ID;

  try {
    await axios.post(webhookUrl, {
      embeds: [
        {
          author: { name: host, url: `https://${host}` },
          color: 16753920,
          title: `Rate limit exceeded by ${batch.length} IP${batch.length === 1 ? "" : "s"}`,
          description:
            (batch.length > MAX_FIELDS
              ? `Showing first ${MAX_FIELDS}.\n`
              : "") + (replica ? `Replica: ${replica}` : ""),
          fields,
        },
      ],
    });
  } catch (err) {
    console.error(`Error sending rate limit webhook: ${(err as Error).message}`);
  }
}

setInterval(() => void flush(), FLUSH_INTERVAL_MS).unref();
