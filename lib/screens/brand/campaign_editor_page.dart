import 'package:flutter/material.dart';

import '../../backend/marketplace_service.dart';
import '../../config/pricing.dart';
import '../../theme/app_colors.dart';
import '../../theme/app_text.dart';
import '../../utils/format.dart';
import '../../utils/responsive.dart';
import '../../widgets/app_buttons.dart';
import '../../widgets/choice_toggle.dart';
import '../../widgets/marketplace_widgets.dart';

/// Brand side: write or edit a campaign brief. Pops with the saved
/// [Campaign].
class CampaignEditorPage extends StatefulWidget {
  const CampaignEditorPage({super.key, this.campaign, this.service});

  /// Null for a new campaign.
  final Campaign? campaign;
  final MarketplaceService? service;

  @override
  State<CampaignEditorPage> createState() => _CampaignEditorPageState();
}

class _CampaignEditorPageState extends State<CampaignEditorPage> {
  MarketplaceService get _service => widget.service ?? marketplaceService;

  final _formKey = GlobalKey<FormState>();
  late final CampaignDraft _d = widget.campaign == null
      ? CampaignDraft()
      : CampaignDraft.fromCampaign(widget.campaign!);

  late final _title = TextEditingController(text: _d.title);
  late final _description = TextEditingController(text: _d.description);
  late final _guidelines = TextEditingController(text: _d.guidelines);
  late final _landing = TextEditingController(text: _d.landingUrl);
  late final _product = TextEditingController(text: _d.productDetails);
  late final _payout = TextEditingController(
    text: _d.payoutPerCreator?.round().toString() ?? '',
  );
  late final _budget = TextEditingController(
    text: widget.campaign == null ? '' : _d.budget?.round().toString() ?? '',
  );
  late final _slots = TextEditingController(
    text: _d.creatorSlots?.toString() ?? '',
  );
  late final _minFollowers = TextEditingController(
    text: _d.minFollowers == 0 ? '' : _d.minFollowers.toString(),
  );
  late final _cities = TextEditingController(text: _d.cities.join(', '));

  bool _busy = false;
  String? _error;

  bool get _isNew => widget.campaign == null;
  bool get _isDraft =>
      _isNew || widget.campaign!.status == CampaignStatus.draft;

  @override
  void dispose() {
    for (final c in [
      _title,
      _description,
      _guidelines,
      _landing,
      _product,
      _payout,
      _budget,
      _slots,
      _minFollowers,
      _cities,
    ]) {
      c.dispose();
    }
    super.dispose();
  }

  Future<void> _save({required bool publish}) async {
    if (_busy) return;
    setState(() => _error = null);
    final valid = _formKey.currentState?.validate() ?? false;
    final hasDeliverables = _d.deliverables.values.any((n) => n > 0);
    final datesOk =
        _d.startDate == null ||
        _d.endDate == null ||
        !_d.endDate!.isBefore(_d.startDate!);
    if (!hasDeliverables) {
      setState(() => _error = 'Add at least one thing for creators to post.');
      return;
    }
    if (!datesOk) {
      setState(() => _error = 'The end date must be after the start date.');
      return;
    }
    if (!valid) {
      setState(() => _error = 'Check the highlighted fields.');
      return;
    }

    _d
      ..title = _title.text
      ..description = _description.text
      ..guidelines = _guidelines.text
      ..landingUrl = _landing.text
      ..productDetails = _product.text
      ..payoutPerCreator = num.tryParse(_payout.text.trim())
      ..budget = num.tryParse(_budget.text.trim())
      ..creatorSlots = int.tryParse(_slots.text.trim())
      ..minFollowers = int.tryParse(_minFollowers.text.trim()) ?? 0
      ..cities = [
        for (final c in _cities.text.split(','))
          if (c.trim().isNotEmpty) c.trim(),
      ];

    setState(() => _busy = true);
    try {
      final saved = await _service.saveCampaign(
        _d,
        id: widget.campaign?.id,
        status: publish
            ? CampaignStatus.active
            : (_isNew ? CampaignStatus.draft : null),
      );
      if (!mounted) return;
      showToast(
        context,
        publish
            ? 'Campaign published.'
            : (_isNew ? 'Draft saved.' : 'Changes saved.'),
      );
      Navigator.of(context).pop(saved);
    } on MarketplaceFailure catch (e) {
      if (mounted) setState(() => _error = e.message);
    } finally {
      if (mounted) setState(() => _busy = false);
    }
  }

