// POST, called every few minutes by pg_cron with header x-cron-secret.
// Emails notifications still unread after 2 minutes: one email per person
// per run, skipping people who turned email off.
//
// Secrets: CRON_SECRET, APP_URL, and either RESEND_API_KEY + EMAIL_FROM
// (production) or MAILPIT_URL (local testing). With no mail provider set,
// it does nothing and notifications stay in the app.

import { groupByRecipient, mailerFromEnv, type QueuedNotification, renderEmail } from "../_shared/email.ts";
import { env } from "../_shared/env.ts";
import { handleError, HttpError, json, preflight } from "../_shared/http.ts";
import { adminClient } from "../_shared/supabase.ts";

const BATCH = 200;

Deno.serve(async (req) => {
  const pre = preflight(req);
  if (pre) return pre;
  try {
    if (req.method !== "POST") throw new HttpError(405, "Use POST.");
    const secret = env.cronSecret();
    if (!secret || req.headers.get("x-cron-secret") !== secret) {
      throw new HttpError(401, "Not allowed.");
    }

    const mailer = mailerFromEnv();
    if (!mailer) return json({ sent: 0, reason: "No mail provider configured" });

    const admin = adminClient();
    const { data, error } = await admin.rpc("claim_notification_emails", { p_limit: BATCH });
    if (error) throw new Error(error.message);

    const groups = groupByRecipient((data ?? []) as QueuedNotification[]);
    const failed: string[] = [];
    let sent = 0;
    for (const items of groups) {
      try {
        await mailer(renderEmail(items, env.appUrl()));
        sent++;
      } catch (e) {
        failed.push(...items.map((i) => i.id));
        console.error("notification email failed", e instanceof Error ? e.message : e);
      }
    }
    if (failed.length) await admin.rpc("fail_notification_emails", { p_ids: failed });
    return json({ sent, failed: failed.length });
  } catch (e) {
    return handleError(e);
  }
});
