import { AlertCircle, Clock, MessageSquare, Users } from "lucide-react"

const problems = [
  {
    icon: Clock,
    title: "Time-Consuming Coordination",
    description: "Hours wasted on emails, DMs, and scheduling calls just to align on simple creative decisions.",
  },
  {
    icon: MessageSquare,
    title: "Scattered Communication",
    description: "Feedback lost across Instagram DMs, emails, WhatsApp, and comment sections. Nothing is organized.",
  },
  {
    icon: AlertCircle,
    title: "Version Control Chaos",
    description: "Multiple file versions floating around. Which edit is the final one? Nobody knows.",
  },
  {
    icon: Users,
    title: "No Clear Workflow",
    description: "Every collaboration feels like starting from scratch. No system, no structure, just stress.",
  },
]

export function ProblemsSection() {
  return (
    <section className="py-12 sm:py-16 md:py-20 lg:py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-10 sm:mb-12 md:mb-16">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3 sm:mb-4 text-balance">
            The Collaboration Nightmare
          </h2>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto text-balance px-4">
            Every creator knows the pain of working with others. It shouldn't be this hard.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 gap-4 sm:gap-6 md:gap-8">
          {problems.map((problem, index) => (
            <div
              key={index}
              className="bg-card border border-border rounded-2xl p-6 sm:p-8 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-start gap-3 sm:gap-4">
                <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-destructive/10 flex items-center justify-center">
                  <problem.icon className="w-5 h-5 sm:w-6 sm:h-6 text-destructive" />
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-semibold mb-1 sm:mb-2">{problem.title}</h3>
                  <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">{problem.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
