import type { ReputationGrade } from '@/lib/grading/constants';

export interface HadithRecord {
  hadith_number: number;
  sub_version?: string | null;
  reference: string;
  english_narrator?: string;
  english_translation: string;
  arabic_text: string;
  in_book_reference?: string;
  created_at?: string;
  updated_at?: string;
  search_text?: string;
}

export interface Narrator {
  number: number;
  arabicName: string;
  englishName: string;
  reputation?: ReputationGrade[];
  calculatedGrade?: number;
  matched?: boolean;
  narratorId?: string;
  confidence?: number;
  matchedName?: string;
  databaseNarrator?: {
    id: string;
    primaryArabicName: string;
    primaryEnglishName: string;
    ibnHajarRank?: string;
    dhahabiRank?: string;
    taqribCategory?: string;
    scholarlyOpinionsCount?: number;
  };
}

export interface LibraryChain {
  name: string;
  displayName: string;
  path: string;
  chainCount: number;
  hadithText: string;
  exportedAt: string | null;
}

export interface Chain {
  id: string;
  narrators: Narrator[];
  chainText: string; // Sanad (chain of narrators)
  matn: string; // Matn (hadith text content)
  title?: string;
  collapsed?: boolean;
  hiddenFromVisualization?: boolean;
}

