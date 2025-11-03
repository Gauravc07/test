"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Instagram, CheckCircle2, AlertCircle, Loader2 } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function ConnectInstagramPage() {
  const [isConnecting, setIsConnecting] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState<"idle" | "success" | "error">("idle")
  const [errorMessage, setErrorMessage] = useState("")
  const [connectedAccount, setConnectedAccount] = useState<{
    username: string
    followers: number
    accountType: string
  } | null>(null)

  const handleConnect = async () => {
    setIsConnecting(true)
    setConnectionStatus("idle")
    setErrorMessage("")

    try {
      // Step 1: Redirect to Instagram OAuth
      const clientId = process.env.NEXT_PUBLIC_INSTAGRAM_CLIENT_ID || "YOUR_CLIENT_ID"
      const redirectUri = `${window.location.origin}/instagram/callback`
      const scope = "instagram_basic,instagram_manage_insights,pages_show_list,pages_read_engagement"

      const authUrl = `https://www.facebook.com/v18.0/dialog/oauth?client_id=${clientId}&redirect_uri=${encodeURIComponent(
        redirectUri,
      )}&scope=${scope}&response_type=code`

      // In a real implementation, this would redirect to Instagram
      // For demo purposes, we'll simulate a successful connection
      await new Promise((resolve) => setTimeout(resolve, 2000))

      setConnectedAccount({
        username: "@demo_creator",
        followers: 125000,
        accountType: "Creator Account",
      })
      setConnectionStatus("success")
    } catch (error) {
      setConnectionStatus("error")
      setErrorMessage("Failed to connect Instagram account. Please try again.")
    } finally {
      setIsConnecting(false)
    }
  }

  const handleDisconnect = () => {
    setConnectedAccount(null)
    setConnectionStatus("idle")
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-black pt-24 pb-16 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Connect Your Instagram</h1>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto">
            Link your Instagram Business or Creator account to access analytics, insights, and collaboration
            opportunities.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <Card className="bg-gray-900/50 border-gray-800">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
                What You Get
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-gray-300">
              <div className="flex items-start gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-red-500 mt-2" />
                <p>Access to detailed audience demographics and insights</p>
              </div>
              <div className="flex items-start gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-red-500 mt-2" />
                <p>Real-time engagement metrics and performance data</p>
              </div>
              <div className="flex items-start gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-red-500 mt-2" />
                <p>Automatic profile updates and follower tracking</p>
              </div>
              <div className="flex items-start gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-red-500 mt-2" />
                <p>Enhanced visibility to brands looking for creators</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900/50 border-gray-800">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-blue-500" />
                Requirements
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-gray-300">
              <div className="flex items-start gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-red-500 mt-2" />
                <p>Instagram Business or Creator account</p>
              </div>
              <div className="flex items-start gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-red-500 mt-2" />
                <p>Facebook Page linked to your Instagram account</p>
              </div>
              <div className="flex items-start gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-red-500 mt-2" />
                <p>Admin access to the connected Facebook Page</p>
              </div>
              <div className="flex items-start gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-red-500 mt-2" />
                <p>Active Instagram account with public profile</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-gray-900/50 border-gray-800">
          <CardHeader>
            <CardTitle className="text-white">Connection Status</CardTitle>
            <CardDescription>Manage your Instagram account connection</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {connectionStatus === "success" && connectedAccount && (
              <Alert className="bg-green-500/10 border-green-500/50">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <AlertDescription className="text-green-400">
                  Successfully connected to {connectedAccount.username}
                </AlertDescription>
              </Alert>
            )}

            {connectionStatus === "error" && (
              <Alert className="bg-red-500/10 border-red-500/50">
                <AlertCircle className="h-4 w-4 text-red-500" />
                <AlertDescription className="text-red-400">{errorMessage}</AlertDescription>
              </Alert>
            )}

            {connectedAccount ? (
              <div className="space-y-4">
                <div className="flex items-center gap-4 p-4 bg-gray-800/50 rounded-lg border border-gray-700">
                  <div className="h-16 w-16 rounded-full bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 flex items-center justify-center">
                    <Instagram className="h-8 w-8 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-white">{connectedAccount.username}</h3>
                    <p className="text-sm text-gray-400">{connectedAccount.accountType}</p>
                    <p className="text-sm text-gray-400">{connectedAccount.followers.toLocaleString()} followers</p>
                  </div>
                  <Button
                    variant="outline"
                    onClick={handleDisconnect}
                    className="border-red-500 text-red-500 hover:bg-red-500/10 bg-transparent"
                  >
                    Disconnect
                  </Button>
                </div>

                <div className="p-4 bg-blue-500/10 border border-blue-500/50 rounded-lg">
                  <p className="text-sm text-blue-400">
                    Your Instagram account is connected and syncing. We'll automatically update your profile data every
                    24 hours.
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="h-20 w-20 rounded-full bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 flex items-center justify-center mx-auto mb-6">
                  <Instagram className="h-10 w-10 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">No Account Connected</h3>
                <p className="text-gray-400 mb-6 max-w-md mx-auto">
                  Connect your Instagram Business or Creator account to unlock powerful analytics and collaboration
                  features.
                </p>
                <Button
                  onClick={handleConnect}
                  disabled={isConnecting}
                  size="lg"
                  className="bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 hover:opacity-90 text-white"
                >
                  {isConnecting ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Connecting...
                    </>
                  ) : (
                    <>
                      <Instagram className="mr-2 h-5 w-5" />
                      Connect Instagram Account
                    </>
                  )}
                </Button>
              </div>
            )}

            <div className="pt-6 border-t border-gray-800">
              <h4 className="text-sm font-semibold text-white mb-3">How It Works</h4>
              <ol className="space-y-3 text-sm text-gray-400">
                <li className="flex gap-3">
                  <span className="flex-shrink-0 h-6 w-6 rounded-full bg-red-500/20 text-red-500 flex items-center justify-center text-xs font-semibold">
                    1
                  </span>
                  <span>Click "Connect Instagram Account" to start the OAuth flow</span>
                </li>
                <li className="flex gap-3">
                  <span className="flex-shrink-0 h-6 w-6 rounded-full bg-red-500/20 text-red-500 flex items-center justify-center text-xs font-semibold">
                    2
                  </span>
                  <span>Log in to Facebook and select your Instagram Business/Creator account</span>
                </li>
                <li className="flex gap-3">
                  <span className="flex-shrink-0 h-6 w-6 rounded-full bg-red-500/20 text-red-500 flex items-center justify-center text-xs font-semibold">
                    3
                  </span>
                  <span>Grant permissions to access your profile data and insights</span>
                </li>
                <li className="flex gap-3">
                  <span className="flex-shrink-0 h-6 w-6 rounded-full bg-red-500/20 text-red-500 flex items-center justify-center text-xs font-semibold">
                    4
                  </span>
                  <span>Your account will be connected and data will sync automatically</span>
                </li>
              </ol>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
