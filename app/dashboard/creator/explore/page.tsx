"use client"

import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { InfluencerSidebar } from "@/components/influencer-sidebar"
import { InfluencerHeader } from "@/components/influencer-header"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { QuickApplyModal } from "@/components/quick-apply-modal"
import { PreviewBriefModal } from "@/components/preview-brief-modal"
import {
  Search,
  Sparkles,
  DollarSign,
  Calendar,
  MapPin,
  TrendingUp,
  Heart,
  Info,
  Grid3x3,
  List,
  SlidersHorizontal,
  CheckCircle2,
  Instagram,
  Youtube,
  Video,
} from "lucide-react"
import Image from "next/image"

export default function ExploreBrandsPage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [platformFilter, setPlatformFilter] = useState("all")
  const [locationFilter, setLocationFilter] = useState("all")
  const [payRange, setPayRange] = useState([0, 100000])
  const [sortBy, setSortBy] = useState("match")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [showFilters, setShowFilters] = useState(false)
  const [savedBrands, setSavedBrands] = useState<number[]>([])
  const [appliedBrands, setAppliedBrands] = useState<number[]>([])
  const [selectedBrand, setSelectedBrand] = useState<any>(null)
  const [showApplyModal, setShowApplyModal] = useState(false)
  const [showPreviewModal, setShowPreviewModal] = useState(false)

  useEffect(() => {
    if (!isLoading && (!user || user.role !== "creator")) {
      router.push("/auth/login")
    }
  }, [user, isLoading, router])

  if (isLoading || !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-blue-950 to-black flex items-center justify-center">
        <div className="text-white text-sm sm:text-base">Loading...</div>
      </div>
    )
  }

  const brands = [
    {
      id: 1,
      name: "Urbanic Fashion",
      logo: "/urbanic-logo.jpg",
      category: "Fashion & Lifestyle",
      description: "Promote Urbanic's Fall Collection via 1 Reel + 1 Story",
      payRange: "₹20,000 - ₹35,000",
      payMin: 20000,
      payMax: 35000,
      duration: "2 weeks",
      location: "Pan India",
      match: 95,
      trending: true,
      platforms: ["Instagram"],
      deliverables: ["1 Reel", "1 Story", "2 Posts"],
      matchReasons: [
        "92% of your audience matches Urbanic's target demographic",
        "Your average engagement (8.7%) exceeds campaign's 6% minimum",
        "You've collaborated with similar fashion brands before",
      ],
      objectives: "Increase brand awareness for Fall Collection among Gen-Z audience",
      timeline: "Application deadline: Dec 31, 2024 | Campaign starts: Jan 5, 2025",
      terms: "Exclusive partnership for fashion brands during campaign period. Content usage rights for 1 year.",
      brandStats: {
        avgEngagement: "7.2%",
        totalCampaigns: 45,
        rating: 4.8,
      },
    },
    {
      id: 2,
      name: "FitLife Nutrition",
      logo: "/fitness-logo.png",
      category: "Sports & Fitness",
      description: "Seeking fitness creators for our new protein powder launch",
      payRange: "₹25,000 - ₹40,000",
      payMin: 25000,
      payMax: 40000,
      duration: "3 weeks",
      location: "Mumbai, Delhi",
      match: 92,
      trending: true,
      platforms: ["Instagram", "YouTube"],
      deliverables: ["2 Reels", "1 YouTube Video", "3 Stories"],
      matchReasons: [
        "High audience overlap in fitness niche",
        "Strong engagement rate on workout content",
        "Previous supplement brand collaborations performed well",
      ],
      objectives: "Drive product awareness and sales for new protein powder line",
      timeline: "Application deadline: Jan 15, 2025 | Campaign starts: Jan 20, 2025",
      terms: "Non-exclusive. Content usage rights for 2 years. Affiliate commission available.",
      brandStats: {
        avgEngagement: "8.5%",
        totalCampaigns: 32,
        rating: 4.9,
      },
    },
    {
      id: 3,
      name: "TechGear Pro",
      logo: "/abstract-tech-logo.png",
      category: "Technology",
      description: "Tech reviewers needed for our latest smartphone launch campaign",
      payRange: "₹30,000 - ₹50,000",
      payMin: 30000,
      payMax: 50000,
      duration: "3 weeks",
      location: "Remote",
      match: 88,
      trending: false,
      platforms: ["YouTube", "Instagram"],
      deliverables: ["1 YouTube Review", "2 Instagram Posts", "1 Blog Post"],
      matchReasons: [
        "Tech-savvy audience demographic match",
        "High video content engagement",
        "Previous tech review experience",
      ],
      objectives: "Generate buzz and reviews for new smartphone launch",
      timeline: "Application deadline: Jan 10, 2025 | Campaign starts: Jan 15, 2025",
      terms: "Product provided for review. Honest review required. Content usage rights for 1 year.",
      brandStats: {
        avgEngagement: "6.8%",
        totalCampaigns: 28,
        rating: 4.7,
      },
    },
    {
      id: 4,
      name: "GlowUp Beauty",
      logo: "/beauty-logo.png",
      category: "Beauty & Cosmetics",
      description: "Beauty influencers for our summer skincare collection showcase",
      payRange: "₹18,000 - ₹28,000",
      payMin: 18000,
      payMax: 28000,
      duration: "10 days",
      location: "Bangalore",
      match: 85,
      trending: false,
      platforms: ["Instagram", "TikTok"],
      deliverables: ["4 Instagram Posts", "6 Stories", "2 Reels"],
      matchReasons: [
        "Beauty content engagement above average",
        "Target audience age group match",
        "Previous skincare brand partnerships",
      ],
      objectives: "Showcase summer skincare routine with our products",
      timeline: "Application deadline: Dec 28, 2024 | Campaign starts: Jan 2, 2025",
      terms: "Exclusive for skincare brands during campaign. Content usage rights for 6 months.",
      brandStats: {
        avgEngagement: "9.1%",
        totalCampaigns: 52,
        rating: 4.6,
      },
    },
    {
      id: 5,
      name: "Wanderlust Travel",
      logo: "/abstract-travel-logo.png",
      category: "Travel & Tourism",
      description: "Travel influencers for exotic destination promotion",
      payRange: "₹40,000 - ₹60,000",
      payMin: 40000,
      payMax: 60000,
      duration: "1 month",
      location: "Goa, Kerala",
      match: 90,
      trending: true,
      platforms: ["Instagram", "YouTube"],
      deliverables: ["10 Instagram Posts", "15 Stories", "3 Reels", "1 Vlog"],
      matchReasons: [
        "Travel content performs exceptionally well",
        "Audience interested in domestic tourism",
        "High-quality photography and videography",
      ],
      objectives: "Promote luxury resort destinations in South India",
      timeline: "Application deadline: Jan 5, 2025 | Campaign starts: Jan 15, 2025",
      terms: "All-expenses-paid trip included. Content usage rights for 2 years.",
      brandStats: {
        avgEngagement: "7.9%",
        totalCampaigns: 38,
        rating: 4.8,
      },
    },
    {
      id: 6,
      name: "FoodieHub",
      logo: "/diverse-food-logo.png",
      category: "Food & Beverage",
      description: "Food bloggers wanted for restaurant chain promotion",
      payRange: "₹12,000 - ₹20,000",
      payMin: 12000,
      payMax: 20000,
      duration: "1 week",
      location: "Delhi NCR",
      match: 78,
      trending: false,
      platforms: ["Instagram"],
      deliverables: ["3 Instagram Posts", "5 Stories"],
      matchReasons: [
        "Food content engagement is strong",
        "Local audience in Delhi NCR",
        "Previous restaurant collaborations",
      ],
      objectives: "Drive foot traffic to new restaurant locations",
      timeline: "Application deadline: Dec 30, 2024 | Campaign starts: Jan 3, 2025",
      terms: "Complimentary meals provided. Content usage rights for 1 year.",
      brandStats: {
        avgEngagement: "8.3%",
        totalCampaigns: 41,
        rating: 4.5,
      },
    },
  ]

  const filteredBrands = brands
    .filter((brand) => {
      const matchesSearch =
        brand.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        brand.description.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesCategory =
        categoryFilter === "all" || brand.category.toLowerCase().includes(categoryFilter.toLowerCase())
      const matchesPlatform =
        platformFilter === "all" || brand.platforms.some((p) => p.toLowerCase() === platformFilter.toLowerCase())
      const matchesLocation =
        locationFilter === "all" || brand.location.toLowerCase().includes(locationFilter.toLowerCase())
      const matchesPayRange = brand.payMin >= payRange[0] && brand.payMax <= payRange[1]

      return matchesSearch && matchesCategory && matchesPlatform && matchesLocation && matchesPayRange
    })
    .sort((a, b) => {
      if (sortBy === "match") return b.match - a.match
      if (sortBy === "pay-high") return b.payMax - a.payMax
      if (sortBy === "pay-low") return a.payMin - b.payMin
      return 0
    })

  const toggleSave = (brandId: number) => {
    setSavedBrands((prev) => (prev.includes(brandId) ? prev.filter((id) => id !== brandId) : [...prev, brandId]))
  }

  const handleApply = (brand: any) => {
    setSelectedBrand(brand)
    setShowApplyModal(true)
  }

  const handlePreview = (brand: any) => {
    setSelectedBrand(brand)
    setShowPreviewModal(true)
  }

  const handleApplySuccess = () => {
    if (selectedBrand) {
      setAppliedBrands((prev) => [...prev, selectedBrand.id])
    }
    setShowApplyModal(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-blue-950 to-black">
      <InfluencerSidebar />

      <div className="lg:pl-64">
        <InfluencerHeader />

        <main className="p-3 sm:p-4 lg:p-6 space-y-4 sm:space-y-6">
          <div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white">Explore Brands</h1>
            <p className="text-gray-400 mt-1 text-xs sm:text-sm lg:text-base">
              Discover brand partnerships tailored for you
            </p>
          </div>

          <Card className="bg-gradient-to-r from-purple-600 to-blue-600 border-0 p-4 sm:p-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <div>
                <h3 className="text-white font-bold text-sm sm:text-base lg:text-lg">AI-Powered Recommendations</h3>
                <p className="text-blue-100 text-xs sm:text-sm">
                  We've found {filteredBrands.filter((b) => b.match >= 85).length} brands that match your profile
                  perfectly
                </p>
              </div>
            </div>
          </Card>

          <Card className="bg-[#0f1629]/50 border-white/10 p-3 sm:p-4">
            <div className="space-y-3 sm:space-y-4">
              {/* Search and View Toggle */}
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="Search brands or campaigns..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 bg-[#1a1f35] border-white/10 text-white text-xs sm:text-sm"
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowFilters(!showFilters)}
                    className="border-white/20 text-white hover:bg-white/10 bg-transparent text-xs sm:text-sm"
                  >
                    <SlidersHorizontal className="w-4 h-4 mr-2" />
                    Filters
                  </Button>
                  <div className="flex border border-white/20 rounded-md overflow-hidden">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setViewMode("grid")}
                      className={`rounded-none text-xs sm:text-sm ${viewMode === "grid" ? "bg-blue-600 text-white" : "text-gray-400"}`}
                    >
                      <Grid3x3 className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setViewMode("list")}
                      className={`rounded-none text-xs sm:text-sm ${viewMode === "list" ? "bg-blue-600 text-white" : "text-gray-400"}`}
                    >
                      <List className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>

              {showFilters && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 pt-3 sm:pt-4 border-t border-white/10">
                  <div>
                    <label className="text-xs text-gray-400 mb-2 block">Category</label>
                    <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                      <SelectTrigger className="bg-[#1a1f35] border-white/10 text-white text-xs sm:text-sm">
                        <SelectValue placeholder="Category" />
                      </SelectTrigger>
                      <SelectContent className="bg-[#1a1f35] border-white/10">
                        <SelectItem value="all">All Categories</SelectItem>
                        <SelectItem value="fashion">Fashion & Lifestyle</SelectItem>
                        <SelectItem value="sports">Sports & Fitness</SelectItem>
                        <SelectItem value="beauty">Beauty & Cosmetics</SelectItem>
                        <SelectItem value="tech">Technology</SelectItem>
                        <SelectItem value="food">Food & Beverage</SelectItem>
                        <SelectItem value="travel">Travel & Tourism</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-xs text-gray-400 mb-2 block">Platform</label>
                    <Select value={platformFilter} onValueChange={setPlatformFilter}>
                      <SelectTrigger className="bg-[#1a1f35] border-white/10 text-white text-xs sm:text-sm">
                        <SelectValue placeholder="Platform" />
                      </SelectTrigger>
                      <SelectContent className="bg-[#1a1f35] border-white/10">
                        <SelectItem value="all">All Platforms</SelectItem>
                        <SelectItem value="instagram">Instagram</SelectItem>
                        <SelectItem value="youtube">YouTube</SelectItem>
                        <SelectItem value="tiktok">TikTok</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-xs text-gray-400 mb-2 block">Location</label>
                    <Select value={locationFilter} onValueChange={setLocationFilter}>
                      <SelectTrigger className="bg-[#1a1f35] border-white/10 text-white text-xs sm:text-sm">
                        <SelectValue placeholder="Location" />
                      </SelectTrigger>
                      <SelectContent className="bg-[#1a1f35] border-white/10">
                        <SelectItem value="all">All Locations</SelectItem>
                        <SelectItem value="pan india">Pan India</SelectItem>
                        <SelectItem value="mumbai">Mumbai</SelectItem>
                        <SelectItem value="delhi">Delhi</SelectItem>
                        <SelectItem value="bangalore">Bangalore</SelectItem>
                        <SelectItem value="remote">Remote</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-xs text-gray-400 mb-2 block">Sort By</label>
                    <Select value={sortBy} onValueChange={setSortBy}>
                      <SelectTrigger className="bg-[#1a1f35] border-white/10 text-white text-xs sm:text-sm">
                        <SelectValue placeholder="Sort By" />
                      </SelectTrigger>
                      <SelectContent className="bg-[#1a1f35] border-white/10">
                        <SelectItem value="match">Match Score</SelectItem>
                        <SelectItem value="pay-high">Pay (High to Low)</SelectItem>
                        <SelectItem value="pay-low">Pay (Low to High)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="sm:col-span-2 lg:col-span-4">
                    <label className="text-xs text-gray-400 mb-2 block">
                      Pay Range: ₹{payRange[0].toLocaleString()} - ₹{payRange[1].toLocaleString()}
                    </label>
                    <Slider
                      value={payRange}
                      onValueChange={setPayRange}
                      min={0}
                      max={100000}
                      step={5000}
                      className="w-full"
                    />
                  </div>
                </div>
              )}
            </div>
          </Card>

          <div className="text-xs sm:text-sm text-gray-400">Showing {filteredBrands.length} brand opportunities</div>

          <div
            className={
              viewMode === "grid" ? "grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6" : "space-y-4 sm:space-y-6"
            }
          >
            {filteredBrands.map((brand) => (
              <Card
                key={brand.id}
                className="bg-[#0f1629]/50 border-white/10 p-4 sm:p-6 hover:border-blue-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/20"
              >
                <div className="space-y-3 sm:space-y-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 sm:gap-4 flex-1 min-w-0">
                      <div className="h-12 w-12 sm:h-16 sm:w-16 rounded-lg bg-white/10 flex items-center justify-center overflow-hidden flex-shrink-0">
                        <Image
                          src={brand.logo || "/placeholder.svg"}
                          alt={brand.name}
                          width={64}
                          height={64}
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-sm sm:text-base lg:text-lg font-bold text-white truncate">
                            {brand.name}
                          </h3>
                          {brand.trending && (
                            <Badge className="bg-orange-500/20 text-orange-500 text-xs">
                              <TrendingUp className="w-3 h-3 mr-1" />
                              Trending
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs sm:text-sm text-gray-400 truncate">{brand.category}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2 flex-shrink-0">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Badge className="bg-green-500/20 text-green-500 cursor-help text-xs whitespace-nowrap">
                              {brand.match}% Match
                              <Info className="w-3 h-3 ml-1" />
                            </Badge>
                          </TooltipTrigger>
                          <TooltipContent className="bg-[#1a1f35] border-white/10 max-w-xs">
                            <div className="space-y-1">
                              <p className="font-semibold text-xs sm:text-sm">Why this match?</p>
                              {brand.matchReasons.map((reason, idx) => (
                                <p key={idx} className="text-xs text-gray-300">
                                  ✓ {reason}
                                </p>
                              ))}
                            </div>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleSave(brand.id)}
                        className={`p-2 ${savedBrands.includes(brand.id) ? "text-red-500" : "text-gray-400"}`}
                      >
                        <Heart className={`w-4 h-4 ${savedBrands.includes(brand.id) ? "fill-current" : ""}`} />
                      </Button>
                    </div>
                  </div>

                  <p className="text-xs sm:text-sm text-gray-300 line-clamp-2">{brand.description}</p>

                  <div className="flex gap-2">
                    {brand.platforms.map((platform) => (
                      <Badge key={platform} variant="outline" className="border-white/20 text-gray-300 text-xs">
                        {platform === "Instagram" && <Instagram className="w-3 h-3 mr-1" />}
                        {platform === "YouTube" && <Youtube className="w-3 h-3 mr-1" />}
                        {platform === "TikTok" && <Video className="w-3 h-3 mr-1" />}
                        {platform}
                      </Badge>
                    ))}
                  </div>

                  <div className="grid grid-cols-2 gap-2 sm:gap-3 text-xs sm:text-sm">
                    <div className="flex items-center gap-2 text-gray-300">
                      <DollarSign className="w-3 h-3 sm:w-4 sm:h-4 text-green-500 flex-shrink-0" />
                      <span className="truncate">{brand.payRange}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-300">
                      <Calendar className="w-3 h-3 sm:w-4 sm:h-4 text-blue-500 flex-shrink-0" />
                      <span className="truncate">{brand.duration}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-300 col-span-2">
                      <MapPin className="w-3 h-3 sm:w-4 sm:h-4 text-purple-500 flex-shrink-0" />
                      <span className="truncate">{brand.location}</span>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-xs sm:text-sm font-medium text-white mb-2">Deliverables</h4>
                    <div className="flex flex-wrap gap-2">
                      {brand.deliverables.map((item, index) => (
                        <Badge key={index} variant="outline" className="border-white/20 text-gray-300 text-xs">
                          {item}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    {appliedBrands.includes(brand.id) ? (
                      <Button disabled className="flex-1 bg-green-600/50 text-white text-xs sm:text-sm">
                        <CheckCircle2 className="w-4 h-4 mr-2" />
                        Applied
                      </Button>
                    ) : (
                      <Button
                        onClick={() => handleApply(brand)}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-xs sm:text-sm"
                      >
                        Apply Now
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      onClick={() => handlePreview(brand)}
                      className="border-white/20 text-white hover:bg-white/10 bg-transparent text-xs sm:text-sm"
                    >
                      Preview Brief
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {filteredBrands.length === 0 && (
            <Card className="bg-[#0f1629]/50 border-white/10 p-8 sm:p-12 text-center">
              <div className="max-w-md mx-auto space-y-4">
                <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-full bg-blue-500/20 flex items-center justify-center mx-auto">
                  <Search className="w-8 h-8 sm:w-10 sm:h-10 text-blue-500" />
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-white">No brands found</h3>
                <p className="text-xs sm:text-sm text-gray-400">
                  Try adjusting your filters or search query to find more opportunities
                </p>
                <Button
                  onClick={() => {
                    setSearchQuery("")
                    setCategoryFilter("all")
                    setPlatformFilter("all")
                    setLocationFilter("all")
                    setPayRange([0, 100000])
                  }}
                  className="bg-blue-600 hover:bg-blue-700 text-xs sm:text-sm"
                >
                  Clear Filters
                </Button>
              </div>
            </Card>
          )}
        </main>
      </div>

      {selectedBrand && (
        <>
          <QuickApplyModal
            isOpen={showApplyModal}
            onClose={() => setShowApplyModal(false)}
            brand={selectedBrand}
            onSuccess={handleApplySuccess}
          />
          <PreviewBriefModal
            isOpen={showPreviewModal}
            onClose={() => setShowPreviewModal(false)}
            brand={selectedBrand}
            onApply={() => {
              setShowPreviewModal(false)
              handleApply(selectedBrand)
            }}
          />
        </>
      )}
    </div>
  )
}
