// POST
//   * Signed-in creator: syncs their own account (at most every 10 minutes).
//   * Scheduled job with header x-cron-secret: syncs every account not
//     synced in the last 20 hours.

import { env } from "../_shared/env.ts";
import { handleError, HttpError, json, preflight } from "../_shared/http.ts";
import { adminClient, requireCreator } from "../_shared/supabase.ts";
import { syncAccount } from "../_shared/sync.ts";

const MANUAL_COOLDOWN_MS = 10 * 60_000;
const CRON_BATCH = 20;

Deno.serve(async (req) => {
  const pre = preflight(req);
  if (pre) return pre;
  try {
    if (req.method !== "POST") throw new HttpError(405, "Use POST.");
    const admin = adminClient();

    const cronSecret = env.cronSecret();
    if (cronSecret && req.headers.get("x-cron-secret") === cronSecret) {
      const cutoff = new Date(Date.now() - 20 * 3_600_000).toISOString();
      const { data: due } = await admin.from("instagram_accounts").select("id")
        .eq("status", "active")
        .or(`last_synced_at.is.null,last_synced_at.lt."${cutoff}"`)
        .order("last_synced_at", { ascending: true, nullsFirst: true })
        .limit(CRON_BATCH);
      const results: Record<string, string> = {};
      for (const { id } of due ?? []) {
        try {
          results[id] = (await syncAccount(admin, id)).status;
        } catch (e) {
          results[id] = "failed";
          console.error("scheduled sync failed", id, e instanceof Error ? e.message : e);
        }
      }
      return json({ synced: results });
    }

    const creatorId = await requireCreator(req, admin);
    const { data: account } = await admin.from("instagram_accounts")
      .select("id, last_synced_at, status").eq("creator_id", creatorId).maybeSingle();
    if (!account) throw new HttpError(404, "Connect your Instagram account first.");
    if (account.status === "needs_reauth") {
      throw new HttpError(409, "Instagram access expired. Please reconnect your account.");
    }
    if (account.last_synced_at && Date.now() - Date.parse(account.last_synced_at) < MANUAL_COOLDOWN_MS) {
      return json({ status: "fresh" });
    }

    const result = await syncAccount(admin, account.id);
    if (result.status === "needs_reauth") {
      throw new HttpError(409, "Instagram access expired. Please reconnect your account.");
    }
    return json({ status: result.status });
  } catch (e) {
    return handleError(e);
  }
});
