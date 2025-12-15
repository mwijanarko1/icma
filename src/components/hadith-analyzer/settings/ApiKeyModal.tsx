"use client";

import React, { useState, useEffect } from "react";
import type { ApiKeyModalProps } from './types';
import BasicModal from "@/components/ui/BasicModal";

export const ApiKeyModal = React.memo(function ApiKeyModal({
  apiKey,
  showApiKeyModal,
  onSave,
  onClose
}: ApiKeyModalProps) {
  const [tempApiKey, setTempApiKey] = useState(apiKey);

  useEffect(() => {
    setTempApiKey(apiKey);
  }, [apiKey, showApiKeyModal]);

  const handleSave = () => {
    if (tempApiKey.trim()) {
      onSave(tempApiKey.trim());
    }
  };

  const handleCancel = () => {
    setTempApiKey(apiKey);
    onClose();
  };

  return (
    <div style={{
      colorScheme: 'light',
      '--background': 'white',
      '--foreground': '#374151'
    } as React.CSSProperties}>
      <BasicModal
        isOpen={showApiKeyModal}
        onClose={handleCancel}
        title={apiKey ? 'Update API Key' : 'Add API Key'}
        size="md"
      >
      <div className="space-y-6" style={{ color: '#374151' }}>
          <div className="text-center">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${
              apiKey
                ? 'bg-green-100'
                : 'bg-blue-100'
            }`} style={{ backgroundColor: apiKey ? '#dcfce7' : '#dbeafe' }}>
              <svg className={`w-8 h-8 ${
                apiKey
                  ? 'text-green-600'
                  : 'text-blue-600'
              }`} style={{ color: apiKey ? '#16a34a' : '#2563eb' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
              </svg>
            </div>
            <h4 className="text-sm font-medium text-gray-900 mb-2" style={{ color: '#374151' }}>
              Google Gemini API Key
            </h4>
            <p className="text-sm text-gray-600" style={{ color: '#6b7280' }}>
              {apiKey
                ? 'Update your API key for continued access to narrator extraction.'
                : 'Add your Google Gemini API key to enable narrator extraction from hadith chains.'
              }
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2" style={{ color: '#374151' }}>
              API Key
            </label>
            <input
              type="password"
              value={tempApiKey}
              onChange={(e) => setTempApiKey(e.target.value)}
              placeholder="Enter your Google Gemini API key..."
              className="w-full px-4 py-3 text-sm border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              style={{
                backgroundColor: 'white',
                borderColor: '#d1d5db',
                color: '#374151'
              }}
            />
          </div>

          {/* Instructions */}
          <div className="bg-blue-50 rounded-lg p-4" style={{ backgroundColor: '#eff6ff' }}>
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" style={{ color: '#2563eb' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="text-sm text-blue-800" style={{ color: '#1e40af' }}>
                <p className="font-medium mb-1">How to get your API key:</p>
                <ol className="list-decimal list-inside space-y-1 text-xs">
                  <li>Go to <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="underline hover:text-blue-600">Google AI Studio</a></li>
                  <li>Sign in with your Google account</li>
                  <li>Click &quot;Create API Key&quot;</li>
                  <li>Copy and paste the key above</li>
                </ol>
              </div>
            </div>
          </div>

          {/* Security Notice */}
          <div className="text-xs text-gray-500 bg-gray-50 px-3 py-2 rounded" style={{ color: '#9ca3af', backgroundColor: '#f9fafb' }}>
            <div className="flex items-start gap-2">
              <span className="text-lg">🔒</span>
              <div>
                <p className="font-medium text-gray-700 mb-1" style={{ color: '#374151' }}>Your API Key is Safe</p>
                <p className="text-gray-600 leading-relaxed" style={{ color: '#6b7280' }}>
                  Your key is transmitted securely to process your requests and is never stored, logged, or shared.
                  We only use it to communicate with Google's AI service on your behalf.
                </p>
              </div>
            </div>
          </div>

          {/* Modal Footer */}
          <div className="flex gap-3 pt-6 border-t border-gray-200" style={{ borderTopColor: '#e5e7eb' }}>
            <button
              onClick={handleCancel}
              className="flex-1 bg-gray-600 text-white px-4 py-2.5 rounded-lg hover:bg-gray-700 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={!tempApiKey.trim()}
              className="flex-1 bg-blue-600 text-white px-4 py-2.5 rounded-lg hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors font-medium"
            >
              {apiKey ? 'Update Key' : 'Save Key'}
            </button>
          </div>
        </div>
      </BasicModal>
    </div>
  );
});

