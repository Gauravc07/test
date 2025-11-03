"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import DashboardNav from "@/components/dashboard-nav"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Sparkles,
  Search,
  ImageIcon,
  Mic,
  Users,
  TrendingUp,
  Target,
  Zap,
  Star,
  Heart,
  MapPin,
  Instagram,
  Youtube,
  Twitter,
  Facebook,
  ArrowLeft,
} from "lucide-react"

export default function AISearchPage() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [searchType, setSearchType] = useState("text")
  const [isSearching, setIsSearching] = useState(false)

  // Mock AI recommendations
  const recommendations = {
    lookalike: [
      {
        id: 1,
        name: "Maya Singh",
        username: "@mayafitness",
        category: "Fitness",
        followers: 238000,
        engagement: 4.9,
        similarity: 95,
        reason: "Similar audience demographics and content style to your top performers",
        avatar: "/placeholder.svg?height=100&width=100",
        platforms: ["instagram", "youtube"],
        location: "Mumbai, India",
      },
      {
        id: 2,
        name: "Karan Malhotra",
        username: "@karanfit",
        category: "Fitness",
        followers: 252000,
        engagement: 5.1,
        similarity: 92,
        reason: "High engagement rate with similar target audience",
        avatar: "/placeholder.svg?height=100&width=100",
        platforms: ["instagram", "youtube"],
        location: "Delhi, India",
      },
      {
        id: 3,
        name: "Neha Kapoor",
        username: "@nehawellness",
        category: "Fitness",
        followers: 215000,
        engagement: 4.7,
        similarity: 89,
        reason: "Content themes align with your campaign objectives",
        avatar: "/placeholder.svg?height=100&width=100",
        platforms: ["instagram"],
        location: "Bangalore, India",
      },
    ],
    trending: [
      {
        id: 4,
        name: "Riya Sharma",
        username: "@riyatech",
        category: "Tech",
        followers: 145000,
        engagement: 6.2,
        growth: 45.3,
        reason: "Fastest growing tech influencer this month",
        avatar: "/placeholder.svg?height=100&width=100",
        platforms: ["youtube", "twitter"],
        location: "Pune, India",
      },
      {
        id: 5,
        name: "Arjun Patel",
        username: "@arjungadgets",
        category: "Tech",
        followers: 132000,
        engagement: 5.8,
        growth: 38.7,
        reason: "Viral content creator with rapid audience growth",
        avatar: "/placeholder.svg?height=100&width=100",
        platforms: ["youtube", "instagram"],
        location: "Hyderabad, India",
      },
    ],
    topicBased: [
      {
        id: 6,
        name: "Sneha Reddy",
        username: "@snehabeauty",
        category: "Beauty",
        followers: 298000,
        engagement: 5.9,
        topicMatch: 94,
        reason: "Expert in skincare and beauty tutorials",
        avatar: "/placeholder.svg?height=100&width=100",
        platforms: ["instagram", "youtube"],
        location: "Chennai, India",
      },
      {
        id: 7,
        name: "Pooja Gupta",
        username: "@poojamakeup",
        category: "Beauty",
        followers: 267000,
        engagement: 6.3,
        topicMatch: 91,
        reason: "Specializes in makeup reviews and tutorials",
        avatar: "/placeholder.svg?height=100&width=100",
        platforms: ["instagram", "youtube", "facebook"],
        location: "Mumbai, India",
      },
    ],
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

  const handleSearch = () => {
    setIsSearching(true)
    // Simulate AI search
    setTimeout(() => {
      setIsSearching(false)
    }, 2000)
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
          <div className="flex items-center gap-3 mb-2">
            <Sparkles className="h-8 w-8 text-yellow-400" />
            <h1 className="text-4xl font-bold text-white">AI-Powered Discovery</h1>
          </div>
          <p className="text-gray-400">Find perfect influencers using advanced AI search and recommendations</p>
        </div>

        {/* AI Search Interface */}
        <Card className="bg-white/5 backdrop-blur-lg border-white/10 mb-8">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Zap className="h-5 w-5 text-yellow-400" />
              AI Search
            </CardTitle>
            <CardDescription className="text-gray-400">
              Search by text, image, voice, or topic to find the perfect influencers
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={searchType} onValueChange={setSearchType} className="mb-4">
              <TabsList className="bg-white/5 border-white/10">
                <TabsTrigger value="text" className="data-[state=active]:bg-red-600">
                  <Search className="h-4 w-4 mr-2" />
                  Text Search
                </TabsTrigger>
                <TabsTrigger value="image" className="data-[state=active]:bg-red-600">
                  <ImageIcon className="h-4 w-4 mr-2" />
                  Image Search
                </TabsTrigger>
                <TabsTrigger value="voice" className="data-[state=active]:bg-red-600">
                  <Mic className="h-4 w-4 mr-2" />
                  Voice Search
                </TabsTrigger>
                <TabsTrigger value="topic" className="data-[state=active]:bg-red-600">
                  <Target className="h-4 w-4 mr-2" />
                  Topic Search
                </TabsTrigger>
              </TabsList>

              <TabsContent value="text" className="mt-4">
                <div className="flex gap-3">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input
                      placeholder="Describe the type of influencer you're looking for... (e.g., 'fitness influencer with high engagement in Mumbai')"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-gray-500"
                    />
                  </div>
                  <Button
                    className="bg-red-600 hover:bg-red-700 text-white px-8"
                    onClick={handleSearch}
                    disabled={isSearching}
                  >
                    {isSearching ? (
                      <>
                        <Sparkles className="h-4 w-4 mr-2 animate-spin" />
                        Searching...
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4 mr-2" />
                        AI Search
                      </>
                    )}
                  </Button>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Try: "tech reviewer with 100K+ followers" or "beauty influencer in Delhi with high engagement"
                </p>
              </TabsContent>

              <TabsContent value="image" className="mt-4">
                <div className="border-2 border-dashed border-white/20 rounded-lg p-12 text-center">
                  <ImageIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-white mb-2">Upload an image to find similar influencers</p>
                  <p className="text-sm text-gray-400 mb-4">
                    AI will analyze the image and find influencers with similar content style
                  </p>
                  <Button className="bg-red-600 hover:bg-red-700 text-white">Upload Image</Button>
                </div>
              </TabsContent>

              <TabsContent value="voice" className="mt-4">
                <div className="border-2 border-dashed border-white/20 rounded-lg p-12 text-center">
                  <Mic className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-white mb-2">Use voice to describe your requirements</p>
                  <p className="text-sm text-gray-400 mb-4">Speak naturally and AI will understand your needs</p>
                  <Button className="bg-red-600 hover:bg-red-700 text-white">
                    <Mic className="h-4 w-4 mr-2" />
                    Start Recording
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="topic" className="mt-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    "Fitness & Wellness",
                    "Beauty & Skincare",
                    "Tech & Gadgets",
                    "Fashion & Style",
                    "Food & Cooking",
                    "Travel & Adventure",
                    "Gaming & Esports",
                    "Business & Finance",
                  ].map((topic) => (
                    <Button
                      key={topic}
                      variant="outline"
                      className="border-white/10 text-white hover:bg-red-600 hover:border-red-600 bg-transparent"
                    >
                      {topic}
                    </Button>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* AI Recommendations */}
        <Tabs defaultValue="lookalike" className="space-y-6">
          <TabsList className="bg-white/5 border-white/10">
            <TabsTrigger value="lookalike" className="data-[state=active]:bg-red-600">
              <Users className="h-4 w-4 mr-2" />
              Lookalike Influencers
            </TabsTrigger>
            <TabsTrigger value="trending" className="data-[state=active]:bg-red-600">
              <TrendingUp className="h-4 w-4 mr-2" />
              Trending Creators
            </TabsTrigger>
            <TabsTrigger value="topic" className="data-[state=active]:bg-red-600">
              <Target className="h-4 w-4 mr-2" />
              Topic-Based
            </TabsTrigger>
          </TabsList>

          {/* Lookalike Recommendations */}
          <TabsContent value="lookalike">
            <Card className="bg-white/5 backdrop-blur-lg border-white/10">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-yellow-400" />
                  Lookalike Influencers
                </CardTitle>
                <CardDescription className="text-gray-400">
                  AI-recommended influencers similar to your top performers
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {recommendations.lookalike.map((influencer) => (
                    <Card
                      key={influencer.id}
                      className="bg-white/5 border-white/10 hover:border-red-500/50 transition-all"
                    >
                      <CardHeader>
                        <div className="flex items-start gap-4">
                          <img
                            src={influencer.avatar || "/placeholder.svg"}
                            alt={influencer.name}
                            className="w-16 h-16 rounded-full object-cover"
                          />
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <CardTitle className="text-white text-lg">{influencer.name}</CardTitle>
                              <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                            </div>
                            <p className="text-gray-400 text-sm">{influencer.username}</p>
                            <div className="flex items-center gap-2 mt-2">
                              <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30 text-xs">
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
                        {/* Similarity Score */}
                        <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-gray-400">AI Similarity Score</span>
                            <span className="text-lg font-bold text-green-400">{influencer.similarity}%</span>
                          </div>
                          <div className="w-full bg-white/10 rounded-full h-2">
                            <div
                              className="h-2 rounded-full bg-green-500"
                              style={{ width: `${influencer.similarity}%` }}
                            />
                          </div>
                        </div>

                        {/* Stats */}
                        <div className="grid grid-cols-2 gap-4">
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
                        </div>

                        {/* AI Reason */}
                        <div className="bg-white/5 rounded-lg p-3">
                          <p className="text-xs text-gray-400 mb-1">Why recommended:</p>
                          <p className="text-sm text-gray-300">{influencer.reason}</p>
                        </div>

                        {/* Location */}
                        <div className="flex items-center gap-2 text-sm text-gray-400">
                          <MapPin className="h-4 w-4" />
                          {influencer.location}
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2">
                          <Button className="flex-1 bg-red-600 hover:bg-red-700 text-white text-sm">
                            View Profile
                          </Button>
                          <Button
                            variant="outline"
                            className="flex-1 border-white/10 text-white hover:bg-white/5 text-sm bg-transparent"
                          >
                            Add to List
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Trending Creators */}
          <TabsContent value="trending">
            <Card className="bg-white/5 backdrop-blur-lg border-white/10">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-green-400" />
                  Trending Creators
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Fast-growing influencers with viral potential
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {recommendations.trending.map((influencer) => (
                    <Card
                      key={influencer.id}
                      className="bg-white/5 border-white/10 hover:border-green-500/50 transition-all"
                    >
                      <CardHeader>
                        <div className="flex items-start gap-4">
                          <img
                            src={influencer.avatar || "/placeholder.svg"}
                            alt={influencer.name}
                            className="w-16 h-16 rounded-full object-cover"
                          />
                          <div className="flex-1">
                            <CardTitle className="text-white text-lg mb-1">{influencer.name}</CardTitle>
                            <p className="text-gray-400 text-sm mb-2">{influencer.username}</p>
                            <div className="flex items-center gap-2">
                              <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30 text-xs">
                                {influencer.category}
                              </Badge>
                              <Badge className="bg-green-500/20 text-green-400 border-green-500/30 text-xs">
                                <TrendingUp className="h-3 w-3 mr-1" />+{influencer.growth}%
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {/* Stats */}
                        <div className="grid grid-cols-3 gap-4">
                          <div className="text-center">
                            <p className="text-white font-semibold">{formatNumber(influencer.followers)}</p>
                            <p className="text-xs text-gray-500">Followers</p>
                          </div>
                          <div className="text-center">
                            <p className="text-white font-semibold">{influencer.engagement}%</p>
                            <p className="text-xs text-gray-500">Engagement</p>
                          </div>
                          <div className="text-center">
                            <p className="text-green-400 font-semibold">+{influencer.growth}%</p>
                            <p className="text-xs text-gray-500">Growth</p>
                          </div>
                        </div>

                        {/* AI Reason */}
                        <div className="bg-white/5 rounded-lg p-3">
                          <p className="text-xs text-gray-400 mb-1">Why trending:</p>
                          <p className="text-sm text-gray-300">{influencer.reason}</p>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2">
                          <Button className="flex-1 bg-red-600 hover:bg-red-700 text-white text-sm">
                            View Profile
                          </Button>
                          <Button
                            variant="outline"
                            className="flex-1 border-white/10 text-white hover:bg-white/5 text-sm bg-transparent"
                          >
                            Contact
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Topic-Based Recommendations */}
          <TabsContent value="topic">
            <Card className="bg-white/5 backdrop-blur-lg border-white/10">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Target className="h-5 w-5 text-blue-400" />
                  Topic-Based Recommendations
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Influencers matching specific topics and content themes
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {recommendations.topicBased.map((influencer) => (
                    <Card
                      key={influencer.id}
                      className="bg-white/5 border-white/10 hover:border-blue-500/50 transition-all"
                    >
                      <CardHeader>
                        <div className="flex items-start gap-4">
                          <img
                            src={influencer.avatar || "/placeholder.svg"}
                            alt={influencer.name}
                            className="w-16 h-16 rounded-full object-cover"
                          />
                          <div className="flex-1">
                            <CardTitle className="text-white text-lg mb-1">{influencer.name}</CardTitle>
                            <p className="text-gray-400 text-sm mb-2">{influencer.username}</p>
                            <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30 text-xs">
                              {influencer.category}
                            </Badge>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {/* Topic Match Score */}
                        <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-gray-400">Topic Match Score</span>
                            <span className="text-lg font-bold text-blue-400">{influencer.topicMatch}%</span>
                          </div>
                          <div className="w-full bg-white/10 rounded-full h-2">
                            <div
                              className="h-2 rounded-full bg-blue-500"
                              style={{ width: `${influencer.topicMatch}%` }}
                            />
                          </div>
                        </div>

                        {/* Stats */}
                        <div className="grid grid-cols-2 gap-4">
                          <div className="text-center">
                            <p className="text-white font-semibold">{formatNumber(influencer.followers)}</p>
                            <p className="text-xs text-gray-500">Followers</p>
                          </div>
                          <div className="text-center">
                            <p className="text-white font-semibold">{influencer.engagement}%</p>
                            <p className="text-xs text-gray-500">Engagement</p>
                          </div>
                        </div>

                        {/* AI Reason */}
                        <div className="bg-white/5 rounded-lg p-3">
                          <p className="text-xs text-gray-400 mb-1">Expertise:</p>
                          <p className="text-sm text-gray-300">{influencer.reason}</p>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2">
                          <Button className="flex-1 bg-red-600 hover:bg-red-700 text-white text-sm">
                            View Profile
                          </Button>
                          <Button
                            variant="outline"
                            className="flex-1 border-white/10 text-white hover:bg-white/5 text-sm bg-transparent"
                          >
                            Add to Campaign
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
