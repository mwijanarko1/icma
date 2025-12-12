import type { Chain, Narrator, LibraryChain } from '@/types/hadith';
import type { Narrator as NarratorType } from '@/data/types';
import type { ReputationGrade } from '@/lib/grading/constants';
import type { PendingMatch, HadithAnalyzerState } from '@/types/hadithAnalyzerState';

// Action type definitions
export type HadithAnalyzerAction =
  | { type: 'SET_HADITH_TEXT'; payload: string }
  | { type: 'SET_CHAINS'; payload: Chain[] }
  | { type: 'ADD_CHAIN'; payload: Chain }
  | { type: 'UPDATE_CHAIN'; payload: { chainId: string; chain: Partial<Chain> } }
  | { type: 'TOGGLE_CHAIN_VISIBILITY'; payload: string }
  | { type: 'REMOVE_CHAIN'; payload: string }
  | { type: 'SET_MERMAID_CODE'; payload: string }
  | { type: 'SET_SHOW_VISUALIZATION'; payload: boolean }
  | { type: 'SET_HIGHLIGHTED_CHAIN_IDS'; payload: string[] }
  | { type: 'SET_IS_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_ACTIVE_TAB'; payload: 'llm' | 'manual' | 'narrators' | 'hadith' | 'settings' }
  | { type: 'SET_SELECTED_CHAIN_INDEX'; payload: number }
  | { type: 'SET_EDITING_CHAIN_ID'; payload: string | null }
  | { type: 'SET_EDIT_FORM_DATA'; payload: HadithAnalyzerState['editFormData'] }
  | { type: 'UPDATE_EDIT_FORM_NARRATOR'; payload: { index: number; field: 'arabicName' | 'englishName'; value: string } }
  | { type: 'UPDATE_EDIT_FORM_NARRATOR_REPUTATION'; payload: { index: number; reputation: ReputationGrade[] } }
  | { type: 'REMOVE_EDIT_FORM_NARRATOR'; payload: number }
  | { type: 'REORDER_EDIT_FORM_NARRATORS'; payload: Narrator[] }
  | { type: 'SET_ACTIVE_NARRATOR'; payload: Narrator | null }
  | { type: 'SET_SHOW_ADD_NARRATOR'; payload: boolean }
  | { type: 'SET_NEW_NARRATOR'; payload: HadithAnalyzerState['newNarrator'] }
  | { type: 'SET_API_KEY'; payload: string }
  | { type: 'SET_SHOW_API_KEY_MODAL'; payload: boolean }
  | { type: 'SET_ACTIVE_CHAIN_ID'; payload: string | null }
  | { type: 'SET_SHOW_IMPORT_MODAL'; payload: boolean }
  | { type: 'SET_LIBRARY_CHAINS'; payload: LibraryChain[] }
  | { type: 'SET_IS_LOADING_LIBRARY'; payload: boolean }
  | { type: 'SET_SHOW_NARRATOR_MODAL'; payload: boolean }
  | { type: 'SET_SELECTED_NARRATOR_DETAILS'; payload: NarratorType | null }
  | { type: 'SET_IS_LOADING_NARRATOR_DETAILS'; payload: boolean }
  | { type: 'SET_SHOW_MATCH_CONFIRMATION_MODAL'; payload: boolean }
  | { type: 'SET_PENDING_MATCHES'; payload: PendingMatch[] }
  | { type: 'SET_CURRENT_MATCH_INDEX'; payload: number }
  | { type: 'SET_ACCEPTED_MATCHES_COUNT'; payload: number }
  | { type: 'SET_SELECTED_MATCH_INDEX'; payload: { matchIndex: number; selectedIndex: number } }
  | { type: 'SET_NARRATOR_SEARCH_QUERY'; payload: string }
  | { type: 'SET_NARRATOR_SEARCH_RESULTS'; payload: NarratorType[] }
  | { type: 'SET_IS_SEARCHING_NARRATORS'; payload: boolean }
  | { type: 'SET_SELECTED_NARRATOR_DATA'; payload: NarratorType | null }
  | { type: 'SET_IS_LOADING_NARRATOR_DATA'; payload: boolean }
  | { type: 'SET_SHOW_NARRATOR_DETAILS_MODAL'; payload: boolean }
  | { type: 'SET_NARRATOR_SEARCH_OFFSET'; payload: number }
  | { type: 'SET_NARRATOR_SEARCH_TOTAL'; payload: number }
  | { type: 'SET_SHOW_GRADE_FORMULA_TOOLTIP1'; payload: boolean }
  | { type: 'SET_SHOW_NARRATOR_SEARCH_MODAL'; payload: boolean }
  | { type: 'SET_SEARCHING_NARRATOR_INDEX'; payload: number | null }
  | { type: 'SET_SEARCHING_CHAIN_ID'; payload: string | null }
  | { type: 'SET_SEARCHING_IN_EDIT_MODE'; payload: boolean }
  | { type: 'SET_NARRATOR_SEARCH_MODAL_QUERY'; payload: string }
  | { type: 'SET_NARRATOR_SEARCH_MODAL_RESULTS'; payload: NarratorType[] }
  | { type: 'SET_IS_SEARCHING_MODAL'; payload: boolean }
  | { type: 'SET_NARRATOR_SEARCH_MODAL_OFFSET'; payload: number }
  | { type: 'SET_NARRATOR_SEARCH_MODAL_TOTAL'; payload: number }
  | { type: 'SET_SHOW_GRADE_FORMULA_TOOLTIP2'; payload: boolean }
  | { type: 'SET_SHOW_ADD_HADITH_MODAL'; payload: boolean }
  | { type: 'RESET_STATE' }
  | { type: 'RESET_EDIT_FORM' }
  | { type: 'RESET_NEW_NARRATOR' };

