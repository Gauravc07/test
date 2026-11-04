import 'package:flutter/material.dart';

import '../data/landing_content.dart';
import '../theme/app_colors.dart';
import '../theme/app_text.dart';
import '../utils/responsive.dart';
import '../widgets/content_container.dart';
import '../widgets/editorial.dart';
import '../widgets/responsive_grid.dart';

enum _Audience { creators, brands }

/// Feature grid with a pill toggle between creator and brand features.
class FeaturesSection extends StatefulWidget {
  const FeaturesSection({super.key});

  @override
  State<FeaturesSection> createState() => _FeaturesSectionState();
}

class _FeaturesSectionState extends State<FeaturesSection> {
  _Audience _active = _Audience.creators;

  @override
  Widget build(BuildContext context) {
    final r = context.sized;
    final features = _active == _Audience.creators
        ? LandingContent.creatorFeatures
        : LandingContent.brandFeatures;

    return Container(
      color: AppColors.bgPrimary,
      padding: sectionPadding(context),
      child: ContentContainer(
        maxWidth: 1120,
        child: Column(
          children: [
            const SectionHeading(
              title: 'Powerful Features for Everyone',
              subtitle:
                  'Everything you need to collaborate, create, and grow — all in one platform.',
            ),
            SizedBox(height: r(32, md: 40)),
            _AudienceToggle(
              active: _active,
              onChanged: (value) => setState(() => _active = value),
            ),
            SizedBox(height: r(32, md: 48)),
            AnimatedSwitcher(
              duration: const Duration(milliseconds: 300),
              child: ResponsiveGrid(
                key: ValueKey(_active),
                columns: context.responsive<int>(1, sm: 2, lg: 3),
                spacing: r(16, md: 24),
                children: [for (final f in features) _FeatureCard(feature: f)],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _AudienceToggle extends StatelessWidget {
  const _AudienceToggle({required this.active, required this.onChanged});

  final _Audience active;
  final ValueChanged<_Audience> onChanged;

  @override
  Widget build(BuildContext context) {
    Widget option(_Audience value, String label) {
      final selected = value == active;
      final button = Semantics(
        button: true,
        selected: selected,
        child: MouseRegion(
          cursor: SystemMouseCursors.click,
          child: GestureDetector(
            key: ValueKey('audience-toggle-${value.name}'),
            onTap: () => onChanged(value),
            child: AnimatedContainer(
              duration: const Duration(milliseconds: 250),
              padding: EdgeInsets.symmetric(
                horizontal: context.sized(20, md: 30),
                vertical: 11,
              ),
              alignment: Alignment.center,
              decoration: BoxDecoration(
                color: selected ? AppColors.navy : Colors.transparent,
                borderRadius: BorderRadius.circular(999),
              ),
              child: AnimatedDefaultTextStyle(
                duration: const Duration(milliseconds: 250),
                style: AppText.sans(
                  size: 15,
                  weight: FontWeight.w600,
                  color: selected ? Colors.white : AppColors.textSecondary,
                ),
                child: Text(label),
              ),
            ),
          ),
        ),
      );
      return context.isSm ? button : Expanded(child: button);
    }

    return Container(
      padding: const EdgeInsets.all(4),
      decoration: BoxDecoration(
        color: AppColors.bgCard,
        borderRadius: BorderRadius.circular(999),
        border: Border.all(color: AppColors.border),
      ),
      child: Row(
        mainAxisSize: context.isSm ? MainAxisSize.min : MainAxisSize.max,
        children: [
          option(_Audience.creators, 'For Creators'),
          option(_Audience.brands, 'For Brands'),
        ],
      ),
    );
  }
}

class _FeatureCard extends StatefulWidget {
  const _FeatureCard({required this.feature});

  final IconItem feature;

  @override
  State<_FeatureCard> createState() => _FeatureCardState();
}

class _FeatureCardState extends State<_FeatureCard> {
  bool _hovered = false;

  @override
  Widget build(BuildContext context) {
    const duration = Duration(milliseconds: 250);
    return MouseRegion(
      onEnter: (_) => setState(() => _hovered = true),
      onExit: (_) => setState(() => _hovered = false),
      child: AnimatedSlide(
        duration: duration,
        offset: Offset(0, _hovered ? -0.02 : 0),
        child: AnimatedContainer(
          duration: duration,
          padding: EdgeInsets.all(context.sized(22, sm: 26)),
          decoration: BoxDecoration(
            color: AppColors.bgCard,
            borderRadius: BorderRadius.circular(12),
            border: Border.all(
              color: _hovered ? AppColors.accent : AppColors.border,
            ),
            boxShadow: [
              BoxShadow(
                color: AppColors.navyAlpha(_hovered ? 0.10 : 0.03),
                blurRadius: _hovered ? 30 : 12,
                offset: Offset(0, _hovered ? 12 : 4),
              ),
            ],
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              AnimatedContainer(
                duration: duration,
                width: 44,
                height: 44,
                decoration: BoxDecoration(
                  color: _hovered ? AppColors.accent : AppColors.accentSoft,
                  borderRadius: BorderRadius.circular(10),
                ),
                child: Icon(
                  widget.feature.icon,
                  size: 22,
                  color: _hovered ? Colors.white : AppColors.accent,
                ),
              ),
              const SizedBox(height: 16),
              Text(
                widget.feature.title,
                style: AppText.serif(
                  size: 19,
                  weight: FontWeight.w700,
                  color: AppColors.textPrimary,
                  height: 1.3,
                ),
              ),
              const SizedBox(height: 8),
              Text(
                widget.feature.description,
                style: AppText.sans(
                  size: 15,
                  color: AppColors.textSecondary,
                  height: 1.6,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
