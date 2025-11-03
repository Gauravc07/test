"use client"

import { useEffect, useState } from "react"
import { TrendingUp, Users, DollarSign, Briefcase } from "lucide-react"

const stats = [
  {
    icon: Users,
    label: "Active Creators",
    value: 500,
    suffix: "+",
    color: "text-cyan-500",
  },
  {
    icon: Briefcase,
    label: "Brand Partners",
    value: 1000,
    suffix: "+",
    color: "text-teal-500",
  },
  {
    icon: DollarSign,
    label: "Total Payouts",
    value: 2,
    suffix: "Cr+",
    prefix: "₹",
    color: "text-emerald-500",
  },
  {
    icon: TrendingUp,
    label: "Success Rate",
    value: 98,
    suffix: "%",
    color: "text-blue-500",
  },
]

export function InteractiveStats() {
  const [counts, setCounts] = useState(stats.map(() => 0))

  useEffect(() => {
    const duration = 2000
    const steps = 60
    const interval = duration / steps

    stats.forEach((stat, index) => {
      let currentStep = 0
      const increment = stat.value / steps

      const timer = setInterval(() => {
        currentStep++
        setCounts((prev) => {
          const newCounts = [...prev]
          newCounts[index] = Math.min(currentStep * increment, stat.value)
          return newCounts
        })

        if (currentStep >= steps) {
          clearInterval(timer)
        }
      }, interval)
    })
  }, [])

  return (
    <section className="py-16 px-4 bg-muted/30">
      <div className="container mx-auto max-w-6xl">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="text-center group hover:scale-110 transition-transform duration-300 cursor-pointer"
            >
              <div className="flex justify-center mb-3">
                <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <stat.icon className={`w-7 h-7 ${stat.color}`} />
                </div>
              </div>
              <div className="text-3xl md:text-4xl font-bold mb-1">
                {stat.prefix}
                {Math.round(counts[index])}
                {stat.suffix}
              </div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
