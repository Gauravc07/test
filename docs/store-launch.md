# Launching Shor on the App Store and Google Play

Checked against Apple's App Review Guidelines and Google Play policy on
5 November 2026. Store rules change every year; re-check the items marked
**(check in console)** when you submit.

## Status at a glance

| Requirement | Store | Status |
|---|---|---|
| Built with Xcode 26 / iOS 26 SDK (required since 28 Apr 2026) | Apple | Build on a Mac with Xcode 26+. CI checks it |
| Target API 36 (Android 16) for new apps and updates from 31 Aug 2026 | Google | **Done**: Flutter 3.38 targets 36. CI checks it |
| 16 KB memory page support | Google | **Done**: NDK r28 build. CI checks the native libraries |
| Account deletion inside the app (Apple 5.1.1(v), Google account deletion) | Both | **Done**: Profile/Account → Delete account |
| Account deletion web page | Google | **Done**: `/delete-account` |
| Privacy policy in the app and on the listing (Apple 5.1.1(i)) | Both | **Done**: `/privacy`, linked on welcome, sign-up and settings. **You:** fill placeholders and get legal review |
| User-generated content safeguards (Apple 1.2, Google UGC policy): terms before posting, filter, report, block, published contact | Both | **Done**. **You:** check reports at least daily (see [Moderation](#moderation-runbook)) |
| Support contact in the app and support URL (Apple 1.5) | Both | **Done**: chindhegaurav5@gmail.com, `/support` |
| No placeholder or "coming soon" content (Apple 2.1) | Apple | **Done**: phones open on a real welcome screen, not the marketing site |
| Sign in with Apple (4.8) | Apple | **Not needed**: Shor uses its own email login; Instagram is connected, not used to log in |
| In-app purchase (3.1) | Apple | **Not needed**: payments are for services delivered outside the app (3.1.3(e)) |
| Privacy manifest (`PrivacyInfo.xcprivacy`) | Apple | **Done** |
| Export compliance | Apple | **Done**: `ITSAppUsesNonExemptEncryption = NO` |
| App icon (1024 px, no transparency; Android adaptive) | Both | **Done**: `assets/icon/` |
| Release signing | Google | Config **done**. **You:** create the upload key |
| Store listing, screenshots, privacy answers, ratings | Both | **You**: answers drafted below |
| Reviews, notifications, sales tracking, media kit, audience search (added 11–12 Nov) | Both | **Done**. Reviews can be reported (UGC rules). Account deletion removes all the new data, tested. Audience search and media kits are opt-in |
| No subscription prices or "coming soon" in the store apps (Apple 2.1, 3.1.1) | Apple | **Done**: the apps show only deal fees (Settings → Fees). Plans show on the website only |
| No prompts for features hidden in store builds | Both | **Done**: "Connect Instagram" prompts and audience search are hidden until Instagram is switched on after Meta's review |
| Demo accounts for reviewers on the live project | Both | **You approve; I create**: one brand and one creator with sample campaigns, a finished deal, reviews, chat and sales |

## What changed in the app for review

- **Phones open on a welcome screen** (`lib/screens/welcome_page.dart`) with
  Create account / Log in and links to the terms, privacy policy and help.
  The marketing site with "coming soon" links is web-only.
- **Terms before posting**: sign-up has a required checkbox, and existing
  accounts see a "Before you continue" screen. Acceptance is stored on the
  profile (`terms_version`, `terms_accepted_at`). Bump
  `AppConfig.termsVersion` when the terms change to ask everyone again.
- **Report**: chat menu (and long-press a message), campaign briefs, creator
  profiles and collaborations. Reports go to `content_reports` with a snapshot
  of the content.
- **Block**: same places. Blocked people can't message, invite or apply, and
  their campaigns, profiles and chats are hidden. Unblock from Profile/Account
  → Blocked accounts.
- **Filter**: offensive words are rejected in messages, campaigns, pitches,
  submissions and profiles (`moderation_terms`).
- **Delete account**: Profile/Account → Delete account → type DELETE. This
  deletes the login and all personal data, including Instagram data and its
  token. Invoices stay for the other party, unlinked.
- **Forgot password**: the login screen sends a reset link. The website opens
  a "choose a new password" screen.
- **Instagram login stays in the app**: the system sign-in sheet
  (ASWebAuthenticationSession / Custom Tabs) returns to `shor://instagram`
  instead of sending people to Safari.
- **Instagram Insights is off in store builds** until Meta approves the app.
  Only accounts added as testers in the Meta app can connect before then. Build
  with `--dart-define=INSTAGRAM_ENABLED=true` after approval.
- **Settings in one place**: help, email support, privacy policy, terms,
  blocked accounts, log out, delete account.

## Before you submit (only you can do these)

1. **Legal pages.** In `web/privacy.html` and `web/terms.html`, replace every
   highlighted placeholder (legal name, address, grievance officer, city) and
   rewrite Terms §4 to match how money actually moves. Have a lawyer review
   both pages.
2. **Payments decision.** The app shows split fees (7% Shor Protection for
   brands, 5% for creators after 3 free deals), but no payment gateway is
   connected. Before launch, either connect one (Razorpay Route, see
   [payments-razorpay.md](payments-razorpay.md)) or keep the "settle directly"
   wording in the app and Terms. Reviewers and users will read these screens.
   If paid plans are ever sold inside the iOS app, Apple requires in-app
   purchase for them.
3. **Publish the website.** Push this branch so Vercel builds with
   `vercel.json` (it installs Flutter 3.38.9 and builds `build/web`). Check that
   these load:
   `https://test-lilac-seven-86.vercel.app/privacy`, `/terms`, `/support`,
   `/delete-account`. If Vercel's project settings override the build, set
   Framework Preset to "Other". **Not verified yet**: I couldn't run Vercel's
   build here. If you move to your own domain, change `_website` in
   `lib/config/app_config.dart`.
4. **Supabase Auth** (Dashboard → Authentication → URL Configuration):
   - Site URL: `https://test-lilac-seven-86.vercel.app`
   - Redirect URLs: `https://test-lilac-seven-86.vercel.app/**` (and
     `http://localhost:*` for development)
   - Set up custom SMTP (Authentication → Emails). The built-in sender is
     rate-limited and meant for testing.
5. **Moderation owner.** Name who checks reports every day (runbook below).
6. **Reviewer accounts.** Create one brand and one creator account with
   realistic sample campaigns, applications and messages, and give the
   reviewers the logins. Ask me and I'll set them up.
7. **Android upload key** (once; keep it safe forever):
   ```bash
   keytool -genkey -v -keystore %USERPROFILE%\shor-upload-keystore.jks ^
     -keyalg RSA -keysize 2048 -validity 10000 -alias upload
   ```
   Then create `android/key.properties` (it is git-ignored):
   ```
   storePassword=...
   keyPassword=...
   keyAlias=upload
   storeFile=C:/Users/<you>/shor-upload-keystore.jks
   ```

## Building the packages

```bash
# Google Play (Android App Bundle)
flutter build appbundle --release
# → build/app/outputs/bundle/release/app-release.aab

# App Store (on a Mac with Xcode 26+)
flutter build ipa --release
# → upload build/ios/ipa/*.ipa with Transporter or Xcode Organizer
```

Raise `version` in `pubspec.yaml` for every upload (`1.0.0+1` → `1.0.0+2` …).
The number after `+` must always go up.

The GitHub Actions workflow (`.github/workflows/ci.yml`) runs on every push:
analyze, tests, web build, Edge Function tests, an Android App Bundle (checks
target API ≥ 36 and 16 KB alignment) and an unsigned iOS build with Xcode 26.
Its Android bundle is debug-signed: use it only as a check, never upload it.

## Apple App Store

**Account.** Apple Developer Program (USD 99/year). Enrolling as an
organisation shows the company as the seller and needs a D-U-N-S number.
Register the bundle ID `com.shor.shor` (permanent after the first release).

**App Information.**

| Field | Value |
|---|---|
| Name | Shor - Creators & Brands |
| Subtitle (30) | Creator & brand collaborations |
| Category | Business (secondary: Social Networking) |
| Privacy Policy URL | https://test-lilac-seven-86.vercel.app/privacy |
| Support URL | https://test-lilac-seven-86.vercel.app/support |
| Copyright | 2026 [legal name] |

Avoid "Instagram" in the name, subtitle and keywords (Apple 2.3.7 / 5.2.1,
third-party trademarks). Mentioning it in the description is fine.

**Keywords (100 chars):**
`influencer,creator,brand,campaign,collab,ugc,marketing,sponsorship,reels,partnership`

**App Privacy** (matches `ios/Runner/PrivacyInfo.xcprivacy`). No tracking.

| Data type | Linked to user | Tracking | Purpose |
|---|---|---|---|
| Contact Info: Name | Yes | No | App Functionality |
| Contact Info: Email Address | Yes | No | App Functionality |
| Identifiers: User ID | Yes | No | App Functionality |
| User Content: Emails or Text Messages (chat) | Yes | No | App Functionality |
| User Content: Other User Content (briefs, pitches, profile, links) | Yes | No | App Functionality |
| Financial Info: Other Financial Info (rates, invoices) | Yes | No | App Functionality |
| Other Data: Other Data Types (Instagram insights, only if connected) | Yes | No | App Functionality |
| Financial Info: Other Financial Info (for brands: totals of store orders credited to their creators; no customer details) | Yes | No | App Functionality, Analytics |

Not collected: location, contacts, photos/videos, browsing/search history,
purchases, usage data, diagnostics, payment cards.

**Age rating.** Answer the questionnaire honestly: user-generated content and
messaging are yes; everything else no. The Terms require users to be 18+, so
also choose the higher 18+ rating if the questionnaire offers it
**(check in console)**.

**Screenshots.** iPhone 6.9" (1320×2868) is required. Because Shor also runs
on iPad, 13" iPad screenshots (2064×2752) are required too **(check in
console)**. Show real screens: campaign feed, a brief, the collaboration page,
creator search and chat.

**App Review notes** (paste and fill in):

> Shor is a marketplace where brands hire Instagram creators for sponsored
> content. Demo accounts: Brand: … / … · Creator: … / ….
> Payments: brands pay creators for promotional services delivered outside
> the app (guideline 3.1.3(e)); no digital goods are sold.
> User-generated content safeguards: users accept the Terms of Use at sign-up;
> offensive words are filtered; Report and Block are in every chat (menu and
> long-press a message), campaign brief, creator profile and collaboration;
> reports are reviewed within 24 hours; support email is in Profile → Help.
> Account deletion: Profile (creators) or Account (brands) → Delete account.
> Instagram insights are disabled in this build until Meta approves our app.
> Reviews after a completed deal can be reported with the Report button
> under each review. Notifications are in-app (bell icon) and by email; the
> app sends no push notifications and asks for no device permissions.
> Brands can connect their own Shopify or WooCommerce store by webhook to
> see which creator drove each sale; this is optional and needs no login to
> those services in the app.

## Google Play

**Account.** Google Play Console (USD 25 once). New personal developer
accounts must run a closed test with at least 12 testers for 14 days before
applying for production access **(check in console)**. Organisation accounts
are not subject to this.

**App signing.** Use Play App Signing; upload bundles signed with your upload
key.

**Store listing.**

| Field | Value |
|---|---|
| App name (30) | Shor - Creators & Brands |
| Short description (80) | Find brand campaigns, collaborate with creators, review content, get paid. |
| App icon (512×512) | `assets/icon/app_icon.png` resized |
| Feature graphic | 1024×500, still to design |
| Phone screenshots | At least 2 (1080×1920 recommended) |
| Category | Business |
| Contact email | chindhegaurav5@gmail.com |
| Privacy policy | https://test-lilac-seven-86.vercel.app/privacy |

**App content declarations.**

| Section | Answer |
|---|---|
| Privacy policy | https://test-lilac-seven-86.vercel.app/privacy |
| App access | Restricted: give the demo brand and creator logins |
| Ads | No ads |
| Content rating (IARC) | Users interact and share content: yes. No violence, sexual content, gambling or drugs |
| Target audience | 18 and over only |
| News app | No |
| Financial features | None (no payments processed in the app); revisit when payments go live |
| Government / health | No |
| Account deletion URL | https://test-lilac-seven-86.vercel.app/delete-account |

**Data safety.**

- Collects data: yes. Shares data: **no** (service providers like Supabase
  and Vercel don't count as sharing).
- Encrypted in transit: yes. Users can request deletion: yes (in app and the
  web page above).

| Data type | Collected | Optional? | Purpose |
|---|---|---|---|
| Personal info: Name | Yes | Required | App functionality, Account management |
| Personal info: Email address | Yes | Required | App functionality, Account management |
| Personal info: User IDs | Yes | Required | App functionality, Account management |
| Personal info: Other info (Instagram insights) | Yes | Optional | App functionality |
| Financial info: Other financial info (rates, invoices) | Yes | Optional | App functionality |
| Messages: Other in-app messages | Yes | Optional | App functionality |
| Financial info: Purchase history (brands' store orders credited to creators: order number, amount, date, code; no shopper details) | Yes | Optional | App functionality, Analytics |
| App activity: Other user-generated content | Yes | Optional | App functionality |

## Store description (draft, both stores)

> **Shor is where creators meet brands.**
>
> For creators: find paid and product campaigns from brands that fit your
> niche, apply with your own price, share drafts for feedback, submit your live
> post and request payment, all in one place. Chat with brands without
> losing details in DMs.
>
> For brands: write a campaign brief in minutes, search creators by niche,
> city and audience size, save shortlists, invite creators or review
> applications, approve drafts before they go live, and see how each post
> performs.
>
> Safe by design: report or block anyone, and our team reviews reports within
> 24 hours.

## Moderation runbook

Check reports at least once a day (Apple: "timely responses"; Google:
"take action where appropriate"). Use the Supabase SQL editor:

```sql
-- Open reports, oldest first
select r.id, r.created_at, r.target_type, r.reason, r.details,
       r.content_snapshot, r.reported_user_id, p.full_name as reported
  from content_reports r
  left join profiles p on p.id = r.reported_user_id
 where r.status = 'open'
 order by r.created_at;

-- Remove content
delete from messages where id = '<message id>';
update campaigns set status = 'archived' where id = '<campaign id>';

-- Ban an account (they can no longer log in)
update auth.users set banned_until = 'infinity' where id = '<user id>';

-- Close the report
update content_reports
   set status = 'actioned', reviewed_at = now(), resolution_note = 'Removed and banned'
 where id = '<report id>';

-- Add a word to the filter
insert into moderation_terms (term) values ('<word>');
```

Reports are not emailed to you yet. Turning that on (a database webhook to an
email service) is a good next step.

## Every year

- **Google:** the target API level rises each August. Update Flutter, check
  `targetSdkVersion` in CI, and ship an update before the deadline.
- **Apple:** a new minimum Xcode/SDK applies each spring. Update Xcode and
  Flutter and rebuild.
- **Apple age ratings and App Privacy, Google Data safety:** update them
  whenever data use changes, and keep `PrivacyInfo.xcprivacy` in step.
- **Meta:** the yearly Data Use Checkup for the Instagram app.

## Sources

- [Apple: SDK minimum requirements](https://developer.apple.com/news/upcoming-requirements/)
- [Apple: App Review Guidelines](https://developer.apple.com/app-store/review/guidelines/)
- [Google Play: target API level requirements](https://support.google.com/googleplay/android-developer/answer/11926878)
- [Android: meet Google Play's target API level requirement](https://developer.android.com/google/play/requirements/target-sdk)
- [Google Play: User Generated Content policy](https://support.google.com/googleplay/android-developer/answer/9876937)
- [Google Play: app account deletion requirements](https://support.google.com/googleplay/android-developer/answer/13327111)
- [Google Play 16 KB page size guidance (Broadcom summary)](https://knowledge.broadcom.com/external/article/411567/guidance-on-google-plays-16-kb-page-size.html)
