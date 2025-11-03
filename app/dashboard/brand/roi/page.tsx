"use client"

import { useState } from "react"
import { BrandSidebar } from "@/components/brand-sidebar"
import { BrandHeader } from "@/components/brand-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  TrendingUp,
  TrendingDown,
  Download,
  Info,
  ArrowUpDown,
  Sparkles,
  Target,
  DollarSign,
  BarChart3,
} from "lucide-react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { Tooltip as UITooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

// Mock data for ROI dashboard
const summaryMetrics = {
  overallROI: 2.7,
  avgCPR: 0.38,
  avgCPE: 1.1,
  conversionRate: 4.3,
}

const roiTableData = [
  {
    id: 1,
    name: "@fitwithtara",
    niche: "Fitness",
    platform: "Instagram",
    spend: 45000,
    reach: 480000,
    engagements: 28000,
    conversions: 220,
    roi: 3.2,
    cpe: 1.6,
    cpr: 0.09,
    conversionRate: 5.2,
  },
  {
    id: 2,
    name: "@techbyadi",
    niche: "Tech",
    platform: "YouTube",
    spend: 90000,
    reach: 1100000,
    engagements: 35000,
    conversions: 510,
    roi: 4.1,
    cpe: 2.57,
    cpr: 0.08,
    conversionRate: 7.6,
  },
  {
    id: 3,
    name: "@fashionista_riya",
    niche: "Fashion",
    platform: "Instagram",
    spend: 35000,
    reach: 520000,
    engagements: 25000,
    conversions: 180,
    roi: 2.4,
    cpe: 1.4,
    cpr: 0.07,
    conversionRate: 4.8,
  },
  {
    id: 4,
    name: "@foodie_adventures",
    niche: "Food",
    platform: "TikTok",
    spend: 28000,
    reach: 380000,
    engagements: 32000,
    conversions: 150,
    roi: 2.8,
    cpe: 0.88,
    cpr: 0.07,
    conversionRate: 5.1,
  },
  {
    id: 5,
    name: "@beauty_by_priya",
    niche: "Beauty",
    platform: "Instagram",
    spend: 52000,
    reach: 620000,
    engagements: 38000,
    conversions: 280,
    roi: 3.5,
    cpe: 1.37,
    cpr: 0.08,
    conversionRate: 6.2,
  },
]

const roiOverTimeData = [
  { month: "Jan", roi: 2.1, spend: 120000 },
  { month: "Feb", roi: 2.4, spend: 135000 },
  { month: "Mar", roi: 2.8, spend: 150000 },
  { month: "Apr", roi: 2.5, spend: 145000 },
  { month: "May", roi: 3.1, spend: 160000 },
  { month: "Jun", roi: 2.7, spend: 155000 },
]

// Heatmap data: Niche × Platform
const heatmapData = [
  { niche: "Fashion", instagram: 2.4, youtube: 2.1, tiktok: 2.8 },
  { niche: "Fitness", instagram: 3.2, youtube: 2.9, tiktok: 3.5 },
  { niche: "Tech", instagram: 2.8, youtube: 4.1, tiktok: 3.0 },
  { niche: "Food", instagram: 2.5, youtube: 2.3, tiktok: 2.8 },
  { niche: "Beauty", instagram: 3.5, youtube: 2.7, tiktok: 3.1 },
  { niche: "Travel", instagram: 2.2, youtube: 2.6, tiktok: 2.4 },
]

const benchmarkData = {
  roi: { brand: 2.9, industry: 2.4, delta: 0.5 },
  cpe: { brand: 1.05, industry: 1.22, delta: -0.17 },
  conversionRate: { brand: 4.6, industry: 3.8, delta: 0.8 },
}

// Helper function to get color based on ROI value
const getROIColor = (roi: number) => {
  if (roi >= 3.5) return "#10b981" // Green
  if (roi >= 2.5) return "#f59e0b" // Yellow/Orange
  return "#ef4444" // Red
}

