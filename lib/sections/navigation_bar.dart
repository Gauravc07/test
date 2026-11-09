import 'dart:ui';

import 'package:flutter/material.dart';

import '../screens/auth_page.dart';
import '../theme/app_colors.dart';
import '../theme/app_text.dart';
import '../utils/responsive.dart';
import '../widgets/coming_soon.dart';

/// Sections of the landing page that navigation links can scroll to.
enum LandingSection { home, features, howItWorks, pricing, testimonials }

/// How far the fixed navigation reaches down the screen, so content and
/// scroll targets can clear it.
double navOverlap(BuildContext context) =>
    MediaQuery.paddingOf(context).top + (context.isLg ? 84 : 64);

/// A navigation entry: scrolls to a [section], opens login / sign-up
/// ([auth]), or, for pages not built yet, shows a "coming soon" notice.
class _NavLink {
  const _NavLink(this.label, {this.section, this.auth});

  final String label;
  final LandingSection? section;
  final AuthMode? auth;
}

/// Page directory shown in the "All Pages" menu, grouped like the original.
const _pageGroups = <String, List<_NavLink>>{
  'Landing': [
    _NavLink('Home', section: LandingSection.home),
    _NavLink('Features', section: LandingSection.features),
    _NavLink('How It Works', section: LandingSection.howItWorks),
  ],
  'Essentials': [
    _NavLink('About'),
    _NavLink('Integrations'),
    _NavLink('Pricing', section: LandingSection.pricing),
    _NavLink('Contact Us'),
  ],
  'Resources': [
    _NavLink('Blog'),
    _NavLink('Changelog'),
    _NavLink('Connect Instagram'),
  ],
  'Legal': [_NavLink('Terms'), _NavLink('Privacy')],
};

const _accountLinks = [
  _NavLink('Login', auth: AuthMode.signIn),
  _NavLink('Sign Up', auth: AuthMode.signUp),
];

/// The "Shor" wordmark: serif name under a short accent bar.
class Wordmark extends StatelessWidget {
  const Wordmark({super.key, this.dark = false, this.onTap});

  /// Light colours for navy backgrounds.
  final bool dark;
  final VoidCallback? onTap;

  @override
  Widget build(BuildContext context) {
    final mark = Column(
      mainAxisSize: MainAxisSize.min,
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Container(
          width: 24,
          height: 3,
          decoration: BoxDecoration(
            color: dark ? AppColors.accentOnDark : AppColors.accent,
            borderRadius: BorderRadius.circular(2),
          ),
        ),
        const SizedBox(height: 3),
        Text(
          'Shor',
          style: AppText.serif(
            size: 22,
            weight: FontWeight.w700,
            color: dark ? Colors.white : AppColors.textPrimary,
            height: 1.1,
            letterSpacing: -0.4,
          ),
        ),
      ],
    );
    if (onTap == null) return mark;
    return Semantics(
      button: true,
      label: 'Shor home',
      excludeSemantics: true,
      child: MouseRegion(
        cursor: SystemMouseCursors.click,
        child: GestureDetector(onTap: onTap, child: mark),
      ),
    );
  }
}

/// Top navigation: a floating pill on large screens, a full-width bar with a
/// menu button on smaller ones.
class LandingNavigationBar extends StatelessWidget {
  const LandingNavigationBar({super.key, required this.onNavigate});

  final ValueChanged<LandingSection> onNavigate;

  void _handle(BuildContext context, _NavLink link) {
    final section = link.section;
    final auth = link.auth;
    if (section != null) {
      onNavigate(section);
    } else if (auth != null) {
      openAccount(context, mode: auth);
    } else {
      showComingSoon(context, link.label);
    }
  }

  @override
  Widget build(BuildContext context) {
    return context.isLg ? _buildDesktop(context) : _buildMobile(context);
  }

