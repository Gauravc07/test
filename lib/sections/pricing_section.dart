import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

import '../config/app_config.dart';
import '../config/pricing.dart';
import '../screens/auth_page.dart';
import '../theme/app_colors.dart';
import '../theme/app_text.dart';
import '../utils/format.dart';
import '../utils/links.dart';
import '../utils/responsive.dart';
import '../widgets/app_buttons.dart';
import '../widgets/choice_toggle.dart';
import '../widgets/content_container.dart';
import '../widgets/editorial.dart';
import '../widgets/marketplace_widgets.dart';
import '../widgets/responsive_grid.dart';

/// Plans, deal fees and a calculator. On the landing page with
/// [showHeading]; inside the app on [PricingPage].
class PricingSection extends StatefulWidget {
  const PricingSection({
    super.key,
    this.showHeading = true,
    this.initialAudience = PlanAudience.brand,
    this.onStartFree,
    this.showPlans = true,
  });

  final bool showHeading;

  /// Subscription plans. Off in the phone apps: plans aren't sold yet, and
  /// the store apps must not show prices for things bought elsewhere or
  /// "coming soon" content. They show the deal fees, which are for
  /// services delivered outside the app.
  final bool showPlans;
  final PlanAudience initialAudience;

  /// What "Start free" does. Defaults to opening sign-up.
  final VoidCallback? onStartFree;

  @override
  State<PricingSection> createState() => _PricingSectionState();
}

class _PricingSectionState extends State<PricingSection> {
  late PlanAudience _audience = widget.initialAudience;
  var _period = BillingPeriod.monthly;

  bool get _brand => _audience == PlanAudience.brand;

  void _startFree() => widget.onStartFree != null
      ? widget.onStartFree!()
      : openAccount(context, mode: AuthMode.signUp);

  /// Paid plans aren't sold yet. On the web, brands can reserve the
  /// founding price by email. The mobile apps only show prices, so they
  /// never point to a purchase outside the app stores.
  VoidCallback? _reserve(Plan plan) {
    if (!kIsWeb) return null;
    return () => openInAppBrowser(
      Uri(
        scheme: 'mailto',
        path: AppConfig.supportEmail,
        queryParameters: {
          'subject': 'Reserve Shor ${plan.name}',
          'body':
              'I’d like to reserve the ${plan.name} plan'
              '${_brand ? ' at the founding price' : ''}.',
        },
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final r = context.sized;
    final plans = Plan.forAudience(_audience);
    final columns = context.responsive<int>(1, md: plans.length);

    return Container(
      color: AppColors.bgPrimary,
      padding: widget.showHeading
          ? sectionPadding(context)
          : EdgeInsets.symmetric(horizontal: r(16, sm: 24), vertical: 24),
      child: ContentContainer(
        maxWidth: 1120,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            if (widget.showHeading) ...[
              const SectionHeading(
                title: 'Simple pricing that pays creators first',
                subtitle:
                    'Creators keep more of every deal. Brands pay one clear '
                    'price with no agency markup.',
              ),
              SizedBox(height: r(32, md: 48)),
            ],
            Wrap(
              alignment: WrapAlignment.center,
              spacing: 12,
              runSpacing: 12,
              children: [
                ChoiceToggle<PlanAudience>(
                  options: const {
                    PlanAudience.brand: 'For brands',
                    PlanAudience.creator: 'For creators',
                  },
                  selected: _audience,
                  onChanged: (v) => setState(() => _audience = v),
                ),
                if (widget.showPlans)
                  ChoiceToggle<BillingPeriod>(
                    options: const {
                      BillingPeriod.monthly: 'Monthly',
                      BillingPeriod.annual: 'Yearly, save more',
                    },
                    selected: _period,
                    onChanged: (v) => setState(() => _period = v),
                  ),
              ],
            ),
            const SizedBox(height: 24),
            if (widget.showPlans) ...[
              if (_brand) ...[
                const _FoundingBanner(),
                const SizedBox(height: 24),
              ],
              ResponsiveGrid(
                columns: columns,
                spacing: 20,
                children: [
                  for (final p in plans)
                    _PlanCard(
                      plan: p,
                      period: _period,
                      founding: _brand,
                      onStartFree: _startFree,
                      onReserve: _reserve(p),
                    ),
                ],
              ),
              SizedBox(height: r(40, md: 56)),
            ],
            _DealFees(brand: _brand),
            const SizedBox(height: 24),
            const _CalculatorCard(),
            const SizedBox(height: 16),
            Text(
              widget.showPlans
                  ? 'Prices are before 18% GST. Payments through Shor are '
                        'launching soon. Until then, brands and creators settle '
                        'payment directly.'
                  : 'Fees are before 18% GST. Brands pay creators directly and '
                        'Shor invoices its fee.',
              textAlign: TextAlign.center,
              style: AppText.sans(size: 13, color: AppColors.textMuted),
            ),
          ],
        ),
      ),
    );
  }
}

