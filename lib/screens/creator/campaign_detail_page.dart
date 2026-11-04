import 'package:flutter/material.dart';

import '../../backend/marketplace_service.dart';
import '../../theme/app_colors.dart';
import '../../theme/app_text.dart';
import '../../utils/format.dart';
import '../../widgets/app_buttons.dart';
import '../../widgets/marketplace_widgets.dart';
import '../collaboration_page.dart';
import 'discover_campaigns_tab.dart' show CampaignFacts;

/// Creator side: a campaign brief, with Apply or the existing collaboration.
class CampaignDetailPage extends StatelessWidget {
  const CampaignDetailPage({super.key, required this.campaignId, this.service});

  final String campaignId;
  final MarketplaceService? service;

  MarketplaceService get _service => service ?? marketplaceService;

  Future<(Campaign, Collaboration?, CreatorProfileData)> _load() async {
    final campaign = await _service.campaign(campaignId);
    final mine = await _service.myCollaborationFor(campaignId);
    final profile = await _service.myCreatorProfile();
    return (campaign, mine, profile);
  }

  @override
  Widget build(BuildContext context) {
    return ShorPage(
      title: 'Campaign',
      body: AsyncView<(Campaign, Collaboration?, CreatorProfileData)>(
        refresh: marketplaceRevision,
        load: _load,
        builder: (context, data, reload) {
          final (campaign, mine, profile) = data;
          return Column(
            children: [
              Expanded(
                child: PageList(
                  maxWidth: 820,
                  children: CampaignBrief.sections(
                    campaign,
                    creatorProfile: profile,
                  ),
                ),
              ),
              BottomActions(
                children: _actions(context, campaign, mine, profile),
              ),
            ],
          );
        },
      ),
    );
  }

  List<Widget> _actions(
    BuildContext context,
    Campaign campaign,
    Collaboration? mine,
    CreatorProfileData profile,
  ) {
    if (mine != null) {
      return [
        StatusChip(
          mine.status.label(brand: false),
          tone: collabTone(mine.status),
        ),
        SolidButton(
          label: 'View collaboration',
          showArrow: true,
          onPressed: () => Navigator.of(context).push(
            MaterialPageRoute<void>(
              builder: (_) =>
                  CollaborationPage(collaborationId: mine.id, service: service),
            ),
          ),
        ),
      ];
    }
    if (!campaign.acceptingApplications) {
      return [
        Text(
          'Applications are closed',
          style: AppText.sans(size: 14, color: AppColors.textSecondary),
        ),
      ];
    }
    return [
      SolidButton(
        label: 'Apply now',
        showArrow: true,
        onPressed: () async {
          final sent = await showModalBottomSheet<bool>(
            context: context,
            isScrollControlled: true,
            showDragHandle: true,
            backgroundColor: AppColors.bgCard,
            builder: (_) => ApplySheet(
              campaign: campaign,
              profile: profile,
              service: _service,
            ),
          );
          if (sent == true && context.mounted) {
            showToast(
              context,
              'Application sent to ${campaign.brandDisplayName}.',
            );
          }
        },
      ),
    ];
  }
}

/// The parts of a campaign brief, shared by the creator and brand views.
class CampaignBrief {
  CampaignBrief._();

