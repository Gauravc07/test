# Brand ↔ creator marketplace (Instagram)

How brands and creators find each other and work together on Shor. The flow
follows the shape of established Indian influencer platforms such as
Kofluence: discovery, shortlists, campaign briefs, applications and invites
with quotes, content review before posting, verified live posts, reports,
invoices and chat. Pricing and commercial terms are Shor's own (10% fee on
invoices), and the platform covers **Instagram only** for now.

## The two journeys

**Brand**

1. **Find creators** (Creators tab). Search by name or handle and filter by
   niche, follower size, city and verified-only. Sort by followers,
   engagement or newest.
2. **Shortlist.** Save creators to private lists, then filter search by list.
3. **Write a brief** (Campaigns → New campaign). Set the goal, niche, what to
   post (reels, posts, carousels, stories), guidelines, what you offer (paid,
   barter, or paid plus product), payment per creator, whether creators may
   quote, number of creators, minimum followers, cities, an apply-by date
   and dates. Save as a draft or publish.
4. **Fill it.** An open campaign takes applications. Invite creators from
   search or a profile, with an offer and a chat message. An invite-only
   campaign is visible only to the creators you invite.
5. **Pick creators.** Read pitches and quotes, then accept or decline. Shor
   enforces the number of creators you asked for.
6. **Review the draft.** Approve it, or request changes with written feedback.
7. **Verify the live post.** The creator submits the Instagram link. Shor
   reads that post's views, reach, likes, comments, saves and shares from
   their connected account. Approve it to complete the collaboration.
8. **Report** (campaign → Report). See posts live, views, reach,
   interactions, engagement, spend, cost per view and cost per 1K reach.
9. **Pay** (Payments). Approve or reject the creator's invoice.

**Creator**

1. **Profile** (Profile tab). Name, handle, bio, up to 5 niches, city and
   rate range. Connect Instagram (Insights tab) for verified numbers.
2. **Find campaigns** (Campaigns tab). Live, open campaigns, filtered by
   niche and paid or barter, sorted by newest, highest pay or closing soon.
3. **Apply.** Write a pitch, and quote a price where the brand allows it.
   Or accept or decline an invitation.
4. **Create.** Submit a draft link (Drive, Dropbox…). Revise it if the brand
   asks for changes.
5. **Post.** Publish on Instagram, then submit the post link. The app tells
   the creator that this shares the post's insights with the brand.
6. **Get paid.** Request payment once the brand approves the post. The invoice
   shows Shor's 10% fee and what the creator receives.

Both sides can message each other from any collaboration or profile. Chat
updates live.

## Collaboration lifecycle

| Status | Meaning | Who moves it next |
|---|---|---|
| `invited` | Brand invited the creator | Creator accepts or declines. Brand can cancel |
| `applied` | Creator applied | Brand accepts or declines. Creator can withdraw |
| `accepted` | Hired; draft not submitted yet | Creator submits a draft (→ `in_progress`) |
| `in_progress` | Draft in review, approved, or being revised | Creator submits the live post (→ `awaiting_approval`) |
| `awaiting_approval` | Live post submitted | Brand approves (→ `completed`) or asks for changes (→ `in_progress`) |
| `completed` | Done | Creator requests payment, then the brand approves the invoice |
| `declined` / `cancelled` | Closed | Nobody |

These rules live in the database (`collaborations_guard` and the submission
triggers), not only in the app, so they hold for any client. For example:

- creators cannot accept their own application;
- a live post is only accepted after an approved draft, and it must be a real
  Instagram post or reel link (it is normalised and matched to the creator's
  synced posts);
- only one submission can wait for review at a time, and asking for changes
  requires feedback;
- applications close after the apply-by date, for invite-only campaigns, and
  for campaigns that are not live;
- fixed-price campaigns ignore a creator's quote;
- a brand cannot accept more creators than the slots it set.

## Who can see what

| Data | Visible to |
|---|---|
| Creator name, handle, bio, niches, city, rates, Instagram handle, follower count, engagement rate | Any signed-in user (the creator directory) |
| A creator's private Instagram insights (account metrics, audience, other posts) | Only that creator |
| Insights of a live post submitted to a campaign | The creator, and that campaign's brand |
| Campaigns | Live open campaigns: any signed-in user. Drafts and invite-only campaigns: the brand and the creators involved |
| Applications, submissions, invoices, messages | The brand and creator involved |
| Shortlists | Only the brand that made them |

The engagement rate in the directory is worked out from public like and
comment counts, so it reveals nothing private.

## Code

- `supabase/migrations/20261105000000_marketplace_workflow.sql`: brief fields,
  workflow rules, submissions, `campaign_live_posts()` report, `creator_directory` view.
- `lib/backend/marketplace_models.dart`, `marketplace_service.dart`: the data
  layer. Screens use the `MarketplaceService` interface, and tests use an
  in-memory fake (`test/support/fakes.dart`).
- `lib/screens/home_shell.dart`: the signed-in home with creator or brand tabs.
- `lib/screens/creator/`, `lib/screens/brand/`, `collaboration_page.dart`,
  `chat_page.dart`, `messages_tab.dart`: the screens.

## Not built yet

- **Collecting money and paying creators.** Invoices can be approved, but no
  payment gateway (e.g. Razorpay) or payouts are connected yet. Marking an
  invoice paid is reserved for server code.
- **Notifications** (email or push) for invites, applications and reviews.
- **Performance campaigns** that pay per click, install or sale, with tracking
  links.
- GST-ready invoice PDFs, contracts and e-signature, ratings, and an admin
  console for moderation and disputes.
- Opening the app from Instagram's redirect on Android or iOS (web works).
