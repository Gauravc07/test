import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:shor/backend/marketplace_service.dart';
import 'package:shor/screens/collaboration_page.dart';
import 'package:shor/sections/pricing_section.dart';
import 'package:shor/theme/app_text.dart';

import 'marketplace_test.dart' show pump, tapText;
import 'support/fakes.dart';

void main() {
  AppText.useGoogleFonts = false;

  testWidgets('the store apps show deal fees, never subscription plans', (
    tester,
  ) async {
    // Tests run as a phone app (not web), like the store builds.
    await pump(tester, const PricingPage(), size: const Size(390, 2400));
    expect(find.text('Fees'), findsOne);
    expect(find.text('Growth'), findsNothing);
    expect(find.text('Coming soon'), findsNothing);
    expect(find.textContaining('launching soon'), findsNothing);
    expect(find.textContaining('Founding brand offer'), findsNothing);
    expect(find.textContaining('Shor Protection'), findsWidgets);
    expect(tester.takeException(), isNull);
  });

  testWidgets('other people’s reviews can be reported, your own can’t', (
    tester,
  ) async {
    final m = FakeMarketplace(userId: brandId);
    final c = m.addCollab(status: CollabStatus.completed);
    await m.submitReview(c.id, rating: 5, comment: 'Lovely work');
    m.userId = creatorId;
    await m.submitReview(c.id, rating: 1, comment: 'Abusive words here');
    m.userId = brandId;

    await pump(
      tester,
      CollaborationPage(collaborationId: c.id, service: m),
      size: const Size(1280, 2600),
    );
    expect(find.text('Abusive words here'), findsOne);
    expect(
      find.byKey(ValueKey('report-review-${c.id}|$brandId')),
      findsNothing,
    );
    final report = find.byKey(ValueKey('report-review-${c.id}|$creatorId'));
    expect(report, findsOne);

    await tester.ensureVisible(report);
    await tester.tap(report);
    await tester.pumpAndSettle();
    await tapText(tester, 'Harassment or bullying');
    await tapText(tester, 'Send report', last: true);
    expect(m.reports.single.$1, ReportTarget.review);
    expect(m.reports.single.$2, '${c.id}|$creatorId');
  });
}
