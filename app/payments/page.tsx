"use client"

import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DollarSign, TrendingUp, Clock, CheckCircle2, Download, FileText, Calendar, ArrowUpRight } from "lucide-react"
import { useState } from "react"

const earnings = {
  total: 245000,
  pending: 45000,
  received: 200000,
  upcoming: 75000,
  thisMonth: 65000,
  lastMonth: 55000,
  growth: 18.2,
}

const transactions = [
  {
    id: "INV-2025-001",
    brand: "Fashion Nova",
    campaign: "Summer Fashion Collection",
    amount: 20000,
    status: "paid",
    date: "2025-01-25",
    paymentDate: "2025-01-26",
    invoiceUrl: "#",
  },
  {
    id: "INV-2025-002",
    brand: "Nykaa",
    campaign: "Beauty Product Review",
    amount: 25000,
    status: "pending",
    date: "2025-01-28",
    paymentDate: null,
    invoiceUrl: "#",
  },
  {
    id: "INV-2025-003",
    brand: "Myntra",
    campaign: "Ethnic Wear Styling",
    amount: 30000,
    status: "processing",
    date: "2025-01-20",
    paymentDate: null,
    invoiceUrl: "#",
  },
  {
    id: "INV-2024-045",
    brand: "Swiggy",
    campaign: "Food Delivery Promotion",
    amount: 15000,
    status: "paid",
    date: "2024-12-15",
    paymentDate: "2024-12-18",
    invoiceUrl: "#",
  },
  {
    id: "INV-2024-044",
    brand: "Boat",
    campaign: "Tech Gadget Unboxing",
    amount: 18000,
    status: "paid",
    date: "2024-12-10",
    paymentDate: "2024-12-12",
    invoiceUrl: "#",
  },
]

const upcomingPayments = [
  {
    id: 1,
    brand: "Fashion Nova",
    campaign: "Summer Fashion Collection - Phase 2",
    amount: 25000,
    expectedDate: "2025-02-15",
    status: "in-progress",
  },
  {
    id: 2,
    brand: "Nykaa",
    campaign: "Skincare Routine Series",
    amount: 30000,
    expectedDate: "2025-02-20",
    status: "in-progress",
  },
  {
    id: 3,
    brand: "Myntra",
    campaign: "Spring Collection Launch",
    amount: 20000,
    expectedDate: "2025-02-28",
    status: "pending-approval",
  },
]

const monthlyEarnings = [
  { month: "Aug 2024", amount: 42000 },
  { month: "Sep 2024", amount: 38000 },
  { month: "Oct 2024", amount: 45000 },
  { month: "Nov 2024", amount: 48000 },
  { month: "Dec 2024", amount: 55000 },
  { month: "Jan 2025", amount: 65000 },
]

