"use client";

import { useState } from "react";
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { REPUTATION_GRADES, ReputationGrade } from '@/lib/grading/constants';
import { getGradeColorClass, getGradeDescription, formatDeathYear } from '@/lib/grading/utils';
import { ReputationSelector } from './ReputationSelector';
import BasicModal from '@/components/ui/BasicModal';
import type { DraggableNarratorRowProps } from './types';

export function DraggableNarratorRow({
  narrator,
  index,
  isEditing,
  onUpdateNarrator,
  onUpdateReputation,
  onRemoveNarrator,
  onViewNarratorDetails,
  onUnmatchNarrator,
  onSearchNarrator
}: DraggableNarratorRowProps) {
  const [showGradeFormulaTooltip, setShowGradeFormulaTooltip] = useState(false);

  // Function to normalize Arabic text by removing harakat (diacritics)
  const normalizeArabic = (text: string): string => {
    return text
      .replace(/[ًٌٍَُِّْ]/g, '') // Remove diacritics (harakats)
      .replace(/[أإآا]/g, 'ا') // Normalize alef variations
      .replace(/[ىي]/g, 'ي') // Normalize yeh variations
      .replace(/[ةه]/g, 'ه') // Normalize teh marbuta
      .trim();
  };

  // Check if narrator is Prophet Muhammad (with or without harakat)
  const isProphet = normalizeArabic(narrator.arabicName) === 'رسول الله';
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    isDragging,
  } = useSortable({
    id: narrator.number.toString(),
    disabled: !isEditing
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: 'none', // Disable all transitions for instant feedback
    opacity: isDragging ? 0.8 : 1,
    zIndex: isDragging ? 50 : 'auto',
  };

  return (
    <>
      <tr
        ref={isEditing ? setNodeRef : undefined}
        style={style}
        className={
          isDragging
            ? 'bg-blue-100 shadow-lg ring-2 ring-blue-400'
            : 'hover:bg-gray-50'
        }
      >
        <td className="border-2 border-black px-4 py-2 text-center" style={{ fontFamily: 'var(--font-content)', color: '#000000' }}>
          <div className="flex items-center justify-center gap-2">
            {isEditing && (
              <button
                {...attributes}
                {...listeners}
                className={`cursor-grab active:cursor-grabbing p-2 rounded-md border-2 group ${
                  isDragging
                    ? 'bg-blue-200 border-blue-400 shadow-md'
                    : 'hover:bg-blue-100 border-black hover:border-blue-300'
                }`}
                aria-label="Drag to reorder narrator"
                title="Drag to reorder narrator in chain"
              >
                <svg className={`w-4 h-4 ${
                  isDragging
                    ? 'text-blue-700'
                    : 'text-gray-500 group-hover:text-blue-600'
                }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4 4 4m6 0v12m0 0 4-4m-4 4-4-4" />
                </svg>
              </button>
            )}
            {narrator.number}
          </div>
        </td>
        <td className="border-2 border-black px-4 py-2 relative min-w-[200px] text-center">
          {isEditing ? (
            <input
              type="text"
              value={narrator.arabicName}
              onChange={(e) => onUpdateNarrator(index, 'arabicName', e.target.value)}
              className="w-full px-2 py-1 border-2 border-black rounded-lg focus:outline-none focus:ring-2 focus:ring-black bg-white text-gray-900 text-right"
              style={{ fontFamily: 'var(--font-content)' }}
              dir="rtl"
            />
          ) : (
            <div className="flex flex-col gap-1.5 relative z-0">
              {/* Narrator name - always aligned */}
              <div className="text-center" dir="rtl">
                {narrator.matched && narrator.narratorId && onViewNarratorDetails ? (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onViewNarratorDetails(narrator.narratorId!);
                    }}
                    className="underline hover:no-underline transition-all cursor-pointer text-center"
                    style={{ fontFamily: 'var(--font-content)', color: '#0000ff' }}
                    title={`Click to view database entry (${(narrator.confidence || 0) * 100}% confidence)`}
                  >
                    {narrator.arabicName}
                  </button>
                ) : (
                  <span className="text-center" style={{ fontFamily: 'var(--font-content)', color: '#000000' }}>{narrator.arabicName}</span>
                )}
              </div>
              {/* Action buttons - below the name */}
              {(onSearchNarrator || narrator.matched) && narrator.arabicName !== "رَسُولَ اللَّهِ" && (
                <div className="flex items-center justify-center gap-1.5 flex-wrap relative z-20">
                  {onSearchNarrator && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        onSearchNarrator(index);
                      }}
                      onMouseDown={(e) => {
                        e.stopPropagation();
                      }}
                      className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 hover:bg-blue-200 transition-colors relative z-30 cursor-pointer"
                      style={{ fontFamily: 'var(--font-content)', color: '#0000ff' }}
                      title="Search and match narrator from database"
                      type="button"
                    >
                      <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                      Search
                    </button>
                  )}
                  {narrator.matched && (
                    <div className="inline-flex items-center gap-1">
                      <span
                        className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100"
                        style={{ fontFamily: 'var(--font-content)', color: '#000000' }}
                        title={`Matched to database (${(narrator.confidence || 0) * 100}% confidence)`}
                      >
                        <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Matched
                      </span>
                      {onUnmatchNarrator && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onUnmatchNarrator(index);
                          }}
                          className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-red-100 hover:bg-red-200 transition-colors"
                          style={{ fontFamily: 'var(--font-content)', color: '#000000' }}
                          title="Unmatch from database"
                        >
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </td>
        <td className="border-2 border-black px-4 py-2 min-w-[200px] text-center">
          {isEditing ? (
            <input
              type="text"
              value={narrator.englishName}
              onChange={(e) => onUpdateNarrator(index, 'englishName', e.target.value)}
              className="w-full px-2 py-1 border-2 border-black rounded-lg focus:outline-none focus:ring-2 focus:ring-black bg-white text-gray-900"
              style={{ fontFamily: 'var(--font-content)' }}
            />
          ) : (
            <span style={{ fontFamily: 'var(--font-content)', color: '#000000' }}>{narrator.englishName}</span>
          )}
        </td>
        <td className="border-2 border-black px-4 py-2 text-center">
          {isEditing ? (
            <span style={{ fontFamily: 'var(--font-content)', color: '#000000', opacity: 0.6 }}>--</span>
          ) : (
            <span style={{ fontFamily: 'var(--font-content)', color: '#000000' }}>
              {isProphet ? "10 AH / 632 CE" : formatDeathYear(narrator.databaseNarrator?.deathYearAH, narrator.databaseNarrator?.deathYearCE)}
            </span>
          )}
        </td>
        <td className="border-2 border-black px-4 py-2 text-center">
          {isProphet ? (
            <div className="text-sm italic" style={{ fontFamily: 'var(--font-content)', color: '#000000', opacity: 0.6 }}>
              N/A
            </div>
          ) : (
            <>
              {narrator.matched && narrator.reputation && narrator.reputation.length > 0 && (
                <div className="mb-2 text-xs font-medium" style={{ fontFamily: 'var(--font-content)', color: '#008000' }}>
                  ✓ Auto-assigned from database
                </div>
              )}
              <div className="relative">
                <ReputationSelector
                  selectedReputations={narrator.reputation || []}
                  onReputationChange={(reputation) => onUpdateReputation(index, reputation)}
                />
              </div>
              {(narrator.reputation || []).length > 0 && (
                <div className="flex flex-wrap gap-1 justify-center mt-2">
                  {(() => {
                    // Group grades by their value and count occurrences
                    const gradeCounts = (narrator.reputation || []).reduce((acc, grade) => {
                      acc[grade] = (acc[grade] || 0) + 1;
                      return acc;
                    }, {} as Record<string, number>);

                    return Object.entries(gradeCounts).map(([grade, count]) => (
                      <span
                        key={`narrator-${narrator.number}-grade-${grade}`}
                        className={`inline-flex items-center px-2.5 py-1 text-xs font-medium rounded-full border transition-all ${
                          REPUTATION_GRADES[grade as ReputationGrade].category === 'high'
                            ? 'bg-green-100 text-green-800 border-green-300 hover:bg-green-200 hover:border-green-400'
                            : REPUTATION_GRADES[grade as ReputationGrade].category === 'intermediate'
                            ? 'bg-yellow-50 text-yellow-700 border-yellow-200 hover:bg-yellow-100 hover:border-yellow-300'
                            : REPUTATION_GRADES[grade as ReputationGrade].category === 'theological'
                            ? 'bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100 hover:border-purple-300'
                            : 'bg-red-100 text-red-800 border-red-300 hover:bg-red-200 hover:border-red-400'
                        }`}
                      >
                        <span>
                          {grade}
                          {count > 1 && <span className="ml-1 opacity-75">×{count}</span>}
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            const reputation = narrator.reputation || [];
                            const gradeIndex = reputation.findIndex((g) => g === grade);
                            if (gradeIndex !== -1) {
                              const newReputation = reputation.filter((_, idx) => idx !== gradeIndex);
                              onUpdateReputation(index, newReputation);
                            }
                          }}
                          className="ml-1.5 flex items-center justify-center w-4 h-4 rounded-full hover:bg-gray-300 hover:bg-opacity-50 transition-colors"
                          title={`Remove one ${grade} grade`}
                        >
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </span>
                    ));
                  })()}
                </div>
              )}
            </>
          )}
        </td>
        <td className="border-2 border-black px-4 py-2 text-center">
          {isProphet ? (
            <div className="text-sm italic" style={{ fontFamily: 'var(--font-content)', color: '#000000', opacity: 0.6 }}>
              N/A
            </div>
          ) : (
            <div className="flex flex-col items-center gap-1">
              <div className="flex items-center gap-1">
                <div className={`font-semibold ${getGradeColorClass(narrator.calculatedGrade || 0)}`}>
                  {(narrator.calculatedGrade || 0).toFixed(1)}
                </div>
                <div className="relative inline-block">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowGradeFormulaTooltip(!showGradeFormulaTooltip);
                    }}
                    className="transition-colors"
                    style={{ color: '#000000', opacity: 0.4 }}
                    aria-label="Grade calculation formula info"
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </button>
                </div>
              </div>
              <div className="text-xs" style={{ fontFamily: 'var(--font-content)', color: '#000000', opacity: 0.6 }}>
                {getGradeDescription(narrator.calculatedGrade || 0)}
              </div>
            </div>
          )}
        </td>
        {isEditing && onRemoveNarrator && (
          <td className="border-2 border-black px-4 py-2 text-center">
            <button
              onClick={() => onRemoveNarrator(index)}
              className="p-1 rounded hover:bg-red-50 transition-colors"
              style={{ color: '#ff0000' }}
              title="Remove narrator"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </td>
        )}
      </tr>
      <BasicModal
        isOpen={showGradeFormulaTooltip}
        onClose={() => setShowGradeFormulaTooltip(false)}
        title="Grade Calculation Formula"
        size="md"
      >
        <div className="space-y-3 text-sm">
          <div className="space-y-2">
            <p>1. Count frequency of each grade (how many times it appears)</p>
            <p className="ml-4 text-gray-600">Each statement/opinion that mentions a grade counts</p>
            <p className="mt-2">2. Calculate frequency-weighted average</p>
            <p className="ml-4 text-gray-600">Average = Sum of (weight × frequency) ÷ Total count</p>
            <p className="ml-4 text-gray-600">Example: 5×"Thiqah" + 1×"Saduq" = (9×5 + 8×1) ÷ 6 = 8.83</p>
            <p className="mt-2">3. Apply penalties for conflicting grades:</p>
            <p className="ml-4 text-gray-600">• High + Low grades together: -2 points</p>
            <p className="ml-4 text-gray-600">• Mixed categories with Intermediate: -1 point</p>
            <p className="mt-2">4. Final grade = max(0, round((Average - Penalty) × 10) ÷ 10)</p>
          </div>
          <div className="pt-3 border-t border-gray-200">
            <p className="text-gray-600 text-xs">Grade range: 0.0 (Very Poor) to 10.0 (Excellent)</p>
          </div>
        </div>
      </BasicModal>
    </>
  );
}

