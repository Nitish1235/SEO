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

export const metadata: Metadata = {
  title: "SEO Analyzer - AI-Powered SEO Analysis",
  description: "Comprehensive SEO analysis tool with AI-powered insights",
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
