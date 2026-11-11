import 'dart:math';

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

import '../../backend/marketplace_service.dart';
import '../../theme/app_colors.dart';
import '../../theme/app_text.dart';
import '../../utils/format.dart';
import '../../widgets/app_buttons.dart';
import '../../widgets/marketplace_widgets.dart';

/// Brand account: connect Shopify or WooCommerce so orders made with a
/// creator's code or link are credited to that creator.
class StoreConnectionsSection extends StatelessWidget {
  const StoreConnectionsSection({super.key, required this.service});

  final MarketplaceService service;

  Future<void> _connect(
    BuildContext context,
    StorePlatform platform, [
    StoreConnection? existing,
  ]) => showModalBottomSheet<void>(
    context: context,
    isScrollControlled: true,
    showDragHandle: true,
    builder: (_) => ConnectStoreSheet(
      platform: platform,
      existing: existing,
      service: service,
    ),
  );

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        const SectionTitle('Store connection'),
        AsyncView<List<StoreConnection>>(
          refresh: marketplaceRevision,
          load: service.storeConnections,
          builder: (context, stores, reload) {
            final connected = {for (final s in stores) s.platform};
            return SectionCard(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'See sales per creator',
                    style: AppText.sans(size: 16, weight: FontWeight.w600),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    'Connect your store and every order made with a creator’s '
                    'discount code or tracked link is credited to them, so your '
                    'campaign report shows orders, revenue and return on spend. '
                    'Other orders are ignored, not stored.',
                    style: AppText.sans(
                      size: 14,
                      color: AppColors.textSecondary,
                    ),
                  ),
                  for (final s in stores) ...[
                    const SizedBox(height: 14),
                    _StoreTile(
                      store: s,
                      onEdit: () => _connect(context, s.platform, s),
                      onRemove: () async {
                        final ok = await confirmAction(
                          context,
                          title: 'Disconnect ${s.platform.label}?',
                          message:
                              'New orders stop being credited to creators. Orders '
                              'already credited stay in your reports. Delete the '
                              'webhook in your store settings too.',
                          confirmLabel: 'Disconnect',
                        );
                        if (!ok) return;
                        try {
                          await service.deleteStoreConnection(s.id);
                        } on MarketplaceFailure catch (e) {
                          if (context.mounted) showToast(context, e.message);
                        }
                      },
                    ),
                  ],
                  const SizedBox(height: 14),
                  Wrap(
                    spacing: 8,
                    runSpacing: 8,
                    children: [
                      for (final p in StorePlatform.values)
                        if (!connected.contains(p))
                          SmallButton(
                            label: 'Connect ${p.label}',
                            outlined: stores.isNotEmpty,
                            onPressed: () => _connect(context, p),
                          ),
                    ],
                  ),
                ],
              ),
            );
          },
        ),
      ],
    );
  }
}

class _StoreTile extends StatelessWidget {
  const _StoreTile({
    required this.store,
    required this.onEdit,
    required this.onRemove,
  });

  final StoreConnection store;
  final VoidCallback onEdit;
  final VoidCallback onRemove;

