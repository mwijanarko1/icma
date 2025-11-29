import type { Chain } from '@/types/hadith';
import type { ReputationGrade } from '@/lib/grading/constants';
import type { Narrator as NarratorType } from '@/data/types';

export interface InputTabsProps {
  activeTab: 'llm' | 'manual' | 'narrators' | 'hadith' | 'settings';
  onTabChange: (tab: 'llm' | 'manual' | 'narrators' | 'hadith' | 'settings') => void;
}

export interface SettingsTabProps {
  apiKey: string;
  onOpenApiKeyModal: () => void;
  onClearCache: () => void;
}

export interface LLMTabProps {
  hadithText: string;
  onHadithTextChange: (text: string) => void;
  apiKey: string;
  isLoading: boolean;
  onExtractNarrators: (text: string) => Promise<void>;
  onShowApiKeyModal: () => void;
  onShowImportModal: () => void;
  onShowAddHadithModal: () => void;
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
  onAddNewChain: () => void;
  onShowImportModal: () => void;
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

export interface HadithTabProps {
  selectedHadiths?: Array<{
    hadith_number: number;
    sub_version?: string;
    reference: string;
    english_narrator?: string;
    english_translation: string;
    arabic_text: string;
    in_book_reference?: string;
    collection: string;
  }>;
  onSelectedHadithsChange?: (hadiths: Array<{
    hadith_number: number;
    sub_version?: string;
    reference: string;
    english_narrator?: string;
    english_translation: string;
    arabic_text: string;
    in_book_reference?: string;
    collection: string;
  }>) => void;
  showSelectButton?: boolean;
}

export interface AddHadithFromDatabaseModalProps {
  show: boolean;
  onClose: () => void;
  onAddHadiths: (hadiths: Array<{
    hadith_number: number;
    sub_version?: string;
    reference: string;
    english_narrator?: string;
    english_translation: string;
    arabic_text: string;
    in_book_reference?: string;
    collection: string;
  }>) => void;
  isLoading?: boolean;
}

