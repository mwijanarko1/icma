import type { Chain } from '@/types/hadith';

/**
 * Migrates old chain format (with hadithText) to new format (with chainText and matn)
 * @param chains - Array of chains that may be in old or new format
 * @returns Array of chains in the new format
 */
export function migrateChainsToNewFormat(chains: unknown[]): Chain[] {
  return chains.map((chain) => {
    const chainObj = chain as { hadithText?: string; chainText?: string; matn?: string; [key: string]: unknown };

    if ('hadithText' in chainObj && !('chainText' in chainObj)) {
      // Old format: migrate hadithText to chainText, leave matn empty
      return {
        ...chainObj,
        chainText: chainObj.hadithText || '',
        matn: ''
      };
    }

    // New format or already migrated
    return {
      ...chainObj,
      chainText: chainObj.chainText || '',
      matn: chainObj.matn || ''
    };
  }) as Chain[];
}

/**
 * Normalize Arabic text for better matching
 * Removes diacritics, extra spaces, common variations, and normalizes ابي to ابو
 */
export function normalizeArabic(text: string): string {
  return text
    .replace(/[ًٌٍَُِّْ]/g, '') // Remove diacritics (harakats)
    .replace(/[أإآا]/g, 'ا') // Normalize alef variations
    .replace(/[ىي]/g, 'ي') // Normalize yeh variations
    .replace(/[ةه]/g, 'ه') // Normalize teh marbuta
    .replace(/ابي|أبي/g, 'ابو') // Normalize ابي to ابو (so abi huraira = abu huraira)
    .replace(/\s+/g, ' ') // Normalize spaces
    .trim()
    .toLowerCase();
}