  @override
  Widget build(BuildContext context) {
    final s = store;
    final status = s.lastOrderAt == null
        ? 'Waiting for the first order'
        : 'Last order ${timeAgo(s.lastOrderAt)} · ${s.ordersMatched} of '
              '${s.ordersReceived} credited to creators';
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: AppColors.fill,
        borderRadius: BorderRadius.circular(16),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              const Icon(Icons.storefront_outlined, color: AppColors.navy),
              const SizedBox(width: 10),
              Expanded(
                child: Text(
                  '${s.platform.label} · ${s.storeUrl}',
                  overflow: TextOverflow.ellipsis,
                  style: AppText.sans(size: 15, weight: FontWeight.w600),
                ),
              ),
              StatusChip(
                s.lastOrderAt == null ? 'Connected' : 'Receiving orders',
                tone: s.lastOrderAt == null ? Tone.info : Tone.success,
              ),
            ],
          ),
          const SizedBox(height: 6),
          Text(
            status,
            style: AppText.sans(size: 13, color: AppColors.textSecondary),
          ),
          const SizedBox(height: 10),
          WebhookUrlField(connectionId: s.id),
          const SizedBox(height: 8),
          Wrap(
            spacing: 8,
            children: [
              TextButton(onPressed: onEdit, child: const Text('Setup steps')),
              TextButton(
                onPressed: onRemove,
                style: TextButton.styleFrom(
                  foregroundColor: const Color(0xFF9B1C1C),
                ),
                child: const Text('Disconnect'),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

/// The webhook address to paste into the store, with a copy button.
class WebhookUrlField extends StatelessWidget {
  const WebhookUrlField({super.key, required this.connectionId});

  final String connectionId;

  @override
  Widget build(BuildContext context) {
    final url = storeWebhookUrl(connectionId);
    return Container(
      padding: const EdgeInsets.fromLTRB(12, 6, 4, 6),
      decoration: BoxDecoration(
        color: AppColors.bgCard,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppColors.border),
      ),
      child: Row(
        children: [
          Expanded(
            child: SelectableText(
              url,
              maxLines: 2,
              style: AppText.sans(size: 12, color: AppColors.accent),
            ),
          ),
          IconButton(
            tooltip: 'Copy webhook URL',
            icon: const Icon(Icons.copy, size: 18),
            onPressed: () async {
              await Clipboard.setData(ClipboardData(text: url));
              if (context.mounted) showToast(context, 'Webhook URL copied.');
            },
          ),
        ],
      ),
    );
  }
}

/// Step-by-step setup for one platform. Shopify shows its own signing
/// secret; for WooCommerce, Shor makes one for the brand to paste in.
class ConnectStoreSheet extends StatefulWidget {
  const ConnectStoreSheet({
    super.key,
    required this.platform,
    required this.service,
    this.existing,
  });

  final StorePlatform platform;
  final MarketplaceService service;
  final StoreConnection? existing;

  @override
  State<ConnectStoreSheet> createState() => _ConnectStoreSheetState();
}

class _ConnectStoreSheetState extends State<ConnectStoreSheet> {
  final _form = GlobalKey<FormState>();
  late final _url = TextEditingController(text: widget.existing?.storeUrl);
  late final _secret = TextEditingController(
    text:
        widget.platform == StorePlatform.woocommerce && widget.existing == null
        ? _randomSecret()
        : '',
  );
  StoreConnection? _saved;
  bool _busy = false;

  bool get _shopify => widget.platform == StorePlatform.shopify;

  static String _randomSecret() {
    const chars = 'abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    final r = Random.secure();
    return 'shor_${List.generate(32, (_) => chars[r.nextInt(chars.length)]).join()}';
  }

  @override
  void dispose() {
    _url.dispose();
    _secret.dispose();
    super.dispose();
  }

  Future<void> _save() async {
    if (!(_form.currentState?.validate() ?? false) || _busy) return;
    setState(() => _busy = true);
    try {
      final saved = await widget.service.saveStoreConnection(
        platform: widget.platform,
        storeUrl: _url.text,
        webhookSecret: _secret.text,
      );
      if (mounted) setState(() => _saved = saved);
    } on MarketplaceFailure catch (e) {
      if (mounted) showToast(context, e.message);
    } finally {
      if (mounted) setState(() => _busy = false);
    }
  }

  Widget _step(int n, String text) => Padding(
    padding: const EdgeInsets.only(bottom: 8),
    child: Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        CircleAvatar(
          radius: 11,
          backgroundColor: AppColors.navy,
          child: Text(
            '$n',
            style: AppText.sans(
              size: 12,
              weight: FontWeight.w700,
              color: Colors.white,
            ),
          ),
        ),
        const SizedBox(width: 10),
        Expanded(
          child: Text(text, style: AppText.sans(size: 14, height: 1.45)),
        ),
      ],
    ),
  );

  @override
  Widget build(BuildContext context) {
    final p = widget.platform;
    final saved = _saved ?? widget.existing;
    return Padding(
      padding: EdgeInsets.fromLTRB(
        20,
        0,
        20,
        20 + MediaQuery.viewInsetsOf(context).bottom,
      ),
      child: SingleChildScrollView(
        child: Form(
          key: _form,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              Text('Connect ${p.label}', style: AppText.heading(22)),
              const SizedBox(height: 14),
              if (_shopify) ...[
                _step(
                  1,
                  'In Shopify admin, open Settings → Notifications → Webhooks.',
                ),
                _step(
                  2,
                  'Copy the signing secret shown there ("Your webhooks will be signed with …") and paste it below.',
                ),
              ] else
                _step(
                  1,
                  'Keep this secret. You’ll paste it into WooCommerce in a moment.',
                ),
              const SizedBox(height: 6),
              TextFormField(
                controller: _url,
                decoration: InputDecoration(
                  labelText: 'Store address',
                  hintText: _shopify
                      ? 'yourstore.myshopify.com'
                      : 'yourstore.com',
                ),
                validator: (v) => (v ?? '').trim().length < 4
                    ? 'Enter your store address'
                    : null,
              ),
              const SizedBox(height: 12),
              TextFormField(
                key: const ValueKey('webhook-secret'),
                controller: _secret,
                decoration: InputDecoration(
                  labelText: _shopify
                      ? 'Shopify signing secret'
                      : 'Webhook secret',
                  helperText: widget.existing != null
                      ? 'Saved secrets are never shown. Enter it again to change it.'
                      : null,
                ),
                validator: (v) => (v ?? '').trim().length < 8
                    ? 'Paste the full secret (at least 8 characters)'
                    : null,
              ),
              const SizedBox(height: 16),
              if (saved == null || _saved == null && widget.existing != null)
                SolidButton(
                  label: _busy ? 'Saving…' : 'Save and get webhook URL',
                  onPressed: _save,
                  fullWidth: true,
                ),
              if (saved != null) ...[
                const SizedBox(height: 18),
                Text(
                  'NOW, IN ${p.label.toUpperCase()}',
                  style: AppText.label(),
                ),
                const SizedBox(height: 10),
                if (_shopify) ...[
                  _step(
                    3,
                    'Click "Create webhook". Event: Order creation. Format: JSON. Paste this URL, choose the latest API version, and save:',
                  ),
                  WebhookUrlField(connectionId: saved.id),
                  const SizedBox(height: 10),
                  _step(
                    4,
                    'Create a second webhook with the same URL for the event Order cancellation, so refunded orders stop counting.',
                  ),
                  _step(
                    5,
                    'For each creator, create a discount code in Shopify (Discounts), then add it on their collaboration in Shor.',
                  ),
                ] else ...[
                  _step(
                    2,
                    'In WordPress, open WooCommerce → Settings → Advanced → Webhooks → Add webhook.',
                  ),
                  _step(
                    3,
                    'Topic: Order created. Delivery URL: the URL below. Secret: the secret above. Status: Active. Save.',
                  ),
                  WebhookUrlField(connectionId: saved.id),
                  const SizedBox(height: 10),
                  _step(
                    4,
                    'Add a second webhook, Topic: Order updated, with the same URL and secret, so refunds stop counting.',
                  ),
                  _step(
                    5,
                    'For each creator, create a coupon (Marketing → Coupons), then add it on their collaboration in Shor.',
                  ),
                ],
                const SizedBox(height: 8),
                SolidButton(
                  label: 'Done',
                  fullWidth: true,
                  onPressed: () => Navigator.of(context).pop(),
                ),
              ],
            ],
          ),
        ),
      ),
    );
  }
}
