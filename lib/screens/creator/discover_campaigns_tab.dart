import 'package:flutter/material.dart';

import '../../backend/marketplace_service.dart';
import '../../theme/app_colors.dart';
import '../../theme/app_text.dart';
import '../../utils/format.dart';
import '../../utils/responsive.dart';
import '../../widgets/choice_toggle.dart';
import '../../widgets/marketplace_widgets.dart';
import '../../widgets/responsive_grid.dart';
import 'campaign_detail_page.dart';

/// Creator side: live campaigns open for applications.
class DiscoverCampaignsTab extends StatefulWidget {
  const DiscoverCampaignsTab({super.key, this.service});

  /// Defaults to the app-wide [marketplaceService].
  final MarketplaceService? service;

  @override
  State<DiscoverCampaignsTab> createState() => _DiscoverCampaignsTabState();
}

class _DiscoverCampaignsTabState extends State<DiscoverCampaignsTab> {
  MarketplaceService get _service => widget.service ?? marketplaceService;

  CampaignFilter _filter = const CampaignFilter();
  int _version = 0;

  void _setFilter(CampaignFilter filter) => setState(() {
    _filter = filter;
    _version++;
  });

  Future<(List<Campaign>, Map<String, CollabStatus>)> _load() async {
    final campaigns = await _service.openCampaigns(_filter);
    final mine = await _service.myCampaignStatuses();
    return (campaigns, mine);
  }

  @override
  Widget build(BuildContext context) {
    return PageList(
      onRefresh: () async => setState(() => _version++),
      children: [
        const TabHeader(
          title: 'Find campaigns',
          subtitle:
              'Brands looking for Instagram creators right now. Apply to the '
              'ones that fit your content.',
        ),
        Wrap(
          spacing: 10,
          runSpacing: 10,
          crossAxisAlignment: WrapCrossAlignment.center,
          children: [
            FilterDropdown<String?>(
              label: 'Niche',
              value: _filter.niche,
              items: {null: 'All niches', for (final n in niches) n: n},
              onChanged: (v) => _setFilter(_filter.copyWith(niche: () => v)),
            ),
            ChoiceToggle<String>(
              key: const ValueKey('compensation-filter'),
              options: const {'all': 'All', 'paid': 'Paid', 'barter': 'Barter'},
              selected: switch (_filter.compensation) {
                null => 'all',
                CompensationType.barter => 'barter',
                _ => 'paid',
              },
              onChanged: (v) => _setFilter(
                _filter.copyWith(
                  compensation: () => switch (v) {
                    'paid' => CompensationType.paid,
                    'barter' => CompensationType.barter,
                    _ => null,
                  },
                ),
              ),
            ),
            FilterDropdown<CampaignSort>(
              label: 'Sort',
              value: _filter.sort,
              items: const {
                CampaignSort.newest: 'Newest first',
                CampaignSort.payout: 'Highest pay',
                CampaignSort.deadline: 'Closing soon',
              },
              onChanged: (v) => _setFilter(_filter.copyWith(sort: v)),
            ),
          ],
        ),
        const SizedBox(height: 20),
        AsyncView<(List<Campaign>, Map<String, CollabStatus>)>(
          key: ValueKey(_version),
          refresh: marketplaceRevision,
          load: _load,
          builder: (context, data, reload) {
            final (campaigns, mine) = data;
            if (campaigns.isEmpty) {
              return const EmptyState(
                icon: Icons.campaign_outlined,
                title: 'No campaigns match',
                message:
                    'Try another niche or check back soon. New campaigns '
                    'appear here as brands publish them.',
              );
            }
            return ResponsiveGrid(
              columns: context.responsive<int>(1, md: 2, xl: 3),
              spacing: 14,
              children: [
                for (final c in campaigns)
                  CampaignCard(
                    campaign: c,
                    myStatus: mine[c.id],
                    onTap: () => Navigator.of(context).push(
                      MaterialPageRoute<void>(
                        builder: (_) => CampaignDetailPage(
                          campaignId: c.id,
                          service: widget.service,
                        ),
                      ),
                    ),
                  ),
              ],
            );
          },
        ),
      ],
    );
  }
}

/// Summary of a campaign brief for the creator's feed.
class CampaignCard extends StatelessWidget {
  const CampaignCard({
    super.key,
    required this.campaign,
    required this.onTap,
    this.myStatus,
  });

  final Campaign campaign;
  final VoidCallback onTap;
  final CollabStatus? myStatus;

  @override
  Widget build(BuildContext context) {
    final c = campaign;
    final status = myStatus;
    return SectionCard(
      onTap: onTap,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Avatar(
                name: c.brandDisplayName,
                imageUrl: c.brandLogoUrl,
                size: 34,
              ),
              const SizedBox(width: 10),
              Expanded(
                child: Text(
                  c.brandDisplayName,
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  style: AppText.sans(size: 14, weight: FontWeight.w600),
                ),
              ),
              if (status != null)
                StatusChip(
                  status.label(brand: false),
                  tone: collabTone(status),
                ),
            ],
          ),
          const SizedBox(height: 12),
          Text(
            c.title,
            maxLines: 2,
            overflow: TextOverflow.ellipsis,
            style: AppText.heading(19),
          ),
          const SizedBox(height: 6),
          Text(
            c.compensationLabel,
            style: AppText.sans(
              size: 15,
              weight: FontWeight.w700,
              color: AppColors.accent,
            ),
          ),
          const SizedBox(height: 12),
          CampaignFacts(campaign: c),
        ],
      ),
    );
  }
}

/// Icon + text facts about a campaign: deliverables, niche, cities, etc.
class CampaignFacts extends StatelessWidget {
  const CampaignFacts({super.key, required this.campaign});

  final Campaign campaign;

  @override
  Widget build(BuildContext context) {
    final c = campaign;
    Widget fact(IconData icon, String text) => Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Icon(icon, size: 15, color: AppColors.textMuted),
        const SizedBox(width: 5),
        Flexible(
          child: Text(
            text,
            style: AppText.sans(size: 13, color: AppColors.textSecondary),
          ),
        ),
      ],
    );
    return Wrap(
      spacing: 14,
      runSpacing: 6,
      children: [
        fact(
          Icons.movie_creation_outlined,
          deliverablesSummary(c.deliverables),
        ),
        if (c.niche != null) fact(Icons.sell_outlined, c.niche!),
        if (c.cities.isNotEmpty)
          fact(Icons.place_outlined, c.cities.join(', ')),
        if (c.minFollowers > 0)
          fact(
            Icons.people_outline,
            '${formatCompact(c.minFollowers)}+ followers',
          ),
        if (c.applicationDeadline != null)
          fact(
            Icons.event_outlined,
            'Apply by ${formatDay(c.applicationDeadline!)}',
          ),
        if (c.creatorSlots != null)
          fact(
            Icons.group_add_outlined,
            '${c.creatorSlots} creator${c.creatorSlots == 1 ? '' : 's'}',
          ),
      ],
    );
  }
}
