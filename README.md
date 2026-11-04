# Shor

Flutter rebuild of the Shor marketing site: where creators meet brands.

The landing page, plus a working brand ↔ creator marketplace for Instagram
backed by Supabase (see [Backend](#backend)). Brands write campaign briefs,
find and invite creators, review drafts and live posts, see results and approve
invoices. Creators find campaigns, apply, submit content, track their Instagram
insights and request payment. See [Marketplace](#marketplace).

The look is a light, editorial style: warm off-white backgrounds, navy text,
Source Serif 4 for headlines and DM Sans for interface text, with dark navy
blue as the single accent colour. Colours live in `lib/theme/app_colors.dart`.
Links to pages that are not built yet show a "coming soon" notice.

## Run it

Requires Flutter 3.38 or newer.

```bash
flutter pub get
flutter run -d chrome        # web
flutter run -d <device-id>   # Android or iOS device / emulator
```

Run the tests and static checks:

```bash
flutter analyze
flutter test
```

Build a release web bundle into `build/web`:

```bash
flutter build web
```

## Project layout

```
lib/
  main.dart                 App entry point: starts Supabase, then MaterialApp
  backend/                  Supabase settings, AuthService, InstagramService,
                            MarketplaceService and its models
  screens/landing_page.dart Stacks every section under the floating nav bar
  screens/auth_page.dart    Login and sign-up (creator or brand)
  screens/home_shell.dart   Signed-in home: creator or brand tabs
  screens/creator/          Campaign feed, campaign brief + apply, my work, profile
  screens/brand/            Campaigns, brief editor, campaign page + report,
                            creator search, creator profile, payments, account
  screens/collaboration_page.dart  One collaboration, for both sides
  screens/chat_page.dart    Live brand ↔ creator chat
  screens/instagram_dashboard_page.dart  Creator's Instagram insights dashboard
  sections/                 One file per landing page section
  widgets/                  Shared buttons, cards, headings, tags and grid
  data/landing_content.dart All landing page copy in one place
  theme/                    Colours, fonts (app_text.dart) and Material theme
  utils/responsive.dart     Tailwind-style breakpoints (sm/md/lg/xl)
assets/images/              Logo and testimonial avatars
docs/                       Product notes carried over from the React version
supabase/migrations/        Database schema (Supabase / PostgreSQL)
supabase/functions/         Edge Functions for the Instagram connection and sync
```

## Marketplace

Brands and creators meet in a campaign-based workflow: brief → applications
or invites → draft review → verified live post → report → invoice, with chat
throughout. The database enforces who can do what at each step. Journeys,
statuses, visibility rules and what is not built yet are in
[docs/marketplace-workflow.md](docs/marketplace-workflow.md).

## Instagram insights

Creators can connect an Instagram Creator or Business account and see their
reach, views, top posts and audience on a private dashboard. Shor reads this
data through Instagram's official API, stores the access token encrypted in
Supabase Vault, and shows brands only public numbers. The strategy, the
security model, Meta's requirements, setup steps and the roadmap are in
[docs/instagram-integration.md](docs/instagram-integration.md).

Test the Edge Functions with [Deno](https://deno.com):

```bash
deno test --allow-env supabase/functions/tests/
```

## Backend

The database is Supabase project `tnevsivuemhlrlclpfuw`. Its schema lives in
`supabase/migrations/`, and the first migration is already applied.

| Table | Holds |
|-------|-------|
| `profiles` | One row per account, with `role` set to `creator` or `brand` |
| `creator_profiles`, `brand_profiles` | Role-specific details |
| `social_accounts` | A creator's Instagram, YouTube and other accounts, with follower stats |
| `campaigns` | Campaigns a brand runs: budget, platforms, deliverables, metrics |
| `collaborations` | One creator on one campaign, from invite or application to completion |
| `shortlists`, `shortlist_items` | A brand's private lists of creators |
| `invoices` | Invoices a creator raises for a collaboration. Shor keeps a 10% fee |
| `transactions` | Payouts and refunds, written only by server code |
| `conversations`, `messages` | Brand ↔ creator chat. New messages stream over Realtime |

Every table has row-level security turned on. Signed-out visitors can read
nothing. Signed-in users see the creator and brand directories, live campaigns,
and only the collaborations, invoices and messages they are part of. Database
triggers enforce who may change a status. For example, only the brand can
accept an application or approve an invoice, and nobody but server code can
mark an invoice paid.

### How the app connects

`main.dart` calls `Supabase.initialize` with the URL and publishable key from
`lib/backend/supabase_config.dart`. Those two values are safe to ship. Never
put the database password or a secret/service-role key in the app. To point a
build at another project, override them:

```bash
flutter run -d chrome \
  --dart-define=SUPABASE_URL=https://<ref>.supabase.co \
  --dart-define=SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
```

Screens talk to the backend through `AuthService` in
`lib/backend/auth_service.dart`, so tests can pass a fake instead (see
`test/auth_page_test.dart`). Signing up sends the account type as metadata, and
a database trigger creates the matching profile:

```dart
await authService.signUp(
  email: email,
  password: password,
  fullName: name,
  role: AccountRole.brand,
  companyName: company,
);
```

Email confirmation is on, so new users must click the link Supabase emails them
before they can log in. Set where that link lands in the Supabase dashboard,
under **Authentication → URL Configuration**:

- **Site URL**: the address of the deployed web app.
- **Redirect URLs**: add `http://localhost:*` so links work during
  `flutter run -d chrome`.

Supabase's built-in email service only sends a few emails per hour and is meant
for testing. Set up your own SMTP server under **Authentication → Emails**
before launch.

Windows desktop builds need Windows Developer Mode turned on, because Flutter
plugins use symlinks there. Web, Android and iOS builds are unaffected.

To change the schema, add a new file to `supabase/migrations/` and apply it
with the [Supabase CLI](https://supabase.com/docs/guides/cli):

```bash
npx supabase link --project-ref tnevsivuemhlrlclpfuw
npx supabase db push
```
