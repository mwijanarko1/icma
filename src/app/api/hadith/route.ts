import { NextRequest, NextResponse } from 'next/server';
import {
  getHadithByNumber,
  getHadithVersions,
  searchHadith,
  getHadithRange,
  getHadithCount,
  getAllHadith,
  type HadithRecord,
  type HadithCollection,
  HADITH_COLLECTIONS
} from '@/data/hadith-json';

function normalizeHadithRecords(records: HadithRecord[]): HadithRecord[] {
  return records.map((record) => ({
    ...record,
    sub_version: record.sub_version || undefined,
  }));
}

/**
 * Collection name variations mapping
 * Maps common variations to the actual collection name
 */
const COLLECTION_VARIATIONS: Record<string, HadithCollection> = {
  'bukhari': 'bukhari',
  'sahih bukhari': 'bukhari',
  'muslim': 'muslim',
  'sahih muslim': 'muslim',
  'nasai': 'nasai',
  'nasa\'i': 'nasai',
  'sunan nasai': 'nasai',
  'tirmidhi': 'tirmidhi',
  'jami tirmidhi': 'tirmidhi',
  'abudawud': 'abudawud',
  'abu dawud': 'abudawud',
  'abi dawud': 'abudawud',
  'sunan abu dawud': 'abudawud',
  'sunan abi dawud': 'abudawud',
  'ibnmajah': 'ibnmajah',
  'ibn majah': 'ibnmajah',
  'sunan ibn majah': 'ibnmajah',
};

/**
 * Normalize collection name from query
 * Handles variations like "abi dawud" -> "abudawud", "abu dawud" -> "abudawud"
 */
function normalizeCollectionName(query: string): { collection: HadithCollection; remainingQuery: string } | null {
  const trimmed = query.trim().toLowerCase();
  
  // Try exact matches first
  for (const [variation, collection] of Object.entries(COLLECTION_VARIATIONS)) {
    if (trimmed.startsWith(variation)) {
      const afterCollection = trimmed.slice(variation.length).trim();
      return { collection, remainingQuery: afterCollection };
    }
  }
  
  // Try matching collection names directly
  for (const collection of HADITH_COLLECTIONS) {
    if (trimmed.startsWith(collection)) {
      const afterCollection = trimmed.slice(collection.length).trim();
      return { collection, remainingQuery: afterCollection };
    }
  }
  
  return null;
}

/**
 * Parse collection name + hadith number from search query
 * Examples: "tirmidhi 23", "muslim 8a", "bukhari 1", "abi dawud 23", "abu dawud 8a"
 * Returns: { collection: 'tirmidhi', hadithNumber: '23', remainingQuery: '' } or null
 */
function parseCollectionAndNumber(query: string): { collection: HadithCollection; hadithNumber: string; remainingQuery: string } | null {
  const trimmed = query.trim().toLowerCase();
  
  // First, try to normalize collection name (handles variations)
  const collectionMatch = normalizeCollectionName(trimmed);
  if (!collectionMatch) {
    return null;
  }
  
  const { collection, remainingQuery: afterCollection } = collectionMatch;
  
  // Match hadith number (with optional letter suffix like "8a")
  const numberMatch = afterCollection.match(/^(\d+[a-z]?)\b/);
  if (numberMatch) {
    const hadithNumber = numberMatch[1];
    const remaining = afterCollection.slice(numberMatch[0].length).trim();
    return { collection, hadithNumber, remainingQuery: remaining };
  }
  
  return null;
}


