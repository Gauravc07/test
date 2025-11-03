"use client"

import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  TrendingUp,
  Users,
  Heart,
  MessageCircle,
  Eye,
  Share2,
  Award,
  Download,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react"
import { useState } from "react"

const analytics = {
  overview: {
    totalReach: 1250000,
    reachGrowth: 15.3,
    engagement: 4.8,
    engagementGrowth: 8.2,
    followers: 202000,
    followersGrowth: 12.5,
    avgLikes: 8500,
    likesGrowth: -2.1,
  },
  platforms: [
    {
      name: "Instagram",
      followers: 125000,
      engagement: 5.2,
      posts: 45,
      reach: 850000,
      growth: 18.5,
    },
    {
      name: "YouTube",
      followers: 45000,
      engagement: 4.1,
      posts: 12,
      reach: 280000,
      growth: 22.3,
    },
    {
      name: "Twitter",
      followers: 32000,
      engagement: 3.9,
      posts: 120,
      reach: 120000,
      growth: 8.7,
    },
  ],
  topContent: [
    {
      id: 1,
      title: "Summer Fashion Haul",
      platform: "Instagram",
      type: "Reel",
      likes: 15200,
      comments: 340,
      shares: 890,
      views: 125000,
      engagement: 6.8,
      date: "2025-01-20",
    },
    {
      id: 2,
      title: "Skincare Routine Tutorial",
      platform: "YouTube",
      type: "Video",
      likes: 8900,
      comments: 520,
      shares: 450,
      views: 95000,
      engagement: 5.9,
      date: "2025-01-18",
    },
    {
      id: 3,
      title: "Ethnic Wear Styling Tips",
      platform: "Instagram",
      type: "Post",
      likes: 12800,
      comments: 280,
      shares: 620,
      views: 98000,
      engagement: 6.2,
      date: "2025-01-15",
    },
  ],
  audienceDemographics: {
    ageGroups: [
      { range: "18-24", percentage: 35 },
      { range: "25-34", percentage: 42 },
      { range: "35-44", percentage: 18 },
      { range: "45+", percentage: 5 },
    ],
    gender: [
      { type: "Female", percentage: 68 },
      { type: "Male", percentage: 30 },
      { type: "Other", percentage: 2 },
    ],
    topLocations: [
      { city: "Mumbai", percentage: 28 },
      { city: "Delhi", percentage: 22 },
      { city: "Bangalore", percentage: 18 },
      { city: "Pune", percentage: 12 },
      { city: "Others", percentage: 20 },
    ],
  },
  insights: [
    {
      id: 1,
      type: "success",
      title: "Peak Engagement Time",
      description: "Your audience is most active between 7-9 PM IST. Schedule posts during this window.",
      action: "Optimize Posting",
    },
    {
      id: 2,
      type: "warning",
      title: "Declining Story Views",
      description: "Story views dropped 15% this week. Try adding more interactive elements like polls and questions.",
      action: "Improve Stories",
    },
    {
      id: 3,
      type: "info",
      title: "Trending Content Type",
      description: "Reels are performing 40% better than static posts. Consider creating more video content.",
      action: "Create Reels",
    },
    {
      id: 4,
      type: "success",
      title: "Audience Growth",
      description: "You gained 2,500 new followers this month, 18% above your average.",
      action: "View Details",
    },
  ],
}

