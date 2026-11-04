export '../widgets/insight_charts.dart'
    show formatCompact, formatFull, formatDay;

/// Content categories creators pick and campaigns target.
const niches = [
  'Fashion',
  'Beauty',
  'Lifestyle',
  'Food',
  'Travel',
  'Fitness',
  'Health',
  'Tech',
  'Gaming',
  'Finance',
  'Education',
  'Parenting',
  'Comedy',
  'Music',
  'Art & Design',
  'Sports',
  'Automobile',
  'Home & Decor',
];

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

/// ₹1,20,000 for rupees (Indian grouping), $1,200 / €1,200 otherwise.
/// Paise are shown only when present.
String formatMoney(num? amount, {String currency = 'INR'}) {
  if (amount == null) return '—';
  final symbol = switch (currency) {
    'INR' => '₹',
    'USD' => r'$',
    'EUR' => '€',
    'GBP' => '£',
    _ => '$currency ',
  };
  final negative = amount < 0;
  final abs = amount.abs();
  final whole = abs.floor();
  final paise = ((abs - whole) * 100).round();
  final digits = whole.toString();

  String grouped;
  if (currency == 'INR' && digits.length > 3) {
    final last3 = digits.substring(digits.length - 3);
    var rest = digits.substring(0, digits.length - 3);
    final parts = <String>[];
    while (rest.length > 2) {
      parts.insert(0, rest.substring(rest.length - 2));
      rest = rest.substring(0, rest.length - 2);
    }
    if (rest.isNotEmpty) parts.insert(0, rest);
    grouped = '${parts.join(',')},$last3';
  } else {
    final b = StringBuffer();
    for (var i = 0; i < digits.length; i++) {
      if (i > 0 && (digits.length - i) % 3 == 0) b.write(',');
      b.write(digits[i]);
    }
    grouped = b.toString();
  }
  final fraction = paise == 0 ? '' : '.${paise.toString().padLeft(2, '0')}';
  return '${negative ? '-' : ''}$symbol$grouped$fraction';
}

/// "5 Nov 2026".
String formatDate(DateTime? d) =>
    d == null ? '—' : '${d.day} ${_months[d.month - 1]} ${d.year}';

/// "just now", "5 min ago", "3 h ago", "2 d ago", then the date.
String timeAgo(DateTime? t, {DateTime? now}) {
  if (t == null) return '—';
  final d = (now ?? DateTime.now()).difference(t);
  if (d.inMinutes < 1) return 'just now';
  if (d.inMinutes < 60) return '${d.inMinutes} min ago';
  if (d.inHours < 24) return '${d.inHours} h ago';
  if (d.inDays < 7) return '${d.inDays} d ago';
  return formatDate(t);
}

/// Date-only value for Postgres `date` columns.
String? sqlDate(DateTime? d) => d == null
    ? null
    : '${d.year.toString().padLeft(4, '0')}-'
          '${d.month.toString().padLeft(2, '0')}-'
          '${d.day.toString().padLeft(2, '0')}';

DateTime? parseDate(Object? value) =>
    value is String ? DateTime.tryParse(value) : null;

DateTime? parseTimestamp(Object? value) =>
    value is String ? DateTime.tryParse(value)?.toLocal() : null;

/// Instagram deliverable types a campaign can ask for, in display order.
const deliverableTypes = {
  'reels': ('Reel', 'Reels'),
  'posts': ('Post', 'Posts'),
  'carousels': ('Carousel', 'Carousels'),
  'stories': ('Story', 'Stories'),
};

/// "1 Reel · 3 Stories".
String deliverablesSummary(Map<String, int> deliverables) {
  final parts = <String>[];
  for (final e in deliverableTypes.entries) {
    final n = deliverables[e.key] ?? 0;
    if (n > 0) parts.add('$n ${n == 1 ? e.value.$1 : e.value.$2}');
  }
  return parts.isEmpty ? 'Deliverables to be agreed' : parts.join(' · ');
}

/// "@handle" without a doubled @.
String atHandle(String handle) => handle.startsWith('@') ? handle : '@$handle';

/// True for a real Instagram post, reel or IGTV link.
bool isInstagramPostUrl(String url) => RegExp(
  r'^https://(www\.)?instagram\.com/([A-Za-z0-9._]+/)?(p|reel|reels|tv)/[A-Za-z0-9_-]+',
).hasMatch(url.trim());

/// True for an https link.
bool isHttpsUrl(String url) {
  final uri = Uri.tryParse(url.trim());
  return uri != null && uri.scheme == 'https' && uri.host.contains('.');
}
