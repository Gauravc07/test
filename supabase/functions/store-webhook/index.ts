// POST /store-webhook?c=<connection id>: order webhooks from a brand's
// Shopify or WooCommerce store. Verifies the store's signature with the
// secret the brand saved in Shor, then credits the order to a creator by
// discount code or tracked-link ref. Orders that match no creator are
// dropped, not stored.

import { json } from "../_shared/http.ts";
import { parseOrder, signatureHeader, type StorePlatform, verifyStoreSignature } from "../_shared/stores.ts";
import { adminClient } from "../_shared/supabase.ts";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

Deno.serve(async (req) => {
  if (req.method !== "POST") return json({ error: "Use POST." }, 405);
  const connection = new URL(req.url).searchParams.get("c") ?? "";
  if (!UUID.test(connection)) return json({ error: "Unknown store." }, 404);

  const raw = await req.text();
  const admin = adminClient();
  const { data: rows } = await admin.rpc("store_webhook_secret", { p_connection: connection });
  const store = (rows as Array<{ platform: StorePlatform; webhook_secret: string }> | null)?.[0];
  if (!store) return json({ error: "Unknown store." }, 404);

  const platform = store.platform;
  const signature = req.headers.get(signatureHeader(platform));
  // WooCommerce sends an unsigned ping when the webhook is saved.
  if (platform === "woocommerce" && !signature && raw.startsWith("webhook_id=")) {
    return json({ ok: true });
  }
  if (!(await verifyStoreSignature(store.webhook_secret, raw, signature))) {
    return json({ error: "Bad signature. Check the secret saved in Shor." }, 401);
  }

  let body: Record<string, unknown>;
  try {
    body = JSON.parse(raw);
  } catch {
    return json({ error: "Not JSON." }, 400);
  }
  const topic = req.headers.get(platform === "shopify" ? "x-shopify-topic" : "x-wc-webhook-topic");
  const order = parseOrder(platform, topic, body);
  if (!order) return json({ ok: true, result: "ignored" });

  const { data, error } = await admin.rpc("record_store_order", {
    p_connection: connection,
    p_external_id: order.externalId,
    p_amount: order.amount,
    p_currency: order.currency,
    p_codes: order.codes,
    p_landing: order.landing,
    p_ordered_at: order.orderedAt,
    p_cancelled: order.cancelled,
  });
  if (error) {
    console.error("record_store_order failed", error.message);
    // 500 makes the store retry later.
    return json({ error: "Could not record the order." }, 500);
  }
  return json({ ok: true, result: data });
});
