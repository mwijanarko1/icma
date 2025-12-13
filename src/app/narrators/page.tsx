"use client";

import { Suspense, useReducer, useMemo, useCallback, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { NarratorsTab } from "@/components/hadith-analyzer/input/NarratorsTab";
import { NarratorDetailsModal } from "@/components/hadith-analyzer/narrators/NarratorDetailsModal";
import { createNarratorService } from "@/services/narratorService";
import { generateMermaidCode } from "@/components/hadith-analyzer/visualization/utils";
import { hadithAnalyzerReducer } from "@/reducers/hadithAnalyzerReducer";
import { initialState } from "@/types/hadithAnalyzerState";
import { actions } from "@/reducers/hadithAnalyzerActions";
import Header from "@/components/Header";

function NarratorsPageContent() {
  const searchParams = useSearchParams();
  const [narratorState, narratorDispatch] = useReducer(hadithAnalyzerReducer, initialState);

  
  // Create narrator service
  const narratorService = useMemo(
    () => createNarratorService(narratorState, narratorDispatch, actions, generateMermaidCode),
    [narratorState, narratorDispatch]
  );
  
  // Search narrators function
  const searchNarrators = useCallback(
    async (query: string, offset: number = 0, ranks?: string[], narratorRanks?: string[], placesOfResidence?: string[]) => {
      await narratorService.handleSearchNarrators(query, offset, ranks, narratorRanks, placesOfResidence);
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

  // Handle ID parameter from URL
  useEffect(() => {
    const narratorId = searchParams.get('id');
    if (narratorId && !narratorState.showNarratorDetailsModal) {
      fetchNarratorDetails(narratorId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);
  
  // Debounced search
  const lastNarratorTabSearchRef = useRef<string>('');
  
  useEffect(() => {
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
  }, [narratorState.narratorSearchQuery]);

  return (
    <div 
      className="min-h-screen relative flex flex-col" 
      style={{ 
        backgroundColor: '#f2e9dd', 
        color: '#000000',
      }}
    >
      <Header />
      
      {/* Narrator Details Modal */}
      <NarratorDetailsModal
        show={narratorState.showNarratorDetailsModal}
        narrator={narratorState.selectedNarratorData}
        isLoading={narratorState.isLoadingNarratorData}
        onClose={() => narratorDispatch(actions.setShowNarratorDetailsModal(false))}
      />
      
      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto px-2 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-8">
          <NarratorsTab
            narratorSearchQuery={narratorState.narratorSearchQuery}
            onNarratorSearchQueryChange={(query) => narratorDispatch(actions.setNarratorSearchQuery(query))}
            narratorSearchResults={narratorState.narratorSearchResults}
            isSearchingNarrators={narratorState.isSearchingNarrators}
            narratorSearchTotal={narratorState.narratorSearchTotal}
            narratorSearchOffset={narratorState.narratorSearchOffset}
            onSearchNarrators={searchNarrators}
            onFetchNarratorDetails={fetchNarratorDetails}
            onPresetSearch={(criteria) => {
              // Handle "Search All Narrators" button
              if (criteria.isSearchAll) {
                const currentNarratorService = createNarratorService(narratorState, narratorDispatch, actions, generateMermaidCode);
                currentNarratorService.handleSearchNarrators('', 0, undefined, undefined, undefined, true);
                return;
              }

              // For preset filters, if we have no existing results, search with the criteria directly
              if (narratorState.narratorSearchResults.length === 0) {
                // No existing results, so search with the preset criteria
                const currentNarratorService = createNarratorService(narratorState, narratorDispatch, actions, generateMermaidCode);
                currentNarratorService.handleSearchNarrators(criteria.query || '', 0, criteria.ranks, criteria.narratorRanks, criteria.placesOfResidence);
                return;
              }

              // We have existing results to filter - apply client-side filtering
              let filteredResults = [...narratorState.narratorSearchResults];

              // Apply reliability filtering
              if (criteria.ranks && criteria.ranks.length > 0) {
                filteredResults = filteredResults.filter(narrator => {
                  const ibnHajarRank = narrator.ibnHajarRank?.toLowerCase() || '';
                  const dhahabiRank = narrator.dhahabiRank?.toLowerCase() || '';
                  const combinedRanks = `${ibnHajarRank} ${dhahabiRank}`;

                  return criteria.ranks!.some(rank => {
                    switch (rank) {
                      case 'sahaba':
                        return combinedRanks.includes('صحابي') || combinedRanks.includes('صحبة');
                      case 'thiqah':
                        return combinedRanks.includes('ثقة');
                      case 'saduq':
                        return combinedRanks.includes('صدوق');
                      case 'daif':
                        return combinedRanks.includes('ضعيف');
                      default:
                        return false;
                    }
                  });
                });
              }

              // Apply rank filtering
              if (criteria.narratorRanks && criteria.narratorRanks.length > 0) {
                filteredResults = filteredResults.filter(narrator => {
                  const narratorRank = narrator.taqribCategory || '';
                  return criteria.narratorRanks!.some(rankFilter => {
                    if (rankFilter.includes('|')) {
                      const rankOptions = rankFilter.split('|');
                      return rankOptions.some(r => narratorRank.includes(r.trim()));
                    }
                    return narratorRank.includes(rankFilter);
                  });
                });
              }

              // Apply place filtering
              if (criteria.placesOfResidence && criteria.placesOfResidence.length > 0) {
                filteredResults = filteredResults.filter(narrator => {
                  const placeOfResidence = narrator.placeOfResidence || '';
                  return criteria.placesOfResidence!.some(placeFilter => {
                    if (placeFilter.includes('|')) {
                      const placeOptions = placeFilter.split('|');
                      return placeOptions.some(p => placeOfResidence.includes(p.trim()));
                    }
                    return placeOfResidence.includes(placeFilter);
                  });
                });
              }

              // Update the results in state
              narratorDispatch(actions.setNarratorSearchResults(filteredResults));
              narratorDispatch(actions.setNarratorSearchTotal(filteredResults.length));
              narratorDispatch(actions.setNarratorSearchOffset(0));
            }}
          />
        </div>
      </main>
    </div>
  );
}

export default function NarratorsPage() {
  return (
    <Suspense fallback={
      <div 
        className="min-h-screen relative flex flex-col" 
        style={{ 
          backgroundColor: '#f2e9dd', 
          color: '#000000',
        }}
      >
        <Header />
        <main className="flex-1 overflow-y-auto flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-black border-t-transparent"></div>
            <p className="mt-4" style={{ fontFamily: 'var(--font-content)', color: '#000000', opacity: 0.7 }}>
              Loading...
            </p>
          </div>
        </main>
      </div>
    }>
      <NarratorsPageContent />
    </Suspense>
  );
}

