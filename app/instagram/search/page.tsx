"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Search, Filter, Instagram, Users, TrendingUp, MapPin, X } from "lucide-react"

interface Influencer {
  id: string
  username: string
  fullName: string
  followers: number
  engagementRate: number
  category: string
  location: string
  verified: boolean
  avgLikes: number
  avgComments: number
}

const mockInfluencers: Influencer[] = [
  {
    id: "1",
    username: "@fashionista_maya",
    fullName: "Maya Johnson",
    followers: 245000,
    engagementRate: 4.8,
    category: "Fashion",
    location: "New York, USA",
    verified: true,
    avgLikes: 11760,
    avgComments: 342,
  },
  {
    id: "2",
    username: "@tech_reviewer_alex",
    fullName: "Alex Chen",
    followers: 180000,
    engagementRate: 5.2,
    category: "Technology",
    location: "San Francisco, USA",
    verified: true,
    avgLikes: 9360,
    avgComments: 468,
  },
  {
    id: "3",
    username: "@fitness_coach_sarah",
    fullName: "Sarah Williams",
    followers: 320000,
    engagementRate: 6.1,
    category: "Fitness",
    location: "Los Angeles, USA",
    verified: true,
    avgLikes: 19520,
    avgComments: 976,
  },
  {
    id: "4",
    username: "@foodie_adventures",
    fullName: "James Rodriguez",
    followers: 125000,
    engagementRate: 7.3,
    category: "Food",
    location: "Miami, USA",
    verified: false,
    avgLikes: 9125,
    avgComments: 625,
  },
  {
    id: "5",
    username: "@travel_wanderer",
    fullName: "Emma Thompson",
    followers: 410000,
    engagementRate: 4.5,
    category: "Travel",
    location: "London, UK",
    verified: true,
    avgLikes: 18450,
    avgComments: 820,
  },
  {
    id: "6",
    username: "@beauty_guru_lisa",
    fullName: "Lisa Park",
    followers: 290000,
    engagementRate: 5.8,
    category: "Beauty",
    location: "Seoul, South Korea",
    verified: true,
    avgLikes: 16820,
    avgComments: 870,
  },
]

