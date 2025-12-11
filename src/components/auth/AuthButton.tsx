"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { signOut } from "@/lib/firebase/auth";

export default function AuthButton() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [isSigningOut, setIsSigningOut] = useState(false);

  const handleSignIn = () => {
    router.push("/auth/signin");
  };

  const handleSignOut = async () => {
    setIsSigningOut(true);
    try {
      await signOut();
      router.push("/");
    } catch (error) {
      console.error("Error signing out:", error);
    } finally {
      setIsSigningOut(false);
    }
  };

  if (loading) {
    return (
      <div className="w-8 h-8 rounded-full border-2 border-black animate-pulse" style={{ backgroundColor: '#f2e9dd' }} />
    );
  }

  if (user) {
    return (
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          {user.photoURL ? (
            <img
              src={user.photoURL}
              alt={user.displayName || "User"}
              className="w-8 h-8 rounded-full border-2 border-black"
            />
          ) : (
            <div className="w-8 h-8 rounded-full border-2 border-black flex items-center justify-center" style={{ backgroundColor: '#000000', color: '#f2e9dd' }}>
              <span className="text-xs font-semibold">
                {user.email?.[0].toUpperCase() || "U"}
              </span>
            </div>
          )}
          <span className="hidden lg:inline text-sm font-medium" style={{ fontFamily: 'var(--font-content)', color: '#000000' }}>
            {user.displayName || user.email?.split("@")[0]}
          </span>
        </div>
        <button
          onClick={handleSignOut}
          disabled={isSigningOut}
          className="px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 hover:opacity-80 disabled:opacity-50 border-2 border-black"
          style={{ backgroundColor: '#f2e9dd', color: '#000000', fontFamily: 'var(--font-content)' }}
        >
          {isSigningOut ? "Signing out..." : "Sign Out"}
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={handleSignIn}
      className="px-5 py-2.5 rounded-full font-semibold text-sm transition-all duration-200 hover:shadow-lg hover:scale-105 border-2 border-black"
      style={{ backgroundColor: '#000000', color: '#f2e9dd', fontFamily: 'var(--font-content)' }}
    >
      Sign In
    </button>
  );
}
