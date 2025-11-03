"use client"

import { Button } from "@/components/ui/button"
import { ArrowRight, Trophy, Check } from "lucide-react"

export function HeroSection() {
  return (
    <section className="relative min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-black pt-20 sm:pt-24 md:pt-28 pb-12 sm:pb-16 md:pb-20 px-4 sm:px-6">
      <div className="container mx-auto max-w-4xl">
        <div className="flex justify-center mb-6 sm:mb-8">
          <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-white/5 backdrop-blur-sm border border-white/10">
            <Trophy className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-white" />
            <span className="text-xs sm:text-sm text-white/80">Surveyed over 100+ creators</span>
          </div>
        </div>

        <div className="text-center space-y-4 sm:space-y-6 mb-8 sm:mb-12">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-light leading-tight bg-gradient-to-b from-white via-gray-200 to-gray-500 bg-clip-text text-transparent px-2">
            Where creators meet brands. Where brands meet impact.
          </h1>
          <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-white/70 max-w-2xl mx-auto px-4 leading-relaxed">
            The most trusted collaboration hub for the influencer economy — where opportunities, insights, and
            relationships flow effortlessly.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center mb-4 sm:mb-6 px-4">
          <Button
            size="lg"
            className="bg-white text-black hover:bg-white/90 group text-sm sm:text-base md:text-lg px-6 sm:px-8 py-5 sm:py-6 rounded-lg font-semibold w-full sm:w-auto"
          >
            Start 14 Days Free Trial
            <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5 group-hover:translate-x-1 transition-transform" />
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="border-2 border-white/20 text-white hover:bg-white/5 text-sm sm:text-base md:text-lg px-6 sm:px-8 py-5 sm:py-6 rounded-lg font-semibold bg-transparent w-full sm:w-auto"
          >
            Request Free Demo
          </Button>
        </div>

        <div className="flex items-center justify-center gap-3 sm:gap-4 text-xs sm:text-sm text-white/50 mb-12 sm:mb-16 px-4">
          <span>No Credit Card Required</span>
          <span>•</span>
          <span>Cancel Anytime</span>
        </div>

        <div className="w-full bg-gradient-to-br from-gray-900/50 to-gray-950/50 backdrop-blur-sm border-y border-white/10 py-8 sm:py-10 md:py-12 px-4 sm:px-6 md:px-8 lg:px-16 xl:px-24 mt-8 sm:mt-12">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-12 xl:gap-16 items-center">
              <div className="space-y-4 sm:space-y-6">
                <div>
                  <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-3 sm:mb-4 leading-tight">
                    Streamline collaborations & get paid faster.
                  </h2>
                  <p className="text-sm sm:text-base md:text-lg text-white/70 leading-relaxed">
                    Gain invaluable insights into creator performance and brand partnerships, empowering you to make
                    data-driven decisions and close deals more effectively.
                  </p>
                </div>

                <div className="space-y-3 sm:space-y-4">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <Check className="h-4 w-4 sm:h-5 sm:w-5 text-white flex-shrink-0" />
                    <span className="text-sm sm:text-base md:text-lg text-white">Campaign management</span>
                  </div>
                  <div className="flex items-center gap-2 sm:gap-3">
                    <Check className="h-4 w-4 sm:h-5 sm:w-5 text-white flex-shrink-0" />
                    <span className="text-sm sm:text-base md:text-lg text-white">Instant payments</span>
                  </div>
                  <div className="flex items-center gap-2 sm:gap-3">
                    <Check className="h-4 w-4 sm:h-5 sm:w-5 text-white flex-shrink-0" />
                    <span className="text-sm sm:text-base md:text-lg text-white">Brand discovery</span>
                  </div>
                  <div className="flex items-center gap-2 sm:gap-3">
                    <Check className="h-4 w-4 sm:h-5 sm:w-5 text-white flex-shrink-0" />
                    <span className="text-sm sm:text-base md:text-lg text-white">Performance analytics</span>
                  </div>
                </div>
              </div>

              <div className="flex justify-center lg:justify-end mt-4 lg:mt-0">
                <Button
                  size="lg"
                  className="w-full sm:w-auto bg-white text-black hover:bg-white/90 group text-sm sm:text-base md:text-lg px-6 sm:px-8 md:px-12 py-5 sm:py-6 md:py-7 rounded-lg font-semibold"
                >
                  Get Started Now
                  <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto max-w-4xl px-4 mt-8 sm:mt-12">
          <div className="bg-gradient-to-br from-gray-900/50 to-gray-950/50 backdrop-blur-sm border border-white/10 rounded-2xl p-4 sm:p-6 md:p-8 mb-8 sm:mb-12 max-w-md mx-auto">
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">
                  Streamline collaborations & get paid faster.
                </h2>
                <p className="text-white/70 leading-relaxed">
                  Gain invaluable insights into creator performance and brand partnerships, empowering you to make
                  data-driven decisions and close deals more effectively.
                </p>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Check className="h-5 w-5 text-white flex-shrink-0" />
                  <span className="text-white">Campaign management</span>
                </div>
                <div className="flex items-center gap-3">
                  <Check className="h-5 w-5 text-white flex-shrink-0" />
                  <span className="text-white">Instant payments</span>
                </div>
                <div className="flex items-center gap-3">
                  <Check className="h-5 w-5 text-white flex-shrink-0" />
                  <span className="text-white">Brand discovery</span>
                </div>
                <div className="flex items-center gap-3">
                  <Check className="h-5 w-5 text-white flex-shrink-0" />
                  <span className="text-white">Performance analytics</span>
                </div>
              </div>

              <Button
                size="lg"
                className="w-full bg-white text-black hover:bg-white/90 group text-base px-8 py-6 rounded-lg font-semibold"
              >
                Get Started Now
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
          </div>

          <div className="bg-gradient-to-br from-gray-900/50 to-gray-950/50 backdrop-blur-sm border border-white/10 rounded-2xl p-4 sm:p-6 mb-8 sm:mb-12">
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <div>
                <h3 className="text-white font-semibold text-base sm:text-lg">Dashboard</h3>
                <p className="text-white/50 text-xs sm:text-sm">Last 30 days</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              <div className="bg-black/30 rounded-xl p-4 border border-white/5">
                <div className="text-white/60 text-xs mb-1">Monthly Sales</div>
                <div className="space-y-1">
                  <div className="text-white/50 text-xs">Total product</div>
                  <div className="text-white text-2xl font-bold">21.4k</div>
                  <div className="text-white/50 text-xs mt-2">Total orders</div>
                  <div className="text-white text-xl font-semibold">1.3M</div>
                </div>
              </div>

              <div className="bg-black/30 rounded-xl p-4 border border-white/5">
                <div className="text-white/60 text-xs mb-1">Revenue Summary</div>
                <div className="space-y-1">
                  <div className="text-white/50 text-xs">Revenue</div>
                  <div className="text-white text-2xl font-bold">$6,35,240</div>
                  <div className="space-y-1 mt-3">
                    <div className="flex justify-between text-xs">
                      <span className="text-white/50">Product Sales</span>
                      <span className="text-white">$12,900</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-white/50">Development Service</span>
                      <span className="text-white">$9850</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-white/50">Subscription</span>
                      <span className="text-white">$3700</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-white/50">Digital Assets</span>
                      <span className="text-white">$3700</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-black/30 rounded-xl p-4 border border-white/5 col-span-2 sm:col-span-1">
                <div className="text-white/60 text-xs mb-1">Real-time</div>
                <div className="text-white text-4xl font-bold mb-2">49</div>
                <div className="text-white/50 text-xs">Visiting Now</div>
                <div className="mt-4 h-16 flex items-end">
                  <div className="w-full h-12 bg-gradient-to-t from-red-500/20 to-red-500/5 rounded-lg relative overflow-hidden">
                    <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-red-500/40 to-transparent rounded-lg" />
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-black/30 rounded-xl p-4 border border-white/5 text-center">
                <div className="text-white/50 text-xs mb-2">Total Sales</div>
                <div className="text-white text-2xl font-bold">$59,304</div>
              </div>
              <div className="bg-black/30 rounded-xl p-4 border border-white/5 text-center">
                <div className="text-white/50 text-xs mb-2">This Month Sales</div>
                <div className="text-white text-2xl font-bold">$12,661</div>
              </div>
              <div className="bg-black/30 rounded-xl p-4 border border-white/5 text-center">
                <div className="text-white/50 text-xs mb-2">This Month Customer</div>
                <div className="text-white text-2xl font-bold">759</div>
              </div>
              <div className="bg-black/30 rounded-xl p-4 border border-white/5 text-center">
                <div className="text-white/50 text-xs mb-2">Total Views</div>
                <div className="text-white text-2xl font-bold">166,543</div>
              </div>
            </div>
          </div>

          <div className="text-center px-4">
            <p className="text-white text-base sm:text-lg md:text-xl font-medium">
              Trusted by 15,000+ founders & business owners
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
