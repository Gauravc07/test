"use client"

import { BrandSidebar } from "@/components/brand-sidebar"
import { BrandHeader } from "@/components/brand-header"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  TrendingUp,
  DollarSign,
  Users,
  Heart,
  Download,
  Info,
  Sparkles,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
  ComposedChart,
} from "recharts"
import { useState } from "react"

const spendVsRoiData = [
  { campaign: "Summer Fashion", spend: 25000, roi: 350 },
  { campaign: "Tech Launch", spend: 50000, roi: 420 },
  { campaign: "Holiday Gifts", spend: 35000, roi: 280 },
  { campaign: "Fitness Challenge", spend: 18000, roi: 190 },
  { campaign: "Beauty Collab", spend: 42000, roi: 310 },
]

const engagementOverTimeData = [
  { date: "Week 1", engagement: 45000 },
  { date: "Week 2", engagement: 52000 },
  { date: "Week 3", engagement: 48000 },
  { date: "Week 4", engagement: 61000 },
  { date: "Week 5", engagement: 58000 },
  { date: "Week 6", engagement: 67000 },
]

const platformBreakdownData = [
  { platform: "Instagram", reach: 4200000, engagement: 5.8, roi: 140 },
  { platform: "YouTube", reach: 5800000, engagement: 4.2, roi: 195 },
  { platform: "TikTok", reach: 3400000, engagement: 6.5, roi: 165 },
]

const audienceDemographicsData = [
  { name: "18-24", value: 28, color: "#ff6b35" },
  { name: "25-34", value: 42, color: "#f7931e" },
  { name: "35-44", value: 20, color: "#fdc830" },
  { name: "45+", value: 10, color: "#37b679" },
]

const topInfluencersData = [
  { rank: 1, name: "@kriti.style", platform: "Instagram", reach: "520K", er: "5.8%", cpe: "₹0.42", roi: "2.1x" },
  { rank: 2, name: "@foodiefit", platform: "YouTube", reach: "180K", er: "4.2%", cpe: "₹0.39", roi: "1.9x" },
  { rank: 3, name: "@techguru", platform: "TikTok", reach: "340K", er: "6.5%", cpe: "₹0.35", roi: "2.3x" },
  { rank: 4, name: "@fashionista", platform: "Instagram", reach: "290K", er: "5.1%", cpe: "₹0.48", roi: "1.7x" },
  { rank: 5, name: "@travelvibes", platform: "YouTube", reach: "420K", er: "3.9%", cpe: "₹0.52", roi: "1.5x" },
]