export default function InfluencerSearchPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [followerRange, setFollowerRange] = useState([0, 500000])
  const [engagementRange, setEngagementRange] = useState([0, 10])
  const [selectedLocation, setSelectedLocation] = useState("all")
  const [showFilters, setShowFilters] = useState(true)
  const [filteredInfluencers, setFilteredInfluencers] = useState(mockInfluencers)

  const categories = ["Fashion", "Technology", "Fitness", "Food", "Travel", "Beauty", "Lifestyle", "Gaming"]
  const locations = [
    "New York, USA",
    "Los Angeles, USA",
    "San Francisco, USA",
    "Miami, USA",
    "London, UK",
    "Seoul, South Korea",
  ]

  const handleSearch = () => {
    let results = mockInfluencers

    if (searchQuery) {
      results = results.filter(
        (inf) =>
          inf.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
          inf.fullName.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    }

    if (selectedCategory !== "all") {
      results = results.filter((inf) => inf.category === selectedCategory)
    }

    if (selectedLocation !== "all") {
      results = results.filter((inf) => inf.location === selectedLocation)
    }

    results = results.filter((inf) => inf.followers >= followerRange[0] && inf.followers <= followerRange[1])

    results = results.filter(
      (inf) => inf.engagementRate >= engagementRange[0] && inf.engagementRate <= engagementRange[1],
    )

    setFilteredInfluencers(results)
  }

  const clearFilters = () => {
    setSearchQuery("")
    setSelectedCategory("all")
    setFollowerRange([0, 500000])
    setEngagementRange([0, 10])
    setSelectedLocation("all")
    setFilteredInfluencers(mockInfluencers)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-black pt-24 pb-16 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Search Influencers</h1>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto">
            Find the perfect creators for your brand collaborations with advanced filtering and search.
          </p>
        </div>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <Card className="bg-gray-900/50 border-gray-800 sticky top-24">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                    <Filter className="h-5 w-5" />
                    Filters
                  </h2>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowFilters(!showFilters)}
                    className="lg:hidden text-gray-400"
                  >
                    {showFilters ? <X className="h-4 w-4" /> : <Filter className="h-4 w-4" />}
                  </Button>
                </div>

                <div className={`space-y-6 ${showFilters ? "block" : "hidden lg:block"}`}>
                  {/* Category Filter */}
                  <div>
                    <Label className="text-white mb-2 block">Category</Label>
                    <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                      <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-800 border-gray-700">
                        <SelectItem value="all">All Categories</SelectItem>
                        {categories.map((cat) => (
                          <SelectItem key={cat} value={cat}>
                            {cat}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Follower Range */}
                  <div>
                    <Label className="text-white mb-2 block">
                      Followers: {followerRange[0].toLocaleString()} - {followerRange[1].toLocaleString()}
                    </Label>
                    <Slider
                      value={followerRange}
                      onValueChange={setFollowerRange}
                      max={500000}
                      step={10000}
                      className="mt-2"
                    />
                  </div>

                  {/* Engagement Rate */}
                  <div>
                    <Label className="text-white mb-2 block">
                      Engagement Rate: {engagementRange[0]}% - {engagementRange[1]}%
                    </Label>
                    <Slider
                      value={engagementRange}
                      onValueChange={setEngagementRange}
                      max={10}
                      step={0.1}
                      className="mt-2"
                    />
                  </div>

                  {/* Location Filter */}
                  <div>
                    <Label className="text-white mb-2 block">Location</Label>
                    <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                      <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                        <SelectValue placeholder="Select location" />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-800 border-gray-700">
                        <SelectItem value="all">All Locations</SelectItem>
                        {locations.map((loc) => (
                          <SelectItem key={loc} value={loc}>
                            {loc}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex flex-col gap-2 pt-4">
                    <Button onClick={handleSearch} className="w-full bg-red-600 hover:bg-red-700 text-white">
                      Apply Filters
                    </Button>
                    <Button
                      onClick={clearFilters}
                      variant="outline"
                      className="w-full border-gray-700 text-gray-300 hover:bg-gray-800 bg-transparent"
                    >
                      Clear All
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Results */}
          <div className="lg:col-span-3">
            {/* Search Bar */}
            <div className="mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  placeholder="Search by username or name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  className="pl-10 bg-gray-900/50 border-gray-800 text-white placeholder:text-gray-500 h-12"
                />
              </div>
            </div>

            {/* Results Count */}
            <div className="mb-6">
              <p className="text-gray-400">
                Found <span className="text-white font-semibold">{filteredInfluencers.length}</span> influencers
              </p>
            </div>

            {/* Influencer Cards */}
            <div className="space-y-4">
              {filteredInfluencers.map((influencer) => (
                <Card
                  key={influencer.id}
                  className="bg-gray-900/50 border-gray-800 hover:border-gray-700 transition-colors"
                >
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row gap-6">
                      {/* Profile Image */}
                      <div className="flex-shrink-0">
                        <div className="h-24 w-24 rounded-full bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 flex items-center justify-center">
                          <Instagram className="h-12 w-12 text-white" />
                        </div>
                      </div>

                      {/* Info */}
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="text-xl font-semibold text-white">{influencer.username}</h3>
                              {influencer.verified && (
                                <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/50">Verified</Badge>
                              )}
                            </div>
                            <p className="text-gray-400">{influencer.fullName}</p>
                          </div>
                          <Button className="bg-red-600 hover:bg-red-700 text-white">View Profile</Button>
                        </div>

                        <div className="flex items-center gap-2 mb-4">
                          <Badge variant="outline" className="border-gray-700 text-gray-300">
                            {influencer.category}
                          </Badge>
                          <span className="text-gray-500">•</span>
                          <span className="text-gray-400 text-sm flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {influencer.location}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div>
                            <div className="flex items-center gap-1 text-gray-400 text-sm mb-1">
                              <Users className="h-4 w-4" />
                              Followers
                            </div>
                            <p className="text-white font-semibold">{influencer.followers.toLocaleString()}</p>
                          </div>
                          <div>
                            <div className="flex items-center gap-1 text-gray-400 text-sm mb-1">
                              <TrendingUp className="h-4 w-4" />
                              Engagement
                            </div>
                            <p className="text-white font-semibold">{influencer.engagementRate}%</p>
                          </div>
                          <div>
                            <div className="text-gray-400 text-sm mb-1">Avg Likes</div>
                            <p className="text-white font-semibold">{influencer.avgLikes.toLocaleString()}</p>
                          </div>
                          <div>
                            <div className="text-gray-400 text-sm mb-1">Avg Comments</div>
                            <p className="text-white font-semibold">{influencer.avgComments.toLocaleString()}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {filteredInfluencers.length === 0 && (
                <Card className="bg-gray-900/50 border-gray-800">
                  <CardContent className="p-12 text-center">
                    <Search className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-white mb-2">No influencers found</h3>
                    <p className="text-gray-400 mb-6">Try adjusting your filters or search query</p>
                    <Button
                      onClick={clearFilters}
                      variant="outline"
                      className="border-gray-700 text-gray-300 bg-transparent"
                    >
                      Clear Filters
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
