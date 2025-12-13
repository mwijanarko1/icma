"use client";

import { useReducer, useEffect, useCallback, useRef, useState } from "react";
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
  loadCachedSessionId,
  loadCachedSessionName,
  saveHadithText,
  saveChains,
  saveShowVisualization,
  saveApiKey,
  saveActiveTab,
  saveSelectedChain,
  saveSessionId,
  saveSessionName,
  clearAllCache
} from "@/lib/cache/storage";
import { CACHE_KEYS } from "@/lib/cache/constants";
import type { Narrator } from "@/types/hadith";
import type { HadithAnalyzerState } from "@/types/hadithAnalyzerState";
import { useAuth } from "@/contexts/AuthContext";
import { saveChainSession, updateChainSessionName } from "@/lib/firebase/firestore";
import { generateMermaidCode } from "@/components/hadith-analyzer/visualization/utils";

interface RawChain {
  id: string;
  narrators: unknown[];
  hadithText: string;
  title?: string;
  collapsed?: boolean;
  [key: string]: unknown;
}

// Initialize state with cached data synchronously
function getInitialState(): { state: HadithAnalyzerState; sessionId: string | null; sessionName: string | null } {
  // Check for session to load from sessionStorage first
  let loadedSession = null;
  if (typeof window !== 'undefined') {
    const sessionData = sessionStorage.getItem("loadChainSession");
    if (sessionData) {
      try {
        loadedSession = JSON.parse(sessionData);
        sessionStorage.removeItem("loadChainSession"); // Clear after loading
      } catch (e) {
        console.error("Error parsing session data:", e);
      }
    }
  }

  // Only load from localStorage if we're on the client side and no session to load
  const cachedHadithText = loadedSession?.hadithText || (typeof window !== 'undefined' ? loadCachedHadithText() : null);
  const cachedChains = loadedSession?.chains || (typeof window !== 'undefined' ? loadCachedChains() : null);
  const cachedShowViz = typeof window !== 'undefined' ? loadCachedShowVisualization() : null;
  const cachedApiKey = typeof window !== 'undefined' ? loadCachedApiKey() : null;
  const cachedActiveTab = typeof window !== 'undefined' ? loadCachedActiveTab() : null;
  const cachedSelectedChain = typeof window !== 'undefined' ? loadCachedSelectedChain() : null;
  const cachedSessionId = loadedSession?.id || (typeof window !== 'undefined' ? loadCachedSessionId() : null);
  const cachedSessionName = loadedSession?.name || (typeof window !== 'undefined' ? loadCachedSessionName() : null);

  // Validate activeTab to ensure it matches the state type
  const validActiveTab = cachedActiveTab &&
    (cachedActiveTab === 'llm' || cachedActiveTab === 'manual' || cachedActiveTab === 'narrators' || cachedActiveTab === 'hadith' || cachedActiveTab === 'settings')
    ? cachedActiveTab
    : initialState.activeTab;

  const state = {
    ...initialState,
    hadithText: cachedHadithText || initialState.hadithText,
    chains: cachedChains || initialState.chains,
    showVisualization: cachedShowViz !== null ? cachedShowViz : initialState.showVisualization,
    apiKey: cachedApiKey || initialState.apiKey,
    activeTab: validActiveTab,
    selectedChainIndex: cachedSelectedChain !== null ? cachedSelectedChain : initialState.selectedChainIndex,
  };

  return {
    state,
    sessionId: cachedSessionId,
    sessionName: cachedSessionName
  };
}

