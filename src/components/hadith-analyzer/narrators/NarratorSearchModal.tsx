"use client";

import type { Narrator as NarratorType } from '@/data/types';

interface NarratorSearchModalProps {
  show: boolean;
  searchQuery: string;
  searchResults: NarratorType[];
  totalResults: number;
  offset: number;
  isSearching: boolean;
  onClose: () => void;
  onSearchQueryChange: (query: string) => void;
  onLoadMore: (query: string, offset: number) => void;
  onMatchNarrator: (narrator: NarratorType) => void;
}

export function NarratorSearchModal({
  show,
  searchQuery,
  searchResults,
  totalResults,
  offset,
  isSearching,
  onClose,
  onSearchQueryChange,
  onLoadMore,
  onMatchNarrator
}: NarratorSearchModalProps) {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
            Search Narrators in Database
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Search Input */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchQueryChange(e.target.value)}
              placeholder="Search by Arabic or English name..."
              className="w-full px-4 py-3 pl-10 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              autoFocus
            />
            <svg className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            {isSearching && (
              <div className="absolute right-3 top-3.5">
                <svg className="animate-spin h-5 w-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </div>
            )}
          </div>
          {totalResults > 0 && (
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Found {totalResults} narrator{totalResults !== 1 ? 's' : ''}
            </p>
          )}
        </div>

        {/* Results */}
        <div className="flex-1 overflow-y-auto p-6">
          {searchQuery.trim() === '' ? (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
              <svg className="w-16 h-16 mx-auto mb-4 text-gray-300 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <p className="text-lg font-medium">Enter a search query to find narrators</p>
              <p className="text-sm mt-2">Search by Arabic or English name</p>
            </div>
          ) : searchResults.length === 0 && !isSearching ? (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
              <p className="text-lg font-medium">No narrators found</p>
              <p className="text-sm mt-2">Try a different search term</p>
            </div>
          ) : (
            <div className="space-y-3">
              {searchResults.map((narrator) => (
                <div
                  key={narrator.id}
                  className="bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-100 dark:hover:bg-gray-900 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="text-lg font-semibold text-gray-900 dark:text-white" dir="rtl">
                          {narrator.primaryArabicName}
                        </h4>
                        <span className="text-gray-400">•</span>
                        <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                          {narrator.primaryEnglishName}
                        </h4>
                      </div>
                      {'fullNameArabic' in narrator && narrator.fullNameArabic && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-1" dir="rtl">
                          {narrator.fullNameArabic}
                        </p>
                      )}
                      {'fullNameEnglish' in narrator && narrator.fullNameEnglish && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                          {narrator.fullNameEnglish}
                        </p>
                      )}
                      <div className="flex flex-wrap gap-2 mt-2">
                        {narrator.deathYearAH && (
                          <span className="px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 rounded">
                            Died {narrator.deathYearAH} AH
                          </span>
                        )}
                        {narrator.taqribCategory && (
                          <span className="px-2 py-1 text-xs bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 rounded">
                            {narrator.taqribCategory}
                          </span>
                        )}
                        {narrator.ibnHajarRank && (
                          <span className="px-2 py-1 text-xs bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-200 rounded">
                            Ibn Hajar: {narrator.ibnHajarRank}
                          </span>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => onMatchNarrator(narrator)}
                      className="ml-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium flex items-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Match
                    </button>
                  </div>
                </div>
              ))}
              {searchResults.length < totalResults && (
                <button
                  onClick={() => onLoadMore(searchQuery, offset + 20)}
                  disabled={isSearching}
                  className="w-full py-3 text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 border border-blue-200 dark:border-blue-800 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSearching ? 'Loading...' : `Load More (${totalResults - searchResults.length} remaining)`}
                </button>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex justify-end p-6 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            className="px-6 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

