import { CACHE_KEYS } from './constants';
import type { Chain } from '@/types/hadith';
import type { SelectedHadith, Step } from '@/types/analysis';

// Load cached hadith text
export const loadCachedHadithText = (): string | null => {
  try {
    return localStorage.getItem(CACHE_KEYS.HADITH_TEXT);
  } catch (error) {
    console.warn('Failed to load cached hadith text:', error);
    return null;
  }
};

// Save hadith text to cache
export const saveHadithText = (text: string): void => {
  try {
    localStorage.setItem(CACHE_KEYS.HADITH_TEXT, text);
  } catch (error) {
    console.warn('Failed to cache hadith text:', error);
  }
};

// Load cached chains
export const loadCachedChains = (): Chain[] | null => {
  try {
    const cachedChains = localStorage.getItem(CACHE_KEYS.CHAINS);
    if (cachedChains) {
      const parsedChains = JSON.parse(cachedChains);
      // Ensure backward compatibility by adding missing properties
      return parsedChains.map((chain: Chain, index: number) => ({
        ...chain,
        title: chain.title || `Chain ${index + 1}`,
        collapsed: chain.collapsed || false
      }));
    }
    return null;
  } catch (error) {
    console.warn('Failed to load cached chains:', error);
    return null;
  }
};

// Save chains to cache
export const saveChains = (chains: Chain[]): void => {
  try {
    localStorage.setItem(CACHE_KEYS.CHAINS, JSON.stringify(chains));
  } catch (error) {
    console.warn('Failed to cache chains:', error);
  }
};

// Load cached visualization state
export const loadCachedShowVisualization = (): boolean | null => {
  try {
    const cached = localStorage.getItem(CACHE_KEYS.SHOW_VISUALIZATION);
    return cached ? JSON.parse(cached) : null;
  } catch (error) {
    console.warn('Failed to load cached visualization state:', error);
    return null;
  }
};

// Save visualization state to cache
export const saveShowVisualization = (show: boolean): void => {
  try {
    localStorage.setItem(CACHE_KEYS.SHOW_VISUALIZATION, JSON.stringify(show));
  } catch (error) {
    console.warn('Failed to cache visualization state:', error);
  }
};

// Load cached API key
export const loadCachedApiKey = (): string | null => {
  try {
    return localStorage.getItem(CACHE_KEYS.API_KEY);
  } catch (error) {
    console.warn('Failed to load cached API key:', error);
    return null;
  }
};

// Save API key to cache
export const saveApiKey = (apiKey: string): void => {
  try {
    if (apiKey) {
      localStorage.setItem(CACHE_KEYS.API_KEY, apiKey);
    } else {
      localStorage.removeItem(CACHE_KEYS.API_KEY);
    }
  } catch (error) {
    console.warn('Failed to cache API key:', error);
  }
};

// Load cached active tab
export const loadCachedActiveTab = (): 'llm' | 'manual' | 'narrators' | 'hadith' | null => {
  try {
    const cached = localStorage.getItem(CACHE_KEYS.ACTIVE_TAB);
    if (cached && (cached === 'llm' || cached === 'manual' || cached === 'narrators' || cached === 'hadith')) {
      return cached as 'llm' | 'manual' | 'narrators' | 'hadith';
    }
    return null;
  } catch (error) {
    console.warn('Failed to load cached active tab:', error);
    return null;
  }
};

// Save active tab to cache
export const saveActiveTab = (tab: 'llm' | 'manual' | 'narrators' | 'hadith'): void => {
  try {
    localStorage.setItem(CACHE_KEYS.ACTIVE_TAB, tab);
  } catch (error) {
    console.warn('Failed to cache active tab:', error);
  }
};

// Load cached selected chain index
export const loadCachedSelectedChain = (): number | null => {
  try {
    const cached = localStorage.getItem(CACHE_KEYS.SELECTED_CHAIN);
    if (cached) {
      const parsedIndex = parseInt(cached);
      if (!isNaN(parsedIndex)) {
        return parsedIndex;
      }
    }
    return null;
  } catch (error) {
    console.warn('Failed to load cached selected chain:', error);
    return null;
  }
};

