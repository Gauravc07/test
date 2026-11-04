import 'package:flutter/foundation.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

import '../utils/format.dart';
import 'marketplace_models.dart';

export 'marketplace_models.dart';

/// Bumped after every change, so open screens can reload.
final marketplaceRevision = ValueNotifier<int>(0);

/// Everything the brand and creator screens read and write. Screens take
/// this interface so tests can pass an in-memory fake.
abstract interface class MarketplaceService {
  String? get currentUserId;

  // Creators ----------------------------------------------------------------

  /// Live campaigns that are open for applications.
  Future<List<Campaign>> openCampaigns(CampaignFilter filter);

  /// The signed-in creator's collaboration status per campaign ID.
  Future<Map<String, CollabStatus>> myCampaignStatuses();

  Future<Campaign> campaign(String id);

  Future<Collaboration?> myCollaborationFor(String campaignId);

  Future<Collaboration> apply(
    String campaignId, {
    required String pitch,
    num? quote,
  });

  /// The signed-in creator's collaborations, newest activity first.
  Future<List<Collaboration>> myCollaborations();

  Future<CreatorProfileData> myCreatorProfile();

  Future<void> saveCreatorProfile(CreatorProfileData data);

  Future<void> requestPayment(Collaboration collaboration);

  // Brands ------------------------------------------------------------------

  Future<List<Campaign>> myCampaigns();

  /// Number of collaborations per campaign and status, for the brand's list.
  Future<Map<String, Map<CollabStatus, int>>> collaborationCounts();

  Future<Campaign> saveCampaign(
    CampaignDraft draft, {
    String? id,
    CampaignStatus? status,
  });

  Future<void> setCampaignStatus(String id, CampaignStatus status);

  /// Applications, invites and hires on a campaign, with creator details.
  Future<List<Collaboration>> campaignCollaborations(String campaignId);

  /// Live posts with insights (brands see all; creators their own).
  Future<List<LivePost>> campaignLivePosts(String campaignId);

  Future<List<CreatorSummary>> searchCreators(CreatorFilter filter);

  Future<CreatorSummary> creator(String id);

  Future<void> invite(
    String campaignId,
    String creatorId, {
    num? offer,
    String? message,
  });

  Future<List<Shortlist>> shortlists();

  Future<Shortlist> createShortlist(String name);

  Future<void> setShortlisted(String shortlistId, String creatorId, bool saved);

  Future<BrandProfileData> myBrandProfile();

  Future<void> saveBrandProfile(BrandProfileData data);

  Future<void> decideInvoice(String invoiceId, {required bool approve});

  // Both --------------------------------------------------------------------

  /// One collaboration with its campaign and creator details.
  Future<Collaboration> collaboration(String id);

  Future<void> setCollaborationStatus(String id, CollabStatus status);

  Future<List<Submission>> submissions(String collaborationId);

  Future<void> submit(
    String collaborationId,
    SubmissionKind kind, {
    required String url,
    String? caption,
    String? notes,
  });

  Future<void> reviewSubmission(
    String submissionId, {
    required bool approve,
    String? feedback,
  });

  Future<Invoice?> invoiceFor(String collaborationId);

  /// Invoices the signed-in user can see (their own, either side).
  Future<List<Invoice>> invoices();

  Future<List<Conversation>> conversations();

  Future<Conversation> openConversation({
    required String brandId,
    required String creatorId,
    String? campaignId,
  });

  Stream<List<ChatMessage>> messages(String conversationId);

  Future<void> sendMessage(String conversationId, String body);

  Future<void> markRead(String conversationId);

  // Safety ------------------------------------------------------------------

  /// Sends a report to Shor's moderators.
  Future<void> report(
    ReportTarget target,
    String targetId,
    ReportReason reason, {
    String? details,
  });

  /// Stops all contact with [userId] and hides their content.
  Future<void> block(String userId);

  Future<void> unblock(String userId);

  Future<List<BlockedUser>> blockedUsers();
}

/// The app-wide marketplace service. Created on first use.
MarketplaceService marketplaceService = SupabaseMarketplaceService();

class SupabaseMarketplaceService implements MarketplaceService {
  SupabaseMarketplaceService([SupabaseClient? client]) : _override = client;

