// Database connection and utilities for hadith collections
import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

// Collection names
export const HADITH_COLLECTIONS = [
  'bukhari',
  'muslim',
  'nasai',
  'tirmidhi',
  'abudawud',
  'ibnmajah',
] as const;

export type HadithCollection = typeof HADITH_COLLECTIONS[number];

const SCHEMA_PATH = path.join(process.cwd(), 'data', 'hadith-schema.sql');

/**
 * Get the database path for a specific collection
 */
export function getHadithDbPath(collection: HadithCollection): string {
  const cwd = process.cwd();
  const dbPath = path.join(cwd, 'data', `${collection}.db`);
  console.log(`[HADITH_DB_DEBUG] getHadithDbPath: collection=${collection}, cwd=${cwd}, dbPath=${dbPath}`);

  // Check if file exists
  const exists = fs.existsSync(dbPath);
  console.log(`[HADITH_DB_DEBUG] Database file exists: ${exists}, path=${dbPath}`);

  return dbPath;
}

/**
 * Get database connection for a specific hadith collection
 */
export function getHadithDatabase(collection: HadithCollection): Database.Database {
  console.log(`[HADITH_DB_DEBUG] getHadithDatabase: Attempting to connect to collection=${collection}`);

  const dbPath = getHadithDbPath(collection);
  console.log(`[HADITH_DB_DEBUG] getHadithDatabase: dbPath=${dbPath}`);

  // Ensure data directory exists
  const dataDir = path.dirname(dbPath);
  console.log(`[HADITH_DB_DEBUG] getHadithDatabase: dataDir=${dataDir}, exists=${fs.existsSync(dataDir)}`);

  if (!fs.existsSync(dataDir)) {
    console.log(`[HADITH_DB_DEBUG] getHadithDatabase: Creating data directory`);
    fs.mkdirSync(dataDir, { recursive: true });
  }

  console.log(`[HADITH_DB_DEBUG] getHadithDatabase: Opening database connection`);
  const db = new Database(dbPath);
  console.log(`[HADITH_DB_DEBUG] getHadithDatabase: Database connection opened successfully`);

  // Enable foreign keys
  db.pragma('foreign_keys = ON');
  console.log(`[HADITH_DB_DEBUG] getHadithDatabase: Foreign keys enabled`);

  // Create tables if they don't exist
  const hasHadithTable = tableExists(db, 'hadith');
  console.log(`[HADITH_DB_DEBUG] getHadithDatabase: hadith table exists=${hasHadithTable}`);

  if (!hasHadithTable) {
    console.log(`[HADITH_DB_DEBUG] getHadithDatabase: Initializing database`);
    initializeDatabase(db);
    console.log(`[HADITH_DB_DEBUG] getHadithDatabase: Database initialized`);
  }

  return db;
}

/**
 * Check if a table exists
 */
function tableExists(db: Database.Database, tableName: string): boolean {
  console.log(`[HADITH_DB_DEBUG] tableExists: Checking for table=${tableName}`);
  try {
    const result = db.prepare(`
      SELECT name FROM sqlite_master
      WHERE type='table' AND name=?
    `).get(tableName);
    const exists = !!result;
    console.log(`[HADITH_DB_DEBUG] tableExists: table=${tableName}, exists=${exists}`);
    return exists;
  } catch (error) {
    console.error(`[HADITH_DB_DEBUG] tableExists: Error checking table=${tableName}:`, error);
    return false;
  }
}

/**
 * Initialize database from schema
 */
function initializeDatabase(db: Database.Database): void {
  console.log(`[HADITH_DB_DEBUG] initializeDatabase: SCHEMA_PATH=${SCHEMA_PATH}`);
  const schemaExists = fs.existsSync(SCHEMA_PATH);
  console.log(`[HADITH_DB_DEBUG] initializeDatabase: Schema file exists=${schemaExists}`);

  if (schemaExists) {
    console.log(`[HADITH_DB_DEBUG] initializeDatabase: Reading schema file`);
    const schema = fs.readFileSync(SCHEMA_PATH, 'utf-8');
    console.log(`[HADITH_DB_DEBUG] initializeDatabase: Schema length=${schema.length}`);
    console.log(`[HADITH_DB_DEBUG] initializeDatabase: Executing schema`);
    db.exec(schema);
    console.log(`[HADITH_DB_DEBUG] initializeDatabase: Schema executed successfully`);
  } else {
    const error = `Schema file not found at ${SCHEMA_PATH}`;
    console.error(`[HADITH_DB_DEBUG] initializeDatabase: ${error}`);
    throw new Error(error);
  }
}

/**
 * Close database connection
 */
export function closeHadithDatabase(db: Database.Database): void {
  db.close();
}

/**
 * Utility to safely execute queries on a hadith collection database
 */
export async function withHadithDatabase<T>(
  collection: HadithCollection,
  callback: (db: Database.Database) => T | Promise<T>
): Promise<T> {
  console.log(`[HADITH_DB_DEBUG] withHadithDatabase: Starting for collection=${collection}`);
  let db: Database.Database | null = null;
  try {
    console.log(`[HADITH_DB_DEBUG] withHadithDatabase: Getting database connection`);
    db = getHadithDatabase(collection);
    console.log(`[HADITH_DB_DEBUG] withHadithDatabase: Executing callback`);
    const result = await callback(db);
    console.log(`[HADITH_DB_DEBUG] withHadithDatabase: Callback completed successfully`);
    return result;
  } catch (error) {
    console.error(`[HADITH_DB_DEBUG] withHadithDatabase: Error in callback for collection=${collection}:`, error);
    throw error;
  } finally {
    if (db) {
      console.log(`[HADITH_DB_DEBUG] withHadithDatabase: Closing database connection`);
      closeHadithDatabase(db);
      console.log(`[HADITH_DB_DEBUG] withHadithDatabase: Database connection closed`);
    }
  }
}

/**
 * Get the total number of hadith in a collection
 */
export async function getHadithCount(collection: HadithCollection): Promise<number> {
  return withHadithDatabase(collection, (db) => {
    const result = db.prepare('SELECT COUNT(*) as count FROM hadith').get() as { count: number };
    return result.count;
  });
}

/**
 * Get the maximum hadith number in a collection
 */
export async function getMaxHadithNumber(collection: HadithCollection): Promise<number> {
  return withHadithDatabase(collection, (db) => {
    const result = db.prepare('SELECT MAX(hadith_number) as max FROM hadith').get() as { max: number | null };
    return result.max || 0;
  });
}

/**
 * Check if a hadith exists in the database
 */
export async function hadithExists(collection: HadithCollection, hadithNumber: number): Promise<boolean> {
  return withHadithDatabase(collection, (db) => {
    const result = db.prepare('SELECT 1 FROM hadith WHERE hadith_number = ?').get(hadithNumber);
    return !!result;
  });
}