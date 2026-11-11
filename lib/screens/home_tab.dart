import 'package:flutter/material.dart';

import '../backend/auth_service.dart';
import '../backend/marketplace_service.dart';
import '../theme/app_colors.dart';
import '../theme/app_text.dart';
import '../utils/format.dart';
import '../utils/responsive.dart';
import '../widgets/marketplace_widgets.dart';
import '../widgets/responsive_grid.dart';
import 'brand/brand_campaign_page.dart';
import 'brand/campaign_editor_page.dart';
import 'collaboration_page.dart';
import 'media_kit_page.dart';
import 'notifications_page.dart';

/// The most useful thing to do next, worked out from the user's data.
class NextStep {
  const NextStep({
    required this.title,
    required this.message,
    required this.action,
    this.onAction,
    this.secondary,
    this.onSecondary,
  });

  final String title;
  final String message;
  final String action;
  final VoidCallback? onAction;
  final String? secondary;
  final VoidCallback? onSecondary;
}

/// Where to go from a quick action or next step.
enum HomeDestination { campaigns, creators, work, messages, payments, profile }

String greetingFor(DateTime now) => now.hour < 12
    ? 'Good morning'
    : now.hour < 17
    ? 'Good afternoon'
    : 'Good evening';

/// Home: a greeting, the next step, today's numbers, quick actions and
/// recent activity. One screen per role, same layout.
class HomeDashboard extends StatelessWidget {
  const HomeDashboard({
    super.key,
    required this.account,
    required this.onGo,
    this.service,
  });

  final Account account;
  final ValueChanged<HomeDestination> onGo;
  final MarketplaceService? service;

  MarketplaceService get _service => service ?? marketplaceService;
  bool get _brand => account.role == AccountRole.brand;

  @override
  Widget build(BuildContext context) {
    final first =
        (_brand && (account.companyName ?? '').trim().isNotEmpty
                ? account.companyName!
                : account.fullName)
            .trim()
            .split(RegExp(r'\s+'))
            .first;
    return PageList(
      maxWidth: 820,
      children: [
        Row(
          children: [
            Avatar(name: first.isEmpty ? 'S' : first, size: 46),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      const Icon(
                        Icons.wb_sunny_outlined,
                        size: 14,
                        color: AppColors.textMuted,
                      ),
                      const SizedBox(width: 4),
                      Text(
                        greetingFor(DateTime.now()),
                        style: AppText.sans(
                          size: 13,
                          color: AppColors.textMuted,
                        ),
                      ),
                    ],
                  ),
                  Text(
                    first.isEmpty ? 'Welcome' : first,
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: AppText.sans(size: 20, weight: FontWeight.w600),
                  ),
                ],
              ),
            ),
            NotificationBell(service: service),
          ],
        ),
        const SizedBox(height: 22),
        Text.rich(
          TextSpan(
            children: [
              TextSpan(
                text: _brand ? 'Ready to find your\n' : 'Ready to land your\n',
              ),
              TextSpan(
                text: _brand ? 'next creators?' : 'next brand deal?',
                style: const TextStyle(color: AppColors.textMuted),
              ),
            ],
          ),
          style: AppText.heading(context.sized(28, md: 34)),
        ),
        const SizedBox(height: 20),
        _brand
            ? _BrandHome(service: _service, onGo: onGo)
            : _CreatorHome(service: _service, onGo: onGo, account: account),
        const SizedBox(height: 26),
        _RecentActivity(service: service),
      ],
    );
  }
}

// Brand ----------------------------------------------------------------------

typedef _BrandData = ({
  List<Campaign> campaigns,
  Map<String, Map<CollabStatus, int>> counts,
  List<Invoice> invoices,
});

class _BrandHome extends StatelessWidget {
  const _BrandHome({required this.service, required this.onGo});

  final MarketplaceService service;
  final ValueChanged<HomeDestination> onGo;

  Future<_BrandData> _load() async => (
    campaigns: await service.myCampaigns(),
    counts: await service.collaborationCounts(),
    invoices: await service.invoices(),
  );

