import 'dart:async';

import 'package:flutter/material.dart';

import '../data/landing_content.dart';
import '../theme/app_colors.dart';
import '../theme/app_text.dart';
import '../utils/responsive.dart';
import '../widgets/content_container.dart';
import '../widgets/editorial.dart';

/// Creator testimonials that rotate automatically, with clickable progress
/// indicators to jump to a specific one.
class TestimonialsSection extends StatefulWidget {
  const TestimonialsSection({super.key});

  @override
  State<TestimonialsSection> createState() => _TestimonialsSectionState();
}

class _TestimonialsSectionState extends State<TestimonialsSection> {
  static const _interval = Duration(seconds: 6);

  int _active = 0;
  Timer? _timer;

  @override
  void initState() {
    super.initState();
    _startTimer();
  }

  void _startTimer() {
    _timer?.cancel();
    _timer = Timer.periodic(_interval, (_) {
      setState(
        () => _active = (_active + 1) % LandingContent.testimonials.length,
      );
    });
  }

  void _select(int index) {
    setState(() => _active = index);
    // Restart the countdown so a manual pick stays visible for a full interval.
    _startTimer();
  }

  @override
  void dispose() {
    _timer?.cancel();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final r = context.sized;
    final size = r(34, sm: 40, md: 48, lg: 56);

    final intro = Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text.rich(
          const TextSpan(
            children: [
              TextSpan(text: 'Trusted by creators '),
              TextSpan(
                text: 'across India.',
                style: TextStyle(color: AppColors.textMuted),
              ),
            ],
          ),
          style: AppText.heading(size),
        ),
        SizedBox(height: r(16, md: 24)),
        ConstrainedBox(
          constraints: const BoxConstraints(maxWidth: 520),
          child: Text(
            "Join thousands of creators who've simplified their collaboration workflow and "
            "increased their earnings with Shor's powerful platform.",
            style: AppText.serif(size: r(16, md: 18), height: 1.7),
          ),
        ),
        const SizedBox(height: 24),
        Row(
          children: [
            for (var i = 0; i < LandingContent.testimonials.length; i++)
              Padding(
                padding: const EdgeInsets.only(right: 12),
                child: Semantics(
                  button: true,
                  label: 'View testimonial ${i + 1}',
                  child: MouseRegion(
                    cursor: SystemMouseCursors.click,
                    child: GestureDetector(
                      key: ValueKey('testimonial-dot-$i'),
                      onTap: () => _select(i),
                      child: Padding(
                        // Larger tap target than the thin bar itself.
                        padding: const EdgeInsets.symmetric(vertical: 10),
                        child: AnimatedContainer(
                          duration: const Duration(milliseconds: 300),
                          width: i == _active ? 48 : 28,
                          height: 4,
                          decoration: BoxDecoration(
                            color: i == _active
                                ? AppColors.accent
                                : AppColors.borderStrong,
                            borderRadius: BorderRadius.circular(999),
                          ),
                        ),
                      ),
                    ),
                  ),
                ),
              ),
          ],
        ),
      ],
    );

    final card = AnimatedSwitcher(
      duration: const Duration(milliseconds: 600),
      transitionBuilder: (child, animation) => FadeTransition(
        opacity: animation,
        child: SlideTransition(
          position: Tween(
            begin: const Offset(0, 0.04),
            end: Offset.zero,
          ).animate(animation),
          child: child,
        ),
      ),
      layoutBuilder: (current, previous) => Stack(
        alignment: Alignment.topCenter,
        children: [...previous, ?current],
      ),
      child: _TestimonialCard(
        key: ValueKey(_active),
        testimonial: LandingContent.testimonials[_active],
      ),
    );

    return Container(
      color: AppColors.bgPrimary,
      padding: sectionPadding(context),
      child: ContentContainer(
        maxWidth: 1120,
        child: context.isLg
            ? Row(
                children: [
                  Expanded(child: intro),
                  const SizedBox(width: 64),
                  Expanded(child: card),
                ],
              )
            : Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [intro, const SizedBox(height: 40), card],
              ),
      ),
    );
  }
}

class _TestimonialCard extends StatelessWidget {
  const _TestimonialCard({super.key, required this.testimonial});

  final Testimonial testimonial;

  @override
  Widget build(BuildContext context) {
    final r = context.sized;
    final t = testimonial;

    return PaperCard(
      padding: EdgeInsets.all(r(24, md: 32)),
      radius: 16,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            '“',
            style: AppText.serif(
              size: 64,
              weight: FontWeight.w700,
              color: AppColors.accentOnDark,
              height: 0.8,
            ),
          ),
          const SizedBox(height: 4),
          Row(
            children: [
              for (var i = 0; i < t.rating; i++)
                const Padding(
                  padding: EdgeInsets.only(right: 3),
                  child: Icon(Icons.star, color: AppColors.accent, size: 18),
                ),
            ],
          ),
          SizedBox(height: r(16, md: 20)),
          Text(
            t.content,
            style: AppText.serif(
              size: r(17, md: 19),
              style: FontStyle.italic,
              color: AppColors.textPrimary,
              height: 1.6,
            ),
          ),
          SizedBox(height: r(24, md: 28)),
          Container(
            padding: const EdgeInsets.only(bottom: 20),
            decoration: const BoxDecoration(
              border: Border(bottom: BorderSide(color: AppColors.border)),
            ),
            child: Row(
              children: [
                CircleAvatar(
                  radius: 24,
                  backgroundColor: AppColors.navy,
                  backgroundImage: AssetImage(t.avatar),
                ),
                const SizedBox(width: 14),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        t.name,
                        overflow: TextOverflow.ellipsis,
                        style: AppText.sans(size: 16, weight: FontWeight.w600),
                      ),
                      Text(
                        '${t.role} • ${t.followers} followers',
                        overflow: TextOverflow.ellipsis,
                        style: AppText.sans(
                          size: 13,
                          color: AppColors.textMuted,
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 20),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
            decoration: BoxDecoration(
              color: AppColors.bgPrimary,
              borderRadius: BorderRadius.circular(10),
              border: Border.all(color: AppColors.border),
            ),
            child: Row(
              children: [
                Expanded(
                  child: Text(
                    t.metric.toUpperCase(),
                    style: AppText.label(color: AppColors.textSecondary),
                  ),
                ),
                Text(
                  t.value,
                  style: AppText.serif(
                    size: 22,
                    weight: FontWeight.w700,
                    color: AppColors.textPrimary,
                    height: 1.2,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
