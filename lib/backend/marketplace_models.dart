import '../utils/format.dart';

/// Postgres enum value for a Dart enum: `inProgress` → `in_progress`.
String dbName(Enum e) =>
    e.name.replaceAllMapped(RegExp('[A-Z]'), (m) => '_${m[0]!.toLowerCase()}');

T fromDb<T extends Enum>(List<T> values, Object? value, T fallback) =>
    values.firstWhere((v) => dbName(v) == value, orElse: () => fallback);

enum CampaignStatus { draft, active, paused, completed, archived }

enum CampaignVisibility { open, inviteOnly }

enum CompensationType { paid, barter, paidAndProduct }

enum CampaignObjective {
  brandAwareness,
  reach,
  engagement,
  traffic,
  conversions,
  appInstalls,
}

enum CollabStatus {
  invited,
  applied,
  accepted,
  declined,
  inProgress,
  awaitingApproval,
  completed,
  cancelled,
}

enum SubmissionKind { draft, live }

enum SubmissionStatus { pending, approved, changesRequested }

enum InvoiceStatus { pending, approved, rejected, paid }

extension CampaignStatusText on CampaignStatus {
  String get label => switch (this) {
    CampaignStatus.draft => 'Draft',
    CampaignStatus.active => 'Live',
    CampaignStatus.paused => 'Paused',
    CampaignStatus.completed => 'Closed',
    CampaignStatus.archived => 'Archived',
  };
}

extension CampaignObjectiveText on CampaignObjective {
  String get label => switch (this) {
    CampaignObjective.brandAwareness => 'Brand awareness',
    CampaignObjective.reach => 'Reach',
    CampaignObjective.engagement => 'Engagement',
    CampaignObjective.traffic => 'Website traffic',
    CampaignObjective.conversions => 'Sales',
    CampaignObjective.appInstalls => 'App installs',
  };
}

extension CompensationTypeText on CompensationType {
  String get label => switch (this) {
    CompensationType.paid => 'Paid',
    CompensationType.barter => 'Product (barter)',
    CompensationType.paidAndProduct => 'Paid + product',
  };
}

extension CollabStatusText on CollabStatus {
  /// What the status means to the person looking at it.
  String label({required bool brand}) => switch (this) {
    CollabStatus.invited => brand ? 'Invited' : 'Invitation',
    CollabStatus.applied => brand ? 'New application' : 'Applied',
    CollabStatus.accepted => brand ? 'Awaiting draft' : 'Create content',
    CollabStatus.inProgress => 'In progress',
    CollabStatus.awaitingApproval => 'Live post in review',
    CollabStatus.completed => 'Completed',
    CollabStatus.declined => 'Declined',
    CollabStatus.cancelled => 'Cancelled',
  };

  bool get isActive => const {
    CollabStatus.accepted,
    CollabStatus.inProgress,
    CollabStatus.awaitingApproval,
  }.contains(this);

  bool get isClosed => const {
    CollabStatus.completed,
    CollabStatus.declined,
    CollabStatus.cancelled,
  }.contains(this);

  /// Counts towards the campaign's creator slots and spend.
  bool get isHired => isActive || this == CollabStatus.completed;
}

extension InvoiceStatusText on InvoiceStatus {
  String get label => switch (this) {
    InvoiceStatus.pending => 'Awaiting approval',
    InvoiceStatus.approved => 'Approved',
    InvoiceStatus.rejected => 'Rejected',
    InvoiceStatus.paid => 'Paid',
  };
}

Map<String, int> _deliverables(Object? value) {
  if (value is! Map) return const {};
  return {
    for (final e in value.entries)
      if (e.value is num) e.key.toString(): (e.value as num).toInt(),
  };
}

List<String> _strings(Object? value) =>
    value is List ? value.map((e) => e.toString()).toList() : const [];

num? _num(Object? value) =>
    value is num ? value : (value is String ? num.tryParse(value) : null);

int? _int(Object? value) => _num(value)?.toInt();

class Campaign {
  const Campaign({
    required this.id,
    required this.brandId,
    required this.title,
    this.brandName,
    this.brandLogoUrl,
    this.description,
    this.status = CampaignStatus.draft,
    this.objective = CampaignObjective.brandAwareness,
    this.niche,
    this.visibility = CampaignVisibility.open,
    this.compensation = CompensationType.paid,
    this.payoutPerCreator,
    this.acceptsQuotes = true,
    this.productDetails,
    this.guidelines,
    this.deliverables = const {},
    this.budget = 0,
    this.currency = 'INR',
    this.applicationDeadline,
    this.startDate,
    this.endDate,
    this.creatorSlots,
    this.minFollowers = 0,
    this.cities = const [],
    this.createdAt,
  });

