import 'package:flutter/material.dart';

import '../../backend/marketplace_service.dart';
import '../../theme/app_colors.dart';
import '../../theme/app_text.dart';
import '../../utils/format.dart';
import '../../utils/responsive.dart';
import '../../widgets/marketplace_widgets.dart';
import '../../widgets/responsive_grid.dart';
import 'creator_actions.dart';
import 'creator_profile_page.dart';

/// Brand side: search creators, save them to lists and invite them.
class DiscoverCreatorsTab extends StatefulWidget {
  const DiscoverCreatorsTab({super.key, this.service, this.inviteCampaign});

  final MarketplaceService? service;

  /// When set, invitations go straight to this campaign.
  final Campaign? inviteCampaign;

  @override
  State<DiscoverCreatorsTab> createState() => _DiscoverCreatorsTabState();
}

class _DiscoverCreatorsTabState extends State<DiscoverCreatorsTab> {
  MarketplaceService get _service => widget.service ?? marketplaceService;

  CreatorFilter _filter = const CreatorFilter();
  int _version = 0;
  final _search = TextEditingController();
  final _city = TextEditingController();
  final _audienceCity = TextEditingController();

  @override
  void dispose() {
    _search.dispose();
    _city.dispose();
    _audienceCity.dispose();
    super.dispose();
  }

  void _apply(CreatorFilter f) => setState(() {
    _filter = f;
    _version++;
  });

  void _applyText() => _apply(
    _filter.copyWith(
      query: _search.text,
      city: _city.text,
      audienceCity: _audienceCity.text,
    ),
  );

  Future<(List<CreatorSummary>, List<Shortlist>)> _load() async {
    final creators = await _service.searchCreators(_filter);
    final lists = await _service.shortlists();
    return (creators, lists);
  }

