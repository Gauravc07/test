import 'package:flutter/material.dart';

import '../data/landing_content.dart';
import '../screens/auth_page.dart';
import '../theme/app_colors.dart';
import '../theme/app_text.dart';
import '../utils/responsive.dart';
import '../widgets/app_buttons.dart';
import '../widgets/coming_soon.dart';
import '../widgets/content_container.dart';
import '../widgets/editorial.dart';
import '../widgets/responsive_grid.dart';
import 'navigation_bar.dart';

class HeroSection extends StatelessWidget {
  const HeroSection({super.key});

  @override
  Widget build(BuildContext context) {
    final r = context.sized;
    return DotGridBackground(
      child: Container(
        constraints: BoxConstraints(minHeight: context.screenHeight),
        padding: EdgeInsets.fromLTRB(
          r(16, sm: 24),
          navOverlap(context) + r(40, sm: 48, md: 56),
          r(16, sm: 24),
          r(48, sm: 64, md: 80),
        ),
        child: ContentContainer(
          maxWidth: 896,
          child: Column(
            children: [
              const _Badge(),
              SizedBox(height: r(24, sm: 32)),
              const _Headline(),
              SizedBox(height: r(32, sm: 44)),
              const _HeroButtons(),
              SizedBox(height: r(16, sm: 24)),
              const _FinePrint(),
              SizedBox(height: r(56, sm: 72)),
              const _StreamlineBand(),
              SizedBox(height: r(32, sm: 48)),
              const _DashboardMock(),
              SizedBox(height: r(32, sm: 48)),
              Text(
                LandingContent.trustedBy,
                textAlign: TextAlign.center,
                style: AppText.sans(
                  size: r(16, sm: 18, md: 20),
                  weight: FontWeight.w500,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _Badge extends StatelessWidget {
  const _Badge();

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 7),
      decoration: BoxDecoration(
        color: AppColors.bgCard,
        borderRadius: BorderRadius.circular(999),
        border: Border.all(color: AppColors.border),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          const Icon(
            Icons.emoji_events_outlined,
            size: 15,
            color: AppColors.accent,
          ),
          const SizedBox(width: 8),
          Flexible(
            child: Text(
              LandingContent.heroBadge.toUpperCase(),
              style: AppText.label(color: AppColors.textSecondary),
            ),
          ),
        ],
      ),
    );
  }
}

class _Headline extends StatelessWidget {
  const _Headline();

  @override
  Widget build(BuildContext context) {
    final r = context.sized;
    final size = r(38, sm: 46, md: 56, lg: 64, xl: 72);
    return Column(
      children: [
        Text.rich(
          const TextSpan(
            children: [
              TextSpan(text: '${LandingContent.heroTitleLead} '),
              TextSpan(
                text: LandingContent.heroTitleStrong,
                style: TextStyle(fontWeight: FontWeight.w700),
              ),
            ],
          ),
          textAlign: TextAlign.center,
          style: AppText.serif(
            size: size,
            style: FontStyle.italic,
            color: AppColors.textPrimary,
            height: 1.1,
            letterSpacing: -size * 0.03,
          ),
        ),
        SizedBox(height: r(20, sm: 24)),
        ConstrainedBox(
          constraints: const BoxConstraints(maxWidth: 640),
          child: Text(
            LandingContent.heroSubtitle,
            textAlign: TextAlign.center,
            style: AppText.serif(size: r(17, sm: 19, md: 21), height: 1.65),
          ),
        ),
      ],
    );
  }
}

class _HeroButtons extends StatelessWidget {
  const _HeroButtons();

  @override
  Widget build(BuildContext context) {
    final fontSize = context.sized(15, md: 16);
    final full = !context.isSm;
    final trial = SolidButton(
      label: 'Start 14 Days Free Trial',
      showArrow: true,
      fontSize: fontSize,
      fullWidth: full,
      onPressed: () => openAccount(context, mode: AuthMode.signUp),
    );
    final demo = OutlineActionButton(
      label: 'Request Free Demo',
      fontSize: fontSize,
      fullWidth: full,
      onPressed: () => showComingSoon(context, 'Demo requests'),
    );
    if (full) {
      return Column(children: [trial, const SizedBox(height: 12), demo]);
    }
    return Wrap(
      alignment: WrapAlignment.center,
      spacing: 16,
      runSpacing: 12,
      children: [trial, demo],
    );
  }
}

class _FinePrint extends StatelessWidget {
  const _FinePrint();

  @override
  Widget build(BuildContext context) {
    final style = AppText.sans(
      size: context.sized(12, sm: 14),
      color: AppColors.textMuted,
    );
    return Wrap(
      alignment: WrapAlignment.center,
      spacing: 14,
      children: [
        Text('No Credit Card Required', style: style),
        Text('•', style: style),
        Text('Cancel Anytime', style: style),
      ],
    );
  }
}

/// "Streamline collaborations" band with a checklist and a CTA.
class _StreamlineBand extends StatelessWidget {
  const _StreamlineBand();

  @override
  Widget build(BuildContext context) {
    final r = context.sized;
    final text = Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          LandingContent.streamlineTitle,
          style: AppText.heading(r(26, sm: 30, md: 34, lg: 38)),
        ),
        SizedBox(height: r(12, sm: 16)),
        Text(
          LandingContent.streamlineBody,
          style: AppText.serif(size: r(16, md: 17), height: 1.7),
        ),
        SizedBox(height: r(16, sm: 24)),
        for (final point in LandingContent.streamlinePoints)
          Padding(
            padding: const EdgeInsets.only(bottom: 12),
            child: Row(
              children: [
                Container(
                  width: 22,
                  height: 22,
                  decoration: const BoxDecoration(
                    color: AppColors.accentSoft,
                    shape: BoxShape.circle,
                  ),
                  child: const Icon(
                    Icons.check,
                    size: 14,
                    color: AppColors.accent,
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Text(
                    point,
                    style: AppText.sans(
                      size: r(15, md: 16),
                      weight: FontWeight.w500,
                    ),
                  ),
                ),
              ],
            ),
          ),
      ],
    );

    final button = SolidButton.navy(
      label: 'Get Started Now',
      showArrow: true,
      fullWidth: !context.isSm,
      fontSize: r(15, md: 16),
      padding: EdgeInsets.symmetric(
        horizontal: r(26, md: 36),
        vertical: r(16, md: 20),
      ),
      onPressed: () => openAccount(context, mode: AuthMode.signUp),
    );

    return Container(
      width: double.infinity,
      padding: EdgeInsets.symmetric(
        horizontal: r(20, sm: 28, md: 36),
        vertical: r(32, sm: 40, md: 48),
      ),
      decoration: BoxDecoration(
        color: AppColors.bgSecondary,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: AppColors.border),
      ),
      child: context.isLg
          ? Row(
              children: [
                Expanded(child: text),
                const SizedBox(width: 48),
                button,
              ],
            )
          : Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                text,
                const SizedBox(height: 12),
                Center(child: button),
              ],
            ),
    );
  }
}

