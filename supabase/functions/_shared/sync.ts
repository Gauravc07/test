// Pulls a connected account's profile, insights, recent posts and audience
// from Instagram and stores them. Runs with the service role.

import type { SupabaseClient } from "npm:@supabase/supabase-js@2";
import { getProfile, graph, GraphError, type IgProfile, refreshLongLived } from "./instagram.ts";

/** Account metrics fetched per day (all period=day, metric_type=total_value). */
const DAILY_METRICS = [
  "reach", "views", "accounts_engaged", "total_interactions", "likes",
  "comments", "shares", "saves", "replies", "profile_links_taps",
] as const;

/** Per-post metrics, most to least specific; fall back if a set is rejected. */
const MEDIA_METRIC_SETS = [
  ["reach", "views", "saved", "shares", "total_interactions"],
  ["reach", "saved", "shares", "total_interactions"],
  ["reach"],
];

const MEDIA_FIELDS = [
  "id", "caption", "media_type", "media_product_type", "permalink",
  "thumbnail_url", "media_url", "timestamp", "like_count", "comments_count",
].join(",");

const BACKFILL_DAYS = 28;
/** Meta may revise the last 48 hours, so re-fetch these days each sync. */
const REFETCH_DAYS = 3;
/** Data minimisation: how long we keep history. */
const KEEP_DAILY_DAYS = 90;
const KEEP_SNAPSHOT_DAYS = 365;
const MEDIA_LIMIT = 25;

const DAY = 86_400_000;

export interface SyncResult {
  status: "synced" | "needs_reauth" | "busy";
  warnings: string[];
}

export async function syncAccount(admin: SupabaseClient, accountId: string): Promise<SyncResult> {
  const warnings: string[] = [];

  // Simple lock so overlapping syncs (cron + "Sync now") don't collide.
  const lockCutoff = new Date(Date.now() - 5 * 60_000).toISOString();
  const { data: locked } = await admin
    .from("instagram_accounts")
    .update({ sync_started_at: new Date().toISOString() })
    .eq("id", accountId)
    .or(`sync_started_at.is.null,sync_started_at.lt."${lockCutoff}"`)
    .select("id, creator_id, followers_count");
  if (!locked?.length) return { status: "busy", warnings };
  const creatorId: string = locked[0].creator_id;

  try {
    let token = await loadToken(admin, accountId);
    token = await refreshIfNeeded(admin, accountId, token);

    const profile = await getProfile(token.accessToken);
    await saveProfile(admin, accountId, profile);

    await syncDailyMetrics(admin, accountId, token.accessToken, warnings);
    const media = await syncMedia(admin, accountId, creatorId, token.accessToken, warnings);
    await syncAudience(admin, accountId, token.accessToken, warnings);
    await mirrorPublicStats(admin, creatorId, profile, media);

    await admin.from("instagram_accounts").update({
      last_synced_at: new Date().toISOString(),
      last_sync_error: warnings.length ? warnings.slice(0, 5).join(" | ").slice(0, 1000) : null,
      sync_started_at: null,
      status: "active",
    }).eq("id", accountId);
    // Quality score and (with consent) audience for brand search.
    const { error: statsError } = await admin.rpc("refresh_creator_stats", { p_creator: creatorId });
    if (statsError) warnings.push(`stats: ${statsError.message}`);
    return { status: "synced", warnings };
  } catch (e) {
    const authFailed = e instanceof GraphError && e.isAuthError;
    await admin.from("instagram_accounts").update({
      sync_started_at: null,
      last_sync_error: authFailed
        ? "Instagram access was revoked or expired. Reconnect to resume syncing."
        : (e instanceof Error ? e.message : String(e)).slice(0, 1000),
      ...(authFailed ? { status: "needs_reauth" } : {}),
    }).eq("id", accountId);
    if (authFailed) return { status: "needs_reauth", warnings };
    throw e;
  }
}

interface StoredToken {
  accessToken: string;
  issuedAt: Date;
  expiresAt: Date | null;
}

