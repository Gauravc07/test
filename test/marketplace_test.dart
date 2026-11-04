import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:shor/backend/marketplace_service.dart';
import 'package:shor/screens/brand/brand_campaign_page.dart';
import 'package:shor/screens/chat_page.dart';
import 'package:shor/screens/collaboration_page.dart';
import 'package:shor/screens/home_shell.dart';
import 'package:shor/theme/app_text.dart';
import 'package:shor/utils/format.dart';

import 'support/fakes.dart';

Future<void> pump(
  WidgetTester tester,
  Widget page, {
  Size size = const Size(1280, 1000),
}) async {
  tester.view.physicalSize = size;
  tester.view.devicePixelRatio = 1;
  addTearDown(tester.view.reset);
  await tester.pumpWidget(MaterialApp(home: page));
  await tester.pumpAndSettle();
}

Widget shell(FakeMarketplace market, {required bool brand}) => HomeShell(
  auth: FakeAuth(brand ? brandAccount : creatorAccount),
  marketplace: market,
  instagram: FakeInstagram(),
);

Future<void> tapText(
  WidgetTester tester,
  String text, {
  bool last = false,
}) async {
  final finder = last ? find.text(text).last : find.text(text).first;
  await tester.ensureVisible(finder);
  await tester.pumpAndSettle();
  await tester.tap(finder);
  await tester.pumpAndSettle();
}

