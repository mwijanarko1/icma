import Link from 'next/link';

export default function TermsOfService() {
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
            Terms of Service
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Last updated: Sep 2025
          </p>
        </div>

        {/* Content */}
        <div className="prose prose-lg dark:prose-invert max-w-none">
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              1. Acceptance of Terms
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              By accessing and using ICMA - Hadith Chain Analysis (&quot;the Service&quot;), you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
            </p>
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
              <p className="text-blue-800 dark:text-blue-200">
                <strong>Free Service:</strong> This service is provided free of charge. You are responsible for your own API usage costs with third-party providers.
              </p>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              2. Service Description
            </h2>
            <div className="space-y-4">
              <p className="text-gray-700 dark:text-gray-300">
                ICMA - Hadith Chain Analysis is a web application that helps users analyze Islamic hadith chains (isnad) by:
              </p>
              <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-2 ml-4">
                <li>Extracting narrator information from Arabic hadith text using AI</li>
                <li>Visualizing hadith transmission chains</li>
                <li>Allowing users to edit and organize narrator data</li>
                <li>Providing tools for hadith scholarship and research</li>
              </ul>
              <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
                <div className="flex items-start">
                  <svg className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                  <div>
                    <h3 className="text-lg font-medium text-yellow-900 dark:text-yellow-100 mb-1">
                      API Key Requirement
                    </h3>
                    <p className="text-yellow-800 dark:text-yellow-200">
                      To use the narrator extraction feature, you must provide your own Google Gemini API key. We do not provide API keys or bear any API usage costs.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              3. User Responsibilities
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
                <h3 className="text-lg font-medium text-red-900 dark:text-red-100 mb-3">
                  Prohibited Uses
                </h3>
                <ul className="text-red-800 dark:text-red-200 space-y-2">
                  <li>• Using the service for illegal purposes</li>
                  <li>• Attempting to reverse engineer or hack the service</li>
                  <li>• Sharing false or misleading information</li>
                  <li>• Violating intellectual property rights</li>
                  <li>• Distributing harmful or malicious content</li>
                </ul>
              </div>
              <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                <h3 className="text-lg font-medium text-green-900 dark:text-green-100 mb-3">
                  Your Responsibilities
                </h3>
                <ul className="text-green-800 dark:text-green-200 space-y-2">
                  <li>• Provide accurate API keys</li>
                  <li>• Respect copyright and usage rights</li>
                  <li>• Use service for legitimate research</li>
                  <li>• Keep your API keys secure</li>
                  <li>• Report any service issues</li>
                </ul>
              </div>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              4. API Usage and Costs
            </h2>
            <div className="space-y-4">
              <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                  Third-Party API Services
                </h3>
                <p className="text-gray-700 dark:text-gray-300 mb-3">
                  This service integrates with Google&apos;s Gemini AI service. You are solely responsible for:
                </p>
                <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-1">
                  <li>Obtaining your own Google Gemini API key</li>
                  <li>All API usage costs and billing</li>
                  <li>Complying with Google&apos;s terms of service</li>
                  <li>Managing your API usage limits and quotas</li>
                </ul>
              </div>
              <p className="text-gray-700 dark:text-gray-300">
                We do not provide API keys, subsidize API costs, or have any financial responsibility for your API usage. You should monitor your Google Cloud billing and usage to avoid unexpected charges.
              </p>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              5. Data Privacy and Security
            </h2>
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg mb-4">
              <div className="flex items-start">
                <svg className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <div>
                  <h3 className="text-lg font-medium text-blue-900 dark:text-blue-100 mb-1">
                    Your Data, Your Control
                  </h3>
                  <p className="text-blue-800 dark:text-blue-200">
                    All your data is stored locally in your browser. We do not collect, store, or transmit your personal information, API keys, or hadith analysis data.
                  </p>
                </div>
              </div>
            </div>
            <div className="space-y-3">
              <p className="text-gray-700 dark:text-gray-300">
                <strong>API Keys:</strong> Stored securely in your browser&apos;s localStorage. Only transmitted to Google&apos;s servers for processing.
              </p>
              <p className="text-gray-700 dark:text-gray-300">
                <strong>Hadith Content:</strong> Processed in real-time and displayed in your browser. Not stored on our servers.
              </p>
              <p className="text-gray-700 dark:text-gray-300">
                <strong>Security:</strong> We implement reasonable security measures, but you are responsible for keeping your API keys secure.
              </p>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              6. Service Availability and Limitations
            </h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  Free Service Limitations
                </h3>
                <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-2 ml-4">
                  <li>Service availability is provided &quot;as is&quot; without warranties</li>
                  <li>We may modify or discontinue features at any time</li>
                  <li>No guaranteed uptime or performance levels</li>
                  <li>Third-party API dependencies may affect service availability</li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  Accuracy Disclaimer
                </h3>
                <p className="text-gray-700 dark:text-gray-300">
                  The AI-powered narrator extraction is provided for research and educational purposes. While we strive for accuracy, the results may contain errors or omissions. Users should verify all analysis results through traditional scholarly methods.
                </p>
              </div>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              7. Intellectual Property
            </h2>
            <div className="space-y-4">
              <p className="text-gray-700 dark:text-gray-300">
                The ICMA - Hadith Chain Analysis application and its original content, features, and functionality are owned by us and are protected by international copyright, trademark, and other intellectual property laws.
              </p>
              <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
                <h3 className="text-lg font-medium text-purple-900 dark:text-purple-100 mb-2">
                  User Content
                </h3>
                <p className="text-purple-800 dark:text-purple-200">
                  You retain all rights to the hadith texts and analysis data you input. By using our service, you grant us a limited license to process this content solely for providing the analysis functionality.
                </p>
              </div>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              8. Limitation of Liability
            </h2>
            <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
              <p className="text-gray-700 dark:text-gray-300 mb-3">
                To the fullest extent permitted by applicable law, we shall not be liable for:
              </p>
              <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-1">
                <li>Any indirect, incidental, special, or consequential damages</li>
                <li>Loss of profits, data, or business opportunities</li>
                <li>Service interruptions or unavailability</li>
                <li>API-related costs or billing issues</li>
                <li>Accuracy of AI-generated analysis results</li>
              </ul>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              9. Termination
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              We reserve the right to terminate or suspend your access to our service immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms.
            </p>
            <p className="text-gray-700 dark:text-gray-300">
              Upon termination, your right to use the service will cease immediately. If you wish to terminate your account, you may simply stop using the service.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              10. Governing Law
            </h2>
            <p className="text-gray-700 dark:text-gray-300">
              These Terms shall be interpreted and governed by the laws of the jurisdiction in which our service is operated, without regard to conflict of law provisions. Our failure to enforce any right or provision of these Terms will not be considered a waiver of those rights.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              11. Changes to Terms
            </h2>
            <p className="text-gray-700 dark:text-gray-300">
              We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is material, we will try to provide at least 30 days notice prior to any new terms taking effect. What constitutes a material change will be determined at our sole discretion.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              12. Contact Information
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              If you have any questions about these Terms of Service, please contact us:
            </p>
            <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
              <p className="text-gray-900 dark:text-gray-100">
                <strong>Email:</strong> thedigitalsunnah@gmail.com<br/>
                <strong>Subject:</strong> Terms of Service Inquiry
              </p>
            </div>
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