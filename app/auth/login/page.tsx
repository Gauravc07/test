"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Link from "next/link"
import { Sparkles, Building2 } from "lucide-react"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [role, setRole] = useState<"creator" | "brand">("creator")
  const { login, isLoading } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await login(email, password, role)
    router.push(role === "creator" ? "/dashboard/creator" : "/dashboard/brand")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-950 to-blue-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Welcome Back</h1>
          <p className="text-gray-400">Sign in to continue to Shor</p>
        </div>

        <div className="bg-[#0f1629]/50 backdrop-blur-xl border border-white/10 rounded-2xl p-8">
          <Tabs value={role} onValueChange={(v) => setRole(v as "creator" | "brand")} className="mb-6">
            <TabsList className="grid w-full grid-cols-2 bg-white/5">
              <TabsTrigger value="creator" className="data-[state=active]:bg-red-600">
                <Sparkles className="w-4 h-4 mr-2" />
                Creator
              </TabsTrigger>
              <TabsTrigger value="brand" className="data-[state=active]:bg-red-600">
                <Building2 className="w-4 h-4 mr-2" />
                Brand
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="email" className="text-gray-300">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="bg-white/5 border-white/10 text-white mt-1 focus:border-red-500"
              />
            </div>

            <div>
              <Label htmlFor="password" className="text-gray-300">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="bg-white/5 border-white/10 text-white mt-1 focus:border-red-500"
              />
            </div>

            <Button type="submit" disabled={isLoading} className="w-full bg-red-600 hover:bg-red-700 text-white">
              {isLoading ? "Signing in..." : "Sign In"}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-400 text-sm">
              Don't have an account?{" "}
              <Link href="/auth/signup" className="text-red-500 hover:text-red-400">
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
