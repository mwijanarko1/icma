// TypeScript types for narrator database

export interface Narrator {
  id: string;
  primaryArabicName: string;
  primaryEnglishName: string;
  fullNameArabic?: string;
  fullNameEnglish?: string;
  title?: string;
  kunya?: string;
  lineage?: string;
  birthYearAH?: number;
  deathYearAH?: number;
  deathYearAHAlternative?: number;
  birthYearCE?: number;
  deathYearCE?: number;
  placeOfResidence?: string;
  placeOfDeath?: string;
  placesTraveled?: string[];
  taqribCategory?: string;
  ibnHajarRank?: string;
  dhahabiRank?: string;
  notes?: string;
  sources?: string[];
  alternateNames?: NarratorName[];
  lineages?: NarratorLineage[];
  relationships?: NarratorRelationship[];
  scholarlyOpinions?: ScholarlyOpinion[];
  reputationGrades?: NarratorReputation[];
}

export interface NarratorName {
  id?: number;
  narratorId: string;
  arabicName: string;
  englishName?: string;
  nameType: 'alternate' | 'nickname' | 'kunya' | 'title';
  isPrimary: boolean;
}

export interface NarratorLineage {
  id?: number;
  narratorId: string;
  lineageType: 'tribal' | 'geographical' | 'honorific';
  lineageValue: string;
}

export interface NarratorRelationship {
  id?: number;
  narratorId: string;
  relatedNarratorId: string;
  relationshipType: 'teacher' | 'student' | 'companion' | 'contemporary' | 'companion_of';
  relationshipDescription?: string;
  durationYears?: number;
}

export interface ScholarlyOpinion {
  id?: number;
  narratorId: string;
  scholarName: string;
  opinionText: string;
  sourceReference?: string;
  sourceBook?: string;
  sourceVolume?: string;
  opinionType: 'jarh' | 'ta\'dil' | 'neutral';
  isPrimary: boolean;
}

export interface NarratorReputation {
  id?: number;
  narratorId: string;
  grade: string; // From your REPUTATION_GRADES
  gradeSource?: string;
}

// Shamela import format
export interface ShamelaNarratorEntry {
  name: {
    arabic: string;
    english: string;
    full?: string;
  };
  title?: string;
  kunya?: string;
  lineage?: string[];
  placeOfResidence?: string;
  relationships?: {
    type: string;
    narrators: string[];
    description?: string;
    duration?: number;
  }[];
  deathDate?: {
    yearAH?: number;
    alternativeYearAH?: number;
    place?: string;
  };
  placesTraveled?: string[];
  taqribCategory?: string;
  ibnHajarRank?: string;
  dhahabiRank?: string;
  scholarlyOpinions?: {
    scholar: string;
    opinion: string;
    source?: string;
    sourceBook?: string;
    sourceVolume?: string;
    type?: 'jarh' | 'ta\'dil' | 'neutral';
  }[];
  notes?: string;
}

