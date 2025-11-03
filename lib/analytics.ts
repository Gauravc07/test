/**
 * Analytics Events Tracking System
 *
 * Purpose: Measure user engagement, identify drop-offs, optimize UX
 * Naming Convention: {role}_{module}_{action}
 *
 * All events include metadata: timestamp, user_id, campaign_id, session_id
 */

// Event naming convention types
type Role = "brand" | "influencer" | "admin"
type Module =
  | "campaign"
  | "influencer"
  | "payment"
  | "report"
  | "setting"
  | "team"
  | "feature"
  | "feedback"
  | "shortlist"
  | "chart"
  | "roi"
  | "invoice"
type Action =
  | "create"
  | "launch"
  | "edit"
  | "complete"
  | "search"
  | "view"
  | "add"
  | "approve"
  | "success"
  | "fail"
  | "export"
  | "apply"
  | "compare"
  | "update"
  | "invite"
  | "click"
  | "submit"
  | "remove"

// Base event interface
interface BaseEvent {
  event_name: string
  timestamp: string
  user_id: string
  session_id: string
  page_url: string
  user_agent: string
}

// Campaign lifecycle events
interface CampaignCreateEvent extends BaseEvent {
  event_name: "brand_campaign_create"
  campaign_id: string
  budget: number
  niche: string
  platform: string[]
  start_date: string
}

interface CampaignLaunchEvent extends BaseEvent {
  event_name: "brand_campaign_launch"
  campaign_id: string
  influencer_count: number
  expected_reach: number
  estimated_spend: number
}

interface CampaignEditEvent extends BaseEvent {
  event_name: "brand_campaign_edit"
  campaign_id: string
  changed_field: string
  previous_value: string | number
  new_value: string | number
}

interface CampaignCompleteEvent extends BaseEvent {
  event_name: "brand_campaign_complete"
  campaign_id: string
  actual_spend: number
  actual_reach: number
  roi: number
}

// Influencer discovery events
interface InfluencerSearchEvent extends BaseEvent {
  event_name: "brand_influencer_search"
  filters_applied: string[]
  platform: string
  results_count: number
}

interface InfluencerViewEvent extends BaseEvent {
  event_name: "brand_influencer_view"
  influencer_id: string
  category: string
  followers: number
}

interface ShortlistAddEvent extends BaseEvent {
  event_name: "brand_shortlist_add"
  influencer_id: string
  campaign_id?: string
}

// Payment events
interface InvoiceApproveEvent extends BaseEvent {
  event_name: "brand_invoice_approve"
  invoice_id: string
  amount: number
  payment_method: string
}

interface PaymentSuccessEvent extends BaseEvent {
  event_name: "brand_payment_success"
  transaction_id: string
  amount: number
  currency: string
  processing_time: number
}

interface PaymentFailEvent extends BaseEvent {
  event_name: "brand_payment_fail"
  transaction_id: string
  error_code: string
  reason: string
}

// Reporting events
interface ReportExportEvent extends BaseEvent {
  event_name: "brand_report_export"
  format: "pdf" | "csv" | "xlsx"
  range: string
  campaign_id?: string
}

interface ChartFilterApplyEvent extends BaseEvent {
  event_name: "brand_chart_filter_apply"
  filter_type: string
  value: string | number
}

interface ROICompareEvent extends BaseEvent {
  event_name: "brand_roi_compare"
  campaign_ids: string[]
  time_range: string
}

// System events
interface SettingUpdateEvent extends BaseEvent {
  event_name: "brand_setting_update"
  setting_name: string
  old_value: string | number | boolean
  new_value: string | number | boolean
}

interface TeamInviteEvent extends BaseEvent {
  event_name: "brand_team_invite"
  role_assigned: "admin" | "manager" | "viewer"
  email_domain: string
}

// Engagement events
interface FeatureClickEvent extends BaseEvent {
  event_name: "brand_feature_click"
  feature_name: string
  location: string
}

interface FeedbackSubmitEvent extends BaseEvent {
  event_name: "brand_feedback_submit"
  rating: number
  comments_length: number
  page: string
}

