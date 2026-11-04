import 'package:flutter/material.dart';

import '../../backend/marketplace_service.dart';
import '../../utils/format.dart';
import '../../utils/responsive.dart';
import '../../widgets/marketplace_widgets.dart';
import '../../widgets/responsive_grid.dart';
import '../collaboration_page.dart';
import '../shared/invoice_card.dart';

/// Brand side: invoices from creators, to approve or reject.
class PaymentsTab extends StatefulWidget {
  const PaymentsTab({super.key, this.service});

  final MarketplaceService? service;

  @override
  State<PaymentsTab> createState() => _PaymentsTabState();
}

class _PaymentsTabState extends State<PaymentsTab> {
  MarketplaceService get _service => widget.service ?? marketplaceService;
  int _version = 0;
  bool _busy = false;

  Future<void> _decide(Invoice invoice, {required bool approve}) async {
    if (_busy) return;
    if (!approve) {
      final ok = await confirmAction(
        context,
        title: 'Reject invoice ${invoice.number}?',
        message:
            'Tell the creator why in chat so they can send a corrected one.',
        confirmLabel: 'Reject',
      );
      if (!ok) return;
    }
    setState(() => _busy = true);
    try {
      await _service.decideInvoice(invoice.id, approve: approve);
      if (mounted) {
        showToast(context, approve ? 'Invoice approved.' : 'Invoice rejected.');
      }
    } on MarketplaceFailure catch (e) {
      if (mounted) showToast(context, e.message);
    } finally {
      if (mounted) setState(() => _busy = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return PageList(
      maxWidth: 900,
      onRefresh: () async => setState(() => _version++),
      children: [
        const TabHeader(
          title: 'Payments',
          subtitle: 'Invoices creators send when a collaboration is complete.',
        ),
        AsyncView<List<Invoice>>(
          key: ValueKey(_version),
          refresh: marketplaceRevision,
          load: _service.invoices,
          builder: (context, invoices, reload) {
            num total(InvoiceStatus s) => invoices
                .where((i) => i.status == s)
                .fold<num>(0, (sum, i) => sum + i.gross);
            final pending = invoices
                .where((i) => i.status == InvoiceStatus.pending)
                .toList();
            final rest = invoices
                .where((i) => i.status != InvoiceStatus.pending)
                .toList();
            return Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                ResponsiveGrid(
                  columns: context.responsive<int>(1, sm: 3),
                  spacing: 10,
                  children: [
                    MetricTile(
                      label: 'To approve',
                      value: formatMoney(total(InvoiceStatus.pending)),
                      caption:
                          '${pending.length} invoice${pending.length == 1 ? '' : 's'}',
                    ),
                    MetricTile(
                      label: 'Approved',
                      value: formatMoney(total(InvoiceStatus.approved)),
                      caption: 'Due to creators',
                    ),
                    MetricTile(
                      label: 'Paid',
                      value: formatMoney(total(InvoiceStatus.paid)),
                    ),
                  ],
                ),
                const SizedBox(height: 10),
                const Note(
                  'Approving an invoice confirms the amount is due to the creator. '
                  'Paying creators through Shor is not switched on yet.',
                ),
                const SizedBox(height: 18),
                if (invoices.isEmpty)
                  const EmptyState(
                    icon: Icons.receipt_long_outlined,
                    title: 'No invoices yet',
                    message:
                        'Creators send an invoice after you approve their live post.',
                  )
                else ...[
                  if (pending.isNotEmpty) ...[
                    const SectionTitle('Waiting for you'),
                    for (final i in pending) ...[
                      InvoiceCard(
                        invoice: i,
                        brandView: true,
                        onTap: i.collaborationId == null
                            ? null
                            : () => _open(i.collaborationId!),
                        actions: [
                          SmallButton(
                            label: 'Approve',
                            onPressed: () => _decide(i, approve: true),
                          ),
                          SmallButton(
                            label: 'Reject',
                            outlined: true,
                            onPressed: () => _decide(i, approve: false),
                          ),
                        ],
                      ),
                      const SizedBox(height: 10),
                    ],
                    const SizedBox(height: 10),
                  ],
                  if (rest.isNotEmpty) ...[
                    const SectionTitle('History'),
                    for (final i in rest) ...[
                      InvoiceCard(
                        invoice: i,
                        brandView: true,
                        onTap: i.collaborationId == null
                            ? null
                            : () => _open(i.collaborationId!),
                      ),
                      const SizedBox(height: 10),
                    ],
                  ],
                ],
              ],
            );
          },
        ),
      ],
    );
  }

  void _open(String collaborationId) => Navigator.of(context).push(
    MaterialPageRoute<void>(
      builder: (_) => CollaborationPage(
        collaborationId: collaborationId,
        service: widget.service,
      ),
    ),
  );
}