/**
 * API route to fetch hadith from collections
 * GET /api/hadith?collection=bukhari&hadith=1
 * GET /api/hadith?collection=bukhari&start=1&end=100
 * GET /api/hadith?collection=bukhari&search=query
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const collection = searchParams.get('collection');
    const hadithParam = searchParams.get('hadith');
    const startParam = searchParams.get('start');
    const endParam = searchParams.get('end');
    const searchQuery = searchParams.get('search');
    const limitParam = searchParams.get('limit');
    const offsetParam = searchParams.get('offset');

    if (!collection) {
      return NextResponse.json(
        { error: 'Missing required parameter: collection' },
        { status: 400 }
      );
    }

    if (!HADITH_COLLECTIONS.includes(collection as HadithCollection)) {
      return NextResponse.json(
        { error: `Invalid collection: ${collection}. Valid collections: ${HADITH_COLLECTIONS.join(', ')}` },
        { status: 400 }
      );
    }

    const hadithCollection = collection as HadithCollection;

    // Single hadith by number
    if (hadithParam) {
      const hadithNumber = parseInt(hadithParam, 10);
      if (isNaN(hadithNumber) || hadithNumber < 1) {
        return NextResponse.json(
          { error: 'Hadith number must be a positive integer' },
          { status: 400 }
        );
      }

      // Get hadith by number
      const hadith = getHadithVersions(hadithCollection, hadithNumber);

      if (hadith.length === 0) {
        return NextResponse.json(
          { error: `Hadith ${hadithNumber} not found in ${collection}` },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        data: normalizeHadithRecords(hadith),
      });
    }

    // Range of hadith
    if (startParam && endParam) {
      const start = parseInt(startParam, 10);
      const end = parseInt(endParam, 10);
      const limit = limitParam ? parseInt(limitParam, 10) : 100;
      const offset = offsetParam ? parseInt(offsetParam, 10) : 0;

      if (isNaN(start) || isNaN(end) || end < start) {
        return NextResponse.json(
          { error: 'Invalid range: start and end must be integers with start <= end' },
          { status: 400 }
        );
      }

      // Get hadith range
      const result = getHadithRange(hadithCollection, start, end, limit, offset);

      return NextResponse.json({
        success: true,
        data: normalizeHadithRecords(result.results),
        total: result.total,
        limit,
        offset,
      });
    }

    // Search
    if (searchQuery) {
      const limit = limitParam ? parseInt(limitParam, 10) : 50;
      const offset = offsetParam ? parseInt(offsetParam, 10) : 0;

      // Check if query contains collection name + number (e.g., "tirmidhi 23", "muslim 8a")
      const collectionMatch = parseCollectionAndNumber(searchQuery);
      if (collectionMatch && collectionMatch.collection === hadithCollection) {
        // Extract hadith number (may include letter suffix like "8a")
        const hadithNumMatch = collectionMatch.hadithNumber.match(/^(\d+)([a-z])?$/);
        if (hadithNumMatch) {
          const baseNumber = parseInt(hadithNumMatch[1], 10);
          const subVersion = hadithNumMatch[2] || null;

          const hadith = subVersion
            ? [getHadithByNumber(hadithCollection, baseNumber, subVersion)].filter((h): h is HadithRecord => h !== null)
            : getHadithVersions(hadithCollection, baseNumber);

          return NextResponse.json({
            success: true,
            data: normalizeHadithRecords(hadith),
            total: hadith.length,
            limit,
            offset: 0,
            query: searchQuery,
          });
        }
      }

      // Use simplified search for now - can enhance later
      const result = searchHadith(hadithCollection, searchQuery, limit, offset);

      return NextResponse.json({
        success: true,
        data: normalizeHadithRecords(result.results),
        total: result.total,
        limit,
        offset,
        query: searchQuery,
      });
    }

    // List all (with pagination)
    const limit = limitParam ? parseInt(limitParam, 10) : 50;
    const offset = offsetParam ? parseInt(offsetParam, 10) : 0;

    // Get all hadith with pagination
    const result = getAllHadith(hadithCollection, limit, offset);

    return NextResponse.json({
      success: true,
      data: normalizeHadithRecords(result.results),
      total: result.total,
      limit,
      offset,
    });
  } catch (error) {
    console.error('Error fetching hadith:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'An error occurred while fetching hadith',
      },
      { status: 500 }
    );
  }
}