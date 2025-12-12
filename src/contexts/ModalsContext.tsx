"use client";

import React, { createContext, useContext, ReactNode } from 'react';
import type { Narrator } from '@/data/types';

interface ModalsContextValue {
  // API Key Modal
  apiKey: string;
  showApiKeyModal: boolean;
  setApiKey: (key: string) => void;
  setShowApiKeyModal: (show: boolean) => void;

  // Narrator Details Modal
  showNarratorModal: boolean;
  showNarratorDetailsModal: boolean;
  selectedNarratorDetails: Narrator | null;
  selectedNarratorData: Narrator | null;
  isLoadingNarratorDetails: boolean;
  isLoadingNarratorData: boolean;
  setShowNarratorModal: (show: boolean) => void;
  setShowNarratorDetailsModal: (show: boolean) => void;
  setSelectedNarratorDetails: (narrator: Narrator | null) => void;
  setSelectedNarratorData: (narrator: Narrator | null) => void;
  setIsLoadingNarratorDetails: (loading: boolean) => void;
  setIsLoadingNarratorData: (loading: boolean) => void;

  // Match Confirmation Modal
  showMatchConfirmationModal: boolean;
  pendingMatches: any[];
  currentMatchIndex: number;
  acceptedMatchesCount: number;
  setShowMatchConfirmationModal: (show: boolean) => void;
  setPendingMatches: (matches: any[]) => void;
  setCurrentMatchIndex: (index: number) => void;
  setAcceptedMatchesCount: (count: number) => void;

  // Narrator Search Modal
  showNarratorSearchModal: boolean;
  narratorSearchModalQuery: string;
  narratorSearchModalResults: any[];
  isSearchingModal: boolean;
  narratorSearchModalOffset: number;
  narratorSearchModalTotal: number;
  setShowNarratorSearchModal: (show: boolean) => void;
  setNarratorSearchModalQuery: (query: string) => void;
  setNarratorSearchModalResults: (results: any[]) => void;
  setIsSearchingModal: (searching: boolean) => void;
  setNarratorSearchModalOffset: (offset: number) => void;
  setNarratorSearchModalTotal: (total: number) => void;
}

const ModalsContext = createContext<ModalsContextValue | undefined>(undefined);

interface ModalsProviderProps {
  children: ReactNode;
  value: ModalsContextValue;
}

export function ModalsProvider({ children, value }: ModalsProviderProps) {
  return (
    <ModalsContext.Provider value={value}>
      {children}
    </ModalsContext.Provider>
  );
}

export function useModals() {
  const context = useContext(ModalsContext);
  if (context === undefined) {
    throw new Error('useModals must be used within a ModalsProvider');
  }
  return context;
}
