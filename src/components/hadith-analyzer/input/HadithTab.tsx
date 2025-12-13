"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
import type { HadithTabProps } from './types';

type HadithCollection = 'bukhari' | 'muslim' | 'nasai' | 'tirmidhi' | 'abudawud' | 'ibnmajah';

interface Hadith {
  hadith_number: number;
  sub_version?: string;
  reference: string;
  english_narrator?: string;
  english_translation: string;
  arabic_text: string;
  in_book_reference?: string;
  collection?: string; // Collection name for multi-collection search
}

// Move collections outside component to prevent recreation on every render
const COLLECTIONS: { value: HadithCollection; label: string }[] = [
  { value: 'bukhari', label: 'Sahih al-Bukhari' },
  { value: 'muslim', label: 'Sahih Muslim' },
  { value: 'nasai', label: 'Sunan an-Nasa\'i' },
  { value: 'tirmidhi', label: 'Jami` at-Tirmidhi' },
  { value: 'abudawud', label: 'Sunan Abi Dawud' },
  { value: 'ibnmajah', label: 'Sunan Ibn Majah' },
];

/**
 * Collection name variations mapping
 * Maps common variations to the actual collection name
 */
const COLLECTION_VARIATIONS: Record<string, HadithCollection> = {
  'bukhari': 'bukhari',
  'sahih bukhari': 'bukhari',
  'muslim': 'muslim',
  'sahih muslim': 'muslim',
  'nasai': 'nasai',
  'nasa\'i': 'nasai',
  'sunan nasai': 'nasai',
  'tirmidhi': 'tirmidhi',
  'jami tirmidhi': 'tirmidhi',
  'abudawud': 'abudawud',
  'abu dawud': 'abudawud',
  'abi dawud': 'abudawud',
  'sunan abu dawud': 'abudawud',
  'sunan abi dawud': 'abudawud',
  'ibnmajah': 'ibnmajah',
  'ibn majah': 'ibnmajah',
  'sunan ibn majah': 'ibnmajah',
};

/**
 * Normalize collection name from query
 * Handles variations like "abi dawud" -> "abudawud", "abu dawud" -> "abudawud"
 */
function normalizeCollectionName(query: string): { collection: HadithCollection; remainingQuery: string } | null {
  const trimmed = query.trim().toLowerCase();
  
  // Try exact matches first
  for (const [variation, collection] of Object.entries(COLLECTION_VARIATIONS)) {
    if (trimmed.startsWith(variation)) {
      const afterCollection = trimmed.slice(variation.length).trim();
      return { collection, remainingQuery: afterCollection };
    }
  }
  
  // Try matching collection names directly
  for (const col of COLLECTIONS) {
    if (trimmed.startsWith(col.value)) {
      const afterCollection = trimmed.slice(col.value.length).trim();
      return { collection: col.value, remainingQuery: afterCollection };
    }
  }
  
  return null;
}

/**
 * Parse collection name + hadith number from search query
 * Examples: "tirmidhi 23", "muslim 8a", "bukhari 1", "abi dawud 23", "abu dawud 8a"
 * Returns: { collection: 'tirmidhi', hadithNumber: '23', remainingQuery: '' } or null
 */
function parseCollectionAndNumber(query: string): { collection: HadithCollection; hadithNumber: string; remainingQuery: string } | null {
  const trimmed = query.trim().toLowerCase();
  
  // First, try to normalize collection name (handles variations)
  const collectionMatch = normalizeCollectionName(trimmed);
  if (!collectionMatch) {
    return null;
  }
  
  const { collection, remainingQuery: afterCollection } = collectionMatch;
  
  // Match hadith number (with optional letter suffix like "8a")
  const numberMatch = afterCollection.match(/^(\d+[a-z]?)\b/);
  if (numberMatch) {
    const hadithNumber = numberMatch[1];
    const remaining = afterCollection.slice(numberMatch[0].length).trim();
    return { collection, hadithNumber, remainingQuery: remaining };
  }
  
  return null;
}

