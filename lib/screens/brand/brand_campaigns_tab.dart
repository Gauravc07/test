import 'package:flutter/material.dart';

import '../../backend/marketplace_service.dart';
import '../../theme/app_colors.dart';
import '../../theme/app_text.dart';
import '../../utils/format.dart';
import '../../widgets/app_buttons.dart';
import '../../widgets/choice_toggle.dart';
import '../../widgets/marketplace_widgets.dart';
import 'brand_campaign_page.dart';
import 'campaign_editor_page.dart';

/// Brand side: every campaign, with what needs attention.
class BrandCampaignsTab extends StatefulWidget {
  const BrandCampaignsTab({super.key, this.service});

  final MarketplaceService? service;

  @override
  State<BrandCampaignsTab> createState() => _BrandCampaignsTabState();
}

enum _Filter { all, live, drafts, closed }

class _BrandCampaignsTabState extends State<BrandCampaignsTab> {
  MarketplaceService get _service => widget.service ?? marketplaceService;
  _Filter _filter = _Filter.all;
  int _version = 0;

  Future<(List<Campaign>, Map<String, Map<CollabStatus, int>>)> _load() async {
    final campaigns = await _service.myCampaigns();
    final counts = await _service.collaborationCounts();
    return (campaigns, counts);
  }

  Future<void> _create() async {
    final created = await Navigator.of(context).push<Campaign>(
      MaterialPageRoute(
        builder: (_) => CampaignEditorPage(service: widget.service),
      ),
    );
    if (created != null && mounted) _open(created.id);
  }

  void _open(String id) => Navigator.of(context).push(
    MaterialPageRoute<void>(
      builder: (_) =>
          BrandCampaignPage(campaignId: id, service: widget.service),
    ),
  );

  static bool _matches(Campaign c, _Filter f) => switch (f) {
    _Filter.all => true,
    _Filter.live =>
      c.status == CampaignStatus.active || c.status == CampaignStatus.paused,
    _Filter.drafts => c.status == CampaignStatus.draft,
    _Filter.closed =>
      c.status == CampaignStatus.completed ||
          c.status == CampaignStatus.archived,
  };

  @override
  Widget build(BuildContext context) {
    return PageList(
      maxWidth: 900,
      onRefresh: () async => setState(() => _version++),
      children: [
        TabHeader(
          title: 'Campaigns',
          subtitle:
              'Write a brief, invite creators or open it to applications, then '
              'review content and results.',
          actions: [SolidButton(label: 'New campaign', onPressed: _create)],
        ),
        AsyncView<(List<Campaign>, Map<String, Map<CollabStatus, int>>)>(
          key: ValueKey(_version),
          refresh: marketplaceRevision,
          load: _load,
          builder: (context, data, reload) {
            final (campaigns, counts) = data;
            if (campaigns.isEmpty) {
              return EmptyState(
                icon: Icons.campaign_outlined,
                title: 'No campaigns yet',
                message:
                    'Create a campaign brief: what creators should post, what '
                    'you offer, and who can apply.',
                action: SolidButton(
                  label: 'Create a campaign',
                  onPressed: _create,
                ),
              );
            }
            final shown = campaigns.where((c) => _matches(c, _filter)).toList();
            int count(_Filter f) =>
                campaigns.where((c) => _matches(c, f)).length;
            return Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                Align(
                  alignment: Alignment.centerLeft,
                  child: ChoiceToggle<_Filter>(
                    options: {
                      _Filter.all: 'All (${count(_Filter.all)})',
                      _Filter.live: 'Live (${count(_Filter.live)})',
                      _Filter.drafts: 'Drafts (${count(_Filter.drafts)})',
                      _Filter.closed: 'Closed (${count(_Filter.closed)})',
                    },
                    selected: _filter,
                    onChanged: (f) => setState(() => _filter = f),
                  ),
                ),
                const SizedBox(height: 16),
                if (shown.isEmpty)
                  const EmptyState(
                    icon: Icons.inbox_outlined,
                    title: 'Nothing here',
                    message: 'Check the other lists above.',
                  )
                else
                  for (final c in shown) ...[
                    _CampaignRow(
                      campaign: c,
                      counts: counts[c.id] ?? const {},
                      onTap: () => _open(c.id),
                    ),
                    const SizedBox(height: 10),
                  ],
              ],
            );
          },
        ),
      ],
    );
  }
}

class _CampaignRow extends StatelessWidget {
  const _CampaignRow({
    required this.campaign,
    required this.counts,
    required this.onTap,
  });

  final Campaign campaign;
  final Map<CollabStatus, int> counts;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final c = campaign;
    final applied = counts[CollabStatus.applied] ?? 0;
    final review = counts[CollabStatus.awaitingApproval] ?? 0;
    final hired = counts.entries
        .where((e) => e.key.isHired)
        .fold<int>(0, (s, e) => s + e.value);
    return SectionCard(
      onTap: onTap,
      child: Row(
        children: [
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Wrap(
                  spacing: 6,
                  runSpacing: 6,
                  children: [
                    StatusChip(c.status.label, tone: campaignTone(c.status)),
                    if (c.visibility == CampaignVisibility.inviteOnly)
                      const StatusChip('Invite only', icon: Icons.lock_outline),
                  ],
                ),
                const SizedBox(height: 8),
                Text(c.title, style: AppText.heading(18)),
                const SizedBox(height: 2),
                Text(
                  '${c.compensationLabel} · ${deliverablesSummary(c.deliverables)}',
                  style: AppText.sans(size: 13, color: AppColors.textMuted),
                ),
              ],
            ),
          ),
          const SizedBox(width: 12),
          Column(
            crossAxisAlignment: CrossAxisAlignment.end,
            children: [
              if (applied > 0) StatusChip('$applied new', tone: Tone.info),
              if (review > 0) ...[
                const SizedBox(height: 4),
                StatusChip('$review to review', tone: Tone.warning),
              ],
              const SizedBox(height: 4),
              Text(
                c.creatorSlots == null
                    ? '$hired hired'
                    : '$hired / ${c.creatorSlots} hired',
                style: AppText.sans(size: 13, color: AppColors.textSecondary),
              ),
            ],
          ),
        ],
      ),
    );
  }
}
