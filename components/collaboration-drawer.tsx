"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Textarea } from "@/components/ui/textarea"
import {
  Upload,
  FileText,
  CheckCircle2,
  Clock,
  DollarSign,
  Target,
  Send,
  Paperclip,
  Download,
  Sparkles,
} from "lucide-react"

interface CollaborationDrawerProps {
  collaboration: any
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CollaborationDrawer({ collaboration, open, onOpenChange }: CollaborationDrawerProps) {
  const [message, setMessage] = useState("")
  const [uploadProgress, setUploadProgress] = useState(0)

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Simulate upload progress
    let progress = 0
    const interval = setInterval(() => {
      progress += 10
      setUploadProgress(progress)
      if (progress >= 100) {
        clearInterval(interval)
        setTimeout(() => setUploadProgress(0), 1000)
      }
    }, 200)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-[#0f1629] border-white/10 text-white">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <img
                src={collaboration.brandLogo || "/placeholder.svg"}
                alt={collaboration.brand}
                className="w-12 h-12 rounded-lg"
              />
              <div>
                <DialogTitle className="text-xl text-white flex items-center gap-2">
                  {collaboration.brand}
                  {collaboration.verified && (
                    <Badge className="bg-blue-500/20 text-blue-400 text-xs">
                      <CheckCircle2 className="w-3 h-3 mr-1" />
                      Verified
                    </Badge>
                  )}
                </DialogTitle>
                <p className="text-sm text-gray-400">{collaboration.title}</p>
              </div>
            </div>
            <Badge
              className={`
              ${collaboration.paymentStatus === "paid" ? "bg-green-500/20 text-green-400" : ""}
              ${collaboration.paymentStatus === "partial" ? "bg-yellow-500/20 text-yellow-400" : ""}
              ${collaboration.paymentStatus === "pending" ? "bg-orange-500/20 text-orange-400" : ""}
              ${collaboration.paymentStatus === "disputed" ? "bg-red-500/20 text-red-400" : ""}
            `}
            >
              {collaboration.paymentStatus === "paid" && "🟢 Paid"}
              {collaboration.paymentStatus === "partial" && "🟠 Partial"}
              {collaboration.paymentStatus === "pending" && "🔴 Pending"}
              {collaboration.paymentStatus === "disputed" && "⚠️ Disputed"}
            </Badge>
          </div>
        </DialogHeader>

        <Tabs defaultValue="overview" className="mt-4">
          <TabsList className="bg-[#1a1f35] border-white/10 w-full justify-start">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="deliverables">Deliverables</TabsTrigger>
            <TabsTrigger value="messages">Messages</TabsTrigger>
            <TabsTrigger value="timeline">Timeline</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4 mt-4">
            {/* AI Summary */}
            <div className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/20 rounded-lg p-4">
              <div className="flex items-start gap-2">
                <Sparkles className="w-5 h-5 text-purple-400 mt-0.5" />
                <div>
                  <h4 className="text-sm font-semibold text-purple-400 mb-1">AI Summary</h4>
                  <p className="text-sm text-gray-300">
                    {collaboration.deliverables.filter((d: any) => !d.completed).length} deliverables pending. Next due
                    in {Math.ceil((new Date(collaboration.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24))}{" "}
                    days. Campaign is {collaboration.progress}% complete.
                  </p>
                </div>
              </div>
            </div>

            {/* Campaign Brief */}
            <div className="space-y-2">
              <h4 className="text-sm font-semibold text-white">Campaign Brief</h4>
              <p className="text-sm text-gray-300">{collaboration.description}</p>
            </div>

            {/* KPIs */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-[#1a1f35] rounded-lg p-4">
                <div className="flex items-center gap-2 text-gray-400 mb-1">
                  <Target className="w-4 h-4" />
                  <span className="text-xs">Target Impressions</span>
                </div>
                <p className="text-xl font-bold text-white">
                  {collaboration.kpis?.targetImpressions?.toLocaleString()}
                </p>
              </div>
              <div className="bg-[#1a1f35] rounded-lg p-4">
                <div className="flex items-center gap-2 text-gray-400 mb-1">
                  <Target className="w-4 h-4" />
                  <span className="text-xs">Engagement Target</span>
                </div>
                <p className="text-xl font-bold text-white">{collaboration.kpis?.engagementTarget}</p>
              </div>
            </div>

            {/* Progress */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">Overall Progress</span>
                <span className="text-white font-medium">{collaboration.progress}%</span>
              </div>
              <Progress value={collaboration.progress} className="h-2" />
            </div>

            {/* Payment Info */}
            <div className="bg-[#1a1f35] rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-400 mb-1">Total Payout</p>
                  <p className="text-2xl font-bold text-white">₹{collaboration.payout?.toLocaleString()}</p>
                </div>
                <DollarSign className="w-8 h-8 text-green-500" />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="deliverables" className="space-y-4 mt-4">
            {/* File Upload Zone */}
            <div className="border-2 border-dashed border-white/20 rounded-lg p-8 text-center hover:border-blue-500/50 transition-colors">
              <input
                type="file"
                id="file-upload"
                className="hidden"
                onChange={handleFileUpload}
                accept=".mp4,.mov,.jpg,.jpeg,.png"
              />
              <label htmlFor="file-upload" className="cursor-pointer">
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-sm text-white font-medium mb-1">Drop files here or click to upload</p>
                <p className="text-xs text-gray-400">Supported: MP4, MOV, JPG, PNG (Max 100MB)</p>
              </label>
              {uploadProgress > 0 && (
                <div className="mt-4">
                  <Progress value={uploadProgress} className="h-2" />
                  <p className="text-xs text-gray-400 mt-2">Uploading... {uploadProgress}%</p>
                </div>
              )}
            </div>

            {/* Deliverables List */}
            <div className="space-y-3">
              {collaboration.deliverables?.map((deliverable: string, index: number) => (
                <div key={index} className="bg-[#1a1f35] rounded-lg p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        index < collaboration.progress / 33 ? "bg-green-500/20" : "bg-gray-500/20"
                      }`}
                    >
                      {index < collaboration.progress / 33 ? (
                        <CheckCircle2 className="w-5 h-5 text-green-400" />
                      ) : (
                        <Clock className="w-5 h-5 text-gray-400" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">{deliverable}</p>
                      <p className="text-xs text-gray-400">
                        {index < collaboration.progress / 33 ? "Completed" : "Pending"}
                      </p>
                    </div>
                  </div>
                  {index >= collaboration.progress / 33 && (
                    <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                      <Upload className="w-4 h-4 mr-2" />
                      Upload
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="messages" className="mt-4">
            <div className="space-y-4">
              {/* Messages */}
              <div className="bg-[#1a1f35] rounded-lg p-4 space-y-4 max-h-96 overflow-y-auto">
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-xs font-bold">
                    B
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-gray-400 mb-1">Brand • 2 hours ago</p>
                    <div className="bg-[#0f1629] rounded-lg p-3">
                      <p className="text-sm text-white">
                        Hi! Looking forward to seeing your content. Let me know if you need any clarification on the
                        brief.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex gap-3 flex-row-reverse">
                  <div className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center text-xs font-bold">
                    Y
                  </div>
                  <div className="flex-1 text-right">
                    <p className="text-xs text-gray-400 mb-1">You • 1 hour ago</p>
                    <div className="bg-blue-600 rounded-lg p-3 inline-block">
                      <p className="text-sm text-white">Thanks! I'll have the first deliverable ready by tomorrow.</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Message Input */}
              <div className="flex gap-2">
                <Textarea
                  placeholder="Type your message..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="bg-[#1a1f35] border-white/10 text-white resize-none"
                  rows={3}
                />
                <div className="flex flex-col gap-2">
                  <Button size="icon" variant="outline" className="border-white/20 bg-transparent hover:bg-white/10">
                    <Paperclip className="w-4 h-4" />
                  </Button>
                  <Button size="icon" className="bg-blue-600 hover:bg-blue-700">
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="timeline" className="mt-4">
            <div className="space-y-4">
              {[
                { status: "completed", label: "Campaign Assigned", date: "2025-01-15", icon: CheckCircle2 },
                { status: "completed", label: "Contract Signed", date: "2025-01-16", icon: FileText },
                { status: "completed", label: "First Deliverable Submitted", date: "2025-01-20", icon: Upload },
                { status: "current", label: "In Progress", date: "Now", icon: Clock },
                { status: "pending", label: "Final Approval", date: "Pending", icon: CheckCircle2 },
                { status: "pending", label: "Payment Released", date: "Pending", icon: DollarSign },
              ].map((item, index) => (
                <div key={index} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        item.status === "completed"
                          ? "bg-green-500/20"
                          : item.status === "current"
                            ? "bg-blue-500/20"
                            : "bg-gray-500/20"
                      }`}
                    >
                      <item.icon
                        className={`w-5 h-5 ${
                          item.status === "completed"
                            ? "text-green-400"
                            : item.status === "current"
                              ? "text-blue-400"
                              : "text-gray-400"
                        }`}
                      />
                    </div>
                    {index < 5 && (
                      <div
                        className={`w-0.5 h-12 ${item.status === "completed" ? "bg-green-500/20" : "bg-gray-500/20"}`}
                      />
                    )}
                  </div>
                  <div className="flex-1 pb-8">
                    <p className="text-sm font-medium text-white">{item.label}</p>
                    <p className="text-xs text-gray-400">{item.date}</p>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-4 border-t border-white/10">
          <Button className="flex-1 bg-blue-600 hover:bg-blue-700">
            <FileText className="w-4 h-4 mr-2" />
            Submit Invoice
          </Button>
          <Button variant="outline" className="flex-1 border-white/20 bg-transparent hover:bg-white/10">
            <Download className="w-4 h-4 mr-2" />
            View Contract
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
