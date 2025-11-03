"use client"

import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Slider } from "@/components/ui/slider"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import {
  Search,
  Filter,
  Bookmark,
  BookmarkCheck,
  MapPin,
  Calendar,
  DollarSign,
  Users,
  TrendingUp,
  Send,
  Bell,
  X,
} from "lucide-react"
import { useState } from "react"
import Image from "next/image"

const campaigns = [
  {
    id: 1,
    brand: "Fashion Nova",
    logo: "/tech-company-logo.jpg",
    title: "Summer Fashion Collection Launch",
    description: "Looking for fashion influencers to showcase our new summer collection with authentic styling tips.",
    category: "Fashion",
    type: "Paid",
    budget: "₹15,000 - ₹25,000",
    budgetMin: 15000,
    budgetMax: 25000,
    location: "Mumbai, India",
    deadline: "2025-02-15",
    followers: "50K+",
    deliverables: ["3 Instagram Reels", "5 Instagram Stories", "1 YouTube Short"],
    requirements: ["Fashion niche", "Female creators", "Mumbai based preferred"],
    applicants: 24,
    saved: false,
    featured: true,
    postedDate: "2025-01-20",
  },
  {
    id: 2,
    brand: "Nykaa",
    logo: "/abstract-fashion-logo.png",
    title: "Beauty Product Review Campaign",
    description: "Seeking beauty creators for honest reviews of our new skincare line with detailed tutorials.",
    category: "Beauty",
    type: "Paid",
    budget: "₹20,000 - ₹35,000",
    budgetMin: 20000,
    budgetMax: 35000,
    location: "Pan India",
    deadline: "2025-02-20",
    followers: "100K+",
    deliverables: ["2 YouTube Videos", "10 Instagram Stories", "3 Instagram Posts"],
    requirements: ["Beauty/Skincare niche", "Detailed reviews", "High engagement rate"],
    applicants: 42,
    saved: true,
    featured: true,
    postedDate: "2025-01-18",
  },
  {
    id: 3,
    brand: "Swiggy",
    logo: "/fitness-brand-logo.png",
    title: "Food Delivery App Promotion",
    description: "Partner with us to create engaging food content showcasing Swiggy's quick delivery service.",
    category: "Food",
    type: "Paid",
    budget: "₹10,000 - ₹18,000",
    budgetMin: 10000,
    budgetMax: 18000,
    location: "Bangalore, Delhi, Mumbai",
    deadline: "2025-02-10",
    followers: "25K+",
    deliverables: ["5 Instagram Reels", "10 Instagram Stories"],
    requirements: ["Food/Lifestyle niche", "Local creators", "Quick turnaround"],
    applicants: 18,
    saved: false,
    featured: false,
    postedDate: "2025-01-22",
  },
  {
    id: 4,
    brand: "Boat",
    logo: "/tech-company-logo.jpg",
    title: "Tech Gadget Unboxing Series",
    description: "Looking for tech reviewers to create unboxing and review content for our latest audio products.",
    category: "Technology",
    type: "Barter",
    budget: "Product Worth ₹5,000",
    budgetMin: 0,
    budgetMax: 5000,
    location: "Pan India",
    deadline: "2025-02-25",
    followers: "30K+",
    deliverables: ["1 YouTube Video", "3 Instagram Reels", "5 Instagram Stories"],
    requirements: ["Tech niche", "Detailed reviews", "Professional editing"],
    applicants: 31,
    saved: false,
    featured: false,
    postedDate: "2025-01-19",
  },
  {
    id: 5,
    brand: "Myntra",
    logo: "/abstract-fashion-logo.png",
    title: "Ethnic Wear Styling Campaign",
    description: "Collaborate with us to create styling guides for our ethnic wear collection for festive season.",
    category: "Fashion",
    type: "Paid",
    budget: "₹18,000 - ₹30,000",
    budgetMin: 18000,
    budgetMax: 30000,
    location: "Delhi, Jaipur",
    deadline: "2025-02-18",
    followers: "75K+",
    deliverables: ["4 Instagram Reels", "8 Instagram Posts", "1 YouTube Video"],
    requirements: ["Fashion niche", "Ethnic wear styling", "High-quality photography"],
    applicants: 28,
    saved: true,
    featured: false,
    postedDate: "2025-01-21",
  },
]

