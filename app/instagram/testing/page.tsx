"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Play,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Instagram,
  Users,
  TrendingUp,
  Heart,
  MessageCircle,
  Eye,
} from "lucide-react"

export default function TestingDemoPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [testResult, setTestResult] = useState<"idle" | "success" | "error">("idle")
  const [testData, setTestData] = useState<any>(null)
  const [username, setUsername] = useState("@demo_creator")

  const mockProfileData = {
    username: "@demo_creator",
    fullName: "Demo Creator",
    biography: "Content creator | Brand partnerships | DM for collabs",
    followers: 125000,
    following: 850,
    postsCount: 342,
    engagementRate: 5.8,
    avgLikes: 7250,
    avgComments: 215,
    avgViews: 45000,
    topPosts: [
      { id: "1", likes: 12500, comments: 340, views: 67000, date: "2025-01-15" },
      { id: "2", likes: 9800, comments: 280, views: 52000, date: "2025-01-12" },
      { id: "3", likes: 8900, comments: 195, views: 48000, date: "2025-01-10" },
    ],
    audienceDemographics: {
      ageGroups: [
        { range: "18-24", percentage: 35 },
        { range: "25-34", percentage: 42 },
        { range: "35-44", percentage: 18 },
        { range: "45+", percentage: 5 },
      ],
      topLocations: [
        { city: "New York", percentage: 22 },
        { city: "Los Angeles", percentage: 18 },
        { city: "Chicago", percentage: 12 },
      ],
      gender: { male: 45, female: 53, other: 2 },
    },
  }

  const handleTestFetch = async () => {
    setIsLoading(true)
    setTestResult("idle")

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000))

      setTestData(mockProfileData)
      setTestResult("success")
    } catch (error) {
      setTestResult("error")
    } finally {
      setIsLoading(false)
    }
  }

  const handleTestSearch = async () => {
    setIsLoading(true)
    setTestResult("idle")

    try {
      await new Promise((resolve) => setTimeout(resolve, 1500))

      const searchResults = {
        query: "fashion creators",
        totalResults: 156,
        results: [
          {
            username: "@fashionista_maya",
            followers: 245000,
            engagementRate: 4.8,
            category: "Fashion",
          },
          {
            username: "@style_guru_alex",
            followers: 180000,
            engagementRate: 5.2,
            category: "Fashion",
          },
          {
            username: "@trendy_outfits",
            followers: 320000,
            engagementRate: 6.1,
            category: "Fashion",
          },
        ],
      }

      setTestData(searchResults)
      setTestResult("success")
    } catch (error) {
      setTestResult("error")
    } finally {
      setIsLoading(false)
    }
  }

  const handleTestInsights = async () => {
    setIsLoading(true)
    setTestResult("idle")

    try {
      await new Promise((resolve) => setTimeout(resolve, 1800))

      const insightsData = {
        period: "Last 30 days",
        impressions: 1250000,
        reach: 890000,
        profileViews: 45000,
        websiteClicks: 3200,
        emailContacts: 180,
        engagement: {
          likes: 215000,
          comments: 8900,
          shares: 4200,
          saves: 12000,
        },
        topPerformingPosts: 5,
        growthRate: 12.5,
      }

      setTestData(insightsData)
      setTestResult("success")
    } catch (error) {
      setTestResult("error")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-black pt-24 pb-16 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Instagram API Testing</h1>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto">
            Test and explore Instagram Graph API endpoints with live data fetching and response visualization.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 mb-8">
          <Card className="bg-gray-900/50 border-gray-800">
            <CardHeader>
              <CardTitle className="text-white text-lg">API Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-green-500 animate-pulse" />
                <span className="text-green-400 font-medium">Connected</span>
              </div>
              <p className="text-sm text-gray-400 mt-2">Instagram Graph API v18.0</p>
            </CardContent>
          </Card>

          <Card className="bg-gray-900/50 border-gray-800">
            <CardHeader>
              <CardTitle className="text-white text-lg">Rate Limit</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white mb-1">850 / 1000</div>
              <p className="text-sm text-gray-400">Requests remaining this hour</p>
            </CardContent>
          </Card>

          <Card className="bg-gray-900/50 border-gray-800">
            <CardHeader>
              <CardTitle className="text-white text-lg">Test Results</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white mb-1">
                {testResult === "success" ? "✓" : testResult === "error" ? "✗" : "—"}
              </div>
              <p className="text-sm text-gray-400">
                {testResult === "success"
                  ? "Last test successful"
                  : testResult === "error"
                    ? "Last test failed"
                    : "No tests run yet"}
              </p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="bg-gray-900/50 border border-gray-800 p-1">
            <TabsTrigger value="profile" className="data-[state=active]:bg-red-600">
              Profile Fetch
            </TabsTrigger>
            <TabsTrigger value="search" className="data-[state=active]:bg-red-600">
              Search API
            </TabsTrigger>
            <TabsTrigger value="insights" className="data-[state=active]:bg-red-600">
              Insights API
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-6">
            <Card className="bg-gray-900/50 border-gray-800">
              <CardHeader>
                <CardTitle className="text-white">Test Profile Fetch</CardTitle>
                <CardDescription>
                  Fetch Instagram profile data including followers, engagement, and posts
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-white mb-2 block">Instagram Username</Label>
                  <Input
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="@username"
                    className="bg-gray-800 border-gray-700 text-white"
                  />
                </div>

                <Button onClick={handleTestFetch} disabled={isLoading} className="w-full bg-red-600 hover:bg-red-700">
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Fetching...
                    </>
                  ) : (
                    <>
                      <Play className="mr-2 h-4 w-4" />
                      Run Test
                    </>
                  )}
                </Button>

                {testResult === "success" && testData && (
                  <Alert className="bg-green-500/10 border-green-500/50">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    <AlertDescription className="text-green-400">Profile data fetched successfully!</AlertDescription>
                  </Alert>
                )}

                {testResult === "error" && (
                  <Alert className="bg-red-500/10 border-red-500/50">
                    <AlertCircle className="h-4 w-4 text-red-500" />
                    <AlertDescription className="text-red-400">Failed to fetch profile data</AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>

            {testResult === "success" && testData && (
              <Card className="bg-gray-900/50 border-gray-800">
                <CardHeader>
                  <CardTitle className="text-white">Response Data</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="h-16 w-16 rounded-full bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 flex items-center justify-center">
                      <Instagram className="h-8 w-8 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-white">{testData.username}</h3>
                      <p className="text-gray-400">{testData.fullName}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="p-4 bg-gray-800/50 rounded-lg">
                      <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
                        <Users className="h-4 w-4" />
                        Followers
                      </div>
                      <p className="text-xl font-bold text-white">{testData.followers.toLocaleString()}</p>
                    </div>
                    <div className="p-4 bg-gray-800/50 rounded-lg">
                      <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
                        <TrendingUp className="h-4 w-4" />
                        Engagement
                      </div>
                      <p className="text-xl font-bold text-white">{testData.engagementRate}%</p>
                    </div>
                    <div className="p-4 bg-gray-800/50 rounded-lg">
                      <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
                        <Heart className="h-4 w-4" />
                        Avg Likes
                      </div>
                      <p className="text-xl font-bold text-white">{testData.avgLikes.toLocaleString()}</p>
                    </div>
                    <div className="p-4 bg-gray-800/50 rounded-lg">
                      <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
                        <MessageCircle className="h-4 w-4" />
                        Avg Comments
                      </div>
                      <p className="text-xl font-bold text-white">{testData.avgComments.toLocaleString()}</p>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-white font-semibold mb-3">Audience Demographics</h4>
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm text-gray-400 mb-2">Age Distribution</p>
                        <div className="flex gap-2">
                          {testData.audienceDemographics.ageGroups.map((group: any) => (
                            <Badge key={group.range} variant="outline" className="border-gray-700 text-gray-300">
                              {group.range}: {group.percentage}%
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div>
                        <p className="text-sm text-gray-400 mb-2">Top Locations</p>
                        <div className="flex gap-2">
                          {testData.audienceDemographics.topLocations.map((loc: any) => (
                            <Badge key={loc.city} variant="outline" className="border-gray-700 text-gray-300">
                              {loc.city}: {loc.percentage}%
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="search" className="space-y-6">
            <Card className="bg-gray-900/50 border-gray-800">
              <CardHeader>
                <CardTitle className="text-white">Test Search API</CardTitle>
                <CardDescription>Search for influencers by category, followers, and engagement</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button onClick={handleTestSearch} disabled={isLoading} className="w-full bg-red-600 hover:bg-red-700">
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Searching...
                    </>
                  ) : (
                    <>
                      <Play className="mr-2 h-4 w-4" />
                      Run Search Test
                    </>
                  )}
                </Button>

                {testResult === "success" && testData && (
                  <>
                    <Alert className="bg-green-500/10 border-green-500/50">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      <AlertDescription className="text-green-400">
                        Found {testData.totalResults} results for "{testData.query}"
                      </AlertDescription>
                    </Alert>

                    <div className="space-y-3">
                      {testData.results.map((result: any, index: number) => (
                        <div key={index} className="p-4 bg-gray-800/50 rounded-lg">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-white font-semibold">{result.username}</p>
                              <p className="text-sm text-gray-400">{result.category}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-white font-semibold">{result.followers.toLocaleString()}</p>
                              <p className="text-sm text-gray-400">{result.engagementRate}% engagement</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="insights" className="space-y-6">
            <Card className="bg-gray-900/50 border-gray-800">
              <CardHeader>
                <CardTitle className="text-white">Test Insights API</CardTitle>
                <CardDescription>Fetch detailed analytics and performance metrics</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button
                  onClick={handleTestInsights}
                  disabled={isLoading}
                  className="w-full bg-red-600 hover:bg-red-700"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Fetching Insights...
                    </>
                  ) : (
                    <>
                      <Play className="mr-2 h-4 w-4" />
                      Run Insights Test
                    </>
                  )}
                </Button>

                {testResult === "success" && testData && (
                  <>
                    <Alert className="bg-green-500/10 border-green-500/50">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      <AlertDescription className="text-green-400">
                        Insights data fetched for {testData.period}
                      </AlertDescription>
                    </Alert>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-gray-800/50 rounded-lg">
                        <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
                          <Eye className="h-4 w-4" />
                          Impressions
                        </div>
                        <p className="text-2xl font-bold text-white">{testData.impressions.toLocaleString()}</p>
                      </div>
                      <div className="p-4 bg-gray-800/50 rounded-lg">
                        <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
                          <Users className="h-4 w-4" />
                          Reach
                        </div>
                        <p className="text-2xl font-bold text-white">{testData.reach.toLocaleString()}</p>
                      </div>
                      <div className="p-4 bg-gray-800/50 rounded-lg">
                        <div className="text-gray-400 text-sm mb-1">Profile Views</div>
                        <p className="text-2xl font-bold text-white">{testData.profileViews.toLocaleString()}</p>
                      </div>
                      <div className="p-4 bg-gray-800/50 rounded-lg">
                        <div className="text-gray-400 text-sm mb-1">Growth Rate</div>
                        <p className="text-2xl font-bold text-green-400">+{testData.growthRate}%</p>
                      </div>
                    </div>

                    <div className="p-4 bg-gray-800/50 rounded-lg">
                      <h4 className="text-white font-semibold mb-3">Engagement Breakdown</h4>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <p className="text-sm text-gray-400">Likes</p>
                          <p className="text-lg font-semibold text-white">
                            {testData.engagement.likes.toLocaleString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-400">Comments</p>
                          <p className="text-lg font-semibold text-white">
                            {testData.engagement.comments.toLocaleString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-400">Shares</p>
                          <p className="text-lg font-semibold text-white">
                            {testData.engagement.shares.toLocaleString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-400">Saves</p>
                          <p className="text-lg font-semibold text-white">
                            {testData.engagement.saves.toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
