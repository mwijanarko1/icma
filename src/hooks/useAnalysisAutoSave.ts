"use client";

import { useEffect, useRef, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { saveAnalysisSession } from "@/lib/firebase/firestore";
import type { SelectedHadith, Step } from "@/types/analysis";

interface UseAnalysisAutoSaveProps {
  selectedHadiths: SelectedHadith[];
  activeStep: number;
  steps: Step[];
  currentSessionId?: string | null;
  onSessionIdChange?: (sessionId: string | null) => void;
}

export function useAnalysisAutoSave({
  selectedHadiths,
  activeStep,
  steps,
  currentSessionId,
  onSessionIdChange,
}: UseAnalysisAutoSaveProps) {
  const { user } = useAuth();
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastSavedStateRef = useRef<string>("");

  const saveToFirestore = useCallback(async () => {
    if (!user) return;

    // Only save if there's meaningful content
    const hasContent = selectedHadiths.length > 0 || steps.some((s) => s.status !== "pending");
    if (!hasContent) return;

    // Generate current state hash to avoid unnecessary saves
    const currentState = JSON.stringify({
      selectedHadiths: selectedHadiths.map((h) => h.hadith_number),
      activeStep,
      steps: steps.map((s) => s.status),
    });

    if (currentState === lastSavedStateRef.current) {
      return; // No changes since last save
    }

    try {
      const sessionName = currentSessionId
        ? undefined // Don't update name on auto-save
        : `Analysis Session - ${new Date().toLocaleDateString()}`;

      const sessionId = await saveAnalysisSession(
        user.uid,
        {
          name: sessionName || "Untitled",
          selectedHadiths,
          activeStep,
          steps,
        },
        currentSessionId || undefined
      );

      if (sessionId && sessionId !== currentSessionId && onSessionIdChange) {
        onSessionIdChange(sessionId);
      }

      lastSavedStateRef.current = currentState;
    } catch (error) {
      console.error("Error auto-saving analysis session:", error);
    }
  }, [user, selectedHadiths, activeStep, steps, currentSessionId, onSessionIdChange]);

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
  }, [user, selectedHadiths, activeStep, steps, saveToFirestore]);

  // Save on unmount
  useEffect(() => {
    return () => {
      if (user && (selectedHadiths.length > 0 || steps.some((s) => s.status !== "pending"))) {
        saveToFirestore();
      }
    };
  }, []); // Only run on unmount

  return { saveToFirestore };
}
