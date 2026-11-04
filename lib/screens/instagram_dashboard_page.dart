import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

import '../backend/instagram_service.dart';
import '../config/app_config.dart';
import '../sections/navigation_bar.dart' show Wordmark;
import '../theme/app_colors.dart';
import '../theme/app_text.dart';
import '../utils/links.dart';
import '../utils/responsive.dart';
import '../widgets/app_buttons.dart';
import '../widgets/choice_toggle.dart';
import '../widgets/insight_charts.dart';
import '../widgets/responsive_grid.dart';

export '../utils/links.dart' show openExternalUrl;

/// A creator's Instagram insights: connect prompt, then profile, KPIs,
/// trends, top posts and audience.
class InstagramDashboardPage extends StatefulWidget {
  const InstagramDashboardPage({
    super.key,
    this.service,
    this.returnNotice,
    this.sample,
    this.embedded = false,
  });

  /// Defaults to the app-wide [instagramService].
  final InstagramService? service;

  /// Shown inside the home tabs: a title instead of a back button.
  final bool embedded;

  /// `?instagram=` / `&reason=` from the OAuth redirect, if any.
  final ({String result, String? reason})? returnNotice;

  /// Shows this preview instead of loading real data.
  final InstagramDashboard? sample;

  @override
  State<InstagramDashboardPage> createState() => _InstagramDashboardPageState();
}

class _InstagramDashboardPageState extends State<InstagramDashboardPage> {
  InstagramService get _service => widget.service ?? instagramService;

  InstagramDashboard? _data;
  bool _loading = true;
  bool _busy = false;
  String? _error;
  int _days = 28;
  _Metric _metric = _Metric.views;

  @override
  void initState() {
    super.initState();
    if (widget.sample != null) {
      _data = widget.sample;
      _loading = false;
    } else {
      _load();
    }
    WidgetsBinding.instance.addPostFrameCallback((_) => _showReturnNotice());
  }

