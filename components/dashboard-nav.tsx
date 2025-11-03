"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Store, LayoutDashboard, BarChart3, Target, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/lib/auth-context"
import Image from "next/image"

export default function DashboardNav() {
  const pathname = usePathname()
  const { logout } = useAuth()

  const navItems = [
    {
      name: "Marketplace",
      href: "/dashboard/marketplace",
      icon: Store,
    },
    {
      name: "Overview",
      href: pathname.includes("creator") ? "/dashboard/creator" : "/dashboard/brand",
      icon: LayoutDashboard,
    },
    {
      name: "Analytics",
      href: "/dashboard/analytics",
      icon: BarChart3,
    },
    {
      name: "Campaigns",
      href: "/dashboard/campaigns",
      icon: Target,
    },
  ]

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-md border-b border-white/10">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <Image
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/shor_no_bg-rRbh8YC5Cnk5bnRC6q9GxeNV4P1nFZ.png"
              alt="Shor"
              width={100}
              height={40}
              className="h-8 w-auto"
            />
          </Link>

          {/* Navigation Items */}
          <div className="hidden md:flex items-center gap-8">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-2 text-sm font-medium transition-colors hover:text-white",
                    isActive ? "text-white" : "text-gray-400",
                  )}
                >
                  <Icon className="w-4 h-4" />
                  {item.name}
                </Link>
              )
            })}
          </div>

          {/* Logout Button */}
          <Button
            onClick={logout}
            variant="outline"
            size="sm"
            className="border-white/20 bg-transparent text-white hover:bg-white/10"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden flex items-center gap-4 pb-3 overflow-x-auto">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center gap-2 text-xs font-medium whitespace-nowrap px-3 py-1.5 rounded-full transition-colors",
                  isActive ? "bg-red-600 text-white" : "bg-white/5 text-gray-400 hover:text-white",
                )}
              >
                <Icon className="w-3 h-3" />
                {item.name}
              </Link>
            )
          })}
        </div>
      </div>
    </nav>
  )
}
