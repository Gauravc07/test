"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  LineChart,
  Line,
  PieChart,
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
} from "recharts"
import {
  Instagram,
  Youtube,
  Twitter,
  Facebook,
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  Eye,
  TrendingUp,
  Lightbulb,
  ExternalLink,
  Copy,
  Megaphone,
  X,
} from "lucide-react"

interface PostInsightsModalProps {
  isOpen: boolean
  onClose: () => void
  post: {
    id: string
    platform: string
    thumbnail: string
    date: string
    isBoosted: boolean
    campaignTag?: string
    metrics: {
      engagementRate: number
      reach: number
      impressions: number
      likes: number
      comments: number
      shares: number
      saves: number
      clickThroughRate?: number
    }
  }
}

export function PostInsightsModal({ isOpen, onClose, post }: PostInsightsModalProps) {
  const platformIcons = {
    Instagram: Instagram,
    YouTube: Youtube,
    Twitter: Twitter,
    Facebook: Facebook,
  }

  const PlatformIcon = platformIcons[post.platform as keyof typeof platformIcons] || Instagram

  // Mock data for engagement over time
  const engagementOverTime = [
    { hour: "0h", engagement: 120 },
    { hour: "2h", engagement: 450 },
    { hour: "4h", engagement: 890 },
    { hour: "6h", engagement: 1200 },
    { hour: "8h", engagement: 1450 },
    { hour: "12h", engagement: 1680 },
    { hour: "24h", engagement: 1820 },
  ]

  // Mock audience retention data
  const audienceRetention = [
    { time: "0s", retention: 100 },
    { time: "10s", retention: 85 },
    { time: "20s", retention: 72 },
    { time: "30s", retention: 65 },
    { time: "40s", retention: 58 },
    { time: "50s", retention: 52 },
    { time: "60s", retention: 48 },
  ]

  // Mock audience breakdown
  const audienceByGender = [
    { name: "Female", value: 58, color: "#E63946" },
    { name: "Male", value: 40, color: "#457B9D" },
    { name: "Other", value: 2, color: "#A8DADC" },
  ]

  const audienceByAge = [
    { age: "18-24", percentage: 35 },
    { age: "25-34", percentage: 42 },
    { age: "35-44", percentage: 15 },
    { age: "45+", percentage: 8 },
  ]

  const topRegions = [
    { city: "Mumbai", percentage: 22 },
    { city: "Delhi", percentage: 18 },
    { city: "Bangalore", percentage: 15 },
  ]

  // AI-generated recommendation
  const aiRecommendation =
    "This post performed 32% above your average due to high engagement from 18-24 year-old users. Try posting at 7-9PM with similar tone and trending audio clips for better reach."

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-[#0f1629] border-white/10 text-white">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                <PlatformIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <DialogTitle className="text-xl font-bold text-white">Post Insights</DialogTitle>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-sm text-gray-400">{post.date}</span>
                  {post.isBoosted && <Badge className="bg-blue-500/20 text-blue-400 text-xs">Boosted</Badge>}
                  {post.campaignTag && (
                    <Badge className="bg-purple-500/20 text-purple-400 text-xs">{post.campaignTag}</Badge>
                  )}
                </div>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose} className="text-gray-400 hover:text-white">
              <X className="w-5 h-5" />
            </Button>
          </div>
        </DialogHeader>

        {/* Post Preview */}
        <div className="mt-4">
          <img
            src={post.thumbnail || "/placeholder.svg"}
            alt="Post preview"
            className="w-full max-h-96 object-cover rounded-lg"
          />
        </div>

        {/* Engagement Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          <div className="bg-[#1a1f35] p-4 rounded-lg">
            <div className="flex items-center gap-2 text-gray-400 mb-2">
              <Eye className="w-4 h-4" />
              <span className="text-xs">Reach</span>
            </div>
            <p className="text-2xl font-bold text-white">{(post.metrics.reach / 1000).toFixed(1)}K</p>
          </div>
          <div className="bg-[#1a1f35] p-4 rounded-lg">
            <div className="flex items-center gap-2 text-gray-400 mb-2">
              <TrendingUp className="w-4 h-4" />
              <span className="text-xs">Engagement Rate</span>
            </div>
            <p className="text-2xl font-bold text-white">{post.metrics.engagementRate}%</p>
          </div>
          <div className="bg-[#1a1f35] p-4 rounded-lg">
            <div className="flex items-center gap-2 text-gray-400 mb-2">
              <Heart className="w-4 h-4" />
              <span className="text-xs">Likes</span>
            </div>
            <p className="text-2xl font-bold text-white">{post.metrics.likes.toLocaleString()}</p>
          </div>
          <div className="bg-[#1a1f35] p-4 rounded-lg">
            <div className="flex items-center gap-2 text-gray-400 mb-2">
              <MessageCircle className="w-4 h-4" />
              <span className="text-xs">Comments</span>
            </div>
            <p className="text-2xl font-bold text-white">{post.metrics.comments}</p>
          </div>
        </div>

        {/* AI Recommendation */}
        <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-lg p-4 mt-6">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center flex-shrink-0">
              <Lightbulb className="w-4 h-4 text-purple-400" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-white mb-1">AI Recommendation</h3>
              <p className="text-sm text-gray-300">{aiRecommendation}</p>
            </div>
          </div>
        </div>

        {/* Detailed Analytics Tabs */}
        <Tabs defaultValue="engagement" className="mt-6">
          <TabsList className="grid w-full grid-cols-3 bg-[#1a1f35]">
            <TabsTrigger value="engagement">Engagement</TabsTrigger>
            <TabsTrigger value="audience">Audience</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
          </TabsList>

          <TabsContent value="engagement" className="space-y-6 mt-4">
            {/* Engagement Over Time */}
            <div>
              <h3 className="text-sm font-semibold text-white mb-3">Engagement Over Time</h3>
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={engagementOverTime}>
                  <defs>
                    <linearGradient id="colorEngagement" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#E63946" stopOpacity={0.8} />
                      <stop offset="100%" stopColor="#E63946" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                  <XAxis dataKey="hour" stroke="#9ca3af" style={{ fontSize: "12px" }} />
                  <YAxis stroke="#9ca3af" style={{ fontSize: "12px" }} />
                  <Tooltip contentStyle={{ backgroundColor: "#1a1f35", border: "1px solid rgba(255,255,255,0.1)" }} />
                  <Area
                    type="monotone"
                    dataKey="engagement"
                    stroke="#E63946"
                    strokeWidth={2}
                    fill="url(#colorEngagement)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Audience Retention (for video posts) */}
            {post.platform !== "Twitter" && (
              <div>
                <h3 className="text-sm font-semibold text-white mb-3">Audience Retention</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={audienceRetention}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                    <XAxis dataKey="time" stroke="#9ca3af" style={{ fontSize: "12px" }} />
                    <YAxis stroke="#9ca3af" style={{ fontSize: "12px" }} />
                    <Tooltip contentStyle={{ backgroundColor: "#1a1f35", border: "1px solid rgba(255,255,255,0.1)" }} />
                    <Line type="monotone" dataKey="retention" stroke="#60a5fa" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </TabsContent>

          <TabsContent value="audience" className="space-y-6 mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Gender Split */}
              <div>
                <h3 className="text-sm font-semibold text-white mb-3">Gender Split</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={audienceByGender}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {audienceByGender.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Age Groups */}
              <div>
                <h3 className="text-sm font-semibold text-white mb-3">Age Groups</h3>
                <div className="space-y-3">
                  {audienceByAge.map((group) => (
                    <div key={group.age}>
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="text-gray-400">{group.age}</span>
                        <span className="text-white font-medium">{group.percentage}%</span>
                      </div>
                      <div className="h-2 bg-[#1a1f35] rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-500 rounded-full transition-all duration-500"
                          style={{ width: `${group.percentage}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Top Regions */}
            <div>
              <h3 className="text-sm font-semibold text-white mb-3">Top Regions</h3>
              <div className="space-y-3">
                {topRegions.map((region) => (
                  <div key={region.city}>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-gray-400">{region.city}</span>
                      <span className="text-white font-medium">{region.percentage}%</span>
                    </div>
                    <div className="h-2 bg-[#1a1f35] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-green-500 rounded-full transition-all duration-500"
                        style={{ width: `${region.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="performance" className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-[#1a1f35] p-4 rounded-lg">
                <div className="flex items-center gap-2 text-gray-400 mb-2">
                  <Share2 className="w-4 h-4" />
                  <span className="text-xs">Shares</span>
                </div>
                <p className="text-xl font-bold text-white">{post.metrics.shares}</p>
              </div>
              <div className="bg-[#1a1f35] p-4 rounded-lg">
                <div className="flex items-center gap-2 text-gray-400 mb-2">
                  <Bookmark className="w-4 h-4" />
                  <span className="text-xs">Saves</span>
                </div>
                <p className="text-xl font-bold text-white">{post.metrics.saves}</p>
              </div>
              <div className="bg-[#1a1f35] p-4 rounded-lg">
                <div className="flex items-center gap-2 text-gray-400 mb-2">
                  <Eye className="w-4 h-4" />
                  <span className="text-xs">Impressions</span>
                </div>
                <p className="text-xl font-bold text-white">{(post.metrics.impressions / 1000).toFixed(1)}K</p>
              </div>
              {post.metrics.clickThroughRate && (
                <div className="bg-[#1a1f35] p-4 rounded-lg">
                  <div className="flex items-center gap-2 text-gray-400 mb-2">
                    <ExternalLink className="w-4 h-4" />
                    <span className="text-xs">CTR</span>
                  </div>
                  <p className="text-xl font-bold text-white">{post.metrics.clickThroughRate}%</p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3 mt-6 pt-6 border-t border-white/10">
          <Button className="bg-blue-600 hover:bg-blue-700 flex-1 min-w-[150px]">
            <ExternalLink className="w-4 h-4 mr-2" />
            Share with Brand
          </Button>
          <Button variant="outline" className="border-white/10 flex-1 min-w-[150px] bg-transparent">
            <Megaphone className="w-4 h-4 mr-2" />
            Promote Post
          </Button>
          <Button variant="outline" className="border-white/10 flex-1 min-w-[150px] bg-transparent">
            <Copy className="w-4 h-4 mr-2" />
            Duplicate Post
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
