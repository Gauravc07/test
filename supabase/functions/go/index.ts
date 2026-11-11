// GET /go/<code>: a creator's tracked link. Counts the click and redirects
// to the campaign's landing page with UTM tags and a ref, which the store
// webhook uses to credit the sale. The website proxies /go/* here.

import { env } from "../_shared/env.ts";
import { redirect } from "../_shared/http.ts";
import { isPreviewBot } from "../_shared/stores.ts";
import { adminClient } from "../_shared/supabase.ts";

Deno.serve(async (req) => {
  const fallback = Deno.env.get("APP_URL") ?? "https://shor.app";
  try {
    const code = new URL(req.url).pathname.split("/").filter(Boolean).pop() ?? "";
    if (!/^[a-z0-9-]{4,48}$/i.test(code) || code === "go") return redirect(fallback);
    const { data } = await adminClient().rpc("track_click", {
      p_code: code,
      p_count: req.method === "GET" && !isPreviewBot(req.headers.get("user-agent")),
    });
    return redirect(typeof data === "string" && data ? data : fallback);
  } catch (e) {
    console.error("go failed", e instanceof Error ? e.message : e);
    return redirect(env.appUrl());
  }
});
