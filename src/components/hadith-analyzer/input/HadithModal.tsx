"use client";

import { HadithTab } from "./HadithTab";
import BasicModal from "@/components/ui/BasicModal";

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
  return (
    <BasicModal
      isOpen={show}
      onClose={onClose}
      title="Search Hadith"
      size="full"
    >
      <div className="flex-1 overflow-y-auto">
        <HadithTab
          selectedHadiths={selectedHadiths}
          onSelectedHadithsChange={onSelectedHadithsChange}
          showSelectButton={true}
        />
      </div>
    </BasicModal>
  );
}

