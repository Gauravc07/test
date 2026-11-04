import 'package:flutter/foundation.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

import '../config/app_config.dart';

/// The two kinds of Shor account. Matches the `user_role` enum in the
/// database.
enum AccountRole { creator, brand }

/// The signed-in user's profile, read from the database.
class Account {
  const Account({
    required this.id,
    required this.email,
    required this.role,
    required this.fullName,
    this.companyName,
    this.handle,
    this.verified = false,
    this.termsVersion = AppConfig.termsVersion,
  });

  final String id;
  final String email;
  final AccountRole role;
  final String fullName;

  /// Brands only.
  final String? companyName;

  /// Creators only; empty until they pick one.
  final String? handle;
  final bool verified;

  /// The Terms of Use version this person accepted, if any.
  final String? termsVersion;

  /// True when the person must accept the current Terms before continuing.
  bool get needsTerms => termsVersion != AppConfig.termsVersion;
}

enum SignUpOutcome {
  /// The account is ready and the user is signed in.
  signedIn,

  /// The project requires email confirmation; the user must click the link
  /// we emailed before they can sign in.
  confirmEmail,
}

/// A failure worth showing to the user as-is.
class AuthFailure implements Exception {
  const AuthFailure(this.message);

  final String message;

  @override
  String toString() => message;
}

/// Everything the screens need from the backend for accounts. Screens take
/// this interface so tests can pass a fake.
abstract interface class AuthService {
  bool get isSignedIn;

  /// Emits whether someone is signed in, whenever that changes (log in,
  /// log out, account deleted).
  Stream<bool> get sessionChanges;

  /// Fires when someone opens a password reset link.
  Stream<void> get passwordRecovery;

  /// Signing up also records acceptance of the current Terms of Use.
  Future<SignUpOutcome> signUp({
    required String email,
    required String password,
    required String fullName,
    required AccountRole role,
    String? companyName,
  });

  Future<void> signIn({required String email, required String password});

  Future<void> signOut();

  Future<Account> loadAccount();

  /// Records acceptance of [AppConfig.termsVersion].
  Future<void> acceptTerms();

  /// Emails a link to set a new password.
  Future<void> sendPasswordReset(String email);

  /// Sets a new password for the signed-in user (after a reset link).
  Future<void> updatePassword(String password);

  /// Permanently deletes the signed-in user's account and signs out.
  Future<void> deleteAccount();
}

/// The app-wide auth service. Created on first use, after
/// `Supabase.initialize` has run in `main`.
AuthService authService = SupabaseAuthService();

class SupabaseAuthService implements AuthService {
  SupabaseAuthService([SupabaseClient? client]) : _clientOverride = client;

  final SupabaseClient? _clientOverride;
  SupabaseClient get _client => _clientOverride ?? Supabase.instance.client;

  /// Where email links (confirmation, password reset) open. On the web the
  /// current site; on phones the public website.
  static String get _redirectBase =>
      kIsWeb ? Uri.base.origin : AppConfig.websiteUrl;

  @override
  bool get isSignedIn => _client.auth.currentSession != null;

  @override
  Stream<bool> get sessionChanges =>
      _client.auth.onAuthStateChange.map((s) => s.session != null).distinct();

  @override
  Stream<void> get passwordRecovery => _client.auth.onAuthStateChange
      .where((s) => s.event == AuthChangeEvent.passwordRecovery)
      .map((_) {});

  @override
  Future<SignUpOutcome> signUp({
    required String email,
    required String password,
    required String fullName,
    required AccountRole role,
    String? companyName,
  }) async {
    final response = await _guard(
      () => _client.auth.signUp(
        email: email.trim(),
        password: password,
        emailRedirectTo: '$_redirectBase/',
        // Read by the handle_new_user trigger to create the profile.
        data: {
          'role': role.name,
          'full_name': fullName.trim(),
          if (role == AccountRole.brand && companyName != null)
            'company_name': companyName.trim(),
          'terms_version': AppConfig.termsVersion,
        },
      ),
    );
    return response.session != null
        ? SignUpOutcome.signedIn
        : SignUpOutcome.confirmEmail;
  }

  @override
  Future<void> signIn({required String email, required String password}) =>
      _guard(
        () => _client.auth.signInWithPassword(
          email: email.trim(),
          password: password,
        ),
      );

  @override
  Future<void> signOut() => _guard(() => _client.auth.signOut());

  @override
  Future<Account> loadAccount() => _guard(() async {
    final user = _client.auth.currentUser;
    if (user == null) throw const AuthFailure('You are signed out.');

    final profile = await _client
        .from('profiles')
        .select('role, full_name, verified, terms_version')
        .eq('id', user.id)
        .single();
    final role = AccountRole.values.byName(profile['role'] as String);

    String? companyName;
    String? handle;
    if (role == AccountRole.brand) {
      final brand = await _client
          .from('brand_profiles')
          .select('company_name')
          .eq('id', user.id)
          .maybeSingle();
      companyName = brand?['company_name'] as String?;
    } else {
      final creator = await _client
          .from('creator_profiles')
          .select('handle')
          .eq('id', user.id)
          .maybeSingle();
      handle = creator?['handle'] as String?;
    }

    return Account(
      id: user.id,
      email: user.email ?? '',
      role: role,
      fullName: profile['full_name'] as String? ?? '',
      companyName: companyName,
      handle: handle,
      verified: profile['verified'] as bool? ?? false,
      termsVersion: profile['terms_version'] as String?,
    );
  });

  @override
  Future<void> acceptTerms() => _guard(
    () => _client.rpc(
      'accept_terms',
      params: {'p_version': AppConfig.termsVersion},
    ),
  );

  @override
  Future<void> sendPasswordReset(String email) => _guard(
    () => _client.auth.resetPasswordForEmail(
      email.trim(),
      // reset=1 lets the web app open the "set a new password" screen.
      redirectTo: '$_redirectBase/?reset=1',
    ),
  );

  @override
  Future<void> updatePassword(String password) =>
      _guard(() => _client.auth.updateUser(UserAttributes(password: password)));

  @override
  Future<void> deleteAccount() => _guard(() async {
    await _client.rpc('delete_my_account');
    // The server sessions are gone with the account; clear this device.
    await _client.auth.signOut(scope: SignOutScope.local);
  });

  /// Turns Supabase and network errors into messages fit for the UI.
  Future<T> _guard<T>(Future<T> Function() run) async {
    try {
      return await run();
    } on AuthFailure {
      rethrow;
    } on AuthException catch (e) {
      throw AuthFailure(_friendlyAuthMessage(e));
    } on PostgrestException catch (e) {
      debugPrint('Supabase query failed: ${e.code} ${e.message}');
      throw const AuthFailure('We could not complete that. Please try again.');
    } catch (e) {
      debugPrint('Supabase request failed: $e');
      throw const AuthFailure(
        'Could not reach Shor. Check your connection and try again.',
      );
    }
  }

  static String _friendlyAuthMessage(AuthException e) {
    final message = e.message.toLowerCase();
    if (message.contains('invalid login credentials')) {
      return 'That email and password do not match an account.';
    }
    if (message.contains('email not confirmed')) {
      return 'Please confirm your email first. Check your inbox for the link.';
    }
    if (message.contains('already registered')) {
      return 'An account with this email already exists. Try logging in.';
    }
    if (message.contains('should be different')) {
      return 'Choose a password you have not used before.';
    }
    if (e.statusCode == '429' || message.contains('rate limit')) {
      return 'Too many attempts. Please wait a minute and try again.';
    }
    return e.message;
  }
}
