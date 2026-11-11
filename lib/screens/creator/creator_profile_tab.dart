import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

import '../../backend/auth_service.dart';
import '../../backend/marketplace_service.dart';
import '../../config/app_config.dart';
import '../../config/pricing.dart';
import '../../theme/app_colors.dart';
import '../../theme/app_text.dart';
import '../../utils/format.dart';
import '../../utils/responsive.dart';
import '../../widgets/app_buttons.dart';
import '../../widgets/marketplace_widgets.dart';
import '../../widgets/responsive_grid.dart';
import '../media_kit_page.dart';
import '../settings/account_settings.dart';
import '../shared/invoice_card.dart';

/// Creator side: public profile, Instagram status, earnings and log out.
class CreatorProfileTab extends StatelessWidget {
  const CreatorProfileTab({
    super.key,
    required this.account,
    required this.onSignOut,
    this.onOpenInsights,
    this.auth,
    this.service,
  });

  final Account account;
  final VoidCallback onSignOut;

  /// Null when the Instagram Insights tab is switched off.
  final VoidCallback? onOpenInsights;
  final AuthService? auth;
  final MarketplaceService? service;

  MarketplaceService get _service => service ?? marketplaceService;

  Future<(CreatorProfileData, List<Invoice>)> _load() async {
    final profile = await _service.myCreatorProfile();
    final invoices = await _service.invoices();
    return (profile, invoices);
  }

  @override
  Widget build(BuildContext context) {
    return PageList(
      maxWidth: 820,
      children: [
        const TabHeader(
          title: 'Your profile',
          subtitle: 'This is what brands see when they find you.',
        ),
        AsyncView<(CreatorProfileData, List<Invoice>)>(
          load: _load,
          builder: (context, data, reload) {
            final (profile, invoices) = data;
            return Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                if (onOpenInsights != null || profile.instagramVerified) ...[
                  _InstagramStatus(
                    profile: profile,
                    onOpenInsights: onOpenInsights,
                  ),
                  const SizedBox(height: 14),
                ],
                MediaKitCard(profile: profile, service: _service),
                const SizedBox(height: 14),
                // Needs Instagram, which store builds hide until Meta's review.
                if (AppConfig.instagramEnabled ||
                    profile.instagramVerified) ...[
                  AudienceSharingCard(profile: profile, service: _service),
                  const SizedBox(height: 14),
                ],
                _CreatorProfileForm(
                  profile: profile,
                  email: account.email,
                  service: _service,
                ),
                const SizedBox(height: 24),
                _Earnings(invoices: invoices),
                const SizedBox(height: 24),
                AccountSettingsSection(
                  pricingAudience: PlanAudience.creator,
                  auth: auth,
                  marketplace: service,
                  onSignOut: onSignOut,
                ),
              ],
            );
          },
        ),
      ],
    );
  }
}

/// Turn the public media kit on or off, and share or preview its link.
class MediaKitCard extends StatefulWidget {
  const MediaKitCard({super.key, required this.profile, required this.service});

  final CreatorProfileData profile;
  final MarketplaceService service;

  @override
  State<MediaKitCard> createState() => _MediaKitCardState();
}

class _MediaKitCardState extends State<MediaKitCard> {
  bool _busy = false;

  // Kept here so switching doesn't reload the tab (and the profile form).
  late bool _public = widget.profile.mediaKitPublic;