/// Pricing pushed from inside the app.
class PricingPage extends StatelessWidget {
  const PricingPage({super.key, this.audience = PlanAudience.brand});

  final PlanAudience audience;

  @override
  Widget build(BuildContext context) {
    return ShorPage(
      title: kIsWeb ? 'Plans and pricing' : 'Fees',
      body: SingleChildScrollView(
        child: PricingSection(
          showHeading: false,
          showPlans: kIsWeb,
          initialAudience: audience,
          onStartFree: () => Navigator.of(context).maybePop(),
        ),
      ),
    );
  }
}

class _FoundingBanner extends StatelessWidget {
  const _FoundingBanner();

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 14),
      decoration: BoxDecoration(
        color: AppColors.navy,
        borderRadius: BorderRadius.circular(10),
      ),
      child: Row(
        children: [
          const Icon(Icons.workspace_premium_outlined, color: Colors.white),
          const SizedBox(width: 12),
          Expanded(
            child: Text.rich(
              TextSpan(
                children: [
                  TextSpan(
                    text: 'Founding brand offer: ',
                    style: AppText.sans(
                      size: 14,
                      weight: FontWeight.w700,
                      color: Colors.white,
                    ),
                  ),
                  TextSpan(
                    text:
                        '${Pricing.percent(Pricing.foundingDiscount)} off any '
                        'paid plan for life. Only for the first '
                        '${Pricing.foundingBrandSpots} brands.',
                    style: AppText.sans(size: 14, color: AppColors.white(0.85)),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _PlanCard extends StatelessWidget {
  const _PlanCard({
    required this.plan,
    required this.period,
    required this.founding,
    required this.onStartFree,
    required this.onReserve,
  });

  final Plan plan;
  final BillingPeriod period;
  final bool founding;
  final VoidCallback onStartFree;
  final VoidCallback? onReserve;

  @override
  Widget build(BuildContext context) {
    final annual = period == BillingPeriod.annual;
    final price = plan.price(period);
    final unit = annual ? '/year' : '/month';
    final showFounding = founding && !plan.free;

    return Container(
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        color: AppColors.bgCard,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(
          color: plan.highlight ? AppColors.accent : AppColors.border,
          width: plan.highlight ? 2 : 1,
        ),
        boxShadow: [
          BoxShadow(
            color: AppColors.navyAlpha(0.05),
            blurRadius: 24,
            offset: const Offset(0, 10),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Expanded(
                child: Text(
                  plan.name,
                  style: AppText.serif(
                    size: 22,
                    weight: FontWeight.w700,
                    color: AppColors.textPrimary,
                    height: 1.2,
                  ),
                ),
              ),
              if (plan.highlight)
                const StatusChip('Most popular', tone: Tone.info),
            ],
          ),
          const SizedBox(height: 6),
          Text(
            plan.tagline,
            style: AppText.sans(size: 14, color: AppColors.textSecondary),
          ),
          const SizedBox(height: 20),
          if (plan.free)
            Text('Free', style: AppText.heading(36))
          else if (showFounding) ...[
            Text(
              formatMoney(price),
              style: AppText.sans(
                size: 15,
                color: AppColors.textMuted,
              ).copyWith(decoration: TextDecoration.lineThrough),
            ),
            _Price(amount: plan.foundingPrice(period), unit: unit),
            Text(
              'Founding price, locked for life',
              style: AppText.sans(size: 12, color: AppColors.accent),
            ),
          ] else
            _Price(amount: price, unit: unit),
          if (annual && plan.monthsFree > 0) ...[
            const SizedBox(height: 4),
            Text(
              '${plan.monthsFree} months free',
              style: AppText.sans(
                size: 12,
                weight: FontWeight.w600,
                color: const Color(0xFF166534),
              ),
            ),
          ],
          const SizedBox(height: 20),
          for (final f in plan.features)
            Padding(
              padding: const EdgeInsets.only(bottom: 10),
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Icon(
                    Icons.check_circle,
                    size: 18,
                    color: AppColors.accent,
                  ),
                  const SizedBox(width: 10),
                  Expanded(
                    child: Text(
                      f,
                      style: AppText.sans(
                        size: 14,
                        color: AppColors.textSecondary,
                      ),
                    ),
                  ),
                ],
              ),
            ),
          const SizedBox(height: 12),
          if (plan.free)
            SolidButton(
              label: 'Start free',
              fullWidth: true,
              onPressed: onStartFree,
            )
          else if (onReserve != null)
            OutlineActionButton(
              label: founding ? 'Reserve founding price' : 'Join the waitlist',
              fullWidth: true,
              onPressed: onReserve!,
            )
          else
            const StatusChip('Coming soon'),
        ],
      ),
    );
  }
}

class _Price extends StatelessWidget {
  const _Price({required this.amount, required this.unit});

  final int amount;
  final String unit;

  @override
  Widget build(BuildContext context) {
    // Wraps instead of overflowing when a yearly price fills a narrow card.
    return Wrap(
      crossAxisAlignment: WrapCrossAlignment.end,
      spacing: 4,
      children: [
        Text(formatMoney(amount), style: AppText.heading(36)),
        Padding(
          padding: const EdgeInsets.only(bottom: 7),
          child: Text(
            '$unit + GST',
            style: AppText.sans(size: 13, color: AppColors.textMuted),
          ),
        ),
      ],
    );
  }
}

/// The per-deal fees, written for whoever is reading.
class _DealFees extends StatelessWidget {
  const _DealFees({required this.brand});

  final bool brand;

  @override
  Widget build(BuildContext context) {
    final points = brand
        ? [
            (
              Icons.shield_outlined,
              '${Pricing.percent(Pricing.brandFeeRate)} Shor Protection per deal',
              'On top of the creator’s fee. Covers verified Instagram stats, '
                  'safe payment and a GST invoice you can claim credit on. '
                  'Agencies usually charge 15 to 20%.',
            ),
            (
              Icons.card_giftcard_outlined,
              'Barter campaigns: ₹${Pricing.barterCampaignFee} flat',
              Pricing.barterFeeWaived
                  ? 'Free during early access.'
                  : 'Per campaign, however many creators join.',
            ),
          ]
        : [
            (
              Icons.celebration_outlined,
              'Your first ${Pricing.creatorFreeDeals} deals are free',
              'No Shor fee at all. You keep 100% of what the brand agreed.',
            ),
            (
              Icons.percent,
              'Then ${Pricing.percent(Pricing.creatorFeeRate)} per deal',
              'Shown before you send an invoice, so there are no surprises.',
            ),
            (
              Icons.bolt_outlined,
              'Paid within ${Pricing.payoutWorkingDays} working days',
              'Once the brand approves your post, the money goes to your bank. '
                  'No chasing invoices for 90 days.',
            ),
          ];

    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        Text(
          brand ? 'What each deal costs' : 'What you pay per deal',
          textAlign: TextAlign.center,
          style: AppText.serif(
            size: 26,
            weight: FontWeight.w700,
            color: AppColors.textPrimary,
            height: 1.2,
          ),
        ),
        const SizedBox(height: 20),
        ResponsiveGrid(
          columns: context.responsive<int>(1, md: points.length),
          spacing: 16,
          children: [
            for (final (icon, title, body) in points)
              PaperCard(
                shadow: false,
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Icon(icon, color: AppColors.accent),
                    const SizedBox(height: 10),
                    Text(
                      title,
                      style: AppText.sans(size: 16, weight: FontWeight.w700),
                    ),
                    const SizedBox(height: 6),
                    Text(
                      body,
                      style: AppText.sans(
                        size: 14,
                        color: AppColors.textSecondary,
                        height: 1.5,
                      ),
                    ),
                  ],
                ),
              ),
          ],
        ),
      ],
    );
  }
}

