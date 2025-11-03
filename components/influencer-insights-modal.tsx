"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import {
  TrendingUp,
  Eye,
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  ExternalLink,
  Download,
  Star,
  ThumbsUp,
  ThumbsDown,
  Minus,
  MapPin,
  Users,
  Target,
  Sparkles,
} from "lucide-react"
import {
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"

interface InfluencerInsightsModalProps {
  influencer: any
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function InfluencerInsightsModal({ influencer, open, onOpenChange }: InfluencerInsightsModalProps) {
  const [activeTab, setActiveTab] = useState("overview")

  // Mock data for engagement timeline
  const engagementTimeline = [
    { day: "Day 1", likes: 2400, comments: 180, shares: 45 },
    { day: "Day 2", likes: 4200, comments: 320, shares: 78 },
    { day: "Day 3", likes: 6800, comments: 480, shares: 120 },
    { day: "Day 4", likes: 8200, comments: 580, shares: 145 },
    { day: "Day 5", likes: 9100, comments: 620, shares: 160 },
    { day: "Day 6", likes: 9500, comments: 650, shares: 168 },
    { day: "Day 7", likes: 9800, comments: 670, shares: 172 },
  ]

  // Mock data for sentiment analysis
  const sentimentData = [
    { name: "Positive", value: 72, color: "#10b981" },
    { name: "Neutral", value: 21, color: "#6b7280" },
    { name: "Negative", value: 7, color: "#ef4444" },
  ]

  // Mock data for audience interaction heatmap (simplified as bar chart)
  const interactionHeatmap = [
    { hour: "6AM", engagement: 120 },
    { hour: "9AM", engagement: 450 },
    { hour: "12PM", engagement: 680 },
    { hour: "3PM", engagement: 820 },
    { hour: "6PM", engagement: 1200 },
    { hour: "9PM", engagement: 980 },
    { hour: "12AM", engagement: 340 },
  ]

  // Mock data for hashtag performance
  const hashtagPerformance = [
    { tag: "#SummerVibes", engagement: 12500, reach: 45000 },
    { tag: "#FashionInspo", engagement: 9800, reach: 38000 },
    { tag: "#OOTD", engagement: 8200, reach: 32000 },
    { tag: "#StyleGoals", engagement: 6500, reach: 28000 },
    { tag: "#TrendAlert", engagement: 5100, reach: 22000 },
  ]

  // Mock data for attribution funnel
  const attributionFunnel = [
    { stage: "Clicks", value: 4200, color: "#3b82f6" },
    { stage: "Visits", value: 3100, color: "#8b5cf6" },
    { stage: "Add to Cart", value: 890, color: "#ec4899" },
    { stage: "Conversions", value: 420, color: "#10b981" },
  ]

  const topComments = [
    { text: "This is absolutely amazing! Love it 😍", sentiment: "positive" },
    { text: "Where can I buy this? Need it now!", sentiment: "positive" },
    { text: "Not sure about the color choice tbh", sentiment: "negative" },
    { text: "Great content as always!", sentiment: "positive" },
    { text: "Looks interesting, might try it", sentiment: "neutral" },
  ]

  const keywordCloud = [
    "amazing",
    "love",
    "cute",
    "beautiful",
    "perfect",
    "need",
    "want",
    "gorgeous",
    "stunning",
    "obsessed",
  ]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12">
              <AvatarImage src={influencer?.avatar || "/placeholder.svg"} />
              <AvatarFallback>{influencer?.name?.[0]}</AvatarFallback>
            </Avatar>
            <div>
              <DialogTitle className="text-xl">{influencer?.name}</DialogTitle>
              <p className="text-sm text-muted-foreground">
                {influencer?.platform} • {influencer?.followers} followers
              </p>
            </div>
          </div>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5 h-auto">
            <TabsTrigger value="overview" className="text-xs sm:text-sm">
              Overview
            </TabsTrigger>
            <TabsTrigger value="engagement" className="text-xs sm:text-sm">
              Engagement
            </TabsTrigger>
            <TabsTrigger value="audience" className="text-xs sm:text-sm">
              Audience
            </TabsTrigger>
            <TabsTrigger value="content" className="text-xs sm:text-sm">
              Content
            </TabsTrigger>
            <TabsTrigger value="attribution" className="text-xs sm:text-sm">
              Attribution
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-4 mt-4">
            {/* Performance Summary Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <Card>
                <CardContent className="p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <Eye className="h-3 w-3 text-blue-500" />
                    <p className="text-xs text-muted-foreground">Impressions</p>
                  </div>
                  <p className="text-lg font-bold">580K</p>
                  <p className="text-xs text-green-600 flex items-center gap-1 mt-1">
                    <TrendingUp className="h-3 w-3" />
                    +12% vs avg
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <Users className="h-3 w-3 text-purple-500" />
                    <p className="text-xs text-muted-foreground">Reach</p>
                  </div>
                  <p className="text-lg font-bold">425K</p>
                  <p className="text-xs text-green-600 flex items-center gap-1 mt-1">
                    <TrendingUp className="h-3 w-3" />
                    +8% vs avg
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <Heart className="h-3 w-3 text-red-500" />
                    <p className="text-xs text-muted-foreground">Engagement Rate</p>
                  </div>
                  <p className="text-lg font-bold">5.8%</p>
                  <p className="text-xs text-green-600 flex items-center gap-1 mt-1">
                    <TrendingUp className="h-3 w-3" />
                    +15% vs avg
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <Target className="h-3 w-3 text-orange-500" />
                    <p className="text-xs text-muted-foreground">ROI</p>
                  </div>
                  <p className="text-lg font-bold">3.2x</p>
                  <p className="text-xs text-green-600 flex items-center gap-1 mt-1">
                    <TrendingUp className="h-3 w-3" />
                    Above target
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Detailed Metrics */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Detailed Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Heart className="h-4 w-4" />
                      <span>Likes</span>
                    </div>
                    <p className="text-lg font-semibold">23,400</p>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <MessageCircle className="h-4 w-4" />
                      <span>Comments</span>
                    </div>
                    <p className="text-lg font-semibold">1,820</p>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Share2 className="h-4 w-4" />
                      <span>Shares</span>
                    </div>
                    <p className="text-lg font-semibold">456</p>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Bookmark className="h-4 w-4" />
                      <span>Saves</span>
                    </div>
                    <p className="text-lg font-semibold">892</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Post Preview */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">Post Preview</CardTitle>
                  <Button size="sm" variant="outline">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Open on {influencer?.platform}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="aspect-square bg-muted rounded-lg overflow-hidden max-w-md mx-auto">
                  <img
                    src="/placeholder.svg?height=400&width=400"
                    alt="Post preview"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="mt-4 space-y-2">
                  <p className="text-sm">
                    <span className="font-semibold">@{influencer?.name?.toLowerCase().replace(" ", "")}</span>
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Loving this summer collection! 🌞 Perfect for those beach days ☀️ #SummerVibes #FashionInspo
                  </p>
                  <p className="text-xs text-muted-foreground">Posted 3 days ago</p>
                </div>
              </CardContent>
            </Card>

            {/* AI Insights */}
            <Card className="border-primary/20 bg-primary/5">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-primary" />
                  AI Performance Insights
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-start gap-2 text-sm">
                  <Star className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                  <p>
                    <span className="font-semibold">Top 10% performer</span> - This influencer's engagement rate is 15%
                    above campaign average
                  </p>
                </div>
                <div className="flex items-start gap-2 text-sm">
                  <TrendingUp className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <p>
                    <span className="font-semibold">Strong audience overlap</span> - 68% audience match with your
                    best-performing creator
                  </p>
                </div>
                <div className="flex items-start gap-2 text-sm">
                  <MapPin className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                  <p>
                    <span className="font-semibold">Geographic strength</span> - High engagement from Tier-2 cities,
                    consider similar creators
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-2">
              <Button className="flex-1">
                <Star className="h-4 w-4 mr-2" />
                Add to Preferred List
              </Button>
              <Button variant="outline" className="flex-1 bg-transparent">
                <Users className="h-4 w-4 mr-2" />
                Reinvite for Next Campaign
              </Button>
              <Button variant="outline" className="flex-1 bg-transparent">
                <Download className="h-4 w-4 mr-2" />
                Download Report
              </Button>
            </div>
          </TabsContent>

          {/* Engagement Tab */}
          <TabsContent value="engagement" className="space-y-4 mt-4">
            {/* Engagement Timeline */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Engagement Timeline (7 Days Post-Publish)</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={engagementTimeline}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="likes" stroke="#ef4444" strokeWidth={2} />
                    <Line type="monotone" dataKey="comments" stroke="#3b82f6" strokeWidth={2} />
                    <Line type="monotone" dataKey="shares" stroke="#10b981" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Audience Interaction Heatmap */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Best Posting Times (Peak Engagement Hours)</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={interactionHeatmap}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="hour" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="engagement" fill="#f97316" />
                  </BarChart>
                </ResponsiveContainer>
                <p className="text-xs text-muted-foreground mt-2">
                  Peak engagement occurs between 3PM - 9PM. Consider this timing for future collaborations.
                </p>
              </CardContent>
            </Card>

            {/* Sentiment Analysis */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Sentiment Analysis</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie
                        data={sentimentData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={(entry) => `${entry.name} ${entry.value}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {sentimentData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Sample Comments</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 max-h-[200px] overflow-y-auto">
                    {topComments.map((comment, index) => (
                      <div key={index} className="flex items-start gap-2 text-sm p-2 rounded bg-muted/50">
                        {comment.sentiment === "positive" && (
                          <ThumbsUp className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                        )}
                        {comment.sentiment === "negative" && (
                          <ThumbsDown className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                        )}
                        {comment.sentiment === "neutral" && (
                          <Minus className="h-4 w-4 text-gray-500 mt-0.5 flex-shrink-0" />
                        )}
                        <p className="text-xs">{comment.text}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Keyword Cloud */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Top Keywords in Comments</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {keywordCloud.map((keyword, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {keyword}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Audience Tab */}
          <TabsContent value="audience" className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Audience Demographics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-sm font-semibold mb-3">Age Distribution</h4>
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between text-xs mb-1">
                          <span>18-24</span>
                          <span className="font-semibold">35%</span>
                        </div>
                        <Progress value={35} className="h-2" />
                      </div>
                      <div>
                        <div className="flex justify-between text-xs mb-1">
                          <span>25-34</span>
                          <span className="font-semibold">42%</span>
                        </div>
                        <Progress value={42} className="h-2" />
                      </div>
                      <div>
                        <div className="flex justify-between text-xs mb-1">
                          <span>35-44</span>
                          <span className="font-semibold">18%</span>
                        </div>
                        <Progress value={18} className="h-2" />
                      </div>
                      <div>
                        <div className="flex justify-between text-xs mb-1">
                          <span>45+</span>
                          <span className="font-semibold">5%</span>
                        </div>
                        <Progress value={5} className="h-2" />
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-semibold mb-3">Gender Split</h4>
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between text-xs mb-1">
                          <span>Female</span>
                          <span className="font-semibold">68%</span>
                        </div>
                        <Progress value={68} className="h-2" />
                      </div>
                      <div>
                        <div className="flex justify-between text-xs mb-1">
                          <span>Male</span>
                          <span className="font-semibold">30%</span>
                        </div>
                        <Progress value={30} className="h-2" />
                      </div>
                      <div>
                        <div className="flex justify-between text-xs mb-1">
                          <span>Other</span>
                          <span className="font-semibold">2%</span>
                        </div>
                        <Progress value={2} className="h-2" />
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Top Locations</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { city: "Mumbai", percentage: 28 },
                    { city: "Delhi", percentage: 22 },
                    { city: "Bangalore", percentage: 18 },
                    { city: "Pune", percentage: 12 },
                    { city: "Hyderabad", percentage: 10 },
                    { city: "Others", percentage: 10 },
                  ].map((location, index) => (
                    <div key={index}>
                      <div className="flex justify-between text-sm mb-1">
                        <span>{location.city}</span>
                        <span className="font-semibold">{location.percentage}%</span>
                      </div>
                      <Progress value={location.percentage} className="h-2" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Content Tab */}
          <TabsContent value="content" className="space-y-4 mt-4">
            {/* Hashtag Performance */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Hashtag Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {hashtagPerformance.map((hashtag, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex-1">
                        <p className="font-semibold text-sm">{hashtag.tag}</p>
                        <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Heart className="h-3 w-3" />
                            {hashtag.engagement.toLocaleString()} engagements
                          </span>
                          <span className="flex items-center gap-1">
                            <Eye className="h-3 w-3" />
                            {hashtag.reach.toLocaleString()} reach
                          </span>
                        </div>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        #{index + 1}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Mention Analytics */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Mentions & Tags</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-2 rounded bg-muted/50">
                    <span className="text-sm">Brand mentions</span>
                    <Badge variant="outline">12</Badge>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded bg-muted/50">
                    <span className="text-sm">Product tags</span>
                    <Badge variant="outline">8</Badge>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded bg-muted/50">
                    <span className="text-sm">Cross-influencer tags</span>
                    <Badge variant="outline">3</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Attribution Tab */}
          <TabsContent value="attribution" className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Conversion Funnel</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {attributionFunnel.map((stage, index) => (
                    <div key={index}>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="font-semibold">{stage.stage}</span>
                        <span className="font-bold">{stage.value.toLocaleString()}</span>
                      </div>
                      <div
                        className="relative h-12 rounded-lg overflow-hidden"
                        style={{ backgroundColor: stage.color }}
                      >
                        <div className="absolute inset-0 flex items-center justify-center text-white font-semibold">
                          {index > 0
                            ? `${((stage.value / attributionFunnel[index - 1].value) * 100).toFixed(1)}% conversion`
                            : "100%"}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground mt-4">
                  Overall conversion rate: {((420 / 4200) * 100).toFixed(1)}% (Clicks to Conversions)
                </p>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Attribution Metrics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Click-through Rate (CTR)</span>
                      <span className="font-semibold">4.6%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Cost per Click (CPC)</span>
                      <span className="font-semibold">$0.60</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Cost per Conversion</span>
                      <span className="font-semibold">$5.95</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Revenue Generated</span>
                      <span className="font-semibold text-green-600">$8,400</span>
                    </div>
                    <div className="flex justify-between pt-2 border-t">
                      <span className="font-semibold">ROI</span>
                      <span className="font-bold text-green-600">3.2x</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Traffic Sources</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span>Instagram Bio Link</span>
                        <span className="font-semibold">45%</span>
                      </div>
                      <Progress value={45} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span>Story Swipe-Up</span>
                        <span className="font-semibold">32%</span>
                      </div>
                      <Progress value={32} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span>Post Link</span>
                        <span className="font-semibold">18%</span>
                      </div>
                      <Progress value={18} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span>Direct</span>
                        <span className="font-semibold">5%</span>
                      </div>
                      <Progress value={5} className="h-2" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="border-blue-500/20 bg-blue-500/5">
              <CardContent className="p-4">
                <div className="flex items-start gap-2 text-sm">
                  <Sparkles className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                  <p>
                    <span className="font-semibold">Attribution Note:</span> Conversion data is fetched from integrated
                    tracking pixels and UTM parameters. Last synced 2 hours ago.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
