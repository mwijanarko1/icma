"use client";

import React, { useState } from 'react';
import { useHadithAnalyzerContext } from '@/contexts/HadithAnalyzerContext';

export const SessionControls = React.memo(function SessionControls() {
  const { handleSaveChainAnalysis, handleNewHadith, handleRenameSession, isSaving, currentSessionName, state } = useHadithAnalyzerContext();
  const { chains } = state;
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(currentSessionName || '');

  if (chains.length === 0) {
    return null;
  }

  const handleStartEdit = () => {
    setEditName(currentSessionName || '');
    setIsEditing(true);
  };

  const handleSaveEdit = async () => {
    if (editName.trim() && editName !== currentSessionName) {
      await handleRenameSession(editName.trim());
    }
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setEditName(currentSessionName || '');
    setIsEditing(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSaveEdit();
    } else if (e.key === 'Escape') {
      handleCancelEdit();
    }
  };

  return (
    <div className="mb-6">
      {/* Mobile layout: Session name above buttons */}
      <div className="block sm:hidden">
        {currentSessionName && (
          <div className="flex justify-center items-center mb-4 gap-2">
            {isEditing ? (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  onKeyDown={handleKeyPress}
                  className="text-xl font-bold border-2 border-black rounded px-2 py-1 bg-white"
                  style={{ fontFamily: 'var(--font-title)', color: '#000000' }}
                  autoFocus
                />
                <button
                  onClick={handleSaveEdit}
                  className="p-1 rounded hover:bg-green-100"
                  title="Save name"
                >
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </button>
                <button
                  onClick={handleCancelEdit}
                  className="p-1 rounded hover:bg-red-100"
                  title="Cancel"
                >
                  <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ) : (
              <>
                <p className="text-xl font-bold" style={{ fontFamily: 'var(--font-title)', color: '#000000' }}>
                  {currentSessionName}
                </p>
                <button
                  onClick={handleStartEdit}
                  className="p-1 rounded hover:bg-gray-100"
                  title="Rename session"
                >
                  <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
              </>
            )}
          </div>
        )}
        <div className="flex flex-col gap-4">
          <div className="flex justify-center gap-4">
          <button
            onClick={handleSaveChainAnalysis}
            disabled={isSaving}
            className="px-6 py-3 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl border-2 border-black flex items-center gap-2 text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            style={{ backgroundColor: '#000000', color: '#f2e9dd', fontFamily: 'var(--font-content)' }}
            title="Save your current chain analysis session"
            aria-label={isSaving ? "Saving analysis session..." : "Save current chain analysis session"}
            aria-disabled={isSaving}
          >
              {isSaving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Saving...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                  </svg>
                  Save Session
                </>
              )}
            </button>
            <button
              onClick={handleNewHadith}
              className="px-6 py-3 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl border-2 border-black flex items-center gap-2 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              style={{ backgroundColor: '#f2e9dd', color: '#000000', fontFamily: 'var(--font-content)' }}
              title="Start a new analysis with a different hadith"
              aria-label="Start new hadith analysis"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              New Hadith
            </button>
          </div>
          <div className="flex justify-center">
            <button
              onClick={() => {
                // Use a simple export for now - could be improved with proper service call
                const dataStr = JSON.stringify({ chains, sessionName: currentSessionName }, null, 2);
                const dataBlob = new Blob([dataStr], { type: 'application/json' });
                const url = URL.createObjectURL(dataBlob);
                const link = document.createElement('a');
                link.href = url;
                link.download = `hadith-analysis-${new Date().toISOString().split('T')[0]}.json`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                URL.revokeObjectURL(url);
              }}
              className="px-6 py-3 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl border-2 border-black flex items-center gap-2 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              style={{ backgroundColor: '#000000', color: '#f2e9dd', fontFamily: 'var(--font-content)' }}
              title="Export all chains and data as JSON"
              aria-label="Export chain analysis data as JSON file"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Export Chains
            </button>
          </div>
        </div>
      </div>

      {/* Desktop layout: Buttons with session name inline */}
      <div className="hidden sm:flex items-center justify-between">
        <div className="flex items-center gap-4">
          {currentSessionName && (
            <div className="flex items-center gap-2">
              {isEditing ? (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    onKeyDown={handleKeyPress}
                    className="text-xl font-bold border-2 border-black rounded px-2 py-1 bg-white"
                    style={{ fontFamily: 'var(--font-title)', color: '#000000' }}
                    autoFocus
                  />
                  <button
                    onClick={handleSaveEdit}
                    className="p-1 rounded hover:bg-green-100"
                    title="Save name"
                  >
                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </button>
                  <button
                    onClick={handleCancelEdit}
                    className="p-1 rounded hover:bg-red-100"
                    title="Cancel"
                  >
                    <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ) : (
                <>
                  <p className="text-xl font-bold" style={{ fontFamily: 'var(--font-title)', color: '#000000' }}>
                    {currentSessionName}
                  </p>
                  <button
                    onClick={handleStartEdit}
                    className="p-1 rounded hover:bg-gray-100"
                    title="Rename session"
                  >
                    <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                </>
              )}
            </div>
          )}
        </div>
        <div className="flex gap-4">
          <button
            onClick={handleSaveChainAnalysis}
            disabled={isSaving}
            className="px-6 py-3 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl border-2 border-black flex items-center gap-2 text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            style={{ backgroundColor: '#000000', color: '#f2e9dd', fontFamily: 'var(--font-content)' }}
            title="Save your current chain analysis session"
            aria-label={isSaving ? "Saving analysis session..." : "Save current chain analysis session"}
            aria-disabled={isSaving}
          >
            {isSaving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Saving...
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                </svg>
                Save Session
              </>
            )}
          </button>
          <button
            onClick={handleNewHadith}
            className="px-6 py-3 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl border-2 border-black flex items-center gap-2 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            style={{ backgroundColor: '#f2e9dd', color: '#000000', fontFamily: 'var(--font-content)' }}
            title="Start a new analysis with a different hadith"
            aria-label="Start new hadith analysis"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            New Hadith
          </button>
          <button
            onClick={() => {
              // Use a simple export for now - could be improved with proper service call
              const dataStr = JSON.stringify({ chains, sessionName: currentSessionName }, null, 2);
              const dataBlob = new Blob([dataStr], { type: 'application/json' });
              const url = URL.createObjectURL(dataBlob);
              const link = document.createElement('a');
              link.href = url;
              link.download = `hadith-analysis-${new Date().toISOString().split('T')[0]}.json`;
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
              URL.revokeObjectURL(url);
            }}
            className="px-6 py-3 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl border-2 border-black flex items-center gap-2 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            style={{ backgroundColor: '#000000', color: '#f2e9dd', fontFamily: 'var(--font-content)' }}
            title="Export all chains and data as JSON"
            aria-label="Export chain analysis data as JSON file"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Export Chains
          </button>
        </div>
      </div>
    </div>
  );
});