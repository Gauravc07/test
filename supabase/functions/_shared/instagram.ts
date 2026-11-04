// Minimal client for the Instagram API with Instagram Login.
// Docs: https://developers.facebook.com/docs/instagram-platform/instagram-api-with-instagram-login
//
// Access tokens travel only in request URLs to Meta. Never log URLs or
// responses from these calls.

import { env } from "./env.ts";

/** Permissions we ask for. Only what the insights dashboard needs. */
export const SCOPES = ["instagram_business_basic", "instagram_business_manage_insights"];

export class GraphError extends Error {
  constructor(message: string, public code?: number, public httpStatus?: number) {
    super(message);
  }

  /** The token is invalid, expired or revoked: the user must reconnect. */
  get isAuthError(): boolean {
    return this.code === 190 || this.httpStatus === 401;
  }
}

async function parse(res: Response): Promise<Record<string, unknown>> {
  const body = await res.json().catch(() => ({})) as Record<string, unknown>;
  const err = body.error as { message?: string; code?: number } | undefined;
  if (!res.ok || err) {
    throw new GraphError(err?.message ?? `Instagram returned HTTP ${res.status}`, err?.code, res.status);
  }
  return body;
}

export function authorizeUrl(state: string): string {
  const url = new URL("https://www.instagram.com/oauth/authorize");
  url.searchParams.set("client_id", env.igAppId());
  url.searchParams.set("redirect_uri", env.redirectUri());
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", SCOPES.join(","));
  url.searchParams.set("state", state);
  return url.toString();
}

/** Exchanges the one-time code for a short-lived token (valid ~1 hour). */
export async function exchangeCode(code: string) {
  const res = await fetch("https://api.instagram.com/oauth/access_token", {
    method: "POST",
    body: new URLSearchParams({
      client_id: env.igAppId(),
      client_secret: env.igAppSecret(),
      grant_type: "authorization_code",
      redirect_uri: env.redirectUri(),
      code: code.replace(/#_$/, ""),
    }),
  });
  const body = await parse(res);
  // The response is either flat or wrapped in data[0], depending on version.
  const row = (Array.isArray(body.data) ? body.data[0] : body) as Record<string, unknown>;
  const permissions = row.permissions;
  return {
    accessToken: String(row.access_token),
    userId: String(row.user_id),
    permissions: Array.isArray(permissions)
      ? permissions.map(String)
      : String(permissions ?? "").split(",").map((p) => p.trim()).filter(Boolean),
  };
}

/** Exchanges a short-lived token for a long-lived one (~60 days). */
export async function exchangeLongLived(shortLived: string) {
  const url = new URL("https://graph.instagram.com/access_token");
  url.searchParams.set("grant_type", "ig_exchange_token");
  url.searchParams.set("client_secret", env.igAppSecret());
  url.searchParams.set("access_token", shortLived);
  return toToken(await parse(await fetch(url)));
}

/** Refreshes a long-lived token. It must be at least 24 hours old. */
export async function refreshLongLived(token: string) {
  const url = new URL("https://graph.instagram.com/refresh_access_token");
  url.searchParams.set("grant_type", "ig_refresh_token");
  url.searchParams.set("access_token", token);
  return toToken(await parse(await fetch(url)));
}

function toToken(body: Record<string, unknown>) {
  const expiresIn = Number(body.expires_in ?? 60 * 24 * 3600);
  return {
    accessToken: String(body.access_token),
    expiresAt: new Date(Date.now() + expiresIn * 1000),
  };
}

/** GET graph.instagram.com/{version}/{path}. */
export async function graph(
  path: string,
  token: string,
  params: Record<string, string | number> = {},
): Promise<Record<string, unknown>> {
  const url = new URL(`https://graph.instagram.com/${env.graphVersion()}/${path}`);
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, String(v));
  url.searchParams.set("access_token", token);
  return parse(await fetch(url));
}

export const PROFILE_FIELDS = [
  "user_id", "username", "name", "account_type", "profile_picture_url",
  "followers_count", "follows_count", "media_count", "biography", "website",
].join(",");

export interface IgProfile {
  id: string;
  user_id?: string;
  username: string;
  name?: string;
  account_type?: string;
  profile_picture_url?: string;
  followers_count?: number;
  follows_count?: number;
  media_count?: number;
  biography?: string;
  website?: string;
}

export async function getProfile(token: string): Promise<IgProfile> {
  return await graph("me", token, { fields: PROFILE_FIELDS }) as unknown as IgProfile;
}
