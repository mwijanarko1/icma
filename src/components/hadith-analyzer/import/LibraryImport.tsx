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
          <p className="text-sm mt-2" style={{ fontFamily: 'var(--font-content)', color: '#000000', opacity: 0.7 }}>Loading library chains...</p>
        </div>
      ) : libraryChains.length === 0 ? (
        <div className="text-center py-8">
          <p style={{ fontFamily: 'var(--font-content)', color: '#000000', opacity: 0.7 }}>No library chains found.</p>
        </div>
      ) : (
        libraryChains.map((chain) => (
          <button
            key={chain.path}
            onClick={() => onLoadChain(chain.path)}
            className="w-full p-4 border-2 border-black rounded-lg hover:bg-gray-50 transition-colors text-left"
            style={{ fontFamily: 'var(--font-content)' }}
          >
            <div className="font-medium mb-1" style={{ color: '#000000' }}>
              {chain.displayName}
            </div>
            <div className="text-sm" style={{ color: '#000000', opacity: 0.7 }}>
              {chain.chainCount} chains
            </div>
          </button>
        ))
      )}
      <button
        onClick={onBack}
        className="w-full mt-4 px-4 py-2 text-sm hover:opacity-80 transition-opacity"
        style={{ fontFamily: 'var(--font-content)', color: '#000000', opacity: 0.7 }}
      >
        ← Back to options
      </button>
    </div>
  );
}

