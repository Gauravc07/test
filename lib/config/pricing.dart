/// Shor's pricing, in one place.
///
/// Deal fees mirror the database (supabase/migrations/20261110000000_split_pricing.sql),
/// which is the source of truth: the app uses these only to preview amounts
/// before an invoice exists. Plans are shown on the pricing page; they are
/// not sold in the app yet.
class Pricing {
  Pricing._();

  /// "Shor Protection": paid by the brand on top of the creator's fee.
  static const brandFeeRate = 0.07;

  /// Taken from the creator's payout once their free deals are used up.
  static const creatorFeeRate = 0.05;

  /// Deals a new creator does with no Shor fee.
  static const creatorFreeDeals = 3;

  /// GST on Shor's own fee.
  static const gstRate = 0.18;

  /// Flat fee per barter campaign, where no money changes hands.
  static const barterCampaignFee = 499;

  /// Barter campaigns are free while Shor is in early access.
  static const barterFeeWaived = true;

  /// Working days from the brand's approval to the money reaching the
  /// creator. Razorpay Route settles to linked accounts in its next
  /// settlement slot, about T+3.
  static const payoutWorkingDays = 3;

  /// Founding brands lock in this discount for life.
  static const foundingDiscount = 0.5;
  static const foundingBrandSpots = 100;

  /// 0.07 as "7%", 0.025 as "2.5%". Rounds away float noise like 7.0000001.
  static String percent(num rate) {
    final tenths = (rate * 1000).round();
    return tenths % 10 == 0 ? '${tenths ~/ 10}%' : '${tenths / 10}%';
  }
}

/// What each side pays and receives on one deal.
class DealQuote {
  const DealQuote._({
    required this.amount,
    required this.creatorFee,
    required this.creatorFeeRate,
    required this.brandFee,
    required this.brandFeeGst,
  });

  /// [amount] is the creator's agreed fee. [freeDeal] waives the creator fee.
  factory DealQuote.of(
    num amount, {
    bool freeDeal = false,
    num creatorFeeRate = Pricing.creatorFeeRate,
    num brandFeeRate = Pricing.brandFeeRate,
    num gstRate = Pricing.gstRate,
  }) {
    final rate = freeDeal ? 0 : creatorFeeRate;
    final brandFee = _round(amount * brandFeeRate);
    return DealQuote._(
      amount: amount,
      creatorFee: _round(amount * rate),
      creatorFeeRate: rate,
      brandFee: brandFee,
      brandFeeGst: _round(brandFee * gstRate),
    );
  }

  final num amount;
  final num creatorFee;
  final num creatorFeeRate;
  final num brandFee;
  final num brandFeeGst;

  bool get freeDeal => creatorFeeRate == 0;
  num get creatorReceives => amount - creatorFee;
  num get brandPays => amount + brandFee + brandFeeGst;

  static num _round(num v) => (v * 100).round() / 100;
}

/// The signed-in user's current fee terms, from the server.
class FeeTerms {
  const FeeTerms({
    this.brandFeeRate = Pricing.brandFeeRate,
    this.creatorFeeRate = Pricing.creatorFeeRate,
    this.gstRate = Pricing.gstRate,
    this.freeDealsTotal = Pricing.creatorFreeDeals,
    this.freeDealsLeft = Pricing.creatorFreeDeals,
  });

  factory FeeTerms.fromRow(Map<String, dynamic> r) {
    num? n(Object? v) => v is num ? v : num.tryParse('$v');
    return FeeTerms(
      brandFeeRate: n(r['brand_fee_rate']) ?? Pricing.brandFeeRate,
      creatorFeeRate: n(r['creator_fee_rate']) ?? Pricing.creatorFeeRate,
      gstRate: n(r['gst_rate']) ?? Pricing.gstRate,
      freeDealsTotal:
          n(r['free_deals_total'])?.toInt() ?? Pricing.creatorFreeDeals,
      freeDealsLeft: n(r['free_deals_left'])?.toInt() ?? 0,
    );
  }

  final num brandFeeRate;
  final num creatorFeeRate;
  final num gstRate;
  final int freeDealsTotal;
  final int freeDealsLeft;

  /// The quote for the creator's next invoice.
  DealQuote quote(num amount) => DealQuote.of(
    amount,
    freeDeal: freeDealsLeft > 0,
    creatorFeeRate: creatorFeeRate,
    brandFeeRate: brandFeeRate,
    gstRate: gstRate,
  );
}

enum PlanAudience { brand, creator }

enum BillingPeriod { monthly, annual }

class Plan {
  const Plan({
    required this.audience,
    required this.name,
    required this.tagline,
    required this.monthly,
    required this.features,
    this.highlight = false,
    this.annualPrice,
  });

  final PlanAudience audience;
  final String name;
  final String tagline;

  /// Monthly price in rupees, before GST. 0 for free plans.
  final int monthly;
  final List<String> features;

  /// Shown as the recommended plan.
  final bool highlight;

  bool get free => monthly == 0;

  /// Annual price when it isn't simply 10 months' worth.
  final int? annualPrice;

  /// Annual billing: pay for 10 months, get 12, unless set otherwise.
  int get annual => annualPrice ?? monthly * 10;

  /// Months saved by paying yearly.
  int get monthsFree => free ? 0 : 12 - (annual / monthly).ceil();

  int price(BillingPeriod period) =>
      period == BillingPeriod.monthly ? monthly : annual;

  /// Founding-member price for brands.
  int foundingPrice(BillingPeriod period) =>
      (price(period) * (1 - Pricing.foundingDiscount)).round();

  static const all = [
    Plan(
      audience: PlanAudience.brand,
      name: 'Starter',
      tagline: 'Run your first campaign',
      monthly: 0,
      features: [
        '1 active campaign',
        'Search creators with verified stats',
        'Payment held safely until you approve',
        'GST invoice for every deal',
      ],
    ),
    Plan(
      audience: PlanAudience.brand,
      name: 'Growth',
      tagline: 'For D2C brands running monthly campaigns',
      monthly: 2999,
      highlight: true,
      features: [
        'Unlimited campaigns',
        'Audience age, gender and city for every creator',
        'Campaign reports with reach, views and saves',
        'Shortlists and bulk invites',
      ],
    ),
    Plan(
      audience: PlanAudience.brand,
      name: 'Pro',
      tagline: 'For agencies and larger teams',
      monthly: 7999,
      features: [
        'Everything in Growth',
        'Team seats',
        'Exportable reports for clients',
        'Priority support',
      ],
    ),
    Plan(
      audience: PlanAudience.creator,
      name: 'Free',
      tagline: 'Everything you need to get paid',
      monthly: 0,
      features: [
        'Apply to unlimited campaigns',
        'No Shor fee on your first 3 deals',
        'Paid to your bank within 3 working days of approval',
        'GST and TDS-ready invoices',
        'Shareable media kit with verified stats',
      ],
    ),
    Plan(
      audience: PlanAudience.creator,
      name: 'Creator Pro',
      tagline: 'Get noticed by more brands',
      monthly: 199,
      annualPrice: 1499,
      highlight: true,
      features: [
        'Featured in brand search',
        'Verified creator badge',
        'Media kit PDF from your real insights',
        'See what similar creators charge',
      ],
    ),
  ];

  static List<Plan> forAudience(PlanAudience a) =>
      all.where((p) => p.audience == a).toList();
}
