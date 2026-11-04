import { createClient, type SupabaseClient } from "npm:@supabase/supabase-js@2";
import { env } from "./env.ts";
import { HttpError } from "./http.ts";

/** Service-role client. Never expose it or its results unfiltered. */
export function adminClient(): SupabaseClient {
  return createClient(env.supabaseUrl(), env.serviceKey(), {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

/**
 * Verifies the caller's Supabase session and that they have a creator
 * account. Returns their user ID.
 */
export async function requireCreator(req: Request, admin: SupabaseClient): Promise<string> {
  const header = req.headers.get("Authorization") ?? "";
  const jwt = header.startsWith("Bearer ") ? header.slice(7) : "";
  if (!jwt) throw new HttpError(401, "Please log in first.");

  const { data, error } = await admin.auth.getUser(jwt);
  if (error || !data.user) throw new HttpError(401, "Your session has expired. Please log in again.");

  const { data: profile } = await admin
    .from("profiles").select("role").eq("id", data.user.id).maybeSingle();
  if (profile?.role !== "creator") {
    throw new HttpError(403, "Only creator accounts can connect Instagram.");
  }
  return data.user.id;
}
