import { NextRequest, NextResponse } from 'next/server';
import { findNarratorByName } from '@/data/narrator-matcher';
import { extractReputationGrades } from '@/data/grade-extractor';
import { ReputationGrade } from '@/components/HadithAnalyzer';

interface ExtractedNarrator {
  number: number;
  arabicName: string;
  englishName: string;
}

interface MatchResult {
  number: number;
  arabicName: string;
  englishName: string;
  matched: boolean;
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
      const matches = findNarratorByName(narrator.arabicName);

      if (matches.length > 0 && matches[0].confidence >= 0.5) {
        // Found a good match
        const bestMatch = matches[0];
        const grades = extractReputationGrades(bestMatch.databaseNarrator);

        results.push({
          number: narrator.number,
          arabicName: narrator.arabicName,
          englishName: narrator.englishName,
          matched: true,
          narratorId: bestMatch.narratorId,
          confidence: bestMatch.confidence,
          matchedName: bestMatch.matchedName,
          suggestedGrades: grades,
          databaseNarrator: {
            id: bestMatch.databaseNarrator.id,
            primaryArabicName: bestMatch.databaseNarrator.primaryArabicName,
            primaryEnglishName: bestMatch.databaseNarrator.primaryEnglishName,
            ibnHajarRank: bestMatch.databaseNarrator.ibnHajarRank,
            dhahabiRank: bestMatch.databaseNarrator.dhahabiRank,
            taqribCategory: bestMatch.databaseNarrator.taqribCategory,
            scholarlyOpinionsCount: bestMatch.databaseNarrator.scholarlyOpinions?.length || 0,
          },
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

