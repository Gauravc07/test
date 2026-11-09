import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:shor/backend/campaign_report.dart';
import 'package:shor/backend/marketplace_service.dart';
import 'package:shor/screens/brand/brand_campaign_page.dart';
import 'package:shor/screens/collaboration_page.dart';
import 'package:shor/screens/creator/creator_profile_tab.dart';
import 'package:shor/screens/media_kit_page.dart';
import 'package:shor/screens/notifications_page.dart';
import 'package:shor/screens/settings/account_settings.dart';
import 'package:shor/theme/app_text.dart';

import 'marketplace_test.dart' show pump, shell, tapText;
import 'support/fakes.dart';

LivePost _post(
  String collaborationId, {
  int views = 0,
  int reach = 0,
  int likes = 0,
  bool matched = true,
}) => LivePost(
  collaborationId: collaborationId,
  creatorId: creatorId,
  submissionId: 'sub-$collaborationId',
  contentUrl: 'https://www.instagram.com/reel/$collaborationId/',
  status: SubmissionStatus.approved,
  matched: matched,
  views: views,
  reach: reach,
  likes: likes,
  comments: 0,
  saved: 10,
  shares: 5,
);

Collaboration _hired(String id, String creator, num amount) => Collaboration(
  id: id,
  campaignId: 'camp-1',
  creatorId: creator,
  brandId: brandId,
  status: CollabStatus.completed,
  agreedAmount: amount,
  creator: CreatorSummary(id: creator, fullName: 'Creator $id'),
);

/// The JSON media_kit() returns (checked against the real function in
/// supabase tests).
Map<String, dynamic> _kitJson({bool public = true}) => {
  'id': creatorId,
  'handle': 'cara.creates',
  'name': 'Cara Creates',
  'bio': 'Calm, honest skincare.',
  'niches': ['Beauty'],
  'location': 'Pune',
  'rate_min': 8000,
  'rate_max': 15000,
  'currency': 'INR',
  'is_public': public,
  'instagram': {
    'username': 'cara.creates',
    'url': 'https://www.instagram.com/cara.creates/',
    'followers': 24500,
    'verified': true,
    'engagement_rate': 6.4,
    'synced_at': DateTime.now().toIso8601String(),
  },
  'stats': {
    'posts': 2,
    'avg_views': 30000,
    'avg_reach': 20000,
    'avg_interactions': 1500,
    'engagement_rate': 7.5,
  },
  'top_posts': [
    {
      'permalink': 'https://www.instagram.com/reel/AAA/',
      'image_url': null,
      'media_product_type': 'REELS',
      'views': 50000,
      'likes': 2000,
    },
  ],
  'audience': {
    'gender': [
      {'label': 'F', 'share': 70.0},
      {'label': 'M', 'share': 30.0},
    ],
    'city': [
      {'label': 'Pune, Maharashtra', 'share': 80.0},
    ],
  },
  'deals_completed': 3,
  'rating': {'average': 4.7, 'count': 3},
  'reviews': [
    {
      'id': 'r1',
      'rating': 5,
      'comment': 'Great reels, on time',
      'reviewer_name': 'Acme Skin',
      'campaign_title': 'Monsoon skincare reels',
    },
  ],
};

