import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

import '../backend/marketplace_service.dart';
import '../config/app_config.dart';
import '../sections/navigation_bar.dart' show Wordmark;
import '../theme/app_colors.dart';
import '../theme/app_text.dart';
import '../utils/format.dart';
import '../utils/links.dart';
import '../utils/responsive.dart';
import '../widgets/app_buttons.dart';
import '../widgets/insight_charts.dart';
import '../widgets/marketplace_widgets.dart';
import '../widgets/responsive_grid.dart';
import '../widgets/reviews.dart';

/// Public address of a creator's media kit.
String mediaKitUrl(String handle) =>
    '${AppConfig.websiteUrl}/kit/${Uri.encodeComponent(handle.replaceFirst('@', ''))}';

/// The handle in a media kit address (`/kit/<handle>` or `?kit=<handle>`),
/// or null if [uri] isn't one.
String? mediaKitHandleFrom(Uri uri) {
  final segments = uri.pathSegments.where((s) => s.isNotEmpty).toList();
  if (segments.length == 2 && segments.first == 'kit') return segments[1];
  final q = uri.queryParameters['kit']?.trim();
  return q == null || q.isEmpty ? null : q;
}

/// A creator's media kit: verified Instagram numbers, audience, best recent
/// posts, rates and reviews. Anyone can open it, logged in or not, once the
/// creator makes it public. Creators can preview their own.
class MediaKitPage extends StatelessWidget {
  const MediaKitPage({super.key, required this.handle, this.service});

  final String handle;
  final MarketplaceService? service;

  MarketplaceService get _service => service ?? marketplaceService;

  @override
  Widget build(BuildContext context) {
    final canPop = Navigator.of(context).canPop();
    return Scaffold(
      backgroundColor: AppColors.bgPrimary,
      appBar: AppBar(
        backgroundColor: AppColors.bgPrimary,
        surfaceTintColor: Colors.transparent,
        foregroundColor: AppColors.textPrimary,
        scrolledUnderElevation: 0,
        automaticallyImplyLeading: canPop,
        titleSpacing: canPop ? 0 : 16,
        title: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Wordmark(),
            const SizedBox(width: 10),
            Text('Media kit', style: AppText.label()),
          ],
        ),
        shape: const Border(bottom: BorderSide(color: AppColors.border)),
      ),
      // Wrapped in a record: AsyncView treats a null result as still loading.
      body: AsyncView<({MediaKit? kit})>(
        refresh: marketplaceRevision,
        load: () async => (kit: await _service.mediaKit(handle)),
        builder: (context, data, reload) => data.kit == null
            ? PageList(
                maxWidth: 720,
                children: [
                  EmptyState(
                    icon: Icons.person_search_outlined,
                    title: 'This media kit isn’t available',
                    message:
                        '@${handle.replaceFirst('@', '')} hasn’t published a media '
                        'kit on Shor, or the link is wrong.',
                  ),
                ],
              )
            : MediaKitView(kit: data.kit!),
      ),
    );
  }
}

class MediaKitView extends StatelessWidget {
  const MediaKitView({super.key, required this.kit});

  final MediaKit kit;

