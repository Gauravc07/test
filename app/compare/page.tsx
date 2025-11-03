"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import DashboardNav from "@/components/dashboard-nav"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Users,
  Heart,
  TrendingUp,
  MapPin,
  Instagram,
  Youtube,
  Twitter,
  Facebook,
  Star,
  Shield,
  Eye,
  MessageCircle,
  X,
  Search,
  Plus,
  ArrowLeft,
} from "lucide-react"

export default function ComparePage() {
  const router = useRouter()
  const [selectedInfluencers, setSelectedInfluencers] = useState([
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
      avatar: "/placeholder.svg?height=100&width=100",
      demographics: {
        age: { primary: "25-34", percentage: 42 },
        gender: { primary: "Female", percentage: 68 },
        location: { primary: "Mumbai", percentage: 28 },
      },
      performance: {
        avgLikes: 11750,
        avgComments: 342,
        avgShares: 156,
        avgViews: 125000,
        reach: 850000,
      },
      contentTypes: {
        reels: { engagement: 6.2, count: 45 },
        posts: { engagement: 4.1, count: 89 },
        stories: { engagement: 3.8, count: 234 },
      },
    },
    {
      id: 2,
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
      avatar: "/placeholder.svg?height=100&width=100",
      demographics: {
        age: { primary: "18-24", percentage: 48 },
        gender: { primary: "Female", percentage: 75 },
        location: { primary: "Delhi", percentage: 32 },
      },
      performance: {
        avgLikes: 19520,
        avgComments: 456,
        avgShares: 234,
        avgViews: 185000,
        reach: 1200000,
      },
      contentTypes: {
        reels: { engagement: 7.8, count: 67 },
        posts: { engagement: 5.2, count: 102 },
        stories: { engagement: 4.5, count: 289 },
      },
    },
    {
      id: 3,
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
      avatar: "/placeholder.svg?height=100&width=100",
      demographics: {
        age: { primary: "25-34", percentage: 45 },
        gender: { primary: "Female", percentage: 62 },
        location: { primary: "Multiple", percentage: 15 },
      },
      performance: {
        avgLikes: 23896,
        avgComments: 534,
        avgShares: 312,
        avgViews: 220000,
        reach: 1450000,
      },
      contentTypes: {
        reels: { engagement: 7.2, count: 89 },
        posts: { engagement: 4.9, count: 134 },
        stories: { engagement: 4.2, count: 312 },
      },
    },
  ])

  const [searchQuery, setSearchQuery] = useState("")

  const removeInfluencer = (id: number) => {
    setSelectedInfluencers(selectedInfluencers.filter((inf) => inf.id !== id))
  }

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
    return num.toString()
  }

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

  const getHighestValue = (values: number[]) => Math.max(...values)
  const getLowestValue = (values: number[]) => Math.min(...values)

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
          <h1 className="text-4xl font-bold text-white mb-2">Influencer Comparison</h1>
          <p className="text-gray-400">Compare influencers side-by-side to make data-driven decisions</p>
        </div>

        {/* Add Influencer Search */}
        <Card className="bg-white/5 backdrop-blur-lg border-white/10 mb-6">
          <CardContent className="pt-6">
            <div className="flex gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  placeholder="Search influencers to add to comparison..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-gray-500"
                />
              </div>
              <Button className="bg-red-600 hover:bg-red-700 text-white">
                <Plus className="h-4 w-4 mr-2" />
                Add Influencer
              </Button>
            </div>
          </CardContent>
        </Card>

        {selectedInfluencers.length === 0 ? (
          <Card className="bg-white/5 backdrop-blur-lg border-white/10">
            <CardContent className="py-16 text-center">
              <Users className="h-16 w-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">No Influencers Selected</h3>
              <p className="text-gray-400 mb-6">Search and add influencers to start comparing</p>
              <Button className="bg-red-600 hover:bg-red-700 text-white">Browse Marketplace</Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {/* Profile Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {selectedInfluencers.map((influencer) => (
                <Card key={influencer.id} className="bg-white/5 backdrop-blur-lg border-white/10 relative">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-2 right-2 text-gray-400 hover:text-white hover:bg-red-500/20"
                    onClick={() => removeInfluencer(influencer.id)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                  <CardHeader className="text-center pb-4">
                    <img
                      src={influencer.avatar || "/placeholder.svg"}
                      alt={influencer.name}
                      className="w-24 h-24 rounded-full mx-auto mb-4 object-cover"
                    />
                    <div className="flex items-center justify-center gap-2 mb-1">
                      <CardTitle className="text-white text-lg">{influencer.name}</CardTitle>
                      {influencer.verified && <Star className="h-4 w-4 text-blue-400 fill-blue-400" />}
                    </div>
                    <p className="text-gray-400 text-sm">{influencer.username}</p>
                    <div className="flex items-center justify-center gap-2 mt-3">
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
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2 text-sm text-gray-400 justify-center">
                      <MapPin className="h-4 w-4" />
                      {influencer.location}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Key Metrics Comparison */}
            <Card className="bg-white/5 backdrop-blur-lg border-white/10">
              <CardHeader>
                <CardTitle className="text-white">Key Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Followers */}
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <Users className="h-5 w-5 text-gray-400" />
                      <span className="text-white font-medium">Followers</span>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      {selectedInfluencers.map((influencer) => {
                        const isHighest =
                          influencer.followers === getHighestValue(selectedInfluencers.map((i) => i.followers))
                        return (
                          <div
                            key={influencer.id}
                            className={`p-4 rounded-lg ${isHighest ? "bg-green-500/10 border border-green-500/30" : "bg-white/5"}`}
                          >
                            <p className="text-2xl font-bold text-white">{formatNumber(influencer.followers)}</p>
                            <p className="text-xs text-gray-400 mt-1">{influencer.name}</p>
                            {isHighest && (
                              <Badge className="mt-2 bg-green-500/20 text-green-400 border-green-500/30 text-xs">
                                Highest
                              </Badge>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </div>

                  {/* Engagement Rate */}
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <Heart className="h-5 w-5 text-gray-400" />
                      <span className="text-white font-medium">Engagement Rate</span>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      {selectedInfluencers.map((influencer) => {
                        const isHighest =
                          influencer.engagement === getHighestValue(selectedInfluencers.map((i) => i.engagement))
                        return (
                          <div
                            key={influencer.id}
                            className={`p-4 rounded-lg ${isHighest ? "bg-green-500/10 border border-green-500/30" : "bg-white/5"}`}
                          >
                            <p className="text-2xl font-bold text-white">{influencer.engagement}%</p>
                            <p className="text-xs text-gray-400 mt-1">{influencer.name}</p>
                            {isHighest && (
                              <Badge className="mt-2 bg-green-500/20 text-green-400 border-green-500/30 text-xs">
                                Highest
                              </Badge>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </div>

                  {/* Authenticity Score */}
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <Shield className="h-5 w-5 text-gray-400" />
                      <span className="text-white font-medium">Authenticity Score</span>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      {selectedInfluencers.map((influencer) => {
                        const isHighest =
                          influencer.authenticity === getHighestValue(selectedInfluencers.map((i) => i.authenticity))
                        return (
                          <div
                            key={influencer.id}
                            className={`p-4 rounded-lg ${isHighest ? "bg-green-500/10 border border-green-500/30" : "bg-white/5"}`}
                          >
                            <p className="text-2xl font-bold text-white">{influencer.authenticity}%</p>
                            <p className="text-xs text-gray-400 mt-1">{influencer.name}</p>
                            {isHighest && (
                              <Badge className="mt-2 bg-green-500/20 text-green-400 border-green-500/30 text-xs">
                                Highest
                              </Badge>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </div>

                  {/* Growth Rate */}
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <TrendingUp className="h-5 w-5 text-gray-400" />
                      <span className="text-white font-medium">Growth Rate (30 days)</span>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      {selectedInfluencers.map((influencer) => {
                        const isHighest =
                          influencer.growth === getHighestValue(selectedInfluencers.map((i) => i.growth))
                        return (
                          <div
                            key={influencer.id}
                            className={`p-4 rounded-lg ${isHighest ? "bg-green-500/10 border border-green-500/30" : "bg-white/5"}`}
                          >
                            <p className="text-2xl font-bold text-white">+{influencer.growth}%</p>
                            <p className="text-xs text-gray-400 mt-1">{influencer.name}</p>
                            {isHighest && (
                              <Badge className="mt-2 bg-green-500/20 text-green-400 border-green-500/30 text-xs">
                                Fastest
                              </Badge>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Performance Metrics */}
            <Card className="bg-white/5 backdrop-blur-lg border-white/10">
              <CardHeader>
                <CardTitle className="text-white">Performance Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Average Likes */}
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <Heart className="h-5 w-5 text-gray-400" />
                      <span className="text-white font-medium">Average Likes per Post</span>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      {selectedInfluencers.map((influencer) => (
                        <div key={influencer.id} className="p-4 rounded-lg bg-white/5">
                          <p className="text-2xl font-bold text-white">
                            {formatNumber(influencer.performance.avgLikes)}
                          </p>
                          <p className="text-xs text-gray-400 mt-1">{influencer.name}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Average Comments */}
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <MessageCircle className="h-5 w-5 text-gray-400" />
                      <span className="text-white font-medium">Average Comments per Post</span>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      {selectedInfluencers.map((influencer) => (
                        <div key={influencer.id} className="p-4 rounded-lg bg-white/5">
                          <p className="text-2xl font-bold text-white">{influencer.performance.avgComments}</p>
                          <p className="text-xs text-gray-400 mt-1">{influencer.name}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Average Views */}
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <Eye className="h-5 w-5 text-gray-400" />
                      <span className="text-white font-medium">Average Views per Post</span>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      {selectedInfluencers.map((influencer) => (
                        <div key={influencer.id} className="p-4 rounded-lg bg-white/5">
                          <p className="text-2xl font-bold text-white">
                            {formatNumber(influencer.performance.avgViews)}
                          </p>
                          <p className="text-xs text-gray-400 mt-1">{influencer.name}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Total Reach */}
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <TrendingUp className="h-5 w-5 text-gray-400" />
                      <span className="text-white font-medium">Total Reach (30 days)</span>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      {selectedInfluencers.map((influencer) => {
                        const isHighest =
                          influencer.performance.reach ===
                          getHighestValue(selectedInfluencers.map((i) => i.performance.reach))
                        return (
                          <div
                            key={influencer.id}
                            className={`p-4 rounded-lg ${isHighest ? "bg-green-500/10 border border-green-500/30" : "bg-white/5"}`}
                          >
                            <p className="text-2xl font-bold text-white">
                              {formatNumber(influencer.performance.reach)}
                            </p>
                            <p className="text-xs text-gray-400 mt-1">{influencer.name}</p>
                            {isHighest && (
                              <Badge className="mt-2 bg-green-500/20 text-green-400 border-green-500/30 text-xs">
                                Highest Reach
                              </Badge>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Audience Demographics */}
            <Card className="bg-white/5 backdrop-blur-lg border-white/10">
              <CardHeader>
                <CardTitle className="text-white">Audience Demographics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Primary Age Group */}
                  <div>
                    <span className="text-white font-medium mb-3 block">Primary Age Group</span>
                    <div className="grid grid-cols-3 gap-4">
                      {selectedInfluencers.map((influencer) => (
                        <div key={influencer.id} className="p-4 rounded-lg bg-white/5">
                          <p className="text-xl font-bold text-white">{influencer.demographics.age.primary}</p>
                          <p className="text-sm text-gray-400 mt-1">
                            {influencer.demographics.age.percentage}% of audience
                          </p>
                          <p className="text-xs text-gray-500 mt-1">{influencer.name}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Primary Gender */}
                  <div>
                    <span className="text-white font-medium mb-3 block">Primary Gender</span>
                    <div className="grid grid-cols-3 gap-4">
                      {selectedInfluencers.map((influencer) => (
                        <div key={influencer.id} className="p-4 rounded-lg bg-white/5">
                          <p className="text-xl font-bold text-white">{influencer.demographics.gender.primary}</p>
                          <p className="text-sm text-gray-400 mt-1">
                            {influencer.demographics.gender.percentage}% of audience
                          </p>
                          <p className="text-xs text-gray-500 mt-1">{influencer.name}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Primary Location */}
                  <div>
                    <span className="text-white font-medium mb-3 block">Primary Location</span>
                    <div className="grid grid-cols-3 gap-4">
                      {selectedInfluencers.map((influencer) => (
                        <div key={influencer.id} className="p-4 rounded-lg bg-white/5">
                          <p className="text-xl font-bold text-white">{influencer.demographics.location.primary}</p>
                          <p className="text-sm text-gray-400 mt-1">
                            {influencer.demographics.location.percentage}% of audience
                          </p>
                          <p className="text-xs text-gray-500 mt-1">{influencer.name}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Content Performance */}
            <Card className="bg-white/5 backdrop-blur-lg border-white/10">
              <CardHeader>
                <CardTitle className="text-white">Content Performance by Type</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Reels */}
                  <div>
                    <span className="text-white font-medium mb-3 block">Reels Engagement</span>
                    <div className="grid grid-cols-3 gap-4">
                      {selectedInfluencers.map((influencer) => {
                        const isHighest =
                          influencer.contentTypes.reels.engagement ===
                          getHighestValue(selectedInfluencers.map((i) => i.contentTypes.reels.engagement))
                        return (
                          <div
                            key={influencer.id}
                            className={`p-4 rounded-lg ${isHighest ? "bg-green-500/10 border border-green-500/30" : "bg-white/5"}`}
                          >
                            <p className="text-2xl font-bold text-white">{influencer.contentTypes.reels.engagement}%</p>
                            <p className="text-sm text-gray-400 mt-1">
                              {influencer.contentTypes.reels.count} reels posted
                            </p>
                            <p className="text-xs text-gray-500 mt-1">{influencer.name}</p>
                            {isHighest && (
                              <Badge className="mt-2 bg-green-500/20 text-green-400 border-green-500/30 text-xs">
                                Best Performance
                              </Badge>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </div>

                  {/* Posts */}
                  <div>
                    <span className="text-white font-medium mb-3 block">Posts Engagement</span>
                    <div className="grid grid-cols-3 gap-4">
                      {selectedInfluencers.map((influencer) => (
                        <div key={influencer.id} className="p-4 rounded-lg bg-white/5">
                          <p className="text-2xl font-bold text-white">{influencer.contentTypes.posts.engagement}%</p>
                          <p className="text-sm text-gray-400 mt-1">{influencer.contentTypes.posts.count} posts</p>
                          <p className="text-xs text-gray-500 mt-1">{influencer.name}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Stories */}
                  <div>
                    <span className="text-white font-medium mb-3 block">Stories Engagement</span>
                    <div className="grid grid-cols-3 gap-4">
                      {selectedInfluencers.map((influencer) => (
                        <div key={influencer.id} className="p-4 rounded-lg bg-white/5">
                          <p className="text-2xl font-bold text-white">{influencer.contentTypes.stories.engagement}%</p>
                          <p className="text-sm text-gray-400 mt-1">{influencer.contentTypes.stories.count} stories</p>
                          <p className="text-xs text-gray-500 mt-1">{influencer.name}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex gap-4 justify-center">
              <Button className="bg-red-600 hover:bg-red-700 text-white px-8">Create Campaign with Selected</Button>
              <Button variant="outline" className="border-white/10 text-white hover:bg-white/5 px-8 bg-transparent">
                Export Comparison Report
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
