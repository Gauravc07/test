"use client"

import { useState } from "react"
import { BrandSidebar } from "@/components/brand-sidebar"
import { BrandHeader } from "@/components/brand-header"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  Building2,
  Mail,
  Globe,
  Users,
  Bell,
  CreditCard,
  Upload,
  Plus,
  Shield,
  Trash2,
  Download,
  Eye,
  EyeOff,
  Check,
  ChevronDown,
  User,
  Plug,
  AlertTriangle,
  RefreshCw,
  Instagram,
  Youtube,
  Linkedin,
  Twitter,
  Smartphone,
  LogOut,
  MoreVertical,
} from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { toast } from "sonner"

type SettingsSection =
  | "profile"
  | "account"
  | "billing"
  | "team"
  | "notifications"
  | "integrations"
  | "privacy"
  | "danger"

const sections = [
  { id: "profile" as const, label: "Profile", icon: Building2 },
  { id: "account" as const, label: "Account", icon: User },
  { id: "billing" as const, label: "Billing", icon: CreditCard },
  { id: "team" as const, label: "Team Members", icon: Users },
  { id: "notifications" as const, label: "Notifications", icon: Bell },
  { id: "integrations" as const, label: "Integrations", icon: Plug },
  { id: "privacy" as const, label: "Privacy", icon: Shield },
  { id: "danger" as const, label: "Danger Zone", icon: AlertTriangle },
]

