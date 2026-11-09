import 'package:flutter/material.dart';

import '../backend/marketplace_service.dart';
import '../theme/app_colors.dart';
import '../theme/app_text.dart';
import '../utils/format.dart';
import 'app_buttons.dart';
import 'marketplace_widgets.dart';

const _star = Color(0xFFE8A317);

/// Read-only stars, e.g. ★★★★☆.
class Stars extends StatelessWidget {
  const Stars(this.rating, {super.key, this.size = 16});

  final num rating;
  final double size;

  @override
  Widget build(BuildContext context) {
    return Semantics(
      label:
          '${rating.toStringAsFixed(rating % 1 == 0 ? 0 : 1)} out of 5 stars',
      excludeSemantics: true,
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          for (var i = 1; i <= 5; i++)
            Icon(
              rating >= i
                  ? Icons.star_rounded
                  : rating >= i - 0.5
                  ? Icons.star_half_rounded
                  : Icons.star_outline_rounded,
              size: size,
              color: _star,
            ),
        ],
      ),
    );
  }
}

/// "★ 4.8 · 12 reviews", or nothing when there are none and [showEmpty]
/// is off.
class RatingLine extends StatelessWidget {
  const RatingLine(this.summary, {super.key, this.showEmpty = false});

  final RatingSummary summary;
  final bool showEmpty;

  @override
  Widget build(BuildContext context) {
    if (!summary.hasReviews && !showEmpty) return const SizedBox.shrink();
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Icon(
          summary.hasReviews ? Icons.star_rounded : Icons.star_outline_rounded,
          size: 16,
          color: _star,
        ),
        const SizedBox(width: 4),
        Text(
          summary.label,
          style: AppText.sans(size: 13, weight: FontWeight.w600),
        ),
      ],
    );
  }
}

/// Tap a star to choose 1–5.
class StarPicker extends StatelessWidget {
  const StarPicker({super.key, required this.value, required this.onChanged});

  final int value;
  final ValueChanged<int> onChanged;

  static const labels = ['Poor', 'Fair', 'Good', 'Great', 'Excellent'];

  @override
  Widget build(BuildContext context) {
    return Wrap(
      crossAxisAlignment: WrapCrossAlignment.center,
      children: [
        for (var i = 1; i <= 5; i++)
          IconButton(
            key: ValueKey('star-$i'),
            tooltip: '$i star${i == 1 ? '' : 's'}: ${labels[i - 1]}',
            onPressed: () => onChanged(i),
            icon: Icon(
              i <= value ? Icons.star_rounded : Icons.star_outline_rounded,
              size: 34,
              color: _star,
            ),
          ),
        if (value > 0)
          Padding(
            padding: const EdgeInsets.only(left: 6),
            child: Text(
              labels[value - 1],
              style: AppText.sans(size: 14, weight: FontWeight.w600),
            ),
          ),
      ],
    );
  }
}

/// One published review.
class ReviewTile extends StatelessWidget {
  const ReviewTile(this.review, {super.key, this.showCampaign = true});

  final Review review;
  final bool showCampaign;

  @override
  Widget build(BuildContext context) {
    final r = review;
    final meta = [
      if (r.reviewerName != null) r.reviewerName!,
      if (showCampaign && r.campaignTitle != null) r.campaignTitle!,
      if (r.createdAt != null) formatDate(r.createdAt),
    ].join(' · ');
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 10),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Stars(r.rating),
          if ((r.comment ?? '').isNotEmpty) ...[
            const SizedBox(height: 6),
            Text(r.comment!, style: AppText.sans(size: 15, height: 1.5)),
          ],
          if (meta.isNotEmpty) ...[
            const SizedBox(height: 4),
            Text(
              meta,
              style: AppText.sans(size: 12, color: AppColors.textMuted),
            ),
          ],
        ],
      ),
    );
  }
}

/// Published reviews of a brand or creator, with their average.
class ProfileReviews extends StatelessWidget {
  const ProfileReviews({
    super.key,
    required this.userId,
    required this.service,
    this.title = 'Reviews',
    this.emptyMessage = 'No reviews yet.',
  });

  final String userId;
  final MarketplaceService service;
  final String title;
  final String emptyMessage;