  final SupabaseClient? _override;
  SupabaseClient get _db => _override ?? Supabase.instance.client;

  @override
  String? get currentUserId => _db.auth.currentUser?.id;

  String get _uid {
    final id = currentUserId;
    if (id == null) throw const MarketplaceFailure('Please log in again.');
    return id;
  }

  static const _campaignWithBrand = '*, brand_profiles(company_name, logo_url)';

  // Creators ----------------------------------------------------------------

  @override
  Future<List<Campaign>> openCampaigns(CampaignFilter filter) =>
      _guard(() async {
        var q = _db
            .from('campaigns')
            .select(_campaignWithBrand)
            .eq('status', 'active')
            .eq('visibility', 'open')
            .or(
              'application_deadline.is.null,'
              'application_deadline.gte.${sqlDate(DateTime.now())}',
            );
        if (filter.niche != null) q = q.eq('niche', filter.niche!);
        if (filter.compensation == CompensationType.barter) {
          q = q.eq('compensation_type', 'barter');
        } else if (filter.compensation != null) {
          q = q.neq('compensation_type', 'barter');
        }
        final ordered = switch (filter.sort) {
          CampaignSort.newest => q.order('created_at', ascending: false),
          CampaignSort.payout => q.order(
            'payout_per_creator',
            ascending: false,
            nullsFirst: false,
          ),
          CampaignSort.deadline => q.order(
            'application_deadline',
            ascending: true,
            nullsFirst: false,
          ),
        };
        final rows = await ordered.limit(100);
        final blocked = await _blockedIds();
        return rows
            .map(Campaign.fromRow)
            .where((c) => !blocked.contains(c.brandId))
            .toList();
      });

  @override
  Future<Map<String, CollabStatus>> myCampaignStatuses() => _guard(() async {
    final rows = await _db
        .from('collaborations')
        .select('campaign_id, status')
        .eq('creator_id', _uid);
    return {
      for (final r in rows)
        r['campaign_id'] as String: fromDb(
          CollabStatus.values,
          r['status'],
          CollabStatus.applied,
        ),
    };
  });

  @override
  Future<Campaign> campaign(String id) => _guard(() async {
    final row = await _db
        .from('campaigns')
        .select(_campaignWithBrand)
        .eq('id', id)
        .maybeSingle();
    if (row == null) {
      throw const MarketplaceFailure('This campaign is no longer available.');
    }
    return Campaign.fromRow(row);
  });

  @override
  Future<Collaboration?> myCollaborationFor(String campaignId) =>
      _guard(() async {
        final row = await _db
            .from('collaborations')
            .select()
            .eq('campaign_id', campaignId)
            .eq('creator_id', _uid)
            .maybeSingle();
        return row == null ? null : Collaboration.fromRow(row);
      });

  @override
  Future<Collaboration> apply(
    String campaignId, {
    required String pitch,
    num? quote,
  }) => _mutate(() async {
    final row = await _db
        .from('collaborations')
        .insert({
          'campaign_id': campaignId,
          'creator_id': _uid,
          'status': 'applied',
          'pitch': pitch.trim(),
          'agreed_amount': quote,
        })
        .select()
        .single();
    return Collaboration.fromRow(row);
  });

  @override
  Future<List<Collaboration>> myCollaborations() => _guard(() async {
    final rows = await _db
        .from('collaborations')
        .select('*, campaigns($_campaignWithBrand)')
        .eq('creator_id', _uid)
        .order('updated_at', ascending: false);
    return rows.map(Collaboration.fromRow).toList();
  });

  @override
  Future<CreatorProfileData> myCreatorProfile() => _guard(() async {
    final uid = _uid;
    final results = await Future.wait([
      _db.from('profiles').select('full_name').eq('id', uid).single(),
      _db
          .from('creator_profiles')
          .select('handle, bio, niches, location, rate_min, rate_max')
          .eq('id', uid)
          .single(),
      _db
          .from('social_accounts')
          .select('handle, followers, verified')
          .eq('creator_id', uid)
          .eq('platform', 'instagram')
          .maybeSingle(),
    ]);
    final profile = results[0]!;
    final creator = results[1]!;
    final instagram = results[2];
    return CreatorProfileData(
      fullName: profile['full_name'] as String? ?? '',
      handle: creator['handle'] as String?,
      bio: creator['bio'] as String?,
      niches: (creator['niches'] as List?)?.cast<String>() ?? const [],
      location: creator['location'] as String?,
      rateMin: creator['rate_min'] as num?,
      rateMax: creator['rate_max'] as num?,
      instagramHandle: instagram?['handle'] as String?,
      followers: instagram?['followers'] as int?,
      instagramVerified: instagram?['verified'] as bool? ?? false,
    );
  });

