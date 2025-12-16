import { NextRequest, NextResponse } from 'next/server';
import { getDatabase, closeDatabase } from '@/data/db';
import type { Narrator } from '@/data/types';
import { validationMiddleware, handleValidationError, extractValidatedParams, createValidationMiddleware } from '@/lib/validation/middleware';
import { validateString, validateNumeric, validationSchemas } from '@/lib/validation';
import { withRateLimit, rateLimiters } from '@/lib/rate-limit';
import { 
  normalizeArabic, 
  normalizeEnglish,
  normalizeSearchTerm,
  hasArabicCharacters,
  calculateSimilarity 
} from '@/data/narrator-matcher';

/**
 * Check if a normalized field matches a search term with word boundary awareness
 * For Arabic: matches whole words or word prefixes
 * For English: matches whole words or word prefixes
 */
function matchesSearchTerm(normalizedField: string, normalizedTerm: string, isArabic: boolean): boolean {
  // Exact match
  if (normalizedField === normalizedTerm) {
    return true;
  }
  
  // Split field into words
  const words = normalizedField.split(/\s+/).filter(w => w.length > 0);
  
  // Check if any word matches exactly or starts with the term
  for (const word of words) {
    if (word === normalizedTerm || word.startsWith(normalizedTerm)) {
      return true;
    }
  }
  
  // For Arabic, also check substring match (more flexible for Arabic names)
  // This handles cases where names might be written without spaces
  if (isArabic && normalizedField.includes(normalizedTerm)) {
    return true;
  }
  
  return false;
}

