"use client"

import { useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Navigation } from "@/components/navigation"
import { Copy, Check, Gift, Trophy, Star, Award, Target, TrendingUp, Users, Zap } from "lucide-react"

export default function RewardsPage() {
  const { user } = useAuth()
  const [copied, setCopied] = useState(false)

  const referralCode = `SHOR${user?.name?.toUpperCase().slice(0, 4) || "USER"}2025`

  const handleCopyCode = () => {
    navigator.clipboard.writeText(referralCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const referralStats = {
    totalReferrals: 7,
    activeReferrals: 5,
    freeMonthsEarned: 2,
    nextReward: 1,
  }

  const levels = [
    {
      name: "Rising Star",
      minCampaigns: 0,
      maxCampaigns: 5,
      color: "bg-gray-500",
      benefits: ["Basic profile visibility", "Apply to campaigns", "Standard support"],
      icon: Star,
    },
    {
      name: "Verified Creator",
      minCampaigns: 5,
      maxCampaigns: 15,
      color: "bg-blue-500",
      benefits: ["Verified badge", "Priority in search", "Early campaign access", "Advanced analytics"],
      icon: Award,
    },
    {
      name: "Elite Creator",
      minCampaigns: 15,
      maxCampaigns: Number.POSITIVE_INFINITY,
      color: "bg-purple-500",
      benefits: ["Elite badge", "Top search placement", "Exclusive campaigns", "Premium support", "Featured profile"],
      icon: Trophy,
    },
  ]

  const currentLevel = levels[1]
  const completedCampaigns = 8
  const progressToNextLevel =
    ((completedCampaigns - currentLevel.minCampaigns) / (currentLevel.maxCampaigns - currentLevel.minCampaigns)) * 100

  const achievements = [
    {
      id: 1,
      title: "First Campaign",
      description: "Complete your first campaign",
      icon: Target,
      unlocked: true,
      date: "Jan 15, 2025",
    },
    {
      id: 2,
      title: "5-Star Rating",
      description: "Maintain a 5-star rating",
      icon: Star,
      unlocked: true,
      date: "Jan 20, 2025",
    },
    {
      id: 3,
      title: "Social Butterfly",
      description: "Connect 3 social accounts",
      icon: Users,
      unlocked: true,
      date: "Jan 10, 2025",
    },
    {
      id: 4,
      title: "Speed Demon",
      description: "Complete a campaign in under 7 days",
      icon: Zap,
      unlocked: false,
      date: null,
    },
    {
      id: 5,
      title: "Trending Creator",
      description: "Reach 100K total impressions",
      icon: TrendingUp,
      unlocked: false,
      date: null,
    },
  ]

  const referrals = [
    { name: "Priya S.", status: "active", date: "Jan 25, 2025", reward: "1 month free" },
    { name: "Rahul V.", status: "active", date: "Jan 20, 2025", reward: "1 month free" },
    { name: "Ananya P.", status: "active", date: "Jan 18, 2025", reward: "Pending" },
    { name: "Vikram S.", status: "pending", date: "Jan 15, 2025", reward: "Pending" },
    { name: "Neha K.", status: "active", date: "Jan 12, 2025", reward: "Pending" },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0e1a] via-[#0f1629] to-[#0a0e1a]">
      <Navigation />
      <div className="container mx-auto px-4 py-8 pt-24">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Rewards & Gamification</h1>
          <p className="text-gray-400">Earn rewards, unlock achievements, and level up your creator status</p>
        </div>

        {/* Referral Program */}
        <Card className="bg-gradient-to-br from-blue-600/20 to-purple-600/20 border-blue-500/30 p-8 mb-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-12 w-12 rounded-full bg-blue-600 flex items-center justify-center">
              <Gift className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Referral Program</h2>
              <p className="text-gray-300">Refer 3 friends, get 1 month free (max 3 months)</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="bg-[#0f1629]/50 rounded-lg p-6">
              <h3 className="text-lg font-bold text-white mb-4">Your Referral Code</h3>
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-[#1a1f35] rounded-lg p-4 font-mono text-xl text-white text-center">
                  {referralCode}
                </div>
                <Button onClick={handleCopyCode} className="bg-blue-600 hover:bg-blue-700">
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-[#0f1629]/50 rounded-lg p-4 text-center">
                <p className="text-gray-400 text-sm mb-1">Total Referrals</p>
                <p className="text-3xl font-bold text-white">{referralStats.totalReferrals}</p>
              </div>
              <div className="bg-[#0f1629]/50 rounded-lg p-4 text-center">
                <p className="text-gray-400 text-sm mb-1">Active</p>
                <p className="text-3xl font-bold text-green-500">{referralStats.activeReferrals}</p>
              </div>
              <div className="bg-[#0f1629]/50 rounded-lg p-4 text-center">
                <p className="text-gray-400 text-sm mb-1">Free Months</p>
                <p className="text-3xl font-bold text-purple-500">{referralStats.freeMonthsEarned}</p>
              </div>
              <div className="bg-[#0f1629]/50 rounded-lg p-4 text-center">
                <p className="text-gray-400 text-sm mb-1">Next Reward</p>
                <p className="text-3xl font-bold text-blue-500">{referralStats.nextReward}</p>
              </div>
            </div>
          </div>

          <div className="bg-[#0f1629]/50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-400">Progress to next free month</span>
              <span className="text-sm font-medium text-white">{referralStats.activeReferrals % 3}/3 referrals</span>
            </div>
            <Progress value={((referralStats.activeReferrals % 3) / 3) * 100} className="h-2" />
          </div>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Creator Levels */}
          <Card className="bg-[#0f1629]/50 border-white/10 p-6">
            <div className="flex items-center gap-3 mb-6">
              <Trophy className="w-6 h-6 text-yellow-500" />
              <h2 className="text-2xl font-bold text-white">Creator Levels</h2>
            </div>

            <div className="space-y-6">
              {levels.map((level, index) => {
                const isCurrentLevel = level.name === currentLevel.name
                const isPastLevel = index < levels.findIndex((l) => l.name === currentLevel.name)

                return (
                  <div
                    key={level.name}
                    className={`p-4 rounded-lg border-2 ${
                      isCurrentLevel
                        ? "border-blue-500 bg-blue-500/10"
                        : isPastLevel
                          ? "border-green-500/30 bg-green-500/5"
                          : "border-white/10 bg-[#1a1f35]"
                    }`}
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className={`h-10 w-10 rounded-full ${level.color} flex items-center justify-center`}>
                        <level.icon className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-white">{level.name}</h3>
                        <p className="text-sm text-gray-400">
                          {level.maxCampaigns === Number.POSITIVE_INFINITY
                            ? `${level.minCampaigns}+ campaigns`
                            : `${level.minCampaigns}-${level.maxCampaigns} campaigns`}
                        </p>
                      </div>
                      {isCurrentLevel && <Badge className="bg-blue-600 text-white">Current</Badge>}
                      {isPastLevel && (
                        <Badge className="bg-green-600 text-white">
                          <Check className="w-3 h-3 mr-1" />
                          Unlocked
                        </Badge>
                      )}
                    </div>
                    <ul className="space-y-1">
                      {level.benefits.map((benefit) => (
                        <li key={benefit} className="text-sm text-gray-400 flex items-center gap-2">
                          <Check className="w-3 h-3 text-green-500" />
                          {benefit}
                        </li>
                      ))}
                    </ul>
                  </div>
                )
              })}
            </div>

            {currentLevel.maxCampaigns !== Number.POSITIVE_INFINITY && (
              <div className="mt-6 p-4 bg-[#1a1f35] rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-400">Progress to Elite Creator</span>
                  <span className="text-sm font-medium text-white">
                    {completedCampaigns}/{currentLevel.maxCampaigns} campaigns
                  </span>
                </div>
                <Progress value={progressToNextLevel} className="h-2" />
              </div>
            )}
          </Card>

          {/* Achievements */}
          <Card className="bg-[#0f1629]/50 border-white/10 p-6">
            <div className="flex items-center gap-3 mb-6">
              <Award className="w-6 h-6 text-purple-500" />
              <h2 className="text-2xl font-bold text-white">Achievements</h2>
            </div>

            <div className="space-y-4">
              {achievements.map((achievement) => (
                <div
                  key={achievement.id}
                  className={`p-4 rounded-lg ${
                    achievement.unlocked ? "bg-[#1a1f35] border border-green-500/30" : "bg-[#1a1f35]/50 opacity-60"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`h-12 w-12 rounded-full flex items-center justify-center ${
                        achievement.unlocked ? "bg-green-500/20" : "bg-gray-500/20"
                      }`}
                    >
                      <achievement.icon
                        className={`w-6 h-6 ${achievement.unlocked ? "text-green-500" : "text-gray-500"}`}
                      />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-white">{achievement.title}</h4>
                      <p className="text-sm text-gray-400">{achievement.description}</p>
                      {achievement.unlocked && achievement.date && (
                        <p className="text-xs text-green-500 mt-1">Unlocked on {achievement.date}</p>
                      )}
                    </div>
                    {achievement.unlocked && (
                      <Badge className="bg-green-600 text-white">
                        <Check className="w-3 h-3 mr-1" />
                        Unlocked
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Referral History */}
        <Card className="bg-[#0f1629]/50 border-white/10 p-6">
          <h2 className="text-2xl font-bold text-white mb-6">Referral History</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Name</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Status</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Date</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Reward</th>
                </tr>
              </thead>
              <tbody>
                {referrals.map((referral, index) => (
                  <tr key={index} className="border-b border-white/5">
                    <td className="py-3 px-4 text-white">{referral.name}</td>
                    <td className="py-3 px-4">
                      <Badge
                        className={
                          referral.status === "active"
                            ? "bg-green-500/20 text-green-500"
                            : "bg-yellow-500/20 text-yellow-500"
                        }
                      >
                        {referral.status}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-gray-400">{referral.date}</td>
                    <td className="py-3 px-4 text-white">{referral.reward}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  )
}
