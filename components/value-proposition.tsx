"use client"

import { Users, Building2, TrendingUp, Target, BarChart3, Zap } from "lucide-react"

export function ValueProposition() {
  return (
    <section className="relative bg-gradient-to-b from-black via-gray-950 to-gray-900 py-12 sm:py-16 md:py-20 px-4 sm:px-6">
      <div className="container mx-auto max-w-7xl">
        <div className="text-center mb-10 sm:mb-12 md:mb-16">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-3 sm:mb-4 px-4 leading-tight">
            Built for creators. Designed for brands.
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-white/70 max-w-2xl mx-auto px-4 leading-relaxed">
            A transparent, data-powered ecosystem where influencers and brands connect, collaborate, and grow — without
            middlemen, spam, or guesswork.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 lg:gap-12">
          {/* For Creators */}
          <div className="bg-gradient-to-br from-red-500/10 to-red-900/5 backdrop-blur-sm border border-red-500/20 rounded-2xl p-6 sm:p-8">
            <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
              <div className="p-2 sm:p-3 bg-red-500/20 rounded-xl">
                <Users className="h-5 w-5 sm:h-6 sm:w-6 text-red-400" />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-white">For Creators</h3>
            </div>
            <p className="text-sm sm:text-base text-white/70 mb-4 sm:mb-6 leading-relaxed">
              Unlock your potential with tools designed to help you grow, collaborate, and monetize your influence.
            </p>
            <div className="space-y-3 sm:space-y-4">
              <div className="flex items-start gap-2 sm:gap-3">
                <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-red-400 mt-1 flex-shrink-0" />
                <div>
                  <h4 className="text-white font-semibold mb-1 text-sm sm:text-base">More Brand Deals</h4>
                  <p className="text-white/60 text-xs sm:text-sm leading-relaxed">
                    Get matched with campaigns that fit your niche and audience
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-2 sm:gap-3">
                <BarChart3 className="h-4 w-4 sm:h-5 sm:w-5 text-red-400 mt-1 flex-shrink-0" />
                <div>
                  <h4 className="text-white font-semibold mb-1 text-sm sm:text-base">Better Insights</h4>
                  <p className="text-white/60 text-xs sm:text-sm leading-relaxed">
                    Track your growth with detailed analytics and performance metrics
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-2 sm:gap-3">
                <Zap className="h-4 w-4 sm:h-5 sm:w-5 text-red-400 mt-1 flex-shrink-0" />
                <div>
                  <h4 className="text-white font-semibold mb-1 text-sm sm:text-base">Build Credibility</h4>
                  <p className="text-white/60 text-xs sm:text-sm leading-relaxed">
                    Earn verified badges and climb creator levels for recognition
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* For Brands */}
          <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm border border-white/20 rounded-2xl p-6 sm:p-8">
            <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
              <div className="p-2 sm:p-3 bg-white/20 rounded-xl">
                <Building2 className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-white">For Brands</h3>
            </div>
            <p className="text-sm sm:text-base text-white/70 mb-4 sm:mb-6 leading-relaxed">
              Find authentic creators, launch campaigns, and measure real impact with data-driven insights.
            </p>
            <div className="space-y-3 sm:space-y-4">
              <div className="flex items-start gap-2 sm:gap-3">
                <Target className="h-4 w-4 sm:h-5 sm:w-5 text-white mt-1 flex-shrink-0" />
                <div>
                  <h4 className="text-white font-semibold mb-1 text-sm sm:text-base">Discover Genuine Creators</h4>
                  <p className="text-white/60 text-xs sm:text-sm leading-relaxed">
                    AI-powered matching finds the perfect creators for your campaigns
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-2 sm:gap-3">
                <Zap className="h-4 w-4 sm:h-5 sm:w-5 text-white mt-1 flex-shrink-0" />
                <div>
                  <h4 className="text-white font-semibold mb-1 text-sm sm:text-base">Run Smooth Campaigns</h4>
                  <p className="text-white/60 text-xs sm:text-sm leading-relaxed">
                    Manage everything from briefs to deliverables in one place
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-2 sm:gap-3">
                <BarChart3 className="h-4 w-4 sm:h-5 sm:w-5 text-white mt-1 flex-shrink-0" />
                <div>
                  <h4 className="text-white font-semibold mb-1 text-sm sm:text-base">Measure ROI</h4>
                  <p className="text-white/60 text-xs sm:text-sm leading-relaxed">
                    Track performance, engagement, and campaign success in real-time
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
