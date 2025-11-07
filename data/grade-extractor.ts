// Utility to extract reputation grades from database narrator data
import { Narrator } from './types';

// Reputation grade types (matching HadithAnalyzer)
export type ReputationGrade = 
  | 'Companion'
  | 'Thiqah Thabt'
  | 'Thiqah'
  | 'Saduq'
  | 'Saduq Yahim'
  | 'Maqbūl'
  | 'La Ba\'sa Bihi'
  | 'Saduq Sayyi\' al-Hifz'
  | 'Majhul al-Ain'
  | 'Majhul al-Hal'
  | 'Da\'if'
  | 'Matruk'
  | 'Muttaham bi al-Kidhb'
  | 'Kadhdhab';

// Grade keywords mapping
const GRADE_KEYWORDS: Record<string, ReputationGrade[]> = {
  // High reliability
  'صحابي': ['Companion'],
  'صحابة': ['Companion'],
  'صاحب': ['Companion'],
  'ثقة': ['Thiqah'],
  'ثقة ثبت': ['Thiqah Thabt'],
  'ثبت': ['Thiqah Thabt'],
  'صدوق': ['Saduq'],
  'صحيح': ['Saduq'],
  'مأمون': ['Thiqah'],
  'حافظ': ['Thiqah'],
  'إمام': ['Thiqah'],
  
  // Intermediate
  'مقبول': ['Maqbūl'],
  'لا بأس به': ['La Ba\'sa Bihi'],
  'لا بأس': ['La Ba\'sa Bihi'],
  
  // Low reliability
  'ضعيف': ['Da\'if'],
  'متروك': ['Matruk'],
  'كذاب': ['Kadhdhab'],
  'متهم': ['Muttaham bi al-Kidhb'],
  'مجهول': ['Majhul al-Hal'],
  'مجهول العين': ['Majhul al-Ain'],
  'صدوق سيء الحفظ': ['Saduq Sayyi\' al-Hifz'],
  'صدوق يهم': ['Saduq Yahim'],
};

/**
 * Check if a keyword appears as a whole word/phrase in Arabic text
 * Arabic doesn't always have spaces between words, so we use a more lenient approach:
 * 1. Prefer matches at word boundaries (spaces, punctuation, start/end)
 * 2. But also allow matches in context if they don't conflict with longer phrases
 * This function helps prioritize better matches but doesn't reject valid ones
 */
function matchesArabicKeyword(text: string, keyword: string, position: number): boolean {
  const keywordLower = keyword.toLowerCase();
  const textLower = text.toLowerCase();
  
  // Check if keyword matches at this position
  if (textLower.substring(position, position + keywordLower.length) !== keywordLower) {
    return false;
  }
  
  const beforeChar = position > 0 ? textLower[position - 1] : '';
  const afterChar = position + keywordLower.length < textLower.length 
    ? textLower[position + keywordLower.length] 
    : '';
  
  // Arabic word boundaries: space, punctuation, or start/end of string
  const arabicPunctuation = /[\s\u060C\u061B\u061F\u0640\u200C\u200D\u06D4\uFD3E\uFD3F\u002E\u002C\u003B\u003F\u0021\u003A\u002D\u2013\u2014\u2015\u0028\u0029\u005B\u005D\u007B\u007D\u00AB\u00BB\u0022\u0027\u2018\u2019\u201C\u201D]/;
  
  // Check if before and after characters are word boundaries
  const beforeIsBoundary = position === 0 || arabicPunctuation.test(beforeChar);
  const afterIsBoundary = position + keywordLower.length >= textLower.length || arabicPunctuation.test(afterChar);
  
  // Prefer matches at boundaries, but allow others (they'll be filtered by overlap checking)
  // This helps avoid false positives from partial word matches
  return beforeIsBoundary && afterIsBoundary;
}

/**
 * Extract reputation grades from scholarly opinions
 * Returns array with duplicates to preserve frequency (each opinion that mentions a grade adds it)
 * Improved to check longer, more specific phrases first and use word boundary matching
 */
function extractGradesFromOpinions(opinions: Narrator['scholarlyOpinions']): ReputationGrade[] {
  if (!opinions || opinions.length === 0) return [];
  
  const foundGrades: ReputationGrade[] = [];
  
  // Sort keywords by length (longest first) to check more specific phrases first
  const sortedKeywords = Object.entries(GRADE_KEYWORDS).sort((a, b) => b[0].length - a[0].length);
  
  for (const opinion of opinions) {
    const text = (opinion.opinionText || '').toLowerCase();
    const matchedPositions = new Set<number>(); // Track matched positions to avoid overlaps
    let gradeFound = false;
    
    // Check for grade keywords (longest first to prioritize specific phrases)
    for (const [keyword, grades] of sortedKeywords) {
      const keywordLower = keyword.toLowerCase();
      let searchStart = 0;
      
      // Find all occurrences of this keyword
      while (true) {
        const position = text.indexOf(keywordLower, searchStart);
        if (position === -1) break;
        
        // Check if this position overlaps with a previously matched (longer) keyword
        let overlaps = false;
        for (let i = position; i < position + keywordLower.length; i++) {
          if (matchedPositions.has(i)) {
            overlaps = true;
            break;
          }
        }
        
        // Only process if it doesn't overlap with a longer, more specific keyword
        if (!overlaps) {
          // Prefer matches at word boundaries, but allow others if no overlap
          // This prevents false positives from partial matches while being lenient with Arabic text
          const isAtBoundary = matchesArabicKeyword(text, keyword, position);
          
          // For single-word keywords, require word boundaries to avoid false positives
          // For multi-word phrases, be more lenient as they're less likely to be partial matches
          const isMultiWord = keyword.includes(' ');
          const shouldMatch = isAtBoundary || isMultiWord;
          
          if (shouldMatch) {
            grades.forEach(grade => {
              foundGrades.push(grade);
              gradeFound = true;
            });
            
            // Mark this position as matched to prevent shorter keywords from matching here
            for (let i = position; i < position + keywordLower.length; i++) {
              matchedPositions.add(i);
            }
          }
        }
        
        searchStart = position + 1;
      }
    }
    
    // Check opinion type if no explicit grade keyword found
    if (!gradeFound) {
      if (opinion.opinionType === 'ta\'dil') {
        // Positive opinion - likely trustworthy
        foundGrades.push('Thiqah'); // Default to Thiqah for positive opinions
      } else if (opinion.opinionType === 'jarh') {
        // Negative opinion - likely weak
        foundGrades.push('Da\'if'); // Default to Da'if for negative opinions
      }
    }
  }
  
  return foundGrades;
}