  Future<void> _load() async {
    setState(() {
      _loading = true;
      _error = null;
    });
    try {
      final data = await _service.loadDashboard();
      if (mounted) setState(() => _data = data);
    } on InstagramFailure catch (e) {
      if (mounted) setState(() => _error = e.message);
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  void _toast(String message) {
    ScaffoldMessenger.of(context)
      ..hideCurrentSnackBar()
      ..showSnackBar(SnackBar(content: Text(message)));
  }

  void _showReturnNotice() => _showNotice(widget.returnNotice);

  void _showNotice(({String result, String? reason})? notice) {
    if (notice == null || !mounted) return;
    if (notice.result == 'connected') {
      _toast('Instagram connected. Your first sync takes a minute or two.');
      return;
    }
    _toast(switch (notice.reason) {
      'cancelled' => 'Instagram connection cancelled.',
      'not_professional' =>
        'Only Instagram Creator or Business accounts can share insights. '
            'Switch your account type in the Instagram app, then try again.',
      'missing_permissions' =>
        'Shor needs both permissions (profile and insights) to build your '
            'dashboard. Please try again and keep both switched on.',
      'already_linked' =>
        'That Instagram account is already linked to another Shor creator.',
      'expired' => 'That connection link expired. Please try again.',
      _ => 'We could not connect Instagram. Please try again.',
    });
  }

  Future<void> _connect() async {
    if (_busy) return;
    setState(() => _busy = true);
    try {
      if (kIsWeb) {
        // The website leaves for Instagram and comes back to this page.
        final url = await _service.startConnect(
          returnTo: '${Uri.base.origin}${Uri.base.path}',
        );
        final opened = await openExternalUrl(url, sameTab: true);
        if (!opened && mounted) _toast('Could not open Instagram.');
        return;
      }
      // Phones: Instagram's login runs in the system sign-in sheet inside
      // the app, then returns to shor://instagram.
      final url = await _service.startConnect(
        returnTo: '${AppConfig.appScheme}://instagram',
      );
      final String result;
      try {
        result = await authenticateInApp(url, AppConfig.appScheme);
      } on PlatformException catch (e) {
        if (mounted) {
          _toast(
            e.code == 'CANCELED'
                ? 'Instagram connection cancelled.'
                : 'Could not open Instagram. Please try again.',
          );
        }
        return;
      }
      final params = Uri.parse(result).queryParameters;
      _showNotice((
        result: params['instagram'] ?? 'error',
        reason: params['reason'],
      ));
      if (params['instagram'] == 'connected') await _load();
    } on InstagramFailure catch (e) {
      if (mounted) _toast(e.message);
    } finally {
      if (mounted) setState(() => _busy = false);
    }
  }

  Future<void> _sync() async {
    if (_busy || widget.sample != null) return;
    setState(() => _busy = true);
    try {
      final fetched = await _service.syncNow();
      await _load();
      if (mounted) {
        _toast(
          fetched
              ? 'Insights updated.'
              : 'Your insights are already up to date.',
        );
      }
    } on InstagramFailure catch (e) {
      if (mounted) _toast(e.message);
    } finally {
      if (mounted) setState(() => _busy = false);
    }
  }

  Future<void> _disconnect() async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Disconnect Instagram?'),
        content: const Text(
          'Shor will delete your stored Instagram insights, posts and audience '
          'data straight away, and brands will no longer see your verified '
          'Instagram stats. You can reconnect at any time.',
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context, false),
            child: const Text('Cancel'),
          ),
          TextButton(
            onPressed: () => Navigator.pop(context, true),
            child: const Text('Disconnect and delete'),
          ),
        ],
      ),
    );
    if (confirmed != true || !mounted) return;
    setState(() => _busy = true);
    try {
      await _service.disconnect();
      if (mounted) {
        setState(() => _data = null);
        _toast('Instagram disconnected. Your Instagram data was deleted.');
      }
    } on InstagramFailure catch (e) {
      if (mounted) _toast(e.message);
    } finally {
      if (mounted) setState(() => _busy = false);
    }
  }

  void _openSample() {
    Navigator.of(context).push(
      MaterialPageRoute<void>(
        builder: (_) =>
            InstagramDashboardPage(sample: sampleInstagramDashboard()),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final pad = context.sized(16, md: 32);
    return Scaffold(
      body: SafeArea(
        child: RefreshIndicator(
          onRefresh: widget.sample == null ? _load : () async {},
          child: SingleChildScrollView(
            physics: const AlwaysScrollableScrollPhysics(),
            padding: EdgeInsets.fromLTRB(pad, 24, pad, 48),
            child: Center(
              child: ConstrainedBox(
                constraints: const BoxConstraints(maxWidth: 1120),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    Row(
                      children: [
                        if (widget.embedded)
                          Text(
                            'Instagram insights',
                            style: AppText.heading(context.sized(26, md: 30)),
                          )
                        else ...[
                          IconButton(
                            tooltip: 'Back',
                            onPressed: () => Navigator.of(context).maybePop(),
                            icon: const Icon(Icons.arrow_back),
                          ),
                          const SizedBox(width: 4),
                          const Wordmark(),
                        ],
                        const Spacer(),
                        if (_data != null && widget.sample == null)
                          IconButton(
                            tooltip: 'Refresh',
                            onPressed: _loading ? null : _load,
                            icon: const Icon(Icons.refresh),
                          ),
                      ],
                    ),
                    const SizedBox(height: 20),
                    ..._body(),
                  ],
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }

  List<Widget> _body() {
    if (_loading) {
      return const [
        SizedBox(height: 120),
        Center(child: CircularProgressIndicator()),
      ];
    }
    if (_error != null) {
      return [
        _Panel(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text('Something went wrong', style: AppText.heading(24)),
              const SizedBox(height: 8),
              Text(_error!, style: AppText.serif(size: 16, height: 1.5)),
              const SizedBox(height: 16),
              SolidButton(label: 'Try again', onPressed: _load),
            ],
          ),
        ),
      ];
    }
    final data = _data;
    if (data == null) {
      return [
        _ConnectCard(busy: _busy, onConnect: _connect, onPreview: _openSample),
      ];
    }
    return _dashboard(data);
  }

  List<Widget> _dashboard(InstagramDashboard data) {
    final account = data.account;
    final days = data.lastDays(_days);
    final cols = context.responsive<int>(1, sm: 2, lg: 4);

    return [
      if (data.isSample)
        _Banner(
          icon: Icons.visibility_outlined,
          text:
              'Sample data. These numbers are made up to show what your '
              'dashboard will look like once you connect Instagram.',
        ),
      if (account.needsReauth)
        _Banner(
          icon: Icons.link_off,
          text:
              'Instagram access expired or was removed, so syncing has '
              'stopped. Reconnect to keep your insights up to date.',
          action: TextButton(
            onPressed: _busy ? null : _connect,
            child: const Text('Reconnect'),
          ),
        ),
      if (!account.needsReauth &&
          account.lastSyncedAt == null &&
          !data.isSample)
        _Banner(
          icon: Icons.sync,
          text:
              'Your first sync is running. Pull to refresh in a minute to see '
              'your insights.',
        ),
      _ProfileHeader(
        account: account,
        busy: _busy,
        onSync: data.isSample ? null : _sync,
        onDisconnect: data.isSample ? null : _disconnect,
      ),
      const SizedBox(height: 24),
      Wrap(
        spacing: 12,
        runSpacing: 12,
        crossAxisAlignment: WrapCrossAlignment.center,
        children: [
          Text('Period', style: AppText.label()),
          ChoiceToggle<int>(
            key: const ValueKey('period-toggle'),
            options: const {7: '7 days', 28: '28 days'},
            selected: _days,
            onChanged: (v) => setState(() => _days = v),
          ),
        ],
      ),
      const SizedBox(height: 16),
      _KpiGrid(columns: cols, tiles: _kpis(data, days)),
      const SizedBox(height: 16),
      _Panel(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Wrap(
              spacing: 12,
              runSpacing: 12,
              alignment: WrapAlignment.spaceBetween,
              crossAxisAlignment: WrapCrossAlignment.center,
              children: [
                Text(
                  'Daily ${_metric.label.toLowerCase()}',
                  style: AppText.heading(20),
                ),
                ChoiceToggle<_Metric>(
                  key: const ValueKey('metric-toggle'),
                  options: {for (final m in _Metric.values) m: m.label},
                  selected: _metric,
                  onChanged: (v) => setState(() => _metric = v),
                ),
              ],
            ),
            const SizedBox(height: 4),
            Text(
              _metric.help,
              style: AppText.sans(size: 13, color: AppColors.textMuted),
            ),
            const SizedBox(height: 16),
            TrendChart(
              metricLabel: _metric.label,
              points: [
                for (final d in days)
                  if (_metric.read(d) != null)
                    TrendPoint(d.date, _metric.read(d)!),
              ],
            ),
          ],
        ),
      ),
      const SizedBox(height: 16),
      _twoUp(
        _Panel(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              Text('Follower growth', style: AppText.heading(20)),
              const SizedBox(height: 4),
              Text(
                'Total followers, recorded once a day by Shor.',
                style: AppText.sans(size: 13, color: AppColors.textMuted),
              ),
              const SizedBox(height: 16),
              TrendChart(
                metricLabel: 'Followers',
                zeroBaseline: false,
                height: 180,
                points: [
                  for (final f
                      in data.followerHistory.length <= _days
                          ? data.followerHistory
                          : data.followerHistory.sublist(
                              data.followerHistory.length - _days,
                            ))
                    TrendPoint(f.date, f.followers),
                ],
              ),
            ],
          ),
        ),
        _Panel(child: _InteractionBreakdown(days: days)),
      ),
      const SizedBox(height: 16),
      _Panel(child: _TopPosts(posts: data.posts)),
      const SizedBox(height: 16),
      _Panel(child: _Audience(data: data)),
      const SizedBox(height: 16),
      _PrivacyNote(),
    ];
  }

  Widget _twoUp(Widget a, Widget b) {
    if (!context.isLg) {
      return Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [a, const SizedBox(height: 16), b],
      );
    }
    return ResponsiveGrid(columns: 2, children: [a, b]);
  }

  List<_Kpi> _kpis(InstagramDashboard data, List<DailyMetric> days) {
    int? sum(int? Function(DailyMetric) f) {
      final values = days.map(f).whereType<int>().toList();
      return values.isEmpty ? null : values.fold<int>(0, (a, b) => a + b);
    }

    int? avg(int? Function(DailyMetric) f) {
      final values = days.map(f).whereType<int>().toList();
      return values.isEmpty
          ? null
          : (values.fold<int>(0, (a, b) => a + b) / values.length).round();
    }

    final history = data.followerHistory;
    int? followerChange;
    if (history.length >= 2) {
      final cutoff = history.last.date.subtract(Duration(days: _days));
      final start = history.firstWhere(
        (p) => !p.date.isBefore(cutoff),
        orElse: () => history.first,
      );
      followerChange = history.last.followers - start.followers;
    }

    final rates = data.posts
        .map((p) => p.engagementRate)
        .whereType<double>()
        .toList();
    final avgRate = rates.isEmpty
        ? null
        : rates.reduce((a, b) => a + b) / rates.length;

    return [
      _Kpi(
        'Followers',
        formatCompact(data.account.followers),
        followerChange == null
            ? 'Growth shows after a few syncs'
            : '${followerChange >= 0 ? '+' : ''}${formatFull(followerChange)} in $_days days',
      ),
      _Kpi('Views', formatCompact(sum((d) => d.views)), 'Total in $_days days'),
      _Kpi(
        'Avg daily reach',
        formatCompact(avg((d) => d.reach)),
        'Unique accounts per day',
      ),
      _Kpi(
        'Post engagement',
        avgRate == null ? '—' : '${avgRate.toStringAsFixed(1)}%',
        'Interactions ÷ reach, recent posts',
      ),
    ];
  }
}

