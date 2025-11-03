"use client"

import { Button } from "@/components/ui/button"
import { Check, ArrowRight, Users, Building2 } from "lucide-react"

export function PricingSection() {
  return (
    <section className="relative bg-gradient-to-b from-black via-gray-950 to-gray-900 py-12 sm:py-16 md:py-20 px-4 sm:px-6">
      <div className="container mx-auto max-w-7xl">
        <div className="text-center mb-10 sm:mb-12 md:mb-16">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-3 sm:mb-4 px-4 leading-tight">
            Simple, Transparent Pricing
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-white/70 max-w-2xl mx-auto px-4 leading-relaxed">
            No hidden fees. No commissions. Just straightforward subscription plans that grow with you.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 max-w-5xl mx-auto">
          {/* Creator Plan */}
          <div className="bg-gradient-to-br from-red-500/10 to-red-900/5 backdrop-blur-sm border-2 border-red-500/30 rounded-2xl p-6 sm:p-8 hover:border-red-500/50 transition-all duration-300 hover:scale-105">
            <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
              <div className="p-2 sm:p-3 bg-red-500/20 rounded-xl">
                <Users className="h-5 w-5 sm:h-6 sm:w-6 text-red-400" />
              </div>
              <div>
                <h3 className="text-xl sm:text-2xl font-bold text-white">Creator Access Pass</h3>
                <p className="text-white/60 text-xs sm:text-sm">For influencers & content creators</p>
              </div>
            </div>

            <div className="mb-4 sm:mb-6">
              <div className="flex items-baseline gap-2">
                <span className="text-4xl sm:text-5xl font-bold text-white">₹349</span>
                <span className="text-sm sm:text-base text-white/60">/month</span>
              </div>
              <p className="text-white/50 text-xs sm:text-sm mt-1">GST included • 49% profit margin</p>
            </div>

            <div className="space-y-2 sm:space-y-3 mb-6 sm:mb-8">
              <div className="flex items-start gap-2 sm:gap-3">
                <Check className="h-4 w-4 sm:h-5 sm:w-5 text-red-400 mt-0.5 flex-shrink-0" />
                <span className="text-sm sm:text-base text-white/80">Verified listing priority</span>
              </div>
              <div className="flex items-start gap-2 sm:gap-3">
                <Check className="h-4 w-4 sm:h-5 sm:w-5 text-red-400 mt-0.5 flex-shrink-0" />
                <span className="text-sm sm:text-base text-white/80">Early access to brand campaigns</span>
              </div>
              <div className="flex items-start gap-2 sm:gap-3">
                <Check className="h-4 w-4 sm:h-5 sm:w-5 text-red-400 mt-0.5 flex-shrink-0" />
                <span className="text-sm sm:text-base text-white/80">Advanced analytics dashboard</span>
              </div>
              <div className="flex items-start gap-2 sm:gap-3">
                <Check className="h-4 w-4 sm:h-5 sm:w-5 text-red-400 mt-0.5 flex-shrink-0" />
                <span className="text-sm sm:text-base text-white/80">Creator badges & level system</span>
              </div>
              <div className="flex items-start gap-2 sm:gap-3">
                <Check className="h-4 w-4 sm:h-5 sm:w-5 text-red-400 mt-0.5 flex-shrink-0" />
                <span className="text-sm sm:text-base text-white/80">Direct brand messaging</span>
              </div>
              <div className="flex items-start gap-2 sm:gap-3">
                <Check className="h-4 w-4 sm:h-5 sm:w-5 text-red-400 mt-0.5 flex-shrink-0" />
                <span className="text-sm sm:text-base text-white/80">Referral rewards program</span>
              </div>
            </div>

            <Button className="w-full bg-red-500 hover:bg-red-600 text-white group text-sm sm:text-base py-5 sm:py-6 rounded-lg font-semibold">
              Start Free Trial
              <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5 group-hover:translate-x-1 transition-transform" />
            </Button>

            <p className="text-center text-white/50 text-xs sm:text-sm mt-3 sm:mt-4">
              Refer 3 friends → Get 1 month free
            </p>
          </div>

          {/* Brand Plan */}
          <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm border-2 border-white/30 rounded-2xl p-6 sm:p-8 hover:border-white/50 transition-all duration-300 hover:scale-105">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-white/20 rounded-xl">
                <Building2 className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white">Brand Growth Pass</h3>
                <p className="text-white/60 text-sm">For brands & marketing agencies</p>
              </div>
            </div>

            <div className="mb-6">
              <div className="flex items-baseline gap-2">
                <span className="text-5xl font-bold text-white">₹1,199</span>
                <span className="text-white/60">/month</span>
              </div>
              <p className="text-white/50 text-sm mt-1">GST included • 75% profit margin</p>
            </div>

            <div className="space-y-3 mb-8">
              <div className="flex items-start gap-3">
                <Check className="h-5 w-5 text-white mt-0.5 flex-shrink-0" />
                <span className="text-white/80">Unlimited creator search & filters</span>
              </div>
              <div className="flex items-start gap-3">
                <Check className="h-5 w-5 text-white mt-0.5 flex-shrink-0" />
                <span className="text-white/80">AI-powered creator recommendations</span>
              </div>
              <div className="flex items-start gap-3">
                <Check className="h-5 w-5 text-white mt-0.5 flex-shrink-0" />
                <span className="text-white/80">Campaign builder & management</span>
              </div>
              <div className="flex items-start gap-3">
                <Check className="h-5 w-5 text-white mt-0.5 flex-shrink-0" />
                <span className="text-white/80">Real-time analytics & reporting</span>
              </div>
              <div className="flex items-start gap-3">
                <Check className="h-5 w-5 text-white mt-0.5 flex-shrink-0" />
                <span className="text-white/80">Bulk creator invites</span>
              </div>
              <div className="flex items-start gap-3">
                <Check className="h-5 w-5 text-white mt-0.5 flex-shrink-0" />
                <span className="text-white/80">Priority support & onboarding</span>
              </div>
            </div>

            <Button className="w-full bg-white hover:bg-white/90 text-black group text-base py-6 rounded-lg font-semibold">
              Start Free Trial
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Button>

            <p className="text-center text-white/50 text-sm mt-4">14-day free trial • No credit card required</p>
          </div>
        </div>
      </div>
    </section>
  )
}
