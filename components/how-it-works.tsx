"use client"

import {
  UserPlus,
  Target,
  MessageSquare,
  BarChart3,
  Gift,
  Building2,
  FileText,
  Users,
  Activity,
  Download,
} from "lucide-react"

const creatorSteps = [
  {
    icon: UserPlus,
    title: "Sign Up & Verify",
    description: "Create your profile and verify your social handles to get started.",
  },
  {
    icon: Target,
    title: "Get Recommendations",
    description: "See matching campaigns tailored to your niche and audience.",
  },
  {
    icon: MessageSquare,
    title: "Apply & Collaborate",
    description: "Chat with brands, submit your work, and manage deliverables.",
  },
  {
    icon: BarChart3,
    title: "Track Analytics",
    description: "View your growth, engagement metrics, and performance insights.",
  },
  {
    icon: Gift,
    title: "Earn Rewards",
    description: "Refer creators, climb levels, and unlock exclusive perks.",
  },
]

const brandSteps = [
  {
    icon: Building2,
    title: "Create Brand Profile",
    description: "Sign up and set up your brand profile with your campaign goals.",
  },
  {
    icon: FileText,
    title: "Post Campaign",
    description: "Set category, deliverables, budget, and campaign requirements.",
  },
  {
    icon: Users,
    title: "Browse & Invite",
    description: "Shortlist creators, send invites, or accept applications.",
  },
  {
    icon: Activity,
    title: "Monitor Campaign",
    description: "Track posts, engagement, ROI, and campaign performance live.",
  },
  {
    icon: Download,
    title: "Download Reports",
    description: "Get performance summaries and export data for analysis.",
  },
]

export function HowItWorks() {
  return (
    <section className="relative bg-gradient-to-b from-gray-950 via-gray-900 to-black py-12 sm:py-16 md:py-20 px-4 sm:px-6">
      <div className="container mx-auto max-w-7xl">
        <div className="text-center mb-10 sm:mb-12 md:mb-16">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-3 sm:mb-4 px-4 leading-tight">
            How Shor Works
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-white/70 max-w-2xl mx-auto px-4 leading-relaxed">
            Simple, transparent, and designed to get you collaborating in minutes.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-10 md:gap-12">
          {/* For Creators */}
          <div className="space-y-4 sm:space-y-5 md:space-y-6">
            <div className="text-center lg:text-left mb-6 sm:mb-8">
              <h3 className="text-xl sm:text-2xl font-bold text-white mb-2">For Creators</h3>
              <p className="text-sm sm:text-base text-white/60">Your journey from signup to success</p>
            </div>
            {creatorSteps.map((step, index) => (
              <div key={index} className="flex gap-3 sm:gap-4 group">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-red-500/20 border border-red-500/30 flex items-center justify-center group-hover:bg-red-500 group-hover:scale-110 transition-all duration-300">
                    <step.icon className="w-5 h-5 sm:w-6 sm:h-6 text-red-400 group-hover:text-white transition-colors duration-300" />
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-red-400 font-bold text-xs sm:text-sm">STEP {index + 1}</span>
                  </div>
                  <h4 className="text-white font-semibold text-base sm:text-lg mb-1">{step.title}</h4>
                  <p className="text-sm sm:text-base text-white/60 leading-relaxed">{step.description}</p>
                </div>
              </div>
            ))}
          </div>

          {/* For Brands */}
          <div className="space-y-4 sm:space-y-5 md:space-y-6">
            <div className="text-center lg:text-left mb-6 sm:mb-8">
              <h3 className="text-xl sm:text-2xl font-bold text-white mb-2">For Brands</h3>
              <p className="text-sm sm:text-base text-white/60">Launch campaigns and measure impact</p>
            </div>
            {brandSteps.map((step, index) => (
              <div key={index} className="flex gap-4 group">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center group-hover:bg-white group-hover:scale-110 transition-all duration-300">
                    <step.icon className="w-6 h-6 text-white group-hover:text-black transition-colors duration-300" />
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-white/60 font-bold text-sm">STEP {index + 1}</span>
                  </div>
                  <h4 className="text-white font-semibold text-lg mb-1">{step.title}</h4>
                  <p className="text-white/60">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