enum _Metric {
  views('Views', 'Times your content was played or displayed.'),
  reach('Reach', 'Unique accounts that saw your content each day (estimated).'),
  interactions(
    'Interactions',
    'Likes, comments, saves, shares and replies each day.',
  );

  const _Metric(this.label, this.help);

  final String label;
  final String help;

  int? read(DailyMetric d) => switch (this) {
    _Metric.views => d.views,
    _Metric.reach => d.reach,
    _Metric.interactions => d.totalInteractions,
  };
}

class _Panel extends StatelessWidget {
  const _Panel({required this.child});

  final Widget child;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: EdgeInsets.all(context.sized(18, md: 24)),
      decoration: BoxDecoration(
        color: AppColors.bgCard,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppColors.border),
      ),
      child: child,
    );
  }
}

class _Banner extends StatelessWidget {
  const _Banner({required this.icon, required this.text, this.action});

  final IconData icon;
  final String text;
  final Widget? action;

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      padding: const EdgeInsets.fromLTRB(16, 12, 8, 12),
      decoration: BoxDecoration(
        color: AppColors.accentSoft,
        borderRadius: BorderRadius.circular(10),
      ),
      child: Row(
        children: [
          Icon(icon, size: 20, color: AppColors.accent),
          const SizedBox(width: 12),
          Expanded(
            child: Text(
              text,
              style: AppText.sans(size: 14, color: AppColors.textPrimary),
            ),
          ),
          ?action,
        ],
      ),
    );
  }
}