  factory Campaign.fromRow(Map<String, dynamic> r) {
    final brand = r['brand_profiles'];
    return Campaign(
      id: r['id'] as String,
      brandId: r['brand_id'] as String,
      title: r['title'] as String? ?? '',
      brandName: brand is Map ? brand['company_name'] as String? : null,
      brandLogoUrl: brand is Map ? brand['logo_url'] as String? : null,
      description: r['description'] as String?,
      status: fromDb(CampaignStatus.values, r['status'], CampaignStatus.draft),
      objective: fromDb(
        CampaignObjective.values,
        r['objective'],
        CampaignObjective.brandAwareness,
      ),
      niche: r['niche'] as String?,
      visibility: fromDb(
        CampaignVisibility.values,
        r['visibility'],
        CampaignVisibility.open,
      ),
      compensation: fromDb(
        CompensationType.values,
        r['compensation_type'],
        CompensationType.paid,
      ),
      payoutPerCreator: _num(r['payout_per_creator']),
      acceptsQuotes: r['accepts_quotes'] as bool? ?? true,
      productDetails: r['product_details'] as String?,
      guidelines: r['guidelines'] as String?,
      deliverables: _deliverables(r['deliverables']),
      budget: _num(r['budget']) ?? 0,
      currency: r['currency'] as String? ?? 'INR',
      applicationDeadline: parseDate(r['application_deadline']),
      startDate: parseDate(r['start_date']),
      endDate: parseDate(r['end_date']),
      creatorSlots: _int(r['creator_slots']),
      minFollowers: _int(r['min_followers']) ?? 0,
      cities: _strings(r['cities']),
      createdAt: parseTimestamp(r['created_at']),
    );
  }

  final String id;
  final String brandId;
  final String title;
  final String? brandName;
  final String? brandLogoUrl;
  final String? description;
  final CampaignStatus status;
  final CampaignObjective objective;
  final String? niche;
  final CampaignVisibility visibility;
  final CompensationType compensation;
  final num? payoutPerCreator;
  final bool acceptsQuotes;
  final String? productDetails;
  final String? guidelines;
  final Map<String, int> deliverables;
  final num budget;
  final String currency;
  final DateTime? applicationDeadline;
  final DateTime? startDate;
  final DateTime? endDate;
  final int? creatorSlots;
  final int minFollowers;
  final List<String> cities;
  final DateTime? createdAt;

  bool get isBarter => compensation == CompensationType.barter;
  bool get includesProduct => compensation != CompensationType.paid;
  bool get canQuote => acceptsQuotes && !isBarter;

  bool get deadlinePassed {
    final d = applicationDeadline;
    if (d == null) return false;
    final now = DateTime.now();
    return d.isBefore(DateTime(now.year, now.month, now.day));
  }

  bool get acceptingApplications =>
      status == CampaignStatus.active &&
      visibility == CampaignVisibility.open &&
      !deadlinePassed;

  /// Brands can invite creators until the campaign is closed.
  bool get canInvite => const {
    CampaignStatus.draft,
    CampaignStatus.active,
    CampaignStatus.paused,
  }.contains(status);

  String get brandDisplayName =>
      (brandName ?? '').trim().isEmpty ? 'Brand' : brandName!.trim();

  /// "₹12,000", "₹12,000 or your quote", "Quote your price", "Product".
  String get compensationLabel {
    final money = payoutPerCreator == null
        ? null
        : formatMoney(payoutPerCreator, currency: currency);
    return switch (compensation) {
      CompensationType.barter => 'Product (barter)',
      CompensationType.paidAndProduct =>
        '${money ?? (acceptsQuotes ? 'Your quote' : 'Paid')} + product',
      CompensationType.paid when money == null => 'Quote your price',
      CompensationType.paid when acceptsQuotes => '$money or your quote',
      CompensationType.paid => money!,
    };
  }
}

/// Everything a brand fills in when writing a campaign brief.
class CampaignDraft {
  CampaignDraft({
    this.title = '',
    this.description = '',
    this.objective = CampaignObjective.brandAwareness,
    this.niche,
    this.visibility = CampaignVisibility.open,
    this.compensation = CompensationType.paid,
    this.payoutPerCreator,
    this.acceptsQuotes = true,
    this.productDetails = '',
    this.guidelines = '',
    Map<String, int>? deliverables,
    this.budget,
    this.creatorSlots,
    this.minFollowers = 0,
    List<String>? cities,
    this.applicationDeadline,
    this.startDate,
    this.endDate,
  }) : deliverables = deliverables ?? {'reels': 1},
       cities = cities ?? [];

