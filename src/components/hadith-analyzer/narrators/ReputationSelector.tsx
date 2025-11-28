"use client";

import { useState, useEffect, useRef } from "react";
import { REPUTATION_GRADES } from '@/lib/grading/constants';
import type { ReputationGrade } from '@/lib/grading/constants';
import type { ReputationSelectorProps } from './types';

export function ReputationSelector({ selectedReputations, onReputationChange }: ReputationSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (dropdownRef.current && !dropdownRef.current.contains(target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  const toggleReputation = (grade: ReputationGrade) => {
    if (selectedReputations.includes(grade)) {
      onReputationChange(selectedReputations.filter(r => r !== grade));
    } else {
      onReputationChange([...selectedReputations, grade]);
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'high': return 'text-green-600';
      case 'intermediate': return 'text-yellow-600';
      case 'low': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const groupedGrades = Object.entries(REPUTATION_GRADES).reduce((acc, [grade, data]) => {
    if (!acc[data.category]) acc[data.category] = [];
    acc[data.category].push({ grade: grade as ReputationGrade, ...data });
    return acc;
  }, {} as Record<string, Array<{ grade: ReputationGrade; weight: number; category: string; meaning: string }>>);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="px-3 py-1 text-sm rounded-md border bg-white border-gray-300 text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        {selectedReputations.length === 0 ? 'Select Reputation' : `${selectedReputations.length} selected`}
        <span className="ml-1">▼</span>
      </button>

      {isOpen && (
        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1 w-80 max-h-96 overflow-y-auto z-[9999] rounded-md shadow-lg border bg-white border-gray-300">
          {Object.entries(groupedGrades).map(([category, grades]) => (
            <div key={category} className="p-2">
              <div className="text-xs font-semibold uppercase tracking-wide mb-2 text-gray-500">
                {category === 'high' ? 'High Reliability' : 
                 category === 'intermediate' ? 'Intermediate' : 'Low Reliability'}
              </div>
              {grades.map(({ grade, meaning }, gradeIdx) => (
                <label
                  key={`${category}-${grade}-${gradeIdx}`}
                  className="flex items-start space-x-2 p-2 hover:bg-gray-100 cursor-pointer rounded text-gray-800"
                >
                  <input
                    type="checkbox"
                    checked={selectedReputations.includes(grade)}
                    onChange={() => toggleReputation(grade)}
                    className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <div className="flex-1">
                    <div className={`font-medium ${getCategoryColor(REPUTATION_GRADES[grade].category)}`}>
                      {grade}
                    </div>
                    <div className="text-xs text-gray-600">
                      {meaning}
                    </div>
                  </div>
                </label>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

