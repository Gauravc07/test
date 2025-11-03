"use client"

import { BrandSidebar } from "@/components/brand-sidebar"
import { BrandHeader } from "@/components/brand-header"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import {
  DollarSign,
  Download,
  Clock,
  CheckCircle2,
  Wallet,
  Search,
  Eye,
  Check,
  X,
  FileText,
  Calendar,
  Package,
  Info,
  Plus,
  Shield,
  BarChart3,
  PieChart,
  Mail,
} from "lucide-react"
import { useState } from "react"
import {
  BarChart,
  Bar,
  PieChart as RechartsPie,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"

export default function PaymentsPage() {
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null)
  const [showInvoiceModal, setShowInvoiceModal] = useState(false)
  const [showWalletModal, setShowWalletModal] = useState(false)
  const [autoPayEnabled, setAutoPayEnabled] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedTab, setSelectedTab] = useState("pending")
  const [showBenchmark, setShowBenchmark] = useState(false) // Added state for benchmark comparison

  const financialSummary = {
    totalSpendThisMonth: 280000,
    monthlyBudget: 350000,
    pendingPayouts: 48000,
    completedPayoutsYTD: 1250000,
    walletBalance: 125000,
    pendingInvoicesCount: 5,
  }

  const pendingInvoices = [
    {
      id: "INV-2024-045",
      date: "2024-01-22",
      influencer: { name: "Sarah Johnson", avatar: "SJ", handle: "@sarahjohnson" },
      campaign: "Summer Fashion Collection",
      deliverable: "3 Instagram Posts + 5 Stories",
      grossAmount: 15000,
      platformFee: 1500,
      netAmount: 13500,
      status: "pending",
      dueDate: "2024-01-25",
    },
    {
      id: "INV-2024-046",
      date: "2024-01-23",
      influencer: { name: "Mike Chen", avatar: "MC", handle: "@mikechen" },
      campaign: "Tech Product Launch",
      deliverable: "1 YouTube Video + 2 Shorts",
      grossAmount: 25000,
      platformFee: 2500,
      netAmount: 22500,
      status: "pending",
      dueDate: "2024-01-26",
    },
    {
      id: "INV-2024-047",
      date: "2024-01-23",
      influencer: { name: "Emma Davis", avatar: "ED", handle: "@emmadavis" },
      campaign: "Fitness Challenge",
      deliverable: "5 TikTok Videos",
      grossAmount: 12000,
      platformFee: 1200,
      netAmount: 10800,
      status: "pending",
      dueDate: "2024-01-27",
    },
  ]

  const transactionHistory = [
    {
      id: "TXN-2024-120",
      date: "2024-01-20",
      campaign: "Holiday Sale Campaign",
      influencer: "Alex Kumar",
      type: "Payout",
      amount: 18000,
      status: "completed",
      paymentMethod: "UPI - alex***@upi",
      invoiceId: "INV-2024-042",
    },
    {
      id: "TXN-2024-119",
      date: "2024-01-19",
      campaign: "New Year Launch",
      influencer: "Priya Sharma",
      type: "Payout",
      amount: 22000,
      status: "completed",
      paymentMethod: "Bank Transfer",
      invoiceId: "INV-2024-041",
    },
    {
      id: "TXN-2024-118",
      date: "2024-01-18",
      campaign: "Wallet Top-up",
      influencer: "-",
      type: "Top-up",
      amount: 100000,
      status: "completed",
      paymentMethod: "Razorpay",
      invoiceId: "-",
    },
  ]

  const spendVsBudgetData = [
    { month: "Jul", spend: 180000, budget: 250000 },
    { month: "Aug", spend: 220000, budget: 250000 },
    { month: "Sep", spend: 195000, budget: 300000 },
    { month: "Oct", spend: 285000, budget: 300000 },
    { month: "Nov", spend: 310000, budget: 350000 },
    { month: "Dec", spend: 340000, budget: 350000 },
    { month: "Jan", spend: 280000, budget: 350000 },
  ]

  const payoutTrendData = [
    { date: "Jan 15", payouts: 3, amount: 45000 },
    { date: "Jan 16", payouts: 2, amount: 28000 },
    { date: "Jan 17", payouts: 5, amount: 67000 },
    { date: "Jan 18", payouts: 1, amount: 22000 },
    { date: "Jan 19", payouts: 4, amount: 52000 },
    { date: "Jan 20", payouts: 2, amount: 36000 },
    { date: "Jan 21", payouts: 3, amount: 41000 },
  ]

  const campaignCostData = [
    { name: "Summer Fashion", value: 85000, color: "#f97316" },
    { name: "Tech Launch", value: 120000, color: "#fb923c" },
    { name: "Fitness Challenge", value: 45000, color: "#fdba74" },
    { name: "Holiday Sale", value: 30000, color: "#fed7aa" },
  ]

  const handleApproveInvoice = (invoice: any) => {
    console.log("[v0] Approving invoice:", invoice.id)
    // TODO: Implement approval logic
  }

  const handleRejectInvoice = (invoice: any) => {
    console.log("[v0] Rejecting invoice:", invoice.id)
    // TODO: Implement rejection logic
  }

  const handleViewInvoice = (invoice: any) => {
    setSelectedInvoice(invoice)
    setShowInvoiceModal(true)
  }

  const handleTopUpWallet = () => {
    setShowWalletModal(true)
  }

  const formatCurrency = (amount: number) => {
    return `₹${(amount / 1000).toFixed(1)}K`
  }

  const budgetProgress = (financialSummary.totalSpendThisMonth / financialSummary.monthlyBudget) * 100

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <BrandSidebar />

      <div className="flex-1 flex flex-col overflow-hidden lg:pl-64">
        <BrandHeader />

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {/* Header */}
          <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2">Payments & Financials</h1>
              <p className="text-sm sm:text-base text-muted-foreground">
                Manage campaign spend, influencer payouts, and invoices
              </p>
            </div>
            <Button className="bg-primary hover:bg-primary/90 w-full sm:w-auto">
              <Download className="h-4 w-4 mr-2" />
              Download Full Report
            </Button>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
            <Card className="overflow-hidden">
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="text-xs sm:text-sm text-muted-foreground mb-1">Total Spend (This Month)</p>
                    <p className="text-2xl sm:text-3xl font-bold">
                      {formatCurrency(financialSummary.totalSpendThisMonth)}
                    </p>
                  </div>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-primary/10 flex items-center justify-center">
                          <DollarSign className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="text-xs">Budget: {formatCurrency(financialSummary.monthlyBudget)}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>Budget Progress</span>
                    <span>{budgetProgress.toFixed(0)}%</span>
                  </div>
                  <Progress value={budgetProgress} className="h-2" />
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    {formatCurrency(financialSummary.monthlyBudget - financialSummary.totalSpendThisMonth)} remaining
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="text-xs sm:text-sm text-muted-foreground mb-1">Pending Payouts</p>
                    <p className="text-2xl sm:text-3xl font-bold text-yellow-600">
                      {formatCurrency(financialSummary.pendingPayouts)}
                    </p>
                  </div>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-yellow-500/10 flex items-center justify-center">
                          <Clock className="h-5 w-5 sm:h-6 sm:w-6 text-yellow-600" />
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <div className="text-xs space-y-1">
                          <p className="font-semibold">Breakdown by Campaign:</p>
                          <p>Summer Fashion: ₹13.5K</p>
                          <p>Tech Launch: ₹22.5K</p>
                          <p>Fitness Challenge: ₹10.8K</p>
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  {financialSummary.pendingInvoicesCount} invoices awaiting approval
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="text-xs sm:text-sm text-muted-foreground mb-1">Completed Payouts (YTD)</p>
                    <p className="text-2xl sm:text-3xl font-bold text-green-600">
                      ₹{(financialSummary.completedPayoutsYTD / 100000).toFixed(1)}L
                    </p>
                  </div>
                  <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-green-500/10 flex items-center justify-center">
                    <CheckCircle2 className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
                  </div>
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground">All approved and released</p>
              </CardContent>
            </Card>
          </div>

          <Card className="mb-6 sm:mb-8">
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <CardTitle className="text-lg sm:text-xl flex items-center gap-2">
                    <Wallet className="h-5 w-5 text-primary" />
                    Brand Wallet
                  </CardTitle>
                  <CardDescription className="text-xs sm:text-sm mt-1">
                    Manage your balance and auto-payout settings
                  </CardDescription>
                </div>
                <Button onClick={handleTopUpWallet} className="bg-primary hover:bg-primary/90 w-full sm:w-auto">
                  <Plus className="h-4 w-4 mr-2" />
                  Top Up Wallet
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Wallet Balance */}
                <div className="space-y-4">
                  <div className="p-4 sm:p-6 bg-gradient-to-br from-primary/10 to-primary/5 rounded-lg border border-primary/20">
                    <p className="text-xs sm:text-sm text-muted-foreground mb-2">Current Balance</p>
                    <p className="text-3xl sm:text-4xl font-bold text-primary mb-4">
                      {formatCurrency(financialSummary.walletBalance)}
                    </p>
                    <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
                      <Info className="h-4 w-4" />
                      <span>
                        Sufficient for{" "}
                        {Math.floor(
                          financialSummary.walletBalance /
                            (financialSummary.pendingPayouts / financialSummary.pendingInvoicesCount),
                        )}{" "}
                        upcoming payouts
                      </span>
                    </div>
                  </div>
                </div>

                {/* Auto-Pay Settings */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <Label htmlFor="auto-pay" className="text-sm font-semibold">
                        Auto-Approve Invoices
                      </Label>
                      <p className="text-xs text-muted-foreground mt-1">
                        Automatically approve invoices on content approval
                      </p>
                    </div>
                    <Switch id="auto-pay" checked={autoPayEnabled} onCheckedChange={setAutoPayEnabled} />
                  </div>

                  {autoPayEnabled && (
                    <div className="space-y-3 p-4 border rounded-lg bg-muted/30">
                      <div>
                        <Label htmlFor="delay" className="text-xs font-medium">
                          Payout Delay
                        </Label>
                        <Select defaultValue="3">
                          <SelectTrigger id="delay" className="mt-1">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1">1 day</SelectItem>
                            <SelectItem value="3">3 days</SelectItem>
                            <SelectItem value="5">5 days</SelectItem>
                            <SelectItem value="7">7 days</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Shield className="h-4 w-4" />
                        <span>Payouts will be processed automatically after the delay period</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="mb-6 sm:mb-8">
            <CardHeader>
              <CardTitle className="text-lg sm:text-xl">Pending Invoices</CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                Review and approve influencer payment requests
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {pendingInvoices.map((invoice) => (
                  <div key={invoice.id} className="p-4 border rounded-lg hover:bg-accent/50 transition-colors">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                      {/* Influencer Info */}
                      <div className="lg:col-span-3">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center font-semibold text-primary">
                            {invoice.influencer.avatar}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="font-semibold text-sm truncate">{invoice.influencer.name}</p>
                            <p className="text-xs text-muted-foreground truncate">{invoice.influencer.handle}</p>
                          </div>
                        </div>
                      </div>

                      {/* Campaign & Deliverable */}
                      <div className="lg:col-span-3">
                        <p className="text-xs text-muted-foreground mb-1">Campaign</p>
                        <p className="font-medium text-sm mb-2">{invoice.campaign}</p>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Package className="h-3 w-3" />
                          <span className="truncate">{invoice.deliverable}</span>
                        </div>
                      </div>

                      {/* Amount Breakdown */}
                      <div className="lg:col-span-3">
                        <div className="space-y-1">
                          <div className="flex justify-between text-xs">
                            <span className="text-muted-foreground">Gross Amount:</span>
                            <span className="font-medium">{formatCurrency(invoice.grossAmount)}</span>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span className="text-muted-foreground">Platform Fee (10%):</span>
                            <span className="text-red-500">-{formatCurrency(invoice.platformFee)}</span>
                          </div>
                          <Separator className="my-1" />
                          <div className="flex justify-between text-sm font-bold">
                            <span>Net Payout:</span>
                            <span className="text-primary">{formatCurrency(invoice.netAmount)}</span>
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="lg:col-span-3 flex flex-col gap-2">
                        <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
                          <Calendar className="h-3 w-3" />
                          <span>Due: {invoice.dueDate}</span>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleApproveInvoice(invoice)}
                            className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                          >
                            <Check className="h-3 w-3 mr-1" />
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleRejectInvoice(invoice)}
                            className="flex-1 border-red-500/50 text-red-500 hover:bg-red-500/10"
                          >
                            <X className="h-3 w-3 mr-1" />
                            Reject
                          </Button>
                        </div>
                        <Button size="sm" variant="ghost" onClick={() => handleViewInvoice(invoice)} className="w-full">
                          <Eye className="h-3 w-3 mr-1" />
                          View Invoice
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6 sm:mb-8">
            {/* Spend vs Budget Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-primary" />
                  Spend vs Budget
                </CardTitle>
                <CardDescription className="text-xs">Monthly comparison over last 7 months</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={spendVsBudgetData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                    <YAxis tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                    <RechartsTooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--popover))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: "12px" }} />
                    <Bar dataKey="spend" fill="#f97316" name="Spend" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="budget" fill="#fb923c" name="Budget" radius={[4, 4, 0, 0]} opacity={0.5} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Campaign Cost Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                  <PieChart className="h-5 w-5 text-primary" />
                  Campaign Cost Breakdown
                </CardTitle>
                <CardDescription className="text-xs">Spend distribution this month</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <RechartsPie>
                    <Pie
                      data={campaignCostData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {campaignCostData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <RechartsTooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--popover))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                      formatter={(value: any) => formatCurrency(value)}
                    />
                  </RechartsPie>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Benchmark Comparison Table */}
          {showBenchmark && (
            <Card className="bg-[#1a1f35] border-white/10 mb-6 overflow-hidden">
              <CardHeader>
                <CardTitle className="text-base sm:text-lg text-white">Industry Benchmark Comparison</CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  Compare your performance with industry averages
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto -mx-4 sm:mx-0">
                  <div className="inline-block min-w-full align-middle px-4 sm:px-0">
                    <table className="w-full min-w-[500px]">{/* Table content goes here */}</table>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <CardTitle className="text-lg sm:text-xl">Transaction History</CardTitle>
                  <CardDescription className="text-xs sm:text-sm mt-1">
                    Complete ledger of all financial activities
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="bg-transparent">
                    <Download className="h-4 w-4 mr-2" />
                    Export CSV
                  </Button>
                  <Button variant="outline" size="sm" className="bg-transparent">
                    <Mail className="h-4 w-4 mr-2" />
                    Email Report
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {/* Filters */}
              <div className="flex flex-col sm:flex-row gap-3 mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by influencer or campaign..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <Select defaultValue="all">
                  <SelectTrigger className="w-full sm:w-[180px]">
                    <SelectValue placeholder="Transaction Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="payout">Payouts</SelectItem>
                    <SelectItem value="topup">Top-ups</SelectItem>
                    <SelectItem value="refund">Refunds</SelectItem>
                  </SelectContent>
                </Select>
                <Select defaultValue="7days">
                  <SelectTrigger className="w-full sm:w-[180px]">
                    <SelectValue placeholder="Date Range" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7days">Last 7 days</SelectItem>
                    <SelectItem value="30days">Last 30 days</SelectItem>
                    <SelectItem value="90days">Last 90 days</SelectItem>
                    <SelectItem value="custom">Custom Range</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Transaction Table */}
              <div className="space-y-3">
                {transactionHistory.map((transaction) => (
                  <div key={transaction.id} className="p-4 border rounded-lg hover:bg-accent/50 transition-colors">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                      <div className="lg:col-span-2">
                        <p className="text-xs text-muted-foreground mb-1">Date</p>
                        <p className="text-sm font-medium">{transaction.date}</p>
                        <p className="text-xs text-muted-foreground mt-1">{transaction.id}</p>
                      </div>

                      <div className="lg:col-span-3">
                        <p className="text-xs text-muted-foreground mb-1">Campaign</p>
                        <p className="text-sm font-medium">{transaction.campaign}</p>
                        {transaction.influencer !== "-" && (
                          <p className="text-xs text-muted-foreground mt-1">To: {transaction.influencer}</p>
                        )}
                      </div>

                      <div className="lg:col-span-2">
                        <p className="text-xs text-muted-foreground mb-1">Type</p>
                        <Badge
                          variant="secondary"
                          className={`${
                            transaction.type === "Payout"
                              ? "bg-blue-500/20 text-blue-600"
                              : "bg-green-500/20 text-green-600"
                          }`}
                        >
                          {transaction.type}
                        </Badge>
                      </div>

                      <div className="lg:col-span-2">
                        <p className="text-xs text-muted-foreground mb-1">Amount</p>
                        <p className="text-lg font-bold text-primary">{formatCurrency(transaction.amount)}</p>
                      </div>

                      <div className="lg:col-span-2">
                        <p className="text-xs text-muted-foreground mb-1">Payment Method</p>
                        <p className="text-sm">{transaction.paymentMethod}</p>
                      </div>

                      <div className="lg:col-span-1 flex items-center justify-end">
                        {transaction.invoiceId !== "-" && (
                          <Button variant="ghost" size="sm">
                            <FileText className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </main>
      </div>

      <Dialog open={showInvoiceModal} onOpenChange={setShowInvoiceModal}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Invoice Details</DialogTitle>
            <DialogDescription>
              {selectedInvoice?.id} • {selectedInvoice?.date}
            </DialogDescription>
          </DialogHeader>

          {selectedInvoice && (
            <div className="space-y-6">
              {/* Invoice Header */}
              <div className="p-6 bg-gradient-to-br from-primary/10 to-primary/5 rounded-lg border border-primary/20">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Invoice Number</p>
                    <p className="text-2xl font-bold">{selectedInvoice.id}</p>
                  </div>
                  <Badge className="bg-yellow-500 text-white">Pending</Badge>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Issue Date</p>
                    <p className="font-medium">{selectedInvoice.date}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Due Date</p>
                    <p className="font-medium">{selectedInvoice.dueDate}</p>
                  </div>
                </div>
              </div>

              {/* Parties */}
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-sm font-semibold mb-2">From (Influencer)</p>
                  <div className="p-4 border rounded-lg">
                    <p className="font-medium">{selectedInvoice.influencer.name}</p>
                    <p className="text-sm text-muted-foreground">{selectedInvoice.influencer.handle}</p>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-semibold mb-2">To (Brand)</p>
                  <div className="p-4 border rounded-lg">
                    <p className="font-medium">Your Brand Name</p>
                    <p className="text-sm text-muted-foreground">brand@example.com</p>
                  </div>
                </div>
              </div>

              {/* Campaign Details */}
              <div>
                <p className="text-sm font-semibold mb-2">Campaign Details</p>
                <div className="p-4 border rounded-lg space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Campaign:</span>
                    <span className="text-sm font-medium">{selectedInvoice.campaign}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Deliverable:</span>
                    <span className="text-sm font-medium">{selectedInvoice.deliverable}</span>
                  </div>
                </div>
              </div>

              {/* Amount Breakdown */}
              <div>
                <p className="text-sm font-semibold mb-2">Amount Breakdown</p>
                <div className="p-4 border rounded-lg space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Gross Amount</span>
                    <span className="font-medium">{formatCurrency(selectedInvoice.grossAmount)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Platform Fee (10%)</span>
                    <span className="text-red-500">-{formatCurrency(selectedInvoice.platformFee)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">GST (18%)</span>
                    <span className="font-medium">₹0</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between text-lg font-bold">
                    <span>Net Payout</span>
                    <span className="text-primary">{formatCurrency(selectedInvoice.netAmount)}</span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <Button className="flex-1 bg-green-600 hover:bg-green-700 text-white">
                  <Check className="h-4 w-4 mr-2" />
                  Approve & Pay
                </Button>
                <Button
                  variant="outline"
                  className="flex-1 border-red-500/50 text-red-500 hover:bg-red-500/10 bg-transparent"
                >
                  <X className="h-4 w-4 mr-2" />
                  Reject
                </Button>
                <Button variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Download PDF
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={showWalletModal} onOpenChange={setShowWalletModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Top Up Wallet</DialogTitle>
            <DialogDescription>Add funds to your brand wallet for seamless payouts</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="amount">Amount (₹)</Label>
              <Input id="amount" type="number" placeholder="Enter amount" className="mt-1" />
            </div>

            <div>
              <Label htmlFor="payment-method">Payment Method</Label>
              <Select defaultValue="razorpay">
                <SelectTrigger id="payment-method" className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="razorpay">Razorpay</SelectItem>
                  <SelectItem value="stripe">Stripe</SelectItem>
                  <SelectItem value="bank">Bank Transfer</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="p-4 bg-muted/50 rounded-lg">
              <div className="flex items-start gap-2">
                <Info className="h-4 w-4 text-muted-foreground mt-0.5" />
                <p className="text-xs text-muted-foreground">
                  Funds will be added instantly. You can use them for influencer payouts immediately.
                </p>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowWalletModal(false)}>
              Cancel
            </Button>
            <Button className="bg-primary hover:bg-primary/90">Proceed to Payment</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
