import type { Metadata } from "next";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Cookie, Settings, BarChart3, Shield, Info } from "lucide-react";

export const metadata: Metadata = {
  title: "Cookie Policy | MoreClicks.io - How We Use Cookies",
  description: "Learn about how MoreClicks.io uses cookies and tracking technologies. Understand cookie types, purposes, and how to manage your cookie preferences.",
  keywords: "cookie policy, cookies, tracking, web analytics, privacy cookies, GDPR cookies",
  openGraph: {
    title: "Cookie Policy | MoreClicks.io",
    description: "Cookie Policy and tracking technologies used by MoreClicks.io",
    type: "website",
  },
  alternates: {
    canonical: "https://moreclicks.io/cookies",
  },
};

export default function CookiePolicyPage() {
  const lastUpdated = "December 27, 2026";

  return (
    <div className="light" suppressHydrationWarning>
      <div className="min-h-screen bg-gradient-to-b from-cyan-50 to-white">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <Cookie className="h-16 w-16 text-cyan-600" />
          </div>
          <h1 className="text-4xl md:text-5xl font-black mb-4 text-cyan-600">
            Cookie Policy
          </h1>
          <p className="text-lg text-gray-600">
            Last Updated: <span className="font-semibold">{lastUpdated}</span>
          </p>
        </div>

        {/* Introduction */}
        <Card className="mb-8 border-2 border-cyan-200 shadow-lg !bg-white">
          <CardContent className="pt-6">
            <p className="text-lg text-gray-700 leading-relaxed">
              This Cookie Policy explains how <strong className="text-cyan-600">MoreClicks.io</strong> uses cookies and similar tracking technologies when you visit our website and use our services. By using our platform, you consent to the use of cookies as described in this policy.
            </p>
          </CardContent>
        </Card>

        {/* Table of Contents */}
        <Card className="mb-8 border-2 border-blue-200 bg-blue-50/50">
          <CardContent className="pt-6">
            <h2 className="text-2xl font-bold mb-4 text-blue-700 flex items-center gap-2">
              <Info className="h-6 w-6" />
              Table of Contents
            </h2>
            <ul className="space-y-2 text-gray-700">
              <li><a href="#what-are-cookies" className="text-cyan-600 hover:underline">1. What Are Cookies?</a></li>
              <li><a href="#types-of-cookies" className="text-cyan-600 hover:underline">2. Types of Cookies We Use</a></li>
              <li><a href="#purposes" className="text-cyan-600 hover:underline">3. Purposes of Cookies</a></li>
              <li><a href="#third-party" className="text-cyan-600 hover:underline">4. Third-Party Cookies</a></li>
              <li><a href="#managing" className="text-cyan-600 hover:underline">5. Managing Your Cookie Preferences</a></li>
              <li><a href="#updates" className="text-cyan-600 hover:underline">6. Updates to This Policy</a></li>
              <li><a href="#contact" className="text-cyan-600 hover:underline">7. Contact Us</a></li>
            </ul>
          </CardContent>
        </Card>

        {/* Section 1 */}
        <Card id="what-are-cookies" className="mb-8 border-2 border-cyan-200 !bg-white">
          <CardContent className="pt-6">
            <h2 className="text-3xl font-bold mb-4 text-cyan-600">1. What Are Cookies?</h2>
            <div className="space-y-4 text-gray-700">
              <p>Cookies are small text files that are placed on your device (computer, tablet, or mobile) when you visit a website. They are widely used to make websites work more efficiently and provide information to website owners.</p>
              <p>Cookies allow a website to recognize your device and store some information about your preferences or past actions. This helps improve your browsing experience and enables certain website features.</p>
              <div className="bg-cyan-50 p-4 rounded-lg border border-cyan-200 mt-4">
                <p className="text-sm text-gray-700">
                  <strong>Note:</strong> Cookies do not contain personally identifiable information unless you have provided such information to us.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Section 2 */}
        <Card id="types-of-cookies" className="mb-8 border-2 border-cyan-200 !bg-white">
          <CardContent className="pt-6">
            <h2 className="text-3xl font-bold mb-4 text-cyan-600 flex items-center gap-2">
              <Settings className="h-7 w-7" />
              2. Types of Cookies We Use
            </h2>
            <div className="space-y-6 text-gray-700">
              <div>
                <h3 className="text-xl font-semibold mb-3 text-gray-800">2.1 Essential Cookies</h3>
                <p className="mb-2">These cookies are necessary for the website to function properly. They enable core functionality such as:</p>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>User authentication and session management</li>
                  <li>Security features and fraud prevention</li>
                  <li>Load balancing and website performance</li>
                  <li>Remembering your login status</li>
                </ul>
                <p className="mt-3 text-sm text-gray-600">
                  <strong>Duration:</strong> Session cookies (deleted when you close your browser) and persistent cookies (remain until expiration or deletion)
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-3 text-gray-800">2.2 Functional Cookies</h3>
                <p className="mb-2">These cookies enhance functionality and personalization:</p>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>Remembering your preferences and settings</li>
                  <li>Language and region preferences</li>
                  <li>Customized user interface settings</li>
                  <li>Feature usage history</li>
                </ul>
                <p className="mt-3 text-sm text-gray-600">
                  <strong>Duration:</strong> Typically 30 days to 1 year
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-3 text-gray-800">2.3 Analytics Cookies</h3>
                <p className="mb-2">These cookies help us understand how visitors interact with our website:</p>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>Page views and navigation patterns</li>
                  <li>Time spent on pages</li>
                  <li>Feature usage statistics</li>
                  <li>Error tracking and debugging</li>
                </ul>
                <p className="mt-3 text-sm text-gray-600">
                  <strong>Duration:</strong> Typically 1-2 years
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-3 text-gray-800">2.4 Performance Cookies</h3>
                <p className="mb-2">These cookies collect information about website performance:</p>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>Page load times</li>
                  <li>Server response times</li>
                  <li>Bandwidth usage</li>
                  <li>Error rates</li>
                </ul>
                <p className="mt-3 text-sm text-gray-600">
                  <strong>Duration:</strong> Typically 30 days
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Section 3 */}
        <Card id="purposes" className="mb-8 border-2 border-cyan-200 !bg-white">
          <CardContent className="pt-6">
            <h2 className="text-3xl font-bold mb-4 text-cyan-600 flex items-center gap-2">
              <BarChart3 className="h-7 w-7" />
              3. Purposes of Cookies
            </h2>
            <div className="space-y-4 text-gray-700">
              <p>We use cookies for the following purposes:</p>
              <div className="grid md:grid-cols-2 gap-4 mt-4">
                <div className="bg-cyan-50 p-4 rounded-lg border border-cyan-200">
                  <h4 className="font-semibold mb-2 text-gray-800">Authentication</h4>
                  <p className="text-sm">Maintain your login session and authenticate your identity</p>
                </div>
                <div className="bg-cyan-50 p-4 rounded-lg border border-cyan-200">
                  <h4 className="font-semibold mb-2 text-gray-800">Security</h4>
                  <p className="text-sm">Protect against fraud and unauthorized access</p>
                </div>
                <div className="bg-cyan-50 p-4 rounded-lg border border-cyan-200">
                  <h4 className="font-semibold mb-2 text-gray-800">Preferences</h4>
                  <p className="text-sm">Remember your settings and preferences</p>
                </div>
                <div className="bg-cyan-50 p-4 rounded-lg border border-cyan-200">
                  <h4 className="font-semibold mb-2 text-gray-800">Analytics</h4>
                  <p className="text-sm">Understand how you use our services</p>
                </div>
                <div className="bg-cyan-50 p-4 rounded-lg border border-cyan-200">
                  <h4 className="font-semibold mb-2 text-gray-800">Performance</h4>
                  <p className="text-sm">Optimize website speed and functionality</p>
                </div>
                <div className="bg-cyan-50 p-4 rounded-lg border border-cyan-200">
                  <h4 className="font-semibold mb-2 text-gray-800">Features</h4>
                  <p className="text-sm">Enable enhanced features and functionality</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Section 4 */}
        <Card id="third-party" className="mb-8 border-2 border-cyan-200 !bg-white">
          <CardContent className="pt-6">
            <h2 className="text-3xl font-bold mb-4 text-cyan-600">4. Third-Party Cookies</h2>
            <div className="space-y-4 text-gray-700">
              <p>We may use third-party services that set their own cookies. These include:</p>
              <div className="space-y-3 mt-4">
                <div className="bg-white p-4 rounded-lg border border-cyan-200">
                  <h4 className="font-semibold mb-2 text-gray-800">Google Analytics</h4>
                  <p className="text-sm mb-2">Helps us analyze website traffic and user behavior</p>
                  <p className="text-xs text-gray-600">Privacy Policy: <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="text-cyan-600 hover:underline">Google Privacy Policy</a></p>
                </div>
                <div className="bg-white p-4 rounded-lg border border-cyan-200">
                  <h4 className="font-semibold mb-2 text-gray-800">Stripe</h4>
                  <p className="text-sm mb-2">Payment processing and fraud prevention</p>
                  <p className="text-xs text-gray-600">Privacy Policy: <a href="https://stripe.com/privacy" target="_blank" rel="noopener noreferrer" className="text-cyan-600 hover:underline">Stripe Privacy Policy</a></p>
                </div>
                <div className="bg-white p-4 rounded-lg border border-cyan-200">
                  <h4 className="font-semibold mb-2 text-gray-800">NextAuth.js</h4>
                  <p className="text-sm mb-2">Authentication and session management</p>
                  <p className="text-xs text-gray-600">Uses secure session cookies for authentication</p>
                </div>
              </div>
              <p className="mt-4 text-sm text-gray-600">
                We do not control these third-party cookies. Please review their privacy policies for information about how they use cookies.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Section 5 */}
        <Card id="managing" className="mb-8 border-2 border-cyan-200 !bg-white">
          <CardContent className="pt-6">
            <h2 className="text-3xl font-bold mb-4 text-cyan-600 flex items-center gap-2">
              <Shield className="h-7 w-7" />
              5. Managing Your Cookie Preferences
            </h2>
            <div className="space-y-4 text-gray-700">
              <p>You have several options for managing cookies:</p>
              
              <div>
                <h3 className="text-xl font-semibold mb-2 text-gray-800">5.1 Browser Settings</h3>
                <p className="mb-2">Most web browsers allow you to control cookies through their settings. You can:</p>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>Block all cookies</li>
                  <li>Block third-party cookies</li>
                  <li>Delete existing cookies</li>
                  <li>Set preferences for specific websites</li>
                </ul>
                <p className="mt-3 text-sm text-gray-600">
                  <strong>Note:</strong> Blocking essential cookies may affect website functionality and your ability to use certain features.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-2 text-gray-800">5.2 Browser-Specific Instructions</h3>
                <div className="space-y-2 text-sm">
                  <p><strong>Chrome:</strong> Settings → Privacy and Security → Cookies and other site data</p>
                  <p><strong>Firefox:</strong> Options → Privacy & Security → Cookies and Site Data</p>
                  <p><strong>Safari:</strong> Preferences → Privacy → Cookies and website data</p>
                  <p><strong>Edge:</strong> Settings → Cookies and site permissions → Cookies and site data</p>
                </div>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-2 text-gray-800">5.3 Opt-Out Tools</h3>
                <p className="mb-2">You can opt out of certain analytics cookies using:</p>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>Google Analytics Opt-out: <a href="https://tools.google.com/dlpage/gaoptout" target="_blank" rel="noopener noreferrer" className="text-cyan-600 hover:underline">Google Analytics Opt-out Browser Add-on</a></li>
                  <li>Network Advertising Initiative: <a href="https://www.networkadvertising.org/choices/" target="_blank" rel="noopener noreferrer" className="text-cyan-600 hover:underline">NAI Opt-Out</a></li>
                </ul>
              </div>

              <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200 mt-4">
                <p className="text-sm text-gray-700">
                  <strong>Important:</strong> If you disable cookies, some features of our website may not function properly, and you may not be able to access certain parts of our services.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Section 6 */}
        <Card id="updates" className="mb-8 border-2 border-cyan-200 !bg-white">
          <CardContent className="pt-6">
            <h2 className="text-3xl font-bold mb-4 text-cyan-600">6. Updates to This Policy</h2>
            <div className="space-y-4 text-gray-700">
              <p>We may update this Cookie Policy from time to time to reflect changes in our practices or for other operational, legal, or regulatory reasons.</p>
              <p>We will notify you of any material changes by:</p>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li>Posting the updated policy on this page</li>
                <li>Updating the "Last Updated" date</li>
                <li>Providing notice through our website or email</li>
              </ul>
              <p className="mt-4">We encourage you to review this Cookie Policy periodically to stay informed about our use of cookies.</p>
            </div>
          </CardContent>
        </Card>

        {/* Section 7 */}
        <Card id="contact" className="mb-8 border-2 border-cyan-200 bg-cyan-50/50">
          <CardContent className="pt-6">
            <h2 className="text-3xl font-bold mb-4 text-cyan-600">7. Contact Us</h2>
            <div className="space-y-4 text-gray-700">
              <p>If you have questions about our use of cookies or this Cookie Policy, please contact us:</p>
              <div className="bg-white p-4 rounded-lg border border-cyan-200">
                <p className="font-semibold text-gray-800 mb-2">MoreClicks.io Privacy Team</p>
                <p className="mb-1">Email: <a href="mailto:privacy@moreclicks.io" className="text-cyan-600 hover:underline font-semibold">privacy@moreclicks.io</a></p>
                <p>Website: <Link href="/" className="text-cyan-600 hover:underline font-semibold">www.moreclicks.io</Link></p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer Links */}
        <div className="text-center mt-12 space-x-4">
          <Link href="/privacy" className="text-cyan-600 hover:underline font-semibold">Privacy Policy</Link>
          <span className="text-gray-400">|</span>
          <Link href="/terms" className="text-cyan-600 hover:underline font-semibold">Terms of Service</Link>
          <span className="text-gray-400">|</span>
          <Link href="/disclaimer" className="text-cyan-600 hover:underline font-semibold">Disclaimer</Link>
          <span className="text-gray-400">|</span>
          <Link href="/" className="text-cyan-600 hover:underline font-semibold">Home</Link>
        </div>
      </div>

      {/* JSON-LD Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebPage",
            "name": "Cookie Policy",
            "description": "Cookie Policy for MoreClicks.io - Learn about our use of cookies and tracking technologies",
            "url": "https://moreclicks.io/cookies",
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

