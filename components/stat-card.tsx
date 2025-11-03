"use client"

import React from "react"
import { Card } from "@/components/ui/card"
import { Info } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

type StatCardProps = {
  title: string
  value: number | string
  deltaPct?: number
  deltaDir?: "up" | "down"
  sparkline?: number[]
  tooltip?: string
  icon?: React.ReactNode
  iconBg?: string
  onClick?: () => void
  loading?: boolean
}

// Simple sparkline SVG component
function Sparkline({ data }: { data: number[] }) {
  if (!data || data.length === 0) return null

  const width = 60
  const height = 24
  const max = Math.max(...data)
  const min = Math.min(...data)
  const range = max - min || 1

  const points = data
    .map((value, index) => {
      const x = (index / (data.length - 1)) * width
      const y = height - ((value - min) / range) * height
      return `${x},${y}`
    })
    .join(" ")

  return (
    <svg width={width} height={height} className="opacity-60" aria-hidden="true">
      <defs>
        <linearGradient id="sparkline-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#E63946" />
          <stop offset="100%" stopColor="#ff8a8a" />
        </linearGradient>
      </defs>
      <polyline
        points={points}
        fill="none"
        stroke="url(#sparkline-gradient)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

// CountUp animation component
function CountUpNumber({ end, duration = 0.9 }: { end: number; duration?: number }) {
  const [count, setCount] = React.useState(0)

  React.useEffect(() => {
    let startTime: number
    let animationFrame: number

    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime
      const progress = Math.min((currentTime - startTime) / (duration * 1000), 1)

      setCount(Math.floor(progress * end))

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate)
      }
    }

    animationFrame = requestAnimationFrame(animate)

    return () => cancelAnimationFrame(animationFrame)
  }, [end, duration])

  return <>{count.toLocaleString()}</>
}

export default function StatCard({
  title,
  value,
  deltaPct,
  deltaDir,
  sparkline,
  tooltip,
  icon,
  iconBg,
  onClick,
  loading = false,
}: StatCardProps) {
  if (loading) {
    return (
      <Card className="bg-[#0f1629]/50 border-white/10 p-4 sm:p-6 animate-pulse">
        <div className="h-4 bg-white/10 rounded w-24 mb-3" />
        <div className="h-8 bg-white/10 rounded w-32 mb-2" />
        <div className="h-3 bg-white/10 rounded w-16" />
      </Card>
    )
  }

  return (
    <Card
      role="region"
      aria-label={title}
      className="bg-[#0f1629]/50 border-white/10 p-4 sm:p-6 hover:bg-[#1a1f35] transition-all duration-300 cursor-pointer group overflow-hidden"
      onClick={onClick}
    >
      <div className="flex items-center justify-between mb-3 gap-2">
        <div className="flex items-center gap-1.5 flex-1 min-w-0">
          <p className="text-gray-400 text-[10px] sm:text-xs uppercase tracking-wide truncate min-w-0">{title}</p>
          {tooltip && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="w-3 h-3 sm:w-4 sm:h-4 text-gray-500 hover:text-gray-400 cursor-help flex-shrink-0" />
                </TooltipTrigger>
                <TooltipContent className="max-w-xs bg-[#1a1f35] border-white/10 text-white text-xs">
                  <p>{tooltip}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
        {icon && (
          <div
            className={`h-8 w-8 sm:h-10 sm:w-10 lg:h-12 lg:w-12 rounded-full ${iconBg} flex items-center justify-center flex-shrink-0`}
          >
            {icon}
          </div>
        )}
      </div>

      <div className="flex items-end justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-white mb-2 truncate">
            {typeof value === "number" ? <CountUpNumber end={value} /> : value}
          </div>
          {deltaPct !== undefined && (
            <div
              className={`text-xs sm:text-sm flex items-center gap-1 ${
                deltaDir === "up" ? "text-green-500" : "text-red-500"
              }`}
            >
              <span>{deltaDir === "up" ? "▲" : "▼"}</span>
              <span className="font-medium">{Math.abs(deltaPct)}%</span>
              <span className="text-gray-400 text-[10px] sm:text-xs">vs last 7 days</span>
            </div>
          )}
        </div>
        {sparkline && sparkline.length > 0 && (
          <div className="hidden sm:block ml-2 flex-shrink-0">
            <Sparkline data={sparkline} />
          </div>
        )}
      </div>
    </Card>
  )
}

export { StatCard }
