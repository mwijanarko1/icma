"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import Header from "@/components/Header";
import { CACHE_KEYS } from "@/lib/cache/constants";

export default function SettingsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [apiKey, setApiKey] = useState<string>("");
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);
  const [tempApiKey, setTempApiKey] = useState("");

  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth/signin");
    }
  }, [user, loading, router]);

  useEffect(() => {
    // Load API key from localStorage
    const savedApiKey = localStorage.getItem(CACHE_KEYS.API_KEY);
    if (savedApiKey) {
      setApiKey(savedApiKey);
    }
  }, []);

  const handleSaveApiKey = () => {
    if (tempApiKey.trim()) {
      localStorage.setItem(CACHE_KEYS.API_KEY, tempApiKey.trim());
      setApiKey(tempApiKey.trim());
      setShowApiKeyModal(false);
      setTempApiKey("");
    }
  };

  const handleClearCache = () => {
    localStorage.removeItem(CACHE_KEYS.HADITH_TEXT);
    localStorage.removeItem(CACHE_KEYS.CHAINS);
    localStorage.removeItem(CACHE_KEYS.SHOW_VISUALIZATION);
    localStorage.removeItem(CACHE_KEYS.API_KEY);
    localStorage.removeItem(CACHE_KEYS.ACTIVE_TAB);
    localStorage.removeItem(CACHE_KEYS.SELECTED_CHAIN);
    setApiKey("");
    // Reload the page to reset everything
    window.location.reload();
  };

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
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1
            className="text-3xl font-bold"
            style={{ fontFamily: "var(--font-title)", color: "#000000" }}
          >
            Settings
          </h1>
          <p
            className="text-sm mt-2"
            style={{ fontFamily: "var(--font-content)", color: "#000000", opacity: 0.7 }}
          >
            Manage your API keys and application preferences
          </p>
        </div>

        <div className="space-y-6">
          {/* API Key Section */}
          <div className="rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 border-2 border-black bg-white" style={{ boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(0, 0, 0, 0.1)' }}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full transition-colors ${
                  apiKey
                    ? 'bg-green-100'
                    : 'bg-yellow-100'
                }`}>
                  {apiKey ? (
                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                  )}
                </div>
                <div>
                  <h3 className="text-lg font-semibold" style={{ fontFamily: 'var(--font-title)', color: '#000000' }}>
                    LLM API Key
                  </h3>
                  <p className="text-sm mt-0.5" style={{ fontFamily: 'var(--font-content)', color: '#000000', opacity: 0.7 }}>
                    {apiKey ? 'API key configured' : 'Required for narrator extraction'}
                  </p>
                </div>
              </div>
            </div>
            <button
              onClick={() => setShowApiKeyModal(true)}
              className="w-full text-sm font-semibold px-4 py-2.5 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl border-2 border-black"
              style={{ backgroundColor: '#000000', color: '#f2e9dd', fontFamily: 'var(--font-content)' }}
            >
              {apiKey ? 'Update API Key' : 'Add API Key'}
            </button>
          </div>

          {/* Clear Cache */}
          <div className="rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 border-2 border-black bg-white" style={{ boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(0, 0, 0, 0.1)' }}>
            <div className="flex items-center gap-3 mb-4">
              <svg className="w-6 h-6 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              <div>
                <h3 className="text-lg font-semibold" style={{ fontFamily: 'var(--font-title)', color: '#000000' }}>
                  Clear Cache
                </h3>
                <p className="text-sm mt-0.5" style={{ fontFamily: 'var(--font-content)', color: '#000000', opacity: 0.7 }}>
                  Reset all saved data
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                if (window.confirm('Are you sure you want to clear all cached data? This will reset everything to start fresh.')) {
                  handleClearCache();
                }
              }}
              className="w-full text-sm font-semibold px-4 py-2.5 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl border-2 border-black"
              style={{ backgroundColor: '#000000', color: '#f2e9dd', fontFamily: 'var(--font-content)' }}
            >
              Clear All Cache
            </button>
          </div>
        </div>
      </div>

      {/* API Key Modal */}
      {showApiKeyModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full border-2 border-black">
            <h3 className="text-xl font-bold mb-4" style={{ fontFamily: 'var(--font-title)', color: '#000000' }}>
              {apiKey ? 'Update API Key' : 'Add API Key'}
            </h3>
            <p className="text-sm mb-4" style={{ fontFamily: 'var(--font-content)', color: '#000000', opacity: 0.7 }}>
              Enter your OpenAI API key for narrator extraction functionality.
            </p>
            <input
              type="password"
              value={tempApiKey}
              onChange={(e) => setTempApiKey(e.target.value)}
              placeholder="sk-..."
              className="w-full px-3 py-2 border-2 border-black rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-black"
              style={{ fontFamily: 'var(--font-content)' }}
            />
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowApiKeyModal(false);
                  setTempApiKey("");
                }}
                className="flex-1 px-4 py-2 border-2 border-black rounded-lg transition-colors hover:bg-gray-100"
                style={{ fontFamily: 'var(--font-content)', color: '#000000' }}
              >
                Cancel
              </button>
              <button
                onClick={handleSaveApiKey}
                disabled={!tempApiKey.trim()}
                className="flex-1 px-4 py-2 border-2 border-black rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ backgroundColor: '#000000', color: '#f2e9dd', fontFamily: 'var(--font-content)' }}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}