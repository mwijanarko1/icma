"use client";

import { useState } from "react";
import { HadithTab } from "@/components/hadith-analyzer/input/HadithTab";
import Header from "@/components/Header";

export default function HadithPage() {
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

  return (
    <div 
      className="min-h-screen relative flex flex-col" 
      style={{ 
        backgroundColor: '#f2e9dd', 
        color: '#000000',
      }}
    >
      <Header />
      
      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto px-2 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-8">
          <HadithTab 
            selectedHadiths={selectedHadiths}
            onSelectedHadithsChange={setSelectedHadiths}
            showSelectButton={false}
          />
        </div>
      </main>
    </div>
  );
}

