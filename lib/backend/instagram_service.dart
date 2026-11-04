import 'package:flutter/foundation.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

/// The creator's connected Instagram professional account.
class InstagramAccount {
  const InstagramAccount({
    required this.username,
    this.name,
    this.profilePictureUrl,
    this.accountType,
    this.biography,
    this.followers,
    this.follows,
    this.mediaCount,
    this.needsReauth = false,
    this.lastSyncedAt,
    this.lastSyncError,
    this.tokenExpiresAt,
  });

  final String username;
  final String? name;
  final String? profilePictureUrl;

  /// BUSINESS or MEDIA_CREATOR.
  final String? accountType;
  final String? biography;
  final int? followers;
  final int? follows;
  final int? mediaCount;

  /// Instagram access expired or was revoked; the creator must reconnect.
  final bool needsReauth;
  final DateTime? lastSyncedAt;
  final String? lastSyncError;
  final DateTime? tokenExpiresAt;

  String get accountTypeLabel => switch (accountType) {
    'MEDIA_CREATOR' => 'Creator account',
    'BUSINESS' => 'Business account',
    _ => 'Professional account',
  };
}

/// Account-level metrics for one day.
class DailyMetric {
  const DailyMetric({
    required this.date,
    this.reach,
    this.views,
    this.accountsEngaged,
    this.totalInteractions,
    this.likes,
    this.comments,
    this.shares,
    this.saves,
    this.profileLinksTaps,
  });

  final DateTime date;
  final int? reach;
  final int? views;
  final int? accountsEngaged;
  final int? totalInteractions;
  final int? likes;
  final int? comments;
  final int? shares;
  final int? saves;
  final int? profileLinksTaps;
}

class FollowerPoint {
  const FollowerPoint(this.date, this.followers);

  final DateTime date;
  final int followers;
}

class InstagramPost {
  const InstagramPost({
    required this.id,
    this.caption,
    this.permalink,
    this.thumbnailUrl,
    this.productType,
    this.mediaType,
    this.postedAt,
    this.likes,
    this.comments,
    this.reach,
    this.views,
    this.saved,
    this.shares,
    this.totalInteractions,
  });

  final String id;
  final String? caption;
  final String? permalink;
  final String? thumbnailUrl;

  /// FEED or REELS.
  final String? productType;

  /// IMAGE, VIDEO or CAROUSEL_ALBUM.
  final String? mediaType;
  final DateTime? postedAt;
  final int? likes;
  final int? comments;
  final int? reach;
  final int? views;
  final int? saved;
  final int? shares;
  final int? totalInteractions;

  String get typeLabel {
    if (productType == 'REELS') return 'Reel';
    if (mediaType == 'CAROUSEL_ALBUM') return 'Carousel';
    if (mediaType == 'VIDEO') return 'Video';
    return 'Post';
  }

  int get interactions =>
      totalInteractions ??
      (likes ?? 0) + (comments ?? 0) + (saved ?? 0) + (shares ?? 0);

  /// Interactions per account reached, as a percentage.
  double? get engagementRate {
    final r = reach;
    if (r == null || r == 0) return null;
    return interactions / r * 100;
  }
}

class AudienceSlice {
  const AudienceSlice(this.breakdown, this.dimension, this.value);

  /// age, gender, country or city.
  final String breakdown;
  final String dimension;
  final int value;
}

/// Everything the insights dashboard shows.
class InstagramDashboard {
  const InstagramDashboard({
    required this.account,
    required this.daily,
    required this.followerHistory,
    required this.posts,
    required this.audience,
    this.isSample = false,
  });

  final InstagramAccount account;

  /// Oldest first.
  final List<DailyMetric> daily;

  /// Oldest first.
  final List<FollowerPoint> followerHistory;

  /// Newest first.
  final List<InstagramPost> posts;
  final List<AudienceSlice> audience;

  /// Made-up numbers for the preview; never shown as real data.
  final bool isSample;

  List<DailyMetric> lastDays(int days) =>
      daily.length <= days ? daily : daily.sublist(daily.length - days);

  List<AudienceSlice> audienceFor(String breakdown) =>
      audience.where((a) => a.breakdown == breakdown).toList()
        ..sort((a, b) => b.value.compareTo(a.value));
}

/// A failure worth showing to the user as-is.
class InstagramFailure implements Exception {
  const InstagramFailure(this.message);

  final String message;

  @override
  String toString() => message;
}

abstract interface class InstagramService {
  /// Null when the creator has not connected Instagram.
  Future<InstagramDashboard?> loadDashboard();

  /// Returns the Instagram authorization page to open.
  Future<Uri> startConnect({String? returnTo});

  /// Asks the server to fetch fresh data now. Returns false when the data
  /// was already fresh and nothing was fetched.
  Future<bool> syncNow();

  /// Disconnects Instagram and deletes everything stored for it.
  Future<void> disconnect();
}

