// POST (signed-in creator) → deletes the Instagram connection, the token in
// Vault, and every insight, post and audience row we stored for it.

import { handleError, HttpError, json, preflight } from "../_shared/http.ts";
import { adminClient, requireCreator } from "../_shared/supabase.ts";

Deno.serve(async (req) => {
  const pre = preflight(req);
  if (pre) return pre;
  try {
    if (req.method !== "POST") throw new HttpError(405, "Use POST.");
    const admin = adminClient();
    const creatorId = await requireCreator(req, admin);

    const { data: account } = await admin.from("instagram_accounts")
      .select("ig_user_id").eq("creator_id", creatorId).maybeSingle();
    if (account) {
      const { error } = await admin.rpc("ig_delete_by_ig_user", { p_ig_user_id: account.ig_user_id });
      if (error) throw new Error(`Disconnect failed: ${error.message}`);
    }
    return json({ status: "disconnected" });
  } catch (e) {
    return handleError(e);
  }
});
