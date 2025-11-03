"use client"
import { BrandSidebar } from "@/components/brand-sidebar"
import { BrandHeader } from "@/components/brand-header"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Heart,
  Mail,
  MoreVertical,
  Trash2,
  Users,
  TrendingUp,
  MapPin,
  Instagram,
  Youtube,
  Twitter,
  Plus,
  Search,
  Filter,
  Download,
  Star,
  Sparkles,
  MessageSquare,
  UserPlus,
  X,
} from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { useState } from "react"
import { Checkbox } from "@/components/ui/checkbox"

export default function ShortlistsPage() {
  const [activeTab, setActiveTab] = useState("all")
  const [selectedInfluencers, setSelectedInfluencers] = useState<number[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [notesDrawerOpen, setNotesDrawerOpen] = useState(false)
  const [selectedInfluencer, setSelectedInfluencer] = useState<any>(null)

  const shortlistedInfluencers = [
    {
      id: 1,
      name: "Sarah Johnson",
      username: "@sarahjohnson",
      avatar: "/diverse-woman-portrait.png",
      niche: "Fashion & Lifestyle",
      location: "New York, USA",
      followers: "245K",
      engagement: "4.8%",
      platforms: ["instagram", "youtube"],
      addedDate: "2024-01-15",
      starred: true,
      campaign: "Summer Fashion",
      notes: "Responded quickly, great content quality",
      rating: 5,
      estimatedCost: "₹15K-25K",
      tags: ["Fashion", "Tier-1 Audience", "High ROI"],
    },
    {
      id: 2,
      name: "Mike Chen",
      username: "@mikechen",
      avatar: "/man.jpg",
      niche: "Tech & Gaming",
      location: "San Francisco, USA",
      followers: "580K",
      engagement: "5.2%",
      platforms: ["youtube", "twitter"],
      addedDate: "2024-01-18",
      starred: false,
      campaign: "Tech Launch",
      notes: "",
      rating: 4,
      estimatedCost: "₹35K-50K",
      tags: ["Tech", "Gaming", "High Engagement"],
    },
    {
      id: 3,
      name: "Emma Davis",
      username: "@emmadavis",
      avatar: "/woman-fitness.png",
      niche: "Fitness & Wellness",
      location: "Los Angeles, USA",
      followers: "420K",
      engagement: "6.1%",
      platforms: ["instagram", "youtube"],
      addedDate: "2024-01-20",
      starred: true,
      campaign: "Fitness Challenge",
      notes: "Perfect fit for wellness campaigns",
      rating: 5,
      estimatedCost: "₹20K-35K",
      tags: ["Fitness", "Wellness", "Authentic"],
    },
  ]

  const smartClusters = [
    {
      name: "Lifestyle & Aesthetic",
      count: 6,
      avgER: "4.8%",
      estimatedReach: "1.2M",
      influencers: ["@sarahjohnson", "@emmadavis", "@fashionista"],
    },
    {
      name: "Food & Travel Vloggers",
      count: 3,
      avgER: "5.2%",
      estimatedReach: "850K",
      influencers: ["@foodiefit", "@travelvibes"],
    },
  ]

  const filteredInfluencers = shortlistedInfluencers.filter((inf) => {
    if (activeTab === "starred" && !inf.starred) return false
    if (activeTab === "archived") return false
    if (
      searchQuery &&
      !inf.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !inf.username.toLowerCase().includes(searchQuery.toLowerCase())
    )
      return false
    return true
  })

  const toggleSelection = (id: number) => {
    setSelectedInfluencers((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]))
  }

  const openNotesDrawer = (influencer: any) => {
    setSelectedInfluencer(influencer)
    setNotesDrawerOpen(true)
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
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2">Shortlisted Influencers</h1>
              <p className="text-sm sm:text-base text-muted-foreground">Your saved influencers ready for campaigns</p>
            </div>
            <Button className="w-full sm:w-auto">
              <Plus className="h-4 w-4 mr-2" />
              Find More Influencers
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
            <Card>
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs sm:text-sm text-muted-foreground">Total Shortlisted</p>
                  <Heart className="h-4 w-4 sm:h-5 sm:w-5 text-red-500" />
                </div>
                <p className="text-2xl sm:text-3xl font-bold">{shortlistedInfluencers.length}</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs sm:text-sm text-muted-foreground">Combined Reach</p>
                  <Users className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
                </div>
                <p className="text-2xl sm:text-3xl font-bold">1.2M</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs sm:text-sm text-muted-foreground">Avg Engagement</p>
                  <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
                </div>
                <p className="text-2xl sm:text-3xl font-bold">5.4%</p>
              </CardContent>
            </Card>
          </div>

          <Card className="mb-6 sm:mb-8 bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-primary/20">
                  <Sparkles className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-sm sm:text-base mb-2">AI Suggestions</h3>
                  <div className="space-y-2 text-xs sm:text-sm text-muted-foreground">
                    <p>• You've shortlisted 4 similar creators — consider merging into one campaign group.</p>
                    <p>• Based on this shortlist, estimated reach: 1.8M, avg ER: 4.3%.</p>
                    <p>• @sarahjohnson and @emmadavis have 35% audience overlap — diversify for broader reach.</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
            <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-grid">
              <TabsTrigger value="all" className="text-xs sm:text-sm">
                All Shortlisted
              </TabsTrigger>
              <TabsTrigger value="campaign" className="text-xs sm:text-sm">
                By Campaign
              </TabsTrigger>
              <TabsTrigger value="starred" className="text-xs sm:text-sm">
                Starred
              </TabsTrigger>
              <TabsTrigger value="archived" className="text-xs sm:text-sm">
                Archived
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="mb-6 flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, niche, or platform..."
                className="pl-10 bg-transparent"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Select defaultValue="recent">
                <SelectTrigger className="w-[140px] text-xs sm:text-sm bg-transparent">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="recent">Recently Added</SelectItem>
                  <SelectItem value="er">Highest ER</SelectItem>
                  <SelectItem value="cost">Lowest Cost</SelectItem>
                  <SelectItem value="reach">Highest Reach</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="icon" className="bg-transparent">
                <Filter className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {selectedInfluencers.length > 0 && (
            <Card className="mb-6 bg-primary/10 border-primary/20">
              <CardContent className="p-4 flex items-center justify-between">
                <p className="text-sm font-medium">
                  {selectedInfluencers.length} influencer{selectedInfluencers.length > 1 ? "s" : ""} selected
                </p>
                <div className="flex gap-2">
                  <Button size="sm" className="text-xs">
                    <UserPlus className="h-3 w-3 mr-2" />
                    Invite to Campaign
                  </Button>
                  <Button size="sm" variant="outline" className="text-xs bg-transparent">
                    <Download className="h-3 w-3 mr-2" />
                    Export CSV
                  </Button>
                  <Button size="sm" variant="outline" className="text-xs text-red-600 bg-transparent">
                    <Trash2 className="h-3 w-3 mr-2" />
                    Remove
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="mb-6 sm:mb-8">
            <h2 className="text-lg sm:text-xl font-semibold mb-4">Smart Clusters</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {smartClusters.map((cluster, idx) => (
                <Card key={idx} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-4 sm:p-6">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-semibold text-sm sm:text-base mb-1">{cluster.name}</h3>
                        <p className="text-xs text-muted-foreground">{cluster.count} influencers</p>
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        AI Grouped
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-3 mb-3">
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Avg ER</p>
                        <p className="text-sm font-semibold text-green-600">{cluster.avgER}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Est. Reach</p>
                        <p className="text-sm font-semibold">{cluster.estimatedReach}</p>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1 mb-3">
                      {cluster.influencers.map((username, i) => (
                        <Badge key={i} variant="outline" className="text-xs">
                          {username}
                        </Badge>
                      ))}
                    </div>
                    <Button size="sm" className="w-full text-xs">
                      Invite All to Campaign
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <div>
            <h2 className="text-lg sm:text-xl font-semibold mb-4">All Influencers</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {filteredInfluencers.map((influencer) => (
                <Card key={influencer.id} className="hover:shadow-lg transition-shadow relative">
                  <CardContent className="p-4 sm:p-6">
                    <div className="absolute top-4 left-4 z-10">
                      <Checkbox
                        checked={selectedInfluencers.includes(influencer.id)}
                        onCheckedChange={() => toggleSelection(influencer.id)}
                      />
                    </div>

                    {influencer.starred && (
                      <div className="absolute top-4 right-4">
                        <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                      </div>
                    )}

                    <div className="flex items-start justify-between mb-4 mt-6">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-12 w-12 sm:h-14 sm:w-14">
                          <AvatarImage src={influencer.avatar || "/placeholder.svg"} />
                          <AvatarFallback>{influencer.name[0]}</AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <h3 className="font-semibold text-sm sm:text-base truncate">{influencer.name}</h3>
                          <p className="text-xs sm:text-sm text-muted-foreground truncate">{influencer.username}</p>
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openNotesDrawer(influencer)}>
                            <MessageSquare className="h-4 w-4 mr-2" />
                            Add Notes
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Mail className="h-4 w-4 mr-2" />
                            Send Message
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-red-600">
                            <Trash2 className="h-4 w-4 mr-2" />
                            Remove from Shortlist
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    <div className="flex flex-wrap gap-1 mb-3">
                      {influencer.tags.map((tag, i) => (
                        <Badge key={i} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>

                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-1 text-xs sm:text-sm text-muted-foreground">
                        <MapPin className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                        <span className="truncate">{influencer.location}</span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs sm:text-sm">
                        <div>
                          <p className="text-muted-foreground mb-1">Followers</p>
                          <p className="font-semibold">{influencer.followers}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground mb-1">Engagement</p>
                          <p className="font-semibold text-green-600">{influencer.engagement}</p>
                        </div>
                      </div>

                      <div>
                        <p className="text-muted-foreground text-xs mb-1">Est. Cost</p>
                        <p className="font-semibold text-xs sm:text-sm">{influencer.estimatedCost}</p>
                      </div>

                      <div className="flex gap-2 pt-2">
                        {influencer.platforms.includes("instagram") && (
                          <Instagram className="h-4 w-4 sm:h-5 sm:w-5 text-pink-600" />
                        )}
                        {influencer.platforms.includes("youtube") && (
                          <Youtube className="h-4 w-4 sm:h-5 sm:w-5 text-red-600" />
                        )}
                        {influencer.platforms.includes("twitter") && (
                          <Twitter className="h-4 w-4 sm:h-5 sm:w-5 text-blue-500" />
                        )}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button size="sm" className="flex-1 text-xs sm:text-sm h-8 sm:h-9">
                        Invite to Campaign
                      </Button>
                      <Button size="sm" variant="outline" className="text-xs sm:text-sm h-8 sm:h-9 bg-transparent">
                        <Mail className="h-3 w-3 sm:h-4 sm:w-4" />
                      </Button>
                    </div>

                    <p className="text-xs text-muted-foreground mt-3 text-center">Added {influencer.addedDate}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {filteredInfluencers.length === 0 && (
            <Card>
              <CardContent className="p-12 text-center">
                <Heart className="h-12 w-12 sm:h-16 sm:w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-base sm:text-lg font-semibold mb-2">No influencers found</h3>
                <p className="text-xs sm:text-sm text-muted-foreground mb-4">Try adjusting your search or filters</p>
                <Button onClick={() => setSearchQuery("")}>
                  <X className="h-4 w-4 mr-2" />
                  Clear Search
                </Button>
              </CardContent>
            </Card>
          )}
        </main>
      </div>

      <Sheet open={notesDrawerOpen} onOpenChange={setNotesDrawerOpen}>
        <SheetContent className="w-full sm:max-w-md overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Notes & Collaboration</SheetTitle>
          </SheetHeader>
          {selectedInfluencer && (
            <div className="mt-6 space-y-6">
              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={selectedInfluencer.avatar || "/placeholder.svg"} />
                  <AvatarFallback>{selectedInfluencer.name[0]}</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold">{selectedInfluencer.name}</h3>
                  <p className="text-sm text-muted-foreground">{selectedInfluencer.username}</p>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Personal Notes</label>
                <Textarea
                  placeholder="Add notes about this influencer..."
                  defaultValue={selectedInfluencer.notes}
                  rows={4}
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Internal Rating</label>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`h-6 w-6 cursor-pointer ${star <= selectedInfluencer.rating ? "fill-yellow-500 text-yellow-500" : "text-gray-300"}`}
                    />
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Tag Teammates</label>
                <Input placeholder="@teammate" />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Activity History</label>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <p>• Invited for campaign on Sep 12, 2024</p>
                  <p>• Added to shortlist on {selectedInfluencer.addedDate}</p>
                </div>
              </div>

              <Button className="w-full">Save Notes</Button>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  )
}
