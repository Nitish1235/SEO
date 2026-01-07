import type { Metadata } from "next";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { FileText, Scale, AlertTriangle, CreditCard, Shield, Users, Ban } from "lucide-react";

export const metadata: Metadata = {
  title: "Terms of Service | MoreClicks.io - User Agreement & Legal Terms",
  description: "Read MoreClicks.io's terms of service. Understand your rights and obligations when using our SEO analysis platform. Legal agreement for users.",
  keywords: "terms of service, user agreement, legal terms, SEO tool terms, service agreement",
  openGraph: {
    title: "Terms of Service | MoreClicks.io",
    description: "User agreement and terms of service for MoreClicks.io",
    type: "website",
  },
  alternates: {
    canonical: "https://moreclicks.io/terms",
  },
};

export default function TermsOfServicePage() {
  const lastUpdated = "December 27, 2026";

  return (
    <div className="light" suppressHydrationWarning>
      <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <Scale className="h-16 w-16 text-purple-600" />
          </div>
          <h1 className="text-4xl md:text-5xl font-black mb-4 text-purple-600">
            Terms of Service
          </h1>
          <p className="text-lg text-gray-600">
            Last Updated: <span className="font-semibold">{lastUpdated}</span>
          </p>
        </div>

        {/* Introduction */}
        <Card className="mb-8 border-2 border-purple-200 shadow-lg !bg-white">
          <CardContent className="pt-6">
            <p className="text-lg text-gray-700 leading-relaxed">
              Welcome to <strong className="text-purple-600">MoreClicks.io</strong>. These Terms of Service ("Terms") govern your access to and use of our SEO analysis platform. By accessing or using our services, you agree to be bound by these Terms. If you do not agree to these Terms, please do not use our services.
            </p>
          </CardContent>
        </Card>

        {/* Table of Contents */}
        <Card className="mb-8 border-2 border-blue-200 bg-blue-50/50">
          <CardContent className="pt-6">
            <h2 className="text-2xl font-bold mb-4 text-blue-700 flex items-center gap-2">
              <FileText className="h-6 w-6" />
              Table of Contents
            </h2>
            <ul className="space-y-2 text-gray-700">
              <li><a href="#acceptance" className="text-purple-600 hover:underline">1. Acceptance of Terms</a></li>
              <li><a href="#description" className="text-purple-600 hover:underline">2. Service Description</a></li>
              <li><a href="#account" className="text-purple-600 hover:underline">3. User Accounts</a></li>
              <li><a href="#subscriptions" className="text-purple-600 hover:underline">4. Subscriptions and Payments</a></li>
              <li><a href="#usage" className="text-purple-600 hover:underline">5. Acceptable Use</a></li>
              <li><a href="#intellectual" className="text-purple-600 hover:underline">6. Intellectual Property</a></li>
              <li><a href="#warranties" className="text-purple-600 hover:underline">7. Disclaimers and Warranties</a></li>
              <li><a href="#limitation" className="text-purple-600 hover:underline">8. Limitation of Liability</a></li>
              <li><a href="#termination" className="text-purple-600 hover:underline">9. Termination</a></li>
              <li><a href="#changes" className="text-purple-600 hover:underline">10. Changes to Terms</a></li>
              <li><a href="#contact" className="text-purple-600 hover:underline">11. Contact Information</a></li>
            </ul>
          </CardContent>
        </Card>

        {/* Section 1 */}
        <Card id="acceptance" className="mb-8 border-2 border-purple-200 !bg-white">
          <CardContent className="pt-6">
            <h2 className="text-3xl font-bold mb-4 text-purple-600">1. Acceptance of Terms</h2>
            <div className="space-y-4 text-gray-700">
              <p>By accessing or using MoreClicks.io, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service and our <Link href="/privacy" className="text-purple-600 hover:underline font-semibold">Privacy Policy</Link>.</p>
              <p>If you are using our services on behalf of an organization, you represent and warrant that you have the authority to bind that organization to these Terms.</p>
            </div>
          </CardContent>
        </Card>

        {/* Section 2 */}
        <Card id="description" className="mb-8 border-2 border-purple-200 !bg-white">
          <CardContent className="pt-6">
            <h2 className="text-3xl font-bold mb-4 text-purple-600">2. Service Description</h2>
            <div className="space-y-4 text-gray-700">
              <p>MoreClicks.io provides SEO analysis tools and services, including:</p>
              <ul className="list-disc list-inside ml-4 space-y-2">
                <li>Website SEO analysis and scoring</li>
                <li>Keyword research and analysis</li>
                <li>Competitor analysis</li>
                <li>SEO metrics and reporting</li>
                <li>Data export capabilities</li>
              </ul>
              <p className="mt-4">We reserve the right to modify, suspend, or discontinue any part of our services at any time with or without notice.</p>
            </div>
          </CardContent>
        </Card>

        {/* Section 3 */}
        <Card id="account" className="mb-8 border-2 border-purple-200 !bg-white">
          <CardContent className="pt-6">
            <h2 className="text-3xl font-bold mb-4 text-purple-600 flex items-center gap-2">
              <Users className="h-7 w-7" />
              3. User Accounts
            </h2>
            <div className="space-y-4 text-gray-700">
              <div>
                <h3 className="text-xl font-semibold mb-2 text-gray-800">3.1 Account Registration</h3>
                <p>To use our services, you must:</p>
                <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
                  <li>Be at least 18 years old</li>
                  <li>Provide accurate and complete registration information</li>
                  <li>Maintain the security of your account credentials</li>
                  <li>Notify us immediately of any unauthorized access</li>
                </ul>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2 text-gray-800">3.2 Account Responsibility</h3>
                <p>You are responsible for:</p>
                <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
                  <li>All activities that occur under your account</li>
                  <li>Maintaining the confidentiality of your account information</li>
                  <li>Ensuring that your account information is up to date</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Section 4 */}
        <Card id="subscriptions" className="mb-8 border-2 border-purple-200 !bg-white">
          <CardContent className="pt-6">
            <h2 className="text-3xl font-bold mb-4 text-purple-600 flex items-center gap-2">
              <CreditCard className="h-7 w-7" />
              4. Subscriptions and Payments
            </h2>
            <div className="space-y-4 text-gray-700">
              <div>
                <h3 className="text-xl font-semibold mb-2 text-gray-800">4.1 Subscription Plans</h3>
                <p>We offer various subscription plans with different features and usage limits. Current plans include:</p>
                <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
                  <li>Free Plan: Limited features and usage</li>
                  <li>Pro Plan: Enhanced features and higher usage limits</li>
                  <li>Enterprise Plan: Custom features and unlimited usage</li>
                </ul>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2 text-gray-800">4.2 Payment Terms</h3>
                <ul className="list-disc list-inside ml-4 space-y-2">
                  <li>Subscriptions are billed in advance on a monthly or annual basis</li>
                  <li>All fees are non-refundable except as required by law</li>
                  <li>Prices are subject to change with 30 days' notice</li>
                  <li>You authorize us to charge your payment method automatically</li>
                  <li>Failed payments may result in service suspension</li>
                </ul>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2 text-gray-800">4.3 Cancellation</h3>
                <p>You may cancel your subscription at any time. Cancellation takes effect at the end of your current billing period. No refunds are provided for partial billing periods.</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Section 5 */}
        <Card id="usage" className="mb-8 border-2 border-purple-200 !bg-white">
          <CardContent className="pt-6">
            <h2 className="text-3xl font-bold mb-4 text-purple-600 flex items-center gap-2">
              <Ban className="h-7 w-7" />
              5. Acceptable Use
            </h2>
            <div className="space-y-4 text-gray-700">
              <p>You agree not to:</p>
              <ul className="list-disc list-inside ml-4 space-y-2">
                <li>Use our services for any illegal or unauthorized purpose</li>
                <li>Violate any laws or regulations in your use of our services</li>
                <li>Infringe upon the intellectual property rights of others</li>
                <li>Attempt to gain unauthorized access to our systems or other users' accounts</li>
                <li>Use automated systems (bots, scrapers) to access our services without permission</li>
                <li>Interfere with or disrupt the integrity or performance of our services</li>
                <li>Transmit viruses, malware, or other harmful code</li>
                <li>Use our services to spam, harass, or harm others</li>
                <li>Reverse engineer, decompile, or disassemble our software</li>
                <li>Resell or redistribute our services without authorization</li>
              </ul>
              <p className="mt-4">Violation of these terms may result in immediate termination of your account.</p>
            </div>
          </CardContent>
        </Card>

        {/* Section 6 */}
        <Card id="intellectual" className="mb-8 border-2 border-purple-200 !bg-white">
          <CardContent className="pt-6">
            <h2 className="text-3xl font-bold mb-4 text-purple-600 flex items-center gap-2">
              <Shield className="h-7 w-7" />
              6. Intellectual Property
            </h2>
            <div className="space-y-4 text-gray-700">
              <div>
                <h3 className="text-xl font-semibold mb-2 text-gray-800">6.1 Our Intellectual Property</h3>
                <p>All content, features, and functionality of MoreClicks.io, including but not limited to text, graphics, logos, software, and designs, are owned by us or our licensors and are protected by copyright, trademark, and other intellectual property laws.</p>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2 text-gray-800">6.2 Your Content</h3>
                <p>You retain ownership of any data, content, or materials you submit through our services. By using our services, you grant us a license to use, store, and process your content solely for the purpose of providing our services.</p>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2 text-gray-800">6.3 Feedback</h3>
                <p>Any feedback, suggestions, or ideas you provide about our services may be used by us without compensation or obligation to you.</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Section 7 */}
        <Card id="warranties" className="mb-8 border-2 border-purple-200 !bg-white">
          <CardContent className="pt-6">
            <h2 className="text-3xl font-bold mb-4 text-purple-600 flex items-center gap-2">
              <AlertTriangle className="h-7 w-7" />
              7. Disclaimers and Warranties
            </h2>
            <div className="space-y-4 text-gray-700">
              <p><strong>OUR SERVICES ARE PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED.</strong></p>
              <p>We disclaim all warranties, including but not limited to:</p>
              <ul className="list-disc list-inside ml-4 space-y-2">
                <li>Merchantability and fitness for a particular purpose</li>
                <li>Accuracy, completeness, or reliability of our services</li>
                <li>Uninterrupted or error-free operation</li>
                <li>Security or freedom from viruses or harmful components</li>
              </ul>
              <p className="mt-4">SEO data and analysis results are provided for informational purposes only and should not be the sole basis for business decisions.</p>
            </div>
          </CardContent>
        </Card>

        {/* Section 8 */}
        <Card id="limitation" className="mb-8 border-2 border-purple-200 !bg-white">
          <CardContent className="pt-6">
            <h2 className="text-3xl font-bold mb-4 text-purple-600">8. Limitation of Liability</h2>
            <div className="space-y-4 text-gray-700">
              <p><strong>TO THE MAXIMUM EXTENT PERMITTED BY LAW, WE SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING BUT NOT LIMITED TO:</strong></p>
              <ul className="list-disc list-inside ml-4 space-y-2">
                <li>Loss of profits, revenue, data, or business opportunities</li>
                <li>Service interruptions or downtime</li>
                <li>Errors or inaccuracies in our services</li>
                <li>Unauthorized access to or use of your data</li>
              </ul>
              <p className="mt-4">Our total liability for any claims arising from or related to our services shall not exceed the amount you paid us in the 12 months preceding the claim.</p>
            </div>
          </CardContent>
        </Card>

        {/* Section 9 */}
        <Card id="termination" className="mb-8 border-2 border-purple-200 !bg-white">
          <CardContent className="pt-6">
            <h2 className="text-3xl font-bold mb-4 text-purple-600">9. Termination</h2>
            <div className="space-y-4 text-gray-700">
              <div>
                <h3 className="text-xl font-semibold mb-2 text-gray-800">9.1 Termination by You</h3>
                <p>You may terminate your account at any time by canceling your subscription or contacting us.</p>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2 text-gray-800">9.2 Termination by Us</h3>
                <p>We may suspend or terminate your account immediately if you:</p>
                <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
                  <li>Violate these Terms of Service</li>
                  <li>Engage in fraudulent or illegal activity</li>
                  <li>Fail to pay subscription fees</li>
                  <li>Use our services in a manner that harms us or other users</li>
                </ul>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2 text-gray-800">9.3 Effect of Termination</h3>
                <p>Upon termination, your right to use our services will cease immediately. We may delete your account data after a reasonable retention period, subject to our Privacy Policy.</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Section 10 */}
        <Card id="changes" className="mb-8 border-2 border-purple-200 !bg-white">
          <CardContent className="pt-6">
            <h2 className="text-3xl font-bold mb-4 text-purple-600">10. Changes to Terms</h2>
            <div className="space-y-4 text-gray-700">
              <p>We reserve the right to modify these Terms at any time. We will notify you of material changes by:</p>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li>Posting the updated Terms on this page</li>
                <li>Updating the "Last Updated" date</li>
                <li>Sending an email notification for significant changes</li>
              </ul>
              <p className="mt-4">Your continued use of our services after changes become effective constitutes acceptance of the updated Terms.</p>
            </div>
          </CardContent>
        </Card>

        {/* Section 11 */}
        <Card id="contact" className="mb-8 border-2 border-purple-200 bg-purple-50/50">
          <CardContent className="pt-6">
            <h2 className="text-3xl font-bold mb-4 text-purple-600">11. Contact Information</h2>
            <div className="space-y-4 text-gray-700">
              <p>If you have questions about these Terms of Service, please contact us:</p>
              <div className="bg-white p-4 rounded-lg border border-purple-200">
                <p className="font-semibold text-gray-800 mb-2">MoreClicks.io Legal Team</p>
                <p className="mb-1">Email: <a href="mailto:legal@moreclicks.io" className="text-purple-600 hover:underline font-semibold">legal@moreclicks.io</a></p>
                <p>Website: <Link href="/" className="text-purple-600 hover:underline font-semibold">www.moreclicks.io</Link></p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer Links */}
        <div className="text-center mt-12 space-x-4">
          <Link href="/privacy" className="text-purple-600 hover:underline font-semibold">Privacy Policy</Link>
          <span className="text-gray-400">|</span>
          <Link href="/cookies" className="text-purple-600 hover:underline font-semibold">Cookie Policy</Link>
          <span className="text-gray-400">|</span>
          <Link href="/disclaimer" className="text-purple-600 hover:underline font-semibold">Disclaimer</Link>
          <span className="text-gray-400">|</span>
          <Link href="/" className="text-purple-600 hover:underline font-semibold">Home</Link>
        </div>
      </div>

      {/* JSON-LD Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebPage",
            "name": "Terms of Service",
            "description": "Terms of Service and User Agreement for MoreClicks.io",
            "url": "https://moreclicks.io/terms",
            "datePublished": "2026-12-27",
            "dateModified": "2026-12-27",
            "publisher": {
              "@type": "Organization",
              "name": "MoreClicks.io",
              "url": "https://moreclicks.io"
            }
          })
        }}
      />
      </div>
    </div>
  );
}

