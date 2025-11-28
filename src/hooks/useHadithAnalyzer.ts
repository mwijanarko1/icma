"use client";

import { useReducer, useEffect, useCallback, useRef } from "react";
import { usePathname } from "next/navigation";
import { hadithAnalyzerReducer } from "@/reducers/hadithAnalyzerReducer";
import { initialState } from "@/types/hadithAnalyzerState";
import { actions } from "@/reducers/hadithAnalyzerActions";
import { calculateNarratorGrade } from "@/lib/grading/calculator";
import {
  loadCachedHadithText,
  loadCachedChains,
  loadCachedShowVisualization,
  loadCachedApiKey,
  loadCachedActiveTab,
  loadCachedSelectedChain,
  saveHadithText,
  saveChains,
  saveShowVisualization,
  saveApiKey,
  saveActiveTab,
  saveSelectedChain,
  clearAllCache
} from "@/lib/cache/storage";
import { CACHE_KEYS } from "@/lib/cache/constants";
import type { Narrator } from "@/types/hadith";
import type { HadithAnalyzerState } from "@/types/hadithAnalyzerState";

// Initialize state with cached data synchronously
function getInitialState(): HadithAnalyzerState {
  const cachedHadithText = loadCachedHadithText();
  const cachedChains = loadCachedChains();
  const cachedShowViz = loadCachedShowVisualization();
  const cachedApiKey = loadCachedApiKey();
  const cachedActiveTab = loadCachedActiveTab();
  const cachedSelectedChain = loadCachedSelectedChain();

  // Validate activeTab to ensure it matches the state type
  const validActiveTab = cachedActiveTab && 
    (cachedActiveTab === 'llm' || cachedActiveTab === 'manual' || cachedActiveTab === 'narrators' || cachedActiveTab === 'hadith' || cachedActiveTab === 'settings')
    ? cachedActiveTab
    : initialState.activeTab;

  return {
    ...initialState,
    hadithText: cachedHadithText || initialState.hadithText,
    chains: cachedChains || initialState.chains,
    showVisualization: cachedShowViz !== null ? cachedShowViz : initialState.showVisualization,
    apiKey: cachedApiKey || initialState.apiKey,
    activeTab: validActiveTab,
    selectedChainIndex: cachedSelectedChain !== null ? cachedSelectedChain : initialState.selectedChainIndex,
  };
}

export function useHadithAnalyzer() {
  // Initialize reducer with cached state
  const [state, dispatch] = useReducer(hadithAnalyzerReducer, undefined, getInitialState);
  const graphRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const prevPathnameRef = useRef<string | null>(null);

  // Sync state to localStorage
  useEffect(() => {
    saveHadithText(state.hadithText);
  }, [state.hadithText]);

  useEffect(() => {
    saveChains(state.chains);
  }, [state.chains]);

  // Save all critical state before page unload/navigation to ensure persistence
  useEffect(() => {
    const saveAllState = () => {
      try {
        // Save all critical state synchronously
        localStorage.setItem(CACHE_KEYS.HADITH_TEXT, state.hadithText);
        localStorage.setItem(CACHE_KEYS.CHAINS, JSON.stringify(state.chains));
        localStorage.setItem(CACHE_KEYS.SHOW_VISUALIZATION, JSON.stringify(state.showVisualization));
        if (state.apiKey) {
          localStorage.setItem(CACHE_KEYS.API_KEY, state.apiKey);
        }
        localStorage.setItem(CACHE_KEYS.ACTIVE_TAB, state.activeTab);
        localStorage.setItem(CACHE_KEYS.SELECTED_CHAIN, state.selectedChainIndex.toString());
      } catch (error) {
        console.warn('Failed to save state on navigation:', error);
      }
    };

    const handleBeforeUnload = () => {
      saveAllState();
    };

    // Listen for beforeunload (browser navigation/refresh)
    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      // Save state on unmount as well
      saveAllState();
    };
  }, [state.hadithText, state.chains, state.showVisualization, state.apiKey, state.activeTab, state.selectedChainIndex]);

  // Save state when route changes (Next.js client-side navigation)
  useEffect(() => {
    // If pathname changed and we had a previous pathname, save state before navigation
    if (prevPathnameRef.current !== null && prevPathnameRef.current !== pathname) {
      try {
        localStorage.setItem(CACHE_KEYS.HADITH_TEXT, state.hadithText);
        localStorage.setItem(CACHE_KEYS.CHAINS, JSON.stringify(state.chains));
        localStorage.setItem(CACHE_KEYS.SHOW_VISUALIZATION, JSON.stringify(state.showVisualization));
        if (state.apiKey) {
          localStorage.setItem(CACHE_KEYS.API_KEY, state.apiKey);
        }
        localStorage.setItem(CACHE_KEYS.ACTIVE_TAB, state.activeTab);
        localStorage.setItem(CACHE_KEYS.SELECTED_CHAIN, state.selectedChainIndex.toString());
      } catch (error) {
        console.warn('Failed to save state on route change:', error);
      }
    }
    prevPathnameRef.current = pathname;
  }, [pathname, state.hadithText, state.chains, state.showVisualization, state.apiKey, state.activeTab, state.selectedChainIndex]);

  useEffect(() => {
    saveShowVisualization(state.showVisualization);
  }, [state.showVisualization]);

  useEffect(() => {
    saveApiKey(state.apiKey);
  }, [state.apiKey]);

  useEffect(() => {
    saveActiveTab(state.activeTab);
  }, [state.activeTab]);

  useEffect(() => {
    saveSelectedChain(state.selectedChainIndex);
  }, [state.selectedChainIndex]);

  // Extract narrators from text
  const extractNarrators = useCallback(async (text: string): Promise<{ narrators: Narrator[]; chainText: string; matn: string }> => {
    if (!state.apiKey) {
      throw new Error('Please add your Google Gemini API key in settings to use this feature.');
    }

    try {
      const response = await fetch('/api/extract-narrators', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          hadithText: text,
          apiKey: state.apiKey
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to extract narrators');
      }

      const data = await response.json();
      
      // Process narrators: ensure reputation grades are converted to calculatedGrade
      const narrators = (data.narrators || []).map((narrator: Narrator) => {
        // If reputation is set but calculatedGrade is not, calculate it
        if (narrator.reputation && narrator.reputation.length > 0 && !narrator.calculatedGrade) {
          narrator.calculatedGrade = calculateNarratorGrade(narrator.reputation);
        }
        return narrator;
      });
      
      return {
        narrators,
        chainText: data.chainText || '',
        matn: data.matn || ''
      };
    } catch (error) {
      console.error('Error extracting narrators:', error);
      throw error;
    }
  }, [state.apiKey]);

  // Handler functions
  const handleClearCache = useCallback(() => {
    clearAllCache();
    dispatch(actions.resetState());
  }, []);

  const handleNewHadith = useCallback(() => {
    const hasChains = state.chains.length > 0;
    const hasHadithText = state.hadithText.trim().length > 0;

    if (hasChains || hasHadithText) {
      const confirmed = window.confirm(
        'Are you sure you want to start a new hadith? This will delete all current chains and clear all data. This action cannot be undone.'
      );

      if (!confirmed) {
        return;
      }
    }

    dispatch(actions.resetState());
  }, [state.chains.length, state.hadithText]);

  return {
    state,
    dispatch,
    actions,
    extractNarrators,
    handleClearCache,
    handleNewHadith,
    graphRef
  };
}

