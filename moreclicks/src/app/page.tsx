'use client'

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { 
  Search, 
  BarChart3, 
  Users, 
  CheckCircle2, 
  Zap, 
  Shield, 
  TrendingUp,
  ArrowRight,
  Check
} from "lucide-react";
import { PLANS } from "@/lib/config/pricing";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="relative border-b-2 border-blue-300/50 dark:border-blue-800/50 bg-blue-600 dark:bg-gray-900 sticky top-0 z-50 shadow-xl overflow-hidden">
        <div className="absolute inset-0 bg-blue-700/30 dark:bg-gray-800/50"></div>
        <div className="relative z-10 container mx-auto flex h-16 items-center justify-between px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-1 sm:gap-2 hover:scale-105 transition-all duration-300 group slide-in-top">
            <div className="relative w-8 h-8 sm:w-10 sm:h-10 flex-shrink-0 translate-x-1 translate-y-1">
              <Image 
                src="/best seo tool.svg" 
                alt="MoreClicks Logo" 
                width={40} 
                height={40} 
                className="object-contain drop-shadow-lg group-hover:rotate-12 transition-transform duration-300"
              />
            </div>
            <span className="text-lg sm:text-2xl font-black tracking-tight">
              <span className="text-yellow-400 dark:text-yellow-300">more</span>
              <span className="text-cyan-300 dark:text-cyan-400">clicks</span>
              <span className="text-white dark:text-gray-100 hidden sm:inline">.io</span>
            </span>
          </Link>
          <div className="flex items-center gap-2 sm:gap-4">
            <ThemeToggle />
            <Link href="/pricing" className="hidden sm:block">
              <Button variant="ghost" className="text-white dark:text-gray-200 hover:text-purple-200 dark:hover:text-purple-300 hover:bg-white/20 dark:hover:bg-white/10 font-semibold transition-all duration-200 hover:scale-105 text-sm sm:text-base">Pricing</Button>
            </Link>
            <Link href="/sign-in" className="hidden md:block">
              <Button variant="ghost" className="text-white dark:text-gray-200 hover:text-purple-200 dark:hover:text-purple-300 hover:bg-white/20 dark:hover:bg-white/10 font-semibold transition-all duration-200 hover:scale-105 text-sm sm:text-base">Sign In</Button>
            </Link>
            <Link href="/sign-up">
              <Button className="bg-blue-200 dark:bg-blue-700 text-blue-700 dark:text-blue-100 hover:bg-blue-100 dark:hover:bg-blue-600 font-bold shadow-lg transition-all duration-200 hover:scale-105 hover:shadow-xl text-xs sm:text-sm px-3 sm:px-4 py-1.5 sm:py-2">Get Started</Button>
            </Link>
          </div>
        </div>
        {/* Animated wave below topbar */}
        <div className="animated-wave"></div>
        {/* Floating particles */}
        <div className="floating-particles">
          <div className="particle" style={{ left: '10%' }}></div>
          <div className="particle" style={{ left: '30%' }}></div>
          <div className="particle" style={{ left: '50%' }}></div>
          <div className="particle" style={{ left: '70%' }}></div>
          <div className="particle" style={{ left: '90%' }}></div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section 
          className="w-full py-20 text-center relative"
          style={{
            backgroundImage: 'url(/mbar.jpg)',
            backgroundSize: '100% 100%',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            filter: 'brightness(1.4)'
          }}
        >
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="container mx-auto px-4 sm:px-6 max-w-4xl relative z-10">
            <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold mb-4 sm:mb-6 leading-tight">
              <span className="gradient-text block fade-in-up" style={{ animationDelay: '0.1s' }}>AI-Powered</span>
              <span className="bg-blue-600 text-white px-3 sm:px-6 py-2 sm:py-3 inline-block fade-in-up my-2 text-lg sm:text-2xl md:text-3xl" style={{ animationDelay: '0.2s' }}>SEO Analysis</span>
              <span className="gradient-text-3 block text-2xl sm:text-4xl md:text-5xl lg:text-6xl mt-3 fade-in-up" style={{ animationDelay: '0.3s' }}>That Actually Works</span>
            </h1>
            <p className="text-base sm:text-lg md:text-xl font-semibold text-purple-600 dark:text-purple-400 mb-6 sm:mb-8 max-w-2xl mx-auto px-2">
              Get comprehensive SEO audits, keyword research, and competitor analysis
              with AI-powered insights. Improve your rankings and grow your traffic.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center fade-in-up" style={{ animationDelay: '0.5s' }}>
              <Link href="/sign-up" className="group w-full sm:w-auto">
                <Button size="lg" className="text-base sm:text-lg px-6 sm:px-8 w-full sm:w-auto transition-all duration-200 hover:scale-105 hover:shadow-xl">
                  Start Free Trial
                  <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link href="/pricing" className="w-full sm:w-auto">
                <Button size="lg" variant="outline" className="text-base sm:text-lg px-6 sm:px-8 w-full sm:w-auto transition-all duration-200 hover:scale-105 hover:shadow-lg">
                  View Pricing
                </Button>
              </Link>
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground mt-4 px-2">
              No credit card required • 3 free analyses • Cancel anytime
            </p>
          </div>
        </section>

        {/* Features Section */}
        <section className="bg-muted/50 dark:bg-gray-900/50 py-12 sm:py-16 md:py-20">
          <div className="container mx-auto px-4 sm:px-6">
            <div className="text-center mb-8 sm:mb-12">
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold mb-3 sm:mb-4">
                <span className="gradient-text-4">Everything You Need</span>
                <span className="block gradient-text mt-2">for SEO Success</span>
              </h2>
              <p className="text-base sm:text-lg md:text-xl font-bold text-purple-600 dark:text-purple-400 max-w-2xl mx-auto tracking-wide px-2">
                Powerful tools to analyze, optimize, and dominate search rankings
              </p>
            </div>

            <div className="grid gap-6 sm:gap-8 md:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto">
              <Card className="border-2 scale-in hover:shadow-xl transition-all duration-300 hover:-translate-y-2" style={{ animationDelay: '0.1s' }}>
                <CardHeader>
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                    <Search className="h-6 w-6 text-primary group-hover:rotate-12 transition-transform duration-300" />
                  </div>
                  <CardTitle className="text-2xl">
                    <span className="gradient-text-4">Website SEO</span>
                    <span className="block gradient-text text-xl mt-1">Analysis</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    Comprehensive technical SEO audit with 50+ metrics
                  </p>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      <span>Title tags & meta descriptions</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      <span>Core Web Vitals analysis</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      <span>Link analysis (internal/external)</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      <span>Image optimization check</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      <span>SSL & security validation</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      <span>AI-powered recommendations</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="border-2 scale-in hover:shadow-xl transition-all duration-300 hover:-translate-y-2" style={{ animationDelay: '0.2s' }}>
                <CardHeader>
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                    <BarChart3 className="h-6 w-6 text-primary group-hover:rotate-12 transition-transform duration-300" />
                  </div>
                  <CardTitle className="text-2xl">
                    <span className="gradient-text-5">Keyword</span>
                    <span className="block gradient-text-6 text-xl mt-1">Research</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    Find high-value keywords with complete metrics and insights
                  </p>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      <span>Search volume data</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      <span>Keyword difficulty scores</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      <span>CPC (Cost Per Click) data</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      <span>SERP analysis (top 10 results)</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      <span>People Also Ask questions</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      <span>AI-generated content briefs</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="border-2 scale-in hover:shadow-xl transition-all duration-300 hover:-translate-y-2" style={{ animationDelay: '0.3s' }}>
                <CardHeader>
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                    <Users className="h-6 w-6 text-primary group-hover:rotate-12 transition-transform duration-300" />
                  </div>
                  <CardTitle className="text-2xl">
                    <span className="gradient-text-2">Competitor</span>
                    <span className="block gradient-text-4 text-xl mt-1">Analysis</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    Compare your website with competitors and find opportunities
                  </p>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      <span>Automatic competitor discovery</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      <span>Metric comparison (title, content, links)</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      <span>Industry averages</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      <span>Content gap analysis</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      <span>Keyword gap identification</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      <span>Strategic recommendations</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="container mx-auto px-4 sm:px-6 py-12 sm:py-16 md:py-20">
            <div className="text-center mb-8 sm:mb-12">
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold mb-3 sm:mb-4">
                <span className="gradient-text-5">Why Choose</span>
                <span className="block gradient-text-6 mt-2">SEO Analyzer?</span>
              </h2>
            </div>

          <div className="grid gap-6 sm:gap-8 md:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto">
            <div className="text-center">
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Zap className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2 gradient-text-6">Lightning Fast</h3>
              <p className="text-purple-600 dark:text-purple-400 font-medium">
                Get comprehensive SEO analysis in seconds, not hours. Our optimized
                infrastructure delivers results instantly.
              </p>
            </div>

            <div className="text-center">
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Shield className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2 gradient-text-3">AI-Powered Insights</h3>
              <p className="text-purple-600 dark:text-purple-400 font-medium">
                Get strategic recommendations powered by Claude AI. Not just data,
                but actionable insights to improve your SEO.
              </p>
            </div>

            <div className="text-center">
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2 gradient-text-5">Proven Results</h3>
              <p className="text-purple-600 dark:text-purple-400 font-medium">
                Trusted by businesses worldwide. Improve your rankings and grow
                organic traffic with data-driven SEO strategies.
              </p>
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section className="bg-muted/50 py-12 sm:py-16 md:py-20">
          <div className="container mx-auto px-4 sm:px-6">
            <div className="text-center mb-8 sm:mb-12">
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold mb-3 sm:mb-4">
                <span className="gradient-text-4">Simple, Transparent</span>
                <span className="block gradient-text mt-2">Pricing</span>
              </h2>
              <p className="text-base sm:text-lg md:text-xl font-bold text-purple-600 dark:text-purple-400 tracking-wide px-2">
                Choose the plan that fits your needs. All plans include AI insights.
              </p>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 max-w-5xl mx-auto">
              {Object.entries(PLANS).map(([key, plan]) => (
                <Card 
                  key={key} 
                  className={key === 'pro' ? 'border-primary border-2 shadow-lg scale-105' : ''}
                >
                  {key === 'pro' && (
                    <div className="bg-primary text-primary-foreground text-center py-2 text-sm font-semibold rounded-t-lg">
                      Most Popular
                    </div>
                  )}
                  <CardHeader>
                    <CardTitle className="text-2xl">{plan.name}</CardTitle>
                    <div className="mt-4">
                      <span className="text-4xl font-bold">${plan.price}</span>
                      <span className="text-muted-foreground">/month</span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <Check className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                          <span className="text-sm text-muted-foreground">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                  <CardFooter>
                    <Link href="/sign-up" className="w-full">
                      <Button 
                        className="w-full" 
                        variant={key === 'pro' ? 'default' : 'outline'}
                        size="lg"
                      >
                        {key === 'agency' ? 'Contact Sales' : 'Get Started'}
                      </Button>
                    </Link>
                  </CardFooter>
                </Card>
              ))}
            </div>

            <div className="text-center mt-8">
              <p className="text-muted-foreground">
                All plans include: AI-powered insights, export functionality, history tracking, and email support
              </p>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section 
          className="w-full py-20 relative"
          style={{
            backgroundImage: 'url(/best-ai-seo.jpg)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            filter: 'brightness(1.4)'
          }}
        >
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="container mx-auto px-4 sm:px-6">
            <div className="bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl sm:rounded-2xl p-6 sm:p-8 md:p-12 text-center max-w-4xl mx-auto shadow-2xl relative z-10">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold mb-3 sm:mb-4 tracking-tight">
              <span className="text-yellow-300 drop-shadow-2xl">Ready to Improve</span>
              <span className="block text-white drop-shadow-2xl mt-2">Your SEO?</span>
            </h2>
            <p className="text-base sm:text-lg md:text-xl mb-6 sm:mb-8 font-semibold text-purple-100 px-2">
              Join thousands of businesses using SEO Analyzer to dominate search rankings
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center">
              <Link href="/sign-up" className="w-full sm:w-auto">
                <Button size="lg" variant="secondary" className="text-base sm:text-lg px-6 sm:px-8 w-full sm:w-auto">
                  Start Free Trial
                  <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
                </Button>
              </Link>
              <Link href="/pricing" className="w-full sm:w-auto">
                <Button size="lg" variant="outline" className="text-base sm:text-lg px-6 sm:px-8 w-full sm:w-auto bg-transparent border-white/20 text-white hover:bg-white/10">
                  View All Plans
                </Button>
              </Link>
            </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-card py-8 sm:py-12">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="grid gap-6 sm:gap-8 grid-cols-2 md:grid-cols-4">
            <div>
              <h3 className="font-bold text-lg mb-4">SEO Analyzer</h3>
              <p className="text-sm text-muted-foreground">
                AI-powered SEO analysis tools to help you rank higher and grow faster.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/pricing" className="hover:text-foreground">Pricing</Link></li>
                <li><Link href="/dashboard" className="hover:text-foreground">Features</Link></li>
                <li><Link href="/sign-up" className="hover:text-foreground">Sign Up</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/about" className="hover:text-foreground">About</Link></li>
                <li><Link href="/blog" className="hover:text-foreground">Blog</Link></li>
                <li><Link href="/contact" className="hover:text-foreground">Contact</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/privacy" className="hover:text-foreground">Privacy Policy</Link></li>
                <li><Link href="/terms" className="hover:text-foreground">Terms of Service</Link></li>
                <li><Link href="/cookies" className="hover:text-foreground">Cookie Policy</Link></li>
                <li><Link href="/disclaimer" className="hover:text-foreground">Disclaimer</Link></li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-border text-center text-sm text-muted-foreground">
            <p>© {new Date().getFullYear()} SEO Analyzer. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
