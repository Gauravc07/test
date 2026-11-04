import 'package:flutter/material.dart';

import '../data/landing_content.dart';
import '../theme/app_colors.dart';
import '../theme/app_text.dart';
import '../utils/responsive.dart';
import '../widgets/coming_soon.dart';
import '../widgets/content_container.dart';
import '../widgets/responsive_grid.dart';

/// Site footer with four link columns and the copyright line.
class FooterSection extends StatelessWidget {
  const FooterSection({super.key, required this.onLinkTap});

  /// Returns true when the link was handled by scrolling to a section.
  final bool Function(String label) onLinkTap;

  @override
  Widget build(BuildContext context) {
    final r = context.sized;
    return Container(
      color: AppColors.navy,
      padding: EdgeInsets.fromLTRB(
        r(20, sm: 32, lg: 48),
        r(48, md: 64),
        r(20, sm: 32, lg: 48),
        32,
      ),
      child: ContentContainer(
        maxWidth: 1120,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            ResponsiveGrid(
              columns: context.responsive<int>(2, md: 4),
              spacing: r(24, sm: 32),
              runSpacing: 32,
              children: [
                for (final entry in LandingContent.footerColumns.entries)
                  _FooterColumn(
                    title: entry.key,
                    links: entry.value,
                    onTap: (label) {
                      if (!onLinkTap(label)) showComingSoon(context, label);
                    },
                  ),
              ],
            ),
            SizedBox(height: r(40, md: 56)),
            Container(height: 1, color: AppColors.white(0.08)),
            const SizedBox(height: 24),
            Text(
              '© ${DateTime.now().year} Shor. All rights reserved.',
              textAlign: TextAlign.center,
              style: AppText.sans(size: 14, color: AppColors.white(0.5)),
            ),
          ],
        ),
      ),
    );
  }
}

class _FooterColumn extends StatelessWidget {
  const _FooterColumn({
    required this.title,
    required this.links,
    required this.onTap,
  });

  final String title;
  final List<String> links;
  final ValueChanged<String> onTap;

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          title.toUpperCase(),
          style: AppText.label(color: AppColors.white(0.45)),
        ),
        const SizedBox(height: 18),
        for (final link in links)
          Padding(
            padding: const EdgeInsets.only(bottom: 10),
            child: _FooterLink(label: link, onTap: () => onTap(link)),
          ),
      ],
    );
  }
}

class _FooterLink extends StatefulWidget {
  const _FooterLink({required this.label, required this.onTap});

  final String label;
  final VoidCallback onTap;

  @override
  State<_FooterLink> createState() => _FooterLinkState();
}

class _FooterLinkState extends State<_FooterLink> {
  bool _hovered = false;

  @override
  Widget build(BuildContext context) {
    return Semantics(
      button: true,
      child: MouseRegion(
        cursor: SystemMouseCursors.click,
        onEnter: (_) => setState(() => _hovered = true),
        onExit: (_) => setState(() => _hovered = false),
        child: GestureDetector(
          onTap: widget.onTap,
          child: Text(
            widget.label,
            style: AppText.sans(
              size: 15,
              color: _hovered ? Colors.white : AppColors.white(0.7),
            ),
          ),
        ),
      ),
    );
  }
}
