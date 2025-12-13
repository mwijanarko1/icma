// Utility to match extracted narrators to database narrators
import { getDatabase, closeDatabase } from '@/data/db';
import type { Narrator } from '@/data/types';

export interface MatchedNarrator {
  narratorId: string;
  confidence: number; // 0-1, how confident we are in the match
  matchedName: string; // The name that matched
  databaseNarrator: Narrator;
}

export interface NarratorMatchResult {
  extractedName: string;
  matched: boolean;
  match?: MatchedNarrator;
  suggestedGrades?: string[]; // Auto-extracted grades from database
}

/**
 * Normalize Arabic text for better matching
 * Removes diacritics, extra spaces, common variations, and normalizes ابي to ابو
 */
export function normalizeArabic(text: string): string {
  return text
    .replace(/[ًٌٍَُِّْ]/g, '') // Remove diacritics (harakats)
    .replace(/[أإآا]/g, 'ا') // Normalize alef variations
    .replace(/[ىي]/g, 'ي') // Normalize yeh variations
    .replace(/[ةه]/g, 'ه') // Normalize teh marbuta
    .replace(/ابي|أبي/g, 'ابو') // Normalize ابي to ابو (so abi huraira = abu huraira)
    .replace(/\s+/g, ' ') // Normalize spaces
    .trim()
    .toLowerCase();
}

/**
 * Normalize English text (simple lowercase and trim)
 */
export function normalizeEnglish(text: string): string {
  return text.trim().toLowerCase();
}

/**
 * Detect if text contains Arabic characters
 */
export function hasArabicCharacters(text: string): boolean {
  return /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/.test(text);
}

/**
 * Normalize search term - use Arabic normalization if contains Arabic, otherwise English normalization
 */
export function normalizeSearchTerm(term: string): string {
  return hasArabicCharacters(term) ? normalizeArabic(term) : normalizeEnglish(term);
}

/**
 * Calculate similarity between two English strings
 * Uses word boundary-aware matching
 */
function calculateEnglishSimilarity(str1: string, str2: string): number {
  const normalized1 = normalizeEnglish(str1);
  const normalized2 = normalizeEnglish(str2);
  
  // Exact match
  if (normalized1 === normalized2) return 1.0;
  
  // Split into words
  const words1 = normalized1.split(/\s+/).filter(w => w.length > 0);
  const words2 = normalized2.split(/\s+/).filter(w => w.length > 0);
  
  if (words1.length === 0 || words2.length === 0) return 0;
  
  // Check for exact word matches
  const set1 = new Set(words1);
  const set2 = new Set(words2);
  const commonWords = words1.filter(w => set2.has(w));
  const allWords = new Set([...words1, ...words2]);
  
  // Jaccard similarity for word sets
  const wordSimilarity = allWords.size > 0 ? commonWords.length / allWords.size : 0;
  
  // Also check for word prefix matches (e.g., "John" matches "John Smith")
  let prefixMatches = 0;
  for (const word1 of words1) {
    for (const word2 of words2) {
      if (word1.startsWith(word2) || word2.startsWith(word1)) {
        const shorter = Math.min(word1.length, word2.length);
        const longer = Math.max(word1.length, word2.length);
        prefixMatches = Math.max(prefixMatches, shorter / longer);
      }
    }
  }
  
  // Combine word similarity and prefix matches
  return Math.max(wordSimilarity, prefixMatches * 0.9); // Slightly lower weight for prefix matches
}

/**
 * Parse an Arabic name into its components
 * Returns: { firstName, fatherName, grandfatherName, familyName, otherParts }
 */
interface NameComponents {
  firstName: string;
  fatherName?: string;
  grandfatherName?: string;
  familyName?: string;
  otherParts: string[];
}