export default function AnalyticsPage() {
  const [platformMetric, setPlatformMetric] = useState<"reach" | "engagement" | "roi">("roi")

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <BrandSidebar />

      <div className="flex-1 flex flex-col overflow-hidden lg:pl-64">
        <BrandHeader />

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {/* Header */}
          <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2">Analytics</h1>
              <p className="text-sm sm:text-base text-muted-foreground">Track your campaign performance and ROI</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
              <Select defaultValue="30days">
                <SelectTrigger className="w-full sm:w-[160px] text-xs sm:text-sm bg-transparent">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7days">Last 7 Days</SelectItem>
                  <SelectItem value="30days">Last 30 Days</SelectItem>
                  <SelectItem value="90days">Last 90 Days</SelectItem>
                  <SelectItem value="year">This Year</SelectItem>
                  <SelectItem value="custom">Custom Range</SelectItem>
                </SelectContent>
              </Select>
              <Select defaultValue="all">
                <SelectTrigger className="w-full sm:w-[160px] text-xs sm:text-sm bg-transparent">
                  <SelectValue placeholder="Platform" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Platforms</SelectItem>
                  <SelectItem value="instagram">Instagram</SelectItem>
                  <SelectItem value="youtube">YouTube</SelectItem>
                  <SelectItem value="tiktok">TikTok</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" className="w-full sm:w-auto text-xs sm:text-sm bg-transparent">
                <Download className="h-4 w-4 mr-2" />
                Export Report
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
            <TooltipProvider>
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardContent className="p-4 sm:p-6">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <p className="text-xs sm:text-sm text-muted-foreground">Total Spend</p>
                      <Tooltip>
                        <TooltipTrigger>
                          <Info className="h-3 w-3 text-muted-foreground" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="text-xs">Total amount spent on active + completed campaigns</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    <DollarSign className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                  </div>
                  <p className="text-2xl sm:text-3xl font-bold mb-1">₹7.2L</p>
                  <div className="flex items-center gap-1 text-xs sm:text-sm text-green-600">
                    <ArrowUpRight className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span>12% vs last month</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardContent className="p-4 sm:p-6">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <p className="text-xs sm:text-sm text-muted-foreground">Avg ROI</p>
                      <Tooltip>
                        <TooltipTrigger>
                          <Info className="h-3 w-3 text-muted-foreground" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="text-xs">(Revenue - Spend) ÷ Spend × 100</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
                  </div>
                  <p className="text-2xl sm:text-3xl font-bold mb-1">184%</p>
                  <div className="flex items-center gap-1 text-xs sm:text-sm text-green-600">
                    <ArrowUpRight className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span>8% vs last month</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardContent className="p-4 sm:p-6">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <p className="text-xs sm:text-sm text-muted-foreground">Total Reach</p>
                      <Tooltip>
                        <TooltipTrigger>
                          <Info className="h-3 w-3 text-muted-foreground" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="text-xs">Unique audience reached across all influencers</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    <Users className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
                  </div>
                  <p className="text-2xl sm:text-3xl font-bold mb-1">9.3M</p>
                  <div className="flex items-center gap-1 text-xs sm:text-sm text-green-600">
                    <ArrowUpRight className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span>18% vs last month</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardContent className="p-4 sm:p-6">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <p className="text-xs sm:text-sm text-muted-foreground">Avg Engagement</p>
                      <Tooltip>
                        <TooltipTrigger>
                          <Info className="h-3 w-3 text-muted-foreground" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="text-xs">Weighted average ER across campaigns</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    <Heart className="h-4 w-4 sm:h-5 sm:w-5 text-red-600" />
                  </div>
                  <p className="text-2xl sm:text-3xl font-bold mb-1">4.8%</p>
                  <div className="flex items-center gap-1 text-xs sm:text-sm text-red-600">
                    <ArrowDownRight className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span>2% vs last month</span>
                  </div>
                </CardContent>
              </Card>
            </TooltipProvider>
          </div>

          <Card className="mb-6 sm:mb-8 bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-primary/20">
                  <Sparkles className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-sm sm:text-base mb-2">AI Insights</h3>
                  <div className="space-y-2 text-xs sm:text-sm text-muted-foreground">
                    <p>• Your ROI trend is 14% higher than similar brands in fashion.</p>
                    <p>• Campaign "FestiveGlow2025" delivered 2.4× higher ROI due to micro-influencer strategy.</p>
                    <p>• Reallocate ₹25K from YouTube Shorts to Reels for 1.3× engagement boost.</p>
                    <p>• Your campaigns resonate best with 18-24 female audiences in Tier-1 metros.</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
            {/* Spend vs ROI Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base sm:text-lg">Spend vs ROI</CardTitle>
                <p className="text-xs sm:text-sm text-muted-foreground">Campaign performance comparison</p>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <ComposedChart data={spendVsRoiData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="campaign" tick={{ fontSize: 12 }} angle={-15} textAnchor="end" height={80} />
                    <YAxis yAxisId="left" tick={{ fontSize: 12 }} />
                    <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12 }} />
                    <RechartsTooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--background))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                    />
                    <Legend />
                    <Bar yAxisId="left" dataKey="spend" fill="hsl(var(--primary))" name="Spend (₹)" />
                    <Line yAxisId="right" type="monotone" dataKey="roi" stroke="#10b981" strokeWidth={2} name="ROI %" />
                  </ComposedChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Audience Demographics */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base sm:text-lg">Audience Demographics</CardTitle>
                <p className="text-xs sm:text-sm text-muted-foreground">Age distribution breakdown</p>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={audienceDemographicsData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${value}%`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {audienceDemographicsData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <RechartsTooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--background))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Engagement Over Time */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base sm:text-lg">Engagement Over Time</CardTitle>
                <p className="text-xs sm:text-sm text-muted-foreground">Weekly engagement trends</p>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={engagementOverTimeData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <RechartsTooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--background))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                    />
                    <Line type="monotone" dataKey="engagement" stroke="hsl(var(--primary))" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Platform Breakdown */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-base sm:text-lg">Platform Breakdown</CardTitle>
                    <p className="text-xs sm:text-sm text-muted-foreground">Performance by platform</p>
                  </div>
                  <Select value={platformMetric} onValueChange={(value: any) => setPlatformMetric(value)}>
                    <SelectTrigger className="w-[120px] text-xs bg-transparent">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="reach">Reach</SelectItem>
                      <SelectItem value="engagement">Engagement</SelectItem>
                      <SelectItem value="roi">ROI</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={platformBreakdownData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="platform" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <RechartsTooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--background))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                    />
                    <Bar
                      dataKey={platformMetric}
                      fill="hsl(var(--primary))"
                      name={
                        platformMetric === "reach"
                          ? "Reach"
                          : platformMetric === "engagement"
                            ? "Engagement %"
                            : "ROI %"
                      }
                    />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-base sm:text-lg">Top Performing Influencers</CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                Best performers by cost efficiency and engagement
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto -mx-4 sm:mx-0">
                <div className="inline-block min-w-full align-middle px-4 sm:px-0">
                  <table className="w-full min-w-[800px]">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2 sm:p-3 text-xs sm:text-sm font-semibold whitespace-nowrap">
                          Rank
                        </th>
                        <th className="text-left p-2 sm:p-3 text-xs sm:text-sm font-semibold whitespace-nowrap">
                          Influencer
                        </th>
                        <th className="text-left p-2 sm:p-3 text-xs sm:text-sm font-semibold whitespace-nowrap">
                          Platform
                        </th>
                        <th className="text-left p-2 sm:p-3 text-xs sm:text-sm font-semibold whitespace-nowrap">
                          Reach
                        </th>
                        <th className="text-left p-2 sm:p-3 text-xs sm:text-sm font-semibold whitespace-nowrap">ER</th>
                        <th className="text-left p-2 sm:p-3 text-xs sm:text-sm font-semibold whitespace-nowrap">CPE</th>
                        <th className="text-left p-2 sm:p-3 text-xs sm:text-sm font-semibold whitespace-nowrap">ROI</th>
                        <th className="text-left p-2 sm:p-3 text-xs sm:text-sm font-semibold whitespace-nowrap">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {topInfluencersData.map((influencer) => (
                        <tr key={influencer.rank} className="border-b hover:bg-muted/50 transition-colors">
                          <td className="p-2 sm:p-3">
                            <div className="flex items-center gap-2">
                              {influencer.rank === 1 && <span className="text-lg">🥇</span>}
                              {influencer.rank === 2 && <span className="text-lg">🥈</span>}
                              {influencer.rank === 3 && <span className="text-lg">🥉</span>}
                              {influencer.rank > 3 && (
                                <span className="text-xs sm:text-sm text-muted-foreground">{influencer.rank}</span>
                              )}
                            </div>
                          </td>
                          <td className="p-2 sm:p-3 text-xs sm:text-sm font-medium whitespace-nowrap">
                            {influencer.name}
                          </td>
                          <td className="p-2 sm:p-3">
                            <Badge variant="secondary" className="text-xs whitespace-nowrap">
                              {influencer.platform}
                            </Badge>
                          </td>
                          <td className="p-2 sm:p-3 text-xs sm:text-sm whitespace-nowrap">{influencer.reach}</td>
                          <td className="p-2 sm:p-3 text-xs sm:text-sm text-green-600 whitespace-nowrap">
                            {influencer.er}
                          </td>
                          <td className="p-2 sm:p-3 text-xs sm:text-sm whitespace-nowrap">{influencer.cpe}</td>
                          <td className="p-2 sm:p-3 text-xs sm:text-sm font-semibold text-primary whitespace-nowrap">
                            {influencer.roi}
                          </td>
                          <td className="p-2 sm:p-3">
                            <Button size="sm" variant="outline" className="text-xs bg-transparent whitespace-nowrap">
                              View Profile
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  )
}
