"use client"

import { useState } from "react"
import { Bell, MessageSquare, Search, ChevronDown, User, Settings, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"

export function BrandHeader() {
  const { user, logout } = useAuth()
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")

  const handleLogout = () => {
    logout()
    router.push("/")
  }

  return (
    <header className="sticky top-0 z-30 h-16 border-b border-white/10 bg-[#0a0e1a]/95 backdrop-blur-sm" role="banner">
      <div className="flex h-full items-center justify-between px-4 lg:px-6">
        {/* Search Bar */}
        <div className="flex-1 max-w-2xl mx-4 lg:mx-8">
          <div className="relative">
            <label htmlFor="global-search" className="sr-only">
              Search influencers
            </label>
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" aria-hidden="true" />
            <Input
              id="global-search"
              type="search"
              placeholder="Search influencers by name, category, or platform..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#1a1f35] border-white/10 text-white pl-10 pr-4 h-10 focus:ring-2 focus:ring-orange-500"
              aria-label="Search influencers by name, category, or platform"
            />
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-2" role="navigation" aria-label="User actions">
          {/* Notifications */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="relative hover:bg-[#1a1f35] touch-target"
                aria-label="Notifications (3 unread)"
              >
                <Bell className="h-5 w-5 text-gray-400" aria-hidden="true" />
                <Badge
                  className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-red-500 text-white text-xs"
                  aria-label="3 unread notifications"
                >
                  3
                </Badge>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80 bg-[#1a1f35] border-white/10 text-white" role="menu">
              <DropdownMenuLabel>Notifications</DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-white/10" />
              <div className="max-h-[400px] overflow-y-auto" role="list">
                <DropdownMenuItem
                  className="flex flex-col items-start gap-1 p-3 cursor-pointer hover:bg-[#252b45]"
                  role="listitem"
                >
                  <p className="text-sm font-medium">New campaign application</p>
                  <p className="text-xs text-gray-400">Sarah Johnson applied to your campaign</p>
                  <p className="text-xs text-gray-500">
                    <time dateTime="2024-01-15T14:00:00">2 hours ago</time>
                  </p>
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="flex flex-col items-start gap-1 p-3 cursor-pointer hover:bg-[#252b45]"
                  role="listitem"
                >
                  <p className="text-sm font-medium">Campaign milestone reached</p>
                  <p className="text-xs text-gray-400">Product Launch campaign reached 100K views</p>
                  <p className="text-xs text-gray-500">
                    <time dateTime="2024-01-15T11:00:00">5 hours ago</time>
                  </p>
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="flex flex-col items-start gap-1 p-3 cursor-pointer hover:bg-[#252b45]"
                  role="listitem"
                >
                  <p className="text-sm font-medium">Payment processed</p>
                  <p className="text-xs text-gray-400">₹15,000 paid to Priya Sharma</p>
                  <p className="text-xs text-gray-500">
                    <time dateTime="2024-01-14T16:00:00">1 day ago</time>
                  </p>
                </DropdownMenuItem>
              </div>
              <DropdownMenuSeparator className="bg-white/10" />
              <DropdownMenuItem className="justify-center text-orange-500 cursor-pointer hover:bg-[#252b45]">
                View all notifications
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Messages */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="relative hover:bg-[#1a1f35] touch-target"
                aria-label="Messages (5 unread)"
              >
                <MessageSquare className="h-5 w-5 text-gray-400" aria-hidden="true" />
                <Badge
                  className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-orange-500 text-white text-xs"
                  aria-label="5 unread messages"
                >
                  5
                </Badge>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80 bg-[#1a1f35] border-white/10 text-white" role="menu">
              <DropdownMenuLabel>Messages</DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-white/10" />
              <div className="max-h-[400px] overflow-y-auto" role="list">
                <DropdownMenuItem
                  className="flex items-start gap-3 p-3 cursor-pointer hover:bg-[#252b45]"
                  role="listitem"
                >
                  <Avatar className="h-10 w-10">
                    <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=priya" alt="Priya Sharma" />
                    <AvatarFallback>PS</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">Priya Sharma</p>
                    <p className="text-xs text-gray-400 truncate">Thanks for the opportunity! When do we start?</p>
                    <p className="text-xs text-gray-500">
                      <time dateTime="2024-01-15T15:50:00">10 min ago</time>
                    </p>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="flex items-start gap-3 p-3 cursor-pointer hover:bg-[#252b45]"
                  role="listitem"
                >
                  <Avatar className="h-10 w-10">
                    <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=rahul" alt="Rahul Verma" />
                    <AvatarFallback>RV</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">Rahul Verma</p>
                    <p className="text-xs text-gray-400 truncate">I've completed the first deliverable</p>
                    <p className="text-xs text-gray-500">
                      <time dateTime="2024-01-15T15:00:00">1 hour ago</time>
                    </p>
                  </div>
                </DropdownMenuItem>
              </div>
              <DropdownMenuSeparator className="bg-white/10" />
              <DropdownMenuItem className="justify-center text-orange-500 cursor-pointer hover:bg-[#252b45]">
                View all messages
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Profile / Settings */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="flex items-center gap-2 hover:bg-[#1a1f35] touch-target"
                aria-label={`Account menu for ${user?.name || "Brand"}`}
              >
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user?.avatar || "/placeholder.svg"} alt={user?.name || "Brand avatar"} />
                  <AvatarFallback className="bg-orange-600 text-white">{user?.name?.charAt(0) || "B"}</AvatarFallback>
                </Avatar>
                <span className="hidden md:inline text-sm text-white">{user?.name || "Brand"}</span>
                <ChevronDown className="h-4 w-4 text-gray-400" aria-hidden="true" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 bg-[#1a1f35] border-white/10 text-white" role="menu">
              <DropdownMenuLabel>
                <div className="flex flex-col">
                  <span className="text-sm font-medium">{user?.name || "Brand Account"}</span>
                  <span className="text-xs text-gray-400">{user?.email || "brand@example.com"}</span>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-white/10" />
              <DropdownMenuItem className="cursor-pointer hover:bg-[#252b45]" role="menuitem">
                <User className="mr-2 h-4 w-4" aria-hidden="true" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer hover:bg-[#252b45]" role="menuitem">
                <Settings className="mr-2 h-4 w-4" aria-hidden="true" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-white/10" />
              <DropdownMenuItem
                onClick={handleLogout}
                className="cursor-pointer hover:bg-[#252b45] text-red-400"
                role="menuitem"
              >
                <LogOut className="mr-2 h-4 w-4" aria-hidden="true" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}

export default BrandHeader
