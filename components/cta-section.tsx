import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"

export function CTASection() {
  return (
    <section className="py-24 px-4 bg-gradient-to-b from-muted/20 to-background">
      <div className="container mx-auto max-w-4xl text-center">
        <h2 className="text-4xl md:text-5xl font-bold mb-6 text-balance">Ready to Transform Your Collaborations?</h2>
        <p className="text-xl text-muted-foreground mb-8 text-balance">
          Join thousands of creators who've ditched the chaos for seamless teamwork.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button size="lg" className="text-lg px-8">
            Start Free Trial
            <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
          <Button size="lg" variant="outline" className="text-lg px-8 bg-transparent">
            Watch Demo
          </Button>
        </div>
        <p className="text-sm text-muted-foreground mt-6">
          No credit card required • 14-day free trial • Cancel anytime
        </p>
      </div>
    </section>
  )
}
