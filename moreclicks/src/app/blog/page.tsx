import type { Metadata } from "next";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, Clock, ArrowRight, BookOpen } from "lucide-react";
import Image from "next/image";

export const metadata: Metadata = {
  title: "Blog | MoreClicks.io - SEO Tips, Guides & Industry Insights",
  description: "Read the latest SEO tips, guides, and industry insights from MoreClicks.io. Learn about SEO best practices, keyword research, competitor analysis, and more.",
  keywords: "SEO blog, SEO tips, SEO guides, keyword research, SEO strategy, digital marketing blog",
  openGraph: {
    title: "Blog | MoreClicks.io",
    description: "SEO tips, guides, and industry insights from MoreClicks.io",
    type: "website",
  },
  alternates: {
    canonical: "https://moreclicks.io/blog",
  },
};

// Blog posts data
const blogPosts = [
  {
    id: "complete-guide-seo-analysis-2026",
    title: "Complete Guide to SEO Analysis in 2026",
    excerpt: "Learn how to perform comprehensive SEO analysis for your website. Discover the key metrics, tools, and strategies that matter most in 2026.",
    author: "MoreClicks Team",
    date: "December 27, 2026",
    readTime: "10 min read",
    category: "SEO Basics",
    image: "/best-ai-seo.jpg",
  },
  {
    id: "keyword-research-mastery",
    title: "Keyword Research Mastery: Finding High-Value Keywords",
    excerpt: "Master the art of keyword research with our comprehensive guide. Learn how to identify high-value keywords that drive traffic and conversions.",
    author: "MoreClicks Team",
    date: "December 27, 2026",
    readTime: "12 min read",
    category: "Keyword Research",
    image: "/best-ai-seo.jpg",
  },
  {
    id: "competitor-analysis-seo",
    title: "How to Perform Effective Competitor SEO Analysis",
    excerpt: "Discover what your competitors are doing right and identify opportunities to outperform them. Learn the secrets of effective competitor analysis.",
    author: "MoreClicks Team",
    date: "December 27, 2026",
    readTime: "11 min read",
    category: "Competitor Analysis",
    image: "/best-ai-seo.jpg",
  },
  {
    id: "ai-seo-tools-2026",
    title: "The Future of SEO: AI-Powered Tools and Strategies",
    excerpt: "Explore how AI is revolutionizing SEO analysis and what it means for your digital marketing strategy. Stay ahead with cutting-edge AI tools.",
    author: "MoreClicks Team",
    date: "December 27, 2026",
    readTime: "9 min read",
    category: "AI & Technology",
    image: "/best-ai-seo.jpg",
  },
  {
    id: "on-page-seo-optimization",
    title: "On-Page SEO Optimization: A Step-by-Step Guide",
    excerpt: "Optimize your website's on-page elements for better search rankings. Learn about meta tags, headings, content structure, and more.",
    author: "MoreClicks Team",
    date: "December 27, 2026",
    readTime: "12 min read",
    category: "On-Page SEO",
    image: "/best-ai-seo.jpg",
  },
  {
    id: "technical-seo-checklist",
    title: "Technical SEO Checklist: Essential Elements for 2026",
    excerpt: "Ensure your website meets all technical SEO requirements. Follow our comprehensive checklist to improve your site's technical foundation.",
    author: "MoreClicks Team",
    date: "December 27, 2026",
    readTime: "11 min read",
    category: "Technical SEO",
    image: "/best-ai-seo.jpg",
  },
  {
    id: "best-ai-seo-tools-for-small-businesses",
    title: "Best AI SEO Tools for Small Businesses in 2026",
    excerpt:
      "See how AI SEO tools can help small businesses win more organic traffic. We compare key features, pricing, and use cases so you can pick the right AI SEO analyzer for your site.",
    author: "MoreClicks Team",
    date: "January 7, 2026",
    readTime: "13 min read",
    category: "AI & Technology",
    image: "/best-ai-seo.jpg",
  },
];