  @override
  Widget build(BuildContext context) {
    return AsyncView<_BrandData>(
      refresh: marketplaceRevision,
      load: _load,
      builder: (context, d, reload) {
        int count(Set<CollabStatus> s, [String? campaignId]) {
          var n = 0;
          for (final e in d.counts.entries) {
            if (campaignId != null && e.key != campaignId) continue;
            for (final c in e.value.entries) {
              if (s.contains(c.key)) n += c.value;
            }
          }
          return n;
        }

        final live = d.campaigns
            .where((c) => c.status == CampaignStatus.active)
            .toList();
        final hired = count({
          CollabStatus.accepted,
          CollabStatus.inProgress,
          CollabStatus.awaitingApproval,
          CollabStatus.completed,
        });
        final toReview = count({
          CollabStatus.applied,
          CollabStatus.awaitingApproval,
        });
        final spent = d.invoices
            .where(
              (i) =>
                  i.status == InvoiceStatus.approved ||
                  i.status == InvoiceStatus.paid,
            )
            .fold<num>(0, (s, i) => s + i.brandTotal);

        return Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            _NextStepCard(step: _nextStep(context, d, count, live)),
            const SizedBox(height: 26),
            const SectionTitle('Today’s overview'),
            ResponsiveGrid(
              columns: context.responsive<int>(2, md: 4),
              spacing: 12,
              children: [
                MetricTile(
                  icon: Icons.campaign_outlined,
                  label: 'Live campaigns',
                  value: '${live.length}',
                ),
                MetricTile(
                  icon: Icons.groups_outlined,
                  label: 'Creators hired',
                  value: '$hired',
                ),
                MetricTile(
                  icon: Icons.inbox_outlined,
                  label: 'Waiting for you',
                  value: '$toReview',
                ),
                MetricTile(
                  icon: Icons.currency_rupee,
                  label: 'Spent',
                  value: formatMoney(spent),
                ),
              ],
            ),
            const SizedBox(height: 26),
            const SectionTitle('Quick actions'),
            _QuickActions(
              actions: [
                (
                  Icons.add,
                  'New campaign',
                  () => Navigator.of(context).push(
                    MaterialPageRoute<void>(
                      builder: (_) => CampaignEditorPage(service: service),
                    ),
                  ),
                ),
                (
                  Icons.person_search_outlined,
                  'Find creators',
                  () => onGo(HomeDestination.creators),
                ),
                (
                  Icons.chat_bubble_outline,
                  'Messages',
                  () => onGo(HomeDestination.messages),
                ),
                (
                  Icons.receipt_long_outlined,
                  'Payments',
                  () => onGo(HomeDestination.payments),
                ),
              ],
            ),
          ],
        );
      },
    );
  }

  NextStep _nextStep(
    BuildContext context,
    _BrandData d,
    int Function(Set<CollabStatus>, [String?]) count,
    List<Campaign> live,
  ) {
    void openCampaign(String id) => Navigator.of(context).push(
      MaterialPageRoute<void>(
        builder: (_) => BrandCampaignPage(campaignId: id, service: service),
      ),
    );

    final pending = d.invoices
        .where((i) => i.status == InvoiceStatus.pending)
        .toList();
    if (pending.isNotEmpty) {
      final i = pending.first;
      return NextStep(
        title:
            'Approve ${i.counterpartName ?? 'a creator'}’s invoice for '
            '${formatMoney(i.brandTotal)}',
        message: [
          ?i.campaignTitle,
          if (pending.length > 1) '${pending.length - 1} more waiting',
        ].join(' · '),
        action: 'Review',
        // The link is cleared if the creator deleted their account.
        onAction: i.collaborationId == null
            ? () => onGo(HomeDestination.payments)
            : () => Navigator.of(context).push(
                MaterialPageRoute<void>(
                  builder: (_) => CollaborationPage(
                    collaborationId: i.collaborationId!,
                    service: service,
                  ),
                ),
              ),
        secondary: 'All payments',
        onSecondary: () => onGo(HomeDestination.payments),
      );
    }
    for (final c in d.campaigns) {
      final posts = count({CollabStatus.awaitingApproval}, c.id);
      if (posts > 0) {
        return NextStep(
          title: 'Check $posts live post${posts == 1 ? '' : 's'}',
          message:
              'On ${c.title}. Approve to complete the deal, or ask for changes.',
          action: 'Open campaign',
          onAction: () => openCampaign(c.id),
        );
      }
    }
    for (final c in d.campaigns) {
      final applied = count({CollabStatus.applied}, c.id);
      if (applied > 0) {
        return NextStep(
          title:
              '$applied creator${applied == 1 ? '' : 's'} applied to ${c.title}',
          message: 'Review their pitches and verified stats, then hire.',
          action: 'Review',
          onAction: () => openCampaign(c.id),
        );
      }
    }
    if (d.campaigns.isEmpty) {
      return NextStep(
        title: 'Launch your first campaign',
        message:
            'Write a short brief and creators can start applying today. '
            'You only pay when you approve the post.',
        action: 'New campaign',
        onAction: () => Navigator.of(context).push(
          MaterialPageRoute<void>(
            builder: (_) => CampaignEditorPage(service: service),
          ),
        ),
        secondary: 'Find creators',
        onSecondary: () => onGo(HomeDestination.creators),
      );
    }
    return NextStep(
      title: live.isEmpty
          ? 'Publish a campaign to get applications'
          : 'Invite creators to ${live.first.title}',
      message: 'Search by niche, city and verified engagement.',
      action: 'Find creators',
      onAction: () => onGo(HomeDestination.creators),
    );
  }
}

