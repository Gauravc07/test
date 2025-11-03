"use client"

import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { InfluencerSidebar } from "@/components/influencer-sidebar"
import { InfluencerHeader } from "@/components/influencer-header"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PostInsightsModal } from "@/components/post-insights-modal"
import {
  TrendingUp,
  TrendingDown,
  Users,
  Heart,
  MessageCircle,
  Eye,
  Instagram,
  Youtube,
  Twitter,
  Facebook,
  Download,
  BarChart3,
  PieChart,
  ZoomIn,
  ExternalLink,
  Flame,
  Grid3x3,
  List,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import {
  BarChart,
  Bar,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart,
  Brush,
} from "recharts"

export default function AnalyticsPage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const [dateRange, setDateRange] = useState("30d")
  const [chartView, setChartView] = useState<"bar" | "donut">("bar")
  const [compareMode, setCompareMode] = useState(false)
  const [selectedPlatform, setSelectedPlatform] = useState<string | null>(null)
  const [isExporting, setIsExporting] = useState(false)

  const [postSortBy, setPostSortBy] = useState("engagementRate")
  const [postPlatformFilter, setPostPlatformFilter] = useState("all")
  const [postViewMode, setPostViewMode] = useState<"grid" | "list">("grid")
  const [selectedPost, setSelectedPost] = useState<any>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

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

  const followerGrowthData = [
    { date: "Oct 1", followers: 10000, comparison: 9700 },
    { date: "Oct 5", followers: 10120, comparison: 9800 },
    { date: "Oct 10", followers: 10250, comparison: 9900 },
    { date: "Oct 15", followers: 10400, comparison: 10050 },
    { date: "Oct 20", followers: 10480, comparison: 10100 },
    { date: "Oct 25", followers: 10530, comparison: 10180 },
    { date: "Oct 30", followers: 10650, comparison: 10250 },
  ]

  const engagementByPlatform = [
    { platform: "Instagram", engagements: 15000, rate: 4.5, color: "#E4405F" },
    { platform: "YouTube", engagements: 8500, rate: 3.8, color: "#FF0000" },
    { platform: "TikTok", engagements: 12000, rate: 5.1, color: "#000000" },
    { platform: "Twitter", engagements: 5500, rate: 2.8, color: "#1DA1F2" },
  ]

  const topPosts = [
    {
      id: "ig_12345",
      platform: "Instagram",
      thumbnail: "/mobile-app-dashboard-with-analytics.jpg",
      date: "Oct 18, 2024",
      isBoosted: false,
      campaignTag: "FestiveLaunch",
      metrics: {
        likes: 1200,
        comments: 90,
        shares: 35,
        saves: 420,
        engagementRate: 4.8,
        reach: 25600,
        impressions: 28000,
        clickThroughRate: 1.4,
      },
      deltaVsAvg: 25,
    },
    {
      id: "yt_67890",
      platform: "YouTube",
      thumbnail: "/diverse-woman-portrait.png",
      date: "Oct 15, 2024",
      isBoosted: true,
      campaignTag: "ProductReview",
      metrics: {
        likes: 2400,
        comments: 156,
        shares: 89,
        saves: 0,
        engagementRate: 6.2,
        reach: 45000,
        impressions: 52000,
        clickThroughRate: 2.1,
      },
      deltaVsAvg: 38,
    },
    {
      id: "tt_11223",
      platform: "TikTok",
      thumbnail: "/woman-fitness.png",
      date: "Oct 20, 2024",
      isBoosted: false,
      metrics: {
        likes: 3200,
        comments: 234,
        shares: 156,
        saves: 89,
        engagementRate: 7.5,
        reach: 62000,
        impressions: 68000,
      },
      deltaVsAvg: 52,
    },
    {
      id: "ig_44556",
      platform: "Instagram",
      thumbnail: "/man.jpg",
      date: "Oct 12, 2024",
      isBoosted: false,
      campaignTag: "BrandCollab",
      metrics: {
        likes: 980,
        comments: 67,
        shares: 23,
        saves: 340,
        engagementRate: 3.9,
        reach: 18000,
        impressions: 21000,
        clickThroughRate: 0.9,
      },
      deltaVsAvg: 15,
    },
    {
      id: "ig_55667",
      platform: "Instagram",
      thumbnail: "/mobile-app-dashboard-with-analytics.jpg",
      date: "Oct 8, 2024",
      isBoosted: true,
      metrics: {
        likes: 1450,
        comments: 102,
        shares: 45,
        saves: 510,
        engagementRate: 5.2,
        reach: 27600,
        impressions: 30120,
        clickThroughRate: 1.6,
      },
      deltaVsAvg: 32,
    },
    {
      id: "tw_77889",
      platform: "Twitter",
      thumbnail: "/diverse-woman-portrait.png",
      date: "Oct 5, 2024",
      isBoosted: false,
      metrics: {
        likes: 890,
        comments: 45,
        shares: 67,
        saves: 0,
        engagementRate: 3.2,
        reach: 15000,
        impressions: 18500,
      },
      deltaVsAvg: 12,
    },
  ]

  const filteredPosts = topPosts
    .filter((post) => postPlatformFilter === "all" || post.platform === postPlatformFilter)
    .sort((a, b) => {
      switch (postSortBy) {
        case "engagementRate":
          return b.metrics.engagementRate - a.metrics.engagementRate
        case "reach":
          return b.metrics.reach - a.metrics.reach
        case "comments":
          return b.metrics.comments - a.metrics.comments
        case "saves":
          return (b.metrics.saves || 0) - (a.metrics.saves || 0)
        default:
          return 0
      }
    })

  const handlePostClick = (post: any) => {
    setSelectedPost(post)
    setIsModalOpen(true)
  }

  const overallMetrics = [
    {
      label: "Total Reach",
      value: "2.4M",
      change: "+18.5%",
      trend: "up",
      icon: Eye,
    },
    {
      label: "Engagement Rate",
      value: "8.5%",
      change: "+2.3%",
      trend: "up",
      icon: Heart,
    },
    {
      label: "Total Followers",
      value: "344K",
      change: "+12.8%",
      trend: "up",
      icon: Users,
    },
    {
      label: "Avg. Comments",
      value: "342",
      change: "-5.2%",
      trend: "down",
      icon: MessageCircle,
    },
  ]

  const handleExport = async () => {
    setIsExporting(true)
    // Simulate export
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setIsExporting(false)
    // In production, this would trigger CSV/PNG download
    console.log("[v0] Exporting analytics data...")
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-black/90 border border-white/20 rounded-lg p-3 shadow-xl">
          <p className="text-white text-sm font-medium mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center gap-2 text-xs">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }} />
              <span className="text-gray-400">{entry.name}:</span>
              <span className="text-white font-medium">{entry.value.toLocaleString()}</span>
            </div>
          ))}
        </div>
      )
    }
    return null
  }

  const platformMetrics = [
    {
      platform: "Instagram",
      icon: Instagram,
      color: "from-purple-500 to-pink-500",
      followers: 125000,
      engagement: 9.2,
      reach: 850000,
      posts: 45,
      avgLikes: 11500,
      avgComments: 342,
    },
    {
      platform: "YouTube",
      icon: Youtube,
      color: "from-red-600 to-red-500",
      followers: 85000,
      engagement: 12.5,
      reach: 1200000,
      posts: 12,
      avgLikes: 8900,
      avgComments: 567,
    },
    {
      platform: "Twitter",
      icon: Twitter,
      color: "from-blue-400 to-blue-300",
      followers: 45000,
      engagement: 5.8,
      reach: 180000,
      posts: 120,
      avgLikes: 2600,
      avgComments: 89,
    },
    {
      platform: "Facebook",
      icon: Facebook,
      color: "from-blue-600 to-blue-400",
      followers: 89000,
      engagement: 6.5,
      reach: 320000,
      posts: 38,
      avgLikes: 5800,
      avgComments: 156,
    },
  ]

  const audienceDemographics = {
    ageGroups: [
      { range: "18-24", percentage: 35 },
      { range: "25-34", percentage: 42 },
      { range: "35-44", percentage: 15 },
      { range: "45+", percentage: 8 },
    ],
    gender: [
      { type: "Female", percentage: 58 },
      { type: "Male", percentage: 40 },
      { type: "Other", percentage: 2 },
    ],
    topLocations: [
      { city: "Mumbai", percentage: 22 },
      { city: "Delhi", percentage: 18 },
      { city: "Bangalore", percentage: 15 },
      { city: "Pune", percentage: 12 },
      { city: "Hyderabad", percentage: 10 },
    ],
  }

  const contentPerformance = [
    {
      type: "Reels",
      posts: 28,
      avgReach: 45000,
      avgEngagement: 12.5,
      trend: "up",
    },
    {
      type: "Stories",
      posts: 156,
      avgReach: 28000,
      avgEngagement: 8.2,
      trend: "up",
    },
    {
      type: "Posts",
      posts: 45,
      avgReach: 32000,
      avgEngagement: 9.8,
      trend: "down",
    },
    {
      type: "Videos",
      posts: 12,
      avgReach: 125000,
      avgEngagement: 15.2,
      trend: "up",
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-blue-950 to-black overflow-hidden">
      <InfluencerSidebar />

      <div className="lg:pl-64">
        <InfluencerHeader />

        <main className="p-3 sm:p-4 lg:p-6 space-y-4 sm:space-y-6 max-h-[calc(100vh-4rem)] overflow-y-auto">
          {/* Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
            <div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white">📊 Performance Analytics</h1>
              <p className="text-gray-400 text-xs sm:text-sm mt-1">
                Your growth, engagement, and content performance — all in one view
              </p>
            </div>
            <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto flex-wrap">
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="bg-[#1a1f35] text-white border border-white/10 rounded-lg px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm"
                aria-label="Select date range"
              >
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
                <option value="12mo">Last 12 months</option>
              </select>
              <Button
                onClick={handleExport}
                disabled={isExporting}
                className="bg-blue-600 hover:bg-blue-700 text-xs sm:text-sm px-3 sm:px-4"
              >
                <Download className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                {isExporting ? "Exporting..." : "Export"}
              </Button>
            </div>
          </div>

          {/* Overall Metrics */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {overallMetrics.map((metric) => {
              const Icon = metric.icon
              return (
                <Card key={metric.label} className="bg-[#0f1629]/50 border-white/10 p-4 sm:p-6">
                  <div className="flex items-center justify-between mb-2">
                    <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                    <Badge
                      className={`text-[10px] sm:text-xs ${
                        metric.trend === "up" ? "bg-green-500/20 text-green-500" : "bg-red-500/20 text-red-500"
                      }`}
                    >
                      {metric.trend === "up" ? (
                        <TrendingUp className="w-2 h-2 sm:w-3 sm:h-3 mr-1" />
                      ) : (
                        <TrendingDown className="w-2 h-2 sm:w-3 sm:h-3 mr-1" />
                      )}
                      {metric.change}
                    </Badge>
                  </div>
                  <p className="text-gray-400 text-xs sm:text-sm truncate">{metric.label}</p>
                  <p className="text-2xl sm:text-3xl font-bold text-white mt-1">{metric.value}</p>
                </Card>
              )
            })}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
            {/* Follower Growth Chart - 70% width */}
            <Card className="bg-[#0f1629]/50 border-white/10 p-4 sm:p-6 lg:col-span-2">
              <div className="flex items-center justify-between mb-4 sm:mb-6">
                <div>
                  <h2 className="text-lg sm:text-xl font-bold text-white">Follower Growth</h2>
                  <p className="text-xs sm:text-sm text-gray-400 mt-1">Track your audience growth over time</p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant={compareMode ? "default" : "outline"}
                    onClick={() => setCompareMode(!compareMode)}
                    className="text-xs"
                  >
                    <ZoomIn className="w-3 h-3 mr-1" />
                    Compare
                  </Button>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={followerGrowthData}>
                  <defs>
                    <linearGradient id="colorFollowers" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#E63946" stopOpacity={0.8} />
                      <stop offset="100%" stopColor="#E63946" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                  <XAxis dataKey="date" stroke="#9ca3af" style={{ fontSize: "12px" }} />
                  <YAxis stroke="#9ca3af" style={{ fontSize: "12px" }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ fontSize: "12px" }} />
                  <Area
                    type="monotone"
                    dataKey="followers"
                    stroke="#E63946"
                    strokeWidth={2}
                    fill="url(#colorFollowers)"
                    name="Your Followers"
                  />
                  {compareMode && (
                    <Area
                      type="monotone"
                      dataKey="comparison"
                      stroke="#60a5fa"
                      strokeWidth={2}
                      strokeDasharray="5 5"
                      fill="none"
                      name="Avg in Niche"
                    />
                  )}
                  <Brush dataKey="date" height={30} stroke="#E63946" />
                </AreaChart>
              </ResponsiveContainer>
            </Card>

            {/* Engagement by Platform Chart - 30% width */}
            <Card className="bg-[#0f1629]/50 border-white/10 p-4 sm:p-6">
              <div className="flex items-center justify-between mb-4 sm:mb-6">
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-white">Engagement</h2>
                  <p className="text-xs text-gray-400 mt-1">By platform</p>
                </div>
                <div className="flex gap-1">
                  <Button
                    size="sm"
                    variant={chartView === "bar" ? "default" : "ghost"}
                    onClick={() => setChartView("bar")}
                    className="p-2"
                  >
                    <BarChart3 className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant={chartView === "donut" ? "default" : "ghost"}
                    onClick={() => setChartView("donut")}
                    className="p-2"
                  >
                    <PieChart className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                {chartView === "bar" ? (
                  <BarChart data={engagementByPlatform} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                    <XAxis type="number" stroke="#9ca3af" style={{ fontSize: "10px" }} />
                    <YAxis dataKey="platform" type="category" stroke="#9ca3af" style={{ fontSize: "10px" }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="rate" name="Engagement Rate (%)" radius={[0, 8, 8, 0]}>
                      {engagementByPlatform.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                ) : (
                  <RechartsPieChart>
                    <Pie
                      data={engagementByPlatform}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      fill="#8884d8"
                      paddingAngle={5}
                      dataKey="engagements"
                      label={(entry) => `${entry.platform}: ${entry.rate}%`}
                    >
                      {engagementByPlatform.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </RechartsPieChart>
                )}
              </ResponsiveContainer>
            </Card>
          </div>

          {/* Platform Performance */}
          <Card className="bg-[#0f1629]/50 border-white/10 p-4 sm:p-6">
            <h2 className="text-lg sm:text-xl font-bold text-white mb-4 sm:mb-6">Platform Performance</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              {platformMetrics.map((platform) => {
                const Icon = platform.icon
                return (
                  <div key={platform.platform} className="p-4 sm:p-6 bg-[#1a1f35] rounded-lg space-y-3 sm:space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                        <div
                          className={`h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-gradient-to-br ${platform.color} flex items-center justify-center flex-shrink-0`}
                        >
                          <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-white text-sm sm:text-base truncate">{platform.platform}</h3>
                          <p className="text-xs sm:text-sm text-gray-400 truncate">
                            {(platform.followers / 1000).toFixed(1)}K followers
                          </p>
                        </div>
                      </div>
                      <Badge className="bg-green-500/20 text-green-500 text-xs sm:text-sm flex-shrink-0">
                        {platform.engagement}%
                      </Badge>
                    </div>

                    <div className="grid grid-cols-3 gap-3 sm:gap-4">
                      <div>
                        <p className="text-[10px] sm:text-xs text-gray-400">Reach</p>
                        <p className="text-base sm:text-lg font-bold text-white truncate">
                          {(platform.reach / 1000).toFixed(0)}K
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] sm:text-xs text-gray-400">Posts</p>
                        <p className="text-base sm:text-lg font-bold text-white">{platform.posts}</p>
                      </div>
                      <div>
                        <p className="text-[10px] sm:text-xs text-gray-400">Avg Likes</p>
                        <p className="text-base sm:text-lg font-bold text-white truncate">
                          {(platform.avgLikes / 1000).toFixed(1)}K
                        </p>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </Card>

          {/* Content Performance & Audience Demographics */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            {/* Content Performance */}
            <Card className="bg-[#0f1629]/50 border-white/10 p-4 sm:p-6">
              <h2 className="text-lg sm:text-xl font-bold text-white mb-4 sm:mb-6">Content Performance</h2>
              <div className="space-y-3 sm:space-y-4">
                {contentPerformance.map((content) => (
                  <div key={content.type} className="p-3 sm:p-4 bg-[#1a1f35] rounded-lg">
                    <div className="flex items-center justify-between mb-2 sm:mb-3">
                      <div>
                        <h3 className="font-medium text-white text-sm sm:text-base">{content.type}</h3>
                        <p className="text-xs sm:text-sm text-gray-400">{content.posts} posts</p>
                      </div>
                      <Badge
                        className={`text-[10px] sm:text-xs ${
                          content.trend === "up" ? "bg-green-500/20 text-green-500" : "bg-red-500/20 text-red-500"
                        }`}
                      >
                        {content.trend === "up" ? (
                          <TrendingUp className="w-2 h-2 sm:w-3 sm:h-3" />
                        ) : (
                          <TrendingDown className="w-2 h-2 sm:w-3 sm:h-3" />
                        )}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-3 sm:gap-4">
                      <div>
                        <p className="text-[10px] sm:text-xs text-gray-400">Avg Reach</p>
                        <p className="text-xs sm:text-sm font-bold text-white">
                          {(content.avgReach / 1000).toFixed(1)}K
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] sm:text-xs text-gray-400">Engagement</p>
                        <p className="text-xs sm:text-sm font-bold text-white">{content.avgEngagement}%</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Audience Demographics */}
            <Card className="bg-[#0f1629]/50 border-white/10 p-4 sm:p-6">
              <h2 className="text-lg sm:text-xl font-bold text-white mb-4 sm:mb-6">Audience Demographics</h2>
              <Tabs defaultValue="age" className="w-full">
                <TabsList className="grid w-full grid-cols-3 bg-[#1a1f35] text-xs sm:text-sm">
                  <TabsTrigger value="age">Age</TabsTrigger>
                  <TabsTrigger value="gender">Gender</TabsTrigger>
                  <TabsTrigger value="location">Location</TabsTrigger>
                </TabsList>
                <TabsContent value="age" className="space-y-2 sm:space-y-3 mt-3 sm:mt-4">
                  {audienceDemographics.ageGroups.map((group) => (
                    <div key={group.range} className="space-y-1 sm:space-y-2">
                      <div className="flex items-center justify-between text-xs sm:text-sm">
                        <span className="text-gray-400">{group.range}</span>
                        <span className="text-white font-medium">{group.percentage}%</span>
                      </div>
                      <div className="h-2 bg-[#1a1f35] rounded-full overflow-hidden">
                        <div className="h-full bg-blue-500 rounded-full" style={{ width: `${group.percentage}%` }} />
                      </div>
                    </div>
                  ))}
                </TabsContent>
                <TabsContent value="gender" className="space-y-2 sm:space-y-3 mt-3 sm:mt-4">
                  {audienceDemographics.gender.map((item) => (
                    <div key={item.type} className="space-y-1 sm:space-y-2">
                      <div className="flex items-center justify-between text-xs sm:text-sm">
                        <span className="text-gray-400">{item.type}</span>
                        <span className="text-white font-medium">{item.percentage}%</span>
                      </div>
                      <div className="h-2 bg-[#1a1f35] rounded-full overflow-hidden">
                        <div className="h-full bg-purple-500 rounded-full" style={{ width: `${item.percentage}%` }} />
                      </div>
                    </div>
                  ))}
                </TabsContent>
                <TabsContent value="location" className="space-y-2 sm:space-y-3 mt-3 sm:mt-4">
                  {audienceDemographics.topLocations.map((location) => (
                    <div key={location.city} className="space-y-1 sm:space-y-2">
                      <div className="flex items-center justify-between text-xs sm:text-sm">
                        <span className="text-gray-400">{location.city}</span>
                        <span className="text-white font-medium">{location.percentage}%</span>
                      </div>
                      <div className="h-2 bg-[#1a1f35] rounded-full overflow-hidden">
                        <div
                          className="h-full bg-green-500 rounded-full"
                          style={{ width: `${location.percentage}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </TabsContent>
              </Tabs>
            </Card>
          </div>

          <Card className="bg-[#0f1629]/50 border-white/10 p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 mb-4 sm:mb-6">
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
                  <Flame className="w-5 h-5 text-orange-500" />
                  Top Performing Posts
                </h2>
                <p className="text-xs sm:text-sm text-gray-400 mt-1">
                  See which of your posts performed best and learn what made them work
                </p>
              </div>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <Button
                  size="sm"
                  variant={postViewMode === "grid" ? "default" : "ghost"}
                  onClick={() => setPostViewMode("grid")}
                  className="p-2"
                >
                  <Grid3x3 className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  variant={postViewMode === "list" ? "default" : "ghost"}
                  onClick={() => setPostViewMode("list")}
                  className="p-2"
                >
                  <List className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-2 sm:gap-3 mb-4 sm:mb-6">
              <select
                value={postSortBy}
                onChange={(e) => setPostSortBy(e.target.value)}
                className="bg-[#1a1f35] text-white border border-white/10 rounded-lg px-3 py-1.5 text-xs sm:text-sm"
              >
                <option value="engagementRate">Engagement Rate</option>
                <option value="reach">Reach</option>
                <option value="comments">Comments</option>
                <option value="saves">Saves</option>
              </select>
              <select
                value={postPlatformFilter}
                onChange={(e) => setPostPlatformFilter(e.target.value)}
                className="bg-[#1a1f35] text-white border border-white/10 rounded-lg px-3 py-1.5 text-xs sm:text-sm"
              >
                <option value="all">All Platforms</option>
                <option value="Instagram">Instagram</option>
                <option value="YouTube">YouTube</option>
                <option value="TikTok">TikTok</option>
                <option value="Twitter">Twitter</option>
              </select>
            </div>

            {/* AI Summary */}
            <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6">
              <p className="text-xs sm:text-sm text-gray-300">
                <span className="font-semibold text-purple-400">AI Insight:</span> Your Reels outperform static posts by
                22% this month. Posts with trending audio get 35% more engagement.
              </p>
            </div>

            {/* Posts Grid/List */}
            <div
              className={
                postViewMode === "grid"
                  ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
                  : "space-y-4"
              }
            >
              {filteredPosts.map((post) => (
                <div
                  key={post.id}
                  onClick={() => handlePostClick(post)}
                  className={`group relative bg-[#1a1f35] rounded-lg overflow-hidden hover:ring-2 hover:ring-blue-500 transition-all duration-300 cursor-pointer ${
                    postViewMode === "list" ? "flex gap-4" : ""
                  }`}
                >
                  {/* Thumbnail */}
                  <div className={postViewMode === "grid" ? "aspect-square relative" : "w-32 h-32 flex-shrink-0"}>
                    <img
                      src={post.thumbnail || "/placeholder.svg"}
                      alt="Post thumbnail"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2 left-2">
                      {post.platform === "Instagram" && (
                        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                          <Instagram className="w-3 h-3 text-white" />
                        </div>
                      )}
                      {post.platform === "YouTube" && (
                        <div className="w-6 h-6 rounded-full bg-red-600 flex items-center justify-center">
                          <Youtube className="w-3 h-3 text-white" />
                        </div>
                      )}
                      {post.platform === "TikTok" && (
                        <div className="w-6 h-6 rounded-full bg-black flex items-center justify-center">
                          <span className="text-white text-[8px] font-bold">TT</span>
                        </div>
                      )}
                      {post.platform === "Twitter" && (
                        <div className="w-6 h-6 rounded-full bg-blue-400 flex items-center justify-center">
                          <Twitter className="w-3 h-3 text-white" />
                        </div>
                      )}
                    </div>
                    <div className="absolute top-2 right-2">
                      <Badge className="bg-green-500/90 text-white text-xs">+{post.deltaVsAvg}%</Badge>
                    </div>
                    {post.isBoosted && (
                      <div className="absolute bottom-2 left-2">
                        <Badge className="bg-blue-500/90 text-white text-xs">Boosted</Badge>
                      </div>
                    )}
                  </div>

                  {/* Stats */}
                  <div className={`p-3 ${postViewMode === "list" ? "flex-1" : ""}`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-gray-400">{post.date}</span>
                      {post.campaignTag && (
                        <Badge className="bg-purple-500/20 text-purple-400 text-xs">{post.campaignTag}</Badge>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <div className="text-gray-400">Engagement</div>
                        <div className="text-white font-bold">{post.metrics.engagementRate}%</div>
                      </div>
                      <div>
                        <div className="text-gray-400">Reach</div>
                        <div className="text-white font-medium">{(post.metrics.reach / 1000).toFixed(1)}K</div>
                      </div>
                      <div>
                        <div className="text-gray-400">Likes</div>
                        <div className="text-white font-medium">{post.metrics.likes}</div>
                      </div>
                      <div>
                        <div className="text-gray-400">Comments</div>
                        <div className="text-white font-medium">{post.metrics.comments}</div>
                      </div>
                    </div>
                    <Button size="sm" className="w-full mt-3 bg-blue-600 hover:bg-blue-700 text-xs">
                      <ExternalLink className="w-3 h-3 mr-1" />
                      View Insights
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </main>
      </div>

      {selectedPost && (
        <PostInsightsModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} post={selectedPost} />
      )}
    </div>
  )
}
