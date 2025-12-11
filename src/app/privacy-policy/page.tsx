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
              Last updated: December 2025
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
                  <li><strong>API Keys:</strong> Google Gemini API keys provided by users for narrator extraction (stored locally in browser only)</li>
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
                      Local Storage (Default)
                    </h3>
                    <p className="text-sm sm:text-base md:text-lg leading-relaxed" style={{ fontFamily: 'var(--font-content)', color: '#000000' }}>
                      By default, all your data including API keys and analysis results is stored locally in your browser. We do not store, transmit, or have access to your personal data on our servers when you use the application without signing in.
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 sm:p-4 border-2 border-blue-200 dark:border-blue-800 mb-3 sm:mb-4">
                <div className="flex items-start">
                  <svg className="w-5 h-5 sm:w-6 sm:h-6 mt-0.5 mr-2 sm:mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: '#000000' }}>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                  <div>
                    <h3 className="text-base sm:text-lg font-semibold mb-1" style={{ fontFamily: 'var(--font-title)', color: '#000000' }}>
                      Signed-In User Data Storage
                    </h3>
                    <p className="text-sm sm:text-base md:text-lg leading-relaxed mb-2" style={{ fontFamily: 'var(--font-content)', color: '#000000' }}>
                      <strong>When you sign in:</strong> Your analysis data and chain analysis data may be automatically saved to our secure Firebase database to preserve your work across sessions. This includes hadith text, narrator chains, analysis steps, selected hadiths, and generated visualizations. You can manage and delete your saved sessions from your profile.
                    </p>
                    <p className="text-sm sm:text-base md:text-lg leading-relaxed" style={{ fontFamily: 'var(--font-content)', color: '#000000' }}>
                      <strong>Important:</strong> Even when signed in, your API keys remain stored only locally in your browser. We never store, transmit, or have access to your API keys on our servers or database.
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
                We follow different data retention policies based on how you use our service:
              </p>

              <div className="grid md:grid-cols-2 gap-4 mb-4">
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 sm:p-4 border-2 border-black/20">
                  <h3 className="text-base sm:text-lg font-semibold mb-2" style={{ fontFamily: 'var(--font-title)', color: '#000000' }}>
                    Local-Only Usage
                  </h3>
                  <ul className="list-disc list-inside space-y-1 text-sm sm:text-base" style={{ fontFamily: 'var(--font-content)', color: '#000000' }}>
                    <li><strong>API Keys:</strong> Stored locally until cleared</li>
                    <li><strong>Analysis Data:</strong> Never stored on servers</li>
                    <li><strong>User Preferences:</strong> Stored locally until cleared</li>
                    <li><strong>Cleanup:</strong> Automatic removal via browser data clearing</li>
                  </ul>
                </div>

                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 sm:p-4 border-2 border-blue-200 dark:border-blue-800">
                  <h3 className="text-base sm:text-lg font-semibold mb-2" style={{ fontFamily: 'var(--font-title)', color: '#000000' }}>
                    Signed-In Users
                  </h3>
                  <ul className="list-disc list-inside space-y-1 text-sm sm:text-base" style={{ fontFamily: 'var(--font-content)', color: '#000000' }}>
                    <li><strong>Analysis Sessions:</strong> Retained until you delete them</li>
                    <li><strong>Chain Analysis Data:</strong> Saved automatically during sessions</li>
                    <li><strong>API Keys:</strong> Always stored locally in browser only</li>
                    <li><strong>User Profile:</strong> Retained while account is active</li>
                    <li><strong>Account Deletion:</strong> All data deleted upon account removal</li>
                  </ul>
                </div>
              </div>

              <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg p-4 border-2 border-amber-200 dark:border-amber-800">
                <p className="text-sm sm:text-base" style={{ fontFamily: 'var(--font-content)', color: '#000000' }}>
                  <strong>Data Control:</strong> Signed-in users can view, export, and delete their saved analysis sessions and chain data at any time through their profile. Local data remains under your exclusive control.
                </p>
              </div>
            </div>
          </section>

          {/* Section 6 */}
          <section className="mb-6 sm:mb-8">
            <div className="rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 border-2 border-black bg-white dark:bg-gray-800" style={{ boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(0, 0, 0, 0.1)' }}>
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-3 sm:mb-4" style={{ fontFamily: 'var(--font-title)', color: '#000000' }}>
                6. GDPR Data Subject Rights
              </h2>
              <p className="text-base sm:text-lg leading-relaxed mb-4" style={{ fontFamily: 'var(--font-content)', color: '#000000' }}>
                As a resident of the European Economic Area (EEA), you have the following rights under the General Data Protection Regulation (GDPR):
              </p>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 sm:p-4 border-2 border-black/20">
                    <h3 className="text-base sm:text-lg font-semibold mb-2" style={{ fontFamily: 'var(--font-title)', color: '#000000' }}>
                      Right of Access (Article 15)
                    </h3>
                    <p className="text-sm sm:text-base" style={{ fontFamily: 'var(--font-content)', color: '#000000' }}>
                      You have the right to obtain confirmation whether we process your personal data and access to that data.
                    </p>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 sm:p-4 border-2 border-black/20">
                    <h3 className="text-base sm:text-lg font-semibold mb-2" style={{ fontFamily: 'var(--font-title)', color: '#000000' }}>
                      Right to Rectification (Article 16)
                    </h3>
                    <p className="text-sm sm:text-base" style={{ fontFamily: 'var(--font-content)', color: '#000000' }}>
                      You have the right to have inaccurate personal data rectified or incomplete data completed.
                    </p>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 sm:p-4 border-2 border-black/20">
                    <h3 className="text-base sm:text-lg font-semibold mb-2" style={{ fontFamily: 'var(--font-title)', color: '#000000' }}>
                      Right to Erasure (Article 17)
                    </h3>
                    <p className="text-sm sm:text-base" style={{ fontFamily: 'var(--font-content)', color: '#000000' }}>
                      You have the right to have your personal data erased (&quot;right to be forgotten&quot;).
                    </p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 sm:p-4 border-2 border-black/20">
                    <h3 className="text-base sm:text-lg font-semibold mb-2" style={{ fontFamily: 'var(--font-title)', color: '#000000' }}>
                      Right to Data Portability (Article 20)
                    </h3>
                    <p className="text-sm sm:text-base" style={{ fontFamily: 'var(--font-content)', color: '#000000' }}>
                      You have the right to receive your personal data in a structured, commonly used format.
                    </p>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 sm:p-4 border-2 border-black/20">
                    <h3 className="text-base sm:text-lg font-semibold mb-2" style={{ fontFamily: 'var(--font-title)', color: '#000000' }}>
                      Right to Restriction (Article 18)
                    </h3>
                    <p className="text-sm sm:text-base" style={{ fontFamily: 'var(--font-content)', color: '#000000' }}>
                      You have the right to restrict the processing of your personal data in certain circumstances.
                    </p>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 sm:p-4 border-2 border-black/20">
                    <h3 className="text-base sm:text-lg font-semibold mb-2" style={{ fontFamily: 'var(--font-title)', color: '#000000' }}>
                      Right to Object (Article 21)
                    </h3>
                    <p className="text-sm sm:text-base" style={{ fontFamily: 'var(--font-content)', color: '#000000' }}>
                      You have the right to object to the processing of your personal data for certain purposes.
                    </p>
                  </div>
                </div>
              </div>
              <div className="mt-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border-2 border-blue-200 dark:border-blue-800">
                <h3 className="text-base sm:text-lg font-semibold mb-2" style={{ fontFamily: 'var(--font-title)', color: '#000000' }}>
                  How to Exercise Your Rights
                </h3>
                <p className="text-sm sm:text-base mb-2" style={{ fontFamily: 'var(--font-content)', color: '#000000' }}>
                  To exercise any of these rights, please contact our Data Protection Officer using the information provided below. We will respond within one month of receiving your request.
                </p>
                <p className="text-sm sm:text-base" style={{ fontFamily: 'var(--font-content)', color: '#000000' }}>
                  <strong>Note:</strong> Since we do not store your personal data on our servers, many of these rights are automatically fulfilled through our local-only data storage approach.
                </p>
              </div>
            </div>
          </section>

          {/* Section 7 */}
          <section className="mb-6 sm:mb-8">
            <div className="rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 border-2 border-black bg-white dark:bg-gray-800" style={{ boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(0, 0, 0, 0.1)' }}>
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-3 sm:mb-4" style={{ fontFamily: 'var(--font-title)', color: '#000000' }}>
                7. Lawful Basis for Processing
              </h2>
              <p className="text-base sm:text-lg leading-relaxed mb-4" style={{ fontFamily: 'var(--font-content)', color: '#000000' }}>
                Under GDPR, we process personal data based on the following lawful bases:
              </p>
              <div className="space-y-3">
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 sm:p-4 border-2 border-black/20">
                  <h3 className="text-base sm:text-lg font-semibold mb-2" style={{ fontFamily: 'var(--font-title)', color: '#000000' }}>
                    Consent (Article 6(1)(a))
                  </h3>
                  <p className="text-sm sm:text-base" style={{ fontFamily: 'var(--font-content)', color: '#000000' }}>
                    Processing is based on your explicit consent when you provide API keys and input data for processing.
                  </p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 sm:p-4 border-2 border-black/20">
                  <h3 className="text-base sm:text-lg font-semibold mb-2" style={{ fontFamily: 'var(--font-title)', color: '#000000' }}>
                    Legitimate Interest (Article 6(1)(f))
                  </h3>
                  <p className="text-sm sm:text-base" style={{ fontFamily: 'var(--font-content)', color: '#000000' }}>
                    We have a legitimate interest in providing the hadith analysis service you requested.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Section 8 */}
          <section className="mb-6 sm:mb-8">
            <div className="rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 border-2 border-black bg-white dark:bg-gray-800" style={{ boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(0, 0, 0, 0.1)' }}>
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-3 sm:mb-4" style={{ fontFamily: 'var(--font-title)', color: '#000000' }}>
                8. International Data Transfers
              </h2>
              <p className="text-base sm:text-lg leading-relaxed mb-4" style={{ fontFamily: 'var(--font-content)', color: '#000000' }}>
                Your API keys and hadith data may be transferred to Google&apos;s servers, which may be located outside the EEA. Such transfers are protected by:
              </p>
              <ul className="list-disc list-inside space-y-2 text-sm sm:text-base mb-4" style={{ fontFamily: 'var(--font-content)', color: '#000000' }}>
                <li><strong>Adequacy Decision:</strong> Google Cloud services benefit from the EU-US Data Privacy Framework</li>
                <li><strong>Standard Contractual Clauses:</strong> Google implements appropriate safeguards for international transfers</li>
                <li><strong>Your Control:</strong> You can choose not to use the service if you do not agree with these transfers</li>
              </ul>
              <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg p-4 border-2 border-amber-200 dark:border-amber-800">
                <p className="text-sm sm:text-base" style={{ fontFamily: 'var(--font-content)', color: '#000000' }}>
                  <strong>Important:</strong> By providing a Google Gemini API key and using our service, you acknowledge and consent to these international data transfers as necessary for the service functionality.
                </p>
              </div>
            </div>
          </section>

          {/* Section 9 */}
          <section className="mb-6 sm:mb-8">
            <div className="rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 border-2 border-black bg-white dark:bg-gray-800" style={{ boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(0, 0, 0, 0.1)' }}>
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-3 sm:mb-4" style={{ fontFamily: 'var(--font-title)', color: '#000000' }}>
                9. Data Breach Notification
              </h2>
              <p className="text-base sm:text-lg leading-relaxed mb-4" style={{ fontFamily: 'var(--font-content)', color: '#000000' }}>
                In the unlikely event of a data breach affecting your personal data, we will:
              </p>
              <ul className="list-disc list-inside space-y-2 text-sm sm:text-base mb-4" style={{ fontFamily: 'var(--font-content)', color: '#000000' }}>
                <li>Notify you within 72 hours of becoming aware of the breach</li>
                <li>Report the breach to the relevant supervisory authority within the same timeframe</li>
                <li>Provide information about the breach, its effects, and mitigation measures</li>
                <li>Cooperate with authorities as required by law</li>
              </ul>
              <p className="text-sm sm:text-base" style={{ fontFamily: 'var(--font-content)', color: '#000000', opacity: 0.8 }}>
                Given our minimal data collection and local storage approach, the risk of data breaches is significantly reduced.
              </p>
            </div>
          </section>

          {/* Section 10 */}
          <section className="mb-6 sm:mb-8">
            <div className="rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 border-2 border-black bg-white dark:bg-gray-800" style={{ boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(0, 0, 0, 0.1)' }}>
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-3 sm:mb-4" style={{ fontFamily: 'var(--font-title)', color: '#000000' }}>
                10. Age Restrictions and Parental Consent
              </h2>
              <div className="space-y-4">
                <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4 border-2 border-red-200 dark:border-red-800">
                  <h3 className="text-base sm:text-lg font-semibold mb-2" style={{ fontFamily: 'var(--font-title)', color: '#000000' }}>
                    Age Requirements
                  </h3>
                  <p className="text-sm sm:text-base" style={{ fontFamily: 'var(--font-content)', color: '#000000' }}>
                    Our service is not intended for children under 16 years of age. We do not knowingly collect personal data from children under 16.
                  </p>
                </div>
                <p className="text-base sm:text-lg leading-relaxed" style={{ fontFamily: 'var(--font-content)', color: '#000000' }}>
                  If you are under 16, you must obtain parental consent before using this service. Parents and guardians should monitor their children&apos;s online activities and ensure they do not provide personal data without consent.
                </p>
              </div>
            </div>
          </section>

          {/* Section 11 */}
          <section className="mb-6 sm:mb-8">
            <div className="rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 border-2 border-black bg-white dark:bg-gray-800" style={{ boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(0, 0, 0, 0.1)' }}>
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-3 sm:mb-4" style={{ fontFamily: 'var(--font-title)', color: '#000000' }}>
                11. Cookies and Tracking Technologies
              </h2>
              <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 border-2 border-green-200 dark:border-green-800">
                <div className="flex items-start">
                  <svg className="w-6 h-6 mt-0.5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: '#000000' }}>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <h3 className="text-base sm:text-lg font-semibold mb-2" style={{ fontFamily: 'var(--font-title)', color: '#000000' }}>
                      No Cookies Used
                    </h3>
                    <p className="text-sm sm:text-base" style={{ fontFamily: 'var(--font-content)', color: '#000000' }}>
                      Our service does not use cookies, tracking pixels, or other similar technologies to collect or store information about your browsing activities.
                    </p>
                  </div>
                </div>
              </div>
              <p className="text-sm sm:text-base mt-4" style={{ fontFamily: 'var(--font-content)', color: '#000000', opacity: 0.8 }}>
                We use localStorage in your browser solely for storing your API keys and user preferences locally on your device. This data never leaves your browser or device.
              </p>
            </div>
          </section>

          {/* Section 12 */}
          <section className="mb-6 sm:mb-8">
            <div className="rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 border-2 border-black bg-white dark:bg-gray-800" style={{ boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(0, 0, 0, 0.1)' }}>
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-3 sm:mb-4" style={{ fontFamily: 'var(--font-title)', color: '#000000' }}>
                12. Data Protection Officer and Supervisory Authority
              </h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 border-2 border-black/20">
                  <h3 className="text-base sm:text-lg font-semibold mb-2" style={{ fontFamily: 'var(--font-title)', color: '#000000' }}>
                    Data Protection Officer
                  </h3>
                  <p className="text-sm sm:text-base" style={{ fontFamily: 'var(--font-content)', color: '#000000' }}>
                    For GDPR-related inquiries and to exercise your data subject rights:
                  </p>
                  <div className="mt-2">
                    <p className="text-sm sm:text-base break-all" style={{ fontFamily: 'var(--font-content)', color: '#000000' }}>
                      <strong>Email:</strong> thedigitalsunnah@gmail.com<br/>
                      <strong>Subject:</strong> GDPR Data Subject Rights Request
                    </p>
                  </div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 border-2 border-black/20">
                  <h3 className="text-base sm:text-lg font-semibold mb-2" style={{ fontFamily: 'var(--font-title)', color: '#000000' }}>
                    General Inquiries
                  </h3>
                  <p className="text-sm sm:text-base" style={{ fontFamily: 'var(--font-content)', color: '#000000' }}>
                    For general privacy policy questions:
                  </p>
                  <div className="mt-2">
                    <p className="text-sm sm:text-base break-all" style={{ fontFamily: 'var(--font-content)', color: '#000000' }}>
                      <strong>Email:</strong> thedigitalsunnah@gmail.com<br/>
                      <strong>Subject:</strong> Privacy Policy Inquiry
                    </p>
                  </div>
                </div>
              </div>
              <div className="mt-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border-2 border-blue-200 dark:border-blue-800">
                <h3 className="text-base sm:text-lg font-semibold mb-2" style={{ fontFamily: 'var(--font-title)', color: '#000000' }}>
                  Right to Lodge a Complaint
                </h3>
                <p className="text-sm sm:text-base" style={{ fontFamily: 'var(--font-content)', color: '#000000' }}>
                  If you believe we have not complied with GDPR requirements, you have the right to lodge a complaint with a supervisory authority in your country or region. For residents of the EEA, you can find your local supervisory authority at: <a href="https://edpb.europa.eu/about-edpb/about-edpb/members_en" className="underline hover:no-underline font-semibold break-all" target="_blank" rel="noopener noreferrer">European Data Protection Board</a>
                </p>
              </div>
            </div>
          </section>

          {/* Section 13 */}
          <section className="mb-6 sm:mb-8">
            <div className="rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 border-2 border-black bg-white dark:bg-gray-800" style={{ boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(0, 0, 0, 0.1)' }}>
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-3 sm:mb-4" style={{ fontFamily: 'var(--font-title)', color: '#000000' }}>
                13. Changes to This Policy
              </h2>
              <p className="text-sm sm:text-base md:text-lg leading-relaxed mb-4" style={{ fontFamily: 'var(--font-content)', color: '#000000' }}>
                We may update this Privacy Policy from time to time to reflect changes in our practices or for legal compliance reasons. Any material changes will be communicated to you and the updated policy will be posted on this page with an updated revision date.
              </p>
              <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg p-4 border-2 border-amber-200 dark:border-amber-800">
                <p className="text-sm sm:text-base" style={{ fontFamily: 'var(--font-content)', color: '#000000' }}>
                  <strong>Material Changes:</strong> If we make material changes that affect your rights under GDPR, we will provide additional notice (such as email notification if we had contact information) and may require re-consent for certain processing activities.
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
