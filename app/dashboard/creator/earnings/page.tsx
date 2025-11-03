"use client"

import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { InfluencerSidebar } from "@/components/influencer-sidebar"
import { InfluencerHeader } from "@/components/influencer-header"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  TrendingUp,
  CheckCircle2,
  Download,
  CreditCard,
  Building2,
  Instagram,
  Youtube,
  Twitter,
  Search,
  ArrowUpDown,
  FileText,
  AlertCircle,
  Wallet,
  ArrowRight,
} from "lucide-react"
import {
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"
import { WithdrawModal } from "@/components/withdraw-modal"

export default function EarningsPage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("all")
  const [timeRange, setTimeRange] = useState("month")
  const [compareMode, setCompareMode] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [withdrawModalOpen, setWithdrawModalOpen] = useState(false)

  useEffect(() => {
    if (!isLoading && (!user || user.role !== "creator")) {
      router.push("/auth/login")
    }
  }, [user, isLoading, router])

  if (isLoading || !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-blue-950 to-black flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    )
  }

  const earningsSummary = {
    total: 450000,
    pending: 45000,
    paid: 405000,
    thisMonth: 65000,
  }

  const pendingPayouts = [
    {
      id: 1,
      campaign: "TechGear Pro - Product Review",
      brand: "TechGear Pro",
      amount: 15000,
      dueDate: "2025-02-15",
      status: "pending",
    },
    {
      id: 2,
      campaign: "Fashion Hub - Spring Collection",
      brand: "Fashion Hub",
      amount: 20000,
      dueDate: "2025-02-20",
      status: "processing",
    },
    {
      id: 3,
      campaign: "Fitness First - Workout Series",
      brand: "Fitness First",
      amount: 10000,
      dueDate: "2025-02-10",
      status: "pending",
    },
  ]

  const transactions = [
    {
      id: 1,
      campaign: "Beauty Co. - Makeup Tutorial",
      brand: "Beauty Co.",
      amount: 18000,
      date: "2025-01-28",
      status: "completed",
      platform: "Instagram",
      icon: Instagram,
    },
    {
      id: 2,
      campaign: "Tech Innovate - Gadget Review",
      brand: "Tech Innovate",
      amount: 25000,
      date: "2025-01-25",
      status: "completed",
      platform: "YouTube",
      icon: Youtube,
    },
    {
      id: 3,
      campaign: "Fashion Forward - Style Guide",
      brand: "Fashion Forward",
      amount: 22000,
      date: "2025-01-20",
      status: "completed",
      platform: "Instagram",
      icon: Instagram,
    },
    {
      id: 4,
      campaign: "Sports Brand - Fitness Challenge",
      brand: "Sports Brand",
      amount: 30000,
      date: "2025-01-15",
      status: "completed",
      platform: "YouTube",
      icon: Youtube,
    },
    {
      id: 5,
      campaign: "Food Delivery - Promo Campaign",
      brand: "Food Delivery",
      amount: 12000,
      date: "2025-01-10",
      status: "completed",
      platform: "Twitter",
      icon: Twitter,
    },
  ]

  const platformEarnings = [
    {
      platform: "Instagram",
      icon: Instagram,
      color: "from-purple-500 to-pink-500",
      earnings: 185000,
      percentage: 41,
      campaigns: 15,
    },
    {
      platform: "YouTube",
      icon: Youtube,
      color: "from-red-600 to-red-500",
      earnings: 205000,
      percentage: 46,
      campaigns: 8,
    },
    {
      platform: "Twitter",
      icon: Twitter,
      color: "from-blue-400 to-blue-300",
      earnings: 60000,
      percentage: 13,
      campaigns: 12,
    },
  ]

  const earningsOverTime = [
    { date: "Week 1", earnings: 12000, lastMonth: 10000 },
    { date: "Week 2", earnings: 18000, lastMonth: 15000 },
    { date: "Week 3", earnings: 15000, lastMonth: 12000 },
    { date: "Week 4", earnings: 20000, lastMonth: 18000 },
  ]

  const sourceBreakdown = [
    { name: "Campaign Payouts", value: 380000, color: "#3b82f6" },
    { name: "Bonuses", value: 45000, color: "#10b981" },
    { name: "Refunds", value: 15000, color: "#f59e0b" },
    { name: "Adjustments", value: 10000, color: "#8b5cf6" },
  ]

  const availableBalance = 85000
  const nextPayoutDate = "Nov 5, 2025"

  const filteredTransactions = transactions.filter((transaction) => {
    const matchesSearch =
      transaction.campaign.toLowerCase().includes(searchQuery.toLowerCase()) ||
      transaction.brand.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === "all" || transaction.status === statusFilter
    return matchesSearch && matchesStatus
  })

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-blue-950 to-black">
      <InfluencerSidebar />

      <div className="lg:pl-64">
        <InfluencerHeader />

        <main className="p-4 lg:p-6 space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-white">Earnings</h1>
              <p className="text-gray-400 text-sm mt-1">Track your payments and transaction history</p>
            </div>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Download className="w-4 h-4 mr-2" />
              Download Report
            </Button>
          </div>

          <Card className="bg-gradient-to-br from-blue-600 via-blue-700 to-purple-700 border-0 p-6 lg:p-8 relative overflow-hidden">
            <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
            <div className="relative z-10">
              <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
                <div className="space-y-4">
                  <div>
                    <p className="text-blue-100 text-xs sm:text-sm mb-2">Earnings This Month</p>
                    <p className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white">
                      ₹{earningsSummary.thisMonth.toLocaleString()}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge className="bg-green-500/20 text-green-300 border-green-500/30">
                        <TrendingUp className="w-3 h-3 mr-1" />
                        +18% vs last month
                      </Badge>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 sm:gap-6">
                    <div>
                      <p className="text-blue-100 text-xs mb-1">Pending Payouts</p>
                      <p className="text-lg sm:text-xl font-bold text-white">
                        ₹{earningsSummary.pending.toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-blue-100 text-xs mb-1">Withdrawable</p>
                      <p className="text-lg sm:text-xl font-bold text-white">₹{availableBalance.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-blue-100 text-xs mb-1">Next Payout</p>
                      <p className="text-lg sm:text-xl font-bold text-white">{nextPayoutDate}</p>
                    </div>
                  </div>
                </div>

                <Button
                  size="lg"
                  className="bg-white text-blue-700 hover:bg-blue-50 font-bold shadow-lg w-full lg:w-auto"
                  onClick={() => setWithdrawModalOpen(true)}
                >
                  <Wallet className="w-5 h-5 mr-2" />
                  Withdraw Funds
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </div>
            </div>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Earnings Over Time Chart */}
            <Card className="bg-[#0f1629]/50 border-white/10 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg sm:text-xl font-bold text-white">Earnings Over Time</h2>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant={compareMode ? "default" : "outline"}
                    className={
                      compareMode
                        ? "bg-blue-600 hover:bg-blue-700 text-xs"
                        : "border-white/10 text-white hover:bg-[#1a1f35] bg-transparent text-xs"
                    }
                    onClick={() => setCompareMode(!compareMode)}
                  >
                    Compare
                  </Button>
                  <Select value={timeRange} onValueChange={setTimeRange}>
                    <SelectTrigger className="w-24 bg-[#1a1f35] border-white/10 text-white text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1a1f35] border-white/10 text-white">
                      <SelectItem value="week">Week</SelectItem>
                      <SelectItem value="month">Month</SelectItem>
                      <SelectItem value="year">Year</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={250}>
                <AreaChart data={earningsOverTime}>
                  <defs>
                    <linearGradient id="colorEarnings" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorLastMonth" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6b7280" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#6b7280" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                  <XAxis dataKey="date" stroke="#6b7280" style={{ fontSize: "12px" }} />
                  <YAxis stroke="#6b7280" style={{ fontSize: "12px" }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1a1f35",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: "8px",
                      color: "#fff",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="earnings"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorEarnings)"
                  />
                  {compareMode && (
                    <Area
                      type="monotone"
                      dataKey="lastMonth"
                      stroke="#6b7280"
                      strokeWidth={2}
                      strokeDasharray="5 5"
                      fillOpacity={1}
                      fill="url(#colorLastMonth)"
                    />
                  )}
                </AreaChart>
              </ResponsiveContainer>
            </Card>

            {/* Source Breakdown Chart */}
            <Card className="bg-[#0f1629]/50 border-white/10 p-6">
              <h2 className="text-lg sm:text-xl font-bold text-white mb-6">Source Breakdown</h2>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={sourceBreakdown}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {sourceBreakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1a1f35",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: "8px",
                      color: "#fff",
                    }}
                    formatter={(value: number) => `₹${value.toLocaleString()}`}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="grid grid-cols-2 gap-3 mt-4">
                {sourceBreakdown.map((source) => (
                  <div key={source.name} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: source.color }} />
                    <div>
                      <p className="text-xs text-gray-400">{source.name}</p>
                      <p className="text-sm font-bold text-white">₹{(source.value / 1000).toFixed(0)}K</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Platform Earnings Breakdown */}
          <Card className="bg-[#0f1629]/50 border-white/10 p-6">
            <h2 className="text-xl font-bold text-white mb-6">Earnings by Platform</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {platformEarnings.map((platform) => {
                const Icon = platform.icon
                return (
                  <div key={platform.platform} className="p-6 bg-[#1a1f35] rounded-lg space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className={`h-12 w-12 rounded-full bg-gradient-to-br ${platform.color} flex items-center justify-center`}
                        >
                          <Icon className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h3 className="font-bold text-white">{platform.platform}</h3>
                          <p className="text-sm text-gray-400">{platform.campaigns} campaigns</p>
                        </div>
                      </div>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-white">₹{(platform.earnings / 1000).toFixed(0)}K</p>
                      <p className="text-sm text-gray-400 mt-1">{platform.percentage}% of total</p>
                    </div>
                    <div className="h-2 bg-[#252b45] rounded-full overflow-hidden">
                      <div
                        className={`h-full bg-gradient-to-r ${platform.color} rounded-full`}
                        style={{ width: `${platform.percentage}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </Card>

          {/* Pending Payouts */}
          <Card className="bg-[#0f1629]/50 border-white/10 p-6">
            <h2 className="text-xl font-bold text-white mb-6">Pending Payouts</h2>
            <div className="space-y-4">
              {pendingPayouts.map((payout) => (
                <div
                  key={payout.id}
                  className="p-4 bg-[#1a1f35] rounded-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                >
                  <div className="flex-1">
                    <h3 className="font-medium text-white">{payout.campaign}</h3>
                    <p className="text-sm text-gray-400 mt-1">{payout.brand}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="font-bold text-white">₹{payout.amount.toLocaleString()}</p>
                      <p className="text-xs text-gray-400">Due: {payout.dueDate}</p>
                    </div>
                    <Badge
                      className={
                        payout.status === "processing"
                          ? "bg-blue-500/20 text-blue-500"
                          : "bg-yellow-500/20 text-yellow-500"
                      }
                    >
                      {payout.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card className="bg-[#0f1629]/50 border-white/10 p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
              <h2 className="text-lg sm:text-xl font-bold text-white">Transaction History</h2>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
                <div className="relative flex-1 sm:flex-initial">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="Search transactions..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 bg-[#1a1f35] border-white/10 text-white text-sm"
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full sm:w-32 bg-[#1a1f35] border-white/10 text-white text-sm">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1a1f35] border-white/10 text-white">
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-white/10 text-white hover:bg-[#1a1f35] bg-transparent text-sm"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export CSV
                </Button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left text-xs sm:text-sm font-medium text-gray-400 pb-3">
                      <button className="flex items-center gap-1 hover:text-white transition-colors">
                        Campaign
                        <ArrowUpDown className="w-3 h-3" />
                      </button>
                    </th>
                    <th className="text-left text-xs sm:text-sm font-medium text-gray-400 pb-3">Platform</th>
                    <th className="text-left text-xs sm:text-sm font-medium text-gray-400 pb-3">
                      <button className="flex items-center gap-1 hover:text-white transition-colors">
                        Amount
                        <ArrowUpDown className="w-3 h-3" />
                      </button>
                    </th>
                    <th className="text-left text-xs sm:text-sm font-medium text-gray-400 pb-3">
                      <button className="flex items-center gap-1 hover:text-white transition-colors">
                        Date
                        <ArrowUpDown className="w-3 h-3" />
                      </button>
                    </th>
                    <th className="text-left text-xs sm:text-sm font-medium text-gray-400 pb-3">Status</th>
                    <th className="text-left text-xs sm:text-sm font-medium text-gray-400 pb-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTransactions.map((transaction) => {
                    const Icon = transaction.icon
                    return (
                      <tr
                        key={transaction.id}
                        className="border-b border-white/10 hover:bg-[#1a1f35]/50 transition-colors"
                      >
                        <td className="py-4">
                          <div>
                            <p className="text-white font-medium text-xs sm:text-sm">{transaction.campaign}</p>
                            <p className="text-gray-400 text-xs mt-1">{transaction.brand}</p>
                          </div>
                        </td>
                        <td className="py-4">
                          <div className="flex items-center gap-2">
                            <Icon className="w-4 h-4 text-gray-400" />
                            <span className="text-xs sm:text-sm text-gray-400">{transaction.platform}</span>
                          </div>
                        </td>
                        <td className="py-4">
                          <p className="text-white font-medium text-xs sm:text-sm">
                            ₹{transaction.amount.toLocaleString()}
                          </p>
                        </td>
                        <td className="py-4">
                          <p className="text-xs sm:text-sm text-gray-400">{transaction.date}</p>
                        </td>
                        <td className="py-4">
                          <Badge className="bg-green-500/20 text-green-500 text-xs">
                            <CheckCircle2 className="w-3 h-3 mr-1" />
                            {transaction.status}
                          </Badge>
                        </td>
                        <td className="py-4">
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-blue-500 hover:text-blue-400 hover:bg-blue-500/10 text-xs"
                            >
                              <FileText className="w-3 h-3 mr-1" />
                              Receipt
                            </Button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
            {filteredTransactions.length === 0 && (
              <div className="text-center py-12">
                <AlertCircle className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400">No transactions found</p>
              </div>
            )}
          </Card>

          {/* Payment Method */}
          <Card className="bg-[#0f1629]/50 border-white/10 p-6">
            <h2 className="text-xl font-bold text-white mb-6">Payment Method</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-6 bg-[#1a1f35] rounded-lg border-2 border-blue-500">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-full bg-blue-500/20 flex items-center justify-center">
                      <Building2 className="w-6 h-6 text-blue-500" />
                    </div>
                    <div>
                      <p className="font-medium text-white">Bank Account</p>
                      <p className="text-sm text-gray-400">Primary method</p>
                    </div>
                  </div>
                  <Badge className="bg-blue-500/20 text-blue-500">Active</Badge>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-gray-400">HDFC Bank</p>
                  <p className="text-white font-mono">**** **** **** 4567</p>
                </div>
              </div>

              <div className="p-6 bg-[#1a1f35] rounded-lg border border-white/10">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-full bg-purple-500/20 flex items-center justify-center">
                      <CreditCard className="w-6 h-6 text-purple-500" />
                    </div>
                    <div>
                      <p className="font-medium text-white">UPI</p>
                      <p className="text-sm text-gray-400">Backup method</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-gray-400">Google Pay</p>
                  <p className="text-white">{user.email}</p>
                </div>
              </div>
            </div>
            <Button
              variant="outline"
              className="w-full mt-4 border-white/10 text-white hover:bg-[#1a1f35] bg-transparent"
            >
              Add Payment Method
            </Button>
          </Card>
        </main>
      </div>

      <WithdrawModal open={withdrawModalOpen} onOpenChange={setWithdrawModalOpen} availableBalance={availableBalance} />
    </div>
  )
}