export function useHadithAnalyzer(initialCollection?: string | null) {
  // Initialize reducer with cached state and extract session ID
  const initialStateData = getInitialState();
  const [state, dispatch] = useReducer(hadithAnalyzerReducer, initialStateData.state);
  const graphRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const prevPathnameRef = useRef<string | null>(null);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(initialStateData.sessionId);
  const [currentSessionName, setCurrentSessionName] = useState<string | null>(initialStateData.sessionName);
  const [isSaving, setIsSaving] = useState(false);
  const { user } = useAuth();

  // Manual save function
  const handleSaveChainAnalysis = async () => {
    if (!user) return;

    // Only save if there's meaningful content
    const hasContent = state.hadithText.trim().length > 0 || state.chains.length > 0;
    if (!hasContent) return;

    setIsSaving(true);
    try {
      const mermaidCode = state.chains.length > 0 ? generateMermaidCode(state.chains) : "";
      
      // Use existing session name if available, otherwise create a new one
      const sessionName = currentSessionId && currentSessionName
        ? currentSessionName  // Keep the existing session name when updating
        : `Chain Analysis - ${new Date().toLocaleDateString()}`;  // Create a new session with a default name

      const sessionId = await saveChainSession(
        user.uid,
        {
          name: sessionName,
          hadithText: state.hadithText,
          chains: state.chains,
          mermaidCode,
        },
        currentSessionId || undefined
      );

      if (sessionId && sessionId !== currentSessionId) {
        setCurrentSessionId(sessionId);
        // If this is a new session, cache the name
        if (!currentSessionId) {
          setCurrentSessionName(sessionName);
        }
      }
    } catch (error) {
      console.error("Error saving chain session:", error);
    } finally {
      setIsSaving(false);
    }
  };

  // Load Intention-Hadith collection if specified
  useEffect(() => {
    if (initialCollection === 'intention') {
      const loadIntentionCollection = async () => {
        try {
          // Reset state first to clear any existing chains
          dispatch(actions.resetState());

          const response = await fetch('/chains/Intention-Hadith.json');
          if (response.ok) {
            const data = await response.json();
            if (data.chains && Array.isArray(data.chains)) {
              // Transform the chains to match the Chain interface
              const transformedChains = data.chains.map((chain: RawChain) => ({
                ...chain,
                chainText: chain.hadithText || '', // Map hadithText to chainText
                matn: '' // For now, leave matn empty as the JSON doesn't separate it
              }));
              dispatch(actions.setChains(transformedChains));
              // Clear any existing hadith text since we're loading a collection
              dispatch(actions.setHadithText(''));
            }
          }
        } catch (error) {
          console.error('Failed to load Intention-Hadith collection:', error);
        }
      };

      loadIntentionCollection();
    }
  }, [initialCollection, dispatch]);

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

  useEffect(() => {
    if (currentSessionId) {
      saveSessionId(currentSessionId);
    } else {
      // Clear session ID from cache when it's null
      try {
        localStorage.removeItem(CACHE_KEYS.SESSION_ID);
      } catch (error) {
        console.warn('Failed to clear cached session ID:', error);
      }
    }
  }, [currentSessionId]);

  useEffect(() => {
    if (currentSessionName) {
      saveSessionName(currentSessionName);
    } else {
      // Clear session name from cache when it's null
      try {
        localStorage.removeItem(CACHE_KEYS.SESSION_NAME);
      } catch (error) {
        console.warn('Failed to clear cached session name:', error);
      }
    }
  }, [currentSessionName]);

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

  const handleNewHadith = useCallback(async () => {
    setCurrentSessionId(null);
    setCurrentSessionName(null);
    dispatch(actions.resetState());
  }, []);

  // Rename session handler
  const handleRenameSession = async (newName: string) => {
    if (!currentSessionId || !user) return;

    try {
      await updateChainSessionName(currentSessionId, newName);
      setCurrentSessionName(newName);
      // Update cached session name
      saveSessionName(newName);
    } catch (error) {
      console.error("Error renaming session:", error);
      alert("Failed to rename session. Please try again.");
    }
  };

  return {
    state,
    dispatch,
    actions,
    extractNarrators,
    handleClearCache,
    handleNewHadith,
    handleRenameSession,
    graphRef,
    currentSessionId,
    currentSessionName,
    handleSaveChainAnalysis,
    isSaving,
  };
}

