// Configuration for the Instagram Edge Functions. Set the secrets with:
//   npx supabase secrets set IG_APP_ID=... IG_APP_SECRET=... APP_URL=... \
//     ALLOWED_RETURN_ORIGINS=... CRON_SECRET=...

function required(name: string): string {
  const value = Deno.env.get(name);
  if (!value) throw new Error(`Missing required secret ${name}`);
  return value;
}

export const env = {
  supabaseUrl: () => required("SUPABASE_URL"),

  /** Service-role key: bypasses row level security. Server-side only. */
  serviceKey: (): string => {
    const legacy = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (legacy) return legacy;
    // Projects on the new API keys expose them as JSON.
    const keys = JSON.parse(Deno.env.get("SUPABASE_SECRET_KEYS") ?? "{}");
    const key = keys.default ?? Object.values(keys)[0];
    if (typeof key !== "string") throw new Error("No service key available");
    return key;
  },

  /** Instagram app ID and secret from Meta App Dashboard → Instagram → API setup with Instagram login. */
  igAppId: () => required("IG_APP_ID"),
  igAppSecret: () => required("IG_APP_SECRET"),
  graphVersion: () => Deno.env.get("IG_GRAPH_VERSION") ?? "v26.0",

  /** Must be registered as an OAuth redirect URI in the Meta App Dashboard. */
  redirectUri: () =>
    Deno.env.get("IG_REDIRECT_URI") ??
      `${required("SUPABASE_URL")}/functions/v1/instagram-callback`,

  /** Where users land after connecting when no return URL was given. */
  appUrl: () => required("APP_URL"),

  /**
   * Comma-separated origins the app may ask to return to, e.g.
   * "https://shor.app,http://localhost". "http://localhost" allows any port.
   */
  allowedReturnOrigins: () =>
    (Deno.env.get("ALLOWED_RETURN_ORIGINS") ?? required("APP_URL"))
      .split(",").map((o) => o.trim().replace(/\/$/, "")).filter(Boolean),

  /** Shared secret for the scheduled sync job. */
  cronSecret: () => Deno.env.get("CRON_SECRET") ?? "",

  /**
   * App URL schemes the mobile apps return to after connecting Instagram
   * (in-app browser sheet), comma-separated. Defaults to "shor".
   */
  allowedReturnSchemes: () =>
    (Deno.env.get("ALLOWED_RETURN_SCHEMES") ?? "shor")
      .split(",").map((s) => s.trim().toLowerCase()).filter(Boolean),
};

/** True if [url] is on an allowed web origin or app scheme. */
export function isAllowedReturnUrl(url: string): boolean {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return false;
  }
  const scheme = parsed.protocol.replace(/:$/, "").toLowerCase();
  if (env.allowedReturnSchemes().includes(scheme) && scheme !== "http" && scheme !== "https") {
    return true;
  }
  if (parsed.protocol !== "https:" && parsed.protocol !== "http:") return false;
  return env.allowedReturnOrigins().some((allowed) => {
    if (allowed === "http://localhost") {
      return parsed.protocol === "http:" &&
        (parsed.hostname === "localhost" || parsed.hostname === "127.0.0.1");
    }
    return parsed.origin === allowed;
  });
}
