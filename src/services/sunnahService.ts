/**
 * Service for fetching hadith data from sunnah.com
 */

import { parseSunnahHTML, buildSunnahURL, type SunnahHadithData } from '@/lib/parsers/sunnahParser';

export type { SunnahHadithData };

export interface FetchSunnahHadithOptions {
  timeout?: number;
  retries?: number;
}

/**
 * Fetches hadith data from sunnah.com
 * @param collection - The collection name (e.g., 'bukhari', 'muslim')
 * @param hadithNumber - The hadith number (can be number or string like "8a")
 * @param options - Optional fetch options
 * @param isIntroduction - Whether this is an introduction narration
 * @returns Parsed hadith data or null if fetch/parse fails
 */
export async function fetchSunnahHadith(
  collection: string,
  hadithNumber: number | string,
  options: FetchSunnahHadithOptions = {},
  isIntroduction: boolean = false
): Promise<SunnahHadithData | null> {
  const { timeout = 10000, retries = 2 } = options;
  const url = buildSunnahURL(collection, hadithNumber, isIntroduction);

  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      const response = await fetch(url, {
        signal: controller.signal,
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; ICMA-Hadith-Analyzer/1.0)',
        },
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        // 404 means the hadith doesn't exist - return null instead of throwing
        if (response.status === 404) {
          return null;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const html = await response.text();
      const parsedData = parseSunnahHTML(html);

      if (!parsedData) {
        throw new Error('Failed to parse hadith data from HTML');
      }

      return parsedData;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      
      // If it's an abort error (timeout), don't retry
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error(`Request timeout after ${timeout}ms`);
      }

      // If this is the last attempt, throw the error
      if (attempt === retries) {
        throw lastError;
      }

      // Wait before retrying (exponential backoff)
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
    }
  }

  throw lastError || new Error('Failed to fetch hadith data');
}

/**
 * Fetches all versions of a hadith (including sub-versions like 8a, 8b, etc.)
 * @param collection - The collection name (e.g., 'muslim')
 * @param hadithNumber - The base hadith number
 * @param options - Optional fetch options
 * @returns Array of parsed hadith data for all versions
 */
export async function fetchSunnahHadithVersions(
  collection: string,
  hadithNumber: number,
  options: FetchSunnahHadithOptions = {}
): Promise<SunnahHadithData[]> {
  const results: SunnahHadithData[] = [];

  // First try the base number
  const baseHadith = await fetchSunnahHadith(collection, hadithNumber, options);
  if (baseHadith) {
    results.push(baseHadith);

    // Check if this hadith has sub-versions by looking at the reference
    const referenceMatch = baseHadith.reference.match(/(\d+)\s*([a-z])$/i);
    if (referenceMatch) {
      // This hadith has a letter suffix, try other suffixes
      const currentLetter = referenceMatch[2].toLowerCase();

      // Try letters after the current one
      const letters = 'abcdefghijklmnopqrstuvwxyz';
      const currentIndex = letters.indexOf(currentLetter);

      for (let i = currentIndex + 1; i < letters.length; i++) {
        const nextLetter = letters[i];
        const versionedNumber = `${hadithNumber}${nextLetter}`;

        const versionedHadith = await fetchSunnahHadith(collection, versionedNumber, options);
        if (versionedHadith) {
          results.push(versionedHadith);
        } else {
          // No more versions found
          break;
        }
      }
    }
  } else {
    // Base number doesn't exist, but it might have sub-versions (e.g., 224a exists but 224 doesn't)
    // Try all letters starting from 'a'
    const letters = 'abcdefghijklmnopqrstuvwxyz';
    for (let i = 0; i < letters.length; i++) {
      const letter = letters[i];
      const versionedNumber = `${hadithNumber}${letter}`;

      const versionedHadith = await fetchSunnahHadith(collection, versionedNumber, options);
      if (versionedHadith) {
        results.push(versionedHadith);
      } else {
        // No more versions found, stop trying
        break;
      }
    }
  }

  return results;
}

/**
 * Validates if a collection name is supported
 * @param collection - The collection name to validate
 * @returns True if the collection is likely supported
 */
export function isValidCollection(collection: string): boolean {
  const validCollections = [
    'bukhari',
    'muslim',
    'nasai',
    'abudawud',
    'tirmidhi',
    'ibnmajah',
    'malik',
    'ahmad',
    'darimi',
  ];
  return validCollections.includes(collection.toLowerCase());
}

