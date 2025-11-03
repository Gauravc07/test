"use client"

import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import {
  Users,
  MessageSquare,
  TrendingUp,
  Lightbulb,
  BookOpen,
  Video,
  Award,
  Search,
  Heart,
  Share2,
} from "lucide-react"
import { useState } from "react"
import Image from "next/image"

const communityPosts = [
  {
    id: 1,
    author: {
      name: "Priya Sharma",
      avatar: "/indian-woman-creator.jpg",
      level: "Elite Creator",
      verified: true,
    },
    content: "Just hit 100K followers! Here are my top 5 tips for growing your Instagram audience organically...",
    image: "/successful-female-influencer.jpg",
    likes: 342,
    comments: 28,
    shares: 15,
    timestamp: "2 hours ago",
    category: "Growth Tips",
  },
  {
    id: 2,
    author: {
      name: "Rahul Verma",
      avatar: "/indian-man-tech-reviewer.jpg",
      level: "Verified Creator",
      verified: true,
    },
    content:
      "Collaboration opportunity: Looking for tech creators in Bangalore for a joint YouTube series. DM if interested!",
    image: null,
    likes: 156,
    comments: 42,
    shares: 8,
    timestamp: "5 hours ago",
    category: "Collaboration",
  },
  {
    id: 3,
    author: {
      name: "Ananya Patel",
      avatar: "/indian-woman-food-blogger.jpg",
      level: "Rising Star",
      verified: false,
    },
    content:
      "My first brand deal! Thank you Shor for making this possible. Here's what I learned from the experience...",
    image: "/fashion-reel-1.jpg",
    likes: 289,
    comments: 35,
    shares: 12,
    timestamp: "1 day ago",
    category: "Success Story",
  },
]

const learningResources = [
  {
    id: 1,
    title: "Mastering Instagram Reels",
    description: "Learn how to create viral reels that boost engagement and attract brand deals",
    type: "Video Course",
    duration: "2.5 hours",
    level: "Intermediate",
    instructor: "Priya Sharma",
    thumbnail: "/influencer-creating-content.jpg",
    enrolled: 1240,
  },
  {
    id: 2,
    title: "Brand Negotiation Strategies",
    description: "Master the art of negotiating better rates and terms with brands",
    type: "Workshop",
    duration: "1 hour",
    level: "Advanced",
    instructor: "Rahul Verma",
    thumbnail: "/brand-marketing-team-meeting.jpg",
    enrolled: 856,
  },
  {
    id: 3,
    title: "Content Calendar Planning",
    description: "Build a sustainable content strategy that keeps your audience engaged",
    type: "Guide",
    duration: "30 min read",
    level: "Beginner",
    instructor: "Shor Team",
    thumbnail: "/analytics-dashboard.png",
    enrolled: 2100,
  },
]

const aiSuggestions = [
  {
    id: 1,
    title: "Optimize Your Posting Schedule",
    description: "Based on your analytics, posting at 7-9 PM IST can increase engagement by 35%",
    impact: "High",
    category: "Timing",
  },
  {
    id: 2,
    title: "Diversify Content Types",
    description: "Your audience responds well to tutorials. Try creating more how-to content",
    impact: "Medium",
    category: "Content",
  },
  {
    id: 3,
    title: "Engage with Comments",
    description: "Responding to comments within 1 hour can boost your post visibility by 20%",
    impact: "High",
    category: "Engagement",
  },
  {
    id: 4,
    title: "Collaborate with Similar Creators",
    description: "We found 12 creators in your niche with similar audience size for potential collaborations",
    impact: "Medium",
    category: "Growth",
  },
]