// Union type of all events
type AnalyticsEvent =
  | CampaignCreateEvent
  | CampaignLaunchEvent
  | CampaignEditEvent
  | CampaignCompleteEvent
  | InfluencerSearchEvent
  | InfluencerViewEvent
  | ShortlistAddEvent
  | InvoiceApproveEvent
  | PaymentSuccessEvent
  | PaymentFailEvent
  | ReportExportEvent
  | ChartFilterApplyEvent
  | ROICompareEvent
  | SettingUpdateEvent
  | TeamInviteEvent
  | FeatureClickEvent
  | FeedbackSubmitEvent

// Analytics configuration
interface AnalyticsConfig {
  enabled: boolean
  debug: boolean
  respectDoNotTrack: boolean
  anonymizeIP: boolean
  dataRetentionDays: number
}

// Default configuration
const defaultConfig: AnalyticsConfig = {
  enabled: true,
  debug: process.env.NODE_ENV === "development",
  respectDoNotTrack: true,
  anonymizeIP: true,
  dataRetentionDays: 90,
}

// Analytics service class
class AnalyticsService {
  private config: AnalyticsConfig
  private sessionId: string
  private userId: string | null = null

  constructor(config: Partial<AnalyticsConfig> = {}) {
    this.config = { ...defaultConfig, ...config }
    this.sessionId = this.generateSessionId()

    // Check Do Not Track preference
    if (this.config.respectDoNotTrack && this.isDoNotTrackEnabled()) {
      this.config.enabled = false
    }
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  private isDoNotTrackEnabled(): boolean {
    return navigator.doNotTrack === "1" || (window as any).doNotTrack === "1" || (navigator as any).msDoNotTrack === "1"
  }

  setUserId(userId: string) {
    this.userId = userId
  }

  private getBaseEvent(): Omit<BaseEvent, "event_name"> {
    return {
      timestamp: new Date().toISOString(),
      user_id: this.userId || "anonymous",
      session_id: this.sessionId,
      page_url: window.location.href,
      user_agent: navigator.userAgent,
    }
  }

  track<T extends AnalyticsEvent>(event: Omit<T, keyof BaseEvent> & { event_name: T["event_name"] }) {
    if (!this.config.enabled) return

    const fullEvent = {
      ...this.getBaseEvent(),
      ...event,
    }

    if (this.config.debug) {
      console.log("[Analytics]", fullEvent)
    }

    // Send to analytics platform (Mixpanel, GA4, Amplitude, etc.)
    this.sendToAnalyticsPlatform(fullEvent)
  }

  private async sendToAnalyticsPlatform(event: AnalyticsEvent) {
    try {
      // Example: Send to your analytics endpoint
      await fetch("/api/analytics", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(event),
      })
    } catch (error) {
      if (this.config.debug) {
        console.error("[Analytics] Failed to send event:", error)
      }
    }
  }

  // Convenience methods for common events
  trackCampaignCreate(data: Omit<CampaignCreateEvent, keyof BaseEvent | "event_name">) {
    this.track({ event_name: "brand_campaign_create", ...data })
  }

  trackCampaignLaunch(data: Omit<CampaignLaunchEvent, keyof BaseEvent | "event_name">) {
    this.track({ event_name: "brand_campaign_launch", ...data })
  }

  trackInfluencerSearch(data: Omit<InfluencerSearchEvent, keyof BaseEvent | "event_name">) {
    this.track({ event_name: "brand_influencer_search", ...data })
  }

  trackInfluencerView(data: Omit<InfluencerViewEvent, keyof BaseEvent | "event_name">) {
    this.track({ event_name: "brand_influencer_view", ...data })
  }

  trackShortlistAdd(data: Omit<ShortlistAddEvent, keyof BaseEvent | "event_name">) {
    this.track({ event_name: "brand_shortlist_add", ...data })
  }

  trackPaymentSuccess(data: Omit<PaymentSuccessEvent, keyof BaseEvent | "event_name">) {
    this.track({ event_name: "brand_payment_success", ...data })
  }

  trackReportExport(data: Omit<ReportExportEvent, keyof BaseEvent | "event_name">) {
    this.track({ event_name: "brand_report_export", ...data })
  }

  trackFeatureClick(feature_name: string, location: string) {
    this.track({ event_name: "brand_feature_click", feature_name, location })
  }
}

// Export singleton instance
export const analytics = new AnalyticsService()

// Export types for use in components
export type {
  AnalyticsEvent,
  CampaignCreateEvent,
  CampaignLaunchEvent,
  InfluencerSearchEvent,
  PaymentSuccessEvent,
  ReportExportEvent,
}
