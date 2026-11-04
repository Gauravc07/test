import 'dart:math' as math;

import 'package:fl_chart/fl_chart.dart';
import 'package:flutter/material.dart';

import '../theme/app_colors.dart';
import '../theme/app_text.dart';

/// Single data-series colour for charts: a lighter step of the brand navy
/// (#1E3A8A sits below the chart lightness band). Validated with the dataviz
/// palette checker: lightness band, chroma and >=3:1 on white all pass.
const chartSeries = Color(0xFF3559B8);
const _gridLine = Color(0xFFEDEAE4);

const _months = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

String formatDay(DateTime d) => '${d.day} ${_months[d.month - 1]}';

/// 1234 → "1,234", 12345 → "12.3K", 1234567 → "1.2M".
String formatCompact(num? value) {
  if (value == null) return '—';
  final v = value.abs();
  final sign = value < 0 ? '-' : '';
  String trim(double x) {
    final s = x.toStringAsFixed(1);
    return s.endsWith('.0') ? s.substring(0, s.length - 2) : s;
  }

  if (v >= 1e6) return '$sign${trim(v / 1e6)}M';
  if (v >= 1e4) return '$sign${trim(v / 1e3)}K';
  return '$sign${_withCommas(v.round())}';
}

String formatFull(num? value) =>
    value == null ? '—' : _withCommas(value.round());

String _withCommas(int v) {
  final s = v.abs().toString();
  final b = StringBuffer(v < 0 ? '-' : '');
  for (var i = 0; i < s.length; i++) {
    if (i > 0 && (s.length - i) % 3 == 0) b.write(',');
    b.write(s[i]);
  }
  return b.toString();
}

class TrendPoint {
  const TrendPoint(this.date, this.value);

  final DateTime date;
  final num value;
}

/// One-series line chart over time with a crosshair tooltip and a table
/// view. Gaps (null values) are left out rather than drawn as zero.
class TrendChart extends StatefulWidget {
  const TrendChart({
    super.key,
    required this.points,
    required this.metricLabel,
    this.height = 220,
    this.zeroBaseline = true,
  });

  final List<TrendPoint> points;
  final String metricLabel;
  final double height;

  /// False fits the axis to the data, for totals like follower count where
  /// a zero baseline would flatten every change.
  final bool zeroBaseline;

  @override
  State<TrendChart> createState() => _TrendChartState();
}

class _TrendChartState extends State<TrendChart> {
  bool _showTable = false;

