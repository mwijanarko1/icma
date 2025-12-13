import type { HadithAnalyzerState } from '@/types/hadithAnalyzerState';
import type { HadithAnalyzerAction } from './hadithAnalyzerActions';
import { initialState } from '@/types/hadithAnalyzerState';
import { calculateNarratorGrade } from '@/lib/grading/calculator';

export const hadithAnalyzerReducer = (
  state: HadithAnalyzerState,
  action: HadithAnalyzerAction
): HadithAnalyzerState => {
  switch (action.type) {
    case 'SET_HADITH_TEXT':
      return { ...state, hadithText: action.payload };
    
    case 'SET_CHAINS':
      return { ...state, chains: action.payload };
    
    case 'ADD_CHAIN':
      return { ...state, chains: [...state.chains, action.payload] };
    
    case 'UPDATE_CHAIN':
      return {
        ...state,
        chains: state.chains.map(chain =>
          chain.id === action.payload.chainId
            ? { ...chain, ...action.payload.chain }
            : chain
        )
      };
    
    case 'TOGGLE_CHAIN_VISIBILITY':
      return {
        ...state,
        chains: state.chains.map(chain =>
          chain.id === action.payload
            ? { ...chain, hiddenFromVisualization: !chain.hiddenFromVisualization }
            : chain
        )
      };
    
    case 'REMOVE_CHAIN':
      return {
        ...state,
        chains: state.chains.filter(chain => chain.id !== action.payload)
      };
    
    case 'SET_MERMAID_CODE':
      return { ...state, mermaidCode: action.payload };
    
    case 'SET_SHOW_VISUALIZATION':
      return { ...state, showVisualization: action.payload };
    
    case 'SET_IS_LOADING':
      return { ...state, isLoading: action.payload };
    
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    
    case 'SET_ACTIVE_TAB':
      return { ...state, activeTab: action.payload };
    
    case 'SET_SELECTED_CHAIN_INDEX':
      return { ...state, selectedChainIndex: action.payload };
    
    case 'SET_HIGHLIGHTED_CHAIN_IDS':
      return { ...state, highlightedChainIds: action.payload };
    
    case 'SET_EDITING_CHAIN_ID':
      return { ...state, editingChainId: action.payload };
    
    case 'SET_EDIT_FORM_DATA':
      return { ...state, editFormData: action.payload };
    
    case 'UPDATE_EDIT_FORM_NARRATOR': {
      const { index, field, value } = action.payload;
      const updatedNarrators = [...state.editFormData.narrators];
      updatedNarrators[index] = {
        ...updatedNarrators[index],
        [field]: value
      };
      return {
        ...state,
        editFormData: {
          ...state.editFormData,
          narrators: updatedNarrators
        }
      };
    }
    
    case 'UPDATE_EDIT_FORM_NARRATOR_REPUTATION': {
      const { index, reputation } = action.payload;
      const updatedNarrators = [...state.editFormData.narrators];
      updatedNarrators[index] = {
        ...updatedNarrators[index],
        reputation,
        calculatedGrade: calculateNarratorGrade(reputation)
      };
      return {
        ...state,
        editFormData: {
          ...state.editFormData,
          narrators: updatedNarrators
        }
      };
    }
    
    case 'REMOVE_EDIT_FORM_NARRATOR': {
      const updatedNarrators = state.editFormData.narrators.filter((_, i) => i !== action.payload);
      // Renumber narrators
      const renumberedNarrators = updatedNarrators.map((narrator, index) => ({
        ...narrator,
        number: index + 1
      }));
      return {
        ...state,
        editFormData: {
          ...state.editFormData,
          narrators: renumberedNarrators
        }
      };
    }
    
    case 'REORDER_EDIT_FORM_NARRATORS': {
      // Renumber narrators based on new order
      const renumberedNarrators = action.payload.map((narrator, index) => ({
        ...narrator,
        number: index + 1
      }));
      return {
        ...state,
        editFormData: {
          ...state.editFormData,
          narrators: renumberedNarrators
        }
      };
    }
    
    case 'SET_ACTIVE_NARRATOR':
      return { ...state, activeNarrator: action.payload };
    
    case 'SET_SHOW_ADD_NARRATOR':
      return { ...state, showAddNarrator: action.payload };
    
    case 'SET_NEW_NARRATOR':
      return { ...state, newNarrator: action.payload };
    
    case 'SET_API_KEY':
      return { ...state, apiKey: action.payload };
    
    case 'SET_SHOW_API_KEY_MODAL':
      return { ...state, showApiKeyModal: action.payload };
    
    case 'SET_ACTIVE_CHAIN_ID':
      return { ...state, activeChainId: action.payload };
    
    case 'SET_SHOW_IMPORT_MODAL':
      return { ...state, showImportModal: action.payload };
    
    
    case 'SET_LIBRARY_CHAINS':
      return { ...state, libraryChains: action.payload };
    
    case 'SET_IS_LOADING_LIBRARY':
      return { ...state, isLoadingLibrary: action.payload };
    
    case 'SET_SHOW_NARRATOR_MODAL':
      return { ...state, showNarratorModal: action.payload };
    
    case 'SET_SELECTED_NARRATOR_DETAILS':
      return { ...state, selectedNarratorDetails: action.payload };
    
    case 'SET_IS_LOADING_NARRATOR_DETAILS':
      return { ...state, isLoadingNarratorDetails: action.payload };
    
    case 'SET_SHOW_MATCH_CONFIRMATION_MODAL':
      return { ...state, showMatchConfirmationModal: action.payload };
    
    case 'SET_PENDING_MATCHES':
      return { ...state, pendingMatches: action.payload };
    
    case 'SET_CURRENT_MATCH_INDEX':
      return { ...state, currentMatchIndex: action.payload };
    
    case 'SET_ACCEPTED_MATCHES_COUNT':
      return { ...state, acceptedMatchesCount: action.payload };
    
    case 'SET_SELECTED_MATCH_INDEX': {
      const { matchIndex, selectedIndex } = action.payload;
      const updatedMatches = [...state.pendingMatches];
      if (updatedMatches[matchIndex]) {
        updatedMatches[matchIndex] = {
          ...updatedMatches[matchIndex],
          selectedMatchIndex: selectedIndex
        };
      }
      return { ...state, pendingMatches: updatedMatches };
    }
    
    case 'SET_NARRATOR_SEARCH_QUERY':
      return { ...state, narratorSearchQuery: action.payload };
    
    case 'SET_NARRATOR_SEARCH_RESULTS':
      return { ...state, narratorSearchResults: action.payload };
    
    case 'SET_IS_SEARCHING_NARRATORS':
      return { ...state, isSearchingNarrators: action.payload };
    
    case 'SET_SELECTED_NARRATOR_DATA':
      return { ...state, selectedNarratorData: action.payload };
    
    case 'SET_IS_LOADING_NARRATOR_DATA':
      return { ...state, isLoadingNarratorData: action.payload };
    
    case 'SET_SHOW_NARRATOR_DETAILS_MODAL':
      return { ...state, showNarratorDetailsModal: action.payload };
    
    case 'SET_NARRATOR_SEARCH_OFFSET':
      return { ...state, narratorSearchOffset: action.payload };
    
    case 'SET_NARRATOR_SEARCH_TOTAL':
      return { ...state, narratorSearchTotal: action.payload };
    
    case 'SET_SHOW_GRADE_FORMULA_TOOLTIP1':
      return { ...state, showGradeFormulaTooltip1: action.payload };
    
    case 'SET_SHOW_NARRATOR_SEARCH_MODAL':
      return { ...state, showNarratorSearchModal: action.payload };
    
    case 'SET_SEARCHING_NARRATOR_INDEX':
      return { ...state, searchingNarratorIndex: action.payload };
    
    case 'SET_SEARCHING_CHAIN_ID':
      return { ...state, searchingChainId: action.payload };
    
    case 'SET_SEARCHING_IN_EDIT_MODE':
      return { ...state, searchingInEditMode: action.payload };
    
    case 'SET_NARRATOR_SEARCH_MODAL_QUERY':
      return { ...state, narratorSearchModalQuery: action.payload };
    
    case 'SET_NARRATOR_SEARCH_MODAL_RESULTS':
      return { ...state, narratorSearchModalResults: action.payload };
    
    case 'SET_IS_SEARCHING_MODAL':
      return { ...state, isSearchingModal: action.payload };
    
    case 'SET_NARRATOR_SEARCH_MODAL_OFFSET':
      return { ...state, narratorSearchModalOffset: action.payload };
    
    case 'SET_NARRATOR_SEARCH_MODAL_TOTAL':
      return { ...state, narratorSearchModalTotal: action.payload };
    
    case 'SET_SHOW_GRADE_FORMULA_TOOLTIP2':
      return { ...state, showGradeFormulaTooltip2: action.payload };

    case 'SET_SHOW_ADD_HADITH_MODAL':
      return { ...state, showAddHadithModal: action.payload };

    case 'SET_SHOW_CONFIRMATION_MODAL':
      return { ...state, showConfirmationModal: action.payload };

    case 'SET_CONFIRMATION_MODAL_CONFIG':
      return { ...state, confirmationModalConfig: action.payload };

    case 'SET_SHOW_SESSION_NAME_MODAL':
      return { ...state, showSessionNameModal: action.payload };

    case 'SET_SESSION_NAME_MODAL_CONFIG':
      return { ...state, sessionNameModalConfig: action.payload };

    case 'RESET_STATE':
      return {
        ...initialState,
        apiKey: state.apiKey // Preserve API key
      };
    
    case 'RESET_EDIT_FORM':
      return {
        ...state,
        editingChainId: null,
        editFormData: {
          title: '',
          narrators: [],
          chainText: '',
          matn: ''
        }
      };
    
    case 'RESET_NEW_NARRATOR':
      return {
        ...state,
        newNarrator: {
          arabicName: '',
          englishName: '',
          reputation: [],
          calculatedGrade: 0
        }
      };
    
    default:
      return state;
  }
};

