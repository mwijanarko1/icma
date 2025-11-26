/**
 * Migration script to update the Muslim database to support sub-versions
 */

import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

function migrateDatabase(dbPath: string, collectionName: string, hasSubVersions: boolean = false) {
  console.log(`Starting ${collectionName} database migration...`);

  // Check if database exists
  if (!fs.existsSync(dbPath)) {
    console.log(`${collectionName} database does not exist, nothing to migrate.`);
    return;
  }

  const db = new Database(dbPath);

  try {
    // Check current schema
    const tableInfo = db.prepare("PRAGMA table_info(hadith)").all();
    const hasSubVersion = tableInfo.some((col: any) => col.name === 'sub_version');

    if (hasSubVersion) {
      console.log('Database already has sub_version column, skipping migration.');
      return;
    }

    console.log('Migrating database schema...');

    // For collections without sub-versions (like Bukhari), just add the column
    if (!hasSubVersions) {
      db.exec(`
        ALTER TABLE hadith ADD COLUMN sub_version TEXT;
        CREATE INDEX idx_hadith_sub_version ON hadith(sub_version);
      `);
      console.log('Migration completed successfully!');
      return;
    }

    // For collections with sub-versions (like Muslim), do full migration
    // Create new table with updated schema
    db.exec(`
      CREATE TABLE hadith_new (
        hadith_number INTEGER NOT NULL,
        sub_version TEXT,
        reference TEXT NOT NULL,
        english_narrator TEXT,
        english_translation TEXT NOT NULL,
        arabic_text TEXT NOT NULL,
        in_book_reference TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        search_text TEXT,
        PRIMARY KEY (hadith_number, sub_version)
      );
    `);

    // Copy data, extracting sub_version from reference
    const rows = db.prepare('SELECT * FROM hadith').all() as any[];

    const insert = db.prepare(`
      INSERT INTO hadith_new (
        hadith_number,
        sub_version,
        reference,
        english_narrator,
        english_translation,
        arabic_text,
        in_book_reference,
        created_at,
        updated_at,
        search_text
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    for (const row of rows) {
      // Extract sub-version from reference (e.g., "Sahih Muslim 8 a" -> "a")
      let subVersion = null;
      const referenceMatch = row.reference.match(/(\d+)\s*([a-z])$/i);
      if (referenceMatch) {
        subVersion = referenceMatch[2].toLowerCase();
      }

      insert.run(
        row.hadith_number,
        subVersion,
        row.reference,
        row.english_narrator,
        row.english_translation,
        row.arabic_text,
        row.in_book_reference,
        row.created_at,
        row.updated_at,
        row.search_text
      );
    }

    // Replace old table with new one
    db.exec(`
      DROP TABLE hadith;
      ALTER TABLE hadith_new RENAME TO hadith;
    `);

    // Recreate indexes
    db.exec(`
      CREATE INDEX idx_hadith_reference ON hadith(reference);
      CREATE INDEX idx_hadith_number ON hadith(hadith_number);
      CREATE INDEX idx_hadith_sub_version ON hadith(sub_version);
      CREATE INDEX idx_hadith_english_narrator ON hadith(english_narrator);
      CREATE INDEX idx_hadith_in_book_reference ON hadith(in_book_reference);
    `);

    // Recreate FTS table
    db.exec(`
      DROP TABLE IF EXISTS hadith_fts;
      CREATE VIRTUAL TABLE hadith_fts USING fts5(
        reference,
        english_narrator,
        english_translation,
        arabic_text,
        in_book_reference,
        content='hadith',
        content_rowid='rowid'
      );
    `);

    // Populate FTS table
    db.exec(`
      INSERT INTO hadith_fts(rowid, reference, english_narrator, english_translation, arabic_text, in_book_reference)
      SELECT rowid, reference, english_narrator, english_translation, arabic_text, in_book_reference FROM hadith;
    `);

    // Recreate triggers
    db.exec(`
      DROP TRIGGER IF EXISTS update_hadith_search_text;
      DROP TRIGGER IF EXISTS update_hadith_search_text_on_update;

      CREATE TRIGGER update_hadith_search_text
      AFTER INSERT ON hadith
      BEGIN
        UPDATE hadith
        SET search_text =
          COALESCE(reference, '') || ' ' ||
          COALESCE(english_narrator, '') || ' ' ||
          COALESCE(english_translation, '') || ' ' ||
          COALESCE(arabic_text, '') || ' ' ||
          COALESCE(in_book_reference, '')
        WHERE hadith_number = NEW.hadith_number AND sub_version = NEW.sub_version;
      END;

      CREATE TRIGGER update_hadith_search_text_on_update
      AFTER UPDATE ON hadith
      BEGIN
        UPDATE hadith
        SET search_text =
          COALESCE(reference, '') || ' ' ||
          COALESCE(english_narrator, '') || ' ' ||
          COALESCE(english_translation, '') || ' ' ||
          COALESCE(arabic_text, '') || ' ' ||
          COALESCE(in_book_reference, '')
        WHERE hadith_number = NEW.hadith_number AND sub_version = NEW.sub_version;
      END;
    `);

    console.log('Migration completed successfully!');

    // Show some stats
    const stats = db.prepare(`
      SELECT
        COUNT(*) as total_hadith,
        COUNT(DISTINCT hadith_number) as unique_numbers,
        COUNT(sub_version) as with_sub_versions,
        COUNT(CASE WHEN sub_version IS NOT NULL THEN 1 END) as total_versions
      FROM hadith
    `).get() as any;

    console.log('\nMigration stats:');
    console.log(`  Total hadith records: ${stats.total_hadith}`);
    console.log(`  Unique hadith numbers: ${stats.unique_numbers}`);
    console.log(`  Records with sub-versions: ${stats.with_sub_versions}`);

  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
  } finally {
    db.close();
  }
}

function migrateMuslimDatabase() {
  const MUSLIM_DB_PATH = path.join(process.cwd(), 'data', 'muslim.db');
  migrateDatabase(MUSLIM_DB_PATH, 'Muslim', true);
}

function migrateBukhariDatabase() {
  const BUKHARI_DB_PATH = path.join(process.cwd(), 'data', 'bukhari.db');
  migrateDatabase(BUKHARI_DB_PATH, 'Bukhari', false);
}

function migrateAllDatabases() {
  migrateBukhariDatabase();
  migrateMuslimDatabase();
}

// Run migration if called directly
if (require.main === module) {
  const args = process.argv.slice(2);
  const collection = args[0];

  try {
    if (collection === 'bukhari') {
      migrateBukhariDatabase();
    } else if (collection === 'muslim') {
      migrateMuslimDatabase();
    } else {
      migrateAllDatabases();
    }
    console.log('Migration script completed.');
  } catch (error) {
    console.error('Migration script failed:', error);
    process.exit(1);
  }
}

export { migrateMuslimDatabase };
