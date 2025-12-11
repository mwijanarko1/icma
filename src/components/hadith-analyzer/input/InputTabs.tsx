"use client";

import type { InputTabsProps } from './types';

export function InputTabs({ activeTab, onTabChange }: InputTabsProps) {
  return (
    <div className="mb-4 sm:mb-6">
      <div className="border-b" style={{ borderColor: '#ffffff' }}>
        <nav className="-mb-px flex space-x-4 sm:space-x-6 md:space-x-8 overflow-x-auto">
          <button
            onClick={() => onTabChange('llm')}
            className="py-2 px-1 border-b-2 font-semibold text-xs sm:text-sm transition-colors whitespace-nowrap"
            style={{
              borderColor: activeTab === 'llm' ? '#000000' : 'transparent',
              color: activeTab === 'llm' ? '#000000' : '#000000',
              opacity: activeTab === 'llm' ? 1 : 0.6,
              fontFamily: 'var(--font-content)'
            }}
          >
            LLM Extraction
          </button>
          <button
            onClick={() => onTabChange('manual')}
            className="py-2 px-1 border-b-2 font-semibold text-xs sm:text-sm transition-colors whitespace-nowrap"
            style={{
              borderColor: activeTab === 'manual' ? '#000000' : 'transparent',
              color: activeTab === 'manual' ? '#000000' : '#000000',
              opacity: activeTab === 'manual' ? 1 : 0.6,
              fontFamily: 'var(--font-content)'
            }}
          >
            Manual Builder
          </button>
        </nav>
      </div>
    </div>
  );
}

