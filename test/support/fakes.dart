import 'dart:async';

import 'package:shor/backend/auth_service.dart';
import 'package:shor/backend/instagram_service.dart';
import 'package:shor/backend/marketplace_service.dart';

const brandId = 'brand-1';
const creatorId = 'creator-1';
const otherCreatorId = 'creator-2';

class FakeAuth implements AuthService {
  FakeAuth(this.account);

  final Account account;
  bool signedOut = false;

  @override
  bool get isSignedIn => !signedOut;

  @override
  Future<Account> loadAccount() async => account;

  @override
  Future<void> signIn({
    required String email,
    required String password,
  }) async {}

  @override
  Future<SignUpOutcome> signUp({
    required String email,
    required String password,
    required String fullName,
    required AccountRole role,
    String? companyName,
  }) async => SignUpOutcome.signedIn;

  @override
  Future<void> signOut() async => signedOut = true;
}

const brandAccount = Account(
  id: brandId,
  email: 'bea@acme.test',
  role: AccountRole.brand,
  fullName: 'Bea Brand',
  companyName: 'Acme Skin',
);

const creatorAccount = Account(
  id: creatorId,
  email: 'cara@creates.test',
  role: AccountRole.creator,
  fullName: 'Cara Creates',
);

class FakeInstagram implements InstagramService {
  @override
  Future<InstagramDashboard?> loadDashboard() async => null;

  @override
  Future<Uri> startConnect({String? returnTo}) async =>
      Uri.parse('https://www.instagram.com/oauth/authorize');

  @override
  Future<bool> syncNow() async => true;

  @override
  Future<void> disconnect() async {}
}

/// In-memory marketplace that follows the same core rules as the database.
class FakeMarketplace implements MarketplaceService {
  FakeMarketplace({required this.userId}) {
    _seed();
  }

  String userId;
  int _seq = 0;
  String _id(String prefix) => '$prefix-${++_seq}';

  final campaigns = <String, Campaign>{};
  final collabs = <String, Collaboration>{};
  final creators = <String, CreatorSummary>{};
  final subs = <String, Submission>{};
  final invoicesById = <String, Invoice>{};
  final lists = <String, (String, Set<String>)>{};
  final convs = <String, Conversation>{};
  final msgs = <String, List<ChatMessage>>{};
  final _msgStreams = <String, StreamController<List<ChatMessage>>>{};
  final live = <String, LivePost>{};
  final sentMessages = <String>[];

  CreatorProfileData creatorProfile = const CreatorProfileData(
    fullName: 'Cara Creates',
    handle: 'cara.creates',
    niches: ['Beauty'],
    location: 'Pune',
    rateMin: 8000,
    rateMax: 15000,
    instagramHandle: 'cara.creates',
    followers: 24500,
    instagramVerified: true,
  );
  BrandProfileData brandProfile = const BrandProfileData(
    companyName: 'Acme Skin',
  );

  void _changed() => marketplaceRevision.value++;

  void _seed() {
    creators[creatorId] = const CreatorSummary(
      id: creatorId,
      fullName: 'Cara Creates',
      niches: ['Beauty', 'Lifestyle'],
      location: 'Pune',
      rateMin: 8000,
      rateMax: 15000,
      instagramHandle: 'cara.creates',
      followers: 24500,
      engagementRate: 6.4,
      instagramVerified: true,
    );
    creators[otherCreatorId] = const CreatorSummary(
      id: otherCreatorId,
      fullName: 'Dev Eats',
      niches: ['Food'],
      location: 'Mumbai',
      instagramHandle: 'dev.eats',
      followers: 4200,
    );
    campaigns['camp-1'] = _campaign(
      id: 'camp-1',
      title: 'Monsoon skincare reels',
      status: CampaignStatus.active,
      payout: 12000,
      acceptsQuotes: true,
      niche: 'Beauty',
    );
    campaigns['camp-2'] = _campaign(
      id: 'camp-2',
      title: 'Cafe launch in Pune',
      status: CampaignStatus.active,
      compensation: CompensationType.barter,
      acceptsQuotes: false,
      niche: 'Food',
      productDetails: 'Tasting menu for two',
    );
  }

  Campaign _campaign({
    required String id,
    required String title,
    CampaignStatus status = CampaignStatus.draft,
    CompensationType compensation = CompensationType.paid,
    CampaignVisibility visibility = CampaignVisibility.open,
    num? payout,
    bool acceptsQuotes = true,
    String? niche,
    String? productDetails,
    Map<String, int> deliverables = const {'reels': 1},
    int? slots,
  }) => Campaign(
    id: id,
    brandId: brandId,
    brandName: brandProfile.companyName,
    title: title,
    status: status,
    compensation: compensation,
    visibility: visibility,
    payoutPerCreator: payout,
    acceptsQuotes: acceptsQuotes,
    niche: niche,
    productDetails: productDetails,
    deliverables: deliverables,
    creatorSlots: slots,
    description: 'Show how the product fits your routine.',
    guidelines: 'Tag @acme and use #ad.',
    createdAt: DateTime(2026, 11, 1),
  );