  factory CampaignDraft.fromCampaign(Campaign c) => CampaignDraft(
    title: c.title,
    description: c.description ?? '',
    objective: c.objective,
    niche: c.niche,
    visibility: c.visibility,
    compensation: c.compensation,
    payoutPerCreator: c.payoutPerCreator,
    acceptsQuotes: c.acceptsQuotes,
    productDetails: c.productDetails ?? '',
    guidelines: c.guidelines ?? '',
    deliverables: Map.of(c.deliverables),
    budget: c.budget,
    creatorSlots: c.creatorSlots,
    minFollowers: c.minFollowers,
    cities: List.of(c.cities),
    applicationDeadline: c.applicationDeadline,
    startDate: c.startDate,
    endDate: c.endDate,
  );

  String title;
  String description;
  CampaignObjective objective;
  String? niche;
  CampaignVisibility visibility;
  CompensationType compensation;
  num? payoutPerCreator;
  bool acceptsQuotes;
  String productDetails;
  String guidelines;
  Map<String, int> deliverables;
  num? budget;
  int? creatorSlots;
  int minFollowers;
  List<String> cities;
  DateTime? applicationDeadline;
  DateTime? startDate;
  DateTime? endDate;

  /// Columns the app may write (see the column grants in the migrations).
  Map<String, dynamic> toRow() {
    String? text(String s) => s.trim().isEmpty ? null : s.trim();
    final barter = compensation == CompensationType.barter;
    final payout = barter ? null : payoutPerCreator;
    return {
      'title': title.trim(),
      'description': text(description),
      'objective': dbName(objective),
      'niche': niche,
      'platforms': ['instagram'],
      'visibility': dbName(visibility),
      'compensation_type': dbName(compensation),
      'payout_per_creator': payout,
      'accepts_quotes': barter ? false : acceptsQuotes,
      'product_details': compensation == CompensationType.paid
          ? null
          : text(productDetails),
      'guidelines': text(guidelines),
      'deliverables': {
        for (final e in deliverables.entries)
          if (e.value > 0) e.key: e.value,
      },
      'budget': budget ?? (payout ?? 0) * (creatorSlots ?? 1),
      'creator_slots': creatorSlots,
      'min_followers': minFollowers,
      'cities': cities,
      'application_deadline': sqlDate(applicationDeadline),
      'start_date': sqlDate(startDate),
      'end_date': sqlDate(endDate),
    };
  }
}

/// Public creator details from the `creator_directory` view.
class CreatorSummary {
  const CreatorSummary({
    required this.id,
    this.fullName = '',
    this.avatarUrl,
    this.handle,
    this.bio,
    this.niches = const [],
    this.location,
    this.rateMin,
    this.rateMax,
    this.currency = 'INR',
    this.instagramHandle,
    this.instagramUrl,
    this.followers,
    this.engagementRate,
    this.instagramVerified = false,
    this.rating = const RatingSummary(),
  });

  factory CreatorSummary.fromRow(Map<String, dynamic> r) => CreatorSummary(
    id: r['id'] as String,
    fullName: r['full_name'] as String? ?? '',
    avatarUrl: r['avatar_url'] as String?,
    handle: r['handle'] as String?,
    bio: r['bio'] as String?,
    niches: _strings(r['niches']),
    location: r['location'] as String?,
    rateMin: _num(r['rate_min']),
    rateMax: _num(r['rate_max']),
    currency: r['currency'] as String? ?? 'INR',
    instagramHandle: r['instagram_handle'] as String?,
    instagramUrl: r['instagram_url'] as String?,
    followers: _int(r['instagram_followers']),
    engagementRate: _num(r['instagram_engagement'])?.toDouble(),
    instagramVerified: r['instagram_verified'] as bool? ?? false,
    rating: RatingSummary(
      average: _num(r['rating_average']),
      count: _int(r['rating_count']) ?? 0,
    ),
  );

  final String id;
  final String fullName;

  /// Published reviews from brands.
  final RatingSummary rating;
  final String? avatarUrl;
  final String? handle;
  final String? bio;
  final List<String> niches;
  final String? location;
  final num? rateMin;
  final num? rateMax;
  final String currency;
  final String? instagramHandle;
  final String? instagramUrl;
  final int? followers;
  final double? engagementRate;

  /// Stats synced from Instagram's API rather than typed in.
  final bool instagramVerified;

  String get displayName {
    if (fullName.trim().isNotEmpty) return fullName.trim();
    final h = instagramHandle ?? handle;
    return h == null || h.isEmpty ? 'Creator' : atHandle(h);
  }

  String? get instagramLabel =>
      instagramHandle == null ? null : atHandle(instagramHandle!);

  String get rateLabel {
    if (rateMin == null && rateMax == null) return 'Rate on request';
    if (rateMax == null || rateMax == rateMin) {
      return '${formatMoney(rateMin ?? rateMax, currency: currency)} / post';
    }
    if (rateMin == null) {
      return 'Up to ${formatMoney(rateMax, currency: currency)} / post';
    }
    return '${formatMoney(rateMin, currency: currency)}–'
        '${formatMoney(rateMax, currency: currency)} / post';
  }
}

