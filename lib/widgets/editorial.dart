import 'dart:math' as math;

import 'package:flutter/material.dart';

import '../theme/app_colors.dart';
import '../theme/app_text.dart';
import '../utils/responsive.dart';

/// Small dot that gently pulses, used beside "live" style labels.
class PulseDot extends StatefulWidget {
  const PulseDot({super.key, this.color = AppColors.accent, this.size = 6});

  final Color color;
  final double size;

  @override
  State<PulseDot> createState() => _PulseDotState();
}

class _PulseDotState extends State<PulseDot>
    with SingleTickerProviderStateMixin {
  late final AnimationController _controller = AnimationController(
    vsync: this,
    duration: const Duration(milliseconds: 1600),
  )..repeat();

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final reduceMotion = MediaQuery.of(context).disableAnimations;
    return SizedBox(
      width: widget.size * 3,
      height: widget.size * 3,
      child: AnimatedBuilder(
        animation: _controller,
        builder: (context, _) {
          final t = reduceMotion ? 0.0 : _controller.value;
          return Stack(
            alignment: Alignment.center,
            children: [
              Container(
                width: widget.size * (1 + 2 * t),
                height: widget.size * (1 + 2 * t),
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  color: widget.color.withValues(alpha: 0.35 * (1 - t)),
                ),
              ),
              Container(
                width: widget.size,
                height: widget.size,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  color: widget.color,
                ),
              ),
            ],
          );
        },
      ),
    );
  }
}

/// Uppercase tracked label with an optional leading dot.
class DotLabel extends StatelessWidget {
  const DotLabel(
    this.text, {
    super.key,
    this.color = AppColors.accent,
    this.pulse = false,
  });

  final String text;
  final Color color;
  final bool pulse;

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        if (pulse)
          PulseDot(color: color)
        else
          Container(
            width: 5,
            height: 5,
            margin: const EdgeInsets.only(right: 4),
            decoration: BoxDecoration(color: color, shape: BoxShape.circle),
          ),
        const SizedBox(width: 6),
        Flexible(
          child: Text(text.toUpperCase(), style: AppText.label(color: color)),
        ),
      ],
    );
  }
}

/// Faint dot grid painted behind the hero.
class DotGridBackground extends StatelessWidget {
  const DotGridBackground({super.key, required this.child});

  final Widget child;

  @override
  Widget build(BuildContext context) {
    return CustomPaint(painter: _DotGridPainter(), child: child);
  }
}

class _DotGridPainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    const spacing = 24.0;
    final paint = Paint()
      ..color = AppColors.borderStrong.withValues(alpha: 0.55);
    for (var y = spacing / 2; y < size.height; y += spacing) {
      for (var x = spacing / 2; x < size.width; x += spacing) {
        canvas.drawCircle(Offset(x, y), 0.9, paint);
      }
    }
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}

/// White card with a hairline border and a soft, wide shadow.
class PaperCard extends StatelessWidget {
  const PaperCard({
    super.key,
    required this.child,
    this.padding = const EdgeInsets.all(20),
    this.radius = 10,
    this.color = AppColors.bgCard,
    this.shadow = true,
    this.angle = 0,
  });

  final Widget child;
  final EdgeInsetsGeometry padding;
  final double radius;
  final Color color;
  final bool shadow;

  /// Rotation in degrees, for the scattered collage cards.
  final double angle;

  @override
  Widget build(BuildContext context) {
    final card = Container(
      padding: padding,
      decoration: BoxDecoration(
        color: color,
        borderRadius: BorderRadius.circular(radius),
        border: Border.all(color: AppColors.border),
        boxShadow: shadow
            ? [
                BoxShadow(
                  color: AppColors.navyAlpha(0.06),
                  blurRadius: 30,
                  offset: const Offset(0, 12),
                ),
              ]
            : null,
      ),
      child: child,
    );
    if (angle == 0) return card;
    return Transform.rotate(angle: angle * math.pi / 180, child: card);
  }
}

/// Standard vertical rhythm for full-width sections.
EdgeInsets sectionPadding(BuildContext context) => EdgeInsets.symmetric(
  horizontal: context.responsive<double>(20, sm: 32, lg: 48),
  vertical: context.responsive<double>(72, md: 96, lg: 120),
);

/// Centred section title with a serif subtitle underneath.
class SectionHeading extends StatelessWidget {
  const SectionHeading({
    super.key,
    required this.title,
    required this.subtitle,
    this.dark = false,
  });

  final String title;
  final String subtitle;

  /// Light colours for navy backgrounds.
  final bool dark;

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Text(
          title,
          textAlign: TextAlign.center,
          style: AppText.heading(
            context.responsive<double>(30, sm: 34, md: 40, lg: 44),
            color: dark ? Colors.white : AppColors.textPrimary,
          ),
        ),
        const SizedBox(height: 16),
        ConstrainedBox(
          constraints: const BoxConstraints(maxWidth: 640),
          child: Text(
            subtitle,
            textAlign: TextAlign.center,
            style: AppText.serif(
              size: context.responsive<double>(17, md: 19),
              color: dark ? AppColors.white(0.7) : AppColors.textSecondary,
              height: 1.7,
            ),
          ),
        ),
      ],
    );
  }
}
