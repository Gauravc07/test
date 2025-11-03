import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Mail, MessageSquare, Phone, MapPin } from "lucide-react"

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-950 via-black to-gray-950">
      <Navigation />

      {/* Hero Section */}
      <section className="pt-32 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto max-w-4xl text-center">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 text-balance bg-gradient-to-b from-white via-white to-blue-200 bg-clip-text text-transparent">
            Get In Touch
          </h1>
          <p className="text-lg sm:text-xl text-gray-400 text-balance">
            Have questions? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
          </p>
        </div>
      </section>

      {/* Contact Form & Info */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
            {/* Contact Form */}
            <Card className="p-6 sm:p-8 bg-white/5 backdrop-blur-sm border-white/10">
              <h2 className="text-2xl font-bold mb-6 text-white">Send us a message</h2>
              <form className="space-y-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium mb-2 text-gray-300">
                    Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-gray-500 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/20 transition-colors"
                    placeholder="Your name"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium mb-2 text-gray-300">
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-gray-500 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/20 transition-colors"
                    placeholder="your@email.com"
                  />
                </div>
                <div>
                  <label htmlFor="subject" className="block text-sm font-medium mb-2 text-gray-300">
                    Subject
                  </label>
                  <input
                    type="text"
                    id="subject"
                    className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-gray-500 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/20 transition-colors"
                    placeholder="How can we help?"
                  />
                </div>
                <div>
                  <label htmlFor="message" className="block text-sm font-medium mb-2 text-gray-300">
                    Message
                  </label>
                  <textarea
                    id="message"
                    rows={5}
                    className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-gray-500 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/20 transition-colors resize-none"
                    placeholder="Tell us more about your inquiry..."
                  />
                </div>
                <Button className="w-full bg-red-600 text-white hover:bg-red-700 transition-colors">
                  Send Message
                </Button>
              </form>
            </Card>

            {/* Contact Info */}
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold mb-6 text-white">Contact Information</h2>
                <p className="text-gray-400 mb-8">
                  Choose your preferred way to get in touch with us. We're here to help!
                </p>
              </div>

              <Card className="p-6 bg-white/5 backdrop-blur-sm border-white/10 hover:border-red-500/40 transition-colors">
                <div className="flex items-start gap-4">
                  <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-red-500/10">
                    <Mail className="w-6 h-6 text-red-500" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1 text-white">Email</h3>
                    <p className="text-sm text-gray-400 mb-2">Our team is here to help</p>
                    <a href="mailto:support@shor.app" className="text-red-500 hover:text-red-400 transition-colors">
                      support@shor.app
                    </a>
                  </div>
                </div>
              </Card>

              <Card className="p-6 bg-white/5 backdrop-blur-sm border-white/10 hover:border-red-500/40 transition-colors">
                <div className="flex items-start gap-4">
                  <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-red-500/10">
                    <MessageSquare className="w-6 h-6 text-red-500" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1 text-white">Live Chat</h3>
                    <p className="text-sm text-gray-400 mb-2">Available Mon-Fri, 9am-6pm IST</p>
                    <button className="text-red-500 hover:text-red-400 transition-colors">Start a conversation</button>
                  </div>
                </div>
              </Card>

              <Card className="p-6 bg-white/5 backdrop-blur-sm border-white/10 hover:border-red-500/40 transition-colors">
                <div className="flex items-start gap-4">
                  <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-red-500/10">
                    <Phone className="w-6 h-6 text-red-500" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1 text-white">Phone</h3>
                    <p className="text-sm text-gray-400 mb-2">Mon-Fri from 9am to 6pm IST</p>
                    <a href="tel:+911234567890" className="text-red-500 hover:text-red-400 transition-colors">
                      +91 123 456 7890
                    </a>
                  </div>
                </div>
              </Card>

              <Card className="p-6 bg-white/5 backdrop-blur-sm border-white/10 hover:border-red-500/40 transition-colors">
                <div className="flex items-start gap-4">
                  <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-red-500/10">
                    <MapPin className="w-6 h-6 text-red-500" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1 text-white">Office</h3>
                    <p className="text-sm text-gray-400">
                      Bangalore, Karnataka
                      <br />
                      India
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