  @override
  Widget build(BuildContext context) {
    final k = kit;
    final gender = k.audience['gender'] ?? const [];
    final age = k.audience['age'] ?? const [];
    final cities = k.audience['city'] ?? const [];
    final hasAudience =
        gender.isNotEmpty || age.isNotEmpty || cities.isNotEmpty;

    return PageList(
      maxWidth: 920,
      children: [
        if (!k.isPublic) ...[
          const Note(
            'Preview. Only you can see this. Turn on your public media kit in '
            'Profile to share the link with brands.',
            icon: Icons.visibility_outlined,
          ),
          const SizedBox(height: 16),
        ],
        _Header(kit: k),
        const SizedBox(height: 20),
        ResponsiveGrid(
          columns: context.responsive<int>(2, md: 4),
          spacing: 10,
          children: [
            MetricTile(
              label: 'Followers',
              value: formatCompact(k.followers),
              caption: k.verified ? 'Verified from Instagram' : 'Not verified',
            ),
            MetricTile(
              label: 'Avg views',
              value: formatCompact(k.avgViews),
              caption: k.postsAnalysed == 0
                  ? 'No recent posts synced'
                  : 'Last ${k.postsAnalysed} posts, 90 days',
            ),
            MetricTile(
              label: 'Avg reach',
              value: formatCompact(k.avgReach),
              caption: 'Accounts reached per post',
            ),
            MetricTile(
              label: 'Engagement',
              value: k.recentEngagementRate != null
                  ? '${k.recentEngagementRate!.toStringAsFixed(1)}%'
                  : k.engagementRate != null
                  ? '${k.engagementRate!.toStringAsFixed(1)}%'
                  : '—',
              caption: k.recentEngagementRate != null
                  ? 'Interactions ÷ reach'
                  : 'Likes + comments ÷ followers',
            ),
          ],
        ),
        if (k.syncedAt != null) ...[
          const SizedBox(height: 8),
          Text(
            'Numbers from Instagram, updated ${timeAgo(k.syncedAt)}.',
            style: AppText.sans(size: 12, color: AppColors.textMuted),
          ),
        ],
        if (k.topPosts.isNotEmpty) ...[
          const SizedBox(height: 28),
          const SectionTitle('Top recent posts'),
          ResponsiveGrid(
            columns: context.responsive<int>(2, md: 3),
            spacing: 10,
            children: [for (final p in k.topPosts) _PostCard(post: p)],
          ),
        ],
        if (hasAudience) ...[
          const SizedBox(height: 28),
          const SectionTitle('Audience'),
          ResponsiveGrid(
            columns: context.responsive<int>(1, md: 3),
            spacing: 10,
            children: [
              if (gender.isNotEmpty)
                _AudienceCard(title: 'Gender', data: gender, labels: _genders),
              if (age.isNotEmpty) _AudienceCard(title: 'Age', data: age),
              if (cities.isNotEmpty)
                _AudienceCard(
                  title: 'Top cities',
                  data: cities,
                  cityNames: true,
                ),
            ],
          ),
        ],
        const SizedBox(height: 28),
        ResponsiveGrid(
          columns: context.responsive<int>(1, md: 2),
          spacing: 10,
          children: [
            SectionCard(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const SectionTitle('Rates'),
                  Text(k.rateLabel, style: AppText.heading(22)),
                  const SizedBox(height: 4),
                  Text(
                    'Final price depends on deliverables and usage rights.',
                    style: AppText.sans(size: 13, color: AppColors.textMuted),
                  ),
                ],
              ),
            ),
            SectionCard(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const SectionTitle('On Shor'),
                  Text(
                    '${k.dealsCompleted} brand deal${k.dealsCompleted == 1 ? '' : 's'} completed',
                    style: AppText.heading(22),
                  ),
                  const SizedBox(height: 6),
                  RatingLine(k.rating, showEmpty: true),
                ],
              ),
            ),
          ],
        ),
        if (k.reviews.isNotEmpty) ...[
          const SizedBox(height: 14),
          SectionCard(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const SectionTitle('What brands say'),
                for (var i = 0; i < k.reviews.length; i++) ...[
                  if (i > 0) const Divider(height: 1, color: AppColors.border),
                  ReviewTile(k.reviews[i]),
                ],
              ],
            ),
          ),
        ],
        const SizedBox(height: 28),
        _WorkWith(kit: k),
      ],
    );
  }

  static const _genders = {'F': 'Women', 'M': 'Men', 'U': 'Unspecified'};
}

class _Header extends StatelessWidget {
  const _Header({required this.kit});

  final MediaKit kit;

  @override
  Widget build(BuildContext context) {
    final k = kit;
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Avatar(name: k.displayName, imageUrl: k.avatarUrl, size: 84),
        const SizedBox(width: 16),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                k.displayName,
                style: AppText.heading(context.sized(26, md: 32)),
              ),
              const SizedBox(height: 4),
              Wrap(
                spacing: 8,
                runSpacing: 6,
                crossAxisAlignment: WrapCrossAlignment.center,
                children: [
                  if (k.instagramUsername != null)
                    InkWell(
                      onTap: k.instagramUrl == null
                          ? null
                          : () => openLink(k.instagramUrl!),
                      child: Text(
                        '@${k.instagramUsername}',
                        style: AppText.sans(
                          size: 15,
                          weight: FontWeight.w600,
                          color: AppColors.accent,
                        ),
                      ),
                    ),
                  if (k.verified)
                    const StatusChip(
                      'Verified on Instagram',
                      tone: Tone.info,
                      icon: Icons.verified,
                    ),
                  if ((k.location ?? '').isNotEmpty)
                    Text(
                      k.location!,
                      style: AppText.sans(size: 14, color: AppColors.textMuted),
                    ),
                ],
              ),
              if ((k.bio ?? '').trim().isNotEmpty) ...[
                const SizedBox(height: 10),
                Text(
                  k.bio!.trim(),
                  style: AppText.sans(size: 15, height: 1.55),
                ),
              ],
              if (k.niches.isNotEmpty) ...[
                const SizedBox(height: 10),
                Wrap(
                  spacing: 6,
                  runSpacing: 6,
                  children: [for (final n in k.niches) StatusChip(n)],
                ),
              ],
            ],
          ),
        ),
      ],
    );
  }
}

