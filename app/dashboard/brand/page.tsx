"use client"

import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  TrendingUp,
  DollarSign,
  Users,
  Target,
  ArrowUpRight,
  Clock,
  CheckCircle2,
  Star,
  Calendar,
  FileText,
  Sparkles,
  AlertCircle,
} from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import BrandSidebar from "@/components/brand-sidebar"
import BrandHeader from "@/components/brand-header"
import Link from "next/link"
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function BrandDashboard() {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && (!user || user.role !== "brand")) {
      router.push("/auth/login")
    }
  }, [user, isLoading, router])

  if (isLoading || !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0a0e1a] via-[#0f1629] to-[#0a0e1a] flex items-center justify-center">
        <div className="text-white text-sm">Loading...</div>
      </div>
    )
  }

  const stats = {
    totalSpent: 125000,
    monthlySpend: 45000,
    activeCampaigns: 5,
    totalReach: 1450000,
    avgEngagement: 4.7,
    avgROI: 3.2,
    totalCreators: 28,
    pendingPayments: 25000,
  }

  const reachSparklineData = [
    { value: 1200000 },
    { value: 1250000 },
    { value: 1180000 },
    { value: 1320000 },
    { value: 1400000 },
    { value: 1450000 },
  ]

  const engagementSparklineData = [
    { value: 4.2 },
    { value: 4.4 },
    { value: 4.3 },
    { value: 4.6 },
    { value: 4.5 },
    { value: 4.7 },
  ]

  const campaignPerformanceData = [
    { date: "Jan 20", reach: 850000, engagement: 38000, spend: 28000 },
    { date: "Jan 27", reach: 920000, engagement: 42000, spend: 32000 },
    { date: "Feb 3", reach: 1100000, engagement: 48000, spend: 38000 },
    { date: "Feb 10", reach: 1250000, engagement: 55000, spend: 42000 },
    { date: "Feb 17", reach: 1350000, engagement: 60000, spend: 45000 },
    { date: "Feb 24", reach: 1450000, engagement: 68000, spend: 45000 },
  ]

  const platformSplitData = [
    { name: "Instagram", value: 45, color: "#E1306C" },
    { name: "YouTube", value: 30, color: "#FF0000" },
    { name: "TikTok", value: 20, color: "#000000" },
    { name: "Twitter", value: 5, color: "#1DA1F2" },
  ]

  const recentCampaigns = [
    {
      id: 1,
      title: "Product Review Campaign",
      status: "active",
      budget: 45000,
      spent: 30000,
      creators: 8,
      reach: 450000,
      engagement: 4.2,
      deadline: "2025-02-15",
      progress: 67,
    },
    {
      id: 2,
      title: "Spring Collection Launch",
      status: "active",
      budget: 60000,
      spent: 20000,
      creators: 12,
      reach: 680000,
      engagement: 5.1,
      deadline: "2025-02-20",
      progress: 33,
    },
    {
      id: 3,
      title: "Brand Awareness Drive",
      status: "completed",
      budget: 20000,
      spent: 20000,
      creators: 8,
      reach: 320000,
      engagement: 3.8,
      deadline: "2025-01-30",
      progress: 100,
    },
  ]

  const topCreators = [
    {
      id: 1,
      name: "Priya Sharma",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=priya",
      category: "Tech & Lifestyle",
      followers: 125000,
      engagement: 4.5,
      rating: 4.8,
      campaigns: 3,
      totalReach: 380000,
    },
    {
      id: 2,
      name: "Rahul Verma",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=rahul",
      category: "Fashion & Style",
      followers: 95000,
      engagement: 5.2,
      rating: 4.9,
      campaigns: 2,
      totalReach: 290000,
    },
    {
      id: 3,
      name: "Ananya Patel",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=ananya",
      category: "Food & Travel",
      followers: 180000,
      engagement: 4.8,
      rating: 4.7,
      campaigns: 4,
      totalReach: 520000,
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-blue-950 to-black overflow-x-hidden">
      <BrandSidebar />
      <div className="lg:pl-64">
        <BrandHeader />
        <main className="p-4 md:p-6 lg:p-8 max-w-full">
          <div className="mb-6 md:mb-8">
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-2">
              Welcome back, {user?.name || "Brand"} 👋
            </h1>
            <p className="text-sm md:text-base text-gray-400 mb-4">
              You've reached <span className="font-semibold text-white">3.2M people</span> this week — Your engagement
              rate grew <span className="font-semibold text-green-500">12%</span> vs last month!
            </p>
            <div className="flex flex-wrap gap-2">
              <Link href="/dashboard/brand/campaigns">
                <Button size="sm" className="bg-orange-600 hover:bg-orange-700 text-xs sm:text-sm">
                  <Calendar className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                  View Calendar
                </Button>
              </Link>
              <Link href="/dashboard/brand/campaigns">
                <Button size="sm" variant="outline" className="border-white/10 bg-transparent text-xs sm:text-sm">
                  <Target className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                  Start New Campaign
                </Button>
              </Link>
              <Link href="/dashboard/brand/analytics">
                <Button size="sm" variant="outline" className="border-white/10 bg-transparent text-xs sm:text-sm">
                  <FileText className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                  View Insights Report
                </Button>
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 lg:gap-6 mb-6 md:mb-8">
            <Card className="bg-[#0f1629]/50 border-white/10 p-4 md:p-5 lg:p-6 overflow-hidden">
              <div className="flex items-center justify-between mb-3">
                <div className="h-10 w-10 md:h-12 md:w-12 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0">
                  <DollarSign className="w-5 h-5 md:w-6 md:h-6 text-green-500" />
                </div>
                <Badge className="bg-green-500/20 text-green-500 text-xs flex-shrink-0">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  +12%
                </Badge>
              </div>
              <p className="text-xs md:text-sm text-gray-400 mb-1">Budget Spent This Month</p>
              <p className="text-xl md:text-2xl lg:text-3xl font-bold text-white break-words">
                ₹{stats.monthlySpend.toLocaleString()}
              </p>
              <p className="text-xs text-gray-500 mt-1">of ₹{stats.totalSpent.toLocaleString()} total</p>
            </Card>

            <Card className="bg-[#0f1629]/50 border-white/10 p-4 md:p-5 lg:p-6 overflow-hidden">
              <div className="flex items-center justify-between mb-3">
                <div className="h-10 w-10 md:h-12 md:w-12 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                  <Target className="w-5 h-5 md:w-6 md:h-6 text-blue-500" />
                </div>
                <Badge className="bg-blue-500/20 text-blue-500 text-xs flex-shrink-0">
                  <Clock className="w-3 h-3 mr-1" />
                  Active
                </Badge>
              </div>
              <p className="text-xs md:text-sm text-gray-400 mb-1">Active Campaigns</p>
              <p className="text-xl md:text-2xl lg:text-3xl font-bold text-white">{stats.activeCampaigns}</p>
              <p className="text-xs text-gray-500 mt-1">2 ending this week • 82% avg progress</p>
            </Card>

            <Card className="bg-[#0f1629]/50 border-white/10 p-4 md:p-5 lg:p-6 overflow-hidden">
              <div className="flex items-center justify-between mb-3">
                <div className="h-10 w-10 md:h-12 md:w-12 rounded-full bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                  <Users className="w-5 h-5 md:w-6 md:h-6 text-purple-500" />
                </div>
                <Badge className="bg-purple-500/20 text-purple-500 text-xs flex-shrink-0">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  +22%
                </Badge>
              </div>
              <p className="text-xs md:text-sm text-gray-400 mb-1">Total Reach</p>
              <p className="text-xl md:text-2xl lg:text-3xl font-bold text-white break-words">
                {(stats.totalReach / 1000000).toFixed(2)}M
              </p>
              <div className="mt-2 h-8">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={reachSparklineData}>
                    <Line type="monotone" dataKey="value" stroke="#a855f7" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </Card>

            <Card className="bg-[#0f1629]/50 border-white/10 p-4 md:p-5 lg:p-6 overflow-hidden">
              <div className="flex items-center justify-between mb-3">
                <div className="h-10 w-10 md:h-12 md:w-12 rounded-full bg-orange-500/20 flex items-center justify-center flex-shrink-0">
                  <TrendingUp className="w-5 h-5 md:w-6 md:h-6 text-orange-500" />
                </div>
                <Badge className="bg-orange-500/20 text-orange-500 text-xs flex-shrink-0">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  +0.8%
                </Badge>
              </div>
              <p className="text-xs md:text-sm text-gray-400 mb-1">Avg Engagement Rate</p>
              <p className="text-xl md:text-2xl lg:text-3xl font-bold text-white">{stats.avgEngagement}%</p>
              <div className="mt-2 h-8">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={engagementSparklineData}>
                    <Line type="monotone" dataKey="value" stroke="#f97316" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </div>

          <Card className="bg-[#0f1629]/50 border-white/10 p-4 md:p-5 lg:p-6 mb-6 md:mb-8 overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 md:mb-6 gap-3">
              <h3 className="text-base md:text-lg lg:text-xl font-bold text-white">Campaign Performance</h3>
              <Tabs defaultValue="overview" className="w-full sm:w-auto">
                <TabsList className="grid w-full grid-cols-3 bg-[#1a1f35]">
                  <TabsTrigger value="overview" className="text-xs sm:text-sm">
                    Overview
                  </TabsTrigger>
                  <TabsTrigger value="platform" className="text-xs sm:text-sm">
                    Platform
                  </TabsTrigger>
                  <TabsTrigger value="roi" className="text-xs sm:text-sm">
                    ROI
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            <div className="h-[250px] sm:h-[300px] md:h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={campaignPerformanceData}>
                  <defs>
                    <linearGradient id="colorReach" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#a855f7" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#a855f7" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorEngagement" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                  <XAxis dataKey="date" stroke="#9ca3af" style={{ fontSize: "10px" }} />
                  <YAxis stroke="#9ca3af" style={{ fontSize: "10px" }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1a1f35",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: "8px",
                      fontSize: "12px",
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: "12px" }} />
                  <Area type="monotone" dataKey="reach" stroke="#a855f7" fillOpacity={1} fill="url(#colorReach)" />
                  <Area
                    type="monotone"
                    dataKey="engagement"
                    stroke="#3b82f6"
                    fillOpacity={1}
                    fill="url(#colorEngagement)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 mb-6 md:mb-8">
            {/* Active Campaigns */}
            <Card className="bg-[#0f1629]/50 border-white/10 p-4 md:p-5 lg:p-6 overflow-hidden">
              <div className="flex items-center justify-between mb-4 md:mb-6">
                <h3 className="text-base md:text-lg lg:text-xl font-bold text-white">Active Campaigns</h3>
                <Link href="/dashboard/brand/campaigns">
                  <Button size="sm" variant="ghost" className="text-blue-500 hover:text-blue-400 text-xs md:text-sm">
                    View All
                    <ArrowUpRight className="w-3 h-3 md:w-4 md:h-4 ml-1" />
                  </Button>
                </Link>
              </div>
              <div className="space-y-3 md:space-y-4">
                {recentCampaigns
                  .filter((c) => c.status === "active")
                  .map((campaign) => (
                    <div key={campaign.id} className="p-3 md:p-4 bg-[#1a1f35] rounded-lg">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-white text-sm md:text-base mb-1 truncate">
                            {campaign.title}
                          </h4>
                          <div className="flex items-center gap-2 text-xs text-gray-400 flex-wrap">
                            <span>{campaign.creators} creators</span>
                            <span>•</span>
                            <span>{(campaign.reach / 1000).toFixed(0)}K reach</span>
                          </div>
                        </div>
                        <Badge className="bg-green-500/20 text-green-500 text-xs flex-shrink-0 ml-2">
                          <Clock className="w-3 h-3 mr-1" />
                          Active
                        </Badge>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs text-gray-400">
                          <span>Progress</span>
                          <span>{campaign.progress}%</span>
                        </div>
                        <div className="w-full bg-[#0a0e1a] rounded-full h-2">
                          <div
                            className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all"
                            style={{ width: `${campaign.progress}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </Card>

            {/* Top Performing Creators */}
            <Card className="bg-[#0f1629]/50 border-white/10 p-4 md:p-5 lg:p-6 overflow-hidden">
              <div className="flex items-center justify-between mb-4 md:mb-6">
                <h3 className="text-base md:text-lg lg:text-xl font-bold text-white">Top Performing Creators</h3>
                <Link href="/dashboard/brand/find-influencers">
                  <Button size="sm" variant="ghost" className="text-blue-500 hover:text-blue-400 text-xs md:text-sm">
                    Find More
                    <ArrowUpRight className="w-3 h-3 md:w-4 md:h-4 ml-1" />
                  </Button>
                </Link>
              </div>
              <div className="space-y-3 md:space-y-4">
                {topCreators.map((creator) => (
                  <div key={creator.id} className="flex items-center gap-3 p-3 bg-[#1a1f35] rounded-lg">
                    <Avatar className="h-10 w-10 md:h-12 md:w-12 border-2 border-blue-500 flex-shrink-0">
                      <AvatarImage src={creator.avatar || "/placeholder.svg"} alt={creator.name} />
                      <AvatarFallback>{creator.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-medium text-white text-sm md:text-base truncate">{creator.name}</p>
                        <CheckCircle2 className="w-3 h-3 md:w-4 md:h-4 text-blue-500 flex-shrink-0" />
                      </div>
                      <div className="flex items-center gap-3 text-xs text-gray-400 flex-wrap">
                        <span>{(creator.followers / 1000).toFixed(0)}K followers</span>
                        <span>•</span>
                        <span>{creator.campaigns} campaigns</span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1 flex-shrink-0">
                      <div className="flex items-center gap-1 text-yellow-500">
                        <Star className="w-3 h-3 fill-current" />
                        <span className="text-xs font-medium">{creator.rating}</span>
                      </div>
                      <span className="text-xs text-gray-400">{creator.engagement}% eng</span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          <Card className="bg-[#0f1629]/50 border-white/10 p-4 md:p-5 lg:p-6 mb-6 md:mb-8 overflow-hidden">
            <div className="flex items-center gap-2 mb-4 md:mb-6">
              <Sparkles className="w-5 h-5 md:w-6 md:h-6 text-orange-500" />
              <h3 className="text-base md:text-lg lg:text-xl font-bold text-white">AI-Powered Insights</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
              <div className="p-3 md:p-4 bg-gradient-to-br from-green-500/10 to-green-500/5 border border-green-500/20 rounded-lg">
                <div className="flex items-start gap-3">
                  <div className="h-8 w-8 md:h-10 md:w-10 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0">
                    <TrendingUp className="w-4 h-4 md:w-5 md:h-5 text-green-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs md:text-sm font-medium text-white mb-1">High ROI Creators</p>
                    <p className="text-xs text-gray-400 break-words">
                      Priya Sharma and 2 others delivered 3.5x ROI this month
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-3 md:p-4 bg-gradient-to-br from-orange-500/10 to-orange-500/5 border border-orange-500/20 rounded-lg">
                <div className="flex items-start gap-3">
                  <div className="h-8 w-8 md:h-10 md:w-10 rounded-full bg-orange-500/20 flex items-center justify-center flex-shrink-0">
                    <AlertCircle className="w-4 h-4 md:w-5 md:h-5 text-orange-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs md:text-sm font-medium text-white mb-1">Deadline Alert</p>
                    <p className="text-xs text-gray-400 break-words">
                      2 campaigns ending this week — review deliverables now
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-3 md:p-4 bg-gradient-to-br from-blue-500/10 to-blue-500/5 border border-blue-500/20 rounded-lg">
                <div className="flex items-start gap-3">
                  <div className="h-8 w-8 md:h-10 md:w-10 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                    <Sparkles className="w-4 h-4 md:w-5 md:h-5 text-blue-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs md:text-sm font-medium text-white mb-1">Trending Audience</p>
                    <p className="text-xs text-gray-400 break-words">
                      You're trending among Gen Z — try micro-influencers
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
            <Card className="bg-[#0f1629]/50 border-white/10 p-4 md:p-5 lg:p-6 overflow-hidden">
              <h3 className="text-base md:text-lg font-bold text-white mb-4">Quick Actions</h3>
              <div className="space-y-2">
                <Link href="/dashboard/brand/campaigns">
                  <Button className="w-full bg-blue-600 hover:bg-blue-700 justify-start text-xs sm:text-sm">
                    <Target className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                    Create New Campaign
                  </Button>
                </Link>
                <Link href="/dashboard/brand/find-influencers">
                  <Button
                    variant="outline"
                    className="w-full border-white/10 bg-transparent justify-start text-xs sm:text-sm"
                  >
                    <Users className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                    Find Influencers
                  </Button>
                </Link>
                <Link href="/dashboard/brand/analytics">
                  <Button
                    variant="outline"
                    className="w-full border-white/10 bg-transparent justify-start text-xs sm:text-sm"
                  >
                    <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                    View Analytics
                  </Button>
                </Link>
              </div>
            </Card>

            <Card className="bg-[#0f1629]/50 border-white/10 p-4 md:p-5 lg:p-6 lg:col-span-2 overflow-hidden">
              <h3 className="text-base md:text-lg font-bold text-white mb-4">ROI Summary</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
                <div className="text-center p-3 md:p-4 bg-[#1a1f35] rounded-lg">
                  <p className="text-xs text-gray-400 mb-1">Average ROI</p>
                  <p className="text-xl md:text-2xl font-bold text-white">{stats.avgROI}x</p>
                  <Badge className="bg-green-500/20 text-green-500 text-xs mt-2">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    Excellent
                  </Badge>
                </div>
                <div className="text-center p-3 md:p-4 bg-[#1a1f35] rounded-lg">
                  <p className="text-xs text-gray-400 mb-1">Cost per 1K</p>
                  <p className="text-xl md:text-2xl font-bold text-white">₹86</p>
                  <Badge className="bg-blue-500/20 text-blue-500 text-xs mt-2">Industry Avg</Badge>
                </div>
                <div className="text-center p-3 md:p-4 bg-[#1a1f35] rounded-lg">
                  <p className="text-xs text-gray-400 mb-1">Conversion</p>
                  <p className="text-xl md:text-2xl font-bold text-white">2.8%</p>
                  <Badge className="bg-green-500/20 text-green-500 text-xs mt-2">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    +0.5%
                  </Badge>
                </div>
                <div className="text-center p-3 md:p-4 bg-[#1a1f35] rounded-lg">
                  <p className="text-xs text-gray-400 mb-1">Pending</p>
                  <p className="text-xl md:text-2xl font-bold text-white">₹25K</p>
                  <Badge className="bg-yellow-500/20 text-yellow-500 text-xs mt-2">
                    <Clock className="w-3 h-3 mr-1" />
                    Due Soon
                  </Badge>
                </div>
              </div>
            </Card>
          </div>
        </main>
      </div>
    </div>
  )
}
