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
      <div className="bg-white rounded-xl sm:rounded-2xl border-2 border-black max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden flex flex-col" style={{ boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(0, 0, 0, 0.1)' }} onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b-2 border-black">
          <h3 className="text-xl font-semibold" style={{ fontFamily: 'var(--font-title)', color: '#000000' }}>
            Search Narrators in Database
          </h3>
          <button
            onClick={onClose}
            className="hover:opacity-80 transition-opacity"
            style={{ color: '#000000', opacity: 0.6 }}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Search Input */}
        <div className="p-6 border-b-2 border-black">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchQueryChange(e.target.value)}
              placeholder="Search by Arabic or English name..."
              className="w-full px-4 py-3 pl-10 border-2 border-black rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-black"
              style={{ fontFamily: 'var(--font-content)', color: '#000000' }}
              autoFocus
            />
            <svg className="absolute left-3 top-3.5 w-5 h-5" style={{ color: '#000000', opacity: 0.6 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
            <p className="mt-2 text-sm" style={{ fontFamily: 'var(--font-content)', color: '#000000', opacity: 0.7 }}>
              Found {totalResults} narrator{totalResults !== 1 ? 's' : ''}
            </p>
          )}
        </div>

        {/* Results */}
        <div className="flex-1 overflow-y-auto p-6">
          {searchQuery.trim() === '' ? (
            <div className="text-center py-12" style={{ color: '#000000', opacity: 0.7 }}>
              <svg className="w-16 h-16 mx-auto mb-4" style={{ color: '#000000', opacity: 0.4 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <p className="text-lg font-medium" style={{ fontFamily: 'var(--font-content)' }}>Enter a search query to find narrators</p>
              <p className="text-sm mt-2" style={{ fontFamily: 'var(--font-content)' }}>Search by Arabic or English name</p>
            </div>
          ) : searchResults.length === 0 && !isSearching ? (
            <div className="text-center py-12" style={{ color: '#000000', opacity: 0.7 }}>
              <p className="text-lg font-medium" style={{ fontFamily: 'var(--font-content)' }}>No narrators found</p>
              <p className="text-sm mt-2" style={{ fontFamily: 'var(--font-content)' }}>Try a different search term</p>
            </div>
          ) : (
            <div className="space-y-3">
              {searchResults.map((narrator) => (
                <div
                  key={narrator.id}
                  className="bg-gray-50 border-2 border-black rounded-lg p-4 hover:bg-gray-100 transition-colors"
                  style={{ fontFamily: 'var(--font-content)' }}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="text-lg font-semibold" style={{ color: '#000000' }} dir="rtl">
                          {narrator.primaryArabicName}
                        </h4>
                        <span style={{ color: '#000000', opacity: 0.4 }}>•</span>
                        <h4 className="text-lg font-semibold" style={{ color: '#000000' }}>
                          {narrator.primaryEnglishName}
                        </h4>
                      </div>
                      {'fullNameArabic' in narrator && narrator.fullNameArabic && (
                        <p className="text-sm mb-1" style={{ color: '#000000', opacity: 0.7 }} dir="rtl">
                          {narrator.fullNameArabic}
                        </p>
                      )}
                      {'fullNameEnglish' in narrator && narrator.fullNameEnglish && (
                        <p className="text-sm mb-1" style={{ color: '#000000', opacity: 0.7 }}>
                          {narrator.fullNameEnglish}
                        </p>
                      )}
                      <div className="flex flex-wrap gap-2 mt-2">
                        {narrator.deathYearAH && (
                          <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded border border-black">
                            Died {narrator.deathYearAH} AH
                          </span>
                        )}
                        {narrator.taqribCategory && (
                          <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded border border-black">
                            {narrator.taqribCategory}
                          </span>
                        )}
                        {narrator.ibnHajarRank && (
                          <span className="px-2 py-1 text-xs bg-purple-100 text-purple-800 rounded border border-black">
                            Ibn Hajar: {narrator.ibnHajarRank}
                          </span>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => onMatchNarrator(narrator)}
                      className="ml-4 px-4 py-2 rounded-lg transition-colors text-sm font-medium flex items-center gap-2 border-2 border-black"
                      style={{ fontFamily: 'var(--font-content)', color: '#f2e9dd', backgroundColor: '#000000' }}
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
                  className="w-full py-3 text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed border-2 border-black hover:bg-gray-50"
                  style={{ fontFamily: 'var(--font-content)', color: '#000000' }}
                >
                  {isSearching ? 'Loading...' : `Load More (${totalResults - searchResults.length} remaining)`}
                </button>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex justify-end p-6 border-t-2 border-black">
          <button
            onClick={onClose}
            className="px-6 py-2 text-sm font-medium rounded-lg transition-colors border-2 border-black hover:bg-gray-50"
            style={{ fontFamily: 'var(--font-content)', color: '#000000', backgroundColor: '#f2e9dd' }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

