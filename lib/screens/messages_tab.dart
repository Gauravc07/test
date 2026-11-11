import 'dart:async';

import 'package:flutter/material.dart';

import '../backend/marketplace_service.dart';
import '../theme/app_colors.dart';
import '../theme/app_text.dart';
import '../utils/format.dart';
import '../widgets/marketplace_widgets.dart';
import 'chat_page.dart';

/// Conversations with brands (for creators) or creators (for brands).
class MessagesTab extends StatefulWidget {
  const MessagesTab({super.key, this.service});

  final MarketplaceService? service;

  @override
  State<MessagesTab> createState() => _MessagesTabState();
}

class _MessagesTabState extends State<MessagesTab> {
  MarketplaceService get _service => widget.service ?? marketplaceService;
  int _version = 0;
  StreamSubscription<List<AppNotification>>? _notes;
  String? _lastSeen;

  @override
  void initState() {
    super.initState();
    // A new message updates its chat's notification: reload the list so
    // the latest message and unread count show without pulling to refresh.
    _notes = _service.notifications().listen((notes) {
      final seen = [
        for (final n in notes)
          if (n.kind == 'message')
            '${n.id}:${n.createdAt?.millisecondsSinceEpoch}:${n.unread}',
      ].join('|');
      if (_lastSeen != null && seen != _lastSeen && mounted) {
        setState(() => _version++);
      }
      _lastSeen = seen;
    }, onError: (_) {});
  }

  @override
  void dispose() {
    _notes?.cancel();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final me = _service.currentUserId;
    return PageList(
      maxWidth: 820,
      onRefresh: () async => setState(() => _version++),
      children: [
        const TabHeader(
          title: 'Messages',
          subtitle:
              'Agree details, share feedback and keep everything about a campaign in one place.',
        ),
        AsyncView<List<Conversation>>(
          key: ValueKey(_version),
          refresh: marketplaceRevision,
          load: _service.conversations,
          builder: (context, conversations, reload) {
            if (conversations.isEmpty) {
              return const EmptyState(
                icon: Icons.forum_outlined,
                title: 'No conversations yet',
                message:
                    'Start one from a collaboration or a profile using the '
                    'Message button.',
              );
            }
            return Column(
              children: [
                for (final c in conversations) ...[
                  SectionCard(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 16,
                      vertical: 12,
                    ),
                    onTap: () async {
                      await Navigator.of(context).push(
                        MaterialPageRoute<void>(
                          builder: (_) => ChatPage(
                            conversation: c,
                            service: widget.service,
                          ),
                        ),
                      );
                      if (mounted) setState(() => _version++);
                    },
                    child: Row(
                      children: [
                        Avatar(name: c.otherName(me), size: 42),
                        const SizedBox(width: 12),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                c.otherName(me),
                                style: AppText.sans(
                                  size: 15,
                                  weight: c.unread > 0
                                      ? FontWeight.w700
                                      : FontWeight.w600,
                                ),
                              ),
                              Text(
                                c.campaignTitle ?? 'General',
                                maxLines: 1,
                                overflow: TextOverflow.ellipsis,
                                style: AppText.sans(
                                  size: 13,
                                  color: AppColors.textMuted,
                                ),
                              ),
                            ],
                          ),
                        ),
                        Column(
                          crossAxisAlignment: CrossAxisAlignment.end,
                          children: [
                            Text(
                              c.lastMessageAt == null
                                  ? 'New'
                                  : timeAgo(c.lastMessageAt),
                              style: AppText.sans(
                                size: 12,
                                color: AppColors.textMuted,
                              ),
                            ),
                            if (c.unread > 0) ...[
                              const SizedBox(height: 4),
                              StatusChip('${c.unread} new', tone: Tone.info),
                            ],
                          ],
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 8),
                ],
              ],
            );
          },
        ),
      ],
    );
  }
}
