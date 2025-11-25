"use client";

import { useReducer, useEffect, useCallback, useRef } from "react";
import { useTheme } from "@/contexts/ThemeContext";
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
import type { Narrator } from "@/types/hadith";

export function useHadithAnalyzer() {
  const [state, dispatch] = useReducer(hadithAnalyzerReducer, initialState);
  const { isDarkMode } = useTheme();
  const graphRef = useRef<HTMLDivElement>(null);

  // Load cached data on mount
  useEffect(() => {
    const cachedHadithText = loadCachedHadithText();
    if (cachedHadithText) {
      dispatch(actions.setHadithText(cachedHadithText));
    }

    const cachedChains = loadCachedChains();
    if (cachedChains) {
      dispatch(actions.setChains(cachedChains));
    }

    const cachedShowViz = loadCachedShowVisualization();
    if (cachedShowViz !== null) {
      dispatch(actions.setShowVisualization(cachedShowViz));
    }

    const cachedApiKey = loadCachedApiKey();
    if (cachedApiKey) {
      dispatch(actions.setApiKey(cachedApiKey));
    }

    const cachedActiveTab = loadCachedActiveTab();
    if (cachedActiveTab) {
      dispatch(actions.setActiveTab(cachedActiveTab));
    }

    const cachedSelectedChain = loadCachedSelectedChain();
    if (cachedSelectedChain !== null) {
      dispatch(actions.setSelectedChainIndex(cachedSelectedChain));
    }
  }, []);

  // Sync state to localStorage
  useEffect(() => {
    saveHadithText(state.hadithText);
  }, [state.hadithText]);

  useEffect(() => {
    saveChains(state.chains);
  }, [state.chains]);

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
    graphRef,
    isDarkMode
  };
}

