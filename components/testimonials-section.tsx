"use client"

import { useEffect, useRef, useState } from "react"
import { Star, Quote } from "lucide-react"

const testimonials = [
  {
    name: "Priya Sharma",
    role: "Fashion & Lifestyle Creator",
    followers: "250K",
    content:
      "Shor has completely transformed how I work with brands. No more endless email threads or payment delays. Everything is in one place, and I get paid on time, every time.",
    rating: 5,
    avatar: "/indian-woman-creator.jpg",
    metric: "Campaign Success Rate",
    value: "94%",
  },
  {
    name: "Arjun Mehta",
    role: "Tech Reviewer",
    followers: "500K",
    content:
      "The analytics dashboard is a game-changer. I can show brands exactly what ROI they're getting from my content. It's helped me negotiate better rates and land bigger deals.",
    rating: 5,
    avatar: "/indian-man-tech-reviewer.jpg",
    metric: "Average Deal Value",
    value: "₹45,000",
  },
  {
    name: "Sneha Patel",
    role: "Food & Travel Vlogger",
    followers: "180K",
    content:
      "I used to spend hours managing collaborations across different platforms. Shor saves me at least 10 hours a week. Now I can focus on creating content instead of admin work.",
    rating: 5,
    avatar: "/indian-woman-food-blogger.jpg",
    metric: "Time Saved Weekly",
    value: "10 hrs",
  },
]

export function TestimonialsSection() {
  const [activeIndex, setActiveIndex] = useState(0)
  const sectionRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleScroll = () => {
      if (!sectionRef.current) return

      const section = sectionRef.current
      const sectionTop = section.offsetTop
      const sectionHeight = section.offsetHeight
      const scrollPosition = window.scrollY + window.innerHeight / 2

      // Calculate which card should be active based on scroll position
      const relativeScroll = scrollPosition - sectionTop
      const cardIndex = Math.floor((relativeScroll / sectionHeight) * testimonials.length)
      const clampedIndex = Math.max(0, Math.min(testimonials.length - 1, cardIndex))

      setActiveIndex(clampedIndex)
    }

    window.addEventListener("scroll", handleScroll)
    handleScroll() // Initial check

    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <section ref={sectionRef} className="relative min-h-[200vh] md:min-h-[300vh] py-12 md:py-24">
      {/* Fixed Background Container */}
      <div className="sticky top-0 h-screen flex items-center justify-center overflow-hidden">
        {/* Background Gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-950 to-blue-950" />

        {/* Content Grid */}
        <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-24">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            {/* Left Side - Text Content */}
            <div className="space-y-4 md:space-y-6">
              <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-light leading-tight">
                <span className="text-white">Trusted by creators</span>
                <br />
                <span className="text-gray-400">across India.</span>
              </h2>
              <p className="text-base md:text-lg text-gray-300 leading-relaxed max-w-xl">
                Join thousands of creators who've simplified their collaboration workflow and increased their earnings
                with Shor's powerful platform.
              </p>

              {/* Progress Indicators */}
              <div className="flex gap-3 pt-4">
                {testimonials.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setActiveIndex(index)}
                    className={`h-1 rounded-full transition-all duration-300 ${
                      index === activeIndex ? "bg-red-500 w-12" : "bg-gray-700 w-8"
                    }`}
                    aria-label={`View testimonial ${index + 1}`}
                  />
                ))}
              </div>
            </div>

            {/* Right Side - Testimonial Card */}
            <div className="relative">
              {testimonials.map((testimonial, index) => (
                <div
                  key={index}
                  className={`transition-all duration-700 ${
                    index === activeIndex
                      ? "opacity-100 translate-y-0 relative"
                      : "opacity-0 translate-y-8 absolute inset-0 pointer-events-none"
                  }`}
                >
                  <div className="bg-gradient-to-br from-gray-900/80 to-gray-950/80 backdrop-blur-xl border border-gray-800 rounded-2xl md:rounded-3xl p-6 md:p-8 shadow-2xl">
                    {/* Quote Icon */}
                    <div className="mb-4 md:mb-6">
                      <Quote className="w-8 h-8 md:w-10 md:h-10 text-red-500" />
                    </div>

                    {/* Rating */}
                    <div className="flex gap-1 mb-4 md:mb-6">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 md:w-5 md:h-5 fill-red-500 text-red-500" />
                      ))}
                    </div>

                    {/* Content */}
                    <blockquote className="text-base md:text-lg text-gray-200 mb-6 md:mb-8 leading-relaxed">
                      "{testimonial.content}"
                    </blockquote>

                    {/* Author Info */}
                    <div className="flex items-center gap-3 md:gap-4 mb-4 md:mb-6 pb-4 md:pb-6 border-b border-gray-800">
                      <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center overflow-hidden flex-shrink-0">
                        <img
                          src={testimonial.avatar || "/placeholder.svg?height=56&width=56"}
                          alt={testimonial.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="min-w-0">
                        <div className="font-semibold text-white text-base md:text-lg truncate">{testimonial.name}</div>
                        <div className="text-gray-400 text-xs md:text-sm truncate">
                          {testimonial.role} • {testimonial.followers} followers
                        </div>
                      </div>
                    </div>

                    {/* Metric */}
                    <div className="flex items-center justify-between bg-gray-900/50 rounded-xl p-3 md:p-4">
                      <div className="text-gray-400 text-xs md:text-sm">{testimonial.metric}</div>
                      <div className="text-xl md:text-2xl font-bold text-white">{testimonial.value}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
