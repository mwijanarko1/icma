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

// Query parser for advanced search syntax
interface SearchTerm {
  field?: string;
  value: string;
  operator: 'AND' | 'OR' | 'NOT' | 'PROXIMITY' | 'FUZZY' | 'WILDCARD' | 'PHRASE' | 'RANGE';
  boost?: number;
  proximity?: number;
  fuzzyDistance?: number;
  required?: boolean;
  prohibited?: boolean;
}

function parseQuery(query: string): SearchTerm[] {
  const terms: SearchTerm[] = [];
  const tokens = tokenizeQuery(query);

  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];

    // Handle boolean operators
    if (token.toUpperCase() === 'AND' || token.toUpperCase() === 'OR' || token.toUpperCase() === 'NOT') {
      continue; // Skip boolean operators, handled elsewhere
    }

    // Handle field:term syntax
    let field: string | undefined;
    let value = token;

    const fieldMatch = token.match(/^(\w+):(.+)$/);
    if (fieldMatch) {
      field = fieldMatch[1];
      value = fieldMatch[2];
    }

    // Determine operator type
    let operator: SearchTerm['operator'] = 'AND'; // Default
    let boost = 1;
    let proximity: number | undefined;
    let fuzzyDistance: number | undefined;
    let required = false;
    let prohibited = false;

    // Check for required/prohibited operators
    if (value.startsWith('+')) {
      required = true;
      value = value.slice(1);
    } else if (value.startsWith('-')) {
      prohibited = true;
      value = value.slice(1);
    }

    // Check for phrase (quoted)
    if (value.startsWith('"') && value.endsWith('"')) {
      operator = 'PHRASE';
      value = value.slice(1, -1);
    }

    // Check for fuzzy search
    const fuzzyMatch = value.match(/^(.+)~(\d*\.?\d*)$/);
    if (fuzzyMatch) {
      operator = 'FUZZY';
      value = fuzzyMatch[1];
      fuzzyDistance = fuzzyMatch[2] ? parseFloat(fuzzyMatch[2]) : 0.5;
    }

    // Check for proximity search
    const proximityMatch = value.match(/^"(.+)"~(\d+)$/);
    if (proximityMatch) {
      operator = 'PROXIMITY';
      value = proximityMatch[1];
      proximity = parseInt(proximityMatch[2]);
    }

    // Check for range search
    const rangeMatch = value.match(/^\[(.+)\s+TO\s+(.+)\]$/);
    if (rangeMatch) {
      operator = 'RANGE';
      value = `${rangeMatch[1]} TO ${rangeMatch[2]}`;
    }

    // Check for wildcard
    if (value.includes('*') || value.includes('?')) {
      operator = 'WILDCARD';
    }

    // Check for boost
    const boostMatch = value.match(/^(.+)\^(\d*\.?\d*)$/);
    if (boostMatch) {
      value = boostMatch[1];
      boost = parseFloat(boostMatch[2]) || 1;
    }

    terms.push({
      field,
      value,
      operator,
      boost,
      proximity,
      fuzzyDistance,
      required,
      prohibited
    });
  }

  return terms;
}

function tokenizeQuery(query: string): string[] {
  const tokens: string[] = [];
  let current = '';
  let inQuotes = false;
  let escaped = false;

  for (let i = 0; i < query.length; i++) {
    const char = query[i];

    if (escaped) {
      current += char;
      escaped = false;
      continue;
    }

    if (char === '\\') {
      escaped = true;
      continue;
    }

    if (char === '"') {
      inQuotes = !inQuotes;
      current += char;
      continue;
    }

    if (!inQuotes && /\s/.test(char)) {
      if (current.trim()) {
        tokens.push(current.trim());
        current = '';
      }
      continue;
    }

    // Handle boolean operators
    if (!inQuotes && /\s/.test(query[i - 1] || ' ') && (query.substr(i, 3).toUpperCase() === 'AND' ||
        query.substr(i, 2).toUpperCase() === 'OR' || query.substr(i, 3).toUpperCase() === 'NOT')) {
      if (current.trim()) {
        tokens.push(current.trim());
        current = '';
      }
      const op = query.substr(i, 3).toUpperCase() === 'AND' ? 'AND' :
                query.substr(i, 2).toUpperCase() === 'OR' ? 'OR' : 'NOT';
      tokens.push(op);
      i += op.length - 1;
      continue;
    }

    current += char;
  }

  if (current.trim()) {
    tokens.push(current.trim());
  }

  return tokens;
}

