# Notifications, reviews, media kits and campaign reports

Built on 11 November 2026. Database rules are in three migrations:
`20261111000000_notifications.sql`, `20261111010000_reviews.sql` and
`20261111020000_media_kit.sql`.

## Notifications

**How it works.** Database triggers write a notification whenever someone
needs to act. The app can only read its own notifications and mark them
read. Nobody can create one from the app.

| Event | Who is told |
|---|---|
| Brand invites a creator | Creator |
| Creator applies | Brand |
| Application accepted or declined | Creator |
| Invitation accepted or declined, application withdrawn | Brand |
| Collaboration cancelled by the brand | Creator |
| Draft or live post sent | Brand |
| Draft or live post approved, or changes requested | Creator |
| Invoice raised | Brand, with the total they pay |
| Invoice approved, declined or paid | Creator, with what they receive |
| New message | The other person. One notification per chat, updated with the latest message, and cleared when they open the chat |
| Review left | The person reviewed |

People who blocked each other aren't notified about each other.

**In the app:** a bell in the top bar on phones and in the side rail on
wide screens, with an unread count. Tap a notification to open the
collaboration or chat.

**Email:** the `notifications-email` Edge Function sends anything still
unread after 2 minutes. Everything for one person goes in one email.
People can turn emails off in Help and settings → Email notifications.

### Turn on email in production

1. Create a [Resend](https://resend.com) account and verify your sending
   domain. Resend's free plan covers 3,000 emails a month.
2. Set the secrets and deploy the function:
   ```bash
   npx supabase secrets set \
     RESEND_API_KEY=re_... \
     EMAIL_FROM="Shor <notifications@yourdomain.in>" \
     APP_URL=https://<your-web-app> \
     CRON_SECRET=<same secret as the Instagram sync>
   npx supabase functions deploy notifications-email
   ```
3. Run it every 2 minutes. In the SQL editor, with `pg_cron` and `pg_net`
   on, and the cron secret already in Vault as `instagram_cron_secret`:
   ```sql
   select cron.schedule('notification-emails', '*/2 * * * *', $$
     select net.http_post(
       url := 'https://tnevsivuemhlrlclpfuw.supabase.co/functions/v1/notifications-email',
       headers := jsonb_build_object(
         'Content-Type', 'application/json',
         'x-cron-secret', (select decrypted_secret from vault.decrypted_secrets
                           where name = 'instagram_cron_secret')),
       body := '{}'::jsonb)
   $$);
   ```

Without `RESEND_API_KEY` the function sends nothing, and notifications
appear in the app only.

### Test email locally

```bash
printf 'CRON_SECRET=local-cron\nAPP_URL=http://localhost:5050\nMAILPIT_URL=http://supabase_inbucket_shor:8025\n' > .env.local
npx supabase functions serve --env-file .env.local
curl -X POST http://127.0.0.1:54321/functions/v1/notifications-email -H "x-cron-secret: local-cron"
```

Emails arrive in the local inbox at http://127.0.0.1:54324. Nothing is
sent unless you call the function, because there's no cron job locally.

## Reviews

- Brand and creator can rate each other, 1 to 5 stars with an optional
  comment, once the collaboration is complete. One review each, which
  can't be edited or deleted.
- **Double-blind:** a review stays hidden from everyone but its author
  until the other side reviews too, or 14 days pass. This stops anyone
  waiting to see a bad rating and retaliating.
- Ratings show in creator search results (`creator_directory`) and on
  creator profiles. Brand reviews show to creators on campaign pages.
  Both appear on media kits.
- Comments go through the same offensive-words filter as messages.

## Media kit

- A public page at `/kit/<handle>` showing the creator's verified
  followers, their average views, reach and engagement over the last 90
  days, their top 6 recent posts, their audience's gender, age and top
  cities, their rates, completed deals and reviews.
- **Off by default.** The creator turns it on in Profile → Media kit,
  after a confirmation that lists exactly what becomes public. Creators
  can preview their own kit while it's private.
- The page reads live data and keeps no copy. Turning it off, or
  disconnecting Instagram, removes the data straight away.
- `vercel.json` rewrites `/kit/:handle` to the Flutter app.
- **Meta App Review:** say in your submission that creators can choose to
  share their own insights publicly through their media kit. Meta allows
  this with the user's consent, but reviewers ask how insights are used.

## Campaign reports

On the brand's campaign page, the **Report** tab shows:

- totals for views, reach, engagement, saves and shares
- the total cost, using invoice totals (fee + Shor Protection + GST) where
  invoiced and agreed fees otherwise
- cost per 1,000 views
- each creator's share of views
- a card per creator, marked **Most views** and **Best value** (lowest
  cost per 1,000 views)
- **Copy as CSV**, which copies a spreadsheet of the results to paste into
  Excel or Google Sheets.

The numbers live in `lib/backend/campaign_report.dart`, which has no UI
code, so they can be tested on their own.

## Tests

- `test/engagement_test.dart`: report numbers and CSV, media kit parsing
  and page, notifications inbox, email setting and double-blind reviews.
- `supabase/functions/tests/email_test.ts`: email grouping, rendering and
  escaping.
- The database rules were checked end to end against a local Supabase
  database: who gets which notification, read-only notifications,
  double-blind reviews, media kit privacy for visitors, and the email
  queue.
