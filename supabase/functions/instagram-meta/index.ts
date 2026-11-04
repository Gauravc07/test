// Meta → Shor callbacks. Register in Meta App Dashboard → Instagram →
// API setup with Instagram login → Business login settings:
//   Deauthorize callback URL:     .../functions/v1/instagram-meta/deauthorize
//   Data deletion request URL:    .../functions/v1/instagram-meta/data-deletion
// Users can check a deletion request at:
//   .../functions/v1/instagram-meta/deletion-status?code=<confirmation_code>

import { env } from "../_shared/env.ts";
import { verifySignedRequest } from "../_shared/signed_request.ts";
import { adminClient } from "../_shared/supabase.ts";

async function readSignedRequest(req: Request): Promise<string> {
  const text = await req.text();
  return new URLSearchParams(text).get("signed_request") ?? "";
}

function html(body: string, status = 200): Response {
  const page = `<!doctype html><html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1"><title>Shor data deletion</title>
<style>body{font:16px/1.6 system-ui,sans-serif;max-width:560px;margin:48px auto;padding:0 16px;color:#0a1628;background:#fafaf8}</style>
</head><body>${body}</body></html>`;
  return new Response(page, { status, headers: { "Content-Type": "text/html; charset=utf-8" } });
}

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!));
}

Deno.serve(async (req) => {
  const url = new URL(req.url);
  const admin = adminClient();

  if (req.method === "GET" && url.pathname.endsWith("/deletion-status")) {
    const code = url.searchParams.get("code") ?? "";
    const { data } = await admin.from("instagram_deletion_requests")
      .select("requested_at, completed_at").eq("confirmation_code", code).maybeSingle();
    if (!data) return html("<h1>Request not found</h1><p>Check the confirmation code and try again.</p>", 404);
    return html(`<h1>Data deletion request</h1>
<p>Confirmation code: <strong>${escapeHtml(code)}</strong></p>
<p>Received: ${escapeHtml(new Date(data.requested_at).toUTCString())}</p>
<p>Status: <strong>${data.completed_at ? "Completed" : "In progress"}</strong>.
${data.completed_at ? "All Instagram data Shor held for this account has been deleted." : ""}</p>`);
  }

  if (req.method !== "POST") return new Response("Not found", { status: 404 });

  const payload = await verifySignedRequest(await readSignedRequest(req), env.igAppSecret());
  if (!payload) return new Response("Invalid signed_request", { status: 400 });

  // Both callbacks delete everything we hold for this Instagram user.
  const { data: matched, error } = await admin.rpc("ig_delete_by_ig_user", { p_ig_user_id: payload.user_id });
  if (error) {
    console.error("Meta callback deletion failed", error.message);
    return new Response("Deletion failed", { status: 500 });
  }

  if (url.pathname.endsWith("/deauthorize")) {
    return new Response(null, { status: 200 });
  }

  if (url.pathname.endsWith("/data-deletion")) {
    const code = crypto.randomUUID().replace(/-/g, "").slice(0, 16).toUpperCase();
    await admin.from("instagram_deletion_requests").insert({
      confirmation_code: code,
      ig_user_id: payload.user_id,
      matched_account: Boolean(matched),
      completed_at: new Date().toISOString(),
    });
    return new Response(JSON.stringify({
      url: `${env.supabaseUrl()}/functions/v1/instagram-meta/deletion-status?code=${code}`,
      confirmation_code: code,
    }), { headers: { "Content-Type": "application/json" } });
  }

  return new Response("Not found", { status: 404 });
});