  static List<Widget> sections(
    Campaign c, {
    CreatorProfileData? creatorProfile,
  }) {
    final profile = creatorProfile;
    final belowMinimum =
        profile != null &&
        c.minFollowers > 0 &&
        (profile.followers ?? 0) < c.minFollowers;
    return [
      Row(
        children: [
          Avatar(name: c.brandDisplayName, imageUrl: c.brandLogoUrl, size: 40),
          const SizedBox(width: 12),
          Expanded(
            child: Text(
              c.brandDisplayName,
              style: AppText.sans(size: 15, weight: FontWeight.w600),
            ),
          ),
          if (c.status != CampaignStatus.active)
            StatusChip(c.status.label, tone: campaignTone(c.status)),
        ],
      ),
      const SizedBox(height: 14),
      Text(c.title, style: AppText.heading(28)),
      const SizedBox(height: 8),
      Text(
        c.compensationLabel,
        style: AppText.sans(
          size: 18,
          weight: FontWeight.w700,
          color: AppColors.accent,
        ),
      ),
      Text(
        c.isBarter ? 'You receive the product' : 'Per creator',
        style: AppText.sans(size: 13, color: AppColors.textMuted),
      ),
      const SizedBox(height: 14),
      CampaignFacts(campaign: c),
      const SizedBox(height: 20),
      if (profile != null && !profile.instagramVerified) ...[
        const Note(
          'Connect your Instagram from the Insights tab so brands see verified '
          'follower and engagement numbers on your application.',
          icon: Icons.link,
        ),
        const SizedBox(height: 12),
      ],
      if (belowMinimum) ...[
        Note(
          'This campaign asks for ${formatCompact(c.minFollowers)}+ followers and '
          'you have ${formatCompact(profile.followers ?? 0)}. You can still apply.',
          icon: Icons.people_outline,
        ),
        const SizedBox(height: 12),
      ],
      SectionCard(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const SectionTitle('What to post'),
            InfoRow('Deliverables', deliverablesSummary(c.deliverables)),
            InfoRow('Platform', 'Instagram'),
            InfoRow('Goal', c.objective.label),
            if (c.niche != null) InfoRow('Niche', c.niche!),
            if (c.startDate != null || c.endDate != null)
              InfoRow(
                'Campaign dates',
                '${formatDate(c.startDate)} – ${formatDate(c.endDate)}',
              ),
            if (c.applicationDeadline != null)
              InfoRow('Apply by', formatDate(c.applicationDeadline)),
            if (c.creatorSlots != null)
              InfoRow('Creators wanted', '${c.creatorSlots}'),
            if (c.cities.isNotEmpty) InfoRow('Cities', c.cities.join(', ')),
            if (c.minFollowers > 0)
              InfoRow('Followers', '${formatCompact(c.minFollowers)} or more'),
          ],
        ),
      ),
      if ((c.description ?? '').trim().isNotEmpty) ...[
        const SizedBox(height: 14),
        _textCard('About the campaign', c.description!),
      ],
      if ((c.guidelines ?? '').trim().isNotEmpty) ...[
        const SizedBox(height: 14),
        _textCard('Guidelines', c.guidelines!),
      ],
      if (c.includesProduct && (c.productDetails ?? '').trim().isNotEmpty) ...[
        const SizedBox(height: 14),
        _textCard('Product', c.productDetails!),
      ],
      const SizedBox(height: 14),
      const SectionCard(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            SectionTitle('How it works'),
            _Step(
              1,
              'Apply with a short pitch',
              'Or accept if the brand invited you.',
            ),
            _Step(
              2,
              'Get accepted',
              'The brand confirms the deliverables and amount.',
            ),
            _Step(
              3,
              'Share a draft',
              'The brand approves it or asks for changes.',
            ),
            _Step(
              4,
              'Post on Instagram',
              'Then paste the link to your live post.',
            ),
            _Step(
              5,
              'Get paid',
              'Request payment once the brand approves the post.',
            ),
          ],
        ),
      ),
    ];
  }

  static Widget _textCard(String title, String body) => SectionCard(
    child: Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        SectionTitle(title),
        Text(body.trim(), style: AppText.sans(size: 15, height: 1.55)),
      ],
    ),
  );
}

class _Step extends StatelessWidget {
  const _Step(this.number, this.title, this.detail);

