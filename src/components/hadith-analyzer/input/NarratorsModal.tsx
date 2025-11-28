"use client";

import { useMemo, useCallback, useEffect, useRef } from "react";
import { NarratorsTab } from "./NarratorsTab";
import { NarratorDetailsModal } from "../narrators/NarratorDetailsModal";
import { createNarratorService } from "@/services/narratorService";
import { generateMermaidCode } from "../visualization/utils";
import { useReducer } from "react";
import { hadithAnalyzerReducer } from "@/reducers/hadithAnalyzerReducer";
import { initialState } from "@/types/hadithAnalyzerState";
import { actions } from "@/reducers/hadithAnalyzerActions";

interface NarratorsModalProps {
  show: boolean;
  onClose: () => void;
}

export function NarratorsModal({ show, onClose }: NarratorsModalProps) {
  const [narratorState, narratorDispatch] = useReducer(hadithAnalyzerReducer, initialState);
  
  // Create narrator service
  const narratorService = useMemo(
    () => createNarratorService(narratorState, narratorDispatch, actions, generateMermaidCode),
    [narratorState, narratorDispatch]
  );
  
  // Search narrators function
  const searchNarrators = useCallback(
    async (query: string, offset: number = 0) => {
      await narratorService.handleSearchNarrators(query, offset);
    },
    [narratorService]
  );

  // Fetch narrator details
  const fetchNarratorDetails = useCallback(
    async (narratorId: string) => {
      await narratorService.handleFetchNarratorDetails(narratorId);
    },
    [narratorService]
  );
  
  // Debounced search
  const lastNarratorTabSearchRef = useRef<string>('');
  
  useEffect(() => {
    if (!show) return;
    
    const trimmedQuery = narratorState.narratorSearchQuery.trim();
    
    // Only search if query actually changed
    if (trimmedQuery.length >= 2 && trimmedQuery !== lastNarratorTabSearchRef.current) {
      lastNarratorTabSearchRef.current = trimmedQuery;
      const timeoutId = setTimeout(() => {
        // Create service with current state to avoid stale closures
        const currentNarratorService = createNarratorService(narratorState, narratorDispatch, actions, generateMermaidCode);
        currentNarratorService.handleSearchNarrators(trimmedQuery, 0);
      }, 300);

      return () => clearTimeout(timeoutId);
    } else if (trimmedQuery.length < 2) {
      lastNarratorTabSearchRef.current = '';
      narratorDispatch(actions.setNarratorSearchResults([]));
      narratorDispatch(actions.setNarratorSearchTotal(0));
      narratorDispatch(actions.setNarratorSearchOffset(0));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [narratorState.narratorSearchQuery, show]);

  if (!show) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4">
        <div 
          className="relative w-full max-w-6xl max-h-[95vh] sm:max-h-[90vh] rounded-xl sm:rounded-2xl border-2 border-black bg-white overflow-hidden flex flex-col"
          style={{ boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(0, 0, 0, 0.1)' }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 sm:p-6 border-b-2 border-black">
            <h2 className="text-xl sm:text-2xl font-bold" style={{ fontFamily: 'var(--font-title)', color: '#000000' }}>
              Search Narrators
            </h2>
            <button
              onClick={onClose}
              className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-lg transition-colors"
              style={{ color: '#000000' }}
            >
              <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          {/* Content */}
          <div className="flex-1 overflow-y-auto p-3 sm:p-4 md:p-6">
            <NarratorsTab
              narratorSearchQuery={narratorState.narratorSearchQuery}
              onNarratorSearchQueryChange={(query) => narratorDispatch(actions.setNarratorSearchQuery(query))}
              narratorSearchResults={narratorState.narratorSearchResults}
              isSearchingNarrators={narratorState.isSearchingNarrators}
              narratorSearchTotal={narratorState.narratorSearchTotal}
              narratorSearchOffset={narratorState.narratorSearchOffset}
              onSearchNarrators={searchNarrators}
              onFetchNarratorDetails={fetchNarratorDetails}
            />
          </div>
        </div>
      </div>
      
      {/* Narrator Details Modal */}
      <NarratorDetailsModal
        show={narratorState.showNarratorDetailsModal}
        narrator={narratorState.selectedNarratorData}
        isLoading={narratorState.isLoadingNarratorData}
        onClose={() => narratorDispatch(actions.setShowNarratorDetailsModal(false))}
      />
    </>
  );
}

