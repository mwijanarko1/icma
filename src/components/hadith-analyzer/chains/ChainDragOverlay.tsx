"use client";

import type { Chain } from '@/types/hadith';

interface ChainDragOverlayProps {
  activeChainId: string | null;
  chains: Chain[];
}

export function ChainDragOverlay({ activeChainId, chains }: ChainDragOverlayProps) {
  if (!activeChainId) {
    return null;
  }

  const activeChain = chains.find(chain => chain.id === activeChainId);
  if (!activeChain) {
    return null;
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg ring-2 ring-blue-400 dark:ring-blue-500 opacity-80">
      <div className="flex items-center p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-3">
          <div className="p-1">
            <svg className="w-4 h-4 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
              <circle cx="9" cy="12" r="1.5" fill="currentColor" />
              <circle cx="15" cy="12" r="1.5" fill="currentColor" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            {activeChain.title || `Chain ${chains.findIndex(c => c.id === activeChainId) + 1}`}
            {activeChain.title?.includes('(Demo)') && (
              <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300">
                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Demo
              </span>
            )}
          </h3>
        </div>
      </div>
    </div>
  );
}

