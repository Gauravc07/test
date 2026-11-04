import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:shor/screens/landing_page.dart';
import 'package:shor/theme/app_text.dart';

Future<void> pumpLanding(WidgetTester tester, Size size) async {
  tester.view.physicalSize = size;
  tester.view.devicePixelRatio = 1;
  addTearDown(tester.view.reset);
  await tester.pumpWidget(const MaterialApp(home: LandingPage()));
  await tester.pump();
}

/// Scrolls [finder] into view and nudges it clear of the floating nav.
Future<void> bringIntoView(WidgetTester tester, Finder finder) async {
  await tester.scrollUntilVisible(
    finder,
    300,
    scrollable: find.byType(Scrollable).first,
  );
  await tester.drag(find.byType(SingleChildScrollView), const Offset(0, -150));
  await tester.pump();
  if (tester.getTopLeft(finder).dy < 140) {
    await tester.drag(find.byType(SingleChildScrollView), const Offset(0, 300));
    await tester.pump();
  }
}

void main() {
  // Tests must not try to download fonts.
  AppText.useGoogleFonts = false;

  for (final entry in {
    'phone': const Size(390, 844),
    'tablet': const Size(820, 1180),
    'desktop': const Size(1440, 900),
  }.entries) {
    testWidgets('landing page renders on ${entry.key} without overflow', (
      tester,
    ) async {
      await pumpLanding(tester, entry.value);

      expect(
        find.textContaining('Where creators meet brands', findRichText: true),
        findsOneWidget,
      );
      expect(
        find.text('Built for creators. Designed for brands.'),
        findsOneWidget,
      );
      expect(find.text('Powerful Features for Everyone'), findsOneWidget);
      expect(find.text('How Shor Works'), findsOneWidget);
      expect(find.text('Grow your sales now'), findsOneWidget);
      expect(find.text('Priya Sharma'), findsOneWidget);
      expect(tester.takeException(), isNull);
    });
  }

  testWidgets('features toggle switches to brand features', (tester) async {
    await pumpLanding(tester, const Size(1440, 900));

    expect(find.text('Creator Dashboard'), findsOneWidget);
    final toggle = find.byKey(const ValueKey('audience-toggle-brands'));
    await bringIntoView(tester, toggle);
    await tester.tap(toggle);
    await tester.pump(const Duration(milliseconds: 400));

    expect(find.text('Creator Search Engine'), findsOneWidget);
  });

  testWidgets('testimonials rotate automatically', (tester) async {
    await pumpLanding(tester, const Size(1440, 900));

    expect(find.text('Priya Sharma'), findsOneWidget);
    await tester.pump(const Duration(seconds: 6));
    await tester.pump(const Duration(seconds: 1));
    expect(find.text('Arjun Mehta'), findsOneWidget);
  });

  testWidgets('testimonial indicators jump to a story', (tester) async {
    await pumpLanding(tester, const Size(1440, 900));

    final dot = find.byKey(const ValueKey('testimonial-dot-2'));
    await bringIntoView(tester, dot);
    await tester.tap(dot);
    await tester.pump(const Duration(milliseconds: 800));

    expect(find.text('Sneha Patel'), findsOneWidget);
  });
}
