import { NextRequest, NextResponse } from 'next/server';
import { withHadithDatabase, type HadithCollection, HADITH_COLLECTIONS } from '@/data/hadith-db';
import type { HadithRecord } from '@/types/hadith';
import { validationMiddleware, handleValidationError, extractValidatedParams, createValidationMiddleware } from '@/lib/validation/middleware';
import { validateNumeric, validateSearchQuery, sanitizeFTSQuery, validationSchemas } from '@/lib/validation';
import { withRateLimit, rateLimiters } from '@/lib/rate-limit';

// Query optimization utilities
function createOptimizedRangeQuery(collection: string, start: number, end: number, limit: number, offset: number) {
  if (collection === 'muslim') {
    // For Muslim, we need to handle the complex ordering
    // Pre-calculate the range of sort orders we need
    const startOrder = getMuslimSortOrder(start);
    const endOrder = getMuslimSortOrder(end);

    return {
      query: `
        SELECT * FROM hadith
        WHERE hadith_number >= ? AND hadith_number <= ?
        ORDER BY
          CASE
            WHEN hadith_number >= 1 AND hadith_number <= 5 THEN hadith_number
            WHEN hadith_number >= -14 AND hadith_number <= -7 THEN 5 + (-hadith_number - 6)
            WHEN hadith_number >= 6 AND hadith_number <= 7 THEN hadith_number + 8
            WHEN hadith_number >= -92 AND hadith_number <= -17 THEN 16 + (-hadith_number - 17)
            WHEN hadith_number >= 8 THEN 92 + hadith_number
            ELSE 10000 + hadith_number
          END,
          COALESCE(sub_version, '')
        LIMIT ? OFFSET ?
      `,
      params: [start, end, limit, offset]
    };
  } else {
    // For other collections, use simple range query
    return {
      query: `
        SELECT * FROM hadith
        WHERE hadith_number >= ? AND hadith_number <= ?
        ORDER BY hadith_number, COALESCE(sub_version, '')
        LIMIT ? OFFSET ?
      `,
      params: [start, end, limit, offset]
    };
  }
}

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
 * Get sort order for Muslim hadith according to the special sequence:
 * 1-5 (regular), 8-14 (intro), 6-7 (regular), 17-92 (intro), 8+ (regular)
 */
function getMuslimSortOrder(hadithNumber: number): number {
  // Regular hadith 1-5
  if (hadithNumber >= 1 && hadithNumber <= 5) {
    return hadithNumber;
  }
  
  // Introduction 8-14 (stored as -7 to -14, but we want 8 first, so -7 should be order 6)
  if (hadithNumber >= -14 && hadithNumber <= -7) {
    // -7 (intro 8) -> order 6, -8 (intro 9) -> order 7, ..., -14 (intro 14) -> order 13
    return 5 + (-hadithNumber - 6);
  }
  
  // Regular hadith 6-7
  if (hadithNumber >= 6 && hadithNumber <= 7) {
    return hadithNumber + 8; // 6 -> 14, 7 -> 15
  }
  
  // Introduction 17-92 (stored as -17 to -92, but we want 17 first, so -17 should be order 16)
  if (hadithNumber >= -92 && hadithNumber <= -17) {
    // -17 (intro 17) -> order 16, -18 (intro 18) -> order 17, ..., -92 (intro 92) -> order 91
    return 16 + (-hadithNumber - 17);
  }
  
  // Regular hadith 8+
  if (hadithNumber >= 8) {
    return 92 + hadithNumber; // 8 -> 100, 9 -> 101, etc.
  }
  
  // Fallback for anything else (shouldn't happen for Muslim)
  return 10000 + hadithNumber;
}

