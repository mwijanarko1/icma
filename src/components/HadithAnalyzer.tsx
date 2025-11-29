// BACKUP - don't delete

"use client";

import { useEffect, useMemo, useRef } from "react";
import { CACHE_KEYS } from '@/lib/cache/constants';
import { generateMermaidCode } from '@/components/hadith-analyzer/visualization/utils';
import { createChainService } from '@/services/chainService';
import { createNarratorService } from '@/services/narratorService';
import { ApiKeyModal } from '@/components/hadith-analyzer/settings/ApiKeyModal';
import { DraggableChain } from '@/components/hadith-analyzer/chains/DraggableChain';
import { ChainDragOverlay } from '@/components/hadith-analyzer/chains/ChainDragOverlay';
import { MatchConfirmationModal } from '@/components/hadith-analyzer/matching/MatchConfirmationModal';
import { ChainCollectionsModal } from '@/components/hadith-analyzer/import/ChainCollectionsModal';
import { NarratorDetailsModal } from '@/components/hadith-analyzer/narrators/NarratorDetailsModal';
import { NarratorSearchModal } from '@/components/hadith-analyzer/narrators/NarratorSearchModal';
import { InputTabs, LLMTab, ManualTab, SettingsTab, AddHadithFromDatabaseModal } from '@/components/hadith-analyzer/input';
import { useHadithAnalyzer } from '@/hooks/useHadithAnalyzer';
import { MermaidGraph } from '@/components/hadith-analyzer/visualization/MermaidGraph';
import {
  DndContext,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';

// All duplicate code removed - using imports from extracted modules

export default function HadithAnalyzer() {
  const {
    state,
    dispatch,
    actions,
    extractNarrators,
    handleNewHadith,
  } = useHadithAnalyzer();

  // Destructure state for easier access
  const {
    hadithText,
    chains,
    mermaidCode,
    showVisualization,
    isLoading,
    error,
    editingChainId,
    showAddNarrator,
    newNarrator,
    apiKey,
    showApiKeyModal,
    activeTab,
    selectedChainIndex,
    activeChainId,
    highlightedChainIds,
    showImportModal,
    libraryChains,
    isLoadingLibrary,
    showNarratorModal,
    selectedNarratorDetails,
    isLoadingNarratorDetails,
    showMatchConfirmationModal,
    pendingMatches,
    currentMatchIndex,
    acceptedMatchesCount,
    narratorSearchQuery,
    selectedNarratorData,
    isLoadingNarratorData,
    showNarratorDetailsModal,
    showNarratorSearchModal,
    narratorSearchModalQuery,
    narratorSearchModalResults,
    isSearchingModal,
    narratorSearchModalOffset,
    narratorSearchModalTotal,
    showAddHadithModal
  } = state;

  // Create service instances (memoized to prevent recreation on every render)
  const chainService = useMemo(
    () => createChainService(state, dispatch, actions),
    [state, dispatch, actions]
  );
  const narratorService = useMemo(
    () => createNarratorService(state, dispatch, actions, generateMermaidCode),
    [state, dispatch, actions]
  );


  // Wrapper for extractNarrators that handles the result and returns void
  const handleExtractNarrators = async (text: string): Promise<void> => {
    await chainService.handleExtractNarrators(extractNarrators, text);
  };

  // Drag and drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );






  // Debounced search with minimum character requirement
  // Use a ref to track the last query to prevent duplicate searches
  const lastNarratorTabSearchRef = useRef<string>('');
  
  useEffect(() => {
    const trimmedQuery = narratorSearchQuery.trim();
    
    // Only search if query actually changed
    if (trimmedQuery.length >= 2 && trimmedQuery !== lastNarratorTabSearchRef.current) {
      lastNarratorTabSearchRef.current = trimmedQuery;
      const timeoutId = setTimeout(() => {
        // Create service with current state to avoid stale closures
        const currentNarratorService = createNarratorService(state, dispatch, actions, generateMermaidCode);
        currentNarratorService.handleSearchNarrators(trimmedQuery, 0);
      }, 300);

      return () => clearTimeout(timeoutId);
    } else if (trimmedQuery.length < 2) {
      lastNarratorTabSearchRef.current = '';
      dispatch(actions.setNarratorSearchResults([]));
      dispatch(actions.setNarratorSearchTotal(0));
      dispatch(actions.setNarratorSearchOffset(0));
    }
    // Only depend on query - state is accessed from closure
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [narratorSearchQuery]);



























  // Handler to open narrator search modal

  // Handler to match narrator from search

  // Search narrators when query changes in modal
  // Use a ref to track the last query to prevent duplicate searches
  const lastSearchQueryRef = useRef<string>('');
  
  useEffect(() => {
    // Only search if query actually changed and modal is open
    if (showNarratorSearchModal && narratorSearchModalQuery.trim() && narratorSearchModalQuery !== lastSearchQueryRef.current) {
      lastSearchQueryRef.current = narratorSearchModalQuery;
      // Use a shorter debounce for initial search, longer for subsequent changes
      const timeoutId = setTimeout(() => {
        // Create service with current state to avoid stale closures
        const currentNarratorService = createNarratorService(state, dispatch, actions, generateMermaidCode);
        currentNarratorService.handleSearchNarratorsModal(narratorSearchModalQuery, 0);
      }, 100); // Shorter debounce for better UX
      return () => clearTimeout(timeoutId);
    } else if (showNarratorSearchModal && !narratorSearchModalQuery.trim()) {
      lastSearchQueryRef.current = '';
      dispatch(actions.setNarratorSearchModalResults([]));
      dispatch(actions.setNarratorSearchModalTotal(0));
    }
    // Only depend on query and modal visibility - state is accessed from closure
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [narratorSearchModalQuery, showNarratorSearchModal]);

  // Handler for adding hadith from database
  const handleAddHadithsFromDatabase = (hadiths: Array<{
    hadith_number: number;
    sub_version?: string;
    reference: string;
    english_narrator?: string;
    english_translation: string;
    arabic_text: string;
    in_book_reference?: string;
    collection: string;
  }>) => {
    try {
      dispatch(actions.setIsLoading(true));
      dispatch(actions.setError(null));

      if (hadiths.length === 0) {
        throw new Error('No hadith selected');
      }

      // Use the first selected hadith's Arabic text
      const firstHadith = hadiths[0];
      const hadithText = firstHadith.arabic_text;

      // Set the hadith text and close modal
      dispatch(actions.setHadithText(hadithText));
      dispatch(actions.setShowAddHadithModal(false));

      // Clear existing chains to start fresh
      dispatch(actions.setChains([]));
    } catch (error) {
      dispatch(actions.setError(error instanceof Error ? error.message : 'Failed to add hadith'));
    } finally {
      dispatch(actions.setIsLoading(false));
    }
  };

  // Update mermaid code when chains change
  useEffect(() => {
    if (chains.length > 0) {
      const graphCode = generateMermaidCode(chains);
      dispatch(actions.setMermaidCode(graphCode));
      dispatch(actions.setShowVisualization(true));
    } else {
      dispatch(actions.setMermaidCode(""));
      dispatch(actions.setShowVisualization(false));
    }
  }, [chains, actions, dispatch]);

  return (
    <div className="min-h-screen pb-4 sm:pb-8 px-2 sm:px-4 transition-colors duration-200" style={{ backgroundColor: 'transparent' }}>
      <div className="max-w-7xl mx-auto">
        {/* API Key Modal */}
        <ApiKeyModal
          apiKey={apiKey}
          showApiKeyModal={showApiKeyModal}
          onSave={(key) => {
            dispatch(actions.setApiKey(key));
            dispatch(actions.setShowApiKeyModal(false));
          }}
          onClose={() => dispatch(actions.setShowApiKeyModal(false))}
        />

        {/* Narrator Details Modal - consolidated from two locations */}
        <NarratorDetailsModal
          show={showNarratorModal || showNarratorDetailsModal}
          narrator={showNarratorModal ? selectedNarratorDetails : selectedNarratorData}
          isLoading={showNarratorModal ? isLoadingNarratorDetails : isLoadingNarratorData}
          onClose={() => {
            if (showNarratorModal) {
              dispatch(actions.setShowNarratorModal(false));
            }
            if (showNarratorDetailsModal) {
              dispatch(actions.setShowNarratorDetailsModal(false));
            }
          }}
        />

        {/* Match Confirmation Modal */}
        <MatchConfirmationModal
          showMatchConfirmationModal={showMatchConfirmationModal}
          pendingMatches={pendingMatches}
          currentMatchIndex={currentMatchIndex}
          acceptedMatchesCount={acceptedMatchesCount}
          onClose={() => dispatch(actions.setShowMatchConfirmationModal(false))}
          onAcceptMatch={chainService.handleAcceptMatch}
          onRejectMatch={chainService.handleRejectMatch}
          onAcceptAllMatches={chainService.handleAcceptAllMatches}
          onRejectAllMatches={chainService.handleRejectAllMatches}
          onSelectMatch={chainService.handleSelectMatch}
        />

        {/* Tab Navigation */}
        <InputTabs activeTab={activeTab} onTabChange={(tab) => dispatch(actions.setActiveTab(tab))} />
        
        {/* New Hadith and Export Buttons - shown when chains exist */}
        {chains.length > 0 && (
          <div className="flex justify-center sm:justify-end gap-4 mb-6">
            <button
              onClick={handleNewHadith}
              className="px-6 py-3 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl border-2 border-black flex items-center gap-2 text-sm font-semibold"
              style={{ backgroundColor: '#000000', color: '#f2e9dd', fontFamily: 'var(--font-content)' }}
              title="Start a new hadith (this will clear all current chains)"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              New Hadith
            </button>
            <button
              onClick={chainService.handleExportChains}
              className="px-6 py-3 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl border-2 border-black flex items-center gap-2 text-sm font-semibold"
              style={{ backgroundColor: '#000000', color: '#f2e9dd', fontFamily: 'var(--font-content)' }}
              title="Export all chains and data as JSON"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Export Chains
            </button>
          </div>
        )}

        {/* LLM Extraction Tab */}
        {activeTab === 'llm' && (
          <LLMTab
            hadithText={hadithText}
            onHadithTextChange={(text) => dispatch(actions.setHadithText(text))}
            apiKey={apiKey}
            isLoading={isLoading}
            onExtractNarrators={handleExtractNarrators}
            onShowApiKeyModal={() => dispatch(actions.setShowApiKeyModal(true))}
            onShowImportModal={() => {
              dispatch(actions.setShowImportModal(true));
              chainService.handleFetchLibraryChains();
            }}
            onShowAddHadithModal={() => dispatch(actions.setShowAddHadithModal(true))}
            onTryDemo={chainService.handleTryDemo}
          />
        )}

        {/* Manual Chain Builder Tab */}
        {activeTab === 'manual' && (
          <ManualTab
            hadithText={hadithText}
            onHadithTextChange={(text) => dispatch(actions.setHadithText(text))}
            chains={chains}
            selectedChainIndex={selectedChainIndex}
            showAddNarrator={showAddNarrator}
            newNarrator={newNarrator}
            onAddNewChain={chainService.handleAddNewChain}
            onShowImportModal={() => {
              dispatch(actions.setShowImportModal(true));
              chainService.handleFetchLibraryChains();
            }}
            onSelectChain={chainService.handleSelectChain}
            onShowAddNarrator={(show) => dispatch(actions.setShowAddNarrator(show))}
            onNewNarratorChange={(narrator) => dispatch(actions.setNewNarrator(narrator))}
            onAddNarrator={narratorService.handleAddNarratorManual}
            onRemoveChain={chainService.handleRemoveChainManual}
            onUpdateChainTitle={narratorService.handleUpdateChainTitle}
            onUpdateNarratorReputation={narratorService.handleUpdateNarratorReputation}
            onRemoveNarrator={narratorService.handleRemoveNarratorManual}
            onClearNarrators={narratorService.handleClearNarrators}
          />
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <SettingsTab
            apiKey={apiKey}
            onOpenApiKeyModal={() => dispatch(actions.setShowApiKeyModal(true))}
            onClearCache={() => {
              localStorage.removeItem(CACHE_KEYS.HADITH_TEXT);
              localStorage.removeItem(CACHE_KEYS.CHAINS);
              localStorage.removeItem(CACHE_KEYS.SHOW_VISUALIZATION);
              localStorage.removeItem(CACHE_KEYS.API_KEY);
              localStorage.removeItem(CACHE_KEYS.ACTIVE_TAB);
              localStorage.removeItem(CACHE_KEYS.SELECTED_CHAIN);
              dispatch(actions.resetState());
            }}
          />
        )}

        {/* Error Section */}
        {error && (
          <div className="rounded-lg p-4 mb-6 border-2 border-black" style={{ backgroundColor: '#f2e9dd', boxShadow: '0 10px 30px rgba(0, 0, 0, 0.2)' }}>
            <div className="flex items-center">
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20" style={{ color: '#dc2626' }}>
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <h3 className="text-sm font-medium" style={{ fontFamily: 'var(--font-title)', color: '#dc2626' }}>Analysis Error</h3>
            </div>
            <p className="mt-2 text-sm" style={{ fontFamily: 'var(--font-content)', color: '#000000' }}>{error}</p>
          </div>
        )}

        {/* Results Section */}
        {chains.length > 0 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold" style={{ fontFamily: 'var(--font-title)', color: '#000000' }}>
                Hadith Chains ({chains.length})
              </h2>
              <div className="flex items-center gap-3">
                {chains.length > 1 && (
                  <span className="text-sm" style={{ fontFamily: 'var(--font-content)', color: '#000000', opacity: 0.7 }}>
                    Duplicate narrators are automatically merged in the visualization
                  </span>
                )}
                <button
                  onClick={chainService.handleMatchAllNarrators}
                  disabled={isLoading}
                  className="px-4 py-2 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl border-2 border-black flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-semibold"
                  style={{ backgroundColor: '#000000', color: '#f2e9dd', fontFamily: 'var(--font-content)' }}
                  title="Match narrators to database for all chains"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Match All Narrators
                </button>
              </div>
            </div>

                        <DndContext
              sensors={sensors}
              collisionDetection={closestCorners}
              onDragStart={chainService.handleChainDragStart}
              onDragEnd={chainService.handleChainDragEnd}
            >
              <SortableContext
                items={chains.map(chain => chain.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-4 w-full min-w-0 overflow-x-hidden">
                  {chains.map((chain, chainIndex) => (
                    <DraggableChain
                      key={chain.id}
                      chain={chain}
                      chainIndex={chainIndex}
                      sensors={sensors}
                      handleDragStart={narratorService.handleDragStart}
                      handleDragEnd={narratorService.handleDragEnd}
                      actions={{
                        onToggleCollapse: chainService.handleToggleChainCollapse,
                        onEdit: chainService.handleEditChain,
                        onRemove: chainService.handleRemoveChain,
                        onMatchNarrators: chainService.handleMatchNarrators,
                      }}
                      editingChainId={editingChainId}
                      state={state}
                      dispatch={dispatch}
                      globalActions={actions}
                    />
                  ))}
                </div>
              </SortableContext>

              <DragOverlay>
                <ChainDragOverlay activeChainId={activeChainId} chains={chains} />
              </DragOverlay>
            </DndContext>
          </div>
        )}

        {/* Show Visualization Button - when hidden but chains exist */}
        {chains.length > 0 && !showVisualization && (
          <div className="rounded-2xl p-6 mt-4 border-2 border-black" style={{ backgroundColor: '#f2e9dd', boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(0, 0, 0, 0.1)' }}>
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold" style={{ fontFamily: 'var(--font-title)', color: '#000000' }}>
                Chain Visualization Available
              </h2>
              <button
                onClick={() => {
                  if (chains.length > 0) {
                    const graphCode = generateMermaidCode(chains);
                    dispatch(actions.setMermaidCode(graphCode));
                    dispatch(actions.setShowVisualization(true));
                  }
                }}
                className="px-4 py-2 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl border-2 border-black flex items-center gap-2 text-sm font-semibold"
                style={{ backgroundColor: '#000000', color: '#f2e9dd', fontFamily: 'var(--font-content)' }}
                title="Show chain visualization diagram"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                <span>Show Visualization</span>
              </button>
            </div>
          </div>
        )}

        {/* Visualization Section */}
        {showVisualization && mermaidCode && (
          <MermaidGraph
            chains={chains}
            showVisualization={showVisualization}
            onHide={() => dispatch(actions.setShowVisualization(false))}
            onEdgeHover={(chainIndices) => {
              // Only highlight, no scrolling
              const chainIds = chainIndices
                .map(idx => chains[idx]?.id)
                .filter((id): id is string => id !== undefined);
              dispatch(actions.setHighlightedChainIds(chainIds));
            }}
            onEdgeClick={(chainIndices) => {
              // Highlight and scroll to chain cards
              const chainIds = chainIndices
                .map(idx => chains[idx]?.id)
                .filter((id): id is string => id !== undefined);
              dispatch(actions.setHighlightedChainIds(chainIds));
              
              // Scroll to first highlighted chain if any
              if (chainIds.length > 0) {
                const firstChainId = chainIds[0];
                setTimeout(() => {
                  const chainElement = document.querySelector(`[data-chain-id="${firstChainId}"]`);
                  if (chainElement) {
                    chainElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                  }
                }, 100);
              }
            }}
            highlightedChainIds={highlightedChainIds}
          />
        )}

      </div>


      <NarratorSearchModal
        show={showNarratorSearchModal}
        searchQuery={narratorSearchModalQuery}
        searchResults={narratorSearchModalResults}
        totalResults={narratorSearchModalTotal}
        offset={narratorSearchModalOffset}
        isSearching={isSearchingModal}
        onClose={() => dispatch(actions.setShowNarratorSearchModal(false))}
        onSearchQueryChange={(query) => dispatch(actions.setNarratorSearchModalQuery(query))}
        onLoadMore={narratorService.handleSearchNarratorsModal}
        onMatchNarrator={narratorService.handleMatchNarratorFromSearch}
      />

      <ChainCollectionsModal
        show={showImportModal}
        onClose={() => dispatch(actions.setShowImportModal(false))}
        libraryChains={libraryChains}
        isLoadingLibrary={isLoadingLibrary}
        onLoadChain={chainService.handleLoadChainFromLibrary}
      />

      <AddHadithFromDatabaseModal
        show={showAddHadithModal}
        onClose={() => dispatch(actions.setShowAddHadithModal(false))}
        onAddHadiths={handleAddHadithsFromDatabase}
        isLoading={isLoading}
      />
    </div>
  );
}