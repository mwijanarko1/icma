-- ICMA Narrator Database Schema
-- Designed for Shamela biographical data

-- Core narrators table
CREATE TABLE narrators (
  id TEXT PRIMARY KEY, -- Unique identifier (e.g., 'humaydi-abdullah-zubayr')
  primary_arabic_name TEXT NOT NULL, -- Main Arabic name
  primary_english_name TEXT NOT NULL, -- Main English name
  full_name_arabic TEXT, -- Complete name with lineage
  full_name_english TEXT, -- Complete English name
  title TEXT, -- E.g., "Al-Hafiz", "Al-Imam"
  kunya TEXT, -- E.g., "Abu Bakr"
  lineage TEXT, -- E.g., "Al-Qurashi, Al-Asadi, Al-Humaydi, Al-Makki"
  
  -- Dates (AH = Anno Hegirae, CE = Common Era)
  birth_year_ah INTEGER,
  death_year_ah INTEGER,
  death_year_ah_alternative INTEGER, -- For cases like "219 or 220 AH"
  birth_year_ce INTEGER,
  death_year_ce INTEGER,
  
  -- Locations
  place_of_residence TEXT,
  place_of_death TEXT,
  places_traveled TEXT, -- JSON array of places
  
  -- Categories and ranks
  taqrib_category TEXT, -- E.g., "Tenth"
  ibn_hajar_rank TEXT, -- E.g., "Trustworthy, Hafiz, Faqih"
  dhahabi_rank TEXT, -- E.g., "One of the prominent figures"
  
  -- Metadata
  notes TEXT, -- General notes
  sources TEXT, -- JSON array of source references
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  -- Full-text search support
  search_text TEXT -- Concatenated searchable text
);

-- Alternate names and name variations
CREATE TABLE narrator_names (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  narrator_id TEXT NOT NULL,
  arabic_name TEXT NOT NULL,
  english_name TEXT,
  name_type TEXT DEFAULT 'alternate', -- 'alternate', 'nickname', 'kunya', 'title'
  is_primary BOOLEAN DEFAULT 0,
  FOREIGN KEY (narrator_id) REFERENCES narrators(id) ON DELETE CASCADE
);

-- Lineage information (detailed breakdown)
CREATE TABLE narrator_lineage (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  narrator_id TEXT NOT NULL,
  lineage_type TEXT NOT NULL, -- 'tribal', 'geographical', 'honorific'
  lineage_value TEXT NOT NULL, -- E.g., "Al-Qurashi", "Al-Makki"
  FOREIGN KEY (narrator_id) REFERENCES narrators(id) ON DELETE CASCADE
);

-- Relationships between narrators
CREATE TABLE narrator_relationships (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  narrator_id TEXT NOT NULL,
  related_narrator_id TEXT NOT NULL,
  relationship_type TEXT NOT NULL, -- 'teacher', 'student', 'companion', 'contemporary', 'companion_of'
  relationship_description TEXT, -- Additional details
  duration_years INTEGER, -- E.g., "accompanied for 20 years"
  FOREIGN KEY (narrator_id) REFERENCES narrators(id) ON DELETE CASCADE,
  FOREIGN KEY (related_narrator_id) REFERENCES narrators(id) ON DELETE CASCADE,
  UNIQUE(narrator_id, related_narrator_id, relationship_type)
);

-- Scholarly opinions (Al-Jarh wa al-Ta'dil)
CREATE TABLE scholarly_opinions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  narrator_id TEXT NOT NULL,
  scholar_name TEXT NOT NULL, -- E.g., "Abu Hatim al-Razi", "Ahmad ibn Hanbal"
  opinion_text TEXT NOT NULL, -- The actual quote/opinion
  source_reference TEXT, -- E.g., "Al-Jarh wa al-Ta'dil by Ibn Abi Hatim (5/56)"
  source_book TEXT, -- E.g., "Tahdhib al-Tahdhib"
  source_volume TEXT, -- E.g., "2/334"
  opinion_type TEXT, -- 'jarh' (criticism), 'ta'dil' (veneration), 'neutral'
  is_primary BOOLEAN DEFAULT 0, -- Primary opinion vs supporting quote
  FOREIGN KEY (narrator_id) REFERENCES narrators(id) ON DELETE CASCADE
);

