"use client";

import type { SettingsTabProps } from './types';

export function SettingsTab({
  apiKey,
  onOpenApiKeyModal,
  onClearCache
}: SettingsTabProps) {
  return (
    <div className="space-y-6">
      {/* API Key Section */}
      <div className="rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 border-2 border-black bg-white" style={{ boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(0, 0, 0, 0.1)' }}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`flex items-center justify-center w-10 h-10 rounded-full transition-colors ${
              apiKey
                ? 'bg-green-100'
                : 'bg-yellow-100'
            }`}>
              {apiKey ? (
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              )}
            </div>
            <div>
              <h3 className="text-lg font-semibold" style={{ fontFamily: 'var(--font-title)', color: '#000000' }}>
                LLM API Key
              </h3>
              <p className="text-sm mt-0.5" style={{ fontFamily: 'var(--font-content)', color: '#000000', opacity: 0.7 }}>
                {apiKey ? 'API key configured' : 'Required for narrator extraction'}
              </p>
            </div>
          </div>
        </div>
        <button
          onClick={onOpenApiKeyModal}
          className="w-full text-sm font-semibold px-4 py-2.5 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105 hover:-translate-y-1 border-2 border-black"
          style={{ backgroundColor: '#000000', color: '#f2e9dd', fontFamily: 'var(--font-content)' }}
        >
          {apiKey ? 'Update API Key' : 'Add API Key'}
        </button>
      </div>

      {/* Clear Cache */}
      <div className="rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 border-2 border-black bg-white" style={{ boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(0, 0, 0, 0.1)' }}>
        <div className="flex items-center gap-3 mb-4">
          <svg className="w-6 h-6 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
          <div>
            <h3 className="text-lg font-semibold" style={{ fontFamily: 'var(--font-title)', color: '#000000' }}>
              Clear Cache
            </h3>
            <p className="text-sm mt-0.5" style={{ fontFamily: 'var(--font-content)', color: '#000000', opacity: 0.7 }}>
              Reset all saved data
            </p>
          </div>
        </div>
        <button
          onClick={() => {
            if (window.confirm('Are you sure you want to clear all cached data? This will reset everything to start fresh.')) {
              onClearCache();
            }
          }}
          className="w-full text-sm font-semibold px-4 py-2.5 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105 hover:-translate-y-1 border-2 border-black"
          style={{ backgroundColor: '#000000', color: '#f2e9dd', fontFamily: 'var(--font-content)' }}
        >
          Clear All Cache
        </button>
      </div>
    </div>
  );
}