function matchesTerm(hadith: HadithRecord, term: SearchTerm): boolean {
  const searchFields = term.field ? [term.field] : ['english_translation', 'arabic_text', 'reference', 'english_narrator', 'in_book_reference'];

  for (const field of searchFields) {
    let fieldValue = '';

    switch (field) {
      case 'english_translation':
        fieldValue = hadith.english_translation || '';
        break;
      case 'arabic_text':
        fieldValue = hadith.arabic_text || '';
        break;
      case 'reference':
        fieldValue = hadith.reference || '';
        break;
      case 'english_narrator':
        fieldValue = hadith.english_narrator || '';
        break;
      case 'in_book_reference':
        fieldValue = hadith.in_book_reference || '';
        break;
      case 'hadith_number':
        fieldValue = hadith.hadith_number.toString();
        break;
      default:
        continue;
    }

    const matches = matchValue(fieldValue, term);
    if (matches) return true;
  }

  return false;
}

function matchValue(fieldValue: string, term: SearchTerm): boolean {
  const value = term.value.toLowerCase();
  const fieldLower = fieldValue.toLowerCase();

  switch (term.operator) {
    case 'PHRASE':
      return fieldLower.includes(value);

    case 'FUZZY':
      return levenshteinDistance(fieldLower, value) <= (term.fuzzyDistance || 0.5) * Math.max(fieldLower.length, value.length);

    case 'WILDCARD':
      const regex = new RegExp('^' + value.replace(/\*/g, '.*').replace(/\?/g, '.') + '$', 'i');
      return regex.test(fieldValue);

    case 'RANGE':
      // Range search not implemented for text fields in this simple version
      return false;

    default: // AND, OR, etc.
      return fieldLower.includes(value);
  }
}

function levenshteinDistance(str1: string, str2: string): number {
  const matrix = [];
  for (let i = 0; i <= str2.length; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= str1.length; j++) {
    matrix[0][j] = j;
  }
  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }
  return matrix[str2.length][str1.length];
}

function scoreHadith(hadith: HadithRecord, terms: SearchTerm[]): number {
  let score = 0;

  for (const term of terms) {
    if (matchesTerm(hadith, term)) {
      score += term.boost || 1;

      // Boost exact matches
      if (term.field) {
        const fieldValue = getFieldValue(hadith, term.field);
        if (fieldValue && fieldValue.toLowerCase().includes(term.value.toLowerCase())) {
          score += 0.5;
        }
      }
    }
  }

  return score;
}

function getFieldValue(hadith: HadithRecord, field: string): string {
  switch (field) {
    case 'english_translation': return hadith.english_translation || '';
    case 'arabic_text': return hadith.arabic_text || '';
    case 'reference': return hadith.reference || '';
    case 'english_narrator': return hadith.english_narrator || '';
    case 'in_book_reference': return hadith.in_book_reference || '';
    case 'hadith_number': return hadith.hadith_number.toString();
    default: return '';
  }
}

/**
 * Search hadith with advanced query syntax support
 * Supports: fields, boolean operators, phrases, wildcards, fuzzy search, proximity, ranges, boosting
 */
export function searchHadith(
  collection: HadithCollection,
  query: string,
  limit: number = 50,
  offset: number = 0
): { results: HadithRecord[]; total: number } {
  const hadithData = loadHadithFromJson(collection);

  if (!query.trim()) {
    const paginatedResults = hadithData.slice(offset, offset + limit);
    return {
      results: paginatedResults,
      total: hadithData.length
    };
  }

  // Parse the query into search terms
  const terms = parseQuery(query);
  console.log('Parsed search terms:', terms);

  // Score and filter hadith
  const scoredResults = hadithData
    .map(hadith => ({
      hadith,
      score: scoreHadith(hadith, terms)
    }))
    .filter(result => result.score > 0)
    .sort((a, b) => b.score - a.score);

  const total = scoredResults.length;
  const paginatedResults = scoredResults
    .slice(offset, offset + limit)
    .map(result => result.hadith);

  return {
    results: paginatedResults,
    total
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