  Campaign _withStatus(Campaign c, CampaignStatus s) => _campaign(
    id: c.id,
    title: c.title,
    status: s,
    compensation: c.compensation,
    visibility: c.visibility,
    payout: c.payoutPerCreator,
    acceptsQuotes: c.acceptsQuotes,
    niche: c.niche,
    productDetails: c.productDetails,
    deliverables: c.deliverables,
    slots: c.creatorSlots,
  );

  Collaboration _collab(
    Collaboration c, {
    CollabStatus? status,
    bool embed = true,
  }) => Collaboration(
    id: c.id,
    campaignId: c.campaignId,
    creatorId: c.creatorId,
    brandId: c.brandId,
    status: status ?? c.status,
    pitch: c.pitch,
    agreedAmount: c.agreedAmount,
    deliverables: c.deliverables,
    campaign: embed ? campaigns[c.campaignId] : null,
    creator: embed ? creators[c.creatorId] : null,
  );

  /// Adds a collaboration directly (test setup).
  Collaboration addCollab({
    String campaignId = 'camp-1',
    String creator = creatorId,
    required CollabStatus status,
    num? amount = 12000,
    String? pitch = 'I make calm, honest skincare reels for 24K followers.',
  }) {
    final c = Collaboration(
      id: _id('collab'),
      campaignId: campaignId,
      creatorId: creator,
      brandId: brandId,
      status: status,
      pitch: pitch,
      agreedAmount: amount,
      deliverables: const {'reels': 1},
    );
    collabs[c.id] = c;
    return c;
  }

  /// Adds a submission directly (test setup).
  Submission addSubmission(
    String collaborationId,
    SubmissionKind kind,
    SubmissionStatus status, {
    String url = 'https://drive.example.com/draft',
  }) {
    final s = Submission(
      id: _id('sub'),
      collaborationId: collaborationId,
      kind: kind,
      contentUrl: url,
      status: status,
      createdAt: DateTime.now(),
    );
    subs[s.id] = s;
    return s;
  }

  @override
  String? get currentUserId => userId;

  // Creators ----------------------------------------------------------------

  @override
  Future<List<Campaign>> openCampaigns(CampaignFilter filter) async => [
    for (final c in campaigns.values)
      if (c.status == CampaignStatus.active &&
          c.visibility == CampaignVisibility.open &&
          (filter.niche == null || c.niche == filter.niche) &&
          (filter.compensation == null ||
              (filter.compensation == CompensationType.barter) == c.isBarter))
        c,
  ];

  @override
  Future<Map<String, CollabStatus>> myCampaignStatuses() async => {
    for (final c in collabs.values)
      if (c.creatorId == userId) c.campaignId: c.status,
  };

  @override
  Future<Campaign> campaign(String id) async =>
      campaigns[id] ?? (throw const MarketplaceFailure('Not found'));

  @override
  Future<Collaboration?> myCollaborationFor(String campaignId) async {
    for (final c in collabs.values) {
      if (c.campaignId == campaignId && c.creatorId == userId) return c;
    }
    return null;
  }

  @override
  Future<Collaboration> apply(
    String campaignId, {
    required String pitch,
    num? quote,
  }) async {
    final campaign = campaigns[campaignId]!;
    if (!campaign.acceptingApplications) {
      throw const MarketplaceFailure(
        'this campaign is not accepting applications',
      );
    }
    final c = Collaboration(
      id: _id('collab'),
      campaignId: campaignId,
      creatorId: userId,
      brandId: campaign.brandId,
      status: CollabStatus.applied,
      pitch: pitch,
      agreedAmount: campaign.isBarter
          ? null
          : (campaign.acceptsQuotes ? quote : campaign.payoutPerCreator),
      deliverables: campaign.deliverables,
    );
    collabs[c.id] = c;
    _changed();
    return c;
  }

  @override
  Future<List<Collaboration>> myCollaborations() async => [
    for (final c in collabs.values)
      if (c.creatorId == userId) _collab(c),
  ];

  @override
  Future<CreatorProfileData> myCreatorProfile() async => creatorProfile;

  @override
  Future<void> saveCreatorProfile(CreatorProfileData data) async {
    creatorProfile = data;
    _changed();
  }

