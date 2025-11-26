# Hadith Database System

This directory contains the SQLite database system for storing hadith from sunnah.com collections.

## Structure

```
data/
├── hadith-schema.sql    # Database schema definition
├── hadith-db.ts         # Database connection and utilities
├── import-hadith.ts     # Import script for populating databases
├── bukhari.db           # SQLite database for Sahih al-Bukhari (created on first use)
├── muslim.db            # SQLite database for Sahih Muslim
├── nasai.db             # SQLite database for Sunan an-Nasa'i
├── tirmidhi.db          # SQLite database for Jami` at-Tirmidhi
├── abudawud.db          # SQLite database for Sunan Abi Dawud
├── ibnmajah.db          # SQLite database for Sunan Ibn Majah
└── HADITH-README.md     # This file
```

## Supported Collections

- **bukhari** - Sahih al-Bukhari
- **muslim** - Sahih Muslim
- **nasai** - Sunan an-Nasa'i
- **tirmidhi** - Jami` at-Tirmidhi
- **abudawud** - Sunan Abi Dawud
- **ibnmajah** - Sunan Ibn Majah

## Database Schema

Each collection has its own database file with the following schema:

- **hadith_number** (INTEGER PRIMARY KEY) - The hadith number
- **reference** (TEXT) - Full reference (e.g., "Sahih al-Bukhari 4275")
- **english_narrator** (TEXT) - English narrator name (optional)
- **english_translation** (TEXT) - English translation
- **arabic_text** (TEXT) - Arabic text (may include sanad and matn combined)
- **in_book_reference** (TEXT) - In-book reference (optional)
- **created_at** (DATETIME) - Creation timestamp
- **updated_at** (DATETIME) - Last update timestamp
- **search_text** (TEXT) - Full-text search index

## Usage

### Importing Hadith

Import hadith from sunnah.com into the databases:

```bash
# Import a range of hadith
npm run import-hadith -- --collection bukhari --start 1 --end 100

# Import all hadith (uses known collection limits)
npm run import-hadith -- --collection bukhari --all

# Import with custom delay between requests
npm run import-hadith -- --collection muslim --start 1 --end 50 --delay 2000

# Don't skip existing hadith (re-import)
npm run import-hadith -- --collection bukhari --start 1 --end 100 --no-skip
```

### Options

- `--collection` (required) - Collection name: bukhari, muslim, nasai, tirmidhi, abudawud, ibnmajah
- `--start` - Starting hadith number (default: 1)
- `--end` - Ending hadith number
- `--all` - Import all hadith (uses known collection limits)
- `--no-skip` - Don't skip existing hadith (re-import)
- `--batch-size` - Batch size for transactions (default: 10)
- `--delay` - Delay between requests in milliseconds (default: 1000)

### Known Collection Limits

The script uses these approximate limits when using `--all`:

- **bukhari**: 7,563 hadith
- **muslim**: 3,033 hadith
- **nasai**: 5,758 hadith
- **tirmidhi**: 3,956 hadith
- **abudawud**: 5,274 hadith
- **ibnmajah**: 4,341 hadith

### Programmatic Usage

```typescript
import { withHadithDatabase, getHadithCount } from '@/data/hadith-db';

// Get hadith count
const count = await getHadithCount('bukhari');

// Query hadith
await withHadithDatabase('bukhari', (db) => {
  const hadith = db.prepare('SELECT * FROM hadith WHERE hadith_number = ?').get(4275);
  return hadith;
});
```

## Database Location

Database files are stored at:
- **Development**: `data/{collection}.db` (relative to project root)
- **Production**: Same location (ensure write permissions)

## Backup

To backup a database:
```bash
cp data/bukhari.db data/bukhari.db.backup
```

## Notes

- The import script includes a 1-second delay between requests by default to be respectful to sunnah.com
- Existing hadith are skipped by default (use `--no-skip` to re-import)
- The script will create the database and schema automatically on first use
- Full-text search is available via FTS5 virtual table

