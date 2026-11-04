import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:shor/backend/auth_service.dart';
import 'package:shor/backend/marketplace_service.dart';
import 'package:shor/screens/auth_page.dart';
import 'package:shor/theme/app_text.dart';

import 'support/fakes.dart';

/// In-memory stand-in for Supabase.
class FakeAuthService implements AuthService {
  FakeAuthService({this.requireConfirmation = false, this.signInError});

  final bool requireConfirmation;
  final String? signInError;
  Map<String, Object?>? lastSignUp;
  bool signedIn = false;

  @override
  bool get isSignedIn => signedIn;

  @override
  Future<SignUpOutcome> signUp({
    required String email,
    required String password,
    required String fullName,
    required AccountRole role,
    String? companyName,
  }) async {
    lastSignUp = {
      'email': email,
      'fullName': fullName,
      'role': role,
      'companyName': companyName,
    };
    if (requireConfirmation) return SignUpOutcome.confirmEmail;
    signedIn = true;
    return SignUpOutcome.signedIn;
  }

  @override
  Future<void> signIn({required String email, required String password}) async {
    if (signInError != null) throw AuthFailure(signInError!);
    signedIn = true;
  }

  @override
  Future<void> signOut() async => signedIn = false;

  @override
  Stream<bool> get sessionChanges => const Stream.empty();

  @override
  Stream<void> get passwordRecovery => const Stream.empty();

  String? resetEmail;

  @override
  Future<void> sendPasswordReset(String email) async => resetEmail = email;

  @override
  Future<void> acceptTerms() async {}

  @override
  Future<void> updatePassword(String password) async {}

  @override
  Future<void> deleteAccount() async => signedIn = false;

  @override
  Future<Account> loadAccount() async => const Account(
    id: 'u1',
    email: 'bea@acme.test',
    role: AccountRole.brand,
    fullName: 'Bea Brand',
    companyName: 'Acme Co',
  );
}

Future<void> pumpAuth(
  WidgetTester tester,
  AuthService service, {
  AuthMode mode = AuthMode.signIn,
}) async {
  tester.view.physicalSize = const Size(390, 1400);
  tester.view.devicePixelRatio = 1;
  addTearDown(tester.view.reset);
  await tester.pumpWidget(
    MaterialApp(
      home: AuthPage(initialMode: mode, service: service),
    ),
  );
}

Finder field(String label) => find.widgetWithText(TextFormField, label);

void main() {
  AppText.useGoogleFonts = false;

  testWidgets('sign-up validates before calling the backend', (tester) async {
    final service = FakeAuthService();
    await pumpAuth(tester, service, mode: AuthMode.signUp);

    await tester.tap(find.text('Create account'));
    await tester.pump();

    expect(find.text('Enter your name'), findsOneWidget);
    expect(find.text('Enter a valid email'), findsOneWidget);
    expect(service.lastSignUp, isNull);
  });

  testWidgets('brand sign-up sends role and company, then asks to confirm', (
    tester,
  ) async {
    final service = FakeAuthService(requireConfirmation: true);
    await pumpAuth(tester, service, mode: AuthMode.signUp);

    await tester.tap(find.text('Brand'));
    await tester.pump();
    await tester.enterText(field('Full name'), 'Bea Brand');
    await tester.enterText(field('Company or brand name'), 'Acme Co');
    await tester.enterText(field('Email'), 'bea@acme.test');
    await tester.enterText(field('Password'), 'supersecret');
    await tester.enterText(field('Confirm password'), 'supersecret');

    // The terms must be accepted before an account is created.
    await tester.tap(find.text('Create account'));
    await tester.pumpAndSettle();
    expect(find.text('Please agree to the terms to continue'), findsOneWidget);
    expect(service.lastSignUp, isNull);

    await tester.tap(find.byType(Checkbox));
    await tester.tap(find.text('Create account'));
    await tester.pumpAndSettle();

    expect(service.lastSignUp, {
      'email': 'bea@acme.test',
      'fullName': 'Bea Brand',
      'role': AccountRole.brand,
      'companyName': 'Acme Co',
    });
    expect(find.text('Check your inbox'), findsOneWidget);
  });

  testWidgets('forgot password sends a reset link', (tester) async {
    final service = FakeAuthService();
    await pumpAuth(tester, service);

    await tester.enterText(field('Email'), 'bea@acme.test');
    await tester.tap(find.text('Forgot password?'));
    await tester.pumpAndSettle();
    expect(find.text('Reset your password'), findsOneWidget);
    await tester.tap(find.text('Send link'));
    await tester.pumpAndSettle();

    expect(service.resetEmail, 'bea@acme.test');
    expect(find.textContaining('we sent a link'), findsOneWidget);
  });

  testWidgets('login opens the brand home for a brand account', (tester) async {
    marketplaceService = FakeMarketplace(userId: brandId);
    await pumpAuth(tester, FakeAuthService());

    await tester.enterText(field('Email'), 'bea@acme.test');
    await tester.enterText(field('Password'), 'whatever');
    await tester.tap(find.text('Log in'));
    await tester.pumpAndSettle();

    // Brand tabs: campaigns first.
    expect(find.text('New campaign'), findsOneWidget);
    expect(find.text('Creators'), findsWidgets);
    expect(tester.takeException(), isNull);
  });

  testWidgets('login shows backend errors', (tester) async {
    await pumpAuth(
      tester,
      FakeAuthService(
        signInError: 'That email and password do not match an account.',
      ),
    );

    await tester.enterText(field('Email'), 'bea@acme.test');
    await tester.enterText(field('Password'), 'wrong');
    await tester.tap(find.text('Log in'));
    await tester.pumpAndSettle();

    expect(
      find.text('That email and password do not match an account.'),
      findsOneWidget,
    );
  });
}
