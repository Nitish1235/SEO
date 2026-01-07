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
  title: "MoreClicks – AI SEO Analyzer & SEO Audit Tool",
  description: "Get comprehensive SEO audits, keyword research, and competitor analysis with AI-powered insights. Improve your rankings and grow your traffic. Start Free Trial.",
  keywords: "SEO analysis, keyword research, competitor analysis, SEO tools, AI SEO, website analysis, search engine optimization, SEO audit, SEO checker",
  authors: [{ name: "MoreClicks" }],
  creator: "MoreClicks",
  publisher: "MoreClicks",
  metadataBase: new URL(baseUrl),
  alternates: {
    canonical: baseUrl,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      maxImagePreview: "large",
      maxSnippet: -1,
      maxVideoPreview: -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: baseUrl,
    siteName: "MoreClicks",
    title: "MoreClicks – AI SEO Analyzer & SEO Audit Tool",
    description: "Get comprehensive SEO audits, keyword research, and competitor analysis with AI-powered insights. Improve your rankings and grow your traffic.",
    images: [
      {
        url: `${baseUrl}/best-ai-seo.jpg`,
        width: 1200,
        height: 630,
        alt: "MoreClicks – AI SEO Analyzer & SEO Audit Tool",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "MoreClicks – AI SEO Analyzer & SEO Audit Tool",
    description: "Get comprehensive SEO audits, keyword research, and competitor analysis with AI-powered insights. Improve your rankings and grow your traffic.",
    images: [`${baseUrl}/best-ai-seo.jpg`],
    creator: "@moreclicks",
  },
  icons: {
    icon: "/logo.svg",
    apple: "/logo.svg",
    shortcut: "/logo.svg",
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
    "name": "MoreClicks",
    "url": baseUrl,
    "logo": `${baseUrl}/logo.svg`,
    "sameAs": [
      "https://twitter.com/moreclicks",
      "https://www.linkedin.com/company/moreclicks"
    ],
    "contactPoint": {
      "@type": "ContactPoint",
      "contactType": "Customer Support",
      "email": "nitish@moreclicks.io"
    }
  };

  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "MoreClicks",
    "url": baseUrl,
    "publisher": {
      "@type": "Organization",
      "name": "MoreClicks",
      "logo": {
        "@type": "ImageObject",
        "url": `${baseUrl}/logo.svg`,
        "width": 512,
        "height": 512
      }
    }
  };

  // Structured data for the software application / product
  const softwareApplicationSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "MoreClicks",
    "applicationCategory": "SEO Tool",
    "operatingSystem": "Web",
    "url": baseUrl,
    "image": `${baseUrl}/best-ai-seo.jpg`,
    "description": "AI-powered SEO analyzer for audits, keyword research, and competitor analysis.",
    "offers": {
      "@type": "AggregateOffer",
      "priceCurrency": "USD",
      "lowPrice": "29",
      "highPrice": "129",
      "offerCount": "3",
      "url": `${baseUrl}/pricing`
    },
    "publisher": {
      "@type": "Organization",
      "name": "MoreClicks",
      "logo": {
        "@type": "ImageObject",
        "url": `${baseUrl}/logo.svg`
      }
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
        {/* Structured data for SoftwareApplication */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(softwareApplicationSchema),
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
