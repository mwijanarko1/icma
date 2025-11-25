"use client";

import type { MatchConfirmationModalProps } from './types';

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
  if (!showMatchConfirmationModal || pendingMatches.length === 0) return null;

  const currentMatch = pendingMatches[currentMatchIndex];
  if (!currentMatch || !currentMatch.matches || currentMatch.matches.length === 0) return null;

  const selectedMatchIndex = currentMatch.selectedMatchIndex ?? 0;
  const selectedMatch = currentMatch.matches[selectedMatchIndex];
  if (!selectedMatch) return null;

  const dbNarrator = selectedMatch.databaseNarrator;
  const confidencePercent = Math.round((selectedMatch.confidence || 0) * 100);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Confirm Narrator Match
          </h3>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {currentMatchIndex + 1} of {pendingMatches.length}
            </span>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Modal Content */}
        <div className="p-6 overflow-y-auto flex-1">
          <div className="space-y-6">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Extracted Narrator:</p>
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <p className="text-lg font-semibold text-gray-900 dark:text-white text-right" dir="rtl">
                  {currentMatch.narratorArabicName}
                </p>
                {currentMatch.narratorEnglishName && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
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
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">
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
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 shadow-md'
                          : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <p className="text-base font-semibold text-gray-900 dark:text-white text-right flex-1" dir="rtl">
                          {match.matchedName || match.databaseNarrator.primaryArabicName}
                        </p>
                        <span className={`ml-2 px-2 py-1 rounded text-xs font-medium flex-shrink-0 ${
                          matchConfidence >= 80 
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                            : matchConfidence >= 60
                            ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                            : 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
                        }`}>
                          {matchConfidence}%
                        </span>
                      </div>
                      {match.databaseNarrator.primaryEnglishName && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          {match.databaseNarrator.primaryEnglishName}
                        </p>
                      )}
                      {isSelected && (
                        <div className="mt-2 flex items-center text-blue-600 dark:text-blue-400 text-xs">
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
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
                <p className="text-xs font-medium text-blue-800 dark:text-blue-200 mb-2">Selected Match Details:</p>
                <div className="flex items-start justify-between mb-2">
                  <p className="text-lg font-semibold text-gray-900 dark:text-white text-right flex-1" dir="rtl">
                    {selectedMatch.matchedName || dbNarrator.primaryArabicName}
                  </p>
                  <span className={`ml-2 px-2 py-1 rounded text-xs font-medium ${
                    confidencePercent >= 80 
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                      : confidencePercent >= 60
                      ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                      : 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
                  }`}>
                    {confidencePercent}% confidence
                  </span>
                </div>
                {dbNarrator.primaryEnglishName && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {dbNarrator.primaryEnglishName}
                  </p>
                )}
              </div>
            </div>

            {dbNarrator && (
              <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Database Information:</p>
                <div className="space-y-2 text-sm">
                  {dbNarrator.ibnHajarRank && (
                    <div className="flex justify-between">
                      <span className="text-gray-500 dark:text-gray-400">Ibn Hajar Rank:</span>
                      <span className="text-gray-900 dark:text-white text-right" dir="rtl">{dbNarrator.ibnHajarRank}</span>
                    </div>
                  )}
                  {dbNarrator.dhahabiRank && (
                    <div className="flex justify-between">
                      <span className="text-gray-500 dark:text-gray-400">Dhahabi Rank:</span>
                      <span className="text-gray-900 dark:text-white text-right" dir="rtl">{dbNarrator.dhahabiRank}</span>
                    </div>
                  )}
                  {dbNarrator.taqribCategory && (
                    <div className="flex justify-between">
                      <span className="text-gray-500 dark:text-gray-400">Taqrib Category:</span>
                      <span className="text-gray-900 dark:text-white text-right" dir="rtl">{dbNarrator.taqribCategory}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
              <p className="text-sm text-yellow-800 dark:text-yellow-200">
                <strong>Question:</strong> Does the extracted narrator match the database narrator?
              </p>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 dark:border-gray-700">
          <div className="flex gap-2">
            <button
              onClick={onRejectAllMatches}
              className="px-4 py-2 text-sm font-medium text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors"
            >
              Reject All
            </button>
            <button
              onClick={onAcceptAllMatches}
              className="px-4 py-2 text-sm font-medium text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/30 rounded-lg transition-colors"
            >
              Accept All
            </button>
          </div>
          <div className="flex gap-3">
            <button
              onClick={onRejectMatch}
              className="px-6 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
            >
              No
            </button>
            <button
              onClick={onAcceptMatch}
              className="px-6 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors"
            >
              Yes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

