"use client";

import { useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import type { InputTabsProps } from './types';

export function InputTabs({ activeTab, onTabChange }: InputTabsProps) {
  const { user } = useAuth();
  const tabsRef = useRef<HTMLDivElement>(null);

  // Define available tabs based on authentication status
  const tabs = user ? (['llm', 'manual'] as const) : (['llm', 'manual', 'settings'] as const);

  // Ensure activeTab is valid for current authentication state
  const isValidTab = tabs.includes(activeTab as any);
  const effectiveActiveTab = (isValidTab ? activeTab : tabs[0]) as typeof tabs[number];

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!tabsRef.current?.contains(event.target as Node)) return;

      const currentIndex = (tabs as readonly string[]).indexOf(effectiveActiveTab);
      if (currentIndex === -1) return;

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
  }, [activeTab, onTabChange, tabs]);

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
          {!user && (
            <button
              onClick={() => onTabChange('settings')}
              className="py-2 px-1 border-b-2 font-semibold text-xs sm:text-sm transition-colors whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              style={{
                borderColor: activeTab === 'settings' ? '#000000' : 'transparent',
                color: activeTab === 'settings' ? '#000000' : '#000000',
                opacity: activeTab === 'settings' ? 1 : 0.6,
                fontFamily: 'var(--font-content)'
              }}
              role="tab"
              aria-selected={activeTab === 'settings'}
              aria-controls="settings-panel"
              id="settings-tab"
              tabIndex={activeTab === 'settings' ? 0 : -1}
            >
              Settings
            </button>
          )}
        </nav>
      </div>
    </div>
  );
}

