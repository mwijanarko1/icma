"use client";

import HadithAnalyzer from "@/components/HadithAnalyzer";
import Link from "next/link";
import Header from "@/components/Header";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { ErrorBoundary } from "@/components/ErrorBoundary";

// Structured data for better SEO
const structuredData = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "ICMA - Hadith Chain Analysis",
  "description": "Advanced web application for analyzing and dating Islamic hadith chains using ICMA methodology, AI-powered narrator extraction, and scholarly research tools.",
  "applicationCategory": "EducationalApplication",
  "operatingSystem": "Web Browser",
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "USD",
    "description": "Free online access to advanced Hadith analysis tools"
  },
  "featureList": [
    "Hadith chain analysis",
    "AI-powered narrator extraction",
    "ICMA methodology implementation",
    "Harald Motzki dating techniques",
    "Interactive chain visualization",
    "Textual criticism tools",
    "Source criticism analysis",
    "Academic research platform"
  ],
  "keywords": [
    "Hadith analysis", "Islamic studies", "Academic research", "Textual criticism",
    "Source criticism", "Digital humanities", "Hadith dating", "ICMA methodology"
  ],
  "publisher": {
    "@type": "Organization",
    "name": "ICMA - Hadith Chain Analyzer",
    "url": "https://icma-omega.vercel.app/"
  },
  "educationalUse": "Research",
  "audience": {
    "@type": "EducationalAudience",
    "educationalRole": "Researcher"
  }
};

function ChainAnalyzerContent() {
  const searchParams = useSearchParams();
  const collection = searchParams.get('collection');

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData),
        }}
      />
      <div
        className="min-h-screen relative"
        style={{
          backgroundColor: '#f2e9dd',
          color: '#000000',
        }}
      >
        {/* Content Container */}
        <div className="relative z-10">
          <Header />

          {/* Main Content */}
          <div className="max-w-7xl mx-auto px-2 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-8">
            <ErrorBoundary
              fallback={
                <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
                  <h3 className="text-lg font-medium text-red-800 mb-2">
                    Analysis Tool Error
                  </h3>
                  <p className="text-red-600 mb-4">
                    There was a problem loading the Hadith analyzer. Please try refreshing the page.
                  </p>
                  <button
                    onClick={() => window.location.reload()}
                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                  >
                    Refresh Page
                  </button>
                </div>
              }
              onError={(error, errorInfo) => {
                console.error('HadithAnalyzer Error:', error, errorInfo);
                // Could send to monitoring service
              }}
            >
              <HadithAnalyzer initialCollection={collection} />
            </ErrorBoundary>
          </div>

          {/* Footer */}
          <footer className="relative z-10 border-t-2 border-black/20 mt-16" style={{ backgroundColor: 'rgba(242, 233, 221, 0.95)' }}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
                {/* About Section */}
                <div>
                  <h3 className="text-xl font-bold mb-4" style={{ fontFamily: 'var(--font-title)', color: '#000000' }}>
                    About ICMA
                  </h3>
                  <p className="text-sm leading-relaxed" style={{ fontFamily: 'var(--font-content)', color: '#000000', opacity: 0.8 }}>
                    Advanced Hadith analysis platform using Isnād-cum-Matn Analysis (ICMA) methodology for dating and authenticating Islamic hadith chains.
                  </p>
                </div>

                {/* Quick Links */}
                <div>
                  <h3 className="text-xl font-bold mb-4" style={{ fontFamily: 'var(--font-title)', color: '#000000' }}>
                    Quick Links
                  </h3>
                  <ul className="space-y-2">
                    <li>
                      <Link
                        href="/chain-analyzer"
                        className="text-sm hover:opacity-80 transition-opacity inline-block"
                        style={{ fontFamily: 'var(--font-content)', color: '#000000', opacity: 0.8 }}
                      >
                        Chain Analyzer
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/analysis"
                        className="text-sm hover:opacity-80 transition-opacity inline-block"
                        style={{ fontFamily: 'var(--font-content)', color: '#000000', opacity: 0.8 }}
                      >
                        Start Analysis
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/privacy-policy"
                        className="text-sm hover:opacity-80 transition-opacity inline-block"
                        style={{ fontFamily: 'var(--font-content)', color: '#000000', opacity: 0.8 }}
                      >
                        Privacy Policy
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/terms-of-service"
                        className="text-sm hover:opacity-80 transition-opacity inline-block"
                        style={{ fontFamily: 'var(--font-content)', color: '#000000', opacity: 0.8 }}
                      >
                        Terms of Service
                      </Link>
                    </li>
                  </ul>
                </div>

                {/* Resources */}
                <div>
                  <h3 className="text-xl font-bold mb-4" style={{ fontFamily: 'var(--font-title)', color: '#000000' }}>
                    Resources
                  </h3>
                  <p className="text-sm leading-relaxed mb-4" style={{ fontFamily: 'var(--font-content)', color: '#000000', opacity: 0.8 }}>
                    Learn about ICMA methodology and Harald Motzki dating techniques for academic research in Islamic studies.
                  </p>
                </div>
              </div>

              {/* Bottom Bar */}
              <div className="border-t border-black/10 pt-8">
                <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                  <p className="text-sm text-center md:text-left" style={{ fontFamily: 'var(--font-content)', color: '#000000', opacity: 0.7 }}>
                    © <span suppressHydrationWarning>{new Date().getFullYear()}</span> ICMA - Hadith Chain Analyzer. All rights reserved.
                  </p>
                  <div className="flex items-center gap-6">
                    <Link
                      href="/privacy-policy"
                      className="text-sm hover:opacity-80 transition-opacity"
                      style={{ fontFamily: 'var(--font-content)', color: '#000000', opacity: 0.7 }}
                    >
                      Privacy
                    </Link>
                    <Link
                      href="/terms-of-service"
                      className="text-sm hover:opacity-80 transition-opacity"
                      style={{ fontFamily: 'var(--font-content)', color: '#000000', opacity: 0.7 }}
                    >
                      Terms
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </footer>
        </div>
      </div>
    </>
  );
}

export default function ChainAnalyzer() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ChainAnalyzerContent />
    </Suspense>
  );
}
