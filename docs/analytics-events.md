# 📊 Analytics Events Catalogue

## Event Naming Convention

\`\`\`
{role}_{module}_{action}
\`\`\`

Example: `brand_campaign_create` → brand user created a new campaign

## Core Principles

- Every key interaction is trackable, replayable, and filterable
- Events follow a flat schema (no nested objects)
- Each event contains contextual parameters
- Include UX latency metrics for performance analysis

## Event Categories

### 1. Campaign Lifecycle

| Event | Trigger | Key Properties |
|-------|---------|----------------|
| `brand_campaign_create` | Campaign setup completed | `campaign_id`, `budget`, `niche`, `platform`, `start_date` |
| `brand_campaign_launch` | "Launch" button clicked | `influencer_count`, `expected_reach`, `estimated_spend` |
| `brand_campaign_edit` | Campaign parameters updated | `changed_field`, `previous_value`, `new_value` |
| `brand_campaign_complete` | Campaign marked completed | `actual_spend`, `actual_reach`, `roi` |

### 2. Influencer Discovery

| Event | Trigger | Key Properties |
|-------|---------|----------------|
| `brand_influencer_search` | Search initiated | `filters_applied`, `platform`, `results_count` |
| `brand_influencer_view` | Profile opened | `influencer_id`, `category`, `followers` |
| `brand_shortlist_add` | Added to shortlist | `influencer_id`, `campaign_id` |

### 3. Payments & Finance

| Event | Trigger | Key Properties |
|-------|---------|----------------|
| `brand_invoice_approve` | Invoice approved | `invoice_id`, `amount`, `payment_method` |
| `brand_payment_success` | Successful payout | `transaction_id`, `amount`, `currency`, `processing_time` |
| `brand_payment_fail` | Failed transaction | `error_code`, `reason` |

### 4. Reporting & Insights

| Event | Trigger | Key Properties |
|-------|---------|----------------|
| `brand_report_export` | Export initiated | `format`, `range`, `campaign_id` |
| `brand_chart_filter_apply` | Filter changed on analytics | `filter_type`, `value` |
| `brand_roi_compare` | ROI comparison viewed | `campaign_ids`, `time_range` |

### 5. System & Preferences

| Event | Trigger | Key Properties |
|-------|---------|----------------|
| `brand_setting_update` | Preferences changed | `setting_name`, `old_value`, `new_value` |
| `brand_team_invite` | Teammate invited | `role_assigned`, `email_domain` |

### 6. Engagement & Feedback

| Event | Trigger | Key Properties |
|-------|---------|----------------|
| `brand_feature_click` | Feature entrypoint used | `feature_name`, `location` |
| `brand_feedback_submit` | Feedback form submitted | `rating`, `comments_length`, `page` |

## Usage Example

\`\`\`typescript
import { analytics } from '@/lib/analytics'

// Track campaign creation
analytics.trackCampaignCreate({
  campaign_id: 'camp_123',
  budget: 50000,
  niche: 'Fashion',
  platform: ['Instagram', 'TikTok'],
  start_date: '2024-02-01',
})

// Track influencer search
analytics.trackInfluencerSearch({
  filters_applied: ['niche:Fashion', 'followers:10k-100k'],
  platform: 'Instagram',
  results_count: 42,
})
\`\`\`

## Data Governance

- Use anonymized user IDs (GDPR compliant)
- Respect "Do Not Track" preferences
- Encrypt event payloads in transit
- Retention: 90 days for raw data, 1 year for aggregated metrics