class Collaboration {
  const Collaboration({
    required this.id,
    required this.campaignId,
    required this.creatorId,
    required this.brandId,
    required this.status,
    this.pitch,
    this.agreedAmount,
    this.currency = 'INR',
    this.deliverables = const {},
    this.dueDate,
    this.createdAt,
    this.updatedAt,
    this.campaign,
    this.creator,
  });

  factory Collaboration.fromRow(
    Map<String, dynamic> r, {
    CreatorSummary? creator,
  }) {
    final campaign = r['campaigns'];
    return Collaboration(
      id: r['id'] as String,
      campaignId: r['campaign_id'] as String,
      creatorId: r['creator_id'] as String,
      brandId: r['brand_id'] as String,
      status: fromDb(CollabStatus.values, r['status'], CollabStatus.applied),
      pitch: r['pitch'] as String?,
      agreedAmount: _num(r['agreed_amount']),
      currency: r['currency'] as String? ?? 'INR',
      deliverables: _deliverables(r['deliverables']),
      dueDate: parseDate(r['due_date']),
      createdAt: parseTimestamp(r['created_at']),
      updatedAt: parseTimestamp(r['updated_at']),
      campaign: campaign is Map<String, dynamic>
          ? Campaign.fromRow(campaign)
          : null,
      creator: creator,
    );
  }

  final String id;
  final String campaignId;
  final String creatorId;
  final String brandId;
  final CollabStatus status;
  final String? pitch;
  final num? agreedAmount;
  final String currency;
  final Map<String, int> deliverables;
  final DateTime? dueDate;
  final DateTime? createdAt;
  final DateTime? updatedAt;
  final Campaign? campaign;
  final CreatorSummary? creator;

  Collaboration withCreator(CreatorSummary? c) => Collaboration(
    id: id,
    campaignId: campaignId,
    creatorId: creatorId,
    brandId: brandId,
    status: status,
    pitch: pitch,
    agreedAmount: agreedAmount,
    currency: currency,
    deliverables: deliverables,
    dueDate: dueDate,
    createdAt: createdAt,
    updatedAt: updatedAt,
    campaign: campaign,
    creator: c,
  );

  String get amountLabel {
    final c = campaign;
    if (c != null && c.isBarter) return 'Product (barter)';
    final money = agreedAmount == null
        ? 'Amount to be agreed'
        : formatMoney(agreedAmount, currency: currency);
    return c != null && c.compensation == CompensationType.paidAndProduct
        ? '$money + product'
        : money;
  }
}

class Submission {
  const Submission({
    required this.id,
    required this.collaborationId,
    required this.kind,
    required this.contentUrl,
    required this.status,
    this.caption,
    this.notes,
    this.feedback,
    this.igMediaId,
    this.createdAt,
    this.reviewedAt,
  });

  factory Submission.fromRow(Map<String, dynamic> r) => Submission(
    id: r['id'] as String,
    collaborationId: r['collaboration_id'] as String,
    kind: fromDb(SubmissionKind.values, r['kind'], SubmissionKind.draft),
    contentUrl: r['content_url'] as String? ?? '',
    status: fromDb(
      SubmissionStatus.values,
      r['status'],
      SubmissionStatus.pending,
    ),
    caption: r['caption'] as String?,
    notes: r['notes'] as String?,
    feedback: r['feedback'] as String?,
    igMediaId: r['ig_media_id'] as String?,
    createdAt: parseTimestamp(r['created_at']),
    reviewedAt: parseTimestamp(r['reviewed_at']),
  );

  final String id;
  final String collaborationId;
  final SubmissionKind kind;
  final String contentUrl;
  final SubmissionStatus status;
  final String? caption;
  final String? notes;
  final String? feedback;
  final String? igMediaId;
  final DateTime? createdAt;
  final DateTime? reviewedAt;
}

class Invoice {
  const Invoice({
    required this.id,
    required this.number,
    required this.collaborationId,
    required this.brandId,
    required this.creatorId,
    required this.gross,
    required this.fee,
    required this.net,
    required this.status,
    this.creatorFeeRate,
    this.brandFee = 0,
    this.brandFeeGst = 0,
    num? brandTotal,
    this.currency = 'INR',
    this.description,
    this.dueDate,
    this.createdAt,
    this.decidedAt,
    this.paidAt,
    this.campaignTitle,
    this.counterpartName,
  }) : brandTotal = brandTotal ?? gross + brandFee + brandFeeGst;