  String? _optionalNumber(String? v, {int? min, int? max, bool whole = false}) {
    final value = (v ?? '').trim();
    if (value.isEmpty) return null;
    final n = whole ? int.tryParse(value) : num.tryParse(value);
    if (n == null) return whole ? 'Enter a whole number' : 'Enter a number';
    if (min != null && n < min) return 'Must be at least $min';
    if (max != null && n > max) return 'Must be at most $max';
    return null;
  }

  @override
  Widget build(BuildContext context) {
    final barter = _d.compensation == CompensationType.barter;
    final product = _d.compensation != CompensationType.paid;
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

    return ShorPage(
      title: _isNew ? 'New campaign' : 'Edit campaign',
      bottomBar: BottomActions(
        children: [
          if (_error != null)
            Padding(
              padding: const EdgeInsets.only(top: 10),
              child: Text(
                _error!,
                style: AppText.sans(size: 14, color: const Color(0xFF9B1C1C)),
              ),
            ),
          if (_isDraft) ...[
            OutlineActionButton(
              label: 'Save draft',
              padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 12),
              onPressed: () => _save(publish: false),
            ),
            SolidButton(
              label: _busy ? 'Saving…' : 'Publish',
              padding: const EdgeInsets.symmetric(horizontal: 22, vertical: 12),
              onPressed: () => _save(publish: true),
            ),
          ] else
            SolidButton(
              label: _busy ? 'Saving…' : 'Save changes',
              padding: const EdgeInsets.symmetric(horizontal: 22, vertical: 12),
              onPressed: () => _save(publish: false),
            ),
        ],
      ),
      // A plain scroll view (not a lazy list) so every field validates.
      body: SingleChildScrollView(
        padding: const EdgeInsets.fromLTRB(16, 24, 16, 40),
        child: Center(
          child: ConstrainedBox(
            constraints: const BoxConstraints(maxWidth: 760),
            child: Form(
              key: _formKey,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  _section('The basics', [
                    TextFormField(
                      controller: _title,
                      maxLength: 200,
                      decoration: const InputDecoration(
                        labelText: 'Campaign name',
                        hintText: 'e.g. Monsoon skincare reels',
                      ),
                      validator: (v) => (v ?? '').trim().isEmpty
                          ? 'Give the campaign a name'
                          : null,
                    ),
                    const SizedBox(height: 4),
                    TextFormField(
                      controller: _description,
                      minLines: 3,
                      maxLines: 8,
                      maxLength: 5000,
                      decoration: const InputDecoration(
                        labelText: 'What is the campaign about?',
                        hintText:
                            'The product, the story you want told, and the audience',
                        alignLabelWithHint: true,
                      ),
                    ),
                    const SizedBox(height: 4),
                    pair(
                      DropdownButtonFormField<CampaignObjective>(
                        initialValue: _d.objective,
                        decoration: const InputDecoration(labelText: 'Goal'),
                        items: [
                          for (final o in CampaignObjective.values)
                            DropdownMenuItem(value: o, child: Text(o.label)),
                        ],
                        onChanged: (v) =>
                            setState(() => _d.objective = v ?? _d.objective),
                      ),
                      DropdownButtonFormField<String?>(
                        initialValue: _d.niche,
                        decoration: const InputDecoration(labelText: 'Niche'),
                        items: [
                          const DropdownMenuItem<String?>(
                            value: null,
                            child: Text('Any niche'),
                          ),
                          for (final n in niches)
                            DropdownMenuItem<String?>(value: n, child: Text(n)),
                        ],
                        onChanged: (v) => setState(() => _d.niche = v),
                      ),
                    ),
                  ]),
                  _section('What creators will post on Instagram', [
                    for (final e in deliverableTypes.entries)
                      _Counter(
                        label: e.value.$2,
                        value: _d.deliverables[e.key] ?? 0,
                        onChanged: (n) =>
                            setState(() => _d.deliverables[e.key] = n),
                      ),
                    const SizedBox(height: 12),
                    TextFormField(
                      controller: _guidelines,
                      minLines: 3,
                      maxLines: 8,
                      maxLength: 5000,
                      decoration: const InputDecoration(
                        labelText: 'Guidelines',
                        hintText:
                            'Must-haves, things to avoid, hashtags, accounts to tag, '
                            'links, the #ad disclosure…',
                        alignLabelWithHint: true,
                      ),
                    ),
                    const SizedBox(height: 12),
                    TextFormField(
                      key: const ValueKey('landing-url'),
                      controller: _landing,
                      keyboardType: TextInputType.url,
                      decoration: const InputDecoration(
                        labelText: 'Landing page (optional)',
                        hintText: 'https://yourstore.com/products/serum',
                        helperText:
                            'Each creator gets a tracked link to this page, so you '
                            'see clicks and sales per creator.',
                        helperMaxLines: 2,
                      ),
                      validator: (v) {
                        final t = v?.trim() ?? '';
                        if (t.isEmpty) return null;
                        final u = Uri.tryParse(t);
                        return u != null &&
                                u.scheme == 'https' &&
                                u.host.contains('.')
                            ? null
                            : 'Enter a full https:// link';
                      },
                    ),
                  ]),
                  _section('What you offer', [
                    ChoiceToggle<CompensationType>(
                      options: {
                        for (final t in CompensationType.values) t: t.label,
                      },
                      selected: _d.compensation,
                      onChanged: (v) => setState(() => _d.compensation = v),
                    ),
                    const SizedBox(height: 16),
                    if (!barter) ...[
                      TextFormField(
                        controller: _payout,
                        keyboardType: TextInputType.number,
                        decoration: InputDecoration(
                          labelText: 'Payment per creator (₹)',
                          helperText: _d.acceptsQuotes
                              ? 'Optional when creators can quote their price'
                              : null,
                        ),
                        validator: (v) {
                          final value = (v ?? '').trim();
                          if (value.isEmpty) {
                            return _d.acceptsQuotes
                                ? null
                                : 'Enter the payment, or let creators quote';
                          }
                          return _optionalNumber(value, min: 0);
                        },
                      ),
                      const SizedBox(height: 8),
                      ValueListenableBuilder<TextEditingValue>(
                        valueListenable: _payout,
                        builder: (context, value, _) {
                          final amount = num.tryParse(value.text.trim());
                          return Note(campaignCostNote(amount));
                        },
                      ),
                      SwitchListTile(
                        contentPadding: EdgeInsets.zero,
                        title: const Text('Let creators quote their own price'),
                        subtitle: const Text(
                          'They can propose a different amount when they apply.',
                        ),
                        value: _d.acceptsQuotes,
                        onChanged: (v) => setState(() => _d.acceptsQuotes = v),
                      ),
                    ],
                    if (barter) const Note(barterFeeNote),
                    if (product) ...[
                      const SizedBox(height: 8),
                      TextFormField(
                        controller: _product,
                        minLines: 2,
                        maxLines: 5,
                        maxLength: 2000,
                        decoration: const InputDecoration(
                          labelText: 'Product details',
                          hintText:
                              'What creators receive, its value, and how it is delivered',
                          alignLabelWithHint: true,
                        ),
                        validator: (v) => (v ?? '').trim().isEmpty
                            ? 'Describe the product creators receive'
                            : null,
                      ),
                    ],
                  ]),
                  _section('Who can take part', [
                    ChoiceToggle<CampaignVisibility>(
                      options: const {
                        CampaignVisibility.open: 'Open to applications',
                        CampaignVisibility.inviteOnly: 'Invite only',
                      },
                      selected: _d.visibility,
                      onChanged: (v) => setState(() => _d.visibility = v),
                    ),
                    const SizedBox(height: 6),
                    Text(
                      _d.visibility == CampaignVisibility.open
                          ? 'Creators can find this campaign and apply. You can also invite creators.'
                          : 'Only creators you invite can see this campaign.',
                      style: AppText.sans(
                        size: 13,
                        color: AppColors.textSecondary,
                      ),
                    ),
                    const SizedBox(height: 16),
                    pair(
                      TextFormField(
                        controller: _slots,
                        keyboardType: TextInputType.number,
                        decoration: const InputDecoration(
                          labelText: 'Creators needed',
                          helperText: 'Leave empty for no limit',
                        ),
                        validator: (v) =>
                            _optionalNumber(v, min: 1, max: 1000, whole: true),
                      ),
                      TextFormField(
                        controller: _minFollowers,
                        keyboardType: TextInputType.number,
                        decoration: const InputDecoration(
                          labelText: 'Minimum followers',
                          helperText: 'Shown to creators as a guide',
                        ),
                        validator: (v) =>
                            _optionalNumber(v, min: 0, whole: true),
                      ),
                    ),
                    const SizedBox(height: 14),
                    TextFormField(
                      controller: _cities,
                      decoration: const InputDecoration(
                        labelText: 'Cities (optional)',
                        hintText: 'e.g. Mumbai, Pune',
                        helperText:
                            'For local campaigns. Separate with commas.',
                      ),
                    ),
                    const SizedBox(height: 14),
                    _DateField(
                      label: 'Apply by',
                      value: _d.applicationDeadline,
                      onChanged: (d) =>
                          setState(() => _d.applicationDeadline = d),
                    ),
                  ]),
                  _section('Timeline and budget', [
                    pair(
                      _DateField(
                        label: 'Campaign starts',
                        value: _d.startDate,
                        onChanged: (d) => setState(() => _d.startDate = d),
                      ),
                      _DateField(
                        label: 'Campaign ends',
                        value: _d.endDate,
                        onChanged: (d) => setState(() => _d.endDate = d),
                      ),
                    ),
                    const SizedBox(height: 14),
                    TextFormField(
                      controller: _budget,
                      keyboardType: TextInputType.number,
                      decoration: const InputDecoration(
                        labelText: 'Total budget (₹, optional)',
                        helperText:
                            'Private to you. Defaults to payment × creators needed.',
                      ),
                      validator: (v) => _optionalNumber(v, min: 0),
                    ),
                  ]),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }

  Widget _section(String title, List<Widget> children) => Padding(
    padding: const EdgeInsets.only(bottom: 16),
    child: SectionCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [SectionTitle(title), ...children],
      ),
    ),
  );
}

class _Counter extends StatelessWidget {
  const _Counter({
    required this.label,
    required this.value,
    required this.onChanged,
  });

  final String label;
  final int value;
  final ValueChanged<int> onChanged;

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Expanded(child: Text(label, style: AppText.sans(size: 15))),
        IconButton(
          tooltip: 'Fewer $label',
          onPressed: value > 0 ? () => onChanged(value - 1) : null,
          icon: const Icon(Icons.remove_circle_outline),
        ),
        SizedBox(
          width: 28,
          child: Text(
            '$value',
            textAlign: TextAlign.center,
            style: AppText.sans(size: 16, weight: FontWeight.w700),
          ),
        ),
        IconButton(
          tooltip: 'More $label',
          onPressed: value < 20 ? () => onChanged(value + 1) : null,
          icon: const Icon(Icons.add_circle_outline),
        ),
      ],
    );
  }
}

