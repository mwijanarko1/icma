import type { Chain, Narrator, LibraryChain } from './hadith';
import type { Narrator as NarratorType } from '@/data/types';
import type { ReputationGrade } from '@/lib/grading/constants';

export interface PendingMatch {
  chainId: string;
  narratorNumber: number;
  narratorArabicName: string;
  narratorEnglishName: string;
  matches: Array<{
    narratorId: string;
    confidence: number;
    matchedName: string;
    suggestedGrades?: ReputationGrade[];
    databaseNarrator: NarratorType;
  }>;
  selectedMatchIndex?: number; // Index of the selected match from the top 3
}

export interface HadithAnalyzerState {
  // Text and chains
  hadithText: string;
  chains: Chain[];
  mermaidCode: string;
  
  // UI state
  showVisualization: boolean;
  isLoading: boolean;
  error: string | null;
  activeTab: 'llm' | 'manual' | 'narrators' | 'hadith';
  selectedChainIndex: number;
  
  // Editing state
  editingChainId: string | null;
  editFormData: {
    title: string;
    narrators: Narrator[];
    chainText: string;
    matn: string;
  };
  
  // Narrator state
  activeNarrator: Narrator | null;
  showAddNarrator: boolean;
  newNarrator: {
    arabicName: string;
    englishName: string;
    reputation: ReputationGrade[];
    calculatedGrade: number;
  };
  
  // API key
  apiKey: string;
  showApiKeyModal: boolean;
  
  // Drag and drop
  activeChainId: string | null;
  
  // Chain highlighting
  highlightedChainIds: string[];
  
  // Import state
  showImportModal: boolean;
  importMode: 'library' | 'computer' | null;
  libraryChains: LibraryChain[];
  isLoadingLibrary: boolean;
  
  // Narrator details modal
  showNarratorModal: boolean;
  selectedNarratorDetails: NarratorType | null;
  isLoadingNarratorDetails: boolean;
  
  // Match confirmation modal
  showMatchConfirmationModal: boolean;
  pendingMatches: PendingMatch[];
  currentMatchIndex: number;
  acceptedMatchesCount: number;
  
  // Narrator search (main tab)
  narratorSearchQuery: string;
  narratorSearchResults: NarratorType[];
  isSearchingNarrators: boolean;
  selectedNarratorData: NarratorType | null;
  isLoadingNarratorData: boolean;
  showNarratorDetailsModal: boolean;
  narratorSearchOffset: number;
  narratorSearchTotal: number;
  showGradeFormulaTooltip1: boolean;
  
  // Narrator search modal (for matching)
  showNarratorSearchModal: boolean;
  searchingNarratorIndex: number | null;
  searchingChainId: string | null;
  searchingInEditMode: boolean;
  narratorSearchModalQuery: string;
  narratorSearchModalResults: NarratorType[];
  isSearchingModal: boolean;
  narratorSearchModalOffset: number;
  narratorSearchModalTotal: number;
  showGradeFormulaTooltip2: boolean;
}

export const initialState: HadithAnalyzerState = {
  hadithText: '',
  chains: [],
  mermaidCode: '',
  showVisualization: false,
  isLoading: false,
  error: null,
  activeTab: 'llm',
  selectedChainIndex: 0,
  editingChainId: null,
  editFormData: {
    title: '',
    narrators: [],
    chainText: '',
    matn: ''
  },
  activeNarrator: null,
  showAddNarrator: false,
  newNarrator: {
    arabicName: '',
    englishName: '',
    reputation: [],
    calculatedGrade: 0
  },
  apiKey: '',
  showApiKeyModal: false,
  activeChainId: null,
  highlightedChainIds: [],
  showImportModal: false,
  importMode: null,
  libraryChains: [],
  isLoadingLibrary: false,
  showNarratorModal: false,
  selectedNarratorDetails: null,
  isLoadingNarratorDetails: false,
  showMatchConfirmationModal: false,
  pendingMatches: [],
  currentMatchIndex: 0,
  acceptedMatchesCount: 0,
  narratorSearchQuery: '',
  narratorSearchResults: [],
  isSearchingNarrators: false,
  selectedNarratorData: null,
  isLoadingNarratorData: false,
  showNarratorDetailsModal: false,
  narratorSearchOffset: 0,
  narratorSearchTotal: 0,
  showGradeFormulaTooltip1: false,
  showNarratorSearchModal: false,
  searchingNarratorIndex: null,
  searchingChainId: null,
  searchingInEditMode: false,
  narratorSearchModalQuery: '',
  narratorSearchModalResults: [],
  isSearchingModal: false,
  narratorSearchModalOffset: 0,
  narratorSearchModalTotal: 0,
  showGradeFormulaTooltip2: false
};

