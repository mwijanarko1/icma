import { NextRequest, NextResponse } from 'next/server';
import { findNarratorByName } from '@/data/narrator-matcher';
import { withRateLimit, rateLimiters } from '@/lib/rate-limit';
import { handleValidationError } from '@/lib/validation/middleware';
import { validateString } from '@/lib/validation';
import { extractReputationGrades } from '@/data/grade-extractor';
import { ReputationGrade } from '@/lib/grading/constants';

interface ExtractedNarrator {
  number: number;
  arabicName: string;
  englishName: string;
}

interface MatchCandidate {
  narratorId: string;
  confidence: number;
  matchedName: string;
  suggestedGrades: ReputationGrade[];
  databaseNarrator: {
    id: string;
    primaryArabicName: string;
    primaryEnglishName: string;
    ibnHajarRank?: string;
    dhahabiRank?: string;
    taqribCategory?: string;
    scholarlyOpinionsCount?: number;
    birthYearAH?: number;
    deathYearAH?: number;
    birthYearCE?: number;
    deathYearCE?: number;
  };
}

interface MatchResult {
  number: number;
  arabicName: string;
  englishName: string;
  matched: boolean;
  matches?: MatchCandidate[]; // Top 3 matches
  // Legacy fields for backward compatibility (use first match if available)
  narratorId?: string;
  confidence?: number;
  matchedName?: string;
  suggestedGrades?: ReputationGrade[];
  databaseNarrator?: {
    id: string;
    primaryArabicName: string;
    primaryEnglishName: string;
    ibnHajarRank?: string;
    dhahabiRank?: string;
    taqribCategory?: string;
    scholarlyOpinionsCount?: number;
    birthYearAH?: number;
    deathYearAH?: number;
    birthYearCE?: number;
    deathYearCE?: number;
  };
}

/**
 * POST /api/match-narrators
 * Match extracted narrators to database and auto-assign grades
 *
 * @swagger
 * /api/match-narrators:
 *   post:
 *     summary: Match extracted narrators to database
 *     description: Match narrators extracted from hadith text to the narrator database using fuzzy matching and assign reliability grades
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - narrators
 *             properties:
 *               narrators:
 *                 type: array
 *                 minItems: 1
 *                 maxItems: 50
 *                 items:
 *                   type: object
 *                   required:
 *                     - number
 *                     - arabicName
 *                     - englishName
 *                   properties:
 *                     number:
 *                       type: integer
 *                       minimum: 1
 *                       description: Position in the chain (1 = Prophet, 2 = first narrator, etc.)
 *                       example: 2
 *                     arabicName:
 *                       type: string
 *                       minLength: 1
 *                       maxLength: 200
 *                       description: Arabic name of the narrator
 *                       example: "عمر بن الخطاب"
 *                     englishName:
 *                       type: string
 *                       minLength: 1
 *                       maxLength: 200
 *                       description: English name of the narrator
 *                       example: "Umar ibn al-Khattab"
 *     responses:
 *       200:
 *         description: Successful matching
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
 *                       number:
 *                         type: integer
 *                         description: Position in the chain
 *                       arabicName:
 *                         type: string
 *                         description: Original Arabic name
 *                       englishName:
 *                         type: string
 *                         description: Original English name
 *                       matched:
 *                         type: boolean
 *                         description: Whether a match was found
 *                       matches:
 *                         type: array
 *                         description: Top matching candidates (up to 3)
 *                         items:
 *                           type: object
 *                           properties:
 *                             narratorId:
 *                               type: string
 *                               description: Database narrator ID
 *                             confidence:
 *                               type: number
 *                               minimum: 0
 *                               maximum: 1
 *                               description: Match confidence score
 *                             matchedName:
 *                               type: string
 *                               description: Best matching name from database
 *                             suggestedGrades:
 *                               type: array
 *                               description: Reliability grades for this narrator
 *                               items:
 *                                 type: string
 *                                 enum: [Thiqah, Saduq, Thiqa Thabt, etc.]
 *       400:
 *         description: Bad request - invalid narrators array
 *       429:
 *         description: Rate limit exceeded
 *       500:
 *         description: Internal server error
 *
 * @example
 * POST /api/match-narrators
 * {
 *   "narrators": [
 *     {
 *       "number": 1,
 *       "arabicName": "رَسُولَ اللَّهِ",
 *       "englishName": "Messenger of Allah"
 *     },
 *     {
 *       "number": 2,
 *       "arabicName": "عمر بن الخطاب",
 *       "englishName": "Umar ibn al-Khattab"
 *     }
 *   ]
 * }
 */
