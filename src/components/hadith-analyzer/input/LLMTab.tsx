"use client";

import type { LLMTabProps } from './types';

export function LLMTab({
  hadithText,
  onHadithTextChange,
  apiKey,
  isLoading,
  chains,
  onExtractNarrators,
  onShowApiKeyModal,
  onShowImportModal,
  onNewHadith,
  onExportChains,
  onTryDemo
}: LLMTabProps) {

  return (
    <>
      {/* Input Section */}
      <div className="rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 border-2 border-black bg-white mb-6" style={{ boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(0, 0, 0, 0.1)' }}>
        <label htmlFor="hadith-input" className="block text-sm font-medium mb-2" style={{ fontFamily: 'var(--font-content)', color: '#000000' }}>
          Paste Hadith Chain (Arabic)
        </label>
        <textarea
          id="hadith-input"
          value={hadithText}
          onChange={(e) => onHadithTextChange(e.target.value)}
          placeholder="Paste your hadith chain here..."
          className="w-full h-64 p-4 border-2 border-black rounded-lg focus:outline-none focus:ring-2 focus:ring-black resize-none bg-white text-gray-900 placeholder-gray-500"
          style={{
            fontFamily: 'var(--font-content)',
            color: '#000000',
            textAlign: /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/.test(hadithText) ? 'right' : 'left'
          }}
          dir={/[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/.test(hadithText) ? 'rtl' : 'ltr'}
        />
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 mt-4">
          <button
            onClick={async () => {
              if (!apiKey) {
                onShowApiKeyModal();
                return;
              }
              await onExtractNarrators(hadithText);
            }}
            disabled={isLoading}
            className="w-full sm:w-auto px-3 sm:px-6 py-2 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl border-2 border-black flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-semibold"
            style={{ 
              backgroundColor: !apiKey ? '#fbbf24' : '#000000', 
              color: '#f2e9dd', 
              fontFamily: 'var(--font-content)',
              ...(!apiKey && { borderColor: '#000000' })
            }}
            title={!apiKey ? 'Click to add API key' : undefined}
          >
            {!apiKey && (
              <svg className="w-4 h-4 hidden xs:inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            )}
            {isLoading && (
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            )}
            <span className="hidden sm:inline">
              {!apiKey ? 'API Key Required' : isLoading ? 'Analyzing...' : 'Extract Narrators'}
            </span>
            <span className="sm:hidden">
              {!apiKey ? 'Add API Key' : isLoading ? 'Analyzing...' : 'Extract'}
            </span>
          </button>
          <button
            onClick={onTryDemo}
            className="w-full sm:w-auto px-3 sm:px-6 py-2 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl border-2 border-black flex items-center justify-center gap-2 text-sm font-semibold"
            style={{ backgroundColor: '#000000', color: '#f2e9dd', fontFamily: 'var(--font-content)' }}
            title="Load all three hadith chains about intentions with demo results (no API key needed)"
          >
            <svg className="w-4 h-4 hidden xs:inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="hidden sm:inline">Try Demo</span>
            <span className="sm:hidden">Demo</span>
          </button>
          <button
            onClick={onShowImportModal}
            className="w-full sm:w-auto px-3 sm:px-6 py-2 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl border-2 border-black flex items-center justify-center gap-2 text-sm font-semibold"
            style={{ backgroundColor: '#000000', color: '#f2e9dd', fontFamily: 'var(--font-content)' }}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            <span className="hidden sm:inline">Import Chain(s)</span>
            <span className="sm:hidden">Import</span>
          </button>
          {chains.length > 0 && (
            <div className="flex flex-wrap gap-2 sm:gap-3">
              <button
                onClick={onNewHadith}
                className="w-full sm:w-auto px-3 sm:px-4 py-2 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl border-2 border-black flex items-center justify-center gap-2 text-sm font-semibold"
                style={{ backgroundColor: '#000000', color: '#f2e9dd', fontFamily: 'var(--font-content)' }}
                title="Start a new hadith (this will clear all current chains)"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span className="hidden sm:inline">New Hadith</span>
                <span className="sm:hidden">New</span>
              </button>

              <button
                onClick={onExportChains}
                className="w-full sm:w-auto px-3 sm:px-4 py-2 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl border-2 border-black flex items-center justify-center gap-2 text-sm font-semibold"
                style={{ backgroundColor: '#000000', color: '#f2e9dd', fontFamily: 'var(--font-content)' }}
                title="Export all chains and data as JSON"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span className="hidden sm:inline">Export Chain(s)</span>
                <span className="sm:hidden">Export</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

