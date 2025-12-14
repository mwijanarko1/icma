// Database connection and utilities
import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const DB_PATH = path.join(process.cwd(), 'data', 'narrators.db');
const SCHEMA_PATH = path.join(process.cwd(), 'data', 'schema.sql');

console.log(`[NARRATORS_DB_DEBUG] DB_PATH=${DB_PATH}, SCHEMA_PATH=${SCHEMA_PATH}`);

// Initialize database connection
export function getDatabase(): Database.Database {
  console.log(`[NARRATORS_DB_DEBUG] getDatabase: Starting connection attempt`);

  // Ensure data directory exists
  const dataDir = path.dirname(DB_PATH);
  console.log(`[NARRATORS_DB_DEBUG] getDatabase: dataDir=${dataDir}, exists=${fs.existsSync(dataDir)}`);

  if (!fs.existsSync(dataDir)) {
    console.log(`[NARRATORS_DB_DEBUG] getDatabase: Creating data directory`);
    fs.mkdirSync(dataDir, { recursive: true });
  }

  console.log(`[NARRATORS_DB_DEBUG] getDatabase: Opening database connection`);
  const db = new Database(DB_PATH);
  console.log(`[NARRATORS_DB_DEBUG] getDatabase: Database connection opened successfully`);

  // Enable foreign keys
  db.pragma('foreign_keys = ON');
  console.log(`[NARRATORS_DB_DEBUG] getDatabase: Foreign keys enabled`);

  // Create tables if they don't exist
  const hasNarratorsTable = tableExists(db, 'narrators');
  console.log(`[NARRATORS_DB_DEBUG] getDatabase: narrators table exists=${hasNarratorsTable}`);

  if (!hasNarratorsTable) {
    console.log(`[NARRATORS_DB_DEBUG] getDatabase: Initializing database`);
    initializeDatabase(db);
    console.log(`[NARRATORS_DB_DEBUG] getDatabase: Database initialized`);
  }

  return db;
}

// Check if a table exists
function tableExists(db: Database.Database, tableName: string): boolean {
  console.log(`[NARRATORS_DB_DEBUG] tableExists: Checking for table=${tableName}`);
  try {
    const result = db.prepare(`
      SELECT name FROM sqlite_master
      WHERE type='table' AND name=?
    `).get(tableName);
    const exists = !!result;
    console.log(`[NARRATORS_DB_DEBUG] tableExists: table=${tableName}, exists=${exists}`);
    return exists;
  } catch (error) {
    console.error(`[NARRATORS_DB_DEBUG] tableExists: Error checking table=${tableName}:`, error);
    return false;
  }
}

// Initialize database from schema
function initializeDatabase(db: Database.Database): void {
  console.log(`[NARRATORS_DB_DEBUG] initializeDatabase: SCHEMA_PATH=${SCHEMA_PATH}`);
  const schemaExists = fs.existsSync(SCHEMA_PATH);
  console.log(`[NARRATORS_DB_DEBUG] initializeDatabase: Schema file exists=${schemaExists}`);

  if (schemaExists) {
    console.log(`[NARRATORS_DB_DEBUG] initializeDatabase: Reading schema file`);
    const schema = fs.readFileSync(SCHEMA_PATH, 'utf-8');
    console.log(`[NARRATORS_DB_DEBUG] initializeDatabase: Schema length=${schema.length}`);
    console.log(`[NARRATORS_DB_DEBUG] initializeDatabase: Executing schema`);
    db.exec(schema);
    console.log(`[NARRATORS_DB_DEBUG] initializeDatabase: Schema executed successfully`);
  } else {
    const error = `Schema file not found at ${SCHEMA_PATH}`;
    console.error(`[NARRATORS_DB_DEBUG] initializeDatabase: ${error}`);
    throw new Error(error);
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
  console.log(`[NARRATORS_DB_DEBUG] withDatabase: Starting`);
  let db: Database.Database | null = null;
  try {
    console.log(`[NARRATORS_DB_DEBUG] withDatabase: Getting database connection`);
    db = getDatabase();
    console.log(`[NARRATORS_DB_DEBUG] withDatabase: Executing callback`);
    const result = callback(db);
    console.log(`[NARRATORS_DB_DEBUG] withDatabase: Callback completed successfully`);
    return result;
  } catch (error) {
    console.error(`[NARRATORS_DB_DEBUG] withDatabase: Error in callback:`, error);
    throw error;
  } finally {
    if (db) {
      console.log(`[NARRATORS_DB_DEBUG] withDatabase: Closing database connection`);
      closeDatabase(db);
      console.log(`[NARRATORS_DB_DEBUG] withDatabase: Database connection closed`);
    }
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

