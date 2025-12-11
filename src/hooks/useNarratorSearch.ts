"use client";

import { useEffect, useRef } from 'react';

interface UseNarratorSearchProps {
  query: string;
  onSearch: (query: string, offset: number) => void;
  onClear: () => void;
  debounceMs?: number;
  minLength?: number;
}

export function useNarratorSearch({
  query,
  onSearch,
  onClear,
  debounceMs = 300,
  minLength = 2
}: UseNarratorSearchProps) {
  const lastQueryRef = useRef<string>('');

  useEffect(() => {
    const trimmedQuery = query.trim();

    // Only search if query actually changed
    if (trimmedQuery.length >= minLength && trimmedQuery !== lastQueryRef.current) {
      lastQueryRef.current = trimmedQuery;
      const timeoutId = setTimeout(() => {
        onSearch(trimmedQuery, 0);
      }, debounceMs);

      return () => clearTimeout(timeoutId);
    } else if (trimmedQuery.length < minLength) {
      lastQueryRef.current = '';
      onClear();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, minLength, debounceMs]);
}