  final int number;
  final String title;
  final String detail;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 6),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            width: 24,
            height: 24,
            alignment: Alignment.center,
            decoration: const BoxDecoration(
              color: AppColors.accentSoft,
              shape: BoxShape.circle,
            ),
            child: Text(
              '$number',
              style: AppText.sans(
                size: 12,
                weight: FontWeight.w700,
                color: AppColors.accent,
              ),
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  style: AppText.sans(size: 14, weight: FontWeight.w600),
                ),
                Text(
                  detail,
                  style: AppText.sans(size: 13, color: AppColors.textSecondary),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

/// Bottom sheet where a creator writes their pitch (and quote).
class ApplySheet extends StatefulWidget {
  const ApplySheet({
    super.key,
    required this.campaign,
    required this.profile,
    required this.service,
  });

  final Campaign campaign;
  final CreatorProfileData profile;
  final MarketplaceService service;

  @override
  State<ApplySheet> createState() => _ApplySheetState();
}

class _ApplySheetState extends State<ApplySheet> {
  final _formKey = GlobalKey<FormState>();
  final _pitch = TextEditingController();
  late final _quote = TextEditingController(
    text:
        (widget.campaign.payoutPerCreator ?? widget.profile.rateMin)
            ?.round()
            .toString() ??
        '',
  );
  bool _busy = false;
  String? _error;

  @override
  void dispose() {
    _pitch.dispose();
    _quote.dispose();
    super.dispose();
  }

  Future<void> _send() async {
    if (_busy || !(_formKey.currentState?.validate() ?? false)) return;
    setState(() {
      _busy = true;
      _error = null;
    });
    try {
      await widget.service.apply(
        widget.campaign.id,
        pitch: _pitch.text,
        quote: widget.campaign.canQuote
            ? num.tryParse(_quote.text.trim())
            : null,
      );
      if (mounted) Navigator.of(context).pop(true);
    } on MarketplaceFailure catch (e) {
      if (mounted) setState(() => _error = e.message);
    } finally {
      if (mounted) setState(() => _busy = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final c = widget.campaign;
    return Padding(
      padding: EdgeInsets.only(bottom: MediaQuery.viewInsetsOf(context).bottom),
      child: SingleChildScrollView(
        padding: const EdgeInsets.fromLTRB(20, 0, 20, 24),
        child: Center(
          child: ConstrainedBox(
            constraints: const BoxConstraints(maxWidth: 560),
            child: Form(
              key: _formKey,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  Text('Apply to ${c.title}', style: AppText.heading(22)),
                  const SizedBox(height: 6),
                  Text(
                    'Tell ${c.brandDisplayName} why you are a good fit. Mention '
                    'your audience, content style and a past brand post if you have one.',
                    style: AppText.sans(
                      size: 14,
                      color: AppColors.textSecondary,
                    ),
                  ),
                  const SizedBox(height: 16),
                  TextFormField(
                    controller: _pitch,
                    minLines: 4,
                    maxLines: 8,
                    maxLength: 3000,
                    enabled: !_busy,
                    decoration: const InputDecoration(
                      labelText: 'Your pitch',
                      alignLabelWithHint: true,
                    ),
                    validator: (v) => (v ?? '').trim().length < 20
                        ? 'Write at least a couple of sentences'
                        : null,
                  ),
                  if (c.canQuote) ...[
                    const SizedBox(height: 8),
                    TextFormField(
                      controller: _quote,
                      enabled: !_busy,
                      keyboardType: TextInputType.number,
                      decoration: InputDecoration(
                        labelText: 'Your price (₹)',
                        helperText: c.payoutPerCreator == null
                            ? 'The brand asked creators to quote.'
                            : 'The brand offers ${formatMoney(c.payoutPerCreator)}. '
                                  'You can quote a different price.',
                      ),
                      validator: (v) {
                        final n = num.tryParse((v ?? '').trim());
                        return n == null || n <= 0 ? 'Enter your price' : null;
                      },
                    ),
                  ] else if (!c.isBarter) ...[
                    const SizedBox(height: 8),
                    Note('Fixed price: ${formatMoney(c.payoutPerCreator)}.'),
                  ],
                  if (_error != null) ...[
                    const SizedBox(height: 12),
                    Text(
                      _error!,
                      style: AppText.sans(
                        size: 14,
                        color: const Color(0xFF9B1C1C),
                      ),
                    ),
                  ],
                  const SizedBox(height: 20),
                  SolidButton(
                    label: _busy ? 'Sending…' : 'Send application',
                    fullWidth: true,
                    onPressed: _send,
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}