function parseNameComponents(name: string): NameComponents {
  const normalized = normalizeArabic(name);
  const words = normalized.split(/\s+/).filter(w => w.length > 1);
  
  if (words.length === 0) {
    return { firstName: '', otherParts: [] };
  }
  
  const relationshipWords = ['ابن', 'بن', 'اب', 'أب'];
  const namePrefixes = ['ابو', 'أبو', 'ام', 'أم'];
  
  let firstName = '';
  let fatherName: string | undefined;
  let grandfatherName: string | undefined;
  let familyName: string | undefined;
  const otherParts: string[] = [];
  
  // Handle name prefixes like "أبو إسحاق"
  let startIndex = 0;
  if (words.length > 1 && namePrefixes.includes(words[0])) {
    firstName = words[1];
    startIndex = 2;
  } else {
    // Find the first relationship word to identify where the name starts and ends
    let firstNameEnd = words.length;
    for (let i = 0; i < words.length; i++) {
      if (relationshipWords.includes(words[i])) {
        firstNameEnd = i;
        break;
      }
    }
    firstName = words.slice(0, firstNameEnd).join(' ');
    startIndex = firstNameEnd;
  }
  
  // Parse the rest: father, grandfather, family name
  let i = startIndex;
  while (i < words.length) {
    if (relationshipWords.includes(words[i])) {
      i++;
      if (i < words.length) {
        // Check if next is another relationship word (for grandfather)
        if (i + 1 < words.length && relationshipWords.includes(words[i + 1])) {
          fatherName = words[i];
          i += 2; // Skip relationship word
          if (i < words.length) {
            grandfatherName = words[i];
            i++;
          }
        } else {
          if (!fatherName) {
            fatherName = words[i];
          } else if (!grandfatherName) {
            grandfatherName = words[i];
          } else {
            otherParts.push(words[i]);
          }
          i++;
        }
      }
    } else {
      // Check if it's a family name (often starts with ال or is a single word at the end)
      if (words[i].startsWith('ال') || (i === words.length - 1 && !grandfatherName)) {
        if (!familyName) {
          familyName = words[i];
        } else {
          otherParts.push(words[i]);
        }
      } else {
        otherParts.push(words[i]);
      }
      i++;
    }
  }
  
  return { firstName, fatherName, grandfatherName, familyName, otherParts };
}

/**
 * Extract the first name (primary identifier) from an Arabic name
 */
function extractFirstName(name: string): string {
  const components = parseNameComponents(name);
  return components.firstName;
}

/**
 * Calculate similarity between two Arabic strings using structured name comparison
 * Prioritizes matching name components (first name, father's name, etc.)
 */
