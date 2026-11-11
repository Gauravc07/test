import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

import '../../backend/campaign_report.dart';
import '../../backend/marketplace_service.dart';
import '../../theme/app_colors.dart';
import '../../theme/app_text.dart';
import '../../utils/format.dart';
import '../../utils/links.dart';
import '../../utils/responsive.dart';
import '../../widgets/choice_toggle.dart';
import '../../widgets/insight_charts.dart' show BarDatum, LabeledBars;
import '../../widgets/marketplace_widgets.dart';
import '../../widgets/responsive_grid.dart';
import '../collaboration_page.dart';
import '../creator/discover_campaigns_tab.dart' show CampaignFacts;
import 'campaign_editor_page.dart';
import 'discover_creators_tab.dart';

typedef _CampaignData = ({
  Campaign campaign,
  List<Collaboration> collabs,
  List<LivePost> posts,
  List<Invoice> invoices,
  List<SalesRow> sales,
});

enum _Tab { applications, invited, hired, report }

/// Brand side: one campaign — applications, invites, hired creators and
/// the results report.
class BrandCampaignPage extends StatefulWidget {
  const BrandCampaignPage({super.key, required this.campaignId, this.service});

  final String campaignId;
  final MarketplaceService? service;

  @override
  State<BrandCampaignPage> createState() => _BrandCampaignPageState();
}

class _BrandCampaignPageState extends State<BrandCampaignPage> {
  MarketplaceService get _service => widget.service ?? marketplaceService;
  _Tab? _tab;
  bool _busy = false;

  Future<_CampaignData> _load() async {
    final campaign = await _service.campaign(widget.campaignId);
    final collabs = await _service.campaignCollaborations(widget.campaignId);
    final posts = await _service.campaignLivePosts(widget.campaignId);
    final ids = {for (final c in collabs) c.id};
    final invoices = (await _service.invoices())
        .where((i) => ids.contains(i.collaborationId))
        .toList();
    final sales = await _service.campaignSales(widget.campaignId);
    return (
      campaign: campaign,
      collabs: collabs,
      posts: posts,
      invoices: invoices,
      sales: sales,
    );
  }

  Future<void> _run(Future<void> Function() action, String done) async {
    if (_busy) return;
    setState(() => _busy = true);
    try {
      await action();
      if (mounted) showToast(context, done);
    } on MarketplaceFailure catch (e) {
      if (mounted) showToast(context, e.message);
    } finally {
      if (mounted) setState(() => _busy = false);
    }
  }

  void _openCollab(Collaboration c) => Navigator.of(context).push(
    MaterialPageRoute<void>(
      builder: (_) =>
          CollaborationPage(collaborationId: c.id, service: widget.service),
    ),
  );

  @override
  Widget build(BuildContext context) {
    return ShorPage(
      title: 'Campaign',
      body: AsyncView<_CampaignData>(
        refresh: marketplaceRevision,
        load: _load,
        builder: (context, data, reload) {
          final applications = data.collabs
              .where((c) => c.status == CollabStatus.applied)
              .toList();
          final invited = data.collabs
              .where((c) => c.status == CollabStatus.invited)
              .toList();
          final hired = data.collabs.where((c) => c.status.isHired).toList()
            // Needs attention first.
            ..sort((a, b) => _attention(a).compareTo(_attention(b)));
          final tab =
              _tab ??
              (applications.isNotEmpty
                  ? _Tab.applications
                  : hired.isNotEmpty
                  ? _Tab.hired
                  : _Tab.applications);
          return PageList(
            maxWidth: 960,
            children: [
              _header(data.campaign, hired.length),
              const SizedBox(height: 18),
              Align(
                alignment: Alignment.centerLeft,
                child: ChoiceToggle<_Tab>(
                  key: const ValueKey('campaign-tabs'),
                  options: {
                    _Tab.applications: 'Applications (${applications.length})',
                    _Tab.invited: 'Invited (${invited.length})',
                    _Tab.hired: 'Hired (${hired.length})',
                    _Tab.report: 'Report',
                  },
                  selected: tab,
                  onChanged: (t) => setState(() => _tab = t),
                ),
              ),
              const SizedBox(height: 16),
              ...switch (tab) {
                _Tab.applications => _applications(data.campaign, applications),
                _Tab.invited => _list(
                  invited,
                  empty:
                      'Invite creators from Find creators. Invitations '
                      'you send appear here until they respond.',
                ),
                _Tab.hired => _list(
                  hired,
                  empty: 'Accept applications or invitations to hire creators.',
                ),
                _Tab.report => _report(data),
              },
            ],
          );
        },
      ),
    );
  }