class _ProfileHeader extends StatelessWidget {
  const _ProfileHeader({
    required this.account,
    required this.busy,
    this.onSync,
    this.onDisconnect,
  });

  final InstagramAccount account;
  final bool busy;
  final VoidCallback? onSync;
  final VoidCallback? onDisconnect;

  String _ago(DateTime? t) {
    if (t == null) return 'Not synced yet';
    final d = DateTime.now().difference(t);
    if (d.inMinutes < 1) return 'Synced just now';
    if (d.inMinutes < 60) return 'Synced ${d.inMinutes} min ago';
    if (d.inHours < 24) return 'Synced ${d.inHours} h ago';
    return 'Synced ${d.inDays} d ago';
  }

  @override
  Widget build(BuildContext context) {
    final avatar = CircleAvatar(
      radius: 30,
      backgroundColor: AppColors.accentSoft,
      foregroundImage: account.profilePictureUrl == null
          ? null
          : NetworkImage(account.profilePictureUrl!),
      child: Text(
        account.username.isEmpty ? '?' : account.username[0].toUpperCase(),
        style: AppText.heading(22, color: AppColors.accent),
      ),
    );
    final stats = Wrap(
      spacing: 20,
      runSpacing: 4,
      children: [
        _stat(formatCompact(account.followers), 'followers'),
        _stat(formatCompact(account.follows), 'following'),
        _stat(formatCompact(account.mediaCount), 'posts'),
      ],
    );
    final actions = Wrap(
      spacing: 8,
      runSpacing: 8,
      children: [
        if (onSync != null)
          OutlineActionButton(
            label: busy ? 'Working…' : 'Sync now',
            trailingIcon: Icons.sync,
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
            fontSize: 14,
            onPressed: onSync!,
          ),
        if (onDisconnect != null)
          OutlineActionButton(
            label: 'Disconnect',
            trailingIcon: Icons.link_off,
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
            fontSize: 14,
            onPressed: onDisconnect!,
          ),
      ],
    );

    return _Panel(
      child: Wrap(
        spacing: 24,
        runSpacing: 16,
        alignment: WrapAlignment.spaceBetween,
        crossAxisAlignment: WrapCrossAlignment.center,
        children: [
          Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              avatar,
              const SizedBox(width: 16),
              Flexible(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Text(
                      '@${account.username}',
                      style: AppText.heading(22),
                      overflow: TextOverflow.ellipsis,
                    ),
                    const SizedBox(height: 2),
                    Text(
                      '${account.accountTypeLabel} · ${_ago(account.lastSyncedAt)}',
                      style: AppText.sans(size: 13, color: AppColors.textMuted),
                    ),
                    const SizedBox(height: 8),
                    stats,
                  ],
                ),
              ),
            ],
          ),
          actions,
        ],
      ),
    );
  }

  Widget _stat(String value, String label) => Text.rich(
    TextSpan(
      children: [
        TextSpan(
          text: value,
          style: AppText.sans(size: 15, weight: FontWeight.w700),
        ),
        TextSpan(
          text: ' $label',
          style: AppText.sans(size: 14, color: AppColors.textSecondary),
        ),
      ],
    ),
  );
}