  factory Invoice.fromRow(Map<String, dynamic> r, {String? counterpartName}) {
    final collab = r['collaborations'];
    final campaign = collab is Map ? collab['campaigns'] : null;
    final brand = r['brand_profiles'];
    return Invoice(
      id: r['id'] as String,
      number: r['invoice_number'] as String? ?? '',
      collaborationId: r['collaboration_id'] as String?,
      brandId: r['brand_id'] as String?,
      creatorId: r['creator_id'] as String?,
      gross: _num(r['gross_amount']) ?? 0,
      fee: _num(r['platform_fee']) ?? 0,
      net: _num(r['net_amount']) ?? 0,
      creatorFeeRate: _num(r['creator_fee_rate']),
      brandFee: _num(r['brand_fee']) ?? 0,
      brandFeeGst: _num(r['brand_fee_gst']) ?? 0,
      brandTotal: _num(r['brand_total']),
      status: fromDb(InvoiceStatus.values, r['status'], InvoiceStatus.pending),
      currency: r['currency'] as String? ?? 'INR',
      description: r['description'] as String?,
      dueDate: parseDate(r['due_date']),
      createdAt: parseTimestamp(r['created_at']),
      decidedAt: parseTimestamp(r['decided_at']),
      paidAt: parseTimestamp(r['paid_at']),
      campaignTitle:
          r['campaign_title'] as String? ??
          (campaign is Map ? campaign['title'] as String? : null),
      counterpartName:
          counterpartName ??
          (brand is Map ? brand['company_name'] as String? : null),
    );
  }

  final String id;
  final String number;

  /// Null once either side deletes their account; the invoice itself is
  /// kept for the other party's records.
  final String? collaborationId;
  final String? brandId;
  final String? creatorId;

  /// The creator's agreed fee for the deal.
  final num gross;

  /// Shor's fee, deducted from the creator's payout. 0 on a free deal.
  final num fee;

  /// What the creator receives.
  final num net;

  /// Creator fee rate fixed when the invoice was raised. Null if unknown.
  final num? creatorFeeRate;

  /// "Shor Protection", paid by the brand on top of [gross].
  final num brandFee;

  /// GST on [brandFee].
  final num brandFeeGst;

  /// Everything the brand pays.
  final num brandTotal;

  /// No Shor fee for the creator on this deal.
  bool get freeDeal => fee == 0;
  final InvoiceStatus status;
  final String currency;
  final String? description;
  final DateTime? dueDate;
  final DateTime? createdAt;
  final DateTime? decidedAt;
  final DateTime? paidAt;
  final String? campaignTitle;

  /// The brand (for creators) or creator (for brands).
  final String? counterpartName;
}

/// A live post submitted for a campaign, with its Instagram insights.
class LivePost {
  const LivePost({
    required this.collaborationId,
    required this.creatorId,
    required this.submissionId,
    required this.contentUrl,
    required this.status,
    required this.matched,
    this.submittedAt,
    this.postedAt,
    this.likes,
    this.comments,
    this.reach,
    this.views,
    this.saved,
    this.shares,
    this.totalInteractions,
    this.insightsUpdatedAt,
  });

  factory LivePost.fromRow(Map<String, dynamic> r) => LivePost(
    collaborationId: r['collaboration_id'] as String,
    creatorId: r['creator_id'] as String,
    submissionId: r['submission_id'] as String,
    contentUrl: r['content_url'] as String? ?? '',
    status: fromDb(
      SubmissionStatus.values,
      r['submission_status'],
      SubmissionStatus.pending,
    ),
    matched: r['matched'] as bool? ?? false,
    submittedAt: parseTimestamp(r['submitted_at']),
    postedAt: parseTimestamp(r['posted_at']),
    likes: _int(r['like_count']),
    comments: _int(r['comments_count']),
    reach: _int(r['reach']),
    views: _int(r['views']),
    saved: _int(r['saved']),
    shares: _int(r['shares']),
    totalInteractions: _int(r['total_interactions']),
    insightsUpdatedAt: parseTimestamp(r['insights_updated_at']),
  );

  final String collaborationId;
  final String creatorId;
  final String submissionId;
  final String contentUrl;
  final SubmissionStatus status;

  /// False until the post appears in the creator's synced Instagram posts.
  final bool matched;
  final DateTime? submittedAt;
  final DateTime? postedAt;
  final int? likes;
  final int? comments;
  final int? reach;
  final int? views;
  final int? saved;
  final int? shares;
  final int? totalInteractions;
  final DateTime? insightsUpdatedAt;

  int get interactions =>
      totalInteractions ??
      (likes ?? 0) + (comments ?? 0) + (saved ?? 0) + (shares ?? 0);
}

class Conversation {
  const Conversation({
    required this.id,
    required this.brandId,
    required this.creatorId,
    this.campaignId,
    this.campaignTitle,
    this.brandName,
    this.creatorName,
    this.lastMessageAt,
    this.unread = 0,
  });