class _DateField extends StatelessWidget {
  const _DateField({
    required this.label,
    required this.value,
    required this.onChanged,
  });

  final String label;
  final DateTime? value;
  final ValueChanged<DateTime?> onChanged;

  Future<void> _pick(BuildContext context) async {
    final now = DateTime.now();
    final picked = await showDatePicker(
      context: context,
      initialDate: value ?? now,
      firstDate: DateTime(now.year - 1),
      lastDate: DateTime(now.year + 3),
    );
    if (picked != null) onChanged(picked);
  }

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: () => _pick(context),
      borderRadius: BorderRadius.circular(6),
      child: InputDecorator(
        decoration: InputDecoration(
          labelText: label,
          suffixIcon: value == null
              ? const Icon(Icons.event_outlined)
              : IconButton(
                  tooltip: 'Clear $label',
                  icon: const Icon(Icons.close),
                  onPressed: () => onChanged(null),
                ),
        ),
        child: Text(
          value == null ? 'Not set' : formatDate(value),
          style: AppText.sans(
            size: 15,
            color: value == null ? AppColors.textMuted : AppColors.textPrimary,
          ),
        ),
      ),
    );
  }
}

/// What one creator costs the brand, for the payout preview.
String campaignCostNote(num? amount) {
  if (amount == null || amount <= 0) {
    return 'Brands pay the creator’s fee plus '
        '${Pricing.percent(Pricing.brandFeeRate)} Shor Protection and GST on '
        'that fee. No other charges.';
  }
  final q = DealQuote.of(amount);
  return 'Each creator costs you ${formatMoney(q.brandPays)} in total: '
      '${formatMoney(q.amount)} to the creator + ${formatMoney(q.brandFee)} '
      'Shor Protection + ${formatMoney(q.brandFeeGst)} GST.';
}

const barterFeeNote = Pricing.barterFeeWaived
    ? 'Barter campaigns are free during early access. Later they cost a flat '
          '₹${Pricing.barterCampaignFee} per campaign.'
    : 'Barter campaigns cost a flat ₹${Pricing.barterCampaignFee} per campaign.';
