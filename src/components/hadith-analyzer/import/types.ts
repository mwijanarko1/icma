import type { LibraryChain, Chain } from '@/types/hadith';

export type ImportMode = 'library' | 'computer' | null;

export interface ImportModalProps {
  showImportModal: boolean;
  importMode: ImportMode;
  onClose: () => void;
  onSetImportMode: (mode: ImportMode) => void;
}

export interface LibraryImportProps {
  libraryChains: LibraryChain[];
  isLoadingLibrary: boolean;
  onLoadChain: (chainPath: string) => Promise<void>;
  onBack: () => void;
}

export interface FileImportProps {
  onImport: (data: {
    hadithText: string;
    chains: Chain[];
    activeTab?: 'llm' | 'manual' | 'narrators';
    selectedChainIndex?: number;
    showVisualization?: boolean;
  }) => void;
  onBack: () => void;
}