async function loadToken(admin: SupabaseClient, accountId: string): Promise<StoredToken> {
  const { data, error } = await admin.rpc("ig_get_token", { p_account_id: accountId });
  if (error) throw new Error(`Could not load token: ${error.message}`);
  const row = (data as Array<Record<string, string>>)?.[0];
  if (!row?.access_token) throw new GraphError("No Instagram token stored", 190);
  return {
    accessToken: row.access_token,
    issuedAt: new Date(row.issued_at),
    expiresAt: row.expires_at ? new Date(row.expires_at) : null,
  };
}

/** Refreshes when under 20 days remain (Meta requires the token be 24h+ old). */
async function refreshIfNeeded(admin: SupabaseClient, accountId: string, token: StoredToken) {
  if (token.expiresAt && token.expiresAt.getTime() < Date.now()) {
    throw new GraphError("Token expired", 190);
  }
  const oldEnough = Date.now() - token.issuedAt.getTime() > DAY;
  const expiringSoon = !token.expiresAt || token.expiresAt.getTime() - Date.now() < 20 * DAY;
  if (!oldEnough || !expiringSoon) return token;

  const fresh = await refreshLongLived(token.accessToken);
  const { error } = await admin.rpc("ig_save_token", {
    p_account_id: accountId,
    p_token: fresh.accessToken,
    p_expires_at: fresh.expiresAt.toISOString(),
  });
  if (error) throw new Error(`Could not save refreshed token: ${error.message}`);
  return { accessToken: fresh.accessToken, issuedAt: new Date(), expiresAt: fresh.expiresAt };
}

export async function saveProfile(admin: SupabaseClient, accountId: string, p: IgProfile) {
  await admin.from("instagram_accounts").update({
    ig_account_id: p.id,
    username: p.username,
    name: p.name ?? null,
    account_type: p.account_type ?? null,
    profile_picture_url: p.profile_picture_url ?? null,
    biography: p.biography ?? null,
    website: p.website ?? null,
    followers_count: p.followers_count ?? null,
    follows_count: p.follows_count ?? null,
    media_count: p.media_count ?? null,
  }).eq("id", accountId);

  await admin.from("instagram_account_snapshots").upsert({
    account_id: accountId,
    captured_on: isoDate(new Date()),
    followers_count: p.followers_count ?? null,
    follows_count: p.follows_count ?? null,
    media_count: p.media_count ?? null,
  });
  await admin.from("instagram_account_snapshots").delete()
    .eq("account_id", accountId)
    .lt("captured_on", isoDate(new Date(Date.now() - KEEP_SNAPSHOT_DAYS * DAY)));
}

async function syncDailyMetrics(
  admin: SupabaseClient,
  accountId: string,
  token: string,
  warnings: string[],
) {
  const { data: latest } = await admin
    .from("instagram_daily_metrics").select("metric_date")
    .eq("account_id", accountId).order("metric_date", { ascending: false }).limit(1);

  const todayUtc = Date.UTC(new Date().getUTCFullYear(), new Date().getUTCMonth(), new Date().getUTCDate());
  const earliest = todayUtc - BACKFILL_DAYS * DAY;
  const fromLatest = latest?.[0]
    ? Date.parse(latest[0].metric_date + "T00:00:00Z") - (REFETCH_DAYS - 1) * DAY
    : earliest;
  const start = Math.max(earliest, fromLatest);

  // Metrics Meta rejects for this account (e.g. still "in development").
  let usable: string[] = [...DAILY_METRICS];
  const rows: Record<string, unknown>[] = [];

  for (let day = start; day < todayUtc; day += DAY) {
    const params = {
      period: "day",
      metric_type: "total_value",
      since: day / 1000,
      until: (day + DAY) / 1000,
    };
    let values: Record<string, number>;
    try {
      values = readTotals(await graph("me/insights", token, { ...params, metric: usable.join(",") }));
    } catch (e) {
      if (e instanceof GraphError && e.isAuthError) throw e;
      // Find which metrics fail, then keep using only the working ones.
      values = {};
      const working: string[] = [];
      for (const metric of usable) {
        try {
          Object.assign(values, readTotals(await graph("me/insights", token, { ...params, metric })));
          working.push(metric);
        } catch (inner) {
          if (inner instanceof GraphError && inner.isAuthError) throw inner;
          warnings.push(`metric ${metric} unavailable: ${(inner as Error).message}`);
        }
      }
      usable = working;
      if (!usable.length) break;
    }
    rows.push({ account_id: accountId, metric_date: isoDate(new Date(day)), ...values, fetched_at: new Date().toISOString() });
  }

  if (rows.length) {
    const { error } = await admin.from("instagram_daily_metrics").upsert(rows);
    if (error) throw new Error(`Saving daily metrics failed: ${error.message}`);
  }
  await admin.from("instagram_daily_metrics").delete()
    .eq("account_id", accountId)
    .lt("metric_date", isoDate(new Date(todayUtc - KEEP_DAILY_DAYS * DAY)));
}

