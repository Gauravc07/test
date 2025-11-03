import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { ArrowRight, FolderPlus, MessageSquare, Share2, CheckCircle } from "lucide-react"

const steps = [
  {
    icon: FolderPlus,
    title: "Create Your Project",
    description: "Start a new project in seconds. Upload your files, add context, and invite your collaborators.",
    step: "01",
  },
  {
    icon: MessageSquare,
    title: "Collaborate in Real-Time",
    description: "Comment directly on files, tag team members, and discuss ideas without leaving the platform.",
    step: "02",
  },
  {
    icon: Share2,
    title: "Share with Clients",
    description: "Generate a shareable link for clients to review and approve work. No account needed for them.",
    step: "03",
  },
  {
    icon: CheckCircle,
    title: "Track & Deliver",
    description: "Monitor progress, get approvals, and deliver final assets all in one organized workspace.",
    step: "04",
  },
]

export default function HowItWorksPage() {
  return (
    <main className="min-h-screen">
      <Navigation />
      <section className="py-24 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h1 className="text-5xl md:text-6xl font-bold mb-4 text-balance">How It Works</h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto text-balance">
              From chaos to clarity in four simple steps. See how easy collaboration can be.
            </p>
          </div>

          <div className="space-y-16">
            {steps.map((step, index) => (
              <div
                key={index}
                className={`flex flex-col ${index % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"} gap-12 items-center`}
              >
                <div className="flex-1">
                  <div className="text-6xl font-bold text-primary/20 mb-4">{step.step}</div>
                  <h2 className="text-3xl font-bold mb-4">{step.title}</h2>
                  <p className="text-lg text-muted-foreground leading-relaxed">{step.description}</p>
                </div>
                <div className="flex-1 flex justify-center">
                  <div className="w-64 h-64 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center border border-primary/20">
                    <step.icon className="w-32 h-32 text-primary/40" />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-16">
            <Button size="lg" className="text-lg px-8">
              Start Your Free Trial
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </div>
        </div>
      </section>
      <Footer />
    </main>
  )
}
