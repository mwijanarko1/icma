"use client";

import Header from "@/components/Header";

export default function AnalysisPage() {
  return (
    <div
      className="min-h-screen relative flex flex-col"
      style={{
        backgroundColor: '#f2e9dd',
        color: '#000000',
      }}
    >
      <Header />
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white border border-red-200 rounded-lg p-6 text-center">
          <h3 className="text-lg font-medium text-red-800 mb-2">
            Analysis Feature
          </h3>
          <p className="text-red-600 mb-4">
            The advanced analysis workflow is currently under development. Please use the main Hadith Analyzer for now.
          </p>
          <a
            href="/chain-analyzer"
            className="inline-block px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
          >
            Go to Hadith Analyzer
          </a>
        </div>
      </div>
    </div>
  );
}