class _Kpi {
  const _Kpi(this.label, this.value, this.caption);

  final String label;
  final String value;
  final String caption;
}

class _KpiGrid extends StatelessWidget {
  const _KpiGrid({required this.columns, required this.tiles});

  final int columns;
  final List<_Kpi> tiles;

  @override
  Widget build(BuildContext context) {
    return ResponsiveGrid(
      columns: columns,
      spacing: 12,
      children: [for (final t in tiles) _tile(t)],
    );
  }

  Widget _tile(_Kpi k) => Container(
    padding: const EdgeInsets.all(18),
    decoration: BoxDecoration(
      color: AppColors.bgCard,
      borderRadius: BorderRadius.circular(12),
      border: Border.all(color: AppColors.border),
    ),
    child: Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(k.label.toUpperCase(), style: AppText.label()),
        const SizedBox(height: 8),
        Text(k.value, style: AppText.heading(30)),
        const SizedBox(height: 4),
        Text(
          k.caption,
          style: AppText.sans(size: 13, color: AppColors.textMuted),
        ),
      ],
    ),
  );
}

class _InteractionBreakdown extends StatelessWidget {
  const _InteractionBreakdown({required this.days});

  final List<DailyMetric> days;

  @override
  Widget build(BuildContext context) {
    int total(int? Function(DailyMetric) f) =>
        days.map(f).whereType<int>().fold<int>(0, (a, b) => a + b);
    final data = [
      BarDatum('Likes', total((d) => d.likes)),
      BarDatum('Saves', total((d) => d.saves)),
      BarDatum('Comments', total((d) => d.comments)),
      BarDatum('Shares', total((d) => d.shares)),
    ]..sort((a, b) => b.value.compareTo(a.value));
    final taps = total((d) => d.profileLinksTaps);
    final empty = data.every((d) => d.value == 0);

    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        Text('How people interact', style: AppText.heading(20)),
        const SizedBox(height: 4),
        Text(
          'Share of interactions over the period.',
          style: AppText.sans(size: 13, color: AppColors.textMuted),
        ),
        const SizedBox(height: 16),
        if (empty)
          Text(
            'No interaction data yet.',
            style: AppText.sans(size: 14, color: AppColors.textMuted),
          )
        else ...[
          LabeledBars(data: data),
          const SizedBox(height: 16),
          _line(
            'Total interactions',
            formatFull(data.fold<num>(0, (s, d) => s + d.value)),
          ),
          _line('Link taps on profile', formatFull(taps)),
        ],
      ],
    );
  }

  Widget _line(String label, String value) => Padding(
    padding: const EdgeInsets.symmetric(vertical: 3),
    child: Row(
      children: [
        Expanded(
          child: Text(
            label,
            style: AppText.sans(size: 13, color: AppColors.textSecondary),
          ),
        ),
        Text(value, style: AppText.sans(size: 13, weight: FontWeight.w600)),
      ],
    ),
  );
}