  Widget _buildDesktop(BuildContext context) {
    final screen = context.screenWidth;
    final width = (screen * 0.75).clamp(960.0, 1152.0).clamp(0.0, screen - 32);
    final gap = context.isXl ? 36.0 : 28.0;

    return SafeArea(
      bottom: false,
      child: Padding(
        padding: const EdgeInsets.only(top: 16),
        child: Center(
          child: Container(
            width: width,
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(999),
              boxShadow: [
                BoxShadow(
                  color: AppColors.navyAlpha(0.08),
                  blurRadius: 30,
                  offset: const Offset(0, 10),
                ),
              ],
            ),
            child: ClipRRect(
              borderRadius: BorderRadius.circular(999),
              child: BackdropFilter(
                filter: ImageFilter.blur(sigmaX: 14, sigmaY: 14),
                child: Container(
                  padding: const EdgeInsets.fromLTRB(28, 8, 8, 8),
                  decoration: BoxDecoration(
                    color: AppColors.bgCard.withValues(alpha: 0.88),
                    borderRadius: BorderRadius.circular(999),
                    border: Border.all(color: AppColors.border),
                  ),
                  child: Row(
                    children: [
                      Wordmark(onTap: () => onNavigate(LandingSection.home)),
                      const SizedBox(width: 24),
                      Expanded(
                        child: Align(
                          alignment: Alignment.centerRight,
                          child: FittedBox(
                            fit: BoxFit.scaleDown,
                            child: Row(
                              children: [
                                _MenuButton(
                                  groups: _pageGroups,
                                  onSelected: (link) => _handle(context, link),
                                  child: const _NavText(
                                    'All Pages',
                                    trailingChevron: true,
                                  ),
                                ),
                                SizedBox(width: gap),
                                for (final link in const [
                                  _NavLink('Integrations'),
                                  _NavLink(
                                    'Pricing',
                                    section: LandingSection.pricing,
                                  ),
                                  _NavLink('Contact Us'),
                                ]) ...[
                                  _NavTextLink(
                                    link.label,
                                    onTap: () => _handle(context, link),
                                  ),
                                  SizedBox(width: gap),
                                ],
                                _MenuButton(
                                  groups: const {'': _accountLinks},
                                  onSelected: (link) => _handle(context, link),
                                  child: Container(
                                    height: 42,
                                    padding: const EdgeInsets.symmetric(
                                      horizontal: 20,
                                    ),
                                    decoration: BoxDecoration(
                                      color: AppColors.navy,
                                      borderRadius: BorderRadius.circular(999),
                                    ),
                                    child: Row(
                                      mainAxisSize: MainAxisSize.min,
                                      children: [
                                        Text(
                                          'Get Started',
                                          style: AppText.sans(
                                            size: 14,
                                            weight: FontWeight.w600,
                                            color: Colors.white,
                                          ),
                                        ),
                                        const SizedBox(width: 6),
                                        const Icon(
                                          Icons.keyboard_arrow_down,
                                          size: 16,
                                          color: Colors.white,
                                        ),
                                      ],
                                    ),
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildMobile(BuildContext context) {
    return Container(
      decoration: const BoxDecoration(
        color: AppColors.bgPrimary,
        border: Border(bottom: BorderSide(color: AppColors.border)),
      ),
      child: SafeArea(
        bottom: false,
        child: SizedBox(
          height: 64,
          child: Padding(
            padding: EdgeInsets.symmetric(horizontal: context.isSm ? 24 : 16),
            child: Row(
              children: [
                Wordmark(onTap: () => onNavigate(LandingSection.home)),
                const Spacer(),
                _MenuButton(
                  groups: {..._pageGroups, 'Account': _accountLinks},
                  onSelected: (link) => _handle(context, link),
                  child: const Padding(
                    padding: EdgeInsets.all(10),
                    child: Icon(
                      Icons.menu,
                      color: AppColors.textPrimary,
                      size: 24,
                    ),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

class _NavText extends StatelessWidget {
  const _NavText(
    this.label, {
    this.trailingChevron = false,
    this.hovered = false,
  });

  final String label;
  final bool trailingChevron;
  final bool hovered;

  @override
  Widget build(BuildContext context) {
    final color = hovered ? AppColors.textPrimary : AppColors.textSecondary;
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Text(
          label,
          style: AppText.sans(size: 15, weight: FontWeight.w500, color: color),
        ),
        if (trailingChevron) ...[
          const SizedBox(width: 4),
          Icon(Icons.keyboard_arrow_down, size: 16, color: color),
        ],
      ],
    );
  }
}

class _NavTextLink extends StatefulWidget {
  const _NavTextLink(this.label, {required this.onTap});

  final String label;
  final VoidCallback onTap;

  @override
  State<_NavTextLink> createState() => _NavTextLinkState();
}

class _NavTextLinkState extends State<_NavTextLink> {
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
          child: _NavText(widget.label, hovered: _hovered),
        ),
      ),
    );
  }
}

/// Popup menu that lists links under optional group headers.
class _MenuButton extends StatelessWidget {
  const _MenuButton({
    required this.groups,
    required this.onSelected,
    required this.child,
  });

  final Map<String, List<_NavLink>> groups;
  final ValueChanged<_NavLink> onSelected;
  final Widget child;

  List<PopupMenuEntry<_NavLink>> _buildItems() {
    final items = <PopupMenuEntry<_NavLink>>[];
    groups.forEach((group, links) {
      if (items.isNotEmpty) items.add(const PopupMenuDivider(height: 9));
      if (group.isNotEmpty) {
        items.add(
          PopupMenuItem<_NavLink>(
            enabled: false,
            height: 30,
            child: Text(group.toUpperCase(), style: AppText.label()),
          ),
        );
      }
      for (final link in links) {
        items.add(
          PopupMenuItem<_NavLink>(
            value: link,
            height: 40,
            child: Text(link.label, style: AppText.sans(size: 15)),
          ),
        );
      }
    });
    return items;
  }

  @override
  Widget build(BuildContext context) {
    return PopupMenuButton<_NavLink>(
      tooltip: '',
      position: PopupMenuPosition.under,
      offset: const Offset(0, 14),
      constraints: const BoxConstraints(minWidth: 200, maxWidth: 260),
      onSelected: onSelected,
      itemBuilder: (_) => _buildItems(),
      child: MouseRegion(cursor: SystemMouseCursors.click, child: child),
    );
  }
}
