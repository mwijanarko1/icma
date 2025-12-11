"use client";

import type { Narrator as NarratorType } from '@/data/types';
import BasicModal from "@/components/ui/BasicModal";

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
  return (
    <BasicModal
      isOpen={show}
      onClose={onClose}
      title="Search Narrators in Database"
      size="full"
    >
      {/* Search Input */}
      <div className="mb-4 sm:mb-6 border-b-2 border-black pb-4 sm:pb-6">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchQueryChange(e.target.value)}
              placeholder="Search by Arabic or English name, kunya, or lineage..."
              className="w-full px-3 sm:px-4 py-3 pl-9 sm:pl-10 border-2 border-black rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-black text-sm sm:text-base"
              style={{ fontFamily: 'var(--font-content)', color: '#000000' }}
              autoFocus
            />
            <svg className="absolute left-2 sm:left-3 top-3.5 w-4 h-4 sm:w-5 sm:h-5" style={{ color: '#000000', opacity: 0.6 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            {isSearching && (
              <div className="absolute right-2 sm:right-3 top-3.5">
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
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {searchQuery.trim() === '' ? (
            <div className="text-center py-8 sm:py-12" style={{ color: '#000000', opacity: 0.7 }}>
              <svg className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4" style={{ color: '#000000', opacity: 0.4 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <p className="text-base sm:text-lg font-medium" style={{ fontFamily: 'var(--font-content)' }}>Enter a search query to find narrators</p>
              <p className="text-sm mt-2" style={{ fontFamily: 'var(--font-content)' }}>Search by Arabic or English name, kunya, or lineage</p>
            </div>
          ) : searchResults.length === 0 && !isSearching ? (
            <div className="text-center py-8 sm:py-12" style={{ color: '#000000', opacity: 0.7 }}>
              <p className="text-base sm:text-lg font-medium" style={{ fontFamily: 'var(--font-content)' }}>No narrators found</p>
              <p className="text-sm mt-2" style={{ fontFamily: 'var(--font-content)' }}>Try a different search term</p>
            </div>
          ) : (
            <div className="space-y-3">
              {searchResults.map((narrator) => (
                <div
                  key={narrator.id}
                  className="bg-gray-50 border-2 border-black rounded-lg p-3 sm:p-4 hover:bg-gray-100 transition-colors"
                  style={{ fontFamily: 'var(--font-content)' }}
                >
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2">
                        <h4 className="text-base sm:text-lg font-semibold" style={{ color: '#000000' }} dir="rtl">
                          {narrator.primaryArabicName}
                        </h4>
                        <span style={{ color: '#000000', opacity: 0.4 }}>•</span>
                        <h4 className="text-base sm:text-lg font-semibold" style={{ color: '#000000' }}>
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
                      className="self-start sm:self-center px-4 py-2 rounded-lg transition-colors text-sm font-medium flex items-center gap-2 border-2 border-black whitespace-nowrap"
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
    </BasicModal>
  );
}

