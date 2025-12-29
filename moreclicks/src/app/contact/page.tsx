import type { Metadata } from "next";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Mail, MessageSquare, Clock, MapPin, Send } from "lucide-react";

export const metadata: Metadata = {
  title: "Contact Us | MoreClicks.io - Get in Touch with Our Team",
  description: "Contact MoreClicks.io for support, questions, or inquiries. Reach out to our team via email at nitish@moreclicks.io. We're here to help with your SEO needs.",
  keywords: "contact moreclicks, SEO tool support, customer service, help desk, contact form",
  openGraph: {
    title: "Contact Us | MoreClicks.io",
    description: "Get in touch with the MoreClicks.io team",
    type: "website",
  },
};

export default function ContactPage() {
  return (
    <div className="light" suppressHydrationWarning>
      <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <MessageSquare className="h-16 w-16 text-purple-600" />
          </div>
          <h1 className="text-4xl md:text-5xl font-black mb-4 text-purple-600">
            Contact Us
          </h1>
          <p className="text-lg text-gray-600">
            We'd love to hear from you. Get in touch with our team for support, questions, or feedback.
          </p>
        </div>

        {/* Contact Information Cards */}
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          <Card className="border-2 border-purple-200 hover:shadow-lg transition-shadow !bg-white">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <Mail className="h-8 w-8 text-purple-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-800">Email Us</h3>
                  <p className="text-sm text-gray-600">Send us an email anytime</p>
                </div>
              </div>
              <a 
                href="mailto:nitish@moreclicks.io" 
                className="text-purple-600 hover:text-purple-700 font-semibold text-lg break-all"
              >
                nitish@moreclicks.io
              </a>
              <p className="text-sm text-gray-600 mt-2">
                We typically respond within 24 hours
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 border-blue-200 hover:shadow-lg transition-shadow !bg-white">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Clock className="h-8 w-8 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-800">Response Time</h3>
                  <p className="text-sm text-gray-600">We're here to help</p>
                </div>
              </div>
              <p className="text-gray-700">
                <strong className="text-blue-600">Business Hours:</strong> Monday - Friday, 9 AM - 6 PM EST
              </p>
              <p className="text-sm text-gray-600 mt-2">
                Support tickets are monitored 24/7
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Contact Form Section */}
        <Card className="mb-12 border-2 border-purple-200 shadow-lg !bg-white">
          <CardContent className="pt-8">
            <h2 className="text-3xl font-bold mb-6 text-center text-purple-600">Send Us a Message</h2>
            <form action={`mailto:nitish@moreclicks.io`} method="post" encType="text/plain" className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2">
                  Your Name *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  required
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none transition-colors"
                  placeholder="John Doe"
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                  Your Email *
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  required
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none transition-colors"
                  placeholder="your.email@example.com"
                />
              </div>
              <div>
                <label htmlFor="subject" className="block text-sm font-semibold text-gray-700 mb-2">
                  Subject *
                </label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  required
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none transition-colors"
                  placeholder="How can we help?"
                />
              </div>
              <div>
                <label htmlFor="message" className="block text-sm font-semibold text-gray-700 mb-2">
                  Message *
                </label>
                <textarea
                  id="message"
                  name="message"
                  required
                  rows={6}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none transition-colors resize-none"
                  placeholder="Tell us more about your inquiry..."
                ></textarea>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="consent"
                  name="consent"
                  required
                  className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                />
                <label htmlFor="consent" className="text-sm text-gray-700">
                  I agree to the <Link href="/privacy" className="text-purple-600 hover:underline">Privacy Policy</Link> and consent to being contacted.
                </label>
              </div>
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 px-6 rounded-lg font-bold hover:from-purple-700 hover:to-blue-700 transition-all duration-200 hover:scale-105 flex items-center justify-center gap-2"
              >
                <Send className="h-5 w-5" />
                Send Message
              </button>
            </form>
          </CardContent>
        </Card>

        {/* FAQ Section */}
        <Card className="mb-12 border-2 border-blue-200 bg-blue-50/50">
          <CardContent className="pt-8">
            <h2 className="text-3xl font-bold mb-6 text-center text-blue-600">Frequently Asked Questions</h2>
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold mb-2 text-gray-800">What should I include in my message?</h3>
                <p className="text-gray-700">
                  Please include your name, email, and a detailed description of your question or issue. For technical support, include your account email and any relevant error messages or screenshots.
                </p>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2 text-gray-800">How quickly will I receive a response?</h3>
                <p className="text-gray-700">
                  We aim to respond to all inquiries within 24 hours during business days. For urgent matters, please mark your email as urgent or contact us during business hours.
                </p>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2 text-gray-800">Can I schedule a demo or consultation?</h3>
                <p className="text-gray-700">
                  Absolutely! Mention in your message that you'd like to schedule a demo, and we'll coordinate a time that works for you. We offer personalized walkthroughs of our platform.
                </p>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2 text-gray-800">Do you offer enterprise support?</h3>
                <p className="text-gray-700">
                  Yes! Enterprise customers receive priority support. Contact us to learn more about our enterprise plans and dedicated support options.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Additional Information */}
        <Card className="mb-12 border-2 border-cyan-200 !bg-white">
          <CardContent className="pt-6">
            <h2 className="text-2xl font-bold mb-4 text-cyan-600 flex items-center gap-2">
              <MapPin className="h-6 w-6" />
              Other Ways to Reach Us
            </h2>
            <div className="space-y-3 text-gray-700">
              <p>
                <strong>Support:</strong> For technical issues or account questions, email us at{" "}
                <a href="mailto:nitish@moreclicks.io" className="text-cyan-600 hover:underline font-semibold">
                  nitish@moreclicks.io
                </a>
              </p>
              <p>
                <strong>Sales:</strong> Interested in our enterprise plans? Contact us to discuss custom solutions and pricing.
              </p>
              <p>
                <strong>Partnerships:</strong> We're always open to partnerships and collaborations. Reach out to explore opportunities.
              </p>
              <p>
                <strong>Feedback:</strong> Your feedback helps us improve. Share your thoughts, feature requests, or suggestions with us.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Footer Links */}
        <div className="text-center mt-12 space-x-4">
          <Link href="/" className="text-purple-600 hover:underline font-semibold">Home</Link>
          <span className="text-gray-400">|</span>
          <Link href="/about" className="text-purple-600 hover:underline font-semibold">About</Link>
          <span className="text-gray-400">|</span>
          <Link href="/blog" className="text-purple-600 hover:underline font-semibold">Blog</Link>
          <span className="text-gray-400">|</span>
          <Link href="/pricing" className="text-purple-600 hover:underline font-semibold">Pricing</Link>
        </div>
      </div>

      {/* JSON-LD Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "ContactPage",
            "name": "Contact MoreClicks.io",
            "description": "Contact page for MoreClicks.io - Get in touch with our team",
            "url": "https://moreclicks.io/contact",
            "mainEntity": {
              "@type": "Organization",
              "name": "MoreClicks.io",
              "email": "nitish@moreclicks.io",
              "url": "https://moreclicks.io"
            }
          })
        }}
      />
      </div>
    </div>
  );
}

