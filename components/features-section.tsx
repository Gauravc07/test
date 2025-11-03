"use client"

import {
  LayoutDashboard,
  BadgeCheck,
  Target,
  MessageSquare,
  BarChart3,
  TrendingUp,
  Search,
  Sparkles,
  FileText,
  DollarSign,
  Users,
} from "lucide-react"
import { useState } from "react"

const creatorFeatures = [
  {
    icon: LayoutDashboard,
    title: "Creator Dashboard",
    description: "Manage your profile, categories, audience data, and portfolio all in one place.",
  },
  {
    icon: BadgeCheck,
    title: "Verified Badge",
    description: "Earn recognition as an active or high-performing creator with our verification system.",
  },
  {
    icon: Target,
    title: "Brand Match Feed",
    description: "Discover campaigns that perfectly fit your category, location, and follower base.",
  },
  {
    icon: MessageSquare,
    title: "Direct Brand Chat",
    description: "Communicate seamlessly with brands through integrated messaging and campaign inbox.",
  },
  {
    icon: BarChart3,
    title: "Engagement Dashboard",
    description: "Track your reach, engagement, audience stats, and performance trends in real-time.",
  },
  {
    icon: TrendingUp,
    title: "Growth Insights",
    description: "AI-powered summaries show what's working and what's not for your content strategy.",
  },
]

const brandFeatures = [
  {
    icon: Search,
    title: "Creator Search Engine",
    description: "Filter by category, audience, platform, followers, and location to find perfect matches.",
  },
  {
    icon: Sparkles,
    title: "AI Recommendations",
    description: "Get intelligent suggestions for ideal creators based on your campaign goals.",
  },
  {
    icon: FileText,
    title: "Campaign Builder",
    description: "Create detailed campaign briefs with budgets, deliverables, and deadlines effortlessly.",
  },
  {
    icon: Users,
    title: "Bulk Invites",
    description: "Send campaign invitations to multiple creators at once and manage responses efficiently.",
  },
  {
    icon: BarChart3,
    title: "Campaign Analytics",
    description: "Monitor real-time performance, reach, engagement, and cost metrics for all campaigns.",
  },
  {
    icon: DollarSign,
    title: "Secure Payments",
    description: "Escrow-based payment flow ensures secure transactions after campaign approval.",
  },
]

export function FeaturesSection() {
  const [activeTab, setActiveTab] = useState<"creators" | "brands">("creators")
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)

  const features = activeTab === "creators" ? creatorFeatures : brandFeatures

  return (
    <section className="relative bg-gradient-to-b from-gray-900 via-black to-gray-950 py-12 sm:py-16 md:py-20 px-4 sm:px-6">
      <div className="container mx-auto max-w-7xl">
        <div className="text-center mb-8 sm:mb-10 md:mb-12">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-3 sm:mb-4 px-4 leading-tight">
            Powerful Features for Everyone
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-white/70 max-w-2xl mx-auto px-4 leading-relaxed">
            Everything you need to collaborate, create, and grow — all in one platform.
          </p>
        </div>

        <div className="flex justify-center mb-8 sm:mb-10 md:mb-12 px-4">
          <div className="inline-flex bg-white/5 backdrop-blur-sm border border-white/10 rounded-full p-1 w-full sm:w-auto">
            <button
              onClick={() => setActiveTab("creators")}
              className={`px-4 sm:px-6 md:px-8 py-2 sm:py-2.5 md:py-3 rounded-full text-sm sm:text-base font-semibold transition-all duration-300 flex-1 sm:flex-initial ${
                activeTab === "creators" ? "bg-white text-black" : "text-white hover:text-white/80"
              }`}
            >
              For Creators
            </button>
            <button
              onClick={() => setActiveTab("brands")}
              className={`px-4 sm:px-6 md:px-8 py-2 sm:py-2.5 md:py-3 rounded-full text-sm sm:text-base font-semibold transition-all duration-300 flex-1 sm:flex-initial ${
                activeTab === "brands" ? "bg-white text-black" : "text-white hover:text-white/80"
              }`}
            >
              For Brands
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 md:gap-6">
          {features.map((feature, index) => (
            <div
              key={index}
              className={`bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-sm border rounded-2xl p-5 sm:p-6 transition-all duration-300 cursor-pointer ${
                hoveredIndex === index
                  ? "border-red-500/50 shadow-lg shadow-red-500/20 scale-105 -translate-y-1"
                  : "border-white/10 hover:border-white/20"
              }`}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              <div
                className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center mb-3 sm:mb-4 transition-all duration-300 ${
                  hoveredIndex === index
                    ? "bg-red-500 scale-110"
                    : activeTab === "creators"
                      ? "bg-red-500/20"
                      : "bg-white/20"
                }`}
              >
                <feature.icon
                  className={`w-5 h-5 sm:w-6 sm:h-6 transition-colors duration-300 ${
                    hoveredIndex === index ? "text-white" : activeTab === "creators" ? "text-red-400" : "text-white"
                  }`}
                />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-white mb-2">{feature.title}</h3>
              <p className="text-sm sm:text-base text-white/60 leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
