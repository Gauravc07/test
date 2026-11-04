import 'package:flutter/material.dart';

import '../backend/marketplace_service.dart';
import '../theme/app_colors.dart';
import '../theme/app_text.dart';
import '../utils/format.dart';
import '../utils/links.dart';
import '../utils/responsive.dart';
import '../widgets/app_buttons.dart';
import '../widgets/marketplace_widgets.dart';
import '../widgets/responsive_grid.dart';
import 'brand/creator_profile_page.dart';
import 'chat_page.dart';
import 'creator/campaign_detail_page.dart';

typedef _CollabData = ({
  Collaboration collab,
  List<Submission> submissions,
  Invoice? invoice,
  LivePost? live,
});

/// One creator on one campaign, from invite or application to payment.
/// The same page serves both sides; actions depend on who is looking.
class CollaborationPage extends StatelessWidget {
  const CollaborationPage({
    super.key,
    required this.collaborationId,
    this.service,
  });

  final String collaborationId;
  final MarketplaceService? service;

  MarketplaceService get _service => service ?? marketplaceService;

  Future<_CollabData> _load() async {
    final collab = await _service.collaboration(collaborationId);
    final submissions = await _service.submissions(collaborationId);
    final invoice = await _service.invoiceFor(collaborationId);
    LivePost? live;
    if (submissions.any((s) => s.kind == SubmissionKind.live)) {
      final posts = await _service.campaignLivePosts(collab.campaignId);
      for (final p in posts) {
        if (p.collaborationId == collab.id) live = p;
      }
    }
    return (
      collab: collab,
      submissions: submissions,
      invoice: invoice,
      live: live,
    );
  }

  @override
  Widget build(BuildContext context) {
    return ShorPage(
      title: 'Collaboration',
      body: AsyncView<_CollabData>(
        refresh: marketplaceRevision,
        load: _load,
        builder: (context, data, reload) =>
            _CollabView(data: data, service: _service),
      ),
    );
  }
}

class _CollabView extends StatefulWidget {
  const _CollabView({required this.data, required this.service});

  final _CollabData data;
  final MarketplaceService service;

  @override
  State<_CollabView> createState() => _CollabViewState();
}

class _CollabViewState extends State<_CollabView> {
  bool _busy = false;

  Collaboration get _collab => widget.data.collab;
  Campaign? get _campaign => _collab.campaign;
  bool get _isBrand => widget.service.currentUserId == _collab.brandId;
  String get _brandName => _campaign?.brandDisplayName ?? 'the brand';
  String get _creatorName => _collab.creator?.displayName ?? 'the creator';
  String get _otherName => _isBrand ? _creatorName : _brandName;

  Future<void> _run(Future<void> Function() action, String done) async {
    if (_busy) return;
    setState(() => _busy = true);
    try {
      await action();
      if (mounted) showToast(context, done);
    } on MarketplaceFailure catch (e) {
      if (mounted) showToast(context, e.message);
    } finally {
      if (mounted) setState(() => _busy = false);
    }
  }

  Future<void> _setStatus(CollabStatus status, String done) => _run(
    () => widget.service.setCollaborationStatus(_collab.id, status),
    done,
  );

  Future<void> _confirmStatus(
    CollabStatus status, {
    required String title,
    required String message,
    required String confirmLabel,
    required String done,
  }) async {
    final ok = await confirmAction(
      context,
      title: title,
      message: message,
      confirmLabel: confirmLabel,
    );
    if (ok) await _setStatus(status, done);
  }

  Future<void> _openChat() async {
    try {
      final conversation = await widget.service.openConversation(
        brandId: _collab.brandId,
        creatorId: _collab.creatorId,
        campaignId: _collab.campaignId,
      );
      if (!mounted) return;
      await Navigator.of(context).push(
        MaterialPageRoute<void>(
          builder: (_) =>
              ChatPage(conversation: conversation, service: widget.service),
        ),
      );
    } on MarketplaceFailure catch (e) {
      if (mounted) showToast(context, e.message);
    }
  }

