// Shopify and WooCommerce order webhooks: signature checks and parsing.
// Pure functions, so they can be tested without a store.

export type StorePlatform = "shopify" | "woocommerce";

export type ParsedOrder = {
  externalId: string;
  amount: number;
  currency: string;
  codes: string[];
  landing: string | null;
  orderedAt: string | null;
  cancelled: boolean;
};

/** Base64 HMAC-SHA256 of the raw body: how both Shopify and WooCommerce sign webhooks. */
export async function hmacBase64(secret: string, body: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = new Uint8Array(await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(body)));
  let bin = "";
  for (const b of sig) bin += String.fromCharCode(b);
  return btoa(bin);
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

/** The header each platform puts its signature in. */
export function signatureHeader(platform: StorePlatform): string {
  return platform === "shopify" ? "x-shopify-hmac-sha256" : "x-wc-webhook-signature";
}

export async function verifyStoreSignature(
  secret: string,
  body: string,
  signature: string | null,
): Promise<boolean> {
  if (!signature) return false;
  return timingSafeEqual(await hmacBase64(secret, body), signature.trim());
}

function num(v: unknown): number {
  const n = typeof v === "number" ? v : parseFloat(String(v ?? ""));
  return Number.isFinite(n) ? n : 0;
}

/**
 * The order in a webhook body, or null for events we ignore (e.g. Woo's
 * webhook test ping). [topic] is X-Shopify-Topic or X-WC-Webhook-Topic.
 */
export function parseOrder(
  platform: StorePlatform,
  topic: string | null,
  body: Record<string, unknown>,
): ParsedOrder | null {
  if (body == null || body.id == null) return null;
  const t = (topic ?? "").toLowerCase();
  if (platform === "shopify") {
    const codes = Array.isArray(body.discount_codes)
      ? (body.discount_codes as Array<{ code?: string }>).map((d) => d.code ?? "").filter(Boolean)
      : [];
    return {
      externalId: String(body.id),
      amount: num(body.current_total_price ?? body.total_price),
      currency: String(body.currency ?? "INR"),
      codes,
      landing: (body.landing_site as string) ?? null,
      orderedAt: (body.created_at as string) ?? null,
      cancelled: t === "orders/cancelled" || body.cancelled_at != null,
    };
  }
  const status = String(body.status ?? "").toLowerCase();
  const codes = Array.isArray(body.coupon_lines)
    ? (body.coupon_lines as Array<{ code?: string }>).map((c) => c.code ?? "").filter(Boolean)
    : [];
  // WooCommerce keeps the landing page only if a plugin stores it in meta.
  const meta = Array.isArray(body.meta_data) ? (body.meta_data as Array<{ key?: string; value?: unknown }>) : [];
  const landing = meta.find((m) => /landing|utm|ref/i.test(m.key ?? ""))?.value;
  return {
    externalId: String(body.id),
    amount: num(body.total),
    currency: String(body.currency ?? "INR"),
    codes,
    landing: typeof landing === "string" ? landing : null,
    orderedAt: (body.date_created_gmt ? `${body.date_created_gmt}Z` : (body.date_created as string)) ?? null,
    cancelled: ["cancelled", "refunded", "failed"].includes(status) || t === "order.deleted",
  };
}

/** Link-preview fetchers (WhatsApp, Instagram, Slack...) shouldn't count as clicks. */
export function isPreviewBot(userAgent: string | null): boolean {
  return /bot|crawler|spider|preview|facebookexternalhit|whatsapp|slack|telegram|discord|embedly|skype/i
    .test(userAgent ?? "");
}
