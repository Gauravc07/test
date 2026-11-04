import 'package:flutter/material.dart';

import '../data/landing_content.dart';
import '../theme/app_colors.dart';
import '../theme/app_text.dart';
import '../utils/responsive.dart';
import '../widgets/content_container.dart';
import '../widgets/editorial.dart';
import '../widgets/responsive_grid.dart';

/// "Built for creators. Designed for brands." with one card per audience.
class ValuePropositionSection extends StatelessWidget {
  const ValuePropositionSection({super.key});

  @override
  Widget build(BuildContext context) {
    final r = context.sized;
    return Container(
      color: AppColors.bgSecondary,
      padding: sectionPadding(context),
      child: ContentContainer(
        maxWidth: 1120,
        child: Column(
          children: [
            const SectionHeading(
              title: 'Built for creators. Designed for brands.',
              subtitle:
                  'A transparent, data-powered ecosystem where influencers and brands connect, '
                  'collaborate, and grow — without middlemen, spam, or guesswork.',
            ),
            SizedBox(height: r(40, md: 56)),
            ResponsiveGrid(
              columns: context.responsive<int>(1, md: 2),
              spacing: r(20, lg: 32),
              children: const [
                _AudienceCard(
                  icon: Icons.people_outline,
                  title: 'For Creators',
                  body:
                      'Unlock your potential with tools designed to help you grow, collaborate, '
                      'and monetize your influence.',
                  items: LandingContent.creatorValues,
                  accent: AppColors.accent,
                  tint: AppColors.accentSoft,
                ),
                _AudienceCard(
                  icon: Icons.business_outlined,
                  title: 'For Brands',
                  body:
                      'Find authentic creators, launch campaigns, and measure real impact with '
                      'data-driven insights.',
                  items: LandingContent.brandValues,
                  accent: AppColors.navy,
                  tint: AppColors.bgSecondary,
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}

class _AudienceCard extends StatelessWidget {
  const _AudienceCard({
    required this.icon,
    required this.title,
    required this.body,
    required this.items,
    required this.accent,
    required this.tint,
  });

  final IconData icon;
  final String title;
  final String body;
  final List<IconItem> items;
  final Color accent;
  final Color tint;

  @override
  Widget build(BuildContext context) {
    final r = context.sized;
    return PaperCard(
      padding: EdgeInsets.all(r(24, sm: 32)),
      radius: 14,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(height: 3, width: 32, color: accent),
          const SizedBox(height: 20),
          Row(
            children: [
              Container(
                padding: const EdgeInsets.all(10),
                decoration: BoxDecoration(
                  color: tint,
                  borderRadius: BorderRadius.circular(10),
                ),
                child: Icon(icon, color: accent, size: 22),
              ),
              const SizedBox(width: 12),
              Flexible(
                child: Text(
                  title,
                  style: AppText.serif(
                    size: r(22, sm: 26),
                    weight: FontWeight.w700,
                    color: AppColors.textPrimary,
                    height: 1.2,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 18),
          Text(body, style: AppText.serif(size: r(15.5, sm: 17), height: 1.7)),
          const SizedBox(height: 20),
          for (final item in items)
            Padding(
              padding: const EdgeInsets.only(bottom: 16),
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Padding(
                    padding: const EdgeInsets.only(top: 1),
                    child: Icon(item.icon, color: accent, size: 19),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          item.title,
                          style: AppText.sans(
                            size: 15.5,
                            weight: FontWeight.w600,
                          ),
                        ),
                        const SizedBox(height: 3),
                        Text(
                          item.description,
                          style: AppText.sans(
                            size: 14,
                            color: AppColors.textSecondary,
                            height: 1.55,
                          ),
                        ),
                      ],
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
