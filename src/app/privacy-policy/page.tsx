import Link from 'next/link';

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-12">
          <Link
            href="/"
            className="inline-flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 mb-8"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Analyzer
          </Link>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Privacy Policy
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Last updated: Sep 2025
          </p>
        </div>

        {/* Content */}
        <div className="prose prose-lg dark:prose-invert max-w-none">
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              1. Information We Collect
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              ICMA - Hadith Chain Analysis (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;) is committed to protecting your privacy. This Privacy Policy explains how we collect, use, and safeguard your information when you use our web application.
            </p>
            <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg mb-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                Data Collection
              </h3>
              <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-1">
                <li><strong>API Keys:</strong> Google Gemini API keys provided by users for narrator extraction</li>
                <li><strong>User Input:</strong> Hadith text and analysis data entered by users</li>
                <li><strong>Application Data:</strong> Chain analysis results and user preferences</li>
                <li><strong>Technical Data:</strong> Browser information and usage analytics (anonymized)</li>
              </ul>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              2. How We Use Your Information
            </h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  Primary Purpose
                </h3>
                <p className="text-gray-700 dark:text-gray-300">
                  Your API keys and input data are used solely to provide the hadith analysis functionality. We process your hadith text using Google&apos;s Gemini AI to extract narrator chains.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  Data Processing
                </h3>
                <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-1">
                  <li>API keys are transmitted securely to Google&apos;s Gemini AI service</li>
                  <li>Hadith text is processed to extract narrator information</li>
                  <li>Analysis results are displayed in your browser</li>
                  <li>All processing happens in real-time and results are not stored on our servers</li>
                </ul>
              </div>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              3. Data Storage and Security
            </h2>
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg mb-4">
              <div className="flex items-start">
                <svg className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <div>
                  <h3 className="text-lg font-medium text-blue-900 dark:text-blue-100 mb-1">
                    Local Storage Only
                  </h3>
                  <p className="text-blue-800 dark:text-blue-200">
                    All your data, including API keys and analysis results, is stored locally in your browser. We do not store, transmit, or have access to your personal data on our servers.
                  </p>
                </div>
              </div>
            </div>
            <div className="space-y-3">
              <p className="text-gray-700 dark:text-gray-300">
                <strong>API Keys:</strong> Stored securely in your browser&apos;s localStorage and only used for API calls to Google&apos;s Gemini service.
              </p>
              <p className="text-gray-700 dark:text-gray-300">
                <strong>Hadith Data:</strong> Processed in real-time and displayed in your browser. Not transmitted to or stored on our servers.
              </p>
              <p className="text-gray-700 dark:text-gray-300">
                <strong>User Preferences:</strong> Theme settings and other preferences stored locally for better user experience.
              </p>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              4. Third-Party Services
            </h2>
            <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
              <div className="flex items-start">
                <svg className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <h3 className="text-lg font-medium text-yellow-900 dark:text-yellow-100 mb-1">
                    Google Gemini AI
                  </h3>
                  <p className="text-yellow-800 dark:text-yellow-200 mb-2">
                    We use Google&apos;s Gemini AI service to process hadith text and extract narrator information.
                  </p>
                  <p className="text-sm text-yellow-700 dark:text-yellow-300">
                    Your API key and hadith text are transmitted directly to Google&apos;s servers. We do not have access to or store this data. Please refer to <a href="https://policies.google.com/privacy" className="underline hover:no-underline" target="_blank" rel="noopener noreferrer">Google&apos;s Privacy Policy</a> for their data handling practices.
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              5. Data Retention
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              We follow a minimal data retention policy:
            </p>
            <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-2">
              <li><strong>API Keys:</strong> Stored in your browser until you clear them or use the &quot;Clear Cache&quot; feature</li>
              <li><strong>Analysis Data:</strong> Not stored on our servers - only displayed in your browser</li>
              <li><strong>User Preferences:</strong> Stored locally and persist until cleared</li>
              <li><strong>Automatic Cleanup:</strong> Data is automatically removed when you clear your browser data</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              6. Your Rights and Controls
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                <h3 className="text-lg font-medium text-green-900 dark:text-green-100 mb-2">
                  What You Can Do
                </h3>
                <ul className="text-green-800 dark:text-green-200 space-y-1">
                  <li>• Update or remove your API key anytime</li>
                  <li>• Clear all cached data instantly</li>
                  <li>• Control what data is processed</li>
                  <li>• Opt-out by not providing API keys</li>
                </ul>
              </div>
              <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
                <h3 className="text-lg font-medium text-purple-900 dark:text-purple-100 mb-2">
                  Data Control
                </h3>
                <ul className="text-purple-800 dark:text-purple-200 space-y-1">
                  <li>• No account creation required</li>
                  <li>• No email collection</li>
                  <li>• No tracking or analytics</li>
                  <li>• Full local control</li>
                </ul>
              </div>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              7. Contact Information
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              If you have any questions about this Privacy Policy or our data practices, please contact us:
            </p>
            <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
              <p className="text-gray-900 dark:text-gray-100">
                <strong>Email:</strong> thedigitalsunnah@gmail.com<br/>
                <strong>Subject:</strong> Privacy Policy Inquiry
              </p>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              8. Changes to This Policy
            </h2>
            <p className="text-gray-700 dark:text-gray-300">
              We may update this Privacy Policy from time to time. Any changes will be posted on this page with an updated revision date. We encourage you to review this Privacy Policy periodically to stay informed about our data practices.
            </p>
          </section>

          {/* Back to top */}
          <div className="text-center mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
            <Link
              href="/"
              className="inline-flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Hadith Chain Analyzer
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}