  Future<void> _set(bool public) async {
    if (_busy) return;
    if (public) {
      final ok = await confirmAction(
        context,
        title: 'Make your media kit public?',
        message:
            'Anyone with the link will see your Instagram followers, average '
            'views and reach, audience age, gender and cities, your top recent '
            'posts, your rates and your Shor reviews. You can turn it off at '
            'any time.',
        confirmLabel: 'Make public',
      );
      if (!ok) return;
    }
    setState(() => _busy = true);
    try {
      await widget.service.setMediaKitPublic(public);
      if (mounted) setState(() => _public = public);
      if (mounted) {
        showToast(
          context,
          public
              ? 'Your media kit is live. Share the link with brands.'
              : 'Your media kit is private again.',
        );
      }
    } on MarketplaceFailure catch (e) {
      if (mounted) showToast(context, e.message);
    } finally {
      if (mounted) setState(() => _busy = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final p = widget.profile;
    final handle = (p.handle ?? '').trim();
    final url = handle.isEmpty ? null : mediaKitUrl(handle);
    return SectionCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              const Icon(Icons.badge_outlined, color: AppColors.accent),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Media kit',
                      style: AppText.sans(size: 15, weight: FontWeight.w600),
                    ),
                    Text(
                      _public
                          ? 'Public. Put the link in your bio or send it to brands.'
                          : 'A page with your verified numbers to send brands.',
                      style: AppText.sans(
                        size: 13,
                        color: AppColors.textSecondary,
                      ),
                    ),
                  ],
                ),
              ),
              Switch(
                key: const ValueKey('media-kit-public'),
                value: _public,
                onChanged: url == null || _busy ? null : _set,
              ),
            ],
          ),
          const SizedBox(height: 10),
          if (url == null)
            const Note('Add a Shor handle below to get your media kit link.')
          else ...[
            SelectableText(
              url,
              style: AppText.sans(size: 13, color: AppColors.accent),
            ),
            const SizedBox(height: 10),
            Wrap(
              spacing: 8,
              runSpacing: 8,
              children: [
                SmallButton(
                  label: 'Preview',
                  outlined: true,
                  onPressed: () => Navigator.of(context).push(
                    MaterialPageRoute<void>(
                      builder: (_) =>
                          MediaKitPage(handle: handle, service: widget.service),
                    ),
                  ),
                ),
                if (_public)
                  SmallButton(
                    label: 'Copy link',
                    onPressed: () async {
                      await Clipboard.setData(ClipboardData(text: url));
                      if (context.mounted) showToast(context, 'Link copied.');
                    },
                  ),
              ],
            ),
          ],
          if (!p.instagramVerified && AppConfig.instagramEnabled) ...[
            const SizedBox(height: 10),
            const Note(
              'Connect Instagram so your kit shows verified views, reach and '
              'audience. Without it, brands only see your profile and rates.',
            ),
          ],
        ],
      ),
    );
  }
}

/// Opt in to audience search: brands can filter by, and see, the
/// creator's audience breakdown.
class AudienceSharingCard extends StatefulWidget {
  const AudienceSharingCard({
    super.key,
    required this.profile,
    required this.service,
  });

  final CreatorProfileData profile;
  final MarketplaceService service;

  @override
  State<AudienceSharingCard> createState() => _AudienceSharingCardState();
}

class _AudienceSharingCardState extends State<AudienceSharingCard> {
  late bool _on = widget.profile.shareAudience;
  bool _busy = false;

  Future<void> _set(bool on) async {
    if (_busy) return;
    if (on) {
      final ok = await confirmAction(
        context,
        title: 'Show your audience to brands?',
        message:
            'Signed-in brands will see the share of your followers who are '
            'women, aged 18–34 and in India, and your top cities, and can find '
            'you by them. Never individual followers. Turn it off any time.',
        confirmLabel: 'Show my audience',
      );
      if (!ok) return;
    }
    setState(() => _busy = true);
    try {
      await widget.service.setShareAudience(on);
      if (!mounted) return;
      setState(() => _on = on);
      showToast(
        context,
        on
            ? 'Brands can now find you by your audience.'
            : 'Your audience is private again.',
      );
    } on MarketplaceFailure catch (e) {
      if (mounted) showToast(context, e.message);
    } finally {
      if (mounted) setState(() => _busy = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final connected = widget.profile.instagramVerified;
    return SectionCard(
      child: Row(
        children: [
          const Icon(Icons.groups_outlined, color: AppColors.accent),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Audience search',
                  style: AppText.sans(size: 15, weight: FontWeight.w600),
                ),
                Text(
                  !connected
                      ? 'Connect Instagram first. Brands can then find you by who follows you.'
                      : _on
                      ? 'On. Brands looking for your audience can find you.'
                      : 'Let brands find you by who follows you, e.g. women 18–34 in Pune.',
                  style: AppText.sans(size: 13, color: AppColors.textSecondary),
                ),
              ],
            ),
          ),
          Switch(
            key: const ValueKey('share-audience'),
            value: _on,
            onChanged: !connected || _busy ? null : _set,
          ),
        ],
      ),
    );
  }
}

class _InstagramStatus extends StatelessWidget {
  const _InstagramStatus({required this.profile, this.onOpenInsights});

  final CreatorProfileData profile;
  final VoidCallback? onOpenInsights;

