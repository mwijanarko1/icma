"use client";

import Link from 'next/link';
import Header from "@/components/Header";

export default function TermsOfService() {
  return (
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
        <div className="max-w-4xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-6 sm:py-12">
          {/* Title Card */}
          <div className="rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 border-2 border-black bg-white dark:bg-gray-800 mb-6 sm:mb-8" style={{ boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(0, 0, 0, 0.1)' }}>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-center mb-3 sm:mb-4" style={{ fontFamily: 'var(--font-title)', color: '#000000' }}>
              Terms of Service
            </h1>
            <p className="text-base sm:text-lg text-center" style={{ fontFamily: 'var(--font-content)', color: '#000000', opacity: 0.8 }}>
              Last updated: September 2025
            </p>
          </div>

          {/* Section 1 */}
          <section className="mb-6 sm:mb-8">
            <div className="rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 border-2 border-black bg-white dark:bg-gray-800" style={{ boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(0, 0, 0, 0.1)' }}>
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-3 sm:mb-4" style={{ fontFamily: 'var(--font-title)', color: '#000000' }}>
                1. Acceptance of Terms
              </h2>
              <p className="text-base sm:text-lg leading-relaxed mb-3 sm:mb-4" style={{ fontFamily: 'var(--font-content)', color: '#000000' }}>
                By accessing and using ICMA - Hadith Chain Analysis (&quot;the Service&quot;), you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
              </p>
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 sm:p-4 border-2 border-black/20">
                <p className="text-sm sm:text-base md:text-lg leading-relaxed" style={{ fontFamily: 'var(--font-content)', color: '#000000' }}>
                  <strong>Free Service:</strong> This service is provided free of charge. You are responsible for your own API usage costs with third-party providers.
                </p>
              </div>
            </div>
          </section>

          {/* Section 2 */}
          <section className="mb-6 sm:mb-8">
            <div className="rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 border-2 border-black bg-white dark:bg-gray-800" style={{ boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(0, 0, 0, 0.1)' }}>
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-3 sm:mb-4" style={{ fontFamily: 'var(--font-title)', color: '#000000' }}>
                2. Service Description
              </h2>
              <div className="space-y-3 sm:space-y-4">
                <p className="text-base sm:text-lg leading-relaxed" style={{ fontFamily: 'var(--font-content)', color: '#000000' }}>
                  ICMA - Hadith Chain Analysis is a web application that helps users analyze Islamic hadith chains (isnad) by:
                </p>
                <ul className="list-disc list-inside space-y-1.5 sm:space-y-2 text-sm sm:text-base" style={{ fontFamily: 'var(--font-content)', color: '#000000' }}>
                  <li>Extracting narrator information from Arabic hadith text using AI</li>
                  <li>Visualizing hadith transmission chains</li>
                  <li>Allowing users to edit and organize narrator data</li>
                  <li>Providing tools for hadith scholarship and research</li>
                </ul>
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 sm:p-4 border-2 border-black/20">
                  <div className="flex items-start">
                    <svg className="w-5 h-5 sm:w-6 sm:h-6 mt-0.5 mr-2 sm:mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: '#000000' }}>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                    <div>
                      <h3 className="text-base sm:text-lg font-semibold mb-1" style={{ fontFamily: 'var(--font-title)', color: '#000000' }}>
                        API Key Requirement
                      </h3>
                      <p className="text-sm sm:text-base md:text-lg leading-relaxed" style={{ fontFamily: 'var(--font-content)', color: '#000000' }}>
                        To use the narrator extraction feature, you must provide your own Google Gemini API key. We do not provide API keys or bear any API usage costs.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Section 3 */}
          <section className="mb-6 sm:mb-8">
            <div className="rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 border-2 border-black bg-white dark:bg-gray-800" style={{ boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(0, 0, 0, 0.1)' }}>
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-3 sm:mb-4" style={{ fontFamily: 'var(--font-title)', color: '#000000' }}>
                3. User Responsibilities
              </h2>
              <div className="grid md:grid-cols-2 gap-3 sm:gap-4">
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 sm:p-4 border-2 border-black/20">
                  <h3 className="text-base sm:text-lg font-semibold mb-2 sm:mb-3" style={{ fontFamily: 'var(--font-title)', color: '#000000' }}>
                    Prohibited Uses
                  </h3>
                  <ul className="space-y-1.5 sm:space-y-2 text-sm sm:text-base" style={{ fontFamily: 'var(--font-content)', color: '#000000' }}>
                    <li>• Using the service for illegal purposes</li>
                    <li>• Attempting to reverse engineer or hack the service</li>
                    <li>• Sharing false or misleading information</li>
                    <li>• Violating intellectual property rights</li>
                    <li>• Distributing harmful or malicious content</li>
                  </ul>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 sm:p-4 border-2 border-black/20">
                  <h3 className="text-base sm:text-lg font-semibold mb-2 sm:mb-3" style={{ fontFamily: 'var(--font-title)', color: '#000000' }}>
                    Your Responsibilities
                  </h3>
                  <ul className="space-y-1.5 sm:space-y-2 text-sm sm:text-base" style={{ fontFamily: 'var(--font-content)', color: '#000000' }}>
                    <li>• Provide accurate API keys</li>
                    <li>• Respect copyright and usage rights</li>
                    <li>• Use service for legitimate research</li>
                    <li>• Keep your API keys secure</li>
                    <li>• Report any service issues</li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          {/* Section 4 */}
          <section className="mb-6 sm:mb-8">
            <div className="rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 border-2 border-black bg-white dark:bg-gray-800" style={{ boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(0, 0, 0, 0.1)' }}>
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-3 sm:mb-4" style={{ fontFamily: 'var(--font-title)', color: '#000000' }}>
                4. API Usage and Costs
              </h2>
              <div className="space-y-4">
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 sm:p-4 border-2 border-black/20">
                    <h3 className="text-base sm:text-lg font-semibold mb-2" style={{ fontFamily: 'var(--font-title)', color: '#000000' }}>
                    Third-Party API Services
                  </h3>
                  <p className="text-base sm:text-lg leading-relaxed mb-3" style={{ fontFamily: 'var(--font-content)', color: '#000000' }}>
                    This service integrates with Google&apos;s Gemini AI service. You are solely responsible for:
                  </p>
                  <ul className="list-disc list-inside space-y-1" style={{ fontFamily: 'var(--font-content)', color: '#000000' }}>
                    <li>Obtaining your own Google Gemini API key</li>
                    <li>All API usage costs and billing</li>
                    <li>Complying with Google&apos;s terms of service</li>
                    <li>Managing your API usage limits and quotas</li>
                  </ul>
                </div>
                <p className="text-base sm:text-lg leading-relaxed" style={{ fontFamily: 'var(--font-content)', color: '#000000' }}>
                  We do not provide API keys, subsidize API costs, or have any financial responsibility for your API usage. You should monitor your Google Cloud billing and usage to avoid unexpected charges.
                </p>
              </div>
            </div>
          </section>

          {/* Section 5 */}
          <section className="mb-6 sm:mb-8">
            <div className="rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 border-2 border-black bg-white dark:bg-gray-800" style={{ boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(0, 0, 0, 0.1)' }}>
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-3 sm:mb-4" style={{ fontFamily: 'var(--font-title)', color: '#000000' }}>
                5. Data Privacy and Security
              </h2>
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 border-2 border-black/20 mb-4">
                <div className="flex items-start">
                  <svg className="w-6 h-6 mt-0.5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: '#000000' }}>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  <div>
                    <h3 className="text-lg font-semibold mb-1" style={{ fontFamily: 'var(--font-title)', color: '#000000' }}>
                      Your Data, Your Control
                    </h3>
                    <p className="text-base sm:text-lg leading-relaxed" style={{ fontFamily: 'var(--font-content)', color: '#000000' }}>
                      All your data is stored locally in your browser. We do not collect, store, or transmit your personal information, API keys, or hadith analysis data.
                    </p>
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                <p className="text-base sm:text-lg leading-relaxed" style={{ fontFamily: 'var(--font-content)', color: '#000000' }}>
                  <strong>API Keys:</strong> Stored securely in your browser&apos;s localStorage. Only transmitted to Google&apos;s servers for processing.
                </p>
                <p className="text-base sm:text-lg leading-relaxed" style={{ fontFamily: 'var(--font-content)', color: '#000000' }}>
                  <strong>Hadith Content:</strong> Processed in real-time and displayed in your browser. Not stored on our servers.
                </p>
                <p className="text-base sm:text-lg leading-relaxed" style={{ fontFamily: 'var(--font-content)', color: '#000000' }}>
                  <strong>Security:</strong> We implement reasonable security measures, but you are responsible for keeping your API keys secure.
                </p>
              </div>
            </div>
          </section>

          {/* Section 6 */}
          <section className="mb-6 sm:mb-8">
            <div className="rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 border-2 border-black bg-white dark:bg-gray-800" style={{ boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(0, 0, 0, 0.1)' }}>
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-3 sm:mb-4" style={{ fontFamily: 'var(--font-title)', color: '#000000' }}>
                6. Service Availability and Limitations
              </h2>
              <div className="space-y-4">
                <div>
                    <h3 className="text-base sm:text-lg font-semibold mb-2" style={{ fontFamily: 'var(--font-title)', color: '#000000' }}>
                    Free Service Limitations
                  </h3>
                  <ul className="list-disc list-inside space-y-1.5 sm:space-y-2 text-sm sm:text-base" style={{ fontFamily: 'var(--font-content)', color: '#000000' }}>
                    <li>Service availability is provided &quot;as is&quot; without warranties</li>
                    <li>We may modify or discontinue features at any time</li>
                    <li>No guaranteed uptime or performance levels</li>
                    <li>Third-party API dependencies may affect service availability</li>
                  </ul>
                </div>
                <div>
                    <h3 className="text-base sm:text-lg font-semibold mb-2" style={{ fontFamily: 'var(--font-title)', color: '#000000' }}>
                    Accuracy Disclaimer
                  </h3>
                  <p className="text-base sm:text-lg leading-relaxed" style={{ fontFamily: 'var(--font-content)', color: '#000000' }}>
                    The AI-powered narrator extraction is provided for research and educational purposes. While we strive for accuracy, the results may contain errors or omissions. Users should verify all analysis results through traditional scholarly methods.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Section 7 */}
          <section className="mb-6 sm:mb-8">
            <div className="rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 border-2 border-black bg-white dark:bg-gray-800" style={{ boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(0, 0, 0, 0.1)' }}>
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-3 sm:mb-4" style={{ fontFamily: 'var(--font-title)', color: '#000000' }}>
                7. Intellectual Property
              </h2>
              <div className="space-y-4">
                <p className="text-base sm:text-lg leading-relaxed" style={{ fontFamily: 'var(--font-content)', color: '#000000' }}>
                  The ICMA - Hadith Chain Analysis application and its original content, features, and functionality are owned by us and are protected by international copyright, trademark, and other intellectual property laws.
                </p>
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 sm:p-4 border-2 border-black/20">
                    <h3 className="text-base sm:text-lg font-semibold mb-2" style={{ fontFamily: 'var(--font-title)', color: '#000000' }}>
                    User Content
                  </h3>
                  <p className="text-base sm:text-lg leading-relaxed" style={{ fontFamily: 'var(--font-content)', color: '#000000' }}>
                    You retain all rights to the hadith texts and analysis data you input. By using our service, you grant us a limited license to process this content solely for providing the analysis functionality.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Section 8 */}
          <section className="mb-6 sm:mb-8">
            <div className="rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 border-2 border-black bg-white dark:bg-gray-800" style={{ boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(0, 0, 0, 0.1)' }}>
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-3 sm:mb-4" style={{ fontFamily: 'var(--font-title)', color: '#000000' }}>
                8. Limitation of Liability
              </h2>
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 border-2 border-black/20">
                <p className="text-base sm:text-lg leading-relaxed mb-3" style={{ fontFamily: 'var(--font-content)', color: '#000000' }}>
                  To the fullest extent permitted by applicable law, we shall not be liable for:
                </p>
                <ul className="list-disc list-inside space-y-1" style={{ fontFamily: 'var(--font-content)', color: '#000000' }}>
                  <li>Any indirect, incidental, special, or consequential damages</li>
                  <li>Loss of profits, data, or business opportunities</li>
                  <li>Service interruptions or unavailability</li>
                  <li>API-related costs or billing issues</li>
                  <li>Accuracy of AI-generated analysis results</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Section 9 */}
          <section className="mb-6 sm:mb-8">
            <div className="rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 border-2 border-black bg-white dark:bg-gray-800" style={{ boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(0, 0, 0, 0.1)' }}>
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-3 sm:mb-4" style={{ fontFamily: 'var(--font-title)', color: '#000000' }}>
                9. Termination
              </h2>
              <p className="text-base sm:text-lg leading-relaxed mb-4" style={{ fontFamily: 'var(--font-content)', color: '#000000' }}>
                We reserve the right to terminate or suspend your access to our service immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms.
              </p>
              <p className="text-base sm:text-lg leading-relaxed" style={{ fontFamily: 'var(--font-content)', color: '#000000' }}>
                Upon termination, your right to use the service will cease immediately. If you wish to terminate your account, you may simply stop using the service.
              </p>
            </div>
          </section>

          {/* Section 10 */}
          <section className="mb-6 sm:mb-8">
            <div className="rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 border-2 border-black bg-white dark:bg-gray-800" style={{ boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(0, 0, 0, 0.1)' }}>
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-3 sm:mb-4" style={{ fontFamily: 'var(--font-title)', color: '#000000' }}>
                10. Governing Law
              </h2>
              <p className="text-base sm:text-lg leading-relaxed" style={{ fontFamily: 'var(--font-content)', color: '#000000' }}>
                These Terms shall be interpreted and governed by the laws of the jurisdiction in which our service is operated, without regard to conflict of law provisions. Our failure to enforce any right or provision of these Terms will not be considered a waiver of those rights.
              </p>
            </div>
          </section>

          {/* Section 11 */}
          <section className="mb-6 sm:mb-8">
            <div className="rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 border-2 border-black bg-white dark:bg-gray-800" style={{ boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(0, 0, 0, 0.1)' }}>
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-3 sm:mb-4" style={{ fontFamily: 'var(--font-title)', color: '#000000' }}>
                11. Changes to Terms
              </h2>
              <p className="text-base sm:text-lg leading-relaxed" style={{ fontFamily: 'var(--font-content)', color: '#000000' }}>
                We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is material, we will try to provide at least 30 days notice prior to any new terms taking effect. What constitutes a material change will be determined at our sole discretion.
              </p>
            </div>
          </section>

          {/* Section 12 */}
          <section className="mb-6 sm:mb-8">
            <div className="rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 border-2 border-black bg-white dark:bg-gray-800" style={{ boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(0, 0, 0, 0.1)' }}>
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-3 sm:mb-4" style={{ fontFamily: 'var(--font-title)', color: '#000000' }}>
                12. Contact Information
              </h2>
              <p className="text-base sm:text-lg leading-relaxed mb-4" style={{ fontFamily: 'var(--font-content)', color: '#000000' }}>
                If you have any questions about these Terms of Service, please contact us:
              </p>
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 border-2 border-black/20">
                <p className="text-lg" style={{ fontFamily: 'var(--font-content)', color: '#000000' }}>
                  <strong>Email:</strong> thedigitalsunnah@gmail.com<br/>
                  <strong>Subject:</strong> Terms of Service Inquiry
                </p>
              </div>
            </div>
          </section>

          {/* Footer Navigation */}
          <div className="text-center mt-8 sm:mt-12 pt-6 sm:pt-8">
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-5 sm:px-6 py-2.5 sm:py-3 rounded-lg font-semibold text-sm sm:text-base transition-all duration-200 shadow-lg hover:shadow-xl border-2 border-black"
              style={{ backgroundColor: '#000000', color: '#f2e9dd', fontFamily: 'var(--font-content)' }}
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              <span>Back to Home</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