  static int _attention(Collaboration c) => switch (c.status) {
    CollabStatus.awaitingApproval => 0,
    CollabStatus.inProgress => 1,
    CollabStatus.accepted => 2,
    _ => 3,
  };

  Widget _header(Campaign c, int hired) {
    final statusActions = <Widget>[
      if (c.status == CampaignStatus.draft)
        SmallButton(
          label: 'Publish',
          onPressed: () => _run(
            () => _service.setCampaignStatus(c.id, CampaignStatus.active),
            c.visibility == CampaignVisibility.open
                ? 'Campaign is live. Creators can now apply.'
                : 'Campaign is live.',
          ),
        ),
      if (c.status == CampaignStatus.active)
        SmallButton(
          label: 'Pause',
          outlined: true,
          onPressed: () => _run(
            () => _service.setCampaignStatus(c.id, CampaignStatus.paused),
            'Campaign paused. It no longer accepts applications.',
          ),
        ),
      if (c.status == CampaignStatus.paused)
        SmallButton(
          label: 'Resume',
          onPressed: () => _run(
            () => _service.setCampaignStatus(c.id, CampaignStatus.active),
            'Campaign is live again.',
          ),
        ),
      if (c.status == CampaignStatus.active ||
          c.status == CampaignStatus.paused)
        SmallButton(
          label: 'Close',
          outlined: true,
          onPressed: () async {
            final ok = await confirmAction(
              context,
              title: 'Close this campaign?',
              message:
                  'It stops accepting applications and invitations. Work already '
                  'in progress carries on.',
              confirmLabel: 'Close campaign',
            );
            if (ok) {
              await _run(
                () =>
                    _service.setCampaignStatus(c.id, CampaignStatus.completed),
                'Campaign closed.',
              );
            }
          },
        ),
      if (c.status == CampaignStatus.completed)
        SmallButton(
          label: 'Reopen',
          outlined: true,
          onPressed: () => _run(
            () => _service.setCampaignStatus(c.id, CampaignStatus.active),
            'Campaign reopened.',
          ),
        ),
    ];

    return SectionCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Wrap(
            spacing: 6,
            runSpacing: 6,
            children: [
              StatusChip(c.status.label, tone: campaignTone(c.status)),
              StatusChip(
                c.visibility == CampaignVisibility.open
                    ? 'Open to applications'
                    : 'Invite only',
                icon: c.visibility == CampaignVisibility.open
                    ? Icons.public
                    : Icons.lock_outline,
              ),
            ],
          ),
          const SizedBox(height: 10),
          Text(c.title, style: AppText.heading(24)),
          const SizedBox(height: 4),
          Text(
            c.compensationLabel,
            style: AppText.sans(
              size: 16,
              weight: FontWeight.w700,
              color: AppColors.accent,
            ),
          ),
          const SizedBox(height: 10),
          CampaignFacts(campaign: c),
          const SizedBox(height: 6),
          Text(
            c.creatorSlots == null
                ? '$hired creator${hired == 1 ? '' : 's'} hired'
                : '$hired of ${c.creatorSlots} creators hired',
            style: AppText.sans(size: 13, color: AppColors.textSecondary),
          ),
          const SizedBox(height: 14),
          AbsorbPointer(
            absorbing: _busy,
            child: Wrap(
              spacing: 8,
              runSpacing: 8,
              children: [
                ...statusActions,
                SmallButton(
                  label: 'Edit brief',
                  outlined: true,
                  onPressed: () => Navigator.of(context).push(
                    MaterialPageRoute<void>(
                      builder: (_) => CampaignEditorPage(
                        campaign: c,
                        service: widget.service,
                      ),
                    ),
                  ),
                ),
                if (c.canInvite)
                  SmallButton(
                    label: 'Invite creators',
                    outlined: true,
                    onPressed: () => Navigator.of(context).push(
                      MaterialPageRoute<void>(
                        builder: (_) => DiscoverCreatorsPage(
                          campaign: c,
                          service: widget.service,
                        ),
                      ),
                    ),
                  ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  List<Widget> _applications(Campaign campaign, List<Collaboration> list) {
    if (list.isEmpty) {
      return [
        EmptyState(
          icon: Icons.inbox_outlined,
          title: 'No applications waiting',
          message: switch (campaign.status) {
            CampaignStatus.draft =>
              'Publish the campaign so creators can apply.',
            _ when campaign.visibility == CampaignVisibility.inviteOnly =>
              'This campaign is invite only. Invite creators to fill it.',
            CampaignStatus.active =>
              'New applications appear here. You can also invite creators.',
            _ => 'This campaign is not accepting applications.',
          },
        ),
      ];
    }
    return [
      for (final c in list) ...[
        _ApplicationCard(
          collab: c,
          busy: _busy,
          onOpen: () => _openCollab(c),
          onAccept: () => _run(
            () => _service.setCollaborationStatus(c.id, CollabStatus.accepted),
            '${c.creator?.displayName ?? 'Creator'} is in. They will share a draft next.',
          ),
          onDecline: () async {
            final ok = await confirmAction(
              context,
              title: 'Decline this application?',
              message:
                  '${c.creator?.displayName ?? 'The creator'} will see that they '
                  'were not selected.',
              confirmLabel: 'Decline',
            );
            if (ok) {
              await _run(
                () => _service.setCollaborationStatus(
                  c.id,
                  CollabStatus.declined,
                ),
                'Application declined.',
              );
            }
          },
        ),
        const SizedBox(height: 10),
      ],
    ];
  }

  List<Widget> _list(List<Collaboration> list, {required String empty}) {
    if (list.isEmpty) {
      return [
        EmptyState(
          icon: Icons.inbox_outlined,
          title: 'Nobody here yet',
          message: empty,
        ),
      ];
    }
    return [
      for (final c in list) ...[
        CollabTile(
          collaboration: c,
          brandView: true,
          onTap: () => _openCollab(c),
        ),
        const SizedBox(height: 10),
      ],
    ];
  }

  List<Widget> _report(_CampaignData data) {
    final byCollab = {for (final c in data.collabs) c.id: c};
    final report = CampaignReport.build(
      collaborations: data.collabs,
      posts: data.posts,
      invoices: data.invoices,
      sales: data.sales,
      currency: data.campaign.currency,
    );
    final posts = data.posts;
    final unsynced = report.postsLive - report.postsSynced;
    final measured = report.rows.where((r) => r.views > 0).toList();

    return [
      ResponsiveGrid(
        columns: context.responsive<int>(2, md: 4),
        spacing: 10,
        children: [
          MetricTile(
            icon: Icons.movie_outlined,
            label: 'Posts live',
            value: '${report.postsLive}',
            caption: '${report.rows.length} hired',
          ),
          MetricTile(
            icon: Icons.visibility_outlined,
            label: 'Views',
            value: formatCompact(report.views),
          ),
          MetricTile(
            icon: Icons.people_outline,
            label: 'Reach',
            value: formatCompact(report.reach),
            caption: 'Summed across posts',
          ),
          MetricTile(
            icon: Icons.favorite_border,
            label: 'Engagement',
            value: report.engagementRate == null
                ? '—'
                : '${report.engagementRate!.toStringAsFixed(1)}%',
            caption:
                '${formatCompact(report.interactions)} interactions ÷ reach',
          ),
          MetricTile(
            icon: Icons.bookmark_border,
            label: 'Saves',
            value: formatCompact(report.saves),
          ),
          MetricTile(
            icon: Icons.send_outlined,
            label: 'Shares',
            value: formatCompact(report.shares),
          ),
          MetricTile(
            icon: Icons.currency_rupee,
            label: 'Total cost',
            value: report.money(report.cost),
            caption: 'Invoices incl. Shor fee and GST, else agreed fees',
          ),
          MetricTile(
            icon: Icons.speed,
            label: 'Cost per 1K views',
            value: report.money(report.costPerThousandViews),
            caption: 'Posts with results',
          ),
        ],
      ),
      const SizedBox(height: 20),
      const SectionTitle('Sales'),
      ResponsiveGrid(
        columns: context.responsive<int>(2, md: 4),
        spacing: 10,
        children: [
          MetricTile(
            icon: Icons.ads_click,
            label: 'Link clicks',
            value: formatCompact(report.clicks),
          ),
          MetricTile(
            icon: Icons.shopping_bag_outlined,
            label: 'Orders',
            value: '${report.orders}',
            caption: report.clicks == 0
                ? null
                : '${(report.orders / report.clicks * 100).toStringAsFixed(1)}% of clicks',
          ),
          MetricTile(
            icon: Icons.payments_outlined,
            label: 'Revenue',
            value: report.money(report.revenue),
          ),
          MetricTile(
            icon: Icons.trending_up,
            label: 'Return on spend',
            value: report.roas == null
                ? '—'
                : '${report.roas!.toStringAsFixed(1)}x',
            caption: report.costPerOrder == null
                ? 'Revenue ÷ cost'
                : '${report.money(report.costPerOrder)} per order',
          ),
        ],
      ),
      if (!report.hasSales) ...[
        const SizedBox(height: 10),
        const Note(
          'Each creator has a tracked link and can have a discount code, on '
          'their collaboration page. Connect your Shopify or WooCommerce store '
          'in Account to count orders.',
          icon: Icons.storefront_outlined,
        ),
      ],
      const SizedBox(height: 12),
      Note(
        unsynced > 0
            ? 'Numbers come from each creator’s Instagram and refresh daily. '
                  '$unsynced post${unsynced == 1 ? ' has' : 's have'} not synced yet.'
            : 'Numbers come from each creator’s Instagram and refresh daily.',
      ),
      if (report.rows.isNotEmpty) ...[
        const SizedBox(height: 20),
        SectionTitle(
          'By creator',
          trailing: SmallButton(
            label: 'Copy as CSV',
            outlined: true,
            onPressed: () async {
              await Clipboard.setData(ClipboardData(text: report.toCsv()));
              if (mounted) {
                showToast(
                  context,
                  'Report copied. Paste it into Excel or Google Sheets.',
                );
              }
            },
          ),
        ),
        if (measured.length > 1) ...[
          SectionCard(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('SHARE OF VIEWS', style: AppText.label()),
                const SizedBox(height: 8),
                LabeledBars(
                  labelWidth: 120,
                  data: [for (final r in measured) BarDatum(r.name, r.views)],
                ),
              ],
            ),
          ),
          const SizedBox(height: 10),
        ],
        for (final r in report.rows) ...[
          _CreatorResultRow(
            row: r,
            report: report,
            onOpen: () => _openCollab(r.collaboration),
          ),
          const SizedBox(height: 10),
        ],
      ],
      const SizedBox(height: 16),
      const SectionTitle('Live posts'),
      if (posts.isEmpty)
        const EmptyState(
          icon: Icons.insights_outlined,
          title: 'No live posts yet',
          message: 'Posts appear here when creators submit their live links.',
        )
      else
        for (final p in posts) ...[
          _PostRow(
            post: p,
            creatorName:
                byCollab[p.collaborationId]?.creator?.displayName ?? 'Creator',
            onOpen: () {
              final c = byCollab[p.collaborationId];
              if (c != null) _openCollab(c);
            },
          ),
          const SizedBox(height: 10),
        ],
    ];
  }
}

/// One hired creator's numbers on the Report tab.
class _CreatorResultRow extends StatelessWidget {
  const _CreatorResultRow({
    required this.row,
    required this.report,
    required this.onOpen,
  });

  final ReportRow row;
  final CampaignReport report;
  final VoidCallback onOpen;

  @override
  Widget build(BuildContext context) {
    final r = row;
    Widget stat(String label, String value) => Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(value, style: AppText.sans(size: 15, weight: FontWeight.w700)),
        Text(label, style: AppText.sans(size: 12, color: AppColors.textMuted)),
      ],
    );
    return SectionCard(
      onTap: onOpen,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Wrap(
            spacing: 8,
            runSpacing: 6,
            crossAxisAlignment: WrapCrossAlignment.center,
            children: [
              Text(
                r.name,
                style: AppText.sans(size: 15, weight: FontWeight.w600),
              ),
              if (identical(report.mostViews, r))
                const StatusChip(
                  'Most views',
                  tone: Tone.success,
                  icon: Icons.trending_up,
                ),
              if (identical(report.topSeller, r))
                const StatusChip(
                  'Top seller',
                  tone: Tone.success,
                  icon: Icons.shopping_bag_outlined,
                ),
              if (identical(report.bestValue, r))
                const StatusChip(
                  'Best value',
                  tone: Tone.success,
                  icon: Icons.savings_outlined,
                ),
              if (r.post == null)
                const StatusChip('Not posted yet')
              else if (!r.synced)
                const StatusChip('Insights not synced yet'),
            ],
          ),
          const SizedBox(height: 10),
          Wrap(
            spacing: 22,
            runSpacing: 10,
            children: [
              stat('views', r.synced ? formatCompact(r.views) : '—'),
              stat('reach', r.synced ? formatCompact(r.reach) : '—'),
              stat(
                'engagement',
                r.engagementRate == null
                    ? '—'
                    : '${r.engagementRate!.toStringAsFixed(1)}%',
              ),
              stat(r.invoiced ? 'invoiced' : 'agreed', report.money(r.cost)),
              stat('per 1K views', report.money(r.costPerThousandViews)),
              if (r.clicks > 0 || r.orders > 0) ...[
                stat('clicks', formatCompact(r.clicks)),
                stat('orders', '${r.orders}'),
                stat('revenue', report.money(r.revenue)),
                if (r.roas != null)
                  stat('return', '${r.roas!.toStringAsFixed(1)}x'),
              ],
            ],
          ),
        ],
      ),
    );
  }
}