/**
 * API route to fetch hadith from collections
 *
 * @swagger
 * /api/hadith:
 *   get:
 *     summary: Fetch hadith from Islamic collections
 *     description: Retrieve hadith texts from various Islamic collections (Bukhari, Muslim, etc.)
 *     parameters:
 *       - name: collection
 *         in: query
 *         required: true
 *         schema:
 *           type: string
 *           enum: [bukhari, muslim, nasai, tirmidhi, abudawud, ibnmajah]
 *         description: The hadith collection to search in
 *       - name: hadith
 *         in: query
 *         schema:
 *           type: string
 *         description: Specific hadith number (e.g., "1", "8a")
 *       - name: start
 *         in: query
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Starting hadith number for range queries
 *       - name: end
 *         in: query
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Ending hadith number for range queries
 *       - name: search
 *         in: query
 *         schema:
 *           type: string
 *         description: Search query for full-text search
 *       - name: limit
 *         in: query
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 1000
 *           default: 50
 *         description: Maximum number of results to return
 *       - name: offset
 *         in: query
 *         schema:
 *           type: integer
 *           minimum: 0
 *           default: 0
 *         description: Number of results to skip
 *     responses:
 *       200:
 *         description: Successful response
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       hadith_number:
 *                         type: integer
 *                         description: The hadith number
 *                         example: 1
 *                       sub_version:
 *                         type: string
 *                         nullable: true
 *                         description: Sub-version letter (e.g., "a", "b")
 *                         example: null
 *                       reference:
 *                         type: string
 *                         description: Full reference
 *                         example: "Sahih al-Bukhari 1"
 *                       english_narrator:
 *                         type: string
 *                         description: English narrator name
 *                         example: "Narrated Umar bin Al-Khattab:"
 *                       english_translation:
 *                         type: string
 *                         description: English translation of the hadith
 *                         example: "The Messenger of Allah (ﷺ) said: 'Actions are but by intentions...'"
 *                       arabic_text:
 *                         type: string
 *                         description: Arabic text of the hadith
 *                       in_book_reference:
 *                         type: string
 *                         description: In-book reference
 *                         example: "Book 1, Hadith 1"
 *                 total:
 *                   type: integer
 *                   description: Total number of results (for paginated responses)
 *                 limit:
 *                   type: integer
 *                   description: Results per page
 *                 offset:
 *                   type: integer
 *                   description: Results offset
 *       400:
 *         description: Bad request - missing or invalid parameters
 *       404:
 *         description: Hadith not found
 *       429:
 *         description: Rate limit exceeded
 *       500:
 *         description: Internal server error
 *
 * @example
 * // Get specific hadith
 * GET /api/hadith?collection=bukhari&hadith=1
 *
 * @example
 * // Get range of hadith
 * GET /api/hadith?collection=muslim&start=1&end=10
 *
 * @example
 * // Search hadith
 * GET /api/hadith?collection=bukhari&search=intentions&limit=20
 */