  @override
  Future<void> requestPayment(Collaboration c) async {
    final gross = c.agreedAmount!;
    final i = Invoice(
      id: _id('inv'),
      number: 'INV-2026-0000$_seq',
      collaborationId: c.id,
      brandId: c.brandId,
      creatorId: c.creatorId,
      gross: gross,
      fee: gross * 0.1,
      net: gross * 0.9,
      status: InvoiceStatus.pending,
      campaignTitle: campaigns[c.campaignId]?.title,
      createdAt: DateTime.now(),
    );
    invoicesById[i.id] = i;
    _changed();
  }

  // Brands ------------------------------------------------------------------

  @override
  Future<List<Campaign>> myCampaigns() async => [
    for (final c in campaigns.values)
      if (c.brandId == userId) c,
  ];

  @override
  Future<Map<String, Map<CollabStatus, int>>> collaborationCounts() async {
    final counts = <String, Map<CollabStatus, int>>{};
    for (final c in collabs.values) {
      final m = counts.putIfAbsent(c.campaignId, () => {});
      m[c.status] = (m[c.status] ?? 0) + 1;
    }
    return counts;
  }

  @override
  Future<Campaign> saveCampaign(
    CampaignDraft draft, {
    String? id,
    CampaignStatus? status,
  }) async {
    final existing = id == null ? null : campaigns[id];
    final c = _campaign(
      id: id ?? _id('camp'),
      title: draft.title.trim(),
      status: status ?? existing?.status ?? CampaignStatus.draft,
      compensation: draft.compensation,
      visibility: draft.visibility,
      payout: draft.payoutPerCreator,
      acceptsQuotes: draft.acceptsQuotes,
      niche: draft.niche,
      productDetails: draft.productDetails,
      deliverables: {
        for (final e in draft.deliverables.entries)
          if (e.value > 0) e.key: e.value,
      },
      slots: draft.creatorSlots,
    );
    campaigns[c.id] = c;
    _changed();
    return c;
  }

  @override
  Future<void> setCampaignStatus(String id, CampaignStatus status) async {
    campaigns[id] = _withStatus(campaigns[id]!, status);
    _changed();
  }

  @override
  Future<List<Collaboration>> campaignCollaborations(String campaignId) async =>
      [
        for (final c in collabs.values)
          if (c.campaignId == campaignId)
            _collab(c, embed: false).withCreator(creators[c.creatorId]),
      ];

  @override
  Future<List<LivePost>> campaignLivePosts(String campaignId) async => [
    for (final p in live.values)
      if (collabs[p.collaborationId]?.campaignId == campaignId) p,
  ];

  @override
  Future<List<CreatorSummary>> searchCreators(CreatorFilter filter) async {
    final q = filter.query.toLowerCase();
    final saved = filter.shortlistId == null
        ? null
        : lists[filter.shortlistId]?.$2;
    return [
      for (final c in creators.values)
        if ((q.isEmpty ||
                c.fullName.toLowerCase().contains(q) ||
                (c.instagramHandle ?? '').contains(q)) &&
            (filter.niche == null || c.niches.contains(filter.niche)) &&
            (!filter.verifiedOnly || c.instagramVerified) &&
            (filter.tier.min == null ||
                (c.followers ?? 0) >= filter.tier.min!) &&
            (filter.tier.max == null ||
                (c.followers ?? 0) < filter.tier.max!) &&
            (saved == null || saved.contains(c.id)))
          c,
    ];
  }

  @override
  Future<CreatorSummary> creator(String id) async => creators[id]!;

  @override
  Future<void> invite(
    String campaignId,
    String creatorId, {
    num? offer,
    String? message,
  }) async {
    if (collabs.values.any(
      (c) => c.campaignId == campaignId && c.creatorId == creatorId,
    )) {
      throw const MarketplaceFailure(
        'This creator is already part of that campaign.',
      );
    }
    addCollab(
      campaignId: campaignId,
      creator: creatorId,
      status: CollabStatus.invited,
      amount: offer,
      pitch: null,
    );
    if ((message ?? '').trim().isNotEmpty) sentMessages.add(message!.trim());
    _changed();
  }

  @override
  Future<List<Shortlist>> shortlists() async => [
    for (final e in lists.entries)
      Shortlist(id: e.key, name: e.value.$1, creatorIds: {...e.value.$2}),
  ];

  @override
  Future<Shortlist> createShortlist(String name) async {
    final id = _id('list');
    lists[id] = (name, <String>{});
    _changed();
    return Shortlist(id: id, name: name);
  }

  @override
  Future<void> setShortlisted(
    String shortlistId,
    String creatorId,
    bool saved,
  ) async {
    final ids = lists[shortlistId]!.$2;
    saved ? ids.add(creatorId) : ids.remove(creatorId);
    _changed();
  }

  @override
  Future<BrandProfileData> myBrandProfile() async => brandProfile;

