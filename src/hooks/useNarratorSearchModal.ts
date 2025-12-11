"use client";

import { useEffect, useRef } from 'react';

interface UseNarratorSearchModalProps {
  showModal: boolean;
  query: string;
  onSearch: (query: string, offset: number) => void;
  onClear: () => void;
  debounceMs?: number;
  minLength?: number;
}

export function useNarratorSearchModal({
  showModal,
  query,
  onSearch,
  onClear,
  debounceMs = 100,
  minLength = 1
}: UseNarratorSearchModalProps) {
  const lastQueryRef = useRef<string>('');

  useEffect(() => {
    // Only search if modal is open and query actually changed
    if (showModal && query.trim() && query !== lastQueryRef.current) {
      lastQueryRef.current = query;
      const timeoutId = setTimeout(() => {
        onSearch(query, 0);
      }, debounceMs);

      return () => clearTimeout(timeoutId);
    } else if (showModal && !query.trim()) {
      lastQueryRef.current = '';
      onClear();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, showModal, debounceMs, minLength]);
}