  Future<void> _openSubmitSheet(SubmissionKind kind) async {
    final sent = await showModalBottomSheet<bool>(
      context: context,
      isScrollControlled: true,
      showDragHandle: true,
      backgroundColor: AppColors.bgCard,
      builder: (_) => SubmitContentSheet(
        collaboration: _collab,
        kind: kind,
        brandName: _brandName,
        service: widget.service,
      ),
    );
    if (sent == true && mounted) {
      showToast(
        context,
        kind == SubmissionKind.draft
            ? 'Draft sent to $_brandName for review.'
            : 'Live post sent to $_brandName.',
      );
    }
  }

  Future<void> _review(Submission s, {required bool approve}) async {
    String? feedback;
    if (!approve) {
      feedback = await askText(
        context,
        title: 'Ask for changes',
        label: 'What should $_creatorName change?',
        hint: 'e.g. Show the product in the first 3 seconds',
        confirmLabel: 'Send feedback',
      );
      if (feedback == null) return;
    }
    await _run(
      () => widget.service.reviewSubmission(
        s.id,
        approve: approve,
        feedback: feedback,
      ),
      approve
          ? (s.kind == SubmissionKind.live
                ? 'Live post approved. The collaboration is complete.'
                : 'Draft approved. $_creatorName can now post it.')
          : 'Feedback sent to $_creatorName.',
    );
  }