export function calculateSimilarity(str1: string, str2: string): number {
  const normalized1 = normalizeArabic(str1);
  const normalized2 = normalizeArabic(str2);
  
  // Exact match after normalization
  if (normalized1 === normalized2) return 1.0;
  
  // Check if one contains the other (substring match)
  if (normalized1.includes(normalized2) || normalized2.includes(normalized1)) {
    const shorter = Math.min(normalized1.length, normalized2.length);
    const longer = Math.max(normalized1.length, normalized2.length);
    return Math.min(0.95, shorter / longer); // Cap at 0.95 to allow exact match to be higher
  }
  
  // Parse both names into components
  const comp1 = parseNameComponents(str1);
  const comp2 = parseNameComponents(str2);
  
  // First name MUST match (with some tolerance for typos)
  // This prevents "إسحاق بن إبراهيم" from matching "إبراهيم بن أبي العباس"
  if (comp1.firstName && comp2.firstName) {
    const firstNameSim = calculateWordSimilarity(comp1.firstName, comp2.firstName);
    if (firstNameSim < 0.8) {
      // First names are too different - likely different people
      return 0; // No match if first names don't match well
    }
  }
  
  // Calculate component-based similarity with weights
  // More distinguishing parts (father, grandfather) get higher weight
  let totalWeight = 0;
  let matchedWeight = 0;
  
  // First name weight: 20%
  if (comp1.firstName && comp2.firstName) {
    totalWeight += 0.2;
    const sim = calculateWordSimilarity(comp1.firstName, comp2.firstName);
    matchedWeight += 0.2 * sim;
  }
  
  // Father's name weight: 35% (very distinguishing)
  if (comp1.fatherName || comp2.fatherName) {
    totalWeight += 0.35;
    if (comp1.fatherName && comp2.fatherName) {
      const sim = calculateWordSimilarity(comp1.fatherName, comp2.fatherName);
      matchedWeight += 0.35 * sim;
    }
    // If one has father name and other doesn't, penalize
    else if (comp1.fatherName || comp2.fatherName) {
      matchedWeight += 0; // No match for missing father name
    }
  }
  
  // Grandfather's name weight: 25% (very distinguishing)
  if (comp1.grandfatherName || comp2.grandfatherName) {
    totalWeight += 0.25;
    if (comp1.grandfatherName && comp2.grandfatherName) {
      const sim = calculateWordSimilarity(comp1.grandfatherName, comp2.grandfatherName);
      matchedWeight += 0.25 * sim;
    }
    // If one has grandfather name and other doesn't, penalize less (not always present)
    else if (comp1.grandfatherName || comp2.grandfatherName) {
      matchedWeight += 0.05; // Small penalty
    }
  }
  
  // Family name weight: 15%
  if (comp1.familyName || comp2.familyName) {
    totalWeight += 0.15;
    if (comp1.familyName && comp2.familyName) {
      const sim = calculateWordSimilarity(comp1.familyName, comp2.familyName);
      matchedWeight += 0.15 * sim;
    }
    // Family name might not always be present, so less penalty
    else if (comp1.familyName || comp2.familyName) {
      matchedWeight += 0.03; // Small penalty
    }
  }
  
  // Other parts weight: 5%
  if (comp1.otherParts.length > 0 || comp2.otherParts.length > 0) {
    totalWeight += 0.05;
    // Compare other parts (less important)
    const otherSim = comp1.otherParts.length > 0 && comp2.otherParts.length > 0
      ? comp1.otherParts.reduce((max, part1) => {
          const sim = comp2.otherParts.reduce((m, part2) => 
            Math.max(m, calculateWordSimilarity(part1, part2)), 0);
          return Math.max(max, sim);
        }, 0)
      : 0;
    matchedWeight += 0.05 * otherSim;
  }
  
  // Calculate final similarity
  // If totalWeight is 0, fall back to word-based similarity
  if (totalWeight === 0) {
    // Fallback to word-based similarity
    const words1 = normalized1.split(/\s+/).filter(w => w.length > 1);
    const words2 = normalized2.split(/\s+/).filter(w => w.length > 1);
    if (words1.length === 0 || words2.length === 0) return 0;
    
    const set1 = new Set(words1);
    const set2 = new Set(words2);
    const commonWords = words1.filter(w => set2.has(w));
    const union = new Set([...words1, ...words2]);
    const jaccard = union.size > 0 ? commonWords.length / union.size : 0;
    return jaccard;
  }
  
  // Normalize by total weight to get final similarity
  const similarity = matchedWeight / totalWeight;
  
  // If father's name is present in both but doesn't match, heavily penalize
  if (comp1.fatherName && comp2.fatherName) {
    const fatherSim = calculateWordSimilarity(comp1.fatherName, comp2.fatherName);
    if (fatherSim < 0.7) {
      // Father's name is very different - unlikely to be the same person
      return similarity * 0.4; // Heavy penalty
    }
  }
  
  return Math.min(1.0, similarity);
}

/**
 * Calculate similarity between two words (for first name matching)
 * Uses character-level similarity for typo tolerance
 */
function calculateWordSimilarity(word1: string, word2: string): number {
  if (word1 === word2) return 1.0;
  if (word1.includes(word2) || word2.includes(word1)) {
    const shorter = Math.min(word1.length, word2.length);
    const longer = Math.max(word1.length, word2.length);
    return shorter / longer;
  }
  
  // Simple character-based similarity
  const chars1 = new Set(word1.split(''));
  const chars2 = new Set(word2.split(''));
  const common = [...chars1].filter(c => chars2.has(c)).length;
  const union = new Set([...chars1, ...chars2]);
  return union.size > 0 ? common / union.size : 0;
}

/**
 * Search for a narrator in the database by name (Arabic or English)
 * Uses the same normalization and matching logic as the search function
 */
