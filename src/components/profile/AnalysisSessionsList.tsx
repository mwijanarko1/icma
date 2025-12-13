"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import {
  getUserAnalysisSessions,
  deleteAnalysisSession,
  updateAnalysisSessionName,
} from "@/lib/firebase/firestore";
import type { AnalysisSession } from "@/types/firebase";
import SessionCard from "./SessionCard";

export default function AnalysisSessionsList() {
  const { user } = useAuth();
  const router = useRouter();
  const [sessions, setSessions] = useState<AnalysisSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingSessionId, setLoadingSessionId] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      loadSessions();
    }
  }, [user]);

  const loadSessions = async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const userSessions = await getUserAnalysisSessions(user.uid);
      setSessions(userSessions);
    } catch (error) {
      console.error("Error loading analysis sessions:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoad = async (session: AnalysisSession) => {
    setLoadingSessionId(session.id);
    try {

      // Convert Firestore Timestamps to regular dates for JSON serialization
      const serializableSession = {
        id: session.id,
        name: session.name,
        selectedHadiths: session.selectedHadiths,
        activeStep: session.activeStep,
        steps: session.steps,
        createdAt: session.createdAt?.toDate?.()?.toISOString() || session.createdAt,
        updatedAt: session.updatedAt?.toDate?.()?.toISOString() || session.updatedAt,
      };

      // Store session data in sessionStorage to load in analysis page
      sessionStorage.setItem("loadAnalysisSession", JSON.stringify(serializableSession));

      // Add a small delay to ensure sessionStorage is set before navigation
      setTimeout(() => {
        router.push("/analysis");
      }, 100);
    } catch (error) {
      console.error("❌ Error loading session:", error);
    } finally {
      setLoadingSessionId(null);
    }
  };

  const handleDelete = async (sessionId: string) => {
    try {
      await deleteAnalysisSession(sessionId);
      setSessions(sessions.filter((s) => s.id !== sessionId));
    } catch (error) {
      console.error("Error deleting session:", error);
    }
  };

  const handleRename = async (sessionId: string, newName: string) => {
    try {
      await updateAnalysisSessionName(sessionId, newName);
      setSessions(
        sessions.map((s) => (s.id === sessionId ? { ...s, name: newName } : s))
      );
    } catch (error) {
      console.error("Error renaming session:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black mx-auto mb-4"></div>
        <p style={{ fontFamily: "var(--font-content)", color: "#000000", opacity: 0.6 }}>
          Loading analysis sessions...
        </p>
      </div>
    );
  }

  if (sessions.length === 0) {
    return (
      <div className="text-center py-12">
        <p style={{ fontFamily: "var(--font-content)", color: "#000000", opacity: 0.6 }}>
          No analysis sessions saved yet. Start an analysis to save your work.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {sessions.map((session) => (
        <SessionCard
          key={session.id}
          id={session.id}
          name={session.name}
          createdAt={session.createdAt}
          updatedAt={session.updatedAt}
          preview={`${session.selectedHadiths.length} hadith(s) selected`}
          onLoad={() => handleLoad(session)}
          onDelete={() => handleDelete(session.id)}
          onRename={(newName) => handleRename(session.id, newName)}
          isLoading={loadingSessionId === session.id}
        />
      ))}
    </div>
  );
}
