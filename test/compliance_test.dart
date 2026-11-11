import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:shor/backend/auth_service.dart';
import 'package:shor/backend/marketplace_service.dart';
import 'package:shor/screens/brand/creator_profile_page.dart';
import 'package:shor/screens/chat_page.dart';
import 'package:shor/screens/creator/campaign_detail_page.dart';
import 'package:shor/screens/welcome_page.dart';
import 'package:shor/theme/app_text.dart';
import 'package:shor/utils/links.dart';

import 'support/fakes.dart';

Future<void> pump(
  WidgetTester tester,
  Widget page, {
  Size size = const Size(390, 900),
}) async {
  tester.view.physicalSize = size;
  tester.view.devicePixelRatio = 1;
  addTearDown(tester.view.reset);
  await tester.pumpWidget(MaterialApp(home: page));
  await tester.pumpAndSettle();
}

Future<void> tapText(
  WidgetTester tester,
  String text, {
  bool last = false,
}) async {
  // Phone tab buttons are icons, labelled by their tooltips.
  if (find.text(text).evaluate().isEmpty &&
      find.byTooltip(text).evaluate().isNotEmpty) {
    await tester.tap(find.byTooltip(text).first);
    await tester.pumpAndSettle();
    return;
  }
  var finder = last ? find.text(text).last : find.text(text).first;
  if (find.text(text).evaluate().isEmpty) {
    // Lists build lazily; scroll until the text is built.
    await tester.scrollUntilVisible(
      find.text(text),
      300,
      scrollable: find.byType(Scrollable).first,
    );
    finder = find.text(text).first;
  }
  await tester.ensureVisible(finder);
  await tester.pumpAndSettle();
  await tester.tap(finder);
  await tester.pumpAndSettle();
}

void main() {
  AppText.useGoogleFonts = false;
  final opened = <Uri>[];

  setUp(() {
    opened.clear();
    openInAppBrowser = (uri) async {
      opened.add(uri);
      return true;
    };
  });

  testWidgets('phones open on a welcome screen with legal links', (
    tester,
  ) async {
    final auth = FakeAuth(creatorAccount, signedOut: true);
    marketplaceService = FakeMarketplace(userId: creatorId);
    await pump(tester, StartGate(auth: auth));

    expect(find.text('Where creators meet brands'), findsOneWidget);
    expect(find.textContaining('coming soon'), findsNothing);

    await tapText(tester, 'Privacy policy');
    expect(opened.single.path, '/privacy.html');

    // Logging in elsewhere switches the root to the app.
    auth.signInNow();
    await tester.pumpAndSettle();
    expect(find.text('Find campaigns'), findsOneWidget);
  });

  testWidgets('older accounts accept the terms before using the app', (
    tester,
  ) async {
    final auth = FakeAuth(
      const Account(
        id: creatorId,
        email: 'cara@creates.test',
        role: AccountRole.creator,
        fullName: 'Cara',
        termsVersion: null,
      ),
    );
    marketplaceService = FakeMarketplace(userId: creatorId);
    await pump(tester, StartGate(auth: auth));

    expect(find.text('Before you continue'), findsOneWidget);
    expect(find.text('Find campaigns'), findsNothing);

    await tapText(tester, 'I agree');
    expect(find.text('Find campaigns'), findsOneWidget);
  });

  testWidgets('creators can delete their account from Profile', (tester) async {
    final auth = FakeAuth(creatorAccount);
    marketplaceService = FakeMarketplace(userId: creatorId);
    await pump(tester, StartGate(auth: auth));

    await tapText(tester, 'Profile');
    await tapText(tester, 'Delete account');
    expect(find.text('Delete your Shor account'), findsOneWidget);

    await tapText(tester, 'Delete my account');
    expect(find.text('Type DELETE in capitals to confirm.'), findsOneWidget);
    expect(auth.deleted, isFalse);

    await tester.enterText(find.byType(TextField), 'DELETE');
    await tapText(tester, 'Delete my account');

    expect(auth.deleted, isTrue);
    expect(find.text('Where creators meet brands'), findsOneWidget);
    expect(find.text('Your Shor account has been deleted.'), findsOneWidget);
  });

  testWidgets('brands can delete their account too', (tester) async {
    final auth = FakeAuth(brandAccount);
    marketplaceService = FakeMarketplace(userId: brandId);
    await pump(tester, StartGate(auth: auth), size: const Size(1280, 900));

    await tapText(tester, 'Account');
    expect(find.text('Delete account'), findsOneWidget);
    expect(find.text('Blocked accounts'), findsOneWidget);
    expect(find.text('Privacy policy'), findsOneWidget);
  });

  testWidgets('reports a chat partner from the chat menu', (tester) async {
    final market = FakeMarketplace(userId: creatorId);
    final conversation = await market.openConversation(
      brandId: brandId,
      creatorId: creatorId,
      campaignId: 'camp-1',
    );
    await pump(tester, ChatPage(conversation: conversation, service: market));

    await tester.tap(find.byTooltip('More'));
    await tester.pumpAndSettle();
    await tapText(tester, 'Report Acme Skin');
    await tapText(tester, 'Send report');
    expect(find.text('Choose a reason.'), findsOneWidget);

    await tapText(tester, 'Harassment or bullying');
    await tapText(tester, 'Send report');

    expect(market.reports.single.$1, ReportTarget.user);
    expect(market.reports.single.$2, brandId);
    expect(market.reports.single.$3, ReportReason.harassment);
    expect(find.textContaining('within 24 hours'), findsOneWidget);
  });

  testWidgets('reports a campaign from its brief', (tester) async {
    final market = FakeMarketplace(userId: creatorId);
    await pump(
      tester,
      CampaignDetailPage(campaignId: 'camp-1', service: market),
    );

    await tapText(tester, 'Report campaign');
    await tapText(tester, 'Scam or fraud');
    await tapText(tester, 'Send report');

    expect(market.reports.single.$1, ReportTarget.campaign);
    expect(market.reports.single.$2, 'camp-1');
  });

  testWidgets('blocking a creator hides them from search', (tester) async {
    final market = FakeMarketplace(userId: brandId);
    await pump(
      tester,
      CreatorProfilePage(creatorId: creatorId, service: market),
    );

    await tapText(tester, 'Block creator');
    expect(find.text('Block Cara Creates?'), findsOneWidget);
    await tapText(tester, 'Block', last: true);

    expect(market.blocked, {creatorId});
    final results = await market.searchCreators(const CreatorFilter());
    expect(results.map((c) => c.id), isNot(contains(creatorId)));
  });

  testWidgets('blocked accounts can be unblocked from settings', (
    tester,
  ) async {
    final market = FakeMarketplace(userId: brandId)..blocked.add(creatorId);
    marketplaceService = market;
    await pump(
      tester,
      StartGate(auth: FakeAuth(brandAccount)),
      size: const Size(1280, 900),
    );

    await tapText(tester, 'Account');
    await tapText(tester, 'Blocked accounts');
    expect(find.text('Cara Creates'), findsOneWidget);
    await tapText(tester, 'Unblock');
    expect(market.blocked, isEmpty);
  });
}
