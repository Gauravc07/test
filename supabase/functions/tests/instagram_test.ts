// Run: deno test --allow-env supabase/functions/tests/
import { assert, assertEquals } from "jsr:@std/assert@1";
import { verifySignedRequest } from "../_shared/signed_request.ts";
import { canonicalPermalink } from "../_shared/sync.ts";

Deno.test("permalinks normalise the same way as the SQL function", () => {
  for (const url of [
    "https://instagram.com/reel/ABC123?igsh=xyz",
    "https://www.instagram.com/reel/ABC123/",
    "https://www.instagram.com/cara.creates/reel/ABC123/",
  ]) {
    assertEquals(canonicalPermalink(url), "https://www.instagram.com/reel/ABC123/");
  }
  assertEquals(canonicalPermalink("https://www.instagram.com/p/Xy_9-z/"), "https://www.instagram.com/p/Xy_9-z/");
  assertEquals(canonicalPermalink("https://youtube.com/watch?v=1"), null);
  assertEquals(canonicalPermalink(null), null);
});

const SECRET = "test-app-secret";

function b64url(bytes: Uint8Array): string {
  return btoa(String.fromCharCode(...bytes)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

async function sign(payload: unknown, secret = SECRET): Promise<string> {
  const encodedPayload = b64url(new TextEncoder().encode(JSON.stringify(payload)));
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const sig = new Uint8Array(await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(encodedPayload)));
  return `${b64url(sig)}.${encodedPayload}`;
}

Deno.test("signed_request: accepts a valid signature", async () => {
  const req = await sign({ algorithm: "HMAC-SHA256", user_id: "17841400000000000", issued_at: 1 });
  const payload = await verifySignedRequest(req, SECRET);
  assertEquals(payload?.user_id, "17841400000000000");
});

Deno.test("signed_request: rejects a wrong secret", async () => {
  const req = await sign({ algorithm: "HMAC-SHA256", user_id: "1" }, "attacker-secret");
  assertEquals(await verifySignedRequest(req, SECRET), null);
});

Deno.test("signed_request: rejects a tampered payload", async () => {
  const req = await sign({ algorithm: "HMAC-SHA256", user_id: "1" });
  const [sig] = req.split(".");
  const forged = b64url(new TextEncoder().encode(JSON.stringify({ algorithm: "HMAC-SHA256", user_id: "victim" })));
  assertEquals(await verifySignedRequest(`${sig}.${forged}`, SECRET), null);
});

Deno.test("signed_request: rejects garbage and unknown algorithms", async () => {
  assertEquals(await verifySignedRequest("", SECRET), null);
  assertEquals(await verifySignedRequest("abc", SECRET), null);
  assertEquals(await verifySignedRequest(await sign({ algorithm: "none", user_id: "1" }), SECRET), null);
});

Deno.test("return URL allowlist", async () => {
  Deno.env.set("APP_URL", "https://shor.app");
  Deno.env.set("ALLOWED_RETURN_ORIGINS", "https://shor.app,http://localhost");
  const { isAllowedReturnUrl } = await import("../_shared/env.ts");
  assert(isAllowedReturnUrl("https://shor.app/"));
  assert(isAllowedReturnUrl("https://shor.app/#/dashboard"));
  assert(isAllowedReturnUrl("http://localhost:53172/"));
  assert(isAllowedReturnUrl("http://127.0.0.1:8080/"));
  assert(!isAllowedReturnUrl("https://evil.example/"));
  assert(!isAllowedReturnUrl("https://shor.app.evil.example/"));
  assert(!isAllowedReturnUrl("http://shor.app/")); // https only for the real site
  assert(!isAllowedReturnUrl("javascript:alert(1)"));
  assert(!isAllowedReturnUrl("not a url"));
});

Deno.test("token exchange parses both response shapes and strips #_", async () => {
  Deno.env.set("IG_APP_ID", "123");
  Deno.env.set("IG_APP_SECRET", SECRET);
  Deno.env.set("SUPABASE_URL", "https://example.supabase.co");
  const { exchangeCode, GraphError } = await import("../_shared/instagram.ts");
  const realFetch = globalThis.fetch;
  let sentCode = "";
  try {
    globalThis.fetch = (async (_url: string, init: RequestInit) => {
      sentCode = new URLSearchParams(init.body as URLSearchParams).get("code") ?? "";
      return new Response(JSON.stringify({
        data: [{ access_token: "short", user_id: 42, permissions: "instagram_business_basic,instagram_business_manage_insights" }],
      }));
    }) as typeof fetch;
    const wrapped = await exchangeCode("AQBcode#_");
    assertEquals(sentCode, "AQBcode");
    assertEquals(wrapped.userId, "42");
    assertEquals(wrapped.permissions, ["instagram_business_basic", "instagram_business_manage_insights"]);

    globalThis.fetch = (async () =>
      new Response(JSON.stringify({ access_token: "short", user_id: "7", permissions: ["instagram_business_basic"] }))) as typeof fetch;
    assertEquals((await exchangeCode("x")).permissions, ["instagram_business_basic"]);

    globalThis.fetch = (async () =>
      new Response(JSON.stringify({ error: { message: "Invalid OAuth access token", code: 190 } }), { status: 400 })) as typeof fetch;
    let caught: unknown;
    try {
      await exchangeCode("x");
    } catch (e) {
      caught = e;
    }
    assert(caught instanceof GraphError && caught.isAuthError);
  } finally {
    globalThis.fetch = realFetch;
  }
});