  @override
  Widget build(BuildContext context) {
    final campaign = widget.inviteCampaign;
    return PageList(
      onRefresh: () async => setState(() => _version++),
      children: [
        if (campaign == null)
          const TabHeader(
            title: 'Find creators',
            subtitle:
                'Search Instagram creators on Shor. Verified numbers come '
                'straight from Instagram.',
          )
        else ...[
          Note(
            'Inviting creators to “${campaign.title}”.',
            icon: Icons.campaign_outlined,
          ),
          const SizedBox(height: 16),
        ],
        TextField(
          controller: _search,
          textInputAction: TextInputAction.search,
          onSubmitted: (_) => _applyText(),
          decoration: pillInputDecoration(
            hint: 'Search by name or handle',
            icon: Icons.search,
            suffix: Padding(
              padding: const EdgeInsets.only(right: 4),
              child: RoundIconButton(
                icon: Icons.arrow_forward,
                tooltip: 'Search',
                dark: true,
                size: 42,
                onPressed: _applyText,
              ),
            ),
          ),
        ),
        const SizedBox(height: 12),
        FilterRow(
          children: [
            FilterDropdown<String?>(
              label: 'Niche',
              value: _filter.niche,
              items: {null: 'All niches', for (final n in niches) n: n},
              onChanged: (v) => _apply(_filter.copyWith(niche: () => v)),
            ),
            FilterDropdown<FollowerTier>(
              label: 'Followers',
              value: _filter.tier,
              items: {for (final t in FollowerTier.values) t: t.label},
              onChanged: (v) => _apply(_filter.copyWith(tier: v)),
            ),
            SizedBox(
              width: 170,
              height: 42,
              child: TextField(
                controller: _city,
                textInputAction: TextInputAction.search,
                onSubmitted: (_) => _applyText(),
                decoration: pillInputDecoration(
                  hint: 'City',
                  icon: Icons.place_outlined,
                  dense: true,
                ),
              ),
            ),
            FilterChip(
              label: const Text('Verified only'),
              avatar: const Icon(Icons.verified, size: 16),
              selected: _filter.verifiedOnly,
              onSelected: (v) => _apply(_filter.copyWith(verifiedOnly: v)),
            ),
            FilterDropdown<AudienceFilter>(
              label: 'Audience',
              value: _filter.audience,
              items: {for (final a in AudienceFilter.values) a: a.label},
              onChanged: (v) => _apply(_filter.copyWith(audience: v)),
            ),
            SizedBox(
              width: 200,
              height: 42,
              child: TextField(
                key: const ValueKey('audience-city'),
                controller: _audienceCity,
                textInputAction: TextInputAction.search,
                onSubmitted: (_) => _applyText(),
                decoration: pillInputDecoration(
                  hint: 'Audience city',
                  icon: Icons.groups_outlined,
                  dense: true,
                ),
              ),
            ),
            FilterDropdown<int>(
              label: 'Quality',
              value: _filter.minQuality,
              items: const {
                0: 'Any quality',
                50: 'Quality 50+',
                70: 'Quality 70+',
                85: 'Quality 85+',
              },
              onChanged: (v) => _apply(_filter.copyWith(minQuality: v)),
            ),
            FilterDropdown<CreatorSort>(
              label: 'Sort',
              value: _filter.sort,
              items: const {
                CreatorSort.followers: 'Most followers',
                CreatorSort.engagement: 'Best engagement',
                CreatorSort.quality: 'Highest quality',
                CreatorSort.newest: 'Newest on Shor',
              },
              onChanged: (v) => _apply(_filter.copyWith(sort: v)),
            ),
          ],
        ),
        const SizedBox(height: 18),
        AsyncView<(List<CreatorSummary>, List<Shortlist>)>(
          key: ValueKey(_version),
          refresh: marketplaceRevision,
          load: _load,
          builder: (context, data, reload) {
            final (creators, lists) = data;
            final saved = {for (final l in lists) ...l.creatorIds};
            return Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                Wrap(
                  spacing: 12,
                  runSpacing: 8,
                  alignment: WrapAlignment.spaceBetween,
                  crossAxisAlignment: WrapCrossAlignment.center,
                  children: [
                    Text(
                      '${creators.length} creator${creators.length == 1 ? '' : 's'}',
                      style: AppText.sans(
                        size: 14,
                        color: AppColors.textSecondary,
                      ),
                    ),
                    if (lists.isNotEmpty)
                      FilterDropdown<String?>(
                        label: 'List',
                        value: lists.any((l) => l.id == _filter.shortlistId)
                            ? _filter.shortlistId
                            : null,
                        items: {
                          null: 'All creators',
                          for (final l in lists)
                            l.id: '${l.name} (${l.creatorIds.length})',
                        },
                        onChanged: (v) =>
                            _apply(_filter.copyWith(shortlistId: () => v)),
                      ),
                  ],
                ),
                const SizedBox(height: 12),
                if (creators.isEmpty)
                  const EmptyState(
                    icon: Icons.person_search_outlined,
                    title: 'No creators match',
                    message: 'Try fewer filters or a different search.',
                  )
                else
                  ResponsiveGrid(
                    columns: context.responsive<int>(1, md: 2, xl: 3),
                    spacing: 14,
                    children: [
                      for (final c in creators)
                        CreatorCard(
                          creator: c,
                          saved: saved.contains(c.id),
                          onOpen: () => Navigator.of(context).push(
                            MaterialPageRoute<void>(
                              builder: (_) => CreatorProfilePage(
                                creatorId: c.id,
                                service: widget.service,
                                inviteCampaign: campaign,
                              ),
                            ),
                          ),
                          onSave: () => showShortlistSheet(
                            context,
                            service: _service,
                            creator: c,
                          ),
                          onInvite: () => showInviteSheet(
                            context,
                            service: _service,
                            creator: c,
                            campaign: campaign,
                          ),
                        ),
                    ],
                  ),
              ],
            );
          },
        ),
      ],
    );
  }
}

/// Discover creators as a pushed page, inviting to one campaign.
class DiscoverCreatorsPage extends StatelessWidget {
  const DiscoverCreatorsPage({super.key, required this.campaign, this.service});

  final Campaign campaign;
  final MarketplaceService? service;

  @override
  Widget build(BuildContext context) => ShorPage(
    title: 'Invite creators',
    body: DiscoverCreatorsTab(service: service, inviteCampaign: campaign),
  );
}

