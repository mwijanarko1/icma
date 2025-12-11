"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import Header from "@/components/Header";
import ChainSessionsList from "@/components/profile/ChainSessionsList";
import AnalysisSessionsList from "@/components/profile/AnalysisSessionsList";

export default function ProfilePage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth/signin");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: "#f2e9dd" }}>
        <Header />
        <div className="flex items-center justify-center min-h-[calc(100vh-85px)]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
            <p style={{ fontFamily: "var(--font-content)", color: "#000000" }}>Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#f2e9dd" }}>
      <Header />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-2">
            {user.photoURL ? (
              <img
                src={user.photoURL}
                alt={user.displayName || "User"}
                className="w-16 h-16 rounded-full border-2 border-black"
              />
            ) : (
              <div
                className="w-16 h-16 rounded-full border-2 border-black flex items-center justify-center"
                style={{ backgroundColor: "#000000", color: "#f2e9dd" }}
              >
                <span className="text-2xl font-semibold">
                  {user.email?.[0].toUpperCase() || "U"}
                </span>
              </div>
            )}
            <div>
              <h1
                className="text-3xl font-bold"
                style={{ fontFamily: "var(--font-title)", color: "#000000" }}
              >
                {user.displayName || "User Profile"}
              </h1>
              <p
                className="text-sm"
                style={{ fontFamily: "var(--font-content)", color: "#000000", opacity: 0.7 }}
              >
                {user.email}
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-12">
          {/* Chain Analyses Section */}
          <section>
            <h2
              className="text-2xl font-bold mb-6"
              style={{ fontFamily: "var(--font-title)", color: "#000000" }}
            >
              Chain Analyses
            </h2>
            <ChainSessionsList />
          </section>

          {/* Analysis Sessions Section */}
          <section>
            <h2
              className="text-2xl font-bold mb-6"
              style={{ fontFamily: "var(--font-title)", color: "#000000" }}
            >
              Analysis Sessions
            </h2>
            <AnalysisSessionsList />
          </section>
        </div>
      </div>
    </div>
  );
}
