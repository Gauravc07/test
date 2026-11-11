// Phone screenshots of the signed-in app with demo data, for design review.
//
//   flutter test tool/screenshots/screens_test.dart --update-goldens \
//     --dart-define=SHOTS_FONTS=<folder with DMSans-*.ttf>
//
// Writes PNGs to tool/screenshots/out/. Not part of the normal test run.
import 'dart:io';

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:shor/backend/marketplace_service.dart';
import 'package:shor/screens/brand/brand_campaign_page.dart';
import 'package:shor/screens/collaboration_page.dart';
import 'package:shor/screens/home_shell.dart';
import 'package:shor/screens/media_kit_page.dart';
import 'package:shor/screens/notifications_page.dart';
import 'package:shor/theme/app_text.dart';
import 'package:shor/theme/app_theme.dart';

import '../../test/support/fakes.dart';

const _fonts = String.fromEnvironment('SHOTS_FONTS');

Future<void> _loadFonts() async {
  final sans = FontLoader('Roboto');
  for (final w in ['Regular', 'Medium', 'SemiBold', 'Bold']) {
    final bytes = File('$_fonts/DMSans-$w.ttf').readAsBytesSync();
    sans.addFont(Future.value(ByteData.sublistView(bytes)));
  }
  await sans.load();
  final flutterRoot = Platform.environment['FLUTTER_ROOT'] ??
      '${Platform.environment['USERPROFILE']}/flutter';
  final icons = FontLoader('MaterialIcons')
    ..addFont(
      Future.value(
        ByteData.sublistView(
          File(
            '$flutterRoot/bin/cache/artifacts/material_fonts/materialicons-regular.otf',
          ).readAsBytesSync(),
        ),
      ),
    );
  await icons.load();
}

FakeMarketplace _demo({required bool brand}) {
  final m = FakeMarketplace(userId: brand ? brandId : creatorId);
  final hired = m.addCollab(status: CollabStatus.completed);
  final live = m.addCollab(
    status: CollabStatus.awaitingApproval,
    creator: otherCreatorId,
    amount: 6000,
  );
  m.addCollab(
    campaignId: 'camp-2',
    status: brand ? CollabStatus.applied : CollabStatus.invited,
    amount: null,
  );
  m.addSubmission(hired.id, SubmissionKind.draft, SubmissionStatus.approved);
  m.addSubmission(
    hired.id,
    SubmissionKind.live,
    SubmissionStatus.approved,
    url: 'https://www.instagram.com/reel/AAA/',
  );
  m.live[hired.id] = LivePost(
    collaborationId: hired.id,
    creatorId: creatorId,
    submissionId: 's1',
    contentUrl: 'https://www.instagram.com/reel/AAA/',
    status: SubmissionStatus.approved,
    matched: true,
    views: 48200,
    reach: 31000,
    likes: 2100,
    comments: 140,
    saved: 380,
    shares: 95,
  );
  m.live[live.id] = LivePost(
    collaborationId: live.id,
    creatorId: otherCreatorId,
    submissionId: 's2',
    contentUrl: 'https://www.instagram.com/reel/BBB/',
    status: SubmissionStatus.pending,
    matched: true,
    views: 12900,
    reach: 9800,
    likes: 610,
    comments: 22,
    saved: 40,
    shares: 12,
  );
  m.addNotification(
    'Dev Eats posted live for Monsoon skincare reels',
    kind: 'live_submitted',
    body: 'Check the post and approve it to complete the collaboration.',
    collaborationId: live.id,
  );
  m.addNotification(
    'New message from Acme Skin',
    kind: 'message',
    body: 'Can you post on Friday evening?',
  );
  return m;
}