/// Static dashboard preview with sample metrics.
class _DashboardMock extends StatelessWidget {
  const _DashboardMock();

  @override
  Widget build(BuildContext context) {
    final r = context.sized;
    return PaperCard(
      padding: EdgeInsets.all(r(16, sm: 24)),
      radius: 14,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Row(
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Dashboard',
                      style: AppText.serif(
                        size: 18,
                        weight: FontWeight.w700,
                        color: AppColors.textPrimary,
                        height: 1.3,
                      ),
                    ),
                    Text(
                      'Last 30 days',
                      style: AppText.sans(size: 13, color: AppColors.textMuted),
                    ),
                  ],
                ),
              ),
              const DotLabel('Live', pulse: true),
            ],
          ),
          SizedBox(height: r(16, sm: 24)),
          ResponsiveGrid(
            columns: context.responsive<int>(1, sm: 2, lg: 3),
            children: const [
              _MonthlySalesCard(),
              _RevenueCard(),
              _RealtimeCard(),
            ],
          ),
          const SizedBox(height: 16),
          ResponsiveGrid(
            columns: context.responsive<int>(2, md: 4),
            children: const [
              _StatTile('Total Sales', r'$59,304'),
              _StatTile('This Month Sales', r'$12,661'),
              _StatTile('This Month Customer', '759'),
              _StatTile('Total Views', '166,543'),
            ],
          ),
        ],
      ),
    );
  }
}

class _MiniCard extends StatelessWidget {
  const _MiniCard({required this.child, this.center = false});

