import { NextRequest, NextResponse } from 'next/server';
import { findNarratorByName } from '@/data/narrator-matcher';
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
  };
}

/**
 * POST /api/match-narrators
 * Match extracted narrators to database and auto-assign grades
 */
export async function POST(request: NextRequest) {
  try {
    const { narrators } = await request.json() as { narrators: ExtractedNarrator[] };

    if (!narrators || !Array.isArray(narrators)) {
      return NextResponse.json(
        { error: 'narrators array is required' },
        { status: 400 }
      );
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
}

