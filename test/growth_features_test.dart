import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:shor/backend/campaign_report.dart';
import 'package:shor/backend/marketplace_service.dart';
import 'package:shor/screens/brand/brand_campaign_page.dart';
import 'package:shor/screens/brand/creator_profile_page.dart';
import 'package:shor/screens/brand/discover_creators_tab.dart';
import 'package:shor/screens/brand/store_connections.dart';
import 'package:shor/screens/collaboration_page.dart';
import 'package:shor/screens/creator/creator_profile_tab.dart';
import 'package:shor/theme/app_text.dart';

import 'marketplace_test.dart' show pump, shell, tapText;
import 'support/fakes.dart';

Collaboration _done(String id, num amount) => Collaboration(
  id: id,
  campaignId: 'camp-1',
  creatorId: 'c-$id',
  brandId: brandId,
  status: CollabStatus.completed,
  agreedAmount: amount,
  creator: CreatorSummary(id: 'c-$id', fullName: 'Creator $id'),
);

void _mockClipboard(WidgetTester tester, void Function(String) onCopy) {
  tester.binding.defaultBinaryMessenger.setMockMethodCallHandler(
    SystemChannels.platform,
    (call) async {
      if (call.method == 'Clipboard.setData') {
        onCopy((call.arguments as Map)['text'] as String);
      }
      return null;
    },
  );
  addTearDown(
    () => tester.binding.defaultBinaryMessenger.setMockMethodCallHandler(
      SystemChannels.platform,
      null,
    ),
  );
}

