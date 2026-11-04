import 'package:flutter/material.dart';

import '../../backend/marketplace_service.dart';
import '../../theme/app_colors.dart';
import '../../theme/app_text.dart';
import '../../utils/format.dart';
import '../../widgets/app_buttons.dart';
import '../../widgets/marketplace_widgets.dart';

/// Opens the invite form. Returns true when an invitation was sent.
Future<bool> showInviteSheet(
  BuildContext context, {
  required MarketplaceService service,
  required CreatorSummary creator,
  Campaign? campaign,
}) async {
  final sent = await showModalBottomSheet<bool>(
    context: context,
    isScrollControlled: true,
    showDragHandle: true,
    backgroundColor: AppColors.bgCard,
    builder: (_) =>
        InviteSheet(service: service, creator: creator, campaign: campaign),
  );
  if (sent == true && context.mounted) {
    showToast(context, 'Invitation sent to ${creator.displayName}.');
  }
  return sent == true;
}

/// Opens the "save to list" sheet.
Future<void> showShortlistSheet(
  BuildContext context, {
  required MarketplaceService service,
  required CreatorSummary creator,
}) => showModalBottomSheet<void>(
  context: context,
  isScrollControlled: true,
  showDragHandle: true,
  backgroundColor: AppColors.bgCard,
  builder: (_) => ShortlistSheet(service: service, creator: creator),
);

class InviteSheet extends StatefulWidget {
  const InviteSheet({
    super.key,
    required this.service,
    required this.creator,
    this.campaign,
  });

  final MarketplaceService service;
  final CreatorSummary creator;

  /// Preselected campaign; otherwise the brand picks one.
  final Campaign? campaign;

  @override
  State<InviteSheet> createState() => _InviteSheetState();
}

class _InviteSheetState extends State<InviteSheet> {
  final _formKey = GlobalKey<FormState>();
  final _offer = TextEditingController();
  final _message = TextEditingController();
  List<Campaign>? _campaigns;
  Campaign? _selected;
  bool _busy = false;
  String? _error;

  @override
  void initState() {
    super.initState();
    if (widget.campaign != null) {
      _campaigns = [widget.campaign!];
      _select(widget.campaign!);
    } else {
      _loadCampaigns();
    }
  }

  Future<void> _loadCampaigns() async {
    try {
      final all = await widget.service.myCampaigns();
      final usable = all.where((c) => c.canInvite).toList();
      if (!mounted) return;
      setState(() => _campaigns = usable);
      if (usable.isNotEmpty) _select(usable.first);
    } on MarketplaceFailure catch (e) {
      if (mounted) setState(() => _error = e.message);
    }
  }

  void _select(Campaign c) {
    final first = widget.creator.displayName.split(' ').first;
    setState(() {
      _selected = c;
      _offer.text = c.payoutPerCreator?.round().toString() ?? '';
      _message.text =
          'Hi $first, we would love to have you on “${c.title}”. Have a look '
          'at the brief and let us know!';
    });
  }

  @override
  void dispose() {
    _offer.dispose();
    _message.dispose();
    super.dispose();
  }

