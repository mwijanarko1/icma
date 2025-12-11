-- ICMA Hadith Database Schema
-- Schema for storing hadith from sunnah.com collections

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

-- Indexes for performance
CREATE INDEX idx_hadith_reference ON hadith(reference);
CREATE INDEX idx_hadith_number ON hadith(hadith_number);
CREATE INDEX idx_hadith_sub_version ON hadith(sub_version);
CREATE INDEX idx_hadith_english_narrator ON hadith(english_narrator);
CREATE INDEX idx_hadith_in_book_reference ON hadith(in_book_reference);

-- Composite indexes for better query performance
CREATE INDEX idx_hadith_number_sub_version ON hadith(hadith_number, sub_version);
CREATE INDEX idx_hadith_number_reference ON hadith(hadith_number, reference);
CREATE INDEX idx_hadith_search_fields ON hadith(english_translation, arabic_text, reference, english_narrator);

-- Full-text search index (if using FTS5)
CREATE VIRTUAL TABLE hadith_fts USING fts5(
  reference,
  english_narrator,
  english_translation,
  arabic_text,
  in_book_reference,
  content='hadith',
  content_rowid='rowid'
);

-- Trigger to update search_text
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

