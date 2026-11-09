import 'package:flutter/material.dart';

import '../../backend/marketplace_service.dart';
import '../../theme/app_colors.dart';
import '../../theme/app_text.dart';
import '../../utils/format.dart';
import '../../utils/links.dart';
import '../../utils/responsive.dart';
import '../../widgets/app_buttons.dart';
import '../../widgets/marketplace_widgets.dart';
import '../../widgets/responsive_grid.dart';
import '../../widgets/reviews.dart';
import '../../widgets/safety.dart';
import '../chat_page.dart';
import 'creator_actions.dart';

/// Brand side: a creator's public profile, with invite, save and message.
class CreatorProfilePage extends StatelessWidget {
  const CreatorProfilePage({
    super.key,
    required this.creatorId,
    this.service,
    this.inviteCampaign,
  });

  final String creatorId;
  final MarketplaceService? service;
  final Campaign? inviteCampaign;

  MarketplaceService get _service => service ?? marketplaceService;

  Future<void> _message(BuildContext context, CreatorSummary c) async {
    final me = _service.currentUserId;
    if (me == null) return;
    try {
      final conversation = await _service.openConversation(
        brandId: me,
        creatorId: c.id,
        campaignId: inviteCampaign?.id,
      );
      if (!context.mounted) return;
      await Navigator.of(context).push(
        MaterialPageRoute<void>(
          builder: (_) =>
              ChatPage(conversation: conversation, service: service),
        ),
      );
    } on MarketplaceFailure catch (e) {
      if (context.mounted) showToast(context, e.message);
    }
  }

  @override
  Widget build(BuildContext context) {
    return ShorPage(
      title: 'Creator',
      body: AsyncView<CreatorSummary>(
        load: () => _service.creator(creatorId),
        builder: (context, c, reload) => Column(
          children: [
            Expanded(
              child: PageList(
                maxWidth: 820,
                children: [
                  Row(
                    children: [
                      Avatar(
                        name: c.displayName,
                        imageUrl: c.avatarUrl,
                        size: 72,
                      ),
                      const SizedBox(width: 16),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(c.displayName, style: AppText.heading(26)),
                            const SizedBox(height: 4),
                            Wrap(
                              spacing: 8,
                              runSpacing: 6,
                              crossAxisAlignment: WrapCrossAlignment.center,
                              children: [
                                if (c.instagramLabel != null)
                                  InkWell(
                                    onTap: c.instagramUrl == null
                                        ? null
                                        : () => openLink(c.instagramUrl!),
                                    child: Text(
                                      c.instagramLabel!,
                                      style: AppText.sans(
                                        size: 14,
                                        weight: FontWeight.w600,
                                        color: AppColors.accent,
                                      ),
                                    ),
                                  ),
                                if (c.instagramVerified)
                                  const StatusChip(
                                    'Verified',
                                    tone: Tone.info,
                                    icon: Icons.verified,
                                  ),
                                RatingLine(c.rating),
                                if ((c.location ?? '').isNotEmpty)
                                  Text(
                                    c.location!,
                                    style: AppText.sans(
                                      size: 14,
                                      color: AppColors.textMuted,
                                    ),
                                  ),
                              ],
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 20),
                  ResponsiveGrid(
                    columns: context.responsive<int>(1, sm: 3),
                    spacing: 10,
                    children: [
                      MetricTile(
                        label: 'Followers',
                        value: formatCompact(c.followers),
                        caption: c.instagramVerified
                            ? 'From Instagram'
                            : 'Not verified',
                      ),
                      MetricTile(
                        label: 'Engagement',
                        value: c.engagementRate == null
                            ? '—'
                            : '${c.engagementRate!.toStringAsFixed(1)}%',
                        caption: 'Likes + comments ÷ followers',
                      ),
                      MetricTile(
                        label: 'Rate',
                        value: c.rateLabel.replaceAll(' / post', ''),
                        caption: 'Per post',
                      ),
                    ],
                  ),
                  const SizedBox(height: 14),
                  if (!c.instagramVerified) ...[
                    const Note(
                      'This creator has not connected Instagram yet, so their '
                      'numbers are not verified.',
                    ),
                    const SizedBox(height: 14),
                  ],
                  if ((c.bio ?? '').trim().isNotEmpty) ...[
                    SectionCard(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const SectionTitle('About'),
                          Text(
                            c.bio!.trim(),
                            style: AppText.sans(size: 15, height: 1.55),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 14),
                  ],
                  if (c.niches.isNotEmpty) ...[
                    Wrap(
                      spacing: 8,
                      runSpacing: 8,
                      children: [for (final n in c.niches) StatusChip(n)],
                    ),
                    const SizedBox(height: 14),
                  ],
                  ProfileReviews(
                    userId: c.id,
                    service: _service,
                    title: 'Reviews from brands',
                    emptyMessage:
                        'No reviews yet. Brands review creators after each '
                        'completed deal on Shor.',
                  ),
                  const SizedBox(height: 28),
                  SafetyLinks(
                    reportLabel: 'Report creator',
                    onReport: () => showReportSheet(
                      context,
                      service: _service,
                      target: ReportTarget.user,
                      targetId: c.id,
                      subject: c.displayName,
                    ),
                    blockLabel: 'Block creator',
                    onBlock: () async {
                      final blocked = await confirmBlock(
                        context,
                        service: _service,
                        userId: c.id,
                        name: c.displayName,
                      );
                      if (blocked && context.mounted) {
                        Navigator.of(context).pop();
                      }
                    },
                  ),
                ],
              ),
            ),
            BottomActions(
              children: [
                OutlineActionButton(
                  label: 'Message',
                  trailingIcon: Icons.chat_bubble_outline,
                  padding: const EdgeInsets.symmetric(
                    horizontal: 18,
                    vertical: 12,
                  ),
                  onPressed: () => _message(context, c),
                ),
                OutlineActionButton(
                  label: 'Save to list',
                  trailingIcon: Icons.bookmark_border,
                  padding: const EdgeInsets.symmetric(
                    horizontal: 18,
                    vertical: 12,
                  ),
                  onPressed: () => showShortlistSheet(
                    context,
                    service: _service,
                    creator: c,
                  ),
                ),
                SolidButton(
                  label: 'Invite to campaign',
                  padding: const EdgeInsets.symmetric(
                    horizontal: 18,
                    vertical: 12,
                  ),
                  onPressed: () => showInviteSheet(
                    context,
                    service: _service,
                    creator: c,
                    campaign: inviteCampaign,
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
