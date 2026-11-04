import 'package:flutter/material.dart';

import '../backend/auth_service.dart';
import '../config/app_config.dart';
import '../sections/navigation_bar.dart' show Wordmark;
import '../theme/app_colors.dart';
import '../theme/app_text.dart';
import '../utils/links.dart';
import '../widgets/app_buttons.dart';

/// Shown to signed-in people who have not accepted the current Terms of Use
/// (accounts created before terms were required, or after a terms update).
/// Nothing can be posted until they accept.
class TermsAcceptancePage extends StatefulWidget {
  const TermsAcceptancePage({
    super.key,
    required this.auth,
    required this.onAccepted,
    required this.onSignOut,
  });

  final AuthService auth;
  final VoidCallback onAccepted;
  final VoidCallback onSignOut;

  @override
  State<TermsAcceptancePage> createState() => _TermsAcceptancePageState();
}

class _TermsAcceptancePageState extends State<TermsAcceptancePage> {
  bool _busy = false;
  String? _error;

  Future<void> _accept() async {
    if (_busy) return;
    setState(() {
      _busy = true;
      _error = null;
    });
    try {
      await widget.auth.acceptTerms();
      widget.onAccepted();
    } on AuthFailure catch (e) {
      if (mounted) setState(() => _error = e.message);
    } finally {
      if (mounted) setState(() => _busy = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    Widget rule(String text) => Padding(
      padding: const EdgeInsets.symmetric(vertical: 5),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Padding(
            padding: EdgeInsets.only(top: 2, right: 10),
            child: Icon(Icons.check, size: 18, color: AppColors.accent),
          ),
          Expanded(
            child: Text(text, style: AppText.sans(size: 15, height: 1.45)),
          ),
        ],
      ),
    );

    return Scaffold(
      body: SafeArea(
        child: Center(
          child: SingleChildScrollView(
            padding: const EdgeInsets.all(24),
            child: ConstrainedBox(
              constraints: const BoxConstraints(maxWidth: 520),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  const Align(
                    alignment: Alignment.centerLeft,
                    child: Wordmark(),
                  ),
                  const SizedBox(height: 28),
                  Text('Before you continue', style: AppText.heading(28)),
                  const SizedBox(height: 10),
                  Text(
                    'Shor is a community of creators and brands. To keep it safe, '
                    'everyone agrees to our Terms of Use and Community Guidelines.',
                    style: AppText.serif(size: 16, height: 1.5),
                  ),
                  const SizedBox(height: 18),
                  rule(
                    'No harassment, hate, threats, sexual content or scams. There is zero tolerance for abusive content or users.',
                  ),
                  rule('Be honest about your audience, prices and products.'),
                  rule(
                    'Label sponsored posts clearly (for example #ad), as the law requires.',
                  ),
                  rule(
                    'Report anything that breaks these rules. We review reports within 24 hours and remove content or accounts that break them.',
                  ),
                  const SizedBox(height: 14),
                  Wrap(
                    children: [
                      TextButton(
                        onPressed: () => openInAppBrowser(AppConfig.termsUrl),
                        child: const Text('Read the Terms of Use'),
                      ),
                      TextButton(
                        onPressed: () =>
                            openInAppBrowser(AppConfig.privacyPolicyUrl),
                        child: const Text('Read the Privacy Policy'),
                      ),
                    ],
                  ),
                  if (_error != null) ...[
                    const SizedBox(height: 8),
                    Text(
                      _error!,
                      style: AppText.sans(
                        size: 14,
                        color: const Color(0xFF9B1C1C),
                      ),
                    ),
                  ],
                  const SizedBox(height: 16),
                  SolidButton(
                    label: _busy ? 'Saving…' : 'I agree',
                    fullWidth: true,
                    onPressed: _accept,
                  ),
                  const SizedBox(height: 10),
                  OutlineActionButton(
                    label: 'Log out',
                    fullWidth: true,
                    onPressed: widget.onSignOut,
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
