"use client"

import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { InfluencerSidebar } from "@/components/influencer-sidebar"
import { InfluencerHeader } from "@/components/influencer-header"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CollaborationDrawer } from "@/components/collaboration-drawer"
import {
  Calendar,
  DollarSign,
  MessageSquare,
  FileText,
  CheckCircle2,
  Clock,
  XCircle,
  Upload,
  Grid3x3,
  List,
  Target,
  TrendingUp,
  AlertCircle,
  Sparkles,
} from "lucide-react"

export default function CollaborationsPage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [selectedCollaboration, setSelectedCollaboration] = useState<any>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)

  useEffect(() => {
    if (!isLoading && (!user || user.role !== "creator")) {
      router.push("/auth/login")
    }
  }, [user, isLoading, router])

  if (isLoading || !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-blue-950 to-black flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    )
  }

  const collaborations = {
    active: [
      {
        id: "cmp_9485",
        brand: "Urbanic",
        brandLogo: "/urbanic-logo.jpg",
        verified: true,
        title: "Urbanic Festive Drop 2025",
        description:
          "Create engaging content showcasing our latest festive collection with your unique style and authentic voice",
        deliverables: ["1 Reel", "2 Stories", "1 YouTube Video"],
        paymentStatus: "pending",
        payout: 80000,
        contractStatus: "Signed",
        kpis: {
          targetImpressions: 50000,
          engagementTarget: "5%",
        },
        deadline: "2025-11-10",
        progress: 66,
        isPastDue: false,
        messages: 5,
        daysLeft: 8,
      },
      {
        id: "cmp_9486",
        brand: "Fitness First",
        brandLogo: "/fitness-logo.png",
        verified: true,
        title: "Workout Routine Series",
        description: "Share your daily workout routine for 7 days with our products",
        deliverables: ["7 Instagram Reels", "1 Blog Post"],
        paymentStatus: "partial",
        payout: 60000,
        contractStatus: "Signed",
        kpis: {
          targetImpressions: 35000,
          engagementTarget: "4.5%",
        },
        deadline: "2025-11-05",
        progress: 85,
        isPastDue: false,
        messages: 12,
        daysLeft: 3,
      },
      {
        id: "cmp_9487",
        brand: "TechGear Pro",
        brandLogo: "/abstract-tech-logo.png",
        verified: false,
        title: "Product Review Campaign",
        description: "Create detailed reviews of our latest smartwatch with unboxing and feature demos",
        deliverables: ["3 Instagram Posts", "2 Stories", "1 YouTube Review"],
        paymentStatus: "pending",
        payout: 45000,
        contractStatus: "Signed",
        kpis: {
          targetImpressions: 25000,
          engagementTarget: "6%",
        },
        deadline: "2025-10-28",
        progress: 33,
        isPastDue: true,
        messages: 3,
        daysLeft: -3,
      },
    ],
    pending: [
      {
        id: "cmp_9488",
        brand: "Fashion Hub",
        brandLogo: "/elegant-fashion-logo.png",
        verified: true,
        title: "Spring Collection Launch",
        description: "Showcase our new spring collection in your unique style",
        deliverables: ["5 Instagram Posts", "3 Stories", "1 Reel"],
        payout: 95000,
        deadline: "2025-11-20",
        status: "awaiting_approval",
      },
    ],
    completed: [
      {
        id: "cmp_9489",
        brand: "Beauty Co.",
        brandLogo: "/beauty-logo.png",
        verified: true,
        title: "Skincare Routine Campaign",
        payout: 55000,
        completedDate: "2025-01-25",
        rating: 5,
        paymentStatus: "paid",
      },
    ],
  }

  const handleCardClick = (collab: any) => {
    setSelectedCollaboration(collab)
    setDrawerOpen(true)
  }

  const getDaysLeftColor = (daysLeft: number) => {
    if (daysLeft < 0) return "text-red-400"
    if (daysLeft <= 3) return "text-orange-400"
    if (daysLeft <= 7) return "text-yellow-400"
    return "text-green-400"
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-blue-950 to-black">
      <InfluencerSidebar />

      <div className="lg:pl-64">
        <InfluencerHeader />

        <main className="p-3 sm:p-4 lg:p-6 space-y-4 lg:space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white">💼 Active Collaborations</h1>
              <p className="text-xs sm:text-sm text-gray-400 mt-1">
                Track your ongoing brand partnerships, payments, and tasks
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setViewMode("grid")}
                className={`border-white/20 ${viewMode === "grid" ? "bg-blue-600 text-white" : "bg-transparent text-gray-400"}`}
              >
                <Grid3x3 className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setViewMode("list")}
                className={`border-white/20 ${viewMode === "list" ? "bg-blue-600 text-white" : "bg-transparent text-gray-400"}`}
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <Tabs defaultValue="active" className="space-y-4 lg:space-y-6">
            <TabsList className="bg-[#1a1f35] border-white/10">
              <TabsTrigger value="active" className="data-[state=active]:bg-blue-600 text-xs sm:text-sm">
                Active ({collaborations.active.length})
              </TabsTrigger>
              <TabsTrigger value="pending" className="data-[state=active]:bg-blue-600 text-xs sm:text-sm">
                Pending ({collaborations.pending.length})
              </TabsTrigger>
              <TabsTrigger value="completed" className="data-[state=active]:bg-blue-600 text-xs sm:text-sm">
                Completed ({collaborations.completed.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent
              value="active"
              className={viewMode === "grid" ? "grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4" : "space-y-4"}
            >
              {collaborations.active.map((collab) => (
                <Card
                  key={collab.id}
                  className={`bg-[#0f1629]/50 border-white/10 p-4 lg:p-6 cursor-pointer transition-all hover:border-blue-500/50 hover:shadow-lg hover:shadow-blue-500/10 ${
                    collab.isPastDue ? "border-red-500/50" : ""
                  }`}
                  onClick={() => handleCardClick(collab)}
                >
                  <div className="space-y-4">
                    {/* Header */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        <div className="h-12 w-12 lg:h-14 lg:w-14 rounded-lg bg-white/10 flex items-center justify-center overflow-hidden flex-shrink-0">
                          <img
                            src={collab.brandLogo || "/placeholder.svg"}
                            alt={collab.brand}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-sm lg:text-base font-bold text-white truncate">{collab.brand}</h3>
                            {collab.verified && (
                              <CheckCircle2 className="w-3 h-3 lg:w-4 lg:h-4 text-blue-400 flex-shrink-0" />
                            )}
                          </div>
                          <p className="text-xs lg:text-sm text-gray-400 line-clamp-1">{collab.title}</p>
                          <p className="text-xs text-gray-500 mt-1 line-clamp-2">{collab.description}</p>
                        </div>
                      </div>
                      <Badge
                        className={`flex-shrink-0 text-xs ${
                          collab.paymentStatus === "paid"
                            ? "bg-green-500/20 text-green-400"
                            : collab.paymentStatus === "partial"
                              ? "bg-yellow-500/20 text-yellow-400"
                              : collab.paymentStatus === "pending"
                                ? "bg-orange-500/20 text-orange-400"
                                : "bg-red-500/20 text-red-400"
                        }`}
                      >
                        {collab.paymentStatus === "paid" && "🟢"}
                        {collab.paymentStatus === "partial" && "🟠"}
                        {collab.paymentStatus === "pending" && "🔴"}
                        {collab.paymentStatus === "disputed" && "⚠️"}
                      </Badge>
                    </div>

                    {/* Deliverables Summary */}
                    <div className="flex flex-wrap gap-1.5">
                      {collab.deliverables.map((item: string, index: number) => (
                        <Badge key={index} variant="outline" className="border-white/20 text-gray-300 text-xs">
                          <FileText className="w-3 h-3 mr-1" />
                          {item}
                        </Badge>
                      ))}
                    </div>

                    {/* KPIs */}
                    <div className="grid grid-cols-2 gap-2">
                      <div className="bg-[#1a1f35] rounded-lg p-2 lg:p-3">
                        <div className="flex items-center gap-1 text-gray-400 mb-1">
                          <Target className="w-3 h-3" />
                          <span className="text-xs">Impressions</span>
                        </div>
                        <p className="text-sm lg:text-base font-bold text-white">
                          {collab.kpis.targetImpressions.toLocaleString()}
                        </p>
                      </div>
                      <div className="bg-[#1a1f35] rounded-lg p-2 lg:p-3">
                        <div className="flex items-center gap-1 text-gray-400 mb-1">
                          <TrendingUp className="w-3 h-3" />
                          <span className="text-xs">Engagement</span>
                        </div>
                        <p className="text-sm lg:text-base font-bold text-white">{collab.kpis.engagementTarget}</p>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div>
                      <div className="flex items-center justify-between text-xs mb-2">
                        <span className="text-gray-400">Progress</span>
                        <div className="flex items-center gap-2">
                          <span className="text-white font-medium">{collab.progress}%</span>
                          <Badge
                            className={`${getDaysLeftColor(collab.daysLeft)} bg-transparent border-current text-xs`}
                          >
                            {collab.isPastDue ? (
                              <>
                                <AlertCircle className="w-3 h-3 mr-1" />
                                {Math.abs(collab.daysLeft)}d overdue
                              </>
                            ) : (
                              <>
                                <Clock className="w-3 h-3 mr-1" />
                                {collab.daysLeft}d left
                              </>
                            )}
                          </Badge>
                        </div>
                      </div>
                      <div className="h-2 bg-[#252b45] rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full transition-all duration-500"
                          style={{ width: `${collab.progress}%` }}
                        />
                      </div>
                    </div>

                    {/* Payment & Deadline */}
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div className="flex items-center gap-2 text-gray-300">
                        <DollarSign className="w-4 h-4 text-green-500 flex-shrink-0" />
                        <span className="truncate">₹{collab.payout.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-300">
                        <Calendar className="w-4 h-4 text-blue-500 flex-shrink-0" />
                        <span className="truncate">{collab.deadline}</span>
                      </div>
                    </div>

                    {/* AI Insight */}
                    <div className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/20 rounded-lg p-2 lg:p-3">
                      <div className="flex items-start gap-2">
                        <Sparkles className="w-4 h-4 text-purple-400 mt-0.5 flex-shrink-0" />
                        <p className="text-xs text-gray-300">
                          {collab.deliverables.length - Math.floor(collab.progress / 33)} deliverables pending.
                          {collab.isPastDue
                            ? " Action required - past deadline!"
                            : ` Next due in ${collab.daysLeft} days.`}
                        </p>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        size="sm"
                        className="bg-blue-600 hover:bg-blue-700 text-xs"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleCardClick(collab)
                        }}
                      >
                        <Upload className="w-3 h-3 mr-1" />
                        Upload
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-white/20 text-white hover:bg-white/10 bg-transparent text-xs"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleCardClick(collab)
                        }}
                      >
                        <MessageSquare className="w-3 h-3 mr-1" />
                        Message
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </TabsContent>

            <TabsContent value="pending" className="space-y-4">
              {collaborations.pending.map((collab) => (
                <Card key={collab.id} className="bg-[#0f1629]/50 border-white/10 p-4 lg:p-6">
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4">
                        <div className="h-12 w-12 lg:h-16 lg:w-16 rounded-lg bg-white/10 flex items-center justify-center overflow-hidden">
                          <img
                            src={collab.brandLogo || "/placeholder.svg"}
                            alt={collab.brand}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div>
                          <h3 className="text-base lg:text-xl font-bold text-white">{collab.title}</h3>
                          <p className="text-xs lg:text-sm text-gray-400">{collab.brand}</p>
                          <p className="text-xs lg:text-sm text-gray-300 mt-2">{collab.description}</p>
                        </div>
                      </div>
                      <Badge className="bg-yellow-500/20 text-yellow-500 text-xs">
                        <Clock className="w-3 h-3 mr-1" />
                        Pending
                      </Badge>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-center gap-2 text-gray-300 text-xs lg:text-sm">
                        <DollarSign className="w-4 h-4 text-green-500" />
                        <span>₹{collab.payout.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-300 text-xs lg:text-sm">
                        <Calendar className="w-4 h-4 text-blue-500" />
                        <span>Deadline: {collab.deadline}</span>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-xs lg:text-sm font-medium text-white mb-2">Deliverables</h4>
                      <div className="flex flex-wrap gap-2">
                        {collab.deliverables.map((item: string, index: number) => (
                          <Badge key={index} variant="outline" className="border-white/20 text-gray-300 text-xs">
                            {item}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button className="bg-green-600 hover:bg-green-700 text-xs lg:text-sm">
                        <CheckCircle2 className="w-4 h-4 mr-2" />
                        Accept
                      </Button>
                      <Button
                        variant="outline"
                        className="border-red-500/50 text-red-500 hover:bg-red-500/10 bg-transparent text-xs lg:text-sm"
                      >
                        <XCircle className="w-4 h-4 mr-2" />
                        Decline
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </TabsContent>

            <TabsContent value="completed" className="space-y-4">
              {collaborations.completed.map((collab) => (
                <Card key={collab.id} className="bg-[#0f1629]/50 border-white/10 p-4 lg:p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 lg:h-16 lg:w-16 rounded-lg bg-white/10 flex items-center justify-center overflow-hidden">
                        <img
                          src={collab.brandLogo || "/placeholder.svg"}
                          alt={collab.brand}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <h3 className="text-base lg:text-lg font-bold text-white">{collab.title}</h3>
                        <p className="text-xs lg:text-sm text-gray-400">{collab.brand}</p>
                        <div className="flex items-center gap-4 mt-2 text-xs lg:text-sm">
                          <span className="text-gray-300">₹{collab.payout.toLocaleString()}</span>
                          <span className="text-gray-400">Completed: {collab.completedDate}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge className="bg-green-500/20 text-green-500 mb-2 text-xs">
                        <CheckCircle2 className="w-3 h-3 mr-1" />
                        Paid
                      </Badge>
                      <div className="flex items-center gap-1">
                        {[...Array(collab.rating)].map((_, i) => (
                          <span key={i} className="text-yellow-500 text-sm">
                            ★
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </TabsContent>
          </Tabs>
        </main>
      </div>

      {/* Collaboration Drawer */}
      {selectedCollaboration && (
        <CollaborationDrawer collaboration={selectedCollaboration} open={drawerOpen} onOpenChange={setDrawerOpen} />
      )}
    </div>
  )
}
