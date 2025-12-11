"use client";

import { useEffect, useRef, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { saveChainSession } from "@/lib/firebase/firestore";
import { generateMermaidCode } from "@/components/hadith-analyzer/visualization/utils";
import type { Chain } from "@/types/hadith";

interface UseChainAutoSaveProps {
  hadithText: string;
  chains: Chain[];
  currentSessionId?: string | null;
  onSessionIdChange?: (sessionId: string | null) => void;
}

export function useChainAutoSave({
  hadithText,
  chains,
  currentSessionId,
  onSessionIdChange,
}: UseChainAutoSaveProps) {
  const { user } = useAuth();
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastSavedStateRef = useRef<string>("");

  const saveToFirestore = useCallback(async () => {
    if (!user) return;

    // Only save if there's meaningful content
    const hasContent = hadithText.trim().length > 0 || chains.length > 0;
    if (!hasContent) return;

    // Generate current state hash to avoid unnecessary saves
    const currentState = JSON.stringify({
      hadithText,
      chains: chains.map((c) => c.id),
    });

    if (currentState === lastSavedStateRef.current) {
      return; // No changes since last save
    }

    try {
      const mermaidCode = chains.length > 0 ? generateMermaidCode(chains) : "";
      const sessionName = currentSessionId
        ? undefined // Don't update name on auto-save
        : `Chain Analysis - ${new Date().toLocaleDateString()}`;

      const sessionId = await saveChainSession(
        user.uid,
        {
          name: sessionName || "Untitled",
          hadithText,
          chains,
          mermaidCode,
        },
        currentSessionId || undefined
      );

      if (sessionId && sessionId !== currentSessionId && onSessionIdChange) {
        onSessionIdChange(sessionId);
      }

      lastSavedStateRef.current = currentState;
    } catch (error) {
      console.error("Error auto-saving chain session:", error);
    }
  }, [user, hadithText, chains, currentSessionId, onSessionIdChange]);

  // Debounced auto-save (every 8 seconds)
  useEffect(() => {
    if (!user) return;

    // Clear existing timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    // Set new timeout
    saveTimeoutRef.current = setTimeout(() => {
      saveToFirestore();
    }, 8000); // 8 second debounce

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [user, hadithText, chains, saveToFirestore]);

  // Save on unmount
  useEffect(() => {
    return () => {
      if (user && (hadithText.trim().length > 0 || chains.length > 0)) {
        saveToFirestore();
      }
    };
  }, []); // Only run on unmount

  return { saveToFirestore };
}
