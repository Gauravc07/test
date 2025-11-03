import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Check, Sparkles } from "lucide-react"

const plans = [
  {
    name: "Creator Access Pass",
    price: "₹349",
    originalPrice: "₹499",
    promoPrice: "₹199",
    period: "/month",
    description: "Perfect for creators looking to collaborate with top brands",
    features: [
      "Access to 500+ brand partnerships",
      "Collaboration management dashboard",
      "Payment tracking & invoicing",
      "Content calendar & scheduling",
      "Performance analytics",
      "Email support",
      "Refer 3 users → Get 1 month free (max 3 months)",
    ],
    popular: true,
    savings: "Save ₹150/month",
  },
  {
    name: "Brand Growth Pass",
    price: "₹1,199",
    originalPrice: "₹1,499",
    promoPrice: "₹999",
    period: "/month",
    description: "For brands seeking authentic creator partnerships",
    features: [
      "Everything in Creator Pass",
      "Access to 10,000+ verified creators",
      "Advanced creator discovery & filters",
      "Campaign management tools",
      "ROI tracking & detailed analytics",
      "Bulk collaboration management",
      "Priority support",
      "Dedicated account manager",
      "Custom contract templates",
      "Refer 3 users → Get 1 month free (max 3 months)",
    ],
    savings: "Save ₹300/month",
  },
]

export default function PricingPage() {
  return (
    <main className="min-h-screen">
      <Navigation />
      <section className="py-24 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full mb-6">
              <Sparkles className="w-4 h-4" />
              <span className="text-sm font-semibold">Limited Time Launch Offer</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-4 text-balance">Simple, Transparent Pricing</h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto text-balance">
              Choose the plan that fits your needs. All prices include 18% GST. Cancel anytime.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {plans.map((plan, index) => (
              <div
                key={index}
                className={`bg-card border rounded-2xl p-8 relative ${
                  plan.popular ? "border-primary shadow-xl scale-105" : "border-border"
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-sm font-semibold px-4 py-1.5 rounded-full">
                    Most Popular
                  </div>
                )}

                <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>

                {/* Pricing */}
                <div className="mb-4">
                  <div className="flex items-baseline gap-2 mb-2">
                    <span className="text-5xl font-bold">{plan.promoPrice}</span>
                    <span className="text-muted-foreground">{plan.period}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-muted-foreground line-through">{plan.originalPrice}/month</span>
                    <span className="text-primary font-semibold">{plan.savings}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Regular price: {plan.price}/month after promo</p>
                </div>

                <p className="text-muted-foreground mb-6 text-balance">{plan.description}</p>

                <Button className="w-full mb-6" size="lg" variant={plan.popular ? "default" : "outline"}>
                  Get Started Now
                </Button>

                <ul className="space-y-3">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Additional Info */}
          <div className="mt-16 text-center">
            <p className="text-muted-foreground mb-4">All plans include 18% GST as per Indian tax regulations</p>
            <p className="text-sm text-muted-foreground">
              Need a custom enterprise solution?{" "}
              <a href="#" className="text-primary hover:underline">
                Contact our sales team
              </a>
            </p>
          </div>
        </div>
      </section>
      <Footer />
    </main>
  )
}
