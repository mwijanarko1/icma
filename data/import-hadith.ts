/**
 * Import script to populate hadith databases from sunnah.com
 * 
 * Usage:
 *   npm run import-hadith -- --collection bukhari --start 1 --end 100
 *   npm run import-hadith -- --collection bukhari --all
 */

import { fetchSunnahHadith, fetchSunnahHadithVersions, type SunnahHadithData } from '@/services/sunnahService';
import { 
  withHadithDatabase, 
  getHadithCount, 
  getMaxHadithNumber,
  hadithExists,
  type HadithCollection,
  HADITH_COLLECTIONS 
} from './hadith-db';
import Database from 'better-sqlite3';

// Collection name mapping (sunnah.com uses different names)
const COLLECTION_MAP: Record<HadithCollection, string> = {
  'bukhari': 'bukhari',
  'muslim': 'muslim',
  'nasai': 'nasai',
  'tirmidhi': 'tirmidhi',
  'abudawud': 'abudawud',
  'ibnmajah': 'ibnmajah',
};

interface ImportOptions {
  collection: HadithCollection;
  start?: number;
  end?: number;
  all?: boolean;
  skipExisting?: boolean;
  batchSize?: number;
  delay?: number; // Delay between requests in ms
  introduction?: boolean; // Whether to import introduction narrations
}

interface ImportResult {
  success: boolean;
  imported: number;
  skipped: number;
  failed: number;
  versionsImported: number; // Total number of versions imported
  errors: Array<{ hadithNumber: number; error: string }>;
}

/**
 * Import a single hadith into the database
 */
async function importHadith(
  db: Database.Database,
  collection: HadithCollection,
  hadithNumber: number,
  skipExisting: boolean = true,
  isIntroduction: boolean = false
): Promise<{ success: boolean; skipped: boolean; imported: number; error?: string }> {
  try {
    const dbHadithNumber = isIntroduction ? -hadithNumber : hadithNumber;
    
    // Check if already exists (for collections with sub-versions, check if any version exists)
    if (skipExisting) {
      const exists = db.prepare('SELECT 1 FROM hadith WHERE hadith_number = ?').get(dbHadithNumber);
      if (exists) {
        return { success: true, skipped: true, imported: 0 };
      }
    } else {
      // With --no-skip, delete existing versions first to ensure we get all sub-versions
      db.prepare('DELETE FROM hadith WHERE hadith_number = ?').run(dbHadithNumber);
    }

    // Fetch from sunnah.com
    const sunnahCollection = COLLECTION_MAP[collection];

    // Fetch the hadith (introduction or regular)
    let hadithVersions: SunnahHadithData[];
    if (isIntroduction) {
      // For introductions, fetch single version
      const singleHadith = await fetchSunnahHadith(sunnahCollection, hadithNumber, {
        timeout: 10000,
        retries: 2,
      }, true);
      hadithVersions = singleHadith ? [singleHadith] : [];
    } else if (collection === 'muslim') {
      // For Muslim collection, fetch all sub-versions
      hadithVersions = await fetchSunnahHadithVersions(sunnahCollection, hadithNumber, {
      timeout: 10000,
      retries: 2,
    });
    } else {
      // For other collections, fetch single version
      const singleHadith = await fetchSunnahHadith(sunnahCollection, hadithNumber, {
        timeout: 10000,
        retries: 2,
      }, false);
      hadithVersions = singleHadith ? [singleHadith] : [];
    }

    if (hadithVersions.length === 0) {
      // Hadith doesn't exist (404) - treat as skipped, not failure
      return { success: true, skipped: true, imported: 0 };
    }

    // Insert all versions into database
    const insert = db.prepare(`
      INSERT OR REPLACE INTO hadith (
        hadith_number,
        sub_version,
        reference,
        english_narrator,
        english_translation,
        arabic_text,
        in_book_reference,
        updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    `);

    let imported = 0;
    for (const hadithData of hadithVersions) {
      if (isIntroduction && !/Introduction/i.test(hadithData.reference)) {
        // Some introduction endpoints point to regular hadith; skip those to avoid duplicates
        continue;
      }
      // For introductions, use negative numbers to distinguish from regular hadith
      const dbHadithNumber = isIntroduction ? -hadithNumber : hadithNumber;

      // Extract sub-version from reference (e.g., "Sahih Muslim 8 a" -> "a")
      let subVersion: string | null = null;
      const referenceMatch = hadithData.reference.match(/(\d+)\s*([a-z])$/i);
      if (referenceMatch) {
        subVersion = referenceMatch[2].toLowerCase();
      }

      const normalizedSubVersion = subVersion ?? '';

      insert.run(
        dbHadithNumber,
        normalizedSubVersion,
      hadithData.reference,
      hadithData.englishNarrator || null,
      hadithData.englishTranslation,
      hadithData.arabicText,
      hadithData.inBookReference || null
    );
      imported++;
    }

    return { success: true, skipped: false, imported };
  } catch (error) {
    return {
      success: false,
      skipped: false,
      imported: 0,
      error: error instanceof Error ? error.message : String(error)
    };
  }
}

