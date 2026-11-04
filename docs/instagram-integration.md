# Instagram integration: strategy, security and compliance

Last checked against Meta's documentation: 4 November 2026 (Graph API v26.0).

## The decision in short

- Creators sign in to Shor with email, then **connect** their Instagram
  professional account through Instagram's official login
  ("Instagram API with Instagram Login"). Shor never sees their Instagram password.
- Shor stores the creator's insights and shows them on a private dashboard.
  Brands only see numbers that are already public on Instagram: handle,
  follower count, and an engagement rate worked out from public like and
  comment counts.
- We build in phases, one at a time. **Phases 1–3 (insights dashboard,
  marketplace, campaign reporting) are built.** The marketplace works today;
  anything that reads Instagram goes live once the Meta app is set up (see
  [Setup](#setup)).

## Ways to get Instagram data, and which one we use

| Route | Who it covers | Status | Use it? |
|---|---|---|---|
| **Instagram API with Instagram Login** (`graph.instagram.com`) | Creator and Business accounts. No Facebook Page needed | Current. Insights available since Jan 2025 | **Yes. This is what we built** |
| Instagram API with Facebook Login (`graph.facebook.com`) | Creator and Business accounts **linked to a Facebook Page** | Current | Later, only if we need ads-inclusive totals (`total_views` and similar) |
| Business Discovery API | Public profile and post counts of *other* professional accounts, looked up by username | Current. 1,000 calls per user per hour since Mar 2026 | Phase 4: brand-side creator search |
| Instagram Basic Display API | Personal accounts | **Shut down 4 Dec 2024** | No |
| Scraping, or "unofficial API" vendors | Anyone | Breaks Instagram's terms; gets accounts and apps banned | **Never** |

**Personal Instagram accounts cannot share any data through any official
API.** A creator must switch to a Creator or Business account. It's free:
Instagram → Settings → Account type and tools.

## What we can show a creator

Permissions requested: `instagram_business_basic` and
`instagram_business_manage_insights`, and nothing else. We don't ask to
publish, comment or read messages.

| Area | Data | Notes |
|---|---|---|
| Profile | username, name, photo, bio, website, account type, followers, following, post count | Public counts. Refreshed every sync |
| Account insights, per day | reach, views, accounts engaged, total interactions, likes, comments, shares, saves, replies, profile link taps | Meta keeps about 90 days. Values can lag up to 48 h. Some metrics are still marked "in development" by Meta, and the sync skips any metric Meta rejects |
| Follower growth | daily follower count | Meta has no follower history, so Shor records a snapshot every day from the connection date |
| Posts and reels (latest 25) | caption, type, date, link, thumbnail, likes, comments, plus insights: reach, views, saves, shares, total interactions | Stories only stay available for 24 h, and `/media` doesn't list them. Carousel items have no insights of their own |
| Audience | follower age, gender, top countries, top cities | **Only for accounts with 100+ followers**. Top 45 groups per breakdown |

**Not available:** personal accounts; private data of other accounts; DMs
(this needs a different permission we don't request); story insights after
24 hours; account metrics older than about 90 days; `impressions`, retired
in April 2025 and replaced by `views`; ads-inclusive totals (Facebook Login
only).

## Should "Log in with Instagram" replace email login?

Not yet. Instagram's login API **returns no email address**, and Supabase
Auth has no Instagram provider. "Continue with Instagram" would need a
custom flow: our server would create a Supabase user tied to the Instagram
user ID and issue a session. That's possible, but it creates accounts with
no email for receipts, payouts or recovery.

Recommended order:

1. **Now:** email login plus "Connect Instagram". This is built.
2. **Phase 3:** add "Continue with Instagram" on the login page. It reuses the
   same OAuth callback: if the Instagram user is already linked, sign them in;
   if not, create a creator account and ask for an email straight after.

## How it works

```
Creator (Flutter app)          Supabase Edge Functions              Instagram / Meta
---------------------          -----------------------              ----------------
Connect Instagram  ──POST──▶  instagram-connect
                              · checks session + creator role
                              · saves one-time state (10 min)
                   ◀── url ──
opens instagram.com/oauth/authorize ─────────────────────────────▶  user logs in on
                                                                     Instagram, approves
                              instagram-callback  ◀── code+state ──
                              · consumes state (single use)
                              · code → short token → 60-day token ─▶ api/graph.instagram.com
                              · token → Supabase Vault (encrypted)
                              · first sync in background
back to app ?instagram=connected ◀──
Dashboard reads own rows (RLS) ◀── Postgres
Sync now ─────────POST──────▶ instagram-sync (10-min cooldown)
                              · refreshes token when < 20 days left
Daily job (pg_cron) ─POST───▶ instagram-sync (x-cron-secret)
Disconnect ───────POST──────▶ instagram-disconnect → deletes everything
                              instagram-meta/deauthorize   ◀── Meta, signed
                              instagram-meta/data-deletion ◀── Meta, signed
```

Code:

- `supabase/migrations/20261104010000_instagram_insights.sql`: tables, Vault helpers, row-level security.
- `supabase/functions/`: the Edge Functions, with shared code in `_shared/` and Deno tests in `tests/`.
- `lib/backend/instagram_service.dart`: the app's data layer.
- `lib/screens/instagram_dashboard_page.dart`: the dashboard.

## How the data is protected

| Risk | Protection |
|---|---|
| Stolen access token | Tokens are encrypted in **Supabase Vault**, outside any table the app can read. Only the service role can read them, through `ig_get_token`. Tokens are never logged or sent to the app. Deleting a connection also destroys the Vault secret |
| Login CSRF, or connecting someone else's account | A random 256-bit `state`, stored server-side, single-use, expires after 10 minutes, and tied to the signed-in creator |
| Open redirect after OAuth | Return URLs must match `ALLOWED_RETURN_ORIGINS` (https only, except localhost) |
| One creator reading another's insights | Row-level security: every Instagram table is readable only by the owning creator. Tested |
| Creators faking stats for brands | The app can't write any Instagram table. Verified `social_accounts` numbers are locked by a trigger and can only be changed by the sync |
| Forged Meta callbacks | `signed_request` is verified with HMAC-SHA256 and the app secret, using a constant-time comparison. Tested |
| App secret leak | The app secret exists only as an Edge Function secret. The Flutter app ships only the public publishable key |
| Keeping data too long | Daily metrics are kept 90 days, follower snapshots 365 days, and only the latest 25 posts. Disconnecting deletes everything immediately |
| Expired or revoked access | The sync marks the account `needs_reauth` and the dashboard asks the creator to reconnect |
| Too many API calls | Manual sync has a 10-minute cooldown. The scheduled job syncs each account at most once every 20 hours |

## Compliance checklist

This is not legal advice. Have a lawyer review the privacy policy and terms
before launch.

### Meta (required before outside creators can connect)

- [ ] **Meta Business Verification** for the company that owns the app.
- [ ] **Privacy policy** at a public URL, entered in the App Dashboard. It
      must say what Instagram data Shor collects (the table above), why,
      how long it's kept, who can see it (brands see only public numbers),
      and how to delete it. Meta Platform Terms §4.
- [ ] **Data deletion request URL**: `…/functions/v1/instagram-meta/data-deletion`. Built.
- [ ] **Deauthorize callback URL**: `…/functions/v1/instagram-meta/deauthorize`. Built.
- [ ] **App Review** for Advanced Access to `instagram_business_basic` and
      `instagram_business_manage_insights`. Submit a screencast of the whole
      connect → dashboard → disconnect flow and explain each permission's use.
      Until approved, only accounts with a role on the app (testers) can connect.
- [ ] **Annual Data Use Checkup** in the App Dashboard. Keep the app's details accurate (§7).
- [ ] **Platform Terms rules we follow by design:** never sell or license
      the data (§3.a.iv); no surveillance (§3.a.iii); share only with the
      user's consent, which is why brands see public numbers only (§3.c);
      delete on request, account closure, or when no longer needed (§3.d);
      industry-standard security (§6.a); never ask for Instagram passwords
      (§6.a.iii).
- [ ] **Incident response:** report security incidents to Meta as soon as
      practicable (§6.b). Name an owner for this.
- [ ] **Campaign post sharing (built).** When a creator submits a live post
      for a campaign, that one post's insights are shared with the campaign's
      brand. The app tells the creator before they submit (§3.c, sharing at
      the user's direction). Show this in the App Review screencast and
      describe it in the privacy policy. All other insights stay private.
- [ ] If we change what we do with the data again (for example, showing a
      creator's account-level insights to brands), go through App Review
      again first (§3.a.vii).

### India: DPDP Act 2023 and DPDP Rules 2025

Rules notified 13 November 2025. Core duties apply from **13 May 2027**.

- [ ] A clear consent notice when connecting. The connect screen already
      lists what we read and what we never do.
- [ ] Let users withdraw consent as easily as they gave it. Disconnect is one tap.
- [ ] Erase data when the purpose is served or on request. Built.
- [ ] Reasonable security safeguards and breach notification (72 hours under Rule 7).
- [ ] A contact person for data-protection questions, named in the privacy policy.

### Shor's own terms

- [ ] The creator terms of service say creators must own, or be authorized
      to manage, the Instagram account they connect.
- [ ] Brands may not export or resell creator data.

## Setup

1. **Create the Meta app.** Go to developers.facebook.com → Create app →
   use case **"Manage messaging & content on Instagram"** → Instagram →
   *API setup with Instagram login*.
   - Copy the **Instagram app ID** and **Instagram app secret**.
   - Add the OAuth redirect URI
     `https://tnevsivuemhlrlclpfuw.supabase.co/functions/v1/instagram-callback`.
   - Under Business login settings, set the deauthorize and data-deletion URLs listed above.
   - App roles → Roles → **Instagram testers**: add the Instagram account
     you will test with, by username. Its owner accepts the invite in
     Instagram → Settings → Apps and websites → Tester invites. The account
     must be a Creator or Business account.

2. **Deploy the functions.** You need a Supabase access token
   (`npx supabase login`).
   ```bash
   npx supabase link --project-ref tnevsivuemhlrlclpfuw
   npx supabase secrets set \
     IG_APP_ID=... IG_APP_SECRET=... \
     APP_URL=https://<your-web-app> \
     ALLOWED_RETURN_ORIGINS=https://<your-web-app>,http://localhost \
     ALLOWED_RETURN_SCHEMES=shor \
     CRON_SECRET=$(openssl rand -hex 32)
   npx supabase functions deploy
   ```

3. **Schedule the daily sync.** Run this in the SQL editor after enabling the
   `pg_cron` and `pg_net` extensions. Store the cron secret in Vault first,
   with `select vault.create_secret('<CRON_SECRET>', 'instagram_cron_secret');`.
   ```sql
   select cron.schedule('instagram-daily-sync', '30 2 * * *', $$
     select net.http_post(
       url := 'https://tnevsivuemhlrlclpfuw.supabase.co/functions/v1/instagram-sync',
       headers := jsonb_build_object(
         'Content-Type', 'application/json',
         'x-cron-secret', (select decrypted_secret from vault.decrypted_secrets
                           where name = 'instagram_cron_secret')),
       body := '{}'::jsonb)
   $$);
   ```

4. **Test.** Run `flutter run -d chrome`, log in as a creator → Insights tab
   → Connect Instagram → log in on Instagram as the tester account → you're
   sent back to the Insights tab.

## Roadmap

| Phase | What | Status |
|---|---|---|
| 1 | Connect Instagram, secure token storage, daily sync, creator insights dashboard, disconnect and Meta deletion callbacks | **Built.** Waiting on the Meta app and deploy |
| 2 | Brand ↔ creator marketplace: creator search with verified public stats, campaign briefs, applications and invites, draft and live-post review, invoices, chat (see [marketplace-workflow.md](marketplace-workflow.md)) | **Built** |
| 3 | Campaign reporting: live posts tied to collaborations, with reach, views, likes, comments, saves and shares shown to the brand | **Built** (needs the Instagram connection live) |
| 4 | Creator-controlled "share my full insights with this brand" (audience and account metrics, explicit and revocable consent) | Next |
| 5 | "Continue with Instagram" sign-in | Planned |
| 6 | Business Discovery: brands look up any public professional account by username before inviting | Planned |
| 7 | Phones connect Instagram in the in-app sign-in sheet and return to `shor://instagram` (no trip to Safari) | **Built** |

## Sources

- [Instagram Platform: Insights](https://developers.facebook.com/docs/instagram-platform/insights)
- [IG User insights reference](https://developers.facebook.com/documentation/instagram-platform/api-reference/instagram-user/insights/)
- [IG Media insights reference](https://developers.facebook.com/documentation/instagram-platform/reference/instagram-media/insights.md)
- [Business Login for Instagram](https://developers.facebook.com/docs/instagram-platform/instagram-api-with-instagram-login/business-login)
- [Instagram Platform changelog](https://developers.facebook.com/docs/instagram-platform/changelog)
- [User and media insights on Instagram API with Instagram Login (Meta blog, Mar 2025)](https://developers.facebook.com/blog/post/2025/03/24/user-and-media-insights-on-instagram-api-with-instagram-login/)
- [Graph API v22.0 changelog (impressions deprecation)](https://developers.facebook.com/docs/graph-api/changelog/version22.0)
- [App Review for Instagram API](https://developers.facebook.com/docs/instagram-platform/app-review)
- [Data deletion callback](https://developers.facebook.com/docs/development/create-an-app/app-dashboard/data-deletion-callback)
- [Meta Platform Terms](https://developers.facebook.com/terms/dfc_platform_terms/)
- [DPDP Rules 2025 timeline (Taxmann)](https://www.taxmann.com/post/blog/analysis-indias-dpdp-act-and-rules/)
- [DPDP Rules 2025 notified (Mondaq)](https://www.mondaq.com/india/data-protection/1708164/digital-personal-data-protection-rules-2025-notified)
