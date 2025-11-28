"use client";

import { HadithTab } from "./HadithTab";

interface HadithModalProps {
  show: boolean;
  onClose: () => void;
  selectedHadiths: Array<{
    hadith_number: number;
    sub_version?: string;
    reference: string;
    english_narrator?: string;
    english_translation: string;
    arabic_text: string;
    in_book_reference?: string;
    collection: string;
  }>;
  onSelectedHadithsChange: (hadiths: Array<{
    hadith_number: number;
    sub_version?: string;
    reference: string;
    english_narrator?: string;
    english_translation: string;
    arabic_text: string;
    in_book_reference?: string;
    collection: string;
  }>) => void;
}

export function HadithModal({ show, onClose, selectedHadiths, onSelectedHadithsChange }: HadithModalProps) {
  if (!show) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4">
        <div 
          className="relative w-full max-w-6xl max-h-[95vh] sm:max-h-[90vh] rounded-xl sm:rounded-2xl border-2 border-black bg-white overflow-hidden flex flex-col"
          style={{ boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(0, 0, 0, 0.1)' }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 sm:p-6 border-b-2 border-black">
            <h2 className="text-xl sm:text-2xl font-bold" style={{ fontFamily: 'var(--font-title)', color: '#000000' }}>
              Search Hadith
            </h2>
            <button
              onClick={onClose}
              className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-lg transition-colors"
              style={{ color: '#000000' }}
            >
              <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          {/* Content */}
          <div className="flex-1 overflow-y-auto p-3 sm:p-4 md:p-6">
            <HadithTab 
              selectedHadiths={selectedHadiths}
              onSelectedHadithsChange={onSelectedHadithsChange}
              showSelectButton={true}
            />
          </div>
        </div>
      </div>
    </>
  );
}

