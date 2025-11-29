"use client";

import type { LibraryChain } from '@/types/hadith';

interface ChainCollectionsModalProps {
  show: boolean;
  onClose: () => void;
  libraryChains: LibraryChain[];
  isLoadingLibrary: boolean;
  onLoadChain: (chainPath: string) => Promise<void>;
}

export function ChainCollectionsModal({
  show,
  onClose,
  libraryChains,
  isLoadingLibrary,
  onLoadChain
}: ChainCollectionsModalProps) {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div
        className="rounded-2xl border-2 border-black p-6 max-w-md w-full mx-4 max-h-[80vh] overflow-y-auto"
        style={{
          backgroundColor: '#f2e9dd',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(0, 0, 0, 0.1)'
        }}
      >
        <div className="flex justify-between items-center mb-6">
          <h2
            className="text-xl font-semibold"
            style={{ fontFamily: 'var(--font-title)', color: '#000000' }}
          >
            Chain Collections
          </h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-black/10 rounded-lg transition-colors text-xl"
          >
            ×
          </button>
        </div>

        <div className="space-y-3">
          {isLoadingLibrary ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 mx-auto mb-4" style={{ borderColor: '#000000' }}></div>
              <p className="text-sm" style={{ fontFamily: 'var(--font-content)', color: '#000000', opacity: 0.7 }}>
                Loading chain collections...
              </p>
            </div>
          ) : libraryChains.length === 0 ? (
            <div className="text-center py-8">
              <p style={{ fontFamily: 'var(--font-content)', color: '#000000', opacity: 0.7 }}>
                No chain collections available.
              </p>
            </div>
          ) : (
            libraryChains.map((chain) => (
              <button
                key={chain.path}
                onClick={() => onLoadChain(chain.path)}
                className="w-full p-4 border-2 border-black rounded-lg hover:bg-black/5 transition-colors text-left"
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
        </div>
      </div>
    </div>
  );
}
