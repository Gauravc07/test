import Link from "next/link"

export function Footer() {
  return (
    <footer className="border-t border-border py-8 sm:py-10 md:py-12 px-4 sm:px-6 lg:px-8">
      <div className="container mx-auto max-w-6xl">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 mb-6 sm:mb-8">
          <div>
            <h3 className="font-bold text-base sm:text-lg mb-3 sm:mb-4">Product</h3>
            <ul className="space-y-1.5 sm:space-y-2">
              <li>
                <Link
                  href="/features"
                  className="text-sm sm:text-base text-muted-foreground hover:text-foreground transition-colors"
                >
                  Features
                </Link>
              </li>
              <li>
                <Link
                  href="/pricing"
                  className="text-sm sm:text-base text-muted-foreground hover:text-foreground transition-colors"
                >
                  Pricing
                </Link>
              </li>
              <li>
                <Link
                  href="/how-it-works"
                  className="text-sm sm:text-base text-muted-foreground hover:text-foreground transition-colors"
                >
                  How It Works
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-base sm:text-lg mb-3 sm:mb-4">Company</h3>
            <ul className="space-y-1.5 sm:space-y-2">
              <li>
                <Link
                  href="/about"
                  className="text-sm sm:text-base text-muted-foreground hover:text-foreground transition-colors"
                >
                  About
                </Link>
              </li>
              <li>
                <Link
                  href="/blog"
                  className="text-sm sm:text-base text-muted-foreground hover:text-foreground transition-colors"
                >
                  Blog
                </Link>
              </li>
              <li>
                <Link
                  href="/careers"
                  className="text-sm sm:text-base text-muted-foreground hover:text-foreground transition-colors"
                >
                  Careers
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-base sm:text-lg mb-3 sm:mb-4">Resources</h3>
            <ul className="space-y-1.5 sm:space-y-2">
              <li>
                <Link
                  href="/help"
                  className="text-sm sm:text-base text-muted-foreground hover:text-foreground transition-colors"
                >
                  Help Center
                </Link>
              </li>
              <li>
                <Link
                  href="/community"
                  className="text-sm sm:text-base text-muted-foreground hover:text-foreground transition-colors"
                >
                  Community
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="text-sm sm:text-base text-muted-foreground hover:text-foreground transition-colors"
                >
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-base sm:text-lg mb-3 sm:mb-4">Legal</h3>
            <ul className="space-y-1.5 sm:space-y-2">
              <li>
                <Link
                  href="/privacy"
                  className="text-sm sm:text-base text-muted-foreground hover:text-foreground transition-colors"
                >
                  Privacy
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className="text-sm sm:text-base text-muted-foreground hover:text-foreground transition-colors"
                >
                  Terms
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border pt-6 sm:pt-8 text-center text-muted-foreground">
          <p className="text-sm sm:text-base">&copy; 2025 Shor. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
