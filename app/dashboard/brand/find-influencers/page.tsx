"use client"

import { useState } from "react"
import { BrandSidebar } from "@/components/brand-sidebar"
import { BrandHeader } from "@/components/brand-header"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Search,
  SlidersHorizontal,
  Grid3x3,
  List,
  MapPin,
  Users,
  TrendingUp,
  Heart,
  Instagram,
  Youtube,
  Twitter,
  Star,
  CheckCircle2,
  Sparkles,
} from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts"

export default function FindInfluencersPage() {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [selectedInfluencer, setSelectedInfluencer] = useState<any>(null)
  const [showFilters, setShowFilters] = useState(false)
  const [shortlistedIds, setShortlistedIds] = useState<number[]>([])

  const toggleShortlist = (id: number) => {
    setShortlistedIds((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]))
  }

  const influencers = [
    {
      id: 1,
      name: "Sarah Johnson",
      username: "@sarahjohnson",
      avatar: "/diverse-woman-portrait.png",
      niche: "Fashion & Lifestyle",
      location: "New York, USA",
      followers: "245K",
      engagement: "4.8%",
      avgViews: "125K",
      platforms: ["instagram", "youtube", "twitter"],
      verified: true,
      rating: 4.9,
      campaigns: 45,
      price: "$2,500 - $5,000",
      bio: "Fashion influencer & content creator. Specializing in sustainable fashion and lifestyle content.",
      aiMatchScore: 92,
      aiInsights: ["Great engagement on Stories", "High audience loyalty", "Trending in Fashion"],
      authenticityScore: 95,
      recentPosts: [
        { views: "145K", likes: "12.5K", comments: "890" },
        { views: "132K", likes: "11.2K", comments: "756" },
        { views: "158K", likes: "13.8K", comments: "923" },
      ],
      audienceDemographics: {
        gender: [
          { name: "Female", value: 68, color: "#ec4899" },
          { name: "Male", value: 30, color: "#3b82f6" },
          { name: "Other", value: 2, color: "#8b5cf6" },
        ],
        ageGroups: [
          { age: "18-24", value: 35 },
          { age: "25-34", value: 45 },
          { age: "35-44", value: 15 },
          { age: "45+", value: 5 },
        ],
        topLocations: ["New York 32%", "Los Angeles 18%", "Chicago 12%", "Miami 10%"],
      },
      growthTrend: [
        { month: "Sep", followers: 210 },
        { month: "Oct", followers: 220 },
        { month: "Nov", followers: 230 },
        { month: "Dec", followers: 238 },
        { month: "Jan", followers: 245 },
      ],
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
      avgViews: "320K",
      platforms: ["youtube", "twitter"],
      verified: true,
      rating: 4.8,
      campaigns: 67,
      price: "$5,000 - $10,000",
      bio: "Tech reviewer and gaming enthusiast. Creating honest reviews and gaming content.",
      aiMatchScore: 88,
      aiInsights: ["High video completion rate", "Tech-savvy audience", "Strong YouTube presence"],
      authenticityScore: 92,
      recentPosts: [
        { views: "345K", likes: "28.5K", comments: "1.2K" },
        { views: "312K", likes: "25.2K", comments: "1.1K" },
        { views: "398K", likes: "32.8K", comments: "1.5K" },
      ],
      audienceDemographics: {
        gender: [
          { name: "Male", value: 72, color: "#3b82f6" },
          { name: "Female", value: 26, color: "#ec4899" },
          { name: "Other", value: 2, color: "#8b5cf6" },
        ],
        ageGroups: [
          { age: "18-24", value: 42 },
          { age: "25-34", value: 38 },
          { age: "35-44", value: 15 },
          { age: "45+", value: 5 },
        ],
        topLocations: ["San Francisco 28%", "Seattle 15%", "Austin 12%", "Boston 10%"],
      },
      growthTrend: [
        { month: "Sep", followers: 520 },
        { month: "Oct", followers: 540 },
        { month: "Nov", followers: 555 },
        { month: "Dec", followers: 568 },
        { month: "Jan", followers: 580 },
      ],
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
      avgViews: "280K",
      platforms: ["instagram", "youtube"],
      verified: true,
      rating: 4.9,
      campaigns: 52,
      price: "$3,500 - $7,000",
      bio: "Certified fitness trainer and wellness coach. Helping people achieve their fitness goals.",
      aiMatchScore: 95,
      aiInsights: ["Excellent engagement rate", "Health-conscious audience", "Consistent posting schedule"],
      authenticityScore: 98,
      recentPosts: [
        { views: "285K", likes: "22.5K", comments: "1.3K" },
        { views: "298K", likes: "24.2K", comments: "1.4K" },
        { views: "312K", likes: "26.8K", comments: "1.6K" },
      ],
      audienceDemographics: {
        gender: [
          { name: "Female", value: 65, color: "#ec4899" },
          { name: "Male", value: 33, color: "#3b82f6" },
          { name: "Other", value: 2, color: "#8b5cf6" },
        ],
        ageGroups: [
          { age: "18-24", value: 28 },
          { age: "25-34", value: 48 },
          { age: "35-44", value: 18 },
          { age: "45+", value: 6 },
        ],
        topLocations: ["Los Angeles 35%", "San Diego 16%", "Phoenix 11%", "Denver 9%"],
      },
      growthTrend: [
        { month: "Sep", followers: 380 },
        { month: "Oct", followers: 395 },
        { month: "Nov", followers: 405 },
        { month: "Dec", followers: 412 },
        { month: "Jan", followers: 420 },
      ],
    },
    {
      id: 4,
      name: "Alex Rivera",
      username: "@alexrivera",
      avatar: "/man-travel.jpg",
      niche: "Travel & Adventure",
      location: "Miami, USA",
      followers: "325K",
      engagement: "5.5%",
      avgViews: "195K",
      platforms: ["instagram", "youtube", "twitter"],
      verified: false,
      rating: 4.7,
      campaigns: 38,
      price: "$2,000 - $4,500",
      bio: "Travel photographer and adventure seeker. Exploring the world one destination at a time.",
      aiMatchScore: 85,
      aiInsights: ["Strong visual storytelling", "Adventure-loving audience", "Emerging creator"],
      authenticityScore: 90,
      recentPosts: [
        { views: "195K", likes: "16.5K", comments: "980" },
        { views: "212K", likes: "18.2K", comments: "1.1K" },
        { views: "188K", likes: "15.8K", comments: "890" },
      ],
      audienceDemographics: {
        gender: [
          { name: "Female", value: 52, color: "#ec4899" },
          { name: "Male", value: 46, color: "#3b82f6" },
          { name: "Other", value: 2, color: "#8b5cf6" },
        ],
        ageGroups: [
          { age: "18-24", value: 38 },
          { age: "25-34", value: 42 },
          { age: "35-44", value: 15 },
          { age: "45+", value: 5 },
        ],
        topLocations: ["Miami 25%", "Orlando 14%", "Tampa 11%", "Atlanta 10%"],
      },
      growthTrend: [
        { month: "Sep", followers: 295 },
        { month: "Oct", followers: 305 },
        { month: "Nov", followers: 312 },
        { month: "Dec", followers: 318 },
        { month: "Jan", followers: 325 },
      ],
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-blue-950 to-black overflow-x-hidden">
      <BrandSidebar />

      {/* Main content with left padding to account for sidebar */}
      <div className="lg:pl-64">
        <BrandHeader />

        <main className="p-4 sm:p-6 lg:p-8 max-w-full">
          {/* Header */}
          <div className="mb-4 sm:mb-6 lg:mb-8">
            <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-2">Find Influencers</h1>
            <p className="text-xs sm:text-sm md:text-base text-gray-400">
              Discover and connect with the perfect influencers for your campaigns
            </p>
          </div>

          {/* Search and Filters */}
          <Card className="mb-4 sm:mb-6 bg-[#0f1629]/50 border-white/10 overflow-hidden">
            <CardContent className="p-3 sm:p-4 md:p-6">
              <div className="flex flex-col lg:flex-row gap-3 sm:gap-4">
                {/* Search Bar */}
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3 w-3 sm:h-4 sm:w-4 text-gray-400" />
                  <Input
                    placeholder="Search by name, category, or platform..."
                    className="pl-9 sm:pl-10 h-9 sm:h-10 md:h-11 text-xs sm:text-sm md:text-base bg-[#1a1f35] border-white/10 text-white placeholder:text-gray-500"
                  />
                </div>

                {/* Filter Controls */}
                <div className="flex flex-wrap gap-2">
                  <Select defaultValue="all">
                    <SelectTrigger className="w-full sm:w-[120px] md:w-[140px] h-9 sm:h-10 md:h-11 text-xs sm:text-sm bg-[#1a1f35] border-white/10 text-white">
                      <SelectValue placeholder="Niche" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1a1f35] border-white/10">
                      <SelectItem value="all">All Niches</SelectItem>
                      <SelectItem value="fashion">Fashion</SelectItem>
                      <SelectItem value="tech">Tech</SelectItem>
                      <SelectItem value="fitness">Fitness</SelectItem>
                      <SelectItem value="travel">Travel</SelectItem>
                      <SelectItem value="food">Food</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select defaultValue="all">
                    <SelectTrigger className="w-full sm:w-[120px] md:w-[140px] h-9 sm:h-10 md:h-11 text-xs sm:text-sm bg-[#1a1f35] border-white/10 text-white">
                      <SelectValue placeholder="Followers" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1a1f35] border-white/10">
                      <SelectItem value="all">All Ranges</SelectItem>
                      <SelectItem value="micro">10K - 100K</SelectItem>
                      <SelectItem value="mid">100K - 500K</SelectItem>
                      <SelectItem value="macro">500K - 1M</SelectItem>
                      <SelectItem value="mega">1M+</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select defaultValue="all">
                    <SelectTrigger className="w-full sm:w-[120px] md:w-[140px] h-9 sm:h-10 md:h-11 text-xs sm:text-sm bg-[#1a1f35] border-white/10 text-white">
                      <SelectValue placeholder="Location" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1a1f35] border-white/10">
                      <SelectItem value="all">All Locations</SelectItem>
                      <SelectItem value="usa">United States</SelectItem>
                      <SelectItem value="uk">United Kingdom</SelectItem>
                      <SelectItem value="canada">Canada</SelectItem>
                      <SelectItem value="australia">Australia</SelectItem>
                    </SelectContent>
                  </Select>

                  <Button
                    variant="outline"
                    size="icon"
                    className="h-9 w-9 sm:h-10 sm:w-10 md:h-11 md:w-11 bg-[#1a1f35] border-white/10 hover:bg-[#252b45] flex-shrink-0"
                    onClick={() => setShowFilters(!showFilters)}
                  >
                    <SlidersHorizontal className="h-3 w-3 sm:h-4 sm:w-4" />
                  </Button>

                  <div className="flex gap-1 border border-white/10 rounded-md p-1 bg-[#1a1f35] flex-shrink-0">
                    <Button
                      variant={viewMode === "grid" ? "default" : "ghost"}
                      size="icon"
                      className="h-7 w-7 sm:h-8 sm:w-8"
                      onClick={() => setViewMode("grid")}
                    >
                      <Grid3x3 className="h-3 w-3 sm:h-4 sm:w-4" />
                    </Button>
                    <Button
                      variant={viewMode === "list" ? "default" : "ghost"}
                      size="icon"
                      className="h-7 w-7 sm:h-8 sm:w-8"
                      onClick={() => setViewMode("list")}
                    >
                      <List className="h-3 w-3 sm:h-4 sm:w-4" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Advanced Filters (Collapsible) */}
              {showFilters && (
                <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-white/10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                  <div>
                    <label className="text-xs sm:text-sm font-medium mb-2 block text-white">Engagement Rate</label>
                    <Select defaultValue="all">
                      <SelectTrigger className="text-xs sm:text-sm bg-[#1a1f35] border-white/10 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-[#1a1f35] border-white/10">
                        <SelectItem value="all">Any</SelectItem>
                        <SelectItem value="high">5%+</SelectItem>
                        <SelectItem value="medium">3% - 5%</SelectItem>
                        <SelectItem value="low">Below 3%</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-xs sm:text-sm font-medium mb-2 block text-white">Platform</label>
                    <Select defaultValue="all">
                      <SelectTrigger className="text-xs sm:text-sm bg-[#1a1f35] border-white/10 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-[#1a1f35] border-white/10">
                        <SelectItem value="all">All Platforms</SelectItem>
                        <SelectItem value="instagram">Instagram</SelectItem>
                        <SelectItem value="youtube">YouTube</SelectItem>
                        <SelectItem value="twitter">Twitter</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-xs sm:text-sm font-medium mb-2 block text-white">Budget Range</label>
                    <Select defaultValue="all">
                      <SelectTrigger className="text-xs sm:text-sm bg-[#1a1f35] border-white/10 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-[#1a1f35] border-white/10">
                        <SelectItem value="all">Any Budget</SelectItem>
                        <SelectItem value="low">Under $2,500</SelectItem>
                        <SelectItem value="medium">$2,500 - $7,500</SelectItem>
                        <SelectItem value="high">$7,500+</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-xs sm:text-sm font-medium mb-2 block text-white">Authenticity Score</label>
                    <Select defaultValue="all">
                      <SelectTrigger className="text-xs sm:text-sm bg-[#1a1f35] border-white/10 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-[#1a1f35] border-white/10">
                        <SelectItem value="all">Any Score</SelectItem>
                        <SelectItem value="high">90%+</SelectItem>
                        <SelectItem value="medium">70% - 90%</SelectItem>
                        <SelectItem value="low">Below 70%</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Results Count */}
          <div className="mb-3 sm:mb-4 flex items-center justify-between flex-wrap gap-2">
            <p className="text-xs sm:text-sm text-gray-400">
              Showing <span className="font-semibold text-white">{influencers.length}</span> influencers
            </p>
            <Select defaultValue="relevance">
              <SelectTrigger className="w-[130px] sm:w-[140px] md:w-[160px] h-8 sm:h-9 text-xs sm:text-sm bg-[#1a1f35] border-white/10 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#1a1f35] border-white/10">
                <SelectItem value="relevance">Most Relevant</SelectItem>
                <SelectItem value="match">AI Match Score</SelectItem>
                <SelectItem value="followers">Most Followers</SelectItem>
                <SelectItem value="engagement">Best Engagement</SelectItem>
                <SelectItem value="price-low">Price: Low to High</SelectItem>
                <SelectItem value="price-high">Price: High to Low</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Influencers Grid/List */}
          <div
            className={
              viewMode === "grid"
                ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 md:gap-6"
                : "space-y-3 sm:space-y-4"
            }
          >
            {influencers.map((influencer) => (
              <Card
                key={influencer.id}
                className="hover:shadow-lg transition-shadow cursor-pointer bg-[#0f1629]/50 border-white/10 overflow-hidden"
                onClick={() => setSelectedInfluencer(influencer)}
              >
                <CardContent className="p-3 sm:p-4 md:p-6">
                  <div className={viewMode === "list" ? "flex gap-3 sm:gap-4 md:gap-6" : ""}>
                    {/* Avatar and Basic Info */}
                    <div className={viewMode === "grid" ? "text-center mb-3 sm:mb-4" : "flex-shrink-0"}>
                      <div className="relative inline-block">
                        <Avatar className="h-14 w-14 sm:h-16 sm:w-16 md:h-20 md:w-20 lg:h-24 lg:w-24 mx-auto border-2 border-blue-500/50">
                          <AvatarImage src={influencer.avatar || "/placeholder.svg"} />
                          <AvatarFallback className="bg-[#1a1f35] text-white">{influencer.name[0]}</AvatarFallback>
                        </Avatar>
                        {influencer.verified && (
                          <CheckCircle2 className="absolute bottom-0 right-0 h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-blue-500 bg-[#0a0e1a] rounded-full" />
                        )}
                        <div className="absolute -top-2 -right-2 h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center border-2 border-[#0a0e1a]">
                          <div className="text-center">
                            <Sparkles className="h-3 w-3 sm:h-4 sm:w-4 text-white mx-auto mb-0.5" />
                            <p className="text-[10px] sm:text-xs font-bold text-white">{influencer.aiMatchScore}</p>
                          </div>
                        </div>
                      </div>
                      {viewMode === "grid" && (
                        <>
                          <h3 className="font-semibold text-xs sm:text-sm md:text-base lg:text-lg mt-2 sm:mt-3 truncate text-white">
                            {influencer.name}
                          </h3>
                          <p className="text-xs sm:text-sm text-gray-400 truncate">{influencer.username}</p>
                        </>
                      )}
                    </div>

                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      {viewMode === "list" && (
                        <div className="mb-2 sm:mb-3">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-sm sm:text-base md:text-lg lg:text-xl truncate text-white">
                              {influencer.name}
                            </h3>
                            <Badge className="bg-gradient-to-r from-orange-500 to-orange-600 text-white border-0 text-xs flex-shrink-0">
                              <Sparkles className="w-3 h-3 mr-1" />
                              {influencer.aiMatchScore}% Match
                            </Badge>
                          </div>
                          <p className="text-xs sm:text-sm text-gray-400 truncate">{influencer.username}</p>
                        </div>
                      )}

                      <div className="space-y-1.5 sm:space-y-2 md:space-y-3">
                        <div className="flex flex-wrap gap-1.5">
                          <Badge
                            variant="secondary"
                            className="text-xs bg-blue-500/20 text-blue-400 border-blue-500/30"
                          >
                            {influencer.niche}
                          </Badge>
                          <Badge
                            variant="secondary"
                            className="text-xs bg-green-500/20 text-green-400 border-green-500/30"
                          >
                            {influencer.authenticityScore}% Real
                          </Badge>
                        </div>

                        {viewMode === "grid" && (
                          <div className="flex flex-wrap gap-1">
                            {influencer.aiInsights.slice(0, 2).map((insight, idx) => (
                              <Badge
                                key={idx}
                                variant="outline"
                                className="text-[10px] bg-orange-500/10 text-orange-400 border-orange-500/30"
                              >
                                {insight}
                              </Badge>
                            ))}
                          </div>
                        )}

                        <div className="flex items-center gap-1 text-xs sm:text-sm text-gray-400">
                          <MapPin className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                          <span className="truncate">{influencer.location}</span>
                        </div>

                        <div className="grid grid-cols-2 gap-2 sm:gap-3 text-xs sm:text-sm">
                          <div>
                            <div className="flex items-center gap-1 text-gray-400 mb-1">
                              <Users className="h-3 w-3 sm:h-4 sm:w-4" />
                              <span>Followers</span>
                            </div>
                            <p className="font-semibold text-xs sm:text-sm md:text-base text-white">
                              {influencer.followers}
                            </p>
                          </div>
                          <div>
                            <div className="flex items-center gap-1 text-gray-400 mb-1">
                              <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4" />
                              <span>Engagement</span>
                            </div>
                            <p className="font-semibold text-xs sm:text-sm md:text-base text-green-500">
                              {influencer.engagement}
                            </p>
                          </div>
                        </div>

                        <div className="flex gap-2 pt-1 sm:pt-2">
                          {influencer.platforms.includes("instagram") && (
                            <Instagram className="h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5 text-pink-500" />
                          )}
                          {influencer.platforms.includes("youtube") && (
                            <Youtube className="h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5 text-red-500" />
                          )}
                          {influencer.platforms.includes("twitter") && (
                            <Twitter className="h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5 text-blue-400" />
                          )}
                        </div>

                        <div className="flex items-center gap-1 text-xs sm:text-sm">
                          <Star className="h-3 w-3 sm:h-4 sm:w-4 fill-yellow-400 text-yellow-400" />
                          <span className="font-semibold text-white">{influencer.rating}</span>
                          <span className="text-gray-400">({influencer.campaigns} campaigns)</span>
                        </div>

                        <div className="pt-1 sm:pt-2 border-t border-white/10">
                          <p className="text-xs sm:text-sm font-semibold text-blue-400">{influencer.price}</p>
                        </div>
                      </div>

                      {viewMode === "list" && (
                        <div className="flex gap-2 mt-3 sm:mt-4">
                          <Button
                            size="sm"
                            className="flex-1 text-xs sm:text-sm h-7 sm:h-8 md:h-9 bg-blue-600 hover:bg-blue-700"
                          >
                            View Profile
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className={`text-xs sm:text-sm h-7 sm:h-8 md:h-9 ${
                              shortlistedIds.includes(influencer.id)
                                ? "bg-red-500/20 border-red-500/50 text-red-500"
                                : "bg-transparent border-white/10 hover:bg-[#1a1f35]"
                            }`}
                            onClick={(e) => {
                              e.stopPropagation()
                              toggleShortlist(influencer.id)
                            }}
                          >
                            <Heart
                              className={`h-3 w-3 sm:h-4 sm:w-4 ${shortlistedIds.includes(influencer.id) ? "fill-current" : ""}`}
                            />
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>

                  {viewMode === "grid" && (
                    <div className="flex gap-2 mt-3 sm:mt-4">
                      <Button
                        size="sm"
                        className="flex-1 text-xs sm:text-sm h-7 sm:h-8 md:h-9 bg-blue-600 hover:bg-blue-700"
                      >
                        View Profile
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className={`text-xs sm:text-sm h-7 sm:h-8 md:h-9 ${
                          shortlistedIds.includes(influencer.id)
                            ? "bg-red-500/20 border-red-500/50 text-red-500"
                            : "bg-transparent border-white/10 hover:bg-[#1a1f35]"
                        }`}
                        onClick={(e) => {
                          e.stopPropagation()
                          toggleShortlist(influencer.id)
                        }}
                      >
                        <Heart
                          className={`h-3 w-3 sm:h-4 sm:w-4 ${shortlistedIds.includes(influencer.id) ? "fill-current" : ""}`}
                        />
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </main>
      </div>

      <Dialog open={!!selectedInfluencer} onOpenChange={() => setSelectedInfluencer(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-[#0f1629] border-white/10 text-white">
          {selectedInfluencer && (
            <>
              <DialogHeader>
                <div className="flex items-start gap-3 sm:gap-4">
                  <div className="relative">
                    <Avatar className="h-14 w-14 sm:h-16 sm:w-16 md:h-20 md:w-20 border-2 border-blue-500">
                      <AvatarImage src={selectedInfluencer.avatar || "/placeholder.svg"} />
                      <AvatarFallback className="bg-[#1a1f35] text-white">{selectedInfluencer.name[0]}</AvatarFallback>
                    </Avatar>
                    <div className="absolute -top-1 -right-1 h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center border-2 border-[#0f1629]">
                      <div className="text-center">
                        <Sparkles className="h-3 w-3 sm:h-4 sm:w-4 text-white mx-auto" />
                        <p className="text-[10px] font-bold text-white">{selectedInfluencer.aiMatchScore}</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <DialogTitle className="text-lg sm:text-xl md:text-2xl truncate text-white">
                      {selectedInfluencer.name}
                    </DialogTitle>
                    <DialogDescription className="truncate text-gray-400">
                      {selectedInfluencer.username}
                    </DialogDescription>
                    <div className="flex flex-wrap gap-2 mt-2">
                      <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30 text-xs">
                        {selectedInfluencer.niche}
                      </Badge>
                      {selectedInfluencer.verified && (
                        <Badge
                          variant="secondary"
                          className="gap-1 bg-green-500/20 text-green-400 border-green-500/30 text-xs"
                        >
                          <CheckCircle2 className="h-3 w-3" />
                          Verified
                        </Badge>
                      )}
                      <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30 text-xs">
                        <Sparkles className="h-3 w-3 mr-1" />
                        {selectedInfluencer.aiMatchScore}% Match
                      </Badge>
                    </div>
                  </div>
                </div>
              </DialogHeader>

              <Tabs defaultValue="overview" className="mt-4 sm:mt-6">
                <TabsList className="grid w-full grid-cols-5 bg-[#1a1f35]">
                  <TabsTrigger value="overview" className="text-xs sm:text-sm data-[state=active]:bg-blue-600">
                    Overview
                  </TabsTrigger>
                  <TabsTrigger value="analytics" className="text-xs sm:text-sm data-[state=active]:bg-blue-600">
                    Analytics
                  </TabsTrigger>
                  <TabsTrigger value="audience" className="text-xs sm:text-sm data-[state=active]:bg-blue-600">
                    Audience
                  </TabsTrigger>
                  <TabsTrigger value="content" className="text-xs sm:text-sm data-[state=active]:bg-blue-600">
                    Content
                  </TabsTrigger>
                  <TabsTrigger value="rates" className="text-xs sm:text-sm data-[state=active]:bg-blue-600">
                    Rates
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-3 sm:space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2 text-sm sm:text-base text-white">About</h4>
                    <p className="text-xs sm:text-sm text-gray-400">{selectedInfluencer.bio}</p>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2 text-sm sm:text-base text-white flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-orange-500" />
                      AI Insights
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedInfluencer.aiInsights.map((insight: string, idx: number) => (
                        <Badge key={idx} className="bg-orange-500/20 text-orange-400 border-orange-500/30 text-xs">
                          {insight}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                    <Card className="bg-[#1a1f35] border-white/10 overflow-hidden">
                      <CardContent className="p-3 sm:p-4">
                        <p className="text-xs text-gray-400 mb-1">Followers</p>
                        <p className="text-base sm:text-lg md:text-xl font-bold text-white">
                          {selectedInfluencer.followers}
                        </p>
                      </CardContent>
                    </Card>
                    <Card className="bg-[#1a1f35] border-white/10 overflow-hidden">
                      <CardContent className="p-3 sm:p-4">
                        <p className="text-xs text-gray-400 mb-1">Engagement</p>
                        <p className="text-base sm:text-lg md:text-xl font-bold text-green-500">
                          {selectedInfluencer.engagement}
                        </p>
                      </CardContent>
                    </Card>
                    <Card className="bg-[#1a1f35] border-white/10 overflow-hidden">
                      <CardContent className="p-3 sm:p-4">
                        <p className="text-xs text-gray-400 mb-1">Avg Views</p>
                        <p className="text-base sm:text-lg md:text-xl font-bold text-white">
                          {selectedInfluencer.avgViews}
                        </p>
                      </CardContent>
                    </Card>
                    <Card className="bg-[#1a1f35] border-white/10 overflow-hidden">
                      <CardContent className="p-3 sm:p-4">
                        <p className="text-xs text-gray-400 mb-1">Rating</p>
                        <p className="text-base sm:text-lg md:text-xl font-bold flex items-center gap-1 text-white">
                          <Star className="h-3 w-3 sm:h-4 sm:w-4 fill-yellow-400 text-yellow-400" />
                          {selectedInfluencer.rating}
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                <TabsContent value="analytics" className="space-y-3 sm:space-y-4">
                  <div>
                    <h4 className="font-semibold mb-3 text-sm sm:text-base text-white">Follower Growth</h4>
                    <div className="h-[200px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={selectedInfluencer.growthTrend}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                          <XAxis dataKey="month" stroke="#9ca3af" style={{ fontSize: "10px" }} />
                          <YAxis stroke="#9ca3af" style={{ fontSize: "10px" }} />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: "#1a1f35",
                              border: "1px solid rgba(255,255,255,0.1)",
                              borderRadius: "8px",
                              fontSize: "12px",
                            }}
                          />
                          <Line type="monotone" dataKey="followers" stroke="#3b82f6" strokeWidth={2} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-3 text-sm sm:text-base text-white">Recent Performance</h4>
                    <div className="space-y-2 sm:space-y-3">
                      {selectedInfluencer.recentPosts.map((post: any, idx: number) => (
                        <Card key={idx} className="bg-[#1a1f35] border-white/10 overflow-hidden">
                          <CardContent className="p-3 sm:p-4">
                            <div className="grid grid-cols-3 gap-3 sm:gap-4 text-center">
                              <div>
                                <p className="text-xs text-gray-400 mb-1">Views</p>
                                <p className="font-semibold text-xs sm:text-sm md:text-base text-white">{post.views}</p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-400 mb-1">Likes</p>
                                <p className="font-semibold text-xs sm:text-sm md:text-base text-white">{post.likes}</p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-400 mb-1">Comments</p>
                                <p className="font-semibold text-xs sm:text-sm md:text-base text-white">
                                  {post.comments}
                                </p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="audience" className="space-y-3 sm:space-y-4">
                  <div>
                    <h4 className="font-semibold mb-3 text-sm sm:text-base text-white">Gender Distribution</h4>
                    <div className="h-[200px] w-full flex items-center justify-center">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={selectedInfluencer.audienceDemographics.gender}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, value }) => `${name} ${value}%`}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                          >
                            {selectedInfluencer.audienceDemographics.gender.map((entry: any, index: number) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-3 text-sm sm:text-base text-white">Age Groups</h4>
                    <div className="h-[200px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={selectedInfluencer.audienceDemographics.ageGroups}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                          <XAxis dataKey="age" stroke="#9ca3af" style={{ fontSize: "10px" }} />
                          <YAxis stroke="#9ca3af" style={{ fontSize: "10px" }} />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: "#1a1f35",
                              border: "1px solid rgba(255,255,255,0.1)",
                              borderRadius: "8px",
                              fontSize: "12px",
                            }}
                          />
                          <Bar dataKey="value" fill="#3b82f6" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-3 text-sm sm:text-base text-white">Top Locations</h4>
                    <div className="space-y-2">
                      {selectedInfluencer.audienceDemographics.topLocations.map((location: string, idx: number) => (
                        <div key={idx} className="flex items-center gap-2 text-xs sm:text-sm">
                          <MapPin className="h-3 w-3 sm:h-4 sm:w-4 text-blue-500" />
                          <span className="text-gray-400">{location}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="content">
                  <p className="text-xs sm:text-sm text-gray-400 text-center py-8">Content preview coming soon</p>
                </TabsContent>

                <TabsContent value="rates" className="space-y-3 sm:space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2 text-sm sm:text-base text-white">Pricing</h4>
                    <p className="text-base sm:text-lg md:text-xl font-bold text-blue-400">
                      {selectedInfluencer.price}
                    </p>
                    <p className="text-xs sm:text-sm text-gray-400">per campaign</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <Card className="bg-[#1a1f35] border-white/10 overflow-hidden">
                      <CardContent className="p-3 sm:p-4">
                        <p className="text-xs text-gray-400 mb-2">Instagram Post</p>
                        <p className="text-base sm:text-lg font-bold text-white">$1,500 - $2,500</p>
                      </CardContent>
                    </Card>
                    <Card className="bg-[#1a1f35] border-white/10 overflow-hidden">
                      <CardContent className="p-3 sm:p-4">
                        <p className="text-xs text-gray-400 mb-2">Instagram Story</p>
                        <p className="text-base sm:text-lg font-bold text-white">$500 - $1,000</p>
                      </CardContent>
                    </Card>
                    <Card className="bg-[#1a1f35] border-white/10 overflow-hidden">
                      <CardContent className="p-3 sm:p-4">
                        <p className="text-xs text-gray-400 mb-2">Instagram Reel</p>
                        <p className="text-base sm:text-lg font-bold text-white">$2,000 - $3,500</p>
                      </CardContent>
                    </Card>
                    <Card className="bg-[#1a1f35] border-white/10 overflow-hidden">
                      <CardContent className="p-3 sm:p-4">
                        <p className="text-xs text-gray-400 mb-2">YouTube Video</p>
                        <p className="text-base sm:text-lg font-bold text-white">$3,000 - $5,000</p>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="p-3 sm:p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                    <p className="text-xs sm:text-sm text-blue-400">
                      💡 Prices are negotiable based on campaign scope and deliverables
                    </p>
                  </div>
                </TabsContent>
              </Tabs>

              <div className="flex gap-2 sm:gap-3 mt-4 sm:mt-6">
                <Button className="flex-1 bg-blue-600 hover:bg-blue-700 text-xs sm:text-sm h-8 sm:h-9 md:h-10">
                  Invite to Campaign
                </Button>
                <Button
                  variant="outline"
                  className={`flex-1 text-xs sm:text-sm h-8 sm:h-9 md:h-10 ${
                    shortlistedIds.includes(selectedInfluencer.id)
                      ? "bg-red-500/20 border-red-500/50 text-red-500"
                      : "bg-transparent border-white/10 hover:bg-[#1a1f35]"
                  }`}
                  onClick={() => toggleShortlist(selectedInfluencer.id)}
                >
                  <Heart
                    className={`h-3 w-3 sm:h-4 sm:w-4 mr-2 ${shortlistedIds.includes(selectedInfluencer.id) ? "fill-current" : ""}`}
                  />
                  {shortlistedIds.includes(selectedInfluencer.id) ? "Remove from Shortlist" : "Add to Shortlist"}
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