/// The app-wide Instagram service. Created on first use.
InstagramService instagramService = SupabaseInstagramService();

class SupabaseInstagramService implements InstagramService {
  SupabaseInstagramService([SupabaseClient? client]) : _clientOverride = client;

  final SupabaseClient? _clientOverride;
  SupabaseClient get _client => _clientOverride ?? Supabase.instance.client;

  @override
  Future<InstagramDashboard?> loadDashboard() async {
    try {
      final row = await _client
          .from('instagram_accounts')
          .select(
            'id, username, name, profile_picture_url, account_type, biography, '
            'followers_count, follows_count, media_count, status, '
            'last_synced_at, last_sync_error, token_expires_at',
          )
          .maybeSingle();
      if (row == null) return null;
      final id = row['id'] as String;

      final results = await Future.wait([
        _client
            .from('instagram_daily_metrics')
            .select()
            .eq('account_id', id)
            .order('metric_date'),
        _client
            .from('instagram_account_snapshots')
            .select('captured_on, followers_count')
            .eq('account_id', id)
            .order('captured_on'),
        _client
            .from('instagram_media')
            .select()
            .eq('account_id', id)
            .order('posted_at', ascending: false),
        _client
            .from('instagram_audience')
            .select('breakdown, dimension, value')
            .eq('account_id', id),
      ]);

      return InstagramDashboard(
        account: InstagramAccount(
          username: row['username'] as String,
          name: row['name'] as String?,
          profilePictureUrl: row['profile_picture_url'] as String?,
          accountType: row['account_type'] as String?,
          biography: row['biography'] as String?,
          followers: row['followers_count'] as int?,
          follows: row['follows_count'] as int?,
          mediaCount: row['media_count'] as int?,
          needsReauth: row['status'] == 'needs_reauth',
          lastSyncedAt: _date(row['last_synced_at']),
          lastSyncError: row['last_sync_error'] as String?,
          tokenExpiresAt: _date(row['token_expires_at']),
        ),
        daily: [
          for (final m in results[0])
            DailyMetric(
              date: DateTime.parse(m['metric_date'] as String),
              reach: m['reach'] as int?,
              views: m['views'] as int?,
              accountsEngaged: m['accounts_engaged'] as int?,
              totalInteractions: m['total_interactions'] as int?,
              likes: m['likes'] as int?,
              comments: m['comments'] as int?,
              shares: m['shares'] as int?,
              saves: m['saves'] as int?,
              profileLinksTaps: m['profile_links_taps'] as int?,
            ),
        ],
        followerHistory: [
          for (final s in results[1])
            if (s['followers_count'] != null)
              FollowerPoint(
                DateTime.parse(s['captured_on'] as String),
                s['followers_count'] as int,
              ),
        ],
        posts: [
          for (final p in results[2])
            InstagramPost(
              id: p['id'] as String,
              caption: p['caption'] as String?,
              permalink: p['permalink'] as String?,
              thumbnailUrl: (p['thumbnail_url'] ?? p['media_url']) as String?,
              productType: p['media_product_type'] as String?,
              mediaType: p['media_type'] as String?,
              postedAt: _date(p['posted_at']),
              likes: p['like_count'] as int?,
              comments: p['comments_count'] as int?,
              reach: p['reach'] as int?,
              views: p['views'] as int?,
              saved: p['saved'] as int?,
              shares: p['shares'] as int?,
              totalInteractions: p['total_interactions'] as int?,
            ),
        ],
        audience: [
          for (final a in results[3])
            AudienceSlice(
              a['breakdown'] as String,
              a['dimension'] as String,
              a['value'] as int,
            ),
        ],
      );
    } on PostgrestException catch (e) {
      debugPrint('Loading Instagram data failed: ${e.code} ${e.message}');
      throw const InstagramFailure(
        'We could not load your Instagram insights. Please try again.',
      );
    } catch (e) {
      if (e is InstagramFailure) rethrow;
      debugPrint('Loading Instagram data failed: $e');
      throw const InstagramFailure(
        'Could not reach Shor. Check your connection and try again.',
      );
    }
  }

  @override
  Future<Uri> startConnect({String? returnTo}) async {
    final data = await _invoke('instagram-connect', {'return_to': ?returnTo});
    final url = data['url'];
    if (url is! String) {
      throw const InstagramFailure('Could not start the Instagram connection.');
    }
    return Uri.parse(url);
  }

  @override
  Future<bool> syncNow() async {
    final data = await _invoke('instagram-sync', const {});
    return data['status'] != 'fresh';
  }

  @override
  Future<void> disconnect() => _invoke('instagram-disconnect', const {});

