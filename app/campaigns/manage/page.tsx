"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import DashboardNav from "@/components/dashboard-nav"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import {
  Plus,
  TrendingUp,
  Users,
  DollarSign,
  Eye,
  Heart,
  Calendar,
  Target,
  BarChart3,
  Download,
  Edit,
  Trash2,
  CheckCircle,
  Clock,
  AlertCircle,
  ArrowLeft,
} from "lucide-react"

export default function CampaignManagePage() {
  const router = useRouter()
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [selectedTab, setSelectedTab] = useState("active")

  // Mock campaign data
  const campaigns = [
    {
      id: 1,
      name: "Summer Fashion Launch 2025",
      status: "active",
      budget: 150000,
      spent: 89000,
      startDate: "2025-01-15",
      endDate: "2025-02-28",
      influencers: 8,
      applicants: 24,
      deliverables: {
        total: 32,
        completed: 18,
        pending: 14,
      },
      performance: {
        reach: 2450000,
        impressions: 3890000,
        engagement: 187500,
        engagementRate: 4.8,
        clicks: 45600,
        conversions: 1234,
        roi: 285,
      },
      platforms: ["Instagram", "YouTube"],
      category: "Fashion",
    },
    {
      id: 2,
      name: "Tech Product Review Campaign",
      status: "active",
      budget: 200000,
      spent: 125000,
      startDate: "2025-01-20",
      endDate: "2025-03-15",
      influencers: 12,
      applicants: 42,
      deliverables: {
        total: 48,
        completed: 28,
        pending: 20,
      },
      performance: {
        reach: 3200000,
        impressions: 5100000,
        engagement: 256000,
        engagementRate: 5.2,
        clicks: 67800,
        conversions: 2145,
        roi: 312,
      },
      platforms: ["YouTube", "Instagram", "Twitter"],
      category: "Tech",
    },
    {
      id: 3,
      name: "Fitness Challenge Series",
      status: "completed",
      budget: 100000,
      spent: 98000,
      startDate: "2024-12-01",
      endDate: "2025-01-15",
      influencers: 6,
      applicants: 18,
      deliverables: {
        total: 24,
        completed: 24,
        pending: 0,
      },
      performance: {
        reach: 1850000,
        impressions: 2900000,
        engagement: 145000,
        engagementRate: 5.0,
        clicks: 34500,
        conversions: 892,
        roi: 245,
      },
      platforms: ["Instagram", "YouTube"],
      category: "Fitness",
    },
    {
      id: 4,
      name: "Food Festival Promotion",
      status: "draft",
      budget: 80000,
      spent: 0,
      startDate: "2025-03-01",
      endDate: "2025-03-31",
      influencers: 0,
      applicants: 0,
      deliverables: {
        total: 0,
        completed: 0,
        pending: 0,
      },
      performance: {
        reach: 0,
        impressions: 0,
        engagement: 0,
        engagementRate: 0,
        clicks: 0,
        conversions: 0,
        roi: 0,
      },
      platforms: ["Instagram"],
      category: "Food",
    },
  ]

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
    return num.toString()
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-500/20 text-green-400 border-green-500/30"
      case "completed":
        return "bg-blue-500/20 text-blue-400 border-blue-500/30"
      case "draft":
        return "bg-gray-500/20 text-gray-400 border-gray-500/30"
      case "paused":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/30"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
        return <CheckCircle className="h-4 w-4" />
      case "completed":
        return <CheckCircle className="h-4 w-4" />
      case "draft":
        return <Clock className="h-4 w-4" />
      case "paused":
        return <AlertCircle className="h-4 w-4" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  const filteredCampaigns = campaigns.filter((campaign) => {
    if (selectedTab === "all") return true
    return campaign.status === selectedTab
  })

  // Calculate overview stats
  const overviewStats = {
    totalCampaigns: campaigns.length,
    activeCampaigns: campaigns.filter((c) => c.status === "active").length,
    totalBudget: campaigns.reduce((sum, c) => sum + c.budget, 0),
    totalSpent: campaigns.reduce((sum, c) => sum + c.spent, 0),
    totalReach: campaigns.reduce((sum, c) => sum + c.performance.reach, 0),
    totalEngagement: campaigns.reduce((sum, c) => sum + c.performance.engagement, 0),
    avgROI:
      campaigns.filter((c) => c.performance.roi > 0).reduce((sum, c) => sum + c.performance.roi, 0) /
        campaigns.filter((c) => c.performance.roi > 0).length || 0,
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-blue-950 to-black">
      <DashboardNav />

      <div className="container mx-auto px-4 py-8">
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
            <h1 className="text-4xl font-bold text-white mb-2">Campaign Management</h1>
            <p className="text-gray-400">Create, track, and optimize your influencer campaigns</p>
          </div>
          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-red-600 hover:bg-red-700 text-white">
                <Plus className="h-4 w-4 mr-2" />
                Create Campaign
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-gray-900 border-white/10 text-white max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-2xl">Create New Campaign</DialogTitle>
                <DialogDescription className="text-gray-400">
                  Set up your influencer marketing campaign
                </DialogDescription>
              </DialogHeader>
              <form className="space-y-4 mt-4">
                <div>
                  <Label className="text-white">Campaign Name</Label>
                  <Input
                    placeholder="e.g., Summer Product Launch 2025"
                    className="bg-white/5 border-white/10 text-white mt-2"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-white">Category</Label>
                    <Select>
                      <SelectTrigger className="bg-white/5 border-white/10 text-white mt-2">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="fashion">Fashion</SelectItem>
                        <SelectItem value="tech">Tech</SelectItem>
                        <SelectItem value="fitness">Fitness</SelectItem>
                        <SelectItem value="food">Food & Beverage</SelectItem>
                        <SelectItem value="travel">Travel</SelectItem>
                        <SelectItem value="beauty">Beauty</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-white">Budget (₹)</Label>
                    <Input type="number" placeholder="100000" className="bg-white/5 border-white/10 text-white mt-2" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-white">Start Date</Label>
                    <Input type="date" className="bg-white/5 border-white/10 text-white mt-2" />
                  </div>
                  <div>
                    <Label className="text-white">End Date</Label>
                    <Input type="date" className="bg-white/5 border-white/10 text-white mt-2" />
                  </div>
                </div>
                <div>
                  <Label className="text-white">Campaign Description</Label>
                  <Textarea
                    placeholder="Describe your campaign objectives and requirements..."
                    className="bg-white/5 border-white/10 text-white mt-2 min-h-[100px]"
                  />
                </div>
                <div>
                  <Label className="text-white">Target Platforms</Label>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    {["Instagram", "YouTube", "Facebook", "Twitter", "TikTok", "LinkedIn"].map((platform) => (
                      <label
                        key={platform}
                        className="flex items-center gap-2 p-3 bg-white/5 rounded-lg cursor-pointer hover:bg-white/10"
                      >
                        <input type="checkbox" className="rounded" />
                        <span className="text-white text-sm">{platform}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div>
                  <Label className="text-white">Deliverables</Label>
                  <Textarea
                    placeholder="e.g., 2 Instagram Posts, 1 YouTube Video, 5 Stories"
                    className="bg-white/5 border-white/10 text-white mt-2"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-white">Min. Followers</Label>
                    <Input type="number" placeholder="50000" className="bg-white/5 border-white/10 text-white mt-2" />
                  </div>
                  <div>
                    <Label className="text-white">Min. Engagement Rate (%)</Label>
                    <Input
                      type="number"
                      step="0.1"
                      placeholder="3.5"
                      className="bg-white/5 border-white/10 text-white mt-2"
                    />
                  </div>
                </div>
                <div className="flex gap-3 pt-4">
                  <Button type="submit" className="flex-1 bg-red-600 hover:bg-red-700 text-white">
                    Create Campaign
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1 border-white/10 text-white hover:bg-white/5 bg-transparent"
                    onClick={() => setCreateDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white/5 backdrop-blur-lg border-white/10">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-gray-400 flex items-center gap-2">
                <Target className="h-4 w-4" />
                Total Campaigns
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-white">{overviewStats.totalCampaigns}</p>
              <p className="text-xs text-gray-500 mt-1">{overviewStats.activeCampaigns} active</p>
            </CardContent>
          </Card>

          <Card className="bg-white/5 backdrop-blur-lg border-white/10">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-gray-400 flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Budget Utilization
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-white">
                {((overviewStats.totalSpent / overviewStats.totalBudget) * 100).toFixed(0)}%
              </p>
              <p className="text-xs text-gray-500 mt-1">
                ₹{formatNumber(overviewStats.totalSpent)} / ₹{formatNumber(overviewStats.totalBudget)}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/5 backdrop-blur-lg border-white/10">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-gray-400 flex items-center gap-2">
                <Eye className="h-4 w-4" />
                Total Reach
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-white">{formatNumber(overviewStats.totalReach)}</p>
              <p className="text-xs text-gray-500 mt-1">across all campaigns</p>
            </CardContent>
          </Card>

          <Card className="bg-white/5 backdrop-blur-lg border-white/10">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-gray-400 flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Avg ROI
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-white">{overviewStats.avgROI.toFixed(0)}%</p>
              <Badge className="mt-2 bg-green-500/20 text-green-400 border-green-500/30 text-xs">
                <TrendingUp className="h-3 w-3 mr-1" />
                Excellent
              </Badge>
            </CardContent>
          </Card>
        </div>

        {/* Campaigns List */}
        <Card className="bg-white/5 backdrop-blur-lg border-white/10">
          <CardHeader>
            <CardTitle className="text-white">Your Campaigns</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs value={selectedTab} onValueChange={setSelectedTab}>
              <TabsList className="bg-white/5 border-white/10 mb-6">
                <TabsTrigger value="all" className="data-[state=active]:bg-red-600">
                  All ({campaigns.length})
                </TabsTrigger>
                <TabsTrigger value="active" className="data-[state=active]:bg-red-600">
                  Active ({campaigns.filter((c) => c.status === "active").length})
                </TabsTrigger>
                <TabsTrigger value="completed" className="data-[state=active]:bg-red-600">
                  Completed ({campaigns.filter((c) => c.status === "completed").length})
                </TabsTrigger>
                <TabsTrigger value="draft" className="data-[state=active]:bg-red-600">
                  Draft ({campaigns.filter((c) => c.status === "draft").length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value={selectedTab} className="space-y-4">
                {filteredCampaigns.map((campaign) => (
                  <Card key={campaign.id} className="bg-white/5 border-white/10">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-xl font-bold text-white">{campaign.name}</h3>
                            <Badge className={getStatusColor(campaign.status)}>
                              {getStatusIcon(campaign.status)}
                              <span className="ml-1 capitalize">{campaign.status}</span>
                            </Badge>
                            <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">
                              {campaign.category}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-gray-400">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              {campaign.startDate} - {campaign.endDate}
                            </span>
                            <span className="flex items-center gap-1">
                              <Users className="h-4 w-4" />
                              {campaign.influencers} influencers
                            </span>
                            <span className="flex items-center gap-1">
                              <Target className="h-4 w-4" />
                              {campaign.applicants} applicants
                            </span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-white/10 text-white hover:bg-white/5 bg-transparent"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-white/10 text-white hover:bg-white/5 bg-transparent"
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-red-500/30 text-red-400 hover:bg-red-500/10 bg-transparent"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      {/* Budget Progress */}
                      <div className="mb-4">
                        <div className="flex items-center justify-between text-sm mb-2">
                          <span className="text-gray-400">Budget Utilization</span>
                          <span className="text-white font-medium">
                            ₹{formatNumber(campaign.spent)} / ₹{formatNumber(campaign.budget)}
                          </span>
                        </div>
                        <Progress value={(campaign.spent / campaign.budget) * 100} className="h-2" />
                      </div>

                      {/* Deliverables Progress */}
                      <div className="mb-4">
                        <div className="flex items-center justify-between text-sm mb-2">
                          <span className="text-gray-400">Deliverables</span>
                          <span className="text-white font-medium">
                            {campaign.deliverables.completed} / {campaign.deliverables.total} completed
                          </span>
                        </div>
                        <Progress
                          value={(campaign.deliverables.completed / campaign.deliverables.total) * 100}
                          className="h-2"
                        />
                      </div>

                      {/* Performance Metrics */}
                      {campaign.status !== "draft" && (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-white/5 rounded-lg">
                          <div>
                            <div className="flex items-center gap-2 text-gray-400 text-xs mb-1">
                              <Eye className="h-3 w-3" />
                              Reach
                            </div>
                            <p className="text-white font-semibold">{formatNumber(campaign.performance.reach)}</p>
                          </div>
                          <div>
                            <div className="flex items-center gap-2 text-gray-400 text-xs mb-1">
                              <Heart className="h-3 w-3" />
                              Engagement
                            </div>
                            <p className="text-white font-semibold">{formatNumber(campaign.performance.engagement)}</p>
                            <p className="text-xs text-gray-500">{campaign.performance.engagementRate}% rate</p>
                          </div>
                          <div>
                            <div className="flex items-center gap-2 text-gray-400 text-xs mb-1">
                              <BarChart3 className="h-3 w-3" />
                              Conversions
                            </div>
                            <p className="text-white font-semibold">{formatNumber(campaign.performance.conversions)}</p>
                          </div>
                          <div>
                            <div className="flex items-center gap-2 text-gray-400 text-xs mb-1">
                              <TrendingUp className="h-3 w-3" />
                              ROI
                            </div>
                            <p className="text-white font-semibold">{campaign.performance.roi}%</p>
                            <Badge className="mt-1 bg-green-500/20 text-green-400 border-green-500/30 text-xs">
                              Excellent
                            </Badge>
                          </div>
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex gap-3 mt-4">
                        <Button className="bg-red-600 hover:bg-red-700 text-white">View Details</Button>
                        {campaign.status === "draft" && (
                          <Button
                            variant="outline"
                            className="border-white/10 text-white hover:bg-white/5 bg-transparent"
                          >
                            Publish Campaign
                          </Button>
                        )}
                        {campaign.status === "active" && (
                          <Button
                            variant="outline"
                            className="border-white/10 text-white hover:bg-white/5 bg-transparent"
                          >
                            Manage Influencers
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
