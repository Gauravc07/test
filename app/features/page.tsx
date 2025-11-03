import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import {
  FileText,
  MessageCircle,
  Zap,
  CheckCircle2,
  Share2,
  Sparkles,
  Lock,
  Clock,
  Users,
  Video,
  ImageIcon,
  FileCode,
} from "lucide-react"

const featureCategories = [
  {
    title: "Collaboration Tools",
    features: [
      {
        icon: MessageCircle,
        title: "Contextual Comments",
        description: "Comment directly on specific parts of videos, images, and documents.",
      },
      {
        icon: Users,
        title: "Team Workspaces",
        description: "Organize your team with dedicated workspaces for different projects.",
      },
      {
        icon: Zap,
        title: "Real-Time Updates",
        description: "See changes instantly as your team works together.",
      },
    ],
  },
  {
    title: "File Management",
    features: [
      {
        icon: FileText,
        title: "Universal File Support",
        description: "Upload and preview any file type - videos, images, PDFs, and more.",
      },
      {
        icon: Clock,
        title: "Version History",
        description: "Track every change and revert to previous versions anytime.",
      },
      {
        icon: Lock,
        title: "Secure Storage",
        description: "Enterprise-grade security keeps your creative work safe.",
      },
    ],
  },
  {
    title: "Workflow Features",
    features: [
      {
        icon: CheckCircle2,
        title: "Approval Workflows",
        description: "Set up custom approval stages for your projects.",
      },
      {
        icon: Share2,
        title: "Client Sharing",
        description: "Share projects with clients via simple, secure links.",
      },
      {
        icon: Sparkles,
        title: "Smart Notifications",
        description: "Get notified about what matters, when it matters.",
      },
    ],
  },
  {
    title: "Media Support",
    features: [
      {
        icon: Video,
        title: "Video Preview",
        description: "Play and review videos directly in the browser.",
      },
      {
        icon: ImageIcon,
        title: "Image Annotations",
        description: "Mark up images with comments and feedback.",
      },
      {
        icon: FileCode,
        title: "Code Review",
        description: "Review and comment on code files with syntax highlighting.",
      },
    ],
  },
]

export default function FeaturesPage() {
  return (
    <main className="min-h-screen">
      <Navigation />
      <section className="py-24 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h1 className="text-5xl md:text-6xl font-bold mb-4 text-balance">Powerful Features for Creators</h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto text-balance">
              Everything you need to collaborate seamlessly, all in one place.
            </p>
          </div>

          <div className="space-y-16">
            {featureCategories.map((category, index) => (
              <div key={index}>
                <h2 className="text-3xl font-bold mb-8">{category.title}</h2>
                <div className="grid md:grid-cols-3 gap-6">
                  {category.features.map((feature, i) => (
                    <div key={i} className="bg-card border border-border rounded-xl p-6">
                      <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                        <feature.icon className="w-6 h-6 text-primary" />
                      </div>
                      <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                      <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      <Footer />
    </main>
  )
}
