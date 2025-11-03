"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ArrowRight, Zap, DollarSign, Users, TrendingUp } from "lucide-react"
import Link from "next/link"

export function DashboardPreviewSection() {
  return (
    <section className="relative py-12 sm:py-16 md:py-20 lg:py-32 px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-black via-blue-950 to-black" />

      {/* Decorative elements */}
      <div className="absolute bottom-0 left-0 w-48 sm:w-64 md:w-96 h-48 sm:h-64 md:h-96 bg-gradient-to-tr from-blue-600/20 via-purple-600/20 to-pink-600/20 blur-3xl rounded-full" />
      <div className="absolute top-0 right-0 w-48 sm:w-64 md:w-96 h-48 sm:h-64 md:h-96 bg-gradient-to-bl from-blue-600/20 via-purple-600/20 to-pink-600/20 blur-3xl rounded-full" />

      <div className="relative max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Left side - Content */}
          <div className="space-y-4 sm:space-y-6 text-center lg:text-left">
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white text-balance">
              Grow your sales now
            </h2>
            <p className="text-sm sm:text-base md:text-lg text-gray-400 max-w-xl mx-auto lg:mx-0 text-pretty">
              Gain invaluable predictive analytics and actionable insights empowering you to make data-driven decisions.
            </p>
            <div className="flex justify-center lg:justify-start">
              <Button
                asChild
                size="lg"
                className="bg-white/10 hover:bg-white/20 text-white border border-white/20 backdrop-blur-sm group text-sm sm:text-base"
              >
                <Link href="/marketplace">
                  Explore All Tools
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
            </div>
          </div>

          {/* Right side - Dashboard Preview */}
          <div className="relative">
            {/* Browser mockup */}
            <div className="bg-gray-900/50 backdrop-blur-sm rounded-lg sm:rounded-xl border border-white/10 overflow-hidden shadow-2xl">
              {/* Browser header */}
              <div className="flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-3 bg-black/50 border-b border-white/10">
                <div className="flex gap-1.5 sm:gap-2">
                  <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-red-500" />
                  <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-yellow-500" />
                  <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-green-500" />
                </div>
                <div className="hidden sm:flex flex-1 mx-2 sm:mx-4 px-2 sm:px-3 py-1 bg-white/5 rounded text-[10px] sm:text-xs text-gray-500">
                  example@shor.com
                </div>
              </div>

              {/* Dashboard content */}
              <div className="p-3 sm:p-4 md:p-6 space-y-3 sm:space-y-4 md:space-y-6 bg-gradient-to-br from-gray-900 to-black">
                {/* Dashboard header */}
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg bg-blue-600 flex items-center justify-center">
                    <Zap className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                  </div>
                  <div>
                    <h3 className="text-sm sm:text-base md:text-lg font-semibold text-white">Dashboard</h3>
                    <p className="text-[10px] sm:text-xs text-gray-500">Today, January 16, 2024</p>
                  </div>
                </div>

                {/* Stats grid */}
                <div className="grid sm:grid-cols-2 gap-3 sm:gap-4">
                  {/* Monthly Sales Card */}
                  <Card className="bg-white/5 border-white/10 p-3 sm:p-4 space-y-2 sm:space-y-3">
                    <h4 className="text-[10px] sm:text-xs text-gray-400">Monthly Sales</h4>
                    <div className="grid grid-cols-2 gap-2 sm:gap-3">
                      <div>
                        <p className="text-[10px] sm:text-xs text-gray-500">Total product</p>
                        <p className="text-lg sm:text-xl md:text-2xl font-bold text-white">25.4k</p>
                      </div>
                      <div>
                        <p className="text-[10px] sm:text-xs text-gray-500">Revenue</p>
                        <p className="text-lg sm:text-xl md:text-2xl font-bold text-white">$6.35M</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-[10px] sm:text-xs text-gray-500 mb-1 sm:mb-2">Total collection</p>
                      <p className="text-base sm:text-lg md:text-xl font-bold text-white mb-1 sm:mb-2">1.3M</p>
                      <div className="h-1.5 sm:h-2 bg-gray-800 rounded-full overflow-hidden">
                        <div className="h-full w-3/4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full" />
                      </div>
                    </div>
                  </Card>

                  {/* Revenue Summary Card */}
                  <Card className="bg-white/5 border-white/10 p-3 sm:p-4 space-y-2 sm:space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-[10px] sm:text-xs text-gray-400">Revenue Summary</h4>
                      <span className="text-[10px] sm:text-xs text-gray-500">Last 30 Days</span>
                    </div>
                    <div className="space-y-1.5 sm:space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] sm:text-xs text-gray-400">Product Sales</span>
                        <span className="text-xs sm:text-sm font-semibold text-white">$12,900</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] sm:text-xs text-gray-400">Development Service</span>
                        <span className="text-xs sm:text-sm font-semibold text-white">$9,850</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] sm:text-xs text-gray-400">Subscription</span>
                        <span className="text-xs sm:text-sm font-semibold text-white">$3,700</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] sm:text-xs text-gray-400">Digital Assets</span>
                        <span className="text-xs sm:text-sm font-semibold text-white">$3,700</span>
                      </div>
                    </div>
                  </Card>
                </div>

                {/* Bottom stats cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
                  <Card className="bg-white/5 border-white/10 p-2 sm:p-3 space-y-1 sm:space-y-2">
                    <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg bg-blue-600/20 flex items-center justify-center">
                      <Zap className="w-3 h-3 sm:w-4 sm:h-4 text-blue-400" />
                    </div>
                    <p className="text-[10px] sm:text-xs text-gray-500">Total Sales</p>
                    <p className="text-sm sm:text-base md:text-lg font-bold text-white">$59,304</p>
                  </Card>

                  <Card className="bg-white/5 border-white/10 p-2 sm:p-3 space-y-1 sm:space-y-2">
                    <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg bg-green-600/20 flex items-center justify-center">
                      <DollarSign className="w-3 h-3 sm:w-4 sm:h-4 text-green-400" />
                    </div>
                    <p className="text-[10px] sm:text-xs text-gray-500">This Month</p>
                    <p className="text-sm sm:text-base md:text-lg font-bold text-white">$12,661</p>
                  </Card>

                  <Card className="bg-white/5 border-white/10 p-2 sm:p-3 space-y-1 sm:space-y-2">
                    <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg bg-purple-600/20 flex items-center justify-center">
                      <Users className="w-3 h-3 sm:w-4 sm:h-4 text-purple-400" />
                    </div>
                    <p className="text-[10px] sm:text-xs text-gray-500">Customers</p>
                    <p className="text-sm sm:text-base md:text-lg font-bold text-white">759</p>
                  </Card>

                  <Card className="bg-white/5 border-white/10 p-2 sm:p-3 space-y-1 sm:space-y-2">
                    <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg bg-red-600/20 flex items-center justify-center">
                      <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4 text-red-400" />
                    </div>
                    <p className="text-[10px] sm:text-xs text-gray-500">Total Views</p>
                    <p className="text-sm sm:text-base md:text-lg font-bold text-white">166k</p>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