export default function AnalyticsPage() {
  const [selectedPeriod, setSelectedPeriod] = useState("30days")

  return (
    <main className="min-h-screen bg-background">
      <Navigation />

      <div className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto max-w-7xl">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-4xl font-bold mb-2">Analytics & Insights</h1>
              <p className="text-lg text-muted-foreground">Track your performance and grow your audience</p>
            </div>
            <div className="flex gap-2">
              <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7days">Last 7 Days</SelectItem>
                  <SelectItem value="30days">Last 30 Days</SelectItem>
                  <SelectItem value="90days">Last 90 Days</SelectItem>
                  <SelectItem value="year">This Year</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Export Report
              </Button>
            </div>
          </div>

          {/* Overview Cards */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Total Reach</CardTitle>
                <Eye className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{(analytics.overview.totalReach / 1000000).toFixed(2)}M</div>
                <div className="flex items-center gap-1 text-xs text-green-500 mt-1">
                  <ArrowUpRight className="h-3 w-3" />
                  {analytics.overview.reachGrowth}% from last period
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Engagement Rate</CardTitle>
                <Heart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{analytics.overview.engagement}%</div>
                <div className="flex items-center gap-1 text-xs text-green-500 mt-1">
                  <ArrowUpRight className="h-3 w-3" />
                  {analytics.overview.engagementGrowth}% from last period
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Total Followers</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{(analytics.overview.followers / 1000).toFixed(0)}K</div>
                <div className="flex items-center gap-1 text-xs text-green-500 mt-1">
                  <ArrowUpRight className="h-3 w-3" />
                  {analytics.overview.followersGrowth}% from last period
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Avg Likes</CardTitle>
                <Heart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{(analytics.overview.avgLikes / 1000).toFixed(1)}K</div>
                <div className="flex items-center gap-1 text-xs text-red-500 mt-1">
                  <ArrowDownRight className="h-3 w-3" />
                  {Math.abs(analytics.overview.likesGrowth)}% from last period
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid lg:grid-cols-3 gap-6 mb-8">
            {/* Platform Performance */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Platform Performance</CardTitle>
                <CardDescription>Your performance across different social media platforms</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {analytics.platforms.map((platform) => (
                    <div key={platform.name} className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{platform.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {(platform.followers / 1000).toFixed(0)}K followers • {platform.posts} posts
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">{platform.engagement}%</p>
                          <p className="text-xs text-muted-foreground">Engagement</p>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Reach</span>
                          <span className="font-medium">{(platform.reach / 1000).toFixed(0)}K</span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary rounded-full transition-all duration-500"
                            style={{ width: `${(platform.reach / analytics.overview.totalReach) * 100}%` }}
                          />
                        </div>
                        <div className="flex items-center gap-1 text-xs text-green-500">
                          <TrendingUp className="h-3 w-3" />
                          {platform.growth}% growth
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* AI Insights */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-primary" />
                  AI Insights
                </CardTitle>
                <CardDescription>Personalized recommendations to boost your growth</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analytics.insights.map((insight) => (
                    <div
                      key={insight.id}
                      className={`p-4 rounded-lg border ${
                        insight.type === "success"
                          ? "bg-green-500/5 border-green-500/20"
                          : insight.type === "warning"
                            ? "bg-yellow-500/5 border-yellow-500/20"
                            : "bg-blue-500/5 border-blue-500/20"
                      }`}
                    >
                      <p className="font-medium text-sm mb-1">{insight.title}</p>
                      <p className="text-xs text-muted-foreground mb-3">{insight.description}</p>
                      <Button variant="outline" size="sm" className="w-full text-xs h-8 bg-transparent">
                        {insight.action}
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Tabs for Detailed Analytics */}
          <Tabs defaultValue="content" className="space-y-6">
            <TabsList>
              <TabsTrigger value="content">Top Content</TabsTrigger>
              <TabsTrigger value="audience">Audience</TabsTrigger>
              <TabsTrigger value="growth">Growth Trends</TabsTrigger>
            </TabsList>

            <TabsContent value="content">
              <Card>
                <CardHeader>
                  <CardTitle>Top Performing Content</CardTitle>
                  <CardDescription>Your best performing posts from the selected period</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {analytics.topContent.map((content, index) => (
                      <div
                        key={content.id}
                        className="flex items-center gap-4 p-4 rounded-lg border hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-primary/10 text-primary font-bold">
                          #{index + 1}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-medium">{content.title}</p>
                            <Badge variant="secondary" className="text-xs">
                              {content.platform}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {content.type}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Eye className="h-3.5 w-3.5" />
                              {(content.views / 1000).toFixed(0)}K
                            </div>
                            <div className="flex items-center gap-1">
                              <Heart className="h-3.5 w-3.5" />
                              {(content.likes / 1000).toFixed(1)}K
                            </div>
                            <div className="flex items-center gap-1">
                              <MessageCircle className="h-3.5 w-3.5" />
                              {content.comments}
                            </div>
                            <div className="flex items-center gap-1">
                              <Share2 className="h-3.5 w-3.5" />
                              {content.shares}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-primary">{content.engagement}%</p>
                          <p className="text-xs text-muted-foreground">Engagement</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="audience">
              <div className="grid md:grid-cols-3 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Age Distribution</CardTitle>
                    <CardDescription>Audience breakdown by age group</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {analytics.audienceDemographics.ageGroups.map((group) => (
                        <div key={group.range} className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">{group.range}</span>
                            <span className="font-medium">{group.percentage}%</span>
                          </div>
                          <div className="h-2 bg-muted rounded-full overflow-hidden">
                            <div
                              className="h-full bg-primary rounded-full transition-all duration-500"
                              style={{ width: `${group.percentage}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Gender Split</CardTitle>
                    <CardDescription>Audience breakdown by gender</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {analytics.audienceDemographics.gender.map((item) => (
                        <div key={item.type} className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">{item.type}</span>
                            <span className="font-medium">{item.percentage}%</span>
                          </div>
                          <div className="h-2 bg-muted rounded-full overflow-hidden">
                            <div
                              className="h-full bg-primary rounded-full transition-all duration-500"
                              style={{ width: `${item.percentage}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Top Locations</CardTitle>
                    <CardDescription>Where your audience is located</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {analytics.audienceDemographics.topLocations.map((location) => (
                        <div key={location.city} className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">{location.city}</span>
                            <span className="font-medium">{location.percentage}%</span>
                          </div>
                          <div className="h-2 bg-muted rounded-full overflow-hidden">
                            <div
                              className="h-full bg-primary rounded-full transition-all duration-500"
                              style={{ width: `${location.percentage}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="growth">
              <Card>
                <CardHeader>
                  <CardTitle>Growth Trends</CardTitle>
                  <CardDescription>Track your follower and engagement growth over time</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[400px] flex items-center justify-center text-muted-foreground">
                    <div className="text-center">
                      <TrendingUp className="h-12 w-12 mx-auto mb-4" />
                      <p>Growth chart visualization would appear here</p>
                      <p className="text-sm">Showing follower growth, engagement trends, and reach metrics</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <Footer />
    </main>
  )
}