  Future<void> _send() async {
    final c = _selected;
    if (c == null || _busy || !(_formKey.currentState?.validate() ?? false)) {
      return;
    }
    setState(() {
      _busy = true;
      _error = null;
    });
    try {
      await widget.service.invite(
        c.id,
        widget.creator.id,
        offer: c.isBarter ? null : num.tryParse(_offer.text.trim()),
        message: _message.text,
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
    final campaigns = _campaigns;
    final selected = _selected;
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
                  Text(
                    'Invite ${widget.creator.displayName}',
                    style: AppText.heading(22),
                  ),
                  const SizedBox(height: 16),
                  if (campaigns == null && _error == null)
                    const Padding(
                      padding: EdgeInsets.all(24),
                      child: Center(child: CircularProgressIndicator()),
                    )
                  else if (campaigns != null && campaigns.isEmpty)
                    const Note(
                      'You need a draft, live or paused campaign to invite '
                      'creators. Create one from the Campaigns tab first.',
                    )
                  else if (campaigns != null && selected != null) ...[
                    DropdownButtonFormField<String>(
                      initialValue: selected.id,
                      decoration: const InputDecoration(labelText: 'Campaign'),
                      items: [
                        for (final c in campaigns)
                          DropdownMenuItem(
                            value: c.id,
                            child: Text(
                              c.title,
                              overflow: TextOverflow.ellipsis,
                            ),
                          ),
                      ],
                      onChanged: _busy || widget.campaign != null
                          ? null
                          : (id) => _select(
                              campaigns.firstWhere((c) => c.id == id),
                            ),
                    ),
                    const SizedBox(height: 14),
                    if (selected.isBarter)
                      const Note(
                        'Barter campaign: the creator receives the product.',
                      )
                    else
                      TextFormField(
                        controller: _offer,
                        enabled: !_busy,
                        keyboardType: TextInputType.number,
                        decoration: InputDecoration(
                          labelText: 'Your offer (₹)',
                          helperText: widget.creator.rateMin == null
                              ? null
                              : 'Their usual rate: ${widget.creator.rateLabel}',
                        ),
                        validator: (v) {
                          final value = (v ?? '').trim();
                          if (value.isEmpty) return 'Enter an amount';
                          final n = num.tryParse(value);
                          return n == null || n < 0
                              ? 'Enter an amount in rupees'
                              : null;
                        },
                      ),
                    const SizedBox(height: 14),
                    TextFormField(
                      controller: _message,
                      enabled: !_busy,
                      minLines: 3,
                      maxLines: 6,
                      maxLength: 2000,
                      decoration: const InputDecoration(
                        labelText: 'Message (sent in chat)',
                        alignLabelWithHint: true,
                      ),
                    ),
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
                  const SizedBox(height: 16),
                  if (selected != null)
                    SolidButton(
                      label: _busy ? 'Sending…' : 'Send invitation',
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

class ShortlistSheet extends StatefulWidget {
  const ShortlistSheet({
    super.key,
    required this.service,
    required this.creator,
  });

  final MarketplaceService service;
  final CreatorSummary creator;

  @override
  State<ShortlistSheet> createState() => _ShortlistSheetState();
}

class _ShortlistSheetState extends State<ShortlistSheet> {
  List<Shortlist>? _lists;
  final _name = TextEditingController();
  bool _busy = false;
  String? _error;

  @override
  void initState() {
    super.initState();
    _load();
  }

  @override
  void dispose() {
    _name.dispose();
    super.dispose();
  }

  Future<void> _load() async {
    try {
      final lists = await widget.service.shortlists();
      if (!mounted) return;
      setState(() {
        _lists = lists;
        if (lists.isEmpty && _name.text.isEmpty) _name.text = 'Shortlist';
      });
    } on MarketplaceFailure catch (e) {
      if (mounted) setState(() => _error = e.message);
    }
  }

  Future<void> _run(Future<void> Function() action) async {
    if (_busy) return;
    setState(() {
      _busy = true;
      _error = null;
    });
    try {
      await action();
      await _load();
    } on MarketplaceFailure catch (e) {
      if (mounted) setState(() => _error = e.message);
    } finally {
      if (mounted) setState(() => _busy = false);
    }
  }

  Future<void> _create() async {
    final name = _name.text.trim();
    if (name.isEmpty) return;
    await _run(() async {
      final list = await widget.service.createShortlist(name);
      await widget.service.setShortlisted(list.id, widget.creator.id, true);
      _name.clear();
    });
  }

  @override
  Widget build(BuildContext context) {
    final lists = _lists;
    return Padding(
      padding: EdgeInsets.only(bottom: MediaQuery.viewInsetsOf(context).bottom),
      child: SingleChildScrollView(
        padding: const EdgeInsets.fromLTRB(20, 0, 20, 24),
        child: Center(
          child: ConstrainedBox(
            constraints: const BoxConstraints(maxWidth: 520),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                Text(
                  'Save ${widget.creator.displayName}',
                  style: AppText.heading(22),
                ),
                const SizedBox(height: 4),
                Text(
                  'Lists are private to your brand.',
                  style: AppText.sans(size: 14, color: AppColors.textSecondary),
                ),
                const SizedBox(height: 12),
                if (lists == null && _error == null)
                  const Padding(
                    padding: EdgeInsets.all(24),
                    child: Center(child: CircularProgressIndicator()),
                  )
                else if (lists != null)
                  for (final l in lists)
                    CheckboxListTile(
                      contentPadding: EdgeInsets.zero,
                      title: Text(l.name),
                      subtitle: Text(
                        '${l.creatorIds.length} creator${l.creatorIds.length == 1 ? '' : 's'}',
                      ),
                      value: l.creatorIds.contains(widget.creator.id),
                      onChanged: _busy
                          ? null
                          : (v) => _run(
                              () => widget.service.setShortlisted(
                                l.id,
                                widget.creator.id,
                                v ?? false,
                              ),
                            ),
                    ),
                const SizedBox(height: 12),
                Row(
                  children: [
                    Expanded(
                      child: TextField(
                        controller: _name,
                        enabled: !_busy,
                        maxLength: 120,
                        decoration: const InputDecoration(
                          labelText: 'New list',
                          counterText: '',
                        ),
                        onSubmitted: (_) => _create(),
                      ),
                    ),
                    const SizedBox(width: 10),
                    SmallButton(label: 'Create and save', onPressed: _create),
                  ],
                ),
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
                const SizedBox(height: 8),
                Align(
                  alignment: Alignment.centerRight,
                  child: TextButton(
                    onPressed: () => Navigator.of(context).pop(),
                    child: const Text('Done'),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

/// Followers, engagement and rate in one line of facts.
class CreatorStats extends StatelessWidget {
  const CreatorStats({super.key, required this.creator});

  final CreatorSummary creator;

  @override
  Widget build(BuildContext context) {
    Widget stat(String value, String label) => Text.rich(
      TextSpan(
        children: [
          TextSpan(
            text: value,
            style: AppText.sans(size: 15, weight: FontWeight.w700),
          ),
          TextSpan(
            text: ' $label',
            style: AppText.sans(size: 13, color: AppColors.textSecondary),
          ),
        ],
      ),
    );
    return Wrap(
      spacing: 16,
      runSpacing: 4,
      children: [
        stat(formatCompact(creator.followers), 'followers'),
        if (creator.engagementRate != null)
          stat('${creator.engagementRate!.toStringAsFixed(1)}%', 'engagement'),
        Text(
          creator.rateLabel,
          style: AppText.sans(size: 13, color: AppColors.textSecondary),
        ),
      ],
    );
  }
}