  @override
  Widget build(BuildContext context) {
    final connected = profile.instagramVerified;
    return SectionCard(
      child: Row(
        children: [
          Icon(
            connected ? Icons.verified : Icons.link_off,
            color: connected ? AppColors.accent : AppColors.textMuted,
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  connected
                      ? 'Instagram connected · ${atHandle(profile.instagramHandle ?? '')}'
                      : 'Instagram not connected',
                  style: AppText.sans(size: 15, weight: FontWeight.w600),
                ),
                Text(
                  connected
                      ? '${formatCompact(profile.followers)} followers. Brands see '
                            'these as verified numbers.'
                      : 'Connect it so brands see verified followers and engagement.',
                  style: AppText.sans(size: 13, color: AppColors.textSecondary),
                ),
              ],
            ),
          ),
          if (!connected && onOpenInsights != null)
            SmallButton(label: 'Connect', onPressed: onOpenInsights!),
        ],
      ),
    );
  }
}

class _CreatorProfileForm extends StatefulWidget {
  const _CreatorProfileForm({
    required this.profile,
    required this.email,
    required this.service,
  });

  final CreatorProfileData profile;
  final String email;
  final MarketplaceService service;

  @override
  State<_CreatorProfileForm> createState() => _CreatorProfileFormState();
}

class _CreatorProfileFormState extends State<_CreatorProfileForm> {
  final _formKey = GlobalKey<FormState>();
  late final _name = TextEditingController(text: widget.profile.fullName);
  late final _handle = TextEditingController(
    text: widget.profile.handle ?? widget.profile.instagramHandle ?? '',
  );
  late final _bio = TextEditingController(text: widget.profile.bio ?? '');
  late final _city = TextEditingController(text: widget.profile.location ?? '');
  late final _rateMin = TextEditingController(
    text: widget.profile.rateMin?.round().toString() ?? '',
  );
  late final _rateMax = TextEditingController(
    text: widget.profile.rateMax?.round().toString() ?? '',
  );
  late final Set<String> _niches = {...widget.profile.niches};
  bool _busy = false;

  @override
  void dispose() {
    for (final c in [_name, _handle, _bio, _city, _rateMin, _rateMax]) {
      c.dispose();
    }
    super.dispose();
  }