export default function CommunityPage() {
  const [searchQuery, setSearchQuery] = useState("")

  return (
    <main className="min-h-screen bg-background">
      <Navigation />

      <div className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto max-w-7xl">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2">Creator Community</h1>
            <p className="text-lg text-muted-foreground">Connect, learn, and grow with fellow creators</p>
          </div>

          {/* Quick Stats */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Active Creators</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">12,450</div>
                <p className="text-xs text-muted-foreground mt-1">+245 this week</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Community Posts</CardTitle>
                <MessageSquare className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">8,920</div>
                <p className="text-xs text-muted-foreground mt-1">This month</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Learning Resources</CardTitle>
                <BookOpen className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">156</div>
                <p className="text-xs text-muted-foreground mt-1">Courses & guides</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Success Stories</CardTitle>
                <Award className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">2,340</div>
                <p className="text-xs text-muted-foreground mt-1">Shared this year</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              <Tabs defaultValue="feed" className="space-y-6">
                <div className="flex items-center justify-between">
                  <TabsList>
                    <TabsTrigger value="feed">Community Feed</TabsTrigger>
                    <TabsTrigger value="learning">Learning Hub</TabsTrigger>
                  </TabsList>
                  <div className="relative w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="search"
                      placeholder="Search posts..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                </div>

                <TabsContent value="feed" className="space-y-6">
                  {/* Create Post Card */}
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex gap-4">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src="/indian-woman-creator.jpg" />
                          <AvatarFallback>PS</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <Input placeholder="Share your thoughts, tips, or success stories..." className="mb-3" />
                          <div className="flex items-center justify-between">
                            <div className="flex gap-2">
                              <Button variant="outline" size="sm">
                                <Image className="h-4 w-4 mr-2" />
                                Photo
                              </Button>
                              <Button variant="outline" size="sm">
                                <Video className="h-4 w-4 mr-2" />
                                Video
                              </Button>
                            </div>
                            <Button size="sm">Post</Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Community Posts */}
                  {communityPosts.map((post) => (
                    <Card key={post.id}>
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-10 w-10">
                              <AvatarImage src={post.author.avatar || "/placeholder.svg"} />
                              <AvatarFallback>{post.author.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="flex items-center gap-2">
                                <p className="font-semibold">{post.author.name}</p>
                                {post.author.verified && (
                                  <Badge variant="secondary" className="text-xs">
                                    Verified
                                  </Badge>
                                )}
                              </div>
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <span>{post.author.level}</span>
                                <span>•</span>
                                <span>{post.timestamp}</span>
                              </div>
                            </div>
                          </div>
                          <Badge variant="outline">{post.category}</Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <p className="text-base">{post.content}</p>
                        {post.image && (
                          <div className="relative h-64 rounded-lg overflow-hidden">
                            <Image
                              src={post.image || "/placeholder.svg"}
                              alt="Post image"
                              fill
                              className="object-cover"
                            />
                          </div>
                        )}
                        <div className="flex items-center gap-6 pt-2 border-t">
                          <Button variant="ghost" size="sm" className="gap-2">
                            <Heart className="h-4 w-4" />
                            {post.likes}
                          </Button>
                          <Button variant="ghost" size="sm" className="gap-2">
                            <MessageSquare className="h-4 w-4" />
                            {post.comments}
                          </Button>
                          <Button variant="ghost" size="sm" className="gap-2">
                            <Share2 className="h-4 w-4" />
                            {post.shares}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </TabsContent>

                <TabsContent value="learning" className="space-y-6">
                  {learningResources.map((resource) => (
                    <Card key={resource.id} className="overflow-hidden hover:shadow-lg transition-all">
                      <div className="flex flex-col sm:flex-row">
                        <div className="relative h-48 sm:h-auto sm:w-48 shrink-0">
                          <Image
                            src={resource.thumbnail || "/placeholder.svg"}
                            alt={resource.title}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div className="flex-1">
                          <CardHeader>
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <CardTitle className="text-xl mb-2">{resource.title}</CardTitle>
                                <CardDescription>{resource.description}</CardDescription>
                              </div>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              <Badge variant="secondary">{resource.type}</Badge>
                              <Badge variant="outline">{resource.level}</Badge>
                              <Badge variant="outline">{resource.duration}</Badge>
                            </div>
                          </CardHeader>
                          <CardContent>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                <div className="flex items-center gap-1">
                                  <Users className="h-4 w-4" />
                                  {resource.enrolled.toLocaleString()} enrolled
                                </div>
                                <div>By {resource.instructor}</div>
                              </div>
                              <Button>Start Learning</Button>
                            </div>
                          </CardContent>
                        </div>
                      </div>
                    </Card>
                  ))}
                </TabsContent>
              </Tabs>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* AI Growth Suggestions */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lightbulb className="h-5 w-5 text-primary" />
                    AI Growth Tips
                  </CardTitle>
                  <CardDescription>Personalized suggestions to boost your success</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {aiSuggestions.map((suggestion) => (
                      <div
                        key={suggestion.id}
                        className={`p-3 rounded-lg border ${
                          suggestion.impact === "High" ? "bg-primary/5 border-primary/20" : "bg-muted/50 border-border"
                        }`}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <p className="font-medium text-sm">{suggestion.title}</p>
                          <Badge
                            variant={suggestion.impact === "High" ? "default" : "secondary"}
                            className="text-xs shrink-0"
                          >
                            {suggestion.impact}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mb-2">{suggestion.description}</p>
                        <Badge variant="outline" className="text-xs">
                          {suggestion.category}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Trending Topics */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-primary" />
                    Trending Topics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      { tag: "#InstagramReels", posts: 1240 },
                      { tag: "#BrandDeals", posts: 856 },
                      { tag: "#ContentStrategy", posts: 642 },
                      { tag: "#CreatorTips", posts: 523 },
                      { tag: "#Collaboration", posts: 412 },
                    ].map((topic) => (
                      <div key={topic.tag} className="flex items-center justify-between">
                        <p className="font-medium text-sm text-primary">{topic.tag}</p>
                        <p className="text-xs text-muted-foreground">{topic.posts} posts</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Quick Links */}
              <Card>
                <CardHeader>
                  <CardTitle>Quick Links</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Button variant="outline" className="w-full justify-start bg-transparent" asChild>
                      <a href="/community/guidelines">
                        <BookOpen className="h-4 w-4 mr-2" />
                        Community Guidelines
                      </a>
                    </Button>
                    <Button variant="outline" className="w-full justify-start bg-transparent" asChild>
                      <a href="/support">
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Get Support
                      </a>
                    </Button>
                    <Button variant="outline" className="w-full justify-start bg-transparent" asChild>
                      <a href="/events">
                        <Users className="h-4 w-4 mr-2" />
                        Upcoming Events
                      </a>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  )
}
