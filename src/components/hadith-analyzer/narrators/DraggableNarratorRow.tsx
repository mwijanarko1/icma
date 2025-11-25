"use client";

import { useState } from "react";
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { REPUTATION_GRADES } from '@/lib/grading/constants';
import { getGradeColorClass, getGradeDescription } from '@/lib/grading/utils';
import { ReputationSelector } from './ReputationSelector';
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
  onSearchNarrator,
  isDarkMode
}: DraggableNarratorRowProps) {
  const [showGradeFormulaTooltip, setShowGradeFormulaTooltip] = useState(false);
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
    <tr
      ref={isEditing ? setNodeRef : undefined}
      style={style}
      className={
        isDragging
          ? 'bg-blue-100 dark:bg-blue-900/30 shadow-lg ring-2 ring-blue-400 dark:ring-blue-500'
          : 'hover:bg-gray-50 dark:hover:bg-gray-700'
      }
    >
      <td className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-center text-gray-900 dark:text-white">
        <div className="flex items-center justify-center gap-2">
          {isEditing && (
            <button
              {...attributes}
              {...listeners}
              className={`cursor-grab active:cursor-grabbing p-2 rounded-md border group ${
                isDragging
                  ? 'bg-blue-200 dark:bg-blue-800 border-blue-400 dark:border-blue-500 shadow-md'
                  : 'hover:bg-blue-100 dark:hover:bg-blue-900/50 border-transparent hover:border-blue-300 dark:hover:border-blue-600'
              }`}
              aria-label="Drag to reorder narrator"
              title="Drag to reorder narrator in chain"
            >
              <svg className={`w-4 h-4 ${
                isDragging
                  ? 'text-blue-700 dark:text-blue-300'
                  : 'text-gray-500 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400'
              }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
                <circle cx="9" cy="12" r="1.5" fill="currentColor" />
                <circle cx="15" cy="12" r="1.5" fill="currentColor" />
              </svg>
            </button>
          )}
          {narrator.number}
        </div>
      </td>
      <td className="border border-gray-300 dark:border-gray-600 px-4 py-2 relative">
        {isEditing ? (
          <input
            type="text"
            value={narrator.arabicName}
            onChange={(e) => onUpdateNarrator(index, 'arabicName', e.target.value)}
            className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-right"
            dir="rtl"
          />
        ) : (
          <div className="flex flex-col gap-1.5 relative z-0">
            {/* Narrator name - always aligned */}
            <div className="text-right" dir="rtl">
              {narrator.matched && narrator.narratorId && onViewNarratorDetails ? (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onViewNarratorDetails(narrator.narratorId!);
                  }}
                  className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 underline hover:no-underline transition-all cursor-pointer text-right"
                  title={`Click to view database entry (${(narrator.confidence || 0) * 100}% confidence)`}
                >
                  {narrator.arabicName}
                </button>
              ) : (
                <span className="text-gray-900 dark:text-white text-right">{narrator.arabicName}</span>
              )}
            </div>
            {/* Action buttons - below the name */}
            {(onSearchNarrator || narrator.matched) && narrator.arabicName !== "رَسُولَ اللَّهِ" && (
              <div className="flex items-center justify-end gap-1.5 flex-wrap relative z-20">
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
                    className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-200 dark:hover:bg-blue-800 transition-colors relative z-30 cursor-pointer"
                    title="Search and match narrator from database"
                    type="button"
                    style={{ pointerEvents: 'auto' }}
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
                      className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
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
                        className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800 hover:bg-red-200 dark:bg-red-900 dark:text-red-200 dark:hover:bg-red-800 transition-colors"
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
      <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">
        {isEditing ? (
          <input
            type="text"
            value={narrator.englishName}
            onChange={(e) => onUpdateNarrator(index, 'englishName', e.target.value)}
            className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        ) : (
          <span className="text-gray-900 dark:text-white">{narrator.englishName}</span>
        )}
      </td>
      <td className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-center">
        {narrator.arabicName === "رَسُولَ اللَّهِ" ? (
          <div className="text-gray-500 dark:text-gray-400 text-sm italic">
            N/A
          </div>
        ) : (
          <>
            {narrator.matched && narrator.reputation && narrator.reputation.length > 0 && (
              <div className="mb-2 text-xs text-green-600 dark:text-green-400 font-medium">
                ✓ Auto-assigned from database
              </div>
            )}
            <div className="relative">
              <ReputationSelector
                selectedReputations={narrator.reputation || []}
                onReputationChange={(reputation) => onUpdateReputation(index, reputation)}
                isDarkMode={isDarkMode}
              />
            </div>
            {(narrator.reputation || []).length > 0 && (
              <div className="flex flex-wrap gap-1 justify-center mt-2">
                {(narrator.reputation || []).map((grade, gradeIdx) => (
                  <span
                    key={`narrator-${narrator.number}-grade-${gradeIdx}-${grade}`}
                    className={`px-2 py-1 text-xs rounded ${
                      REPUTATION_GRADES[grade].category === 'high'
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        : REPUTATION_GRADES[grade].category === 'intermediate'
                        ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                        : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                    }`}
                  >
                    {grade}
                  </span>
                ))}
              </div>
            )}
          </>
        )}
      </td>
      <td className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-center">
        {narrator.arabicName === "رَسُولَ اللَّهِ" ? (
          <div className="text-gray-500 dark:text-gray-400 text-sm italic">
            N/A
          </div>
        ) : (
          <div className="flex flex-col items-center gap-1">
            <div className="flex items-center gap-1">
              <div className={`font-semibold ${getGradeColorClass(narrator.calculatedGrade || 0)}`}>
                {(narrator.calculatedGrade || 0).toFixed(1)}
              </div>
              <div className="relative">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowGradeFormulaTooltip(!showGradeFormulaTooltip);
                  }}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                  aria-label="Grade calculation formula info"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </button>
                <div className={`absolute right-0 bottom-full mb-2 w-80 p-3 bg-gray-900 dark:bg-gray-800 text-white text-xs rounded-lg shadow-lg transition-all duration-200 z-50 ${showGradeFormulaTooltip ? 'opacity-100 visible' : 'opacity-0 invisible'}`}>
                  <div className="space-y-2">
                    <p className="font-semibold mb-2">Grade Calculation Formula</p>
                    <div className="space-y-1 text-gray-300">
                      <p>1. Count frequency of each grade (how many times it appears)</p>
                      <p className="ml-2 text-gray-400">Each statement/opinion that mentions a grade counts</p>
                      <p className="mt-2">2. Calculate frequency-weighted average</p>
                      <p className="ml-2 text-gray-400">Average = Sum of (weight × frequency) ÷ Total count</p>
                      <p className="ml-2 text-gray-400">Example: 5×&quot;Thiqah&quot; + 1×&quot;Saduq&quot; = (9×5 + 8×1) ÷ 6 = 8.83</p>
                      <p className="mt-2">3. Apply penalties for conflicting grades:</p>
                      <p className="ml-2 text-gray-400">• High + Low grades together: -2 points</p>
                      <p className="ml-2 text-gray-400">• Mixed categories with Intermediate: -1 point</p>
                      <p className="mt-2">4. Final grade = max(0, round((Average - Penalty) × 10) ÷ 10)</p>
                    </div>
                    <div className="pt-2 border-t border-gray-700">
                      <p className="text-gray-400 text-xs">Grade range: 0.0 (Very Poor) to 10.0 (Excellent)</p>
                    </div>
                  </div>
                  <div className="absolute right-4 top-full w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900 dark:border-t-gray-800"></div>
                </div>
              </div>
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400">
              {getGradeDescription(narrator.calculatedGrade || 0)}
            </div>
          </div>
        )}
      </td>
      {isEditing && onRemoveNarrator && (
        <td className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-center">
          <button
            onClick={() => onRemoveNarrator(index)}
            className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 p-1 rounded hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
            title="Remove narrator"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </td>
      )}
    </tr>
  );
}

