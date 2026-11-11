import 'package:flutter/material.dart';

import '../theme/app_colors.dart';
import '../theme/app_text.dart';
import '../utils/responsive.dart';
import '../widgets/app_buttons.dart';
import '../widgets/coming_soon.dart';
import '../widgets/content_container.dart';
import '../widgets/editorial.dart';
import '../widgets/responsive_grid.dart';

/// Navy band: "Grow your sales now" pitch beside a browser-window dashboard.
class DashboardPreviewSection extends StatelessWidget {
  const DashboardPreviewSection({super.key});

  @override
  Widget build(BuildContext context) {
    final r = context.sized;
    final wide = context.isLg;

    final pitch = Column(
      crossAxisAlignment: wide
          ? CrossAxisAlignment.start
          : CrossAxisAlignment.center,
      children: [
        Text(
          'Grow your sales now',
          textAlign: wide ? TextAlign.left : TextAlign.center,
          style: AppText.heading(
            r(34, sm: 40, md: 48, lg: 56),
            color: Colors.white,
          ),
        ),
        SizedBox(height: r(16, sm: 24)),
        ConstrainedBox(
          constraints: const BoxConstraints(maxWidth: 520),
          child: Text(
            'Gain invaluable predictive analytics and actionable insights empowering you to '
            'make data-driven decisions.',
            textAlign: wide ? TextAlign.left : TextAlign.center,
            style: AppText.serif(
              size: r(16, md: 18),
              color: AppColors.white(0.7),
              height: 1.7,
            ),
          ),
        ),
        SizedBox(height: r(24, sm: 32)),
        OutlineActionButton(
          label: 'Explore All Tools',
          onDark: true,
          trailingIcon: Icons.arrow_forward,
          onPressed: () => showComingSoon(context, 'Marketplace'),
        ),
      ],
    );

    return Container(
      color: AppColors.navy,
      padding: sectionPadding(context),
      child: ContentContainer(
        maxWidth: 1120,
        child: wide
            ? Row(
                children: [
                  Expanded(child: pitch),
                  const SizedBox(width: 56),
                  const Expanded(child: _BrowserMock()),
                ],
              )
            : Column(
                children: [
                  pitch,
                  const SizedBox(height: 40),
                  const _BrowserMock(),
                ],
              ),
      ),
    );
  }
}

class _BrowserMock extends StatelessWidget {
  const _BrowserMock();

