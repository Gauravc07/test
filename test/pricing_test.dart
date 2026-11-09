import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:shor/backend/marketplace_models.dart';
import 'package:shor/config/pricing.dart';
import 'package:shor/screens/brand/campaign_editor_page.dart';
import 'package:shor/screens/shared/invoice_card.dart';
import 'package:shor/sections/pricing_section.dart';

Invoice _invoice({num fee = 0, num? rate, num brandFee = 0, num gst = 0}) =>
    Invoice(
      id: 'i',
      number: 'INV-1',
      collaborationId: 'c',
      brandId: 'b',
      creatorId: 'cr',
      gross: 20000,
      fee: fee,
      net: 20000 - fee,
      creatorFeeRate: rate,
      brandFee: brandFee,
      brandFeeGst: gst,
      status: InvoiceStatus.pending,
    );

Future<void> _pumpPricing(WidgetTester tester, Size size) async {
  tester.view.physicalSize = size;
  tester.view.devicePixelRatio = 1;
  addTearDown(tester.view.reset);
  await tester.pumpWidget(
    const MaterialApp(
      home: Scaffold(body: SingleChildScrollView(child: PricingSection())),
    ),
  );
  await tester.pumpAndSettle();
}

void main() {
  group('DealQuote', () {
    test('brand pays fee, protection and GST; creator pays 5%', () {
      final q = DealQuote.of(20000);
      expect(q.brandFee, 1400);
      expect(q.brandFeeGst, 252);
      expect(q.brandPays, 21652);
      expect(q.creatorFee, 1000);
      expect(q.creatorReceives, 19000);
    });

    test('free deal waives the creator fee only', () {
      final q = DealQuote.of(20000, freeDeal: true);
      expect(q.creatorFee, 0);
      expect(q.creatorReceives, 20000);
      expect(q.brandPays, 21652);
    });

    test('rounds to paise', () {
      final q = DealQuote.of(999);
      expect(q.brandFee, 69.93);
      expect(q.brandFeeGst, 12.59);
      expect(q.creatorFee, 49.95);
    });
  });

  test('fee terms quote a free deal while free deals are left', () {
    expect(const FeeTerms(freeDealsLeft: 1).quote(10000).freeDeal, isTrue);
    expect(const FeeTerms(freeDealsLeft: 0).quote(10000).creatorFee, 500);
    final t = FeeTerms.fromRow({
      'brand_fee_rate': '0.07',
      'creator_fee_rate': 0.05,
      'gst_rate': 0.18,
      'free_deals_total': 3,
      'free_deals_left': 2,
    });
    expect(t.brandFeeRate, 0.07);
    expect(t.freeDealsLeft, 2);
  });

  test('plans: yearly is 10 months, Creator Pro has its own yearly price', () {
    final growth = Plan.all.firstWhere((p) => p.name == 'Growth');
    expect(growth.annual, 29990);
    expect(growth.monthsFree, 2);
    expect(growth.foundingPrice(BillingPeriod.monthly), 1500);
    final pro = Plan.all.firstWhere((p) => p.name == 'Creator Pro');
    expect(pro.annual, 1499);
  });

  group('invoice breakdown', () {
    test('brand sees the total split into its parts', () {
      expect(
        invoiceBreakdown(_invoice(brandFee: 1400, gst: 252), brandView: true),
        '₹20,000 to the creator + ₹1,400 Shor Protection + ₹252 GST',
      );
    });

    test('creator sees a free deal or the fee taken', () {
      expect(
        invoiceBreakdown(_invoice(rate: 0), brandView: false),
        'No Shor fee on this deal',
      );
      expect(
        invoiceBreakdown(_invoice(fee: 1000, rate: 0.05), brandView: false),
        '₹20,000 agreed − ₹1,000 Shor fee, 5%',
      );
    });

    test('older invoices keep their 10% terms', () {
      final legacy = _invoice(fee: 2000, rate: 0.10);
      expect(legacy.brandTotal, 20000);
      expect(
        invoiceBreakdown(legacy, brandView: false),
        '₹20,000 agreed − ₹2,000 Shor fee, 10%',
      );
      expect(
        invoiceBreakdown(legacy, brandView: true),
        '₹20,000 to the creator',
      );
    });
  });

  test('campaign editor previews the cost per creator', () {
    expect(
      campaignCostNote(20000),
      'Each creator costs you ₹21,652 in total: ₹20,000 to the creator + '
      '₹1,400 Shor Protection + ₹252 GST.',
    );
    expect(campaignCostNote(null), contains('7% Shor Protection'));
  });

  group('pricing section', () {
    testWidgets('shows brand plans with the founding offer', (tester) async {
      await _pumpPricing(tester, const Size(1280, 3200));
      expect(find.text('Simple pricing that pays creators first'), findsOne);
      expect(find.textContaining('Founding brand offer'), findsOne);
      expect(find.text('Growth'), findsOne);
      expect(find.text('₹1,500'), findsOne);
      // The apps never point to a purchase outside the stores.
      expect(find.text('Coming soon'), findsNWidgets(2));
    });

    testWidgets('switches to creator plans and yearly prices', (tester) async {
      await _pumpPricing(tester, const Size(1280, 3200));
      await tester.tap(find.text('For creators'));
      await tester.pumpAndSettle();
      expect(find.text('Creator Pro'), findsOne);
      expect(find.textContaining('Founding brand offer'), findsNothing);
      expect(find.text('Your first 3 deals are free'), findsOne);

      await tester.tap(find.text('Yearly, save more'));
      await tester.pumpAndSettle();
      expect(find.text('₹1,499'), findsOne);
      expect(find.text('4 months free'), findsOne);
    });

    testWidgets('calculator updates both sides', (tester) async {
      await _pumpPricing(tester, const Size(390, 6000));
      final brand = find.byKey(const Key('calc-brand'));
      final creator = find.byKey(const Key('calc-creator'));
      expect(
        find.descendant(of: brand, matching: find.text('₹21,652')),
        findsOne,
      );
      expect(
        find.descendant(of: creator, matching: find.text('₹19,000')),
        findsOne,
      );

      await tester.enterText(find.byKey(const Key('calc-amount')), '50000');
      await tester.pumpAndSettle();
      expect(
        find.descendant(of: creator, matching: find.text('₹47,500')),
        findsOne,
      );

      await tester.tap(find.byType(Switch));
      await tester.pumpAndSettle();
      expect(
        find.descendant(of: creator, matching: find.text('₹50,000')),
        findsWidgets,
      );
      expect(tester.takeException(), isNull);
    });
  });
}