export function findNarratorByName(arabicName: string, englishName?: string): MatchedNarrator[] {
  const db = getDatabase();
  
  try {
    // Determine if we're searching by Arabic or English
    const searchByArabic = arabicName && arabicName.trim().length > 0;
    const searchByEnglish = englishName && englishName.trim().length > 0;
    
    if (!searchByArabic && !searchByEnglish) {
      return []; // No search terms provided
    }
    
    // Normalize search terms using the same logic as search function
    const normalizedArabic = searchByArabic ? normalizeSearchTerm(arabicName) : '';
    const normalizedEnglish = searchByEnglish ? normalizeSearchTerm(englishName) : '';
    const isArabicSearch = searchByArabic && hasArabicCharacters(arabicName);
    
    // Get all narrators from database
    const narrators = db.prepare(`
      SELECT id, primary_arabic_name, primary_english_name,
             full_name_arabic, full_name_english, title, kunya,
             ibn_hajar_rank, dhahabi_rank, taqrib_category,
             death_year_ah, death_year_ce
      FROM narrators
    `).all() as Array<{
      id: string;
      primary_arabic_name: string;
      primary_english_name: string;
      full_name_arabic: string | null;
      full_name_english: string | null;
      title: string | null;
      kunya: string | null;
      ibn_hajar_rank: string | null;
      dhahabi_rank: string | null;
      taqrib_category: string | null;
      death_year_ah: number | null;
      death_year_ce: number | null;
    }>;
    
    // Get alternate names (both Arabic and English)
    const alternateNames = db.prepare(`
      SELECT narrator_id, arabic_name, english_name
      FROM narrator_names
    `).all() as Array<{ 
      narrator_id: string; 
      arabic_name: string | null;
      english_name: string | null;
    }>;
    
    const alternateArabicMap = new Map<string, string[]>();
    const alternateEnglishMap = new Map<string, string[]>();
    for (const alt of alternateNames) {
      if (alt.arabic_name) {
        if (!alternateArabicMap.has(alt.narrator_id)) {
          alternateArabicMap.set(alt.narrator_id, []);
        }
        alternateArabicMap.get(alt.narrator_id)!.push(alt.arabic_name);
      }
      if (alt.english_name) {
        if (!alternateEnglishMap.has(alt.narrator_id)) {
          alternateEnglishMap.set(alt.narrator_id, []);
        }
        alternateEnglishMap.get(alt.narrator_id)!.push(alt.english_name);
      }
    }
    
    // Calculate similarity for each narrator
    const matches: MatchedNarrator[] = [];
    
    for (const narrator of narrators) {
      let maxSimilarity = 0;
      let matchedName = narrator.primary_arabic_name || narrator.primary_english_name;
      
      // Check Arabic names if searching by Arabic
      if (searchByArabic && isArabicSearch) {
        // Check primary Arabic name
        const primarySim = calculateSimilarity(arabicName, narrator.primary_arabic_name);
        if (primarySim > maxSimilarity) {
          maxSimilarity = primarySim;
          matchedName = narrator.primary_arabic_name;
        }
        
        // Check full Arabic name
        if (narrator.full_name_arabic) {
          const fullSim = calculateSimilarity(arabicName, narrator.full_name_arabic);
          if (fullSim > maxSimilarity) {
            maxSimilarity = fullSim;
            matchedName = narrator.full_name_arabic;
          }
        }
        
        // Check alternate Arabic names
        const alternates = alternateArabicMap.get(narrator.id) || [];
        for (const altName of alternates) {
          const altSim = calculateSimilarity(arabicName, altName);
          if (altSim > maxSimilarity) {
            maxSimilarity = altSim;
            matchedName = altName;
          }
        }
        
        // Check kunya if provided
        if (narrator.kunya) {
          const kunyaSim = calculateSimilarity(arabicName, narrator.kunya);
          if (kunyaSim > maxSimilarity) {
            maxSimilarity = kunyaSim;
            matchedName = narrator.kunya;
          }
        }
      }
      
      // Check English names if searching by English (or if Arabic search didn't find good match)
      if (searchByEnglish || (!isArabicSearch && searchByArabic)) {
        const searchName = searchByEnglish ? englishName : arabicName;
        const normalizedSearch = searchByEnglish ? normalizedEnglish : normalizedArabic;
        
        // Check primary English name
        if (narrator.primary_english_name) {
          const primarySim = calculateEnglishSimilarity(searchName, narrator.primary_english_name);
          if (primarySim > maxSimilarity) {
            maxSimilarity = primarySim;
            matchedName = narrator.primary_english_name;
          }
        }
        
        // Check full English name
        if (narrator.full_name_english) {
          const fullSim = calculateEnglishSimilarity(searchName, narrator.full_name_english);
          if (fullSim > maxSimilarity) {
            maxSimilarity = fullSim;
            matchedName = narrator.full_name_english;
          }
        }
        
        // Check alternate English names
        const alternates = alternateEnglishMap.get(narrator.id) || [];
        for (const altName of alternates) {
          const altSim = calculateEnglishSimilarity(searchName, altName);
          if (altSim > maxSimilarity) {
            maxSimilarity = altSim;
            matchedName = altName;
          }
        }
      }
      
      // Also check if Arabic name matches English search (cross-language matching)
      // This handles cases where user searches English but database has Arabic
      if (searchByEnglish && narrator.primary_arabic_name) {
        // Use a lower threshold for cross-language matching
        const crossSim = calculateSimilarity(englishName!, narrator.primary_arabic_name) * 0.7;
        if (crossSim > maxSimilarity) {
          maxSimilarity = crossSim;
          matchedName = narrator.primary_arabic_name;
        }
      }
      
      // Only include if similarity is above threshold
      if (maxSimilarity >= 0.3) {
        // Get full narrator data
        const fullNarrator = getNarratorById(db, narrator.id);
        if (fullNarrator) {
          matches.push({
            narratorId: narrator.id,
            confidence: maxSimilarity,
            matchedName,
            databaseNarrator: fullNarrator,
          });
        }
      }
    }
    
    // Sort by confidence (highest first)
    matches.sort((a, b) => b.confidence - a.confidence);
    
    return matches;
  } finally {
    closeDatabase(db);
  }
}

