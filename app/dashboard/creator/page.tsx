"use client"

import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { InfluencerSidebar } from "@/components/influencer-sidebar"
import { InfluencerHeader } from "@/components/influencer-header"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import StatCard from "@/components/stat-card"
import { QuickApplyModal } from "@/components/quick-apply-modal"
import { PreviewBriefModal } from "@/components/preview-brief-modal"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import Image from "next/image"
import {
  TrendingUp,
  DollarSign,
  Briefcase,
  CheckCircle2,
  Instagram,
  Youtube,
  Twitter,
  Facebook,
  Calendar,
  Heart,
  MessageCircle,
  ChevronRight,
  Sparkles,
  FileText,
  Upload,
  Receipt,
  Bell,
} from "lucide-react"

export default function CreatorDashboard() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const [selectedBrand, setSelectedBrand] = useState<any>(null)
  const [showApplyModal, setShowApplyModal] = useState(false)
  const [showPreviewModal, setShowPreviewModal] = useState(false)
  const [savedBrands, setSavedBrands] = useState<Set<number>>(new Set())
  const [sortBy, setSortBy] = useState("match")
  const [filterNiche, setFilterNiche] = useState("all")

  useEffect(() => {
    if (!isLoading && (!user || user.role !== "creator")) {
      router.push("/auth/login")
    }
  }, [user, isLoading, router])

  if (isLoading || !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-blue-950 to-black flex items-center justify-center">
        <div className="text-white text-sm md:text-base">Loading...</div>
      </div>
    )
  }

  const stats = {
    totalCampaigns: {
      value: 28,
      delta: 16,
      deltaDir: "up" as const,
      sparkline: [20, 22, 21, 24, 26, 25, 28],
      tooltip: "Total campaigns including drafts and completed campaigns. Source: Campaigns API • Updated 1m ago",
    },
    pendingCollaborations: {
      value: 3,
      delta: 25,
      deltaDir: "down" as const,
      sparkline: [5, 4, 4, 3, 4, 3, 3],
      tooltip: "Invitations and offers awaiting your response. Source: Collaborations API • Updated 2m ago",
    },
    earningsThisMonth: {
      value: 45000,
      delta: 20,
      deltaDir: "up" as const,
      sparkline: [30000, 32000, 35000, 38000, 40000, 42000, 45000],
      tooltip: "Sum of payouts with status 'paid' in current month. Source: Transactions API • Updated 5m ago",
    },
    avgEngagement: {
      value: 3.8,
      delta: 12,
      deltaDir: "up" as const,
      sparkline: [3.0, 3.2, 3.5, 3.4, 3.6, 3.7, 3.8],
      tooltip:
        "Average (likes + comments + shares) / impressions across all posts. Source: Post Insights API • Updated 10m ago",
    },
  }

  const summary = {
    invitesCount: 3,
    campaignsDueThisWeek: 2,
    pendingAmount: 1200,
  }

  const recentCampaigns = [
    {
      id: 1,
      brand: "TechGear Pro",
      title: "Product Review Campaign",
      status: "active",
      budget: 15000,
      deadline: "2025-02-15",
      progress: 50,
    },
    {
      id: 2,
      brand: "Fashion Hub",
      title: "Spring Collection Launch",
      status: "pending",
      budget: 20000,
      deadline: "2025-02-20",
      progress: 0,
    },
    {
      id: 3,
      brand: "Fitness First",
      title: "Workout Routine Series",
      status: "active",
      budget: 10000,
      deadline: "2025-02-10",
      progress: 75,
    },
  ]

  const socialStats = [
    {
      platform: "Instagram",
      icon: Instagram,
      followers: 125000,
      growth: "+12.5%",
      color: "from-purple-500 to-pink-500",
    },
    {
      platform: "YouTube",
      icon: Youtube,
      followers: 85000,
      growth: "+18.7%",
      color: "from-red-600 to-red-500",
    },
    {
      platform: "Twitter",
      icon: Twitter,
      followers: 45000,
      growth: "+5.2%",
      color: "from-blue-400 to-blue-300",
    },
    {
      platform: "Facebook",
      icon: Facebook,
      followers: 89000,
      growth: "+8.3%",
      color: "from-blue-600 to-blue-400",
    },
  ]

  const topPosts = [
    {
      id: 1,
      image: "/placeholder.svg?height=200&width=200",
      platform: "Instagram",
      likes: 15420,
      comments: 342,
      saves: 1250,
      engagement: 12.5,
    },
    {
      id: 2,
      image: "/placeholder.svg?height=200&width=200",
      platform: "YouTube",
      likes: 8900,
      comments: 567,
      views: 125000,
      engagement: 15.2,
    },
    {
      id: 3,
      image: "/placeholder.svg?height=200&width=200",
      platform: "Instagram",
      likes: 12300,
      comments: 289,
      saves: 980,
      engagement: 10.8,
    },
    {
      id: 4,
      image: "/placeholder.svg?height=200&width=200",
      platform: "Twitter",
      likes: 5600,
      comments: 234,
      saves: 450,
      engagement: 9.2,
    },
  ]

  const suggestedBrandsData = [
    {
      id: 1,
      name: "Urbanic",
      logo: "/urbanic-logo.jpg",
      category: "Fashion & Lifestyle",
      campaign: "Promote Urbanic's Fall Collection via 1 Reel + 1 Story",
      brief:
        "We're launching our Fall 2025 collection and looking for fashion influencers to showcase our latest designs. Create authentic content that resonates with your audience and highlights the versatility of our pieces.",
      payRange: { min: 20000, max: 35000 },
      match: 95,
      matchReasons: [
        "92% of your audience matches Urbanic's target demographic",
        "Your average engagement (8.7%) exceeds campaign's 6% minimum",
        "You've collaborated with similar fashion brands before",
      ],
      deliverables: [
        { icon: "🎥", label: "Reel", count: 1 },
        { icon: "🖼️", label: "Story", count: 1 },
      ],
      tags: ["#Fashion", "#Tier1", "#IndiaOnly"],
      objectives: [
        "Increase brand awareness among Gen Z and Millennial audiences",
        "Drive traffic to Urbanic's website and app",
        "Showcase the versatility and quality of Fall collection pieces",
      ],
      deliverablesList: [
        { type: "Instagram Reel", count: 1 },
        { type: "Instagram Story", count: 1 },
      ],
      timeline: "Campaign runs from Feb 15 - Mar 15, 2025. Content must be posted within first week.",
      terms: [
        "Exclusive partnership - no competing fashion brands for 30 days",
        "Content rights granted to Urbanic for 6 months",
        "Payment released within 7 days of content approval",
      ],
      stats: {
        followers: "2.5M",
        engagement: "4.2%",
        avgReach: "850K",
      },
    },
    {
      id: 2,
      name: "FitLife Pro",
      logo: "/fitness-logo.png",
      category: "Fitness & Wellness",
      campaign: "30-Day Fitness Challenge with FitLife Pro Supplements",
      brief:
        "Join our 30-day transformation challenge and document your journey using FitLife Pro supplements. Share workout routines, nutrition tips, and progress updates with your fitness community.",
      payRange: { min: 25000, max: 40000 },
      match: 92,
      matchReasons: [
        "High audience overlap in fitness and wellness niche",
        "Strong engagement rate on workout content",
        "Previous successful fitness brand collaborations",
      ],
      deliverables: [
        { icon: "🎥", label: "Reels", count: 4 },
        { icon: "✍️", label: "Posts", count: 2 },
      ],
      tags: ["#Fitness", "#Wellness", "#Tier1"],
      objectives: [
        "Promote FitLife Pro supplement line authentically",
        "Document real transformation results over 30 days",
        "Engage fitness community with workout tips and motivation",
      ],
      deliverablesList: [
        { type: "Instagram Reels", count: 4 },
        { type: "Instagram Posts", count: 2 },
      ],
      timeline: "30-day campaign starting March 1, 2025. Weekly content required.",
      terms: [
        "Exclusive fitness supplement partnership during campaign",
        "Must use FitLife Pro products throughout challenge",
        "Bonus payment for achieving 100K+ combined reach",
      ],
      stats: {
        followers: "1.8M",
        engagement: "5.8%",
        avgReach: "620K",
      },
    },
    {
      id: 3,
      name: "TechVerse",
      logo: "/abstract-tech-logo.png",
      category: "Technology",
      campaign: "Review TechVerse's Latest Smartphone Launch",
      brief:
        "Be among the first to review our flagship smartphone. Create in-depth content covering design, camera quality, performance, and unique features. Share your honest opinion with your tech-savvy audience.",
      payRange: { min: 30000, max: 50000 },
      match: 88,
      matchReasons: [
        "Tech-focused audience with high purchasing power",
        "Proven track record of detailed product reviews",
        "Strong engagement on technology content",
      ],
      deliverables: [
        { icon: "🎥", label: "YouTube Video", count: 1 },
        { icon: "🖼️", label: "Stories", count: 3 },
      ],
      tags: ["#Technology", "#Review", "#Premium"],
      objectives: [
        "Generate buzz around new smartphone launch",
        "Provide authentic, detailed product review",
        "Drive pre-orders through affiliate link",
      ],
      deliverablesList: [
        { type: "YouTube Review Video (10-15 min)", count: 1 },
        { type: "Instagram Stories", count: 3 },
      ],
      timeline: "Product ships Feb 20. Content must go live by Feb 28, 2025.",
      terms: [
        "Keep device as compensation (₹45K value)",
        "Honest review required - no scripted content",
        "Affiliate commission: 5% on sales through your link",
      ],
      stats: {
        followers: "3.2M",
        engagement: "3.9%",
        avgReach: "1.1M",
      },
    },
    {
      id: 4,
      name: "GlowUp Beauty",
      logo: "/beauty-logo.png",
      category: "Beauty & Cosmetics",
      campaign: "GlowUp's Valentine's Day Makeup Tutorial Series",
      brief:
        "Create romantic makeup looks using GlowUp's new Valentine's collection. Share step-by-step tutorials, product reviews, and styling tips perfect for date nights and special occasions.",
      payRange: { min: 18000, max: 28000 },
      match: 85,
      matchReasons: [
        "Beauty-focused audience with high engagement",
        "Excellent tutorial content creation skills",
        "Previous successful beauty brand partnerships",
      ],
      deliverables: [
        { icon: "🎥", label: "Reels", count: 3 },
        { icon: "✍️", label: "Post", count: 1 },
      ],
      tags: ["#Beauty", "#Makeup", "#Valentine"],
      objectives: [
        "Showcase Valentine's collection in romantic settings",
        "Create easy-to-follow makeup tutorials",
        "Drive sales during Valentine's season",
      ],
      deliverablesList: [
        { type: "Instagram Reels (Tutorials)", count: 3 },
        { type: "Instagram Carousel Post", count: 1 },
      ],
      timeline: "Content must be posted between Feb 7-14, 2025.",
      terms: [
        "Receive full Valentine's collection (₹8K value)",
        "Tag @glowupbeauty in all posts",
        "Performance bonus for 50K+ saves on tutorials",
      ],
      stats: {
        followers: "980K",
        engagement: "6.5%",
        avgReach: "420K",
      },
    },
  ]

  const filteredAndSortedBrands = suggestedBrandsData
    .filter((brand) => filterNiche === "all" || brand.category.toLowerCase().includes(filterNiche.toLowerCase()))
    .sort((a, b) => {
      if (sortBy === "match") return b.match - a.match
      if (sortBy === "pay") return b.payRange.max - a.payRange.max
      if (sortBy === "newest") return b.id - a.id
      return 0
    })

  const handleSaveBrand = (brandId: number) => {
    setSavedBrands((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(brandId)) {
        newSet.delete(brandId)
      } else {
        newSet.add(brandId)
      }
      return newSet
    })
  }

  const handleApply = (brand: any) => {
    setSelectedBrand(brand)
    setShowApplyModal(true)
  }

  const handlePreview = (brand: any) => {
    setSelectedBrand(brand)
    setShowPreviewModal(true)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-blue-950 to-black overflow-x-hidden">
      <InfluencerSidebar />

      <div className="lg:pl-64">
        <InfluencerHeader />

        <main className="p-3 sm:p-4 lg:p-6 space-y-4 sm:space-y-6 max-h-[calc(100vh-4rem)] overflow-y-auto overflow-x-hidden max-w-full">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg sm:rounded-xl p-4 sm:p-6 lg:p-8 shadow-xl max-w-full">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-300" />
                  <span className="text-yellow-300 text-xs sm:text-sm font-medium">Welcome back!</span>
                </div>
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white mb-2 break-words">
                  Hey {user.name} 👋 Here's your week at a glance
                </h1>
                <p className="text-blue-100 text-xs sm:text-sm lg:text-base mb-3 break-words">
                  {summary.invitesCount} invites • {summary.campaignsDueThisWeek} campaigns due this week • ₹
                  {summary.pendingAmount.toLocaleString()} pending
                </p>
                <div className="flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    className="bg-white text-blue-600 hover:bg-blue-50 text-xs sm:text-sm"
                    onClick={() => router.push("/calendar")}
                  >
                    <Calendar className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                    View Calendar
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-white/30 text-white hover:bg-white/10 text-xs sm:text-sm bg-transparent"
                    onClick={() => router.push("/invites")}
                  >
                    <Bell className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                    See Invites
                  </Button>
                </div>
              </div>

              <div className="flex flex-wrap lg:flex-col gap-2">
                <Button
                  size="sm"
                  className="bg-[#E63946] hover:bg-[#d62839] text-white text-xs sm:text-sm flex-1 lg:flex-none"
                >
                  <FileText className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                  Create Pitch
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="border-white/30 text-white hover:bg-white/10 text-xs sm:text-sm flex-1 lg:flex-none bg-transparent"
                >
                  <Upload className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                  Upload Content
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="border-white/30 text-white hover:bg-white/10 text-xs sm:text-sm flex-1 lg:flex-none bg-transparent"
                >
                  <Receipt className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                  View Invoices
                </Button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 max-w-full">
            <StatCard
              title="Total Campaigns"
              value={stats.totalCampaigns.value}
              deltaPct={stats.totalCampaigns.delta}
              deltaDir={stats.totalCampaigns.deltaDir}
              sparkline={stats.totalCampaigns.sparkline}
              tooltip={stats.totalCampaigns.tooltip}
              icon={<Briefcase className="w-5 h-5 sm:w-6 sm:h-6 text-blue-500" />}
              iconBg="bg-blue-500/20"
            />
            <StatCard
              title="Pending Collaborations"
              value={stats.pendingCollaborations.value}
              deltaPct={stats.pendingCollaborations.delta}
              deltaDir={stats.pendingCollaborations.deltaDir}
              sparkline={stats.pendingCollaborations.sparkline}
              tooltip={stats.pendingCollaborations.tooltip}
              icon={<CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6 text-purple-500" />}
              iconBg="bg-purple-500/20"
            />
            <StatCard
              title="Earnings This Month"
              value={`₹${stats.earningsThisMonth.value.toLocaleString()}`}
              deltaPct={stats.earningsThisMonth.delta}
              deltaDir={stats.earningsThisMonth.deltaDir}
              sparkline={stats.earningsThisMonth.sparkline}
              tooltip={stats.earningsThisMonth.tooltip}
              icon={<DollarSign className="w-5 h-5 sm:w-6 sm:h-6 text-green-500" />}
              iconBg="bg-green-500/20"
            />
            <StatCard
              title="Avg Engagement Rate"
              value={`${stats.avgEngagement.value}%`}
              deltaPct={stats.avgEngagement.delta}
              deltaDir={stats.avgEngagement.deltaDir}
              sparkline={stats.avgEngagement.sparkline}
              tooltip={stats.avgEngagement.tooltip}
              icon={<TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-orange-500" />}
              iconBg="bg-orange-500/20"
            />
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4"></div>

          <Card className="bg-[#0f1629]/50 border-white/10 p-4 sm:p-6 max-w-full">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg sm:text-xl font-bold text-white">Top Performing Posts</h2>
              <Button variant="ghost" size="sm" className="text-blue-500 hover:text-blue-400 text-xs sm:text-sm">
                View All <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4 ml-1" />
              </Button>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              {topPosts.map((post) => (
                <div key={post.id} className="group cursor-pointer">
                  <div className="relative aspect-square rounded-lg overflow-hidden mb-2 sm:mb-3">
                    <Image
                      src={post.image || "/placeholder.svg"}
                      alt="Post"
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="absolute bottom-2 left-2 right-2 text-white text-[10px] sm:text-xs space-y-1">
                        <div className="flex items-center gap-2">
                          <Heart className="w-3 h-3" />
                          <span>{(post.likes / 1000).toFixed(1)}K</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MessageCircle className="w-3 h-3" />
                          <span>{post.comments}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs sm:text-sm text-gray-400 truncate">{post.platform}</span>
                      <Badge className="bg-green-500/20 text-green-500 text-[10px] sm:text-xs">
                        {post.engagement}%
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 max-w-full">
            <Card className="bg-[#0f1629]/50 border-white/10 p-4 sm:p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg sm:text-xl font-bold text-white">Recent Campaigns</h2>
                <Button variant="ghost" size="sm" className="text-blue-500 hover:text-blue-400 text-xs sm:text-sm">
                  View All
                </Button>
              </div>
              <div className="space-y-3 sm:space-y-4">
                {recentCampaigns.map((campaign) => (
                  <div key={campaign.id} className="p-3 sm:p-4 bg-[#1a1f35] rounded-lg space-y-2 sm:space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-white text-sm sm:text-base truncate">{campaign.title}</h3>
                        <p className="text-xs sm:text-sm text-gray-400 truncate">{campaign.brand}</p>
                      </div>
                      <Badge
                        className={`flex-shrink-0 text-[10px] sm:text-xs ${
                          campaign.status === "active"
                            ? "bg-green-500/20 text-green-500"
                            : "bg-yellow-500/20 text-yellow-500"
                        }`}
                      >
                        {campaign.status}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between text-xs sm:text-sm flex-wrap gap-2">
                      <div className="flex items-center gap-1 text-gray-400">
                        <DollarSign className="w-3 h-3 sm:w-4 sm:h-4" />₹{campaign.budget.toLocaleString()}
                      </div>
                      <div className="flex items-center gap-1 text-gray-400">
                        <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />
                        {campaign.deadline}
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-[10px] sm:text-xs text-gray-400">
                        <span>Progress</span>
                        <span>{campaign.progress}%</span>
                      </div>
                      <div className="h-2 bg-[#252b45] rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-500 rounded-full transition-all"
                          style={{ width: `${campaign.progress}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="bg-[#0f1629]/50 border-white/10 p-4 sm:p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg sm:text-xl font-bold text-white">Social Media</h2>
                <Button variant="ghost" size="sm" className="text-blue-500 hover:text-blue-400 text-xs sm:text-sm">
                  Manage
                </Button>
              </div>
              <div className="space-y-3 sm:space-y-4">
                {socialStats.map((social) => {
                  const Icon = social.icon
                  return (
                    <div
                      key={social.platform}
                      className="flex items-center justify-between p-3 sm:p-4 bg-[#1a1f35] rounded-lg"
                    >
                      <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                        <div
                          className={`h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-gradient-to-br ${social.color} flex items-center justify-center flex-shrink-0`}
                        >
                          <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-white text-sm sm:text-base truncate">{social.platform}</p>
                          <p className="text-xs sm:text-sm text-gray-400 truncate">
                            {(social.followers / 1000).toFixed(1)}K followers
                          </p>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0 ml-2">
                        <p className="text-green-500 text-xs sm:text-sm font-medium">{social.growth}</p>
                        <p className="text-[10px] sm:text-xs text-gray-400">this month</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </Card>
          </div>

          <Card className="bg-[#0f1629]/50 border-white/10 p-4 sm:p-6 max-w-full overflow-hidden">
            <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
              <div className="min-w-0 flex-1">
                <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2 break-words">
                  Suggested Brands for You
                  <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400" />
                </h2>
                <p className="text-xs sm:text-sm text-gray-400 mt-1 break-words">
                  Curated based on your niche, audience, and recent collaborations
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="text-blue-500 hover:text-blue-400 text-xs sm:text-sm flex-shrink-0"
                onClick={() => router.push("/dashboard/creator/explore")}
              >
                View All <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4 ml-1" />
              </Button>
            </div>

            <div className="flex flex-wrap gap-3 mb-4 max-w-full">
              <Select value={filterNiche} onValueChange={setFilterNiche}>
                <SelectTrigger className="w-[140px] sm:w-[160px] bg-[#1a1f35] border-white/10 text-white text-xs sm:text-sm">
                  <SelectValue placeholder="All Niches" />
                </SelectTrigger>
                <SelectContent className="bg-[#1a1f35] border-white/10 text-white">
                  <SelectItem value="all">All Niches</SelectItem>
                  <SelectItem value="fashion">Fashion</SelectItem>
                  <SelectItem value="fitness">Fitness</SelectItem>
                  <SelectItem value="technology">Technology</SelectItem>
                  <SelectItem value="beauty">Beauty</SelectItem>
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[140px] sm:w-[160px] bg-[#1a1f35] border-white/10 text-white text-xs sm:text-sm">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent className="bg-[#1a1f35] border-white/10 text-white">
                  <SelectItem value="match">Match Score</SelectItem>
                  <SelectItem value="pay">Pay Range</SelectItem>
                  <SelectItem value="newest">Newest</SelectItem>
                </SelectContent>
              </Select>

              <div className="text-xs sm:text-sm text-gray-400 flex items-center ml-auto">
                Showing {filteredAndSortedBrands.length} opportunities
              </div>
            </div>

            <div
              className="overflow-x-auto pb-4 -mx-4 px-4 scrollbar-hide"
              style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
            >
              <div className="flex gap-4 min-w-max">
                {filteredAndSortedBrands.map((brand) => (
                  <div
                    key={brand.id}
                    className="w-[280px] sm:w-[320px] p-4 bg-[#1a1f35] rounded-lg space-y-3 hover:bg-[#252b45] transition-all hover:shadow-lg hover:scale-[1.02] flex-shrink-0"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="h-12 w-12 rounded-lg bg-white/10 flex items-center justify-center overflow-hidden flex-shrink-0">
                          <Image
                            src={brand.logo || "/placeholder.svg"}
                            alt={brand.name}
                            width={48}
                            height={48}
                            className="object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-white text-sm truncate">{brand.name}</h3>
                          <p className="text-xs text-gray-400 truncate">{brand.category}</p>
                        </div>
                      </div>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Badge className="bg-green-500/20 text-green-500 text-xs cursor-help flex-shrink-0">
                              ⭐ {brand.match}%
                            </Badge>
                          </TooltipTrigger>
                          <TooltipContent className="bg-[#1a1f35] border-white/10 text-white max-w-xs">
                            <p className="font-semibold mb-2 text-sm">Why this match?</p>
                            <ul className="space-y-1 text-xs">
                              {brand.matchReasons.map((reason, idx) => (
                                <li key={idx} className="flex items-start gap-1">
                                  <span className="text-green-400">✓</span>
                                  <span>{reason}</span>
                                </li>
                              ))}
                            </ul>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>

                    <p className="text-xs text-gray-300 line-clamp-2 leading-relaxed">{brand.campaign}</p>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-400">Pay Range</span>
                        <span className="text-sm text-white font-semibold">
                          ₹{brand.payRange.min.toLocaleString()} - ₹{brand.payRange.max.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        {brand.deliverables.map((deliverable, idx) => (
                          <div key={idx} className="flex items-center gap-1 bg-[#0f1629] px-2 py-1 rounded text-xs">
                            <span>{deliverable.icon}</span>
                            <span className="text-gray-300">{deliverable.label}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-1">
                      {brand.tags.map((tag, idx) => (
                        <Badge key={idx} variant="outline" className="text-[10px] border-white/10 text-gray-400">
                          {tag}
                        </Badge>
                      ))}
                    </div>

                    <div className="flex gap-2 pt-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1 border-white/10 text-white hover:bg-white/5 text-xs bg-transparent"
                        onClick={() => handlePreview(brand)}
                      >
                        Preview
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className={`border-white/10 hover:bg-white/5 text-xs ${
                          savedBrands.has(brand.id) ? "text-red-400" : "text-white"
                        }`}
                        onClick={() => handleSaveBrand(brand.id)}
                      >
                        <Heart className={`w-4 h-4 ${savedBrands.has(brand.id) ? "fill-current" : ""}`} />
                      </Button>
                      <Button
                        size="sm"
                        className="flex-1 bg-[#E63946] hover:bg-[#d62839] text-white text-xs"
                        onClick={() => handleApply(brand)}
                      >
                        Apply
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </main>
      </div>

      {selectedBrand && (
        <>
          <QuickApplyModal
            open={showApplyModal}
            onOpenChange={setShowApplyModal}
            brand={{
              name: selectedBrand.name,
              campaign: selectedBrand.campaign,
              payRange: selectedBrand.payRange,
            }}
          />
          <PreviewBriefModal
            open={showPreviewModal}
            onOpenChange={setShowPreviewModal}
            brand={{
              name: selectedBrand.name,
              logo: selectedBrand.logo,
              campaign: selectedBrand.campaign,
              brief: selectedBrand.brief,
              objectives: selectedBrand.objectives,
              deliverables: selectedBrand.deliverablesList,
              timeline: selectedBrand.timeline,
              terms: selectedBrand.terms,
              stats: selectedBrand.stats,
            }}
            onApply={() => {
              setShowPreviewModal(false)
              setShowApplyModal(true)
            }}
          />
        </>
      )}
    </div>
  )
}
