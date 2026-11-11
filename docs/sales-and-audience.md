# Sales tracking, quality score, audience search and email

Built on 12 November 2026. Database rules are in
`20261112000000_sales_tracking.sql`, `20261112010000_creator_quality.sql` and
`20261112020000_mail_schedule.sql`.

## Sales tracking

**For brands, in the app**

1. Add a **landing page** to the campaign brief (optional; otherwise links go
   to the brand's website).
2. Every hired creator automatically gets a **tracked link**, for example
   `https://<site>/go/riya-glows-7k2q`. It's on the collaboration page for
   both sides.
3. On each collaboration, the brand can add the creator's **discount code**
   (created in their store first). Only the brand can set it.
4. In **Account → Store connection**, the brand connects Shopify or
   WooCommerce. The app walks them through it.

**How a sale is credited**

- The tracked link counts the click, then redirects with
  `utm_source=shor&utm_medium=influencer&utm_content=<code>&ref=shor_<code>`.
  Link-preview bots from WhatsApp, Instagram and Slack aren't counted.
- The store sends each order to the `store-webhook` Edge Function. It checks
  the store's HMAC signature, then credits the order:
  - to the creator whose **discount code** was used, or
  - to the creator whose **link ref** is in the landing page. Shopify records
    this; WooCommerce needs a plugin that saves the landing page.
- Orders that match no creator are **discarded, not stored**. A store
  sending the same order twice doesn't double count. Cancelled or refunded
  orders stop counting.
- The creator gets a "You drove a ₹1,199 sale" notification.

**Reports.** The campaign Report tab shows link clicks, orders, revenue,
return on spend and cost per order, and marks a "Top seller". All of it is in
the CSV export.

**Shopify setup (brand):** Settings → Notifications → Webhooks. Copy the
signing secret into Shor, then create two webhooks with Shor's URL in JSON
format: **Order creation** and **Order cancellation**.

**WooCommerce setup (brand):** Shor generates a secret. Then go to
WooCommerce → Settings → Advanced → Webhooks and add two webhooks with that
secret: **Order created** and **Order updated**.

**Not yet:** AppsFlyer, Branch and Singular app-install tracking, and a
Shopify App Store app that sets this up in one click. Webhooks work for any
store today, without Shopify's app review.

## Quality score

0–100, worked out after every Instagram sync and stored in `creator_stats`:

| Part | Points | Signal |
|---|---|---|
| Engagement | 40 | Likes plus comments per follower on the last 12 posts, against the typical rate for the account's size (4% for under 10K, 2.5% for under 100K, 1.5% for under 500K, 1% above). Full marks at 1.25× typical |
| Consistency | 20 | Posts in the last 90 days; full marks at 12 or more |
| Comment health | 20 | Comments as a share of likes. Bought likes rarely come with comments |
| Follower growth | 20 | Zero after a jump of more than 15% (over 1,000 followers) in one day |

It uses only numbers that are public on Instagram anyway, so it's shown for
every verified creator. Brands see the reasons, for example "Engagement 2.1x
typical for their size" or "Sudden follower jump on 3 Nov".

## Audience search

- Creators opt in on their profile under **Audience search** (off by
  default). The confirmation says exactly what brands will see.
- Brands can filter by mostly women, mostly men, mostly aged 18–34, mostly
  in India, and audience city. They can also filter by minimum quality and
  sort by quality.
- Only shares are shown: % women, % aged 18–34, % in India and top cities.
  Never individual followers.
- Turning it off, or disconnecting Instagram, removes the audience data
  immediately.

## Messages

- A red unread count on the Messages tab, in both the phone bar and the
  side rail, counts chats with unread messages.
- The chat list refreshes by itself when a message arrives.
- Message notifications are emailed if unread after 2 minutes, along with
  everything else.

## Email: going live

The code is complete and tested locally end to end: the schedule fires every
2 minutes, the function sends, and the email arrives. In production it needs
these steps once:

1. **Resend:** create an account, add and verify your domain (Resend shows
   the DNS records to add), and create an API key.
2. **Edge Function secrets:**
   ```bash
   npx supabase secrets set RESEND_API_KEY=re_... \
     EMAIL_FROM="Shor <notifications@yourdomain.in>" \
     APP_URL=https://<your site> CRON_SECRET=<long random string>
   npx supabase functions deploy notifications-email go store-webhook
   ```
3. **Vault secrets** (Supabase SQL editor). The schedule does nothing until
   both exist:
   ```sql
   select vault.create_secret('https://tnevsivuemhlrlclpfuw.supabase.co', 'shor_project_url');
   select vault.create_secret('<same CRON_SECRET>', 'shor_cron_secret');
   ```

New accounts get a welcome notification, emailed if they haven't opened the
app within 2 minutes.