/**
 * Import hadith in batches
 */
export async function importHadithBatch(options: ImportOptions): Promise<ImportResult> {
  const {
    collection,
    start = 1,
    end,
    all = false,
    skipExisting = true,
    batchSize = 10,
    delay = 1000, // 1 second delay between requests
    introduction = false,
  } = options;

  const result: ImportResult = {
    success: true,
    imported: 0,
    skipped: 0,
    failed: 0,
    versionsImported: 0,
    errors: [],
  };

  // Determine the range
  let startNumber = start;
  let endNumber = end;

  if (all) {
    // For 'all', we'll need to try fetching until we get a 404 or error
    // For now, we'll use a reasonable upper limit based on known collection sizes
    const collectionLimits: Record<HadithCollection, number> = {
      'bukhari': 7563,
      'muslim': 3033,
      'nasai': 5758,
      'tirmidhi': 3956,
      'abudawud': 5274,
      'ibnmajah': 4341,
    };
    endNumber = collectionLimits[collection] || 10000;
  }

  if (!endNumber) {
    throw new Error('Either --end or --all must be specified');
  }

  console.log(`\nStarting import for ${collection}${introduction ? ' (introduction)' : ''}:`);
  console.log(`  Range: ${startNumber} to ${endNumber}`);
  console.log(`  Skip existing: ${skipExisting}`);
  console.log(`  Batch size: ${batchSize}`);
  console.log(`  Delay: ${delay}ms`);

  // Check what's already in the database
  await withHadithDatabase(collection, async (db) => {
    const existingCount = (db.prepare('SELECT COUNT(*) as count FROM hadith').get() as { count: number }).count;
    if (existingCount > 0) {
      const existingInRange = db.prepare(`
        SELECT hadith_number FROM hadith 
        WHERE hadith_number >= ? AND hadith_number <= ?
        ORDER BY hadith_number
      `).all(startNumber, endNumber || 999999) as Array<{ hadith_number: number }>;
      
      if (existingInRange.length > 0) {
        console.log(`\n  ⚠️  Found ${existingInRange.length} hadith already in database in this range:`);
        if (existingInRange.length <= 20) {
          const numbers = existingInRange.map(h => h.hadith_number).join(', ');
          console.log(`     ${numbers}`);
        } else {
          const firstFew = existingInRange.slice(0, 10).map(h => h.hadith_number).join(', ');
          const lastFew = existingInRange.slice(-5).map(h => h.hadith_number).join(', ');
          console.log(`     ${firstFew}... (${existingInRange.length - 15} more) ...${lastFew}`);
        }
        if (skipExisting) {
          console.log(`  ℹ️  These will be skipped. Use --no-skip to re-import them.\n`);
        }
      } else {
        console.log(`  ✓ No existing hadith in this range. All will be imported.\n`);
      }
    } else {
      console.log(`  ✓ Database is empty. All hadith will be imported.\n`);
    }
  });

  const successList: number[] = [];
  const failedList: Array<{ number: number; error: string }> = [];
  const skippedList: number[] = [];

  await withHadithDatabase(collection, async (db) => {
    // Process each hadith
    for (let i = startNumber; i <= endNumber; i++) {
      const currentProgress = `Processing hadith ${i}/${endNumber}... (✓ ${result.imported} | ✗ ${result.failed} | ⊘ ${result.skipped})`;
      process.stdout.write(`\r  ${currentProgress}`);
      
      const importResult = await importHadith(db, collection, i, skipExisting, introduction);

      if (importResult.skipped) {
        result.skipped++;
        skippedList.push(i);
      } else if (importResult.success) {
        result.imported++;
        result.versionsImported += importResult.imported;
        successList.push(i);
      } else {
        result.failed++;
        const error = importResult.error || 'Unknown error';
        result.errors.push({
          hadithNumber: i,
          error
        });
        failedList.push({ number: i, error });
      }

      // Add delay between requests to be respectful to sunnah.com
      if (i < endNumber && delay > 0) {
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    
    // Clear the progress line
    process.stdout.write('\r' + ' '.repeat(100) + '\r');
  });

  console.log(`\n\nImport complete:`);
  console.log(`  ✓ Hadith imported: ${result.imported}`);
  console.log(`  ✓ Total versions imported: ${result.versionsImported}`);
  console.log(`  ⊘ Skipped: ${result.skipped}`);
  console.log(`  ✗ Failed: ${result.failed}`);

  // Show success summary
  if (successList.length > 0) {
    console.log(`\n✓ Successfully imported hadith:`);
    if (successList.length <= 50) {
      console.log(`  ${successList.join(', ')}`);
    } else {
      console.log(`  ${successList.slice(0, 50).join(', ')}... (and ${successList.length - 50} more)`);
    }
  }

  // Show skipped summary
  if (skippedList.length > 0) {
    console.log(`\n⊘ Skipped hadith (already exist): ${skippedList.length}`);
    if (skippedList.length <= 30) {
      console.log(`  ${skippedList.join(', ')}`);
    } else {
      const firstFew = skippedList.slice(0, 15).join(', ');
      const lastFew = skippedList.slice(-5).join(', ');
      console.log(`  ${firstFew}... (${skippedList.length - 20} more) ...${lastFew}`);
    }
    console.log(`  💡 Tip: Use --no-skip to re-import existing hadith`);
  }

  // Show failed summary
  if (failedList.length > 0) {
    console.log(`\n✗ Failed to import hadith:`);
    failedList.forEach(({ number, error }) => {
      console.log(`  Hadith ${number}: ${error}`);
    });
  }

  return result;
}

/**
 * CLI interface
 */
if (require.main === module) {
  const args = process.argv.slice(2);
  
  // Parse arguments
  const options: Partial<ImportOptions> = {};
  
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    const nextArg = args[i + 1];
    
    if (arg === '--collection' && nextArg) {
      if (HADITH_COLLECTIONS.includes(nextArg as HadithCollection)) {
        options.collection = nextArg as HadithCollection;
      } else {
        console.error(`Invalid collection: ${nextArg}`);
        console.error(`Valid collections: ${HADITH_COLLECTIONS.join(', ')}`);
        process.exit(1);
      }
      i++;
    } else if (arg === '--start' && nextArg) {
      options.start = parseInt(nextArg, 10);
      i++;
    } else if (arg === '--end' && nextArg) {
      options.end = parseInt(nextArg, 10);
      i++;
    } else if (arg === '--all') {
      options.all = true;
    } else if (arg === '--no-skip') {
      options.skipExisting = false;
    } else if (arg === '--batch-size' && nextArg) {
      options.batchSize = parseInt(nextArg, 10);
      i++;
    } else if (arg === '--delay' && nextArg) {
      options.delay = parseInt(nextArg, 10);
      i++;
    } else if (arg === '--introduction') {
      options.introduction = true;
    }
  }

  if (!options.collection) {
    console.error('Error: --collection is required');
    console.error('\nUsage:');
    console.error('  npm run import-hadith -- --collection bukhari --start 1 --end 100');
    console.error('  npm run import-hadith -- --collection bukhari --all');
    console.error('  npm run import-hadith -- --collection muslim --introduction --start 8 --end 14');
    console.error('\nOptions:');
    console.error('  --collection    Collection name (bukhari, muslim, nasai, tirmidhi, abudawud, ibnmajah)');
    console.error('  --start        Starting hadith number (default: 1)');
    console.error('  --end          Ending hadith number');
    console.error('  --all          Import all hadith (uses known collection limits)');
    console.error('  --no-skip      Don\'t skip existing hadith');
    console.error('  --batch-size   Batch size for transactions (default: 10)');
    console.error('  --delay        Delay between requests in ms (default: 1000)');
    console.error('  --introduction Import introduction narrations instead of regular hadith');
    process.exit(1);
  }

  // Run import
  importHadithBatch(options as ImportOptions)
    .then((result) => {
      if (result.failed > 0) {
        process.exit(1);
      }
    })
    .catch((error) => {
      console.error('Fatal error:', error);
      process.exit(1);
    });
}

