"use client";

import type { LLMTabProps } from './types';

export function LLMTab({
  hadithText,
  onHadithTextChange,
  apiKey,
  isLoading,
  onExtractNarrators,
  onShowApiKeyModal,
  onShowImportModal,
  onShowAddHadithModal,
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
            className="w-full sm:w-auto px-3 sm:px-6 py-2 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105 hover:-translate-y-1 border-2 border-black flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed text-sm font-semibold"
            style={{
              backgroundColor: !apiKey ? '#fbbf24' : '#000000',
              color: '#f2e9dd',
              fontFamily: 'var(--font-content)',
              ...(!apiKey && { borderColor: '#000000' })
            }}
            title={!apiKey ? 'Click to add API key' : undefined}
          >
            <span className="hidden sm:inline">
              {!apiKey ? 'API Key Required' : isLoading ? 'Analyzing...' : 'Extract Narrators'}
            </span>
            <span className="sm:hidden">
              {!apiKey ? 'Add API Key' : isLoading ? 'Analyzing...' : 'Extract'}
            </span>
          </button>
          <button
            onClick={onTryDemo}
            className="w-full sm:w-auto px-3 sm:px-6 py-2 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105 hover:-translate-y-1 border-2 border-black flex items-center justify-center text-sm font-semibold"
            style={{ backgroundColor: '#000000', color: '#f2e9dd', fontFamily: 'var(--font-content)' }}
            title="Load all three hadith chains about intentions with demo results (no API key needed)"
          >
            <span className="hidden sm:inline">Try Demo</span>
            <span className="sm:hidden">Demo</span>
          </button>
          <button
            onClick={onShowImportModal}
            className="w-full sm:w-auto px-3 sm:px-6 py-2 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105 hover:-translate-y-1 border-2 border-black flex items-center justify-center text-sm font-semibold"
            style={{ backgroundColor: '#000000', color: '#f2e9dd', fontFamily: 'var(--font-content)' }}
          >
            <span className="hidden sm:inline">Chain Collections</span>
            <span className="sm:hidden">Collections</span>
          </button>
          <button
            onClick={onShowAddHadithModal}
            className="w-full sm:w-auto px-3 sm:px-6 py-2 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105 hover:-translate-y-1 border-2 border-black flex items-center justify-center text-sm font-semibold"
            style={{ backgroundColor: '#000000', color: '#f2e9dd', fontFamily: 'var(--font-content)' }}
            title="Add hadith from database"
          >
            <span className="hidden sm:inline">Add Hadith</span>
            <span className="sm:hidden">Add</span>
          </button>
        </div>
      </div>
    </>
  );
}

