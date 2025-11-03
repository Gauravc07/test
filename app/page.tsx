import { Navigation } from "@/components/navigation"
import { HeroSection } from "@/components/hero-section"
import { ValueProposition } from "@/components/value-proposition"
import { FeaturesSection } from "@/components/features-section"
import { HowItWorks } from "@/components/how-it-works"
import { TestimonialsSection } from "@/components/testimonials-section"
import { DashboardPreviewSection } from "@/components/dashboard-preview-section"
import { Footer } from "@/components/footer"

export default function HomePage() {
  return (
    <main className="min-h-screen">
      <Navigation />
      <HeroSection />
      <ValueProposition />
      <FeaturesSection />
      <HowItWorks />
      <DashboardPreviewSection />
      <TestimonialsSection />
      <Footer />
    </main>
  )
}
