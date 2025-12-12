"use client";

import React, { createContext, useContext, ReactNode } from 'react';
import type { HadithAnalyzerState } from '@/types/hadithAnalyzerState';
import type { HadithAnalyzerAction } from '@/reducers/hadithAnalyzerActions';

// Context type definition
interface HadithAnalyzerContextType {
  state: HadithAnalyzerState;
  dispatch: React.Dispatch<HadithAnalyzerAction>;
  actions: typeof import('@/reducers/hadithAnalyzerActions').actions;
  extractNarrators: (text: string) => Promise<{ narrators: any[]; chainText: string; matn: string }>;
  handleNewHadith: () => void;
  handleSaveChainAnalysis: () => Promise<void>;
  isSaving: boolean;
  currentSessionName: string | null;
  // Modal management functions
  handleAcceptMatch: () => void;
  handleRejectMatch: () => void;
  handleAcceptAllMatches: () => void;
  handleRejectAllMatches: () => void;
  handleSelectMatch: (matchIndex: number, selectedIndex: number) => void;
  handleNarratorSearch: (query: string, offset: number) => void;
  handleMatchNarratorFromSearch: (narrator: any) => Promise<void>;
}

// Create the context
const HadithAnalyzerContext = createContext<HadithAnalyzerContextType | undefined>(undefined);

// Provider component
interface HadithAnalyzerProviderProps {
  children: ReactNode;
  value: HadithAnalyzerContextType;
}

export function HadithAnalyzerProvider({ children, value }: HadithAnalyzerProviderProps) {
  return (
    <HadithAnalyzerContext.Provider value={value}>
      {children}
    </HadithAnalyzerContext.Provider>
  );
}

// Hook to use the context
export function useHadithAnalyzerContext(): HadithAnalyzerContextType {
  const context = useContext(HadithAnalyzerContext);
  if (context === undefined) {
    throw new Error('useHadithAnalyzerContext must be used within a HadithAnalyzerProvider');
  }
  return context;
}

// Selector hooks for specific parts of state
export function useHadithAnalyzerState() {
  const { state } = useHadithAnalyzerContext();
  return state;
}

export function useHadithAnalyzerActions() {
  const { dispatch, actions } = useHadithAnalyzerContext();
  return { dispatch, actions };
}

export function useHadithAnalyzerChains() {
  const { state } = useHadithAnalyzerContext();
  return {
    chains: state.chains,
    selectedChainIndex: state.selectedChainIndex,
    activeChainId: state.activeChainId,
    highlightedChainIds: state.highlightedChainIds
  };
}

export function useHadithAnalyzerModal() {
  const { state } = useHadithAnalyzerContext();
  return {
    showMatchConfirmationModal: state.showMatchConfirmationModal,
    pendingMatches: state.pendingMatches,
    currentMatchIndex: state.currentMatchIndex,
    acceptedMatchesCount: state.acceptedMatchesCount,
    showNarratorModal: state.showNarratorModal,
    showNarratorDetailsModal: state.showNarratorDetailsModal,
    selectedNarratorDetails: state.selectedNarratorDetails,
    selectedNarratorData: state.selectedNarratorData,
    isLoadingNarratorDetails: state.isLoadingNarratorDetails,
    isLoadingNarratorData: state.isLoadingNarratorData,
    narratorSearchModalQuery: state.narratorSearchModalQuery,
    narratorSearchModalResults: state.narratorSearchModalResults,
    isSearchingModal: state.isSearchingModal,
    narratorSearchModalOffset: state.narratorSearchModalOffset,
    narratorSearchModalTotal: state.narratorSearchModalTotal,
    showNarratorSearchModal: state.showNarratorSearchModal
  };
}