  @override
  Widget build(BuildContext context) {
    return AsyncView<(RatingSummary, List<Review>)>(
      refresh: marketplaceRevision,
      load: () async => (
        await service.ratingSummary(userId),
        await service.profileReviews(userId),
      ),
      builder: (context, data, reload) {
        final (summary, reviews) = data;
        return SectionCard(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              SectionTitle(title, trailing: RatingLine(summary)),
              if (reviews.isEmpty)
                Text(
                  emptyMessage,
                  style: AppText.sans(size: 14, color: AppColors.textSecondary),
                )
              else
                for (var i = 0; i < reviews.length; i++) ...[
                  if (i > 0) const Divider(height: 1, color: AppColors.border),
                  ReviewTile(reviews[i]),
                ],
            ],
          ),
        );
      },
    );
  }
}

/// On a completed collaboration: rate the other side, then see their
/// review once it's published.
class CollaborationReviewCard extends StatefulWidget {
  const CollaborationReviewCard({
    super.key,
    required this.collaboration,
    required this.reviews,
    required this.otherName,
    required this.service,
  });

  final Collaboration collaboration;

  /// What the signed-in user can see: their own, and the other side's once
  /// published.
  final List<Review> reviews;
  final String otherName;
  final MarketplaceService service;

  @override
  State<CollaborationReviewCard> createState() =>
      _CollaborationReviewCardState();
}

class _CollaborationReviewCardState extends State<CollaborationReviewCard> {
  int _rating = 0;
  final _comment = TextEditingController();
  bool _busy = false;

  @override
  void dispose() {
    _comment.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    if (_rating == 0 || _busy) return;
    setState(() => _busy = true);
    try {
      await widget.service.submitReview(
        widget.collaboration.id,
        rating: _rating,
        comment: _comment.text,
      );
      if (mounted) showToast(context, 'Thanks. Your review is saved.');
    } on MarketplaceFailure catch (e) {
      if (mounted) showToast(context, e.message);
    } finally {
      if (mounted) setState(() => _busy = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final me = widget.service.currentUserId;
    final mine = widget.reviews.where((r) => r.reviewerId == me).firstOrNull;
    final theirs = widget.reviews.where((r) => r.reviewerId != me).firstOrNull;
    final other = widget.otherName;

    if (mine == null) {
      return SectionCard(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            SectionTitle('Rate $other'),
            Text(
              'How was working with $other? Your review shows on their '
              'profile once they review you too, or after $reviewBlindDays days. '
              'Neither of you sees the other’s review before then.',
              style: AppText.sans(size: 14, color: AppColors.textSecondary),
            ),
            const SizedBox(height: 8),
            StarPicker(
              value: _rating,
              onChanged: (v) => setState(() => _rating = v),
            ),
            const SizedBox(height: 4),
            TextField(
              key: const ValueKey('review-comment'),
              controller: _comment,
              maxLines: 3,
              maxLength: 1000,
              decoration: const InputDecoration(
                labelText: 'What went well, or could be better? (optional)',
                border: OutlineInputBorder(),
              ),
            ),
            const SizedBox(height: 8),
            Opacity(
              opacity: _rating == 0 || _busy ? 0.5 : 1,
              child: SolidButton(
                label: _busy ? 'Saving…' : 'Submit review',
                onPressed: _rating == 0 || _busy ? () {} : _submit,
              ),
            ),
          ],
        ),
      );
    }

    return SectionCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const SectionTitle('Reviews'),
          Text('YOUR REVIEW OF ${other.toUpperCase()}', style: AppText.label()),
          ReviewTile(mine, showCampaign: false),
          const Divider(height: 20, color: AppColors.border),
          Text(
            '${other.toUpperCase()}’S REVIEW OF YOU',
            style: AppText.label(),
          ),
          if (theirs != null)
            ReviewTile(theirs, showCampaign: false)
          else
            Padding(
              padding: const EdgeInsets.symmetric(vertical: 10),
              child: Text(
                '$other hasn’t reviewed you yet. Your review appears on their '
                'profile when they do, or $reviewBlindDays days after you left it.',
                style: AppText.sans(size: 14, color: AppColors.textSecondary),
              ),
            ),
        ],
      ),
    );
  }
}
