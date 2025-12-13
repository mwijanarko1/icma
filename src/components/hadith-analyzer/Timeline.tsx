"use client";

import React from 'react';
import type { Chain, Narrator } from '@/types/hadith';

interface TimelineProps {
  chains: Chain[];
}

interface TimelineNarrator {
  narrator: Narrator;
  birthYear?: number;
  deathYear?: number;
  isProphet: boolean;
}

// Function to normalize Arabic text by removing harakat (diacritics)
const normalizeArabic = (text: string): string => {
  return text
    .replace(/[ًٌٍَُِّْ]/g, '') // Remove diacritics (harakats)
    .replace(/[أإآا]/g, 'ا') // Normalize alef variations
    .replace(/[ىي]/g, 'ي') // Normalize yeh variations
    .replace(/[ةه]/g, 'ه') // Normalize teh marbuta
    .trim();
};

export function Timeline({ chains }: TimelineProps) {
  // Collect all unique narrators from all chains
  const allNarrators = new Map<string, Narrator>();
  chains.forEach(chain => {
    chain.narrators.forEach(narrator => {
      // Use narrator ID or arabic name + number as unique key
      const key = narrator.narratorId || `${narrator.arabicName}-${narrator.number}`;
      if (!allNarrators.has(key)) {
        allNarrators.set(key, narrator);
      }
    });
  });

  const narrators = Array.from(allNarrators.values());

  // Process narrators for timeline
  const timelineNarrators: TimelineNarrator[] = narrators.map(narrator => {
    const isProphet = normalizeArabic(narrator.arabicName) === 'رسول الله';

    let birthYear: number | undefined;
    let deathYear: number | undefined;

    if (isProphet) {
      // Prophet's dates are fixed
      birthYear = 570; // 53 BH / 570 CE
      deathYear = 632; // 10 AH / 632 CE
    } else if (narrator.databaseNarrator) {
      // Use database dates
      birthYear = narrator.databaseNarrator.birthYearCE;
      deathYear = narrator.databaseNarrator.deathYearCE;
    }

    return {
      narrator,
      birthYear,
      deathYear,
      isProphet
    };
  });

  // Calculate timeline range
  const allYears = timelineNarrators.flatMap(n => [n.birthYear, n.deathYear]).filter(Boolean) as number[];
  if (allYears.length === 0) return null;

  const minYear = Math.min(...allYears);
  const maxYear = Math.max(...allYears);
  const timelineStart = Math.min(minYear, 570); // Start from Prophet's birth year at latest
  const timelineEnd = Math.max(maxYear, 632); // End at Prophet's death year at earliest

  const timelineWidth = Math.max(timelineEnd - timelineStart, 1); // Ensure minimum width of 1 to avoid division by zero

  return (
    <div className="bg-white rounded-xl sm:rounded-2xl border-2 border-black w-full min-w-0 max-w-full mt-4" style={{ boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(0, 0, 0, 0.1)' }}>
      <div className="p-4 sm:p-6">
        <h3 className="text-lg font-semibold mb-4" style={{ fontFamily: 'var(--font-title)', color: '#000000' }}>
          Chronological Timeline
        </h3>

      <div className="relative">
        {/* Timeline axis */}
        <div className="h-1 bg-black mb-8"></div>

        {/* Year markers */}
        <div className="flex justify-between text-xs mb-4" style={{ fontFamily: 'var(--font-content)', color: '#000000', opacity: 0.7 }}>
          <span>{timelineStart} CE</span>
          <span>{timelineEnd} CE</span>
        </div>

        {/* Narrator bars */}
        <div className="space-y-4">
          {timelineNarrators.map((timelineNarrator, index) => {
            const { narrator, birthYear, deathYear, isProphet } = timelineNarrator;

            if (!birthYear && !deathYear) return null;

            // Calculate position and width
            const startYear = birthYear || deathYear!;
            const endYear = deathYear || startYear;
            const startPosition = ((startYear - timelineStart) / timelineWidth) * 100;
            const width = (((endYear - startYear) / timelineWidth) * 100) || 1; // Minimum 1% width for points

            return (
              <div key={`timeline-${narrator.narratorId || narrator.arabicName}-${index}`} className="relative mb-6">
                {/* Narrator name */}
                <div className="flex items-center mb-2">
                  <div
                    className={`w-3 h-3 rounded-full mr-3 ${isProphet ? 'bg-green-600' : 'bg-blue-600'}`}
                    title={isProphet ? 'Prophet Muhammad (ﷺ)' : narrator.englishName}
                  ></div>
                  <span
                    className="text-sm font-medium truncate"
                    style={{ fontFamily: 'var(--font-content)', color: '#000000' }}
                    title={narrator.englishName}
                  >
                    {isProphet ? 'Prophet Muhammad (ﷺ)' : narrator.englishName}
                  </span>
                </div>

                {/* Timeline bar */}
                <div className="relative h-4 bg-gray-200 rounded mb-3">
                  <div
                    className={`absolute top-0 h-full rounded ${isProphet ? 'bg-green-600' : 'bg-blue-600'}`}
                    style={{
                      left: `${startPosition}%`,
                      width: `${Math.max(width, 1)}%`,
                      minWidth: '4px'
                    }}
                    title={`${startYear}${birthYear && deathYear ? ` - ${endYear}` : ''} CE`}
                  ></div>
                </div>

                {/* Birth and death dates under narrator name */}
                <div className="text-xs space-y-1" style={{ fontFamily: 'var(--font-content)', color: '#000000', opacity: 0.7 }}>
                  {birthYear && (
                    <div className="flex items-center gap-2">
                      <span className="font-medium min-w-[35px]">Birth:</span>
                      <span>{birthYear} CE</span>
                    </div>
                  )}
                  {deathYear && (
                    <div className="flex items-center gap-2">
                      <span className="font-medium min-w-[35px]">Death:</span>
                      <span>{deathYear} CE</span>
                    </div>
                  )}
                  {!birthYear && !deathYear && (
                    <div className="text-gray-500 italic">No dates available</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      </div>
    </div>
  );
}