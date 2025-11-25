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
  'muwatta-malik',
] as const;

export type HadithCollection = typeof HADITH_COLLECTIONS[number];

const SCHEMA_PATH = path.join(process.cwd(), 'data', 'hadith-schema.sql');

/**
 * Get the database path for a specific collection
 */
export function getHadithDbPath(collection: HadithCollection): string {
  return path.join(process.cwd(), 'data', `${collection}.db`);
}

/**
 * Get database connection for a specific hadith collection
 */
export function getHadithDatabase(collection: HadithCollection): Database.Database {
  const dbPath = getHadithDbPath(collection);
  
  // Ensure data directory exists
  const dataDir = path.dirname(dbPath);
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  const db = new Database(dbPath);
  
  // Enable foreign keys
  db.pragma('foreign_keys = ON');
  
  // Create tables if they don't exist
  if (!tableExists(db, 'hadith')) {
    initializeDatabase(db);
  }
  
  return db;
}

/**
 * Check if a table exists
 */
function tableExists(db: Database.Database, tableName: string): boolean {
  const result = db.prepare(`
    SELECT name FROM sqlite_master 
    WHERE type='table' AND name=?
  `).get(tableName);
  return !!result;
}

/**
 * Initialize database from schema
 */
function initializeDatabase(db: Database.Database): void {
  if (fs.existsSync(SCHEMA_PATH)) {
    const schema = fs.readFileSync(SCHEMA_PATH, 'utf-8');
    db.exec(schema);
  } else {
    throw new Error(`Schema file not found at ${SCHEMA_PATH}`);
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
  const db = getHadithDatabase(collection);
  try {
    const result = await callback(db);
    return result;
  } finally {
    closeHadithDatabase(db);
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

