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
              Last updated: December 2025
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
                      Data Storage Options
                    </h3>
                    <p className="text-base sm:text-lg leading-relaxed mb-2" style={{ fontFamily: 'var(--font-content)', color: '#000000' }}>
                      <strong>Without Signing In:</strong> All your data remains stored locally in your browser only. We do not collect, store, or transmit any personal information.
                    </p>
                    <p className="text-base sm:text-lg leading-relaxed mb-2" style={{ fontFamily: 'var(--font-content)', color: '#000000' }}>
                      <strong>When You Sign In:</strong> Your analysis sessions and chain analysis data may be automatically saved to our secure database to preserve your work across devices and sessions. This includes hadith text, narrator chains, analysis steps, and generated visualizations.
                    </p>
                    <p className="text-base sm:text-lg leading-relaxed" style={{ fontFamily: 'var(--font-content)', color: '#000000' }}>
                      <strong>API Key Security:</strong> Even when signed in, your API keys are stored only locally in your browser. We never store, transmit, or access your API keys on our servers or database.
                    </p>
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                <p className="text-base sm:text-lg leading-relaxed" style={{ fontFamily: 'var(--font-content)', color: '#000000' }}>
                  <strong>API Keys:</strong> Always stored locally in your browser only (never on our servers or database, even when signed in). Only transmitted directly to Google&apos;s servers for processing.
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
                9. GDPR Compliance and Data Processing
              </h2>
              <div className="space-y-4">
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border-2 border-blue-200 dark:border-blue-800">
                  <h3 className="text-base sm:text-lg font-semibold mb-2" style={{ fontFamily: 'var(--font-title)', color: '#000000' }}>
                    Data Controller Responsibilities
                  </h3>
                  <p className="text-sm sm:text-base" style={{ fontFamily: 'var(--font-content)', color: '#000000' }}>
                    ICMA - Hadith Chain Analysis acts as a data controller for any personal data you provide. We are committed to GDPR compliance and implement appropriate technical and organizational measures to ensure the security, confidentiality, and integrity of personal data.
                  </p>
                </div>
                <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 border-2 border-green-200 dark:border-green-800">
                  <h3 className="text-base sm:text-lg font-semibold mb-2" style={{ fontFamily: 'var(--font-title)', color: '#000000' }}>
                    Data Processing Agreement
                  </h3>
                  <p className="text-sm sm:text-base" style={{ fontFamily: 'var(--font-content)', color: '#000000' }}>
                    By using our service, you enter into a data processing agreement with us. We process your data only for the purposes outlined in our Privacy Policy and with your explicit consent. You can withdraw consent at any time by clearing your API keys and cached data.
                  </p>
                </div>
                <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg p-4 border-2 border-amber-200 dark:border-amber-800">
                  <h3 className="text-base sm:text-lg font-semibold mb-2" style={{ fontFamily: 'var(--font-title)', color: '#000000' }}>
                    International Data Transfers
                  </h3>
                  <p className="text-sm sm:text-base" style={{ fontFamily: 'var(--font-content)', color: '#000000' }}>
                    Your data may be transferred to Google&apos;s servers outside the EEA. By providing API keys and using our service, you consent to these transfers, which are protected by adequacy decisions and standard contractual clauses as outlined in our Privacy Policy.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Section 10 */}
          <section className="mb-6 sm:mb-8">
            <div className="rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 border-2 border-black bg-white dark:bg-gray-800" style={{ boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(0, 0, 0, 0.1)' }}>
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-3 sm:mb-4" style={{ fontFamily: 'var(--font-title)', color: '#000000' }}>
                10. Data Breach Notification and Response
              </h2>
              <p className="text-base sm:text-lg leading-relaxed mb-4" style={{ fontFamily: 'var(--font-content)', color: '#000000' }}>
                In compliance with GDPR Article 33-34, if a data breach occurs that poses a risk to individuals&apos; rights and freedoms, we will:
              </p>
              <ul className="list-disc list-inside space-y-2 text-sm sm:text-base mb-4" style={{ fontFamily: 'var(--font-content)', color: '#000000' }}>
                <li>Notify the relevant supervisory authority within 72 hours</li>
                <li>Communicate the breach to affected individuals without undue delay</li>
                <li>Provide information about the breach and mitigation measures</li>
                <li>Maintain detailed records of all data breaches</li>
                <li>Cooperate with supervisory authorities during investigations</li>
              </ul>
              <p className="text-sm sm:text-base" style={{ fontFamily: 'var(--font-content)', color: '#000000', opacity: 0.8 }}>
                Our minimal data collection approach significantly reduces the risk of data breaches affecting personal data.
              </p>
            </div>
          </section>

          {/* Section 11 */}
          <section className="mb-6 sm:mb-8">
            <div className="rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 border-2 border-black bg-white dark:bg-gray-800" style={{ boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(0, 0, 0, 0.1)' }}>
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-3 sm:mb-4" style={{ fontFamily: 'var(--font-title)', color: '#000000' }}>
                11. Age Restrictions and Consent
              </h2>
              <div className="space-y-4">
                <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4 border-2 border-red-200 dark:border-red-800">
                  <h3 className="text-base sm:text-lg font-semibold mb-2" style={{ fontFamily: 'var(--font-title)', color: '#000000' }}>
                    Age Requirements (GDPR Article 8)
                  </h3>
                  <p className="text-sm sm:text-base" style={{ fontFamily: 'var(--font-content)', color: '#000000' }}>
                    Our service is not intended for children under 16 years of age without parental consent. We do not knowingly process personal data of children under 16 without verifiable parental consent.
                  </p>
                </div>
                <p className="text-base sm:text-lg leading-relaxed" style={{ fontFamily: 'var(--font-content)', color: '#000000' }}>
                  By using this service, you confirm that you are at least 16 years old or have obtained parental consent. Parents and guardians are responsible for supervising their children&apos;s use of our service.
                </p>
              </div>
            </div>
          </section>

          {/* Section 12 */}
          <section className="mb-6 sm:mb-8">
            <div className="rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 border-2 border-black bg-white dark:bg-gray-800" style={{ boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(0, 0, 0, 0.1)' }}>
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-3 sm:mb-4" style={{ fontFamily: 'var(--font-title)', color: '#000000' }}>
                12. Termination
              </h2>
              <p className="text-base sm:text-lg leading-relaxed mb-4" style={{ fontFamily: 'var(--font-content)', color: '#000000' }}>
                We reserve the right to terminate or suspend your access to our service immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms.
              </p>
              <p className="text-base sm:text-lg leading-relaxed" style={{ fontFamily: 'var(--font-content)', color: '#000000' }}>
                Upon termination, your right to use the service will cease immediately. To exercise your GDPR right to erasure, you may clear your browser data and stop using the service.
              </p>
            </div>
          </section>

          {/* Section 13 */}
          <section className="mb-6 sm:mb-8">
            <div className="rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 border-2 border-black bg-white dark:bg-gray-800" style={{ boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(0, 0, 0, 0.1)' }}>
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-3 sm:mb-4" style={{ fontFamily: 'var(--font-title)', color: '#000000' }}>
                13. Governing Law and Dispute Resolution
              </h2>
              <div className="space-y-4">
                <p className="text-base sm:text-lg leading-relaxed" style={{ fontFamily: 'var(--font-content)', color: '#000000' }}>
                  These Terms shall be interpreted and governed by the laws of the European Union, with specific reference to the General Data Protection Regulation (GDPR) for data protection matters. For users outside the EEA, applicable local data protection laws will also apply.
                </p>
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 border-2 border-black/20">
                  <h3 className="text-base sm:text-lg font-semibold mb-2" style={{ fontFamily: 'var(--font-title)', color: '#000000' }}>
                    Dispute Resolution
                  </h3>
                  <p className="text-sm sm:text-base" style={{ fontFamily: 'var(--font-content)', color: '#000000' }}>
                    Any disputes arising from these Terms or GDPR compliance will be resolved through the courts of the European Union. Before initiating legal proceedings, we encourage users to contact our Data Protection Officer for resolution.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Section 14 */}
          <section className="mb-6 sm:mb-8">
            <div className="rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 border-2 border-black bg-white dark:bg-gray-800" style={{ boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(0, 0, 0, 0.1)' }}>
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-3 sm:mb-4" style={{ fontFamily: 'var(--font-title)', color: '#000000' }}>
                14. Changes to Terms
              </h2>
              <p className="text-base sm:text-lg leading-relaxed mb-4" style={{ fontFamily: 'var(--font-content)', color: '#000000' }}>
                We reserve the right to modify these Terms at our sole discretion. For GDPR compliance, material changes affecting data processing will require user re-consent. We will provide at least 30 days&apos; notice for material changes and post updates on this page.
              </p>
              <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg p-4 border-2 border-amber-200 dark:border-amber-800">
                <p className="text-sm sm:text-base" style={{ fontFamily: 'var(--font-content)', color: '#000000' }}>
                  <strong>GDPR Impact:</strong> If changes affect your data subject rights or our data processing practices, we will communicate these changes directly and may require explicit re-consent.
                </p>
              </div>
            </div>
          </section>

          {/* Section 15 */}
          <section className="mb-6 sm:mb-8">
            <div className="rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 border-2 border-black bg-white dark:bg-gray-800" style={{ boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(0, 0, 0, 0.1)' }}>
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-3 sm:mb-4" style={{ fontFamily: 'var(--font-title)', color: '#000000' }}>
                15. Contact Information and Data Protection Officer
              </h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 border-2 border-black/20">
                  <h3 className="text-base sm:text-lg font-semibold mb-2" style={{ fontFamily: 'var(--font-title)', color: '#000000' }}>
                    Data Protection Officer (GDPR)
                  </h3>
                  <p className="text-sm sm:text-base mb-2" style={{ fontFamily: 'var(--font-content)', color: '#000000' }}>
                    For GDPR compliance, data subject rights, and privacy inquiries:
                  </p>
                  <div>
                    <p className="text-sm sm:text-base break-all" style={{ fontFamily: 'var(--font-content)', color: '#000000' }}>
                      <strong>Email:</strong> thedigitalsunnah@gmail.com<br/>
                      <strong>Subject:</strong> GDPR Data Subject Rights Request
                    </p>
                  </div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 border-2 border-black/20">
                  <h3 className="text-base sm:text-lg font-semibold mb-2" style={{ fontFamily: 'var(--font-title)', color: '#000000' }}>
                    General Support
                  </h3>
                  <p className="text-sm sm:text-base mb-2" style={{ fontFamily: 'var(--font-content)', color: '#000000' }}>
                    For general terms of service and technical support:
                  </p>
                  <div>
                    <p className="text-sm sm:text-base break-all" style={{ fontFamily: 'var(--font-content)', color: '#000000' }}>
                      <strong>Email:</strong> thedigitalsunnah@gmail.com<br/>
                      <strong>Subject:</strong> Terms of Service Inquiry
                    </p>
                  </div>
                </div>
              </div>
              <div className="mt-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border-2 border-blue-200 dark:border-blue-800">
                <h3 className="text-base sm:text-lg font-semibold mb-2" style={{ fontFamily: 'var(--font-title)', color: '#000000' }}>
                  Supervisory Authority
                </h3>
                <p className="text-sm sm:text-base" style={{ fontFamily: 'var(--font-content)', color: '#000000' }}>
                  For GDPR complaints, you may contact your local supervisory authority. A list of European supervisory authorities is available at the <a href="https://edpb.europa.eu/about-edpb/about-edpb/members_en" className="underline hover:no-underline font-semibold break-all" target="_blank" rel="noopener noreferrer">European Data Protection Board website</a>.
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
