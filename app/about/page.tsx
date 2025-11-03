import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { Users, Target, Heart, Zap } from "lucide-react"

export default function AboutPage() {
  return (
    <main className="min-h-screen">
      <Navigation />

      {/* Hero Section */}
      <section className="pt-32 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto max-w-4xl text-center">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 text-balance">About Shor</h1>
          <p className="text-lg sm:text-xl text-muted-foreground text-balance">
            We're on a mission to revolutionize how creators and brands collaborate in India
          </p>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto max-w-4xl">
          <div className="prose prose-invert max-w-none">
            <h2 className="text-3xl font-bold mb-6">Our Story</h2>
            <p className="text-muted-foreground text-lg mb-4">
              Shor was born from a simple observation: creators and brands in India were struggling to find each other
              and collaborate effectively. We saw talented creators spending hours managing collaborations manually,
              while brands struggled to discover the right creators for their campaigns.
            </p>
            <p className="text-muted-foreground text-lg mb-4">
              We built Shor to solve this problem. Our platform brings together creators and brands in one seamless
              ecosystem, making collaboration effortless, transparent, and rewarding for everyone involved.
            </p>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-card/30">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl font-bold mb-12 text-center">Our Values</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
                <Users className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Community First</h3>
              <p className="text-muted-foreground text-sm">
                We prioritize the needs of our creator and brand community
              </p>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
                <Target className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Transparency</h3>
              <p className="text-muted-foreground text-sm">Clear pricing, honest communication, and fair practices</p>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
                <Heart className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Empowerment</h3>
              <p className="text-muted-foreground text-sm">Giving creators the tools to build sustainable careers</p>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
                <Zap className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Innovation</h3>
              <p className="text-muted-foreground text-sm">Constantly improving and adapting to serve you better</p>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-3xl font-bold mb-6">Join Our Journey</h2>
          <p className="text-lg text-muted-foreground mb-8">
            We're just getting started. Join thousands of creators and brands who are already transforming their
            collaboration experience with Shor.
          </p>
        </div>
      </section>

      <Footer />
    </main>
  )
}
