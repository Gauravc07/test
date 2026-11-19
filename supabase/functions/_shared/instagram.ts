// Minimal client for the Instagram API with Unified Login (built on
// Facebook Login for Business). New Meta apps can't use "Instagram Login".
// Docs: https://developers.facebook.com/documentation/instagram-platform/instagram-api-with-unified-login
//
// The login returns a Business Integration System User token that belongs
// to the creator's business portfolio. With it, `/me` is the system user,
// so every call names the Instagram account ID instead.
//
// Access tokens travel only in request URLs to Meta. Never log URLs or
// responses from these calls.

import { env } from "./env.ts";

/** Permissions in the login configuration. Only what the dashboard needs. */
export const SCOPES = ["instagram_basic", "instagram_manage_insights"];

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
    throw new GraphError(err?.message ?? `Meta returned HTTP ${res.status}`, err?.code, res.status);
  }
  return body;
}

/** The Facebook Login for Business dialog, offering Instagram or Facebook. */
export function authorizeUrl(state: string): string {
  const url = new URL(`https://www.facebook.com/${env.graphVersion()}/dialog/oauth`);
  url.searchParams.set("client_id", env.igAppId());
  url.searchParams.set("config_id", env.igConfigId());
  url.searchParams.set("redirect_uri", env.redirectUri());
  url.searchParams.set("response_type", "code");
  url.searchParams.set("state", state);
  return url.toString();
}

export interface Token {
  accessToken: string;
  /** Null when the configuration issues tokens that never expire. */
  expiresAt: Date | null;
}

/** Exchanges the one-time code for the business system-user token. */
export async function exchangeCode(code: string): Promise<Token> {
  const url = new URL(`https://graph.facebook.com/${env.graphVersion()}/oauth/access_token`);
  url.searchParams.set("client_id", env.igAppId());
  url.searchParams.set("client_secret", env.igAppSecret());
  url.searchParams.set("redirect_uri", env.redirectUri());
  url.searchParams.set("code", code.replace(/#_$/, ""));
  const body = await parse(await fetch(url));
  const expiresIn = Number(body.expires_in ?? 0);
  return {
    accessToken: String(body.access_token),
    expiresAt: expiresIn > 0 ? new Date(Date.now() + expiresIn * 1000) : null,
  };
}

/** GET graph.facebook.com/{version}/{path}. */
export async function graph(
  path: string,
  token: string,
  params: Record<string, string | number> = {},
): Promise<Record<string, unknown>> {
  const url = new URL(`https://graph.facebook.com/${env.graphVersion()}/${path}`);
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, String(v));
  url.searchParams.set("access_token", token);
  return parse(await fetch(url));
}

/** The Instagram accounts the creator shared during login. */
export async function sharedAccounts(token: string): Promise<Array<{ id: string; username: string }>> {
  const body = await graph("me/assigned_instagram_accounts", token, { fields: "id,username" });
  return ((body.data as Array<Record<string, unknown>>) ?? [])
    .filter((a) => a.id)
    .map((a) => ({ id: String(a.id), username: String(a.username ?? "") }));
}

export const PROFILE_FIELDS = [
  "id", "username", "name", "profile_picture_url",
  "followers_count", "follows_count", "media_count", "biography", "website",
].join(",");

export interface IgProfile {
  id: string;
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

export async function getProfile(token: string, igId: string): Promise<IgProfile> {
  return await graph(igId, token, { fields: PROFILE_FIELDS }) as unknown as IgProfile;
}