export default function ROIDashboard() {
  const [sortColumn, setSortColumn] = useState<string>("roi")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc")
  const [selectedCampaign, setSelectedCampaign] = useState("all")
  const [selectedPlatform, setSelectedPlatform] = useState("all")
  const [selectedNiche, setSelectedNiche] = useState("all")
  const [timeframe, setTimeframe] = useState("90d")
  const [showBenchmark, setShowBenchmark] = useState(false)
  const [heatmapMetric, setHeatmapMetric] = useState<"roi" | "cpe">("roi")

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortColumn(column)
      setSortDirection("desc")
    }
  }

  const sortedData = [...roiTableData].sort((a, b) => {
    const aValue = a[sortColumn as keyof typeof a]
    const bValue = b[sortColumn as keyof typeof b]
    if (typeof aValue === "number" && typeof bValue === "number") {
      return sortDirection === "asc" ? aValue - bValue : bValue - aValue
    }
    return 0
  })

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <BrandSidebar />

      <div className="flex-1 flex flex-col overflow-hidden lg:pl-64">
        <BrandHeader />

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {/* Header */}
          <div className="mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-2">ROI Dashboard</h1>
            <p className="text-sm sm:text-base text-gray-400">
              Quantify true marketing impact and optimize creator partnerships
            </p>
          </div>

          {/* Filters */}
          <Card className="bg-[#1a1f35] border-white/10 mb-6">
            <CardContent className="p-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                <Select value={selectedCampaign} onValueChange={setSelectedCampaign}>
                  <SelectTrigger className="bg-[#0a0e1a] border-white/10 text-white">
                    <SelectValue placeholder="Campaign" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Campaigns</SelectItem>
                    <SelectItem value="summer">Summer Fashion</SelectItem>
                    <SelectItem value="tech">Tech Launch</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={selectedPlatform} onValueChange={setSelectedPlatform}>
                  <SelectTrigger className="bg-[#0a0e1a] border-white/10 text-white">
                    <SelectValue placeholder="Platform" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Platforms</SelectItem>
                    <SelectItem value="instagram">Instagram</SelectItem>
                    <SelectItem value="youtube">YouTube</SelectItem>
                    <SelectItem value="tiktok">TikTok</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={selectedNiche} onValueChange={setSelectedNiche}>
                  <SelectTrigger className="bg-[#0a0e1a] border-white/10 text-white">
                    <SelectValue placeholder="Niche" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Niches</SelectItem>
                    <SelectItem value="fashion">Fashion</SelectItem>
                    <SelectItem value="fitness">Fitness</SelectItem>
                    <SelectItem value="tech">Tech</SelectItem>
                    <SelectItem value="food">Food</SelectItem>
                    <SelectItem value="beauty">Beauty</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={timeframe} onValueChange={setTimeframe}>
                  <SelectTrigger className="bg-[#0a0e1a] border-white/10 text-white">
                    <SelectValue placeholder="Timeframe" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7d">Last 7 days</SelectItem>
                    <SelectItem value="30d">Last 30 days</SelectItem>
                    <SelectItem value="90d">Last 90 days</SelectItem>
                    <SelectItem value="custom">Custom</SelectItem>
                  </SelectContent>
                </Select>

                <Button
                  variant="outline"
                  className="border-white/10 text-white hover:bg-[#252b45] bg-transparent"
                  onClick={() => setShowBenchmark(!showBenchmark)}
                >
                  <BarChart3 className="w-4 h-4 mr-2" />
                  {showBenchmark ? "Hide" : "Show"} Benchmark
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Top Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <Card className="bg-gradient-to-br from-[#1a1f35] to-[#252b45] border-white/10">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xs sm:text-sm font-medium text-gray-400">Overall ROI</CardTitle>
                  <TooltipProvider>
                    <UITooltip>
                      <TooltipTrigger>
                        <Info className="w-3 h-3 sm:w-4 sm:h-4 text-gray-500" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="text-xs">ROI = (Revenue - Spend) ÷ Spend</p>
                      </TooltipContent>
                    </UITooltip>
                  </TooltipProvider>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-baseline gap-2">
                  <p className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white">{summaryMetrics.overallROI}×</p>
                  <Badge className="bg-green-500/20 text-green-500 text-xs">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    +12%
                  </Badge>
                </div>
                <p className="text-xs text-gray-400 mt-2">Across all completed campaigns</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-[#1a1f35] to-[#252b45] border-white/10">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xs sm:text-sm font-medium text-gray-400">Avg Cost per Reach</CardTitle>
                  <TooltipProvider>
                    <UITooltip>
                      <TooltipTrigger>
                        <Info className="w-3 h-3 sm:w-4 sm:h-4 text-gray-500" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="text-xs">CPR = Spend ÷ Total Reach</p>
                      </TooltipContent>
                    </UITooltip>
                  </TooltipProvider>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-baseline gap-2">
                  <p className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white">₹{summaryMetrics.avgCPR}</p>
                  <Badge className="bg-green-500/20 text-green-500 text-xs">
                    <TrendingDown className="w-3 h-3 mr-1" />
                    -8%
                  </Badge>
                </div>
                <p className="text-xs text-gray-400 mt-2">Efficiency of reach spend</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-[#1a1f35] to-[#252b45] border-white/10">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xs sm:text-sm font-medium text-gray-400">
                    Avg Cost per Engagement
                  </CardTitle>
                  <TooltipProvider>
                    <UITooltip>
                      <TooltipTrigger>
                        <Info className="w-3 h-3 sm:w-4 sm:h-4 text-gray-500" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="text-xs">CPE = Spend ÷ Engagements</p>
                      </TooltipContent>
                    </UITooltip>
                  </TooltipProvider>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-baseline gap-2">
                  <p className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white">₹{summaryMetrics.avgCPE}</p>
                  <Badge className="bg-orange-500/20 text-orange-500 text-xs">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    +3%
                  </Badge>
                </div>
                <p className="text-xs text-gray-400 mt-2">Cost per engagement</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-[#1a1f35] to-[#252b45] border-white/10">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xs sm:text-sm font-medium text-gray-400">Conversion Rate</CardTitle>
                  <TooltipProvider>
                    <UITooltip>
                      <TooltipTrigger>
                        <Info className="w-3 h-3 sm:w-4 sm:h-4 text-gray-500" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="text-xs">Clicks ÷ Impressions</p>
                      </TooltipContent>
                    </UITooltip>
                  </TooltipProvider>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-baseline gap-2">
                  <p className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white">
                    {summaryMetrics.conversionRate}%
                  </p>
                  <Badge className="bg-green-500/20 text-green-500 text-xs">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    +15%
                  </Badge>
                </div>
                <p className="text-xs text-gray-400 mt-2">Campaign CTA effectiveness</p>
              </CardContent>
            </Card>
          </div>

          {/* Benchmark Comparison */}
          {showBenchmark && (
            <Card className="bg-[#1a1f35] border-white/10 mb-6">
              <CardHeader>
                <CardTitle className="text-base sm:text-lg text-white">Industry Benchmark Comparison</CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  Compare your performance with industry averages
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[500px]">
                    <thead>
                      <tr className="border-b border-white/10">
                        <th className="text-left p-2 sm:p-3 text-xs sm:text-sm font-semibold text-gray-400">Metric</th>
                        <th className="text-left p-2 sm:p-3 text-xs sm:text-sm font-semibold text-gray-400">
                          Your Avg
                        </th>
                        <th className="text-left p-2 sm:p-3 text-xs sm:text-sm font-semibold text-gray-400">
                          Industry Avg
                        </th>
                        <th className="text-left p-2 sm:p-3 text-xs sm:text-sm font-semibold text-gray-400">
                          Difference
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-white/10">
                        <td className="p-2 sm:p-3 text-xs sm:text-sm text-white">ROI</td>
                        <td className="p-2 sm:p-3 text-xs sm:text-sm text-white font-semibold">
                          {benchmarkData.roi.brand}×
                        </td>
                        <td className="p-2 sm:p-3 text-xs sm:text-sm text-gray-400">{benchmarkData.roi.industry}×</td>
                        <td className="p-2 sm:p-3 text-xs sm:text-sm">
                          <Badge className="bg-green-500/20 text-green-500">+{benchmarkData.roi.delta}×</Badge>
                        </td>
                      </tr>
                      <tr className="border-b border-white/10">
                        <td className="p-2 sm:p-3 text-xs sm:text-sm text-white">CPE</td>
                        <td className="p-2 sm:p-3 text-xs sm:text-sm text-white font-semibold">
                          ₹{benchmarkData.cpe.brand}
                        </td>
                        <td className="p-2 sm:p-3 text-xs sm:text-sm text-gray-400">₹{benchmarkData.cpe.industry}</td>
                        <td className="p-2 sm:p-3 text-xs sm:text-sm">
                          <Badge className="bg-green-500/20 text-green-500">₹{benchmarkData.cpe.delta}</Badge>
                        </td>
                      </tr>
                      <tr>
                        <td className="p-2 sm:p-3 text-xs sm:text-sm text-white">Conversion Rate</td>
                        <td className="p-2 sm:p-3 text-xs sm:text-sm text-white font-semibold">
                          {benchmarkData.conversionRate.brand}%
                        </td>
                        <td className="p-2 sm:p-3 text-xs sm:text-sm text-gray-400">
                          {benchmarkData.conversionRate.industry}%
                        </td>
                        <td className="p-2 sm:p-3 text-xs sm:text-sm">
                          <Badge className="bg-green-500/20 text-green-500">
                            +{benchmarkData.conversionRate.delta}%
                          </Badge>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            {/* ROI Over Time */}
            <Card className="bg-[#1a1f35] border-white/10 lg:col-span-2">
              <CardHeader>
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <CardTitle className="text-base sm:text-lg text-white">ROI Over Time</CardTitle>
                    <CardDescription className="text-xs sm:text-sm">
                      Track ROI evolution across campaigns
                    </CardDescription>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-white/10 text-white hover:bg-[#252b45] bg-transparent text-xs"
                  >
                    <Download className="w-3 h-3 mr-2" />
                    Export
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={roiOverTimeData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                    <XAxis dataKey="month" stroke="#9ca3af" style={{ fontSize: "12px" }} />
                    <YAxis yAxisId="left" stroke="#9ca3af" style={{ fontSize: "12px" }} />
                    <YAxis yAxisId="right" orientation="right" stroke="#9ca3af" style={{ fontSize: "12px" }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#1a1f35",
                        border: "1px solid rgba(255,255,255,0.1)",
                        borderRadius: "8px",
                        fontSize: "12px",
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: "12px" }} />
                    <Line
                      yAxisId="left"
                      type="monotone"
                      dataKey="roi"
                      stroke="#10b981"
                      strokeWidth={3}
                      name="ROI"
                      dot={{ r: 4 }}
                    />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="spend"
                      stroke="#f59e0b"
                      strokeWidth={2}
                      name="Spend (₹)"
                      strokeDasharray="5 5"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* AI Insights Panel */}
            <Card className="bg-gradient-to-br from-[#1a1f35] to-[#252b45] border-white/10">
              <CardHeader>
                <CardTitle className="text-base sm:text-lg text-white flex items-center gap-2">
                  <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                  AI Insights
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-3 bg-[#0a0e1a] rounded-lg border border-primary/20">
                  <div className="flex items-start gap-2 mb-2">
                    <Target className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                    <p className="text-xs sm:text-sm text-white font-medium">Top Performer</p>
                  </div>
                  <p className="text-xs text-gray-400">
                    Fitness creators yield 2.8× higher ROI than Lifestyle category
                  </p>
                </div>

                <div className="p-3 bg-[#0a0e1a] rounded-lg border border-green-500/20">
                  <div className="flex items-start gap-2 mb-2">
                    <TrendingUp className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                    <p className="text-xs sm:text-sm text-white font-medium">Platform Efficiency</p>
                  </div>
                  <p className="text-xs text-gray-400">
                    TikTok delivered 35% cheaper cost per engagement than Instagram last quarter
                  </p>
                </div>

                <div className="p-3 bg-[#0a0e1a] rounded-lg border border-orange-500/20">
                  <div className="flex items-start gap-2 mb-2">
                    <DollarSign className="w-4 h-4 text-orange-500 flex-shrink-0 mt-0.5" />
                    <p className="text-xs sm:text-sm text-white font-medium">Budget Recommendation</p>
                  </div>
                  <p className="text-xs text-gray-400">
                    Allocate more budget to YouTube Tech creators — consistent 3.5× ROI in last 60 days
                  </p>
                </div>

                <div className="p-3 bg-[#0a0e1a] rounded-lg border border-red-500/20">
                  <div className="flex items-start gap-2 mb-2">
                    <TrendingDown className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                    <p className="text-xs sm:text-sm text-white font-medium">Optimization Alert</p>
                  </div>
                  <p className="text-xs text-gray-400">Consider pausing Beauty collaborations (avg ROI &lt; 1×)</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Interactive Heatmap */}
          <Card className="bg-[#1a1f35] border-white/10 mb-6 overflow-hidden">
            <CardHeader>
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div>
                  <CardTitle className="text-base sm:text-lg text-white">Cost Efficiency Heatmap</CardTitle>
                  <CardDescription className="text-xs sm:text-sm">Niche × Platform performance matrix</CardDescription>
                </div>
                <Tabs value={heatmapMetric} onValueChange={(v) => setHeatmapMetric(v as "roi" | "cpe")}>
                  <TabsList className="bg-[#0a0e1a]">
                    <TabsTrigger value="roi" className="text-xs">
                      View ROI
                    </TabsTrigger>
                    <TabsTrigger value="cpe" className="text-xs">
                      View CPE
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto -mx-4 sm:mx-0">
                <div className="inline-block min-w-full align-middle px-4 sm:px-0">
                  <table className="w-full min-w-[600px]">
                    <thead>
                      <tr>
                        <th className="text-left p-2 sm:p-3 text-xs sm:text-sm font-semibold text-gray-400 whitespace-nowrap">
                          Niche
                        </th>
                        <th className="text-center p-2 sm:p-3 text-xs sm:text-sm font-semibold text-gray-400 whitespace-nowrap">
                          Instagram
                        </th>
                        <th className="text-center p-2 sm:p-3 text-xs sm:text-sm font-semibold text-gray-400 whitespace-nowrap">
                          YouTube
                        </th>
                        <th className="text-center p-2 sm:p-3 text-xs sm:text-sm font-semibold text-gray-400 whitespace-nowrap">
                          TikTok
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {heatmapData.map((row) => (
                        <tr key={row.niche} className="border-t border-white/10">
                          <td className="p-2 sm:p-3 text-xs sm:text-sm text-white font-medium whitespace-nowrap">
                            {row.niche}
                          </td>
                          <td className="p-2 sm:p-3">
                            <TooltipProvider>
                              <UITooltip>
                                <TooltipTrigger asChild>
                                  <div
                                    className="w-full h-12 rounded flex items-center justify-center cursor-pointer transition-transform hover:scale-105"
                                    style={{
                                      backgroundColor: getROIColor(row.instagram) + "20",
                                      border: `1px solid ${getROIColor(row.instagram)}40`,
                                    }}
                                  >
                                    <span className="text-xs sm:text-sm font-bold text-white">{row.instagram}×</span>
                                  </div>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p className="text-xs">ROI: {row.instagram}×, Avg CPE: ₹1.20</p>
                                </TooltipContent>
                              </UITooltip>
                            </TooltipProvider>
                          </td>
                          <td className="p-2 sm:p-3">
                            <TooltipProvider>
                              <UITooltip>
                                <TooltipTrigger asChild>
                                  <div
                                    className="w-full h-12 rounded flex items-center justify-center cursor-pointer transition-transform hover:scale-105"
                                    style={{
                                      backgroundColor: getROIColor(row.youtube) + "20",
                                      border: `1px solid ${getROIColor(row.youtube)}40`,
                                    }}
                                  >
                                    <span className="text-xs sm:text-sm font-bold text-white">{row.youtube}×</span>
                                  </div>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p className="text-xs">ROI: {row.youtube}×, Avg CPE: ₹1.35</p>
                                </TooltipContent>
                              </UITooltip>
                            </TooltipProvider>
                          </td>
                          <td className="p-2 sm:p-3">
                            <TooltipProvider>
                              <UITooltip>
                                <TooltipTrigger asChild>
                                  <div
                                    className="w-full h-12 rounded flex items-center justify-center cursor-pointer transition-transform hover:scale-105"
                                    style={{
                                      backgroundColor: getROIColor(row.tiktok) + "20",
                                      border: `1px solid ${getROIColor(row.tiktok)}40`,
                                    }}
                                  >
                                    <span className="text-xs sm:text-sm font-bold text-white">{row.tiktok}×</span>
                                  </div>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p className="text-xs">ROI: {row.tiktok}×, Avg CPE: ₹0.95</p>
                                </TooltipContent>
                              </UITooltip>
                            </TooltipProvider>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              <div className="flex items-center justify-center gap-4 mt-4 text-xs flex-wrap">
                <div className="flex items-center gap-2">
                  <div
                    className="w-4 h-4 rounded"
                    style={{ backgroundColor: "#10b98120", border: "1px solid #10b98140" }}
                  />
                  <span className="text-gray-400">High ROI (&gt;3.5×)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div
                    className="w-4 h-4 rounded"
                    style={{ backgroundColor: "#f59e0b20", border: "1px solid #f59e0b40" }}
                  />
                  <span className="text-gray-400">Average (2.5-3.5×)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div
                    className="w-4 h-4 rounded"
                    style={{ backgroundColor: "#ef444420", border: "1px solid #ef444440" }}
                  />
                  <span className="text-gray-400">Low (&lt;2.5×)</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* ROI & Efficiency Table */}
          <Card className="bg-[#1a1f35] border-white/10 overflow-hidden">
            <CardHeader>
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div>
                  <CardTitle className="text-base sm:text-lg text-white">ROI & Efficiency Matrix</CardTitle>
                  <CardDescription className="text-xs sm:text-sm">
                    Detailed performance breakdown by influencer
                  </CardDescription>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="border-white/10 text-white hover:bg-[#252b45] bg-transparent text-xs"
                >
                  <Download className="w-3 h-3 mr-2" />
                  Export CSV
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto -mx-4 sm:mx-0">
                <div className="inline-block min-w-full align-middle px-4 sm:px-0">
                  <table className="w-full min-w-[1000px]">
                    <thead>
                      <tr className="border-b border-white/10">
                        <th className="text-left p-2 sm:p-3 text-xs sm:text-sm font-semibold text-gray-400 whitespace-nowrap">
                          <button
                            onClick={() => handleSort("name")}
                            className="flex items-center gap-1 hover:text-white"
                          >
                            Influencer <ArrowUpDown className="w-3 h-3" />
                          </button>
                        </th>
                        <th className="text-left p-2 sm:p-3 text-xs sm:text-sm font-semibold text-gray-400 whitespace-nowrap">
                          Platform
                        </th>
                        <th className="text-right p-2 sm:p-3 text-xs sm:text-sm font-semibold text-gray-400 whitespace-nowrap">
                          <button
                            onClick={() => handleSort("spend")}
                            className="flex items-center gap-1 hover:text-white ml-auto"
                          >
                            Spend <ArrowUpDown className="w-3 h-3" />
                          </button>
                        </th>
                        <th className="text-right p-2 sm:p-3 text-xs sm:text-sm font-semibold text-gray-400 whitespace-nowrap">
                          <button
                            onClick={() => handleSort("reach")}
                            className="flex items-center gap-1 hover:text-white ml-auto"
                          >
                            Reach <ArrowUpDown className="w-3 h-3" />
                          </button>
                        </th>
                        <th className="text-right p-2 sm:p-3 text-xs sm:text-sm font-semibold text-gray-400 whitespace-nowrap">
                          <button
                            onClick={() => handleSort("engagements")}
                            className="flex items-center gap-1 hover:text-white ml-auto"
                          >
                            Engagements <ArrowUpDown className="w-3 h-3" />
                          </button>
                        </th>
                        <th className="text-right p-2 sm:p-3 text-xs sm:text-sm font-semibold text-gray-400 whitespace-nowrap">
                          <button
                            onClick={() => handleSort("conversions")}
                            className="flex items-center gap-1 hover:text-white ml-auto"
                          >
                            Conversions <ArrowUpDown className="w-3 h-3" />
                          </button>
                        </th>
                        <th className="text-right p-2 sm:p-3 text-xs sm:text-sm font-semibold text-gray-400 whitespace-nowrap">
                          <button
                            onClick={() => handleSort("roi")}
                            className="flex items-center gap-1 hover:text-white ml-auto"
                          >
                            ROI <ArrowUpDown className="w-3 h-3" />
                          </button>
                        </th>
                        <th className="text-right p-2 sm:p-3 text-xs sm:text-sm font-semibold text-gray-400 whitespace-nowrap">
                          <button
                            onClick={() => handleSort("cpe")}
                            className="flex items-center gap-1 hover:text-white ml-auto"
                          >
                            CPE <ArrowUpDown className="w-3 h-3" />
                          </button>
                        </th>
                        <th className="text-right p-2 sm:p-3 text-xs sm:text-sm font-semibold text-gray-400 whitespace-nowrap">
                          <button
                            onClick={() => handleSort("cpr")}
                            className="flex items-center gap-1 hover:text-white ml-auto"
                          >
                            CPR <ArrowUpDown className="w-3 h-3" />
                          </button>
                        </th>
                        <th className="text-right p-2 sm:p-3 text-xs sm:text-sm font-semibold text-gray-400 whitespace-nowrap">
                          <button
                            onClick={() => handleSort("conversionRate")}
                            className="flex items-center gap-1 hover:text-white ml-auto"
                          >
                            Conv. Rate <ArrowUpDown className="w-3 h-3" />
                          </button>
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {sortedData.map((row) => (
                        <tr key={row.id} className="border-b border-white/10 hover:bg-[#252b45] transition-colors">
                          <td className="p-2 sm:p-3">
                            <div>
                              <p className="text-xs sm:text-sm text-white font-medium whitespace-nowrap">{row.name}</p>
                              <p className="text-xs text-gray-400 whitespace-nowrap">{row.niche}</p>
                            </div>
                          </td>
                          <td className="p-2 sm:p-3">
                            <Badge
                              variant="outline"
                              className="text-xs border-white/20 text-gray-300 whitespace-nowrap"
                            >
                              {row.platform}
                            </Badge>
                          </td>
                          <td className="p-2 sm:p-3 text-xs sm:text-sm text-white text-right whitespace-nowrap">
                            ₹{row.spend.toLocaleString()}
                          </td>
                          <td className="p-2 sm:p-3 text-xs sm:text-sm text-white text-right whitespace-nowrap">
                            {(row.reach / 1000).toFixed(0)}K
                          </td>
                          <td className="p-2 sm:p-3 text-xs sm:text-sm text-white text-right whitespace-nowrap">
                            {(row.engagements / 1000).toFixed(1)}K
                          </td>
                          <td className="p-2 sm:p-3 text-xs sm:text-sm text-white text-right whitespace-nowrap">
                            {row.conversions}
                          </td>
                          <td className="p-2 sm:p-3 text-xs sm:text-sm font-bold text-right whitespace-nowrap">
                            <span style={{ color: getROIColor(row.roi) }}>{row.roi}×</span>
                          </td>
                          <td className="p-2 sm:p-3 text-xs sm:text-sm text-white text-right whitespace-nowrap">
                            ₹{row.cpe.toFixed(2)}
                          </td>
                          <td className="p-2 sm:p-3 text-xs sm:text-sm text-white text-right whitespace-nowrap">
                            ₹{row.cpr.toFixed(2)}
                          </td>
                          <td className="p-2 sm:p-3 text-xs sm:text-sm text-white text-right whitespace-nowrap">
                            {row.conversionRate}%
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