  @override
  Widget build(BuildContext context) {
    final r = context.sized;
    return Container(
      clipBehavior: Clip.antiAlias,
      decoration: BoxDecoration(
        color: AppColors.bgCard,
        borderRadius: BorderRadius.circular(12),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.35),
            blurRadius: 50,
            offset: const Offset(0, 25),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          // Browser title bar.
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
            decoration: const BoxDecoration(
              color: AppColors.bgPrimary,
              border: Border(bottom: BorderSide(color: AppColors.border)),
            ),
            child: Row(
              children: [
                for (var i = 0; i < 3; i++)
                  Container(
                    width: 10,
                    height: 10,
                    margin: const EdgeInsets.only(right: 6),
                    decoration: const BoxDecoration(
                      color: AppColors.borderStrong,
                      shape: BoxShape.circle,
                    ),
                  ),
                if (context.isSm)
                  Expanded(
                    child: Container(
                      margin: const EdgeInsets.only(left: 10),
                      padding: const EdgeInsets.symmetric(
                        horizontal: 12,
                        vertical: 4,
                      ),
                      decoration: BoxDecoration(
                        color: AppColors.bgCard,
                        borderRadius: BorderRadius.circular(4),
                        border: Border.all(color: AppColors.border),
                      ),
                      child: Text(
                        'example@shor.com',
                        style: AppText.sans(
                          size: 12,
                          color: AppColors.textMuted,
                        ),
                      ),
                    ),
                  ),
              ],
            ),
          ),
          // Dashboard body.
          Padding(
            padding: EdgeInsets.all(r(14, sm: 20)),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                Row(
                  children: [
                    Container(
                      width: 32,
                      height: 32,
                      decoration: BoxDecoration(
                        color: AppColors.accent,
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: const Icon(
                        Icons.bolt,
                        color: Colors.white,
                        size: 17,
                      ),
                    ),
                    const SizedBox(width: 10),
                    // Shrinks on very narrow screens instead of overflowing.
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'Dashboard',
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                            style: AppText.serif(
                              size: 16,
                              weight: FontWeight.w700,
                              color: AppColors.textPrimary,
                              height: 1.3,
                            ),
                          ),
                          Text(
                            'Today, January 16, 2024',
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                            style: AppText.sans(
                              size: 11,
                              color: AppColors.textMuted,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 16),
                ResponsiveGrid(
                  columns: context.responsive<int>(1, sm: 2),
                  spacing: 12,
                  children: const [_SalesCard(), _RevenueSummaryCard()],
                ),
                const SizedBox(height: 12),
                ResponsiveGrid(
                  columns: context.responsive<int>(2, sm: 4),
                  spacing: 10,
                  children: const [
                    _IconStat(Icons.bolt, 'Total Sales', r'$59,304'),
                    _IconStat(Icons.attach_money, 'This Month', r'$12,661'),
                    _IconStat(Icons.people_outline, 'Customers', '759'),
                    _IconStat(Icons.trending_up, 'Total Views', '166k'),
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _Panel extends StatelessWidget {
  const _Panel({required this.child, this.padding = const EdgeInsets.all(14)});

  final Widget child;
  final EdgeInsetsGeometry padding;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: padding,
      decoration: BoxDecoration(
        color: AppColors.bgPrimary,
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: AppColors.border),
      ),
      child: child,
    );
  }
}

TextStyle get _small => AppText.sans(size: 11.5, color: AppColors.textMuted);
TextStyle _big(double size) => AppText.serif(
  size: size,
  weight: FontWeight.w700,
  color: AppColors.textPrimary,
  height: 1.25,
);

class _SalesCard extends StatelessWidget {
  const _SalesCard();

  @override
  Widget build(BuildContext context) {
    return _Panel(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text('MONTHLY SALES', style: AppText.label(size: 10)),
          const SizedBox(height: 8),
          Row(
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text('Total product', style: _small),
                    Text('25.4k', style: _big(21)),
                  ],
                ),
              ),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text('Revenue', style: _small),
                    Text(r'$6.35M', style: _big(21)),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 8),
          Text('Total collection', style: _small),
          Text('1.3M', style: _big(18)),
          const SizedBox(height: 8),
          ClipRRect(
            borderRadius: BorderRadius.circular(999),
            child: Container(
              height: 6,
              color: AppColors.border,
              alignment: Alignment.centerLeft,
              child: const FractionallySizedBox(
                widthFactor: 0.75,
                heightFactor: 1,
                child: ColoredBox(color: AppColors.accent),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _RevenueSummaryCard extends StatelessWidget {
  const _RevenueSummaryCard();

  static const _rows = [
    ('Product Sales', r'$12,900'),
    ('Development Service', r'$9,850'),
    ('Subscription', r'$3,700'),
    ('Digital Assets', r'$3,700'),
  ];

  @override
  Widget build(BuildContext context) {
    return _Panel(
      child: Column(
        children: [
          Row(
            children: [
              Expanded(
                child: Text('REVENUE SUMMARY', style: AppText.label(size: 10)),
              ),
              Text('Last 30 Days', style: _small),
            ],
          ),
          const SizedBox(height: 10),
          for (final (name, value) in _rows)
            Padding(
              padding: const EdgeInsets.only(bottom: 7),
              child: Row(
                children: [
                  Expanded(
                    child: Text(
                      name,
                      style: AppText.sans(
                        size: 12,
                        color: AppColors.textSecondary,
                      ),
                    ),
                  ),
                  Text(
                    value,
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

class _IconStat extends StatelessWidget {
  const _IconStat(this.icon, this.label, this.value);

  final IconData icon;
  final String label;
  final String value;

  @override
  Widget build(BuildContext context) {
    return _Panel(
      padding: const EdgeInsets.all(10),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            width: 28,
            height: 28,
            decoration: BoxDecoration(
              color: AppColors.accentSoft,
              borderRadius: BorderRadius.circular(7),
            ),
            child: Icon(icon, color: AppColors.accent, size: 15),
          ),
          const SizedBox(height: 6),
          Text(label, style: _small),
          FittedBox(
            fit: BoxFit.scaleDown,
            child: Text(value, style: _big(17)),
          ),
        ],
      ),
    );
  }
}
