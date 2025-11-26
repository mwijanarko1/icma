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
}

export function HadithTab({}: HadithTabProps) {
  const [collection, setCollection] = useState<HadithCollection>('bukhari');
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

  const collections: { value: HadithCollection; label: string }[] = [
    { value: 'bukhari', label: 'Sahih al-Bukhari' },
    { value: 'muslim', label: 'Sahih Muslim' },
    { value: 'nasai', label: 'Sunan an-Nasa\'i' },
    { value: 'tirmidhi', label: 'Jami` at-Tirmidhi' },
    { value: 'abudawud', label: 'Sunan Abi Dawud' },
    { value: 'ibnmajah', label: 'Sunan Ibn Majah' },
  ];


  const fetchHadithList = useCallback(async (start: number, end: number) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/hadith?collection=${collection}&start=${start}&end=${end}&limit=${limit}&offset=${offset}`);
      const data = await response.json();
      if (data.success) {
        setHadithList(data.data);
        setTotal(data.total);
      } else {
        setError(data.error || 'Failed to fetch hadith');
        setHadithList([]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setHadithList([]);
    } finally {
      setIsLoading(false);
    }
  }, [collection, offset, limit]);

  const searchHadith = useCallback(async (query: string, searchOffset: number = 0) => {
    if (!query.trim()) {
      setHadithList([]);
      setTotal(0);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/hadith?collection=${collection}&search=${encodeURIComponent(query)}&limit=${limit}&offset=${searchOffset}`);
      const data = await response.json();
      if (data.success) {
        setHadithList(data.data);
        setTotal(data.total);
      } else {
        setError(data.error || 'Failed to search hadith');
        setHadithList([]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setHadithList([]);
    } finally {
      setIsLoading(false);
    }
  }, [collection, limit]);

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
    if (searchQuery.trim()) {
      const timeoutId = setTimeout(() => {
        // If search query changed, always use offset 0. Otherwise use current offset for pagination
        const searchOffset = searchQuery !== previousSearchQuery.current ? 0 : offset;
        previousSearchQuery.current = searchQuery;
        searchHadith(searchQuery, searchOffset);
      }, 300);
      return () => clearTimeout(timeoutId);
    } else {
      // When no search query, fetch all hadith with pagination
      previousSearchQuery.current = '';
      fetchHadithList(1, 10000);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [collection, offset, searchQuery]);

  // Reset expanded hadith when collection changes or pagination occurs
  useEffect(() => {
    setExpandedHadith(null);
  }, [collection, offset, searchQuery]);

  return (
    <div className="space-y-6">
      {/* Combined Controls Card */}
      <div className="sticky top-0 z-10 bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-lg shadow-md border-b border-gray-200 dark:border-gray-700 p-4">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Collection Select */}
          <div className="flex-1">
            <select
              value={collection}
              onChange={(e) => {
                setCollection(e.target.value as HadithCollection);
                setOffset(0);
                setHadithList([]);
                setSearchQuery('');
              }}
              className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              {collections.map((col) => (
                <option key={col.value} value={col.value}>
                  {col.label}
                </option>
              ))}
            </select>
          </div>

          {/* Search Bar */}
          <div className="flex-1 flex gap-2">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setOffset(0);
              }}
              placeholder="Search by hadith number, English text, or Arabic text..."
              className="flex-1 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
            {searchQuery && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setOffset(0);
                }}
                className="px-3 py-2 text-sm bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
        </div>
      )}

      {/* Loading */}
      {isLoading && (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      )}

      {/* List View */}
      {(
        <div className="space-y-4">
          {hadithList.length > 0 && !isLoading && (
            <>
              <div className="flex justify-between items-center">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {searchQuery 
                    ? `Found ${total} results for "${searchQuery}"`
                    : `Showing ${hadithList.length} of ${total} hadith`
                  }
                </p>
            <div className="flex gap-2">
              <button
                onClick={() => setOffset(Math.max(0, offset - limit))}
                disabled={offset === 0}
                className="px-3 py-1 text-sm bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button
                onClick={() => setOffset(offset + limit)}
                disabled={offset + limit >= total}
                className="px-3 py-1 text-sm bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>

          {hadithList.map((h) => {
            const hadithKey = h.sub_version ? `${h.hadith_number}${h.sub_version}` : h.hadith_number.toString();
            const isExpanded = expandedHadith === hadithKey;
            const displayHadith = h;
            
            return (
              <div
                key={hadithKey}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 ease-in-out"
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
                    <h4 className="font-semibold text-gray-900 dark:text-white">{h.reference}</h4>
                    <div className="flex items-center gap-2">
                      {h.in_book_reference && (
                        <span className="text-xs text-gray-500 dark:text-gray-400">{h.in_book_reference}</span>
                      )}
                      <svg
                        className={`w-5 h-5 text-gray-500 dark:text-gray-400 transition-transform ${isExpanded ? 'transform rotate-180' : ''}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                  {!isExpanded && (
                    <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2">
                      {h.english_translation.substring(0, 200)}...
                    </p>
                  )}
                </div>
                
                {isExpanded && displayHadith && (
                  <div className="px-4 pb-4 border-t border-gray-200 dark:border-gray-700 pt-4 transition-all duration-200 ease-in-out">
                    {displayHadith.english_narrator && (
                      <div className="mb-4">
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Narrator:</p>
                        <p className="text-gray-900 dark:text-white">{displayHadith.english_narrator}</p>
                      </div>
                    )}
                    <div className="mb-4">
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">English Translation:</p>
                      <p className="text-gray-900 dark:text-white leading-relaxed whitespace-pre-wrap">{displayHadith.english_translation}</p>
                    </div>
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Arabic Text:</p>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            copyArabicText(displayHadith.arabic_text, displayHadith.hadith_number);
                          }}
                          className="px-3 py-1 text-xs bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center gap-1"
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
                        className="text-gray-900 dark:text-white leading-relaxed text-lg"
                        dir="rtl"
                        style={{ fontFamily: 'Arial, sans-serif' }}
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
              <p className="text-gray-500 dark:text-gray-400">No results found for &quot;{searchQuery}&quot;</p>
            </div>
          )}

          {!isLoading && hadithList.length === 0 && !searchQuery && !error && (
            <div className="text-center py-12">
              <p className="text-gray-500 dark:text-gray-400">No hadith found</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

