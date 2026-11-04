import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:shor/backend/instagram_service.dart';
import 'package:shor/screens/instagram_dashboard_page.dart';
import 'package:shor/theme/app_text.dart';
import 'package:shor/utils/links.dart';

class FakeInstagramService implements InstagramService {
  FakeInstagramService(this.dashboard);

  InstagramDashboard? dashboard;
  int connectCalls = 0;
  String? lastReturnTo;
  int syncCalls = 0;
  bool disconnected = false;

  @override
  Future<InstagramDashboard?> loadDashboard() async => dashboard;

  @override
  Future<Uri> startConnect({String? returnTo}) async {
    connectCalls++;
    lastReturnTo = returnTo;
    return Uri.parse('https://www.instagram.com/oauth/authorize?state=x');
  }

  @override
  Future<bool> syncNow() async {
    syncCalls++;
    return true;
  }

  @override
  Future<void> disconnect() async {
    disconnected = true;
    dashboard = null;
  }
}

InstagramDashboard connected({bool needsReauth = false}) {
  final sample = sampleInstagramDashboard(now: DateTime(2026, 11, 4, 12));
  final a = sample.account;
  return InstagramDashboard(
    account: InstagramAccount(
      username: 'cara.creates',
      accountType: a.accountType,
      followers: a.followers,
      follows: a.follows,
      mediaCount: a.mediaCount,
      lastSyncedAt: DateTime.now().subtract(const Duration(minutes: 3)),
      needsReauth: needsReauth,
    ),
    daily: sample.daily,
    followerHistory: sample.followerHistory,
    posts: sample.posts,
    audience: sample.audience,
  );
}

Future<void> pumpDashboard(
  WidgetTester tester,
  InstagramService service, {
  Size size = const Size(1440, 1000),
}) async {
  tester.view.physicalSize = size;
  tester.view.devicePixelRatio = 1;
  addTearDown(tester.view.reset);
  await tester.pumpWidget(
    MaterialApp(home: InstagramDashboardPage(service: service)),
  );
  await tester.pumpAndSettle();
}

void main() {
  AppText.useGoogleFonts = false;

  testWidgets('not connected: explains access and connects in-app', (
    tester,
  ) async {
    final calls = <(Uri, String)>[];
    authenticateInApp = (url, scheme) async {
      calls.add((url, scheme));
      return 'shor://instagram?instagram=connected';
    };
    final service = FakeInstagramService(null);
    await pumpDashboard(tester, service, size: const Size(390, 1600));

    expect(find.text('Connect your Instagram'), findsOneWidget);
    expect(find.text('WHAT SHOR NEVER DOES'), findsOneWidget);

    await tester.tap(find.text('Connect Instagram'));
    await tester.pumpAndSettle();

    // Phones run Instagram's login in the in-app sheet and come back to
    // shor://instagram, not to the browser.
    expect(service.connectCalls, 1);
    expect(service.lastReturnTo, 'shor://instagram');
    expect(calls.single.$1.host, 'www.instagram.com');
    expect(calls.single.$2, 'shor');
    expect(find.textContaining('Instagram connected'), findsOneWidget);
  });

  testWidgets('cancelling the Instagram sheet says so', (tester) async {
    authenticateInApp = (url, scheme) async =>
        throw PlatformException(code: 'CANCELED');
    await pumpDashboard(
      tester,
      FakeInstagramService(null),
      size: const Size(390, 1600),
    );

    await tester.tap(find.text('Connect Instagram'));
    await tester.pumpAndSettle();
    expect(find.text('Instagram connection cancelled.'), findsOneWidget);
  });

  testWidgets('sample preview is clearly labelled', (tester) async {
    await pumpDashboard(tester, FakeInstagramService(null));
    await tester.ensureVisible(find.text('See a sample dashboard'));
    await tester.tap(find.text('See a sample dashboard'));
    await tester.pumpAndSettle();

    expect(find.textContaining('Sample data.'), findsOneWidget);
    expect(find.text('@your.handle'), findsOneWidget);
    // No sync or disconnect on made-up data.
    expect(find.text('Sync now'), findsNothing);
  });

  for (final entry in {
    'phone': const Size(390, 900),
    'tablet': const Size(820, 1100),
    'desktop': const Size(1440, 1000),
  }.entries) {
    testWidgets('dashboard renders on ${entry.key} without overflow', (
      tester,
    ) async {
      await pumpDashboard(
        tester,
        FakeInstagramService(connected()),
        size: entry.value,
      );

      expect(find.text('@cara.creates'), findsOneWidget);
      expect(find.text('FOLLOWERS'), findsOneWidget);
      expect(find.text('Daily views'), findsOneWidget);
      expect(find.text('Top posts'), findsOneWidget);
      expect(find.text('Your audience'), findsOneWidget);
      expect(find.text('India'), findsOneWidget);
      expect(tester.takeException(), isNull);
    });
  }

  testWidgets('metric and period switches update the view', (tester) async {
    await pumpDashboard(tester, FakeInstagramService(connected()));

    expect(find.text('Total in 28 days'), findsOneWidget);
    await tester.tap(find.text('7 days'));
    await tester.pumpAndSettle();
    expect(find.text('Total in 7 days'), findsOneWidget);

    await tester.tap(find.text('Reach').first);
    await tester.pumpAndSettle();
    expect(find.text('Daily reach'), findsOneWidget);

    await tester.tap(find.text('View as table').first);
    await tester.pumpAndSettle();
    expect(find.text('Hide table'), findsOneWidget);
  });

  testWidgets('disconnect asks first, then deletes and resets', (tester) async {
    final service = FakeInstagramService(connected());
    await pumpDashboard(tester, service);

    await tester.tap(find.text('Disconnect'));
    await tester.pumpAndSettle();
    expect(find.text('Disconnect Instagram?'), findsOneWidget);
    await tester.tap(find.text('Disconnect and delete'));
    await tester.pumpAndSettle();

    expect(service.disconnected, isTrue);
    expect(find.text('Connect your Instagram'), findsOneWidget);
  });

  testWidgets('expired access shows a reconnect banner', (tester) async {
    await pumpDashboard(
      tester,
      FakeInstagramService(connected(needsReauth: true)),
    );
    expect(find.text('Reconnect'), findsOneWidget);
  });

  testWidgets('sync now calls the server and reloads', (tester) async {
    final service = FakeInstagramService(connected());
    await pumpDashboard(tester, service);
    await tester.tap(find.text('Sync now'));
    await tester.pumpAndSettle();
    expect(service.syncCalls, 1);
    expect(find.text('Insights updated.'), findsOneWidget);
  });
}
