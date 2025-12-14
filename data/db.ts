// Database connection and utilities
import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const DB_PATH = path.join(process.cwd(), 'data', 'narrators.db');
const SCHEMA_PATH = path.join(process.cwd(), 'data', 'schema.sql');

// Initialize database connection
export function getDatabase(): Database.Database {
  // Ensure data directory exists
  const dataDir = path.dirname(DB_PATH);
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  const db = new Database(DB_PATH);

  // Enable foreign keys
  db.pragma('foreign_keys = ON');

  // Create tables if they don't exist
  if (!tableExists(db, 'narrators')) {
    initializeDatabase(db);
  }

  return db;
}

// Check if a table exists
function tableExists(db: Database.Database, tableName: string): boolean {
  const result = db.prepare(`
    SELECT name FROM sqlite_master
    WHERE type='table' AND name=?
  `).get(tableName);
  return !!result;
}

// Initialize database from schema
function initializeDatabase(db: Database.Database): void {
  if (fs.existsSync(SCHEMA_PATH)) {
    const schema = fs.readFileSync(SCHEMA_PATH, 'utf-8');
    db.exec(schema);
  } else {
    throw new Error(`Schema file not found at ${SCHEMA_PATH}`);
  }
}

// Close database connection
export function closeDatabase(db: Database.Database): void {
  db.close();
}

// Utility to safely execute queries
export function withDatabase<T>(
  callback: (db: Database.Database) => T
): T {
  const db = getDatabase();
  try {
    return callback(db);
  } finally {
    closeDatabase(db);
  }
}

// Helper to convert date from AH to CE
export function hijriToCE(hijriYear: number): number {
  // Simple conversion: Hijri year + 621.5 approximately
  // More accurate: use a proper conversion library
  return Math.round(hijriYear + 621.5);
}

// Helper to generate narrator ID from name
// Uses full name, lineage, and Shamela ID to ensure uniqueness
export function generateNarratorId(
  arabicName: string, 
  englishName: string,
  fullArabicName?: string | null,
  lineage?: string | string[] | null,
  shamelaId?: number | null
): string {
  // Use full name if available, otherwise use the provided name
  const fullName = fullArabicName || arabicName;
  
  // Combine full name with lineage for maximum uniqueness
  const lineageString = Array.isArray(lineage) 
    ? lineage.join(' ') 
    : (lineage || '');
  
  // Include Shamela ID if available to guarantee uniqueness
  const shamelaIdStr = shamelaId ? `shamela-${shamelaId}` : '';
  
  // Create a unique string from full name + lineage + Shamela ID
  const uniqueString = `${fullName} ${lineageString} ${shamelaIdStr}`.trim();
  
  // Generate a hash from the entire unique string
  const hash = Buffer.from(uniqueString).toString('base64')
    .substring(0, 12)
    .replace(/[^a-zA-Z0-9]/g, '');
  
  // Create a URL-friendly base from English name (first part only for readability)
  const nameParts = (englishName || arabicName).toLowerCase().split(/\s+/);
  const baseName = nameParts[0]
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .substring(0, 20); // Limit length
  
  // If we have a Shamela ID, include it in the ID for guaranteed uniqueness
  if (shamelaId) {
    return `${baseName}-${shamelaId}-${hash}`;
  }
  
  return `${baseName}-${hash}`;
}

