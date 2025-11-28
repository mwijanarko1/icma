"use client";

import { useState, useEffect, useRef } from "react";
import type { SettingsDropdownProps } from './types';

export function SettingsDropdown({
  onClearCache,
  apiKey,
  onApiKeyChange, // eslint-disable-line @typescript-eslint/no-unused-vars
  onOpenApiKeyModal
}: SettingsDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-lg bg-gray-200bg-gray-700 hover:bg-gray-300hover:bg-gray-600 transition-colors relative"
        aria-label="Settings menu"
        title="Settings"
      >
        <svg className="w-6 h-6 text-gray-700text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-whitebg-gray-800 rounded-lg shadow-lg border border-gray-200border-gray-700 z-50">
          <div className="py-1">

            {/* API Key Section */}
            <div className="px-4 py-3 hover:bg-gray-50hover:bg-gray-700/50">
              <div className="flex items-center justify-center gap-3">
                <div className={`flex items-center justify-center w-6 h-6 rounded-full transition-colors ${
                  apiKey
                    ? 'bg-green-100bg-green-900/30'
                    : 'bg-yellow-100bg-yellow-900/30'
                }`}>
                  {apiKey ? (
                    <svg className="w-4 h-4 text-green-600text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4 text-yellow-600text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                  )}
                </div>
                <div className="flex-1 text-center">
                  <span className="text-sm font-semibold text-gray-900text-gray-100">
                    LLM API Key
                  </span>
                  <div className="text-xs text-gray-500text-gray-400 mt-0.5">
                    {apiKey ? 'API key configured' : 'Required for narrator extraction'}
                  </div>
                </div>
                <div className="w-6 h-6"></div> {/* Spacer for perfect centering */}
              </div>

              <div className="mt-3 text-center">
                <button
                  onClick={() => {
                    onOpenApiKeyModal();
                    setIsOpen(false); // Close dropdown when opening modal
                  }}
                  className="w-full text-sm text-blue-600text-blue-400 hover:text-blue-800hover:text-blue-300 font-medium hover:bg-blue-50hover:bg-blue-900/20 px-3 py-1.5 rounded-lg transition-colors"
                >
                  {apiKey ? 'Update API Key' : 'Add API Key'}
                </button>
              </div>
            </div>

            {/* Divider */}
            <div className="border-t border-gray-200border-gray-700 my-1"></div>

            {/* Clear Cache */}
            <div className="px-4 py-2 hover:bg-gray-50hover:bg-gray-700/50">
              <button
                onClick={() => {
                  if (window.confirm('Are you sure you want to clear all cached data? This will reset everything to start fresh.')) {
                    onClearCache();
                  }
                  setIsOpen(false);
                }}
                className="flex items-center gap-3 w-full text-left"
              >
                <svg className="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                <span className="text-sm font-medium text-gray-900text-gray-100">Clear Cache</span>
              </button>
              <div className="mt-1 text-xs text-gray-500text-gray-400 ml-8">
                Reset all saved data
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