/**
 * Extract grades from Ibn Hajar rank
 */
function extractGradesFromIbnHajarRank(rank: string | undefined): ReputationGrade[] {
  if (!rank) return [];
  
  const rankLower = rank.toLowerCase();
  const grades: ReputationGrade[] = [];
  
  // Parse common Ibn Hajar rankings
  if (rankLower.includes('ثقة') || rankLower.includes('ثبت')) {
    if (rankLower.includes('ثبت')) {
      grades.push('Thiqah Thabt');
    } else {
      grades.push('Thiqah');
    }
  } else if (rankLower.includes('صدوق')) {
    if (rankLower.includes('سيء') || rankLower.includes('سئ')) {
      grades.push('Saduq Sayyi\' al-Hifz');
    } else if (rankLower.includes('يهم')) {
      grades.push('Saduq Yahim');
    } else {
      grades.push('Saduq');
    }
  } else if (rankLower.includes('مقبول')) {
    grades.push('Maqbūl');
  } else if (rankLower.includes('ضعيف')) {
    grades.push('Da\'if');
  } else if (rankLower.includes('متروك')) {
    grades.push('Matruk');
  } else if (rankLower.includes('مجهول')) {
    grades.push('Majhul al-Hal');
  }
  
  return grades;
}

/**
 * Extract grades from Dhahabi rank
 */
function extractGradesFromDhahabiRank(rank: string | undefined): ReputationGrade[] {
  if (!rank) return [];
  
  const rankLower = rank.toLowerCase();
  const grades: ReputationGrade[] = [];
  
  // Similar parsing for Dhahabi
  if (rankLower.includes('ثقة') || rankLower.includes('ثبت')) {
    if (rankLower.includes('ثبت')) {
      grades.push('Thiqah Thabt');
    } else {
      grades.push('Thiqah');
    }
  } else if (rankLower.includes('صدوق')) {
    grades.push('Saduq');
  } else if (rankLower.includes('ضعيف')) {
    grades.push('Da\'if');
  }
  
  return grades;
}

/**
 * Extract grades from Taqrib category
 */
function extractGradesFromTaqribCategory(category: string | undefined): ReputationGrade[] {
  if (!category) return [];
  
  const categoryLower = category.toLowerCase();
  const grades: ReputationGrade[] = [];
  
  // Taqrib categories often indicate reliability
  if (categoryLower.includes('ثقة') || categoryLower.includes('ثبت')) {
    grades.push('Thiqah');
  } else if (categoryLower.includes('صدوق')) {
    grades.push('Saduq');
  } else if (categoryLower.includes('ضعيف')) {
    grades.push('Da\'if');
  }
  
  return grades;
}

/**
 * Extract reputation grades from all available sources in the narrator data
 * Returns array with duplicates to preserve frequency - each source that mentions a grade adds it
 * This allows the grading calculation to weight grades by how many times they appear
 */
export function extractReputationGrades(narrator: Narrator): ReputationGrade[] {
  const allGrades: ReputationGrade[] = [];
  
  // 1. Check explicit reputation grades in database
  // Each reputation grade entry represents one statement, so add each one
  if (narrator.reputationGrades && narrator.reputationGrades.length > 0) {
    for (const rep of narrator.reputationGrades) {
      const grade = rep.grade as ReputationGrade;
      if (grade && Object.keys(GRADE_KEYWORDS).some(k => rep.grade.includes(k))) {
        allGrades.push(grade); // Add each occurrence to preserve frequency
      }
    }
  }
  
  // 2. Extract from scholarly opinions (each opinion can contribute grades)
  const opinionGrades = extractGradesFromOpinions(narrator.scholarlyOpinions);
  allGrades.push(...opinionGrades);
  
  // 3. Extract from Ibn Hajar rank (counts as one source)
  const ibnHajarGrades = extractGradesFromIbnHajarRank(narrator.ibnHajarRank);
  allGrades.push(...ibnHajarGrades);
  
  // 4. Extract from Dhahabi rank (counts as one source)
  const dhahabiGrades = extractGradesFromDhahabiRank(narrator.dhahabiRank);
  allGrades.push(...dhahabiGrades);
  
  // 5. Extract from Taqrib category (counts as one source)
  const taqribGrades = extractGradesFromTaqribCategory(narrator.taqribCategory);
  allGrades.push(...taqribGrades);
  
  // Return array with duplicates preserved (frequency matters)
  return allGrades;
}

