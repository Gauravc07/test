# Payments with Razorpay: plan and process

Last checked against Razorpay's documentation: 10 November 2026.

## The decision in short

- **Target setup: Razorpay Route.** The brand pays Shor once. Route sends the
  creator's share to the creator's own bank account and keeps Shor's fees in
  Shor's account. Shor never pays creators out of its own balance.
- **Route has an entry bar.** Razorpay only enables Route for businesses with
  more than ₹40 lakh domestic turnover in FY25 or FY26, proven with GST-3B
  returns, and a written description of the use case. A new Shor company
  probably doesn't meet this yet. Ask Razorpay before building on it.
- **So we build in two phases.** Phase 1 works with a standard Razorpay
  account from day one. Phase 2 switches on Route once Shor qualifies.

## Fees we charge

Already built: see [marketplace-workflow.md](marketplace-workflow.md#fees).

| Who | Fee |
|---|---|
| Brand | Creator's fee + 7% Shor Protection + 18% GST on the 7% |
| Creator | 0% on the first 3 deals, then 5% |

Every invoice row already stores `gross_amount`, `platform_fee`,
`net_amount`, `brand_fee`, `brand_fee_gst` and `brand_total`. Payments only
need to move these amounts.

## What Razorpay costs Shor

| Item | Cost | Notes |
|---|---|---|
| Domestic cards, UPI, net banking | About 2% + 18% GST | Standard plan. Negotiable at volume |
| Route | Custom, on top of the gateway fee | Get it in writing from Razorpay sales |
| Setup or monthly fee | None on the standard plan | |

On a ₹20,000 deal the brand pays ₹21,652. At 2% plus GST the gateway costs
about ₹511, which comes out of Shor's ₹2,400 in fees.

## Phase 1: collect Shor's fee only

Works with a normal Razorpay account, no Route needed.

1. The brand approves the invoice and pays the creator directly by UPI or
   bank transfer, as today.
2. Shor collects the brand's Shor Protection plus GST through Razorpay
   Standard Checkout.
3. While Shor can't deduct anything from creators, waive the creator fee:
   market it as "0% for creators during early access".
4. The brand confirms in the app that they paid the creator. The creator
   confirms they received it.

Build:

- **Edge Function `payments-order`**: checks the signed-in brand owns the
  approved invoice, then creates a Razorpay order for `brand_fee + brand_fee_gst`
  in paise, with the invoice ID in `notes`.
- **Checkout**: the `razorpay_flutter` plugin on Android and iOS, and
  Razorpay's `checkout.js` on the web.
- **Edge Function `payments-webhook`**: verifies the `X-Razorpay-Signature`
  header, an HMAC-SHA256 of the raw body with the webhook secret, the same way
  `instagram-meta` verifies Meta. On `payment.captured`, it records a
  `transactions` row. Never trust the app to say a payment succeeded.

## Phase 2: Razorpay Route

1. **Onboard creators as linked accounts.** A creator adds their PAN and bank
   account once, from their Profile. An Edge Function creates the linked
   account through Razorpay's Linked Account API and stores only its
   `acc_...` ID. Razorpay runs the creator's KYC. New linked accounts have a
   24-hour cooling period before they can receive transfers.
2. **Collect from the brand.** When the brand approves an invoice, the
   `payments-order` function creates an order for `brand_total`, with a
   transfers array that sends `net_amount` to the creator's linked account.
   Orders with transfers must be INR and must not allow partial payments.
3. **Release.** Route creates the transfer automatically once the order is
   paid. The `transfer.processed` webhook marks the invoice `paid` and writes
   the payout to `transactions`.
4. **Settlement.** Razorpay settles to the creator in its next settlement
   slot, about T+3. That's why the app promises payment within 3 working
   days, not 48 hours.
5. **Later, escrow at hire.** Collect when the brand hires the creator and
   put the transfer on hold. Release it when the brand approves the live
   post. This protects creators best, but needs refund and dispute handling,
   so do it after the basic flow works.
6. **Refunds.** If a deal is cancelled, reverse the transfer first, then
   refund the brand.

## Database changes needed

- `payout_accounts`: creator ID, Razorpay linked account ID, KYC status. Only
  the creator can read their own row. Only server code writes it.
- `payment_orders`: invoice ID, Razorpay order ID, amount, status.
- Reuse `transactions` for collections, payouts and refunds. It is already
  write-protected from the app.

## Secrets

```bash
npx supabase secrets set \
  RAZORPAY_KEY_ID=rzp_test_... \
  RAZORPAY_KEY_SECRET=... \
  RAZORPAY_WEBHOOK_SECRET=...
```

The key secret and webhook secret stay in Supabase. The app only ever gets
the public key ID.

## Getting the account

1. Sign up at razorpay.com with Shor's business PAN, current account and GST
   number. Test keys work straight away, before KYC finishes.
2. Ask Razorpay sales two things in writing: whether Shor qualifies for
   Route, and what Route costs.
3. In the Razorpay Dashboard, add the webhook URL
   `https://tnevsivuemhlrlclpfuw.supabase.co/functions/v1/payments-webhook`
   with the events `payment.captured`, `payment.failed`, `order.paid` and,
   for Route, `transfer.processed`.

## Check with a chartered accountant before going live

- GST on Shor's fees, and whether Shor must collect TCS under GST section 52.
- TDS under income tax section 194-O on payments to creators.
- Whether Phase 1, where the brand pays the creator directly, needs any
  change to the invoices Shor issues.

## Sources

- [Razorpay Route overview and eligibility](https://razorpay.com/docs/payments/route.md)
- [Transfer funds to linked accounts](https://razorpay.com/docs/build/llm-docs/payments/route/transfer-funds-to-linked-accounts.md)
- [Create linked account API](https://razorpay.com/docs/build/llm-docs/api/payments/route/create-linked-account.md)
- [Razorpay Route FAQs](https://razorpay.com/docs/payments/route/faqs.md)
