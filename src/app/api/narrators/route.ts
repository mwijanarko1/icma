import { NextRequest, NextResponse } from 'next/server';
import { getDatabase, closeDatabase } from '@/data/db';
import type { Narrator } from '@/data/types';
import { normalizeArabic, calculateSimilarity } from '@/data/narrator-matcher';

interface SearchParams {
  query?: string;
  arabicName?: string;
  englishName?: string;
  deathYearAH?: number;
  limit?: number;
  offset?: number;
}

interface NarratorRow {
  id: string;
  primary_arabic_name: string;
  primary_english_name: string;
  full_name_arabic?: string | null;
  full_name_english?: string | null;
  title?: string | null;
  kunya?: string | null;
  lineage?: string | null;
  death_year_ah?: number | null;
  death_year_ah_alternative?: number | null;
  death_year_ce?: number | null;
  place_of_residence?: string | null;
  place_of_death?: string | null;
  places_traveled?: string | null;
  taqrib_category?: string | null;
  ibn_hajar_rank?: string | null;
  dhahabi_rank?: string | null;
  notes?: string | null;
  search_text?: string | null;
}

/**
 * Calculate relevance score for a narrator based on search query
 * Uses the match algorithm's similarity calculation for better accuracy
 */
function calculateRelevanceScore(narrator: NarratorRow, normalizedSearchTerms: string[]): number {
  let score = 0;
  const normalizedSearchText = normalizedSearchTerms.join(' ');

  // Use similarity-based scoring for better matching (like the match algorithm)
  // Calculate similarity for each search term against narrator fields
  for (const normalizedTerm of normalizedSearchTerms) {
    // Primary Arabic name - use similarity calculation (like match algorithm)
    if (narrator.primary_arabic_name) {
      const similarity = calculateSimilarity(narrator.primary_arabic_name, normalizedTerm);
      if (similarity >= 0.95) {
        score += 100; // Near-exact match
      } else if (similarity >= 0.8) {
        score += 80; // Very high similarity
      } else if (similarity >= 0.6) {
        score += 50; // High similarity
      } else if (similarity >= 0.4) {
        score += 30; // Medium similarity
      } else if (similarity > 0) {
        score += 15; // Low similarity
      }
    }

    // Full Arabic name - use similarity calculation
    if (narrator.full_name_arabic) {
      const similarity = calculateSimilarity(narrator.full_name_arabic, normalizedTerm);
      if (similarity >= 0.8) {
        score += 60;
      } else if (similarity >= 0.6) {
        score += 40;
      } else if (similarity >= 0.4) {
        score += 25;
      } else if (similarity > 0) {
        score += 10;
      }
    }

    // Kunya - use similarity calculation (high priority)
    if (narrator.kunya) {
      const similarity = calculateSimilarity(narrator.kunya, normalizedTerm);
      if (similarity >= 0.95) {
        score += 90; // Exact kunya match gets highest priority
      } else if (similarity >= 0.8) {
        score += 70;
      } else if (similarity >= 0.6) {
        score += 50;
      } else if (similarity >= 0.4) {
        score += 30;
      } else if (similarity > 0) {
        score += 15;
      }
    }

    // English names - simple string matching (no similarity needed for English)
    const lowerPrimaryEnglish = narrator.primary_english_name?.toLowerCase() || '';
    const lowerFullEnglish = narrator.full_name_english?.toLowerCase() || '';
    
    if (lowerPrimaryEnglish === normalizedTerm) {
      score += 100;
    } else if (lowerPrimaryEnglish.startsWith(normalizedTerm)) {
      score += 50;
    } else if (lowerPrimaryEnglish.includes(normalizedTerm)) {
      score += 20;
    }

    if (lowerFullEnglish.includes(normalizedTerm)) {
      score += 30;
    }

    // Title, lineage, search_text - simple matching
    const normalizedTitle = narrator.title ? normalizeArabic(narrator.title) : '';
    const normalizedLineage = narrator.lineage ? normalizeArabic(narrator.lineage) : '';
    const normalizedSearchText = narrator.search_text ? normalizeArabic(narrator.search_text) : '';

    if (normalizedTitle.includes(normalizedTerm)) {
      score += 15;
    }

    if (normalizedLineage.includes(normalizedTerm)) {
      score += 10;
    }

    if (normalizedSearchText.includes(normalizedTerm)) {
      score += 5;
    }
  }

  // Boost score for full search text matching (using similarity for better accuracy)
  if (normalizedSearchTerms.length > 1) {
    // Multiple terms - check if full search text matches any field with similarity
    const fullSearchText = normalizedSearchText;
    
    // Check primary Arabic name
    if (narrator.primary_arabic_name) {
      const similarity = calculateSimilarity(narrator.primary_arabic_name, fullSearchText);
      if (similarity >= 0.8) {
        score += 30; // Strong boost for full phrase match
      } else if (similarity >= 0.6) {
        score += 15;
      }
    }
    
    // Check kunya
    if (narrator.kunya) {
      const similarity = calculateSimilarity(narrator.kunya, fullSearchText);
      if (similarity >= 0.8) {
        score += 40; // Even stronger boost for kunya full match
      } else if (similarity >= 0.6) {
        score += 20;
      }
    }
    
    // Check full Arabic name
    if (narrator.full_name_arabic) {
      const similarity = calculateSimilarity(narrator.full_name_arabic, fullSearchText);
      if (similarity >= 0.8) {
        score += 25;
      } else if (similarity >= 0.6) {
        score += 12;
      }
    }
  }
  
  // Additional boost when search matches both name and kunya (very strong signal)
  // This handles cases like searching "ابو هريرة" where it matches both the kunya "ابو" and name "هريرة"
  // Use similarity to detect this more accurately
  let hasKunyaTermMatch = false;
  let hasNameTermMatch = false;
  
  for (const normalizedTerm of normalizedSearchTerms) {
    // Check kunya with similarity
    if (narrator.kunya) {
      const kunyaSim = calculateSimilarity(narrator.kunya, normalizedTerm);
      if (kunyaSim >= 0.4) {
        hasKunyaTermMatch = true;
      }
    }
    
    // Check name with similarity
    if (narrator.primary_arabic_name) {
      const nameSim = calculateSimilarity(narrator.primary_arabic_name, normalizedTerm);
      if (nameSim >= 0.4) {
        hasNameTermMatch = true;
      }
    }
    if (narrator.full_name_arabic) {
      const fullNameSim = calculateSimilarity(narrator.full_name_arabic, normalizedTerm);
      if (fullNameSim >= 0.4) {
        hasNameTermMatch = true;
      }
    }
  }
  
  if (hasKunyaTermMatch && hasNameTermMatch) {
    score += 50; // Strong boost for matches in both kunya and name
  }

  return score;
}

