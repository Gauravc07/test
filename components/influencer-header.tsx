"use client"

import { Bell, MessageSquare, User, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"

export function InfluencerHeader() {
  const { user, logout } = useAuth()
  const router = useRouter()

  const handleLogout = () => {
    logout()
    router.push("/")
  }

  return (
    <header className="sticky top-0 z-30 flex h-14 sm:h-16 items-center gap-2 sm:gap-4 border-b border-white/10 bg-[#0f1629]/95 backdrop-blur supports-[backdrop-filter]:bg-[#0f1629]/80 px-3 sm:px-4 lg:px-6">
      <div className="flex-1" />

      <div className="flex items-center gap-1 sm:gap-2">
        {/* Notifications */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="relative text-gray-400 hover:text-white h-8 w-8 sm:h-10 sm:w-10"
            >
              <Bell className="h-4 w-4 sm:h-5 sm:w-5" />
              <Badge className="absolute -top-1 -right-1 h-4 w-4 sm:h-5 sm:w-5 rounded-full bg-red-500 p-0 text-[10px] sm:text-xs flex items-center justify-center">
                3
              </Badge>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-72 sm:w-80 bg-[#1a1f35] border-white/10">
            <DropdownMenuLabel className="text-white text-sm sm:text-base">Notifications</DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-white/10" />
            <DropdownMenuItem className="text-gray-300 hover:bg-[#252b45] focus:bg-[#252b45]">
              <div className="flex flex-col gap-1">
                <p className="font-medium text-xs sm:text-sm">New campaign invitation</p>
                <p className="text-[10px] sm:text-xs text-gray-400">TechGear Pro wants to collaborate</p>
              </div>
            </DropdownMenuItem>
            <DropdownMenuItem className="text-gray-300 hover:bg-[#252b45] focus:bg-[#252b45]">
              <div className="flex flex-col gap-1">
                <p className="font-medium text-xs sm:text-sm">Payment received</p>
                <p className="text-[10px] sm:text-xs text-gray-400">₹15,000 credited to your account</p>
              </div>
            </DropdownMenuItem>
            <DropdownMenuItem className="text-gray-300 hover:bg-[#252b45] focus:bg-[#252b45]">
              <div className="flex flex-col gap-1">
                <p className="font-medium text-xs sm:text-sm">Campaign deadline approaching</p>
                <p className="text-[10px] sm:text-xs text-gray-400">Fashion Hub campaign due in 2 days</p>
              </div>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Messages */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="relative text-gray-400 hover:text-white h-8 w-8 sm:h-10 sm:w-10"
            >
              <MessageSquare className="h-4 w-4 sm:h-5 sm:w-5" />
              <Badge className="absolute -top-1 -right-1 h-4 w-4 sm:h-5 sm:w-5 rounded-full bg-blue-500 p-0 text-[10px] sm:text-xs flex items-center justify-center">
                5
              </Badge>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-72 sm:w-80 bg-[#1a1f35] border-white/10">
            <DropdownMenuLabel className="text-white text-sm sm:text-base">Messages</DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-white/10" />
            <DropdownMenuItem className="text-gray-300 hover:bg-[#252b45] focus:bg-[#252b45]">
              <div className="flex items-center gap-2 sm:gap-3">
                <Avatar className="h-7 w-7 sm:h-8 sm:w-8">
                  <AvatarImage src="/placeholder.svg" />
                  <AvatarFallback className="text-xs">TG</AvatarFallback>
                </Avatar>
                <div className="flex flex-col gap-1 flex-1 min-w-0">
                  <p className="font-medium text-xs sm:text-sm truncate">TechGear Pro</p>
                  <p className="text-[10px] sm:text-xs text-gray-400 truncate">Can we discuss the campaign details?</p>
                </div>
              </div>
            </DropdownMenuItem>
            <DropdownMenuItem className="text-gray-300 hover:bg-[#252b45] focus:bg-[#252b45]">
              <div className="flex items-center gap-2 sm:gap-3">
                <Avatar className="h-7 w-7 sm:h-8 sm:w-8">
                  <AvatarImage src="/placeholder.svg" />
                  <AvatarFallback className="text-xs">FH</AvatarFallback>
                </Avatar>
                <div className="flex flex-col gap-1 flex-1 min-w-0">
                  <p className="font-medium text-xs sm:text-sm truncate">Fashion Hub</p>
                  <p className="text-[10px] sm:text-xs text-gray-400 truncate">Great work on the last post!</p>
                </div>
              </div>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Profile */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-8 w-8 sm:h-10 sm:w-10 rounded-full p-0">
              <Avatar className="h-8 w-8 sm:h-10 sm:w-10 border-2 border-blue-500">
                <AvatarImage src={user?.avatar || "/placeholder.svg"} alt={user?.name} />
                <AvatarFallback className="text-xs sm:text-sm">{user?.name?.charAt(0).toUpperCase()}</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48 sm:w-56 bg-[#1a1f35] border-white/10">
            <DropdownMenuLabel className="text-white">
              <div className="flex flex-col space-y-1">
                <p className="text-xs sm:text-sm font-medium truncate">{user?.name}</p>
                <p className="text-[10px] sm:text-xs text-gray-400 truncate">{user?.email}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-white/10" />
            <DropdownMenuItem className="text-gray-300 hover:bg-[#252b45] focus:bg-[#252b45] text-xs sm:text-sm">
              <User className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem className="text-gray-300 hover:bg-[#252b45] focus:bg-[#252b45] text-xs sm:text-sm">
              <Settings className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-white/10" />
            <DropdownMenuItem
              className="text-red-400 hover:bg-[#252b45] focus:bg-[#252b45] text-xs sm:text-sm"
              onClick={handleLogout}
            >
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
