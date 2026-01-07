import type { Metadata } from "next";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { AlertTriangle, Info, FileText, Shield, TrendingUp } from "lucide-react";

export const metadata: Metadata = {
  title: "Disclaimer | MoreClicks.io - Terms and Limitations",
  description: "Read the disclaimer for MoreClicks.io SEO analysis tool. Understand limitations, accuracy, and terms of use for our SEO services.",
  keywords: "disclaimer, SEO tool disclaimer, limitations, accuracy, terms of use",
  openGraph: {
    title: "Disclaimer | MoreClicks.io",
    description: "Disclaimer and limitations for MoreClicks.io SEO analysis services",
    type: "website",
  },
  alternates: {
    canonical: "https://moreclicks.io/disclaimer",
  },
};

export default function DisclaimerPage() {
  const lastUpdated = "December 27, 2026";

  return (
    <div className="light" suppressHydrationWarning>
      <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <AlertTriangle className="h-16 w-16 text-orange-600" />
          </div>
          <h1 className="text-4xl md:text-5xl font-black mb-4 text-orange-600">
            Disclaimer
          </h1>
          <p className="text-lg text-gray-600">
            Last Updated: <span className="font-semibold">{lastUpdated}</span>
          </p>
        </div>

        {/* Introduction */}
        <Card className="mb-8 border-2 border-orange-200 shadow-lg !bg-white">
          <CardContent className="pt-6">
            <p className="text-lg text-gray-700 leading-relaxed">
              This Disclaimer sets forth important information regarding the use of <strong className="text-orange-600">MoreClicks.io</strong> and its SEO analysis services. Please read this disclaimer carefully before using our platform.
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
              <li><a href="#general" className="text-orange-600 hover:underline">1. General Information</a></li>
              <li><a href="#accuracy" className="text-orange-600 hover:underline">2. Accuracy of Information</a></li>
              <li><a href="#seo-data" className="text-orange-600 hover:underline">3. SEO Data and Analysis</a></li>
              <li><a href="#third-party" className="text-orange-600 hover:underline">4. Third-Party Data Sources</a></li>
              <li><a href="#no-guarantee" className="text-orange-600 hover:underline">5. No Guarantee of Results</a></li>
              <li><a href="#professional" className="text-orange-600 hover:underline">6. Professional Advice</a></li>
              <li><a href="#liability" className="text-orange-600 hover:underline">7. Limitation of Liability</a></li>
              <li><a href="#external" className="text-orange-600 hover:underline">8. External Links</a></li>
              <li><a href="#changes" className="text-orange-600 hover:underline">9. Changes to Services</a></li>
              <li><a href="#contact" className="text-orange-600 hover:underline">10. Contact Information</a></li>
            </ul>
          </CardContent>
        </Card>

        {/* Section 1 */}
        <Card id="general" className="mb-8 border-2 border-orange-200 !bg-white">
          <CardContent className="pt-6">
            <h2 className="text-3xl font-bold mb-4 text-orange-600 flex items-center gap-2">
              <Info className="h-7 w-7" />
              1. General Information
            </h2>
            <div className="space-y-4 text-gray-700">
              <p>The information provided on MoreClicks.io is for general informational purposes only. While we strive to provide accurate and up-to-date information, we make no representations or warranties of any kind, express or implied, about the completeness, accuracy, reliability, suitability, or availability of the information, products, services, or related graphics contained on our platform.</p>
              <p>Any reliance you place on such information is strictly at your own risk. We disclaim all liability and responsibility arising from any reliance placed on such materials by you or any other visitor to our platform, or by anyone who may be informed of any of its contents.</p>
            </div>
          </CardContent>
        </Card>

        {/* Section 2 */}
        <Card id="accuracy" className="mb-8 border-2 border-orange-200 !bg-white">
          <CardContent className="pt-6">
            <h2 className="text-3xl font-bold mb-4 text-orange-600">2. Accuracy of Information</h2>
            <div className="space-y-4 text-gray-700">
              <p>We endeavor to keep the information on our platform accurate and current. However:</p>
              <ul className="list-disc list-inside ml-4 space-y-2">
                <li>Information may contain technical inaccuracies or typographical errors</li>
                <li>Information may be changed or updated without notice</li>
                <li>We are not obligated to update information on our platform</li>
                <li>Historical data and analysis results may not reflect current conditions</li>
              </ul>
              <div className="bg-orange-50 p-4 rounded-lg border border-orange-200 mt-4">
                <p className="text-sm text-gray-700">
                  <strong>Important:</strong> Always verify critical information independently before making business decisions based on our analysis.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Section 3 */}
        <Card id="seo-data" className="mb-8 border-2 border-orange-200 !bg-white">
          <CardContent className="pt-6">
            <h2 className="text-3xl font-bold mb-4 text-orange-600 flex items-center gap-2">
              <TrendingUp className="h-7 w-7" />
              3. SEO Data and Analysis
            </h2>
            <div className="space-y-4 text-gray-700">
              <p>Our SEO analysis tools provide insights based on available data and algorithms. Please note:</p>
              <div className="space-y-3">
                <div>
                  <h3 className="text-xl font-semibold mb-2 text-gray-800">3.1 Data Limitations</h3>
                  <ul className="list-disc list-inside ml-4 space-y-1">
                    <li>SEO metrics are estimates based on available data sources</li>
                    <li>Search engine algorithms change frequently, affecting rankings</li>
                    <li>Data collection may be incomplete or delayed</li>
                    <li>Analysis results may vary based on geographic location and other factors</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2 text-gray-800">3.2 Algorithm-Based Analysis</h3>
                  <p>Our analysis uses proprietary algorithms and third-party data sources. These methods:</p>
                  <ul className="list-disc list-inside ml-4 space-y-1">
                    <li>May not capture all factors affecting SEO performance</li>
                    <li>Are subject to limitations of underlying data sources</li>
                    <li>May produce different results over time</li>
                    <li>Should be used as one tool among many in your SEO strategy</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2 text-gray-800">3.3 Keyword Research</h3>
                  <p>Keyword research data is provided for informational purposes:</p>
                  <ul className="list-disc list-inside ml-4 space-y-1">
                    <li>Search volume estimates are approximations</li>
                    <li>Competition levels may change over time</li>
                    <li>Keyword difficulty scores are algorithmic estimates</li>
                    <li>Actual results may vary significantly</li>
                  </ul>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Section 4 */}
        <Card id="third-party" className="mb-8 border-2 border-orange-200 !bg-white">
          <CardContent className="pt-6">
            <h2 className="text-3xl font-bold mb-4 text-orange-600">4. Third-Party Data Sources</h2>
            <div className="space-y-4 text-gray-700">
              <p>We rely on third-party data providers and APIs for SEO information, including:</p>
              <ul className="list-disc list-inside ml-4 space-y-2">
                <li><strong>DataForSEO:</strong> Provides SEO metrics, keyword data, and competitor information</li>
                <li><strong>Search Engines:</strong> Public data from various search engines</li>
                <li><strong>Analytics Services:</strong> Aggregated data from analytics platforms</li>
              </ul>
              <p className="mt-4">We do not control the accuracy, completeness, or timeliness of third-party data. We are not responsible for:</p>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li>Errors or inaccuracies in third-party data</li>
                <li>Service interruptions from third-party providers</li>
                <li>Changes to third-party data formats or availability</li>
                <li>Limitations of third-party data collection methods</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Section 5 */}
        <Card id="no-guarantee" className="mb-8 border-2 border-orange-200 !bg-white">
          <CardContent className="pt-6">
            <h2 className="text-3xl font-bold mb-4 text-orange-600">5. No Guarantee of Results</h2>
            <div className="space-y-4 text-gray-700">
              <p><strong>WE DO NOT GUARANTEE ANY SPECIFIC RESULTS FROM USING OUR SERVICES.</strong></p>
              <p>SEO performance depends on numerous factors beyond our control, including:</p>
              <div className="grid md:grid-cols-2 gap-4 mt-4">
                <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                  <h4 className="font-semibold mb-2 text-gray-800">Search Engine Factors</h4>
                  <ul className="text-sm space-y-1">
                    <li>• Algorithm changes</li>
                    <li>• Indexing policies</li>
                    <li>• Ranking factors</li>
                  </ul>
                </div>
                <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                  <h4 className="font-semibold mb-2 text-gray-800">Website Factors</h4>
                  <ul className="text-sm space-y-1">
                    <li>• Content quality</li>
                    <li>• Technical implementation</li>
                    <li>• User experience</li>
                  </ul>
                </div>
                <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                  <h4 className="font-semibold mb-2 text-gray-800">Market Factors</h4>
                  <ul className="text-sm space-y-1">
                    <li>• Competition levels</li>
                    <li>• Industry trends</li>
                    <li>• User behavior</li>
                  </ul>
                </div>
                <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                  <h4 className="font-semibold mb-2 text-gray-800">External Factors</h4>
                  <ul className="text-sm space-y-1">
                    <li>• Backlinks quality</li>
                    <li>• Social signals</li>
                    <li>• Brand reputation</li>
                  </ul>
                </div>
              </div>
              <p className="mt-4">Past performance or analysis results do not guarantee future outcomes.</p>
            </div>
          </CardContent>
        </Card>

        {/* Section 6 */}
        <Card id="professional" className="mb-8 border-2 border-orange-200 !bg-white">
          <CardContent className="pt-6">
            <h2 className="text-3xl font-bold mb-4 text-orange-600 flex items-center gap-2">
              <Shield className="h-7 w-7" />
              6. Professional Advice
            </h2>
            <div className="space-y-4 text-gray-700">
              <p>The information provided by MoreClicks.io is not intended as professional SEO, marketing, legal, financial, or business advice.</p>
              <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                <p className="mb-2"><strong>You should:</strong></p>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>Consult with qualified SEO professionals for comprehensive SEO strategies</li>
                  <li>Seek legal advice for compliance and regulatory matters</li>
                  <li>Obtain financial advice for business investment decisions</li>
                  <li>Verify all information independently before making critical decisions</li>
                </ul>
              </div>
              <p className="mt-4">We are not responsible for any decisions made based on information provided through our platform.</p>
            </div>
          </CardContent>
        </Card>

        {/* Section 7 */}
        <Card id="liability" className="mb-8 border-2 border-orange-200 !bg-white">
          <CardContent className="pt-6">
            <h2 className="text-3xl font-bold mb-4 text-orange-600">7. Limitation of Liability</h2>
            <div className="space-y-4 text-gray-700">
              <p>To the fullest extent permitted by law, MoreClicks.io and its operators shall not be liable for:</p>
              <ul className="list-disc list-inside ml-4 space-y-2">
                <li>Any direct, indirect, incidental, special, consequential, or punitive damages</li>
                <li>Loss of profits, revenue, data, or business opportunities</li>
                <li>Errors or omissions in our analysis or data</li>
                <li>Service interruptions or unavailability</li>
                <li>Decisions made based on our analysis or recommendations</li>
                <li>Third-party data inaccuracies or service failures</li>
              </ul>
              <p className="mt-4">This limitation applies regardless of the theory of liability, whether in contract, tort, negligence, or otherwise.</p>
            </div>
          </CardContent>
        </Card>

        {/* Section 8 */}
        <Card id="external" className="mb-8 border-2 border-orange-200 !bg-white">
          <CardContent className="pt-6">
            <h2 className="text-3xl font-bold mb-4 text-orange-600">8. External Links</h2>
            <div className="space-y-4 text-gray-700">
              <p>Our platform may contain links to external websites that are not operated by us. We have no control over the nature, content, and availability of those sites.</p>
              <p>The inclusion of any links does not necessarily imply a recommendation or endorse the views expressed within them.</p>
              <p>We are not responsible for:</p>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li>The content of external websites</li>
                <li>The privacy practices of external websites</li>
                <li>Any damages or losses resulting from use of external websites</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Section 9 */}
        <Card id="changes" className="mb-8 border-2 border-orange-200 !bg-white">
          <CardContent className="pt-6">
            <h2 className="text-3xl font-bold mb-4 text-orange-600">9. Changes to Services</h2>
            <div className="space-y-4 text-gray-700">
              <p>We reserve the right to:</p>
              <ul className="list-disc list-inside ml-4 space-y-2">
                <li>Modify, suspend, or discontinue any part of our services at any time</li>
                <li>Change features, functionality, or data sources without notice</li>
                <li>Update algorithms and analysis methods</li>
                <li>Adjust pricing and subscription plans</li>
              </ul>
              <p className="mt-4">We are not obligated to provide notice of such changes, though we will make reasonable efforts to notify users of material changes when possible.</p>
            </div>
          </CardContent>
        </Card>

        {/* Section 10 */}
        <Card id="contact" className="mb-8 border-2 border-orange-200 bg-orange-50/50">
          <CardContent className="pt-6">
            <h2 className="text-3xl font-bold mb-4 text-orange-600">10. Contact Information</h2>
            <div className="space-y-4 text-gray-700">
              <p>If you have questions about this Disclaimer, please contact us:</p>
              <div className="bg-white p-4 rounded-lg border border-orange-200">
                <p className="font-semibold text-gray-800 mb-2">MoreClicks.io Support Team</p>
                <p className="mb-1">Email: <a href="mailto:support@moreclicks.io" className="text-orange-600 hover:underline font-semibold">support@moreclicks.io</a></p>
                <p>Website: <Link href="/" className="text-orange-600 hover:underline font-semibold">www.moreclicks.io</Link></p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer Links */}
        <div className="text-center mt-12 space-x-4">
          <Link href="/privacy" className="text-orange-600 hover:underline font-semibold">Privacy Policy</Link>
          <span className="text-gray-400">|</span>
          <Link href="/terms" className="text-orange-600 hover:underline font-semibold">Terms of Service</Link>
          <span className="text-gray-400">|</span>
          <Link href="/cookies" className="text-orange-600 hover:underline font-semibold">Cookie Policy</Link>
          <span className="text-gray-400">|</span>
          <Link href="/" className="text-orange-600 hover:underline font-semibold">Home</Link>
        </div>
      </div>

      {/* JSON-LD Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebPage",
            "name": "Disclaimer",
            "description": "Disclaimer and limitations for MoreClicks.io SEO analysis services",
            "url": "https://moreclicks.io/disclaimer",
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

