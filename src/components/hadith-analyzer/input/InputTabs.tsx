"use client";

import { useEffect, useRef } from 'react';
import type { InputTabsProps } from './types';

export function InputTabs({ activeTab, onTabChange }: InputTabsProps) {
  const tabsRef = useRef<HTMLDivElement>(null);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!tabsRef.current?.contains(event.target as Node)) return;

      const tabs = ['llm', 'manual'] as const;
      const currentIndex = tabs.indexOf(activeTab as typeof tabs[number]);

      switch (event.key) {
        case 'ArrowLeft':
          event.preventDefault();
          const prevIndex = currentIndex > 0 ? currentIndex - 1 : tabs.length - 1;
          onTabChange(tabs[prevIndex]);
          break;
        case 'ArrowRight':
          event.preventDefault();
          const nextIndex = currentIndex < tabs.length - 1 ? currentIndex + 1 : 0;
          onTabChange(tabs[nextIndex]);
          break;
        case 'Home':
          event.preventDefault();
          onTabChange(tabs[0]);
          break;
        case 'End':
          event.preventDefault();
          onTabChange(tabs[tabs.length - 1]);
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [activeTab, onTabChange]);

  return (
    <div className="mb-4 sm:mb-6">
      <div className="border-b" style={{ borderColor: '#ffffff' }}>
        <nav
          ref={tabsRef}
          className="-mb-px flex space-x-4 sm:space-x-6 md:space-x-8 overflow-x-auto"
          role="tablist"
          aria-label="Input method selection"
        >
          <button
            onClick={() => onTabChange('llm')}
            className="py-2 px-1 border-b-2 font-semibold text-xs sm:text-sm transition-colors whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            style={{
              borderColor: activeTab === 'llm' ? '#000000' : 'transparent',
              color: activeTab === 'llm' ? '#000000' : '#000000',
              opacity: activeTab === 'llm' ? 1 : 0.6,
              fontFamily: 'var(--font-content)'
            }}
            role="tab"
            aria-selected={activeTab === 'llm'}
            aria-controls="llm-panel"
            id="llm-tab"
            tabIndex={activeTab === 'llm' ? 0 : -1}
          >
            LLM Extraction
          </button>
          <button
            onClick={() => onTabChange('manual')}
            className="py-2 px-1 border-b-2 font-semibold text-xs sm:text-sm transition-colors whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            style={{
              borderColor: activeTab === 'manual' ? '#000000' : 'transparent',
              color: activeTab === 'manual' ? '#000000' : '#000000',
              opacity: activeTab === 'manual' ? 1 : 0.6,
              fontFamily: 'var(--font-content)'
            }}
            role="tab"
            aria-selected={activeTab === 'manual'}
            aria-controls="manual-panel"
            id="manual-tab"
            tabIndex={activeTab === 'manual' ? 0 : -1}
          >
            Manual Builder
          </button>
        </nav>
      </div>
    </div>
  );
}

