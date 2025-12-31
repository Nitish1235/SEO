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
  title: "MoreClicks.io - AI-Powered SEO Analysis & Keyword Research",
  description: "Comprehensive SEO analysis tool with AI-powered insights, keyword research, and competitor analysis. Boost your website's search engine rankings with our advanced SEO tools.",
  keywords: "SEO analysis, keyword research, competitor analysis, SEO tools, AI SEO, website analysis, search engine optimization",
  authors: [{ name: "MoreClicks.io" }],
  creator: "MoreClicks.io",
  publisher: "MoreClicks.io",
  metadataBase: new URL(baseUrl),
  openGraph: {
    type: "website",
    locale: "en_US",
    url: baseUrl,
    siteName: "MoreClicks.io",
    title: "MoreClicks.io - AI-Powered SEO Analysis & Keyword Research",
    description: "Comprehensive SEO analysis tool with AI-powered insights, keyword research, and competitor analysis. Boost your website's search engine rankings.",
    images: [
      {
        url: `${baseUrl}/best%20seo%20tool.svg`,
        width: 352,
        height: 294,
        alt: "MoreClicks.io - Best SEO Tool",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "MoreClicks.io - AI-Powered SEO Analysis & Keyword Research",
    description: "Comprehensive SEO analysis tool with AI-powered insights, keyword research, and competitor analysis.",
    images: [`${baseUrl}/best%20seo%20tool.svg`],
    creator: "@moreclicks",
  },
  icons: {
    icon: [
      { url: '/best%20seo%20tool.svg', type: 'image/svg+xml' },
      { url: '/icon.svg', type: 'image/svg+xml' },
    ],
    apple: [
      { url: '/best%20seo%20tool.svg', type: 'image/svg+xml' },
    ],
    shortcut: '/best%20seo%20tool.svg',
  },
  manifest: `${baseUrl}/manifest.json`,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
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
