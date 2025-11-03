"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { LayoutDashboard, Handshake, BarChart3, DollarSign, Search, Settings, Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"

const sidebarItems = [
  {
    title: "Dashboard",
    icon: LayoutDashboard,
    href: "/dashboard/creator",
  },
  {
    title: "Collaborations",
    icon: Handshake,
    href: "/dashboard/creator/collaborations",
  },
  {
    title: "Analytics",
    icon: BarChart3,
    href: "/dashboard/creator/analytics",
  },
  {
    title: "Earnings",
    icon: DollarSign,
    href: "/dashboard/creator/earnings",
  },
  {
    title: "Explore Brands",
    icon: Search,
    href: "/dashboard/creator/explore",
  },
  {
    title: "Settings",
    icon: Settings,
    href: "/dashboard/creator/settings",
  },
]

export function InfluencerSidebar() {
  const pathname = usePathname()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  return (
    <>
      {/* Mobile Menu Button */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-4 left-4 z-50 lg:hidden bg-[#1a1f35] text-white hover:bg-[#252b45]"
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
      >
        {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 z-40 h-screen w-64 bg-[#0f1629] border-r border-white/10 transition-transform duration-300 overflow-y-auto",
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
        )}
      >
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-14 sm:h-16 items-center border-b border-white/10 px-4 sm:px-6">
            <Link href="/" className="flex items-center gap-2">
              <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <span className="text-white font-bold text-base sm:text-lg">S</span>
              </div>
              <span className="text-lg sm:text-xl font-bold text-white">Shor</span>
            </Link>
          </div>

          {/* Navigation Items */}
          <nav className="flex-1 space-y-1 px-2 sm:px-3 py-3 sm:py-4">
            {sidebarItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={cn(
                    "flex items-center gap-2 sm:gap-3 rounded-lg px-2 sm:px-3 py-2 sm:py-2.5 text-xs sm:text-sm font-medium transition-colors",
                    isActive ? "bg-blue-600 text-white" : "text-gray-400 hover:bg-[#1a1f35] hover:text-white",
                  )}
                >
                  <Icon className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
                  <span className="truncate">{item.title}</span>
                </Link>
              )
            })}
          </nav>

          {/* Footer */}
          <div className="border-t border-white/10 p-3 sm:p-4">
            <p className="text-[10px] sm:text-xs text-gray-500 text-center">© 2025 Shor</p>
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
