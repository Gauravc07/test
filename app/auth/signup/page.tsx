"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Checkbox } from "@/components/ui/checkbox"
import Link from "next/link"
import { Sparkles, Building2, Facebook, Instagram } from "lucide-react"

export default function SignupPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [name, setName] = useState("")
  const [companyName, setCompanyName] = useState("")
  const [role, setRole] = useState<"creator" | "brand">("creator")
  const [connectFacebook, setConnectFacebook] = useState(false)
  const [connectInstagram, setConnectInstagram] = useState(false)
  const { signup, isLoading } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (password !== confirmPassword) {
      alert("Passwords do not match!")
      return
    }

    await signup(email, password, name, role)
    router.push(role === "creator" ? "/dashboard/creator" : "/dashboard/brand")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-950 to-blue-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Join Shor</h1>
          <p className="text-gray-400">Create your account and start collaborating</p>
        </div>

        <div className="bg-black/30 backdrop-blur-xl border border-white/10 rounded-2xl p-8">
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
              <Label htmlFor="name" className="text-gray-300">
                Full Name
              </Label>
              <Input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe"
                required
                className="bg-white/5 border-white/10 text-white mt-1 focus:border-red-500"
              />
            </div>

            {role === "brand" && (
              <div>
                <Label htmlFor="companyName" className="text-gray-300">
                  Company/Brand Name
                </Label>
                <Input
                  id="companyName"
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="Your Company Name"
                  required
                  className="bg-white/5 border-white/10 text-white mt-1 focus:border-red-500"
                />
              </div>
            )}

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
                Create Password
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

            <div>
              <Label htmlFor="confirmPassword" className="text-gray-300">
                Confirm Password
              </Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="bg-white/5 border-white/10 text-white mt-1 focus:border-red-500"
              />
            </div>

            <div className="pt-2">
              <Label className="text-gray-300 mb-3 block">
                Link Accounts {role === "brand" && <span className="text-gray-500 text-sm">(Optional)</span>}
              </Label>
              <div className="space-y-3">
                <div className="flex items-center space-x-3 p-3 bg-white/5 rounded-lg border border-white/10 hover:border-red-500/50 transition-colors">
                  <Checkbox
                    id="facebook"
                    checked={connectFacebook}
                    onCheckedChange={(checked) => setConnectFacebook(checked as boolean)}
                    className="border-white/20 data-[state=checked]:bg-red-600 data-[state=checked]:border-red-600"
                  />
                  <Label htmlFor="facebook" className="flex items-center gap-2 text-gray-300 cursor-pointer flex-1">
                    <Facebook className="w-5 h-5 text-blue-500" />
                    Connect Facebook
                  </Label>
                </div>

                <div className="flex items-center space-x-3 p-3 bg-white/5 rounded-lg border border-white/10 hover:border-red-500/50 transition-colors">
                  <Checkbox
                    id="instagram"
                    checked={connectInstagram}
                    onCheckedChange={(checked) => setConnectInstagram(checked as boolean)}
                    className="border-white/20 data-[state=checked]:bg-red-600 data-[state=checked]:border-red-600"
                  />
                  <Label htmlFor="instagram" className="flex items-center gap-2 text-gray-300 cursor-pointer flex-1">
                    <Instagram className="w-5 h-5 text-pink-500" />
                    Connect Instagram
                  </Label>
                </div>
              </div>
            </div>

            <Button type="submit" disabled={isLoading} className="w-full bg-red-600 hover:bg-red-700 text-white mt-6">
              {isLoading ? "Creating account..." : "Create Account"}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-400 text-sm">
              Already have an account?{" "}
              <Link href="/auth/login" className="text-red-500 hover:text-red-400">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