/** Reads {name: total_value.value} pairs from an insights response. */
function readTotals(body: Record<string, unknown>): Record<string, number> {
  const out: Record<string, number> = {};
  for (const item of (body.data as Array<Record<string, any>>) ?? []) {
    const value = item.total_value?.value ?? item.values?.[0]?.value;
    if (typeof value === "number" && (DAILY_METRICS as readonly string[]).includes(item.name)) {
      out[item.name] = value;
    }
  }
  return out;
}

interface MediaRow {
  id: string;
  media_product_type?: string;
  like_count?: number;
  comments_count?: number;
}

/** Same canonical form as public.instagram_permalink() in SQL. */
export function canonicalPermalink(url: string | null | undefined): string | null {
  const m = /^https:\/\/(?:www\.)?instagram\.com\/(?:[A-Za-z0-9._]+\/)?(p|reel|reels|tv)\/([A-Za-z0-9_-]+)/
    .exec(url ?? "");
  return m ? `https://www.instagram.com/${m[1]}/${m[2]}/` : null;
}

async function syncMedia(
  admin: SupabaseClient,
  accountId: string,
  creatorId: string,
  token: string,
  warnings: string[],
): Promise<MediaRow[]> {
  const body = await graph("me/media", token, { fields: MEDIA_FIELDS, limit: MEDIA_LIMIT });
  const items = (body.data as Array<Record<string, any>>) ?? [];
  const metricSet = { index: 0 };
  const rows: Record<string, unknown>[] = [];
  for (const m of items) rows.push(await mediaRow(m, accountId, token, metricSet, warnings));

  // Posts submitted to campaigns: link any not matched yet, and keep (and
  // keep refreshing) them even once they fall out of the latest 25.
  const { data: campaignPosts } = await admin.from("collaboration_submissions")
    .select("id, content_url, ig_media_id").eq("creator_id", creatorId).eq("kind", "live");
  const byPermalink = new Map(
    rows.map((r) => [canonicalPermalink(r.permalink as string), r.id as string]),
  );
  const fetched = new Set(rows.map((r) => r.id as string));
  const keep = new Set<string>();
  for (const s of campaignPosts ?? []) {
    let mediaId: string | null = s.ig_media_id;
    if (!mediaId) {
      mediaId = byPermalink.get(s.content_url) ?? null;
      if (mediaId) {
        await admin.from("collaboration_submissions").update({ ig_media_id: mediaId }).eq("id", s.id);
      }
    }
    if (!mediaId) continue;
    keep.add(mediaId);
    if (!fetched.has(mediaId)) {
      try {
        const m = await graph(mediaId, token, { fields: MEDIA_FIELDS });
        rows.push(await mediaRow(m, accountId, token, metricSet, warnings));
        fetched.add(mediaId);
      } catch (e) {
        if (e instanceof GraphError && e.isAuthError) throw e;
        warnings.push(`campaign post ${mediaId} unavailable (deleted?)`);
      }
    }
  }

  if (rows.length) {
    const { error } = await admin.from("instagram_media").upsert(rows);
    if (error) throw new Error(`Saving media failed: ${error.message}`);
  }
  // Keep only the posts we just fetched plus campaign posts.
  const ids = [...new Set([...rows.map((r) => r.id as string), ...keep])];
  let cleanup = admin.from("instagram_media").delete().eq("account_id", accountId);
  if (ids.length) cleanup = cleanup.not("id", "in", `(${ids.map((id) => `"${id}"`).join(",")})`);
  await cleanup;

  return items as MediaRow[];
}

