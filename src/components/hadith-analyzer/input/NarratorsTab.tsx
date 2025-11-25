"use client";

import type { NarratorsTabProps } from './types';

export function NarratorsTab({
  narratorSearchQuery,
  onNarratorSearchQueryChange,
  narratorSearchResults,
  isSearchingNarrators,
  narratorSearchTotal,
  narratorSearchOffset,
  onSearchNarrators,
  onFetchNarratorDetails
}: NarratorsTabProps) {
  return (
    <div className="space-y-6">
      {/* Search Section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <label htmlFor="narrator-search" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Search Narrators
        </label>
        <div className="flex gap-2">
          <input
            id="narrator-search"
            type="text"
            value={narratorSearchQuery}
            onChange={(e) => onNarratorSearchQueryChange(e.target.value)}
            placeholder="Search by name (Arabic or English), title, kunya, or lineage... (min. 2 characters)"
            className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
            dir="auto"
          />
          {isSearchingNarrators && (
            <div className="flex items-center px-4">
              <svg className="animate-spin h-5 w-5 text-blue-500" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            </div>
          )}
        </div>
        {narratorSearchQuery.trim().length > 0 && narratorSearchQuery.trim().length < 2 && (
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-500">
            Type at least 2 characters to search
          </p>
        )}
        {narratorSearchQuery.trim().length >= 2 && narratorSearchTotal > 0 && (
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Found {narratorSearchTotal} narrator{narratorSearchTotal !== 1 ? 's' : ''}
          </p>
        )}
      </div>

      {/* Results Section */}
      {narratorSearchQuery.trim().length >= 2 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          {isSearchingNarrators && narratorSearchResults.length === 0 ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">Searching...</p>
            </div>
          ) : narratorSearchResults.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600 dark:text-gray-400">No narrators found. Try a different search term.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {narratorSearchResults.map((narrator) => (
                <button
                  key={narrator.id}
                  onClick={() => onFetchNarratorDetails(narrator.id)}
                  className="w-full text-left p-4 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-gray-900 dark:text-white" dir="rtl">
                          {narrator.primaryArabicName}
                        </h3>
                        {narrator.title && (
                          <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded">
                            {narrator.title}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        {narrator.primaryEnglishName}
                      </p>
                      {narrator.fullNameEnglish && narrator.fullNameEnglish !== narrator.primaryEnglishName && (
                        <p className="text-xs text-gray-500 dark:text-gray-500 mb-1">
                          {narrator.fullNameEnglish}
                        </p>
                      )}
                      <div className="flex flex-wrap gap-2 text-xs text-gray-500 dark:text-gray-400">
                        {narrator.kunya && (
                          <span>Kunya: {narrator.kunya}</span>
                        )}
                        {narrator.deathYearAH && (
                          <span>Died: {narrator.deathYearAH} AH</span>
                        )}
                        {narrator.placeOfResidence && (
                          <span>Residence: {narrator.placeOfResidence}</span>
                        )}
                      </div>
                    </div>
                    <svg className="w-5 h-5 text-gray-400 flex-shrink-0 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </button>
              ))}
              
              {/* Pagination */}
              {narratorSearchTotal > 50 && (
                <div className="flex justify-center gap-2 mt-4">
                  <button
                    onClick={() => onSearchNarrators(narratorSearchQuery, Math.max(0, narratorSearchOffset - 50))}
                    disabled={narratorSearchOffset === 0 || isSearchingNarrators}
                    className="px-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => onSearchNarrators(narratorSearchQuery, narratorSearchOffset + 50)}
                    disabled={narratorSearchOffset + 50 >= narratorSearchTotal || isSearchingNarrators}
                    className="px-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Empty State */}
      {!narratorSearchQuery.trim() && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-12 text-center">
          <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Search Narrators</h3>
          <p className="text-gray-600 dark:text-gray-400">
            Enter a search term above to find narrators in the database.
          </p>
        </div>
      )}
    </div>
  );
}

