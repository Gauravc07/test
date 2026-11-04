import 'dart:async';

import 'package:flutter/material.dart';

import '../backend/auth_service.dart';
import '../config/app_config.dart';
import '../sections/navigation_bar.dart' show Wordmark;
import '../theme/app_colors.dart';
import '../theme/app_text.dart';
import '../utils/links.dart';
import '../widgets/app_buttons.dart';
import 'auth_page.dart';
import 'home_shell.dart';

/// The mobile app's root: the welcome screen when signed out, the home tabs
/// when signed in. Rebuilds on log in, log out and account deletion.
class StartGate extends StatefulWidget {
  const StartGate({super.key, this.auth});

  final AuthService? auth;

  @override
  State<StartGate> createState() => _StartGateState();
}

class _StartGateState extends State<StartGate> {
  AuthService get _auth => widget.auth ?? authService;
  late bool _signedIn = _auth.isSignedIn;
  StreamSubscription<bool>? _sub;

  @override
  void initState() {
    super.initState();
    _sub = _auth.sessionChanges.listen((signedIn) {
      if (mounted && signedIn != _signedIn) {
        setState(() {
          _signedIn = signedIn;
        });
      }
    });
  }

  @override
  void dispose() {
    _sub?.cancel();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) =>
      _signedIn ? HomeShell(auth: widget.auth) : WelcomePage(auth: widget.auth);
}

/// First screen of the mobile apps for signed-out visitors.
class WelcomePage extends StatelessWidget {
  const WelcomePage({super.key, this.auth});

  final AuthService? auth;

  void _open(BuildContext context, AuthMode mode) => Navigator.of(context).push(
    MaterialPageRoute<void>(
      builder: (_) =>
          AuthPage(initialMode: mode, service: auth, popOnSuccess: true),
    ),
  );

  @override
  Widget build(BuildContext context) {
    Widget point(IconData icon, String title, String text) => Padding(
      padding: const EdgeInsets.symmetric(vertical: 8),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            width: 40,
            height: 40,
            decoration: const BoxDecoration(
              color: AppColors.accentSoft,
              shape: BoxShape.circle,
            ),
            child: Icon(icon, color: AppColors.accent, size: 20),
          ),
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  style: AppText.sans(size: 16, weight: FontWeight.w600),
                ),
                const SizedBox(height: 2),
                Text(
                  text,
                  style: AppText.sans(size: 14, color: AppColors.textSecondary),
                ),
              ],
            ),
          ),
        ],
      ),
    );

    return Scaffold(
      body: SafeArea(
        child: Center(
          child: SingleChildScrollView(
            padding: const EdgeInsets.fromLTRB(24, 32, 24, 24),
            child: ConstrainedBox(
              constraints: const BoxConstraints(maxWidth: 460),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  const Align(
                    alignment: Alignment.centerLeft,
                    child: Wordmark(),
                  ),
                  const SizedBox(height: 36),
                  Text(
                    'Where creators meet brands',
                    style: AppText.heading(34),
                  ),
                  const SizedBox(height: 10),
                  Text(
                    'Find Instagram campaigns, collaborate and get paid. Or find the '
                    'right creators for your brand.',
                    style: AppText.serif(size: 17, height: 1.5),
                  ),
                  const SizedBox(height: 28),
                  point(
                    Icons.campaign_outlined,
                    'For creators',
                    'Apply to campaigns, share drafts and live posts, and request payment.',
                  ),
                  point(
                    Icons.storefront_outlined,
                    'For brands',
                    'Write a brief, invite creators, review content and see results.',
                  ),
                  // Only promise Instagram stats when that feature is on.
                  if (AppConfig.instagramEnabled)
                    point(
                      Icons.verified_outlined,
                      'Real numbers',
                      'Creators can connect Instagram so brands see verified stats.',
                    )
                  else
                    point(
                      Icons.shield_outlined,
                      'Safe by design',
                      'Report or block anyone. Reports are reviewed within 24 hours.',
                    ),
                  const SizedBox(height: 32),
                  SolidButton(
                    label: 'Create an account',
                    fullWidth: true,
                    onPressed: () => _open(context, AuthMode.signUp),
                  ),
                  const SizedBox(height: 12),
                  OutlineActionButton(
                    label: 'Log in',
                    fullWidth: true,
                    onPressed: () => _open(context, AuthMode.signIn),
                  ),
                  const SizedBox(height: 20),
                  Wrap(
                    alignment: WrapAlignment.center,
                    children: [
                      TextButton(
                        onPressed: () => openInAppBrowser(AppConfig.termsUrl),
                        child: const Text('Terms of use'),
                      ),
                      TextButton(
                        onPressed: () =>
                            openInAppBrowser(AppConfig.privacyPolicyUrl),
                        child: const Text('Privacy policy'),
                      ),
                      TextButton(
                        onPressed: () => openInAppBrowser(AppConfig.supportUrl),
                        child: const Text('Help'),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}
