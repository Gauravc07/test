import 'package:flutter/foundation.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

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
}

/// The app-wide auth service. Created on first use, after
/// `Supabase.initialize` has run in `main`.
AuthService authService = SupabaseAuthService();

class SupabaseAuthService implements AuthService {
  SupabaseAuthService([SupabaseClient? client]) : _clientOverride = client;

  final SupabaseClient? _clientOverride;
  SupabaseClient get _client => _clientOverride ?? Supabase.instance.client;

  @override
  bool get isSignedIn => _client.auth.currentSession != null;

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
        // On web, bring the user back to this site after they confirm.
        emailRedirectTo: kIsWeb ? Uri.base.origin : null,
        // Read by the handle_new_user trigger to create the profile.
        data: {
          'role': role.name,
          'full_name': fullName.trim(),
          if (role == AccountRole.brand && companyName != null)
            'company_name': companyName.trim(),
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
        .select('role, full_name, verified')
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
    );
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
      throw const AuthFailure(
        'We could not load your account. Please try again.',
      );
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
    if (e.statusCode == '429' || message.contains('rate limit')) {
      return 'Too many attempts. Please wait a minute and try again.';
    }
    return e.message;
  }
}
