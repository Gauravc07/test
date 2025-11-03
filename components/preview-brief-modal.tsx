"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Calendar, Target, FileText, Shield, TrendingUp, Users } from "lucide-react"
import Image from "next/image"

interface PreviewBriefModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  brand: {
    name: string
    logo: string
    campaign: string
    brief: string
    objectives: string[]
    deliverables: { type: string; count: number }[]
    timeline: string
    terms: string[]
    stats: { followers: string; engagement: string; avgReach: string }
  }
  onApply: () => void
}

export function PreviewBriefModal({ open, onOpenChange, brand, onApply }: PreviewBriefModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#0f1629] border-white/10 text-white max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-4 mb-4">
            <div className="h-16 w-16 rounded-lg bg-white/10 flex items-center justify-center overflow-hidden">
              <Image
                src={brand.logo || "/placeholder.svg"}
                alt={brand.name}
                width={64}
                height={64}
                className="object-cover"
              />
            </div>
            <div>
              <DialogTitle className="text-2xl font-bold">{brand.name}</DialogTitle>
              <p className="text-sm text-gray-400">{brand.campaign}</p>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-400" />
              Campaign Brief
            </h3>
            <p className="text-gray-300 text-sm leading-relaxed">{brand.brief}</p>
          </div>

          <Separator className="bg-white/10" />

          <div>
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <Target className="w-5 h-5 text-purple-400" />
              Campaign Objectives
            </h3>
            <ul className="space-y-2">
              {brand.objectives.map((objective, index) => (
                <li key={index} className="flex items-start gap-2 text-sm text-gray-300">
                  <span className="text-blue-400 mt-1">•</span>
                  <span>{objective}</span>
                </li>
              ))}
            </ul>
          </div>

          <Separator className="bg-white/10" />

          <div>
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <FileText className="w-5 h-5 text-green-400" />
              Deliverables
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {brand.deliverables.map((deliverable, index) => (
                <div key={index} className="bg-[#1a1f35] rounded-lg p-3">
                  <p className="text-sm font-medium text-white">{deliverable.type}</p>
                  <p className="text-xs text-gray-400">{deliverable.count} required</p>
                </div>
              ))}
            </div>
          </div>

          <Separator className="bg-white/10" />

          <div>
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-orange-400" />
              Timeline
            </h3>
            <p className="text-sm text-gray-300">{brand.timeline}</p>
          </div>

          <Separator className="bg-white/10" />

          <div>
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <Shield className="w-5 h-5 text-red-400" />
              Terms & Conditions
            </h3>
            <ul className="space-y-2">
              {brand.terms.map((term, index) => (
                <li key={index} className="flex items-start gap-2 text-sm text-gray-300">
                  <span className="text-blue-400 mt-1">•</span>
                  <span>{term}</span>
                </li>
              ))}
            </ul>
          </div>

          <Separator className="bg-white/10" />

          <div>
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-yellow-400" />
              Brand Performance
            </h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-[#1a1f35] rounded-lg p-3 text-center">
                <Users className="w-5 h-5 text-blue-400 mx-auto mb-1" />
                <p className="text-lg font-bold text-white">{brand.stats.followers}</p>
                <p className="text-xs text-gray-400">Followers</p>
              </div>
              <div className="bg-[#1a1f35] rounded-lg p-3 text-center">
                <TrendingUp className="w-5 h-5 text-green-400 mx-auto mb-1" />
                <p className="text-lg font-bold text-white">{brand.stats.engagement}</p>
                <p className="text-xs text-gray-400">Engagement</p>
              </div>
              <div className="bg-[#1a1f35] rounded-lg p-3 text-center">
                <Target className="w-5 h-5 text-purple-400 mx-auto mb-1" />
                <p className="text-lg font-bold text-white">{brand.stats.avgReach}</p>
                <p className="text-xs text-gray-400">Avg Reach</p>
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1 border-white/10 text-white hover:bg-white/5"
            >
              Close
            </Button>
            <Button
              onClick={() => {
                onOpenChange(false)
                onApply()
              }}
              className="flex-1 bg-[#E63946] hover:bg-[#d62839] text-white"
            >
              Apply Now
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
