"use client";

import { LibraryImport } from './LibraryImport';
import { FileImport } from './FileImport';
import type { ImportModalProps } from './types';
import type { LibraryChain, Chain } from '@/types/hadith';
import BasicModal from "@/components/ui/BasicModal";

interface ImportModalFullProps extends ImportModalProps {
  libraryChains: LibraryChain[];
  isLoadingLibrary: boolean;
  onLoadChain: (chainPath: string) => Promise<void>;
  onFileImport: (data: {
    hadithText: string;
    chains: Chain[];
    activeTab?: 'llm' | 'manual' | 'narrators';
    selectedChainIndex?: number;
    showVisualization?: boolean;
  }) => void;
}

export function ImportModal({
  showImportModal,
  importMode,
  onClose,
  onSetImportMode,
  libraryChains,
  isLoadingLibrary,
  onLoadChain,
  onFileImport
}: ImportModalFullProps) {
  const handleClose = () => {
    onSetImportMode(null);
    onClose();
  };

  const getTitle = () => {
    if (importMode === 'library') return 'Select Library Chain';
    if (importMode === 'computer') return 'Upload from Computer';
    return 'Import Chains';
  };

  return (
    <BasicModal
      isOpen={showImportModal}
      onClose={handleClose}
      title={getTitle()}
      size="md"
    >
      {!importMode ? (
          <div className="space-y-3">
            <button
              onClick={() => onSetImportMode('library')}
              className="w-full p-4 border-2 border-black rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-3"
              style={{ fontFamily: 'var(--font-content)' }}
            >
              <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              <div className="text-left">
                <div className="font-medium" style={{ color: '#000000' }}>From Library</div>
                <div className="text-sm" style={{ color: '#000000', opacity: 0.7 }}>Load from built-in chain collections</div>
              </div>
            </button>

            <button
              onClick={() => onSetImportMode('computer')}
              className="w-full p-4 border-2 border-black rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-3"
              style={{ fontFamily: 'var(--font-content)' }}
            >
              <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              <div className="text-left">
                <div className="font-medium" style={{ color: '#000000' }}>From Computer</div>
                <div className="text-sm" style={{ color: '#000000', opacity: 0.7 }}>Upload JSON file from your device</div>
              </div>
            </button>
          </div>
        ) : importMode === 'library' ? (
          <LibraryImport
            libraryChains={libraryChains}
            isLoadingLibrary={isLoadingLibrary}
            onLoadChain={onLoadChain}
            onBack={() => onSetImportMode(null)}
          />
        ) : (
          <FileImport
            onImport={onFileImport}
            onBack={() => onSetImportMode(null)}
          />
        )}
    </BasicModal>
  );
}

