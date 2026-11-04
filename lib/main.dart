import 'dart:async';

import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

import 'backend/auth_service.dart';
import 'backend/supabase_config.dart';
import 'screens/landing_page.dart';
import 'screens/reset_password_page.dart';
import 'screens/welcome_page.dart';
import 'theme/app_theme.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  // Restores any saved session, and on web picks up the session from an
  // email confirmation or password reset link.
  await Supabase.initialize(
    url: SupabaseConfig.url,
    publishableKey: SupabaseConfig.publishableKey,
  );
  runApp(const ShorApp());
}

final _navigatorKey = GlobalKey<NavigatorState>();

class ShorApp extends StatefulWidget {
  const ShorApp({super.key});

  @override
  State<ShorApp> createState() => _ShorAppState();
}

class _ShorAppState extends State<ShorApp> {
  StreamSubscription<void>? _recovery;
  bool _resetOpen = false;

  @override
  void initState() {
    super.initState();
    _recovery = authService.passwordRecovery.listen((_) => _openReset());
    // Password reset links come back as ?reset=1 on the website.
    if (kIsWeb && Uri.base.queryParameters['reset'] == '1') {
      WidgetsBinding.instance.addPostFrameCallback((_) {
        if (authService.isSignedIn) _openReset();
      });
    }
  }

  void _openReset() {
    if (_resetOpen) return;
    _resetOpen = true;
    _navigatorKey.currentState
        ?.push(
          MaterialPageRoute<void>(builder: (_) => const ResetPasswordPage()),
        )
        .whenComplete(() => _resetOpen = false);
  }

  @override
  void dispose() {
    _recovery?.cancel();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Shor - Where creators meet brands',
      navigatorKey: _navigatorKey,
      debugShowCheckedModeBanner: false,
      theme: AppTheme.light,
      // The website keeps the marketing page; the phone apps open on the
      // welcome screen (or straight into the app when signed in).
      home: kIsWeb ? const LandingPage() : const StartGate(),
    );
  }
}
