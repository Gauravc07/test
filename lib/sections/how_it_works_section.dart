import 'package:flutter/material.dart';

import '../data/landing_content.dart';
import '../theme/app_colors.dart';
import '../theme/app_text.dart';
import '../utils/responsive.dart';
import '../widgets/content_container.dart';
import '../widgets/editorial.dart';

/// Two step-by-step journeys side by side: creators and brands.
class HowItWorksSection extends StatelessWidget {
  const HowItWorksSection({super.key});

  @override
  Widget build(BuildContext context) {
    final r = context.sized;
    const creators = _StepList(
      title: 'For Creators',
      subtitle: 'Your journey from signup to success',
      steps: LandingContent.creatorSteps,
      accent: AppColors.accent,
      tint: AppColors.accentSoft,
    );
    const brands = _StepList(
      title: 'For Brands',
      subtitle: 'Launch campaigns and measure impact',
      steps: LandingContent.brandSteps,
      accent: AppColors.navy,
      tint: AppColors.bgCard,
    );

    return Container(
      color: AppColors.bgSecondary,
      padding: sectionPadding(context),
      child: ContentContainer(
        maxWidth: 1120,
        child: Column(
          children: [
            const SectionHeading(
              title: 'How Shor Works',
              subtitle:
                  'Simple, transparent, and designed to get you collaborating in minutes.',
            ),
            SizedBox(height: r(40, md: 64)),
            if (context.isLg)
              const Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Expanded(child: creators),
                  SizedBox(width: 64),
                  Expanded(child: brands),
                ],
              )
            else
              Column(
                children: [
                  creators,
                  SizedBox(height: r(40, md: 56)),
                  brands,
                ],
              ),
          ],
        ),
      ),
    );
  }
}

class _StepList extends StatelessWidget {
  const _StepList({
    required this.title,
    required this.subtitle,
    required this.steps,
    required this.accent,
    required this.tint,
  });

  final String title;
  final String subtitle;
  final List<IconItem> steps;
  final Color accent;
  final Color tint;

  @override
  Widget build(BuildContext context) {
    final wide = context.isLg;
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        Column(
          crossAxisAlignment: wide
              ? CrossAxisAlignment.start
              : CrossAxisAlignment.center,
          children: [
            Text(
              title,
              textAlign: wide ? TextAlign.left : TextAlign.center,
              style: AppText.serif(
                size: context.sized(24, sm: 28),
                weight: FontWeight.w700,
                color: AppColors.textPrimary,
                height: 1.2,
              ),
            ),
            const SizedBox(height: 6),
            Text(
              subtitle,
              textAlign: wide ? TextAlign.left : TextAlign.center,
              style: AppText.serif(
                size: 16,
                style: FontStyle.italic,
                color: AppColors.textMuted,
              ),
            ),
          ],
        ),
        const SizedBox(height: 28),
        for (var i = 0; i < steps.length; i++)
          Padding(
            padding: const EdgeInsets.only(bottom: 22),
            child: _StepTile(
              index: i,
              step: steps[i],
              accent: accent,
              tint: tint,
            ),
          ),
      ],
    );
  }
}

class _StepTile extends StatefulWidget {
  const _StepTile({
    required this.index,
    required this.step,
    required this.accent,
    required this.tint,
  });

  final int index;
  final IconItem step;
  final Color accent;
  final Color tint;

  @override
  State<_StepTile> createState() => _StepTileState();
}

class _StepTileState extends State<_StepTile> {
  bool _hovered = false;

  @override
  Widget build(BuildContext context) {
    const duration = Duration(milliseconds: 250);
    return MouseRegion(
      onEnter: (_) => setState(() => _hovered = true),
      onExit: (_) => setState(() => _hovered = false),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          AnimatedScale(
            duration: duration,
            scale: _hovered ? 1.08 : 1,
            child: AnimatedContainer(
              duration: duration,
              width: 46,
              height: 46,
              decoration: BoxDecoration(
                color: _hovered ? widget.accent : widget.tint,
                borderRadius: BorderRadius.circular(10),
                border: Border.all(
                  color: _hovered ? widget.accent : AppColors.border,
                ),
              ),
              child: Icon(
                widget.step.icon,
                size: 22,
                color: _hovered ? Colors.white : widget.accent,
              ),
            ),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'STEP ${widget.index + 1}',
                  style: AppText.label(color: widget.accent),
                ),
                const SizedBox(height: 4),
                Text(
                  widget.step.title,
                  style: AppText.sans(size: 17, weight: FontWeight.w600),
                ),
                const SizedBox(height: 4),
                Text(
                  widget.step.description,
                  style: AppText.serif(size: 15.5, height: 1.6),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