  @override
  Future<void> saveBrandProfile(BrandProfileData data) async {
    brandProfile = data;
    _changed();
  }

  @override
  Future<void> decideInvoice(String invoiceId, {required bool approve}) async {
    final i = invoicesById[invoiceId]!;
    invoicesById[invoiceId] = Invoice(
      id: i.id,
      number: i.number,
      collaborationId: i.collaborationId,
      brandId: i.brandId,
      creatorId: i.creatorId,
      gross: i.gross,
      fee: i.fee,
      net: i.net,
      status: approve ? InvoiceStatus.approved : InvoiceStatus.rejected,
      campaignTitle: i.campaignTitle,
      createdAt: i.createdAt,
    );
    _changed();
  }

  // Both --------------------------------------------------------------------

  @override
  Future<Collaboration> collaboration(String id) async => _collab(collabs[id]!);

  @override
  Future<void> setCollaborationStatus(String id, CollabStatus status) async {
    collabs[id] = _collab(collabs[id]!, status: status, embed: false);
    _changed();
  }

  @override
  Future<List<Submission>> submissions(String collaborationId) async => subs
      .values
      .where((s) => s.collaborationId == collaborationId)
      .toList()
      .reversed
      .toList();

  @override
  Future<void> submit(
    String collaborationId,
    SubmissionKind kind, {
    required String url,
    String? caption,
    String? notes,
  }) async {
    if (subs.values.any(
      (s) =>
          s.collaborationId == collaborationId &&
          s.status == SubmissionStatus.pending,
    )) {
      throw const MarketplaceFailure(
        'your last submission is still waiting for review',
      );
    }
    addSubmission(collaborationId, kind, SubmissionStatus.pending, url: url);
    final c = collabs[collaborationId]!;
    if (kind == SubmissionKind.draft && c.status == CollabStatus.accepted) {
      collabs[collaborationId] = _collab(
        c,
        status: CollabStatus.inProgress,
        embed: false,
      );
    } else if (kind == SubmissionKind.live) {
      collabs[collaborationId] = _collab(
        c,
        status: CollabStatus.awaitingApproval,
        embed: false,
      );
    }
    _changed();
  }

  @override
  Future<void> reviewSubmission(
    String submissionId, {
    required bool approve,
    String? feedback,
  }) async {
    final s = subs[submissionId]!;
    subs[submissionId] = Submission(
      id: s.id,
      collaborationId: s.collaborationId,
      kind: s.kind,
      contentUrl: s.contentUrl,
      status: approve
          ? SubmissionStatus.approved
          : SubmissionStatus.changesRequested,
      feedback: feedback,
      createdAt: s.createdAt,
    );
    final c = collabs[s.collaborationId]!;
    if (s.kind == SubmissionKind.live) {
      collabs[c.id] = _collab(
        c,
        status: approve ? CollabStatus.completed : CollabStatus.inProgress,
        embed: false,
      );
    }
    _changed();
  }

  @override
  Future<Invoice?> invoiceFor(String collaborationId) async {
    for (final i in invoicesById.values) {
      if (i.collaborationId == collaborationId) return i;
    }
    return null;
  }

  @override
  Future<List<Invoice>> invoices() async => invoicesById.values.toList();

  @override
  Future<List<Conversation>> conversations() async => convs.values.toList();

  @override
  Future<Conversation> openConversation({
    required String brandId,
    required String creatorId,
    String? campaignId,
  }) async {
    for (final c in convs.values) {
      if (c.brandId == brandId &&
          c.creatorId == creatorId &&
          c.campaignId == campaignId) {
        return c;
      }
    }
    final c = Conversation(
      id: _id('conv'),
      brandId: brandId,
      creatorId: creatorId,
      campaignId: campaignId,
      campaignTitle: campaignId == null ? null : campaigns[campaignId]?.title,
      brandName: brandProfile.companyName,
      creatorName: creators[creatorId]?.displayName,
    );
    convs[c.id] = c;
    return c;
  }

  StreamController<List<ChatMessage>> _controller(String id) => _msgStreams
      .putIfAbsent(id, StreamController<List<ChatMessage>>.broadcast);

  @override
  Stream<List<ChatMessage>> messages(String conversationId) async* {
    yield List.of(msgs[conversationId] ?? const []);
    yield* _controller(conversationId).stream;
  }

  @override
  Future<void> sendMessage(String conversationId, String body) async {
    final list = msgs.putIfAbsent(conversationId, () => []);
    list.add(
      ChatMessage(
        id: _id('msg'),
        conversationId: conversationId,
        senderId: userId,
        body: body.trim(),
        createdAt: DateTime.now(),
      ),
    );
    _controller(conversationId).add(List.of(list));
  }

  @override
  Future<void> markRead(String conversationId) async {}
}
