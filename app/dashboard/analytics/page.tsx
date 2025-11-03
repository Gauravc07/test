"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import DashboardNav from "@/components/dashboard-nav"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import {
  Users,
  Heart,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Eye,
  MapPin,
  Activity,
  Target,
  Zap,
  Download,
  Shield,
  UserCheck,
  UserX,
  Globe,
  Clock,
  BarChart3,
  ArrowLeft,
} from "lucide-react"

export default function AnalyticsPage() {
  const router = useRouter()
  const [selectedAccount, setSelectedAccount] = useState("instagram")
  const [timePeriod, setTimePeriod] = useState("30days")

  // Mock data for fake follower detection
  const authenticityData = {
    overallScore: 94,
    totalFollowers: 245000,
    realFollowers: 230300,
    suspiciousFollowers: 14700,
    suspiciousPercentage: 6,
    breakdown: {
      highQuality: { count: 196200, percentage: 80, label: "High Quality" },
      moderate: { count: 34100, percentage: 14, label: "Moderate Quality" },
      suspicious: { count: 14700, percentage: 6, label: "Suspicious" },
    },
    signals: [
      {
        type: "positive",
        label: "Organic Growth Pattern",
        description: "Steady follower growth without sudden spikes",
      },
      {
        type: "positive",
        label: "High Engagement Rate",
        description: "4.8% engagement rate indicates genuine audience",
      },
      { type: "positive", label: "Active Followers", description: "87% of followers are active in last 30 days" },
      { type: "warning", label: "Bot-like Accounts", description: "6% followers show bot-like behavior patterns" },
      { type: "positive", label: "Geographic Distribution", description: "Natural geographic spread of followers" },
    ],
  }

  // Audience demographics data
  const audienceData = {
    demographics: {
      age: [
        { range: "13-17", percentage: 8, count: 19600 },
        { range: "18-24", percentage: 35, count: 85750 },
        { range: "25-34", percentage: 42, count: 102900 },
        { range: "35-44", percentage: 12, count: 29400 },
        { range: "45+", percentage: 3, count: 7350 },
      ],
      gender: [
        { type: "Female", percentage: 68, count: 166600 },
        { type: "Male", percentage: 30, count: 73500 },
        { type: "Non-binary", percentage: 2, count: 4900 },
      ],
      locations: [
        { country: "India", city: "Mumbai", percentage: 28, count: 68600 },
        { country: "India", city: "Delhi", percentage: 22, count: 53900 },
        { country: "India", city: "Bangalore", percentage: 18, count: 44100 },
        { country: "India", city: "Pune", percentage: 12, count: 29400 },
        { country: "India", city: "Hyderabad", percentage: 8, count: 19600 },
        { country: "Other", city: "Other Cities", percentage: 12, count: 29400 },
      ],
    },
    interests: [
      { category: "Fitness & Wellness", percentage: 78, affinity: "Very High" },
      { category: "Fashion & Style", percentage: 65, affinity: "High" },
      { category: "Health & Nutrition", percentage: 58, affinity: "High" },
      { category: "Beauty & Skincare", percentage: 45, affinity: "Medium" },
      { category: "Travel", percentage: 38, affinity: "Medium" },
      { category: "Food & Dining", percentage: 32, affinity: "Medium" },
    ],
    brandAffinity: [
      { brand: "Nike", percentage: 42, category: "Sportswear" },
      { brand: "Adidas", percentage: 38, category: "Sportswear" },
      { brand: "Puma", percentage: 28, category: "Sportswear" },
      { brand: "Lululemon", percentage: 25, category: "Activewear" },
      { brand: "Apple", percentage: 52, category: "Technology" },
      { brand: "Samsung", percentage: 35, category: "Technology" },
    ],
    behavior: {
      activeHours: [
        { hour: "6-9 AM", percentage: 15 },
        { hour: "12-2 PM", percentage: 25 },
        { hour: "6-9 PM", percentage: 45 },
        { hour: "9-12 PM", percentage: 35 },
      ],
      deviceUsage: [
        { device: "Mobile", percentage: 82 },
        { device: "Desktop", percentage: 15 },
        { device: "Tablet", percentage: 3 },
      ],
    },
  }

  // Engagement analytics
  const engagementData = {
    overall: {
      rate: 4.8,
      avgLikes: 11750,
      avgComments: 342,
      avgShares: 156,
      avgSaves: 892,
    },
    byContentType: [
      { type: "Reels", engagement: 6.2, posts: 45, reach: 125000 },
      { type: "Posts", engagement: 4.1, posts: 89, reach: 98000 },
      { type: "Stories", engagement: 3.8, posts: 234, reach: 67000 },
      { type: "Carousel", engagement: 5.4, posts: 34, reach: 102000 },
    ],
    trends: [
      { metric: "Engagement Rate", current: 4.8, previous: 4.2, change: 14.3 },
      { metric: "Reach", current: 850000, previous: 720000, change: 18.1 },
      { metric: "Profile Visits", current: 45600, previous: 38200, change: 19.4 },
      { metric: "Website Clicks", current: 8900, previous: 7200, change: 23.6 },
    ],
  }

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
    return num.toString()
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-blue-950 to-black">
      <DashboardNav />

      <div className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="mb-4 text-gray-400 hover:text-white hover:bg-white/5"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Advanced Analytics</h1>
            <p className="text-gray-400">Deep insights into your audience and content performance</p>
          </div>
          <div className="flex gap-3">
            <Select value={selectedAccount} onValueChange={setSelectedAccount}>
              <SelectTrigger className="w-[200px] bg-white/5 border-white/10 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="instagram">Instagram</SelectItem>
                <SelectItem value="facebook">Facebook</SelectItem>
                <SelectItem value="youtube">YouTube</SelectItem>
              </SelectContent>
            </Select>
            <Select value={timePeriod} onValueChange={setTimePeriod}>
              <SelectTrigger className="w-[180px] bg-white/5 border-white/10 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7days">Last 7 Days</SelectItem>
                <SelectItem value="30days">Last 30 Days</SelectItem>
                <SelectItem value="90days">Last 90 Days</SelectItem>
                <SelectItem value="year">This Year</SelectItem>
              </SelectContent>
            </Select>
            <Button className="bg-red-600 hover:bg-red-700 text-white">
              <Download className="h-4 w-4 mr-2" />
              Export Report
            </Button>
          </div>
        </div>

        <Tabs defaultValue="authenticity" className="space-y-6">
          <TabsList className="bg-white/5 border-white/10">
            <TabsTrigger value="authenticity" className="data-[state=active]:bg-red-600">
              <Shield className="h-4 w-4 mr-2" />
              Authenticity
            </TabsTrigger>
            <TabsTrigger value="audience" className="data-[state=active]:bg-red-600">
              <Users className="h-4 w-4 mr-2" />
              Audience
            </TabsTrigger>
            <TabsTrigger value="engagement" className="data-[state=active]:bg-red-600">
              <Heart className="h-4 w-4 mr-2" />
              Engagement
            </TabsTrigger>
            <TabsTrigger value="insights" className="data-[state=active]:bg-red-600">
              <Zap className="h-4 w-4 mr-2" />
              AI Insights
            </TabsTrigger>
          </TabsList>

          {/* Authenticity & Fake Follower Detection Tab */}
          <TabsContent value="authenticity" className="space-y-6">
            {/* Overall Authenticity Score */}
            <Card className="bg-white/5 backdrop-blur-lg border-white/10">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Shield className="h-5 w-5 text-green-400" />
                  Authenticity Score
                </CardTitle>
                <CardDescription className="text-gray-400">
                  AI-powered analysis of your follower quality and authenticity
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-8">
                  <div className="flex flex-col items-center justify-center">
                    <div className="relative w-48 h-48">
                      <svg className="w-full h-full transform -rotate-90">
                        <circle cx="96" cy="96" r="88" stroke="rgba(255,255,255,0.1)" strokeWidth="16" fill="none" />
                        <circle
                          cx="96"
                          cy="96"
                          r="88"
                          stroke={
                            authenticityData.overallScore >= 90
                              ? "#10b981"
                              : authenticityData.overallScore >= 75
                                ? "#f59e0b"
                                : "#ef4444"
                          }
                          strokeWidth="16"
                          fill="none"
                          strokeDasharray={`${(authenticityData.overallScore / 100) * 553} 553`}
                          strokeLinecap="round"
                        />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-5xl font-bold text-white">{authenticityData.overallScore}</span>
                        <span className="text-gray-400 text-sm">/ 100</span>
                      </div>
                    </div>
                    <Badge
                      className={`mt-4 ${
                        authenticityData.overallScore >= 90
                          ? "bg-green-500/20 text-green-400 border-green-500/30"
                          : authenticityData.overallScore >= 75
                            ? "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
                            : "bg-red-500/20 text-red-400 border-red-500/30"
                      }`}
                    >
                      {authenticityData.overallScore >= 90
                        ? "Excellent"
                        : authenticityData.overallScore >= 75
                          ? "Good"
                          : "Needs Improvement"}
                    </Badge>
                  </div>

                  <div className="space-y-4">
                    <div className="bg-white/5 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-gray-400">Total Followers</span>
                        <span className="text-white font-semibold">
                          {formatNumber(authenticityData.totalFollowers)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-gray-400 flex items-center gap-2">
                          <UserCheck className="h-4 w-4 text-green-400" />
                          Real Followers
                        </span>
                        <span className="text-green-400 font-semibold">
                          {formatNumber(authenticityData.realFollowers)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400 flex items-center gap-2">
                          <UserX className="h-4 w-4 text-red-400" />
                          Suspicious Followers
                        </span>
                        <span className="text-red-400 font-semibold">
                          {formatNumber(authenticityData.suspiciousFollowers)}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <h4 className="text-white font-medium">Follower Quality Breakdown</h4>
                      {Object.values(authenticityData.breakdown).map((item) => (
                        <div key={item.label} className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-400">{item.label}</span>
                            <span className="text-white font-medium">
                              {item.percentage}% ({formatNumber(item.count)})
                            </span>
                          </div>
                          <Progress value={item.percentage} className="h-2" />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Authenticity Signals */}
            <Card className="bg-white/5 backdrop-blur-lg border-white/10">
              <CardHeader>
                <CardTitle className="text-white">Authenticity Signals</CardTitle>
                <CardDescription className="text-gray-400">
                  Key indicators used to calculate your authenticity score
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  {authenticityData.signals.map((signal, index) => (
                    <div
                      key={index}
                      className={`p-4 rounded-lg border ${
                        signal.type === "positive"
                          ? "bg-green-500/5 border-green-500/20"
                          : "bg-yellow-500/5 border-yellow-500/20"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        {signal.type === "positive" ? (
                          <CheckCircle className="h-5 w-5 text-green-400 flex-shrink-0 mt-0.5" />
                        ) : (
                          <AlertTriangle className="h-5 w-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                        )}
                        <div>
                          <p className="text-white font-medium text-sm mb-1">{signal.label}</p>
                          <p className="text-gray-400 text-xs">{signal.description}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Audience Demographics Tab */}
          <TabsContent value="audience" className="space-y-6">
            {/* Demographics Overview */}
            <div className="grid md:grid-cols-3 gap-6">
              {/* Age Distribution */}
              <Card className="bg-white/5 backdrop-blur-lg border-white/10">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Age Distribution
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {audienceData.demographics.age.map((group) => (
                    <div key={group.range} className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-400">{group.range} years</span>
                        <span className="text-white font-medium">{group.percentage}%</span>
                      </div>
                      <Progress value={group.percentage} className="h-2" />
                      <p className="text-xs text-gray-500">{formatNumber(group.count)} followers</p>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Gender Distribution */}
              <Card className="bg-white/5 backdrop-blur-lg border-white/10">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    Gender Split
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {audienceData.demographics.gender.map((item) => (
                    <div key={item.type} className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-400">{item.type}</span>
                        <span className="text-white font-medium">{item.percentage}%</span>
                      </div>
                      <Progress value={item.percentage} className="h-2" />
                      <p className="text-xs text-gray-500">{formatNumber(item.count)} followers</p>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Top Locations */}
              <Card className="bg-white/5 backdrop-blur-lg border-white/10">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    Top Locations
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {audienceData.demographics.locations.map((location) => (
                    <div key={location.city} className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-400">{location.city}</span>
                        <span className="text-white font-medium">{location.percentage}%</span>
                      </div>
                      <Progress value={location.percentage} className="h-2" />
                      <p className="text-xs text-gray-500">{formatNumber(location.count)} followers</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* Interests & Brand Affinity */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Content Interests */}
              <Card className="bg-white/5 backdrop-blur-lg border-white/10">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    Content Interests
                  </CardTitle>
                  <CardDescription className="text-gray-400">What your audience is interested in</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {audienceData.interests.map((interest) => (
                    <div
                      key={interest.category}
                      className="flex items-center justify-between p-3 bg-white/5 rounded-lg"
                    >
                      <div>
                        <p className="text-white font-medium text-sm">{interest.category}</p>
                        <p className="text-xs text-gray-500">Affinity: {interest.affinity}</p>
                      </div>
                      <Badge
                        className={`${
                          interest.affinity === "Very High"
                            ? "bg-green-500/20 text-green-400 border-green-500/30"
                            : interest.affinity === "High"
                              ? "bg-blue-500/20 text-blue-400 border-blue-500/30"
                              : "bg-gray-500/20 text-gray-400 border-gray-500/30"
                        }`}
                      >
                        {interest.percentage}%
                      </Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Brand Affinity */}
              <Card className="bg-white/5 backdrop-blur-lg border-white/10">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Brand Affinity
                  </CardTitle>
                  <CardDescription className="text-gray-400">
                    Brands your audience follows and engages with
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {audienceData.brandAffinity.map((brand) => (
                    <div key={brand.brand} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                      <div>
                        <p className="text-white font-medium text-sm">{brand.brand}</p>
                        <p className="text-xs text-gray-500">{brand.category}</p>
                      </div>
                      <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">
                        {brand.percentage}%
                      </Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* Audience Behavior */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Active Hours */}
              <Card className="bg-white/5 backdrop-blur-lg border-white/10">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Peak Activity Hours
                  </CardTitle>
                  <CardDescription className="text-gray-400">When your audience is most active</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {audienceData.behavior.activeHours.map((time) => (
                    <div key={time.hour} className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-400">{time.hour}</span>
                        <span className="text-white font-medium">{time.percentage}%</span>
                      </div>
                      <Progress value={time.percentage} className="h-2" />
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Device Usage */}
              <Card className="bg-white/5 backdrop-blur-lg border-white/10">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Globe className="h-5 w-5" />
                    Device Usage
                  </CardTitle>
                  <CardDescription className="text-gray-400">How your audience accesses content</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {audienceData.behavior.deviceUsage.map((device) => (
                    <div key={device.device} className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-400">{device.device}</span>
                        <span className="text-white font-medium">{device.percentage}%</span>
                      </div>
                      <Progress value={device.percentage} className="h-2" />
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Engagement Analytics Tab */}
          <TabsContent value="engagement" className="space-y-6">
            {/* Overall Engagement Metrics */}
            <div className="grid md:grid-cols-4 gap-6">
              <Card className="bg-white/5 backdrop-blur-lg border-white/10">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-gray-400">Engagement Rate</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-white">{engagementData.overall.rate}%</p>
                  <Badge className="mt-2 bg-green-500/20 text-green-400 border-green-500/30">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    +14.3%
                  </Badge>
                </CardContent>
              </Card>

              <Card className="bg-white/5 backdrop-blur-lg border-white/10">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-gray-400">Avg Likes</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-white">{formatNumber(engagementData.overall.avgLikes)}</p>
                  <p className="text-xs text-gray-500 mt-2">per post</p>
                </CardContent>
              </Card>

              <Card className="bg-white/5 backdrop-blur-lg border-white/10">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-gray-400">Avg Comments</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-white">{engagementData.overall.avgComments}</p>
                  <p className="text-xs text-gray-500 mt-2">per post</p>
                </CardContent>
              </Card>

              <Card className="bg-white/5 backdrop-blur-lg border-white/10">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-gray-400">Avg Saves</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-white">{engagementData.overall.avgSaves}</p>
                  <p className="text-xs text-gray-500 mt-2">per post</p>
                </CardContent>
              </Card>
            </div>

            {/* Engagement by Content Type */}
            <Card className="bg-white/5 backdrop-blur-lg border-white/10">
              <CardHeader>
                <CardTitle className="text-white">Engagement by Content Type</CardTitle>
                <CardDescription className="text-gray-400">
                  Performance comparison across different content formats
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {engagementData.byContentType.map((content) => (
                    <div key={content.type} className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-white font-medium">{content.type}</p>
                          <p className="text-sm text-gray-400">
                            {content.posts} posts • {formatNumber(content.reach)} reach
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-white">{content.engagement}%</p>
                          <p className="text-xs text-gray-500">engagement</p>
                        </div>
                      </div>
                      <Progress value={(content.engagement / 10) * 100} className="h-2" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Growth Trends */}
            <Card className="bg-white/5 backdrop-blur-lg border-white/10">
              <CardHeader>
                <CardTitle className="text-white">Growth Trends</CardTitle>
                <CardDescription className="text-gray-400">Key metrics compared to previous period</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  {engagementData.trends.map((trend) => (
                    <div key={trend.metric} className="p-4 bg-white/5 rounded-lg">
                      <p className="text-gray-400 text-sm mb-2">{trend.metric}</p>
                      <div className="flex items-end justify-between">
                        <div>
                          <p className="text-2xl font-bold text-white">{formatNumber(trend.current)}</p>
                          <p className="text-xs text-gray-500">Current</p>
                        </div>
                        <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                          <TrendingUp className="h-3 w-3 mr-1" />+{trend.change}%
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* AI Insights Tab */}
          <TabsContent value="insights" className="space-y-6">
            <Card className="bg-white/5 backdrop-blur-lg border-white/10">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Zap className="h-5 w-5 text-yellow-400" />
                  AI-Powered Recommendations
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Personalized insights to optimize your content strategy
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="p-4 bg-green-500/5 border border-green-500/20 rounded-lg">
                    <div className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-white font-medium mb-1">Optimal Posting Time</p>
                        <p className="text-sm text-gray-400 mb-3">
                          Your audience is most active between 7-9 PM IST. Posts during this window get 45% more
                          engagement.
                        </p>
                        <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white">
                          Schedule Posts
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-blue-500/5 border border-blue-500/20 rounded-lg">
                    <div className="flex items-start gap-3">
                      <Eye className="h-5 w-5 text-blue-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-white font-medium mb-1">Content Format Opportunity</p>
                        <p className="text-sm text-gray-400 mb-3">
                          Reels are performing 62% better than posts. Consider creating 3-4 reels per week.
                        </p>
                        <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">
                          View Examples
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-purple-500/5 border border-purple-500/20 rounded-lg">
                    <div className="flex items-start gap-3">
                      <Target className="h-5 w-5 text-purple-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-white font-medium mb-1">Audience Expansion</p>
                        <p className="text-sm text-gray-400 mb-3">
                          Your content resonates with 25-34 age group. Target similar demographics for growth.
                        </p>
                        <Button size="sm" className="bg-purple-600 hover:bg-purple-700 text-white">
                          Explore Audience
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-yellow-500/5 border border-yellow-500/20 rounded-lg">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="h-5 w-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-white font-medium mb-1">Engagement Drop Alert</p>
                        <p className="text-sm text-gray-400 mb-3">
                          Story views decreased 15% this week. Add more interactive elements like polls and questions.
                        </p>
                        <Button size="sm" className="bg-yellow-600 hover:bg-yellow-700 text-white">
                          Improve Stories
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
