import { NextRequest, NextResponse } from 'next/server';
import { withHadithDatabase, type HadithCollection, HADITH_COLLECTIONS } from '@/data/hadith-db';
import type { HadithRecord } from '@/types/hadith';

function normalizeHadithRecords(records: HadithRecord[]): HadithRecord[] {
  return records.map((record) => ({
    ...record,
    sub_version: record.sub_version || undefined,
  }));
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

      const hadith = await withHadithDatabase(hadithCollection, (db) => {
        // Check if there are sub-versions for this hadith number
        const allVersions = db.prepare('SELECT * FROM hadith WHERE hadith_number = ? ORDER BY sub_version').all(hadithNumber) as HadithRecord[];

        // If multiple versions exist, return all of them
        // If only one version exists, return it
        // If no versions exist, return undefined
        return allVersions.length > 0 ? allVersions : undefined;
      });

      if (!hadith) {
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

      const result = await withHadithDatabase(hadithCollection, (db) => {
        // For Muslim, we need special ordering, so fetch all matching records first
        if (hadithCollection === 'muslim') {
          // Fetch all hadith that could be in the range (including introductions)
          // We need to check both positive and negative numbers
          const allHadith = db.prepare(`
            SELECT * FROM hadith
            WHERE (hadith_number >= ? AND hadith_number <= ?)
               OR (hadith_number >= ? AND hadith_number <= ?)
            ORDER BY hadith_number
          `).all(start, end, -end, -start) as HadithRecord[];

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
          WHERE hadith_number >= ? AND hadith_number <= ?
            ORDER BY hadith_number, sub_version
          LIMIT ? OFFSET ?
          `).all(start, end, limit, offset) as HadithRecord[];

        const total = db.prepare(`
          SELECT COUNT(*) as count FROM hadith 
          WHERE hadith_number >= ? AND hadith_number <= ?
        `).get(start, end) as { count: number };

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
    }

    // Search
    if (searchQuery) {
      const limit = limitParam ? parseInt(limitParam, 10) : 50;
      const offset = offsetParam ? parseInt(offsetParam, 10) : 0;

      const result = await withHadithDatabase(hadithCollection, (db) => {
        // Check if search query is a number (for hadith number search)
        // If it's a number, skip FTS5 and go straight to LIKE search
        const isNumber = !isNaN(Number(searchQuery)) && /^\d+$/.test(searchQuery.trim());
        
        if (isNumber) {
          // For numeric queries, search by hadith number first, then text fields
          const hadithNum = parseInt(searchQuery, 10);
          const likeQuery = `%${searchQuery}%`;
          
          let hadith: HadithRecord[];
          let total: number;

          if (hadithCollection === 'muslim') {
            // For Muslim, fetch all matching and sort using custom ordering
            const allHadith = db.prepare(`
              SELECT * FROM hadith
              WHERE hadith_number = ? OR english_translation LIKE ? OR arabic_text LIKE ? OR reference LIKE ?
            `).all(hadithNum, likeQuery, likeQuery, likeQuery) as HadithRecord[];

            // Sort using custom Muslim ordering
            allHadith.sort((a, b) => {
              // Exact match first
              const exactA = a.hadith_number === hadithNum ? 0 : 1;
              const exactB = b.hadith_number === hadithNum ? 0 : 1;
              if (exactA !== exactB) {
                return exactA - exactB;
              }
              // Then by custom order
              const orderA = getMuslimSortOrder(a.hadith_number);
              const orderB = getMuslimSortOrder(b.hadith_number);
              if (orderA !== orderB) {
                return orderA - orderB;
              }
              // Finally by sub_version
              const subA = a.sub_version || '';
              const subB = b.sub_version || '';
              return subA.localeCompare(subB);
            });

            total = allHadith.length;
            hadith = allHadith.slice(offset, offset + limit);
          } else {
            hadith = db.prepare(`
            SELECT * FROM hadith
            WHERE hadith_number = ? OR english_translation LIKE ? OR arabic_text LIKE ? OR reference LIKE ?
            ORDER BY 
              CASE WHEN hadith_number = ? THEN 0 ELSE 1 END,
                hadith_number,
                COALESCE(sub_version, '')
            LIMIT ? OFFSET ?
            `).all(hadithNum, likeQuery, likeQuery, likeQuery, hadithNum, limit, offset) as HadithRecord[];

            const totalResult = db.prepare(`
            SELECT COUNT(*) as count FROM hadith
            WHERE hadith_number = ? OR english_translation LIKE ? OR arabic_text LIKE ? OR reference LIKE ?
          `).get(hadithNum, likeQuery, likeQuery, likeQuery) as { count: number };
            total = totalResult.count;
          }

          return { hadith, total };
        }
        
        // For text queries, try FTS5 first, then fall back to LIKE
        // Escape special characters for FTS5
        const escapedQuery = searchQuery.replace(/[^\w\s]/g, ' ').trim().split(/\s+/).join(' OR ');
        const ftsQuery = `${escapedQuery}*`;
        
        try {
          let hadith: HadithRecord[];
          let total: number;

          if (hadithCollection === 'muslim') {
            // For Muslim, fetch all matching and sort using custom ordering
            const allHadith = db.prepare(`
              SELECT h.* FROM hadith h
              JOIN hadith_fts fts ON h.rowid = fts.rowid
              WHERE hadith_fts MATCH ?
            `).all(ftsQuery) as HadithRecord[];

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

            total = allHadith.length;
            hadith = allHadith.slice(offset, offset + limit);
          } else {
            hadith = db.prepare(`
            SELECT h.* FROM hadith h
            JOIN hadith_fts fts ON h.rowid = fts.rowid
            WHERE hadith_fts MATCH ?
              ORDER BY rank, h.hadith_number, COALESCE(h.sub_version, '')
            LIMIT ? OFFSET ?
            `).all(ftsQuery, limit, offset) as HadithRecord[];

            const totalResult = db.prepare(`
            SELECT COUNT(*) as count FROM hadith h
            JOIN hadith_fts fts ON h.rowid = fts.rowid
            WHERE hadith_fts MATCH ?
          `).get(ftsQuery) as { count: number };
            total = totalResult.count;
          }

          // If FTS5 returns results, use them
          if (hadith.length > 0 || total > 0) {
            return { hadith, total };
          }
          
          // If FTS5 returns no results, fall back to LIKE search
          throw new Error('FTS5 returned no results');
        } catch {
          // Fall back to LIKE search for text queries
          const likeQuery = `%${searchQuery}%`;
          
          let hadith: HadithRecord[];
          let total: number;

          if (hadithCollection === 'muslim') {
            // For Muslim, fetch all matching and sort using custom ordering
            const allHadith = db.prepare(`
              SELECT * FROM hadith
              WHERE english_translation LIKE ? OR arabic_text LIKE ? OR reference LIKE ?
            `).all(likeQuery, likeQuery, likeQuery) as HadithRecord[];

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

            total = allHadith.length;
            hadith = allHadith.slice(offset, offset + limit);
          } else {
            hadith = db.prepare(`
            SELECT * FROM hadith
            WHERE english_translation LIKE ? OR arabic_text LIKE ? OR reference LIKE ?
              ORDER BY hadith_number, sub_version
            LIMIT ? OFFSET ?
            `).all(likeQuery, likeQuery, likeQuery, limit, offset) as HadithRecord[];

            const totalResult = db.prepare(`
            SELECT COUNT(*) as count FROM hadith
            WHERE english_translation LIKE ? OR arabic_text LIKE ? OR reference LIKE ?
          `).get(likeQuery, likeQuery, likeQuery) as { count: number };
            total = totalResult.count;
          }

          return { hadith, total };
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
    const limit = limitParam ? parseInt(limitParam, 10) : 50;
    const offset = offsetParam ? parseInt(offsetParam, 10) : 0;

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
    console.error('Error fetching hadith:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'An error occurred while fetching hadith',
      },
      { status: 500 }
    );
  }
}

