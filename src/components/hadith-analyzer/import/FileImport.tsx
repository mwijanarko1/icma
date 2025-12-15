"use client";

import { useRef } from 'react';
import type { FileImportProps } from './types';
import type { Chain } from '@/types/hadith';

export function FileImport({ onImport, onBack }: FileImportProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const jsonData = JSON.parse(event.target?.result as string);

        // Validate the imported data structure
        if (!jsonData.chains || !Array.isArray(jsonData.chains)) {
          throw new Error('Invalid JSON format: missing or invalid chains array');
        }

        // Validate each chain structure
        jsonData.chains.forEach((chain: Chain, index: number) => {
          if (!chain.id || !chain.narrators || !Array.isArray(chain.narrators)) {
            throw new Error(`Invalid chain ${index + 1}: missing required fields`);
          }
        });

        // Confirm import with user
        const confirmed = window.confirm(
          `Import ${jsonData.chains.length} chains? This will replace all current data.`
        );

        if (!confirmed) return;

        // Import the data with backward compatibility
        // Migrate old chains that have hadithText to new format with chainText and matn
        const migratedChains = jsonData.chains.map((chain: { hadithText?: string; chainText?: string; matn?: string; [key: string]: unknown }) => {
          if ('hadithText' in chain && !('chainText' in chain)) {
            // Old format: migrate hadithText to chainText, leave matn empty
            return {
              ...chain,
              chainText: chain.hadithText || '',
              matn: ''
            };
          }
          // New format or already migrated
          return {
            ...chain,
            chainText: chain.chainText || '',
            matn: chain.matn || ''
          };
        });

        onImport({
          hadithText: jsonData.hadithText || '',
          chains: migratedChains,
          activeTab: jsonData.activeTab || 'llm',
          selectedChainIndex: jsonData.selectedChainIndex || 0,
          showVisualization: jsonData.showVisualization || false
        });
      } catch (error) {
        console.error('Import failed:', error instanceof Error ? error.message : 'Invalid JSON file');
      }
    };
    reader.readAsText(file);

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-3">
      <div className="text-center py-4">
        <label className="inline-block">
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleFileSelect}
            className="hidden"
          />
          <div
            onClick={handleClick}
            className="w-full p-8 border-2 border-dashed border-black rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
            style={{ fontFamily: 'var(--font-content)' }}
          >
            <svg className="w-12 h-12 mx-auto mb-4" style={{ color: '#000000', opacity: 0.6 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            <p className="text-center" style={{ color: '#000000', opacity: 0.7 }}>
              Click to select JSON file or drag and drop
            </p>
          </div>
        </label>
      </div>
      <button
        onClick={onBack}
        className="w-full px-4 py-2 text-sm hover:opacity-80 transition-opacity"
        style={{ fontFamily: 'var(--font-content)', color: '#000000', opacity: 0.7 }}
      >
        ← Back to options
      </button>
    </div>
  );
}