  Future<Map<String, dynamic>> _invoke(
    String function,
    Map<String, dynamic> body,
  ) async {
    try {
      final res = await _client.functions.invoke(function, body: body);
      final data = res.data;
      return data is Map<String, dynamic> ? data : const {};
    } on FunctionException catch (e) {
      final details = e.details;
      final message = details is Map ? details['error'] : null;
      if (message is String) throw InstagramFailure(message);
      if (e.status == 404) {
        throw const InstagramFailure(
          'Instagram connection is not switched on yet. '
          'The server functions still need to be deployed.',
        );
      }
      throw const InstagramFailure('Something went wrong. Please try again.');
    } catch (e) {
      if (e is InstagramFailure) rethrow;
      debugPrint('Calling $function failed: $e');
      throw const InstagramFailure(
        'Could not reach Shor. Check your connection and try again.',
      );
    }
  }

  static DateTime? _date(Object? value) =>
      value is String ? DateTime.tryParse(value)?.toLocal() : null;
}

/// A believable but made-up dashboard for the "see a preview" option and
/// for tests. Always marked [InstagramDashboard.isSample].
InstagramDashboard sampleInstagramDashboard({DateTime? now}) {
  final today = DateTime.utc(
    (now ?? DateTime.now()).year,
    (now ?? DateTime.now()).month,
    (now ?? DateTime.now()).day,
  );
  // Deterministic wave so the preview looks the same every time.
  int wave(int i, int base, int amp, int phase) =>
      base + (amp * (((i * 7 + phase) % 11) - 5) / 5).round() + i * base ~/ 90;

  final daily = [
    for (var i = 0; i < 28; i++)
      DailyMetric(
        date: today.subtract(Duration(days: 28 - i)),
        reach: wave(i, 4200, 1400, 3),
        views: wave(i, 11800, 4200, 1),
        accountsEngaged: wave(i, 610, 220, 5),
        totalInteractions: wave(i, 920, 340, 2),
        likes: wave(i, 700, 260, 2),
        comments: wave(i, 64, 22, 4),
        shares: wave(i, 58, 20, 6),
        saves: wave(i, 98, 34, 7),
        profileLinksTaps: wave(i, 31, 12, 8),
      ),
  ];
  final followers = [
    for (var i = 0; i < 28; i++)
      FollowerPoint(
        today.subtract(Duration(days: 27 - i)),
        24180 + i * 46 + ((i * 5) % 7) * 9,
      ),
  ];
  const captions = [
    'Monsoon skincare routine that actually works for humid days',
    '3 ways to style one kurta for the whole week',
    'Behind the scenes of my studio shoot',
    'Honest review: the viral sunscreen everyone is talking about',
    'Street food tour in Pune under ₹500',
    'My 5-minute morning routine',
  ];
  final posts = [
    for (var i = 0; i < captions.length; i++)
      InstagramPost(
        id: 'sample-$i',
        caption: captions[i],
        productType: i.isEven ? 'REELS' : 'FEED',
        mediaType: i.isEven ? 'VIDEO' : (i == 1 ? 'CAROUSEL_ALBUM' : 'IMAGE'),
        postedAt: today.subtract(Duration(days: 2 + i * 4)),
        likes: 1800 - i * 190,
        comments: 140 - i * 14,
        reach: 16400 - i * 1700,
        views: i.isEven ? 42000 - i * 4100 : 21000 - i * 2000,
        saved: 410 - i * 40,
        shares: 260 - i * 30,
      ),
  ];
  return InstagramDashboard(
    isSample: true,
    account: InstagramAccount(
      username: 'your.handle',
      name: 'Your Name',
      accountType: 'MEDIA_CREATOR',
      followers: followers.last.followers,
      follows: 612,
      mediaCount: 284,
      lastSyncedAt: (now ?? DateTime.now()).subtract(
        const Duration(minutes: 12),
      ),
    ),
    daily: daily,
    followerHistory: followers,
    posts: posts,
    audience: const [
      AudienceSlice('age', '13-17', 820),
      AudienceSlice('age', '18-24', 9100),
      AudienceSlice('age', '25-34', 10300),
      AudienceSlice('age', '35-44', 3200),
      AudienceSlice('age', '45-54', 1100),
      AudienceSlice('age', '55-64', 380),
      AudienceSlice('age', '65+', 140),
      AudienceSlice('gender', 'F', 16900),
      AudienceSlice('gender', 'M', 8400),
      AudienceSlice('gender', 'U', 340),
      AudienceSlice('country', 'IN', 19800),
      AudienceSlice('country', 'AE', 1300),
      AudienceSlice('country', 'US', 1100),
      AudienceSlice('country', 'GB', 640),
      AudienceSlice('country', 'CA', 420),
      AudienceSlice('city', 'Mumbai, Maharashtra', 5200),
      AudienceSlice('city', 'Pune, Maharashtra', 3900),
      AudienceSlice('city', 'Delhi, Delhi', 2400),
      AudienceSlice('city', 'Bengaluru, Karnataka', 1900),
      AudienceSlice('city', 'Hyderabad, Telangana', 1100),
    ],
  );
}
