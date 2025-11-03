"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import DashboardNav from "@/components/dashboard-nav"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Users,
  Mail,
  Phone,
  Calendar,
  FileText,
  DollarSign,
  TrendingUp,
  MessageCircle,
  CheckCircle,
  Clock,
  Plus,
  Search,
  Filter,
  Download,
  Edit,
  Trash2,
  Send,
  ArrowLeft,
} from "lucide-react"

export default function CRMPage() {
  const router = useRouter()
  const [selectedTab, setSelectedTab] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [addContactOpen, setAddContactOpen] = useState(false)

  // Mock CRM data
  const contacts = [
    {
      id: 1,
      name: "Sarah Johnson",
      username: "@sarahfitness",
      email: "sarah@example.com",
      phone: "+91 98765 43210",
      category: "Fitness",
      followers: 245000,
      engagement: 4.8,
      status: "active",
      relationship: "partner",
      campaigns: 3,
      totalPaid: 125000,
      lastContact: "2025-01-25",
      notes: "Excellent engagement rates. Prefers Instagram Reels.",
      contracts: [
        { id: 1, campaign: "Summer Fitness Challenge", amount: 45000, status: "completed", date: "2024-12-15" },
        { id: 2, campaign: "New Year Wellness", amount: 50000, status: "completed", date: "2025-01-10" },
        { id: 3, campaign: "Spring Workout Series", amount: 30000, status: "active", date: "2025-01-20" },
      ],
      communications: [
        { id: 1, type: "email", subject: "Campaign Brief - Spring Workout", date: "2025-01-20", status: "sent" },
        { id: 2, type: "call", subject: "Follow-up on deliverables", date: "2025-01-22", status: "completed" },
        { id: 3, type: "message", subject: "Payment confirmation", date: "2025-01-24", status: "sent" },
      ],
    },
    {
      id: 2,
      name: "Priya Patel",
      username: "@priyabeauty",
      email: "priya@example.com",
      phone: "+91 98765 43211",
      category: "Beauty",
      followers: 320000,
      engagement: 6.1,
      status: "active",
      relationship: "partner",
      campaigns: 5,
      totalPaid: 245000,
      lastContact: "2025-01-26",
      notes: "Very professional. Quick turnaround time.",
      contracts: [
        { id: 1, campaign: "Beauty Product Launch", amount: 65000, status: "completed", date: "2024-11-20" },
        { id: 2, campaign: "Skincare Review Series", amount: 80000, status: "completed", date: "2024-12-15" },
        { id: 3, campaign: "Makeup Tutorial Campaign", amount: 100000, status: "active", date: "2025-01-15" },
      ],
      communications: [
        { id: 1, type: "email", subject: "New campaign opportunity", date: "2025-01-15", status: "sent" },
        { id: 2, type: "meeting", subject: "Campaign planning session", date: "2025-01-18", status: "completed" },
        { id: 3, type: "email", subject: "Contract signed", date: "2025-01-20", status: "sent" },
      ],
    },
    {
      id: 3,
      name: "Rahul Sharma",
      username: "@techrahul",
      email: "rahul@example.com",
      phone: "+91 98765 43212",
      category: "Tech",
      followers: 180000,
      engagement: 5.2,
      status: "prospect",
      relationship: "new",
      campaigns: 0,
      totalPaid: 0,
      lastContact: "2025-01-27",
      notes: "Interested in tech product reviews. Awaiting proposal response.",
      contracts: [],
      communications: [
        {
          id: 1,
          type: "email",
          subject: "Introduction and collaboration opportunity",
          date: "2025-01-25",
          status: "sent",
        },
        { id: 2, type: "email", subject: "Follow-up on proposal", date: "2025-01-27", status: "sent" },
      ],
    },
    {
      id: 4,
      name: "Ananya Kapoor",
      username: "@travelananya",
      email: "ananya@example.com",
      phone: "+91 98765 43213",
      category: "Travel",
      followers: 412000,
      engagement: 5.8,
      status: "inactive",
      relationship: "past",
      campaigns: 2,
      totalPaid: 95000,
      lastContact: "2024-11-15",
      notes: "Completed 2 campaigns successfully. No recent activity.",
      contracts: [
        { id: 1, campaign: "Travel Destination Promo", amount: 55000, status: "completed", date: "2024-08-20" },
        { id: 2, campaign: "Hotel Review Campaign", amount: 40000, status: "completed", date: "2024-10-15" },
      ],
      communications: [
        { id: 1, type: "email", subject: "Campaign completion", date: "2024-10-20", status: "sent" },
        { id: 2, type: "email", subject: "Payment processed", date: "2024-10-25", status: "sent" },
      ],
    },
  ]

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
    return num.toString()
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-500/20 text-green-400 border-green-500/30"
      case "prospect":
        return "bg-blue-500/20 text-blue-400 border-blue-500/30"
      case "inactive":
        return "bg-gray-500/20 text-gray-400 border-gray-500/30"
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/30"
    }
  }

  const getRelationshipColor = (relationship: string) => {
    switch (relationship) {
      case "partner":
        return "bg-purple-500/20 text-purple-400 border-purple-500/30"
      case "new":
        return "bg-blue-500/20 text-blue-400 border-blue-500/30"
      case "past":
        return "bg-gray-500/20 text-gray-400 border-gray-500/30"
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/30"
    }
  }

  const filteredContacts = contacts.filter((contact) => {
    if (selectedTab !== "all" && contact.status !== selectedTab) return false
    if (
      searchQuery &&
      !contact.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !contact.username.toLowerCase().includes(searchQuery.toLowerCase())
    )
      return false
    return true
  })

  // Calculate overview stats
  const overviewStats = {
    totalContacts: contacts.length,
    activePartners: contacts.filter((c) => c.status === "active").length,
    prospects: contacts.filter((c) => c.status === "prospect").length,
    totalRevenue: contacts.reduce((sum, c) => sum + c.totalPaid, 0),
    avgDealSize:
      contacts.filter((c) => c.totalPaid > 0).reduce((sum, c) => sum + c.totalPaid, 0) /
        contacts.filter((c) => c.totalPaid > 0).length || 0,
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
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Influencer CRM</h1>
            <p className="text-gray-400">Manage relationships, contracts, and communications</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" className="border-white/10 text-white hover:bg-white/5 bg-transparent">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Dialog open={addContactOpen} onOpenChange={setAddContactOpen}>
              <DialogTrigger asChild>
                <Button className="bg-red-600 hover:bg-red-700 text-white">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Contact
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-gray-900 border-white/10 text-white max-w-2xl">
                <DialogHeader>
                  <DialogTitle className="text-2xl">Add New Contact</DialogTitle>
                  <DialogDescription className="text-gray-400">Add an influencer to your CRM</DialogDescription>
                </DialogHeader>
                <form className="space-y-4 mt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-white">Full Name</Label>
                      <Input placeholder="Sarah Johnson" className="bg-white/5 border-white/10 text-white mt-2" />
                    </div>
                    <div>
                      <Label className="text-white">Username</Label>
                      <Input placeholder="@sarahfitness" className="bg-white/5 border-white/10 text-white mt-2" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-white">Email</Label>
                      <Input
                        type="email"
                        placeholder="sarah@example.com"
                        className="bg-white/5 border-white/10 text-white mt-2"
                      />
                    </div>
                    <div>
                      <Label className="text-white">Phone</Label>
                      <Input
                        type="tel"
                        placeholder="+91 98765 43210"
                        className="bg-white/5 border-white/10 text-white mt-2"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-white">Category</Label>
                      <Select>
                        <SelectTrigger className="bg-white/5 border-white/10 text-white mt-2">
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="fitness">Fitness</SelectItem>
                          <SelectItem value="beauty">Beauty</SelectItem>
                          <SelectItem value="tech">Tech</SelectItem>
                          <SelectItem value="fashion">Fashion</SelectItem>
                          <SelectItem value="food">Food</SelectItem>
                          <SelectItem value="travel">Travel</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-white">Status</Label>
                      <Select>
                        <SelectTrigger className="bg-white/5 border-white/10 text-white mt-2">
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="prospect">Prospect</SelectItem>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="inactive">Inactive</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div>
                    <Label className="text-white">Notes</Label>
                    <Textarea
                      placeholder="Add any relevant notes about this influencer..."
                      className="bg-white/5 border-white/10 text-white mt-2 min-h-[100px]"
                    />
                  </div>
                  <div className="flex gap-3 pt-4">
                    <Button type="submit" className="flex-1 bg-red-600 hover:bg-red-700 text-white">
                      Add Contact
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      className="flex-1 border-white/10 text-white hover:bg-white/5 bg-transparent"
                      onClick={() => setAddContactOpen(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <Card className="bg-white/5 backdrop-blur-lg border-white/10">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-gray-400 flex items-center gap-2">
                <Users className="h-4 w-4" />
                Total Contacts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-white">{overviewStats.totalContacts}</p>
            </CardContent>
          </Card>

          <Card className="bg-white/5 backdrop-blur-lg border-white/10">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-gray-400 flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                Active Partners
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-white">{overviewStats.activePartners}</p>
            </CardContent>
          </Card>

          <Card className="bg-white/5 backdrop-blur-lg border-white/10">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-gray-400 flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Prospects
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-white">{overviewStats.prospects}</p>
            </CardContent>
          </Card>

          <Card className="bg-white/5 backdrop-blur-lg border-white/10">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-gray-400 flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Total Revenue
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-white">₹{formatNumber(overviewStats.totalRevenue)}</p>
            </CardContent>
          </Card>

          <Card className="bg-white/5 backdrop-blur-lg border-white/10">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-gray-400 flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Avg Deal Size
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-white">₹{formatNumber(overviewStats.avgDealSize)}</p>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filter */}
        <Card className="bg-white/5 backdrop-blur-lg border-white/10 mb-6">
          <CardContent className="pt-6">
            <div className="flex gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  placeholder="Search by name or username..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-gray-500"
                />
              </div>
              <Button variant="outline" className="border-white/10 text-white hover:bg-white/5 bg-transparent">
                <Filter className="h-4 w-4 mr-2" />
                Filters
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Contacts List */}
        <Card className="bg-white/5 backdrop-blur-lg border-white/10">
          <CardHeader>
            <CardTitle className="text-white">Contacts</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs value={selectedTab} onValueChange={setSelectedTab}>
              <TabsList className="bg-white/5 border-white/10 mb-6">
                <TabsTrigger value="all" className="data-[state=active]:bg-red-600">
                  All ({contacts.length})
                </TabsTrigger>
                <TabsTrigger value="active" className="data-[state=active]:bg-red-600">
                  Active ({contacts.filter((c) => c.status === "active").length})
                </TabsTrigger>
                <TabsTrigger value="prospect" className="data-[state=active]:bg-red-600">
                  Prospects ({contacts.filter((c) => c.status === "prospect").length})
                </TabsTrigger>
                <TabsTrigger value="inactive" className="data-[state=active]:bg-red-600">
                  Inactive ({contacts.filter((c) => c.status === "inactive").length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value={selectedTab} className="space-y-4">
                {filteredContacts.map((contact) => (
                  <Card key={contact.id} className="bg-white/5 border-white/10">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-start gap-4 flex-1">
                          <img
                            src={`/ceholder-svg-height-80.jpg?height=80&width=80`}
                            alt={contact.name}
                            className="w-16 h-16 rounded-full object-cover"
                          />
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="text-xl font-bold text-white">{contact.name}</h3>
                              <Badge className={getStatusColor(contact.status)}>{contact.status}</Badge>
                              <Badge className={getRelationshipColor(contact.relationship)}>
                                {contact.relationship}
                              </Badge>
                              <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">
                                {contact.category}
                              </Badge>
                            </div>
                            <p className="text-gray-400 text-sm mb-2">{contact.username}</p>
                            <div className="flex items-center gap-4 text-sm text-gray-400">
                              <span className="flex items-center gap-1">
                                <Mail className="h-4 w-4" />
                                {contact.email}
                              </span>
                              <span className="flex items-center gap-1">
                                <Phone className="h-4 w-4" />
                                {contact.phone}
                              </span>
                              <span className="flex items-center gap-1">
                                <Calendar className="h-4 w-4" />
                                Last contact: {contact.lastContact}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-white/10 text-white hover:bg-white/5 bg-transparent"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-white/10 text-white hover:bg-white/5 bg-transparent"
                          >
                            <Send className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-red-500/30 text-red-400 hover:bg-red-500/10 bg-transparent"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      {/* Stats */}
                      <div className="grid grid-cols-4 gap-4 p-4 bg-white/5 rounded-lg mb-4">
                        <div>
                          <p className="text-xs text-gray-400 mb-1">Followers</p>
                          <p className="text-white font-semibold">{formatNumber(contact.followers)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-400 mb-1">Engagement</p>
                          <p className="text-white font-semibold">{contact.engagement}%</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-400 mb-1">Campaigns</p>
                          <p className="text-white font-semibold">{contact.campaigns}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-400 mb-1">Total Paid</p>
                          <p className="text-white font-semibold">₹{formatNumber(contact.totalPaid)}</p>
                        </div>
                      </div>

                      {/* Notes */}
                      <div className="mb-4 p-3 bg-white/5 rounded-lg">
                        <p className="text-xs text-gray-400 mb-1">Notes:</p>
                        <p className="text-sm text-gray-300">{contact.notes}</p>
                      </div>

                      {/* Contracts & Communications */}
                      <Tabs defaultValue="contracts" className="mt-4">
                        <TabsList className="bg-white/5 border-white/10">
                          <TabsTrigger value="contracts" className="data-[state=active]:bg-red-600">
                            Contracts ({contact.contracts.length})
                          </TabsTrigger>
                          <TabsTrigger value="communications" className="data-[state=active]:bg-red-600">
                            Communications ({contact.communications.length})
                          </TabsTrigger>
                        </TabsList>

                        <TabsContent value="contracts" className="mt-4">
                          <div className="space-y-2">
                            {contact.contracts.map((contract) => (
                              <div
                                key={contract.id}
                                className="flex items-center justify-between p-3 bg-white/5 rounded-lg"
                              >
                                <div>
                                  <p className="text-white font-medium text-sm">{contract.campaign}</p>
                                  <p className="text-xs text-gray-400">{contract.date}</p>
                                </div>
                                <div className="flex items-center gap-3">
                                  <p className="text-white font-semibold">₹{formatNumber(contract.amount)}</p>
                                  <Badge
                                    className={
                                      contract.status === "completed"
                                        ? "bg-green-500/20 text-green-400 border-green-500/30"
                                        : "bg-blue-500/20 text-blue-400 border-blue-500/30"
                                    }
                                  >
                                    {contract.status}
                                  </Badge>
                                </div>
                              </div>
                            ))}
                          </div>
                        </TabsContent>

                        <TabsContent value="communications" className="mt-4">
                          <div className="space-y-2">
                            {contact.communications.map((comm) => (
                              <div
                                key={comm.id}
                                className="flex items-center justify-between p-3 bg-white/5 rounded-lg"
                              >
                                <div className="flex items-center gap-3">
                                  <MessageCircle className="h-4 w-4 text-gray-400" />
                                  <div>
                                    <p className="text-white font-medium text-sm">{comm.subject}</p>
                                    <p className="text-xs text-gray-400">
                                      {comm.type} • {comm.date}
                                    </p>
                                  </div>
                                </div>
                                <Badge
                                  className={
                                    comm.status === "completed"
                                      ? "bg-green-500/20 text-green-400 border-green-500/30"
                                      : "bg-blue-500/20 text-blue-400 border-blue-500/30"
                                  }
                                >
                                  {comm.status}
                                </Badge>
                              </div>
                            ))}
                          </div>
                        </TabsContent>
                      </Tabs>

                      {/* Actions */}
                      <div className="flex gap-3 mt-4">
                        <Button className="bg-red-600 hover:bg-red-700 text-white">View Full Profile</Button>
                        <Button
                          variant="outline"
                          className="border-white/10 text-white hover:bg-white/5 bg-transparent"
                        >
                          <MessageCircle className="h-4 w-4 mr-2" />
                          Send Message
                        </Button>
                        <Button
                          variant="outline"
                          className="border-white/10 text-white hover:bg-white/5 bg-transparent"
                        >
                          <FileText className="h-4 w-4 mr-2" />
                          Create Contract
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
