import 'package:flutter/foundation.dart';

/// App-wide settings that the stores and legal pages depend on. Override any
/// of them at build time, e.g.
///   flutter build appbundle --dart-define=INSTAGRAM_ENABLED=true
class AppConfig {
  AppConfig._();

  /// Public website that hosts the privacy policy, terms and support pages.
  static const _website = String.fromEnvironment(
    'SHOR_WEBSITE_URL',
    defaultValue: 'https://test-lilac-seven-86.vercel.app',
  );

  /// Monitored address published as Shor's support and privacy contact.
  static const supportEmail = String.fromEnvironment(
    'SHOR_SUPPORT_EMAIL',
    defaultValue: 'chindhegaurav5@gmail.com',
  );

  /// Bump when the Terms of Use or Privacy Policy change materially;
  /// signed-in users are then asked to accept again.
  static const termsVersion = '2026-11';

  /// The Instagram Insights tab. Meta only lets outside creators connect
  /// once the Meta app passes App Review, so store (release) builds hide it
  /// unless built with --dart-define=INSTAGRAM_ENABLED=true. Debug builds
  /// show it so testers added to the Meta app can try it.
  static const instagramEnabled = bool.fromEnvironment(
    'INSTAGRAM_ENABLED',
    defaultValue: !kReleaseMode,
  );

  /// URL scheme the mobile apps return to after connecting Instagram.
  static const appScheme = 'shor';

  /// On the web, link to pages on the same site; elsewhere, the public site.
  static String get websiteUrl {
    final base = kIsWeb && Uri.base.hasAuthority ? Uri.base.origin : _website;
    return base.endsWith('/') ? base.substring(0, base.length - 1) : base;
  }

  static Uri get privacyPolicyUrl => Uri.parse('$websiteUrl/privacy.html');
  static Uri get termsUrl => Uri.parse('$websiteUrl/terms.html');
  static Uri get supportUrl => Uri.parse('$websiteUrl/support.html');
  static Uri get deleteAccountUrl =>
      Uri.parse('$websiteUrl/delete-account.html');
  static Uri get supportMailto => Uri(
    scheme: 'mailto',
    path: supportEmail,
    queryParameters: {'subject': 'Shor support'},
  );
}