// Creator --------------------------------------------------------------------

typedef _CreatorData = ({
  List<Collaboration> collabs,
  List<Invoice> invoices,
  int open,
  String? handle,
});

class _CreatorHome extends StatelessWidget {
  const _CreatorHome({
    required this.service,
    required this.onGo,
    required this.account,
  });

  final MarketplaceService service;
  final ValueChanged<HomeDestination> onGo;
  final Account account;

  Future<_CreatorData> _load() async {
    final collabs = await service.myCollaborations();
    final invoices = await service.invoices();
    final open = await service.openCampaigns(const CampaignFilter());
    final profile = await service.myCreatorProfile();
    return (
      collabs: collabs,
      invoices: invoices,
      open: open.length,
      handle: profile.handle,
    );
  }

  @override
  Widget build(BuildContext context) {
    return AsyncView<_CreatorData>(
      refresh: marketplaceRevision,
      load: _load,
      builder: (context, d, reload) {
        final active = d.collabs.where((c) => c.status.isActive).length;
        final applied = d.collabs
            .where((c) => c.status == CollabStatus.applied)
            .length;
        final earned = d.invoices
            .where(
              (i) =>
                  i.status == InvoiceStatus.approved ||
                  i.status == InvoiceStatus.paid,
            )
            .fold<num>(0, (s, i) => s + i.net);
        final handle = (d.handle ?? '').trim();

        return Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            _NextStepCard(step: _nextStep(context, d)),
            const SizedBox(height: 26),
            const SectionTitle('Today’s overview'),
            ResponsiveGrid(
              columns: context.responsive<int>(2, md: 4),
              spacing: 12,
              children: [
                MetricTile(
                  icon: Icons.handshake_outlined,
                  label: 'Active deals',
                  value: '$active',
                ),
                MetricTile(
                  icon: Icons.hourglass_empty,
                  label: 'Applications sent',
                  value: '$applied',
                ),
                MetricTile(
                  icon: Icons.currency_rupee,
                  label: 'Earned',
                  value: formatMoney(earned),
                ),
                MetricTile(
                  icon: Icons.campaign_outlined,
                  label: 'Open campaigns',
                  value: '${d.open}',
                ),
              ],
            ),
            const SizedBox(height: 26),
            const SectionTitle('Quick actions'),
            _QuickActions(
              actions: [
                (
                  Icons.search,
                  'Find campaigns',
                  () => onGo(HomeDestination.campaigns),
                ),
                (
                  Icons.work_outline,
                  'My work',
                  () => onGo(HomeDestination.work),
                ),
                (
                  Icons.badge_outlined,
                  'Media kit',
                  handle.isEmpty
                      ? () => onGo(HomeDestination.profile)
                      : () => Navigator.of(context).push(
                          MaterialPageRoute<void>(
                            builder: (_) =>
                                MediaKitPage(handle: handle, service: service),
                          ),
                        ),
                ),
                (
                  Icons.chat_bubble_outline,
                  'Messages',
                  () => onGo(HomeDestination.messages),
                ),
              ],
            ),
          ],
        );
      },
    );
  }

  NextStep _nextStep(BuildContext context, _CreatorData d) {
    void open(Collaboration c) => Navigator.of(context).push(
      MaterialPageRoute<void>(
        builder: (_) =>
            CollaborationPage(collaborationId: c.id, service: service),
      ),
    );
    String brand(Collaboration c) => c.campaign?.brandDisplayName ?? 'A brand';
    String title(Collaboration c) => c.campaign?.title ?? 'your campaign';
    Collaboration? first(CollabStatus s) =>
        d.collabs.where((c) => c.status == s).firstOrNull;

    if (first(CollabStatus.invited) case final c?) {
      return NextStep(
        title: '${brand(c)} invited you to ${title(c)}',
        message: c.agreedAmount != null
            ? 'Their offer is ${formatMoney(c.agreedAmount)}. Accept or decline.'
            : 'Open the invitation to see the brief.',
        action: 'View invite',
        onAction: () => open(c),
      );
    }
    final invoiced = {for (final i in d.invoices) i.collaborationId};
    final unpaid = d.collabs.where(
      (c) =>
          c.status == CollabStatus.completed &&
          !invoiced.contains(c.id) &&
          (c.agreedAmount ?? 0) > 0,
    );
    if (unpaid.isNotEmpty) {
      final c = unpaid.first;
      return NextStep(
        title: 'Request your ${formatMoney(c.agreedAmount)} from ${brand(c)}',
        message: '${title(c)} is complete. Send the invoice to get paid.',
        action: 'Request payment',
        onAction: () => open(c),
      );
    }
    if (first(CollabStatus.accepted) case final c?) {
      return NextStep(
        title: 'Share your draft for ${title(c)}',
        message: '${brand(c)} hired you. Send a draft link for them to review.',
        action: 'Open',
        onAction: () => open(c),
      );
    }
    if (first(CollabStatus.inProgress) case final c?) {
      return NextStep(
        title: 'Keep going on ${title(c)}',
        message: 'Check feedback from ${brand(c)} and what to post next.',
        action: 'Open',
        onAction: () => open(c),
      );
    }
    return NextStep(
      title: d.open == 0
          ? 'Make your profile stand out'
          : '${d.open} campaign${d.open == 1 ? ' is' : 's are'} open now',
      message: d.open == 0
          ? 'Add your niches, city and rates so brands can find you.'
          : 'Apply with a short pitch. Brands see your verified numbers.',
      action: d.open == 0 ? 'Edit profile' : 'Browse',
      onAction: () => onGo(
        d.open == 0 ? HomeDestination.profile : HomeDestination.campaigns,
      ),
      secondary: d.open == 0 ? null : 'My work',
      onSecondary: d.open == 0 ? null : () => onGo(HomeDestination.work),
    );
  }
}

