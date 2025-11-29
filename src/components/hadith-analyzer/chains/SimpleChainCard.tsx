"use client";

import type { Chain } from '@/types/hadith';
import { calculateChainGrade } from '@/lib/grading/calculator';
import { getGradeColorClass, getGradeDescription } from '@/lib/grading/utils';

interface SimpleChainCardProps {
  chain: Chain;
  hadithReference: string;
  collection?: string;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export function SimpleChainCard({
  chain,
  hadithReference,
  collection,
  isCollapsed = false,
  onToggleCollapse
}: SimpleChainCardProps) {
  const chainGrade = calculateChainGrade(chain.narrators) ?? 0;
  const gradeColorClass = getGradeColorClass(chainGrade);
  const gradeDescription = getGradeDescription(chainGrade);

  return (
    <div className="rounded-xl sm:rounded-2xl border-2 border-black bg-white" style={{ boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(0, 0, 0, 0.1)' }}>
      {/* Chain Header */}
      <div
        className={`flex items-center justify-between p-4 sm:p-6 cursor-pointer ${!isCollapsed ? 'border-b-2 border-black' : ''}`}
        onClick={onToggleCollapse}
        aria-label={isCollapsed ? "Expand chain" : "Collapse chain"}
      >
        <div className="flex items-center gap-3">
          <div className="p-1">
            <svg
              className={`w-4 h-4 transform transition-transform ${isCollapsed ? 'rotate-0' : 'rotate-90'}`}
              style={{ color: '#000000', opacity: 0.6 }}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-medium" style={{ fontFamily: 'var(--font-title)', color: '#000000' }}>
              {chain.title || hadithReference}
            </h3>
            {collection && (
              <span className="text-xs font-medium" style={{ fontFamily: 'var(--font-content)', color: '#000000', opacity: 0.7 }}>
                {collection}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Chain Grade Badge */}
          <div className={`px-3 py-1 rounded-full text-xs font-semibold ${gradeColorClass}`}>
            {gradeDescription}
          </div>
        </div>
      </div>

      {/* Chain Content - Collapsible */}
      {!isCollapsed && (
        <div className="p-4 sm:p-6">
          {/* Chain Text (Sanad) */}
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2" style={{ fontFamily: 'var(--font-content)', color: '#000000' }}>
              Chain (Sanad)
            </label>
            <div className="p-3 bg-gray-50 rounded-lg border-2 border-black overflow-visible">
              <p 
                className="text-sm whitespace-pre-wrap break-words overflow-visible" 
                style={{ 
                  fontFamily: 'var(--font-content)', 
                  color: '#000000',
                  wordBreak: 'break-word',
                  overflowWrap: 'break-word',
                  maxWidth: '100%'
                }}
                dir={/[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/.test(chain.chainText) ? 'rtl' : 'ltr'}
              >
                {chain.chainText || <span className="italic" style={{ opacity: 0.6 }}>No chain text</span>}
              </p>
            </div>
          </div>

          {/* Narrators Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full border-2 border-black">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider border-2 border-black" style={{ fontFamily: 'var(--font-content)', color: '#000000' }}>
                    #
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider border-2 border-black" style={{ fontFamily: 'var(--font-content)', color: '#000000' }}>
                    Arabic Name
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider border-2 border-black" style={{ fontFamily: 'var(--font-content)', color: '#000000' }}>
                    English Name
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider border-2 border-black" style={{ fontFamily: 'var(--font-content)', color: '#000000' }}>
                    Grade
                  </th>
                </tr>
              </thead>
              <tbody>
                {chain.narrators.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-4 text-center text-sm border-2 border-black" style={{ fontFamily: 'var(--font-content)', color: '#000000', opacity: 0.6 }}>
                      No narrators
                    </td>
                  </tr>
                ) : (
                  chain.narrators.map((narrator, index) => {
                    // Handle both calculatedGrade (number) and grade (string) properties
                    let narratorGrade: number;
                    let narratorGradeDescription: string;
                    let narratorGradeColorClass: string;

                    if (typeof narrator.calculatedGrade === 'number') {
                      narratorGrade = narrator.calculatedGrade;
                      narratorGradeColorClass = getGradeColorClass(narratorGrade);
                      narratorGradeDescription = getGradeDescription(narratorGrade);
                    } else if (typeof narrator.grade === 'string') {
                      // Special handling for "n/a" grade
                      if (narrator.grade === 'n/a') {
                        narratorGrade = 0; // For chain calculation
                        narratorGradeColorClass = 'bg-gray-100 text-gray-800';
                        narratorGradeDescription = 'n/a';
                      } else if (narrator.grade.includes('/')) {
                        const [num, den] = narrator.grade.split('/').map(Number);
                        narratorGrade = num / den * 10; // Convert to 0-10 scale
                        narratorGradeColorClass = getGradeColorClass(narratorGrade);
                        narratorGradeDescription = getGradeDescription(narratorGrade);
                      } else {
                        narratorGrade = parseFloat(narrator.grade) || 0;
                        narratorGradeColorClass = getGradeColorClass(narratorGrade);
                        narratorGradeDescription = getGradeDescription(narratorGrade);
                      }
                    } else {
                      narratorGrade = 0;
                      narratorGradeColorClass = getGradeColorClass(narratorGrade);
                      narratorGradeDescription = getGradeDescription(narratorGrade);
                    }

                    return (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-4 py-3 whitespace-nowrap text-sm font-medium border-2 border-black" style={{ fontFamily: 'var(--font-content)', color: '#000000' }}>
                          {narrator.number}
                        </td>
                        <td className="px-4 py-3 text-sm border-2 border-black" style={{ fontFamily: 'var(--font-content)', color: '#000000' }} dir="rtl">
                          {narrator.arabicName}
                        </td>
                        <td className="px-4 py-3 text-sm border-2 border-black" style={{ fontFamily: 'var(--font-content)', color: '#000000' }}>
                          {narrator.englishName}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap border-2 border-black">
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${narratorGradeColorClass}`}>
                            {narratorGradeDescription}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