// Save selected chain index to cache
export const saveSelectedChain = (index: number): void => {
  try {
    localStorage.setItem(CACHE_KEYS.SELECTED_CHAIN, index.toString());
  } catch (error) {
    console.warn('Failed to cache selected chain:', error);
  }
};

// Load cached analysis selected hadiths
export const loadCachedAnalysisSelectedHadiths = (): SelectedHadith[] | null => {
  try {
    const cached = localStorage.getItem(CACHE_KEYS.ANALYSIS_SELECTED_HADITHS);
    if (cached) {
      const parsed = JSON.parse(cached);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
    return null;
  } catch (error) {
    console.warn('Failed to load cached analysis selected hadiths:', error);
    return null;
  }
};

// Save analysis selected hadiths to cache
export const saveAnalysisSelectedHadiths = (hadiths: SelectedHadith[]): void => {
  try {
    localStorage.setItem(CACHE_KEYS.ANALYSIS_SELECTED_HADITHS, JSON.stringify(hadiths));
  } catch (error) {
    console.warn('Failed to cache analysis selected hadiths:', error);
  }
};

// Load cached analysis active step
export const loadCachedAnalysisActiveStep = (): number | null => {
  try {
    const cached = localStorage.getItem(CACHE_KEYS.ANALYSIS_ACTIVE_STEP);
    if (cached) {
      const parsed = parseInt(cached);
      if (!isNaN(parsed) && parsed >= 1 && parsed <= 8) {
        return parsed;
      }
    }
    return null;
  } catch (error) {
    console.warn('Failed to load cached analysis active step:', error);
    return null;
  }
};

// Save analysis active step to cache
export const saveAnalysisActiveStep = (step: number): void => {
  try {
    localStorage.setItem(CACHE_KEYS.ANALYSIS_ACTIVE_STEP, step.toString());
  } catch (error) {
    console.warn('Failed to cache analysis active step:', error);
  }
};

// Load cached analysis steps status
export const loadCachedAnalysisStepsStatus = (): Step[] | null => {
  try {
    const cached = localStorage.getItem(CACHE_KEYS.ANALYSIS_STEPS_STATUS);
    if (cached) {
      const parsed = JSON.parse(cached);
      if (Array.isArray(parsed) && parsed.length === 8) {
        return parsed;
      }
    }
    return null;
  } catch (error) {
    console.warn('Failed to load cached analysis steps status:', error);
    return null;
  }
};

// Save analysis steps status to cache
export const saveAnalysisStepsStatus = (steps: Step[]): void => {
  try {
    localStorage.setItem(CACHE_KEYS.ANALYSIS_STEPS_STATUS, JSON.stringify(steps));
  } catch (error) {
    console.warn('Failed to cache analysis steps status:', error);
  }
};

// Clear all cache
export const clearAllCache = (): void => {
  try {
    localStorage.removeItem(CACHE_KEYS.HADITH_TEXT);
    localStorage.removeItem(CACHE_KEYS.CHAINS);
    localStorage.removeItem(CACHE_KEYS.SHOW_VISUALIZATION);
    localStorage.removeItem(CACHE_KEYS.ACTIVE_TAB);
    localStorage.removeItem(CACHE_KEYS.SELECTED_CHAIN);
    localStorage.removeItem(CACHE_KEYS.ANALYSIS_SELECTED_HADITHS);
    localStorage.removeItem(CACHE_KEYS.ANALYSIS_ACTIVE_STEP);
    localStorage.removeItem(CACHE_KEYS.ANALYSIS_STEPS_STATUS);
    // Note: API_KEY is intentionally NOT cleared
  } catch (error) {
    console.warn('Failed to clear cache:', error);
  }
};