class _TopPosts extends StatefulWidget {
  const _TopPosts({required this.posts});

  final List<InstagramPost> posts;

  @override
  State<_TopPosts> createState() => _TopPostsState();
}

enum _PostSort { views, reach, engagement, recent }

class _TopPostsState extends State<_TopPosts> {
  _PostSort _sort = _PostSort.views;

  @override
  Widget build(BuildContext context) {
    final posts = [...widget.posts];
    switch (_sort) {
      case _PostSort.views:
        posts.sort((a, b) => (b.views ?? -1).compareTo(a.views ?? -1));
      case _PostSort.reach:
        posts.sort((a, b) => (b.reach ?? -1).compareTo(a.reach ?? -1));
      case _PostSort.engagement:
        posts.sort(
          (a, b) => (b.engagementRate ?? -1).compareTo(a.engagementRate ?? -1),
        );
      case _PostSort.recent:
        break; // already newest first
    }
    final shown = posts.take(6).toList();
    final cols = context.responsive<int>(1, md: 2, xl: 3);

    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        Wrap(
          spacing: 12,
          runSpacing: 12,
          alignment: WrapAlignment.spaceBetween,
          crossAxisAlignment: WrapCrossAlignment.center,
          children: [
            Text('Top posts', style: AppText.heading(20)),
            DropdownButton<_PostSort>(
              value: _sort,
              underline: const SizedBox(),
              borderRadius: BorderRadius.circular(8),
              items: const [
                DropdownMenuItem(
                  value: _PostSort.views,
                  child: Text('Most views'),
                ),
                DropdownMenuItem(
                  value: _PostSort.reach,
                  child: Text('Most reach'),
                ),
                DropdownMenuItem(
                  value: _PostSort.engagement,
                  child: Text('Best engagement'),
                ),
                DropdownMenuItem(
                  value: _PostSort.recent,
                  child: Text('Most recent'),
                ),
              ],
              onChanged: (v) => setState(() => _sort = v ?? _sort),
            ),
          ],
        ),
        const SizedBox(height: 12),
        if (shown.isEmpty)
          Text(
            'No posts found yet.',
            style: AppText.sans(size: 14, color: AppColors.textMuted),
          )
        else
          LayoutBuilder(
            builder: (context, c) {
              const gap = 12.0;
              final w = (c.maxWidth - gap * (cols - 1)) / cols;
              return Wrap(
                spacing: gap,
                runSpacing: gap,
                children: [
                  for (final p in shown)
                    SizedBox(
                      width: w,
                      child: _PostCard(post: p),
                    ),
                ],
              );
            },
          ),
      ],
    );
  }
}

class _PostCard extends StatelessWidget {
  const _PostCard({required this.post});

  final InstagramPost post;

