import type { Chain } from '@/types/hadith';
import type { ReputationGrade } from '@/lib/grading/constants';
import type { Narrator as NarratorType } from '@/data/types';

export interface InputTabsProps {
  activeTab: 'llm' | 'manual' | 'narrators' | 'hadith';
  onTabChange: (tab: 'llm' | 'manual' | 'narrators' | 'hadith') => void;
}

export interface LLMTabProps {
  hadithText: string;
  onHadithTextChange: (text: string) => void;
  apiKey: string;
  isLoading: boolean;
  chains: Chain[];
  onExtractNarrators: (text: string) => Promise<void>;
  onShowApiKeyModal: () => void;
  onShowImportModal: () => void;
  onNewHadith: () => void;
  onExportChains: () => void;
  onTryDemo: () => Promise<void>;
}

export interface ManualTabProps {
  hadithText: string;
  onHadithTextChange: (text: string) => void;
  chains: Chain[];
  selectedChainIndex: number;
  showAddNarrator: boolean;
  newNarrator: {
    arabicName: string;
    englishName: string;
    reputation: ReputationGrade[];
    calculatedGrade: number;
  };
  onNewHadith: () => void;
  onAddNewChain: () => void;
  onShowImportModal: () => void;
  onExportChains: () => void;
  onSelectChain: (index: number) => void;
  onShowAddNarrator: (show: boolean) => void;
  onNewNarratorChange: (narrator: {
    arabicName: string;
    englishName: string;
    reputation: ReputationGrade[];
    calculatedGrade: number;
  }) => void;
  onAddNarrator: () => void;
  onRemoveChain: (index: number) => void;
  onUpdateChainTitle: (index: number, title: string) => void;
  onUpdateNarratorReputation: (chainIndex: number, narratorIndex: number, reputation: ReputationGrade[]) => void;
  onRemoveNarrator: (chainIndex: number, narratorIndex: number) => void;
  onClearNarrators: (chainIndex: number) => void;
  isDarkMode: boolean;
}

export interface NarratorsTabProps {
  narratorSearchQuery: string;
  onNarratorSearchQueryChange: (query: string) => void;
  narratorSearchResults: NarratorType[];
  isSearchingNarrators: boolean;
  narratorSearchTotal: number;
  narratorSearchOffset: number;
  onSearchNarrators: (query: string, offset: number) => void;
  onFetchNarratorDetails: (id: string) => void;
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface HadithTabProps {}

