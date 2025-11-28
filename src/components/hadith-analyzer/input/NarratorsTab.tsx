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
      <div className="rounded-2xl p-6 md:p-8 border-2 border-black bg-white" style={{ boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(0, 0, 0, 0.1)' }}>
        <label htmlFor="narrator-search" className="block text-sm font-semibold mb-3" style={{ fontFamily: 'var(--font-content)', color: '#000000' }}>
          Search Narrators
        </label>
        <div className="flex gap-3">
          <input
            id="narrator-search"
            type="text"
            value={narratorSearchQuery}
            onChange={(e) => onNarratorSearchQueryChange(e.target.value)}
            placeholder="Search by name (Arabic or English), title, kunya, or lineage... (min. 2 characters)"
            className="flex-1 px-4 py-3 border-2 border-black rounded-lg focus:outline-none focus:ring-2 focus:ring-black bg-white text-gray-900 placeholder-gray-500"
            style={{ fontFamily: 'var(--font-content)' }}
            dir="auto"
          />
          {isSearchingNarrators && (
            <div className="flex items-center px-4">
              <svg className="animate-spin h-6 w-6" style={{ color: '#000000' }} viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            </div>
          )}
        </div>
        {narratorSearchQuery.trim().length > 0 && narratorSearchQuery.trim().length < 2 && (
          <p className="mt-3 text-sm" style={{ fontFamily: 'var(--font-content)', color: '#000000', opacity: 0.6 }}>
            Type at least 2 characters to search
          </p>
        )}
        {narratorSearchQuery.trim().length >= 2 && narratorSearchTotal > 0 && (
          <p className="mt-3 text-sm font-medium" style={{ fontFamily: 'var(--font-content)', color: '#000000' }}>
            Found {narratorSearchTotal} narrator{narratorSearchTotal !== 1 ? 's' : ''}
          </p>
        )}
      </div>

      {/* Results Section */}
      {narratorSearchQuery.trim().length >= 2 && (
        <div className="rounded-2xl p-6 md:p-8 border-2 border-black bg-white" style={{ boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(0, 0, 0, 0.1)' }}>
          {isSearchingNarrators && narratorSearchResults.length === 0 ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 mx-auto mb-4" style={{ borderColor: '#000000' }}></div>
              <p className="text-sm" style={{ fontFamily: 'var(--font-content)', color: '#000000', opacity: 0.6 }}>Searching...</p>
            </div>
          ) : narratorSearchResults.length === 0 ? (
            <div className="text-center py-12">
              <p style={{ fontFamily: 'var(--font-content)', color: '#000000', opacity: 0.6 }}>No narrators found. Try a different search term.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {narratorSearchResults.map((narrator) => (
                <button
                  key={narrator.id}
                  onClick={() => onFetchNarratorDetails(narrator.id)}
                  className="w-full text-left p-4 border-2 border-black rounded-lg hover:bg-gray-50 transition-colors"
                  style={{ fontFamily: 'var(--font-content)' }}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-lg" style={{ color: '#000000' }} dir="rtl">
                          {narrator.primaryArabicName}
                        </h3>
                        {narrator.title && (
                          <span className="text-xs px-2 py-1 rounded border border-black" style={{ backgroundColor: '#f2e9dd', color: '#000000' }}>
                            {narrator.title}
                          </span>
                        )}
                      </div>
                      <p className="text-sm mb-2" style={{ color: '#000000', opacity: 0.8 }}>
                        {narrator.primaryEnglishName}
                      </p>
                      {narrator.fullNameEnglish && narrator.fullNameEnglish !== narrator.primaryEnglishName && (
                        <p className="text-xs mb-2" style={{ color: '#000000', opacity: 0.6 }}>
                          {narrator.fullNameEnglish}
                        </p>
                      )}
                      <div className="flex flex-wrap gap-3 text-xs" style={{ color: '#000000', opacity: 0.6 }}>
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
                    <svg className="w-5 h-5 flex-shrink-0 ml-2" style={{ color: '#000000', opacity: 0.4 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </button>
              ))}
              
              {/* Pagination */}
              {narratorSearchTotal > 50 && (
                <div className="flex justify-center gap-3 mt-6">
                  <button
                    onClick={() => onSearchNarrators(narratorSearchQuery, Math.max(0, narratorSearchOffset - 50))}
                    disabled={narratorSearchOffset === 0 || isSearchingNarrators}
                    className="px-6 py-2 text-sm rounded-lg border-2 border-black transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg"
                    style={{ 
                      backgroundColor: (narratorSearchOffset === 0 || isSearchingNarrators) ? '#cccccc' : '#000000', 
                      color: '#f2e9dd',
                      fontFamily: 'var(--font-content)'
                    }}
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => onSearchNarrators(narratorSearchQuery, narratorSearchOffset + 50)}
                    disabled={narratorSearchOffset + 50 >= narratorSearchTotal || isSearchingNarrators}
                    className="px-6 py-2 text-sm rounded-lg border-2 border-black transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg"
                    style={{ 
                      backgroundColor: (narratorSearchOffset + 50 >= narratorSearchTotal || isSearchingNarrators) ? '#cccccc' : '#000000', 
                      color: '#f2e9dd',
                      fontFamily: 'var(--font-content)'
                    }}
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
        <div className="rounded-2xl p-12 border-2 border-black bg-white text-center" style={{ boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(0, 0, 0, 0.1)' }}>
          <svg className="w-16 h-16 mx-auto mb-4" style={{ color: '#000000', opacity: 0.3 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <h3 className="text-xl font-bold mb-2" style={{ fontFamily: 'var(--font-title)', color: '#000000' }}>Search Narrators</h3>
          <p style={{ fontFamily: 'var(--font-content)', color: '#000000', opacity: 0.6 }}>
            Enter a search term above to find narrators in the database.
          </p>
        </div>
      )}
    </div>
  );
}

