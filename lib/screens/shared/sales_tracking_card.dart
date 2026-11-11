import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

import '../../backend/marketplace_service.dart';
import '../../theme/app_colors.dart';
import '../../theme/app_text.dart';
import '../../utils/format.dart';
import '../../widgets/marketplace_widgets.dart';

/// On a hired collaboration: the creator's tracked link and discount code,
/// and the clicks, orders and revenue they drove. The brand sets the code.
class SalesTrackingCard extends StatelessWidget {
  const SalesTrackingCard({
    super.key,
    required this.collaboration,
    required this.isBrand,
    required this.service,
  });

  final Collaboration collaboration;
  final bool isBrand;
  final MarketplaceService service;

  Future<SalesRow?> _load() async {
    final rows = await service.campaignSales(collaboration.campaignId);
    return rows.where((r) => r.collaborationId == collaboration.id).firstOrNull;
  }

  Future<void> _editCode(BuildContext context, String? current) async {
    final code = await askText(
      context,
      title: current == null
          ? 'Add a discount code'
          : 'Change the discount code',
      label: 'Code, as created in your store',
      hint: 'e.g. RIYA10',
      confirmLabel: 'Save code',
      initial: current,
      required: false,
      maxLines: 1,
    );
    if (code == null || !context.mounted) return;
    final clean = code.trim();
    if (clean.isNotEmpty && !RegExp(r'^[A-Za-z0-9_-]{3,40}$').hasMatch(clean)) {
      showToast(context, 'Use 3–40 letters, numbers, - or _.');
      return;
    }
    try {
      await service.setDiscountCode(collaboration.id, clean);
      if (context.mounted) {
        showToast(
          context,
          clean.isEmpty
              ? 'Discount code removed.'
              : 'Saved. Sales using ${clean.toUpperCase()} now count for this creator.',
        );
      }
    } on MarketplaceFailure catch (e) {
      if (context.mounted) showToast(context, e.message);
    }
  }

  @override
  Widget build(BuildContext context) {
    final landing = collaboration.campaign?.landingUrl;
    return AsyncView<({SalesRow? row})>(
      refresh: marketplaceRevision,
      load: () async => (row: await _load()),
      builder: (context, data, reload) {
        final r = data.row;
        if (r == null) return const SizedBox.shrink();
        final link = r.linkCode == null ? null : trackedLinkUrl(r.linkCode!);
        Widget stat(String label, String value) => Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(value, style: AppText.heading(22)),
              Text(
                label,
                style: AppText.sans(size: 12, color: AppColors.textMuted),
              ),
            ],
          ),
        );
        return SectionCard(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const SectionTitle('Sales tracking'),
              Row(
                children: [
                  stat('clicks', formatCompact(r.clicks)),
                  stat('orders', '${r.orders}'),
                  stat('revenue', formatMoney(r.revenue)),
                ],
              ),
              const SizedBox(height: 14),
              if (link != null)
                _CopyRow(
                  icon: Icons.link,
                  label: 'Tracked link',
                  value: link,
                  hint: isBrand
                      ? 'The creator shares this in their bio, stories or captions.'
                      : 'Put this in your bio, story link sticker or caption.',
                ),
              const SizedBox(height: 10),
              _CopyRow(
                icon: Icons.sell_outlined,
                label: 'Discount code',
                value: r.discountCode,
                empty: isBrand
                    ? 'None yet. Create a code in your store, then add it here.'
                    : 'The brand hasn’t added a code yet.',
                trailing: isBrand
                    ? TextButton(
                        onPressed: () => _editCode(context, r.discountCode),
                        child: Text(r.discountCode == null ? 'Add' : 'Change'),
                      )
                    : null,
              ),
              if (isBrand && (landing ?? '').isEmpty) ...[
                const SizedBox(height: 12),
                const Note(
                  'This link goes to your website. Add a landing page to the '
                  'campaign brief to send people straight to a product.',
                ),
              ],
              if (isBrand) ...[
                const SizedBox(height: 12),
                const Note(
                  'Orders are counted once your store is connected in '
                  'Account → Store connection.',
                  icon: Icons.storefront_outlined,
                ),
              ],
            ],
          ),
        );
      },
    );
  }
}

class _CopyRow extends StatelessWidget {
  const _CopyRow({
    required this.icon,
    required this.label,
    required this.value,
    this.hint,
    this.empty,
    this.trailing,
  });

  final IconData icon;
  final String label;
  final String? value;
  final String? hint;
  final String? empty;
  final Widget? trailing;

  @override
  Widget build(BuildContext context) {
    final v = value;
    return Container(
      padding: const EdgeInsets.fromLTRB(14, 10, 6, 10),
      decoration: BoxDecoration(
        color: AppColors.fill,
        borderRadius: BorderRadius.circular(14),
      ),
      child: Row(
        children: [
          Icon(icon, size: 20, color: AppColors.textSecondary),
          const SizedBox(width: 10),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(label.toUpperCase(), style: AppText.label()),
                const SizedBox(height: 2),
                if (v == null)
                  Text(
                    empty ?? '—',
                    style: AppText.sans(
                      size: 13,
                      color: AppColors.textSecondary,
                    ),
                  )
                else
                  SelectableText(
                    v,
                    style: AppText.sans(size: 14, weight: FontWeight.w600),
                  ),
                if (v != null && hint != null)
                  Text(
                    hint!,
                    style: AppText.sans(size: 12, color: AppColors.textMuted),
                  ),
              ],
            ),
          ),
          if (v != null)
            IconButton(
              tooltip: 'Copy $label',
              icon: const Icon(Icons.copy, size: 18),
              onPressed: () async {
                await Clipboard.setData(ClipboardData(text: v));
                if (context.mounted) showToast(context, '$label copied.');
              },
            ),
          ?trailing,
        ],
      ),
    );
  }
}
