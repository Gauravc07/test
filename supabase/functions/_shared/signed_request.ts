// Verifies Meta's signed_request (deauthorize and data-deletion callbacks).
// Format: base64url(HMAC-SHA256(payload, app_secret)) "." base64url(JSON)

function b64urlDecode(input: string): Uint8Array {
  const b64 = input.replace(/-/g, "+").replace(/_/g, "/").padEnd(Math.ceil(input.length / 4) * 4, "=");
  return Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
}

function constantTimeEqual(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a[i] ^ b[i];
  return diff === 0;
}

export interface SignedRequest {
  user_id: string;
  algorithm: string;
  issued_at?: number;
}

/** Returns the payload, or null if the signature or format is invalid. */
export async function verifySignedRequest(
  signedRequest: string,
  appSecret: string,
): Promise<SignedRequest | null> {
  const [encodedSig, encodedPayload] = signedRequest.split(".", 2);
  if (!encodedSig || !encodedPayload) return null;

  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(appSecret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const expected = new Uint8Array(
    await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(encodedPayload)),
  );
  if (!constantTimeEqual(b64urlDecode(encodedSig), expected)) return null;

  try {
    const payload = JSON.parse(new TextDecoder().decode(b64urlDecode(encodedPayload)));
    if (String(payload.algorithm).toUpperCase() !== "HMAC-SHA256" || !payload.user_id) return null;
    return { ...payload, user_id: String(payload.user_id) };
  } catch {
    return null;
  }
}