  final Widget child;
  final bool center;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.bgPrimary,
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: AppColors.border),
      ),
      child: center ? Center(child: child) : child,
    );
  }
}

TextStyle _small([Color color = AppColors.textMuted]) =>
    AppText.sans(size: 12, color: color);
TextStyle _big(double size) => AppText.serif(
  size: size,
  weight: FontWeight.w700,
  color: AppColors.textPrimary,
  height: 1.25,
);

class _MonthlySalesCard extends StatelessWidget {
  const _MonthlySalesCard();

  @override
  Widget build(BuildContext context) {
    return _MiniCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text('MONTHLY SALES', style: AppText.label(size: 10)),
          const SizedBox(height: 8),
          Text('Total product', style: _small()),
          Text('21.4k', style: _big(24)),
          const SizedBox(height: 8),
          Text('Total orders', style: _small()),
          Text('1.3M', style: _big(20)),
        ],
      ),
    );
  }
}

class _RevenueCard extends StatelessWidget {
  const _RevenueCard();

  static const _rows = [
    ('Product Sales', r'$12,900'),
    ('Development Service', r'$9850'),
    ('Subscription', r'$3700'),
    ('Digital Assets', r'$3700'),
  ];

  @override
  Widget build(BuildContext context) {
    return _MiniCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text('REVENUE SUMMARY', style: AppText.label(size: 10)),
          const SizedBox(height: 8),
          Text('Revenue', style: _small()),
          Text(r'$6,35,240', style: _big(24)),
          const SizedBox(height: 10),
          for (final (name, value) in _rows)
            Padding(
              padding: const EdgeInsets.only(bottom: 4),
              child: Row(
                children: [
                  Expanded(
                    child: Text(name, style: _small(AppColors.textSecondary)),
                  ),
                  Text(
                    value,
                    style: AppText.sans(size: 12, weight: FontWeight.w600),
                  ),
                ],
              ),
            ),
        ],
      ),
    );
  }
}

class _RealtimeCard extends StatelessWidget {
  const _RealtimeCard();

  @override
  Widget build(BuildContext context) {
    return _MiniCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text('REAL-TIME', style: AppText.label(size: 10)),
          const SizedBox(height: 8),
          Text('49', style: _big(36)),
          Text('Visiting Now', style: _small()),
          const SizedBox(height: 16),
          SizedBox(
            height: 48,
            child: CustomPaint(
              painter: _SparklinePainter(),
              size: Size.infinite,
            ),
          ),
        ],
      ),
    );
  }
}

/// Small filled line chart for the real-time card.
class _SparklinePainter extends CustomPainter {
  static const _points = [0.55, 0.4, 0.6, 0.35, 0.5, 0.25, 0.45, 0.2, 0.3, 0.1];

  @override
  void paint(Canvas canvas, Size size) {
    final dx = size.width / (_points.length - 1);
    final line = Path();
    for (var i = 0; i < _points.length; i++) {
      final p = Offset(i * dx, _points[i] * size.height);
      i == 0 ? line.moveTo(p.dx, p.dy) : line.lineTo(p.dx, p.dy);
    }
    final fill = Path.from(line)
      ..lineTo(size.width, size.height)
      ..lineTo(0, size.height)
      ..close();
    canvas.drawPath(
      fill,
      Paint()
        ..shader = LinearGradient(
          begin: Alignment.topCenter,
          end: Alignment.bottomCenter,
          colors: [
            AppColors.accent.withValues(alpha: 0.22),
            AppColors.accent.withValues(alpha: 0),
          ],
        ).createShader(Offset.zero & size),
    );
    canvas.drawPath(
      line,
      Paint()
        ..color = AppColors.accent
        ..style = PaintingStyle.stroke
        ..strokeWidth = 2
        ..strokeJoin = StrokeJoin.round,
    );
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}

class _StatTile extends StatelessWidget {
  const _StatTile(this.label, this.value);

  final String label;
  final String value;

  @override
  Widget build(BuildContext context) {
    return _MiniCard(
      center: true,
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Text(label, style: _small(), textAlign: TextAlign.center),
          const SizedBox(height: 6),
          FittedBox(
            fit: BoxFit.scaleDown,
            child: Text(value, style: _big(24)),
          ),
        ],
      ),
    );
  }
}
