"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  TrendingUp,
  Users,
  Eye,
  Heart,
  DollarSign,
  CheckCircle2,
  AlertCircle,
  Download,
  Send,
  Check,
  X,
  Sparkles,
  Target,
  Star,
} from "lucide-react"
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
} from "recharts"
import InfluencerInsightsModal from "@/components/influencer-insights-modal" // Assuming the modal component exists

interface CampaignDetailModalProps {
  campaign: any
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CampaignDetailModal({ campaign, open, onOpenChange }: CampaignDetailModalProps) {
  const [activeTab, setActiveTab] = useState("overview")
  const [selectedInfluencer, setSelectedInfluencer] = useState<any>(null)
  const [insightsModalOpen, setInsightsModalOpen] = useState(false)
  const [comparisonMode, setComparisonMode] = useState(false)
  const [selectedForComparison, setSelectedForComparison] = useState<number[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [platformFilter, setPlatformFilter] = useState("all")

  const performanceData = [
    { date: "Week 1", reach: 450000, engagement: 28000 },
    { date: "Week 2", reach: 680000, engagement: 42000 },
    { date: "Week 3", reach: 920000, engagement: 58000 },
    { date: "Week 4", reach: 1200000, engagement: 75000 },
  ]

  const platformData = [
    { name: "Instagram", value: 45, color: "#E4405F" },
    { name: "YouTube", value: 30, color: "#FF0000" },
    { name: "TikTok", value: 25, color: "#000000" },
  ]

  const influencers = [
    {
      id: 1,
      name: "Sarah Johnson",
      avatar: "/placeholder.svg?height=40&width=40",
      platform: "Instagram",
      followers: "245K",
      deliverables: 5,
      completed: 4,
      reach: "580K",
      engagement: "5.2%",
      status: "in-progress",
      payment: "$2,500",
      paid: 60,
    },
    {
      id: 2,
      name: "Mike Chen",
      avatar: "/placeholder.svg?height=40&width=40",
      platform: "YouTube",
      followers: "890K",
      deliverables: 3,
      completed: 3,
      reach: "1.2M",
      engagement: "6.8%",
      status: "delivered",
      payment: "$5,000",
      paid: 100,
    },
    {
      id: 3,
      name: "Emma Davis",
      avatar: "/placeholder.svg?height=40&width=40",
      platform: "TikTok",
      followers: "520K",
      deliverables: 8,
      completed: 6,
      reach: "890K",
      engagement: "7.2%",
      status: "in-progress",
      payment: "$3,200",
      paid: 50,
    },
  ]

  const content = [
    {
      id: 1,
      creator: "Sarah Johnson",
      type: "Reel",
      thumbnail: "/placeholder.svg?height=200&width=200",
      status: "approved",
      reach: "125K",
      engagement: "5.8%",
      submittedDate: "2024-02-15",
    },
    {
      id: 2,
      creator: "Mike Chen",
      type: "Video",
      thumbnail: "/placeholder.svg?height=200&width=200",
      status: "submitted",
      reach: "0",
      engagement: "0%",
      submittedDate: "2024-02-18",
    },
    {
      id: 3,
      creator: "Emma Davis",
      type: "Story",
      thumbnail: "/placeholder.svg?height=200&width=200",
      status: "needs-revision",
      reach: "0",
      engagement: "0%",
      submittedDate: "2024-02-17",
    },
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-500"
      case "submitted":
        return "bg-blue-500"
      case "needs-revision":
        return "bg-yellow-500"
      case "in-progress":
        return "bg-orange-500"
      case "delivered":
        return "bg-green-500"
      default:
        return "bg-gray-500"
    }
  }

  const handleViewInsights = (influencer: any) => {
    setSelectedInfluencer(influencer)
    setInsightsModalOpen(true)
  }

  const toggleComparisonSelection = (id: number) => {
    setSelectedForComparison((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]))
  }

