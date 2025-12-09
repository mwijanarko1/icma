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
import BasicModal from "@/components/ui/BasicModal";

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

  return (
    <>
      <BasicModal
        isOpen={show}
        onClose={onClose}
        title="Search Narrators"
        size="full"
      >
        <div className="flex-1 overflow-y-auto">
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
      </BasicModal>

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