class CreatorCard extends StatelessWidget {
  const CreatorCard({
    super.key,
    required this.creator,
    required this.saved,
    required this.onOpen,
    required this.onSave,
    required this.onInvite,
  });

  final CreatorSummary creator;
  final bool saved;
  final VoidCallback onOpen;
  final VoidCallback onSave;
  final VoidCallback onInvite;

  @override
  Widget build(BuildContext context) {
    final c = creator;
    return SectionCard(
      onTap: onOpen,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Avatar(name: c.displayName, imageUrl: c.avatarUrl, size: 46),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      c.displayName,
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      style: AppText.sans(size: 16, weight: FontWeight.w600),
                    ),
                    Row(
                      children: [
                        Flexible(
                          child: Text(
                            c.instagramLabel ?? 'Instagram not connected',
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                            style: AppText.sans(
                              size: 13,
                              color: AppColors.textMuted,
                            ),
                          ),
                        ),
                        if (c.instagramVerified) ...[
                          const SizedBox(width: 4),
                          const Tooltip(
                            message: 'Verified from Instagram',
                            child: Icon(
                              Icons.verified,
                              size: 15,
                              color: AppColors.accent,
                            ),
                          ),
                        ],
                      ],
                    ),
                    if ((c.location ?? '').isNotEmpty)
                      Text(
                        c.location!,
                        style: AppText.sans(
                          size: 12,
                          color: AppColors.textMuted,
                        ),
                      ),
                  ],
                ),
              ),
              IconButton(
                tooltip: saved ? 'Saved to a list' : 'Save to a list',
                onPressed: onSave,
                icon: Icon(
                  saved ? Icons.bookmark : Icons.bookmark_border,
                  color: saved ? AppColors.accent : AppColors.textSecondary,
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          CreatorStats(creator: c),
          const SizedBox(height: 8),
          CreatorSignals(creator: c),
          if (c.niches.isNotEmpty) ...[
            const SizedBox(height: 10),
            Wrap(
              spacing: 6,
              runSpacing: 6,
              children: [for (final n in c.niches.take(3)) StatusChip(n)],
            ),
          ],
          const SizedBox(height: 14),
          Row(
            children: [
              SmallButton(label: 'Invite', onPressed: onInvite),
              const SizedBox(width: 8),
              SmallButton(label: 'Profile', outlined: true, onPressed: onOpen),
            ],
          ),
        ],
      ),
    );
  }
}

/// Quality score, rating and (when shared) audience, as compact chips.
class CreatorSignals extends StatelessWidget {
  const CreatorSignals({super.key, required this.creator});

  final CreatorSummary creator;

  @override
  Widget build(BuildContext context) {
    final c = creator;
    final audience = [
      if (c.audFemaleShare != null)
        c.audFemaleShare! >= 50
            ? '${c.audFemaleShare!.round()}% women'
            : '${(100 - c.audFemaleShare!).round()}% men',
      if (c.audAge18to34Share != null)
        '${c.audAge18to34Share!.round()}% aged 18–34',
      if (c.audTopCities.isNotEmpty) c.audTopCities.take(2).join(', '),
    ];
    final chips = <Widget>[
      if (c.qualityScore != null)
        Tooltip(
          message: c.qualityFlags.isEmpty
              ? 'From public engagement, posting and follower growth'
              : c.qualityFlags.join(' · '),
          child: StatusChip(
            'Quality ${c.qualityScore} · ${c.qualityLabel}',
            icon: Icons.shield_outlined,
            tone: c.qualityScore! >= 70
                ? Tone.success
                : c.qualityScore! >= 50
                ? Tone.info
                : Tone.warning,
          ),
        ),
      if (c.rating.hasReviews)
        StatusChip(c.rating.label, icon: Icons.star_rounded),
      if (audience.isNotEmpty)
        StatusChip(audience.join(' · '), icon: Icons.groups_outlined),
    ];
    if (chips.isEmpty) return const SizedBox.shrink();
    return Wrap(spacing: 6, runSpacing: 6, children: chips);
  }
}
