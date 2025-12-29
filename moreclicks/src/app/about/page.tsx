import type { Metadata } from "next";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Target, Users, Zap, TrendingUp, Award, Heart, Rocket, Shield } from "lucide-react";
import Image from "next/image";

export const metadata: Metadata = {
  title: "About Us | MoreClicks.io - AI-Powered SEO Analysis Platform",
  description: "Learn about MoreClicks.io - Your trusted partner for AI-powered SEO analysis, keyword research, and competitor analysis. Discover our mission, values, and commitment to helping businesses grow.",
  keywords: "about moreclicks, SEO tool company, AI SEO platform, SEO analysis about, digital marketing tools",
  openGraph: {
    title: "About Us | MoreClicks.io",
    description: "Learn about MoreClicks.io and our mission to revolutionize SEO analysis",
    type: "website",
  },
};

export default function AboutPage() {
  return (
    <div className="light" suppressHydrationWarning>
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="container mx-auto px-4 py-12 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="flex justify-center mb-6">
            <div className="relative w-20 h-20 flex-shrink-0">
              <Image 
                src="/best seo tool.svg" 
                alt="MoreClicks Logo" 
                width={80} 
                height={80} 
                className="object-contain"
              />
            </div>
          </div>
          <h1 className="text-5xl md:text-6xl font-black mb-6 text-blue-600">
            About MoreClicks.io
          </h1>
          <p className="text-xl text-gray-700 max-w-3xl mx-auto leading-relaxed">
            Empowering businesses with AI-powered SEO insights to dominate search rankings and drive sustainable growth.
          </p>
        </div>

        {/* Mission Section */}
        <Card className="mb-12 border-2 border-blue-200 shadow-xl !bg-white">
          <CardContent className="pt-8">
            <div className="flex items-start gap-4 mb-6">
              <Target className="h-10 w-10 text-blue-600 flex-shrink-0 mt-1" />
              <div>
                <h2 className="text-3xl font-bold mb-4 text-blue-600">Our Mission</h2>
                <p className="text-lg text-gray-700 leading-relaxed mb-4">
                  At <strong className="text-blue-600">MoreClicks.io</strong>, we believe that every business deserves access to powerful SEO tools that can transform their online presence. Our mission is to democratize SEO analysis by providing enterprise-grade insights through an intuitive, AI-powered platform.
                </p>
                <p className="text-lg text-gray-700 leading-relaxed">
                  We're committed to helping businesses of all sizes understand their SEO performance, identify opportunities, and make data-driven decisions that drive real results.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Story Section */}
        <div className="mb-12">
          <h2 className="text-4xl font-bold mb-8 text-center text-gray-800">Our Story</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <Card className="border-2 border-purple-200 !bg-white">
              <CardContent className="pt-6">
                <h3 className="text-2xl font-bold mb-4 text-purple-600 flex items-center gap-2">
                  <Rocket className="h-7 w-7" />
                  The Beginning
                </h3>
                <p className="text-gray-700 leading-relaxed mb-4">
                  MoreClicks.io was born from a simple observation: most SEO tools are either too complex for beginners or too expensive for small businesses. We saw a gap in the market for a platform that combines powerful AI-driven analysis with user-friendly design.
                </p>
                <p className="text-gray-700 leading-relaxed">
                  Our team of SEO experts, data scientists, and developers came together to build a solution that makes professional-grade SEO analysis accessible to everyone.
                </p>
              </CardContent>
            </Card>
            <Card className="border-2 border-cyan-200 !bg-white">
              <CardContent className="pt-6">
                <h3 className="text-2xl font-bold mb-4 text-cyan-600 flex items-center gap-2">
                  <TrendingUp className="h-7 w-7" />
                  Today & Beyond
                </h3>
                <p className="text-gray-700 leading-relaxed mb-4">
                  Today, MoreClicks.io serves thousands of businesses worldwide, from startups to established enterprises. We continue to innovate, adding new features and capabilities that help our users stay ahead in the ever-evolving world of SEO.
                </p>
                <p className="text-gray-700 leading-relaxed">
                  Our vision extends beyond just providing tools - we're building a community of SEO professionals and businesses committed to achieving digital excellence.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Values Section */}
        <div className="mb-12">
          <h2 className="text-4xl font-bold mb-8 text-center text-gray-800">Our Core Values</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="border-2 border-blue-200 text-center !bg-white">
              <CardContent className="pt-6">
                <div className="flex justify-center mb-4">
                  <Zap className="h-12 w-12 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-blue-600">Innovation</h3>
                <p className="text-gray-700 text-sm">
                  We continuously push boundaries with cutting-edge AI technology and innovative solutions.
                </p>
              </CardContent>
            </Card>
            <Card className="border-2 border-purple-200 text-center !bg-white">
              <CardContent className="pt-6">
                <div className="flex justify-center mb-4">
                  <Users className="h-12 w-12 text-purple-600" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-purple-600">User-Centric</h3>
                <p className="text-gray-700 text-sm">
                  Our users are at the heart of everything we do. We build features that solve real problems.
                </p>
              </CardContent>
            </Card>
            <Card className="border-2 border-cyan-200 text-center !bg-white">
              <CardContent className="pt-6">
                <div className="flex justify-center mb-4">
                  <Shield className="h-12 w-12 text-cyan-600" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-cyan-600">Trust & Security</h3>
                <p className="text-gray-700 text-sm">
                  We prioritize data security and privacy, ensuring your information is always protected.
                </p>
              </CardContent>
            </Card>
            <Card className="border-2 border-orange-200 text-center !bg-white">
              <CardContent className="pt-6">
                <div className="flex justify-center mb-4">
                  <Award className="h-12 w-12 text-orange-600" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-orange-600">Excellence</h3>
                <p className="text-gray-700 text-sm">
                  We strive for excellence in every feature, every update, and every interaction.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* What We Offer Section */}
        <div className="mb-12">
          <h2 className="text-4xl font-bold mb-8 text-center text-gray-800">What We Offer</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="border-2 border-blue-200 !bg-white">
              <CardContent className="pt-6">
                <h3 className="text-xl font-bold mb-3 text-blue-600">Comprehensive SEO Analysis</h3>
                <p className="text-gray-700">
                  Get in-depth analysis of your website's SEO performance with actionable insights and recommendations.
                </p>
              </CardContent>
            </Card>
            <Card className="border-2 border-purple-200 !bg-white">
              <CardContent className="pt-6">
                <h3 className="text-xl font-bold mb-3 text-purple-600">Keyword Research</h3>
                <p className="text-gray-700">
                  Discover high-value keywords with detailed metrics on search volume, competition, and difficulty.
                </p>
              </CardContent>
            </Card>
            <Card className="border-2 border-cyan-200 !bg-white">
              <CardContent className="pt-6">
                <h3 className="text-xl font-bold mb-3 text-cyan-600">Competitor Analysis</h3>
                <p className="text-gray-700">
                  Understand your competition and identify opportunities to outperform them in search rankings.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Why Choose Us Section */}
        <Card className="mb-12 border-2 border-blue-200 bg-blue-50/50">
          <CardContent className="pt-8">
            <h2 className="text-3xl font-bold mb-6 text-center text-blue-600">Why Choose MoreClicks.io?</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center mt-1">
                    <span className="text-white text-sm font-bold">✓</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-1">AI-Powered Insights</h4>
                    <p className="text-gray-700 text-sm">Leverage advanced AI to get intelligent recommendations tailored to your website.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center mt-1">
                    <span className="text-white text-sm font-bold">✓</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-1">Easy to Use</h4>
                    <p className="text-gray-700 text-sm">Intuitive interface designed for both beginners and SEO professionals.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center mt-1">
                    <span className="text-white text-sm font-bold">✓</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-1">Affordable Pricing</h4>
                    <p className="text-gray-700 text-sm">Professional SEO tools at prices that work for businesses of all sizes.</p>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center mt-1">
                    <span className="text-white text-sm font-bold">✓</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-1">Real-Time Data</h4>
                    <p className="text-gray-700 text-sm">Get up-to-date SEO metrics and analysis based on the latest search engine data.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center mt-1">
                    <span className="text-white text-sm font-bold">✓</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-1">Comprehensive Reports</h4>
                    <p className="text-gray-700 text-sm">Export detailed reports and share insights with your team or clients.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center mt-1">
                    <span className="text-white text-sm font-bold">✓</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-1">Dedicated Support</h4>
                    <p className="text-gray-700 text-sm">Our team is here to help you succeed with responsive customer support.</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* CTA Section */}
        <Card className="mb-12 border-2 border-purple-200 bg-gradient-to-r from-purple-600 to-blue-600 text-white">
          <CardContent className="pt-8 text-center">
            <h2 className="text-3xl font-bold mb-4">Ready to Transform Your SEO?</h2>
            <p className="text-lg mb-6 text-purple-100">
              Join thousands of businesses using MoreClicks.io to improve their search rankings
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <Link href="/sign-up">
                <button className="bg-white text-purple-600 px-8 py-3 rounded-lg font-bold hover:bg-purple-50 transition-all duration-200 hover:scale-105">
                  Get Started Free
                </button>
              </Link>
              <Link href="/contact">
                <button className="bg-transparent border-2 border-white text-white px-8 py-3 rounded-lg font-bold hover:bg-white/10 transition-all duration-200">
                  Contact Us
                </button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Footer Links */}
        <div className="text-center mt-12 space-x-4">
          <Link href="/" className="text-blue-600 hover:underline font-semibold">Home</Link>
          <span className="text-gray-400">|</span>
          <Link href="/blog" className="text-blue-600 hover:underline font-semibold">Blog</Link>
          <span className="text-gray-400">|</span>
          <Link href="/contact" className="text-blue-600 hover:underline font-semibold">Contact</Link>
          <span className="text-gray-400">|</span>
          <Link href="/pricing" className="text-blue-600 hover:underline font-semibold">Pricing</Link>
        </div>
      </div>

      {/* JSON-LD Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "AboutPage",
            "name": "About MoreClicks.io",
            "description": "Learn about MoreClicks.io - AI-powered SEO analysis platform",
            "url": "https://moreclicks.io/about",
            "mainEntity": {
              "@type": "Organization",
              "name": "MoreClicks.io",
              "url": "https://moreclicks.io",
              "logo": "https://moreclicks.io/best seo tool.svg",
              "description": "AI-powered SEO analysis platform providing comprehensive SEO tools and insights",
              "sameAs": []
            }
          })
        }}
      />
      </div>
    </div>
  );
}