void main() {
  AppText.useGoogleFonts = false;

  group('campaign report', () {
    final collabs = [
      _hired('a', 'c-a', 10000),
      _hired('b', 'c-b', 20000),
      _hired('c', 'c-c', 5000),
      Collaboration(
        id: 'x',
        campaignId: 'camp-1',
        creatorId: 'c-x',
        brandId: brandId,
        status: CollabStatus.declined,
        agreedAmount: 99999,
      ),
    ];
    final invoices = [
      Invoice(
        id: 'i1',
        number: 'INV-1',
        collaborationId: 'b',
        brandId: brandId,
        creatorId: 'c-b',
        gross: 20000,
        fee: 0,
        net: 20000,
        brandFee: 1400,
        brandFeeGst: 252,
        status: InvoiceStatus.approved,
      ),
      Invoice(
        id: 'i2',
        number: 'INV-2',
        collaborationId: 'a',
        brandId: brandId,
        creatorId: 'c-a',
        gross: 50000,
        fee: 0,
        net: 50000,
        status: InvoiceStatus.rejected,
      ),
    ];
    final report = CampaignReport.build(
      collaborations: collabs,
      posts: [
        _post('a', views: 10000, reach: 8000, likes: 400),
        _post('b', views: 40000, reach: 30000, likes: 1500),
        _post('c', matched: false),
      ],
      invoices: invoices,
    );

    test('counts hired creators only, best first', () {
      expect(report.rows.map((r) => r.collaboration.id), ['b', 'a', 'c']);
      expect(report.postsLive, 3);
      expect(report.postsSynced, 2);
      expect(report.views, 50000);
      expect(report.saves, 20);
    });

    test('costs use the invoice total when invoiced, else the agreed fee', () {
      expect(report.rows[0].cost, 21652);
      expect(report.rows[0].invoiced, isTrue);
      // A rejected invoice doesn't count.
      expect(report.rows[1].cost, 10000);
      expect(report.cost, 21652 + 10000 + 5000);
    });

    test('cost per 1K views only counts posts with results', () {
      expect(report.rows[1].costPerThousandViews, 1000);
      expect(
        report.costPerThousandViews!.round(),
        ((21652 + 10000) / 50000 * 1000).round(),
      );
      expect(report.mostViews?.collaboration.id, 'b');
      expect(report.bestValue?.collaboration.id, 'b');
    });

    test('exports a CSV with quoted names', () {
      final withComma = CampaignReport.build(
        collaborations: [
          Collaboration(
            id: 'q',
            campaignId: 'camp-1',
            creatorId: 'c-q',
            brandId: brandId,
            status: CollabStatus.completed,
            agreedAmount: 1000,
            creator: const CreatorSummary(id: 'c-q', fullName: 'Dev, "Eats"'),
          ),
        ],
        posts: [_post('q', views: 2000, reach: 1000, likes: 50)],
        invoices: const [],
      );
      final lines = withComma.toCsv().trim().split('\n');
      expect(lines.first, startsWith('Creator,Instagram,Post,Views'));
      expect(lines[1], startsWith('"Dev, ""Eats""",'));
      expect(lines[1], contains(',2000,1000,50,'));
      expect(lines[1], contains(',1000,no,500,'));
    });
  });

  group('media kit', () {
    test('addresses', () {
      expect(
        mediaKitHandleFrom(Uri.parse('https://shor.app/kit/cara.creates')),
        'cara.creates',
      );
      expect(
        mediaKitHandleFrom(Uri.parse('https://shor.app/?kit=cara')),
        'cara',
      );
      expect(mediaKitHandleFrom(Uri.parse('https://shor.app/')), isNull);
      expect(mediaKitHandleFrom(Uri.parse('https://shor.app/kit/')), isNull);
      expect(mediaKitUrl('@cara.creates'), endsWith('/kit/cara.creates'));
    });

    test('parses the database JSON', () {
      final k = MediaKit.fromJson(_kitJson());
      expect(k.followers, 24500);
      expect(k.avgViews, 30000);
      expect(k.recentEngagementRate, 7.5);
      expect(k.topPosts.single.isReel, isTrue);
      expect(k.audience['gender']!.first.share, 70);
      expect(k.rating.label, '4.7 · 3 reviews');
      expect(k.rateLabel, '₹8,000–₹15,000 / post');
    });

    testWidgets('public page shows verified numbers, audience and reviews', (
      tester,
    ) async {
      final market = FakeMarketplace(userId: brandId);
      market.kits['cara.creates'] = MediaKit.fromJson(_kitJson());
      await pump(
        tester,
        MediaKitPage(handle: 'cara.creates', service: market),
        size: const Size(390, 3000),
      );
      expect(find.text('Cara Creates'), findsWidgets);
      expect(find.text('Verified on Instagram'), findsOne);
      expect(find.text('24.5K'), findsOne);
      expect(find.text('30K'), findsOne);
      expect(find.text('7.5%'), findsOne);
      expect(find.text('Women'), findsOne);
      expect(find.text('Pune'), findsWidgets);
      expect(find.text('3 brand deals completed'), findsOne);
      expect(find.text('Great reels, on time'), findsOne);
      expect(find.textContaining('Preview'), findsNothing);
      expect(tester.takeException(), isNull);
    });

    testWidgets('unknown or private kits are unavailable', (tester) async {
      await pump(
        tester,
        MediaKitPage(
          handle: 'nobody',
          service: FakeMarketplace(userId: brandId),
        ),
      );
      expect(find.text('This media kit isn’t available'), findsOne);
    });

    testWidgets(
      'creators confirm before going public, then can copy the link',
      (tester) async {
        final market = FakeMarketplace(userId: creatorId);
        await pump(
          tester,
          Scaffold(
            body: CreatorProfileTab(
              account: creatorAccount,
              onSignOut: () {},
              auth: FakeAuth(creatorAccount),
              service: market,
            ),
          ),
        );
        expect(find.textContaining('/kit/cara.creates'), findsOne);
        expect(find.text('Copy link'), findsNothing);

        await tester.tap(find.byKey(const ValueKey('media-kit-public')));
        await tester.pumpAndSettle();
        expect(find.text('Make your media kit public?'), findsOne);
        await tapText(tester, 'Make public');
        expect(market.kitPublic, isTrue);
        expect(find.text('Copy link'), findsOne);
      },
    );
  });

  group('notifications', () {
    testWidgets('the bell counts unread and opens the inbox', (tester) async {
      final market = FakeMarketplace(userId: creatorId);
      final collab = market.addCollab(status: CollabStatus.accepted);
      market.addNotification(
        'You’re hired for Monsoon skincare reels',
        body: 'Acme Skin accepted your application.',
        collaborationId: collab.id,
      );
      market.addNotification('New message from Acme Skin', kind: 'message');
      await pump(
        tester,
        shell(market, brand: false),
        size: const Size(390, 800),
      );

      expect(find.byTooltip('Notifications, 2 unread'), findsOne);
      await tester.tap(find.byKey(const ValueKey('notification-bell')));
      await tester.pumpAndSettle();
      expect(find.text('Notifications'), findsWidgets);
      expect(find.text('New message from Acme Skin'), findsOne);

      // Tapping one marks it read and opens the collaboration.
      await tapText(tester, 'You’re hired for Monsoon skincare reels');
      expect(find.byType(CollaborationPage), findsOne);
      expect(market.notes.where((n) => n.unread).length, 1);

      await tester.pageBack();
      await tester.pumpAndSettle();
      await tapText(tester, 'Mark all read');
      expect(market.notes.every((n) => !n.unread), isTrue);
      expect(find.text('Mark all read'), findsNothing);
    });

    testWidgets('empty inbox explains what shows up', (tester) async {
      await pump(
        tester,
        NotificationsPage(service: FakeMarketplace(userId: brandId)),
      );
      expect(find.text('You’re all caught up'), findsOne);
    });

    testWidgets('email notifications can be turned off', (tester) async {
      final market = FakeMarketplace(userId: brandId);
      await pump(
        tester,
        Scaffold(
          body: SingleChildScrollView(
            child: AccountSettingsSection(
              marketplace: market,
              onSignOut: () {},
            ),
          ),
        ),
      );
      await tester.tap(find.byKey(const ValueKey('email-notifications')));
      await tester.pumpAndSettle();
      expect(market.emailOn, isFalse);
      expect(find.textContaining('Emails off'), findsOne);
    });
  });

  group('reviews', () {
    testWidgets('double-blind: each side sees the other’s review only after '
        'leaving theirs', (tester) async {
      final market = FakeMarketplace(userId: creatorId);
      final collab = market.addCollab(status: CollabStatus.completed);
      market.userId = brandId;
      await market.submitReview(collab.id, rating: 5, comment: 'Great reels');
      market.userId = creatorId;

      await pump(
        tester,
        CollaborationPage(collaborationId: collab.id, service: market),
        size: const Size(1280, 2400),
      );
      expect(find.text('Rate Acme Skin'), findsOne);
      expect(find.text('Great reels'), findsNothing);

      await tester.tap(find.byKey(const ValueKey('star-4')));
      await tester.pump();
      expect(find.text('Great'), findsOne);
      await tester.enterText(
        find.byKey(const ValueKey('review-comment')),
        'Clear brief, paid on time',
      );
      await tapText(tester, 'Submit review');

      expect(find.text('Great reels'), findsOne);
      expect(find.text('Clear brief, paid on time'), findsOne);
      expect((await market.ratingSummary(brandId)).average, 4);
      expect((await market.ratingSummary(creatorId)).label, '5.0 · 1 review');
    });

    testWidgets('no review card before the collaboration is complete', (
      tester,
    ) async {
      final market = FakeMarketplace(userId: creatorId);
      final collab = market.addCollab(status: CollabStatus.inProgress);
      await pump(
        tester,
        CollaborationPage(collaborationId: collab.id, service: market),
      );
      expect(find.textContaining('Rate '), findsNothing);
    });
  });

  testWidgets('brand report ranks creators and copies a CSV', (tester) async {
    final market = FakeMarketplace(userId: brandId);
    final a = market.addCollab(status: CollabStatus.completed);
    final b = market.addCollab(
      status: CollabStatus.completed,
      creator: otherCreatorId,
      amount: 3000,
    );
    market.live[a.id] = _post(a.id, views: 20000, reach: 15000, likes: 900);
    market.live[b.id] = _post(b.id, views: 9000, reach: 6000, likes: 300);

    String? copied;
    tester.binding.defaultBinaryMessenger.setMockMethodCallHandler(
      SystemChannels.platform,
      (call) async {
        if (call.method == 'Clipboard.setData') {
          copied = (call.arguments as Map)['text'] as String;
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

    await pump(
      tester,
      BrandCampaignPage(campaignId: 'camp-1', service: market),
      size: const Size(1280, 3000),
    );
    await tapText(tester, 'Report');
    expect(find.text('By creator'), findsOne);
    expect(find.text('SHARE OF VIEWS'), findsOne);
    expect(find.text('Most views'), findsOne);
    expect(find.text('Best value'), findsOne);

    await tapText(tester, 'Copy as CSV');
    expect(copied, startsWith('Creator,'));
    expect(copied, contains('Cara Creates'));
    expect(copied, contains('Dev Eats'));
  });
}
