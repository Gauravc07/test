import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Calendar, Clock, ArrowRight, Search } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

const blogPosts = [
  {
    id: 1,
    title: "10 Tips to Boost Your Influencer Engagement Rate",
    excerpt:
      "Learn proven strategies to increase your engagement and attract more brand collaborations on Shor platform.",
    category: "Creator Tips",
    author: "Priya Sharma",
    date: "2025-01-15",
    readTime: "5 min read",
    image: "/influencer-creating-content.jpg",
    featured: true,
  },
  {
    id: 2,
    title: "How Brands Can Find the Perfect Influencer Match",
    excerpt:
      "A comprehensive guide to using Shor's advanced filters and AI recommendations to discover ideal creator partnerships.",
    category: "Brand Strategy",
    author: "Rahul Verma",
    date: "2025-01-12",
    readTime: "7 min read",
    image: "/brand-marketing-team-meeting.jpg",
    featured: true,
  },
  {
    id: 3,
    title: "Understanding Your Shor Score: What It Means",
    excerpt: "Deep dive into how the Shor Score is calculated and actionable steps to improve your credibility rating.",
    category: "Platform Guide",
    author: "Ananya Patel",
    date: "2025-01-10",
    readTime: "6 min read",
    image: "/analytics-dashboard.png",
    featured: false,
  },
  {
    id: 4,
    title: "Success Story: From 10K to 100K Followers",
    excerpt:
      "How creator Neha Kapoor leveraged Shor collaborations to grow her audience and income by 10x in 6 months.",
    category: "Success Stories",
    author: "Shor Team",
    date: "2025-01-08",
    readTime: "8 min read",
    image: "/successful-female-influencer.jpg",
    featured: false,
  },
  {
    id: 5,
    title: "Campaign Budget Planning: A Brand's Guide",
    excerpt: "Learn how to allocate your influencer marketing budget effectively using Shor's smart budget estimator.",
    category: "Brand Strategy",
    author: "Vikram Singh",
    date: "2025-01-05",
    readTime: "6 min read",
    image: "/budget-planning-spreadsheet.jpg",
    featured: false,
  },
  {
    id: 6,
    title: "The Future of Creator Economy in India",
    excerpt: "Exploring trends, opportunities, and predictions for influencer marketing in the Indian market for 2025.",
    category: "Industry Insights",
    author: "Dr. Meera Reddy",
    date: "2025-01-03",
    readTime: "10 min read",
    image: "/future-technology-india.jpg",
    featured: false,
  },
]

const categories = ["All", "Creator Tips", "Brand Strategy", "Platform Guide", "Success Stories", "Industry Insights"]

export default function BlogPage() {
  const featuredPosts = blogPosts.filter((post) => post.featured)
  const regularPosts = blogPosts.filter((post) => !post.featured)

  return (
    <main className="min-h-screen bg-background">
      <Navigation />

      {/* Hero Section */}
      <section className="pt-32 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <Badge className="mb-4 bg-primary/10 text-primary hover:bg-primary/20">Shor Blog</Badge>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 text-balance">
              Insights for Creators & Brands
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground mb-8 text-balance">
              Tips, strategies, and stories to help you succeed in the creator economy
            </p>

            {/* Search Bar */}
            <div className="relative max-w-xl mx-auto">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input type="search" placeholder="Search articles..." className="pl-12 h-12 bg-card border-border" />
            </div>
          </div>

          {/* Category Filters */}
          <div className="flex flex-wrap gap-2 justify-center mb-12">
            {categories.map((category) => (
              <Button key={category} variant={category === "All" ? "default" : "outline"} className="rounded-full">
                {category}
              </Button>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Posts */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 bg-muted/30">
        <div className="container mx-auto max-w-7xl">
          <h2 className="text-3xl font-bold mb-8">Featured Articles</h2>
          <div className="grid md:grid-cols-2 gap-8">
            {featuredPosts.map((post) => (
              <Card key={post.id} className="overflow-hidden group hover:shadow-xl transition-all duration-300">
                <div className="relative h-64 overflow-hidden">
                  <Image
                    src={post.image || "/placeholder.svg"}
                    alt={post.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <Badge className="absolute top-4 left-4 bg-primary text-primary-foreground">{post.category}</Badge>
                </div>
                <CardHeader>
                  <CardTitle className="text-2xl group-hover:text-primary transition-colors">{post.title}</CardTitle>
                  <CardDescription className="text-base">{post.excerpt}</CardDescription>
                </CardHeader>
                <CardFooter className="flex items-center justify-between">
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {new Date(post.date).toLocaleDateString("en-IN", {
                        month: "short",
                        day: "numeric",
                      })}
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {post.readTime}
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" className="group/btn" asChild>
                    <Link href={`/blog/${post.id}`}>
                      Read More
                      <ArrowRight className="ml-2 h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Regular Posts */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto max-w-7xl">
          <h2 className="text-3xl font-bold mb-8">Latest Articles</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {regularPosts.map((post) => (
              <Card key={post.id} className="overflow-hidden group hover:shadow-lg transition-all duration-300">
                <div className="relative h-48 overflow-hidden">
                  <Image
                    src={post.image || "/placeholder.svg"}
                    alt={post.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <CardHeader>
                  <Badge variant="secondary" className="w-fit mb-2">
                    {post.category}
                  </Badge>
                  <CardTitle className="text-xl group-hover:text-primary transition-colors line-clamp-2">
                    {post.title}
                  </CardTitle>
                  <CardDescription className="line-clamp-2">{post.excerpt}</CardDescription>
                </CardHeader>
                <CardFooter className="flex flex-col gap-3">
                  <div className="flex items-center gap-3 text-sm text-muted-foreground w-full">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5" />
                      {new Date(post.date).toLocaleDateString("en-IN", {
                        month: "short",
                        day: "numeric",
                      })}
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" />
                      {post.readTime}
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className="w-full group/btn bg-transparent" asChild>
                    <Link href={`/blog/${post.id}`}>
                      Read Article
                      <ArrowRight className="ml-2 h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter CTA */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-primary/5">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-3xl font-bold mb-4">Stay Updated</h2>
          <p className="text-lg text-muted-foreground mb-8">
            Get the latest creator economy insights, platform updates, and success stories delivered to your inbox.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <Input type="email" placeholder="Enter your email" className="flex-1 h-12" />
            <Button size="lg" className="sm:w-auto">
              Subscribe
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