/**
 * GET /api/narrators
 * Search and retrieve narrators from database with relevance ranking
 */
export async function GET(request: NextRequest) {
  const db = getDatabase();
  
  try {
    const searchParams = request.nextUrl.searchParams;
    const params: SearchParams = {
      query: searchParams.get('query') || undefined,
      arabicName: searchParams.get('arabicName') || undefined,
      englishName: searchParams.get('englishName') || undefined,
      deathYearAH: searchParams.get('deathYearAH') 
        ? parseInt(searchParams.get('deathYearAH')!) 
        : undefined,
      limit: searchParams.get('limit') 
        ? parseInt(searchParams.get('limit')!) 
        : 50,
      offset: searchParams.get('offset') 
        ? parseInt(searchParams.get('offset')!) 
        : 0,
    };

    // Parse search terms from query and normalize them
    const searchTerms = params.query 
      ? params.query.trim().split(/\s+/).filter(term => term.length > 0)
      : [];
    
    // Normalize search terms (remove harakats and ابي/ابو)
    const normalizedSearchTerms = searchTerms.map(term => normalizeArabic(term));

    let narrators: NarratorRow[] = [];

    if (params.query && searchTerms.length > 0) {
      // Fetch all narrators and alternate names, then filter in memory using normalized comparison
      // This ensures we catch matches even when database has different character variations
      const allNarrators = db.prepare(`
        SELECT DISTINCT n.* 
        FROM narrators n
      `).all() as NarratorRow[];

      const allAlternateNames = db.prepare(`
        SELECT narrator_id, arabic_name, english_name
        FROM narrator_names
      `).all() as Array<{ narrator_id: string; arabic_name: string; english_name?: string | null }>;

      // Create a map of alternate names for quick lookup
      const alternateMap = new Map<string, Array<{ arabic_name: string; english_name?: string | null }>>();
      for (const alt of allAlternateNames) {
        if (!alternateMap.has(alt.narrator_id)) {
          alternateMap.set(alt.narrator_id, []);
        }
        alternateMap.get(alt.narrator_id)!.push(alt);
      }

      // Filter narrators in memory using normalized comparison
      // All normalized search terms must match (AND logic)
      narrators = allNarrators.filter(narrator => {
        // Get all text fields that could match
        const searchableFields: string[] = [
          narrator.primary_arabic_name || '',
          narrator.primary_english_name || '',
          narrator.full_name_arabic || '',
          narrator.full_name_english || '',
          narrator.title || '',
          narrator.kunya || '',
          narrator.lineage || '',
          narrator.search_text || '',
        ];

        // Add alternate names
        const alternates = alternateMap.get(narrator.id) || [];
        for (const alt of alternates) {
          if (alt.arabic_name) searchableFields.push(alt.arabic_name);
          if (alt.english_name) searchableFields.push(alt.english_name);
        }

        // Normalize all searchable fields
        const normalizedFields = searchableFields.map(field => normalizeArabic(field));

        // Check if all normalized search terms match in any normalized field
        for (const normalizedTerm of normalizedSearchTerms) {
          const termMatches = normalizedFields.some(normalizedField => 
            normalizedField.includes(normalizedTerm)
          );
          if (!termMatches) {
            return false; // This term doesn't match, exclude this narrator
          }
        }
        return true; // All terms matched
      });

      // Calculate relevance scores and sort (using normalized terms)
      const scoredNarrators = narrators.map(narrator => ({
        ...narrator,
        relevanceScore: calculateRelevanceScore(narrator, normalizedSearchTerms)
      }));

      // Sort by relevance score (descending), then by name
      scoredNarrators.sort((a, b) => {
        if (b.relevanceScore !== a.relevanceScore) {
          return b.relevanceScore - a.relevanceScore;
        }
        return a.primary_arabic_name.localeCompare(b.primary_arabic_name);
      });

      // Remove scores before returning
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      narrators = scoredNarrators.map(({ relevanceScore, ...narrator }) => narrator);

      // Get total count before pagination
      const total = narrators.length;

      // Apply pagination
      const offset = params.offset ?? 0;
      const limit = params.limit ?? 50;
      const paginatedNarrators = narrators.slice(offset, offset + limit);

      // Convert to Narrator format
      const formattedNarrators: Narrator[] = paginatedNarrators.map(n => ({
        id: n.id,
        primaryArabicName: n.primary_arabic_name,
        primaryEnglishName: n.primary_english_name,
        fullNameArabic: n.full_name_arabic || undefined,
        fullNameEnglish: n.full_name_english || undefined,
        title: n.title || undefined,
        kunya: n.kunya || undefined,
        lineage: n.lineage || undefined,
        deathYearAH: n.death_year_ah || undefined,
        deathYearAHAlternative: n.death_year_ah_alternative || undefined,
        deathYearCE: n.death_year_ce || undefined,
        placeOfResidence: n.place_of_residence || undefined,
        placeOfDeath: n.place_of_death || undefined,
        placesTraveled: n.places_traveled ? JSON.parse(n.places_traveled) : undefined,
        taqribCategory: n.taqrib_category || undefined,
        ibnHajarRank: n.ibn_hajar_rank || undefined,
        dhahabiRank: n.dhahabi_rank || undefined,
        notes: n.notes || undefined,
      }));

      return NextResponse.json({
        success: true,
        narrators: formattedNarrators,
        count: formattedNarrators.length,
        total,
        limit: params.limit,
        offset: params.offset
      });
    }

    // Handle specific field searches (arabicName, englishName, deathYearAH)
    if (params.arabicName || params.englishName || params.deathYearAH) {
      let query = 'SELECT * FROM narrators WHERE 1=1';
      const queryParams: (string | number)[] = [];

      if (params.arabicName) {
        // Normalize Arabic name search term
        const normalizedArabicName = normalizeArabic(params.arabicName);
        query += ' AND (primary_arabic_name LIKE ? OR primary_arabic_name LIKE ? OR full_name_arabic LIKE ? OR full_name_arabic LIKE ?)';
        queryParams.push(`%${params.arabicName}%`, `%${normalizedArabicName}%`, `%${params.arabicName}%`, `%${normalizedArabicName}%`);
      }

      if (params.englishName) {
        query += ' AND (primary_english_name LIKE ? OR full_name_english LIKE ?)';
        queryParams.push(`%${params.englishName}%`, `%${params.englishName}%`);
      }

      if (params.deathYearAH) {
        query += ' AND (death_year_ah = ? OR death_year_ah_alternative = ?)';
        queryParams.push(params.deathYearAH, params.deathYearAH);
      }

      query += ' ORDER BY primary_arabic_name LIMIT ? OFFSET ?';
      queryParams.push(params.limit ?? 50, params.offset ?? 0);

      narrators = db.prepare(query).all(...queryParams) as NarratorRow[];

      // Get total count
      let countQuery = 'SELECT COUNT(*) as count FROM narrators WHERE 1=1';
      const countParams: (string | number)[] = [];

      if (params.arabicName) {
        // Normalize Arabic name search term
        const normalizedArabicName = normalizeArabic(params.arabicName);
        countQuery += ' AND (primary_arabic_name LIKE ? OR primary_arabic_name LIKE ? OR full_name_arabic LIKE ? OR full_name_arabic LIKE ?)';
        countParams.push(`%${params.arabicName}%`, `%${normalizedArabicName}%`, `%${params.arabicName}%`, `%${normalizedArabicName}%`);
      }

      if (params.englishName) {
        countQuery += ' AND (primary_english_name LIKE ? OR full_name_english LIKE ?)';
        countParams.push(`%${params.englishName}%`, `%${params.englishName}%`);
      }

      if (params.deathYearAH) {
        countQuery += ' AND (death_year_ah = ? OR death_year_ah_alternative = ?)';
        countParams.push(params.deathYearAH, params.deathYearAH);
      }

      interface CountResult {
        count: number;
      }

      const total = (db.prepare(countQuery).get(...countParams) as CountResult | undefined)?.count || 0;

      // Convert to Narrator format
      const formattedNarrators: Narrator[] = narrators.map(n => ({
        id: n.id,
        primaryArabicName: n.primary_arabic_name,
        primaryEnglishName: n.primary_english_name,
        fullNameArabic: n.full_name_arabic || undefined,
        fullNameEnglish: n.full_name_english || undefined,
        title: n.title || undefined,
        kunya: n.kunya || undefined,
        lineage: n.lineage || undefined,
        deathYearAH: n.death_year_ah || undefined,
        deathYearAHAlternative: n.death_year_ah_alternative || undefined,
        deathYearCE: n.death_year_ce || undefined,
        placeOfResidence: n.place_of_residence || undefined,
        placeOfDeath: n.place_of_death || undefined,
        placesTraveled: n.places_traveled ? JSON.parse(n.places_traveled) : undefined,
        taqribCategory: n.taqrib_category || undefined,
        ibnHajarRank: n.ibn_hajar_rank || undefined,
        dhahabiRank: n.dhahabi_rank || undefined,
        notes: n.notes || undefined,
      }));

      return NextResponse.json({
        success: true,
        narrators: formattedNarrators,
        count: formattedNarrators.length,
        total,
        limit: params.limit,
        offset: params.offset
      });
    }

    // No search params - return empty
    return NextResponse.json({
      success: true,
      narrators: [],
      count: 0,
      total: 0,
      limit: params.limit,
      offset: params.offset
    });
  } catch (error) {
    console.error('Error searching narrators:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to search narrators'
      },
      { status: 500 }
    );
  } finally {
    closeDatabase(db);
  }
}

/**
 * POST /api/narrators
 * Create or update a narrator (not used in current flow, but kept for API completeness)
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function POST(_request: NextRequest) {
  return NextResponse.json(
    {
      success: false,
      error: 'Use the import script to add narrators to the database'
    },
    { status: 400 }
  );
}