  const filteredInfluencers = influencers.filter((inf) => {
    const matchesSearch = inf.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === "all" || inf.status === statusFilter
    const matchesPlatform = platformFilter === "all" || inf.platform.toLowerCase() === platformFilter.toLowerCase()
    return matchesSearch && matchesStatus && matchesPlatform
  })

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl sm:text-2xl">{campaign?.title}</DialogTitle>
          </DialogHeader>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-5 h-auto">
              <TabsTrigger value="overview" className="text-xs sm:text-sm">
                Overview
              </TabsTrigger>
              <TabsTrigger value="influencers" className="text-xs sm:text-sm">
                Influencers
              </TabsTrigger>
              <TabsTrigger value="content" className="text-xs sm:text-sm">
                Content
              </TabsTrigger>
              <TabsTrigger value="analytics" className="text-xs sm:text-sm">
                Analytics
              </TabsTrigger>
              <TabsTrigger value="payments" className="text-xs sm:text-sm">
                Payments
              </TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-4 mt-4">
              {/* KPI Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Eye className="h-4 w-4 text-blue-500" />
                      <p className="text-xs text-muted-foreground">Total Reach</p>
                    </div>
                    <p className="text-xl font-bold">{campaign?.reach}</p>
                    <p className="text-xs text-green-600 flex items-center gap-1 mt-1">
                      <TrendingUp className="h-3 w-3" />
                      +12% vs target
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Heart className="h-4 w-4 text-red-500" />
                      <p className="text-xs text-muted-foreground">Engagement Rate</p>
                    </div>
                    <p className="text-xl font-bold">{campaign?.engagement}</p>
                    <p className="text-xs text-green-600 flex items-center gap-1 mt-1">
                      <TrendingUp className="h-3 w-3" />
                      +8% vs avg
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Target className="h-4 w-4 text-purple-500" />
                      <p className="text-xs text-muted-foreground">ROI</p>
                    </div>
                    <p className="text-xl font-bold">3.2x</p>
                    <p className="text-xs text-green-600 flex items-center gap-1 mt-1">
                      <TrendingUp className="h-3 w-3" />
                      Above target
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <DollarSign className="h-4 w-4 text-green-500" />
                      <p className="text-xs text-muted-foreground">CPE</p>
                    </div>
                    <p className="text-xl font-bold">$0.24</p>
                    <p className="text-xs text-green-600 flex items-center gap-1 mt-1">
                      <TrendingUp className="h-3 w-3" />
                      -15% vs avg
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Budget Tracker */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Budget Tracker</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>Spent</span>
                        <span className="font-semibold">
                          {campaign?.spent} / {campaign?.budget}
                        </span>
                      </div>
                      <Progress value={campaign?.progress} className="h-2" />
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground mb-1">Spent</p>
                        <p className="font-semibold">{campaign?.spent}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground mb-1">Committed</p>
                        <p className="font-semibold">$4,500</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground mb-1">Remaining</p>
                        <p className="font-semibold text-green-600">$2,000</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* AI Highlights */}
              <Card className="border-primary/20 bg-primary/5">
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-primary" />
                    AI Insights
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex items-start gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <p>Your engagement grew 14% this week - great momentum!</p>
                  </div>
                  <div className="flex items-start gap-2 text-sm">
                    <AlertCircle className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                    <p>Story views dropped by 9% - consider reviewing @emma.davis content strategy</p>
                  </div>
                  <div className="flex items-start gap-2 text-sm">
                    <TrendingUp className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                    <p>Predicted final reach: 2.8M (+15% above target)</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Influencers Tab */}
            <TabsContent value="influencers" className="space-y-4 mt-4">
              <div className="space-y-3">
                <div className="flex flex-col sm:flex-row gap-2">
                  <Input
                    placeholder="Search influencers..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="flex-1"
                  />
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-full sm:w-[180px]">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="in-progress">In Progress</SelectItem>
                      <SelectItem value="delivered">Delivered</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={platformFilter} onValueChange={setPlatformFilter}>
                    <SelectTrigger className="w-full sm:w-[180px]">
                      <SelectValue placeholder="Platform" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Platforms</SelectItem>
                      <SelectItem value="instagram">Instagram</SelectItem>
                      <SelectItem value="youtube">YouTube</SelectItem>
                      <SelectItem value="tiktok">TikTok</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex flex-col sm:flex-row gap-2">
                  <Button
                    size="sm"
                    variant={comparisonMode ? "default" : "outline"}
                    onClick={() => {
                      setComparisonMode(!comparisonMode)
                      setSelectedForComparison([])
                    }}
                    className={comparisonMode ? "" : "bg-transparent"}
                  >
                    {comparisonMode ? "Exit Comparison Mode" : "Compare Performance"}
                  </Button>
                  {comparisonMode && selectedForComparison.length >= 2 && (
                    <Button size="sm" variant="outline" className="bg-transparent">
                      View Comparison ({selectedForComparison.length})
                    </Button>
                  )}
                  <Button size="sm" variant="outline" className="bg-transparent">
                    <Send className="h-4 w-4 mr-2" />
                    Bulk Message
                  </Button>
                  <Button size="sm" variant="outline" className="bg-transparent">
                    <Users className="h-4 w-4 mr-2" />
                    Invite More
                  </Button>
                  <Button size="sm" variant="outline" className="bg-transparent">
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                </div>
              </div>

              <div className="space-y-3">
                {filteredInfluencers.map((influencer) => (
                  <Card key={influencer.id}>
                    <CardContent className="p-4">
                      <div className="flex flex-col gap-4">
                        <div className="flex items-start gap-3">
                          {comparisonMode && (
                            <Checkbox
                              checked={selectedForComparison.includes(influencer.id)}
                              onCheckedChange={() => toggleComparisonSelection(influencer.id)}
                              className="mt-1"
                            />
                          )}
                          <Avatar className="h-10 w-10 flex-shrink-0">
                            <AvatarImage src={influencer.avatar || "/placeholder.svg"} />
                            <AvatarFallback>{influencer.name[0]}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-sm truncate">{influencer.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {influencer.platform} • {influencer.followers}
                            </p>
                          </div>
                          <Badge className={`${getStatusColor(influencer.status)} text-white text-xs flex-shrink-0`}>
                            {influencer.status}
                          </Badge>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-xs">
                          <div>
                            <p className="text-muted-foreground mb-1">Deliverables</p>
                            <p className="font-semibold">
                              {influencer.completed}/{influencer.deliverables}
                            </p>
                          </div>
                          <div>
                            <p className="text-muted-foreground mb-1">Reach</p>
                            <p className="font-semibold">{influencer.reach}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground mb-1">Engagement</p>
                            <p className="font-semibold text-green-600">{influencer.engagement}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground mb-1">CPE</p>
                            <p className="font-semibold">$0.82</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground mb-1">ROI</p>
                            <p className="font-semibold text-green-600">2.8x</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground mb-1">Payment</p>
                            <p className="font-semibold">{influencer.payment}</p>
                            <Progress value={influencer.paid} className="h-1 mt-1" />
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-xs h-8 bg-transparent"
                            onClick={() => handleViewInsights(influencer)}
                          >
                            <Eye className="h-3 w-3 mr-1" />
                            View Insights
                          </Button>
                          <Button size="sm" variant="outline" className="text-xs h-8 bg-transparent">
                            <Send className="h-3 w-3 mr-1" />
                            Message
                          </Button>
                          <Button size="sm" variant="outline" className="text-xs h-8 bg-transparent">
                            <Star className="h-3 w-3 mr-1" />
                            Add to Preferred
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {filteredInfluencers.length === 0 && (
                <Card>
                  <CardContent className="p-8 text-center">
                    <Users className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                    <p className="text-sm text-muted-foreground">No influencers found matching your filters</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Content Tab */}
            <TabsContent value="content" className="space-y-4 mt-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {content.map((item) => (
                  <Card key={item.id} className="overflow-hidden">
                    <div className="aspect-square bg-muted relative">
                      <img
                        src={item.thumbnail || "/placeholder.svg"}
                        alt={item.type}
                        className="w-full h-full object-cover"
                      />
                      <Badge className={`absolute top-2 right-2 ${getStatusColor(item.status)} text-white text-xs`}>
                        {item.status}
                      </Badge>
                    </div>
                    <CardContent className="p-4">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <p className="font-semibold text-sm">{item.creator}</p>
                          <Badge variant="outline" className="text-xs">
                            {item.type}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">Submitted: {item.submittedDate}</p>
                        {item.status === "approved" && (
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <div>
                              <p className="text-muted-foreground">Reach</p>
                              <p className="font-semibold">{item.reach}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Engagement</p>
                              <p className="font-semibold text-green-600">{item.engagement}</p>
                            </div>
                          </div>
                        )}
                        {item.status === "submitted" && (
                          <div className="flex gap-2 mt-2">
                            <Button size="sm" className="flex-1 h-8 text-xs">
                              <Check className="h-3 w-3 mr-1" />
                              Approve
                            </Button>
                            <Button size="sm" variant="outline" className="flex-1 h-8 text-xs bg-transparent">
                              <X className="h-3 w-3 mr-1" />
                              Reject
                            </Button>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Analytics Tab */}
            <TabsContent value="analytics" className="space-y-4 mt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Performance Over Time</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <LineChart data={performanceData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="reach" stroke="#3b82f6" strokeWidth={2} />
                      <Line type="monotone" dataKey="engagement" stroke="#10b981" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Platform Split</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={200}>
                      <PieChart>
                        <Pie
                          data={platformData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={(entry) => `${entry.name} ${entry.value}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {platformData.map((entry, index) => (
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
                    <CardTitle className="text-base">Top Performers</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {influencers.slice(0, 3).map((influencer, index) => (
                        <div key={influencer.id} className="flex items-center gap-3">
                          <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold">
                            {index + 1}
                          </div>
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={influencer.avatar || "/placeholder.svg"} />
                            <AvatarFallback>{influencer.name[0]}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold truncate">{influencer.name}</p>
                            <p className="text-xs text-muted-foreground">{influencer.reach} reach</p>
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {influencer.engagement}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Payments Tab */}
            <TabsContent value="payments" className="space-y-4 mt-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                <Card>
                  <CardContent className="p-4">
                    <p className="text-xs text-muted-foreground mb-1">Total Budget</p>
                    <p className="text-xl font-bold">{campaign?.budget}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <p className="text-xs text-muted-foreground mb-1">Paid Out</p>
                    <p className="text-xl font-bold">{campaign?.spent}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <p className="text-xs text-muted-foreground mb-1">Pending</p>
                    <p className="text-xl font-bold text-yellow-600">$4,500</p>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">Payment History</CardTitle>
                    <Button size="sm" variant="outline">
                      <Download className="h-4 w-4 mr-2" />
                      Export
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {influencers.map((influencer) => (
                      <div key={influencer.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={influencer.avatar || "/placeholder.svg"} />
                            <AvatarFallback>{influencer.name[0]}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-sm font-semibold">{influencer.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {influencer.completed}/{influencer.deliverables} deliverables completed
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold">{influencer.payment}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Progress value={influencer.paid} className="h-1 w-20" />
                            <span className="text-xs text-muted-foreground">{influencer.paid}%</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      {/* Influencer Insights Modal */}
      <InfluencerInsightsModal
        influencer={selectedInfluencer}
        open={insightsModalOpen}
        onOpenChange={setInsightsModalOpen}
      />
    </>
  )
}
