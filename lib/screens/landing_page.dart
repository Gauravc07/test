import 'package:flutter/material.dart';

import '../backend/auth_service.dart';
import 'auth_page.dart';
import 'home_shell.dart';

import '../sections/dashboard_preview_section.dart';
import '../sections/features_section.dart';
import '../sections/footer_section.dart';
import '../sections/hero_section.dart';
import '../sections/how_it_works_section.dart';
import '../sections/navigation_bar.dart';
import '../sections/testimonials_section.dart';
import '../sections/value_proposition_section.dart';

/// The marketing landing page: every section in one scroll view, with the
/// navigation floating above it.
class LandingPage extends StatefulWidget {
  const LandingPage({super.key});

  @override
  State<LandingPage> createState() => _LandingPageState();
}

class _LandingPageState extends State<LandingPage> {
  final _scrollController = ScrollController();
  final _sectionKeys = {
    for (final section in LandingSection.values) section: GlobalKey(),
  };

  static const _scrollDuration = Duration(milliseconds: 700);

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) => _resumeInstagram());
  }

  /// Instagram's OAuth flow ends with a redirect back to the site carrying
  /// `?instagram=connected|error`. Pick up where the creator left off.
  void _resumeInstagram() {
    final params = Uri.base.queryParameters;
    final result = params['instagram'];
    if (result == null || !mounted) return;
    if (!authService.isSignedIn) {
      openAccount(context);
      return;
    }
    Navigator.of(context).push(
      MaterialPageRoute<void>(
        builder: (_) => HomeShell(
          initialTab: HomeTab.insights,
          instagramNotice: (result: result, reason: params['reason']),
        ),
      ),
    );
  }

  void _scrollTo(LandingSection section) {
    double target = 0;
    if (section != LandingSection.home) {
      final box = _sectionKeys[section]?.currentContext?.findRenderObject();
      if (box is! RenderBox) return;
      // Sections have generous top padding, so landing their top edge just
      // under the navigation keeps headings clear of it.
      target =
          _scrollController.offset +
          box.localToGlobal(Offset.zero).dy -
          navOverlap(context) +
          24;
    }
    _scrollController.animateTo(
      target.clamp(0.0, _scrollController.position.maxScrollExtent),
      duration: _scrollDuration,
      curve: Curves.easeInOutCubic,
    );
  }

  /// Footer links that map to sections on this page.
  bool _handleFooterLink(String label) {
    final section = switch (label) {
      'Features' => LandingSection.features,
      'How It Works' => LandingSection.howItWorks,
      _ => null,
    };
    if (section == null) return false;
    _scrollTo(section);
    return true;
  }

  @override
  void dispose() {
    _scrollController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    Widget anchor(LandingSection section, Widget child) =>
        KeyedSubtree(key: _sectionKeys[section], child: child);

    return Scaffold(
      body: Stack(
        children: [
          SingleChildScrollView(
            controller: _scrollController,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                anchor(LandingSection.home, const HeroSection()),
                const ValuePropositionSection(),
                anchor(LandingSection.features, const FeaturesSection()),
                anchor(LandingSection.howItWorks, const HowItWorksSection()),
                const DashboardPreviewSection(),
                anchor(
                  LandingSection.testimonials,
                  const TestimonialsSection(),
                ),
                FooterSection(onLinkTap: _handleFooterLink),
              ],
            ),
          ),
          Positioned(
            top: 0,
            left: 0,
            right: 0,
            child: LandingNavigationBar(onNavigate: _scrollTo),
          ),
        ],
      ),
    );
  }
}
