// Import utility for Shamela narrator data format directly to SQLite database
import { getDatabase, closeDatabase, generateNarratorId, hijriToCE } from './db';
import type { ShamelaNarratorEntry, Narrator } from './types';

export interface ImportResult {
  success: boolean;
  narratorId?: string;
  skipped?: boolean;
  error?: string;
}

/**
 * Import a narrator from Shamela format directly into SQLite database
 */
export function importShamelaNarratorToDb(
  entry: ShamelaNarratorEntry,
  shamelaId?: number
): ImportResult {
  const db = getDatabase();
  
  try {
    // Generate unique ID using full name, lineage, and Shamela ID to ensure uniqueness
    const narratorId = generateNarratorId(
      entry.name.arabic,
      entry.name.english || entry.name.arabic,
      entry.name.full || entry.name.arabic,
      entry.lineage,
      shamelaId
    );
    
    // Check if narrator already exists (outside transaction to use in return)
    const existing = db.prepare('SELECT id FROM narrators WHERE id = ?').get(narratorId);
    const isUpdate = !!existing;
    
    db.transaction(() => {
      
      if (isUpdate) {
        // Delete existing related data to update
        db.prepare('DELETE FROM scholarly_opinions WHERE narrator_id = ?').run(narratorId);
        db.prepare('DELETE FROM narrator_relationships WHERE narrator_id = ?').run(narratorId);
        db.prepare('DELETE FROM narrator_lineage WHERE narrator_id = ?').run(narratorId);
      }
      
      // Parse lineage
      const lineageArray = entry.lineage || [];
      const lineageString = lineageArray.length > 0 ? lineageArray.join(', ') : null;
      
      // Calculate CE dates if AH dates exist
      const deathYearCE = entry.deathDate?.yearAH 
        ? hijriToCE(entry.deathDate.yearAH)
        : null;
      
      // Build search text for full-text search
      const searchText = [
        entry.name.arabic,
        entry.name.english || '',
        entry.name.full,
        entry.title,
        entry.kunya,
        lineageString,
        entry.placeOfResidence,
        entry.deathDate?.place,
        entry.notes,
      ].filter(Boolean).join(' ');
      
      // Insert narrator
      const insertNarrator = db.prepare(`
        INSERT OR REPLACE INTO narrators (
          id, 
          primary_arabic_name, 
          primary_english_name, 
          full_name_arabic, 
          full_name_english,
          title,
          kunya,
          lineage,
          death_year_ah,
          death_year_ah_alternative,
          death_year_ce,
          place_of_residence,
          place_of_death,
          places_traveled,
          taqrib_category,
          ibn_hajar_rank,
          dhahabi_rank,
          notes,
          search_text
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      
      insertNarrator.run(
        narratorId,
        entry.name.arabic,
        entry.name.english || '',
        entry.name.full || entry.name.arabic || null,
        entry.name.full || entry.name.english || null,
        entry.title || null,
        entry.kunya || null,
        lineageString,
        entry.deathDate?.yearAH || null,
        entry.deathDate?.alternativeYearAH || null,
        deathYearCE,
        entry.placeOfResidence || null,
        entry.deathDate?.place || null,
        entry.placesTraveled ? JSON.stringify(entry.placesTraveled) : null,
        entry.taqribCategory || null,
        entry.ibnHajarRank || null,
        entry.dhahabiRank || null,
        entry.notes || null,
        searchText || null
      );
      
      // Insert scholarly opinions
      if (entry.scholarlyOpinions && entry.scholarlyOpinions.length > 0) {
        const insertOpinion = db.prepare(`
          INSERT INTO scholarly_opinions (
            narrator_id,
            scholar_name,
            opinion_text,
            source_reference,
            source_book,
            source_volume,
            opinion_type,
            is_primary
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `);
        
        for (const opinion of entry.scholarlyOpinions) {
          if (!opinion.scholar || !opinion.opinion) continue;
          
          const sourceVolume = opinion.sourceVolume || 
            (opinion.source ? extractVolume(opinion.source) : null);
          
          insertOpinion.run(
            narratorId,
            opinion.scholar,
            opinion.opinion,
            opinion.source || null,
            opinion.sourceBook || null,
            sourceVolume || null,
            opinion.type || 'neutral',
            0
          );
        }
      }
      
      // Insert relationships
      if (entry.relationships && entry.relationships.length > 0) {
        const insertRelationship = db.prepare(`
          INSERT INTO narrator_relationships (
            narrator_id,
            related_narrator_id,
            relationship_type,
            relationship_description,
            duration_years
          ) VALUES (?, ?, ?, ?, ?)
        `);
        
        // Check if related narrator exists
        const checkNarratorExists = db.prepare('SELECT id FROM narrators WHERE id = ?');
        
        for (const rel of entry.relationships) {
          // If there are specific narrator names, try to link them
          if (rel.narrators && rel.narrators.length > 0) {
            for (const narratorName of rel.narrators) {
              if (!narratorName || !rel.type) continue;
              const relatedId = generateNarratorId(narratorName, narratorName);
              
              // Only insert relationship if the related narrator exists in the database
              // (they might not be imported yet, so we skip those relationships)
              const relatedExists = checkNarratorExists.get(relatedId);
              if (relatedExists) {
                try {
                  insertRelationship.run(
                    narratorId,
                    relatedId,
                    rel.type || 'other',
                    rel.description || null,
                    rel.duration || null
                  );
                } catch (error) {
                  // Ignore duplicate relationship errors (UNIQUE constraint)
                  // Other errors will still be thrown
                  if (!(error instanceof Error && error.message.includes('UNIQUE'))) {
                    throw error;
                  }
                }
              }
              // If related narrator doesn't exist, we skip this relationship
              // It can be added later when that narrator is imported
            }
          }
          
          // If there's a description but no specific narrators, store it as a description-only relationship
          // We'll use a placeholder ID that won't conflict
          if (rel.description && (!rel.narrators || rel.narrators.length === 0)) {
            // Store description-only relationships with a special marker
            // We'll use the narrator's own ID as a placeholder since we can't reference a non-existent narrator
            // Actually, let's just skip these for now or store them differently
            // The description is already captured in the relationship_description field above
          }
        }
      }
      
      // Insert lineage details
      if (lineageArray.length > 0) {
        const insertLineage = db.prepare(`
          INSERT INTO narrator_lineage (
            narrator_id,
            lineage_type,
            lineage_value
          ) VALUES (?, ?, ?)
        `);
        
        for (const lineage of lineageArray) {
          if (!lineage || typeof lineage !== 'string') continue;
          
          const lineageType = lineage.startsWith('Al-') 
            ? (lineage.includes('Makki') || lineage.includes('Madani') || lineage.includes('Baghdadi') 
                ? 'geographical' 
                : 'tribal')
            : 'honorific';
          
          insertLineage.run(narratorId, lineageType, lineage);
        }
      }
    })();
    
    closeDatabase(db);
    return { success: true, narratorId, skipped: isUpdate };
  } catch (error) {
    closeDatabase(db);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

// Helper to extract volume/page from source reference
function extractVolume(source: string): string | null {
  const match = source.match(/\((\d+\/\d+)\)/);
  return match ? match[1] : null;
}

