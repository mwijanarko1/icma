/**
 * Service for fetching hadith data from sunnah.com
 */

import { parseSunnahHTML, buildSunnahURL, type SunnahHadithData } from '@/lib/parsers/sunnahParser';

export interface FetchSunnahHadithOptions {
  timeout?: number;
  retries?: number;
}

/**
 * Fetches hadith data from sunnah.com
 * @param collection - The collection name (e.g., 'bukhari', 'muslim')
 * @param hadithNumber - The hadith number
 * @param options - Optional fetch options
 * @returns Parsed hadith data or null if fetch/parse fails
 */
export async function fetchSunnahHadith(
  collection: string,
  hadithNumber: number,
  options: FetchSunnahHadithOptions = {}
): Promise<SunnahHadithData | null> {
  const { timeout = 10000, retries = 2 } = options;
  const url = buildSunnahURL(collection, hadithNumber);

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