  @override
  Widget build(BuildContext context) {
    final thumb = ClipRRect(
      borderRadius: BorderRadius.circular(8),
      child: SizedBox(
        width: 72,
        height: 90,
        child: post.thumbnailUrl == null
            ? _placeholder()
            : Image.network(
                post.thumbnailUrl!,
                fit: BoxFit.cover,
                errorBuilder: (_, _, _) => _placeholder(),
              ),
      ),
    );
    final rate = post.engagementRate;
    return Material(
      color: AppColors.bgPrimary,
      borderRadius: BorderRadius.circular(10),
      child: InkWell(
        borderRadius: BorderRadius.circular(10),
        onTap: post.permalink == null
            ? null
            : () => openExternalUrl(Uri.parse(post.permalink!)),
        child: Padding(
          padding: const EdgeInsets.all(12),
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              thumb,
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      '${post.typeLabel.toUpperCase()}'
                      '${post.postedAt == null ? '' : ' · ${formatDay(post.postedAt!)}'}',
                      style: AppText.label(),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      (post.caption ?? '').trim().isEmpty
                          ? 'No caption'
                          : post.caption!.trim(),
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                      style: AppText.sans(size: 14, weight: FontWeight.w500),
                    ),
                    const SizedBox(height: 8),
                    Wrap(
                      spacing: 12,
                      runSpacing: 4,
                      children: [
                        _m(
                          Icons.play_arrow_outlined,
                          formatCompact(post.views),
                          'views',
                        ),
                        _m(
                          Icons.people_outline,
                          formatCompact(post.reach),
                          'reach',
                        ),
                        _m(
                          Icons.favorite_border,
                          formatCompact(post.likes),
                          'likes',
                        ),
                        _m(
                          Icons.bookmark_border,
                          formatCompact(post.saved),
                          'saves',
                        ),
                        if (rate != null)
                          _m(
                            Icons.trending_up,
                            '${rate.toStringAsFixed(1)}%',
                            'engagement',
                          ),
                      ],
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _placeholder() => Container(
    color: AppColors.accentSoft,
    child: Icon(
      post.productType == 'REELS' ? Icons.movie_outlined : Icons.image_outlined,
      color: AppColors.accent,
    ),
  );

  Widget _m(IconData icon, String value, String label) => Semantics(
    label: '$value $label',
    excludeSemantics: true,
    child: Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Icon(icon, size: 15, color: AppColors.textMuted),
        const SizedBox(width: 3),
        Text(value, style: AppText.sans(size: 13, weight: FontWeight.w600)),
      ],
    ),
  );
}

class _Audience extends StatelessWidget {
  const _Audience({required this.data});

  final InstagramDashboard data;

  static const _countries = {
    'IN': 'India',
    'US': 'United States',
    'GB': 'United Kingdom',
    'AE': 'UAE',
    'CA': 'Canada',
    'AU': 'Australia',
    'SG': 'Singapore',
    'DE': 'Germany',
    'SA': 'Saudi Arabia',
    'NP': 'Nepal',
    'BD': 'Bangladesh',
    'PK': 'Pakistan',
    'LK': 'Sri Lanka',
    'ID': 'Indonesia',
    'BR': 'Brazil',
    'FR': 'France',
  };

  @override
  Widget build(BuildContext context) {
    final age = data.audienceFor('age')
      ..sort((a, b) => a.dimension.compareTo(b.dimension));
    final gender = data.audienceFor('gender');
    final country = data.audienceFor('country').take(5).toList();
    final city = data.audienceFor('city').take(5).toList();

    final sections = <Widget>[
      if (age.isNotEmpty)
        _group('Age', [for (final a in age) BarDatum(a.dimension, a.value)]),
      if (gender.isNotEmpty)
        _group('Gender', [
          for (final g in gender)
            BarDatum(switch (g.dimension) {
              'F' => 'Women',
              'M' => 'Men',
              _ => 'Unspecified',
            }, g.value),
        ]),
      if (country.isNotEmpty)
        _group('Top countries', [
          for (final c in country)
            BarDatum(_countries[c.dimension] ?? c.dimension, c.value),
        ]),
      if (city.isNotEmpty)
        _group('Top cities', [
          for (final c in city) BarDatum(c.dimension.split(',').first, c.value),
        ]),
    ];

    final cols = context.responsive<int>(1, md: 2);
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        Text('Your audience', style: AppText.heading(20)),
        const SizedBox(height: 4),
        Text(
          'Who follows you, from Instagram. Shares are of the top groups '
          'Instagram reports.',
          style: AppText.sans(size: 13, color: AppColors.textMuted),
        ),
        const SizedBox(height: 16),
        if (sections.isEmpty)
          Text(
            'Instagram shares audience demographics once an account has at '
            'least 100 followers.',
            style: AppText.sans(size: 14, color: AppColors.textMuted),
          )
        else
          LayoutBuilder(
            builder: (context, c) {
              const gap = 28.0;
              final w = (c.maxWidth - gap * (cols - 1)) / cols;
              return Wrap(
                spacing: gap,
                runSpacing: 24,
                children: [
                  for (final s in sections) SizedBox(width: w, child: s),
                ],
              );
            },
          ),
      ],
    );
  }