class _ApplicationCard extends StatelessWidget {
  const _ApplicationCard({
    required this.collab,
    required this.busy,
    required this.onOpen,
    required this.onAccept,
    required this.onDecline,
  });

  final Collaboration collab;
  final bool busy;
  final VoidCallback onOpen;
  final VoidCallback onAccept;
  final VoidCallback onDecline;

  @override
  Widget build(BuildContext context) {
    final creator = collab.creator;
    final name = creator?.displayName ?? 'Creator';
    return SectionCard(
      onTap: onOpen,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Avatar(name: name, imageUrl: creator?.avatarUrl, size: 44),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Flexible(
                          child: Text(
                            name,
                            overflow: TextOverflow.ellipsis,
                            style: AppText.sans(
                              size: 16,
                              weight: FontWeight.w600,
                            ),
                          ),
                        ),
                        if (creator?.instagramVerified ?? false) ...[
                          const SizedBox(width: 4),
                          const Icon(
                            Icons.verified,
                            size: 15,
                            color: AppColors.accent,
                          ),
                        ],
                      ],
                    ),
                    Text(
                      [
                        if (creator?.instagramLabel != null)
                          creator!.instagramLabel!,
                        if (creator?.followers != null)
                          '${formatCompact(creator!.followers)} followers',
                        if (creator?.engagementRate != null)
                          '${creator!.engagementRate!.toStringAsFixed(1)}% engagement',
                      ].join(' · '),
                      style: AppText.sans(size: 13, color: AppColors.textMuted),
                    ),
                  ],
                ),
              ),
              const SizedBox(width: 8),
              Text(
                collab.amountLabel,
                style: AppText.sans(size: 15, weight: FontWeight.w700),
              ),
            ],
          ),
          if ((collab.pitch ?? '').trim().isNotEmpty) ...[
            const SizedBox(height: 10),
            Text(
              collab.pitch!.trim(),
              maxLines: 3,
              overflow: TextOverflow.ellipsis,
              style: AppText.sans(
                size: 14,
                color: AppColors.textSecondary,
                height: 1.5,
              ),
            ),
          ],
          const SizedBox(height: 12),
          AbsorbPointer(
            absorbing: busy,
            child: Wrap(
              spacing: 8,
              runSpacing: 8,
              children: [
                SmallButton(label: 'Accept', onPressed: onAccept),
                SmallButton(
                  label: 'Decline',
                  outlined: true,
                  onPressed: onDecline,
                ),
                SmallButton(label: 'View', outlined: true, onPressed: onOpen),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _PostRow extends StatelessWidget {
  const _PostRow({
    required this.post,
    required this.creatorName,
    required this.onOpen,
  });

  final LivePost post;
  final String creatorName;
  final VoidCallback onOpen;

  @override
  Widget build(BuildContext context) {
    final p = post;
    Widget stat(String label, int? value) => Text.rich(
      TextSpan(
        children: [
          TextSpan(
            text: formatCompact(value),
            style: AppText.sans(size: 14, weight: FontWeight.w700),
          ),
          TextSpan(
            text: ' $label',
            style: AppText.sans(size: 13, color: AppColors.textSecondary),
          ),
        ],
      ),
    );
    return SectionCard(
      onTap: onOpen,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Expanded(
                child: Text(
                  creatorName,
                  style: AppText.sans(size: 15, weight: FontWeight.w600),
                ),
              ),
              StatusChip(
                p.status == SubmissionStatus.approved
                    ? 'Approved'
                    : 'Awaiting your review',
                tone: p.status == SubmissionStatus.approved
                    ? Tone.success
                    : Tone.warning,
              ),
            ],
          ),
          const SizedBox(height: 4),
          InkWell(
            onTap: () => openLink(p.contentUrl),
            child: Text(
              p.contentUrl,
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
              style: AppText.sans(size: 13, color: AppColors.accent),
            ),
          ),
          const SizedBox(height: 10),
          if (!p.matched)
            Text(
              'Insights not synced yet',
              style: AppText.sans(size: 13, color: AppColors.textMuted),
            )
          else
            Wrap(
              spacing: 16,
              runSpacing: 6,
              children: [
                stat('views', p.views),
                stat('reach', p.reach),
                stat('likes', p.likes),
                stat('comments', p.comments),
                stat('saves', p.saved),
                stat('shares', p.shares),
              ],
            ),
        ],
      ),
    );
  }
}
