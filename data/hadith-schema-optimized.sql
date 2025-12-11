-- ICMA Hadith Database Schema - Optimized
-- Enhanced schema with better indexing for performance

-- Core hadith table
CREATE TABLE hadith (
  hadith_number INTEGER NOT NULL, -- The base hadith number (e.g., 1, 8, 4275)
  sub_version TEXT, -- Sub-version letter (e.g., 'a', 'b', 'c') or NULL for no sub-version
  reference TEXT NOT NULL, -- Full reference (e.g., "Sahih al-Bukhari 4275", "Sahih Muslim 8a")
  english_narrator TEXT, -- English narrator name (e.g., "Narrated Ubaidullah bin `Abdullah bin `Utba:")
  english_translation TEXT NOT NULL, -- English translation of the hadith
  arabic_text TEXT NOT NULL, -- Arabic text (may include sanad and matn combined)
  in_book_reference TEXT, -- In-book reference (e.g., "Book 64, Hadith 309")

  -- Metadata
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,

  -- Full-text search support
  search_text TEXT, -- Concatenated searchable text

  PRIMARY KEY (hadith_number, sub_version)
);

-- Optimized indexes for better query performance
-- Primary lookup indexes
CREATE INDEX idx_hadith_number ON hadith(hadith_number);
CREATE INDEX idx_hadith_sub_version ON hadith(sub_version);
CREATE INDEX idx_hadith_reference ON hadith(reference);

-- Range query optimization
CREATE INDEX idx_hadith_number_range ON hadith(hadith_number) WHERE hadith_number IS NOT NULL;

-- Composite indexes for common query patterns
CREATE INDEX idx_hadith_number_sub_version ON hadith(hadith_number, sub_version);
CREATE INDEX idx_hadith_number_sub_version_range ON hadith(hadith_number, sub_version) WHERE hadith_number IS NOT NULL;

-- Search optimization indexes
CREATE INDEX idx_hadith_english_narrator ON hadith(english_narrator) WHERE english_narrator IS NOT NULL;
CREATE INDEX idx_hadith_in_book_reference ON hadith(in_book_reference) WHERE in_book_reference IS NOT NULL;

-- Partial indexes for specific collections (can be created per database if needed)
-- CREATE INDEX idx_hadith_bukhari_range ON hadith(hadith_number, sub_version) WHERE reference LIKE 'Sahih al-Bukhari%';

-- Full-text search with optimized tokenizer
CREATE VIRTUAL TABLE hadith_fts USING fts5(
  reference UNINDEXED,
  english_narrator UNINDEXED,
  english_translation,
  arabic_text,
  in_book_reference UNINDEXED,
  content='hadith',
  content_rowid='rowid',
  tokenize='porter ascii' -- Use Porter stemmer for better English search
);

-- FTS5 optimization triggers
CREATE TRIGGER hadith_fts_insert AFTER INSERT ON hadith
BEGIN
  INSERT INTO hadith_fts(rowid, reference, english_narrator, english_translation, arabic_text, in_book_reference)
  VALUES (new.rowid, new.reference, new.english_narrator, new.english_translation, new.arabic_text, new.in_book_reference);
END;

CREATE TRIGGER hadith_fts_delete AFTER DELETE ON hadith
BEGIN
  DELETE FROM hadith_fts WHERE rowid = old.rowid;
END;

CREATE TRIGGER hadith_fts_update AFTER UPDATE ON hadith
BEGIN
  UPDATE hadith_fts SET
    reference = new.reference,
    english_narrator = new.english_narrator,
    english_translation = new.english_translation,
    arabic_text = new.arabic_text,
    in_book_reference = new.in_book_reference
  WHERE rowid = new.rowid;
END;

-- Search text concatenation trigger (optimized)
CREATE TRIGGER update_hadith_search_text
AFTER INSERT ON hadith
BEGIN
  UPDATE hadith
  SET search_text =
    CASE
      WHEN NEW.reference IS NOT NULL THEN NEW.reference || ' '
      ELSE ''
    END ||
    CASE
      WHEN NEW.english_narrator IS NOT NULL THEN NEW.english_narrator || ' '
      ELSE ''
    END ||
    CASE
      WHEN NEW.english_translation IS NOT NULL THEN NEW.english_translation || ' '
      ELSE ''
    END ||
    CASE
      WHEN NEW.arabic_text IS NOT NULL THEN NEW.arabic_text || ' '
      ELSE ''
    END ||
    CASE
      WHEN NEW.in_book_reference IS NOT NULL THEN NEW.in_book_reference
      ELSE ''
    END
  WHERE hadith_number = NEW.hadith_number AND (sub_version = NEW.sub_version OR (sub_version IS NULL AND NEW.sub_version IS NULL));
END;

CREATE TRIGGER update_hadith_search_text_on_update
AFTER UPDATE ON hadith
BEGIN
  UPDATE hadith
  SET search_text =
    CASE
      WHEN NEW.reference IS NOT NULL THEN NEW.reference || ' '
      ELSE ''
    END ||
    CASE
      WHEN NEW.english_narrator IS NOT NULL THEN NEW.english_narrator || ' '
      ELSE ''
    END ||
    CASE
      WHEN NEW.english_translation IS NOT NULL THEN NEW.english_translation || ' '
      ELSE ''
    END ||
    CASE
      WHEN NEW.arabic_text IS NOT NULL THEN NEW.arabic_text || ' '
      ELSE ''
    END ||
    CASE
      WHEN NEW.in_book_reference IS NOT NULL THEN NEW.in_book_reference
      ELSE ''
    END
  WHERE hadith_number = NEW.hadith_number AND (sub_version = NEW.sub_version OR (sub_version IS NULL AND NEW.sub_version IS NULL));
END;

-- Query optimization pragmas (to be set at runtime)
-- PRAGMA cache_size = -2000; -- Use 2MB cache
-- PRAGMA temp_store = memory; -- Store temp tables in memory
-- PRAGMA mmap_size = 268435456; -- 256MB memory map
-- PRAGMA synchronous = NORMAL; -- Balance performance and safety