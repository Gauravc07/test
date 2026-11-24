import 'package:flutter/material.dart';

import '../../backend/marketplace_service.dart';
import '../../theme/app_colors.dart';
import '../../theme/app_text.dart';
import '../../utils/format.dart';
import '../../widgets/marketplace_widgets.dart';

/// On a hired deal that pays sales commission: what the creator has earned,
/// what's still inside the return window, and (for the creator) a button to
/// invoice the earned commission.
class CommissionCard extends StatefulWidget {
  const CommissionCard({
    super.key,
    required this.collaboration,
    required this.isBrand,
    required this.service,
  });

  final Collaboration collaboration;
  final bool isBrand;
  final MarketplaceService service;

  @override
  State<CommissionCard> createState() => _CommissionCardState();
}

class _CommissionCardState extends State<CommissionCard> {
  bool _busy = false;

  Future<void> _request(CommissionSummary s) async {
    if (_busy) return;
    setState(() => _busy = true);
    try {
      await widget.service.requestCommission(widget.collaboration.id);
      if (mounted) {
        showToast(
          context,
          'Requested ${formatMoney(s.available)}. The brand will review your invoice.',
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
    return AsyncView<CommissionSummary>(
      refresh: marketplaceRevision,
      load: () => widget.service.commissionSummary(widget.collaboration.id),
      builder: (context, s, reload) {
        if (!s.hasCommission) return const SizedBox.shrink();
        Widget stat(String label, String value, String sub) => Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(value, style: AppText.heading(22)),
              Text(
                label,
                style: AppText.sans(size: 12, color: AppColors.textMuted),
              ),
              Text(
                sub,
                style: AppText.sans(size: 11, color: AppColors.textMuted),
              ),
            ],
          ),
        );
        final rate = formatPercent(s.rate!);
        return SectionCard(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              SectionTitle(
                'Sales commission',
                trailing: TagPill('$rate of sales'),
              ),
              Row(
                children: [
                  stat(
                    'Earned',
                    formatMoney(s.earned),
                    '${s.confirmedOrders} order${s.confirmedOrders == 1 ? '' : 's'}',
                  ),
                  stat(
                    'In return window',
                    formatMoney(s.pending),
                    '${s.pendingOrders} order${s.pendingOrders == 1 ? '' : 's'}',
                  ),
                  stat(
                    widget.isBrand ? 'Still to invoice' : 'Ready to request',
                    formatMoney(s.available),
                    '${formatMoney(s.invoiced)} invoiced',
                  ),
                ],
              ),
              const SizedBox(height: 10),
              Text(
                widget.isBrand
                    ? '$rate of each order that used this creator’s link or code. '
                          'Orders count ${s.holdDays} days after purchase, if not '
                          'cancelled. The creator invoices you for what’s earned.'
                    : 'You earn $rate of each order that used your link or code. '
                          'Orders count ${s.holdDays} days after purchase, if not '
                          'cancelled or returned.',
                style: AppText.sans(size: 13, color: AppColors.textSecondary),
              ),
              if (!widget.isBrand) ...[
                const SizedBox(height: 12),
                Opacity(
                  opacity: s.canRequest && !_busy ? 1 : 0.5,
                  child: SmallButton(
                    key: const ValueKey('request-commission'),
                    label: _busy
                        ? 'Requesting…'
                        : s.canRequest
                        ? 'Request ${formatMoney(s.available)}'
                        : 'Nothing to request yet',
                    onPressed: s.canRequest && !_busy
                        ? () => _request(s)
                        : () {},
                  ),
                ),
              ],
            ],
          ),
        );
      },
    );
  }
}
