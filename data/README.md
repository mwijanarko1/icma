# Narrator Database System

This directory contains the SQLite database system for storing and querying narrator biographical data from Shamela.

## Structure

```
data/
├── schema.sql          # Database schema definition
├── db.ts              # Database connection and utilities
├── types.ts           # TypeScript type definitions
├── import-shamela.ts  # Import utilities for Shamela format
├── narrators.db       # SQLite database file (created on first use)
└── README.md          # This file
```

## Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Database will be created automatically** when you first use it. The schema will be initialized from `schema.sql`.

## Database Schema

The database uses a normalized structure with the following main tables:

- **narrators**: Core narrator information (includes primary Arabic and English names)
- **narrator_lineage**: Detailed lineage breakdown
- **narrator_relationships**: Teacher-student and other relationships
- **scholarly_opinions**: Al-Jarh wa al-Ta'dil entries

## Usage

### Importing Shamela Data

```typescript
import { importShamelaNarrator } from '@/data/import-shamela';
import { convertShamelaExample } from '@/data/import-shamela';

const entry = convertShamelaExample(); // Your Shamela format entry
const result = importShamelaNarrator(entry);

if (result.success) {
  console.log(`Imported narrator: ${result.narratorId}`);
} else {
  console.error(`Import failed: ${result.error}`);
}
```

### Querying Narrators

#### Search by name:
```
GET /api/narrators?query=حميدي
GET /api/narrators?arabicName=الحميدي
GET /api/narrators?englishName=Humaydi
```

#### Filter by death year:
```
GET /api/narrators?deathYearAH=219
```

#### Get specific narrator:
```
GET /api/narrators/[id]
```

Returns full details including:
- Alternate names
- Lineage information
- Relationships
- Scholarly opinions
- Reputation grades

### Direct Database Access

```typescript
import { withDatabase } from '@/data/db';

const narrators = withDatabase((db) => {
  return db.prepare('SELECT * FROM narrators LIMIT 10').all();
});
```

## Shamela Data Format

The import system expects data in this format:

```typescript
{
  name: {
    arabic: "عبد الله بن الزبير",
    english: "Abdullah ibn al-Zubayr",
    full: "Full name with lineage..."
  },
  title: "Al-Hafiz",
  kunya: "Abu Bakr",
  lineage: ["Al-Qurashi", "Al-Asadi", "Al-Makki"],
  placeOfResidence: "Mecca",
  deathDate: {
    yearAH: 219,
    alternativeYearAH: 220,
    place: "Mecca"
  },
  relationships: [
    {
      type: "companion_of",
      narrators: ["Ibn Uyaynah"],
      duration: 20
    }
  ],
  scholarlyOpinions: [
    {
      scholar: "Abu Hatim al-Razi",
      opinion: "Trustworthy, an Imam",
      source: "Al-Jarh wa al-Ta'dil (5/56)",
      type: "ta'dil"
    }
  ]
}
```

## Database Location

The database file is stored at:
- **Development**: `data/narrators.db` (relative to project root)
- **Production**: Same location (ensure write permissions)

## Backup

To backup the database:
```bash
cp data/narrators.db data/narrators.db.backup
```

## Migration

The schema is automatically created on first use. For future schema changes:

1. Create a migration SQL file
2. Update the initialization in `db.ts`
3. Run migrations on existing databases

## Performance

- Indexes are created on frequently queried fields
- Full-text search is available via FTS5
- Query optimization for large datasets (10,000+ narrators)

## Notes

- The database uses foreign keys for data integrity
- All dates support both AH and CE formats
- Alternate dates (e.g., "219 or 220 AH") are supported
- Scholarly opinions are stored with full source citations

