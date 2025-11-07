import { NextRequest, NextResponse } from 'next/server';
import { getDatabase, closeDatabase } from '@/data/db';
import type { Narrator } from '@/data/types';

/**
 * GET /api/narrators/[id]
 * Get detailed information about a specific narrator from database
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const db = getDatabase();
  
  try {
    const { id } = await params;
    const narratorId = decodeURIComponent(id);
    
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
    }

    interface OpinionRow {
      narrator_id: string;
      scholar_name: string;
      opinion_text: string;
      source_reference?: string | null;
      source_book?: string | null;
      source_volume?: string | null;
      opinion_type: string;
      is_primary: number;
    }

    interface RelationshipRow {
      narrator_id: string;
      related_narrator_id: string;
      relationship_type: string;
      relationship_description?: string | null;
      duration_years?: number | null;
    }

    interface LineageRow {
      narrator_id: string;
      lineage_type: string;
      lineage_value: string;
    }

    interface ReputationRow {
      narrator_id: string;
      grade: string;
      grade_source?: string | null;
    }

    const narrator = db.prepare('SELECT * FROM narrators WHERE id = ?').get(narratorId) as NarratorRow | undefined;

    if (!narrator) {
      return NextResponse.json(
        {
          success: false,
          error: 'Narrator not found'
        },
        { status: 404 }
      );
    }

    // Get scholarly opinions
    const opinions = db.prepare('SELECT * FROM scholarly_opinions WHERE narrator_id = ?').all(narratorId) as OpinionRow[];
    
    // Get relationships
    const relationships = db.prepare('SELECT * FROM narrator_relationships WHERE narrator_id = ?').all(narratorId) as RelationshipRow[];
    
    // Get lineages
    const lineages = db.prepare('SELECT * FROM narrator_lineage WHERE narrator_id = ?').all(narratorId) as LineageRow[];
    
    // Get reputation grades
    const reputationGrades = db.prepare('SELECT * FROM narrator_reputation WHERE narrator_id = ?').all(narratorId) as ReputationRow[];

    const fullNarrator: Narrator = {
      id: narrator.id,
      primaryArabicName: narrator.primary_arabic_name,
      primaryEnglishName: narrator.primary_english_name,
      fullNameArabic: narrator.full_name_arabic || undefined,
      fullNameEnglish: narrator.full_name_english || undefined,
      title: narrator.title || undefined,
      kunya: narrator.kunya || undefined,
      lineage: narrator.lineage || undefined,
      deathYearAH: narrator.death_year_ah || undefined,
      deathYearAHAlternative: narrator.death_year_ah_alternative || undefined,
      deathYearCE: narrator.death_year_ce || undefined,
      placeOfResidence: narrator.place_of_residence || undefined,
      placeOfDeath: narrator.place_of_death || undefined,
      placesTraveled: narrator.places_traveled ? JSON.parse(narrator.places_traveled) : undefined,
      taqribCategory: narrator.taqrib_category || undefined,
      ibnHajarRank: narrator.ibn_hajar_rank || undefined,
      dhahabiRank: narrator.dhahabi_rank || undefined,
      notes: narrator.notes || undefined,
      scholarlyOpinions: opinions.map(op => ({
        narratorId: op.narrator_id,
        scholarName: op.scholar_name,
        opinionText: op.opinion_text,
        sourceReference: op.source_reference || undefined,
        sourceBook: op.source_book || undefined,
        sourceVolume: op.source_volume || undefined,
        opinionType: op.opinion_type as 'jarh' | 'ta\'dil' | 'neutral',
        isPrimary: op.is_primary === 1,
      })),
      relationships: relationships.map(rel => ({
        narratorId: rel.narrator_id,
        relatedNarratorId: rel.related_narrator_id,
        relationshipType: rel.relationship_type as 'teacher' | 'student' | 'companion' | 'contemporary' | 'companion_of',
        relationshipDescription: rel.relationship_description || undefined,
        durationYears: rel.duration_years || undefined,
      })),
      lineages: lineages.map(lin => ({
        narratorId: lin.narrator_id,
        lineageType: lin.lineage_type as 'tribal' | 'geographical' | 'honorific',
        lineageValue: lin.lineage_value,
      })),
      reputationGrades: reputationGrades.map(rep => ({
        narratorId: rep.narrator_id,
        grade: rep.grade,
        gradeSource: rep.grade_source || undefined,
      })),
    };

    return NextResponse.json({
      success: true,
      narrator: fullNarrator
    });
  } catch (error) {
    console.error('Error fetching narrator:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch narrator'
      },
      { status: 500 }
    );
  } finally {
    closeDatabase(db);
  }
}