  @override
  Widget build(BuildContext context) {
    final points = widget.points;
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        SizedBox(
          height: widget.height,
          child: points.length < 2
              ? Center(
                  child: Text(
                    'Not enough data yet. Check back after the next sync.',
                    textAlign: TextAlign.center,
                    style: AppText.sans(size: 14, color: AppColors.textMuted),
                  ),
                )
              : Semantics(
                  label:
                      '${widget.metricLabel} from ${formatDay(points.first.date)} '
                      'to ${formatDay(points.last.date)}. Latest '
                      '${formatFull(points.last.value)}.',
                  child: LayoutBuilder(
                    builder: (context, c) => _chart(points, c.maxWidth),
                  ),
                ),
        ),
        Align(
          alignment: Alignment.centerRight,
          child: TextButton.icon(
            onPressed: points.isEmpty
                ? null
                : () => setState(() => _showTable = !_showTable),
            icon: Icon(
              _showTable ? Icons.expand_less : Icons.table_rows_outlined,
              size: 18,
            ),
            label: Text(_showTable ? 'Hide table' : 'View as table'),
          ),
        ),
        if (_showTable) _table(points),
      ],
    );
  }

  Widget _chart(List<TrendPoint> points, double width) {
    final hi = points.map((p) => p.value).reduce(math.max).toDouble();
    final lo = points.map((p) => p.value).reduce(math.min).toDouble();
    double minY = 0, maxY, interval;
    if (widget.zeroBaseline) {
      maxY = _niceCeil(hi == 0 ? 1 : hi * 1.1);
      interval = maxY / 4;
    } else {
      final range = hi - lo == 0 ? math.max(1.0, hi * 0.02) : hi - lo;
      interval = _niceCeil(range * 1.5 / 4);
      minY = math.max(0, ((lo - range * 0.25) / interval).floor() * interval);
      maxY = minY + interval * 4;
      while (maxY < hi) {
        maxY += interval;
      }
    }
    // About one date label per 64px, never crowding the last one.
    final slots = math.max(2, ((width - 44) / 64).floor());
    final labelEvery = math.max(1, (points.length / slots).ceil());

    return LineChart(
      LineChartData(
        minY: minY,
        maxY: maxY,
        minX: 0,
        maxX: (points.length - 1).toDouble(),
        gridData: FlGridData(
          drawVerticalLine: false,
          horizontalInterval: interval,
          getDrawingHorizontalLine: (_) =>
              const FlLine(color: _gridLine, strokeWidth: 1),
        ),
        borderData: FlBorderData(show: false),
        titlesData: FlTitlesData(
          topTitles: const AxisTitles(),
          rightTitles: const AxisTitles(),
          leftTitles: AxisTitles(
            sideTitles: SideTitles(
              showTitles: true,
              reservedSize: 44,
              interval: interval,
              getTitlesWidget: (value, meta) => value == meta.max
                  ? const SizedBox.shrink()
                  : Text(
                      formatCompact(value),
                      style: AppText.sans(size: 11, color: AppColors.textMuted),
                    ),
            ),
          ),
          bottomTitles: AxisTitles(
            sideTitles: SideTitles(
              showTitles: true,
              reservedSize: 26,
              interval: 1,
              getTitlesWidget: (value, meta) {
                final i = value.round();
                if (i < 0 || i >= points.length || value != i) {
                  return const SizedBox.shrink();
                }
                final isEdge = i == points.length - 1;
                if (i % labelEvery != 0 && !isEdge) {
                  return const SizedBox.shrink();
                }
                if (!isEdge && points.length - 1 - i < labelEvery) {
                  return const SizedBox.shrink();
                }
                return Padding(
                  padding: const EdgeInsets.only(top: 6),
                  child: Text(
                    formatDay(points[i].date),
                    style: AppText.sans(size: 11, color: AppColors.textMuted),
                  ),
                );
              },
            ),
          ),
        ),
        lineTouchData: LineTouchData(
          handleBuiltInTouches: true,
          getTouchedSpotIndicator: (bar, indexes) => [
            for (final _ in indexes)
              TouchedSpotIndicatorData(
                const FlLine(color: AppColors.borderStrong, strokeWidth: 1),
                FlDotData(
                  getDotPainter: (spot, percent, bar, index) =>
                      FlDotCirclePainter(
                        radius: 5,
                        color: chartSeries,
                        strokeWidth: 2,
                        strokeColor: Colors.white,
                      ),
                ),
              ),
          ],
          touchTooltipData: LineTouchTooltipData(
            getTooltipColor: (_) => AppColors.navy,
            tooltipBorderRadius: BorderRadius.circular(6),
            tooltipPadding: const EdgeInsets.symmetric(
              horizontal: 10,
              vertical: 6,
            ),
            fitInsideHorizontally: true,
            fitInsideVertically: true,
            getTooltipItems: (spots) => [
              for (final s in spots)
                LineTooltipItem(
                  '${formatDay(points[s.x.round()].date)}\n',
                  AppText.sans(size: 11, color: AppColors.white(0.75)),
                  children: [
                    TextSpan(
                      text:
                          '${formatFull(points[s.x.round()].value)} '
                          '${widget.metricLabel.toLowerCase()}',
                      style: AppText.sans(
                        size: 13,
                        weight: FontWeight.w600,
                        color: Colors.white,
                      ),
                    ),
                  ],
                ),
            ],
          ),
        ),
        lineBarsData: [
          LineChartBarData(
            spots: [
              for (var i = 0; i < points.length; i++)
                FlSpot(i.toDouble(), points[i].value.toDouble()),
            ],
            color: chartSeries,
            barWidth: 2,
            isCurved: false,
            dotData: const FlDotData(show: false),
            belowBarData: BarAreaData(
              show: true,
              color: chartSeries.withValues(alpha: 0.08),
            ),
          ),
        ],
      ),
      duration: const Duration(milliseconds: 250),
    );
  }

  Widget _table(List<TrendPoint> points) {
    return Container(
      constraints: const BoxConstraints(maxHeight: 260),
      decoration: BoxDecoration(
        border: Border.all(color: AppColors.border),
        borderRadius: BorderRadius.circular(8),
      ),
      child: ListView(
        shrinkWrap: true,
        children: [
          for (final p in points.reversed)
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
              child: Row(
                children: [
                  Expanded(
                    child: Text(
                      formatDay(p.date),
                      style: AppText.sans(
                        size: 14,
                        color: AppColors.textSecondary,
                      ),
                    ),
                  ),
                  Text(
                    formatFull(p.value),
                    style: AppText.sans(size: 14, weight: FontWeight.w600),
                  ),
                ],
              ),
            ),
        ],
      ),
    );
  }

  /// Rounds up to 1, 2, 2.5 or 5 × a power of ten for clean gridlines.
  static double _niceCeil(double v) {
    final exp = math.pow(10, (math.log(v) / math.ln10).floor()).toDouble();
    for (final m in [1.0, 2.0, 2.5, 5.0, 10.0]) {
      if (m * exp >= v) return m * exp;
    }
    return 10 * exp;
  }
}

