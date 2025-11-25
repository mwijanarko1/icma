// Reputation grading system
export const REPUTATION_GRADES = {
  // High Degrees of Reliability (Strong Narrators - Hadith Accepted)
  'Companion': { weight: 10, category: 'high', meaning: 'Companion of the Prophet' },
  'Thiqah Thabt': { weight: 10, category: 'high', meaning: 'Absolutely trustworthy and extremely precise/firm' },
  'Thiqah': { weight: 9, category: 'high', meaning: 'Trustworthy' },
  'Saduq': { weight: 8, category: 'high', meaning: 'Truthful' },
  'Saduq Yahim': { weight: 7, category: 'high', meaning: 'Truthful, but makes occasional errors/mistakes' },
  
  // Intermediate Degrees (Hadith Often Accepted, but with Caveats)
  'Maqbūl': { weight: 7, category: 'intermediate', meaning: 'Acceptable' },
  'La Ba\'sa Bihi': { weight: 7, category: 'intermediate', meaning: 'There is no harm in him (acceptable)' },
  
  // Lower Degrees of Reliability (Weak Narrators - Hadith Often Rejected or Weakened)
  'Saduq Sayyi\' al-Hifz': { weight: 4, category: 'low', meaning: 'Truthful, but with poor memory' },
  'Majhul al-Ain': { weight: 0, category: 'low', meaning: 'Unknown person' },
  'Majhul al-Hal': { weight: 0, category: 'low', meaning: 'Unknown status' },
  'Da\'if': { weight: 1, category: 'low', meaning: 'Weak' },
  'Matruk': { weight: 0, category: 'low', meaning: 'Abandoned' },
  'Muttaham bi al-Kidhb': { weight: 0, category: 'low', meaning: 'Accused of lying' },
  'Kadhdhab': { weight: 0, category: 'low', meaning: 'Liar / Fabricator' }
} as const;

export type ReputationGrade = keyof typeof REPUTATION_GRADES;

