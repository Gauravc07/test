"use client"

import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Instagram,
  Youtube,
  Twitter,
  MapPin,
  Users,
  TrendingUp,
  Award,
  Star,
  Edit,
  CheckCircle2,
  Camera,
  BarChart3,
  Heart,
  MessageCircle,
  Share2,
} from "lucide-react"
import { useState } from "react"
import Image from "next/image"

export default function CreatorProfilePage() {
  const [isEditing, setIsEditing] = useState(false)

  // Mock creator data
  const creator = {
    name: "Priya Sharma",
    username: "@priyasharma",
    avatar: "/indian-woman-creator.jpg",
    coverImage: "/creator-cover-image.jpg",
    bio: "Fashion & Lifestyle Creator | Helping you find your style | Collaborating with brands that inspire ✨",
    location: "Mumbai, India",
    verified: true,
    shorScore: 87,
    level: "Elite Creator",
    joinedDate: "January 2024",
    categories: ["Fashion", "Lifestyle", "Beauty"],
    followers: {
      instagram: 125000,
      youtube: 45000,
      twitter: 32000,
    },
    engagementRate: 4.8,
    avgViews: 85000,
    collaborations: 24,
    rating: 4.9,
    reviews: 18,
  }

  const portfolio = [
    {
      id: 1,
      brand: "Fashion Nova",
      type: "Instagram Reel",
      image: "/fashion-reel-1.jpg",
      likes: 12500,
      comments: 340,
      shares: 890,
      date: "2025-01-10",
    },
    {
      id: 2,
      brand: "Nykaa",
      type: "YouTube Video",
      image: "/beauty-video-1.jpg",
      likes: 8900,
      comments: 520,
      shares: 450,
      date: "2025-01-05",
    },
    {
      id: 3,
      brand: "Myntra",
      type: "Instagram Post",
      image: "/fashion-post-1.jpg",
      likes: 15200,
      comments: 280,
      shares: 620,
      date: "2024-12-28",
    },
    {
      id: 4,
      brand: "Sugar Cosmetics",
      type: "Instagram Story",
      image: "/beauty-story-1.jpg",
      likes: 9800,
      comments: 190,
      shares: 340,
      date: "2024-12-20",
    },
  ]

  const achievements = [
    { id: 1, title: "Top Creator", description: "Ranked in top 10% of creators", icon: Award, unlocked: true },
    { id: 2, title: "100K Milestone", description: "Reached 100K followers", icon: Users, unlocked: true },
    { id: 3, title: "Brand Favorite", description: "10+ successful collaborations", icon: Star, unlocked: true },
    { id: 4, title: "Engagement Master", description: "5%+ engagement rate", icon: TrendingUp, unlocked: true },
    { id: 5, title: "Rising Star", description: "50% growth in 3 months", icon: TrendingUp, unlocked: false },
    { id: 6, title: "Content King", description: "100+ posts published", icon: Camera, unlocked: false },
  ]

  const reviews = [
    {
      id: 1,
      brand: "Fashion Nova",
      rating: 5,
      comment: "Excellent collaboration! Priya delivered high-quality content on time and exceeded our expectations.",
      date: "2025-01-12",
    },
    {
      id: 2,
      brand: "Nykaa",
      rating: 5,
      comment: "Professional and creative. Her audience engagement was outstanding. Highly recommend!",
      date: "2025-01-08",
    },
    {
      id: 3,
      brand: "Myntra",
      rating: 4,
      comment: "Great work! Very responsive and easy to work with. Looking forward to future collaborations.",
      date: "2024-12-30",
    },
  ]

  return (
    <main className="min-h-screen bg-background">
      <Navigation />

      {/* Cover Image */}
      <div className="relative h-64 sm:h-80 lg:h-96 w-full mt-16">
        <Image
          src={creator.coverImage || "/placeholder.svg?height=400&width=1200"}
          alt="Cover"
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
        {isEditing && (
          <Button size="sm" className="absolute bottom-4 right-4" variant="secondary">
            <Camera className="h-4 w-4 mr-2" />
            Change Cover
          </Button>
        )}
      </div>

      {/* Profile Header */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 -mt-20 relative z-10">
        <div className="flex flex-col md:flex-row gap-6 items-start md:items-end mb-8">
          <div className="relative">
            <Avatar className="h-32 w-32 border-4 border-background shadow-xl">
              <AvatarImage src={creator.avatar || "/placeholder.svg"} alt={creator.name} />
              <AvatarFallback>{creator.name.charAt(0)}</AvatarFallback>
            </Avatar>
            {isEditing && (
              <Button size="icon" className="absolute bottom-0 right-0 h-8 w-8 rounded-full" variant="secondary">
                <Camera className="h-4 w-4" />
              </Button>
            )}
          </div>

          <div className="flex-1">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold">{creator.name}</h1>
              {creator.verified && (
                <Badge className="w-fit bg-primary/10 text-primary hover:bg-primary/20">
                  <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                  Verified
                </Badge>
              )}
              <Badge variant="secondary" className="w-fit">
                {creator.level}
              </Badge>
            </div>
            <p className="text-muted-foreground mb-2">{creator.username}</p>
            <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
              <div className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                {creator.location}
              </div>
              <div>Joined {creator.joinedDate}</div>
            </div>
            <p className="text-base max-w-2xl mb-4">{creator.bio}</p>
            <div className="flex flex-wrap gap-2 mb-4">
              {creator.categories.map((category) => (
                <Badge key={category} variant="outline">
                  {category}
                </Badge>
              ))}
            </div>
          </div>

          <div className="flex gap-2">
            {isEditing ? (
              <>
                <Button onClick={() => setIsEditing(false)}>Save Changes</Button>
                <Button variant="outline" onClick={() => setIsEditing(false)}>
                  Cancel
                </Button>
              </>
            ) : (
              <Button onClick={() => setIsEditing(true)}>
                <Edit className="h-4 w-4 mr-2" />
                Edit Profile
              </Button>
            )}
          </div>
        </div>

        {/* Shor Score Card */}
        <Card className="mb-8 bg-gradient-to-br from-primary/10 via-primary/5 to-background border-primary/20">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl">Shor Score</CardTitle>
                <CardDescription>Your credibility and performance rating</CardDescription>
              </div>
              <div className="text-right">
                <div className="text-5xl font-bold text-primary">{creator.shorScore}</div>
                <p className="text-sm text-muted-foreground">out of 100</p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Progress value={creator.shorScore} className="h-3 mb-4" />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Engagement</p>
                <p className="text-2xl font-bold">{creator.engagementRate}%</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Collaborations</p>
                <p className="text-2xl font-bold">{creator.collaborations}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Rating</p>
                <p className="text-2xl font-bold flex items-center gap-1">
                  {creator.rating}
                  <Star className="h-5 w-5 fill-primary text-primary" />
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Reviews</p>
                <p className="text-2xl font-bold">{creator.reviews}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Social Stats */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Instagram</CardTitle>
              <Instagram className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{(creator.followers.instagram / 1000).toFixed(0)}K</div>
              <p className="text-xs text-muted-foreground">Followers</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">YouTube</CardTitle>
              <Youtube className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{(creator.followers.youtube / 1000).toFixed(0)}K</div>
              <p className="text-xs text-muted-foreground">Subscribers</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Twitter</CardTitle>
              <Twitter className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{(creator.followers.twitter / 1000).toFixed(0)}K</div>
              <p className="text-xs text-muted-foreground">Followers</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Avg Views</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{(creator.avgViews / 1000).toFixed(0)}K</div>
              <p className="text-xs text-muted-foreground">Per Post</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs Section */}
        <Tabs defaultValue="portfolio" className="mb-16">
          <TabsList className="grid w-full grid-cols-3 lg:w-auto">
            <TabsTrigger value="portfolio">Portfolio</TabsTrigger>
            <TabsTrigger value="achievements">Achievements</TabsTrigger>
            <TabsTrigger value="reviews">Reviews</TabsTrigger>
          </TabsList>

          <TabsContent value="portfolio" className="mt-6">
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {portfolio.map((item) => (
                <Card key={item.id} className="overflow-hidden group hover:shadow-lg transition-all">
                  <div className="relative h-64 overflow-hidden">
                    <Image
                      src={item.image || "/placeholder.svg?height=300&width=300"}
                      alt={item.brand}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="absolute bottom-4 left-4 right-4">
                        <Badge className="mb-2">{item.type}</Badge>
                        <p className="text-white font-semibold">{item.brand}</p>
                      </div>
                    </div>
                  </div>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Heart className="h-4 w-4" />
                        {(item.likes / 1000).toFixed(1)}K
                      </div>
                      <div className="flex items-center gap-1">
                        <MessageCircle className="h-4 w-4" />
                        {item.comments}
                      </div>
                      <div className="flex items-center gap-1">
                        <Share2 className="h-4 w-4" />
                        {item.shares}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="achievements" className="mt-6">
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {achievements.map((achievement) => {
                const Icon = achievement.icon
                return (
                  <Card
                    key={achievement.id}
                    className={`${achievement.unlocked ? "border-primary/50 bg-primary/5" : "opacity-60"}`}
                  >
                    <CardHeader>
                      <div className="flex items-center gap-4">
                        <div
                          className={`h-12 w-12 rounded-full flex items-center justify-center ${
                            achievement.unlocked ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"
                          }`}
                        >
                          <Icon className="h-6 w-6" />
                        </div>
                        <div className="flex-1">
                          <CardTitle className="text-lg">{achievement.title}</CardTitle>
                          <CardDescription>{achievement.description}</CardDescription>
                        </div>
                        {achievement.unlocked && <CheckCircle2 className="h-5 w-5 text-primary" />}
                      </div>
                    </CardHeader>
                  </Card>
                )
              })}
            </div>
          </TabsContent>

          <TabsContent value="reviews" className="mt-6">
            <div className="space-y-6">
              {reviews.map((review) => (
                <Card key={review.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{review.brand}</CardTitle>
                        <div className="flex items-center gap-1 mt-1">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={`h-4 w-4 ${
                                i < review.rating ? "fill-primary text-primary" : "text-muted-foreground"
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {new Date(review.date).toLocaleDateString("en-IN", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{review.comment}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <Footer />
    </main>
  )
}