interface SearchParams {
  query?: string;
  arabicName?: string;
  englishName?: string;
  deathYearAH?: number;
  limit?: number;
  offset?: number;
  random?: boolean;
  ranks?: string[];
  narratorRanks?: string[];
  placesOfResidence?: string[];
  isSearchAll?: boolean;
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
  birth_year_ah?: number | null;
  death_year_ah?: number | null;
  death_year_ah_alternative?: number | null;
  birth_year_ce?: number | null;
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
 * Check if a narrator matches the selected rank filter
 */
function matchesRankFilter(narrator: NarratorRow, ranks: string[]): boolean {
  if (!ranks || ranks.length === 0) return true; // No filter applied

  const ibnHajarRank = narrator.ibn_hajar_rank?.toLowerCase() || '';
  const dhahabiRank = narrator.dhahabi_rank?.toLowerCase() || '';

  // Combine both rank fields for searching
  const combinedRanks = `${ibnHajarRank} ${dhahabiRank}`;

  // Check if any of the selected ranks match (OR logic)
  return ranks.some(rank => {
    switch (rank) {
      case 'sahaba':
        return combinedRanks.includes('صحابي') || combinedRanks.includes('صحبة');
      case 'thiqah':
        return combinedRanks.includes('ثقة');
      case 'saduq':
        return combinedRanks.includes('صدوق');
      case 'daif':
        return combinedRanks.includes('ضعيف');
      default:
        return false;
    }
  });
}

/**
 * Check if a narrator matches the selected narrator rank filter
 */
function matchesNarratorRankFilter(narrator: NarratorRow, narratorRanks: string[]): boolean {
  if (!narratorRanks || narratorRanks.length === 0) return true; // No filter applied

  const narratorNarratorRank = narrator.taqrib_category || '';

  // Check if any of the selected ranks match (OR logic)
  return narratorRanks.some(rank => {
    // Handle combined ranks (pipe-separated)
    if (rank.includes('|')) {
      const rankOptions = rank.split('|');
      return rankOptions.some(r => narratorNarratorRank.includes(r.trim()));
    }
    // Single rank
    return narratorNarratorRank.includes(rank);
  });
}

/**
 * Check if a narrator matches the selected place of residence filter
 */
function matchesPlaceOfResidenceFilter(narrator: NarratorRow, placesOfResidence: string[]): boolean {
  if (!placesOfResidence || placesOfResidence.length === 0) return true; // No filter applied

  const narratorPlaceOfResidence = narrator.place_of_residence || '';

  // Check if any of the selected places match (OR logic)
  return placesOfResidence.some(place => narratorPlaceOfResidence.includes(place));
}

/**
 * Calculate relevance score for a narrator based on search query
 * Uses the match algorithm's similarity calculation for better accuracy
 */
function calculateRelevanceScore(
  narrator: NarratorRow, 
  normalizedSearchTerms: string[],
  originalSearchTerms: string[]
): number {
  let score = 0;
  const normalizedSearchText = normalizedSearchTerms.join(' ');

  // Use similarity-based scoring for better matching (like the match algorithm)
  // Calculate similarity for each search term against narrator fields
  for (let i = 0; i < normalizedSearchTerms.length; i++) {
    const normalizedTerm = normalizedSearchTerms[i];
    const originalTerm = originalSearchTerms[i];
    const termIsArabic = hasArabicCharacters(originalTerm);
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

    // Full Arabic name - HIGHEST PRIORITY - use similarity calculation
    if (narrator.full_name_arabic) {
      const similarity = calculateSimilarity(narrator.full_name_arabic, normalizedTerm);
      if (similarity >= 0.95) {
        score += 100; // Near-exact match - highest priority
      } else if (similarity >= 0.8) {
        score += 80; // Very high similarity
      } else if (similarity >= 0.6) {
        score += 60; // High similarity
      } else if (similarity >= 0.4) {
        score += 40; // Medium similarity
      } else if (similarity > 0) {
        score += 20; // Low similarity
      }
    }

    // Kunya - SECOND PRIORITY - use similarity calculation
    if (narrator.kunya) {
      const similarity = calculateSimilarity(narrator.kunya, normalizedTerm);
      if (similarity >= 0.95) {
        score += 70; // High priority but not highest
      } else if (similarity >= 0.8) {
        score += 55;
      } else if (similarity >= 0.6) {
        score += 40;
      } else if (similarity >= 0.4) {
        score += 25;
      } else if (similarity > 0) {
        score += 12;
      }
    }

    // English names - use proper normalization and word boundary-aware matching
    // Only process if the search term is not Arabic (to avoid false matches)
    if (!termIsArabic && normalizedTerm) {
      const normalizedPrimaryEnglish = narrator.primary_english_name 
        ? normalizeEnglish(narrator.primary_english_name) 
        : '';
      const normalizedFullEnglish = narrator.full_name_english 
        ? normalizeEnglish(narrator.full_name_english) 
        : '';
      
      // Use word boundary-aware matching for English
      if (normalizedPrimaryEnglish === normalizedTerm) {
        score += 100;
      } else if (matchesSearchTerm(normalizedPrimaryEnglish, normalizedTerm, false)) {
        // Check if it's a word start match (higher score) vs substring match
        const words = normalizedPrimaryEnglish.split(/\s+/);
        const isWordStart = words.some(w => w.startsWith(normalizedTerm));
        score += isWordStart ? 50 : 20;
      }

      if (matchesSearchTerm(normalizedFullEnglish, normalizedTerm, false)) {
        const words = normalizedFullEnglish.split(/\s+/);
        const isWordStart = words.some(w => w.startsWith(normalizedTerm));
        score += isWordStart ? 30 : 15;
      }
    }

    // Title, lineage, search_text - simple matching
    const normalizedTitle = narrator.title ? normalizeArabic(narrator.title) : '';
    const normalizedLineage = narrator.lineage ? normalizeArabic(narrator.lineage) : '';
    const normalizedSearchText = narrator.search_text ? normalizeArabic(narrator.search_text) : '';

    if (normalizedTitle.includes(normalizedTerm)) {
      score += 15;
    }

    if (normalizedLineage.includes(normalizedTerm)) {
      score += 35; // Higher priority for lineage matches
    }

    if (normalizedSearchText.includes(normalizedTerm)) {
      score += 5;
    }
  }

  // Boost score for full search text matching (using similarity for better accuracy)
  if (normalizedSearchTerms.length > 1) {
    // Multiple terms - check if full search text matches any field with similarity
    const fullSearchText = normalizedSearchText;
    
    // Check primary Arabic name - lower priority than full Arabic name
    if (narrator.primary_arabic_name) {
      const similarity = calculateSimilarity(narrator.primary_arabic_name, fullSearchText);
      if (similarity >= 0.8) {
        score += 20; // Moderate boost for full phrase match
      } else if (similarity >= 0.6) {
        score += 10;
      }
    }
    
    // Check kunya - SECOND PRIORITY for full phrase
    if (narrator.kunya) {
      const similarity = calculateSimilarity(narrator.kunya, fullSearchText);
      if (similarity >= 0.8) {
        score += 35; // Strong boost for kunya full match
      } else if (similarity >= 0.6) {
        score += 18;
      }
    }
    
    // Check full Arabic name - HIGHEST PRIORITY for full phrase
    if (narrator.full_name_arabic) {
      const similarity = calculateSimilarity(narrator.full_name_arabic, fullSearchText);
      if (similarity >= 0.8) {
        score += 45; // Highest boost for full phrase match
      } else if (similarity >= 0.6) {
        score += 25;
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
 *
 * @swagger
 * /api/narrators:
 *   get:
 *     summary: Search Islamic narrators (muhaddithin)
 *     description: Search for Islamic hadith narrators by name, with fuzzy matching and relevance ranking
 *     parameters:
 *       - name: query
 *         in: query
 *         schema:
 *           type: string
 *           minLength: 2
 *           maxLength: 100
 *         description: Search query (Arabic or English name, minimum 2 characters)
 *       - name: arabicName
 *         in: query
 *         schema:
 *           type: string
 *         description: Filter by primary Arabic name
 *       - name: englishName
 *         in: query
 *         schema:
 *           type: string
 *         description: Filter by primary English name
 *       - name: deathYearAH
 *         in: query
 *         schema:
 *           type: integer
 *         description: Filter by death year in AH (Anno Hegirae)
 *       - name: limit
 *         in: query
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 50
 *         description: Maximum number of results to return
 *       - name: offset
 *         in: query
 *         schema:
 *           type: integer
 *           minimum: 0
 *           default: 0
 *         description: Number of results to skip for pagination
 *       - name: random
 *         in: query
 *         schema:
 *           type: boolean
 *         description: Return random narrators instead of search results
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
 *                       id:
 *                         type: string
 *                         description: Unique narrator identifier
 *                         example: "humaydi-abdullah-zubayr"
 *                       primaryArabicName:
 *                         type: string
 *                         description: Primary Arabic name
 *                         example: "عبد الله بن الزبير"
 *                       primaryEnglishName:
 *                         type: string
 *                         description: Primary English name
 *                         example: "Abdullah ibn al-Zubayr"
 *                       fullNameArabic:
 *                         type: string
 *                         description: Complete Arabic name with lineage
 *                       fullNameEnglish:
 *                         type: string
 *                         description: Complete English name
 *                       title:
 *                         type: string
 *                         description: Honorific title (e.g., "Al-Hafiz")
 *                       kunya:
 *                         type: string
 *                         description: Kunya (e.g., "Abu Bakr")
 *                       lineage:
 *                         type: string
 *                         description: Tribal or geographical lineage
 *                       deathYearAH:
 *                         type: integer
 *                         description: Death year in Islamic calendar
 *                       deathYearCE:
 *                         type: integer
 *                         description: Death year in Common Era
 *                       placeOfDeath:
 *                         type: string
 *                         description: Place of death
 *                       scholarlyOpinions:
 *                         type: array
 *                         description: Scholarly opinions about the narrator's reliability
 *                 total:
 *                   type: integer
 *                   description: Total number of results
 *                 limit:
 *                   type: integer
 *                   description: Results per page
 *                 offset:
 *                   type: integer
 *                   description: Results offset
 *       400:
 *         description: Bad request - invalid parameters
 *       429:
 *         description: Rate limit exceeded
 *       500:
 *         description: Internal server error
 *
 * @example
 * // Search by Arabic name
 * GET /api/narrators?query=عمر
 *
 * @example
 * // Search by English name
 * GET /api/narrators?query=Umar
 *
 * @example
 * // Filter by death year
 * GET /api/narrators?deathYearAH=73
 *
 * @example
 * // Get random narrators
 * GET /api/narrators?random=true&limit=5
 */
const GETHandler = async (request: NextRequest) => {
  const db = getDatabase();

  try {
    // Use validation middleware for basic parameter validation (excluding array params we handle manually)
    const basicValidationSchema = {
      query: validationSchemas.narratorsSearch.query,
      limit: validationSchemas.narratorsSearch.limit,
      offset: validationSchemas.narratorsSearch.offset,
      random: validationSchemas.narratorsSearch.random,
    };

    const validationResult = await createValidationMiddleware(basicValidationSchema)(request);

    if (!validationResult.success) {
      return handleValidationError(validationResult.error);
    }

    const { params } = validationResult.data;
    const validatedParams: SearchParams = {
      ...params,
      random: request.nextUrl.searchParams.get('random') === 'true',
      ranks: request.nextUrl.searchParams.getAll('ranks').filter(Boolean) || undefined,
      narratorRanks: request.nextUrl.searchParams.getAll('narratorRanks').filter(Boolean) || undefined,
      placesOfResidence: request.nextUrl.searchParams.getAll('placesOfResidence').filter(Boolean) || undefined,
      isSearchAll: request.nextUrl.searchParams.get('isSearchAll') === 'true',
    };

    // Parse search terms from query and normalize them
    // Minimum 2 characters per term to avoid too many results
    const searchTerms = validatedParams.query
      ? validatedParams.query.trim().split(/\s+/).filter(term => term.length >= 2)
      : [];

    // Validate minimum query length (additional check beyond middleware)
    // Skip query validation for random requests or when preset criteria are provided
    const hasPresetCriteria = (validatedParams.ranks && validatedParams.ranks.length > 0) ||
                              (validatedParams.narratorRanks && validatedParams.narratorRanks.length > 0) ||
                              (validatedParams.placesOfResidence && validatedParams.placesOfResidence.length > 0) ||
                              validatedParams.isSearchAll;
    if (!validatedParams.random && !hasPresetCriteria && validatedParams.query && searchTerms.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Search query must contain at least one term with 2 or more characters'
      }, { status: 400 });
    }

    // Normalize search terms (use appropriate normalization based on language)
    const normalizedSearchTerms = searchTerms.map(term => normalizeSearchTerm(term));

    let narrators: NarratorRow[] = [];

    if ((params.query && searchTerms.length > 0) || hasPresetCriteria) {
      // Fetch all narrators and alternate names, then filter in memory using normalized comparison
      // This ensures we catch matches even when database has different character variations
      const allNarrators = db.prepare(`
        SELECT DISTINCT n.*
        FROM narrators n
      `).all() as NarratorRow[];


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


        // Normalize all searchable fields appropriately
        const normalizedFields = searchableFields.map(field => {
          // Determine if field contains Arabic
          const fieldHasArabic = hasArabicCharacters(field);
          return fieldHasArabic ? normalizeArabic(field) : normalizeEnglish(field);
        });

        // Check if all normalized search terms match in any normalized field
        // Use word boundary-aware matching
        for (let i = 0; i < normalizedSearchTerms.length; i++) {
          const normalizedTerm = normalizedSearchTerms[i];
          const originalTerm = searchTerms[i];
          const termIsArabic = hasArabicCharacters(originalTerm);
          
          const termMatches = normalizedFields.some((normalizedField, fieldIndex) => {
            const originalField = searchableFields[fieldIndex];
            const fieldIsArabic = hasArabicCharacters(originalField);
            
            // Use word boundary-aware matching
            return matchesSearchTerm(normalizedField, normalizedTerm, termIsArabic || fieldIsArabic);
          });
          
          if (!termMatches) {
            return false; // This term doesn't match, exclude this narrator
          }
        }
        return true; // All terms matched
      });

      // Apply rank filtering
      if (validatedParams.ranks && validatedParams.ranks.length > 0) {
        narrators = narrators.filter(narrator => matchesRankFilter(narrator, validatedParams.ranks!));
      }

      // Apply narrator rank filtering
      if (validatedParams.narratorRanks && validatedParams.narratorRanks.length > 0) {
        narrators = narrators.filter(narrator => matchesNarratorRankFilter(narrator, validatedParams.narratorRanks!));
      }

      // Apply place of residence filtering
      if (validatedParams.placesOfResidence && validatedParams.placesOfResidence.length > 0) {
        narrators = narrators.filter(narrator => matchesPlaceOfResidenceFilter(narrator, validatedParams.placesOfResidence!));
      }

      // Calculate relevance scores and sort (using normalized terms)
      const scoredNarrators = narrators.map(narrator => ({
        ...narrator,
        relevanceScore: calculateRelevanceScore(narrator, normalizedSearchTerms, searchTerms)
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

      // Apply pagination - allow larger limits for preset searches
      const offset = params.offset ?? 0;
      const hasPresetCriteria = (validatedParams.ranks && validatedParams.ranks.length > 0) ||
                                (validatedParams.narratorRanks && validatedParams.narratorRanks.length > 0) ||
                                (validatedParams.placesOfResidence && validatedParams.placesOfResidence.length > 0);
      const limit = hasPresetCriteria ? (params.limit ?? 100) : (params.limit ?? 50); // Larger limit for preset searches
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
        total: hasPresetCriteria ? 10000 : total, // Allow "unlimited" pagination for preset searches
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

    // Handle random narrators request
    if (validatedParams.random) {
      const limit = params.limit || 5;
      // Get random narrators using SQLite's random() function
      const randomNarrators = db.prepare(`
        SELECT * FROM narrators 
        ORDER BY RANDOM() 
        LIMIT ?
      `).all(limit) as NarratorRow[];

      // Get total count
      const totalResult = db.prepare('SELECT COUNT(*) as count FROM narrators').get() as { count: number };
      const total = totalResult.count;

      // Convert to Narrator format
      const formattedNarrators: Narrator[] = randomNarrators.map(n => ({
        id: n.id,
        primaryArabicName: n.primary_arabic_name,
        primaryEnglishName: n.primary_english_name,
        fullNameArabic: n.full_name_arabic || undefined,
        fullNameEnglish: n.full_name_english || undefined,
        title: n.title || undefined,
        kunya: n.kunya || undefined,
        lineage: n.lineage || undefined,
        birthYearAH: n.birth_year_ah || undefined,
        deathYearAH: n.death_year_ah || undefined,
        deathYearAHAlternative: n.death_year_ah_alternative || undefined,
        birthYearCE: n.birth_year_ce || undefined,
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
        offset: 0
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
};

// Export with rate limiting applied
export const GET = withRateLimit(GETHandler, rateLimiters.api);