class BarDatum {
  const BarDatum(this.label, this.value);

  final String label;
  final num value;
}

/// Horizontal bars, each labelled with its share of the total. Labels are
/// always visible, so no tooltip is needed and colour carries nothing alone.
class LabeledBars extends StatelessWidget {
  const LabeledBars({super.key, required this.data, this.labelWidth = 96});

  final List<BarDatum> data;
  final double labelWidth;

  @override
  Widget build(BuildContext context) {
    final total = data.fold<num>(0, (s, d) => s + d.value);
    final max = data.fold<num>(0, (m, d) => d.value > m ? d.value : m);
    return Column(
      children: [
        for (final d in data)
          Padding(
            padding: const EdgeInsets.symmetric(vertical: 5),
            child: Semantics(
              label:
                  '${d.label}: ${total == 0 ? 0 : (d.value / total * 100).round()} percent',
              excludeSemantics: true,
              child: Row(
                children: [
                  SizedBox(
                    width: labelWidth,
                    child: Text(
                      d.label,
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      style: AppText.sans(
                        size: 13,
                        color: AppColors.textSecondary,
                      ),
                    ),
                  ),
                  Expanded(
                    child: FractionallySizedBox(
                      alignment: Alignment.centerLeft,
                      // Keep tiny values visible as a 4px stub.
                      widthFactor: max == 0
                          ? 0.001
                          : math.max(0.02, d.value / max).toDouble(),
                      child: Container(
                        height: 10,
                        decoration: const BoxDecoration(
                          color: chartSeries,
                          borderRadius: BorderRadius.horizontal(
                            right: Radius.circular(4),
                          ),
                        ),
                      ),
                    ),
                  ),
                  SizedBox(
                    width: 48,
                    child: Text(
                      total == 0
                          ? '—'
                          : '${(d.value / total * 100).toStringAsFixed(d.value / total < 0.1 ? 1 : 0)}%',
                      textAlign: TextAlign.right,
                      style: AppText.sans(size: 13, weight: FontWeight.w600),
                    ),
                  ),
                ],
              ),
            ),
          ),
      ],
    );
  }
}
