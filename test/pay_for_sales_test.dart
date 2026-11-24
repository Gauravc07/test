import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:shor/backend/campaign_report.dart';
import 'package:shor/backend/marketplace_service.dart';
import 'package:shor/screens/brand/brand_campaign_page.dart';
import 'package:shor/screens/brand/campaign_editor_page.dart';
import 'package:shor/screens/brand/discover_creators_tab.dart';
import 'package:shor/screens/collaboration_page.dart';
import 'package:shor/screens/creator/campaign_detail_page.dart';
import 'package:shor/theme/app_text.dart';
import 'package:shor/utils/format.dart';

import 'marketplace_test.dart' show pump, tapText;
import 'support/fakes.dart';

void main() {
  AppText.useGoogleFonts = false;

  test('percent formatting', () {
    expect(formatPercent(10), '10%');
    expect(formatPercent(7.5), '7.5%');
    expect(formatPercent(12.04), '12%');
  });

  group('campaign labels', () {
    Campaign campaign({num? payout, bool quotes = false, num? rate}) =>
        Campaign(
          id: 'c',
          brandId: 'b',
          title: 'T',
          payoutPerCreator: payout,
          acceptsQuotes: quotes,
          commissionRate: rate,
        );

    test('fee plus commission', () {
      expect(
        campaign(payout: 5000, rate: 10).compensationLabel,
        '₹5,000 + 10% of sales',
      );
    });
    test('commission only', () {
      expect(campaign(rate: 12.5).compensationLabel, '12.5% of sales');
    });
    test('no commission is unchanged', () {
      expect(campaign(payout: 5000).compensationLabel, '₹5,000');
    });
  });

  test('report cost includes commission; fee invoice ignores commission '
      'invoices', () {
    final collab = Collaboration(
      id: 'a',
      campaignId: 'camp-1',
      creatorId: 'c-a',
      brandId: brandId,
      status: CollabStatus.completed,
      agreedAmount: 2000,
      commissionRate: 10,
      creator: const CreatorSummary(id: 'c-a', fullName: 'Asha'),
    );
    final report = CampaignReport.build(
      collaborations: [collab],
      posts: const [],
      invoices: [
        Invoice(
          id: 'i1',
          number: 'INV-1',
          collaborationId: 'a',
          brandId: brandId,
          creatorId: 'c-a',
          gross: 900,
          fee: 0,
          net: 900,
          status: InvoiceStatus.pending,
          isCommission: true,
        ),
      ],
      sales: const [
        SalesRow(
          collaborationId: 'a',
          clicks: 300,
          orders: 12,
          revenue: 12000,
          commissionRate: 10,
          commissionEarned: 900,
          commissionPending: 300,
        ),
      ],
    );
    final row = report.rows.single;
    expect(row.invoiced, isFalse, reason: 'only a fee invoice counts');
    expect(row.commission, 1200);
    expect(row.cost, 3200);
    expect(report.commission, 1200);
    expect(report.roas!.toStringAsFixed(2), '3.75');
    final csv = report.toCsv().trim().split('\n');
    expect(
      csv.first,
      contains('Revenue (INR),Commission (INR),Cost per order'),
    );
    expect(csv.last, contains(',12,12000,1200,'));
  });

  testWidgets('brand sets a sales commission on a new campaign', (
    tester,
  ) async {
    final m = FakeMarketplace(userId: brandId);
    await pump(
      tester,
      CampaignEditorPage(service: m),
      size: const Size(1280, 4000),
    );
    await tester.enterText(
      find.widgetWithText(TextFormField, 'Campaign name'),
      'Serum launch',
    );
    await tester.enterText(find.byKey(const ValueKey('commission-rate')), '10');
    await tester.pumpAndSettle();
    await tester.enterText(find.byKey(const ValueKey('commission-hold')), '7');
    expect(find.textContaining('Commission is worked out'), findsOne);
    await tapText(tester, 'Save draft');
    final saved = m.campaigns.values.firstWhere(
      (c) => c.title == 'Serum launch',
    );
    expect(saved.commissionRate, 10);
    expect(saved.commissionHoldDays, 7);
  });

  testWidgets('creators see the commission on the brief', (tester) async {
    final m = FakeMarketplace(userId: creatorId);
    m.addCampaign(
      id: 'camp-9',
      title: 'Glow serum',
      payout: 3000,
      commissionRate: 10,
    );
    await pump(tester, CampaignDetailPage(campaignId: 'camp-9', service: m));
    expect(find.text('Sales commission'), findsOne);
    expect(find.textContaining('10% of every order'), findsOne);
    expect(find.textContaining('₹3,000 + 10% of sales'), findsWidgets);
  });

  group('commission on a deal', () {
    late FakeMarketplace m;
    late Collaboration c;

    setUp(() {
      m = FakeMarketplace(userId: creatorId);
      m.addCampaign(id: 'camp-9', title: 'Glow serum', commissionRate: 10);
      c = m.addCollab(
        campaignId: 'camp-9',
        status: CollabStatus.inProgress,
        amount: null,
      );
      m.commissions[c.id] = const CommissionSummary(
        rate: 10,
        holdDays: 14,
        confirmedOrders: 8,
        confirmedSales: 12000,
        earned: 1200,
        pendingOrders: 2,
        pending: 250,
        invoiced: 0,
        available: 1200,
      );
    });

    testWidgets('the creator requests what they earned', (tester) async {
      await pump(
        tester,
        CollaborationPage(collaborationId: c.id, service: m),
        size: const Size(1280, 3000),
      );
      expect(find.text('Sales commission'), findsOne);
      expect(find.text('₹1,200'), findsWidgets);
      expect(find.text('₹250'), findsOne);
      await tapText(tester, 'Request ₹1,200');
      final invoice = m.invoicesById.values.single;
      expect(invoice.isCommission, isTrue);
      expect(invoice.gross, 1200);
      expect(find.text('Nothing to request yet'), findsOne);
    });

    testWidgets('the brand sees what they owe, without a request button', (
      tester,
    ) async {
      m.userId = brandId;
      await pump(
        tester,
        CollaborationPage(collaborationId: c.id, service: m),
        size: const Size(1280, 3000),
      );
      expect(find.text('Still to invoice'), findsOne);
      expect(find.byKey(const ValueKey('request-commission')), findsNothing);
    });
  });

  testWidgets('campaigns that track sales nudge the brand to connect a store', (
    tester,
  ) async {
    final m = FakeMarketplace(userId: brandId);
    m.addCampaign(id: 'camp-9', title: 'Glow serum', commissionRate: 10);
    await pump(tester, BrandCampaignPage(campaignId: 'camp-9', service: m));
    expect(find.byKey(const ValueKey('connect-store-banner')), findsOne);
    expect(find.textContaining('creators earn nothing yet'), findsOne);

    m.stores['s1'] = const StoreConnection(
      id: 's1',
      platform: StorePlatform.shopify,
      storeUrl: 'glow.myshopify.com',
    );
    await pump(
      tester,
      BrandCampaignPage(
        key: const ValueKey('reloaded'),
        campaignId: 'camp-9',
        service: m,
      ),
    );
    expect(find.byKey(const ValueKey('connect-store-banner')), findsNothing);
  });

  testWidgets('a campaign without sales tracking shows no store banner', (
    tester,
  ) async {
    final m = FakeMarketplace(userId: brandId);
    await pump(tester, BrandCampaignPage(campaignId: 'camp-1', service: m));
    expect(find.byKey(const ValueKey('connect-store-banner')), findsNothing);
  });

  testWidgets('invite every creator shown in one go', (tester) async {
    final m = FakeMarketplace(userId: brandId);
    final campaign = m.addCampaign(
      id: 'camp-9',
      title: 'Glow serum',
      commissionRate: 10,
    );
    final shown = (await m.searchCreators(const CreatorFilter())).length;
    expect(shown, greaterThan(1));
    // One is already invited and gets skipped.
    final first = (await m.searchCreators(const CreatorFilter())).first;
    await m.invite('camp-9', first.id);

    await pump(
      tester,
      Scaffold(
        body: DiscoverCreatorsTab(service: m, inviteCampaign: campaign),
      ),
    );
    await tapText(tester, 'Invite all $shown');
    expect(find.text('Invite $shown creators'), findsWidgets);
    expect(find.textContaining('also earn 10% of sales'), findsOne);
    await tester.tap(find.byKey(const ValueKey('bulk-invite-send')));
    await tester.pumpAndSettle();

    final invited = m.collabs.values.where(
      (c) => c.campaignId == 'camp-9' && c.status == CollabStatus.invited,
    );
    expect(invited.length, shown);
    expect(m.bulkInvites.single.$2.length, shown);
    expect(invited.every((c) => c.commissionRate == 10), isTrue);
    expect(
      find.textContaining('1 already on the campaign were skipped'),
      findsOne,
    );
  });
}
