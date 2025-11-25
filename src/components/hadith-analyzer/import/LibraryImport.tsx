"use client";

import type { LibraryImportProps } from './types';

export function LibraryImport({
  libraryChains,
  isLoadingLibrary,
  onLoadChain,
  onBack
}: LibraryImportProps) {
  return (
    <div className="space-y-3">
      {isLoadingLibrary ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">Loading library chains...</p>
        </div>
      ) : libraryChains.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-600 dark:text-gray-400">No library chains found.</p>
        </div>
      ) : (
        libraryChains.map((chain) => (
          <button
            key={chain.path}
            onClick={() => onLoadChain(chain.path)}
            className="w-full p-4 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-left"
          >
            <div className="font-medium text-gray-900 dark:text-white mb-1">
              {chain.displayName}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {chain.chainCount} chains
            </div>
          </button>
        ))
      )}
      <button
        onClick={onBack}
        className="w-full mt-4 px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
      >
        ← Back to options
      </button>
    </div>
  );
}

