"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Calendar, CreditCard, BarChart3, MessageSquare, FileCheck, Shield, Zap, Globe } from "lucide-react"

const featureCategories = [
  {
    id: "collaboration",
    name: "Collaboration Tools",
    icon: MessageSquare,
    features: [
      {
        title: "Unified Messaging",
        description: "Chat with brands directly in the platform. No more switching between WhatsApp, email, and DMs.",
        icon: MessageSquare,
      },
      {
        title: "Brief Management",
        description: "Receive, review, and accept brand briefs all in one place. Clear deliverables and deadlines.",
        icon: FileCheck,
      },
      {
        title: "Content Calendar",
        description: "Schedule your collaborations and never miss a deadline. Sync with your existing calendar.",
        icon: Calendar,
      },
    ],
  },
  {
    id: "payments",
    name: "Payments & Finance",
    icon: CreditCard,
    features: [
      {
        title: "Automated Invoicing",
        description: "Generate GST-compliant invoices automatically. Track payment status in real-time.",
        icon: CreditCard,
      },
      {
        title: "Payment Tracking",
        description: "See exactly when you'll get paid. Get notified when payments are processed.",
        icon: BarChart3,
      },
      {
        title: "Earnings Dashboard",
        description: "Track your monthly earnings, pending payments, and revenue trends at a glance.",
        icon: BarChart3,
      },
    ],
  },
  {
    id: "analytics",
    name: "Analytics & Insights",
    icon: BarChart3,
    features: [
      {
        title: "Performance Metrics",
        description: "Track engagement, reach, and ROI for every collaboration. Prove your value to brands.",
        icon: BarChart3,
      },
      {
        title: "Brand Insights",
        description: "See which brands are most interested in your profile. Get matched with relevant opportunities.",
        icon: Globe,
      },
      {
        title: "Growth Tracking",
        description:
          "Monitor your creator journey with detailed analytics on earnings, collaborations, and audience growth.",
        icon: Zap,
      },
    ],
  },
  {
    id: "security",
    name: "Security & Trust",
    icon: Shield,
    features: [
      {
        title: "Verified Brands",
        description: "All brands are verified before joining. Work with legitimate companies only.",
        icon: Shield,
      },
      {
        title: "Secure Contracts",
        description: "Digital contracts with legal protection. Your rights are protected on every deal.",
        icon: FileCheck,
      },
      {
        title: "Payment Protection",
        description: "Escrow-based payments ensure you get paid for completed work. No more chasing payments.",
        icon: CreditCard,
      },
    ],
  },
]

export function DetailedFeatures() {
  const [activeCategory, setActiveCategory] = useState(featureCategories[0].id)

  const currentCategory = featureCategories.find((cat) => cat.id === activeCategory)

  return (
    <section className="py-24 px-4 bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-balance">Powerful Features for Modern Creators</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto text-balance">
            Everything you need to manage collaborations, get paid faster, and grow your creator business.
          </p>
        </div>

        {/* Category Tabs */}
        <div className="flex flex-wrap justify-center gap-4 mb-12">
          {featureCategories.map((category) => (
            <Button
              key={category.id}
              variant={activeCategory === category.id ? "default" : "outline"}
              size="lg"
              onClick={() => setActiveCategory(category.id)}
              className={`gap-2 transition-all ${
                activeCategory === category.id ? "scale-105 shadow-lg" : "hover:scale-105 bg-transparent"
              }`}
            >
              <category.icon className="w-4 h-4" />
              {category.name}
            </Button>
          ))}
        </div>

        {/* Feature Cards */}
        <div className="grid md:grid-cols-3 gap-8">
          {currentCategory?.features.map((feature, index) => (
            <div
              key={index}
              className="bg-card border border-border rounded-2xl p-8 hover:border-primary/50 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group"
            >
              <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-6 group-hover:bg-primary group-hover:scale-110 transition-all">
                <feature.icon className="w-7 h-7 text-primary group-hover:text-primary-foreground transition-colors" />
              </div>
              <h3 className="text-2xl font-bold mb-3">{feature.title}</h3>
              <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>

        {/* Additional Info */}
        <div className="mt-16 text-center">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-6 py-3 rounded-full">
            <Zap className="w-5 h-5" />
            <span className="font-semibold">More features added every month based on creator feedback</span>
          </div>
        </div>
      </div>
    </section>
  )
}
