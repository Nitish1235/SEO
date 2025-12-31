import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { SessionProvider } from "@/components/providers/session-provider";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { ErrorBoundary } from "@/components/shared/error-boundary";
import { ToastContainer } from "@/components/shared/toast";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXTAUTH_URL || 'https://moreclicks.io'

export const metadata: Metadata = {
  title: "SEO Analyzer - AI-Powered SEO Analysis | MoreClicks.io",
  description: "Get comprehensive SEO audits, keyword research, and competitor analysis with AI-powered insights. Improve your rankings and grow your traffic. Start Free Trial.",
  keywords: "SEO analysis, keyword research, competitor analysis, SEO tools, AI SEO, website analysis, search engine optimization, SEO audit, SEO checker",
  authors: [{ name: "MoreClicks.io" }],
  creator: "MoreClicks.io",
  publisher: "MoreClicks.io",
  metadataBase: new URL(baseUrl),
  openGraph: {
    type: "website",
    locale: "en_US",
    url: baseUrl,
    siteName: "MoreClicks.io",
    title: "SEO Analyzer - AI-Powered SEO Analysis | MoreClicks.io",
    description: "Get comprehensive SEO audits, keyword research, and competitor analysis with AI-powered insights. Improve your rankings and grow your traffic.",
    images: [
      {
        url: `${baseUrl}/icon.svg`,
        width: 512,
        height: 512,
        alt: "MoreClicks.io - SEO Analyzer",
      },
      {
        url: `${baseUrl}/best-seo-tool-colored.svg`,
        width: 352,
        height: 294,
        alt: "MoreClicks.io - Best SEO Tool",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "SEO Analyzer - AI-Powered SEO Analysis | MoreClicks.io",
    description: "Get comprehensive SEO audits, keyword research, and competitor analysis with AI-powered insights. Improve your rankings and grow your traffic.",
    images: [`${baseUrl}/icon.svg`, `${baseUrl}/best-seo-tool-colored.svg`],
    creator: "@moreclicks",
  },
  icons: {
    icon: [
      { url: '/icon.svg', type: 'image/svg+xml' },
      { url: '/best-seo-tool-colored.svg', type: 'image/svg+xml' },
    ],
    apple: [
      { url: '/icon.svg', type: 'image/svg+xml' },
      { url: '/best-seo-tool-colored.svg', type: 'image/svg+xml' },
    ],
    shortcut: '/icon.svg',
  },
  manifest: `${baseUrl}/manifest.json`,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Structured data for Google to recognize the logo
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "MoreClicks.io",
    "url": baseUrl,
    "logo": `${baseUrl}/icon.svg`,
    "sameAs": [
      // Add social media links if available
    ],
    "contactPoint": {
      "@type": "ContactPoint",
      "contactType": "Customer Service",
      "email": "support@moreclicks.io"
    }
  };

  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "MoreClicks.io",
    "url": baseUrl,
    "publisher": {
      "@type": "Organization",
      "name": "MoreClicks.io",
      "logo": {
        "@type": "ImageObject",
        "url": `${baseUrl}/icon.svg`,
        "width": 512,
        "height": 512
      }
    },
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": `${baseUrl}/search?q={search_term_string}`
      },
      "query-input": "required name=search_term_string"
    }
  };

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        {/* Structured data for Organization logo - Google Search */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationSchema),
          }}
        />
        {/* Structured data for Website */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(websiteSchema),
          }}
        />
        <ThemeProvider>
          <SessionProvider>
            <ErrorBoundary>
              {children}
              <ToastContainer />
            </ErrorBoundary>
          </SessionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
