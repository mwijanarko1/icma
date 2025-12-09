"use client";

import { useState } from 'react';
import { extractReputationGrades } from '@/data/grade-extractor';
import type { Narrator as NarratorType } from '@/data/types';
import { REPUTATION_GRADES, type ReputationGrade } from '@/lib/grading/constants';
import { calculateNarratorGrade } from '@/lib/grading/calculator';
import { getGradeDescription, getGradeColorClass } from '@/lib/grading/utils';
import BasicModal from "@/components/ui/BasicModal";

interface NarratorDetailsModalProps {
  show: boolean;
  narrator: NarratorType | null;
  isLoading: boolean;
  onClose: () => void;
}

export function NarratorDetailsModal({
  show,
  narrator,
  isLoading,
  onClose
}: NarratorDetailsModalProps) {
  const [showGradeFormulaTooltip, setShowGradeFormulaTooltip] = useState(false);
  const [copied, setCopied] = useState(false);

  // Extract grades from scholarly opinions and other sources
  const extractedGrades = narrator ? extractReputationGrades(narrator) : [];
  const calculatedGrade = extractedGrades.length > 0 ? calculateNarratorGrade(extractedGrades) : null;

  // Function to copy all scholarly opinions to clipboard
  const copyAllScholarlyOpinions = async () => {
    if (!narrator?.scholarlyOpinions || narrator.scholarlyOpinions.length === 0) return;

    const sortedOpinions = [...narrator.scholarlyOpinions].sort((a, b) => {
      const getPriority = (type: string) => {
        if (type === 'jarh') return 0;
        if (type === 'ta\'dil') return 1;
        return 2;
      };
      return getPriority(a.opinionType || '') - getPriority(b.opinionType || '');
    });

    const formattedText = sortedOpinions.map((opinion, idx) => {
      const typeLabel = opinion.opinionType === 'ta\'dil' ? 'Praise' : opinion.opinionType === 'jarh' ? 'Criticism' : 'Neutral';
      let text = `${idx + 1}. ${opinion.scholarName} [${typeLabel}]\n`;
      text += `${opinion.opinionText}\n`;
      if (opinion.sourceReference) {
        text += `Source: ${opinion.sourceReference}\n`;
      }
      return text;
    }).join('\n');

    try {
      await navigator.clipboard.writeText(formattedText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text:', err);
    }
  };

  return (
    <BasicModal
      isOpen={show && !!narrator}
      onClose={onClose}
      title={narrator?.primaryArabicName}
      size="full"
    >
      {isLoading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading narrator details...</p>
        </div>
      ) : narrator ? (
        <div className="space-y-6">
              {/* Basic Information */}
              <div>
                <h4 className="text-lg font-semibold text-black mb-4 pb-2 border-b-2 border-black" style={{ fontFamily: 'var(--font-title)' }}>Basic Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {narrator.primaryEnglishName && (
                    <div className="bg-gray-50 rounded-lg p-3 border-2 border-black">
                      <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">English Name</label>
                      <p className="text-sm text-black font-medium">{narrator.primaryEnglishName}</p>
                    </div>
                  )}
                  {'fullNameArabic' in narrator && narrator.fullNameArabic && (
                    <div className="bg-gray-50 rounded-lg p-3 border-2 border-black">
                      <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">Full Arabic Name</label>
                      <p className="text-base text-black font-medium" dir="rtl" lang="ar">{narrator.fullNameArabic}</p>
                    </div>
                  )}
                  {narrator.title && (
                    <div className="bg-gray-50 rounded-lg p-3 border-2 border-black">
                      <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">Title</label>
                      <p className="text-base text-black font-medium" dir="rtl" lang="ar">{narrator.title}</p>
                    </div>
                  )}
                  {narrator.kunya && (
                    <div className="bg-gray-50 rounded-lg p-3 border-2 border-black">
                      <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">Kunya</label>
                      <p className="text-base text-black font-medium" dir="rtl" lang="ar">{narrator.kunya}</p>
                    </div>
                  )}
                  {narrator.lineage && (
                    <div className="bg-gray-50 rounded-lg p-3 border-2 border-black">
                      <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">Lineage</label>
                      <p className="text-base text-black font-medium" dir="rtl" lang="ar">{narrator.lineage}</p>
                    </div>
                  )}
                  {narrator.deathYearAH && (
                    <div className="bg-gray-50 rounded-lg p-3 border-2 border-black">
                      <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">Death Year (AH)</label>
                      <p className="text-sm text-black font-medium">
                        {narrator.deathYearAH}
                        {narrator.deathYearAHAlternative && ` or ${narrator.deathYearAHAlternative}`}
                      </p>
                    </div>
                  )}
                  {narrator.deathYearCE && (
                    <div className="bg-gray-50 rounded-lg p-3 border-2 border-black">
                      <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">Death Year (CE)</label>
                      <p className="text-sm text-black font-medium">{narrator.deathYearCE}</p>
                    </div>
                  )}
                  {narrator.placeOfResidence && (
                    <div className="bg-gray-50 rounded-lg p-3 border-2 border-black">
                      <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">Place of Residence</label>
                      <p className="text-base text-black font-medium" dir="rtl" lang="ar">{narrator.placeOfResidence}</p>
                    </div>
                  )}
                  {narrator.placeOfDeath && (
                    <div className="bg-gray-50 rounded-lg p-3 border-2 border-black">
                      <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">Place of Death</label>
                      <p className="text-base text-black font-medium" dir="rtl" lang="ar">{narrator.placeOfDeath}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Scholarly Ranks */}
              {(narrator.ibnHajarRank || narrator.dhahabiRank || narrator.taqribCategory) && (
                <div>
                  <h4 className="text-lg font-semibold text-black mb-4 pb-2 border-b-2 border-black" style={{ fontFamily: 'var(--font-title)' }}>Scholarly Ranks</h4>
                  <div className="space-y-3">
                    {narrator.ibnHajarRank && (
                      <div className="bg-gray-50 rounded-lg p-3 border-2 border-black">
                        <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">Ibn Hajar Rank</label>
                        <p className="text-base text-black font-medium" dir="rtl" lang="ar">{narrator.ibnHajarRank}</p>
                      </div>
                    )}
                    {narrator.dhahabiRank && (
                      <div className="bg-gray-50 rounded-lg p-3 border-2 border-black">
                        <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">Dhahabi Rank</label>
                        <p className="text-base text-black font-medium" dir="rtl" lang="ar">{narrator.dhahabiRank}</p>
                      </div>
                    )}
                    {narrator.taqribCategory && (
                      <div className="bg-gray-50 rounded-lg p-3 border-2 border-black">
                        <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">Taqrib Category</label>
                        <p className="text-base text-black font-medium" dir="rtl" lang="ar">{narrator.taqribCategory}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Scholarly Opinions */}
              {narrator.scholarlyOpinions && narrator.scholarlyOpinions.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-4 pb-2 border-b-2 border-black">
                    <h4 className="text-lg font-semibold text-black" style={{ fontFamily: 'var(--font-title)' }}>
                      Scholarly Opinions ({narrator.scholarlyOpinions.length})
                    </h4>
                    <button
                      onClick={copyAllScholarlyOpinions}
                      className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg"
                      title="Copy all scholarly opinions"
                    >
                      {copied ? (
                        <>
                          <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          <span>Copied!</span>
                        </>
                      ) : (
                        <>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                          <span>Copy All</span>
                        </>
                      )}
                    </button>
                  </div>
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {[...narrator.scholarlyOpinions].sort((a, b) => {
                      const getPriority = (type: string) => {
                        if (type === 'jarh') return 0;
                        if (type === 'ta\'dil') return 1;
                        return 2;
                      };
                      return getPriority(a.opinionType || '') - getPriority(b.opinionType || '');
                    }).map((opinion, idx: number) => (
                      <div key={`opinion-${opinion.id || idx}-${opinion.scholarName}-${idx}`} className="bg-gray-50 border-2 border-black rounded-lg p-4">
                        <div className="flex items-start justify-between mb-3">
                          <h5 className="text-base font-semibold text-black" dir="rtl" lang="ar">
                            {opinion.scholarName}
                          </h5>
                          <span className={`text-xs px-2.5 py-1 rounded-full font-medium flex-shrink-0 ml-3 ${
                            opinion.opinionType === 'ta\'dil' 
                              ? 'bg-green-100 text-green-800'
                            : opinion.opinionType === 'jarh'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-gray-100 text-gray-800'
                          }`}>
                            {opinion.opinionType === 'ta\'dil' ? 'Praise' : opinion.opinionType === 'jarh' ? 'Criticism' : 'Neutral'}
                          </span>
                        </div>
                        <p className="text-base text-gray-700 mb-2 leading-relaxed" dir="rtl" lang="ar">
                          {opinion.opinionText}
                        </p>
                        {opinion.sourceReference && (
                          <p className="text-xs text-gray-500 mt-2 pt-2 border-t border-gray-200" dir="rtl" lang="ar">
                            <span className="font-medium">Source:</span> {opinion.sourceReference}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Grading Section */}
              <div>
                <h4 className="text-lg font-semibold text-black mb-4 pb-2 border-b-2 border-black" style={{ fontFamily: 'var(--font-title)' }}>
                  Grading
                </h4>
                <div className="space-y-4">
                  {/* Reputation Grades */}
                  {extractedGrades.length > 0 ? (
                    <div>
                      <label className="text-xs font-medium text-gray-500 mb-2 block">
                        Reputation Grades ({extractedGrades.length})
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {extractedGrades.map((grade: ReputationGrade, idx: number) => {
                          const gradeInfo = REPUTATION_GRADES[grade];
                          const categoryColor = gradeInfo?.category === 'high' 
                            ? 'bg-green-100 text-green-800'
                            : gradeInfo?.category === 'low'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-yellow-100 text-yellow-800';
                          
                          return (
                            <span key={`extracted-grade-${grade}-${idx}`} className={`px-3 py-1 ${categoryColor} rounded-lg text-sm`}>
                              {grade}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  ) : (
                    <div>
                      <label className="text-xs font-medium text-gray-500 mb-2 block">
                        Reputation Grades
                      </label>
                      <p className="text-sm text-gray-500">No reputation grades could be extracted from available sources</p>
                    </div>
                  )}
                  
                  {/* Calculated Grade */}
                  {calculatedGrade !== null ? (
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <label className="text-xs font-medium text-gray-500">
                          Calculated Grade
                        </label>
                        <div className="relative">
                          <button
                            type="button"
                            onClick={() => setShowGradeFormulaTooltip(!showGradeFormulaTooltip)}
                            className="text-gray-400 hover:text-gray-600 "
                            aria-label="Grade calculation formula info"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </button>
                          <div className={`absolute left-0 bottom-full mb-2 w-80 p-3 bg-gray-900 text-white text-xs rounded-lg shadow-lg transition-all duration-200 z-50 ${showGradeFormulaTooltip ? 'opacity-100 visible' : 'opacity-0 invisible'}`}>
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
                            <div className="absolute left-4 top-full w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className={`text-2xl font-bold ${getGradeColorClass(calculatedGrade)}`}>
                          {calculatedGrade.toFixed(1)}
                        </div>
                        <div className="text-sm text-gray-600">
                          {getGradeDescription(calculatedGrade)}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <label className="text-xs font-medium text-gray-500 mb-2 block">
                        Calculated Grade
                      </label>
                      <p className="text-sm text-gray-500">No grade calculated</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Relationships */}
              {narrator.relationships && narrator.relationships.length > 0 && (
                <div>
                  <h4 className="text-lg font-semibold text-black mb-4 pb-2 border-b-2 border-black" style={{ fontFamily: 'var(--font-title)' }}>
                    Relationships ({narrator.relationships.length})
                  </h4>
                  <div className="space-y-3">
                    {narrator.relationships.map((rel, idx: number) => (
                      <div key={`relationship-${rel.relatedNarratorId || idx}-${rel.relationshipType}-${idx}`} className="bg-gray-50 border-2 border-black rounded-lg p-3">
                        <p className="text-sm text-black">
                          <span className="font-semibold capitalize text-gray-700">{rel.relationshipType}</span>
                          {rel.relationshipDescription && (
                            <span className="text-gray-600 ml-2">: {rel.relationshipDescription}</span>
                          )}
                          {'durationYears' in rel && rel.durationYears && (
                            <span className="text-gray-600 ml-2">({rel.durationYears} years)</span>
                          )}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Notes */}
              {narrator.notes && (
                <div>
                  <h4 className="text-lg font-semibold text-black mb-4 pb-2 border-b-2 border-black" style={{ fontFamily: 'var(--font-title)' }}>Notes</h4>
                  <div className="bg-gray-50 border-2 border-black rounded-lg p-4">
                    <p className="text-base text-gray-700 leading-relaxed whitespace-pre-wrap" dir="rtl" lang="ar">
                      {narrator.notes}
                    </p>
                  </div>
                </div>
              )}
          </div>
        ) : null}
    </BasicModal>
    );
}