void main() {
  AppText.useGoogleFonts = false;

  group('formatting', () {
    test('rupees use Indian grouping and show paise only when present', () {
      expect(formatMoney(1200000), '₹12,00,000');
      expect(formatMoney(999), '₹999');
      expect(formatMoney(10800.5), '₹10,800.50');
      expect(formatMoney(1500, currency: 'USD'), r'$1,500');
      expect(formatMoney(null), '—');
    });

    test('Instagram post links are recognised', () {
      expect(
        isInstagramPostUrl('https://www.instagram.com/reel/ABC123/'),
        isTrue,
      );
      expect(
        isInstagramPostUrl('https://instagram.com/p/Xy_9-z?igsh=1'),
        isTrue,
      );
      expect(isInstagramPostUrl('https://youtube.com/watch?v=1'), isFalse);
      expect(isInstagramPostUrl('http://instagram.com/p/abc'), isFalse);
    });

    test('database errors are shown kindly', () {
      expect(
        friendlyDatabaseError(
          '42501',
          'post live only after the brand approves your draft',
        ),
        'post live only after the brand approves your draft',
      );
      expect(
        friendlyDatabaseError(
          '42501',
          'new row violates row-level security policy for table "x"',
        ),
        'You do not have permission to do that.',
      );
      expect(
        friendlyDatabaseError(
          '23505',
          'duplicate key value violates unique constraint "collaborations_campaign_id_creator_id_key"',
        ),
        'This creator is already part of that campaign.',
      );
    });
  });

  group('home', () {
    for (final size in const [Size(390, 900), Size(1280, 900)]) {
      testWidgets('creator tabs render at ${size.width.toInt()}px', (
        tester,
      ) async {
        await pump(
          tester,
          shell(FakeMarketplace(userId: creatorId), brand: false),
          size: size,
        );

        expect(find.text('Find campaigns'), findsOneWidget);
        expect(find.text('Monsoon skincare reels'), findsOneWidget);
        expect(find.text('Cafe launch in Pune'), findsOneWidget);

        await tapText(tester, 'My work');
        expect(find.text('My collaborations'), findsOneWidget);
        expect(find.text('Nothing here yet'), findsOneWidget);

        await tapText(tester, 'Profile');
        expect(find.text('Your profile'), findsOneWidget);
        expect(find.textContaining('Instagram connected'), findsOneWidget);
        expect(tester.takeException(), isNull);
      });

      testWidgets('brand tabs render at ${size.width.toInt()}px', (
        tester,
      ) async {
        await pump(
          tester,
          shell(FakeMarketplace(userId: brandId), brand: true),
          size: size,
        );

        expect(find.text('New campaign'), findsOneWidget);
        expect(find.text('Monsoon skincare reels'), findsOneWidget);

        await tapText(tester, 'Creators');
        expect(find.text('Find creators'), findsOneWidget);
        expect(find.text('Cara Creates'), findsOneWidget);

        await tapText(tester, 'Payments');
        expect(find.text('No invoices yet'), findsOneWidget);

        await tapText(tester, 'Account');
        expect(find.text('Brand profile'), findsOneWidget);
        expect(tester.takeException(), isNull);
      });
    }
  });

  group('creator workflow', () {
    testWidgets('applies to a campaign with a quote', (tester) async {
      final market = FakeMarketplace(userId: creatorId);
      await pump(tester, shell(market, brand: false));

      await tapText(tester, 'Monsoon skincare reels');
      expect(find.text('What to post'), findsOneWidget);
      await tapText(tester, 'Apply now');

      await tester.enterText(
        find.widgetWithText(TextFormField, 'Your pitch'),
        'Short pitch',
      );
      await tapText(tester, 'Send application');
      expect(find.text('Write at least a couple of sentences'), findsOneWidget);

      await tester.enterText(
        find.widgetWithText(TextFormField, 'Your pitch'),
        'I post calm, honest skincare reels for a Pune audience of 24K.',
      );
      await tester.enterText(
        find.widgetWithText(TextFormField, 'Your price (₹)'),
        '14000',
      );
      await tapText(tester, 'Send application');

      final collab = market.collabs.values.single;
      expect(collab.status, CollabStatus.applied);
      expect(collab.agreedAmount, 14000);
      expect(find.text('View collaboration'), findsOneWidget);
    });

    testWidgets('accepts an invitation, then submits a draft', (tester) async {
      final market = FakeMarketplace(userId: creatorId);
      final c = market.addCollab(status: CollabStatus.invited);
      await pump(
        tester,
        CollaborationPage(collaborationId: c.id, service: market),
      );

      expect(find.text('You are invited'), findsOneWidget);
      await tapText(tester, 'Accept invitation');
      expect(market.collabs[c.id]!.status, CollabStatus.accepted);
      expect(find.text('Share your draft'), findsOneWidget);

      await tapText(tester, 'Submit draft');
      await tester.enterText(
        find.widgetWithText(TextFormField, 'Draft link'),
        'not a link',
      );
      await tapText(tester, 'Submit draft', last: true);
      expect(find.text('Paste a link starting with https://'), findsOneWidget);

      await tester.enterText(
        find.widgetWithText(TextFormField, 'Draft link'),
        'https://drive.google.com/file/d/123',
      );
      await tapText(tester, 'Submit draft', last: true);

      expect(market.collabs[c.id]!.status, CollabStatus.inProgress);
      expect(market.subs.values.single.status, SubmissionStatus.pending);
      expect(find.text('Waiting for review'), findsOneWidget);
    });

    testWidgets('live post must be an Instagram link', (tester) async {
      final market = FakeMarketplace(userId: creatorId);
      final c = market.addCollab(status: CollabStatus.inProgress);
      market.addSubmission(
        c.id,
        SubmissionKind.draft,
        SubmissionStatus.approved,
      );
      await pump(
        tester,
        CollaborationPage(collaborationId: c.id, service: market),
      );

      expect(find.text('Post it on Instagram'), findsOneWidget);
      await tapText(tester, 'Submit live post');
      final field = find.widgetWithText(TextFormField, 'Instagram post link');
      await tester.enterText(field, 'https://youtube.com/watch?v=1');
      await tapText(tester, 'Submit live post', last: true);
      expect(
        find.text('Paste a link to an Instagram post or reel'),
        findsOneWidget,
      );
      expect(
        find.textContaining('shares this post’s Instagram insights'),
        findsOneWidget,
      );

      await tester.enterText(field, 'https://www.instagram.com/reel/ABC123/');
      await tapText(tester, 'Submit live post', last: true);
      expect(market.collabs[c.id]!.status, CollabStatus.awaitingApproval);
      expect(find.text('Waiting for approval'), findsOneWidget);
    });

    testWidgets('requests payment once complete', (tester) async {
      final market = FakeMarketplace(userId: creatorId);
      final c = market.addCollab(status: CollabStatus.completed);
      await pump(
        tester,
        CollaborationPage(collaborationId: c.id, service: market),
      );

      expect(find.text('Get paid'), findsOneWidget);
      await tapText(tester, 'Request payment');
      expect(find.textContaining('you receive ₹10,800'), findsOneWidget);
      await tapText(tester, 'Send invoice');

      expect(market.invoicesById.values.single.gross, 12000);
      expect(find.text('Payment requested'), findsOneWidget);
    });
  });

  group('brand workflow', () {
    testWidgets('accepts an application from the campaign page', (
      tester,
    ) async {
      final market = FakeMarketplace(userId: brandId);
      final c = market.addCollab(status: CollabStatus.applied);
      await pump(
        tester,
        BrandCampaignPage(campaignId: 'camp-1', service: market),
      );

      expect(find.text('Applications (1)'), findsOneWidget);
      expect(find.text('Cara Creates'), findsOneWidget);
      await tapText(tester, 'Accept');

      expect(market.collabs[c.id]!.status, CollabStatus.accepted);
      expect(find.text('Hired (1)'), findsOneWidget);
    });

    testWidgets('asks for changes on a draft, with feedback required', (
      tester,
    ) async {
      final market = FakeMarketplace(userId: brandId);
      final c = market.addCollab(status: CollabStatus.inProgress);
      final s = market.addSubmission(
        c.id,
        SubmissionKind.draft,
        SubmissionStatus.pending,
      );
      await pump(
        tester,
        CollaborationPage(collaborationId: c.id, service: market),
      );

      expect(find.text('Review the draft'), findsOneWidget);
      await tapText(tester, 'Request changes');
      await tapText(tester, 'Send feedback');
      expect(find.text('Required'), findsOneWidget);

      await tester.enterText(
        find.byType(TextFormField).last,
        'Show the product sooner',
      );
      await tapText(tester, 'Send feedback');

      expect(market.subs[s.id]!.status, SubmissionStatus.changesRequested);
      expect(market.subs[s.id]!.feedback, 'Show the product sooner');
    });

    testWidgets('approving the live post completes the collaboration', (
      tester,
    ) async {
      final market = FakeMarketplace(userId: brandId);
      final c = market.addCollab(status: CollabStatus.awaitingApproval);
      market.addSubmission(
        c.id,
        SubmissionKind.draft,
        SubmissionStatus.approved,
      );
      market.addSubmission(
        c.id,
        SubmissionKind.live,
        SubmissionStatus.pending,
        url: 'https://www.instagram.com/reel/ABC123/',
      );
      await pump(
        tester,
        CollaborationPage(collaborationId: c.id, service: market),
      );

      expect(find.text('Check the live post'), findsOneWidget);
      await tapText(tester, 'Approve and complete');
      expect(market.collabs[c.id]!.status, CollabStatus.completed);
    });

    testWidgets('writes and publishes a campaign brief', (tester) async {
      final market = FakeMarketplace(userId: brandId);
      await pump(tester, shell(market, brand: true));

      await tapText(tester, 'New campaign');
      await tapText(tester, 'Publish');
      expect(find.text('Give the campaign a name'), findsOneWidget);

      await tester.enterText(
        find.widgetWithText(TextFormField, 'Campaign name'),
        'Festive gifting reels',
      );
      await tapText(tester, 'Publish');

      final created = market.campaigns.values.firstWhere(
        (c) => c.title == 'Festive gifting reels',
      );
      expect(created.status, CampaignStatus.active);
      expect(created.deliverables, {'reels': 1});
      // Lands on the new campaign's page.
      expect(find.text('Applications (0)'), findsOneWidget);
    });

    testWidgets('filters creators by niche and saves one to a list', (
      tester,
    ) async {
      final market = FakeMarketplace(userId: brandId);
      await pump(tester, shell(market, brand: true));
      await tapText(tester, 'Creators');

      await tapText(tester, 'All niches');
      await tapText(tester, 'Food', last: true);
      expect(find.text('Dev Eats'), findsOneWidget);
      expect(find.text('Cara Creates'), findsNothing);

      await tester.tap(find.byTooltip('Save to a list'));
      await tester.pumpAndSettle();
      await tapText(tester, 'Create and save');

      expect(market.lists.values.single.$2, {otherCreatorId});
    });

    testWidgets('invites a creator to a campaign with a message', (
      tester,
    ) async {
      final market = FakeMarketplace(userId: brandId);
      await pump(tester, shell(market, brand: true));
      await tapText(tester, 'Creators');

      await tapText(tester, 'Invite');
      expect(find.text('Invite Cara Creates'), findsOneWidget);
      await tapText(tester, 'Send invitation');

      final invite = market.collabs.values.single;
      expect(invite.status, CollabStatus.invited);
      expect(invite.creatorId, creatorId);
      expect(market.sentMessages.single, contains('Monsoon skincare reels'));
    });

    testWidgets('approves an invoice from Payments', (tester) async {
      final market = FakeMarketplace(userId: brandId);
      final c = market.addCollab(status: CollabStatus.completed);
      await market.requestPayment(c);
      await pump(tester, shell(market, brand: true));

      await tapText(tester, 'Payments');
      expect(find.text('Waiting for you'), findsOneWidget);
      await tapText(tester, 'Approve');

      expect(market.invoicesById.values.single.status, InvoiceStatus.approved);
    });
  });

  testWidgets('chat sends and shows messages', (tester) async {
    final market = FakeMarketplace(userId: brandId);
    final conversation = await market.openConversation(
      brandId: brandId,
      creatorId: creatorId,
      campaignId: 'camp-1',
    );
    await pump(tester, ChatPage(conversation: conversation, service: market));

    expect(find.text('Say hello'), findsOneWidget);
    expect(find.text('About: Monsoon skincare reels'), findsOneWidget);
    await tester.enterText(find.byType(TextField), 'Can you post by Friday?');
    await tester.tap(find.byTooltip('Send'));
    await tester.pumpAndSettle();

    expect(find.text('Can you post by Friday?'), findsOneWidget);
  });
}