  factory Conversation.fromRow(
    Map<String, dynamic> r, {
    String? creatorName,
    int unread = 0,
  }) {
    final campaign = r['campaigns'];
    final brand = r['brand_profiles'];
    return Conversation(
      id: r['id'] as String,
      brandId: r['brand_id'] as String,
      creatorId: r['creator_id'] as String,
      campaignId: r['campaign_id'] as String?,
      campaignTitle: campaign is Map ? campaign['title'] as String? : null,
      brandName: brand is Map ? brand['company_name'] as String? : null,
      creatorName: creatorName,
      lastMessageAt: parseTimestamp(r['last_message_at']),
      unread: unread,
    );
  }

  final String id;
  final String brandId;
  final String creatorId;
  final String? campaignId;
  final String? campaignTitle;
  final String? brandName;
  final String? creatorName;
  final DateTime? lastMessageAt;
  final int unread;

  /// The other person's name, as seen by [viewerId].
  String otherName(String? viewerId) =>
      viewerId == brandId ? (creatorName ?? 'Creator') : (brandName ?? 'Brand');
}

class ChatMessage {
  const ChatMessage({
    required this.id,
    required this.conversationId,
    required this.senderId,
    required this.body,
    this.createdAt,
    this.readAt,
  });

  factory ChatMessage.fromRow(Map<String, dynamic> r) => ChatMessage(
    id: r['id'] as String,
    conversationId: r['conversation_id'] as String,
    senderId: r['sender_id'] as String,
    body: r['body'] as String? ?? '',
    createdAt: parseTimestamp(r['created_at']),
    readAt: parseTimestamp(r['read_at']),
  );

  final String id;
  final String conversationId;
  final String senderId;
  final String body;
  final DateTime? createdAt;
  final DateTime? readAt;
}

class Shortlist {
  const Shortlist({
    required this.id,
    required this.name,
    this.creatorIds = const {},
  });

  final String id;
  final String name;
  final Set<String> creatorIds;
}

/// The signed-in creator's editable profile.
class CreatorProfileData {
  const CreatorProfileData({
    this.fullName = '',
    this.handle,
    this.bio,
    this.niches = const [],
    this.location,
    this.rateMin,
    this.rateMax,
    this.instagramHandle,
    this.followers,
    this.instagramVerified = false,
    this.mediaKitPublic = false,
  });

  final String fullName;
  final String? handle;
  final String? bio;
  final List<String> niches;
  final String? location;
  final num? rateMin;
  final num? rateMax;

  /// Read-only: comes from the Instagram connection.
  final String? instagramHandle;
  final int? followers;
  final bool instagramVerified;

  /// Read-only here: changed with [MarketplaceService.setMediaKitPublic].
  final bool mediaKitPublic;
}

/// The signed-in brand's editable profile.
class BrandProfileData {
  const BrandProfileData({
    this.companyName = '',
    this.website,
    this.industry,
    this.description,
  });

  final String companyName;
  final String? website;
  final String? industry;
  final String? description;
}

enum CampaignSort { newest, payout, deadline }

class CampaignFilter {
  const CampaignFilter({
    this.niche,
    this.compensation,
    this.sort = CampaignSort.newest,
  });

  final String? niche;

  /// Paid (includes paid + product) or barter; null for all.
  final CompensationType? compensation;
  final CampaignSort sort;

  CampaignFilter copyWith({
    String? Function()? niche,
    CompensationType? Function()? compensation,
    CampaignSort? sort,
  }) => CampaignFilter(
    niche: niche == null ? this.niche : niche(),
    compensation: compensation == null ? this.compensation : compensation(),
    sort: sort ?? this.sort,
  );
}

enum FollowerTier {
  any('Any size', null, null),
  nano('Nano · 1K–10K', 1000, 10000),
  micro('Micro · 10K–100K', 10000, 100000),
  macro('Macro · 100K–1M', 100000, 1000000),
  mega('Mega · 1M+', 1000000, null);

  const FollowerTier(this.label, this.min, this.max);

  final String label;
  final int? min;
  final int? max;
}

enum CreatorSort { followers, engagement, newest }

class CreatorFilter {
  const CreatorFilter({
    this.query = '',
    this.niche,
    this.city = '',
    this.tier = FollowerTier.any,
    this.verifiedOnly = false,
    this.shortlistId,
    this.sort = CreatorSort.followers,
  });

  final String query;
  final String? niche;
  final String city;
  final FollowerTier tier;
  final bool verifiedOnly;

  /// Only creators saved to this shortlist.
  final String? shortlistId;
  final CreatorSort sort;

  CreatorFilter copyWith({
    String? query,
    String? Function()? niche,
    String? city,
    FollowerTier? tier,
    bool? verifiedOnly,
    String? Function()? shortlistId,
    CreatorSort? sort,
  }) => CreatorFilter(
    query: query ?? this.query,
    niche: niche == null ? this.niche : niche(),
    city: city ?? this.city,
    tier: tier ?? this.tier,
    verifiedOnly: verifiedOnly ?? this.verifiedOnly,
    shortlistId: shortlistId == null ? this.shortlistId : shortlistId(),
    sort: sort ?? this.sort,
  );
}