  @override
  Future<void> saveCreatorProfile(CreatorProfileData data) => _mutate(() async {
    String? text(String? s) => s == null || s.trim().isEmpty ? null : s.trim();
    final uid = _uid;
    await _db
        .from('profiles')
        .update({'full_name': data.fullName.trim()})
        .eq('id', uid);
    await _db
        .from('creator_profiles')
        .update({
          'handle': text(data.handle)?.replaceFirst('@', ''),
          'bio': text(data.bio),
          'niches': data.niches,
          'location': text(data.location),
          'rate_min': data.rateMin,
          'rate_max': data.rateMax,
        })
        .eq('id', uid);
  });

  @override
  Future<void> requestPayment(Collaboration c) => _mutate(() async {
    final amount = c.agreedAmount;
    if (amount == null || amount <= 0) {
      throw const MarketplaceFailure(
        'There is no agreed amount to invoice. Agree one with the brand in chat first.',
      );
    }
    await _db.from('invoices').insert({
      'collaboration_id': c.id,
      'gross_amount': amount,
      'description': deliverablesSummary(c.deliverables),
    });
  });

  // Brands ------------------------------------------------------------------

  @override
  Future<List<Campaign>> myCampaigns() => _guard(() async {
    final rows = await _db
        .from('campaigns')
        .select(_campaignWithBrand)
        .eq('brand_id', _uid)
        .order('created_at', ascending: false);
    return rows.map(Campaign.fromRow).toList();
  });

  @override
  Future<Map<String, Map<CollabStatus, int>>> collaborationCounts() =>
      _guard(() async {
        final rows = await _db
            .from('collaborations')
            .select('campaign_id, status')
            .eq('brand_id', _uid);
        final counts = <String, Map<CollabStatus, int>>{};
        for (final r in rows) {
          final status = fromDb(
            CollabStatus.values,
            r['status'],
            CollabStatus.applied,
          );
          final perCampaign = counts.putIfAbsent(
            r['campaign_id'] as String,
            () => {},
          );
          perCampaign[status] = (perCampaign[status] ?? 0) + 1;
        }
        return counts;
      });

  @override
  Future<Campaign> saveCampaign(
    CampaignDraft draft, {
    String? id,
    CampaignStatus? status,
  }) => _mutate(() async {
    final row = {...draft.toRow(), 'status': ?status.let(dbName)};
    final saved = id == null
        ? await _db
              .from('campaigns')
              .insert({...row, 'brand_id': _uid})
              .select(_campaignWithBrand)
              .single()
        : await _db
              .from('campaigns')
              .update(row)
              .eq('id', id)
              .select(_campaignWithBrand)
              .single();
    return Campaign.fromRow(saved);
  });

  @override
  Future<void> setCampaignStatus(String id, CampaignStatus status) =>
      _mutate(() async {
        final rows = await _db
            .from('campaigns')
            .update({'status': dbName(status)})
            .eq('id', id)
            .select('id');
        if (rows.isEmpty) {
          throw const MarketplaceFailure(
            'You can only change your own campaigns.',
          );
        }
      });

  @override
  Future<List<Collaboration>> campaignCollaborations(String campaignId) =>
      _guard(() async {
        final rows = await _db
            .from('collaborations')
            .select()
            .eq('campaign_id', campaignId)
            .order('created_at', ascending: false);
        final creators = await _creators(
          rows.map((r) => r['creator_id'] as String),
        );
        return [
          for (final r in rows)
            Collaboration.fromRow(r, creator: creators[r['creator_id']]),
        ];
      });

