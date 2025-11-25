import { NextRequest, NextResponse } from 'next/server';
import { withHadithDatabase, type HadithCollection, HADITH_COLLECTIONS } from '@/data/hadith-db';
import type { HadithRecord } from '@/types/hadith';

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
        return db.prepare('SELECT * FROM hadith WHERE hadith_number = ?').get(hadithNumber) as HadithRecord | undefined;
      });

      if (!hadith) {
        return NextResponse.json(
          { error: `Hadith ${hadithNumber} not found in ${collection}` },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        data: hadith,
      });
    }

    // Range of hadith
    if (startParam && endParam) {
      const start = parseInt(startParam, 10);
      const end = parseInt(endParam, 10);
      const limit = limitParam ? parseInt(limitParam, 10) : 100;
      const offset = offsetParam ? parseInt(offsetParam, 10) : 0;

      if (isNaN(start) || isNaN(end) || start < 1 || end < start) {
        return NextResponse.json(
          { error: 'Invalid range: start and end must be positive integers with start <= end' },
          { status: 400 }
        );
      }

      const result = await withHadithDatabase(hadithCollection, (db) => {
        const hadith = db.prepare(`
          SELECT * FROM hadith
          WHERE hadith_number >= ? AND hadith_number <= ?
          ORDER BY hadith_number
          LIMIT ? OFFSET ?
        `).all(start, end, limit, offset) as HadithRecord[];

        const total = db.prepare(`
          SELECT COUNT(*) as count FROM hadith 
          WHERE hadith_number >= ? AND hadith_number <= ?
        `).get(start, end) as { count: number };

        return { hadith, total: total.count };
      });

      return NextResponse.json({
        success: true,
        data: result.hadith,
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
          
          const hadith = db.prepare(`
            SELECT * FROM hadith
            WHERE hadith_number = ? OR english_translation LIKE ? OR arabic_text LIKE ? OR reference LIKE ?
            ORDER BY
              CASE WHEN hadith_number = ? THEN 0 ELSE 1 END,
              hadith_number
            LIMIT ? OFFSET ?
          `).all(hadithNum, likeQuery, likeQuery, likeQuery, hadithNum, limit, offset) as HadithRecord[];

          const total = db.prepare(`
            SELECT COUNT(*) as count FROM hadith
            WHERE hadith_number = ? OR english_translation LIKE ? OR arabic_text LIKE ? OR reference LIKE ?
          `).get(hadithNum, likeQuery, likeQuery, likeQuery) as { count: number };

          return { hadith, total: total.count };
        }
        
        // For text queries, try FTS5 first, then fall back to LIKE
        // Escape special characters for FTS5
        const escapedQuery = searchQuery.replace(/[^\w\s]/g, ' ').trim().split(/\s+/).join(' OR ');
        const ftsQuery = `${escapedQuery}*`;
        
        try {
          const hadith = db.prepare(`
            SELECT h.* FROM hadith h
            JOIN hadith_fts fts ON h.rowid = fts.rowid
            WHERE hadith_fts MATCH ?
            ORDER BY rank
            LIMIT ? OFFSET ?
          `).all(ftsQuery, limit, offset) as HadithRecord[];

          const total = db.prepare(`
            SELECT COUNT(*) as count FROM hadith h
            JOIN hadith_fts fts ON h.rowid = fts.rowid
            WHERE hadith_fts MATCH ?
          `).get(ftsQuery) as { count: number };

          // If FTS5 returns results, use them
          if (hadith.length > 0 || total.count > 0) {
            return { hadith, total: total.count };
          }
          
          // If FTS5 returns no results, fall back to LIKE search
          throw new Error('FTS5 returned no results');
        } catch {
          // Fall back to LIKE search for text queries
          const likeQuery = `%${searchQuery}%`;
          
          const hadith = db.prepare(`
            SELECT * FROM hadith
            WHERE english_translation LIKE ? OR arabic_text LIKE ? OR reference LIKE ?
            ORDER BY hadith_number
            LIMIT ? OFFSET ?
          `).all(likeQuery, likeQuery, likeQuery, limit, offset) as HadithRecord[];

          const total = db.prepare(`
            SELECT COUNT(*) as count FROM hadith
            WHERE english_translation LIKE ? OR arabic_text LIKE ? OR reference LIKE ?
          `).get(likeQuery, likeQuery, likeQuery) as { count: number };

          return { hadith, total: total.count };
        }
      });

      return NextResponse.json({
        success: true,
        data: result.hadith,
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
      const hadith = db.prepare(`
        SELECT * FROM hadith
        ORDER BY hadith_number
        LIMIT ? OFFSET ?
      `).all(limit, offset) as HadithRecord[];

      const total = db.prepare('SELECT COUNT(*) as count FROM hadith').get() as { count: number };

      return { hadith, total: total.count };
    });

    return NextResponse.json({
      success: true,
      data: result.hadith,
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