enum ReportTarget { user, campaign, message, collaboration }

enum ReportReason {
  spam('Spam'),
  scam('Scam or fraud'),
  harassment('Harassment or bullying'),
  hate('Hate speech'),
  sexual('Sexual content'),
  violence('Violence or threats'),
  impersonation('Pretending to be someone else'),
  other('Something else');

  const ReportReason(this.label);

  final String label;
}

/// Someone the signed-in user has blocked.
class BlockedUser {
  const BlockedUser({required this.id, required this.name, this.blockedAt});

  final String id;
  final String name;
  final DateTime? blockedAt;
}

// Notifications ---------------------------------------------------------------

/// Something that happened that the signed-in user should know about.
/// Written by database triggers; see the notifications migration.
class AppNotification {
  const AppNotification({
    required this.id,
    required this.kind,
    required this.title,
    this.body,
    this.collaborationId,
    this.conversationId,
    this.readAt,
    this.createdAt,
  });

  factory AppNotification.fromRow(Map<String, dynamic> r) => AppNotification(
    id: r['id'] as String,
    kind: r['kind'] as String? ?? '',
    title: r['title'] as String? ?? '',
    body: r['body'] as String?,
    collaborationId: r['collaboration_id'] as String?,
    conversationId: r['conversation_id'] as String?,
    readAt: parseTimestamp(r['read_at']),
    createdAt: parseTimestamp(r['created_at']),
  );

  final String id;

  /// e.g. invited, applied, hired, draft_submitted, invoice_raised, message.
  final String kind;
  final String title;
  final String? body;
  final String? collaborationId;
  final String? conversationId;
  final DateTime? readAt;
  final DateTime? createdAt;

  bool get unread => readAt == null;

  AppNotification markedRead() => AppNotification(
    id: id,
    kind: kind,
    title: title,
    body: body,
    collaborationId: collaborationId,
    conversationId: conversationId,
    readAt: readAt ?? DateTime.now(),
    createdAt: createdAt,
  );
}

// Reviews ---------------------------------------------------------------------

/// A 1–5 star rating one side of a completed deal gave the other.
class Review {
  const Review({
    required this.id,
    required this.rating,
    this.comment,
    this.createdAt,
    this.reviewerId,
    this.revieweeId,
    this.reviewerName,
    this.campaignTitle,
  });

  factory Review.fromRow(Map<String, dynamic> r) => Review(
    id: r['id'] as String,
    rating: _int(r['rating']) ?? 0,
    comment: r['comment'] as String?,
    createdAt: parseTimestamp(r['created_at']),
    reviewerId: r['reviewer_id'] as String?,
    revieweeId: r['reviewee_id'] as String?,
    reviewerName: r['reviewer_name'] as String?,
    campaignTitle: r['campaign_title'] as String?,
  );

  final String id;
  final int rating;
  final String? comment;
  final DateTime? createdAt;
  final String? reviewerId;
  final String? revieweeId;
  final String? reviewerName;
  final String? campaignTitle;
}

/// Average of someone's published reviews.
class RatingSummary {
  const RatingSummary({this.average, this.count = 0});

  factory RatingSummary.fromRow(Map<String, dynamic>? r) => r == null
      ? const RatingSummary()
      : RatingSummary(
          average: _num(r['average']),
          count: _int(r['count']) ?? 0,
        );

  final num? average;
  final int count;

  bool get hasReviews => count > 0 && average != null;

  /// "4.8 · 12 reviews", or "No reviews yet".
  String get label => hasReviews
      ? '${average!.toStringAsFixed(1)} · $count review${count == 1 ? '' : 's'}'
      : 'No reviews yet';
}

/// Days a one-sided review stays hidden. Mirrors review_blind_days().
const reviewBlindDays = 14;

// Media kit -------------------------------------------------------------------

class MediaKitPost {
  const MediaKitPost({
    required this.permalink,
    this.imageUrl,
    this.isReel = false,
    this.views,
    this.reach,
    this.likes,
    this.comments,
    this.postedAt,
  });

  factory MediaKitPost.fromJson(Map<String, dynamic> j) => MediaKitPost(
    permalink: j['permalink'] as String? ?? '',
    imageUrl: j['image_url'] as String?,
    isReel: j['media_product_type'] == 'REELS' || j['media_type'] == 'VIDEO',
    views: _int(j['views']),
    reach: _int(j['reach']),
    likes: _int(j['likes']),
    comments: _int(j['comments']),
    postedAt: parseTimestamp(j['posted_at']),
  );

  final String permalink;
  final String? imageUrl;
  final bool isReel;
  final int? views;
  final int? reach;
  final int? likes;
  final int? comments;
  final DateTime? postedAt;
}