/** Fetches a post's insights and builds its instagram_media row. */
async function mediaRow(
  m: Record<string, any>,
  accountId: string,
  token: string,
  metricSet: { index: number },
  warnings: string[],
): Promise<Record<string, unknown>> {
  const insights: Record<string, number> = {};
  while (metricSet.index < MEDIA_METRIC_SETS.length) {
    try {
      const res = await graph(`${m.id}/insights`, token, {
        metric: MEDIA_METRIC_SETS[metricSet.index].join(","),
      });
      for (const item of (res.data as Array<Record<string, any>>) ?? []) {
        const value = item.values?.[0]?.value ?? item.total_value?.value;
        if (typeof value === "number") insights[item.name] = value;
      }
      break;
    } catch (e) {
      if (e instanceof GraphError && e.isAuthError) throw e;
      // Some posts (e.g. very old ones) have no insights; only downgrade
      // the metric set when the error looks metric-related.
      if (/metric/i.test((e as Error).message)) {
        metricSet.index++;
      } else {
        warnings.push(`no insights for post ${m.id}`);
        break;
      }
    }
  }
  return {
      id: m.id,
      account_id: accountId,
      media_type: m.media_type ?? null,
      media_product_type: m.media_product_type ?? null,
      caption: typeof m.caption === "string" ? m.caption.slice(0, 2200) : null,
      permalink: m.permalink ?? null,
      thumbnail_url: m.thumbnail_url ?? null,
      // media_url can be missing (copyrighted audio, downloads disabled).
      media_url: m.media_url ?? null,
      posted_at: m.timestamp ?? null,
      like_count: m.like_count ?? null,
      comments_count: m.comments_count ?? null,
      reach: insights.reach ?? null,
      views: insights.views ?? null,
      saved: insights.saved ?? null,
      shares: insights.shares ?? null,
      total_interactions: insights.total_interactions ?? null,
      insights_updated_at: new Date().toISOString(),
  };
}

async function syncAudience(
  admin: SupabaseClient,
  accountId: string,
  token: string,
  warnings: string[],
) {
  for (const breakdown of ["age", "gender", "country", "city"] as const) {
    try {
      const body = await graph("me/insights", token, {
        metric: "follower_demographics",
        period: "lifetime",
        metric_type: "total_value",
        timeframe: "this_month",
        breakdown,
      });
      const results: Array<{ dimension_values: string[]; value: number }> =
        (body.data as any)?.[0]?.total_value?.breakdowns?.[0]?.results ?? [];
      if (!results.length) continue; // e.g. fewer than 100 followers

      await admin.from("instagram_audience").delete().eq("account_id", accountId).eq("breakdown", breakdown);
      const { error } = await admin.from("instagram_audience").insert(
        results.map((r) => ({
          account_id: accountId,
          breakdown,
          dimension: String(r.dimension_values?.[0] ?? "unknown").slice(0, 120),
          value: r.value,
        })),
      );
      if (error) warnings.push(`saving ${breakdown} audience failed: ${error.message}`);
    } catch (e) {
      if (e instanceof GraphError && e.isAuthError) throw e;
      warnings.push(`audience ${breakdown} unavailable: ${(e as Error).message}`);
    }
  }
}

/**
 * Copies only public numbers (handle, followers, engagement from public
 * like/comment counts) to social_accounts, where brands can see them.
 * Private insights never leave the creator's own tables.
 */
async function mirrorPublicStats(
  admin: SupabaseClient,
  creatorId: string,
  profile: IgProfile,
  media: MediaRow[],
) {
  const recent = media.filter((m) => m.media_product_type !== "STORY").slice(0, 12);
  const followers = profile.followers_count ?? 0;
  let engagement: number | null = null;
  if (recent.length && followers > 0) {
    const avg = recent.reduce((s, m) => s + (m.like_count ?? 0) + (m.comments_count ?? 0), 0) / recent.length;
    engagement = Math.min(100, Math.round((avg / followers) * 10000) / 100);
  }
  await admin.from("social_accounts").upsert({
    creator_id: creatorId,
    platform: "instagram",
    handle: profile.username,
    profile_url: `https://www.instagram.com/${profile.username}/`,
    followers,
    engagement_rate: engagement,
    verified: true,
    last_synced_at: new Date().toISOString(),
  }, { onConflict: "creator_id,platform" });
}

function isoDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}
