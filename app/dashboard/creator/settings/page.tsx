"use client"

import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { InfluencerSidebar } from "@/components/influencer-sidebar"
import { InfluencerHeader } from "@/components/influencer-header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import {
  Mail,
  Phone,
  Instagram,
  Youtube,
  Twitter,
  Facebook,
  Building2,
  CreditCard,
  Shield,
  CheckCircle2,
  Camera,
  Globe,
  Link2,
  Key,
  Download,
  Eye,
  EyeOff,
  Copy,
  RefreshCw,
  Trash2,
  AlertCircle,
  Loader2,
} from "lucide-react"

export default function SettingsPage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState("profile")
  const [hasChanges, setHasChanges] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [showApiToken, setShowApiToken] = useState(false)
  const [showMobileMenu, setShowMobileMenu] = useState(false)

  useEffect(() => {
    if (!isLoading && (!user || user.role !== "creator")) {
      router.push("/auth/login")
    }
  }, [user, isLoading, router])

  const handleSave = async () => {
    setIsSaving(true)
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setIsSaving(false)
    setHasChanges(false)
    toast({
      title: "Settings saved",
      description: "Your changes have been saved successfully.",
      className: "bg-green-500/10 border-green-500/50 text-green-500",
    })
  }

  const handleCancel = () => {
    setHasChanges(false)
    toast({
      title: "Changes discarded",
      description: "Your changes have been discarded.",
      variant: "destructive",
    })
  }

  const handleInputChange = () => {
    setHasChanges(true)
  }

  if (isLoading || !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-blue-950 to-black flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    )
  }

  const socialAccounts = [
    {
      platform: "Instagram",
      icon: Instagram,
      connected: true,
      username: "@johndoe",
      followers: 125000,
      color: "from-purple-500 to-pink-500",
    },
    {
      platform: "YouTube",
      icon: Youtube,
      connected: true,
      username: "John Doe",
      followers: 85000,
      color: "from-red-600 to-red-500",
    },
    {
      platform: "Twitter",
      icon: Twitter,
      connected: true,
      username: "@johndoe",
      followers: 45000,
      color: "from-blue-400 to-blue-300",
    },
    {
      platform: "Facebook",
      icon: Facebook,
      connected: false,
      username: "",
      followers: 0,
      color: "from-blue-600 to-blue-400",
    },
  ]

  const settingsSections = [
    { value: "profile", label: "Profile", icon: Camera },
    { value: "social", label: "Social Media", icon: Instagram },
    { value: "payment", label: "Payment", icon: CreditCard },
    { value: "notifications", label: "Notifications", icon: Mail },
    { value: "privacy", label: "Privacy", icon: Shield },
    { value: "integrations", label: "Integrations", icon: Link2 },
    { value: "security", label: "Security", icon: Key },
  ]

  const currentSection = settingsSections.find((s) => s.value === activeTab)

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-blue-950 to-black">
      <InfluencerSidebar />

      <div className="lg:pl-64">
        <InfluencerHeader />

        <main className="p-3 sm:p-4 lg:p-6 space-y-4 lg:space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white">Settings</h1>
            <p className="text-gray-400 text-xs sm:text-sm mt-1">Manage your account settings and preferences</p>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="lg:hidden mb-4">
              <div className="relative">
                <button
                  onClick={() => setShowMobileMenu(!showMobileMenu)}
                  className="w-full flex items-center justify-between p-3 bg-[#1a1f35] rounded-lg border border-white/10 text-white hover:bg-[#252b45] transition-colors"
                >
                  <div className="flex items-center gap-3">
                    {currentSection && <currentSection.icon className="w-5 h-5 text-blue-500" />}
                    <span className="font-medium text-sm">{currentSection?.label}</span>
                  </div>
                  <svg
                    className={`w-5 h-5 text-gray-400 transition-transform ${showMobileMenu ? "rotate-180" : ""}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {showMobileMenu && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setShowMobileMenu(false)} />
                    <div className="absolute top-full left-0 right-0 mt-2 bg-[#1a1f35] rounded-lg border border-white/10 shadow-xl z-50 overflow-hidden">
                      {settingsSections.map((section) => {
                        const Icon = section.icon
                        return (
                          <button
                            key={section.value}
                            onClick={() => {
                              setActiveTab(section.value)
                              setShowMobileMenu(false)
                            }}
                            className={`w-full flex items-center gap-3 p-3 text-left transition-colors ${
                              activeTab === section.value
                                ? "bg-blue-600 text-white"
                                : "text-gray-300 hover:bg-[#252b45]"
                            }`}
                          >
                            <Icon
                              className={`w-5 h-5 ${activeTab === section.value ? "text-white" : "text-blue-500"}`}
                            />
                            <span className="font-medium text-sm">{section.label}</span>
                            {activeTab === section.value && <CheckCircle2 className="w-4 h-4 ml-auto" />}
                          </button>
                        )
                      })}
                    </div>
                  </>
                )}
              </div>
            </div>

            <TabsList className="hidden lg:grid w-full grid-cols-7 bg-[#1a1f35] mb-6 h-auto">
              <TabsTrigger value="profile" className="text-sm">
                Profile
              </TabsTrigger>
              <TabsTrigger value="social" className="text-sm">
                Social
              </TabsTrigger>
              <TabsTrigger value="payment" className="text-sm">
                Payment
              </TabsTrigger>
              <TabsTrigger value="notifications" className="text-sm">
                Notifications
              </TabsTrigger>
              <TabsTrigger value="privacy" className="text-sm">
                Privacy
              </TabsTrigger>
              <TabsTrigger value="integrations" className="text-sm">
                Integrations
              </TabsTrigger>
              <TabsTrigger value="security" className="text-sm">
                Security
              </TabsTrigger>
            </TabsList>

            {/* Profile Settings */}
            <TabsContent value="profile" className="space-y-4 lg:space-y-6">
              <Card className="bg-[#0f1629]/50 border-white/10 p-4 lg:p-6">
                <h2 className="text-lg lg:text-xl font-bold text-white mb-4 lg:mb-6">Profile Information</h2>

                {/* Profile Picture */}
                <div className="flex items-center gap-4 lg:gap-6 mb-4 lg:mb-6">
                  <div className="relative">
                    <div className="h-20 w-20 lg:h-24 lg:w-24 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-2xl lg:text-3xl font-bold">
                      {user.name.charAt(0)}
                    </div>
                    <button className="absolute bottom-0 right-0 h-7 w-7 lg:h-8 lg:w-8 rounded-full bg-blue-600 flex items-center justify-center hover:bg-blue-700 transition-colors">
                      <Camera className="w-3 h-3 lg:w-4 lg:h-4 text-white" />
                    </button>
                  </div>
                  <div>
                    <h3 className="text-white font-medium text-sm lg:text-base">{user.name}</h3>
                    <p className="text-xs lg:text-sm text-gray-400 mt-1">Influencer</p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-2 border-white/10 text-white hover:bg-[#1a1f35] bg-transparent text-xs"
                    >
                      Change Photo
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-white text-xs lg:text-sm">
                      Full Name
                    </Label>
                    <Input
                      id="name"
                      defaultValue={user.name}
                      onChange={handleInputChange}
                      className="bg-[#1a1f35] border-white/10 text-white text-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="username" className="text-white text-xs lg:text-sm">
                      Username
                    </Label>
                    <Input
                      id="username"
                      defaultValue="@johndoe"
                      onChange={handleInputChange}
                      className="bg-[#1a1f35] border-white/10 text-white text-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-white text-xs lg:text-sm">
                      Email
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      defaultValue={user.email}
                      onChange={handleInputChange}
                      className="bg-[#1a1f35] border-white/10 text-white text-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-white text-xs lg:text-sm">
                      Phone Number
                    </Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="+91 98765 43210"
                      onChange={handleInputChange}
                      className="bg-[#1a1f35] border-white/10 text-white text-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="location" className="text-white text-xs lg:text-sm">
                      Location
                    </Label>
                    <Input
                      id="location"
                      placeholder="Mumbai, India"
                      onChange={handleInputChange}
                      className="bg-[#1a1f35] border-white/10 text-white text-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="category" className="text-white text-xs lg:text-sm">
                      Category
                    </Label>
                    <Select onValueChange={handleInputChange}>
                      <SelectTrigger className="bg-[#1a1f35] border-white/10 text-white text-sm">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="fashion">Fashion & Lifestyle</SelectItem>
                        <SelectItem value="tech">Technology</SelectItem>
                        <SelectItem value="fitness">Fitness & Health</SelectItem>
                        <SelectItem value="food">Food & Cooking</SelectItem>
                        <SelectItem value="travel">Travel</SelectItem>
                        <SelectItem value="beauty">Beauty & Makeup</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="bio" className="text-white text-xs lg:text-sm">
                      Bio
                    </Label>
                    <Textarea
                      id="bio"
                      placeholder="Tell us about yourself..."
                      rows={4}
                      onChange={handleInputChange}
                      className="bg-[#1a1f35] border-white/10 text-white resize-none text-sm"
                    />
                  </div>
                </div>

                <div className="mt-6 space-y-4">
                  <h3 className="text-base lg:text-lg font-semibold text-white">Social Links</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="website" className="text-white text-xs lg:text-sm flex items-center gap-2">
                        <Globe className="w-4 h-4" />
                        Website
                      </Label>
                      <Input
                        id="website"
                        placeholder="https://yourwebsite.com"
                        onChange={handleInputChange}
                        className="bg-[#1a1f35] border-white/10 text-white text-sm"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="portfolio" className="text-white text-xs lg:text-sm flex items-center gap-2">
                        <Link2 className="w-4 h-4" />
                        Portfolio
                      </Label>
                      <Input
                        id="portfolio"
                        placeholder="https://portfolio.com"
                        onChange={handleInputChange}
                        className="bg-[#1a1f35] border-white/10 text-white text-sm"
                      />
                    </div>
                  </div>
                </div>
              </Card>

              {/* Account Verification */}
              <Card className="bg-[#0f1629]/50 border-white/10 p-4 lg:p-6">
                <h2 className="text-lg lg:text-xl font-bold text-white mb-4 lg:mb-6">Account Verification</h2>
                <div className="space-y-3 lg:space-y-4">
                  <div className="flex items-center justify-between p-3 lg:p-4 bg-[#1a1f35] rounded-lg">
                    <div className="flex items-center gap-2 lg:gap-3">
                      <Mail className="w-4 h-4 lg:w-5 lg:h-5 text-green-500" />
                      <div>
                        <p className="text-white font-medium text-xs lg:text-sm">Email Verified</p>
                        <p className="text-xs text-gray-400">{user.email}</p>
                      </div>
                    </div>
                    <CheckCircle2 className="w-4 h-4 lg:w-5 lg:h-5 text-green-500" />
                  </div>
                  <div className="flex items-center justify-between p-3 lg:p-4 bg-[#1a1f35] rounded-lg">
                    <div className="flex items-center gap-2 lg:gap-3">
                      <Phone className="w-4 h-4 lg:w-5 lg:h-5 text-yellow-500" />
                      <div>
                        <p className="text-white font-medium text-xs lg:text-sm">Phone Verification</p>
                        <p className="text-xs text-gray-400">Not verified</p>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-white/10 text-white hover:bg-[#252b45] bg-transparent text-xs"
                    >
                      Verify
                    </Button>
                  </div>
                  <div className="flex items-center justify-between p-3 lg:p-4 bg-[#1a1f35] rounded-lg">
                    <div className="flex items-center gap-2 lg:gap-3">
                      <Shield className="w-4 h-4 lg:w-5 lg:h-5 text-blue-500" />
                      <div>
                        <p className="text-white font-medium text-xs lg:text-sm">Identity Verification</p>
                        <p className="text-xs text-gray-400">Verified influencer</p>
                      </div>
                    </div>
                    <CheckCircle2 className="w-4 h-4 lg:w-5 lg:h-5 text-green-500" />
                  </div>
                </div>
              </Card>
            </TabsContent>

            {/* Social Media Settings */}
            <TabsContent value="social" className="space-y-6">
              <Card className="bg-[#0f1629]/50 border-white/10 p-4 lg:p-6">
                <h2 className="text-lg lg:text-xl font-bold text-white mb-4 lg:mb-6">Connected Social Media</h2>
                <div className="space-y-3 lg:space-y-4">
                  {socialAccounts.map((account) => {
                    const Icon = account.icon
                    return (
                      <div
                        key={account.platform}
                        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3 lg:p-4 bg-[#1a1f35] rounded-lg"
                      >
                        <div className="flex items-center gap-3 lg:gap-4 min-w-0">
                          <div
                            className={`h-10 w-10 lg:h-12 lg:w-12 rounded-full bg-gradient-to-br ${account.color} flex items-center justify-center flex-shrink-0`}
                          >
                            <Icon className="w-5 h-5 lg:w-6 lg:h-6 text-white" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-white font-medium text-xs lg:text-sm">{account.platform}</p>
                            {account.connected ? (
                              <>
                                <p className="text-xs lg:text-sm text-gray-400 truncate">{account.username}</p>
                                <p className="text-xs text-gray-500">
                                  {(account.followers / 1000).toFixed(1)}K followers
                                </p>
                              </>
                            ) : (
                              <p className="text-xs lg:text-sm text-gray-400">Not connected</p>
                            )}
                          </div>
                        </div>
                        {account.connected ? (
                          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-2">
                            <Badge className="bg-green-500/20 text-green-500 text-xs text-center py-1">Connected</Badge>
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-white/10 text-white hover:bg-[#252b45] bg-transparent text-xs w-full sm:w-auto"
                            >
                              Disconnect
                            </Button>
                          </div>
                        ) : (
                          <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-xs w-full sm:w-auto">
                            Connect
                          </Button>
                        )}
                      </div>
                    )
                  })}
                </div>
              </Card>
            </TabsContent>

            {/* Payment Settings */}
            <TabsContent value="payment" className="space-y-4 lg:space-y-6">
              <Card className="bg-[#0f1629]/50 border-white/10 p-4 lg:p-6">
                <h2 className="text-lg lg:text-xl font-bold text-white mb-4 lg:mb-6">Payment Methods</h2>

                <div className="mb-6 p-4 bg-[#1a1f35] rounded-lg">
                  <Label htmlFor="payout-interval" className="text-white text-xs lg:text-sm mb-2 block">
                    Preferred Payout Interval
                  </Label>
                  <Select onValueChange={handleInputChange}>
                    <SelectTrigger className="bg-[#0f1629] border-white/10 text-white text-sm">
                      <SelectValue placeholder="Select payout frequency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="biweekly">Bi-weekly</SelectItem>
                      <SelectItem value="monthly">Monthly (Recommended)</SelectItem>
                      <SelectItem value="campaign">Per Campaign</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-gray-400 mt-2">Choose how often you want to receive payouts</p>
                </div>

                <div className="space-y-3 lg:space-y-4">
                  <div className="p-4 lg:p-6 bg-[#1a1f35] rounded-lg border-2 border-blue-500">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2 lg:gap-3">
                        <div className="h-10 w-10 lg:h-12 lg:w-12 rounded-full bg-blue-500/20 flex items-center justify-center">
                          <Building2 className="w-5 h-5 lg:w-6 lg:h-6 text-blue-500" />
                        </div>
                        <div>
                          <p className="font-medium text-white text-xs lg:text-sm">Bank Account</p>
                          <p className="text-xs text-gray-400">Primary method</p>
                        </div>
                      </div>
                      <Badge className="bg-blue-500/20 text-blue-500 text-xs">Primary</Badge>
                    </div>
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-3 lg:gap-4">
                        <div>
                          <p className="text-xs text-gray-400">Bank Name</p>
                          <p className="text-white text-xs lg:text-sm">HDFC Bank</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-400">Account Number</p>
                          <p className="text-white font-mono text-xs lg:text-sm">**** **** **** 4567</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-400">IFSC Code</p>
                          <p className="text-white text-xs lg:text-sm">HDFC0001234</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-400">Account Type</p>
                          <p className="text-white text-xs lg:text-sm">Savings</p>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full border-white/10 text-white hover:bg-[#252b45] bg-transparent text-xs"
                      >
                        Edit Details
                      </Button>
                    </div>
                  </div>

                  <div className="p-4 lg:p-6 bg-[#1a1f35] rounded-lg border border-white/10">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2 lg:gap-3">
                        <div className="h-10 w-10 lg:h-12 lg:w-12 rounded-full bg-purple-500/20 flex items-center justify-center">
                          <CreditCard className="w-5 h-5 lg:w-6 lg:h-6 text-purple-500" />
                        </div>
                        <div>
                          <p className="font-medium text-white text-xs lg:text-sm">UPI</p>
                          <p className="text-xs text-gray-400">Backup method</p>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <p className="text-xs text-gray-400">UPI ID</p>
                        <p className="text-white text-xs lg:text-sm">{user.email}</p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full border-white/10 text-white hover:bg-[#252b45] bg-transparent text-xs"
                      >
                        Edit UPI
                      </Button>
                    </div>
                  </div>
                </div>
                <Button className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-sm">Add Payment Method</Button>
              </Card>
            </TabsContent>

            {/* Notification Settings */}
            <TabsContent value="notifications" className="space-y-6">
              <Card className="bg-[#0f1629]/50 border-white/10 p-6">
                <h2 className="text-xl font-bold text-white mb-6">Notification Preferences</h2>
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white font-medium">Campaign Updates</p>
                      <p className="text-sm text-gray-400">Get notified about new campaigns and updates</p>
                    </div>
                    <Switch defaultChecked onCheckedChange={handleInputChange} />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white font-medium">Payment Notifications</p>
                      <p className="text-sm text-gray-400">Receive alerts for payments and payouts</p>
                    </div>
                    <Switch defaultChecked onCheckedChange={handleInputChange} />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white font-medium">Brand Messages</p>
                      <p className="text-sm text-gray-400">Get notified when brands message you</p>
                    </div>
                    <Switch defaultChecked onCheckedChange={handleInputChange} />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white font-medium">Performance Reports</p>
                      <p className="text-sm text-gray-400">Weekly performance summary emails</p>
                    </div>
                    <Switch onCheckedChange={handleInputChange} />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white font-medium">Marketing Emails</p>
                      <p className="text-sm text-gray-400">Receive tips and promotional content</p>
                    </div>
                    <Switch onCheckedChange={handleInputChange} />
                  </div>
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="privacy" className="space-y-4 lg:space-y-6">
              <Card className="bg-[#0f1629]/50 border-white/10 p-4 lg:p-6">
                <h2 className="text-lg lg:text-xl font-bold text-white mb-4 lg:mb-6">Privacy Settings</h2>
                <div className="space-y-4 lg:space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white font-medium text-xs lg:text-sm">Public Profile</p>
                      <p className="text-xs text-gray-400">Make your profile visible to brands</p>
                    </div>
                    <Switch defaultChecked onCheckedChange={handleInputChange} />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white font-medium text-xs lg:text-sm">Show Engagement Rate</p>
                      <p className="text-xs text-gray-400">Display your engagement metrics publicly</p>
                    </div>
                    <Switch defaultChecked onCheckedChange={handleInputChange} />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white font-medium text-xs lg:text-sm">Show Follower Count</p>
                      <p className="text-xs text-gray-400">Display your follower numbers</p>
                    </div>
                    <Switch defaultChecked onCheckedChange={handleInputChange} />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white font-medium text-xs lg:text-sm">Show Past Collaborations</p>
                      <p className="text-xs text-gray-400">Let brands see your collaboration history</p>
                    </div>
                    <Switch onCheckedChange={handleInputChange} />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white font-medium text-xs lg:text-sm">Allow Brand Messages</p>
                      <p className="text-xs text-gray-400">Let brands contact you directly</p>
                    </div>
                    <Switch defaultChecked onCheckedChange={handleInputChange} />
                  </div>
                </div>
              </Card>

              <Card className="bg-[#0f1629]/50 border-white/10 p-4 lg:p-6">
                <h2 className="text-lg lg:text-xl font-bold text-white mb-4 lg:mb-6">Data Management</h2>
                <div className="space-y-3 lg:space-y-4">
                  <Button
                    variant="outline"
                    className="w-full border-white/10 text-white hover:bg-[#1a1f35] bg-transparent justify-start text-xs lg:text-sm"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download My Data
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full border-white/10 text-white hover:bg-[#1a1f35] bg-transparent justify-start text-xs lg:text-sm"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Export Analytics Report
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full border-white/10 text-white hover:bg-[#1a1f35] bg-transparent justify-start text-xs lg:text-sm"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Clear Activity History
                  </Button>
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="integrations" className="space-y-4 lg:space-y-6">
              <Card className="bg-[#0f1629]/50 border-white/10 p-4 lg:p-6">
                <h2 className="text-lg lg:text-xl font-bold text-white mb-4 lg:mb-6">Platform Integrations</h2>
                <div className="space-y-3 lg:space-y-4">
                  {[
                    { name: "Google Analytics", icon: Globe, connected: true, status: "Connected" },
                    { name: "TikTok", icon: Youtube, connected: false, status: "Not Connected" },
                    { name: "LinkedIn", icon: Link2, connected: false, status: "Not Connected" },
                  ].map((integration) => {
                    const Icon = integration.icon
                    return (
                      <div
                        key={integration.name}
                        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3 lg:p-4 bg-[#1a1f35] rounded-lg"
                      >
                        <div className="flex items-center gap-3 lg:gap-3 min-w-0 flex-1">
                          <div className="h-10 w-10 lg:h-12 lg:w-12 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                            <Icon className="w-5 h-5 lg:w-6 lg:h-6 text-blue-500" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-white font-medium text-xs lg:text-sm truncate">{integration.name}</p>
                            <p className="text-xs text-gray-400">{integration.status}</p>
                          </div>
                        </div>
                        {integration.connected ? (
                          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                            <Badge className="bg-green-500/20 text-green-500 text-xs text-center py-1">Connected</Badge>
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-white/10 text-white hover:bg-[#252b45] bg-transparent text-xs w-full sm:w-auto"
                            >
                              Disconnect
                            </Button>
                          </div>
                        ) : (
                          <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-xs w-full sm:w-auto">
                            Connect
                          </Button>
                        )}
                      </div>
                    )
                  })}
                </div>
              </Card>

              <Card className="bg-[#0f1629]/50 border-white/10 p-4 lg:p-6">
                <h2 className="text-lg lg:text-xl font-bold text-white mb-4 lg:mb-6">API Access</h2>
                <div className="space-y-4">
                  <div className="p-4 bg-[#1a1f35] rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Key className="w-4 h-4 lg:w-5 lg:h-5 text-blue-500" />
                        <p className="text-white font-medium text-xs lg:text-sm">API Token</p>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setShowApiToken(!showApiToken)}
                        className="text-gray-400 hover:text-white text-xs"
                      >
                        {showApiToken ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </Button>
                    </div>
                    <div className="flex items-center gap-2">
                      <code className="flex-1 p-2 bg-[#0f1629] rounded text-xs text-gray-400 font-mono overflow-x-auto">
                        {showApiToken ? "shor_live_1234567890abcdef" : "••••••••••••••••••••"}
                      </code>
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-white/10 text-white hover:bg-[#252b45] bg-transparent flex-shrink-0"
                        onClick={() => {
                          navigator.clipboard.writeText("shor_live_1234567890abcdef")
                          toast({
                            title: "Copied!",
                            description: "API token copied to clipboard",
                          })
                        }}
                      >
                        <Copy className="w-3 h-3 lg:w-4 lg:h-4" />
                      </Button>
                    </div>
                    <p className="text-xs text-gray-400 mt-2">Use this token to access the Shor API</p>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <Button
                      variant="outline"
                      className="flex-1 border-white/10 text-white hover:bg-[#1a1f35] bg-transparent text-xs justify-center"
                    >
                      <RefreshCw className="w-3 h-3 lg:w-4 lg:h-4 mr-2" />
                      Regenerate Token
                    </Button>
                    <Button
                      variant="outline"
                      className="flex-1 border-red-500/50 text-red-500 hover:bg-red-500/10 bg-transparent text-xs justify-center"
                    >
                      <Trash2 className="w-3 h-3 lg:w-4 lg:h-4 mr-2" />
                      Revoke Access
                    </Button>
                  </div>
                </div>
              </Card>
            </TabsContent>

            {/* Security Settings */}
            <TabsContent value="security" className="space-y-4 lg:space-y-6">
              <Card className="bg-[#0f1629]/50 border-white/10 p-4 lg:p-6">
                <h2 className="text-lg lg:text-xl font-bold text-white mb-4 lg:mb-6">Password & Security</h2>
                <div className="space-y-4 lg:space-y-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="current-password" className="text-white text-xs lg:text-sm">
                        Current Password
                      </Label>
                      <Input
                        id="current-password"
                        type="password"
                        onChange={handleInputChange}
                        className="bg-[#1a1f35] border-white/10 text-white text-sm"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="new-password" className="text-white text-xs lg:text-sm">
                        New Password
                      </Label>
                      <Input
                        id="new-password"
                        type="password"
                        onChange={handleInputChange}
                        className="bg-[#1a1f35] border-white/10 text-white text-sm"
                      />
                      <p className="text-xs text-gray-400">Must be at least 8 characters with numbers and symbols</p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirm-password" className="text-white text-xs lg:text-sm">
                        Confirm New Password
                      </Label>
                      <Input
                        id="confirm-password"
                        type="password"
                        onChange={handleInputChange}
                        className="bg-[#1a1f35] border-white/10 text-white text-sm"
                      />
                    </div>
                  </div>
                  <Button className="bg-blue-600 hover:bg-blue-700 text-sm">Update Password</Button>
                </div>
              </Card>

              <Card className="bg-[#0f1629]/50 border-white/10 p-4 lg:p-6">
                <h2 className="text-lg lg:text-xl font-bold text-white mb-4 lg:mb-6">Two-Factor Authentication</h2>
                <div className="flex items-center justify-between p-3 lg:p-4 bg-[#1a1f35] rounded-lg">
                  <div className="flex items-center gap-2 lg:gap-3">
                    <Shield className="w-4 h-4 lg:w-5 lg:h-5 text-yellow-500" />
                    <div>
                      <p className="text-white font-medium text-xs lg:text-sm">2FA Status</p>
                      <p className="text-xs text-gray-400">Not enabled</p>
                    </div>
                  </div>
                  <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-xs">
                    Enable 2FA
                  </Button>
                </div>
                <div className="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/50 rounded-lg flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-yellow-500 mt-0.5" />
                  <p className="text-xs text-yellow-500">
                    Enable 2FA to add an extra layer of security to your account
                  </p>
                </div>
              </Card>

              <Card className="bg-[#0f1629]/50 border-white/10 p-4 lg:p-6">
                <h2 className="text-lg lg:text-xl font-bold text-white mb-4 lg:mb-6">Account Actions</h2>
                <div className="space-y-3 lg:space-y-4">
                  <Button
                    variant="outline"
                    className="w-full border-yellow-500/50 text-yellow-500 hover:bg-yellow-500/10 bg-transparent justify-start text-xs lg:text-sm"
                  >
                    <AlertCircle className="w-4 h-4 mr-2" />
                    Deactivate Account
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full border-red-500/50 text-red-500 hover:bg-red-500/10 bg-transparent justify-start text-xs lg:text-sm"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete Account Permanently
                  </Button>
                </div>
                <p className="text-xs text-gray-400 mt-4">
                  Deactivating your account will hide your profile. Deleting is permanent and cannot be undone.
                </p>
              </Card>
            </TabsContent>
          </Tabs>

          {hasChanges && (
            <div className="fixed bottom-0 left-0 right-0 lg:left-64 bg-[#1a1f35] border-t border-white/10 p-3 lg:p-4 flex items-center justify-between z-50">
              <p className="text-white text-xs lg:text-sm">You have unsaved changes</p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCancel}
                  className="border-white/10 text-white hover:bg-[#252b45] bg-transparent text-xs"
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={handleSave}
                  disabled={isSaving}
                  className="bg-blue-600 hover:bg-blue-700 text-xs"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-3 h-3 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </Button>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