  Widget _group(String title, List<BarDatum> bars) => Column(
    crossAxisAlignment: CrossAxisAlignment.start,
    children: [
      Text(title.toUpperCase(), style: AppText.label()),
      const SizedBox(height: 8),
      LabeledBars(data: bars, labelWidth: 110),
    ],
  );
}

class _PrivacyNote extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 4),
      child: Text(
        'Only you can see these insights. Brands on Shor see just your public '
        'numbers: your handle, follower count and engagement rate. Disconnect '
        'at any time to delete your Instagram data from Shor.',
        style: AppText.sans(size: 13, color: AppColors.textMuted, height: 1.5),
      ),
    );
  }
}

class _ConnectCard extends StatelessWidget {
  const _ConnectCard({
    required this.busy,
    required this.onConnect,
    required this.onPreview,
  });

  final bool busy;
  final VoidCallback onConnect;
  final VoidCallback onPreview;

  @override
  Widget build(BuildContext context) {
    Widget point(IconData icon, String text) => Padding(
      padding: const EdgeInsets.symmetric(vertical: 6),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(icon, size: 20, color: AppColors.accent),
          const SizedBox(width: 12),
          Expanded(
            child: Text(text, style: AppText.sans(size: 15, height: 1.45)),
          ),
        ],
      ),
    );

    return Center(
      child: ConstrainedBox(
        constraints: const BoxConstraints(maxWidth: 640),
        child: _Panel(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'CREATOR INSIGHTS',
                style: AppText.label(color: AppColors.accent),
              ),
              const SizedBox(height: 8),
              Text('Connect your Instagram', style: AppText.heading(30)),
              const SizedBox(height: 8),
              Text(
                'See your reach, views, best posts and audience in one place, '
                'and show brands verified numbers instead of screenshots.',
                style: AppText.serif(size: 16, height: 1.55),
              ),
              const SizedBox(height: 20),
              Text('WHAT SHOR READS', style: AppText.label()),
              const SizedBox(height: 4),
              point(
                Icons.person_outline,
                'Your profile: handle, name, photo and follower counts.',
              ),
              point(
                Icons.insights_outlined,
                'Account insights for the last 28 days: reach, views and interactions.',
              ),
              point(
                Icons.grid_view_outlined,
                'Your 25 most recent posts and reels, with their insights.',
              ),
              point(
                Icons.public_outlined,
                'Audience age, gender and top locations (accounts with 100+ followers).',
              ),
              const SizedBox(height: 16),
              Text('WHAT SHOR NEVER DOES', style: AppText.label()),
              const SizedBox(height: 4),
              point(
                Icons.lock_outline,
                'Ask for or see your Instagram password. You log in on Instagram itself.',
              ),
              point(Icons.block, 'Post, comment, or read your messages.'),
              point(
                Icons.visibility_off_outlined,
                'Show your private insights to brands, or sell your data.',
              ),
              const SizedBox(height: 20),
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: AppColors.bgSecondary,
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Text(
                  'You need an Instagram Creator or Business account. Switch for '
                  'free in Instagram → Settings → Account type and tools.',
                  style: AppText.sans(size: 13, color: AppColors.textSecondary),
                ),
              ),
              const SizedBox(height: 20),
              Wrap(
                spacing: 12,
                runSpacing: 12,
                children: [
                  SolidButton(
                    label: busy ? 'Opening Instagram…' : 'Connect Instagram',
                    showArrow: !busy,
                    onPressed: onConnect,
                  ),
                  OutlineActionButton(
                    label: 'See a sample dashboard',
                    onPressed: onPreview,
                  ),
                ],
              ),
              const SizedBox(height: 12),
              Text(
                'Disconnect at any time and Shor deletes your Instagram data '
                'straight away.',
                style: AppText.sans(size: 13, color: AppColors.textMuted),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
