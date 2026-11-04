// POST (signed-in creator) { return_to?: string } → { url }
// Starts the Instagram OAuth flow with a one-time, 10-minute state value.

import { env, isAllowedReturnUrl } from "../_shared/env.ts";
import { handleError, HttpError, json, preflight } from "../_shared/http.ts";
import { authorizeUrl } from "../_shared/instagram.ts";
import { adminClient, requireCreator } from "../_shared/supabase.ts";

Deno.serve(async (req) => {
  const pre = preflight(req);
  if (pre) return pre;
  try {
    if (req.method !== "POST") throw new HttpError(405, "Use POST.");
    const admin = adminClient();
    const creatorId = await requireCreator(req, admin);

    const body = await req.json().catch(() => ({}));
    const returnTo = typeof body.return_to === "string" && body.return_to ? body.return_to : env.appUrl();
    if (!isAllowedReturnUrl(returnTo)) throw new HttpError(400, "That return address is not allowed.");

    const state = btoa(String.fromCharCode(...crypto.getRandomValues(new Uint8Array(32))))
      .replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");

    // Drop this creator's stale attempts, then record the new one.
    await admin.from("instagram_oauth_states").delete().eq("creator_id", creatorId);
    const { error } = await admin.from("instagram_oauth_states")
      .insert({ state, creator_id: creatorId, return_to: returnTo });
    if (error) throw new Error(`Could not start connection: ${error.message}`);

    return json({ url: authorizeUrl(state) });
  } catch (e) {
    return handleError(e);
  }
});
