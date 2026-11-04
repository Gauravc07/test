import 'dart:async';

import 'package:flutter/material.dart';

import '../backend/marketplace_service.dart';
import '../theme/app_colors.dart';
import '../theme/app_text.dart';
import '../utils/format.dart';
import '../widgets/marketplace_widgets.dart';
import '../widgets/safety.dart';

/// A live conversation between a brand and a creator.
class ChatPage extends StatefulWidget {
  const ChatPage({super.key, required this.conversation, this.service});

  final Conversation conversation;
  final MarketplaceService? service;

  @override
  State<ChatPage> createState() => _ChatPageState();
}

class _ChatPageState extends State<ChatPage> {
  MarketplaceService get _service => widget.service ?? marketplaceService;

  late final Stream<List<ChatMessage>> _stream = _service.messages(
    widget.conversation.id,
  );
  final _input = TextEditingController();
  bool _sending = false;
  int _seenUnread = 0;

  @override
  void dispose() {
    _input.dispose();
    super.dispose();
  }

  Future<void> _send() async {
    final text = _input.text.trim();
    if (text.isEmpty || _sending) return;
    setState(() => _sending = true);
    try {
      await _service.sendMessage(widget.conversation.id, text);
      _input.clear();
    } on MarketplaceFailure catch (e) {
      if (mounted) showToast(context, e.message);
    } finally {
      if (mounted) setState(() => _sending = false);
    }
  }

  void _markReadIfNeeded(List<ChatMessage> messages, String? me) {
    final unread = messages
        .where((m) => m.senderId != me && m.readAt == null)
        .length;
    if (unread > 0 && unread != _seenUnread) {
      _seenUnread = unread;
      unawaited(
        _service.markRead(widget.conversation.id).catchError((Object _) {}),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final me = _service.currentUserId;
    final title = widget.conversation.otherName(me);
    final c = widget.conversation;
    final otherId = me == c.brandId ? c.creatorId : c.brandId;
    return ShorPage(
      title: title,
      actions: [
        PopupMenuButton<String>(
          tooltip: 'More',
          onSelected: (action) async {
            if (action == 'report') {
              await showReportSheet(
                context,
                service: _service,
                target: ReportTarget.user,
                targetId: otherId,
                subject: title,
              );
            } else if (action == 'block') {
              final blocked = await confirmBlock(
                context,
                service: _service,
                userId: otherId,
                name: title,
              );
              if (blocked && context.mounted) Navigator.of(context).pop();
            }
          },
          itemBuilder: (_) => [
            PopupMenuItem(value: 'report', child: Text('Report $title')),
            PopupMenuItem(value: 'block', child: Text('Block $title')),
          ],
        ),
      ],
      body: Column(
        children: [
          if (widget.conversation.campaignTitle != null)
            Container(
              width: double.infinity,
              color: AppColors.bgSecondary,
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
              child: Text(
                'About: ${widget.conversation.campaignTitle}',
                style: AppText.sans(size: 13, color: AppColors.textSecondary),
              ),
            ),
          Expanded(
            child: StreamBuilder<List<ChatMessage>>(
              stream: _stream,
              builder: (context, snapshot) {
                if (snapshot.hasError) {
                  return const ErrorPanel(
                    message: 'Could not load messages. Check your connection.',
                  );
                }
                if (!snapshot.hasData) {
                  return const Center(child: CircularProgressIndicator());
                }
                final messages = snapshot.data!;
                _markReadIfNeeded(messages, me);
                if (messages.isEmpty) {
                  return EmptyState(
                    icon: Icons.chat_bubble_outline,
                    title: 'Say hello',
                    message:
                        'Messages with $title appear here. Use chat to agree '
                        'details like dates, deliverables and price.',
                  );
                }
                return ListView.builder(
                  reverse: true,
                  padding: const EdgeInsets.fromLTRB(16, 16, 16, 8),
                  itemCount: messages.length,
                  itemBuilder: (context, i) {
                    final m = messages[messages.length - 1 - i];
                    final mine = m.senderId == me;
                    return _Bubble(
                      message: m,
                      mine: mine,
                      // Long-press someone else's message to report it.
                      onLongPress: mine
                          ? null
                          : () => showReportSheet(
                              context,
                              service: _service,
                              target: ReportTarget.message,
                              targetId: m.id,
                              subject: 'this message',
                            ),
                    );
                  },
                );
              },
            ),
          ),
          Container(
            decoration: const BoxDecoration(
              color: AppColors.bgCard,
              border: Border(top: BorderSide(color: AppColors.border)),
            ),
            child: SafeArea(
              top: false,
              child: Padding(
                padding: const EdgeInsets.fromLTRB(12, 8, 8, 8),
                child: Row(
                  children: [
                    Expanded(
                      child: TextField(
                        controller: _input,
                        minLines: 1,
                        maxLines: 4,
                        maxLength: 5000,
                        textInputAction: TextInputAction.send,
                        onSubmitted: (_) => _send(),
                        decoration: const InputDecoration(
                          hintText: 'Write a message',
                          counterText: '',
                          isDense: true,
                        ),
                      ),
                    ),
                    const SizedBox(width: 8),
                    IconButton.filled(
                      tooltip: 'Send',
                      onPressed: _sending ? null : _send,
                      style: IconButton.styleFrom(
                        backgroundColor: AppColors.navy,
                      ),
                      icon: const Icon(
                        Icons.send,
                        color: Colors.white,
                        size: 20,
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _Bubble extends StatelessWidget {
  const _Bubble({required this.message, required this.mine, this.onLongPress});

  final ChatMessage message;
  final bool mine;
  final VoidCallback? onLongPress;

  @override
  Widget build(BuildContext context) {
    final bubble = _bubble(context);
    if (onLongPress == null) return bubble;
    return Semantics(
      onLongPressHint: 'Report message',
      child: GestureDetector(onLongPress: onLongPress, child: bubble),
    );
  }

  Widget _bubble(BuildContext context) {
    return Align(
      alignment: mine ? Alignment.centerRight : Alignment.centerLeft,
      child: ConstrainedBox(
        constraints: BoxConstraints(
          maxWidth: MediaQuery.sizeOf(context).width * 0.75,
        ),
        child: Container(
          margin: const EdgeInsets.symmetric(vertical: 4),
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
          decoration: BoxDecoration(
            color: mine ? AppColors.navy : AppColors.bgCard,
            borderRadius: BorderRadius.circular(12),
            border: mine ? null : Border.all(color: AppColors.border),
          ),
          child: Column(
            crossAxisAlignment: mine
                ? CrossAxisAlignment.end
                : CrossAxisAlignment.start,
            children: [
              Text(
                message.body,
                style: AppText.sans(
                  size: 15,
                  color: mine ? Colors.white : AppColors.textPrimary,
                ),
              ),
              const SizedBox(height: 2),
              Text(
                timeAgo(message.createdAt),
                style: AppText.sans(
                  size: 11,
                  color: mine ? AppColors.white(0.7) : AppColors.textMuted,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
