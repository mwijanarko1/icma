"use client";

import type { LibraryChain } from '@/types/hadith';
import BasicModal from "@/components/ui/BasicModal";

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
  return (
    <BasicModal
      isOpen={show}
      onClose={onClose}
      title="Chain Collections"
      size="md"
    >
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
    </BasicModal>
  );
}