/// A creator's public media kit, from the media_kit() database function.
class MediaKit {
  const MediaKit({
    required this.creatorId,
    required this.handle,
    required this.name,
    this.avatarUrl,
    this.bio,
    this.niches = const [],
    this.location,
    this.rateMin,
    this.rateMax,
    this.currency = 'INR',
    this.isPublic = false,
    this.instagramUsername,
    this.instagramUrl,
    this.followers,
    this.verified = false,
    this.engagementRate,
    this.syncedAt,
    this.postsAnalysed = 0,
    this.avgViews,
    this.avgReach,
    this.avgInteractions,
    this.recentEngagementRate,
    this.topPosts = const [],
    this.audience = const {},
    this.dealsCompleted = 0,
    this.rating = const RatingSummary(),
    this.reviews = const [],
  });

  factory MediaKit.fromJson(Map<String, dynamic> j) {
    final ig = j['instagram'] is Map
        ? Map<String, dynamic>.from(j['instagram'] as Map)
        : null;
    final stats = j['stats'] is Map
        ? Map<String, dynamic>.from(j['stats'] as Map)
        : const <String, dynamic>{};
    final audience = <String, List<BarDatumData>>{};
    if (j['audience'] is Map) {
      for (final e in (j['audience'] as Map).entries) {
        audience[e.key.toString()] = [
          for (final item in (e.value as List? ?? const []))
            BarDatumData(
              (item as Map)['label']?.toString() ?? '',
              _num(item['share']) ?? 0,
            ),
        ];
      }
    }
    return MediaKit(
      creatorId: j['id'] as String? ?? '',
      handle: j['handle'] as String? ?? '',
      name: j['name'] as String? ?? '',
      avatarUrl: j['avatar_url'] as String?,
      bio: j['bio'] as String?,
      niches: _strings(j['niches']),
      location: j['location'] as String?,
      rateMin: _num(j['rate_min']),
      rateMax: _num(j['rate_max']),
      currency: j['currency'] as String? ?? 'INR',
      isPublic: j['is_public'] as bool? ?? false,
      instagramUsername: ig?['username'] as String?,
      instagramUrl: ig?['url'] as String?,
      followers: _int(ig?['followers']),
      verified: ig?['verified'] as bool? ?? false,
      engagementRate: _num(ig?['engagement_rate']),
      syncedAt: parseTimestamp(ig?['synced_at']),
      postsAnalysed: _int(stats['posts']) ?? 0,
      avgViews: _int(stats['avg_views']),
      avgReach: _int(stats['avg_reach']),
      avgInteractions: _int(stats['avg_interactions']),
      recentEngagementRate: _num(stats['engagement_rate']),
      topPosts: [
        for (final p in (j['top_posts'] as List? ?? const []))
          MediaKitPost.fromJson(Map<String, dynamic>.from(p as Map)),
      ],
      audience: audience,
      dealsCompleted: _int(j['deals_completed']) ?? 0,
      rating: RatingSummary.fromRow(
        j['rating'] is Map
            ? Map<String, dynamic>.from(j['rating'] as Map)
            : null,
      ),
      reviews: [
        for (final r in (j['reviews'] as List? ?? const []))
          Review.fromRow(Map<String, dynamic>.from(r as Map)),
      ],
    );
  }

  final String creatorId;
  final String handle;
  final String name;
  final String? avatarUrl;
  final String? bio;
  final List<String> niches;
  final String? location;
  final num? rateMin;
  final num? rateMax;
  final String currency;

  /// False when the owner is previewing a kit they haven't published.
  final bool isPublic;

  final String? instagramUsername;
  final String? instagramUrl;
  final int? followers;

  /// Numbers synced from Instagram's API, not typed in.
  final bool verified;
  final num? engagementRate;
  final DateTime? syncedAt;

  /// Averages over posts from the last 90 days.
  final int postsAnalysed;
  final int? avgViews;
  final int? avgReach;
  final int? avgInteractions;
  final num? recentEngagementRate;

  final List<MediaKitPost> topPosts;

  /// Top values per breakdown (gender, age, city, country) as % shares.
  final Map<String, List<BarDatumData>> audience;

  final int dealsCompleted;
  final RatingSummary rating;
  final List<Review> reviews;

  String get displayName => name.trim().isNotEmpty ? name.trim() : '@$handle';

  String get rateLabel => CreatorSummary(
    id: creatorId,
    rateMin: rateMin,
    rateMax: rateMax,
    currency: currency,
  ).rateLabel;
}

/// A labelled share, e.g. ("Pune", 40.0).
class BarDatumData {
  const BarDatumData(this.label, this.share);

  final String label;
  final num share;
}

/// A failure worth showing to the user as-is.
class MarketplaceFailure implements Exception {
  const MarketplaceFailure(this.message);

  final String message;

  @override
  String toString() => message;
}
