import 'package:flutter/material.dart';

import '../../backend/marketplace_models.dart';
import '../../theme/app_colors.dart';
import '../../theme/app_text.dart';
import '../../utils/format.dart';
import '../../widgets/marketplace_widgets.dart';

/// An invoice row. Brands see the amount they pay; creators see what they
/// receive after Shor's fee.
class InvoiceCard extends StatelessWidget {
  const InvoiceCard({
    super.key,
    required this.invoice,
    required this.brandView,
    this.actions = const [],
    this.onTap,
  });

  final Invoice invoice;
  final bool brandView;
  final List<Widget> actions;
  final VoidCallback? onTap;

  @override
  Widget build(BuildContext context) {
    final i = invoice;
    String money(num v) => formatMoney(v, currency: i.currency);
    return SectionCard(
      onTap: onTap,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      i.campaignTitle ?? 'Campaign',
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      style: AppText.sans(size: 15, weight: FontWeight.w600),
                    ),
                    Text(
                      [
                        i.number,
                        if (i.counterpartName != null)
                          i.counterpartName!
                        else if ((brandView ? i.creatorId : i.brandId) == null)
                          'Deleted account',
                        formatDate(i.createdAt),
                      ].join(' · '),
                      style: AppText.sans(size: 13, color: AppColors.textMuted),
                    ),
                  ],
                ),
              ),
              const SizedBox(width: 12),
              Column(
                crossAxisAlignment: CrossAxisAlignment.end,
                children: [
                  Text(
                    money(brandView ? i.gross : i.net),
                    style: AppText.sans(size: 16, weight: FontWeight.w700),
                  ),
                  const SizedBox(height: 4),
                  StatusChip(i.status.label, tone: invoiceTone(i.status)),
                ],
              ),
            ],
          ),
          if (!brandView) ...[
            const SizedBox(height: 6),
            Text(
              '${money(i.gross)} invoiced − ${money(i.fee)} Shor fee',
              style: AppText.sans(size: 12, color: AppColors.textMuted),
            ),
          ],
          if ((i.description ?? '').isNotEmpty) ...[
            const SizedBox(height: 4),
            Text(
              i.description!,
              style: AppText.sans(size: 13, color: AppColors.textSecondary),
            ),
          ],
          if (actions.isNotEmpty) ...[
            const SizedBox(height: 12),
            Wrap(spacing: 10, runSpacing: 10, children: actions),
          ],
        ],
      ),
    );
  }
}
