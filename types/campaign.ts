/**
 * Enhanced Campaign Data Model
 *
 * Purpose: Define data contract between frontend and backend
 * Features: Schema versioning, computed KPIs, metadata tagging, audit trail
 */

// Campaign status enum
export type CampaignStatus = "draft" | "active" | "completed" | "paused" | "archived"

// Campaign objective enum
export type CampaignObjective = "brand_awareness" | "conversions" | "engagement" | "reach" | "traffic" | "app_installs"

// Platform enum
export type Platform = "Instagram" | "YouTube" | "TikTok" | "Twitter" | "Facebook" | "LinkedIn"

// Currency enum
export type Currency = "USD" | "EUR" | "GBP" | "INR" | "AUD" | "CAD"

// Priority level
export type PriorityLevel = "low" | "medium" | "high" | "urgent"

// Deliverables structure
export interface Deliverables {
  reels?: number
  stories?: number
  posts?: number
  videos?: number
  shorts?: number
  tweets?: number
  [key: string]: number | undefined
}

// Health flags
export interface HealthFlags {
  missing_deliverables: boolean
  overdue: boolean
  budget_exceeded: boolean
  low_engagement: boolean
  pending_approvals: boolean
}

// Audit trail entry
export interface AuditTrailEntry {
  timestamp: string
  user_id: string
  user_name: string
  action: string
  field_changed?: string
  old_value?: any
  new_value?: any
  ip_address?: string
}

// Computed KPIs
export interface ComputedKPIs {
  roi: number
  cost_per_engagement: number
  cost_per_reach: number
  cost_per_click: number
  conversion_rate: number
  engagement_rate: number
  completion_percentage: number
}

// Influencer summary
export interface InfluencerSummary {
  id: string
  name: string
  platform: Platform
  followers: number
  engagement_rate: number
  status: "invited" | "accepted" | "declined" | "completed"
}

// Enhanced Campaign interface
export interface Campaign {
  // Core identifiers
  id: string
  version: number // Schema version for API evolution

  // Basic info
  title: string
  description?: string
  status: CampaignStatus
  objective: CampaignObjective
  priority?: PriorityLevel

  // Financial
  budget: number
  currency: Currency
  spend: number

  // Timeline
  start_date: string // ISO 8601
  end_date: string // ISO 8601
  created_at: string
  updated_at: string

  // Platform & deliverables
  platforms: Platform[]
  deliverables: Deliverables
  deliverables_completed: Deliverables

  // Performance metrics
  reach: number
  impressions: number
  engagement_count: number
  clicks: number
  conversions: number

  // Computed KPIs (pre-calculated for quick rendering)
  kpis: ComputedKPIs

  // Influencers
  influencers_count: number
  influencers: InfluencerSummary[]

  // Metadata & tagging
  tags: string[]
  niche: string
  target_audience?: {
    age_range?: string
    gender?: string
    location?: string[]
    interests?: string[]
  }

  // Health & compliance
  flag_health: HealthFlags
  compliance_status?: "pending" | "approved" | "rejected"

  // User tracking
  created_by: string
  created_by_name?: string
  last_updated_by?: string
  team_members?: string[]

  // Audit trail (for enterprise compliance)
  audit_trail: AuditTrailEntry[]

  // Media assets
  thumbnail_url?: string
  brand_assets?: string[]

  // Additional metadata
  notes?: string
  external_id?: string // For integration with other systems
}

// Campaign creation payload (subset of Campaign)
export interface CreateCampaignPayload {
  title: string
  description?: string
  objective: CampaignObjective
  budget: number
  currency: Currency
  start_date: string
  end_date: string
  platforms: Platform[]
  deliverables: Deliverables
  tags?: string[]
  niche: string
  target_audience?: Campaign["target_audience"]
  priority?: PriorityLevel
}

// Campaign update payload
export interface UpdateCampaignPayload extends Partial<CreateCampaignPayload> {
  status?: CampaignStatus
  spend?: number
  influencers?: string[] // Array of influencer IDs
}

// Campaign filter options
export interface CampaignFilters {
  status?: CampaignStatus[]
  platforms?: Platform[]
  objective?: CampaignObjective[]
  date_range?: {
    start: string
    end: string
  }
  budget_range?: {
    min: number
    max: number
  }
  tags?: string[]
  search?: string
}

// Campaign sort options
export type CampaignSortField = "created_at" | "start_date" | "budget" | "spend" | "roi" | "reach" | "engagement_rate"

export interface CampaignSortOptions {
  field: CampaignSortField
  order: "asc" | "desc"
}

// Campaign list response
export interface CampaignListResponse {
  campaigns: Campaign[]
  total: number
  page: number
  page_size: number
  has_more: boolean
}

// Campaign analytics response
export interface CampaignAnalytics {
  campaign_id: string
  time_series: {
    date: string
    reach: number
    engagement: number
    spend: number
    conversions: number
  }[]
  top_performing_content: {
    id: string
    type: string
    platform: Platform
    engagement_rate: number
    reach: number
  }[]
  audience_demographics: {
    age_groups: { range: string; percentage: number }[]
    gender: { male: number; female: number; other: number }
    locations: { country: string; percentage: number }[]
  }
  influencer_performance: {
    influencer_id: string
    name: string
    reach: number
    engagement_rate: number
    roi: number
    cost_per_engagement: number
  }[]
}