export function HadithTab({ selectedHadiths = [], onSelectedHadithsChange, showSelectButton = false }: HadithTabProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [hadithList, setHadithList] = useState<Hadith[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const [offset, setOffset] = useState(0);
  const [expandedHadith, setExpandedHadith] = useState<string | null>(null);
  const [copiedHadithNumber, setCopiedHadithNumber] = useState<number | null>(null);
  const limit = 20;
  const previousSearchQuery = useRef<string>('');

  // Check if a hadith is selected
  const isHadithSelected = useCallback((hadith: Hadith) => {
    return selectedHadiths.some(
      (selected) =>
        selected.hadith_number === hadith.hadith_number &&
        selected.sub_version === hadith.sub_version &&
        selected.collection === hadith.collection
    );
  }, [selectedHadiths]);

  // Toggle hadith selection
  const toggleHadithSelection = useCallback((hadith: Hadith) => {
    if (!onSelectedHadithsChange) return;

    const isSelected = isHadithSelected(hadith);

    if (isSelected) {
      // Remove from selection
      const updated = selectedHadiths.filter(
        (selected) =>
          !(selected.hadith_number === hadith.hadith_number &&
            selected.sub_version === hadith.sub_version &&
            selected.collection === hadith.collection)
      );
      onSelectedHadithsChange(updated);
    } else {
      // Add to selection (ensure collection is included)
      const newHadith = {
        ...hadith,
        collection: hadith.collection || 'unknown',
      };
      onSelectedHadithsChange([...selectedHadiths, newHadith]);
    }
  }, [selectedHadiths, onSelectedHadithsChange, isHadithSelected]);



  const fetchHadithList = useCallback(async (currentOffset: number) => {
    setIsLoading(true);
    setError(null);
    try {
      // Fetch from all collections in parallel
      // For listing, we want a reasonable amount from each collection
      const perCollectionLimit = Math.max(10, Math.ceil(limit / COLLECTIONS.length));
      const perCollectionOffset = Math.floor(currentOffset / COLLECTIONS.length);
      
      const searchPromises = COLLECTIONS.map(async (col) => {
        try {
          const response = await fetch(`/api/hadith?collection=${col.value}&limit=${perCollectionLimit}&offset=${perCollectionOffset}`);
          const data = await response.json();
          if (data.success && data.data) {
            // Add collection info to each hadith
            return {
              hadith: data.data.map((hadith: Hadith) => ({
                ...hadith,
                collection: col.value,
              })),
              total: data.total || 0,
            };
          }
          return { hadith: [], total: 0 };
        } catch (err) {
          console.error(`Error fetching from ${col.value}:`, err);
          return { hadith: [], total: 0 };
        }
      });

      const results = await Promise.all(searchPromises);
      const allHadith = results.flatMap(r => r.hadith);
      const totalCount = results.reduce((sum, r) => sum + r.total, 0);
      
      // Sort by collection, then by hadith number
      allHadith.sort((a, b) => {
        const collectionCompare = (a.collection || '').localeCompare(b.collection || '');
        if (collectionCompare !== 0) return collectionCompare;
        return a.hadith_number - b.hadith_number;
      });

      // Apply pagination to combined results
      const paginatedHadith = allHadith.slice(0, limit);
      
      setHadithList(paginatedHadith);
      setTotal(totalCount);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setHadithList([]);
      setTotal(0);
    } finally {
      setIsLoading(false);
    }
  }, [limit]);

  const searchHadith = useCallback(async (query: string, searchOffset: number = 0) => {
    if (!query.trim()) {
      setHadithList([]);
      setTotal(0);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      // Check if query contains collection name + number (e.g., "tirmidhi 23", "muslim 8a")
      const collectionMatch = parseCollectionAndNumber(query);
      
      let collectionsToSearch: typeof COLLECTIONS;
      
      if (collectionMatch) {
        // Search only the specified collection for better performance
        collectionsToSearch = COLLECTIONS.filter(col => col.value === collectionMatch.collection);
        // If collection not found, fall back to all collections
        if (collectionsToSearch.length === 0) {
          collectionsToSearch = COLLECTIONS;
        }
      } else {
        // Search all collections
        collectionsToSearch = COLLECTIONS;
      }
      
      // Get more results per collection to allow for better sorting/ranking
      const perCollectionLimit = Math.max(15, Math.ceil(limit * 1.5 / collectionsToSearch.length));
      const perCollectionOffset = Math.floor(searchOffset / collectionsToSearch.length);
      
      const searchPromises = collectionsToSearch.map(async (col) => {
        try {
          const response = await fetch(`/api/hadith?collection=${col.value}&search=${encodeURIComponent(query)}&limit=${perCollectionLimit}&offset=${perCollectionOffset}`);
          const data = await response.json();
          if (data.success && data.data) {
            // Add collection info to each hadith
            return {
              hadith: data.data.map((hadith: Hadith) => ({
                ...hadith,
                collection: col.value,
              })),
              total: data.total || 0,
            };
          }
          return { hadith: [], total: 0 };
        } catch (err) {
          console.error(`Error searching ${col.value}:`, err);
          return { hadith: [], total: 0 };
        }
      });

      const results = await Promise.all(searchPromises);
      const allHadith = results.flatMap(r => r.hadith);
      const totalCount = results.reduce((sum, r) => sum + r.total, 0);
      
      // Sort by collection, then by hadith number
      allHadith.sort((a, b) => {
        const collectionCompare = (a.collection || '').localeCompare(b.collection || '');
        if (collectionCompare !== 0) return collectionCompare;
        return a.hadith_number - b.hadith_number;
      });

      // Apply pagination to combined results
      const paginatedHadith = allHadith.slice(searchOffset, searchOffset + limit);
      
      setHadithList(paginatedHadith);
      setTotal(totalCount);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setHadithList([]);
      setTotal(0);
    } finally {
      setIsLoading(false);
    }
  }, [limit]);

  // Copy Arabic text to clipboard
  const copyArabicText = async (arabicText: string, hadithNum: number) => {
    try {
      await navigator.clipboard.writeText(arabicText);
      setCopiedHadithNumber(hadithNum);
      setTimeout(() => setCopiedHadithNumber(null), 2000);
    } catch (err) {
      console.error('Failed to copy text:', err);
    }
  };

  // Load initial list or search
  useEffect(() => {
    const trimmedQuery = searchQuery.trim();
    const queryChanged = trimmedQuery !== previousSearchQuery.current;
    
    // Reset offset when search query changes
    if (queryChanged) {
      setOffset(0);
    }

    if (trimmedQuery) {
      const timeoutId = setTimeout(() => {
        // If query changed during debounce, use offset 0, otherwise use current offset for pagination
        const currentQuery = searchQuery.trim();
        const searchOffset = currentQuery === previousSearchQuery.current ? offset : 0;
        previousSearchQuery.current = currentQuery;
        searchHadith(currentQuery, searchOffset);
      }, 300);
      return () => clearTimeout(timeoutId);
    } else {
      // When no search query, don't fetch anything - only fetch when user searches
      previousSearchQuery.current = '';
      // Clear any existing results when search is cleared
      if (searchQuery.trim() === '') {
        setHadithList([]);
        setTotal(0);
        setIsLoading(false);
        setError(null);
      }
    }
  }, [offset, searchQuery, fetchHadithList, searchHadith]);

  // Reset expanded hadith when pagination or search occurs
  useEffect(() => {
    setExpandedHadith(null);
  }, [offset, searchQuery]);

  return (
    <div className="space-y-6">
      {/* Search Section */}
      <div className="rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 border-2 border-black bg-white" style={{ boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(0, 0, 0, 0.1)' }}>
        <div className="flex flex-col gap-3 sm:gap-4">
          {/* Info Text */}
          <div className="text-xs sm:text-sm" style={{ fontFamily: 'var(--font-content)', color: '#000000', opacity: 0.7 }}>
            Searching across all collections: <span className="hidden sm:inline">{COLLECTIONS.map(c => c.label).join(', ')}</span><span className="sm:hidden">All collections</span>
          </div>

          {/* Search Bar */}
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                const newQuery = e.target.value;
                setSearchQuery(newQuery);
                // Reset offset when user types
                if (newQuery.trim() !== previousSearchQuery.current) {
                  setOffset(0);
                }
              }}
              placeholder="Search by collection + number (e.g., 'tirmidhi 23', 'muslim 8a'), hadith number, English text, or Arabic text..."
              className="flex-1 px-3 sm:px-4 py-2 sm:py-3 border-2 border-black rounded-lg focus:outline-none focus:ring-0 bg-white text-gray-900 placeholder-gray-500 text-sm sm:text-base"
              style={{ fontFamily: 'var(--font-content)', outline: 'none' }}
            />
            {searchQuery && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setOffset(0);
                }}
                className="px-3 sm:px-4 py-2 sm:py-3 rounded-lg border-2 border-black transition-all hover:shadow-lg text-sm sm:text-base whitespace-nowrap"
                style={{ 
                  backgroundColor: '#000000', 
                  color: '#f2e9dd',
                  fontFamily: 'var(--font-content)'
                }}
              >
                Clear
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-lg p-4 border-2 border-red-500 bg-red-50">
          <p className="text-sm text-red-700" style={{ fontFamily: 'var(--font-content)' }}>{error}</p>
        </div>
      )}

      {/* Loading */}
      {isLoading && (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-10 w-10 border-b-2 mx-auto mb-4" style={{ borderColor: '#000000' }}></div>
          <p className="text-sm" style={{ fontFamily: 'var(--font-content)', color: '#000000', opacity: 0.6 }}>Loading...</p>
        </div>
      )}

      {/* List View */}
      {(
        <div className="space-y-4">
          {hadithList.length > 0 && !isLoading && (
            <>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0">
                <p className="text-xs sm:text-sm font-medium" style={{ fontFamily: 'var(--font-content)', color: '#000000' }}>
                  {searchQuery 
                    ? `Found ${total} results for "${searchQuery}"`
                    : `Showing ${hadithList.length} of ${total} hadith`
                  }
                </p>
            <div className="flex gap-2 sm:gap-3 w-full sm:w-auto">
              <button
                onClick={() => setOffset(Math.max(0, offset - limit))}
                disabled={offset === 0}
                className="flex-1 sm:flex-none px-4 sm:px-6 py-2 text-xs sm:text-sm rounded-lg border-2 border-black transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg"
                style={{ 
                  backgroundColor: offset === 0 ? '#cccccc' : '#000000', 
                  color: '#f2e9dd',
                  fontFamily: 'var(--font-content)'
                }}
              >
                Previous
              </button>
              <button
                onClick={() => setOffset(offset + limit)}
                disabled={offset + limit >= total}
                className="flex-1 sm:flex-none px-4 sm:px-6 py-2 text-xs sm:text-sm rounded-lg border-2 border-black transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg"
                style={{ 
                  backgroundColor: (offset + limit >= total) ? '#cccccc' : '#000000', 
                  color: '#f2e9dd',
                  fontFamily: 'var(--font-content)'
                }}
              >
                Next
              </button>
            </div>
          </div>

          {hadithList.map((h) => {
            const hadithKey = `${h.collection || 'unknown'}-${h.hadith_number}${h.sub_version || ''}`;
            const isExpanded = expandedHadith === hadithKey;
            const displayHadith = h;
            
            return (
              <div
                key={hadithKey}
                className="rounded-lg border-2 border-black bg-white hover:shadow-lg transition-all duration-200 ease-in-out"
                style={{ boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)' }}
              >
                <div
                  className="p-4 cursor-pointer"
                  onClick={async (e) => {
                    e.preventDefault();
                    e.stopPropagation();

                    if (isExpanded) {
                      setExpandedHadith(null);
                    } else {
                      setExpandedHadith(hadithKey);
                    }
                  }}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                      <h4 className="font-semibold text-lg" style={{ fontFamily: 'var(--font-title)', color: '#000000' }}>{h.reference}</h4>
                      {h.collection && (
                        <span className="text-xs px-2 py-1 rounded border border-black inline-block mt-1" style={{ backgroundColor: '#f2e9dd', color: '#000000', fontFamily: 'var(--font-content)' }}>
                          {COLLECTIONS.find(c => c.value === h.collection)?.label || h.collection}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {h.in_book_reference && (
                        <span className="text-xs" style={{ color: '#000000', opacity: 0.6, fontFamily: 'var(--font-content)' }}>{h.in_book_reference}</span>
                      )}
                      {showSelectButton && onSelectedHadithsChange && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleHadithSelection(h);
                          }}
                          className="px-3 py-1 text-xs rounded-lg transition-all duration-200 border-2 flex items-center gap-1 font-semibold"
                          style={{
                            backgroundColor: isHadithSelected(h) ? '#000000' : '#f2e9dd',
                            color: isHadithSelected(h) ? '#f2e9dd' : '#000000',
                            borderColor: '#000000',
                            fontFamily: 'var(--font-content)'
                          }}
                        >
                          {isHadithSelected(h) ? (
                            <>
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                              Selected
                            </>
                          ) : (
                            <>
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                              </svg>
                              Select
                            </>
                          )}
                        </button>
                      )}
                      <svg
                        className={`w-5 h-5 transition-transform ${isExpanded ? 'transform rotate-180' : ''}`}
                        style={{ color: '#000000', opacity: 0.4 }}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                  {!isExpanded && (
                    <p className="text-sm line-clamp-2" style={{ fontFamily: 'var(--font-content)', color: '#000000', opacity: 0.7 }}>
                      {h.english_translation.substring(0, 200)}...
                    </p>
                  )}
                </div>
                
                {isExpanded && displayHadith && (
                  <div className="px-4 pb-4 border-t-2 border-black pt-4 transition-all duration-200 ease-in-out">
                    {displayHadith.english_narrator && (
                      <div className="mb-4">
                        <p className="text-sm font-semibold mb-1" style={{ fontFamily: 'var(--font-content)', color: '#000000' }}>Narrator:</p>
                        <p style={{ fontFamily: 'var(--font-content)', color: '#000000' }}>{displayHadith.english_narrator}</p>
                      </div>
                    )}
                    <div className="mb-4">
                      <p className="text-sm font-semibold mb-2" style={{ fontFamily: 'var(--font-content)', color: '#000000' }}>English Translation:</p>
                      <p className="leading-relaxed whitespace-pre-wrap" style={{ fontFamily: 'var(--font-content)', color: '#000000' }}>{displayHadith.english_translation}</p>
                    </div>
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <p className="text-sm font-semibold" style={{ fontFamily: 'var(--font-content)', color: '#000000' }}>Arabic Text:</p>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            copyArabicText(displayHadith.arabic_text, displayHadith.hadith_number);
                          }}
                          className="px-3 py-1 text-xs rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl border-2 border-black flex items-center gap-1 font-semibold"
                          style={{ backgroundColor: '#000000', color: '#f2e9dd', fontFamily: 'var(--font-content)' }}
                        >
                          {copiedHadithNumber === displayHadith.hadith_number ? (
                            <>
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                              Copied!
                            </>
                          ) : (
                            <>
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                              </svg>
                              Copy Arabic
                            </>
                          )}
                        </button>
                      </div>
                      <p 
                        className="leading-relaxed text-lg"
                        dir="rtl"
                        style={{ fontFamily: 'Arial, sans-serif', color: '#000000' }}
                      >
                        {displayHadith.arabic_text}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
            </>
          )}

          {!isLoading && hadithList.length === 0 && searchQuery && (
            <div className="text-center py-12">
              <p style={{ fontFamily: 'var(--font-content)', color: '#000000', opacity: 0.6 }}>No results found for &quot;{searchQuery}&quot;</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

