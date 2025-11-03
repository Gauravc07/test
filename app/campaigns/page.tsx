"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Navigation } from "@/components/navigation"
import { Search, Filter, DollarSign, Calendar, Target, MapPin, CheckCircle2, Clock, Send } from "lucide-react"

export default function CampaignsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCampaign, setSelectedCampaign] = useState<any>(null)
  const [applicationOpen, setApplicationOpen] = useState(false)

  const campaigns = [
    {
      id: 1,
      brand: "TechGear Pro",
      brandLogo: "https://api.dicebear.com/7.x/initials/svg?seed=TGP",
      title: "Product Review Campaign",
      description:
        "Looking for tech reviewers to create authentic product reviews for our latest gadget lineup. Must have experience in tech content.",
      category: "Tech & Gadgets",
      budget: 15000,
      budgetRange: "₹12,000 - ₹18,000",
      deadline: "2025-02-15",
      location: "Remote",
      deliverables: ["2 Instagram Reels", "1 YouTube Video", "3 Instagram Stories"],
      requirements: {
        minFollowers: 50000,
        platforms: ["Instagram", "YouTube"],
        engagement: 3.5,
      },
      applicants: 24,
      status: "open",
      verified: true,
    },
    {
      id: 2,
      brand: "Fashion Hub",
      brandLogo: "https://api.dicebear.com/7.x/initials/svg?seed=FH",
      title: "Spring Collection Launch",
      description:
        "Collaborate with us to showcase our new spring collection. Looking for fashion influencers with a strong aesthetic sense.",
      category: "Fashion & Style",
      budget: 20000,
      budgetRange: "₹18,000 - ₹25,000",
      deadline: "2025-02-20",
      location: "Mumbai",
      deliverables: ["3 Instagram Posts", "5 Instagram Stories", "1 Reel"],
      requirements: {
        minFollowers: 75000,
        platforms: ["Instagram"],
        engagement: 4.0,
      },
      applicants: 42,
      status: "open",
      verified: true,
    },
    {
      id: 3,
      brand: "Fitness First",
      brandLogo: "https://api.dicebear.com/7.x/initials/svg?seed=FF",
      title: "Workout Routine Series",
      description:
        "Create a series of workout videos featuring our fitness equipment. Must be a certified fitness trainer or enthusiast.",
      category: "Fitness & Health",
      budget: 12000,
      budgetRange: "₹10,000 - ₹15,000",
      deadline: "2025-02-25",
      location: "Remote",
      deliverables: ["4 YouTube Videos", "8 Instagram Reels"],
      requirements: {
        minFollowers: 40000,
        platforms: ["YouTube", "Instagram"],
        engagement: 3.0,
      },
      applicants: 18,
      status: "open",
      verified: false,
    },
    {
      id: 4,
      brand: "Foodie Delights",
      brandLogo: "https://api.dicebear.com/7.x/initials/svg?seed=FD",
      title: "Restaurant Review Campaign",
      description:
        "Visit our restaurant and create engaging food content. Looking for food bloggers with a passion for culinary experiences.",
      category: "Food & Beverage",
      budget: 8000,
      budgetRange: "₹6,000 - ₹10,000",
      deadline: "2025-02-18",
      location: "Delhi",
      deliverables: ["2 Instagram Posts", "1 YouTube Video", "5 Stories"],
      requirements: {
        minFollowers: 30000,
        platforms: ["Instagram", "YouTube"],
        engagement: 4.5,
      },
      applicants: 31,
      status: "open",
      verified: true,
    },
  ]

  const handleApply = (campaign: any) => {
    setSelectedCampaign(campaign)
    setApplicationOpen(true)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0e1a] via-[#0f1629] to-[#0a0e1a]">
      <Navigation />
      <div className="container mx-auto px-4 py-8 pt-24">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Discover Campaigns</h1>
          <p className="text-gray-400">Find the perfect brand collaborations for your content</p>
        </div>

        {/* Search and Filter */}
        <Card className="bg-[#0f1629]/50 border-white/10 p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search campaigns by brand, category, or keyword..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-[#1a1f35] border-white/10 text-white pl-10"
              />
            </div>
            <Button variant="outline" className="border-white/10 bg-transparent">
              <Filter className="w-4 h-4 mr-2" />
              Filters
            </Button>
          </div>
        </Card>

        {/* Campaign Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {campaigns.map((campaign) => (
            <Card
              key={campaign.id}
              className="bg-[#0f1629]/50 border-white/10 p-6 hover:border-blue-500/50 transition-all"
            >
              {/* Brand Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={campaign.brandLogo || "/placeholder.svg"} alt={campaign.brand} />
                    <AvatarFallback>{campaign.brand.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-white">{campaign.brand}</h3>
                      {campaign.verified && <CheckCircle2 className="w-4 h-4 text-blue-500" />}
                    </div>
                    <Badge className="bg-blue-600/20 text-blue-400 text-xs mt-1">{campaign.category}</Badge>
                  </div>
                </div>
                <Badge className="bg-green-500/20 text-green-500">
                  <Clock className="w-3 h-3 mr-1" />
                  Open
                </Badge>
              </div>

              {/* Campaign Title */}
              <h4 className="text-xl font-bold text-white mb-3">{campaign.title}</h4>

              {/* Description */}
              <p className="text-gray-400 text-sm mb-4 line-clamp-2">{campaign.description}</p>

              {/* Campaign Details */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="flex items-center gap-2 text-sm">
                  <DollarSign className="w-4 h-4 text-green-500" />
                  <span className="text-gray-400">Budget:</span>
                  <span className="text-white font-medium">{campaign.budgetRange}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="w-4 h-4 text-blue-500" />
                  <span className="text-gray-400">Deadline:</span>
                  <span className="text-white font-medium">{campaign.deadline}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="w-4 h-4 text-purple-500" />
                  <span className="text-gray-400">Location:</span>
                  <span className="text-white font-medium">{campaign.location}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Target className="w-4 h-4 text-orange-500" />
                  <span className="text-gray-400">Applicants:</span>
                  <span className="text-white font-medium">{campaign.applicants}</span>
                </div>
              </div>

              {/* Deliverables */}
              <div className="mb-4">
                <p className="text-xs text-gray-400 mb-2">Deliverables:</p>
                <div className="flex flex-wrap gap-2">
                  {campaign.deliverables.map((deliverable, index) => (
                    <Badge key={index} variant="outline" className="border-white/20 text-gray-300 text-xs">
                      {deliverable}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Requirements */}
              <div className="mb-4 p-3 bg-[#1a1f35] rounded-lg">
                <p className="text-xs text-gray-400 mb-2">Requirements:</p>
                <div className="flex flex-wrap gap-3 text-xs">
                  <span className="text-gray-300">
                    Min. {(campaign.requirements.minFollowers / 1000).toFixed(0)}K followers
                  </span>
                  <span className="text-gray-300">{campaign.requirements.engagement}%+ engagement</span>
                  <span className="text-gray-300">{campaign.requirements.platforms.join(", ")}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <Button className="flex-1 bg-blue-600 hover:bg-blue-700" onClick={() => handleApply(campaign)}>
                  Apply Now
                </Button>
                <Button variant="outline" className="border-white/10 bg-transparent">
                  View Details
                </Button>
              </div>
            </Card>
          ))}
        </div>

        {/* Application Dialog */}
        <Dialog open={applicationOpen} onOpenChange={setApplicationOpen}>
          <DialogContent className="bg-[#0f1629] border-white/10 text-white max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-2xl">Apply to Campaign</DialogTitle>
              <DialogDescription className="text-gray-400">
                {selectedCampaign?.title} by {selectedCampaign?.brand}
              </DialogDescription>
            </DialogHeader>
            <form className="space-y-4 mt-4">
              <div>
                <label className="text-sm text-gray-400 mb-2 block">Why are you a good fit for this campaign?</label>
                <Textarea
                  placeholder="Tell the brand why you're perfect for this collaboration..."
                  className="bg-[#1a1f35] border-white/10 text-white min-h-[120px]"
                />
              </div>
              <div>
                <label className="text-sm text-gray-400 mb-2 block">Portfolio Links (Optional)</label>
                <Input
                  placeholder="https://instagram.com/yourprofile"
                  className="bg-[#1a1f35] border-white/10 text-white mb-2"
                />
                <Input
                  placeholder="https://youtube.com/yourchannel"
                  className="bg-[#1a1f35] border-white/10 text-white"
                />
              </div>
              <div>
                <label className="text-sm text-gray-400 mb-2 block">Expected Deliverables Timeline</label>
                <Textarea
                  placeholder="Describe when you can deliver each requirement..."
                  className="bg-[#1a1f35] border-white/10 text-white"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <Button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700">
                  <Send className="w-4 h-4 mr-2" />
                  Submit Application
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1 border-white/10 bg-transparent"
                  onClick={() => setApplicationOpen(false)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
