"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { ChevronLeft, ChevronRight, Sparkles, Plus, X, DollarSign, Users } from "lucide-react"

interface CreateCampaignWizardProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CreateCampaignWizard({ open, onOpenChange }: CreateCampaignWizardProps) {
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    name: "",
    objective: "",
    platforms: [] as string[],
    startDate: "",
    endDate: "",
    deliverables: [] as any[],
    budget: "",
    niche: "",
    targetAudience: "",
  })

  const totalSteps = 5
  const progress = (step / totalSteps) * 100

  const handleNext = () => {
    if (step < totalSteps) setStep(step + 1)
  }

  const handleBack = () => {
    if (step > 1) setStep(step - 1)
  }

  const handlePlatformToggle = (platform: string) => {
    setFormData((prev) => ({
      ...prev,
      platforms: prev.platforms.includes(platform)
        ? prev.platforms.filter((p) => p !== platform)
        : [...prev.platforms, platform],
    }))
  }

  const addDeliverable = () => {
    setFormData((prev) => ({
      ...prev,
      deliverables: [...prev.deliverables, { type: "", quantity: 1, rate: "" }],
    }))
  }

  const removeDeliverable = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      deliverables: prev.deliverables.filter((_, i) => i !== index),
    }))
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl sm:text-2xl">Create New Campaign</DialogTitle>
          <div className="mt-4">
            <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
              <span>
                Step {step} of {totalSteps}
              </span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </DialogHeader>

        <div className="mt-6">
          {/* Step 1: Basic Info */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Campaign Name *</Label>
                <Input
                  id="name"
                  placeholder="e.g., Summer Fashion Collection 2024"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="mt-1.5"
                />
              </div>

              <div>
                <Label htmlFor="objective">Campaign Objective *</Label>
                <Select
                  value={formData.objective}
                  onValueChange={(value) => setFormData({ ...formData, objective: value })}
                >
                  <SelectTrigger className="mt-1.5">
                    <SelectValue placeholder="Select objective" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="awareness">Brand Awareness</SelectItem>
                    <SelectItem value="engagement">Engagement</SelectItem>
                    <SelectItem value="conversions">Drive Conversions</SelectItem>
                    <SelectItem value="traffic">Website Traffic</SelectItem>
                  </SelectContent>
                </Select>
                <div className="mt-2 p-3 bg-primary/5 border border-primary/20 rounded-lg flex items-start gap-2">
                  <Sparkles className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-muted-foreground">
                    AI Suggestion: Based on your goal, we recommend focusing on micro-influencers for better engagement
                    rates.
                  </p>
                </div>
              </div>

              <div>
                <Label>Platforms *</Label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-1.5">
                  {["Instagram", "YouTube", "TikTok", "Twitter"].map((platform) => (
                    <Button
                      key={platform}
                      type="button"
                      variant={formData.platforms.includes(platform) ? "default" : "outline"}
                      size="sm"
                      onClick={() => handlePlatformToggle(platform)}
                      className="w-full"
                    >
                      {platform}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="startDate">Start Date *</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="mt-1.5"
                  />
                </div>
                <div>
                  <Label htmlFor="endDate">End Date *</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    className="mt-1.5"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Deliverables & Budget */}
          {step === 2 && (
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <Label>Deliverables *</Label>
                  <Button type="button" size="sm" variant="outline" onClick={addDeliverable}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Deliverable
                  </Button>
                </div>
                <div className="space-y-3">
                  {formData.deliverables.map((deliverable, index) => (
                    <Card key={index}>
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <div className="flex-1 grid grid-cols-3 gap-3">
                            <Select
                              value={deliverable.type}
                              onValueChange={(value) => {
                                const newDeliverables = [...formData.deliverables]
                                newDeliverables[index].type = value
                                setFormData({ ...formData, deliverables: newDeliverables })
                              }}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Type" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="reel">Reel</SelectItem>
                                <SelectItem value="story">Story</SelectItem>
                                <SelectItem value="post">Post</SelectItem>
                                <SelectItem value="video">Video</SelectItem>
                              </SelectContent>
                            </Select>
                            <Input
                              type="number"
                              placeholder="Quantity"
                              value={deliverable.quantity}
                              onChange={(e) => {
                                const newDeliverables = [...formData.deliverables]
                                newDeliverables[index].quantity = Number.parseInt(e.target.value)
                                setFormData({ ...formData, deliverables: newDeliverables })
                              }}
                            />
                            <Input
                              type="number"
                              placeholder="Rate ($)"
                              value={deliverable.rate}
                              onChange={(e) => {
                                const newDeliverables = [...formData.deliverables]
                                newDeliverables[index].rate = e.target.value
                                setFormData({ ...formData, deliverables: newDeliverables })
                              }}
                            />
                          </div>
                          <Button type="button" size="icon" variant="ghost" onClick={() => removeDeliverable(index)}>
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              <div>
                <Label htmlFor="budget">Total Budget *</Label>
                <div className="relative mt-1.5">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="budget"
                    type="number"
                    placeholder="25000"
                    value={formData.budget}
                    onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                    className="pl-9"
                  />
                </div>
                {formData.budget && (
                  <div className="mt-2 p-3 bg-primary/5 border border-primary/20 rounded-lg">
                    <p className="text-xs text-muted-foreground">
                      <strong>Projected Reach:</strong> 2.5M - 3.2M impressions
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step 3: Target Audience */}
          {step === 3 && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="niche">Niche/Category *</Label>
                <Select value={formData.niche} onValueChange={(value) => setFormData({ ...formData, niche: value })}>
                  <SelectTrigger className="mt-1.5">
                    <SelectValue placeholder="Select niche" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fashion">Fashion & Beauty</SelectItem>
                    <SelectItem value="fitness">Fitness & Health</SelectItem>
                    <SelectItem value="tech">Technology</SelectItem>
                    <SelectItem value="food">Food & Beverage</SelectItem>
                    <SelectItem value="travel">Travel</SelectItem>
                    <SelectItem value="lifestyle">Lifestyle</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="targetAudience">Target Audience Description</Label>
                <Textarea
                  id="targetAudience"
                  placeholder="Describe your ideal audience demographics, interests, and behaviors..."
                  value={formData.targetAudience}
                  onChange={(e) => setFormData({ ...formData, targetAudience: e.target.value })}
                  className="mt-1.5 min-h-[100px]"
                />
              </div>

              <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
                <div className="flex items-start gap-2 mb-3">
                  <Sparkles className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                  <p className="text-sm font-semibold">AI Recommendations</p>
                </div>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <p>• Target age group: 18-34 years (highest engagement for {formData.niche})</p>
                  <p>• Best posting times: Weekdays 6-9 PM, Weekends 10 AM - 2 PM</p>
                  <p>• Recommended influencer tier: Micro (10K-100K) for better ROI</p>
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Invite Influencers */}
          {step === 4 && (
            <div className="space-y-4">
              <div className="text-center py-8">
                <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Find Influencers</h3>
                <p className="text-sm text-muted-foreground mb-4">Search and invite influencers to your campaign</p>
                <Button>Browse Influencers</Button>
              </div>

              <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
                <div className="flex items-start gap-2">
                  <Sparkles className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                  <div className="text-sm">
                    <p className="font-semibold mb-2">AI Suggested Influencers</p>
                    <p className="text-muted-foreground">
                      Based on your campaign goals and budget, we recommend adding 3-5 micro-influencers in the{" "}
                      {formData.niche} niche for optimal reach efficiency.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 5: Review & Launch */}
          {step === 5 && (
            <div className="space-y-4">
              <Card>
                <CardContent className="p-4 space-y-3">
                  <div>
                    <p className="text-xs text-muted-foreground">Campaign Name</p>
                    <p className="font-semibold">{formData.name || "Not set"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Objective</p>
                    <p className="font-semibold capitalize">{formData.objective || "Not set"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Platforms</p>
                    <div className="flex gap-2 mt-1">
                      {formData.platforms.map((platform) => (
                        <Badge key={platform} variant="secondary">
                          {platform}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-xs text-muted-foreground">Duration</p>
                      <p className="font-semibold text-sm">
                        {formData.startDate && formData.endDate
                          ? `${formData.startDate} to ${formData.endDate}`
                          : "Not set"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Budget</p>
                      <p className="font-semibold text-sm">${formData.budget || "0"}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Deliverables</p>
                    <p className="font-semibold">{formData.deliverables.length} types configured</p>
                  </div>
                </CardContent>
              </Card>

              <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                <p className="text-sm text-green-700 dark:text-green-400">
                  ✓ Campaign is ready to launch! Influencers will be notified once you confirm.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between mt-6 pt-6 border-t">
          <Button type="button" variant="outline" onClick={handleBack} disabled={step === 1}>
            <ChevronLeft className="h-4 w-4 mr-2" />
            Back
          </Button>

          {step < totalSteps ? (
            <Button type="button" onClick={handleNext}>
              Next
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          ) : (
            <Button type="button" onClick={() => onOpenChange(false)}>
              Launch Campaign
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
