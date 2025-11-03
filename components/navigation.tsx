"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ChevronDown, Menu } from "lucide-react"
import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import Image from "next/image"

export function Navigation() {
  const [theme, setTheme] = useState<"light" | "dark">("dark")
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [allPagesOpen, setAllPagesOpen] = useState(false)
  const { user, logout } = useAuth()

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark")
    document.documentElement.classList.toggle("light")
  }

  const handleLinkClick = () => {
    setMobileMenuOpen(false)
  }

  return (
    <>
      {/* Desktop Navigation */}
      <nav className="fixed top-4 left-1/2 -translate-x-1/2 z-50 transition-all duration-300 hidden lg:block w-3/4 max-w-6xl">
        <div className="flex items-center justify-between gap-8 px-6 py-2.5 rounded-full bg-black/30 backdrop-blur-md border border-white/10 shadow-lg hover:shadow-xl transition-shadow">
          {/* Logo on the left */}
          <Link href="/" className="flex items-center hover:opacity-90 transition-opacity flex-shrink-0">
            <Image
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/shor_no_bg-rRbh8YC5Cnk5bnRC6q9GxeNV4P1nFZ.png"
              alt="Shor"
              width={140}
              height={60}
              className="h-10 w-auto"
              priority
            />
          </Link>

          {/* Navigation items centered - Removed "How It Works" and adjusted spacing */}
          <div className="flex items-center gap-8 xl:gap-10">
            <DropdownMenu open={allPagesOpen} onOpenChange={setAllPagesOpen}>
              <DropdownMenuTrigger asChild>
                <button className="text-sm xl:text-base font-medium text-white/80 hover:text-white transition-colors whitespace-nowrap flex items-center gap-1.5">
                  All Pages
                  <ChevronDown className="h-3.5 w-3.5" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-[800px] bg-black/95 backdrop-blur-xl border-white/10 p-8">
                <div className="grid grid-cols-4 gap-8">
                  {/* LANDING Column */}
                  <div>
                    <h3 className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-4">LANDING</h3>
                    <div className="space-y-3">
                      <Link
                        href="/"
                        className="block text-white/90 hover:text-white transition-colors text-sm font-medium"
                        onClick={() => setAllPagesOpen(false)}
                      >
                        Home
                      </Link>
                      <p className="text-white/40 text-xs">Where creators meet brands</p>
                      <Link
                        href="/#features"
                        className="block text-white/90 hover:text-white transition-colors text-sm font-medium mt-4"
                        onClick={() => setAllPagesOpen(false)}
                      >
                        Features
                      </Link>
                      <p className="text-white/40 text-xs">Discover our tools</p>
                    </div>
                  </div>

                  {/* ESSENTIALS Column - Removed "How It Works" link */}
                  <div>
                    <h3 className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-4">ESSENTIALS</h3>
                    <div className="space-y-3">
                      <Link
                        href="/about"
                        className="block text-white/90 hover:text-white transition-colors text-sm font-medium"
                        onClick={() => setAllPagesOpen(false)}
                      >
                        About
                      </Link>
                      <Link
                        href="/integrations"
                        className="block text-white/90 hover:text-white transition-colors text-sm font-medium"
                        onClick={() => setAllPagesOpen(false)}
                      >
                        Integrations Details
                      </Link>
                      <Link
                        href="/terms"
                        className="block text-white/90 hover:text-white transition-colors text-sm font-medium"
                        onClick={() => setAllPagesOpen(false)}
                      >
                        Terms
                      </Link>
                    </div>
                  </div>

                  {/* Third Column */}
                  <div>
                    <div className="space-y-3 mt-8">
                      <Link
                        href="/pricing"
                        className="block text-white/90 hover:text-white transition-colors text-sm font-medium"
                        onClick={() => setAllPagesOpen(false)}
                      >
                        Pricing
                      </Link>
                      <Link
                        href="/instagram/connect"
                        className="block text-white/90 hover:text-white transition-colors text-sm font-medium"
                        onClick={() => setAllPagesOpen(false)}
                      >
                        Connect Instagram
                      </Link>
                      <Link
                        href="/changelog"
                        className="block text-white/90 hover:text-white transition-colors text-sm font-medium"
                        onClick={() => setAllPagesOpen(false)}
                      >
                        Changelog
                      </Link>
                      <Link
                        href="/privacy"
                        className="block text-white/90 hover:text-white transition-colors text-sm font-medium"
                        onClick={() => setAllPagesOpen(false)}
                      >
                        Privacy
                      </Link>
                    </div>
                  </div>

                  {/* Fourth Column */}
                  <div>
                    <div className="space-y-3 mt-8">
                      <Link
                        href="/integrations"
                        className="block text-white/90 hover:text-white transition-colors text-sm font-medium"
                        onClick={() => setAllPagesOpen(false)}
                      >
                        Integrations
                      </Link>
                      <Link
                        href="/blog"
                        className="block text-white/90 hover:text-white transition-colors text-sm font-medium"
                        onClick={() => setAllPagesOpen(false)}
                      >
                        Blog
                      </Link>
                      <Link
                        href="/contact"
                        className="block text-white/90 hover:text-white transition-colors text-sm font-medium"
                        onClick={() => setAllPagesOpen(false)}
                      >
                        Contact
                      </Link>
                      <Link
                        href="/404"
                        className="block text-white/90 hover:text-white transition-colors text-sm font-medium"
                        onClick={() => setAllPagesOpen(false)}
                      >
                        404
                      </Link>
                    </div>
                  </div>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>

            <Link
              href="/integrations"
              className="text-sm xl:text-base font-medium text-white/80 hover:text-white transition-colors whitespace-nowrap"
            >
              Integrations
            </Link>
            <Link
              href="/pricing"
              className="text-sm xl:text-base font-medium text-white/80 hover:text-white transition-colors whitespace-nowrap"
            >
              Pricing
            </Link>
            <Link
              href="/contact"
              className="text-sm xl:text-base font-medium text-white/80 hover:text-white transition-colors whitespace-nowrap"
            >
              Contact Us
            </Link>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-sm xl:text-base font-medium text-black bg-white hover:bg-white/90 border-white gap-2 h-9 px-4 rounded-full"
                >
                  Get Started
                  <ChevronDown className="h-3.5 w-3.5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40 bg-black/90 backdrop-blur-xl border-white/10">
                <DropdownMenuItem asChild>
                  <Link href="/auth/login" className="text-white/90 hover:text-white cursor-pointer">
                    Login
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/auth/signup" className="text-white/90 hover:text-white cursor-pointer">
                    Sign Up
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </nav>

      {/* Mobile/Tablet Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 lg:hidden bg-black/30 backdrop-blur-md border-b border-white/10">
        <div className="flex items-center justify-between px-4 sm:px-6 py-3">
          {/* Logo */}
          <Link href="/" className="flex items-center hover:opacity-90 transition-opacity">
            <Image
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/shor_no_bg-rRbh8YC5Cnk5bnRC6q9GxeNV4P1nFZ.png"
              alt="Shor"
              width={120}
              height={50}
              className="h-9 w-auto"
              priority
            />
          </Link>

          {/* Mobile Menu Dropdown - Added all pages to mobile menu dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="text-white/90 hover:text-white hover:bg-white/10">
                <Menu className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-56 bg-black/95 backdrop-blur-xl border-white/20 max-h-[80vh] overflow-y-auto"
            >
              <DropdownMenuLabel className="text-white/60 text-xs uppercase tracking-wider">Landing</DropdownMenuLabel>
              <DropdownMenuItem asChild>
                <Link href="/" className="text-white/90 hover:text-white cursor-pointer text-base py-3">
                  Home
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/#features" className="text-white/90 hover:text-white cursor-pointer text-base py-3">
                  Features
                </Link>
              </DropdownMenuItem>

              <DropdownMenuSeparator className="bg-white/10" />

              <DropdownMenuLabel className="text-white/60 text-xs uppercase tracking-wider">
                Essentials
              </DropdownMenuLabel>
              <DropdownMenuItem asChild>
                <Link href="/about" className="text-white/90 hover:text-white cursor-pointer text-base py-3">
                  About
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/integrations" className="text-white/90 hover:text-white cursor-pointer text-base py-3">
                  Integrations
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/pricing" className="text-white/90 hover:text-white cursor-pointer text-base py-3">
                  Pricing
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/contact" className="text-white/90 hover:text-white cursor-pointer text-base py-3">
                  Contact Us
                </Link>
              </DropdownMenuItem>

              <DropdownMenuSeparator className="bg-white/10" />

              <DropdownMenuLabel className="text-white/60 text-xs uppercase tracking-wider">
                Resources
              </DropdownMenuLabel>
              <DropdownMenuItem asChild>
                <Link href="/blog" className="text-white/90 hover:text-white cursor-pointer text-base py-3">
                  Blog
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/changelog" className="text-white/90 hover:text-white cursor-pointer text-base py-3">
                  Changelog
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link
                  href="/instagram/connect"
                  className="text-white/90 hover:text-white cursor-pointer text-base py-3"
                >
                  Connect Instagram
                </Link>
              </DropdownMenuItem>

              <DropdownMenuSeparator className="bg-white/10" />

              <DropdownMenuLabel className="text-white/60 text-xs uppercase tracking-wider">Legal</DropdownMenuLabel>
              <DropdownMenuItem asChild>
                <Link href="/terms" className="text-white/90 hover:text-white cursor-pointer text-base py-3">
                  Terms
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/privacy" className="text-white/90 hover:text-white cursor-pointer text-base py-3">
                  Privacy
                </Link>
              </DropdownMenuItem>

              <DropdownMenuSeparator className="bg-white/10" />

              <DropdownMenuLabel className="text-white/60 text-xs uppercase tracking-wider">Account</DropdownMenuLabel>
              <DropdownMenuItem asChild>
                <Link href="/auth/login" className="text-white/90 hover:text-white cursor-pointer text-base py-3">
                  Login
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/auth/signup" className="text-white/90 hover:text-white cursor-pointer text-base py-3">
                  Sign Up
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </nav>
    </>
  )
}
