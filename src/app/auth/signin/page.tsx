"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signInWithGoogle } from "@/lib/firebase/auth";
import { useAuth } from "@/contexts/AuthContext";
import Header from "@/components/Header";

export default function SignInPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && user) {
      // User is already signed in, redirect to home
      router.push("/");
    }
  }, [user, loading, router]);

  const handleSignIn = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      await signInWithGoogle();
      // Redirect will happen via useEffect when user state updates
      router.push("/");
    } catch (err) {
      console.error("Sign in error:", err);
      setError(err instanceof Error ? err.message : "Failed to sign in. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: '#f2e9dd' }}>
        <Header />
        <div className="flex items-center justify-center min-h-[calc(100vh-85px)]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
            <p style={{ fontFamily: 'var(--font-content)', color: '#000000' }}>Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#f2e9dd' }}>
      <Header />
      <div className="flex items-center justify-center min-h-[calc(100vh-85px)] px-4">
        <div className="w-full max-w-md">
          <div className="rounded-xl border-2 border-black bg-white p-8 shadow-lg">
            <h1 className="text-3xl font-bold mb-2 text-center" style={{ fontFamily: 'var(--font-title)', color: '#000000' }}>
              Sign In
            </h1>
            <p className="text-center mb-8" style={{ fontFamily: 'var(--font-content)', color: '#000000', opacity: 0.7 }}>
              Sign in to save your analyses and chain data to the cloud and access them from anywhere
            </p>

            {error && (
              <div className="mb-6 p-4 rounded-lg border-2 border-red-500 bg-red-50">
                <p className="text-sm text-red-700" style={{ fontFamily: 'var(--font-content)' }}>
                  {error}
                </p>
              </div>
            )}

            <button
              onClick={handleSignIn}
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-3 px-6 py-4 rounded-lg font-semibold text-base transition-all duration-200 hover:shadow-lg hover:scale-105 hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed border-2 border-black"
              style={{ 
                backgroundColor: isLoading ? '#666666' : '#000000', 
                color: '#f2e9dd', 
                fontFamily: 'var(--font-content)' 
              }}
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Signing in...</span>
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                  <span>Sign in with Google</span>
                </>
              )}
            </button>

            <p className="text-xs text-center mt-6" style={{ fontFamily: 'var(--font-content)', color: '#000000', opacity: 0.6 }}>
              By signing in, you agree to our{' '}
              <Link
                href="/terms-of-service"
                className="underline hover:no-underline font-medium"
                style={{ color: '#000000', opacity: 0.8 }}
              >
                Terms of Service
              </Link>
              {' '}and{' '}
              <Link
                href="/privacy-policy"
                className="underline hover:no-underline font-medium"
                style={{ color: '#000000', opacity: 0.8 }}
              >
                Privacy Policy
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