// Action creators
export const actions = {
  setHadithText: (text: string): HadithAnalyzerAction => ({
    type: 'SET_HADITH_TEXT',
    payload: text
  }),
  
  setChains: (chains: Chain[]): HadithAnalyzerAction => ({
    type: 'SET_CHAINS',
    payload: chains
  }),
  
  addChain: (chain: Chain): HadithAnalyzerAction => ({
    type: 'ADD_CHAIN',
    payload: chain
  }),
  
  updateChain: (chainId: string, chain: Partial<Chain>): HadithAnalyzerAction => ({
    type: 'UPDATE_CHAIN',
    payload: { chainId, chain }
  }),
  
  toggleChainVisibility: (chainId: string): HadithAnalyzerAction => ({
    type: 'TOGGLE_CHAIN_VISIBILITY',
    payload: chainId
  }),
  
  removeChain: (chainId: string): HadithAnalyzerAction => ({
    type: 'REMOVE_CHAIN',
    payload: chainId
  }),
  
  setMermaidCode: (code: string): HadithAnalyzerAction => ({
    type: 'SET_MERMAID_CODE',
    payload: code
  }),
  
  setShowVisualization: (show: boolean): HadithAnalyzerAction => ({
    type: 'SET_SHOW_VISUALIZATION',
    payload: show
  }),
  
  setIsLoading: (loading: boolean): HadithAnalyzerAction => ({
    type: 'SET_IS_LOADING',
    payload: loading
  }),
  
  setError: (error: string | null): HadithAnalyzerAction => ({
    type: 'SET_ERROR',
    payload: error
  }),
  
  setActiveTab: (tab: 'llm' | 'manual' | 'narrators' | 'hadith' | 'settings'): HadithAnalyzerAction => ({
    type: 'SET_ACTIVE_TAB',
    payload: tab
  }),
  
  setSelectedChainIndex: (index: number): HadithAnalyzerAction => ({
    type: 'SET_SELECTED_CHAIN_INDEX',
    payload: index
  }),
  
  setHighlightedChainIds: (ids: string[]): HadithAnalyzerAction => ({
    type: 'SET_HIGHLIGHTED_CHAIN_IDS',
    payload: ids
  }),
  
  setEditingChainId: (id: string | null): HadithAnalyzerAction => ({
    type: 'SET_EDITING_CHAIN_ID',
    payload: id
  }),
  
  setEditFormData: (data: HadithAnalyzerState['editFormData']): HadithAnalyzerAction => ({
    type: 'SET_EDIT_FORM_DATA',
    payload: data
  }),
  
  updateEditFormNarrator: (index: number, field: 'arabicName' | 'englishName', value: string): HadithAnalyzerAction => ({
    type: 'UPDATE_EDIT_FORM_NARRATOR',
    payload: { index, field, value }
  }),
  
  updateEditFormNarratorReputation: (index: number, reputation: ReputationGrade[]): HadithAnalyzerAction => ({
    type: 'UPDATE_EDIT_FORM_NARRATOR_REPUTATION',
    payload: { index, reputation }
  }),
  
  removeEditFormNarrator: (index: number): HadithAnalyzerAction => ({
    type: 'REMOVE_EDIT_FORM_NARRATOR',
    payload: index
  }),
  
  reorderEditFormNarrators: (narrators: Narrator[]): HadithAnalyzerAction => ({
    type: 'REORDER_EDIT_FORM_NARRATORS',
    payload: narrators
  }),
  
  setActiveNarrator: (narrator: Narrator | null): HadithAnalyzerAction => ({
    type: 'SET_ACTIVE_NARRATOR',
    payload: narrator
  }),
  
  setShowAddNarrator: (show: boolean): HadithAnalyzerAction => ({
    type: 'SET_SHOW_ADD_NARRATOR',
    payload: show
  }),
  
  setNewNarrator: (narrator: HadithAnalyzerState['newNarrator']): HadithAnalyzerAction => ({
    type: 'SET_NEW_NARRATOR',
    payload: narrator
  }),
  
  setApiKey: (key: string): HadithAnalyzerAction => ({
    type: 'SET_API_KEY',
    payload: key
  }),
  
  setShowApiKeyModal: (show: boolean): HadithAnalyzerAction => ({
    type: 'SET_SHOW_API_KEY_MODAL',
    payload: show
  }),
  
  setActiveChainId: (id: string | null): HadithAnalyzerAction => ({
    type: 'SET_ACTIVE_CHAIN_ID',
    payload: id
  }),
  
  setShowImportModal: (show: boolean): HadithAnalyzerAction => ({
    type: 'SET_SHOW_IMPORT_MODAL',
    payload: show
  }),
  
  
  setLibraryChains: (chains: LibraryChain[]): HadithAnalyzerAction => ({
    type: 'SET_LIBRARY_CHAINS',
    payload: chains
  }),
  
  setIsLoadingLibrary: (loading: boolean): HadithAnalyzerAction => ({
    type: 'SET_IS_LOADING_LIBRARY',
    payload: loading
  }),
  
  setShowNarratorModal: (show: boolean): HadithAnalyzerAction => ({
    type: 'SET_SHOW_NARRATOR_MODAL',
    payload: show
  }),
  
  setSelectedNarratorDetails: (narrator: NarratorType | null): HadithAnalyzerAction => ({
    type: 'SET_SELECTED_NARRATOR_DETAILS',
    payload: narrator
  }),
  
  setIsLoadingNarratorDetails: (loading: boolean): HadithAnalyzerAction => ({
    type: 'SET_IS_LOADING_NARRATOR_DETAILS',
    payload: loading
  }),
  
  setShowMatchConfirmationModal: (show: boolean): HadithAnalyzerAction => ({
    type: 'SET_SHOW_MATCH_CONFIRMATION_MODAL',
    payload: show
  }),
  
  setPendingMatches: (matches: PendingMatch[]): HadithAnalyzerAction => ({
    type: 'SET_PENDING_MATCHES',
    payload: matches
  }),
  
  setCurrentMatchIndex: (index: number): HadithAnalyzerAction => ({
    type: 'SET_CURRENT_MATCH_INDEX',
    payload: index
  }),
  
  setAcceptedMatchesCount: (count: number): HadithAnalyzerAction => ({
    type: 'SET_ACCEPTED_MATCHES_COUNT',
    payload: count
  }),
  
  setSelectedMatchIndex: (matchIndex: number, selectedIndex: number): HadithAnalyzerAction => ({
    type: 'SET_SELECTED_MATCH_INDEX',
    payload: { matchIndex, selectedIndex }
  }),
  
  setNarratorSearchQuery: (query: string): HadithAnalyzerAction => ({
    type: 'SET_NARRATOR_SEARCH_QUERY',
    payload: query
  }),
  
  setNarratorSearchResults: (results: NarratorType[]): HadithAnalyzerAction => ({
    type: 'SET_NARRATOR_SEARCH_RESULTS',
    payload: results
  }),
  
  setIsSearchingNarrators: (searching: boolean): HadithAnalyzerAction => ({
    type: 'SET_IS_SEARCHING_NARRATORS',
    payload: searching
  }),
  
  setSelectedNarratorData: (narrator: NarratorType | null): HadithAnalyzerAction => ({
    type: 'SET_SELECTED_NARRATOR_DATA',
    payload: narrator
  }),
  
  setIsLoadingNarratorData: (loading: boolean): HadithAnalyzerAction => ({
    type: 'SET_IS_LOADING_NARRATOR_DATA',
    payload: loading
  }),
  
  setShowNarratorDetailsModal: (show: boolean): HadithAnalyzerAction => ({
    type: 'SET_SHOW_NARRATOR_DETAILS_MODAL',
    payload: show
  }),
  
  setNarratorSearchOffset: (offset: number): HadithAnalyzerAction => ({
    type: 'SET_NARRATOR_SEARCH_OFFSET',
    payload: offset
  }),
  
  setNarratorSearchTotal: (total: number): HadithAnalyzerAction => ({
    type: 'SET_NARRATOR_SEARCH_TOTAL',
    payload: total
  }),
  
  setShowGradeFormulaTooltip1: (show: boolean): HadithAnalyzerAction => ({
    type: 'SET_SHOW_GRADE_FORMULA_TOOLTIP1',
    payload: show
  }),
  
  setShowNarratorSearchModal: (show: boolean): HadithAnalyzerAction => ({
    type: 'SET_SHOW_NARRATOR_SEARCH_MODAL',
    payload: show
  }),
  
  setSearchingNarratorIndex: (index: number | null): HadithAnalyzerAction => ({
    type: 'SET_SEARCHING_NARRATOR_INDEX',
    payload: index
  }),
  
  setSearchingChainId: (id: string | null): HadithAnalyzerAction => ({
    type: 'SET_SEARCHING_CHAIN_ID',
    payload: id
  }),
  
  setSearchingInEditMode: (inEditMode: boolean): HadithAnalyzerAction => ({
    type: 'SET_SEARCHING_IN_EDIT_MODE',
    payload: inEditMode
  }),
  
  setNarratorSearchModalQuery: (query: string): HadithAnalyzerAction => ({
    type: 'SET_NARRATOR_SEARCH_MODAL_QUERY',
    payload: query
  }),
  
  setNarratorSearchModalResults: (results: NarratorType[]): HadithAnalyzerAction => ({
    type: 'SET_NARRATOR_SEARCH_MODAL_RESULTS',
    payload: results
  }),
  
  setIsSearchingModal: (searching: boolean): HadithAnalyzerAction => ({
    type: 'SET_IS_SEARCHING_MODAL',
    payload: searching
  }),
  
  setNarratorSearchModalOffset: (offset: number): HadithAnalyzerAction => ({
    type: 'SET_NARRATOR_SEARCH_MODAL_OFFSET',
    payload: offset
  }),
  
  setNarratorSearchModalTotal: (total: number): HadithAnalyzerAction => ({
    type: 'SET_NARRATOR_SEARCH_MODAL_TOTAL',
    payload: total
  }),
  
  setShowGradeFormulaTooltip2: (show: boolean): HadithAnalyzerAction => ({
    type: 'SET_SHOW_GRADE_FORMULA_TOOLTIP2',
    payload: show
  }),

  setShowAddHadithModal: (show: boolean): HadithAnalyzerAction => ({
    type: 'SET_SHOW_ADD_HADITH_MODAL',
    payload: show
  }),

  resetState: (): HadithAnalyzerAction => ({
    type: 'RESET_STATE'
  }),
  
  resetEditForm: (): HadithAnalyzerAction => ({
    type: 'RESET_EDIT_FORM'
  }),
  
  resetNewNarrator: (): HadithAnalyzerAction => ({
    type: 'RESET_NEW_NARRATOR'
  })
};