export default function PaymentsPage() {
  const [selectedPeriod, setSelectedPeriod] = useState("all")

  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "bg-green-500/10 text-green-500 hover:bg-green-500/20"
      case "pending":
        return "bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20"
      case "processing":
        return "bg-blue-500/10 text-blue-500 hover:bg-blue-500/20"
      default:
        return "bg-gray-500/10 text-gray-500 hover:bg-gray-500/20"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "paid":
        return <CheckCircle2 className="h-4 w-4" />
      case "pending":
        return <Clock className="h-4 w-4" />
      case "processing":
        return <Clock className="h-4 w-4" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  return (
    <main className="min-h-screen bg-background">
      <Navigation />

      <div className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto max-w-7xl">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-4xl font-bold mb-2">Payments & Earnings</h1>
              <p className="text-lg text-muted-foreground">Track your income and manage invoices</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Export Report
              </Button>
              <Button variant="outline">
                <FileText className="h-4 w-4 mr-2" />
                Tax Summary
              </Button>
            </div>
          </div>

          {/* Earnings Overview */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">₹{earnings.total.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground mt-1">Lifetime earnings</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">This Month</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">₹{earnings.thisMonth.toLocaleString()}</div>
                <div className="flex items-center gap-1 text-xs text-green-500 mt-1">
                  <ArrowUpRight className="h-3 w-3" />
                  {earnings.growth}% from last month
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Pending</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">₹{earnings.pending.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground mt-1">Awaiting payment</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Upcoming</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">₹{earnings.upcoming.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground mt-1">Expected this month</p>
              </CardContent>
            </Card>
          </div>

          {/* Earnings Chart */}
          <Card className="mb-8">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Earnings Trend</CardTitle>
                  <CardDescription>Your monthly earnings over the last 6 months</CardDescription>
                </div>
                <Select defaultValue="6months">
                  <SelectTrigger className="w-[180px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="3months">Last 3 Months</SelectItem>
                    <SelectItem value="6months">Last 6 Months</SelectItem>
                    <SelectItem value="12months">Last 12 Months</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {monthlyEarnings.map((item, index) => {
                  const maxAmount = Math.max(...monthlyEarnings.map((e) => e.amount))
                  const percentage = (item.amount / maxAmount) * 100
                  return (
                    <div key={index} className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">{item.month}</span>
                        <span className="font-medium">₹{item.amount.toLocaleString()}</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-full transition-all duration-500"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          {/* Tabs for Transactions and Upcoming */}
          <Tabs defaultValue="transactions" className="space-y-6">
            <TabsList>
              <TabsTrigger value="transactions">Transaction History</TabsTrigger>
              <TabsTrigger value="upcoming">Upcoming Payments</TabsTrigger>
              <TabsTrigger value="invoices">Invoices</TabsTrigger>
            </TabsList>

            <TabsContent value="transactions">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Transaction History</CardTitle>
                      <CardDescription>All your payment transactions</CardDescription>
                    </div>
                    <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                      <SelectTrigger className="w-[180px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Time</SelectItem>
                        <SelectItem value="month">This Month</SelectItem>
                        <SelectItem value="quarter">This Quarter</SelectItem>
                        <SelectItem value="year">This Year</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Invoice ID</TableHead>
                        <TableHead>Brand</TableHead>
                        <TableHead>Campaign</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {transactions.map((transaction) => (
                        <TableRow key={transaction.id}>
                          <TableCell className="font-medium">{transaction.id}</TableCell>
                          <TableCell>{transaction.brand}</TableCell>
                          <TableCell className="max-w-[200px] truncate">{transaction.campaign}</TableCell>
                          <TableCell className="font-semibold">₹{transaction.amount.toLocaleString()}</TableCell>
                          <TableCell>
                            {new Date(transaction.date).toLocaleDateString("en-IN", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </TableCell>
                          <TableCell>
                            <Badge className={getStatusColor(transaction.status)}>
                              {getStatusIcon(transaction.status)}
                              <span className="ml-1 capitalize">{transaction.status}</span>
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="sm">
                              <Download className="h-4 w-4 mr-1" />
                              Invoice
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="upcoming">
              <div className="grid gap-6">
                {upcomingPayments.map((payment) => (
                  <Card key={payment.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-xl">{payment.brand}</CardTitle>
                          <CardDescription>{payment.campaign}</CardDescription>
                        </div>
                        <Badge className={getStatusColor(payment.status)}>{payment.status.replace("-", " ")}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground mb-1">Expected Amount</p>
                          <p className="text-2xl font-bold text-primary">₹{payment.amount.toLocaleString()}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-muted-foreground mb-1">Expected Date</p>
                          <p className="font-medium">
                            {new Date(payment.expectedDate).toLocaleDateString("en-IN", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="invoices">
              <Card>
                <CardHeader>
                  <CardTitle>Generated Invoices</CardTitle>
                  <CardDescription>Download and manage your invoices</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {transactions
                      .filter((t) => t.status === "paid")
                      .map((transaction) => (
                        <div
                          key={transaction.id}
                          className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors"
                        >
                          <div className="flex items-center gap-4">
                            <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                              <FileText className="h-6 w-6 text-primary" />
                            </div>
                            <div>
                              <p className="font-medium">{transaction.id}</p>
                              <p className="text-sm text-muted-foreground">
                                {transaction.brand} • {transaction.campaign}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <p className="font-semibold">₹{transaction.amount.toLocaleString()}</p>
                              <p className="text-sm text-muted-foreground">
                                {new Date(transaction.paymentDate!).toLocaleDateString("en-IN", {
                                  month: "short",
                                  day: "numeric",
                                })}
                              </p>
                            </div>
                            <Button variant="outline" size="sm">
                              <Download className="h-4 w-4 mr-2" />
                              Download
                            </Button>
                          </div>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <Footer />
    </main>
  )
}