export default function BlogPage() {
  return (
    <div className="light" suppressHydrationWarning>
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="container mx-auto px-4 py-12 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <BookOpen className="h-16 w-16 text-blue-600" />
          </div>
          <h1 className="text-4xl md:text-5xl font-black mb-4 text-blue-600">
            SEO Blog & Insights
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Stay updated with the latest SEO trends, tips, and strategies to improve your search rankings and drive more traffic.
          </p>
        </div>

        {/* Featured Post */}
        {blogPosts.length > 0 && (
          <Card className="mb-12 border-2 border-blue-200 shadow-xl overflow-hidden !bg-white">
            <div className="md:flex">
              <div className="md:w-1/2 relative h-64 md:h-auto">
                <Image
                  src={blogPosts[0].image}
                  alt={blogPosts[0].title}
                  fill
                  className="object-cover"
                />
              </div>
              <CardContent className="pt-6 md:w-1/2 flex flex-col justify-center">
                <div className="mb-3">
                  <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold">
                    {blogPosts[0].category}
                  </span>
                </div>
                <h2 className="text-3xl font-bold mb-3 text-gray-800">
                  <Link href={`/blog/${blogPosts[0].id}`} className="hover:text-blue-600 transition-colors">
                    {blogPosts[0].title}
                  </Link>
                </h2>
                <p className="text-gray-700 mb-4 leading-relaxed">
                  {blogPosts[0].excerpt}
                </p>
                <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {blogPosts[0].date}
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {blogPosts[0].readTime}
                  </div>
                </div>
                <Link
                  href={`/blog/${blogPosts[0].id}`}
                  className="inline-flex items-center gap-2 text-blue-600 font-semibold hover:text-blue-700 transition-colors"
                >
                  Read More <ArrowRight className="h-4 w-4" />
                </Link>
              </CardContent>
            </div>
          </Card>
        )}

        {/* Blog Posts Grid */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold mb-8 text-gray-800">Latest Articles</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {blogPosts.slice(1).map((post) => (
              <Card key={post.id} className="border-2 border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all overflow-hidden !bg-white">
                <div className="relative h-48">
                  <Image
                    src={post.image}
                    alt={post.title}
                    fill
                    className="object-cover"
                  />
                </div>
                <CardContent className="pt-6">
                  <div className="mb-3">
                    <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">
                      {post.category}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold mb-2 text-gray-800 line-clamp-2">
                    <Link href={`/blog/${post.id}`} className="hover:text-blue-600 transition-colors">
                      {post.title}
                    </Link>
                  </h3>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                    {post.excerpt}
                  </p>
                  <div className="flex items-center gap-4 text-xs text-gray-500 mb-4">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {post.date}
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {post.readTime}
                    </div>
                  </div>
                  <Link
                    href={`/blog/${post.id}`}
                    className="inline-flex items-center gap-2 text-blue-600 font-semibold text-sm hover:text-blue-700 transition-colors"
                  >
                    Read More <ArrowRight className="h-4 w-4" />
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Categories Section */}
        <Card className="mb-12 border-2 border-purple-200 bg-purple-50/50">
          <CardContent className="pt-6">
            <h2 className="text-2xl font-bold mb-4 text-purple-700">Browse by Category</h2>
            <div className="flex flex-wrap gap-3">
              {["SEO Basics", "Keyword Research", "Competitor Analysis", "On-Page SEO", "Technical SEO", "AI & Technology"].map((category) => (
                <Link
                  key={category}
                  href={`/blog?category=${category.toLowerCase().replace(/\s+/g, '-')}`}
                  className="px-4 py-2 bg-white border-2 border-purple-200 rounded-lg text-purple-700 font-semibold hover:bg-purple-100 transition-colors"
                >
                  {category}
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Newsletter CTA */}
        <Card className="mb-12 border-2 border-blue-200 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
          <CardContent className="pt-8 text-center">
            <h2 className="text-3xl font-bold mb-4">Stay Updated</h2>
            <p className="text-lg mb-6 text-blue-100">
              Get the latest SEO tips and insights delivered to your inbox
            </p>
            <div className="max-w-md mx-auto flex gap-2">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-white"
              />
              <button className="bg-white text-blue-600 px-6 py-3 rounded-lg font-bold hover:bg-blue-50 transition-colors">
                Subscribe
              </button>
            </div>
          </CardContent>
        </Card>

        {/* Footer Links */}
        <div className="text-center mt-12 space-x-4">
          <Link href="/" className="text-blue-600 hover:underline font-semibold">Home</Link>
          <span className="text-gray-400">|</span>
          <Link href="/about" className="text-blue-600 hover:underline font-semibold">About</Link>
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
            "@type": "Blog",
            "name": "MoreClicks.io Blog",
            "description": "SEO tips, guides, and industry insights",
            "url": "https://moreclicks.io/blog",
            "publisher": {
              "@type": "Organization",
              "name": "MoreClicks.io",
              "url": "https://moreclicks.io",
              "logo": "https://moreclicks.io/best seo tool.svg"
            },
            "blogPost": blogPosts.map(post => ({
              "@type": "BlogPosting",
              "headline": post.title,
              "description": post.excerpt,
              "url": `https://moreclicks.io/blog/${post.id}`,
              "datePublished": post.date,
              "author": {
                "@type": "Organization",
                "name": post.author
              }
            }))
          })
        }}
      />
      </div>
    </div>
  );
}

