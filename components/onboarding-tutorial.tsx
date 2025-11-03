"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { X, ArrowRight, ArrowLeft } from "lucide-react"

interface TutorialStep {
  title: string
  description: string
  target?: string
  position?: "top" | "bottom" | "left" | "right"
}

const tutorialSteps: TutorialStep[] = [
  {
    title: "Welcome to Shor!",
    description:
      "Let's take a quick tour to help you get started with India's premier creator-brand collaboration platform.",
  },
  {
    title: "Connect with Brands",
    description:
      "Browse thousands of brand opportunities and find the perfect match for your content style and audience.",
  },
  {
    title: "Manage Collaborations",
    description: "Track all your brand deals, deliverables, and payments in one centralized dashboard.",
  },
  {
    title: "Grow Your Revenue",
    description: "Access exclusive brand partnerships and earn more with our transparent pricing and referral rewards.",
  },
  {
    title: "You're All Set!",
    description: "Ready to start your creator journey? Choose your plan and unlock unlimited opportunities.",
  },
]

export function OnboardingTutorial() {
  const [isOpen, setIsOpen] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)

  useEffect(() => {
    const hasSeenTutorial = localStorage.getItem("shor-tutorial-completed")
    if (!hasSeenTutorial) {
      const timer = setTimeout(() => setIsOpen(true), 1000)
      return () => clearTimeout(timer)
    }
  }, [])

  const handleNext = () => {
    if (currentStep < tutorialSteps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      handleComplete()
    }
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleComplete = () => {
    localStorage.setItem("shor-tutorial-completed", "true")
    setIsOpen(false)
  }

  const handleSkip = () => {
    localStorage.setItem("shor-tutorial-completed", "true")
    setIsOpen(false)
  }

  if (!isOpen) return null

  const step = tutorialSteps[currentStep]

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 animate-in fade-in duration-300" />

      {/* Tutorial Modal */}
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-lg mx-4 animate-in zoom-in-95 duration-300">
        <div className="bg-card border border-border rounded-2xl shadow-2xl p-8 relative">
          {/* Close Button */}
          <button
            onClick={handleSkip}
            className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Progress Indicator */}
          <div className="flex gap-2 mb-6">
            {tutorialSteps.map((_, index) => (
              <div
                key={index}
                className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                  index <= currentStep ? "bg-primary" : "bg-muted"
                }`}
              />
            ))}
          </div>

          {/* Content */}
          <div className="mb-8">
            <h2 className="text-3xl font-bold mb-4 text-balance">{step.title}</h2>
            <p className="text-lg text-muted-foreground text-balance">{step.description}</p>
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between gap-4">
            <Button variant="ghost" onClick={handlePrevious} disabled={currentStep === 0} className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              Previous
            </Button>

            <div className="text-sm text-muted-foreground">
              {currentStep + 1} of {tutorialSteps.length}
            </div>

            <Button onClick={handleNext} className="gap-2">
              {currentStep === tutorialSteps.length - 1 ? "Get Started" : "Next"}
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>

          {/* Skip Button */}
          {currentStep < tutorialSteps.length - 1 && (
            <button
              onClick={handleSkip}
              className="w-full text-center text-sm text-muted-foreground hover:text-foreground transition-colors mt-4"
            >
              Skip tutorial
            </button>
          )}
        </div>
      </div>
    </>
  )
}