Future<void> _shot(
  WidgetTester tester,
  String name,
  Widget page, {
  Future<void> Function()? then,
  double height = 844,
}) async {
  tester.view.physicalSize = Size(390 * 2, height * 2);
  tester.view.devicePixelRatio = 2;
  addTearDown(tester.view.reset);
  await tester.pumpWidget(
    MaterialApp(
      debugShowCheckedModeBanner: false,
      theme: AppTheme.light,
      home: page,
    ),
  );
  await tester.pumpAndSettle();
  if (then != null) {
    await then();
    await tester.pumpAndSettle();
  }
  await expectLater(
    find.byType(MaterialApp),
    matchesGoldenFile('out/$name.png'),
  );
}

void main() {
  AppText.useGoogleFonts = false;
  setUpAll(_loadFonts);

  Widget shell(FakeMarketplace m, {required bool brand, HomeTab? tab}) =>
      HomeShell(
        auth: FakeAuth(brand ? brandAccount : creatorAccount),
        marketplace: m,
        instagram: FakeInstagram(),
        initialTab: tab,
      );

  testWidgets('creator home', (t) async {
    await _shot(t, 'creator_home', shell(_demo(brand: false), brand: false));
  });
  testWidgets('brand home', (t) async {
    await _shot(t, 'brand_home', shell(_demo(brand: true), brand: true));
  });
  testWidgets('brand campaigns', (t) async {
    await _shot(
      t,
      'brand_campaigns',
      shell(_demo(brand: true), brand: true, tab: HomeTab.brandCampaigns),
    );
  });
  testWidgets('creator campaigns', (t) async {
    await _shot(
      t,
      'creator_campaigns',
      shell(_demo(brand: false), brand: false, tab: HomeTab.campaigns),
    );
  });
  testWidgets('brand creators', (t) async {
    await _shot(
      t,
      'brand_creators',
      shell(_demo(brand: true), brand: true, tab: HomeTab.creators),
    );
  });
  testWidgets('creator work', (t) async {
    await _shot(
      t,
      'creator_work',
      shell(_demo(brand: false), brand: false, tab: HomeTab.work),
    );
  });
  testWidgets('creator profile', (t) async {
    await _shot(
      t,
      'creator_profile',
      shell(_demo(brand: false), brand: false, tab: HomeTab.profile),
      height: 1600,
    );
  });
  testWidgets('brand report', (t) async {
    final m = _demo(brand: true);
    await _shot(
      t,
      'brand_report',
      BrandCampaignPage(campaignId: 'camp-1', service: m),
      height: 1700,
      then: () async {
        await t.tap(find.text('Report'));
      },
    );
  });
  testWidgets('collaboration', (t) async {
    final m = _demo(brand: true);
    final id = m.collabs.values
        .firstWhere((c) => c.status == CollabStatus.awaitingApproval)
        .id;
    await _shot(
      t,
      'collaboration',
      CollaborationPage(collaborationId: id, service: m),
      height: 1500,
    );
  });
  testWidgets('notifications', (t) async {
    await _shot(
      t,
      'notifications',
      NotificationsPage(service: _demo(brand: true)),
    );
  });
  testWidgets('media kit', (t) async {
    final m = _demo(brand: true);
    m.kits['cara.creates'] = const MediaKit(
      creatorId: creatorId,
      handle: 'cara.creates',
      name: 'Cara Creates',
      bio: 'Calm, honest skincare reels from Pune.',
      niches: ['Beauty', 'Lifestyle'],
      location: 'Pune',
      rateMin: 8000,
      rateMax: 15000,
      isPublic: true,
      instagramUsername: 'cara.creates',
      followers: 24500,
      verified: true,
      postsAnalysed: 18,
      avgViews: 30200,
      avgReach: 21000,
      recentEngagementRate: 7.4,
      audience: {
        'gender': [BarDatumData('F', 72), BarDatumData('M', 28)],
        'city': [BarDatumData('Pune', 38), BarDatumData('Mumbai', 21)],
      },
      dealsCompleted: 4,
      rating: RatingSummary(average: 4.8, count: 4),
    );
    await _shot(
      t,
      'media_kit',
      MediaKitPage(handle: 'cara.creates', service: m),
      height: 1700,
    );
  });
}