void main() {
  AppText.useGoogleFonts = false;

  group('sales in the campaign report', () {
    final report = CampaignReport.build(
      collaborations: [_done('a', 10000), _done('b', 20000)],
      posts: const [],
      invoices: const [],
      sales: const [
        SalesRow(collaborationId: 'a', clicks: 400, orders: 20, revenue: 30000),
        SalesRow(collaborationId: 'b', clicks: 100, orders: 2, revenue: 2000),
      ],
    );

    test('totals, cost per order and return on spend', () {
      expect(report.clicks, 500);
      expect(report.orders, 22);
      expect(report.revenue, 32000);
      expect(report.roas!.toStringAsFixed(2), '1.07');
      expect(report.costPerOrder!.round(), 1364);
      expect(report.topSeller?.collaboration.id, 'a');
      final a = report.rows.firstWhere((r) => r.collaboration.id == 'a');
      expect(a.roas, 3);
      expect(a.costPerOrder, 500);
    });

    test('CSV includes sales columns', () {
      final lines = report.toCsv().trim().split('\n');
      expect(
        lines.first,
        endsWith('Clicks,Orders,Revenue (INR),Cost per order,Return on spend'),
      );
      expect(lines.any((l) => l.endsWith(',400,20,30000,500,3')), isTrue);
    });

    test('no sales yet', () {
      final empty = CampaignReport.build(
        collaborations: [_done('a', 10000)],
        posts: const [],
        invoices: const [],
      );
      expect(empty.hasSales, isFalse);
      expect(empty.roas, isNull);
    });
  });

  test('tracked links use the website, or the function locally', () {
    expect(trackedLinkUrl('riya-glows-ea9c'), endsWith('/go/riya-glows-ea9c'));
    expect(trackedLinkUrl('x-1234'), isNot(contains('functions/v1')));
    expect(
      storeWebhookUrl('abc'),
      endsWith('/functions/v1/store-webhook?c=abc'),
    );
  });

  group('sales tracking card', () {
    testWidgets('the brand adds a discount code; the creator sees it', (
      tester,
    ) async {
      final m = FakeMarketplace(userId: brandId);
      final c = m.addCollab(status: CollabStatus.inProgress);
      m.sales[c.id] = SalesRow(
        collaborationId: c.id,
        linkCode: 'cara-creates-7k2q',
        clicks: 1240,
        orders: 31,
        revenue: 46500,
      );
      await pump(
        tester,
        CollaborationPage(collaborationId: c.id, service: m),
        size: const Size(1280, 2600),
      );
      expect(find.text('Sales tracking'), findsOne);
      expect(find.text('1,240'), findsOne);
      expect(find.text('31'), findsOne);
      expect(find.text('₹46,500'), findsOne);
      expect(find.textContaining('/go/cara-creates-7k2q'), findsOne);

      await tapText(tester, 'Add');
      await tester.enterText(find.byType(TextFormField).last, 'cara10');
      await tapText(tester, 'Save code');
      expect(m.discountCodes[c.id], 'CARA10');
      expect(find.text('CARA10'), findsOne);

      m.userId = creatorId;
      await pump(
        tester,
        CollaborationPage(collaborationId: c.id, service: m),
        size: const Size(1280, 2600),
      );
      expect(find.text('CARA10'), findsOne);
      expect(find.text('Add'), findsNothing);
      expect(find.text('Change'), findsNothing);
    });
  });

  group('store connection', () {
    testWidgets('Shopify: paste the signing secret, then get the webhook URL', (
      tester,
    ) async {
      final m = FakeMarketplace(userId: brandId);
      await pump(
        tester,
        Scaffold(
          body: SingleChildScrollView(
            child: StoreConnectionsSection(service: m),
          ),
        ),
      );
      await tapText(tester, 'Connect Shopify');
      expect(
        find.textContaining('Settings → Notifications → Webhooks'),
        findsOne,
      );

      await tester.enterText(
        find.byType(TextFormField).first,
        'glow.myshopify.com',
      );
      await tester.enterText(
        find.byKey(const ValueKey('webhook-secret')),
        'shpss_abc12345',
      );
      await tapText(tester, 'Save and get webhook URL');
      expect(m.lastWebhookSecret, 'shpss_abc12345');
      expect(find.textContaining('store-webhook?c='), findsWidgets);
      expect(find.textContaining('Order cancellation'), findsOne);

      await tapText(tester, 'Done');
      expect(find.textContaining('Shopify · glow.myshopify.com'), findsOne);
      expect(find.text('Waiting for the first order'), findsOne);
      // Saved secrets are never shown again.
      expect(find.textContaining('shpss_abc12345'), findsNothing);
    });

    testWidgets('WooCommerce: Shor makes the secret', (tester) async {
      final m = FakeMarketplace(userId: brandId);
      await pump(
        tester,
        Scaffold(
          body: SingleChildScrollView(
            child: StoreConnectionsSection(service: m),
          ),
        ),
      );
      await tapText(tester, 'Connect WooCommerce');
      final secret = tester
          .widget<TextFormField>(find.byKey(const ValueKey('webhook-secret')))
          .controller!
          .text;
      expect(secret, startsWith('shor_'));
      expect(secret.length, greaterThan(30));
    });
  });

  group('audience search and quality', () {
    testWidgets('filters by audience and quality, with badges on cards', (
      tester,
    ) async {
      final m = FakeMarketplace(userId: brandId);
      await pump(
        tester,
        Scaffold(body: DiscoverCreatorsTab(service: m)),
        size: const Size(1280, 2000),
      );
      expect(find.text('Quality 81 · Strong'), findsOne);
      expect(find.textContaining('72% women'), findsOne);
      expect(find.text('Dev Eats'), findsOne);

      await tester.tap(find.text('Any audience'));
      await tester.pumpAndSettle();
      await tester.tap(find.text('Mostly women').last);
      await tester.pumpAndSettle();
      expect(find.text('Cara Creates'), findsOne);
      expect(find.text('Dev Eats'), findsNothing);

      await tester.enterText(
        find.byKey(const ValueKey('audience-city')),
        'delhi',
      );
      await tester.testTextInput.receiveAction(TextInputAction.search);
      await tester.pumpAndSettle();
      expect(find.text('Cara Creates'), findsNothing);
    });

    testWidgets('profile explains the score and shows the audience', (
      tester,
    ) async {
      await pump(
        tester,
        CreatorProfilePage(
          creatorId: creatorId,
          service: FakeMarketplace(userId: brandId),
        ),
        size: const Size(1280, 2400),
      );
      expect(find.text('Quality: Strong'), findsOne);
      expect(find.text('Engagement 2.1x typical for their size'), findsOne);
      expect(find.text('AUDIENCE'), findsOne);
      expect(find.text('Top cities: Pune, Mumbai'), findsOne);
    });

    testWidgets('creators opt in to audience search after a confirmation', (
      tester,
    ) async {
      final m = FakeMarketplace(userId: creatorId);
      await pump(
        tester,
        Scaffold(
          body: CreatorProfileTab(
            account: creatorAccount,
            onSignOut: () {},
            auth: FakeAuth(creatorAccount),
            service: m,
          ),
        ),
        size: const Size(1280, 2400),
      );
      await tester.tap(find.byKey(const ValueKey('share-audience')));
      await tester.pumpAndSettle();
      expect(find.text('Show your audience to brands?'), findsOne);
      await tapText(tester, 'Show my audience');
      expect(m.audienceShared, isTrue);
    });
  });

  testWidgets('brand report shows sales and a top seller', (tester) async {
    final m = FakeMarketplace(userId: brandId);
    final c = m.addCollab(status: CollabStatus.completed);
    m.sales[c.id] = SalesRow(
      collaborationId: c.id,
      clicks: 900,
      orders: 12,
      revenue: 36000,
    );
    String? copied;
    _mockClipboard(tester, (t) => copied = t);
    await pump(
      tester,
      BrandCampaignPage(campaignId: 'camp-1', service: m),
      size: const Size(1280, 3000),
    );
    await tapText(tester, 'Report');
    expect(find.text('Sales'), findsOne);
    expect(find.text('₹36,000'), findsWidgets);
    expect(find.text('3.0x'), findsWidgets);
    expect(find.text('Top seller'), findsOne);
    await tapText(tester, 'Copy as CSV');
    expect(copied, contains(',900,12,36000,'));
  });

  testWidgets('the Messages tab shows unread chats', (tester) async {
    final m = FakeMarketplace(userId: creatorId);
    m.addNotification('New message from Acme Skin', kind: 'message');
    await pump(tester, shell(m, brand: false), size: const Size(390, 900));
    expect(find.bySemanticsLabel('Messages, 1 unread'), findsOne);
    await m.markNotificationsRead();
    await tester.pumpAndSettle();
    expect(find.bySemanticsLabel('Messages, 1 unread'), findsNothing);
  });
}
