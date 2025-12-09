"use client";

import { useState } from 'react';
import { HadithTab } from './HadithTab';
import BasicModal from "@/components/ui/BasicModal";

interface AddHadithFromDatabaseModalProps {
  show: boolean;
  onClose: () => void;
  onAddHadiths: (hadiths: Array<{
    hadith_number: number;
    sub_version?: string;
    reference: string;
    english_narrator?: string;
    english_translation: string;
    arabic_text: string;
    in_book_reference?: string;
    collection: string;
  }>) => void;
  isLoading?: boolean;
}

export function AddHadithFromDatabaseModal({
  show,
  onClose,
  onAddHadiths,
  isLoading = false
}: AddHadithFromDatabaseModalProps) {
  const [selectedHadiths, setSelectedHadiths] = useState<Array<{
    hadith_number: number;
    sub_version?: string;
    reference: string;
    english_narrator?: string;
    english_translation: string;
    arabic_text: string;
    in_book_reference?: string;
    collection: string;
  }>>([]);

  const handleAddSelected = () => {
    if (selectedHadiths.length > 0) {
      onAddHadiths(selectedHadiths);
    }
  };

  const handleClose = () => {
    setSelectedHadiths([]);
    onClose();
  };

  return (
    <BasicModal
      isOpen={show}
      onClose={handleClose}
      title="Add Hadith from Database"
      size="full"
    >
      <div className="flex flex-col h-full">
        {/* Content */}
        <div className="flex-1 overflow-y-auto min-h-0">
          <HadithTab
            selectedHadiths={selectedHadiths}
            onSelectedHadithsChange={setSelectedHadiths}
            showSelectButton={true}
          />
        </div>

        {/* Footer */}
        <div className="border-t-2 border-black pt-6 mt-6">
          <div className="flex justify-between items-center">
            <div className="text-sm" style={{ fontFamily: 'var(--font-content)', color: '#000000' }}>
              {selectedHadiths.length > 0
                ? `${selectedHadiths.length} hadith selected`
                : 'Select hadith to add to analyzer'
              }
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2 rounded-lg border-2 border-black transition-all duration-200 hover:bg-black/5 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ backgroundColor: 'transparent', color: '#000000', fontFamily: 'var(--font-content)' }}
                disabled={isLoading}
              >
                Cancel
              </button>
              <button
                onClick={handleAddSelected}
                disabled={selectedHadiths.length === 0 || isLoading}
                className="px-4 py-2 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl border-2 border-black disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                style={{ backgroundColor: '#000000', color: '#f2e9dd', fontFamily: 'var(--font-content)' }}
              >
                {isLoading ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Adding...
                  </>
                ) : (
                  <>
                    Add Selected ({selectedHadiths.length})
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </BasicModal>
  );
}
