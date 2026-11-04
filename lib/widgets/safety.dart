import 'package:flutter/material.dart';

import '../backend/marketplace_service.dart';
import '../theme/app_colors.dart';
import '../theme/app_text.dart';
import 'app_buttons.dart';
import 'marketplace_widgets.dart';

/// Lets someone report a campaign, message, collaboration or account.
Future<void> showReportSheet(
  BuildContext context, {
  required MarketplaceService service,
  required ReportTarget target,
  required String targetId,
  required String subject,
}) async {
  final sent = await showModalBottomSheet<bool>(
    context: context,
    isScrollControlled: true,
    showDragHandle: true,
    backgroundColor: AppColors.bgCard,
    builder: (_) => ReportSheet(
      service: service,
      target: target,
      targetId: targetId,
      subject: subject,
    ),
  );
  if (sent == true && context.mounted) {
    showToast(
      context,
      'Thanks for reporting. Shor’s team reviews reports within 24 hours.',
    );
  }
}

/// Asks to confirm, then blocks [userId]. Returns true if blocked.
Future<bool> confirmBlock(
  BuildContext context, {
  required MarketplaceService service,
  required String userId,
  required String name,
}) async {
  final ok = await confirmAction(
    context,
    title: 'Block $name?',
    message:
        '$name won’t be able to message you, invite you or apply to your '
        'campaigns, and you won’t see their profile or campaigns. You can '
        'unblock them any time from your profile.',
    confirmLabel: 'Block',
  );
  if (!ok) return false;
  try {
    await service.block(userId);
    if (context.mounted) showToast(context, '$name is blocked.');
    return true;
  } on MarketplaceFailure catch (e) {
    if (context.mounted) showToast(context, e.message);
    return false;
  }
}

class ReportSheet extends StatefulWidget {
  const ReportSheet({
    super.key,
    required this.service,
    required this.target,
    required this.targetId,
    required this.subject,
  });

  final MarketplaceService service;
  final ReportTarget target;
  final String targetId;

  /// What is being reported, e.g. "this message" or "Acme Skin".
  final String subject;

  @override
  State<ReportSheet> createState() => _ReportSheetState();
}

class _ReportSheetState extends State<ReportSheet> {
  ReportReason? _reason;
  final _details = TextEditingController();
  bool _busy = false;
  String? _error;

  @override
  void dispose() {
    _details.dispose();
    super.dispose();
  }

  Future<void> _send() async {
    if (_busy) return;
    if (_reason == null) {
      setState(() => _error = 'Choose a reason.');
      return;
    }
    setState(() {
      _busy = true;
      _error = null;
    });
    try {
      await widget.service.report(
        widget.target,
        widget.targetId,
        _reason!,
        details: _details.text,
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
    return Padding(
      padding: EdgeInsets.only(bottom: MediaQuery.viewInsetsOf(context).bottom),
      child: SingleChildScrollView(
        padding: const EdgeInsets.fromLTRB(20, 0, 20, 24),
        child: Center(
          child: ConstrainedBox(
            constraints: const BoxConstraints(maxWidth: 560),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                Text('Report ${widget.subject}', style: AppText.heading(22)),
                const SizedBox(height: 6),
                Text(
                  'Reports are private. The person you report is not told who '
                  'reported them.',
                  style: AppText.sans(size: 14, color: AppColors.textSecondary),
                ),
                const SizedBox(height: 16),
                Text('WHAT’S WRONG?', style: AppText.label()),
                const SizedBox(height: 8),
                Wrap(
                  spacing: 8,
                  runSpacing: 8,
                  children: [
                    for (final r in ReportReason.values)
                      ChoiceChip(
                        label: Text(r.label),
                        selected: _reason == r,
                        onSelected: _busy
                            ? null
                            : (_) => setState(() {
                                _reason = r;
                                _error = null;
                              }),
                      ),
                  ],
                ),
                const SizedBox(height: 16),
                TextField(
                  controller: _details,
                  enabled: !_busy,
                  minLines: 2,
                  maxLines: 5,
                  maxLength: 2000,
                  decoration: const InputDecoration(
                    labelText: 'Details (optional)',
                    alignLabelWithHint: true,
                  ),
                ),
                if (_error != null) ...[
                  const SizedBox(height: 8),
                  Text(
                    _error!,
                    style: AppText.sans(
                      size: 14,
                      color: const Color(0xFF9B1C1C),
                    ),
                  ),
                ],
                const SizedBox(height: 16),
                SolidButton(
                  label: _busy ? 'Sending…' : 'Send report',
                  fullWidth: true,
                  onPressed: _send,
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

/// "Report · Block" links shown at the bottom of a page.
class SafetyLinks extends StatelessWidget {
  const SafetyLinks({
    super.key,
    required this.onReport,
    required this.reportLabel,
    this.onBlock,
    this.blockLabel,
  });

  final VoidCallback onReport;
  final String reportLabel;
  final VoidCallback? onBlock;
  final String? blockLabel;

  @override
  Widget build(BuildContext context) {
    final style = AppText.sans(size: 13, color: AppColors.textSecondary);
    return Wrap(
      alignment: WrapAlignment.center,
      crossAxisAlignment: WrapCrossAlignment.center,
      spacing: 4,
      children: [
        TextButton.icon(
          onPressed: onReport,
          icon: const Icon(Icons.flag_outlined, size: 16),
          label: Text(reportLabel, style: style),
        ),
        if (onBlock != null)
          TextButton.icon(
            onPressed: onBlock,
            icon: const Icon(Icons.block, size: 16),
            label: Text(blockLabel ?? 'Block', style: style),
          ),
      ],
    );
  }
}
