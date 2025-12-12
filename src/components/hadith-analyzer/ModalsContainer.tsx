"use client";

import React from 'react';
import { useHadithAnalyzerContext } from '@/contexts/HadithAnalyzerContext';
import { ApiKeyModal } from '@/components/hadith-analyzer/settings/ApiKeyModal';
import { NarratorDetailsModal } from '@/components/hadith-analyzer/narrators/NarratorDetailsModal';
import { MatchConfirmationModal } from '@/components/hadith-analyzer/matching/MatchConfirmationModal';
import { NarratorSearchModal } from '@/components/hadith-analyzer/narrators/NarratorSearchModal';

export const ModalsContainer = React.memo(function ModalsContainer() {
  const {
    state,
    dispatch,
    actions,
    handleAcceptMatch,
    handleRejectMatch,
    handleAcceptAllMatches,
    handleRejectAllMatches,
    handleSelectMatch,
    handleNarratorSearch,
    handleMatchNarratorFromSearch,
  } = useHadithAnalyzerContext();

  const {
    apiKey,
    showApiKeyModal,
    showNarratorModal,
    showNarratorDetailsModal,
    selectedNarratorDetails,
    selectedNarratorData,
    isLoadingNarratorDetails,
    isLoadingNarratorData,
    showMatchConfirmationModal,
    pendingMatches,
    currentMatchIndex,
    acceptedMatchesCount,
    showNarratorSearchModal,
    narratorSearchModalQuery,
    narratorSearchModalResults,
    isSearchingModal,
    narratorSearchModalOffset,
    narratorSearchModalTotal,
  } = state;
  return (
    <>
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
        onAcceptMatch={handleAcceptMatch}
        onRejectMatch={handleRejectMatch}
        onAcceptAllMatches={handleAcceptAllMatches}
        onRejectAllMatches={handleRejectAllMatches}
        onSelectMatch={handleSelectMatch}
      />

      {/* Narrator Search Modal */}
      <NarratorSearchModal
        show={showNarratorSearchModal}
        searchQuery={narratorSearchModalQuery}
        searchResults={narratorSearchModalResults}
        totalResults={narratorSearchModalTotal}
        offset={narratorSearchModalOffset}
        isSearching={isSearchingModal}
        onClose={() => dispatch(actions.setShowNarratorSearchModal(false))}
        onSearchQueryChange={(query) => dispatch(actions.setNarratorSearchModalQuery(query))}
        onLoadMore={handleNarratorSearch}
        onMatchNarrator={handleMatchNarratorFromSearch}
      />
    </>
  );
});