// Shared ---------------------------------------------------------------------

class _NextStepCard extends StatelessWidget {
  const _NextStepCard({required this.step});

  final NextStep step;

  @override
  Widget build(BuildContext context) {
    return HeroCard(
      tag: 'Next step',
      tagIcon: Icons.auto_awesome,
      title: step.title,
      message: step.message.isEmpty ? null : step.message,
      actions: [
        if (step.onAction != null)
          HeroButton(
            key: const ValueKey('next-step-action'),
            label: step.action,
            icon: Icons.arrow_forward,
            onPressed: step.onAction!,
          ),
        if (step.secondary != null && step.onSecondary != null)
          HeroButton(
            label: step.secondary!,
            primary: false,
            onPressed: step.onSecondary!,
          ),
      ],
    );
  }
}

class _QuickActions extends StatelessWidget {
  const _QuickActions({required this.actions});

  final List<(IconData, String, VoidCallback)> actions;

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        for (var i = 0; i < actions.length; i++) ...[
          if (i > 0) const SizedBox(width: 10),
          Expanded(
            child: Semantics(
              button: true,
              label: actions[i].$2,
              excludeSemantics: true,
              child: Material(
                color: AppColors.bgCard,
                borderRadius: BorderRadius.circular(18),
                clipBehavior: Clip.antiAlias,
                child: InkWell(
                  onTap: actions[i].$3,
                  child: Padding(
                    padding: const EdgeInsets.symmetric(vertical: 14),
                    child: Column(
                      children: [
                        Icon(actions[i].$1, size: 22, color: AppColors.navy),
                        const SizedBox(height: 6),
                        Text(
                          actions[i].$2,
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                          style: AppText.sans(
                            size: 12,
                            weight: FontWeight.w600,
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ),
            ),
          ),
        ],
      ],
    );
  }
}

/// The latest notifications as a timeline.
class _RecentActivity extends StatefulWidget {
  const _RecentActivity({this.service});

  final MarketplaceService? service;

  @override
  State<_RecentActivity> createState() => _RecentActivityState();
}

class _RecentActivityState extends State<_RecentActivity> {
  late final Stream<List<AppNotification>> _stream =
      (widget.service ?? marketplaceService).notifications();

  @override
  Widget build(BuildContext context) {
    return StreamBuilder<List<AppNotification>>(
      stream: _stream,
      builder: (context, snapshot) {
        final items = (snapshot.data ?? const <AppNotification>[])
            .take(5)
            .toList();
        if (items.isEmpty) return const SizedBox.shrink();
        return Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            SectionTitle(
              'Recent activity',
              trailing: TextButton(
                onPressed: () => Navigator.of(context).push(
                  MaterialPageRoute<void>(
                    builder: (_) => NotificationsPage(service: widget.service),
                  ),
                ),
                child: const Text('See all'),
              ),
            ),
            SectionCard(
              padding: const EdgeInsets.fromLTRB(18, 16, 18, 6),
              child: Column(
                children: [
                  for (var i = 0; i < items.length; i++)
                    _TimelineRow(
                      note: items[i],
                      last: i == items.length - 1,
                      onTap: () => openNotification(
                        context,
                        items[i],
                        service: widget.service,
                      ),
                    ),
                ],
              ),
            ),
          ],
        );
      },
    );
  }
}

class _TimelineRow extends StatelessWidget {
  const _TimelineRow({
    required this.note,
    required this.last,
    required this.onTap,
  });

  final AppNotification note;
  final bool last;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(12),
      child: IntrinsicHeight(
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            SizedBox(
              width: 18,
              child: Column(
                children: [
                  const SizedBox(height: 4),
                  Container(
                    width: 12,
                    height: 12,
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      color: note.unread ? AppColors.accent : AppColors.navy,
                    ),
                  ),
                  if (!last)
                    Expanded(child: Container(width: 2, color: AppColors.navy)),
                ],
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Padding(
                padding: const EdgeInsets.only(bottom: 16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      note.title,
                      style: AppText.sans(
                        size: 14,
                        weight: note.unread ? FontWeight.w700 : FontWeight.w500,
                      ),
                    ),
                    const SizedBox(height: 2),
                    Text(
                      timeAgo(note.createdAt),
                      style: AppText.sans(size: 12, color: AppColors.textMuted),
                    ),
                  ],
                ),
              ),
            ),
            Padding(
              padding: const EdgeInsets.only(left: 8, top: 2),
              child: Icon(
                notificationIcon(note.kind),
                size: 16,
                color: AppColors.textMuted,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
