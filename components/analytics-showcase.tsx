"use client"

import { Button } from "@/components/ui/button"
import { ArrowRight, Zap, Target, Users, TrendingUp } from "lucide-react"

export function AnalyticsShowcase() {
  return (
    <section className="relative py-24 px-4 overflow-hidden bg-black">
      {/* Gradient background effect */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-gradient-to-br from-blue-600 via-purple-600 to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-gradient-to-tr from-pink-600 via-purple-600 to-transparent rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto max-w-7xl relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left side - Text content */}
          <div className="space-y-6">
            <h2 className="text-5xl md:text-6xl font-bold text-white leading-tight">Grow your collaborations now</h2>
            <p className="text-xl text-gray-400 leading-relaxed max-w-xl">
              Gain invaluable predictive analytics and actionable insights empowering you to make data-driven decisions
              for successful brand partnerships.
            </p>
            <Button
              size="lg"
              className="bg-white text-black hover:bg-gray-200 rounded-full px-8 py-6 text-lg font-semibold group"
            >
              Explore All Tools
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>

          {/* Right side - Dashboard mockup */}
          <div className="relative">
            {/* Browser chrome */}
            <div className="bg-gray-900 rounded-t-xl border border-gray-800 p-3">
              <div className="flex items-center gap-2">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500" />
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                </div>
                <div className="flex-1 bg-gray-800 rounded px-3 py-1 text-xs text-gray-500 text-center">
                  shor.app/dashboard
                </div>
              </div>
            </div>

            {/* Dashboard content */}
            <div className="bg-gradient-to-br from-gray-900 to-black border border-gray-800 border-t-0 rounded-b-xl p-6 space-y-6">
              {/* Dashboard header */}
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center">
                  <Zap className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-white font-semibold text-lg">Dashboard</h3>
                  <p className="text-gray-500 text-sm">Today, January 18, 2024</p>
                </div>
              </div>

              {/* Stats grid */}
              <div className="grid grid-cols-2 gap-4">
                {/* Monthly Campaigns */}
                <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                  <p className="text-gray-400 text-sm mb-2">Total campaigns</p>
                  <p className="text-white text-3xl font-bold">42</p>
                  <p className="text-gray-400 text-sm mt-2">Total collaborations</p>
                  <p className="text-white text-2xl font-semibold mt-1">156</p>
                  <div className="mt-3 h-2 bg-gray-700 rounded-full overflow-hidden">
                    <div className="h-full w-3/4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full" />
                  </div>
                </div>

                {/* Revenue Summary */}
                <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                  <p className="text-gray-400 text-sm mb-2">Revenue</p>
                  <p className="text-white text-3xl font-bold">₹8,45,000</p>
                  <div className="space-y-2 mt-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Brand Deals</span>
                      <span className="text-white">₹6,20,000</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Sponsored Posts</span>
                      <span className="text-white">₹1,85,000</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Affiliate</span>
                      <span className="text-white">₹40,000</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom stats */}
              <div className="grid grid-cols-4 gap-3">
                <div className="bg-gray-800/30 rounded-lg p-3 border border-gray-700">
                  <div className="w-8 h-8 rounded-lg bg-purple-600/20 flex items-center justify-center mb-2">
                    <TrendingUp className="w-4 h-4 text-purple-400" />
                  </div>
                  <p className="text-gray-400 text-xs mb-1">Total Reach</p>
                  <p className="text-white text-xl font-bold">2.4M</p>
                </div>
                <div className="bg-gray-800/30 rounded-lg p-3 border border-gray-700">
                  <div className="w-8 h-8 rounded-lg bg-blue-600/20 flex items-center justify-center mb-2">
                    <Target className="w-4 h-4 text-blue-400" />
                  </div>
                  <p className="text-gray-400 text-xs mb-1">Engagement</p>
                  <p className="text-white text-xl font-bold">8.2%</p>
                </div>
                <div className="bg-gray-800/30 rounded-lg p-3 border border-gray-700">
                  <div className="w-8 h-8 rounded-lg bg-pink-600/20 flex items-center justify-center mb-2">
                    <Users className="w-4 h-4 text-pink-400" />
                  </div>
                  <p className="text-gray-400 text-xs mb-1">Active Brands</p>
                  <p className="text-white text-xl font-bold">28</p>
                </div>
                <div className="bg-gray-800/30 rounded-lg p-3 border border-gray-700">
                  <div className="w-8 h-8 rounded-lg bg-green-600/20 flex items-center justify-center mb-2">
                    <Zap className="w-4 h-4 text-green-400" />
                  </div>
                  <p className="text-gray-400 text-xs mb-1">Success Rate</p>
                  <p className="text-white text-xl font-bold">94%</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