export default function CampaignDiscoveryPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [selectedType, setSelectedType] = useState("all")
  const [selectedLocation, setSelectedLocation] = useState("all")
  const [budgetRange, setBudgetRange] = useState([0, 50000])
  const [showFilters, setShowFilters] = useState(false)
  const [savedCampaigns, setSavedCampaigns] = useState<number[]>([2, 5])
  const [selectedCampaign, setSelectedCampaign] = useState<(typeof campaigns)[0] | null>(null)
  const [showApplicationDialog, setShowApplicationDialog] = useState(false)
  const [applicationMessage, setApplicationMessage] = useState("")

  const categories = ["All", "Fashion", "Beauty", "Food", "Technology", "Lifestyle", "Fitness", "Travel"]
  const types = ["All", "Paid", "Barter", "Affiliate"]
  const locations = ["All", "Pan India", "Mumbai", "Delhi", "Bangalore", "Pune", "Hyderabad"]

  const toggleSave = (campaignId: number) => {
    setSavedCampaigns((prev) =>
      prev.includes(campaignId) ? prev.filter((id) => id !== campaignId) : [...prev, campaignId],
    )
  }

  const handleApply = (campaign: (typeof campaigns)[0]) => {
    setSelectedCampaign(campaign)
    setShowApplicationDialog(true)
  }

  const submitApplication = () => {
    // Handle application submission
    setShowApplicationDialog(false)
    setApplicationMessage("")
    setSelectedCampaign(null)
  }

  const filteredCampaigns = campaigns.filter((campaign) => {
    const matchesSearch =
      campaign.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      campaign.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
      campaign.description.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesCategory = selectedCategory === "all" || campaign.category === selectedCategory
    const matchesType = selectedType === "all" || campaign.type === selectedType
    const matchesLocation = selectedLocation === "all" || campaign.location.includes(selectedLocation)
    const matchesBudget = campaign.budgetMin >= budgetRange[0] && campaign.budgetMax <= budgetRange[1]

    return matchesSearch && matchesCategory && matchesType && matchesLocation && matchesBudget
  })

  return (
    <main className="min-h-screen bg-background">
      <Navigation />

      <div className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto max-w-7xl">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-4xl font-bold mb-2">Discover Campaigns</h1>
                <p className="text-lg text-muted-foreground">
                  Find brand collaborations that match your niche and audience
                </p>
              </div>
              <Button variant="outline" size="sm">
                <Bell className="h-4 w-4 mr-2" />
                Notifications
                <Badge className="ml-2 bg-primary text-primary-foreground">3</Badge>
              </Button>
            </div>

            {/* Search and Filter Bar */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search campaigns, brands, or keywords..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-12"
                />
              </div>
              <Button variant="outline" onClick={() => setShowFilters(!showFilters)} className="h-12">
                <Filter className="h-4 w-4 mr-2" />
                Filters
                {showFilters && <X className="h-4 w-4 ml-2" />}
              </Button>
              <Button variant="outline" className="h-12 bg-transparent">
                <BookmarkCheck className="h-4 w-4 mr-2" />
                Saved ({savedCampaigns.length})
              </Button>
            </div>
          </div>

          {/* Filters Panel */}
          {showFilters && (
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Filter Campaigns</CardTitle>
                <CardDescription>Narrow down campaigns based on your preferences</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="space-y-2">
                    <Label>Category</Label>
                    <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((cat) => (
                          <SelectItem key={cat} value={cat.toLowerCase()}>
                            {cat}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Campaign Type</Label>
                    <Select value={selectedType} onValueChange={setSelectedType}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {types.map((type) => (
                          <SelectItem key={type} value={type.toLowerCase()}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Location</Label>
                    <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {locations.map((loc) => (
                          <SelectItem key={loc} value={loc.toLowerCase()}>
                            {loc}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>
                      Budget Range: ₹{budgetRange[0].toLocaleString()} - ₹{budgetRange[1].toLocaleString()}
                    </Label>
                    <Slider
                      value={budgetRange}
                      onValueChange={setBudgetRange}
                      max={50000}
                      step={1000}
                      className="mt-2"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Results Count */}
          <div className="flex items-center justify-between mb-6">
            <p className="text-sm text-muted-foreground">
              Showing {filteredCampaigns.length} campaign{filteredCampaigns.length !== 1 ? "s" : ""}
            </p>
            <Select defaultValue="recent">
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="recent">Most Recent</SelectItem>
                <SelectItem value="budget-high">Highest Budget</SelectItem>
                <SelectItem value="budget-low">Lowest Budget</SelectItem>
                <SelectItem value="deadline">Deadline Soon</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Campaign Cards */}
          <div className="grid lg:grid-cols-2 gap-6">
            {filteredCampaigns.map((campaign) => (
              <Card
                key={campaign.id}
                className={`overflow-hidden hover:shadow-lg transition-all ${
                  campaign.featured ? "border-primary/50 bg-primary/5" : ""
                }`}
              >
                <CardHeader>
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="relative h-12 w-12 rounded-lg overflow-hidden bg-muted">
                        <Image
                          src={campaign.logo || "/placeholder.svg"}
                          alt={campaign.brand}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div>
                        <CardTitle className="text-xl">{campaign.title}</CardTitle>
                        <p className="text-sm text-muted-foreground">{campaign.brand}</p>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => toggleSave(campaign.id)} className="shrink-0">
                      {savedCampaigns.includes(campaign.id) ? (
                        <BookmarkCheck className="h-5 w-5 fill-primary text-primary" />
                      ) : (
                        <Bookmark className="h-5 w-5" />
                      )}
                    </Button>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-3">
                    <Badge variant="secondary">{campaign.category}</Badge>
                    <Badge
                      className={
                        campaign.type === "Paid"
                          ? "bg-green-500/10 text-green-500 hover:bg-green-500/20"
                          : "bg-blue-500/10 text-blue-500 hover:bg-blue-500/20"
                      }
                    >
                      {campaign.type}
                    </Badge>
                    {campaign.featured && (
                      <Badge className="bg-primary/10 text-primary hover:bg-primary/20">Featured</Badge>
                    )}
                  </div>

                  <CardDescription className="text-base">{campaign.description}</CardDescription>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-2 text-sm">
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{campaign.budget}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span>{campaign.followers} followers</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span>{campaign.location}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span>
                        {new Date(campaign.deadline).toLocaleDateString("en-IN", {
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm font-medium mb-2">Deliverables:</p>
                    <div className="flex flex-wrap gap-2">
                      {campaign.deliverables.map((item, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {item}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="text-sm font-medium mb-2">Requirements:</p>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      {campaign.requirements.map((req, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <span className="text-primary mt-1">•</span>
                          {req}
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>

                <CardFooter className="flex items-center justify-between border-t pt-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <TrendingUp className="h-4 w-4" />
                    <span>{campaign.applicants} applicants</span>
                  </div>
                  <Button onClick={() => handleApply(campaign)}>
                    <Send className="h-4 w-4 mr-2" />
                    Apply Now
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>

          {filteredCampaigns.length === 0 && (
            <Card className="p-12 text-center">
              <div className="max-w-md mx-auto">
                <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">No campaigns found</h3>
                <p className="text-muted-foreground mb-4">
                  Try adjusting your filters or search terms to find more campaigns
                </p>
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchQuery("")
                    setSelectedCategory("all")
                    setSelectedType("all")
                    setSelectedLocation("all")
                    setBudgetRange([0, 50000])
                  }}
                >
                  Clear Filters
                </Button>
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* Application Dialog */}
      <Dialog open={showApplicationDialog} onOpenChange={setShowApplicationDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Apply to Campaign</DialogTitle>
            <DialogDescription>
              Submit your application for {selectedCampaign?.title} by {selectedCampaign?.brand}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="pitch">Your Pitch</Label>
              <Textarea
                id="pitch"
                placeholder="Tell the brand why you're the perfect fit for this campaign..."
                value={applicationMessage}
                onChange={(e) => setApplicationMessage(e.target.value)}
                rows={6}
              />
              <p className="text-xs text-muted-foreground">
                Highlight your relevant experience, audience demographics, and creative ideas
              </p>
            </div>

            <div className="space-y-2">
              <Label>Portfolio Links (Optional)</Label>
              <Input placeholder="Link to similar past work..." />
            </div>

            <div className="space-y-2">
              <Label>Expected Deliverables</Label>
              <div className="space-y-2">
                {selectedCampaign?.deliverables.map((item, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Checkbox id={`deliverable-${index}`} defaultChecked />
                    <Label htmlFor={`deliverable-${index}`} className="font-normal">
                      {item}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowApplicationDialog(false)}>
              Cancel
            </Button>
            <Button onClick={submitApplication} disabled={!applicationMessage.trim()}>
              Submit Application
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Footer />
    </main>
  )
}