/// Type a deal amount, see what the brand pays and the creator receives.
class _CalculatorCard extends StatefulWidget {
  const _CalculatorCard();

  @override
  State<_CalculatorCard> createState() => _CalculatorCardState();
}

class _CalculatorCardState extends State<_CalculatorCard> {
  static const _presets = [5000, 20000, 50000];
  final _amount = TextEditingController(text: '20000');
  var _freeDeal = false;

  @override
  void dispose() {
    _amount.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final amount = num.tryParse(_amount.text.trim()) ?? 0;
    final q = DealQuote.of(amount, freeDeal: _freeDeal);
    final wide = context.isMd;

    final brandSide = _Breakdown(
      key: const Key('calc-brand'),
      heading: 'Brand pays',
      total: q.brandPays,
      lines: [
        ('Creator’s fee', q.amount),
        (
          'Shor Protection, ${Pricing.percent(Pricing.brandFeeRate)}',
          q.brandFee,
        ),
        ('GST on Shor Protection', q.brandFeeGst),
      ],
    );
    final creatorSide = _Breakdown(
      key: const Key('calc-creator'),
      heading: 'Creator receives',
      total: q.creatorReceives,
      lines: [
        ('Agreed fee', q.amount),
        (
          q.freeDeal
              ? 'Shor fee, free deal'
              : 'Shor fee, ${Pricing.percent(q.creatorFeeRate)}',
          -q.creatorFee,
        ),
      ],
    );

    return PaperCard(
      padding: EdgeInsets.all(context.sized(20, md: 28)),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Text(
            'Work out a deal',
            style: AppText.serif(
              size: 22,
              weight: FontWeight.w700,
              color: AppColors.textPrimary,
              height: 1.2,
            ),
          ),
          const SizedBox(height: 14),
          Wrap(
            spacing: 10,
            runSpacing: 10,
            crossAxisAlignment: WrapCrossAlignment.center,
            children: [
              SizedBox(
                width: 200,
                child: TextField(
                  key: const Key('calc-amount'),
                  controller: _amount,
                  keyboardType: TextInputType.number,
                  inputFormatters: [FilteringTextInputFormatter.digitsOnly],
                  decoration: const InputDecoration(
                    labelText: 'Creator’s fee (₹)',
                  ),
                  onChanged: (_) => setState(() {}),
                ),
              ),
              for (final p in _presets)
                ChoiceChip(
                  label: Text(formatMoney(p)),
                  selected: amount == p,
                  onSelected: (_) => setState(() => _amount.text = '$p'),
                ),
            ],
          ),
          SwitchListTile(
            contentPadding: EdgeInsets.zero,
            title: Text(
              'One of the creator’s first ${Pricing.creatorFreeDeals} deals',
              style: AppText.sans(size: 14),
            ),
            value: _freeDeal,
            onChanged: (v) => setState(() => _freeDeal = v),
          ),
          const SizedBox(height: 8),
          if (wide)
            Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Expanded(child: brandSide),
                const SizedBox(width: 20),
                Expanded(child: creatorSide),
              ],
            )
          else ...[
            brandSide,
            const SizedBox(height: 16),
            creatorSide,
          ],
        ],
      ),
    );
  }
}

class _Breakdown extends StatelessWidget {
  const _Breakdown({
    super.key,
    required this.heading,
    required this.total,
    required this.lines,
  });

  final String heading;
  final num total;
  final List<(String, num)> lines;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.bgSecondary,
        borderRadius: BorderRadius.circular(10),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Text(heading, style: AppText.label()),
          const SizedBox(height: 4),
          Text(formatMoney(total), style: AppText.heading(30)),
          const SizedBox(height: 10),
          for (final (label, value) in lines)
            Padding(
              padding: const EdgeInsets.only(top: 4),
              child: Row(
                children: [
                  Expanded(
                    child: Text(
                      label,
                      style: AppText.sans(
                        size: 13,
                        color: AppColors.textSecondary,
                      ),
                    ),
                  ),
                  Text(
                    formatMoney(value),
                    style: AppText.sans(size: 13, weight: FontWeight.w600),
                  ),
                ],
              ),
            ),
        ],
      ),
    );
  }
}