  @override
  Future<List<LivePost>> campaignLivePosts(String campaignId) =>
      _guard(() async {
        final rows = await _db.rpc(
          'campaign_live_posts',
          params: {'p_campaign_id': campaignId},
        );
        return [
          for (final r in rows as List)
            LivePost.fromRow(Map<String, dynamic>.from(r as Map)),
        ];
      });

  @override
  Future<List<CreatorSummary>> searchCreators(CreatorFilter filter) =>
      _guard(() async {
        var q = _db.from('creator_directory').select();
        // Keep only characters that are safe inside a PostgREST filter.
        final term = filter.query.replaceAll(RegExp(r'[^\w\s.\-]'), ' ').trim();
        if (term.isNotEmpty) {
          q = q.or(
            'full_name.ilike."*$term*",handle.ilike."*$term*",'
            'instagram_handle.ilike."*$term*"',
          );
        }
        if (filter.niche != null) q = q.contains('niches', [filter.niche!]);
        final city = filter.city.replaceAll(RegExp(r'[%*,()]'), ' ').trim();
        if (city.isNotEmpty) q = q.ilike('location', '%$city%');
        if (filter.tier.min != null) {
          q = q.gte('instagram_followers', filter.tier.min!);
        }
        if (filter.tier.max != null) {
          q = q.lt('instagram_followers', filter.tier.max!);
        }
        if (filter.verifiedOnly) q = q.eq('instagram_verified', true);
        if (filter.shortlistId != null) {
          final saved = await _db
              .from('shortlist_items')
              .select('creator_id')
              .eq('shortlist_id', filter.shortlistId!);
          final ids = saved.map((r) => r['creator_id'] as String).toList();
          if (ids.isEmpty) return const [];
          q = q.inFilter('id', ids);
        }
        final ordered = switch (filter.sort) {
          CreatorSort.followers => q.order(
            'instagram_followers',
            ascending: false,
            nullsFirst: false,
          ),
          CreatorSort.engagement => q.order(
            'instagram_engagement',
            ascending: false,
            nullsFirst: false,
          ),
          CreatorSort.newest => q.order('created_at', ascending: false),
        };
        final rows = await ordered.limit(60);
        final blocked = await _blockedIds();
        return rows
            .map(CreatorSummary.fromRow)
            .where((c) => !blocked.contains(c.id))
            .toList();
      });

  @override
  Future<CreatorSummary> creator(String id) => _guard(() async {
    final row = await _db
        .from('creator_directory')
        .select()
        .eq('id', id)
        .maybeSingle();
    if (row == null) throw const MarketplaceFailure('Creator not found.');
    return CreatorSummary.fromRow(row);
  });

  @override
  Future<void> invite(
    String campaignId,
    String creatorId, {
    num? offer,
    String? message,
  }) => _mutate(() async {
    await _db.from('collaborations').insert({
      'campaign_id': campaignId,
      'creator_id': creatorId,
      'status': 'invited',
      'agreed_amount': offer,
    });
    final text = message?.trim() ?? '';
    if (text.isNotEmpty) {
      final conversation = await openConversation(
        brandId: _uid,
        creatorId: creatorId,
        campaignId: campaignId,
      );
      await sendMessage(conversation.id, text);
    }
  });

  @override
  Future<List<Shortlist>> shortlists() => _guard(() async {
    final rows = await _db
        .from('shortlists')
        .select('id, name, shortlist_items(creator_id)')
        .order('created_at');
    return [
      for (final r in rows)
        Shortlist(
          id: r['id'] as String,
          name: r['name'] as String,
          creatorIds: {
            for (final i in (r['shortlist_items'] as List? ?? const []))
              (i as Map)['creator_id'] as String,
          },
        ),
    ];
  });

  @override
  Future<Shortlist> createShortlist(String name) => _mutate(() async {
    final row = await _db
        .from('shortlists')
        .insert({'name': name.trim()})
        .select('id, name')
        .single();
    return Shortlist(id: row['id'] as String, name: row['name'] as String);
  });