class _PostCard extends StatelessWidget {
  const _PostCard({required this.post});

  final MediaKitPost post;

  @override
  Widget build(BuildContext context) {
    final p = post;
    final placeholder = Container(
      color: AppColors.bgSecondary,
      alignment: Alignment.center,
      child: Icon(
        p.isReel ? Icons.movie_outlined : Icons.image_outlined,
        color: AppColors.textMuted,
        size: 32,
      ),
    );
    return Semantics(
      button: true,
      label:
          '${p.isReel ? 'Reel' : 'Post'}, ${formatCompact(p.views)} views. Opens Instagram.',
      excludeSemantics: true,
      child: SectionCard(
        padding: EdgeInsets.zero,
        onTap: () => openLink(p.permalink),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            AspectRatio(
              aspectRatio: 4 / 5,
              child: p.imageUrl == null
                  ? placeholder
                  : Image.network(
                      p.imageUrl!,
                      fit: BoxFit.cover,
                      // Instagram's image CDN doesn't send CORS headers.
                      webHtmlElementStrategy: WebHtmlElementStrategy.fallback,
                      errorBuilder: (_, _, _) => placeholder,
                    ),
            ),
            Padding(
              padding: const EdgeInsets.all(10),
              child: Wrap(
                spacing: 10,
                runSpacing: 2,
                children: [
                  Text(
                    '${formatCompact(p.views)} views',
                    style: AppText.sans(size: 13, weight: FontWeight.w700),
                  ),
                  Text(
                    '${formatCompact(p.likes)} likes',
                    style: AppText.sans(
                      size: 13,
                      color: AppColors.textSecondary,
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _AudienceCard extends StatelessWidget {
  const _AudienceCard({
    required this.title,
    required this.data,
    this.labels = const {},
    this.cityNames = false,
  });

  final String title;
  final List<BarDatumData> data;
  final Map<String, String> labels;

  /// "Pune, Maharashtra" → "Pune".
  final bool cityNames;

  @override
  Widget build(BuildContext context) {
    String label(String raw) {
      final l = labels[raw] ?? raw;
      return cityNames ? l.split(',').first.trim() : l;
    }

    return SectionCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(title.toUpperCase(), style: AppText.label()),
          const SizedBox(height: 8),
          LabeledBars(
            data: [for (final d in data) BarDatum(label(d.label), d.share)],
          ),
        ],
      ),
    );
  }
}

class _WorkWith extends StatelessWidget {
  const _WorkWith({required this.kit});

  final MediaKit kit;

  @override
  Widget build(BuildContext context) {
    final url = mediaKitUrl(kit.handle);
    return Container(
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        color: AppColors.navy,
        borderRadius: BorderRadius.circular(16),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Work with ${kit.displayName}',
            style: AppText.heading(24, color: Colors.white),
          ),
          const SizedBox(height: 6),
          Text(
            'Invite them to a campaign on Shor. Payment is held safely until '
            'you approve the post, and you get a GST invoice for every deal.',
            style: AppText.sans(size: 15, color: AppColors.white(0.8)),
          ),
          const SizedBox(height: 16),
          Wrap(
            spacing: 10,
            runSpacing: 10,
            children: [
              if (kIsWeb)
                SolidButton(
                  label: 'Start free as a brand',
                  showArrow: true,
                  onPressed: () => openExternalUrl(
                    Uri.parse(AppConfig.websiteUrl),
                    sameTab: true,
                  ),
                ),
              OutlineActionButton(
                label: 'Copy link',
                onDark: true,
                onPressed: () async {
                  await Clipboard.setData(ClipboardData(text: url));
                  if (context.mounted) showToast(context, 'Link copied.');
                },
              ),
            ],
          ),
        ],
      ),
    );
  }
}
