// Run: deno test --allow-env supabase/functions/tests/
import { assert, assertEquals } from "jsr:@std/assert@1";
import { hmacBase64, isPreviewBot, parseOrder, verifyStoreSignature } from "../_shared/stores.ts";

Deno.test("signatures: base64 HMAC-SHA256 of the raw body", async () => {
  const body = '{"id":1}';
  const sig = await hmacBase64("shpss_secret", body);
  assert(await verifyStoreSignature("shpss_secret", body, sig));
  assert(!(await verifyStoreSignature("wrong", body, sig)));
  assert(!(await verifyStoreSignature("shpss_secret", '{"id":2}', sig)));
  assert(!(await verifyStoreSignature("shpss_secret", body, null)));
});

Deno.test("shopify order: amount, codes, landing ref, cancellation", () => {
  const order = parseOrder("shopify", "orders/create", {
    id: 5612345,
    total_price: "1299.00",
    current_total_price: "1199.00",
    currency: "INR",
    discount_codes: [{ code: "RIYA10", amount: "100.00", type: "percentage" }],
    landing_site: "/products/serum?utm_source=shor&ref=shor_riya-glows-ea9c",
    created_at: "2026-11-12T10:00:00+05:30",
    cancelled_at: null,
  })!;
  assertEquals(order.externalId, "5612345");
  assertEquals(order.amount, 1199);
  assertEquals(order.codes, ["RIYA10"]);
  assert(order.landing!.includes("ref=shor_riya-glows-ea9c"));
  assert(!order.cancelled);
  assert(parseOrder("shopify", "orders/cancelled", { id: 1, total_price: "10" })!.cancelled);
});

Deno.test("woocommerce order: coupons and refunds", () => {
  const order = parseOrder("woocommerce", "order.created", {
    id: 812,
    status: "processing",
    total: "899.00",
    currency: "INR",
    coupon_lines: [{ code: "riya10" }],
    date_created_gmt: "2026-11-12T04:30:00",
  })!;
  assertEquals(order.amount, 899);
  assertEquals(order.codes, ["riya10"]);
  assertEquals(order.orderedAt, "2026-11-12T04:30:00Z");
  assert(parseOrder("woocommerce", "order.updated", { id: 812, status: "refunded", total: "0" })!.cancelled);
  assertEquals(parseOrder("woocommerce", null, {}), null);
});

Deno.test("link previews don't count as clicks", () => {
  assert(isPreviewBot("WhatsApp/2.23.20.0"));
  assert(isPreviewBot("facebookexternalhit/1.1"));
  assert(!isPreviewBot("Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) Instagram 300.0"));
  assert(!isPreviewBot(null));
});