  @override
  Widget build(BuildContext context) {
    final next = _nextStep();
    return PageList(
      maxWidth: 860,
      children: [
        _header(),
        const SizedBox(height: 14),
        if (_showProgress) ...[_progress(), const SizedBox(height: 14)],
        SectionCard(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text('NEXT STEP', style: AppText.label(color: AppColors.accent)),
              const SizedBox(height: 6),
              Text(next.title, style: AppText.heading(20)),
              const SizedBox(height: 6),
              Text(
                next.message,
                style: AppText.sans(size: 15, color: AppColors.textSecondary),
              ),
              if (next.actions.isNotEmpty) ...[
                const SizedBox(height: 14),
                AbsorbPointer(
                  absorbing: _busy,
                  child: Opacity(
                    opacity: _busy ? 0.5 : 1,
                    child: Wrap(
                      spacing: 10,
                      runSpacing: 10,
                      children: next.actions,
                    ),
                  ),
                ),
              ],
            ],
          ),
        ),
        if (widget.data.live != null) ...[
          const SizedBox(height: 14),
          _livePerformance(widget.data.live!),
        ],
        if (widget.data.submissions.isNotEmpty) ...[
          const SizedBox(height: 22),
          const SectionTitle('Content'),
          for (final s in widget.data.submissions) ...[
            _submissionCard(s),
            const SizedBox(height: 10),
          ],
        ],
        const SizedBox(height: 12),
        _terms(),
        if ((_collab.pitch ?? '').trim().isNotEmpty) ...[
          const SizedBox(height: 14),
          SectionCard(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                SectionTitle(_isBrand ? 'Their pitch' : 'Your pitch'),
                Text(
                  _collab.pitch!.trim(),
                  style: AppText.sans(size: 15, height: 1.55),
                ),
              ],
            ),
          ),
        ],
      ],
    );
  }

  Widget _header() {
    final creator = _collab.creator;
    final stats = <String>[
      if (_isBrand && creator?.instagramLabel != null) creator!.instagramLabel!,
      if (_isBrand && creator?.followers != null)
        '${formatCompact(creator!.followers)} followers',
      if (_isBrand && creator?.engagementRate != null)
        '${creator!.engagementRate!.toStringAsFixed(1)}% engagement',
    ];
    return SectionCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Avatar(
                name: _otherName,
                imageUrl: _isBrand
                    ? creator?.avatarUrl
                    : _campaign?.brandLogoUrl,
                size: 46,
              ),
              const SizedBox(width: 14),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      _campaign?.title ?? 'Campaign',
                      style: AppText.heading(20),
                    ),
                    const SizedBox(height: 2),
                    Text(
                      'with $_otherName',
                      style: AppText.sans(
                        size: 14,
                        color: AppColors.textSecondary,
                      ),
                    ),
                    if (stats.isNotEmpty)
                      Text(
                        stats.join(' · '),
                        style: AppText.sans(
                          size: 13,
                          color: AppColors.textMuted,
                        ),
                      ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 14),
          Wrap(
            spacing: 10,
            runSpacing: 10,
            crossAxisAlignment: WrapCrossAlignment.center,
            children: [
              StatusChip(
                _collab.status.label(brand: _isBrand),
                tone: collabTone(_collab.status),
              ),
              Text(
                _collab.amountLabel,
                style: AppText.sans(size: 15, weight: FontWeight.w700),
              ),
            ],
          ),
          const SizedBox(height: 14),
          Wrap(
            spacing: 8,
            runSpacing: 8,
            children: [
              SmallButton(
                label: 'Message',
                outlined: true,
                onPressed: _openChat,
              ),
              if (_isBrand)
                SmallButton(
                  label: 'Creator profile',
                  outlined: true,
                  onPressed: () => Navigator.of(context).push(
                    MaterialPageRoute<void>(
                      builder: (_) => CreatorProfilePage(
                        creatorId: _collab.creatorId,
                        service: widget.service,
                      ),
                    ),
                  ),
                )
              else
                SmallButton(
                  label: 'Campaign brief',
                  outlined: true,
                  onPressed: () => Navigator.of(context).push(
                    MaterialPageRoute<void>(
                      builder: (_) => CampaignDetailPage(
                        campaignId: _collab.campaignId,
                        service: widget.service,
                      ),
                    ),
                  ),
                ),
            ],
          ),
        ],
      ),
    );
  }

  bool get _showProgress => _collab.status.isHired;

  Widget _progress() {
    final subs = widget.data.submissions;
    final barter = _campaign?.isBarter ?? false;
    final steps = <(String, bool)>[
      ('Agreed', true),
      (
        'Draft approved',
        subs.any(
          (s) =>
              s.kind == SubmissionKind.draft &&
              s.status == SubmissionStatus.approved,
        ),
      ),
      (
        'Posted',
        subs.any(
          (s) =>
              s.kind == SubmissionKind.live &&
              s.status != SubmissionStatus.changesRequested,
        ),
      ),
      ('Approved', _collab.status == CollabStatus.completed),
      if (!barter) ('Paid', widget.data.invoice?.status == InvoiceStatus.paid),
    ];
    return SectionCard(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
      child: Wrap(
        spacing: 6,
        runSpacing: 8,
        crossAxisAlignment: WrapCrossAlignment.center,
        children: [
          for (var i = 0; i < steps.length; i++) ...[
            if (i > 0)
              const Icon(
                Icons.chevron_right,
                size: 16,
                color: AppColors.textMuted,
              ),
            Semantics(
              label: '${steps[i].$1}: ${steps[i].$2 ? 'done' : 'not yet'}',
              excludeSemantics: true,
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Icon(
                    steps[i].$2
                        ? Icons.check_circle
                        : Icons.radio_button_unchecked,
                    size: 16,
                    color: steps[i].$2
                        ? AppColors.accent
                        : AppColors.borderStrong,
                  ),
                  const SizedBox(width: 4),
                  Text(
                    steps[i].$1,
                    style: AppText.sans(
                      size: 13,
                      weight: steps[i].$2 ? FontWeight.w600 : FontWeight.w400,
                      color: steps[i].$2
                          ? AppColors.textPrimary
                          : AppColors.textMuted,
                    ),
                  ),
                ],
              ),
            ),
          ],
        ],
      ),
    );
  }

  ({String title, String message, List<Widget> actions}) _nextStep() {
    final subs = widget.data.submissions;
    Submission? pending, lastDraft, lastLive;
    for (final s in subs) {
      if (s.status == SubmissionStatus.pending) pending ??= s;
      if (s.kind == SubmissionKind.draft) lastDraft ??= s;
      if (s.kind == SubmissionKind.live) lastLive ??= s;
    }
    final draftApproved = subs.any(
      (s) =>
          s.kind == SubmissionKind.draft &&
          s.status == SubmissionStatus.approved,
    );
    final invoice = widget.data.invoice;
    final barter = _campaign?.isBarter ?? false;
    final amount = _collab.agreedAmount;
    final fee = amount == null ? null : (amount * 0.10 * 100).round() / 100;

    switch (_collab.status) {
      case CollabStatus.invited:
        return _isBrand
            ? (
                title: 'Invitation sent',
                message: 'Waiting for $_creatorName to accept.',
                actions: [
                  SmallButton(
                    label: 'Cancel invitation',
                    outlined: true,
                    onPressed: () => _confirmStatus(
                      CollabStatus.cancelled,
                      title: 'Cancel this invitation?',
                      message:
                          '$_creatorName will no longer be able to accept it.',
                      confirmLabel: 'Cancel invitation',
                      done: 'Invitation cancelled.',
                    ),
                  ),
                ],
              )
            : (
                title: 'You are invited',
                message:
                    '$_brandName invited you to this campaign for '
                    '${_collab.amountLabel}. Read the brief, then accept or decline.',
                actions: [
                  SmallButton(
                    label: 'Accept invitation',
                    onPressed: () => _setStatus(
                      CollabStatus.accepted,
                      'Invitation accepted. Next, share your draft.',
                    ),
                  ),
                  SmallButton(
                    label: 'Decline',
                    outlined: true,
                    onPressed: () => _confirmStatus(
                      CollabStatus.declined,
                      title: 'Decline this invitation?',
                      message:
                          '$_brandName will be told you are not taking part.',
                      confirmLabel: 'Decline',
                      done: 'Invitation declined.',
                    ),
                  ),
                ],
              );

      case CollabStatus.applied:
        return _isBrand
            ? (
                title: 'New application',
                message:
                    '$_creatorName applied'
                    '${amount == null ? '' : ' with a price of ${formatMoney(amount, currency: _collab.currency)}'}. '
                    'Read their pitch below, then accept or decline.',
                actions: [
                  SmallButton(
                    label: 'Accept',
                    onPressed: () => _setStatus(
                      CollabStatus.accepted,
                      '$_creatorName is in. They will share a draft next.',
                    ),
                  ),
                  SmallButton(
                    label: 'Decline',
                    outlined: true,
                    onPressed: () => _confirmStatus(
                      CollabStatus.declined,
                      title: 'Decline this application?',
                      message:
                          '$_creatorName will see that they were not selected.',
                      confirmLabel: 'Decline',
                      done: 'Application declined.',
                    ),
                  ),
                ],
              )
            : (
                title: 'Application sent',
                message: 'Waiting for $_brandName to review it.',
                actions: [
                  SmallButton(
                    label: 'Withdraw application',
                    outlined: true,
                    onPressed: () => _confirmStatus(
                      CollabStatus.cancelled,
                      title: 'Withdraw your application?',
                      message:
                          'You will not be able to apply to this campaign again.',
                      confirmLabel: 'Withdraw',
                      done: 'Application withdrawn.',
                    ),
                  ),
                ],
              );

      case CollabStatus.accepted || CollabStatus.inProgress:
        final cancel = SmallButton(
          label: 'Cancel collaboration',
          outlined: true,
          onPressed: () => _confirmStatus(
            CollabStatus.cancelled,
            title: 'Cancel this collaboration?',
            message:
                'Tell $_creatorName why in chat first. This cannot be undone.',
            confirmLabel: 'Cancel collaboration',
            done: 'Collaboration cancelled.',
          ),
        );
        if (pending != null) {
          final what = pending.kind == SubmissionKind.draft
              ? 'draft'
              : 'live post';
          return _isBrand
              ? (
                  title: 'Review the $what',
                  message:
                      '$_creatorName submitted a $what. Open it below, then '
                      'approve it or ask for changes.',
                  actions: const [],
                )
              : (
                  title: 'Waiting for review',
                  message: 'Your $what is with $_brandName.',
                  actions: const [],
                );
        }
        if (!draftApproved) {
          final changes =
              lastDraft?.status == SubmissionStatus.changesRequested;
          return _isBrand
              ? (
                  title: changes
                      ? 'Waiting for the revised draft'
                      : 'Waiting for the draft',
                  message:
                      '$_creatorName is preparing a draft for you to review.',
                  actions: [cancel],
                )
              : (
                  title: changes ? 'Changes requested' : 'Share your draft',
                  message: changes
                      ? '$_brandName asked for changes: “${lastDraft!.feedback ?? ''}”'
                      : 'Upload your draft (Google Drive, Dropbox or similar) and '
                            'share the link so $_brandName can review it before you post.',
                  actions: [
                    SmallButton(
                      label: changes ? 'Submit revised draft' : 'Submit draft',
                      onPressed: () => _openSubmitSheet(SubmissionKind.draft),
                    ),
                  ],
                );
        }
        final liveChanges =
            lastLive?.status == SubmissionStatus.changesRequested;
        return _isBrand
            ? (
                title: 'Waiting for the live post',
                message:
                    'The draft is approved. $_creatorName will post it on '
                    'Instagram and share the link.',
                actions: [cancel],
              )
            : (
                title: liveChanges
                    ? 'Fix the live post'
                    : 'Post it on Instagram',
                message: liveChanges
                    ? '$_brandName asked for changes: “${lastLive!.feedback ?? ''}”'
                    : 'Your draft is approved. Publish it on Instagram, then '
                          'paste the link to the post here.',
                actions: [
                  SmallButton(
                    label: 'Submit live post',
                    onPressed: () => _openSubmitSheet(SubmissionKind.live),
                  ),
                ],
              );

      case CollabStatus.awaitingApproval:
        return _isBrand
            ? (
                title: 'Check the live post',
                message:
                    'Open the post below. Approve it to complete the '
                    'collaboration, or ask for changes.',
                actions: const [],
              )
            : (
                title: 'Waiting for approval',
                message: '$_brandName is checking your live post.',
                actions: const [],
              );

      case CollabStatus.completed:
        if (barter) {
          return (
            title: 'Completed',
            message:
                'The collaboration is complete. Thanks for working together!',
            actions: const [],
          );
        }
        if (_isBrand) {
          if (invoice == null) {
            return (
              title: 'Completed',
              message: 'Waiting for $_creatorName to request payment.',
              actions: const [],
            );
          }
          return switch (invoice.status) {
            InvoiceStatus.pending => (
              title: 'Approve the invoice',
              message:
                  'Invoice ${invoice.number} for '
                  '${formatMoney(invoice.gross, currency: invoice.currency)}.',
              actions: [
                SmallButton(
                  label: 'Approve invoice',
                  onPressed: () => _run(
                    () =>
                        widget.service.decideInvoice(invoice.id, approve: true),
                    'Invoice approved.',
                  ),
                ),
                SmallButton(
                  label: 'Reject',
                  outlined: true,
                  onPressed: () async {
                    final ok = await confirmAction(
                      context,
                      title: 'Reject this invoice?',
                      message:
                          'Tell $_creatorName why in chat so they can fix it.',
                      confirmLabel: 'Reject',
                    );
                    if (ok) {
                      await _run(
                        () => widget.service.decideInvoice(
                          invoice.id,
                          approve: false,
                        ),
                        'Invoice rejected.',
                      );
                    }
                  },
                ),
              ],
            ),
            InvoiceStatus.approved => (
              title: 'Invoice approved',
              message:
                  '${formatMoney(invoice.gross, currency: invoice.currency)} is due to '
                  '$_creatorName.',
              actions: const [],
            ),
            InvoiceStatus.paid => (
              title: 'Paid',
              message: 'This collaboration is complete and paid.',
              actions: const [],
            ),
            InvoiceStatus.rejected => (
              title: 'Invoice rejected',
              message: 'Agree the amount with $_creatorName in chat.',
              actions: const [],
            ),
          };
        }
        final request = SmallButton(
          label: 'Request payment',
          onPressed: () async {
            final ok = await confirmAction(
              context,
              title:
                  'Request ${formatMoney(amount, currency: _collab.currency)}?',
              message:
                  'Shor sends an invoice to $_brandName. Shor’s 10% fee is '
                  'deducted, so you receive '
                  '${formatMoney(amount == null ? null : amount - fee!, currency: _collab.currency)}.',
              confirmLabel: 'Send invoice',
            );
            if (ok) {
              await _run(
                () => widget.service.requestPayment(_collab),
                'Invoice sent to $_brandName.',
              );
            }
          },
        );
        if (invoice == null) {
          return (
            title: 'Get paid',
            message:
                '$_brandName approved your post. Send your invoice to get paid.',
            actions: [request],
          );
        }
        return switch (invoice.status) {
          InvoiceStatus.pending => (
            title: 'Payment requested',
            message:
                'Waiting for $_brandName to approve invoice ${invoice.number}.',
            actions: const <Widget>[],
          ),
          InvoiceStatus.approved => (
            title: 'Invoice approved',
            message:
                'You will receive ${formatMoney(invoice.net, currency: invoice.currency)} '
                'after Shor’s fee.',
            actions: const <Widget>[],
          ),
          InvoiceStatus.paid => (
            title: 'Paid',
            message:
                '${formatMoney(invoice.net, currency: invoice.currency)} was paid '
                'on ${formatDate(invoice.paidAt)}.',
            actions: const <Widget>[],
          ),
          InvoiceStatus.rejected => (
            title: 'Invoice rejected',
            message: 'Talk to $_brandName in chat, then request payment again.',
            actions: <Widget>[request],
          ),
        };

      case CollabStatus.declined:
        return (
          title: 'Declined',
          message: _isBrand
              ? 'This collaboration was declined.'
              : 'Not selected this time. Keep applying to campaigns that fit you.',
          actions: const [],
        );

      case CollabStatus.cancelled:
        return (
          title: 'Cancelled',
          message: 'This collaboration was cancelled.',
          actions: const [],
        );
    }
  }

  Widget _submissionCard(Submission s) {
    final (statusLabel, tone) = switch (s.status) {
      SubmissionStatus.pending => ('Awaiting review', Tone.warning),
      SubmissionStatus.approved => ('Approved', Tone.success),
      SubmissionStatus.changesRequested => ('Changes requested', Tone.danger),
    };
    final isLive = s.kind == SubmissionKind.live;
    return SectionCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Wrap(
            spacing: 8,
            runSpacing: 8,
            crossAxisAlignment: WrapCrossAlignment.center,
            children: [
              StatusChip(
                isLive ? 'Live post' : 'Draft',
                tone: Tone.neutral,
                icon: isLive ? Icons.public : Icons.edit_note,
              ),
              StatusChip(statusLabel, tone: tone),
              Text(
                timeAgo(s.createdAt),
                style: AppText.sans(size: 12, color: AppColors.textMuted),
              ),
            ],
          ),
          const SizedBox(height: 10),
          InkWell(
            onTap: () => openLink(s.contentUrl),
            child: Padding(
              padding: const EdgeInsets.symmetric(vertical: 4),
              child: Row(
                children: [
                  const Icon(
                    Icons.open_in_new,
                    size: 16,
                    color: AppColors.accent,
                  ),
                  const SizedBox(width: 6),
                  Flexible(
                    child: Text(
                      s.contentUrl,
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      style: AppText.sans(
                        size: 14,
                        color: AppColors.accent,
                        weight: FontWeight.w600,
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),
          if ((s.caption ?? '').isNotEmpty) ...[
            const SizedBox(height: 8),
            Text('CAPTION', style: AppText.label()),
            const SizedBox(height: 2),
            Text(s.caption!, style: AppText.sans(size: 14)),
          ],
          if ((s.notes ?? '').isNotEmpty) ...[
            const SizedBox(height: 8),
            Text('NOTES', style: AppText.label()),
            const SizedBox(height: 2),
            Text(s.notes!, style: AppText.sans(size: 14)),
          ],
          if ((s.feedback ?? '').isNotEmpty) ...[
            const SizedBox(height: 10),
            Note('Feedback: ${s.feedback}', icon: Icons.chat_outlined),
          ],
          if (_isBrand && s.status == SubmissionStatus.pending) ...[
            const SizedBox(height: 12),
            AbsorbPointer(
              absorbing: _busy,
              child: Wrap(
                spacing: 10,
                runSpacing: 10,
                children: [
                  SmallButton(
                    label: isLive ? 'Approve and complete' : 'Approve draft',
                    onPressed: () => _review(s, approve: true),
                  ),
                  SmallButton(
                    label: 'Request changes',
                    outlined: true,
                    onPressed: () => _review(s, approve: false),
                  ),
                ],
              ),
            ),
          ],
        ],
      ),
    );
  }

  Widget _livePerformance(LivePost p) {
    final verified = _collab.creator?.instagramVerified ?? false;
    return SectionCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SectionTitle(
            'Live post performance',
            trailing: p.matched && p.insightsUpdatedAt != null
                ? Text(
                    'Updated ${timeAgo(p.insightsUpdatedAt)}',
                    style: AppText.sans(size: 12, color: AppColors.textMuted),
                  )
                : null,
          ),
          if (!p.matched)
            Note(
              _isBrand && !verified
                  ? '$_creatorName has not connected Instagram, so Shor cannot '
                        'read this post’s insights.'
                  : 'Insights appear once this post syncs from Instagram, '
                        'usually within a day.',
              icon: Icons.hourglass_empty,
            )
          else ...[
            ResponsiveGrid(
              columns: context.responsive<int>(2, md: 3),
              spacing: 10,
              children: [
                MetricTile(label: 'Views', value: formatCompact(p.views)),
                MetricTile(label: 'Reach', value: formatCompact(p.reach)),
                MetricTile(label: 'Likes', value: formatCompact(p.likes)),
                MetricTile(label: 'Comments', value: formatCompact(p.comments)),
                MetricTile(label: 'Saves', value: formatCompact(p.saved)),
                MetricTile(label: 'Shares', value: formatCompact(p.shares)),
              ],
            ),
            if (!_isBrand) ...[
              const SizedBox(height: 10),
              Note(
                'Shared with $_brandName for this campaign because you submitted '
                'the post. Your other insights stay private.',
                icon: Icons.lock_outline,
              ),
            ],
          ],
        ],
      ),
    );
  }

  Widget _terms() {
    final c = _campaign;
    final deliverables = _collab.deliverables.isNotEmpty
        ? _collab.deliverables
        : (c?.deliverables ?? const <String, int>{});
    return SectionCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const SectionTitle('Terms'),
          InfoRow('Amount', _collab.amountLabel),
          InfoRow('Deliverables', deliverablesSummary(deliverables)),
          if (_collab.dueDate != null)
            InfoRow('Due', formatDate(_collab.dueDate)),
          if (c?.endDate != null)
            InfoRow('Campaign ends', formatDate(c!.endDate)),
          if (c != null &&
              c.includesProduct &&
              (c.productDetails ?? '').isNotEmpty)
            InfoRow('Product', c.productDetails!),
          if ((c?.guidelines ?? '').trim().isNotEmpty) ...[
            const SizedBox(height: 8),
            Text('GUIDELINES', style: AppText.label()),
            const SizedBox(height: 4),
            Text(
              c!.guidelines!.trim(),
              style: AppText.sans(size: 14, height: 1.5),
            ),
          ],
        ],
      ),
    );
  }
}

