"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Upload, Sparkles, CheckCircle2 } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

interface QuickApplyModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  brand: {
    name: string
    campaign: string
    payRange: { min: number; max: number }
  }
}

export function QuickApplyModal({ open, onOpenChange, brand }: QuickApplyModalProps) {
  const [pitch, setPitch] = useState(
    `Hi ${brand.name}, I love your brand's aesthetic and values. I'd be thrilled to collaborate on ${brand.campaign}. My audience aligns perfectly with your target demographic, and I have a proven track record of driving engagement and conversions. Let's create something amazing together!`,
  )
  const [bidAmount, setBidAmount] = useState([brand.payRange.min])
  const [files, setFiles] = useState<File[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const handleSubmit = async () => {
    setIsSubmitting(true)
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500))
    setIsSubmitting(false)
    setIsSuccess(true)
    setTimeout(() => {
      onOpenChange(false)
      setIsSuccess(false)
    }, 2000)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files))
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#0f1629] border-white/10 text-white max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl sm:text-2xl font-bold flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-yellow-400" />
            Quick Apply to {brand.name}
          </DialogTitle>
        </DialogHeader>

        <AnimatePresence mode="wait">
          {isSuccess ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="py-12 text-center"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              >
                <CheckCircle2 className="w-20 h-20 text-green-500 mx-auto mb-4" />
              </motion.div>
              <h3 className="text-2xl font-bold mb-2">Application Submitted!</h3>
              <p className="text-gray-400">The brand will review your pitch and get back to you soon.</p>
            </motion.div>
          ) : (
            <motion.div
              key="form"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-6"
            >
              <div className="space-y-2">
                <Label htmlFor="pitch" className="text-sm font-medium">
                  Your Pitch
                </Label>
                <Textarea
                  id="pitch"
                  value={pitch}
                  onChange={(e) => setPitch(e.target.value)}
                  className="min-h-[120px] bg-[#1a1f35] border-white/10 text-white resize-none"
                  placeholder="Introduce yourself and explain why you're a great fit..."
                />
                <p className="text-xs text-gray-400">
                  Tip: Personalize your pitch to stand out. Mention specific campaign goals or past successes.
                </p>
              </div>

              <div className="space-y-3">
                <Label className="text-sm font-medium">Desired Payment</Label>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">
                    Range: ₹{brand.payRange.min.toLocaleString()} - ₹{brand.payRange.max.toLocaleString()}
                  </span>
                  <span className="text-white font-bold">₹{bidAmount[0].toLocaleString()}</span>
                </div>
                <Slider
                  value={bidAmount}
                  onValueChange={setBidAmount}
                  min={brand.payRange.min}
                  max={brand.payRange.max}
                  step={1000}
                  className="w-full"
                />
                <p className="text-xs text-gray-400">
                  Tip: Brands are more likely to accept bids within their budget range.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="media" className="text-sm font-medium">
                  Attach Portfolio / Past Work (Optional)
                </Label>
                <div className="border-2 border-dashed border-white/10 rounded-lg p-6 text-center hover:border-blue-500/50 transition-colors">
                  <input
                    id="media"
                    type="file"
                    multiple
                    accept="image/*,video/*,.pdf"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <label htmlFor="media" className="cursor-pointer">
                    <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-400">
                      {files.length > 0 ? `${files.length} file(s) selected` : "Click to upload or drag and drop"}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">PNG, JPG, MP4, PDF up to 10MB</p>
                  </label>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  className="flex-1 border-white/10 text-white hover:bg-white/5"
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSubmit}
                  className="flex-1 bg-[#E63946] hover:bg-[#d62839] text-white"
                  disabled={isSubmitting || !pitch.trim()}
                >
                  {isSubmitting ? "Submitting..." : "Submit Application"}
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  )
}
