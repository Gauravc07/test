"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Gift, Users, Copy, Check } from "lucide-react"

export function ReferralSection() {
  const [copied, setCopied] = useState(false)
  const referralCode = "SHOR2025"

  const handleCopy = () => {
    navigator.clipboard.writeText(referralCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <section className="py-24 px-4 bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full mb-6">
            <Gift className="w-4 h-4" />
            <span className="text-sm font-semibold">Referral Rewards Program</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-balance">Share Shor, Earn Free Months</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto text-balance">
            Refer 3 users and get 1 month free. Stack up to 3 free months!
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {/* Step 1 */}
          <div className="bg-card border border-border rounded-2xl p-8 text-center">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-xl font-bold mb-2">Share Your Link</h3>
            <p className="text-muted-foreground">
              Share your unique referral code with friends, followers, and fellow creators
            </p>
          </div>

          {/* Step 2 */}
          <div className="bg-card border border-border rounded-2xl p-8 text-center">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Gift className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-xl font-bold mb-2">They Sign Up</h3>
            <p className="text-muted-foreground">When 3 people sign up using your code, you unlock 1 free month</p>
          </div>

          {/* Step 3 */}
          <div className="bg-card border border-border rounded-2xl p-8 text-center">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-xl font-bold mb-2">Enjoy Free Access</h3>
            <p className="text-muted-foreground">Stack up to 3 free months by continuing to refer more users</p>
          </div>
        </div>

        {/* Referral Code Card */}
        <div className="max-w-2xl mx-auto bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 rounded-2xl p-8">
          <div className="text-center mb-6">
            <h3 className="text-2xl font-bold mb-2">Your Referral Code</h3>
            <p className="text-muted-foreground">Share this code to start earning free months</p>
          </div>

          <div className="flex items-center gap-4 bg-background/80 backdrop-blur-sm rounded-xl p-4 mb-6">
            <code className="flex-1 text-2xl font-mono font-bold text-center tracking-wider">{referralCode}</code>
            <Button onClick={handleCopy} variant="outline" size="lg" className="gap-2 bg-transparent">
              {copied ? (
                <>
                  <Check className="w-4 h-4" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  Copy
                </>
              )}
            </Button>
          </div>

          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="bg-background/60 rounded-lg p-4">
              <div className="text-3xl font-bold text-primary mb-1">0</div>
              <div className="text-sm text-muted-foreground">Referrals</div>
            </div>
            <div className="bg-background/60 rounded-lg p-4">
              <div className="text-3xl font-bold text-primary mb-1">0</div>
              <div className="text-sm text-muted-foreground">Free Months</div>
            </div>
            <div className="bg-background/60 rounded-lg p-4">
              <div className="text-3xl font-bold text-primary mb-1">3</div>
              <div className="text-sm text-muted-foreground">Max Months</div>
            </div>
          </div>
        </div>

        {/* Terms */}
        <div className="mt-8 text-center">
          <p className="text-sm text-muted-foreground">
            Terms: Refer 3 users = 1 free month. Maximum 3 free months can be earned. Referrals must be active paid
            subscribers.
          </p>
        </div>
      </div>
    </section>
  )
}
