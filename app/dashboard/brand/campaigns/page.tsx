"use client"

import { useState } from "react"
import { BrandSidebar } from "@/components/brand-sidebar"
import { BrandHeader } from "@/components/brand-header"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import {
  Plus,
  Calendar,
  DollarSign,
  Users,
  TrendingUp,
  MoreVertical,
  Eye,
  Edit,
  Trash2,
  Play,
  Pause,
  Search,
  ArrowUpDown,
  Sparkles,
  ImageIcon,
} from "lucide-react"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu"
import { CampaignDetailModal } from "@/components/campaign-detail-modal"
import { CreateCampaignWizard } from "@/components/create-campaign-wizard"

export default function CampaignsPage() {
  const [activeTab, setActiveTab] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCampaign, setSelectedCampaign] = useState<any>(null)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [showCreateWizard, setShowCreateWizard] = useState(false)

  const campaigns = [
    {
      id: 1,
      title: "Summer Fashion Collection 2024",
      status: "active",
      platform: "Instagram",
      budget: "$25,000",
      spent: "$18,500",
      progress: 74,
      influencers: 12,
      reach: "2.4M",
      engagement: "4.8%",
      startDate: "2024-01-15",
      endDate: "2024-03-15",
      posts: 45,
      completedPosts: 38,
      thumbnail: "/summer-fashion.png",
      deliverables: "5 Reels • 10 Stories • 2 Posts",
      aiInsight: "Great engagement on Stories - 12% above average",
      trend: "+8%",
    },
    {
      id: 2,
      title: "Tech Product Launch",
      status: "active",
      platform: "YouTube",
      budget: "$50,000",
      spent: "$32,000",
      progress: 64,
      influencers: 8,
      reach: "5.2M",
      engagement: "6.2%",
      startDate: "2024-02-01",
      endDate: "2024-04-01",
      posts: 24,
      completedPosts: 16,
      thumbnail: "/modern-tech-product.png",
      deliverables: "8 Videos • 4 Shorts",
      aiInsight: "Top performer: @techguru with 1.8x ROI",
      trend: "+15%",
    },
    {
      id: 3,
      title: "Fitness Challenge Campaign",
      status: "pending",
      platform: "Instagram",
      budget: "$15,000",
      spent: "$0",
      progress: 0,
      influencers: 6,
      reach: "0",
      engagement: "0%",
      startDate: "2024-03-01",
      endDate: "2024-04-30",
      posts: 30,
      completedPosts: 0,
      thumbnail: "/fitness-challenge-group.png",
      deliverables: "15 Reels • 15 Stories",
      aiInsight: "Awaiting influencer acceptance",
      trend: "0%",
    },
    {
      id: 4,
      title: "Holiday Gift Guide",
      status: "completed",
      platform: "Multi-platform",
      budget: "$35,000",
      spent: "$34,200",
      progress: 100,
      influencers: 15,
      reach: "3.8M",
      engagement: "5.4%",
      startDate: "2023-11-01",
      endDate: "2023-12-31",
      posts: 60,
      completedPosts: 60,
      thumbnail: "/holiday-gifts.jpg",
      deliverables: "20 Reels • 30 Stories • 10 Posts",
      aiInsight: "Campaign exceeded ROI target by 23%",
      trend: "+23%",
    },
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-500"
      case "pending":
        return "bg-yellow-500"
      case "completed":
        return "bg-blue-500"
      case "paused":
        return "bg-gray-500"
      default:
        return "bg-gray-500"
    }
  }

  const filteredCampaigns = campaigns.filter((campaign) => {
    const matchesTab = activeTab === "all" || campaign.status === activeTab
    const matchesSearch = campaign.title.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesTab && matchesSearch
  })

  const handleViewDetails = (campaign: any) => {
    setSelectedCampaign(campaign)
    setShowDetailModal(true)
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <BrandSidebar />

      <div className="flex-1 flex flex-col overflow-hidden lg:pl-64">
        <BrandHeader />

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {/* Header */}
          <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2">Campaigns</h1>
              <p className="text-sm sm:text-base text-muted-foreground">
                Manage and track your influencer marketing campaigns
              </p>
            </div>
            <Button className="w-full sm:w-auto" onClick={() => setShowCreateWizard(true)}>
              <Plus className="h-4 w-4 mr-2" />
              New Campaign
            </Button>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
            <Card>
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs sm:text-sm text-muted-foreground">Active Campaigns</p>
                  <Play className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
                </div>
                <p className="text-2xl sm:text-3xl font-bold">
                  {campaigns.filter((c) => c.status === "active").length}
                </p>
                <p className="text-xs text-green-600 flex items-center gap-1 mt-1">
                  <TrendingUp className="h-3 w-3" />
                  +2 this month
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs sm:text-sm text-muted-foreground">Total Budget</p>
                  <DollarSign className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
                </div>
                <p className="text-2xl sm:text-3xl font-bold">$125K</p>
                <p className="text-xs text-muted-foreground mt-1">$84.7K spent</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs sm:text-sm text-muted-foreground">Total Reach</p>
                  <Users className="h-4 w-4 sm:h-5 sm:w-5 text-purple-600" />
                </div>
                <p className="text-2xl sm:text-3xl font-bold">11.4M</p>
                <p className="text-xs text-green-600 flex items-center gap-1 mt-1">
                  <TrendingUp className="h-3 w-3" />
                  +18% vs last month
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs sm:text-sm text-muted-foreground">Avg Engagement</p>
                  <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
                </div>
                <p className="text-2xl sm:text-3xl font-bold">5.6%</p>
                <p className="text-xs text-green-600 flex items-center gap-1 mt-1">
                  <TrendingUp className="h-3 w-3" />
                  +0.8% vs avg
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search campaigns..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="w-full sm:w-auto bg-transparent">
                  <ArrowUpDown className="h-4 w-4 mr-2" />
                  Sort
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Sort by</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Last Updated</DropdownMenuItem>
                <DropdownMenuItem>Start Date</DropdownMenuItem>
                <DropdownMenuItem>Budget (High to Low)</DropdownMenuItem>
                <DropdownMenuItem>Reach (High to Low)</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
            <TabsList className="grid w-full grid-cols-4 h-auto">
              <TabsTrigger value="all" className="text-xs sm:text-sm py-2">
                All ({campaigns.length})
              </TabsTrigger>
              <TabsTrigger value="active" className="text-xs sm:text-sm py-2">
                Active ({campaigns.filter((c) => c.status === "active").length})
              </TabsTrigger>
              <TabsTrigger value="pending" className="text-xs sm:text-sm py-2">
                Pending ({campaigns.filter((c) => c.status === "pending").length})
              </TabsTrigger>
              <TabsTrigger value="completed" className="text-xs sm:text-sm py-2">
                Completed ({campaigns.filter((c) => c.status === "completed").length})
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="space-y-4 sm:space-y-6">
            {filteredCampaigns.map((campaign) => (
              <Card key={campaign.id} className="hover:shadow-lg transition-shadow overflow-hidden group">
                <CardContent className="p-0">
                  <div className="flex flex-col lg:flex-row">
                    {/* Thumbnail */}
                    <div className="lg:w-64 h-48 lg:h-auto bg-muted relative overflow-hidden flex-shrink-0">
                      <img
                        src={campaign.thumbnail || "/placeholder.svg"}
                        alt={campaign.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <Badge className={`absolute top-3 right-3 ${getStatusColor(campaign.status)} text-white text-xs`}>
                        {campaign.status}
                      </Badge>
                    </div>

                    {/* Content */}
                    <div className="flex-1 p-4 sm:p-6">
                      <div className="flex items-start justify-between gap-4 mb-3">
                        <div className="flex-1 min-w-0">
                          <h3 className="text-base sm:text-lg lg:text-xl font-semibold mb-2 truncate">
                            {campaign.title}
                          </h3>
                          <div className="flex flex-wrap gap-3 text-xs sm:text-sm text-muted-foreground mb-2">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3 sm:h-4 sm:w-4" />
                              {campaign.startDate} - {campaign.endDate}
                            </span>
                            <span>•</span>
                            <span>{campaign.platform}</span>
                          </div>
                          <p className="text-xs sm:text-sm text-muted-foreground mb-3">{campaign.deliverables}</p>
                          <div className="flex items-center gap-2 p-2 bg-primary/5 border border-primary/20 rounded-lg">
                            <Sparkles className="h-3 w-3 text-primary flex-shrink-0" />
                            <p className="text-xs text-muted-foreground">{campaign.aiInsight}</p>
                          </div>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleViewDetails(campaign)}>
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit Campaign
                            </DropdownMenuItem>
                            {campaign.status === "active" && (
                              <DropdownMenuItem>
                                <Pause className="h-4 w-4 mr-2" />
                                Pause Campaign
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-red-600">
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete Campaign
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>

                      {/* Progress */}
                      <div className="mb-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs sm:text-sm text-muted-foreground">Campaign Progress</span>
                          <span className="text-xs sm:text-sm font-semibold">{campaign.progress}%</span>
                        </div>
                        <Progress value={campaign.progress} className="h-2" />
                        <div className="flex items-center justify-between mt-1 text-xs text-muted-foreground">
                          <span>
                            {campaign.completedPosts}/{campaign.posts} posts completed
                          </span>
                        </div>
                      </div>

                      {/* Stats Grid */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-4">
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Budget</p>
                          <p className="text-sm sm:text-base font-semibold">{campaign.budget}</p>
                          <p className="text-xs text-muted-foreground">Spent: {campaign.spent}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Influencers</p>
                          <p className="text-sm sm:text-base font-semibold">{campaign.influencers}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Reach</p>
                          <p className="text-sm sm:text-base font-semibold">{campaign.reach}</p>
                          <p className="text-xs text-green-600">{campaign.trend}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Engagement</p>
                          <p className="text-sm sm:text-base font-semibold text-green-600">{campaign.engagement}</p>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 text-xs sm:text-sm bg-transparent"
                          onClick={() => handleViewDetails(campaign)}
                        >
                          <Eye className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                          View Analytics
                        </Button>
                        <Button size="sm" className="flex-1 text-xs sm:text-sm">
                          Manage
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredCampaigns.length === 0 && (
            <Card>
              <CardContent className="p-12 text-center">
                <ImageIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-sm sm:text-base text-muted-foreground mb-4">
                  {searchQuery ? "No campaigns match your search" : "No campaigns found in this category"}
                </p>
                <Button onClick={() => setShowCreateWizard(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Campaign
                </Button>
              </CardContent>
            </Card>
          )}
        </main>
      </div>

      {/* Modals */}
      <CampaignDetailModal campaign={selectedCampaign} open={showDetailModal} onOpenChange={setShowDetailModal} />
      <CreateCampaignWizard open={showCreateWizard} onOpenChange={setShowCreateWizard} />
    </div>
  )
}