-- Reputation grades (mapped to existing system)
CREATE TABLE narrator_reputation (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  narrator_id TEXT NOT NULL,
  grade TEXT NOT NULL, -- E.g., "Thiqah", "Saduq", "Thiqah Thabt"
  grade_source TEXT, -- Which scholar/source gave this grade
  FOREIGN KEY (narrator_id) REFERENCES narrators(id) ON DELETE CASCADE
);

-- Indexes for performance
CREATE INDEX idx_narrator_arabic_name ON narrators(primary_arabic_name);
CREATE INDEX idx_narrator_english_name ON narrators(primary_english_name);
CREATE INDEX idx_narrator_death_year ON narrators(death_year_ah);
CREATE INDEX idx_narrator_birth_year ON narrators(birth_year_ah);
CREATE INDEX idx_narrator_lineage ON narrator_lineage(lineage_value);
CREATE INDEX idx_narrator_names ON narrator_names(arabic_name);
CREATE INDEX idx_narrator_relationships ON narrator_relationships(narrator_id, relationship_type);
CREATE INDEX idx_scholarly_opinions ON scholarly_opinions(narrator_id, scholar_name);

-- Composite indexes for better search performance
CREATE INDEX idx_narrator_names_composite ON narrator_names(narrator_id, arabic_name);
CREATE INDEX idx_narrator_death_years ON narrators(death_year_ah, death_year_ah_alternative);
CREATE INDEX idx_narrator_search_names ON narrators(primary_arabic_name, primary_english_name, full_name_arabic);

-- Full-text search index (if using FTS5)
CREATE VIRTUAL TABLE narrators_fts USING fts5(
  primary_arabic_name,
  primary_english_name,
  full_name_arabic,
  full_name_english,
  title,
  kunya,
  lineage,
  content='narrators',
  content_rowid='rowid'
);

-- Trigger to update search_text
CREATE TRIGGER update_narrator_search_text 
AFTER INSERT ON narrators
BEGIN
  UPDATE narrators 
  SET search_text = 
    COALESCE(primary_arabic_name, '') || ' ' ||
    COALESCE(primary_english_name, '') || ' ' ||
    COALESCE(full_name_arabic, '') || ' ' ||
    COALESCE(full_name_english, '') || ' ' ||
    COALESCE(title, '') || ' ' ||
    COALESCE(kunya, '') || ' ' ||
    COALESCE(lineage, '')
  WHERE id = NEW.id;
END;

CREATE TRIGGER update_narrator_search_text_on_update 
AFTER UPDATE ON narrators
BEGIN
  UPDATE narrators 
  SET search_text = 
    COALESCE(primary_arabic_name, '') || ' ' ||
    COALESCE(primary_english_name, '') || ' ' ||
    COALESCE(full_name_arabic, '') || ' ' ||
    COALESCE(full_name_english, '') || ' ' ||
    COALESCE(title, '') || ' ' ||
    COALESCE(kunya, '') || ' ' ||
    COALESCE(lineage, '')
  WHERE id = NEW.id;
END;

-- View for easy narrator lookup (combines main data with relationships)
CREATE VIEW narrator_details AS
SELECT 
  n.*,
  GROUP_CONCAT(DISTINCT nn.arabic_name) as all_arabic_names,
  GROUP_CONCAT(DISTINCT nl.lineage_value) as all_lineages,
  COUNT(DISTINCT rel.id) as relationship_count
FROM narrators n
LEFT JOIN narrator_names nn ON n.id = nn.narrator_id
LEFT JOIN narrator_lineage nl ON n.id = nl.narrator_id
LEFT JOIN narrator_relationships rel ON n.id = rel.narrator_id
GROUP BY n.id;