  @override
  Future<void> setShortlisted(
    String shortlistId,
    String creatorId,
    bool saved,
  ) => _mutate(() async {
    if (saved) {
      await _db.from('shortlist_items').upsert({
        'shortlist_id': shortlistId,
        'creator_id': creatorId,
      });
    } else {
      await _db
          .from('shortlist_items')
          .delete()
          .eq('shortlist_id', shortlistId)
          .eq('creator_id', creatorId);
    }
  });

  @override
  Future<BrandProfileData> myBrandProfile() => _guard(() async {
    final row = await _db
        .from('brand_profiles')
        .select('company_name, website, industry, description')
        .eq('id', _uid)
        .single();
    return BrandProfileData(
      companyName: row['company_name'] as String? ?? '',
      website: row['website'] as String?,
      industry: row['industry'] as String?,
      description: row['description'] as String?,
    );
  });

  @override
  Future<void> saveBrandProfile(BrandProfileData data) => _mutate(() async {
    String? text(String? s) => s == null || s.trim().isEmpty ? null : s.trim();
    await _db
        .from('brand_profiles')
        .update({
          'company_name': data.companyName.trim(),
          'website': text(data.website),
          'industry': text(data.industry),
          'description': text(data.description),
        })
        .eq('id', _uid);
  });

  @override
  Future<void> decideInvoice(String invoiceId, {required bool approve}) =>
      _mutate(() async {
        final rows = await _db
            .from('invoices')
            .update({'status': approve ? 'approved' : 'rejected'})
            .eq('id', invoiceId)
            .select('id');
        if (rows.isEmpty) {
          throw const MarketplaceFailure(
            'Only the brand can approve this invoice.',
          );
        }
      });

  // Both --------------------------------------------------------------------

  @override
  Future<Collaboration> collaboration(String id) => _guard(() async {
    final row = await _db
        .from('collaborations')
        .select('*, campaigns($_campaignWithBrand)')
        .eq('id', id)
        .maybeSingle();
    if (row == null) {
      throw const MarketplaceFailure('This collaboration is not available.');
    }
    final creators = await _creators([row['creator_id'] as String]);
    return Collaboration.fromRow(row, creator: creators[row['creator_id']]);
  });

  @override
  Future<void> setCollaborationStatus(String id, CollabStatus status) =>
      _mutate(() async {
        final rows = await _db
            .from('collaborations')
            .update({'status': dbName(status)})
            .eq('id', id)
            .select('id');
        if (rows.isEmpty) {
          throw const MarketplaceFailure(
            'You cannot change this collaboration.',
          );
        }
      });

  @override
  Future<List<Submission>> submissions(String collaborationId) =>
      _guard(() async {
        final rows = await _db
            .from('collaboration_submissions')
            .select()
            .eq('collaboration_id', collaborationId)
            .order('created_at', ascending: false);
        return rows.map(Submission.fromRow).toList();
      });

  @override
  Future<void> submit(
    String collaborationId,
    SubmissionKind kind, {
    required String url,
    String? caption,
    String? notes,
  }) => _mutate(() async {
    String? text(String? s) => s == null || s.trim().isEmpty ? null : s.trim();
    await _db.from('collaboration_submissions').insert({
      'collaboration_id': collaborationId,
      'kind': dbName(kind),
      'content_url': url.trim(),
      'caption': text(caption),
      'notes': text(notes),
    });
  });

  @override
  Future<void> reviewSubmission(
    String submissionId, {
    required bool approve,
    String? feedback,
  }) => _mutate(() async {
    final rows = await _db
        .from('collaboration_submissions')
        .update({
          'status': approve ? 'approved' : 'changes_requested',
          'feedback': feedback?.trim().isEmpty ?? true
              ? null
              : feedback!.trim(),
        })
        .eq('id', submissionId)
        .select('id');
    if (rows.isEmpty) {
      throw const MarketplaceFailure(
        'Only the brand can review this submission.',
      );
    }
  });

  static const _invoiceSelect =
      '*, collaborations(campaigns(title)), brand_profiles(company_name)';

  @override
  Future<Invoice?> invoiceFor(String collaborationId) => _guard(() async {
    final rows = await _db
        .from('invoices')
        .select(_invoiceSelect)
        .eq('collaboration_id', collaborationId)
        .order('created_at', ascending: false)
        .limit(1);
    return rows.isEmpty ? null : Invoice.fromRow(rows.first);
  });

