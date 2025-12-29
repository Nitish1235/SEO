import type { Metadata } from "next";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Shield, Lock, Eye, FileText, Mail, Calendar } from "lucide-react";

export const metadata: Metadata = {
  title: "Privacy Policy | MoreClicks.io - Your Data Protection Commitment",
  description: "Read MoreClicks.io's comprehensive privacy policy. Learn how we collect, use, and protect your personal information and SEO data. GDPR compliant privacy practices.",
  keywords: "privacy policy, data protection, GDPR, user privacy, SEO tool privacy, data security",
  openGraph: {
    title: "Privacy Policy | MoreClicks.io",
    description: "Your data protection and privacy commitment at MoreClicks.io",
    type: "website",
  },
};

export default function PrivacyPolicyPage() {
  const lastUpdated = "December 27, 2024";

  return (
    <div className="light" suppressHydrationWarning>
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <Shield className="h-16 w-16 text-blue-600" />
          </div>
          <h1 className="text-4xl md:text-5xl font-black mb-4 text-blue-600">
            Privacy Policy
          </h1>
          <p className="text-lg text-gray-600">
            Last Updated: <span className="font-semibold">{lastUpdated}</span>
          </p>
        </div>

        {/* Introduction */}
        <Card className="mb-8 border-2 border-blue-200 shadow-lg !bg-white">
          <CardContent className="pt-6">
            <p className="text-lg text-gray-700 leading-relaxed">
              At <strong className="text-blue-600">MoreClicks.io</strong>, we are committed to protecting your privacy and ensuring the security of your personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our SEO analysis platform.
            </p>
          </CardContent>
        </Card>

        {/* Table of Contents */}
        <Card className="mb-8 border-2 border-purple-200 bg-purple-50/50">
          <CardContent className="pt-6">
            <h2 className="text-2xl font-bold mb-4 text-purple-700 flex items-center gap-2">
              <FileText className="h-6 w-6" />
              Table of Contents
            </h2>
            <ul className="space-y-2 text-gray-700">
              <li><a href="#information-we-collect" className="text-blue-600 hover:underline">1. Information We Collect</a></li>
              <li><a href="#how-we-use-information" className="text-blue-600 hover:underline">2. How We Use Your Information</a></li>
              <li><a href="#data-sharing" className="text-blue-600 hover:underline">3. Data Sharing and Disclosure</a></li>
              <li><a href="#data-security" className="text-blue-600 hover:underline">4. Data Security</a></li>
              <li><a href="#your-rights" className="text-blue-600 hover:underline">5. Your Privacy Rights</a></li>
              <li><a href="#cookies" className="text-blue-600 hover:underline">6. Cookies and Tracking Technologies</a></li>
              <li><a href="#third-party" className="text-blue-600 hover:underline">7. Third-Party Services</a></li>
              <li><a href="#children" className="text-blue-600 hover:underline">8. Children's Privacy</a></li>
              <li><a href="#changes" className="text-blue-600 hover:underline">9. Changes to This Policy</a></li>
              <li><a href="#contact" className="text-blue-600 hover:underline">10. Contact Us</a></li>
            </ul>
          </CardContent>
        </Card>

        {/* Section 1 */}
        <Card id="information-we-collect" className="mb-8 border-2 border-blue-200 !bg-white">
          <CardContent className="pt-6">
            <h2 className="text-3xl font-bold mb-4 text-blue-600 flex items-center gap-2">
              <Eye className="h-7 w-7" />
              1. Information We Collect
            </h2>
            <div className="space-y-4 text-gray-700">
              <div>
                <h3 className="text-xl font-semibold mb-2 text-gray-800">1.1 Personal Information</h3>
                <p className="mb-2">When you register for an account, we collect:</p>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>Name and email address</li>
                  <li>Profile picture (if provided through OAuth)</li>
                  <li>Authentication credentials (handled securely through OAuth providers)</li>
                </ul>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2 text-gray-800">1.2 SEO Analysis Data</h3>
                <p className="mb-2">When you use our SEO analysis tools, we collect:</p>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>Website URLs you analyze</li>
                  <li>Keywords you research</li>
                  <li>Competitor analysis data</li>
                  <li>SEO metrics and reports</li>
                </ul>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2 text-gray-800">1.3 Usage Information</h3>
                <p className="mb-2">We automatically collect:</p>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>IP address and location data</li>
                  <li>Browser type and version</li>
                  <li>Device information</li>
                  <li>Pages visited and time spent on pages</li>
                  <li>Feature usage statistics</li>
                </ul>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2 text-gray-800">1.4 Payment Information</h3>
                <p className="mb-2">For subscription payments, we collect:</p>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>Billing address</li>
                  <li>Payment method information (processed securely through Stripe)</li>
                  <li>Subscription plan details</li>
                </ul>
                <p className="mt-2 text-sm text-gray-600">
                  <strong>Note:</strong> We do not store your full credit card information. All payment processing is handled by Stripe, a PCI-compliant payment processor.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Section 2 */}
        <Card id="how-we-use-information" className="mb-8 border-2 border-blue-200 !bg-white">
          <CardContent className="pt-6">
            <h2 className="text-3xl font-bold mb-4 text-blue-600">2. How We Use Your Information</h2>
            <div className="space-y-4 text-gray-700">
              <p>We use the information we collect for the following purposes:</p>
              <ul className="list-disc list-inside ml-4 space-y-2">
                <li><strong>Service Delivery:</strong> To provide, maintain, and improve our SEO analysis services</li>
                <li><strong>Account Management:</strong> To create and manage your account, process transactions, and send service-related communications</li>
                <li><strong>Customer Support:</strong> To respond to your inquiries, provide technical support, and address issues</li>
                <li><strong>Analytics:</strong> To analyze usage patterns, improve our services, and develop new features</li>
                <li><strong>Marketing:</strong> To send promotional emails about new features, updates, and special offers (you can opt-out at any time)</li>
                <li><strong>Legal Compliance:</strong> To comply with legal obligations, enforce our terms of service, and protect our rights</li>
                <li><strong>Security:</strong> To detect, prevent, and address security issues and fraudulent activity</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Section 3 */}
        <Card id="data-sharing" className="mb-8 border-2 border-blue-200 !bg-white">
          <CardContent className="pt-6">
            <h2 className="text-3xl font-bold mb-4 text-blue-600">3. Data Sharing and Disclosure</h2>
            <div className="space-y-4 text-gray-700">
              <p>We do not sell your personal information. We may share your information only in the following circumstances:</p>
              <div className="space-y-3">
                <div>
                  <h3 className="text-xl font-semibold mb-2 text-gray-800">3.1 Service Providers</h3>
                  <p>We share data with trusted third-party service providers who assist us in operating our platform, including:</p>
                  <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
                    <li>Stripe (payment processing)</li>
                    <li>Google OAuth (authentication)</li>
                    <li>DataForSEO (SEO data providers)</li>
                    <li>Cloud hosting providers</li>
                    <li>Analytics services</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2 text-gray-800">3.2 Legal Requirements</h3>
                  <p>We may disclose information if required by law, court order, or government regulation, or to protect our rights and the safety of our users.</p>
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2 text-gray-800">3.3 Business Transfers</h3>
                  <p>In the event of a merger, acquisition, or sale of assets, your information may be transferred to the acquiring entity.</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Section 4 */}
        <Card id="data-security" className="mb-8 border-2 border-blue-200 !bg-white">
          <CardContent className="pt-6">
            <h2 className="text-3xl font-bold mb-4 text-blue-600 flex items-center gap-2">
              <Lock className="h-7 w-7" />
              4. Data Security
            </h2>
            <div className="space-y-4 text-gray-700">
              <p>We implement industry-standard security measures to protect your information:</p>
              <ul className="list-disc list-inside ml-4 space-y-2">
                <li>Encryption of data in transit using SSL/TLS protocols</li>
                <li>Secure authentication through OAuth providers</li>
                <li>Regular security audits and vulnerability assessments</li>
                <li>Access controls and authentication requirements</li>
                <li>Secure database storage with encryption at rest</li>
                <li>Regular backups and disaster recovery procedures</li>
              </ul>
              <p className="mt-4 text-sm text-gray-600">
                While we strive to protect your data, no method of transmission over the internet is 100% secure. We cannot guarantee absolute security but are committed to maintaining the highest security standards.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Section 5 */}
        <Card id="your-rights" className="mb-8 border-2 border-blue-200 !bg-white">
          <CardContent className="pt-6">
            <h2 className="text-3xl font-bold mb-4 text-blue-600">5. Your Privacy Rights</h2>
            <div className="space-y-4 text-gray-700">
              <p>Depending on your location, you may have the following rights regarding your personal information:</p>
              <ul className="list-disc list-inside ml-4 space-y-2">
                <li><strong>Access:</strong> Request a copy of the personal information we hold about you</li>
                <li><strong>Correction:</strong> Request correction of inaccurate or incomplete information</li>
                <li><strong>Deletion:</strong> Request deletion of your personal information (subject to legal requirements)</li>
                <li><strong>Portability:</strong> Request transfer of your data to another service provider</li>
                <li><strong>Objection:</strong> Object to processing of your personal information for certain purposes</li>
                <li><strong>Restriction:</strong> Request restriction of processing in certain circumstances</li>
                <li><strong>Withdraw Consent:</strong> Withdraw consent for data processing where applicable</li>
              </ul>
              <p className="mt-4">
                To exercise these rights, please contact us at <a href="mailto:privacy@moreclicks.io" className="text-blue-600 hover:underline font-semibold">privacy@moreclicks.io</a>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Section 6 */}
        <Card id="cookies" className="mb-8 border-2 border-blue-200 !bg-white">
          <CardContent className="pt-6">
            <h2 className="text-3xl font-bold mb-4 text-blue-600">6. Cookies and Tracking Technologies</h2>
            <div className="space-y-4 text-gray-700">
              <p>We use cookies and similar tracking technologies to enhance your experience. For detailed information, please see our <Link href="/cookies" className="text-blue-600 hover:underline font-semibold">Cookie Policy</Link>.</p>
            </div>
          </CardContent>
        </Card>

        {/* Section 7 */}
        <Card id="third-party" className="mb-8 border-2 border-blue-200 !bg-white">
          <CardContent className="pt-6">
            <h2 className="text-3xl font-bold mb-4 text-blue-600">7. Third-Party Services</h2>
            <div className="space-y-4 text-gray-700">
              <p>Our platform integrates with third-party services that have their own privacy policies:</p>
              <ul className="list-disc list-inside ml-4 space-y-2">
                <li><strong>Google OAuth:</strong> For authentication services</li>
                <li><strong>Stripe:</strong> For payment processing</li>
                <li><strong>DataForSEO:</strong> For SEO data and analytics</li>
              </ul>
              <p className="mt-4">We encourage you to review the privacy policies of these third-party services.</p>
            </div>
          </CardContent>
        </Card>

        {/* Section 8 */}
        <Card id="children" className="mb-8 border-2 border-blue-200 !bg-white">
          <CardContent className="pt-6">
            <h2 className="text-3xl font-bold mb-4 text-blue-600">8. Children's Privacy</h2>
            <div className="space-y-4 text-gray-700">
              <p>Our services are not intended for users under the age of 18. We do not knowingly collect personal information from children. If you believe we have collected information from a child, please contact us immediately, and we will take steps to delete such information.</p>
            </div>
          </CardContent>
        </Card>

        {/* Section 9 */}
        <Card id="changes" className="mb-8 border-2 border-blue-200 !bg-white">
          <CardContent className="pt-6">
            <h2 className="text-3xl font-bold mb-4 text-blue-600 flex items-center gap-2">
              <Calendar className="h-7 w-7" />
              9. Changes to This Policy
            </h2>
            <div className="space-y-4 text-gray-700">
              <p>We may update this Privacy Policy from time to time. We will notify you of any material changes by:</p>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li>Posting the updated policy on this page</li>
                <li>Updating the "Last Updated" date</li>
                <li>Sending an email notification for significant changes</li>
              </ul>
              <p className="mt-4">Your continued use of our services after changes become effective constitutes acceptance of the updated policy.</p>
            </div>
          </CardContent>
        </Card>

        {/* Section 10 */}
        <Card id="contact" className="mb-8 border-2 border-blue-200 bg-blue-50/50">
          <CardContent className="pt-6">
            <h2 className="text-3xl font-bold mb-4 text-blue-600 flex items-center gap-2">
              <Mail className="h-7 w-7" />
              10. Contact Us
            </h2>
            <div className="space-y-4 text-gray-700">
              <p>If you have questions, concerns, or requests regarding this Privacy Policy or our data practices, please contact us:</p>
              <div className="bg-white p-4 rounded-lg border border-blue-200">
                <p className="font-semibold text-gray-800 mb-2">MoreClicks.io Privacy Team</p>
                <p className="mb-1">Email: <a href="mailto:privacy@moreclicks.io" className="text-blue-600 hover:underline font-semibold">privacy@moreclicks.io</a></p>
                <p>Website: <Link href="/" className="text-blue-600 hover:underline font-semibold">www.moreclicks.io</Link></p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer Links */}
        <div className="text-center mt-12 space-x-4">
          <Link href="/terms" className="text-blue-600 hover:underline font-semibold">Terms of Service</Link>
          <span className="text-gray-400">|</span>
          <Link href="/cookies" className="text-blue-600 hover:underline font-semibold">Cookie Policy</Link>
          <span className="text-gray-400">|</span>
          <Link href="/disclaimer" className="text-blue-600 hover:underline font-semibold">Disclaimer</Link>
          <span className="text-gray-400">|</span>
          <Link href="/" className="text-blue-600 hover:underline font-semibold">Home</Link>
        </div>
      </div>

      {/* JSON-LD Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebPage",
            "name": "Privacy Policy",
            "description": "Privacy Policy for MoreClicks.io - Learn how we protect your data and privacy",
            "url": "https://moreclicks.io/privacy",
            "datePublished": "2024-12-27",
            "dateModified": "2024-12-27",
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

