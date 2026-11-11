import 'package:flutter/material.dart';

import '../backend/marketplace_service.dart';
import '../theme/app_colors.dart';
import '../theme/app_text.dart';
import '../utils/format.dart';
import '../widgets/marketplace_widgets.dart';
import 'chat_page.dart';
import 'collaboration_page.dart';

/// Round bell with the number of unread notifications. Opens the inbox.
class NotificationBell extends StatefulWidget {
  const NotificationBell({super.key, this.service});

  final MarketplaceService? service;

  @override
  State<NotificationBell> createState() => _NotificationBellState();
}

class _NotificationBellState extends State<NotificationBell> {
  // One live subscription for the bell's lifetime, not one per rebuild.
  late final Stream<List<AppNotification>> _stream =
      (widget.service ?? marketplaceService).notifications();

  @override
  Widget build(BuildContext context) {
    return StreamBuilder<List<AppNotification>>(
      stream: _stream,
      builder: (context, snapshot) {
        final unread = (snapshot.data ?? const [])
            .where((n) => n.unread)
            .length;
        final label = unread == 0
            ? 'Notifications'
            : 'Notifications, $unread unread';
        return RoundIconButton(
          key: const ValueKey('notification-bell'),
          icon: Icons.notifications_none,
          tooltip: label,
          onPressed: () => Navigator.of(context).push(
            MaterialPageRoute<void>(
              builder: (_) => NotificationsPage(service: widget.service),
            ),
          ),
          child: Badge(
            isLabelVisible: unread > 0,
            smallSize: 9,
            backgroundColor: const Color(0xFFE5484D),
            child: const Icon(
              Icons.notifications_none,
              size: 22,
              color: AppColors.textPrimary,
            ),
          ),
        );
      },
    );
  }
}

/// Opens what a notification is about and marks it read.
Future<void> openNotification(
  BuildContext context,
  AppNotification n, {
  MarketplaceService? service,
}) async {
  final svc = service ?? marketplaceService;
  if (n.unread) {
    // Best effort: opening still works if this fails.
    svc.markNotificationsRead(n.id).ignore();
  }
  final nav = Navigator.of(context);
  if (n.collaborationId != null) {
    await nav.push(
      MaterialPageRoute<void>(
        builder: (_) => CollaborationPage(
          collaborationId: n.collaborationId!,
          service: service,
        ),
      ),
    );
  } else if (n.conversationId != null) {
    try {
      final conversations = await svc.conversations();
      final match = conversations.where((c) => c.id == n.conversationId);
      if (!context.mounted) return;
      if (match.isEmpty) {
        showToast(context, 'This chat is no longer available.');
        return;
      }
      await nav.push(
        MaterialPageRoute<void>(
          builder: (_) => ChatPage(conversation: match.first, service: service),
        ),
      );
    } on MarketplaceFailure catch (e) {
      if (context.mounted) showToast(context, e.message);
    }
  }
}

/// Everything that needs the signed-in user's attention, newest first.
class NotificationsPage extends StatefulWidget {
  const NotificationsPage({super.key, this.service});

  final MarketplaceService? service;

  @override
  State<NotificationsPage> createState() => _NotificationsPageState();
}

class _NotificationsPageState extends State<NotificationsPage> {
  MarketplaceService get _service => widget.service ?? marketplaceService;
  late final Stream<List<AppNotification>> _stream = _service.notifications();

  Future<void> _open(AppNotification n) =>
      openNotification(context, n, service: widget.service);

  @override
  Widget build(BuildContext context) {
    return StreamBuilder<List<AppNotification>>(
      stream: _stream,
      builder: (context, snapshot) {
        final items = snapshot.data;
        final anyUnread = items?.any((n) => n.unread) ?? false;
        return ShorPage(
          title: 'Notifications',
          actions: [
            if (anyUnread)
              TextButton(
                onPressed: () =>
                    _service.markNotificationsRead().catchError((Object e) {
                      if (context.mounted && e is MarketplaceFailure) {
                        showToast(context, e.message);
                      }
                    }),
                child: const Text('Mark all read'),
              ),
            const SizedBox(width: 8),
          ],
          body: snapshot.hasError
              ? const ErrorPanel(
                  message:
                      'Could not load notifications. Check your connection.',
                )
              : items == null
              ? const Center(child: CircularProgressIndicator())
              : items.isEmpty
              ? const PageList(
                  maxWidth: 720,
                  children: [
                    EmptyState(
                      icon: Icons.notifications_none,
                      title: 'You’re all caught up',
                      message:
                          'Invites, applications, approvals, invoices and '
                          'messages show up here. We also email you if you '
                          'miss one.',
                    ),
                  ],
                )
              : PageList(
                  maxWidth: 720,
                  children: [
                    for (final n in items) ...[
                      _NotificationTile(note: n, onTap: () => _open(n)),
                      const SizedBox(height: 8),
                    ],
                  ],
                ),
        );
      },
    );
  }
}

IconData notificationIcon(String kind) => switch (kind) {
  'invited' => Icons.mail_outline,
  'applied' => Icons.person_add_alt,
  'hired' || 'invite_accepted' => Icons.handshake_outlined,
  'declined' ||
  'invite_declined' ||
  'withdrawn' ||
  'cancelled' => Icons.do_not_disturb_on_outlined,
  'draft_submitted' || 'live_submitted' => Icons.movie_outlined,
  'approved' => Icons.check_circle_outline,
  'changes_requested' => Icons.edit_note,
  'invoice_raised' ||
  'invoice_approved' ||
  'invoice_rejected' ||
  'invoice_paid' => Icons.receipt_long_outlined,
  'message' => Icons.chat_bubble_outline,
  'review_received' => Icons.star_outline,
  'sale' => Icons.shopping_bag_outlined,
  'welcome' => Icons.waving_hand_outlined,
  _ => Icons.notifications_none,
};

class _NotificationTile extends StatelessWidget {
  const _NotificationTile({required this.note, required this.onTap});

  final AppNotification note;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final n = note;
    return Semantics(
      button: true,
      label: n.unread ? 'Unread' : null,
      child: Material(
        color: n.unread ? AppColors.accentSoft : AppColors.bgCard,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(20),
          side: BorderSide(
            color: n.unread ? AppColors.accentSoft : AppColors.border,
          ),
        ),
        clipBehavior: Clip.antiAlias,
        child: InkWell(
          onTap: onTap,
          child: Padding(
            padding: const EdgeInsets.fromLTRB(14, 12, 14, 12),
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Icon(
                  notificationIcon(n.kind),
                  size: 22,
                  color: n.unread ? AppColors.accent : AppColors.textSecondary,
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        n.title,
                        style: AppText.sans(
                          size: 15,
                          weight: n.unread ? FontWeight.w700 : FontWeight.w500,
                        ),
                      ),
                      if ((n.body ?? '').trim().isNotEmpty) ...[
                        const SizedBox(height: 3),
                        Text(
                          n.body!.trim(),
                          maxLines: 2,
                          overflow: TextOverflow.ellipsis,
                          style: AppText.sans(
                            size: 14,
                            color: AppColors.textSecondary,
                          ),
                        ),
                      ],
                      const SizedBox(height: 4),
                      Text(
                        timeAgo(n.createdAt),
                        style: AppText.sans(
                          size: 12,
                          color: AppColors.textMuted,
                        ),
                      ),
                    ],
                  ),
                ),
                if (n.unread)
                  Container(
                    margin: const EdgeInsets.only(top: 6, left: 8),
                    width: 8,
                    height: 8,
                    decoration: const BoxDecoration(
                      color: AppColors.accent,
                      shape: BoxShape.circle,
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
