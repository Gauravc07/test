"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import DashboardNav from "@/components/dashboard-nav"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Search,
  MapPin,
  TrendingUp,
  Users,
  Heart,
  Filter,
  Star,
  Instagram,
  Facebook,
  Youtube,
  Twitter,
  ArrowLeft,
} from "lucide-react"

export default function MarketplacePage() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [followerRange, setFollowerRange] = useState([10000, 1000000])
  const [engagementRange, setEngagementRange] = useState([1, 10])
  const [selectedCountries, setSelectedCountries] = useState<string[]>([])
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(["instagram"])
  const [growthFilter, setGrowthFilter] = useState("all")
  const [authenticityFilter, setAuthenticityFilter] = useState(0)

  // Mock influencer data
  const influencers = [
    {
      id: 1,
      name: "Sarah Johnson",
      username: "@sarahfitness",
      category: "Fitness",
      followers: 245000,
      engagement: 4.8,
      authenticity: 95,
      growth: 12.5,
      location: "Mumbai, India",
      platforms: ["instagram", "youtube"],
      verified: true,
      avatar: "/fitness-woman.png",
      recentPosts: 156,
      avgLikes: 11750,
      avgComments: 342,
    },
    {
      id: 2,
      name: "Rahul Sharma",
      username: "@techrahul",
      category: "Tech",
      followers: 180000,
      engagement: 5.2,
      authenticity: 92,
      growth: 8.3,
      location: "Bangalore, India",
      platforms: ["instagram", "twitter"],
      verified: true,
      avatar: "/tech-man.jpg",
      recentPosts: 203,
      avgLikes: 9360,
      avgComments: 287,
    },
    {
      id: 3,
      name: "Priya Patel",
      username: "@priyabeauty",
      category: "Beauty",
      followers: 320000,
      engagement: 6.1,
      authenticity: 98,
      growth: 15.7,
      location: "Delhi, India",
      platforms: ["instagram", "youtube", "facebook"],
      verified: true,
      avatar: "/beauty-woman.jpg",
      recentPosts: 189,
      avgLikes: 19520,
      avgComments: 456,
    },
    {
      id: 4,
      name: "Arjun Mehta",
      username: "@foodiearjun",
      category: "Food",
      followers: 156000,
      engagement: 4.3,
      authenticity: 89,
      growth: 6.2,
      location: "Pune, India",
      platforms: ["instagram"],
      verified: false,
      avatar: "/food-man.jpg",
      recentPosts: 234,
      avgLikes: 6708,
      avgComments: 198,
    },
    {
      id: 5,
      name: "Ananya Kapoor",
      username: "@travelananya",
      category: "Travel",
      followers: 412000,
      engagement: 5.8,
      authenticity: 96,
      growth: 18.9,
      location: "Goa, India",
      platforms: ["instagram", "youtube"],
      verified: true,
      avatar: "/travel-woman.png",
      recentPosts: 167,
      avgLikes: 23896,
      avgComments: 534,
    },
    {
      id: 6,
      name: "Vikram Singh",
      username: "@fashionvikram",
      category: "Fashion",
      followers: 289000,
      engagement: 4.9,
      authenticity: 94,
      growth: 10.4,
      location: "Mumbai, India",
      platforms: ["instagram", "facebook"],
      verified: true,
      avatar: "/fashion-man.jpg",
      recentPosts: 198,
      avgLikes: 14161,
      avgComments: 389,
    },
  ]

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case "instagram":
        return <Instagram className="h-4 w-4" />
      case "facebook":
        return <Facebook className="h-4 w-4" />
      case "youtube":
        return <Youtube className="h-4 w-4" />
      case "twitter":
        return <Twitter className="h-4 w-4" />
      default:
        return null
    }
  }

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
    return num.toString()
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
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Influencer Discovery</h1>
          <p className="text-gray-400">Find the perfect creators for your brand campaigns</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <Card className="bg-white/5 backdrop-blur-lg border-white/10 sticky top-4">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Filter className="h-5 w-5" />
                  Filters
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Category Filter */}
                <div>
                  <label className="text-sm font-medium text-gray-300 mb-2 block">Category</label>
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger className="bg-white/5 border-white/10 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      <SelectItem value="fitness">Fitness</SelectItem>
                      <SelectItem value="tech">Tech</SelectItem>
                      <SelectItem value="beauty">Beauty</SelectItem>
                      <SelectItem value="food">Food & Cooking</SelectItem>
                      <SelectItem value="travel">Travel</SelectItem>
                      <SelectItem value="fashion">Fashion</SelectItem>
                      <SelectItem value="gaming">Gaming</SelectItem>
                      <SelectItem value="lifestyle">Lifestyle</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Follower Range */}
                <div>
                  <label className="text-sm font-medium text-gray-300 mb-2 block">
                    Followers: {formatNumber(followerRange[0])} - {formatNumber(followerRange[1])}
                  </label>
                  <Slider
                    value={followerRange}
                    onValueChange={setFollowerRange}
                    min={1000}
                    max={10000000}
                    step={1000}
                    className="mt-2"
                  />
                </div>

                {/* Engagement Rate */}
                <div>
                  <label className="text-sm font-medium text-gray-300 mb-2 block">
                    Engagement Rate: {engagementRange[0]}% - {engagementRange[1]}%
                  </label>
                  <Slider
                    value={engagementRange}
                    onValueChange={setEngagementRange}
                    min={0}
                    max={20}
                    step={0.1}
                    className="mt-2"
                  />
                </div>

                {/* Authenticity Score */}
                <div>
                  <label className="text-sm font-medium text-gray-300 mb-2 block">
                    Min Authenticity Score: {authenticityFilter}%
                  </label>
                  <Slider
                    value={[authenticityFilter]}
                    onValueChange={(val) => setAuthenticityFilter(val[0])}
                    min={0}
                    max={100}
                    step={5}
                    className="mt-2"
                  />
                </div>

                {/* Growth Filter */}
                <div>
                  <label className="text-sm font-medium text-gray-300 mb-2 block">Growth Trend</label>
                  <Select value={growthFilter} onValueChange={setGrowthFilter}>
                    <SelectTrigger className="bg-white/5 border-white/10 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Growth Rates</SelectItem>
                      <SelectItem value="fast">Fast Growing (10%+)</SelectItem>
                      <SelectItem value="moderate">Moderate (5-10%)</SelectItem>
                      <SelectItem value="stable">Stable (0-5%)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Platform Filter */}
                <div>
                  <label className="text-sm font-medium text-gray-300 mb-2 block">Platforms</label>
                  <div className="space-y-2">
                    {["instagram", "facebook", "youtube", "twitter"].map((platform) => (
                      <div key={platform} className="flex items-center gap-2">
                        <Checkbox
                          id={platform}
                          checked={selectedPlatforms.includes(platform)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedPlatforms([...selectedPlatforms, platform])
                            } else {
                              setSelectedPlatforms(selectedPlatforms.filter((p) => p !== platform))
                            }
                          }}
                        />
                        <label htmlFor={platform} className="text-sm text-gray-300 capitalize cursor-pointer">
                          {platform}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Location Filter */}
                <div>
                  <label className="text-sm font-medium text-gray-300 mb-2 block">Location</label>
                  <Select>
                    <SelectTrigger className="bg-white/5 border-white/10 text-white">
                      <SelectValue placeholder="Select location" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="india">India</SelectItem>
                      <SelectItem value="mumbai">Mumbai</SelectItem>
                      <SelectItem value="delhi">Delhi</SelectItem>
                      <SelectItem value="bangalore">Bangalore</SelectItem>
                      <SelectItem value="pune">Pune</SelectItem>
                      <SelectItem value="goa">Goa</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button className="w-full bg-red-600 hover:bg-red-700 text-white">Apply Filters</Button>
              </CardContent>
            </Card>
          </div>

          {/* Results */}
          <div className="lg:col-span-3 space-y-6">
            {/* Search Bar */}
            <Card className="bg-white/5 backdrop-blur-lg border-white/10">
              <CardContent className="pt-6">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    placeholder="Search by name, username, or keywords..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-gray-500"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Results Count */}
            <div className="flex items-center justify-between">
              <p className="text-gray-400">{influencers.length} influencers found</p>
              <Select defaultValue="relevance">
                <SelectTrigger className="w-[180px] bg-white/5 border-white/10 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="relevance">Most Relevant</SelectItem>
                  <SelectItem value="followers">Most Followers</SelectItem>
                  <SelectItem value="engagement">Highest Engagement</SelectItem>
                  <SelectItem value="growth">Fastest Growing</SelectItem>
                  <SelectItem value="authenticity">Most Authentic</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Influencer Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {influencers.map((influencer) => (
                <Card
                  key={influencer.id}
                  className="bg-white/5 backdrop-blur-lg border-white/10 hover:border-red-500/50 transition-all"
                >
                  <CardHeader>
                    <div className="flex items-start gap-4">
                      <img
                        src={influencer.avatar || "/placeholder.svg"}
                        alt={influencer.name}
                        className="w-16 h-16 rounded-full object-cover"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <CardTitle className="text-white text-lg">{influencer.name}</CardTitle>
                          {influencer.verified && (
                            <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                              <Star className="h-3 w-3 mr-1 fill-blue-400" />
                              Verified
                            </Badge>
                          )}
                        </div>
                        <CardDescription className="text-gray-400">{influencer.username}</CardDescription>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">
                            {influencer.category}
                          </Badge>
                          <div className="flex gap-1">
                            {influencer.platforms.map((platform) => (
                              <div key={platform} className="text-gray-400">
                                {getPlatformIcon(platform)}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Stats Grid */}
                    <div className="grid grid-cols-3 gap-4">
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-1 text-gray-400 mb-1">
                          <Users className="h-4 w-4" />
                        </div>
                        <p className="text-white font-semibold">{formatNumber(influencer.followers)}</p>
                        <p className="text-xs text-gray-500">Followers</p>
                      </div>
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-1 text-gray-400 mb-1">
                          <Heart className="h-4 w-4" />
                        </div>
                        <p className="text-white font-semibold">{influencer.engagement}%</p>
                        <p className="text-xs text-gray-500">Engagement</p>
                      </div>
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-1 text-gray-400 mb-1">
                          <TrendingUp className="h-4 w-4" />
                        </div>
                        <p className="text-white font-semibold">+{influencer.growth}%</p>
                        <p className="text-xs text-gray-500">Growth</p>
                      </div>
                    </div>

                    {/* Authenticity Score */}
                    <div className="bg-white/5 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-400">Authenticity Score</span>
                        <span
                          className={`text-sm font-semibold ${
                            influencer.authenticity >= 95
                              ? "text-green-400"
                              : influencer.authenticity >= 90
                                ? "text-yellow-400"
                                : "text-orange-400"
                          }`}
                        >
                          {influencer.authenticity}%
                        </span>
                      </div>
                      <div className="w-full bg-white/10 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${
                            influencer.authenticity >= 95
                              ? "bg-green-500"
                              : influencer.authenticity >= 90
                                ? "bg-yellow-500"
                                : "bg-orange-500"
                          }`}
                          style={{ width: `${influencer.authenticity}%` }}
                        />
                      </div>
                    </div>

                    {/* Location */}
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                      <MapPin className="h-4 w-4" />
                      {influencer.location}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 pt-2">
                      <Button className="flex-1 bg-red-600 hover:bg-red-700 text-white">View Profile</Button>
                      <Button
                        variant="outline"
                        className="flex-1 border-white/10 text-white hover:bg-white/5 bg-transparent"
                      >
                        Compare
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
