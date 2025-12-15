// Utility for loading hadith data from JSON files
import fs from 'fs';
import path from 'path';

// Collection names
export const HADITH_COLLECTIONS = [
  'bukhari',
  'muslim',
  'nasai',
  'tirmidhi',
  'abudawud',
  'ibnmajah',
] as const;

export type HadithCollection = typeof HADITH_COLLECTIONS[number];

export interface HadithRecord {
  hadith_number: number;
  sub_version?: string;
  reference: string;
  english_narrator?: string;
  english_translation: string;
  arabic_text: string;
  in_book_reference?: string;
}

// Cache for loaded JSON data
const jsonCache = new Map<HadithCollection, HadithRecord[]>();

/**
 * Load hadith data from JSON file for a collection
 */
export function loadHadithFromJson(collection: HadithCollection): HadithRecord[] {
  // Check cache first
  if (jsonCache.has(collection)) {
    return jsonCache.get(collection)!;
  }

  const jsonPath = path.join(process.cwd(), 'data', 'json', `${collection}.json`);

  try {
    const jsonData = fs.readFileSync(jsonPath, 'utf-8');
    const hadithData = JSON.parse(jsonData) as HadithRecord[];
    jsonCache.set(collection, hadithData);
    return hadithData;
  } catch (error) {
    throw new Error(`Failed to load hadith data for ${collection}: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Get a single hadith by number (with optional sub-version)
 */
export function getHadithByNumber(
  collection: HadithCollection,
  hadithNumber: number,
  subVersion?: string
): HadithRecord | null {
  const hadithData = loadHadithFromJson(collection);

  if (subVersion) {
    // Look for exact match with sub-version
    return hadithData.find(h =>
      h.hadith_number === hadithNumber && h.sub_version === subVersion
    ) || null;
  } else {
    // Look for hadith number, return first match (or all versions if multiple)
    const matches = hadithData.filter(h => h.hadith_number === hadithNumber);
    return matches.length > 0 ? matches[0] : null;
  }
}

/**
 * Get all versions of a hadith number
 */
export function getHadithVersions(
  collection: HadithCollection,
  hadithNumber: number
): HadithRecord[] {
  const hadithData = loadHadithFromJson(collection);
  return hadithData.filter(h => h.hadith_number === hadithNumber);
}

/**
 * Search hadith by text (English or Arabic)
 */
export function searchHadith(
  collection: HadithCollection,
  query: string,
  limit: number = 50,
  offset: number = 0
): { results: HadithRecord[]; total: number } {
  const hadithData = loadHadithFromJson(collection);
  const lowerQuery = query.toLowerCase();

  // Simple text search - can be enhanced with more sophisticated matching
  const matches = hadithData.filter(h =>
    h.english_translation.toLowerCase().includes(lowerQuery) ||
    h.arabic_text.includes(query) || // Keep original case for Arabic
    h.reference.toLowerCase().includes(lowerQuery) ||
    (h.english_narrator && h.english_narrator.toLowerCase().includes(lowerQuery)) ||
    (h.in_book_reference && h.in_book_reference.toLowerCase().includes(lowerQuery))
  );

  const paginatedResults = matches.slice(offset, offset + limit);

  return {
    results: paginatedResults,
    total: matches.length
  };
}

/**
 * Get hadith in a range
 */
export function getHadithRange(
  collection: HadithCollection,
  start: number,
  end: number,
  limit: number = 100,
  offset: number = 0
): { results: HadithRecord[]; total: number } {
  const hadithData = loadHadithFromJson(collection);

  const matches = hadithData.filter(h =>
    h.hadith_number >= start && h.hadith_number <= end
  );

  const paginatedResults = matches.slice(offset, offset + limit);

  return {
    results: paginatedResults,
    total: matches.length
  };
}

/**
 * Get total count of hadith in a collection
 */
export function getHadithCount(collection: HadithCollection): number {
  const hadithData = loadHadithFromJson(collection);
  return hadithData.length;
}

/**
 * Get all hadith in a collection (paginated)
 */
export function getAllHadith(
  collection: HadithCollection,
  limit: number = 50,
  offset: number = 0
): { results: HadithRecord[]; total: number } {
  const hadithData = loadHadithFromJson(collection);

  const paginatedResults = hadithData.slice(offset, offset + limit);

  return {
    results: paginatedResults,
    total: hadithData.length
  };
}