  @override
  Future<List<Invoice>> invoices() => _guard(() async {
    final uid = _uid;
    final rows = await _db
        .from('invoices')
        .select(_invoiceSelect)
        .order('created_at', ascending: false);
    final creators = await _creators(
      rows
          .where((r) => r['brand_id'] == uid)
          .map((r) => r['creator_id'] as String),
    );
    return [
      for (final r in rows)
        Invoice.fromRow(
          r,
          counterpartName: r['brand_id'] == uid
              ? creators[r['creator_id']]?.displayName
              : null,
        ),
    ];
  });

  @override
  Future<List<Conversation>> conversations() => _guard(() async {
    final uid = _uid;
    final rows = await _db
        .from('conversations')
        .select('*, campaigns(title), brand_profiles(company_name)')
        .order('last_message_at', ascending: false, nullsFirst: false);
    final unreadRows = await _db
        .from('messages')
        .select('conversation_id')
        .isFilter('read_at', null)
        .neq('sender_id', uid);
    final unread = <String, int>{};
    for (final r in unreadRows) {
      final id = r['conversation_id'] as String;
      unread[id] = (unread[id] ?? 0) + 1;
    }
    final creators = await _creators(
      rows.map((r) => r['creator_id'] as String),
    );
    final blocked = await _blockedIds();
    return [
      for (final r in rows)
        // Chats with people you blocked are hidden.
        if (!blocked.contains(r['brand_id']) &&
            !blocked.contains(r['creator_id']))
          Conversation.fromRow(
            r,
            creatorName: creators[r['creator_id']]?.displayName,
            unread: unread[r['id']] ?? 0,
          ),
    ];
  });

  @override
  Future<Conversation> openConversation({
    required String brandId,
    required String creatorId,
    String? campaignId,
  }) => _guard(() async {
    Future<Map<String, dynamic>?> find() {
      var q = _db
          .from('conversations')
          .select('*, campaigns(title), brand_profiles(company_name)')
          .eq('brand_id', brandId)
          .eq('creator_id', creatorId);
      q = campaignId == null
          ? q.isFilter('campaign_id', null)
          : q.eq('campaign_id', campaignId);
      return q.maybeSingle();
    }

    var row = await find();
    if (row == null) {
      try {
        await _db.from('conversations').insert({
          'brand_id': brandId,
          'creator_id': creatorId,
          'campaign_id': campaignId,
        });
      } on PostgrestException catch (e) {
        if (e.code != '23505') rethrow; // created meanwhile by the other side
      }
      row = await find();
    }
    if (row == null) throw const MarketplaceFailure('Could not open the chat.');
    final creators = await _creators([creatorId]);
    return Conversation.fromRow(
      row,
      creatorName: creators[creatorId]?.displayName,
    );
  });

  @override
  Stream<List<ChatMessage>> messages(String conversationId) => _db
      .from('messages')
      .stream(primaryKey: ['id'])
      .eq('conversation_id', conversationId)
      .order('created_at', ascending: true)
      .map((rows) => rows.map(ChatMessage.fromRow).toList());

  @override
  Future<void> sendMessage(String conversationId, String body) =>
      _guard(() async {
        await _db.from('messages').insert({
          'conversation_id': conversationId,
          'body': body.trim(),
        });
      });

  @override
  Future<void> markRead(String conversationId) => _guard(() async {
    await _db
        .from('messages')
        .update({'read_at': DateTime.now().toUtc().toIso8601String()})
        .eq('conversation_id', conversationId)
        .neq('sender_id', _uid)
        .isFilter('read_at', null);
  });

  // Safety ------------------------------------------------------------------

  @override
  Future<void> report(
    ReportTarget target,
    String targetId,
    ReportReason reason, {
    String? details,
  }) => _guard(() async {
    final text = details?.trim() ?? '';
    // No .select(): reporters may not read back moderator-only columns.
    await _db.from('content_reports').insert({
      'target_type': dbName(target),
      'target_id': targetId,
      'reason': dbName(reason),
      'details': text.isEmpty ? null : text,
    });
  });

