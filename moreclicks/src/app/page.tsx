import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, BarChart3, Users, Sparkles } from "lucide-react";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-border bg-card">
        <div className="container mx-auto flex h-16 items-center justify-between px-6">
          <h1 className="text-xl font-bold">SEO Analyzer</h1>
          <div className="flex items-center gap-4">
            <Link href="/sign-in">
              <Button variant="ghost">Sign In</Button>
            </Link>
            <Link href="/dashboard">
              <Button>Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <section className="container mx-auto px-6 py-20 text-center">
          <h2 className="text-5xl font-bold text-foreground mb-4">
            AI-Powered SEO Analysis
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Get comprehensive SEO audits, keyword research, and competitor analysis
            with AI-powered insights.
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/dashboard">
              <Button size="lg">Start Analyzing</Button>
            </Link>
            <Link href="/pricing">
              <Button size="lg" variant="outline">View Pricing</Button>
            </Link>
          </div>
        </section>

        <section className="container mx-auto px-6 py-20">
          <div className="grid gap-6 md:grid-cols-3">
            <Card>
              <CardHeader>
                <Search className="h-8 w-8 mb-2 text-primary" />
                <CardTitle>Website Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Comprehensive technical SEO audit with 50+ metrics including
                  Core Web Vitals, meta tags, headings, and more.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <BarChart3 className="h-8 w-8 mb-2 text-primary" />
                <CardTitle>Keyword Research</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Find high-value keywords with search volume, difficulty scores,
                  CPC data, and content briefs.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Users className="h-8 w-8 mb-2 text-primary" />
                <CardTitle>Competitor Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Compare your website with competitors and identify opportunities
                  to improve your SEO strategy.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>
    </div>
  );
}