/**
 * Get full narrator data including relationships and opinions
 */
function getNarratorById(db: any, narratorId: string): Narrator | null {
  try {
    const narrator = db.prepare(`
      SELECT * FROM narrators WHERE id = ?
    `).get(narratorId) as any;
    
    if (!narrator) return null;
    
    // Get scholarly opinions
    const opinions = db.prepare(`
      SELECT * FROM scholarly_opinions WHERE narrator_id = ?
    `).all(narratorId) as any[];
    
    // Get relationships
    const relationships = db.prepare(`
      SELECT * FROM narrator_relationships WHERE narrator_id = ?
    `).all(narratorId) as any[];
    
    // Get lineages
    const lineages = db.prepare(`
      SELECT * FROM narrator_lineage WHERE narrator_id = ?
    `).all(narratorId) as any[];
    
    // Get reputation grades
    const reputationGrades = db.prepare(`
      SELECT * FROM narrator_reputation WHERE narrator_id = ?
    `).all(narratorId) as any[];
    
    return {
      id: narrator.id,
      primaryArabicName: narrator.primary_arabic_name,
      primaryEnglishName: narrator.primary_english_name,
      fullNameArabic: narrator.full_name_arabic || undefined,
      fullNameEnglish: narrator.full_name_english || undefined,
      title: narrator.title || undefined,
      kunya: narrator.kunya || undefined,
      lineage: narrator.lineage || undefined,
      deathYearAH: narrator.death_year_ah || undefined,
      deathYearAHAlternative: narrator.death_year_ah_alternative || undefined,
      deathYearCE: narrator.death_year_ce || undefined,
      placeOfResidence: narrator.place_of_residence || undefined,
      placeOfDeath: narrator.place_of_death || undefined,
      placesTraveled: narrator.places_traveled ? JSON.parse(narrator.places_traveled) : undefined,
      taqribCategory: narrator.taqrib_category || undefined,
      ibnHajarRank: narrator.ibn_hajar_rank || undefined,
      dhahabiRank: narrator.dhahabi_rank || undefined,
      notes: narrator.notes || undefined,
      scholarlyOpinions: opinions.map((op: any) => ({
        narratorId: op.narrator_id,
        scholarName: op.scholar_name,
        opinionText: op.opinion_text,
        sourceReference: op.source_reference || undefined,
        sourceBook: op.source_book || undefined,
        sourceVolume: op.source_volume || undefined,
        opinionType: op.opinion_type as 'jarh' | 'ta\'dil' | 'neutral',
        isPrimary: op.is_primary === 1,
      })),
      relationships: relationships.map((rel: any) => ({
        narratorId: rel.narrator_id,
        relatedNarratorId: rel.related_narrator_id,
        relationshipType: rel.relationship_type as any,
        relationshipDescription: rel.relationship_description || undefined,
        durationYears: rel.duration_years || undefined,
      })),
      lineages: lineages.map((lin: any) => ({
        narratorId: lin.narrator_id,
        lineageType: lin.lineage_type as any,
        lineageValue: lin.lineage_value,
      })),
      reputationGrades: reputationGrades.map((rep: any) => ({
        narratorId: rep.narrator_id,
        grade: rep.grade,
        gradeSource: rep.grade_source || undefined,
      })),
    };
  } catch (error) {
    console.error(`Error fetching narrator ${narratorId}:`, error);
    return null;
  }
}