export default function SettingsPage() {
  const [activeSection, setActiveSection] = useState<SettingsSection>("profile")
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [show2FASetup, setShow2FASetup] = useState(false)
  const [showInviteModal, setShowInviteModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [autoSave, setAutoSave] = useState(true)

  const activeItem = sections.find((s) => s.id === activeSection)

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <BrandSidebar />

      <div className="flex-1 flex flex-col overflow-hidden lg:pl-64">
        <BrandHeader />

        <main className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
            {/* Header */}
            <div className="mb-6 sm:mb-8">
              <div className="flex items-center justify-between mb-2">
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold">Settings</h1>
                <div className="flex items-center gap-2">
                  <span className="text-xs sm:text-sm text-muted-foreground">Auto-save</span>
                  <Switch checked={autoSave} onCheckedChange={setAutoSave} />
                </div>
              </div>
              <p className="text-sm sm:text-base text-muted-foreground">
                Manage your brand profile, team, and preferences
              </p>
            </div>

            <div className="flex flex-col lg:flex-row gap-6">
              <div className="lg:hidden">
                <DropdownMenu open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-between bg-card border-white/10 text-white hover:bg-[#252b45]"
                    >
                      <span className="flex items-center gap-2">
                        {activeItem && <activeItem.icon className="w-4 h-4" />}
                        <span className="text-sm">{activeItem?.label}</span>
                      </span>
                      <ChevronDown className="w-4 h-4 opacity-50" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-[calc(100vw-2rem)] bg-card border-white/10">
                    {sections.map((section) => (
                      <DropdownMenuItem
                        key={section.id}
                        onClick={() => {
                          setActiveSection(section.id)
                          setMobileMenuOpen(false)
                        }}
                        className="flex items-center gap-2 py-3 cursor-pointer hover:bg-[#252b45]"
                      >
                        <section.icon className="w-4 h-4" />
                        <span className="text-sm">{section.label}</span>
                        {activeSection === section.id && <Check className="w-4 h-4 ml-auto text-primary" />}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <aside className="hidden lg:block w-64 flex-shrink-0">
                <Card className="sticky top-6">
                  <CardContent className="p-2">
                    <nav className="space-y-1">
                      {sections.map((section) => {
                        const Icon = section.icon
                        const isActive = activeSection === section.id
                        return (
                          <button
                            key={section.id}
                            onClick={() => setActiveSection(section.id)}
                            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                              isActive
                                ? "bg-primary text-primary-foreground"
                                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                            }`}
                          >
                            <Icon className="w-4 h-4" />
                            <span>{section.label}</span>
                          </button>
                        )
                      })}
                    </nav>
                  </CardContent>
                </Card>
              </aside>

              <div className="flex-1 space-y-6 min-w-0">
                {/* Profile Section */}
                {activeSection === "profile" && (
                  <div className="space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg sm:text-xl">Brand Profile</CardTitle>
                        <CardDescription className="text-xs sm:text-sm">
                          Your brand identity and public presence
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        {/* Logo Upload with Preview */}
                        <div className="flex flex-col sm:flex-row items-start gap-6">
                          <div className="flex flex-col items-center gap-3">
                            <Avatar className="h-24 w-24 sm:h-32 sm:w-32">
                              <AvatarImage src="/brand-logo.jpg" />
                              <AvatarFallback className="bg-primary/10">
                                <Building2 className="h-12 w-12 sm:h-16 sm:w-16 text-primary" />
                              </AvatarFallback>
                            </Avatar>
                            <Button variant="outline" size="sm" className="text-xs bg-transparent">
                              <Upload className="h-3 h-3 mr-2" />
                              Upload Logo
                            </Button>
                          </div>
                          <div className="flex-1 space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label htmlFor="brandName" className="text-xs sm:text-sm">
                                  Brand Name
                                </Label>
                                <Input
                                  id="brandName"
                                  placeholder="Your Brand Name"
                                  defaultValue="TechCorp"
                                  className="text-xs sm:text-sm"
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="industry" className="text-xs sm:text-sm">
                                  Industry
                                </Label>
                                <Select defaultValue="tech">
                                  <SelectTrigger className="text-xs sm:text-sm">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="tech">Technology</SelectItem>
                                    <SelectItem value="fashion">Fashion</SelectItem>
                                    <SelectItem value="beauty">Beauty</SelectItem>
                                    <SelectItem value="food">Food & Beverage</SelectItem>
                                    <SelectItem value="fitness">Fitness</SelectItem>
                                    <SelectItem value="travel">Travel</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="bio" className="text-xs sm:text-sm">
                                Short Bio
                              </Label>
                              <Textarea
                                id="bio"
                                placeholder="Tell us about your brand in 150-200 characters..."
                                rows={3}
                                maxLength={200}
                                className="text-xs sm:text-sm resize-none"
                              />
                              <p className="text-xs text-muted-foreground">0/200 characters</p>
                            </div>
                          </div>
                        </div>

                        <Separator />

                        {/* Contact Information */}
                        <div className="space-y-4">
                          <h3 className="text-sm sm:text-base font-semibold">Contact Information</h3>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="website" className="text-xs sm:text-sm flex items-center gap-2">
                                <Globe className="h-3 h-3" />
                                Website URL
                              </Label>
                              <Input
                                id="website"
                                placeholder="https://yourbrand.com"
                                defaultValue="https://techcorp.com"
                                className="text-xs sm:text-sm"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="email" className="text-xs sm:text-sm flex items-center gap-2">
                                <Mail className="h-3 h-3" />
                                Business Email
                              </Label>
                              <div className="relative">
                                <Input
                                  id="email"
                                  type="email"
                                  placeholder="contact@brand.com"
                                  defaultValue="contact@techcorp.com"
                                  className="text-xs sm:text-sm pr-20"
                                />
                                <Badge className="absolute right-2 top-1/2 -translate-y-1/2 bg-green-500/20 text-green-500 text-xs">
                                  Verified
                                </Badge>
                              </div>
                            </div>
                          </div>
                        </div>

                        <Separator />

                        {/* Social Handles */}
                        <div className="space-y-4">
                          <h3 className="text-sm sm:text-base font-semibold">Social Media</h3>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="instagram" className="text-xs sm:text-sm flex items-center gap-2">
                                <Instagram className="h-3 h-3" />
                                Instagram
                              </Label>
                              <Input id="instagram" placeholder="@yourbrand" className="text-xs sm:text-sm" />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="youtube" className="text-xs sm:text-sm flex items-center gap-2">
                                <Youtube className="h-3 h-3" />
                                YouTube
                              </Label>
                              <Input id="youtube" placeholder="@yourbrand" className="text-xs sm:text-sm" />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="linkedin" className="text-xs sm:text-sm flex items-center gap-2">
                                <Linkedin className="h-3 h-3" />
                                LinkedIn
                              </Label>
                              <Input id="linkedin" placeholder="company/yourbrand" className="text-xs sm:text-sm" />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="twitter" className="text-xs sm:text-sm flex items-center gap-2">
                                <Twitter className="h-3 h-3" />
                                Twitter/X
                              </Label>
                              <Input id="twitter" placeholder="@yourbrand" className="text-xs sm:text-sm" />
                            </div>
                          </div>
                        </div>

                        <Button className="w-full sm:w-auto text-xs sm:text-sm">Save Profile Changes</Button>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {/* Account Section */}
                {activeSection === "account" && (
                  <div className="space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg sm:text-xl">Account Security</CardTitle>
                        <CardDescription className="text-xs sm:text-sm">
                          Manage your password and security settings
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        {/* Password Change */}
                        <div className="space-y-4">
                          <h3 className="text-sm sm:text-base font-semibold">Change Password</h3>
                          <div className="space-y-4">
                            <div className="space-y-2">
                              <Label htmlFor="currentPassword" className="text-xs sm:text-sm">
                                Current Password
                              </Label>
                              <div className="relative">
                                <Input
                                  id="currentPassword"
                                  type={showPassword ? "text" : "password"}
                                  className="text-xs sm:text-sm pr-10"
                                />
                                <button
                                  type="button"
                                  onClick={() => setShowPassword(!showPassword)}
                                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                >
                                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                              </div>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label htmlFor="newPassword" className="text-xs sm:text-sm">
                                  New Password
                                </Label>
                                <Input id="newPassword" type="password" className="text-xs sm:text-sm" />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="confirmPassword" className="text-xs sm:text-sm">
                                  Confirm Password
                                </Label>
                                <Input id="confirmPassword" type="password" className="text-xs sm:text-sm" />
                              </div>
                            </div>
                            <Button variant="outline" size="sm" className="text-xs sm:text-sm bg-transparent">
                              Update Password
                            </Button>
                          </div>
                        </div>

                        <Separator />

                        {/* 2FA Setup */}
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <h3 className="text-sm sm:text-base font-semibold">Two-Factor Authentication</h3>
                              <p className="text-xs sm:text-sm text-muted-foreground">
                                Add an extra layer of security to your account
                              </p>
                            </div>
                            <Badge variant="outline" className="text-xs">
                              Not Enabled
                            </Badge>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-xs sm:text-sm bg-transparent"
                            onClick={() => setShow2FASetup(true)}
                          >
                            <Shield className="h-4 w-4 mr-2" />
                            Enable 2FA
                          </Button>
                        </div>

                        <Separator />

                        {/* Active Sessions */}
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <h3 className="text-sm sm:text-base font-semibold">Active Sessions</h3>
                            <Button variant="outline" size="sm" className="text-xs bg-transparent">
                              <LogOut className="h-3 h-3 mr-2" />
                              End All Sessions
                            </Button>
                          </div>
                          <div className="space-y-3">
                            {[
                              { device: "Chrome on MacBook Pro", location: "San Francisco, US", current: true },
                              { device: "Safari on iPhone 14", location: "San Francisco, US", current: false },
                            ].map((session, idx) => (
                              <div
                                key={idx}
                                className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 sm:p-4 border rounded-lg"
                              >
                                <div className="flex items-start gap-3">
                                  <Smartphone className="h-5 w-5 text-muted-foreground mt-0.5" />
                                  <div>
                                    <p className="text-sm font-medium">{session.device}</p>
                                    <p className="text-xs text-muted-foreground">{session.location}</p>
                                    {session.current && (
                                      <Badge className="mt-1 bg-green-500/20 text-green-500 text-xs">
                                        Current Session
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                                {!session.current && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="text-xs w-full sm:w-auto bg-transparent"
                                  >
                                    Revoke
                                  </Button>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {/* Billing Section */}
                {activeSection === "billing" && (
                  <div className="space-y-6">
                    {/* Payment Methods */}
                    <Card>
                      <CardHeader>
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                          <div>
                            <CardTitle className="text-lg sm:text-xl">Payment Methods</CardTitle>
                            <CardDescription className="text-xs sm:text-sm">
                              Manage your payment methods
                            </CardDescription>
                          </div>
                          <Button size="sm" className="w-full sm:w-auto text-xs sm:text-sm">
                            <Plus className="h-4 w-4 mr-2" />
                            Add Card
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="p-4 border rounded-lg">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div className="flex items-center gap-3">
                              <CreditCard className="h-5 w-5 text-primary" />
                              <div>
                                <p className="text-sm font-medium">•••• •••• •••• 4242</p>
                                <p className="text-xs text-muted-foreground">Expires 12/25</p>
                              </div>
                              <Badge className="bg-primary/20 text-primary text-xs">Default</Badge>
                            </div>
                            <div className="flex gap-2">
                              <Button variant="outline" size="sm" className="text-xs bg-transparent">
                                Edit
                              </Button>
                              <Button variant="outline" size="sm" className="text-xs text-red-500 bg-transparent">
                                Remove
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Transaction History */}
                    <Card>
                      <CardHeader>
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                          <div>
                            <CardTitle className="text-lg sm:text-xl">Transaction History</CardTitle>
                            <CardDescription className="text-xs sm:text-sm mt-1">
                              View and download your invoices
                            </CardDescription>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full sm:w-auto text-xs sm:text-sm bg-transparent"
                          >
                            <Download className="h-4 w-4 mr-2" />
                            Export CSV
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="overflow-x-auto -mx-4 sm:mx-0">
                          <div className="inline-block min-w-full align-middle px-4 sm:px-0">
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead className="text-xs whitespace-nowrap">Date</TableHead>
                                  <TableHead className="text-xs whitespace-nowrap">Description</TableHead>
                                  <TableHead className="text-xs whitespace-nowrap">Amount</TableHead>
                                  <TableHead className="text-xs whitespace-nowrap">Status</TableHead>
                                  <TableHead className="text-xs whitespace-nowrap">Invoice</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {[
                                  {
                                    date: "Jan 15, 2025",
                                    description: "Campaign Payment - Fashion Week",
                                    amount: "$2,500",
                                    status: "Paid",
                                  },
                                  {
                                    date: "Jan 1, 2025",
                                    description: "Monthly Subscription",
                                    amount: "$99",
                                    status: "Paid",
                                  },
                                  {
                                    date: "Dec 15, 2024",
                                    description: "Campaign Payment - Holiday Sale",
                                    amount: "$1,800",
                                    status: "Paid",
                                  },
                                ].map((transaction, idx) => (
                                  <TableRow key={idx}>
                                    <TableCell className="text-xs whitespace-nowrap">{transaction.date}</TableCell>
                                    <TableCell className="text-xs">{transaction.description}</TableCell>
                                    <TableCell className="text-xs font-medium whitespace-nowrap">
                                      {transaction.amount}
                                    </TableCell>
                                    <TableCell>
                                      <Badge className="bg-green-500/20 text-green-500 text-xs whitespace-nowrap">
                                        {transaction.status}
                                      </Badge>
                                    </TableCell>
                                    <TableCell>
                                      <Button variant="ghost" size="sm" className="h-8 text-xs whitespace-nowrap">
                                        <Download className="h-3 w-3 mr-1" />
                                        PDF
                                      </Button>
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Tax Information */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg sm:text-xl">Tax Information</CardTitle>
                        <CardDescription className="text-xs sm:text-sm">
                          Manage your tax details for invoicing
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="taxId" className="text-xs sm:text-sm">
                              Tax ID / GSTIN
                            </Label>
                            <Input id="taxId" placeholder="Enter your tax ID" className="text-xs sm:text-sm" />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="billingAddress" className="text-xs sm:text-sm">
                              Billing Address
                            </Label>
                            <Input
                              id="billingAddress"
                              placeholder="Enter billing address"
                              className="text-xs sm:text-sm"
                            />
                          </div>
                        </div>
                        <Button variant="outline" size="sm" className="text-xs sm:text-sm bg-transparent">
                          Save Tax Information
                        </Button>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {/* Team Section */}
                {activeSection === "team" && (
                  <div className="space-y-6">
                    <Card>
                      <CardHeader>
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                          <div>
                            <CardTitle className="text-lg sm:text-xl">Team Members</CardTitle>
                            <CardDescription className="text-xs sm:text-sm">
                              Manage team access and permissions
                            </CardDescription>
                          </div>
                          <Button
                            size="sm"
                            className="w-full sm:w-auto text-xs sm:text-sm"
                            onClick={() => setShowInviteModal(true)}
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            Invite Member
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {[
                            {
                              name: "John Doe",
                              email: "john@techcorp.com",
                              role: "Admin",
                              lastActive: "2 hours ago",
                            },
                            {
                              name: "Jane Smith",
                              email: "jane@techcorp.com",
                              role: "Manager",
                              lastActive: "1 day ago",
                            },
                            {
                              name: "Mike Johnson",
                              email: "mike@techcorp.com",
                              role: "Viewer",
                              lastActive: "3 days ago",
                            },
                          ].map((member, idx) => (
                            <div
                              key={idx}
                              className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 sm:p-4 border rounded-lg"
                            >
                              <div className="flex items-center gap-3 min-w-0 flex-1">
                                <Avatar className="h-10 w-10 flex-shrink-0">
                                  <AvatarFallback>{member.name[0]}</AvatarFallback>
                                </Avatar>
                                <div className="min-w-0 flex-1">
                                  <p className="text-sm font-medium truncate">{member.name}</p>
                                  <p className="text-xs text-muted-foreground truncate">{member.email}</p>
                                  <p className="text-xs text-muted-foreground">Last active: {member.lastActive}</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2 flex-shrink-0">
                                <Select defaultValue={member.role.toLowerCase()}>
                                  <SelectTrigger className="w-full sm:w-32 text-xs">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="admin">Admin</SelectItem>
                                    <SelectItem value="manager">Manager</SelectItem>
                                    <SelectItem value="viewer">Viewer</SelectItem>
                                  </SelectContent>
                                </Select>
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                      <MoreVertical className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem className="text-xs">Edit Permissions</DropdownMenuItem>
                                    <DropdownMenuItem className="text-xs text-red-500">Remove Member</DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>

                    {/* Role Descriptions */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg sm:text-xl">Role Permissions</CardTitle>
                        <CardDescription className="text-xs sm:text-sm">
                          Understanding team member roles
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-3">
                          <div className="p-3 border rounded-lg">
                            <h4 className="text-sm font-semibold mb-1">Admin</h4>
                            <p className="text-xs text-muted-foreground">
                              Full access to all features, can manage team members and billing
                            </p>
                          </div>
                          <div className="p-3 border rounded-lg">
                            <h4 className="text-sm font-semibold mb-1">Manager</h4>
                            <p className="text-xs text-muted-foreground">
                              Can create campaigns, manage influencers, and view analytics
                            </p>
                          </div>
                          <div className="p-3 border rounded-lg">
                            <h4 className="text-sm font-semibold mb-1">Viewer</h4>
                            <p className="text-xs text-muted-foreground">Read-only access to campaigns and analytics</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {/* Notifications Section */}
                {activeSection === "notifications" && (
                  <div className="space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg sm:text-xl">Notification Preferences</CardTitle>
                        <CardDescription className="text-xs sm:text-sm">
                          Choose how you want to be notified
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        {/* Email Notifications */}
                        <div className="space-y-4">
                          <h3 className="text-sm sm:text-base font-semibold">Email Notifications</h3>
                          {[
                            {
                              label: "Campaign Updates",
                              description: "New applications and milestone completions",
                            },
                            {
                              label: "Influencer Matches",
                              description: "New recommended influencer profiles",
                            },
                            {
                              label: "Payment Alerts",
                              description: "Payment confirmations and invoice updates",
                            },
                            {
                              label: "Weekly Reports",
                              description: "Performance summaries every Monday",
                            },
                          ].map((item, idx) => (
                            <div key={idx} className="flex items-start justify-between gap-4">
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium">{item.label}</p>
                                <p className="text-xs text-muted-foreground">{item.description}</p>
                              </div>
                              <Switch defaultChecked />
                            </div>
                          ))}
                        </div>

                        <Separator />

                        {/* In-App Notifications */}
                        <div className="space-y-4">
                          <h3 className="text-sm sm:text-base font-semibold">In-App Notifications</h3>
                          {[
                            {
                              label: "New Messages",
                              description: "Alerts for new messages from influencers",
                            },
                            {
                              label: "System Updates",
                              description: "Platform updates and new features",
                            },
                          ].map((item, idx) => (
                            <div key={idx} className="flex items-start justify-between gap-4">
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium">{item.label}</p>
                                <p className="text-xs text-muted-foreground">{item.description}</p>
                              </div>
                              <Switch defaultChecked />
                            </div>
                          ))}
                        </div>

                        <Separator />

                        {/* Slack Integration */}
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <h3 className="text-sm sm:text-base font-semibold">Slack Integration</h3>
                              <p className="text-xs text-muted-foreground">
                                Receive notifications in your Slack workspace
                              </p>
                            </div>
                            <Badge variant="outline" className="text-xs">
                              Not Connected
                            </Badge>
                          </div>
                          <Button variant="outline" size="sm" className="text-xs sm:text-sm bg-transparent">
                            <Plug className="h-4 w-4 mr-2" />
                            Connect Slack
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {/* Integrations Section */}
                {activeSection === "integrations" && (
                  <div className="space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg sm:text-xl">Connected Integrations</CardTitle>
                        <CardDescription className="text-xs sm:text-sm">
                          Connect external analytics and ad platforms
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {[
                            {
                              name: "Google Analytics 4",
                              description: "Track campaign conversions",
                              connected: true,
                            },
                            {
                              name: "Meta Ads Manager",
                              description: "Sync ad metrics",
                              connected: false,
                            },
                            {
                              name: "TikTok Ads",
                              description: "Pull engagement data",
                              connected: false,
                            },
                            {
                              name: "HubSpot CRM",
                              description: "Sync leads and contacts",
                              connected: false,
                            },
                          ].map((integration, idx) => (
                            <div key={idx} className="p-4 border rounded-lg space-y-3">
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex-1 min-w-0">
                                  <h4 className="text-sm font-semibold truncate">{integration.name}</h4>
                                  <p className="text-xs text-muted-foreground">{integration.description}</p>
                                </div>
                                {integration.connected && (
                                  <Badge className="bg-green-500/20 text-green-500 text-xs flex-shrink-0">
                                    Connected
                                  </Badge>
                                )}
                              </div>
                              <div className="flex flex-col sm:flex-row gap-2">
                                {integration.connected ? (
                                  <>
                                    <Button variant="outline" size="sm" className="w-full text-xs bg-transparent">
                                      <RefreshCw className="h-3 w-3 mr-2" />
                                      Refresh
                                    </Button>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className="w-full text-xs text-red-500 border-red-500/50 hover:bg-red-500/10 bg-transparent"
                                    >
                                      Disconnect
                                    </Button>
                                  </>
                                ) : (
                                  <Button size="sm" className="w-full text-xs">
                                    <Plug className="h-3 w-3 mr-2" />
                                    Connect
                                  </Button>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {/* Privacy Section */}
                {activeSection === "privacy" && (
                  <div className="space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg sm:text-xl">Privacy Settings</CardTitle>
                        <CardDescription className="text-xs sm:text-sm">
                          Control your brand visibility and data
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="space-y-4">
                          {[
                            {
                              label: "Campaign Visibility",
                              description: "Make campaigns visible to verified influencers",
                              defaultChecked: true,
                            },
                            {
                              label: "Allow Influencer Messages",
                              description: "Let influencers send you direct messages",
                              defaultChecked: true,
                            },
                            {
                              label: "Hide Brand Name",
                              description: "Hide your brand name until influencer acceptance",
                              defaultChecked: false,
                            },
                            {
                              label: "Public Profile",
                              description: "Make your brand profile visible in search",
                              defaultChecked: true,
                            },
                          ].map((item, idx) => (
                            <div key={idx} className="flex items-start justify-between gap-4">
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium">{item.label}</p>
                                <p className="text-xs text-muted-foreground">{item.description}</p>
                              </div>
                              <Switch defaultChecked={item.defaultChecked} />
                            </div>
                          ))}
                        </div>

                        <Separator />

                        <div className="space-y-4">
                          <h3 className="text-sm sm:text-base font-semibold">Data & Privacy</h3>
                          <div className="p-4 bg-muted/50 rounded-lg space-y-2">
                            <p className="text-xs text-muted-foreground">
                              <strong>Influencers will see:</strong> Your brand name, logo, industry, and campaign
                              details
                            </p>
                            <p className="text-xs text-muted-foreground">
                              <strong>We never share:</strong> Your payment information, team member details, or private
                              analytics
                            </p>
                          </div>
                          <Button variant="outline" size="sm" className="text-xs sm:text-sm bg-transparent">
                            <Download className="h-4 w-4 mr-2" />
                            Download My Data
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {/* Danger Zone Section */}
                {activeSection === "danger" && (
                  <div className="space-y-6">
                    <Card className="border-red-500/50">
                      <CardHeader>
                        <CardTitle className="text-lg sm:text-xl text-red-500 flex items-center gap-2">
                          <AlertTriangle className="h-5 w-5" />
                          Danger Zone
                        </CardTitle>
                        <CardDescription className="text-xs sm:text-sm">
                          Irreversible actions that affect your account
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        {/* Export Data */}
                        <div className="p-4 border border-white/10 rounded-lg space-y-3">
                          <div>
                            <h3 className="text-sm font-semibold">Export Account Data</h3>
                            <p className="text-xs text-muted-foreground">
                              Download all your campaigns, payments, and team data
                            </p>
                          </div>
                          <Button variant="outline" size="sm" className="text-xs sm:text-sm bg-transparent">
                            <Download className="h-4 w-4 mr-2" />
                            Export Data (JSON/CSV)
                          </Button>
                        </div>

                        {/* Deactivate Account */}
                        <div className="p-4 border border-orange-500/50 rounded-lg space-y-3">
                          <div>
                            <h3 className="text-sm font-semibold text-orange-500">Deactivate Account</h3>
                            <p className="text-xs text-muted-foreground">
                              Temporarily suspend your account. Data will be kept for 30 days.
                            </p>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-xs sm:text-sm border-orange-500/50 text-orange-500 hover:bg-orange-500/10 bg-transparent"
                          >
                            Deactivate Account
                          </Button>
                        </div>

                        {/* Delete Account */}
                        <div className="p-4 border border-red-500/50 rounded-lg space-y-3">
                          <div>
                            <h3 className="text-sm font-semibold text-red-500">Delete Account Permanently</h3>
                            <p className="text-xs text-muted-foreground">
                              This action cannot be undone. All your data will be permanently deleted.
                            </p>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-xs sm:text-sm border-red-500/50 text-red-500 hover:bg-red-500/10 bg-transparent"
                            onClick={() => setShowDeleteModal(true)}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete Account
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>

        {!autoSave && (
          <div className="sticky bottom-0 border-t bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80 p-4">
            <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
              <p className="text-xs sm:text-sm text-muted-foreground">You have unsaved changes</p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="text-xs sm:text-sm bg-transparent">
                  Discard
                </Button>
                <Button size="sm" className="text-xs sm:text-sm">
                  Save Changes
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      <Dialog open={showInviteModal} onOpenChange={setShowInviteModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg">Invite Team Member</DialogTitle>
            <DialogDescription className="text-xs sm:text-sm">
              Send an invitation to join your brand team
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="inviteEmail" className="text-xs sm:text-sm">
                Email Address
              </Label>
              <Input id="inviteEmail" type="email" placeholder="colleague@company.com" className="text-xs sm:text-sm" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="inviteRole" className="text-xs sm:text-sm">
                Role
              </Label>
              <Select defaultValue="viewer">
                <SelectTrigger className="text-xs sm:text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="manager">Manager</SelectItem>
                  <SelectItem value="viewer">Viewer</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowInviteModal(false)}
              className="text-xs sm:text-sm"
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={() => {
                toast.success("Invitation sent successfully!")
                setShowInviteModal(false)
              }}
              className="text-xs sm:text-sm"
            >
              Send Invitation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg text-red-500 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Delete Account
            </DialogTitle>
            <DialogDescription className="text-xs sm:text-sm">
              This action cannot be undone. Please type your brand name to confirm.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="p-3 bg-red-500/10 border border-red-500/50 rounded-lg">
              <p className="text-xs text-red-500">
                All your campaigns, team members, and data will be permanently deleted.
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmDelete" className="text-xs sm:text-sm">
                Type <strong>TechCorp</strong> to confirm
              </Label>
              <Input id="confirmDelete" placeholder="Enter brand name" className="text-xs sm:text-sm" />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowDeleteModal(false)}
              className="text-xs sm:text-sm"
            >
              Cancel
            </Button>
            <Button size="sm" variant="destructive" className="text-xs sm:text-sm">
              Delete Account
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