  @override
  Future<void> block(String userId) => _mutate(() async {
    await _db
        .from('user_blocks')
        .upsert(
          {'blocked_id': userId},
          onConflict: 'blocker_id,blocked_id',
          ignoreDuplicates: true,
        );
  });

  @override
  Future<void> unblock(String userId) => _mutate(() async {
    await _db.from('user_blocks').delete().eq('blocked_id', userId);
  });

  @override
  Future<List<BlockedUser>> blockedUsers() => _guard(() async {
    final rows = await _db
        .from('user_blocks')
        .select('blocked_id, created_at')
        .order('created_at', ascending: false);
    final ids = rows.map((r) => r['blocked_id'] as String).toList();
    if (ids.isEmpty) return const [];
    final people = await _db
        .from('profiles')
        .select('id, full_name')
        .inFilter('id', ids);
    final brands = await _db
        .from('brand_profiles')
        .select('id, company_name')
        .inFilter('id', ids);
    final names = {
      for (final p in people)
        p['id'] as String: p['full_name'] as String? ?? '',
      for (final b in brands)
        b['id'] as String: b['company_name'] as String? ?? '',
    };
    return [
      for (final r in rows)
        BlockedUser(
          id: r['blocked_id'] as String,
          name: (names[r['blocked_id']] ?? '').trim().isEmpty
              ? 'Shor user'
              : names[r['blocked_id']]!.trim(),
          blockedAt: parseTimestamp(r['created_at']),
        ),
    ];
  });

  /// People the signed-in user blocked; their content is hidden.
  Future<Set<String>> _blockedIds() async {
    final rows = await _db.from('user_blocks').select('blocked_id');
    return {for (final r in rows) r['blocked_id'] as String};
  }

  // Helpers -----------------------------------------------------------------

  Future<Map<String, CreatorSummary>> _creators(Iterable<String> ids) async {
    final unique = ids.toSet().toList();
    if (unique.isEmpty) return const {};
    final rows = await _db
        .from('creator_directory')
        .select()
        .inFilter('id', unique);
    return {for (final r in rows) r['id'] as String: CreatorSummary.fromRow(r)};
  }

  /// Runs a write and tells open screens to refresh.
  Future<T> _mutate<T>(Future<T> Function() run) async {
    final result = await _guard(run);
    marketplaceRevision.value++;
    return result;
  }

  /// Turns database and network errors into messages fit for the UI.
  Future<T> _guard<T>(Future<T> Function() run) async {
    try {
      return await run();
    } on MarketplaceFailure {
      rethrow;
    } on PostgrestException catch (e) {
      throw MarketplaceFailure(friendlyDatabaseError(e.code, e.message));
    } catch (e) {
      debugPrint('Marketplace request failed: $e');
      throw const MarketplaceFailure(
        'Could not reach Shor. Check your connection and try again.',
      );
    }
  }
}

/// Our database rules raise readable messages; pass those through and
/// replace the technical ones.
@visibleForTesting
String friendlyDatabaseError(String? code, String message) {
  final technical =
      message.contains('row-level security') ||
      message.startsWith('permission denied') ||
      message.contains('violates') ||
      message.contains('syntax') ||
      message.contains('column');
  if (code == '23505') {
    if (message.contains('collaborations_campaign_id_creator_id_key')) {
      return 'This creator is already part of that campaign.';
    }
    if (message.contains('handle')) return 'That handle is already taken.';
    if (message.contains('shortlists_brand_id_name_key')) {
      return 'You already have a list with that name.';
    }
    return 'That already exists.';
  }
  if (!technical && (code == '42501' || code == '22023' || code == 'P0001')) {
    return message;
  }
  if (code == '23514') {
    return 'Some details are not valid. Check the form and try again.';
  }
  // Chat rules: participants only, and no messages between blocked people.
  if (message.contains('row-level security') &&
      (message.contains('"messages"') || message.contains('"conversations"'))) {
    return 'You can’t message this account.';
  }
  if (technical && (code == '42501' || code == '42P01')) {
    return 'You do not have permission to do that.';
  }
  debugPrint('Database error $code: $message');
  return 'Something went wrong. Please try again.';
}

extension<T extends Object> on T? {
  R? let<R>(R Function(T value) f) {
    final v = this;
    return v == null ? null : f(v);
  }
}
