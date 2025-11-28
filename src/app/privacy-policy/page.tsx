"use client";

import Link from 'next/link';
import Header from "@/components/Header";

export default function PrivacyPolicy() {
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
              Privacy Policy
            </h1>
            <p className="text-base sm:text-lg text-center" style={{ fontFamily: 'var(--font-content)', color: '#000000', opacity: 0.8 }}>
              Last updated: September 2025
            </p>
          </div>

          {/* Section 1 */}
          <section className="mb-6 sm:mb-8">
            <div className="rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 border-2 border-black bg-white dark:bg-gray-800" style={{ boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(0, 0, 0, 0.1)' }}>
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-3 sm:mb-4" style={{ fontFamily: 'var(--font-title)', color: '#000000' }}>
                1. Information We Collect
              </h2>
              <p className="text-base sm:text-lg leading-relaxed mb-3 sm:mb-4" style={{ fontFamily: 'var(--font-content)', color: '#000000' }}>
                ICMA - Hadith Chain Analysis (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;) is committed to protecting your privacy. This Privacy Policy explains how we collect, use, and safeguard your information when you use our web application.
              </p>
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 sm:p-4 border-2 border-black/20 mb-3 sm:mb-4">
                <h3 className="text-base sm:text-lg font-semibold mb-2 sm:mb-3" style={{ fontFamily: 'var(--font-title)', color: '#000000' }}>
                  Data Collection
                </h3>
                <ul className="list-disc list-inside space-y-1.5 sm:space-y-2 text-sm sm:text-base" style={{ fontFamily: 'var(--font-content)', color: '#000000' }}>
                  <li><strong>API Keys:</strong> Google Gemini API keys provided by users for narrator extraction</li>
                  <li><strong>User Input:</strong> Hadith text and analysis data entered by users</li>
                  <li><strong>Application Data:</strong> Chain analysis results and user preferences</li>
                  <li><strong>Technical Data:</strong> Browser information and usage analytics (anonymized)</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Section 2 */}
          <section className="mb-6 sm:mb-8">
            <div className="rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 border-2 border-black bg-white dark:bg-gray-800" style={{ boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(0, 0, 0, 0.1)' }}>
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-3 sm:mb-4" style={{ fontFamily: 'var(--font-title)', color: '#000000' }}>
                2. How We Use Your Information
              </h2>
              <div className="space-y-3 sm:space-y-4">
                <div>
                  <h3 className="text-base sm:text-lg font-semibold mb-2" style={{ fontFamily: 'var(--font-title)', color: '#000000' }}>
                    Primary Purpose
                  </h3>
                  <p className="text-base sm:text-lg leading-relaxed" style={{ fontFamily: 'var(--font-content)', color: '#000000' }}>
                    Your API keys and input data are used solely to provide the hadith analysis functionality. We process your hadith text using Google&apos;s Gemini AI to extract narrator chains.
                  </p>
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-semibold mb-2" style={{ fontFamily: 'var(--font-title)', color: '#000000' }}>
                    Data Processing
                  </h3>
                  <ul className="list-disc list-inside space-y-1.5 sm:space-y-2 text-sm sm:text-base" style={{ fontFamily: 'var(--font-content)', color: '#000000' }}>
                    <li>API keys are transmitted securely to Google&apos;s Gemini AI service</li>
                    <li>Hadith text is processed to extract narrator information</li>
                    <li>Analysis results are displayed in your browser</li>
                    <li>All processing happens in real-time and results are not stored on our servers</li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          {/* Section 3 */}
          <section className="mb-6 sm:mb-8">
            <div className="rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 border-2 border-black bg-white dark:bg-gray-800" style={{ boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(0, 0, 0, 0.1)' }}>
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-3 sm:mb-4" style={{ fontFamily: 'var(--font-title)', color: '#000000' }}>
                3. Data Storage and Security
              </h2>
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 sm:p-4 border-2 border-black/20 mb-3 sm:mb-4">
                <div className="flex items-start">
                  <svg className="w-5 h-5 sm:w-6 sm:h-6 mt-0.5 mr-2 sm:mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: '#000000' }}>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  <div>
                    <h3 className="text-base sm:text-lg font-semibold mb-1" style={{ fontFamily: 'var(--font-title)', color: '#000000' }}>
                      Local Storage Only
                    </h3>
                    <p className="text-sm sm:text-base md:text-lg leading-relaxed" style={{ fontFamily: 'var(--font-content)', color: '#000000' }}>
                      All your data, including API keys and analysis results, is stored locally in your browser. We do not store, transmit, or have access to your personal data on our servers.
                    </p>
                  </div>
                </div>
              </div>
              <div className="space-y-2 sm:space-y-3">
                <p className="text-sm sm:text-base md:text-lg leading-relaxed" style={{ fontFamily: 'var(--font-content)', color: '#000000' }}>
                  <strong>API Keys:</strong> Stored securely in your browser&apos;s localStorage and only used for API calls to Google&apos;s Gemini service.
                </p>
                <p className="text-sm sm:text-base md:text-lg leading-relaxed" style={{ fontFamily: 'var(--font-content)', color: '#000000' }}>
                  <strong>Hadith Data:</strong> Processed in real-time and displayed in your browser. Not transmitted to or stored on our servers.
                </p>
                <p className="text-sm sm:text-base md:text-lg leading-relaxed" style={{ fontFamily: 'var(--font-content)', color: '#000000' }}>
                  <strong>User Preferences:</strong> Theme settings and other preferences stored locally for better user experience.
                </p>
              </div>
            </div>
          </section>

          {/* Section 4 */}
          <section className="mb-6 sm:mb-8">
            <div className="rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 border-2 border-black bg-white dark:bg-gray-800" style={{ boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(0, 0, 0, 0.1)' }}>
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-3 sm:mb-4" style={{ fontFamily: 'var(--font-title)', color: '#000000' }}>
                4. Third-Party Services
              </h2>
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 sm:p-4 border-2 border-black/20">
                <div className="flex items-start">
                  <svg className="w-5 h-5 sm:w-6 sm:h-6 mt-0.5 mr-2 sm:mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: '#000000' }}>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <h3 className="text-base sm:text-lg font-semibold mb-1" style={{ fontFamily: 'var(--font-title)', color: '#000000' }}>
                      Google Gemini AI
                    </h3>
                    <p className="text-sm sm:text-base md:text-lg leading-relaxed mb-2" style={{ fontFamily: 'var(--font-content)', color: '#000000' }}>
                      We use Google&apos;s Gemini AI service to process hadith text and extract narrator information.
                    </p>
                    <p className="text-xs sm:text-sm md:text-base leading-relaxed" style={{ fontFamily: 'var(--font-content)', color: '#000000', opacity: 0.8 }}>
                      Your API key and hadith text are transmitted directly to Google&apos;s servers. We do not have access to or store this data. Please refer to <a href="https://policies.google.com/privacy" className="underline hover:no-underline font-semibold break-all" target="_blank" rel="noopener noreferrer">Google&apos;s Privacy Policy</a> for their data handling practices.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Section 5 */}
          <section className="mb-6 sm:mb-8">
            <div className="rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 border-2 border-black bg-white dark:bg-gray-800" style={{ boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(0, 0, 0, 0.1)' }}>
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-3 sm:mb-4" style={{ fontFamily: 'var(--font-title)', color: '#000000' }}>
                5. Data Retention
              </h2>
              <p className="text-base sm:text-lg leading-relaxed mb-3 sm:mb-4" style={{ fontFamily: 'var(--font-content)', color: '#000000' }}>
                We follow a minimal data retention policy:
              </p>
              <ul className="list-disc list-inside space-y-1.5 sm:space-y-2 text-sm sm:text-base" style={{ fontFamily: 'var(--font-content)', color: '#000000' }}>
                <li><strong>API Keys:</strong> Stored in your browser until you clear them or use the &quot;Clear Cache&quot; feature</li>
                <li><strong>Analysis Data:</strong> Not stored on our servers - only displayed in your browser</li>
                <li><strong>User Preferences:</strong> Stored locally and persist until cleared</li>
                <li><strong>Automatic Cleanup:</strong> Data is automatically removed when you clear your browser data</li>
              </ul>
            </div>
          </section>

          {/* Section 6 */}
          <section className="mb-6 sm:mb-8">
            <div className="rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 border-2 border-black bg-white dark:bg-gray-800" style={{ boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(0, 0, 0, 0.1)' }}>
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-3 sm:mb-4" style={{ fontFamily: 'var(--font-title)', color: '#000000' }}>
                6. Your Rights and Controls
              </h2>
              <div className="grid md:grid-cols-2 gap-3 sm:gap-4">
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 sm:p-4 border-2 border-black/20">
                  <h3 className="text-base sm:text-lg font-semibold mb-2" style={{ fontFamily: 'var(--font-title)', color: '#000000' }}>
                    What You Can Do
                  </h3>
                  <ul className="space-y-1 text-sm sm:text-base" style={{ fontFamily: 'var(--font-content)', color: '#000000' }}>
                    <li>• Update or remove your API key anytime</li>
                    <li>• Clear all cached data instantly</li>
                    <li>• Control what data is processed</li>
                    <li>• Opt-out by not providing API keys</li>
                  </ul>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 sm:p-4 border-2 border-black/20">
                  <h3 className="text-base sm:text-lg font-semibold mb-2" style={{ fontFamily: 'var(--font-title)', color: '#000000' }}>
                    Data Control
                  </h3>
                  <ul className="space-y-1 text-sm sm:text-base" style={{ fontFamily: 'var(--font-content)', color: '#000000' }}>
                    <li>• No account creation required</li>
                    <li>• No email collection</li>
                    <li>• No tracking or analytics</li>
                    <li>• Full local control</li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          {/* Section 7 */}
          <section className="mb-6 sm:mb-8">
            <div className="rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 border-2 border-black bg-white dark:bg-gray-800" style={{ boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(0, 0, 0, 0.1)' }}>
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-3 sm:mb-4" style={{ fontFamily: 'var(--font-title)', color: '#000000' }}>
                7. Contact Information
              </h2>
              <p className="text-base sm:text-lg leading-relaxed mb-3 sm:mb-4" style={{ fontFamily: 'var(--font-content)', color: '#000000' }}>
                If you have any questions about this Privacy Policy or our data practices, please contact us:
              </p>
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 sm:p-4 border-2 border-black/20">
                <p className="text-sm sm:text-base md:text-lg break-all" style={{ fontFamily: 'var(--font-content)', color: '#000000' }}>
                  <strong>Email:</strong> thedigitalsunnah@gmail.com<br/>
                  <strong>Subject:</strong> Privacy Policy Inquiry
                </p>
              </div>
            </div>
          </section>

          {/* Section 8 */}
          <section className="mb-6 sm:mb-8">
            <div className="rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 border-2 border-black bg-white dark:bg-gray-800" style={{ boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(0, 0, 0, 0.1)' }}>
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-3 sm:mb-4" style={{ fontFamily: 'var(--font-title)', color: '#000000' }}>
                8. Changes to This Policy
              </h2>
              <p className="text-sm sm:text-base md:text-lg leading-relaxed" style={{ fontFamily: 'var(--font-content)', color: '#000000' }}>
                We may update this Privacy Policy from time to time. Any changes will be posted on this page with an updated revision date. We encourage you to review this Privacy Policy periodically to stay informed about our data practices.
              </p>
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
