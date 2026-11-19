// GET — Meta redirects here after the user approves (or cancels) the
// Unified login (Instagram or Facebook, via Facebook Login for Business).
// Register this URL as the OAuth redirect URI in the Meta App Dashboard:
//   https://<project-ref>.supabase.co/functions/v1/instagram-callback
//
// Validates the one-time state, exchanges the code for the business token,
// stores the token in Vault, starts the first sync in the background, and
// sends the user back to the app with ?instagram=connected|error.

import { env, isAllowedReturnUrl } from "../_shared/env.ts";
import { redirect } from "../_shared/http.ts";
import { exchangeCode, getProfile, SCOPES, sharedAccounts } from "../_shared/instagram.ts";
import { adminClient } from "../_shared/supabase.ts";
import { saveProfile, syncAccount } from "../_shared/sync.ts";

declare const EdgeRuntime: { waitUntil(p: Promise<unknown>): void } | undefined;

function back(returnTo: string, result: "connected" | "error", reason?: string): Response {
  const url = new URL(isAllowedReturnUrl(returnTo) ? returnTo : env.appUrl());
  url.searchParams.set("instagram", result);
  if (reason) url.searchParams.set("reason", reason);
  return redirect(url.toString());
}

Deno.serve(async (req) => {
  const params = new URL(req.url).searchParams;
  const admin = adminClient();

  const { data: stateRows } = await admin.rpc("ig_consume_oauth_state", { p_state: params.get("state") ?? "" });
  const state = (stateRows as Array<{ creator_id: string; return_to: string }> | null)?.[0];
  if (!state) return back(env.appUrl(), "error", "expired");

  if (params.get("error") || !params.get("code")) {
    return back(state.return_to, "error", params.get("error_reason") === "user_denied" ? "cancelled" : "denied");
  }

  try {
    const token = await exchangeCode(params.get("code")!);
    // Only professional accounts can be shared, so this is never personal.
    // If several were shared, Shor links the first one.
    const shared = await sharedAccounts(token.accessToken);
    if (!shared.length) return back(state.return_to, "error", "no_account");
    const igId = shared[0].id;
    const profile = await getProfile(token.accessToken, igId);

    // An Instagram account can belong to only one Shor creator.
    const { data: owner } = await admin.from("instagram_accounts")
      .select("creator_id").eq("ig_user_id", igId).maybeSingle();
    if (owner && owner.creator_id !== state.creator_id) {
      return back(state.return_to, "error", "already_linked");
    }

    // Switching to a different Instagram account replaces the old one entirely.
    const { data: previous } = await admin.from("instagram_accounts")
      .select("ig_user_id").eq("creator_id", state.creator_id).maybeSingle();
    if (previous && previous.ig_user_id !== igId) {
      await admin.rpc("ig_delete_by_ig_user", { p_ig_user_id: previous.ig_user_id });
    }

    const { data: account, error } = await admin.from("instagram_accounts").upsert({
      creator_id: state.creator_id,
      ig_user_id: igId,
      username: profile.username,
      granted_scopes: SCOPES,
      status: "active",
      connected_at: new Date().toISOString(),
      last_sync_error: null,
    }, { onConflict: "creator_id" }).select("id").single();
    if (error || !account) throw new Error(`Saving account failed: ${error?.message}`);

    const { error: tokenError } = await admin.rpc("ig_save_token", {
      p_account_id: account.id,
      p_token: token.accessToken,
      p_expires_at: token.expiresAt?.toISOString() ?? null,
    });
    if (tokenError) throw new Error(`Saving token failed: ${tokenError.message}`);
    await saveProfile(admin, account.id, profile);

    // First full sync keeps running after the redirect.
    const firstSync = syncAccount(admin, account.id).catch((e) => console.error("initial sync failed", e?.message));
    if (typeof EdgeRuntime !== "undefined") EdgeRuntime.waitUntil(firstSync);
    else await firstSync;

    return back(state.return_to, "connected");
  } catch (e) {
    console.error("instagram callback failed", e instanceof Error ? e.message : e);
    return back(state.return_to, "error", "exchange_failed");
  }
});
