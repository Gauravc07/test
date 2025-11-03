"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  Search,
  Target,
  Heart,
  BarChart3,
  CreditCard,
  Settings,
  Menu,
  X,
  TrendingUp,
} from "lucide-react"
import { Button } from "@/components/ui/button"

const navigation = [
  { name: "Dashboard", href: "/dashboard/brand", icon: LayoutDashboard },
  { name: "Find Influencers", href: "/dashboard/brand/find-influencers", icon: Search },
  { name: "Campaigns", href: "/dashboard/brand/campaigns", icon: Target },
  { name: "Shortlists", href: "/dashboard/brand/shortlists", icon: Heart },
  { name: "Analytics", href: "/dashboard/brand/analytics", icon: BarChart3 },
  { name: "ROI Dashboard", href: "/dashboard/brand/roi", icon: TrendingUp },
  { name: "Payments", href: "/dashboard/brand/payments", icon: CreditCard },
  { name: "Settings", href: "/dashboard/brand/settings", icon: Settings },
]

export function BrandSidebar() {
  const pathname = usePathname()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  return (
    <>
      {/* Mobile Menu Button */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-4 left-4 z-50 lg:hidden bg-[#1a1f35] hover:bg-[#252b45] text-white"
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
      >
        {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 z-40 h-screen w-64 bg-[#0a0e1a] border-r border-white/10 transition-transform duration-300 ease-in-out",
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
        )}
      >
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-16 items-center border-b border-white/10 px-6">
            <Link href="/" className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <span className="text-white font-bold text-lg">S</span>
              </div>
              <span className="text-xl font-bold text-white">Shor</span>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 px-3 py-4 overflow-y-auto scrollbar-hide">
            {navigation.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                    isActive ? "bg-blue-600 text-white" : "text-gray-400 hover:bg-[#1a1f35] hover:text-white",
                  )}
                >
                  <item.icon className="h-5 w-5 flex-shrink-0" />
                  <span className="truncate">{item.name}</span>
                </Link>
              )
            })}
          </nav>

          {/* Footer */}
          <div className="border-t border-white/10 p-4">
            <div className="rounded-lg bg-gradient-to-br from-blue-600/20 to-purple-600/20 p-4">
              <p className="text-sm font-medium text-white mb-1">Upgrade to Pro</p>
              <p className="text-xs text-gray-400 mb-3">Get unlimited access to all features</p>
              <Button size="sm" className="w-full bg-blue-600 hover:bg-blue-700 text-xs">
                Upgrade Now
              </Button>
            </div>
          </div>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-30 bg-black/50 lg:hidden" onClick={() => setIsMobileMenuOpen(false)} />
      )}
    </>
  )
}

export default BrandSidebar