const POSTHandler = async (request: NextRequest) => {
  try {
    const body = await request.json();
    const { narrators } = body;

    // Validate narrators array
    if (!Array.isArray(narrators)) {
      return handleValidationError('narrators must be an array');
    }

    if (narrators.length === 0) {
      return handleValidationError('narrators array cannot be empty');
    }

    if (narrators.length > 50) {
      return handleValidationError('narrators array cannot exceed 50 narrators');
    }

    // Validate each narrator
    for (let i = 0; i < narrators.length; i++) {
      const narrator = narrators[i];

      if (!narrator || typeof narrator !== 'object') {
        return handleValidationError(`narrators[${i}] must be an object`);
      }

      // Validate narrator properties
      const numberValidation = validateString(narrator.number?.toString(), `narrators[${i}].number`, {
        minLength: 1,
        maxLength: 3,
        pattern: /^\d+$/
      });

      if (!numberValidation.isValid) {
        return handleValidationError(numberValidation.error!);
      }

      const arabicValidation = validateString(narrator.arabicName, `narrators[${i}].arabicName`, {
        minLength: 1,
        maxLength: 200,
        trim: true
      });

      if (!arabicValidation.isValid) {
        return handleValidationError(arabicValidation.error!);
      }

      const englishValidation = validateString(narrator.englishName, `narrators[${i}].englishName`, {
        minLength: 1,
        maxLength: 200,
        trim: true
      });

      if (!englishValidation.isValid) {
        return handleValidationError(englishValidation.error!);
      }

      // Sanitize the validated narrator
      narrators[i] = {
        number: parseInt(numberValidation.sanitizedValue, 10),
        arabicName: arabicValidation.sanitizedValue,
        englishName: englishValidation.sanitizedValue
      };
    }

    const results: MatchResult[] = [];

    for (const narrator of narrators) {
      // Skip matching for the Prophet (رَسُولَ اللَّهِ)
      if (narrator.arabicName === 'رَسُولَ اللَّهِ' || 
          narrator.arabicName === 'الْإِمَامُ الْبُخَارِيُّ' ||
          narrator.arabicName.includes('اللَّه') && narrator.arabicName.includes('رَسُول')) {
        results.push({
          number: narrator.number,
          arabicName: narrator.arabicName,
          englishName: narrator.englishName,
          matched: false,
          suggestedGrades: [],
        });
        continue;
      }

      // Try to find matching narrator in database
      // Use both Arabic and English names for better matching
      const allMatches = findNarratorByName(narrator.arabicName, narrator.englishName);

      // Get top 3 matches (filter by minimum confidence threshold of 0.3)
      const topMatches = allMatches
        .filter(m => m.confidence >= 0.3)
        .slice(0, 3)
        .map(match => {
          const grades = extractReputationGrades(match.databaseNarrator);
          return {
            narratorId: match.narratorId,
            confidence: match.confidence,
            matchedName: match.matchedName,
            suggestedGrades: grades,
            databaseNarrator: {
              id: match.databaseNarrator.id,
              primaryArabicName: match.databaseNarrator.primaryArabicName,
              primaryEnglishName: match.databaseNarrator.primaryEnglishName,
              ibnHajarRank: match.databaseNarrator.ibnHajarRank,
              dhahabiRank: match.databaseNarrator.dhahabiRank,
              taqribCategory: match.databaseNarrator.taqribCategory,
              scholarlyOpinionsCount: match.databaseNarrator.scholarlyOpinions?.length || 0,
              birthYearAH: match.databaseNarrator.birthYearAH,
              deathYearAH: match.databaseNarrator.deathYearAH,
              birthYearCE: match.databaseNarrator.birthYearCE,
              deathYearCE: match.databaseNarrator.deathYearCE,
            },
          };
        });

      if (topMatches.length > 0) {
        // Found matches - return top 3
        const bestMatch = topMatches[0];
        results.push({
          number: narrator.number,
          arabicName: narrator.arabicName,
          englishName: narrator.englishName,
          matched: true,
          matches: topMatches,
          // Legacy fields for backward compatibility
          narratorId: bestMatch.narratorId,
          confidence: bestMatch.confidence,
          matchedName: bestMatch.matchedName,
          suggestedGrades: bestMatch.suggestedGrades,
          databaseNarrator: bestMatch.databaseNarrator,
        });
      } else {
        // No match found
        results.push({
          number: narrator.number,
          arabicName: narrator.arabicName,
          englishName: narrator.englishName,
          matched: false,
        });
      }
    }

    return NextResponse.json({ 
      success: true,
      matches: results,
      summary: {
        total: results.length,
        matched: results.filter(r => r.matched).length,
        unmatched: results.filter(r => !r.matched).length,
      }
    });
  } catch (error) {
    console.error('Error matching narrators:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to match narrators'
      },
      { status: 500 }
    );
  }
};

// Export with rate limiting applied
export const POST = withRateLimit(POSTHandler, rateLimiters.expensive);

