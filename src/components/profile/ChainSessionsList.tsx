"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import {
  getUserChainSessions,
  deleteChainSession,
  updateChainSessionName,
} from "@/lib/firebase/firestore";
import type { ChainSession } from "@/types/firebase";
import SessionCard from "./SessionCard";

export default function ChainSessionsList() {
  const { user } = useAuth();
  const router = useRouter();
  const [sessions, setSessions] = useState<ChainSession[]>([]);
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
      const userSessions = await getUserChainSessions(user.uid);
      setSessions(userSessions);
    } catch (error) {
      console.error("Error loading chain sessions:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoad = async (session: ChainSession) => {
    setLoadingSessionId(session.id);
    try {
      // Store session data in sessionStorage to load in chain analyzer
      sessionStorage.setItem("loadChainSession", JSON.stringify({
        id: session.id,
        name: session.name, // Include the session name
        hadithText: session.hadithText,
        chains: session.chains,
        mermaidCode: session.mermaidCode,
      }));
      router.push("/chain-analyzer");
    } catch (error) {
      console.error("Error loading session:", error);
    } finally {
      setLoadingSessionId(null);
    }
  };

  const handleDelete = async (sessionId: string) => {
    try {
      await deleteChainSession(sessionId);
      setSessions(sessions.filter((s) => s.id !== sessionId));
    } catch (error) {
      console.error("Error deleting session:", error);
    }
  };

  const handleRename = async (sessionId: string, newName: string) => {
    try {
      await updateChainSessionName(sessionId, newName);
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
          Loading chain analyses...
        </p>
      </div>
    );
  }

  if (sessions.length === 0) {
    return (
      <div className="text-center py-12">
        <p style={{ fontFamily: "var(--font-content)", color: "#000000", opacity: 0.6 }}>
          No chain analyses saved yet. Start analyzing chains to save your work.
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
          preview={session.hadithText.substring(0, 100)}
          onLoad={() => handleLoad(session)}
          onDelete={() => handleDelete(session.id)}
          onRename={(newName) => handleRename(session.id, newName)}
          isLoading={loadingSessionId === session.id}
        />
      ))}
    </div>
  );
}
