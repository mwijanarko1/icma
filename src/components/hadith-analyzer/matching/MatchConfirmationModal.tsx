"use client";

import type { MatchConfirmationModalProps } from './types';
import BasicModal from "@/components/ui/BasicModal";

export function MatchConfirmationModal({
  showMatchConfirmationModal,
  pendingMatches,
  currentMatchIndex,
  acceptedMatchesCount, // eslint-disable-line @typescript-eslint/no-unused-vars
  onClose,
  onAcceptMatch,
  onRejectMatch,
  onAcceptAllMatches,
  onRejectAllMatches,
  onSelectMatch
}: MatchConfirmationModalProps) {
  const currentMatch = pendingMatches[currentMatchIndex];
  if (!currentMatch || !currentMatch.matches || currentMatch.matches.length === 0) return null;

  const selectedMatchIndex = currentMatch.selectedMatchIndex ?? 0;
  const selectedMatch = currentMatch.matches[selectedMatchIndex];
  if (!selectedMatch) return null;

  const dbNarrator = selectedMatch.databaseNarrator;
  const confidencePercent = Math.round((selectedMatch.confidence || 0) * 100);

  return (
    <BasicModal
      isOpen={showMatchConfirmationModal && pendingMatches.length > 0}
      onClose={onClose}
      title={`Confirm Narrator Match (${currentMatchIndex + 1} of ${pendingMatches.length})`}
      size="lg"
    >
      <div className="flex flex-col">
        {/* Modal Content */}
        <div className="p-6 overflow-y-auto flex-1">
          <div className="space-y-6">
            <div>
              <p className="text-sm font-medium mb-2" style={{ fontFamily: 'var(--font-content)', color: '#000000', opacity: 0.7 }}>Extracted Narrator:</p>
              <div className="bg-gray-50 rounded-lg p-4 border-2 border-black">
                <p className="text-lg font-semibold text-right" style={{ fontFamily: 'var(--font-content)', color: '#000000' }} dir="rtl">
                  {currentMatch.narratorArabicName}
                </p>
                {currentMatch.narratorEnglishName && (
                  <p className="text-sm mt-1" style={{ fontFamily: 'var(--font-content)', color: '#000000', opacity: 0.7 }}>
                    {currentMatch.narratorEnglishName}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center justify-center">
              <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
            </div>

            <div>
              <p className="text-sm font-medium mb-3" style={{ fontFamily: 'var(--font-content)', color: '#000000', opacity: 0.7 }}>
                Select the best match ({currentMatch.matches.length} found):
              </p>
              
              {/* Top 3 Match Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
                {currentMatch.matches.slice(0, 3).map((match, index) => {
                  const matchConfidence = Math.round((match.confidence || 0) * 100);
                  const isSelected = selectedMatchIndex === index;
                  
                  return (
                    <button
                      key={match.narratorId}
                      onClick={() => onSelectMatch(currentMatchIndex, index)}
                      className={`text-left p-4 rounded-lg border-2 transition-all ${
                        isSelected
                          ? 'border-blue-500 bg-blue-50 shadow-md'
                          : 'border-black bg-white hover:bg-gray-50'
                      }`}
                      style={{ fontFamily: 'var(--font-content)' }}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <p className="text-base font-semibold text-right flex-1" style={{ color: '#000000' }} dir="rtl">
                          {match.matchedName || match.databaseNarrator.primaryArabicName}
                        </p>
                        <span className={`ml-2 px-2 py-1 rounded text-xs font-medium flex-shrink-0 ${
                          matchConfidence >= 80 
                            ? 'bg-green-100 text-green-800'
                            : matchConfidence >= 60
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-orange-100 text-orange-800'
                        }`}>
                          {matchConfidence}%
                        </span>
                      </div>
                      {match.databaseNarrator.primaryEnglishName && (
                        <p className="text-sm mt-1" style={{ color: '#000000', opacity: 0.7 }}>
                          {match.databaseNarrator.primaryEnglishName}
                        </p>
                      )}
                      {isSelected && (
                        <div className="mt-2 flex items-center text-blue-600 text-xs">
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          Selected
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
              
              {/* Selected Match Details */}
              <div className="bg-blue-50 rounded-lg p-4 border-2 border-black">
                <p className="text-xs font-medium mb-2" style={{ color: '#000000', opacity: 0.8 }}>Selected Match Details:</p>
                <div className="flex items-start justify-between mb-2">
                  <p className="text-lg font-semibold text-right flex-1" style={{ fontFamily: 'var(--font-content)', color: '#000000' }} dir="rtl">
                    {selectedMatch.matchedName || dbNarrator.primaryArabicName}
                  </p>
                  <span className={`ml-2 px-2 py-1 rounded text-xs font-medium ${
                    confidencePercent >= 80 
                      ? 'bg-green-100 text-green-800'
                      : confidencePercent >= 60
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-orange-100 text-orange-800'
                  }`}>
                    {confidencePercent}% confidence
                  </span>
                </div>
                {dbNarrator.primaryEnglishName && (
                  <p className="text-sm mt-1" style={{ fontFamily: 'var(--font-content)', color: '#000000', opacity: 0.7 }}>
                    {dbNarrator.primaryEnglishName}
                  </p>
                )}
              </div>
            </div>

            {dbNarrator && (
              <div className="border-t-2 border-black pt-4">
                <p className="text-sm font-medium mb-2" style={{ fontFamily: 'var(--font-content)', color: '#000000', opacity: 0.7 }}>Database Information:</p>
                <div className="space-y-2 text-sm">
                  {dbNarrator.ibnHajarRank && (
                    <div className="flex justify-between">
                      <span style={{ fontFamily: 'var(--font-content)', color: '#000000', opacity: 0.7 }}>Ibn Hajar Rank:</span>
                      <span className="text-right" style={{ fontFamily: 'var(--font-content)', color: '#000000' }} dir="rtl">{dbNarrator.ibnHajarRank}</span>
                    </div>
                  )}
                  {dbNarrator.dhahabiRank && (
                    <div className="flex justify-between">
                      <span style={{ fontFamily: 'var(--font-content)', color: '#000000', opacity: 0.7 }}>Dhahabi Rank:</span>
                      <span className="text-right" style={{ fontFamily: 'var(--font-content)', color: '#000000' }} dir="rtl">{dbNarrator.dhahabiRank}</span>
                    </div>
                  )}
                  {dbNarrator.taqribCategory && (
                    <div className="flex justify-between">
                      <span style={{ fontFamily: 'var(--font-content)', color: '#000000', opacity: 0.7 }}>Taqrib Category:</span>
                      <span className="text-right" style={{ fontFamily: 'var(--font-content)', color: '#000000' }} dir="rtl">{dbNarrator.taqribCategory}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="bg-yellow-50 rounded-lg p-3 border-2 border-black">
              <p className="text-sm" style={{ fontFamily: 'var(--font-content)', color: '#000000' }}>
                <strong>Question:</strong> Does the extracted narrator match the database narrator?
              </p>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between p-6 border-t-2 border-black">
          <div className="flex gap-2">
            <button
              onClick={onRejectAllMatches}
              className="px-4 py-2 text-sm font-medium rounded-lg transition-colors border-2 border-black hover:bg-red-50"
              style={{ fontFamily: 'var(--font-content)', color: '#000000', backgroundColor: '#fee2e2' }}
            >
              Reject All
            </button>
            <button
              onClick={onAcceptAllMatches}
              className="px-4 py-2 text-sm font-medium rounded-lg transition-colors border-2 border-black hover:bg-green-50"
              style={{ fontFamily: 'var(--font-content)', color: '#000000', backgroundColor: '#dcfce7' }}
            >
              Accept All
            </button>
          </div>
          <div className="flex gap-3">
            <button
              onClick={onRejectMatch}
              className="px-6 py-2 text-sm font-medium rounded-lg transition-colors border-2 border-black hover:bg-gray-100"
              style={{ fontFamily: 'var(--font-content)', color: '#000000', backgroundColor: '#f2e9dd' }}
            >
              No
            </button>
            <button
              onClick={onAcceptMatch}
              className="px-6 py-2 text-sm font-medium rounded-lg transition-colors border-2 border-black"
              style={{ fontFamily: 'var(--font-content)', color: '#f2e9dd', backgroundColor: '#000000' }}
            >
              Yes
            </button>
          </div>
        </div>
      </div>
    </BasicModal>
  );
}