const GETHandler = async (request: NextRequest) => {
  try {
    console.log('🔍 HADITH SEARCH DEBUG: Starting hadith search request');
    console.log('🔍 HADITH SEARCH DEBUG: Request URL:', request.url);
    console.log('🔍 HADITH SEARCH DEBUG: Search params:', Object.fromEntries(request.nextUrl.searchParams));
    console.log('🔍 HADITH SEARCH DEBUG: Environment check - NODE_ENV:', process.env.NODE_ENV);
    console.log('🔍 HADITH SEARCH DEBUG: Current working directory:', process.cwd());
    console.log('🔍 HADITH SEARCH DEBUG: Process platform:', process.platform);

    const searchParams = request.nextUrl.searchParams;

    // Extract basic parameters for route determination
    const hadithParam = searchParams.get('hadith');
    const startParam = searchParams.get('start');
    const endParam = searchParams.get('end');
    const searchQuery = searchParams.get('search');

    let validationResult;

    // Determine which validation schema to use based on parameters
    if (hadithParam) {
      // Single hadith lookup
      validationResult = await createValidationMiddleware(validationSchemas.hadithLookup)(request);
      if (!validationResult.success) {
        return handleValidationError(validationResult.error);
      }
    } else if (startParam && endParam) {
      // Range lookup
      validationResult = await createValidationMiddleware(validationSchemas.collectionRange)(request);
      if (!validationResult.success) {
        return handleValidationError(validationResult.error);
      }
    } else if (searchQuery) {
      // Search query
      validationResult = await createValidationMiddleware(validationSchemas.collectionSearch)(request);
      if (!validationResult.success) {
        return handleValidationError(validationResult.error);
      }
    } else {
      // List all - just validate collection
      const collectionValidation = await createValidationMiddleware(validationSchemas.collectionOnly)(request);
      if (!collectionValidation.success) {
        return handleValidationError(collectionValidation.error);
      }
      validationResult = collectionValidation;
    }

    const { params } = validationResult.data;
    const hadithCollection = params.collection;

    console.log('🔍 HADITH SEARCH DEBUG: Collection:', hadithCollection);
    console.log('🔍 HADITH SEARCH DEBUG: All params:', params);

    // Single hadith by number
    if (hadithParam) {
      const { hadithNumber, subVersion } = params.hadith;

      const hadith = await withHadithDatabase(hadithCollection, (db) => {
        if (subVersion) {
          // Search for specific sub-version
          const result = db.prepare(`
            SELECT * FROM hadith
            WHERE hadith_number = ? AND sub_version = ?
          `).get(hadithNumber, subVersion) as HadithRecord | undefined;
          return result ? [result] : undefined;
        } else {
          // Check if there are sub-versions for this hadith number
          const allVersions = db.prepare('SELECT * FROM hadith WHERE hadith_number = ? ORDER BY sub_version').all(hadithNumber) as HadithRecord[];

          // If multiple versions exist, return all of them
          // If only one version exists, return it
          // If no versions exist, return undefined
          return allVersions.length > 0 ? allVersions : undefined;
        }
      });

      if (!hadith) {
        return NextResponse.json(
          { error: `Hadith ${hadithNumber} not found in ${hadithCollection}` },
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
      const { start, end } = params;

      // Validate pagination parameters
      const paginationValidation = await extractValidatedParams<{ limit?: number; offset?: number }>(request, {
        limit: (value: any) => validateNumeric(value, 'limit', { min: 1, max: 1000, integer: true }),
        offset: (value: any) => validateNumeric(value, 'offset', { min: 0, integer: true })
      });

      if (!paginationValidation) {
        return handleValidationError('Invalid pagination parameters');
      }

      const { limit = 100, offset = 0 } = paginationValidation.params;

      const result = await withHadithDatabase(hadithCollection, (db) => {
        const { query, params } = createOptimizedRangeQuery(hadithCollection, start, end, limit, offset);

        const hadith = db.prepare(query).all(...params) as HadithRecord[];

        // Get total count efficiently
        const total = db.prepare(`
          SELECT COUNT(*) as count FROM hadith
          WHERE hadith_number >= ? AND hadith_number <= ?
        `).get(start, end) as { count: number };

        return { hadith, total: total.count };
      });

      return NextResponse.json({
        success: true,
        data: normalizeHadithRecords(result.hadith),
        total: result.total,
        limit,
        offset,
      });
    }

    // Search
    if (searchQuery) {
      // Validate pagination parameters
      const paginationValidation = await extractValidatedParams<{ limit?: number; offset?: number }>(request, {
        limit: (value: any) => validateNumeric(value, 'limit', { min: 1, max: 1000, integer: true }),
        offset: (value: any) => validateNumeric(value, 'offset', { min: 0, integer: true })
      });

      if (!paginationValidation) {
        return handleValidationError('Invalid pagination parameters');
      }

      const { limit = 50, offset = 0 } = paginationValidation.params;
      const sanitizedSearchQuery = params.search;

      // Check if query contains collection name + number (e.g., "tirmidhi 23", "muslim 8a")
      const collectionMatch = parseCollectionAndNumber(sanitizedSearchQuery);
      if (collectionMatch && collectionMatch.collection === hadithCollection) {
        // Extract hadith number (may include letter suffix like "8a")
        const hadithNumMatch = collectionMatch.hadithNumber.match(/^(\d+)([a-z])?$/);
        if (hadithNumMatch) {
          const baseNumber = parseInt(hadithNumMatch[1], 10);
          const subVersion = hadithNumMatch[2] || null;

          const hadith = await withHadithDatabase(hadithCollection, (db) => {
            if (subVersion) {
              // Search for specific sub-version
              const result = db.prepare(`
                SELECT * FROM hadith
                WHERE hadith_number = ? AND sub_version = ?
              `).get(baseNumber, subVersion) as HadithRecord | undefined;
              return result ? [result] : [];
            } else {
              // Search for all versions of this hadith number
              return db.prepare(`
                SELECT * FROM hadith
                WHERE hadith_number = ?
                ORDER BY COALESCE(sub_version, '')
              `).all(baseNumber) as HadithRecord[];
            }
          });

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

      console.log('🔍 HADITH SEARCH DEBUG: About to call withHadithDatabase for search');
      console.log('🔍 HADITH SEARCH DEBUG: Collection:', hadithCollection);
      console.log('🔍 HADITH SEARCH DEBUG: Sanitized search query:', sanitizedSearchQuery);
      console.log('🔍 HADITH SEARCH DEBUG: Offset:', offset, 'Limit:', limit);

      const result = await withHadithDatabase(hadithCollection, (db) => {
        console.log('🔍 HADITH SEARCH DEBUG: Inside withHadithDatabase callback - database opened successfully');
        // Check if search query is a number (for hadith number search)
        const isNumber = !isNaN(Number(sanitizedSearchQuery)) && /^\d+$/.test(sanitizedSearchQuery.trim());
        console.log('🔍 HADITH SEARCH DEBUG: Is number search:', isNumber);

        if (isNumber) {
          // For numeric queries, search by hadith number first, then text fields
          const hadithNum = parseInt(sanitizedSearchQuery, 10);
          const likeQuery = `%${sanitizedSearchQuery}%`;
          
          // Optimized query: search hadith number first (exact match), then text fields
          if (hadithCollection === 'muslim') {
            // For Muslim, we need custom ordering but can still optimize
            const allHadith = db.prepare(`
              SELECT * FROM hadith
              WHERE hadith_number = ? OR english_translation LIKE ? OR arabic_text LIKE ? OR reference LIKE ? OR english_narrator LIKE ?
            `).all(hadithNum, likeQuery, likeQuery, likeQuery, likeQuery) as HadithRecord[];

            // Sort using custom Muslim ordering
            allHadith.sort((a, b) => {
              // Exact match first
              const exactA = a.hadith_number === hadithNum ? 0 : 1;
              const exactB = b.hadith_number === hadithNum ? 0 : 1;
              if (exactA !== exactB) return exactA - exactB;
              
              // Then by custom order
              const orderA = getMuslimSortOrder(a.hadith_number);
              const orderB = getMuslimSortOrder(b.hadith_number);
              if (orderA !== orderB) return orderA - orderB;
              
              // Finally by sub_version
              return (a.sub_version || '').localeCompare(b.sub_version || '');
            });

            return {
              hadith: allHadith.slice(offset, offset + limit),
              total: allHadith.length,
            };
          } else {
            const hadith = db.prepare(`
              SELECT * FROM hadith
              WHERE hadith_number = ? OR english_translation LIKE ? OR arabic_text LIKE ? OR reference LIKE ? OR english_narrator LIKE ?
              ORDER BY 
                CASE WHEN hadith_number = ? THEN 0 ELSE 1 END,
                hadith_number,
                COALESCE(sub_version, '')
              LIMIT ? OFFSET ?
            `).all(hadithNum, likeQuery, likeQuery, likeQuery, likeQuery, hadithNum, limit, offset) as HadithRecord[];

            const totalResult = db.prepare(`
              SELECT COUNT(*) as count FROM hadith
              WHERE hadith_number = ? OR english_translation LIKE ? OR arabic_text LIKE ? OR reference LIKE ? OR english_narrator LIKE ?
            `).get(hadithNum, likeQuery, likeQuery, likeQuery, likeQuery) as { count: number };

            return { hadith, total: totalResult.count };
          }
        }
        
        // For text queries, build FTS5 query properly
        // FTS5 supports phrase search with quotes, and word search with AND/OR
        const words = sanitizedSearchQuery.trim().split(/\s+/).filter((w: string) => w.length > 0);

        // Build FTS5 query: use phrase search if query contains quotes, otherwise use AND logic
        let ftsQuery: string;
        if (sanitizedSearchQuery.includes('"')) {
          // Phrase search - keep quotes and escape them for FTS5
          ftsQuery = searchQuery.replace(/"/g, '"');
        } else {
          // Word search - use AND logic for better relevance
          // Escape special FTS5 characters but preserve Arabic and English text
          const escapedWords = words.map((word: string) => {
            // Escape FTS5 special characters: " ' * ^
            // But preserve Arabic (U+0600-U+06FF) and English characters
            return word
              .replace(/"/g, '""')  // Escape double quotes
              .replace(/'/g, "''")   // Escape single quotes
              .replace(/\*/g, '')    // Remove asterisks (we'll add them if needed)
              .replace(/\^/g, '');   // Remove caret
          }).filter((w: string) => w.length > 0);
          
          if (escapedWords.length === 0) {
            // Fallback to LIKE if no valid words
            throw new Error('No valid search terms');
          }
          
          // Use AND logic for better relevance (all words must appear)
          // FTS5 will handle Arabic and English text automatically
          ftsQuery = escapedWords.join(' AND ');
        }
        
        try {
          // Get total count efficiently using FTS5 (this is fast with index)
          const totalResult = db.prepare(`
            SELECT COUNT(*) as count FROM hadith_fts
            WHERE hadith_fts MATCH ?
          `).get(ftsQuery) as { count: number };
          const total = totalResult.count;

          if (hadithCollection === 'muslim') {
            // For Muslim, we need custom ordering but can't do it efficiently in SQL
            // Optimize by fetching a reasonable subset (top 2000 by relevance) for sorting
            // This prevents fetching all 34k+ hadiths when searching common words
            const maxResultsForSorting = Math.min(2000, total);
            const allHadith = db.prepare(`
              SELECT h.*, fts.rank as search_rank FROM hadith h
              JOIN hadith_fts fts ON h.rowid = fts.rowid
              WHERE hadith_fts MATCH ?
              ORDER BY fts.rank
              LIMIT ?
            `).all(ftsQuery, maxResultsForSorting) as HadithRecord[];

            // Sort using custom Muslim ordering
            allHadith.sort((a, b) => {
              const orderA = getMuslimSortOrder(a.hadith_number);
              const orderB = getMuslimSortOrder(b.hadith_number);
              if (orderA !== orderB) return orderA - orderB;
              return (a.sub_version || '').localeCompare(b.sub_version || '');
            });

            return {
              hadith: allHadith.slice(offset, offset + limit),
              total: total, // Use actual total from FTS5 count
            };
          } else {
            // For other collections, use efficient SQL LIMIT/OFFSET
            const hadith = db.prepare(`
              SELECT h.* FROM hadith h
              JOIN hadith_fts fts ON h.rowid = fts.rowid
              WHERE hadith_fts MATCH ?
              ORDER BY rank, h.hadith_number, COALESCE(h.sub_version, '')
              LIMIT ? OFFSET ?
            `).all(ftsQuery, limit, offset) as HadithRecord[];

            return { hadith, total };
          }
        } catch {
          // Fall back to LIKE search for text queries
          // Search in all relevant fields including narrator
          const likeQuery = `%${searchQuery}%`;
          
          // Get total count first (needed for pagination)
          const totalResult = db.prepare(`
            SELECT COUNT(*) as count FROM hadith
            WHERE english_translation LIKE ? 
              OR arabic_text LIKE ? 
              OR reference LIKE ? 
              OR english_narrator LIKE ?
              OR in_book_reference LIKE ?
          `).get(likeQuery, likeQuery, likeQuery, likeQuery, likeQuery) as { count: number };
          const total = totalResult.count;
          
          if (hadithCollection === 'muslim') {
            // For Muslim, limit results before sorting to avoid fetching all records
            // Use a more conservative limit for LIKE queries
            const maxResultsForSorting = Math.min(1000, total);
            const allHadith = db.prepare(`
              SELECT * FROM hadith
              WHERE english_translation LIKE ?
                OR arabic_text LIKE ?
                OR reference LIKE ?
                OR english_narrator LIKE ?
                OR in_book_reference LIKE ?
              ORDER BY hadith_number
              LIMIT ?
            `).all(likeQuery, likeQuery, likeQuery, likeQuery, likeQuery, maxResultsForSorting) as HadithRecord[];

            // Sort using custom Muslim ordering
            allHadith.sort((a, b) => {
              const orderA = getMuslimSortOrder(a.hadith_number);
              const orderB = getMuslimSortOrder(b.hadith_number);
              if (orderA !== orderB) return orderA - orderB;
              return (a.sub_version || '').localeCompare(b.sub_version || '');
            });

            return {
              hadith: allHadith.slice(offset, offset + limit),
              total: total, // Use actual total count
            };
          } else {
            // For other collections, use efficient SQL LIMIT/OFFSET
            const hadith = db.prepare(`
              SELECT * FROM hadith
              WHERE english_translation LIKE ? 
                OR arabic_text LIKE ? 
                OR reference LIKE ? 
                OR english_narrator LIKE ?
                OR in_book_reference LIKE ?
              ORDER BY hadith_number, sub_version
              LIMIT ? OFFSET ?
            `).all(likeQuery, likeQuery, likeQuery, likeQuery, likeQuery, limit, offset) as HadithRecord[];

            return { hadith, total };
          }
        }
      });

      return NextResponse.json({
        success: true,
        data: normalizeHadithRecords(result.hadith),
        total: result.total,
        limit,
        offset,
        query: searchQuery,
      });
    }

    // List all (with pagination)
    const paginationValidation = await extractValidatedParams<{ limit?: number; offset?: number }>(request, {
      limit: (value: any) => validateNumeric(value, 'limit', { min: 1, max: 1000, integer: true }),
      offset: (value: any) => validateNumeric(value, 'offset', { min: 0, integer: true })
    });

    if (!paginationValidation) {
      return handleValidationError('Invalid pagination parameters');
    }

    const { limit = 50, offset = 0 } = paginationValidation.params;

    const result = await withHadithDatabase(hadithCollection, (db) => {
      if (hadithCollection === 'muslim') {
        // For Muslim, fetch all and sort using custom ordering
        const allHadith = db.prepare(`
          SELECT * FROM hadith
        `).all() as HadithRecord[];

        // Sort using custom Muslim ordering
        allHadith.sort((a, b) => {
          const orderA = getMuslimSortOrder(a.hadith_number);
          const orderB = getMuslimSortOrder(b.hadith_number);
          if (orderA !== orderB) {
            return orderA - orderB;
          }
          // If same order, sort by sub_version
          const subA = a.sub_version || '';
          const subB = b.sub_version || '';
          return subA.localeCompare(subB);
        });

        // Apply pagination after sorting
        const total = allHadith.length;
        const paginatedHadith = allHadith.slice(offset, offset + limit);

        return { hadith: paginatedHadith, total };
      } else {
        // For other collections, use normal ordering
      const hadith = db.prepare(`
        SELECT * FROM hadith 
          ORDER BY hadith_number, sub_version
        LIMIT ? OFFSET ?
        `).all(limit, offset) as HadithRecord[];

      const total = db.prepare('SELECT COUNT(*) as count FROM hadith').get() as { count: number };

      return { hadith, total: total.count };
      }
    });

    return NextResponse.json({
      success: true,
      data: normalizeHadithRecords(result.hadith),
      total: result.total,
      limit,
      offset,
    });
  } catch (error) {
    console.error('🔍 HADITH SEARCH DEBUG: Error occurred in GETHandler:', error);
    console.error('🔍 HADITH SEARCH DEBUG: Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    console.error('🔍 HADITH SEARCH DEBUG: Error name:', error instanceof Error ? error.name : 'Unknown error type');
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'An error occurred while fetching hadith',
      },
      { status: 500 }
    );
  }
};

// Export with rate limiting applied
export const GET = withRateLimit(GETHandler, rateLimiters.readOnly);