/// Bottom sheet to submit a draft link or the live Instagram post.
class SubmitContentSheet extends StatefulWidget {
  const SubmitContentSheet({
    super.key,
    required this.collaboration,
    required this.kind,
    required this.brandName,
    required this.service,
  });

  final Collaboration collaboration;
  final SubmissionKind kind;
  final String brandName;
  final MarketplaceService service;

  @override
  State<SubmitContentSheet> createState() => _SubmitContentSheetState();
}

class _SubmitContentSheetState extends State<SubmitContentSheet> {
  final _formKey = GlobalKey<FormState>();
  final _url = TextEditingController();
  final _caption = TextEditingController();
  final _notes = TextEditingController();
  bool _busy = false;
  String? _error;

  bool get _live => widget.kind == SubmissionKind.live;

  @override
  void dispose() {
    _url.dispose();
    _caption.dispose();
    _notes.dispose();
    super.dispose();
  }

  Future<void> _send() async {
    if (_busy || !(_formKey.currentState?.validate() ?? false)) return;
    setState(() {
      _busy = true;
      _error = null;
    });
    try {
      await widget.service.submit(
        widget.collaboration.id,
        widget.kind,
        url: _url.text,
        caption: _caption.text,
        notes: _notes.text,
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
            child: Form(
              key: _formKey,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  Text(
                    _live ? 'Submit your live post' : 'Submit your draft',
                    style: AppText.heading(22),
                  ),
                  const SizedBox(height: 6),
                  Text(
                    _live
                        ? 'Paste the link to the post or reel you published on Instagram.'
                        : 'Share a link where ${widget.brandName} can view the draft '
                              '(Google Drive, Dropbox, WeTransfer…). Make sure it is not private.',
                    style: AppText.sans(
                      size: 14,
                      color: AppColors.textSecondary,
                    ),
                  ),
                  const SizedBox(height: 16),
                  TextFormField(
                    controller: _url,
                    enabled: !_busy,
                    keyboardType: TextInputType.url,
                    autocorrect: false,
                    decoration: InputDecoration(
                      labelText: _live ? 'Instagram post link' : 'Draft link',
                      hintText: _live
                          ? 'https://www.instagram.com/reel/…'
                          : 'https://drive.google.com/…',
                    ),
                    validator: (v) {
                      final value = (v ?? '').trim();
                      if (_live) {
                        return isInstagramPostUrl(value)
                            ? null
                            : 'Paste a link to an Instagram post or reel';
                      }
                      return isHttpsUrl(value)
                          ? null
                          : 'Paste a link starting with https://';
                    },
                  ),
                  const SizedBox(height: 12),
                  TextFormField(
                    controller: _caption,
                    enabled: !_busy,
                    minLines: 2,
                    maxLines: 5,
                    maxLength: 2200,
                    decoration: const InputDecoration(
                      labelText: 'Caption (optional)',
                      alignLabelWithHint: true,
                    ),
                  ),
                  TextFormField(
                    controller: _notes,
                    enabled: !_busy,
                    minLines: 1,
                    maxLines: 4,
                    maxLength: 2000,
                    decoration: InputDecoration(
                      labelText: 'Notes for ${widget.brandName} (optional)',
                      alignLabelWithHint: true,
                    ),
                  ),
                  if (_live) ...[
                    const SizedBox(height: 4),
                    Note(
                      'Submitting shares this post’s Instagram insights (views, '
                      'reach, likes, comments, saves and shares) with '
                      '${widget.brandName} for this campaign. Your other '
                      'insights stay private.',
                      icon: Icons.lock_outline,
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
                  const SizedBox(height: 20),
                  SolidButton(
                    label: _busy
                        ? 'Sending…'
                        : (_live ? 'Submit live post' : 'Submit draft'),
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

/// What happens next, in a few words, for list rows.
String collabNextStep(CollabStatus status, {required bool brand}) =>
    switch (status) {
      CollabStatus.invited =>
        brand
            ? 'Waiting for the creator to respond'
            : 'Accept or decline the invitation',
      CollabStatus.applied =>
        brand ? 'Review the application' : 'Waiting for the brand to respond',
      CollabStatus.accepted =>
        brand ? 'Waiting for the creator’s draft' : 'Submit your draft',
      CollabStatus.inProgress => 'Draft review and posting',
      CollabStatus.awaitingApproval =>
        brand ? 'Check the live post' : 'The brand is checking your post',
      CollabStatus.completed => 'Collaboration complete',
      CollabStatus.declined => brand ? 'Declined' : 'Not selected this time',
      CollabStatus.cancelled => 'Cancelled',
    };

/// A collaboration in a list: the other party, status and next step.
class CollabTile extends StatelessWidget {
  const CollabTile({
    super.key,
    required this.collaboration,
    required this.brandView,
    required this.onTap,
  });

  final Collaboration collaboration;
  final bool brandView;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final c = collaboration;
    final creator = c.creator;
    final campaign = c.campaign;
    final title = brandView
        ? (creator?.displayName ?? 'Creator')
        : (campaign?.title ?? 'Campaign');
    final subtitle = brandView
        ? [
            if (creator?.instagramLabel != null) creator!.instagramLabel!,
            if (creator?.followers != null)
              '${formatCompact(creator!.followers)} followers',
          ].join(' · ')
        : (campaign?.brandDisplayName ?? '');
    return SectionCard(
      onTap: onTap,
      child: Row(
        children: [
          Avatar(
            name: brandView ? title : (campaign?.brandDisplayName ?? title),
            imageUrl: brandView ? creator?.avatarUrl : campaign?.brandLogoUrl,
            size: 42,
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  style: AppText.sans(size: 16, weight: FontWeight.w600),
                ),
                if (subtitle.isNotEmpty)
                  Text(
                    subtitle,
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: AppText.sans(size: 13, color: AppColors.textMuted),
                  ),
                const SizedBox(height: 6),
                Text(
                  collabNextStep(c.status, brand: brandView),
                  style: AppText.sans(size: 13, color: AppColors.textSecondary),
                ),
              ],
            ),
          ),
          const SizedBox(width: 12),
          Column(
            crossAxisAlignment: CrossAxisAlignment.end,
            children: [
              StatusChip(
                c.status.label(brand: brandView),
                tone: collabTone(c.status),
              ),
              const SizedBox(height: 6),
              Text(
                c.amountLabel,
                style: AppText.sans(size: 13, weight: FontWeight.w600),
              ),
            ],
          ),
        ],
      ),
    );
  }
}
