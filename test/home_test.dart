import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:shor/backend/marketplace_service.dart';
import 'package:shor/screens/brand/brand_campaign_page.dart';
import 'package:shor/screens/collaboration_page.dart';
import 'package:shor/screens/home_shell.dart';
import 'package:shor/screens/home_tab.dart';
import 'package:shor/theme/app_text.dart';

import 'marketplace_test.dart' show pump, tapText;
import 'support/fakes.dart';

Widget _home(FakeMarketplace m, {required bool brand}) => HomeShell(
  auth: FakeAuth(brand ? brandAccount : creatorAccount),
  marketplace: m,
  instagram: FakeInstagram(),
);

void main() {
  AppText.useGoogleFonts = false;

  test('greeting follows the time of day', () {
    expect(greetingFor(DateTime(2026, 11, 11, 8)), 'Good morning');
    expect(greetingFor(DateTime(2026, 11, 11, 14)), 'Good afternoon');
    expect(greetingFor(DateTime(2026, 11, 11, 20)), 'Good evening');
  });

  for (final size in const [Size(390, 900), Size(1280, 900)]) {
    testWidgets('home opens first and fits at ${size.width.toInt()}px', (
      tester,
    ) async {
      await pump(
        tester,
        _home(FakeMarketplace(userId: brandId), brand: true),
        size: size,
      );
      expect(find.text('Next step'), findsOne);
      expect(find.text('Today’s overview'), findsOne);
      expect(find.text('Quick actions'), findsOne);
      expect(tester.takeException(), isNull);
    });
  }

  group('creator next step', () {
    testWidgets('an invitation comes first', (tester) async {
      final m = FakeMarketplace(userId: creatorId);
      m.addCollab(status: CollabStatus.invited);
      m.addCollab(campaignId: 'camp-2', status: CollabStatus.accepted);
      await pump(tester, _home(m, brand: false), size: const Size(390, 900));
      expect(
        find.text('Acme Skin invited you to Monsoon skincare reels'),
        findsOne,
      );
      expect(find.textContaining('₹12,000'), findsWidgets);

      await tester.tap(find.byKey(const ValueKey('next-step-action')));
      await tester.pumpAndSettle();
      expect(find.byType(CollaborationPage), findsOne);
    });

    testWidgets('a finished deal without an invoice asks for payment', (
      tester,
    ) async {
      final m = FakeMarketplace(userId: creatorId);
      m.addCollab(status: CollabStatus.completed);
      await pump(tester, _home(m, brand: false), size: const Size(390, 900));
      expect(find.text('Request your ₹12,000 from Acme Skin'), findsOne);
    });

    testWidgets('with nothing to do, it points to open campaigns', (
      tester,
    ) async {
      await pump(
        tester,
        _home(FakeMarketplace(userId: creatorId), brand: false),
        size: const Size(390, 900),
      );
      expect(find.text('2 campaigns are open now'), findsOne);
      await tapText(tester, 'Browse');
      expect(find.text('Monsoon skincare reels'), findsOne);
    });
  });

  group('brand next step', () {
    testWidgets('a pending invoice comes first', (tester) async {
      final m = FakeMarketplace(userId: creatorId);
      final c = m.addCollab(status: CollabStatus.completed, amount: 20000);
      await m.requestPayment(await m.collaboration(c.id));
      m.userId = brandId;
      await pump(tester, _home(m, brand: true), size: const Size(390, 900));
      expect(find.textContaining('invoice for ₹21,652'), findsOne);
    });

    testWidgets('applications send you to the campaign', (tester) async {
      final m = FakeMarketplace(userId: brandId);
      m.addCollab(status: CollabStatus.applied);
      await pump(tester, _home(m, brand: true), size: const Size(390, 900));
      expect(
        find.text('1 creator applied to Monsoon skincare reels'),
        findsOne,
      );
      await tester.tap(find.byKey(const ValueKey('next-step-action')));
      await tester.pumpAndSettle();
      expect(find.byType(BrandCampaignPage), findsOne);
    });

    testWidgets('quick actions switch tabs', (tester) async {
      await pump(
        tester,
        _home(FakeMarketplace(userId: brandId), brand: true),
        size: const Size(390, 1400),
      );
      await tapText(tester, 'Payments');
      expect(find.text('No invoices yet'), findsOne);
    });
  });

  testWidgets('phone tabs are labelled for screen readers', (tester) async {
    await pump(
      tester,
      _home(FakeMarketplace(userId: creatorId), brand: false),
      size: const Size(390, 900),
    );
    for (final label in [
      'Home',
      'Campaigns',
      'My work',
      'Messages',
      'Profile',
    ]) {
      expect(find.byTooltip(label), findsOne, reason: label);
    }
    await tester.tap(find.byTooltip('My work'));
    await tester.pumpAndSettle();
    expect(find.text('My collaborations'), findsOne);
    expect(HomeTab.values.first, HomeTab.home);
  });
}