  Future<void> _save() async {
    if (_busy || !(_formKey.currentState?.validate() ?? false)) return;
    setState(() => _busy = true);
    try {
      await widget.service.saveCreatorProfile(
        CreatorProfileData(
          fullName: _name.text,
          handle: _handle.text,
          bio: _bio.text,
          niches: _niches.toList(),
          location: _city.text,
          rateMin: num.tryParse(_rateMin.text.trim()),
          rateMax: num.tryParse(_rateMax.text.trim()),
        ),
      );
      if (mounted) showToast(context, 'Profile saved.');
    } on MarketplaceFailure catch (e) {
      if (mounted) showToast(context, e.message);
    } finally {
      if (mounted) setState(() => _busy = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final twoUp = context.isSm;
    Widget pair(Widget a, Widget b) => twoUp
        ? Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Expanded(child: a),
              const SizedBox(width: 12),
              Expanded(child: b),
            ],
          )
        : Column(children: [a, const SizedBox(height: 14), b]);

    return SectionCard(
      child: Form(
        key: _formKey,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            const SectionTitle('Public profile'),
            pair(
              TextFormField(
                controller: _name,
                decoration: const InputDecoration(labelText: 'Full name'),
                validator: (v) =>
                    (v ?? '').trim().isEmpty ? 'Enter your name' : null,
              ),
              TextFormField(
                controller: _handle,
                decoration: const InputDecoration(
                  labelText: 'Handle',
                  helperText: 'Usually your Instagram username',
                  prefixText: '@',
                ),
                validator: (v) {
                  final value = (v ?? '').trim().replaceFirst('@', '');
                  if (value.isEmpty) return null;
                  return RegExp(r'^[A-Za-z0-9._]{2,30}$').hasMatch(value)
                      ? null
                      : 'Letters, numbers, dots and underscores only';
                },
              ),
            ),
            const SizedBox(height: 14),
            TextFormField(
              controller: _bio,
              minLines: 3,
              maxLines: 6,
              maxLength: 1000,
              decoration: const InputDecoration(
                labelText: 'Bio',
                hintText:
                    'What you create, who your audience is, brands you have worked with',
                alignLabelWithHint: true,
              ),
            ),
            const SizedBox(height: 6),
            Text('NICHES (UP TO 5)', style: AppText.label()),
            const SizedBox(height: 8),
            Wrap(
              spacing: 8,
              runSpacing: 8,
              children: [
                for (final n in niches)
                  FilterChip(
                    label: Text(n),
                    selected: _niches.contains(n),
                    onSelected: (on) => setState(() {
                      if (!on) {
                        _niches.remove(n);
                      } else if (_niches.length < 5) {
                        _niches.add(n);
                      } else {
                        showToast(context, 'Pick up to 5 niches.');
                      }
                    }),
                  ),
              ],
            ),
            const SizedBox(height: 18),
            TextFormField(
              controller: _city,
              decoration: const InputDecoration(
                labelText: 'City',
                hintText: 'e.g. Pune',
              ),
            ),
            const SizedBox(height: 14),
            pair(
              TextFormField(
                controller: _rateMin,
                keyboardType: TextInputType.number,
                decoration: const InputDecoration(
                  labelText: 'Lowest rate per post (₹)',
                ),
                validator: _amount,
              ),
              TextFormField(
                controller: _rateMax,
                keyboardType: TextInputType.number,
                decoration: const InputDecoration(
                  labelText: 'Highest rate per post (₹)',
                ),
                validator: (v) {
                  final error = _amount(v);
                  if (error != null) return error;
                  final lo = num.tryParse(_rateMin.text.trim());
                  final hi = num.tryParse((v ?? '').trim());
                  return lo != null && hi != null && hi < lo
                      ? 'Must be at least the lowest rate'
                      : null;
                },
              ),
            ),
            const SizedBox(height: 8),
            Text(
              'Signed in as ${widget.email}',
              style: AppText.sans(size: 13, color: AppColors.textMuted),
            ),
            const SizedBox(height: 16),
            Align(
              alignment: Alignment.centerLeft,
              child: SolidButton(
                label: _busy ? 'Saving…' : 'Save profile',
                onPressed: _save,
              ),
            ),
          ],
        ),
      ),
    );
  }

  static String? _amount(String? v) {
    final value = (v ?? '').trim();
    if (value.isEmpty) return null;
    final n = num.tryParse(value);
    return n == null || n < 0 ? 'Enter an amount in rupees' : null;
  }
}

class _Earnings extends StatelessWidget {
  const _Earnings({required this.invoices});

  final List<Invoice> invoices;

  @override
  Widget build(BuildContext context) {
    num total(InvoiceStatus s) => invoices
        .where((i) => i.status == s)
        .fold<num>(0, (sum, i) => sum + i.net);
    final freeLeft =
        (Pricing.creatorFreeDeals -
                invoices
                    .where((i) => i.status != InvoiceStatus.rejected)
                    .length)
            .clamp(0, Pricing.creatorFreeDeals);
    final feeNote = freeLeft > 0
        ? 'Amounts are what you receive. You have $freeLeft of '
              '${Pricing.creatorFreeDeals} free deals left with no Shor fee. '
              'After that, Shor’s fee is ${Pricing.percent(Pricing.creatorFeeRate)}.'
        : 'Amounts are what you receive, after Shor’s '
              '${Pricing.percent(Pricing.creatorFeeRate)} fee.';
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        const SectionTitle('Earnings'),
        ResponsiveGrid(
          columns: context.responsive<int>(1, sm: 3),
          spacing: 10,
          children: [
            MetricTile(
              label: 'Paid',
              value: formatMoney(total(InvoiceStatus.paid)),
              caption: 'Received',
            ),
            MetricTile(
              label: 'Approved',
              value: formatMoney(total(InvoiceStatus.approved)),
              caption: 'Due to you',
            ),
            MetricTile(
              label: 'Requested',
              value: formatMoney(total(InvoiceStatus.pending)),
              caption: 'Awaiting brand approval',
            ),
          ],
        ),
        const SizedBox(height: 10),
        Note(feeNote),
        const SizedBox(height: 12),
        if (invoices.isEmpty)
          const EmptyState(
            icon: Icons.receipt_long_outlined,
            title: 'No invoices yet',
            message:
                'When a brand approves your live post, request payment from '
                'the collaboration page.',
          )
        else
          for (final i in invoices) ...[
            InvoiceCard(invoice: i, brandView: false),
            const SizedBox(height: 10),
          ],
      ],
    );
  }
}
