import '../utils/format.dart';
import 'marketplace_models.dart';

/// One hired creator's results on a campaign.
class ReportRow {
  const ReportRow({
    required this.collaboration,
    required this.cost,
    required this.invoiced,
    this.post,
    this.sales,
  });

  final Collaboration collaboration;

  /// Their live post, if submitted.
  final LivePost? post;

  /// What the brand pays: the invoice total (fee + Shor Protection + GST)
  /// once invoiced, otherwise the agreed fee.
  final num cost;
  final bool invoiced;

  /// Tracked-link clicks and attributed orders.
  final SalesRow? sales;

  int get clicks => sales?.clicks ?? 0;
  int get orders => sales?.orders ?? 0;
  num get revenue => sales?.revenue ?? 0;

  num? get costPerOrder => orders == 0 || cost == 0 ? null : cost / orders;

  /// Revenue for every rupee spent.
  num? get roas => cost == 0 || revenue == 0 ? null : revenue / cost;

  String get name => collaboration.creator?.displayName ?? 'Creator';
  bool get synced => post?.matched ?? false;

  int get views => synced ? post!.views ?? 0 : 0;
  int get reach => synced ? post!.reach ?? 0 : 0;
  int get interactions => synced ? post!.interactions : 0;
  int get saves => synced ? post!.saved ?? 0 : 0;
  int get shares => synced ? post!.shares ?? 0 : 0;

  /// Interactions ÷ reach, as a percentage.
  double? get engagementRate => reach == 0 ? null : interactions / reach * 100;

  num? get costPerThousandViews =>
      views == 0 || cost == 0 ? null : cost / views * 1000;

  num? get costPerEngagement =>
      interactions == 0 || cost == 0 ? null : cost / interactions;
}

/// A campaign's results: per creator and in total.
class CampaignReport {
  const CampaignReport._(this.rows, this.currency);

  /// Hired creators, best performing first.
  factory CampaignReport.build({
    required List<Collaboration> collaborations,
    required List<LivePost> posts,
    required List<Invoice> invoices,
    List<SalesRow> sales = const [],
    String currency = 'INR',
  }) {
    final postByCollab = {for (final p in posts) p.collaborationId: p};
    final salesByCollab = {for (final s in sales) s.collaborationId: s};
    final rows = <ReportRow>[];
    for (final c in collaborations.where((c) => c.status.isHired)) {
      final invoice = invoices
          .where(
            (i) =>
                i.collaborationId == c.id && i.status != InvoiceStatus.rejected,
          )
          .firstOrNull;
      rows.add(
        ReportRow(
          collaboration: c,
          post: postByCollab[c.id],
          cost: invoice?.brandTotal ?? c.agreedAmount ?? 0,
          invoiced: invoice != null,
          sales: salesByCollab[c.id],
        ),
      );
    }
    rows.sort((a, b) {
      final byViews = b.views.compareTo(a.views);
      return byViews != 0 ? byViews : a.name.compareTo(b.name);
    });
    return CampaignReport._(rows, currency);
  }

  final List<ReportRow> rows;
  final String currency;

  int _sum(int Function(ReportRow) f) => rows.fold(0, (s, r) => s + f(r));

  int get postsLive => rows.where((r) => r.post != null).length;
  int get postsSynced => rows.where((r) => r.synced).length;
  int get views => _sum((r) => r.views);
  int get reach => _sum((r) => r.reach);
  int get interactions => _sum((r) => r.interactions);
  int get saves => _sum((r) => r.saves);
  int get shares => _sum((r) => r.shares);
  num get cost => rows.fold<num>(0, (s, r) => s + r.cost);
  int get clicks => _sum((r) => r.clicks);
  int get orders => _sum((r) => r.orders);
  num get revenue => rows.fold<num>(0, (s, r) => s + r.revenue);

  /// Any tracked clicks or orders yet.
  bool get hasSales => clicks > 0 || orders > 0;

  num? get costPerOrder => orders == 0 || cost == 0 ? null : cost / orders;

  /// Revenue for every rupee spent, e.g. 3.2 means ₹3.20 back per ₹1.
  num? get roas => cost == 0 || revenue == 0 ? null : revenue / cost;

  /// Most revenue. Null until a sale is credited.
  ReportRow? get topSeller {
    final selling = rows.where((r) => r.revenue > 0).toList()
      ..sort((a, b) => b.revenue.compareTo(a.revenue));
    return selling.firstOrNull;
  }

  double? get engagementRate => reach == 0 ? null : interactions / reach * 100;

  /// Cost of the posts that have results, per 1,000 views.
  num? get costPerThousandViews {
    final measured = rows.where((r) => r.views > 0);
    final v = measured.fold<int>(0, (s, r) => s + r.views);
    final c = measured.fold<num>(0, (s, r) => s + r.cost);
    return v == 0 || c == 0 ? null : c / v * 1000;
  }

  /// Most views. Null until at least one post has results.
  ReportRow? get mostViews =>
      rows.isEmpty || rows.first.views == 0 ? null : rows.first;

  /// Lowest cost per 1,000 views, among paid posts with results. Null when
  /// fewer than two to compare.
  ReportRow? get bestValue {
    final paid = rows.where((r) => r.costPerThousandViews != null).toList();
    if (paid.length < 2) return null;
    paid.sort(
      (a, b) => a.costPerThousandViews!.compareTo(b.costPerThousandViews!),
    );
    return paid.first;
  }

  /// Spreadsheet-ready results, one row per creator.
  String toCsv() {
    String cell(Object? v) {
      final s = v?.toString() ?? '';
      return s.contains(RegExp('[",\n]')) ? '"${s.replaceAll('"', '""')}"' : s;
    }

    String n(num? v, [int digits = 2]) => v == null
        ? ''
        : (v % 1 == 0 ? v.toInt().toString() : v.toStringAsFixed(digits));

    final lines = [
      [
        'Creator',
        'Instagram',
        'Post',
        'Views',
        'Reach',
        'Likes',
        'Comments',
        'Saves',
        'Shares',
        'Interactions',
        'Engagement %',
        'Cost ($currency)',
        'Invoiced',
        'Cost per 1K views',
        'Cost per engagement',
        'Clicks',
        'Orders',
        'Revenue ($currency)',
        'Cost per order',
        'Return on spend',
      ].join(','),
      for (final r in rows)
        [
          cell(r.name),
          cell(r.collaboration.creator?.instagramHandle),
          cell(r.post?.contentUrl),
          r.synced ? r.views : '',
          r.synced ? r.reach : '',
          r.synced ? r.post!.likes ?? '' : '',
          r.synced ? r.post!.comments ?? '' : '',
          r.synced ? r.saves : '',
          r.synced ? r.shares : '',
          r.synced ? r.interactions : '',
          n(r.engagementRate, 1),
          n(r.cost),
          r.invoiced ? 'yes' : 'no',
          n(r.costPerThousandViews),
          n(r.costPerEngagement),
          r.clicks,
          r.orders,
          n(r.revenue),
          n(r.costPerOrder),
          n(r.roas),
        ].join(','),
    ];
    return '${lines.join('\n')}\n';
  }

  String money(num? v) => v == null ? '—' : formatMoney(v, currency: currency);
}
