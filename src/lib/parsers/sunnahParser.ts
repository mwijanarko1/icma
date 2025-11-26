/**
 * Parser utility for extracting hadith data from sunnah.com HTML responses
 */

export interface SunnahHadithData {
  reference: string;
  englishNarrator?: string;
  englishTranslation: string;
  arabicText: string;
  inBookReference?: string;
}

/**
 * Extracts hadith data from sunnah.com HTML
 * @param html - The HTML content from sunnah.com
 * @returns Parsed hadith data or null if parsing fails
 */
export function parseSunnahHTML(html: string): SunnahHadithData | null {
  try {
    // Extract reference (e.g., "Sahih al-Bukhari 1")
    // Handle both quoted and unquoted class attributes
    const referenceMatch = html.match(/<div class=["']?hadith_reference_sticky["']?>([^<]+)<\/div>/);
    const reference = referenceMatch ? referenceMatch[1].trim() : '';

    // Extract English narrator
    // Handle both quoted and unquoted class attributes
    const narratorMatch = html.match(/<div class=["']?hadith_narrated["']?>([^<]+)<\/div>/);
    const englishNarrator = narratorMatch ? narratorMatch[1].trim() : undefined;

    // Extract English translation from text_details
    // Handle both quoted and unquoted class attributes, and flexible closing tags
    // Try with <p> tag first, then without
    let englishMatch = html.match(/<div class=["']?text_details["']?><p>([\s\S]*?)(?:<\/p>|<\/b>|<\/div>)/);
    if (!englishMatch) {
      // Try without <p> tag - text might be directly in the div
      // Match everything until the closing </div> tag (handle cases where </b> appears in content)
      // Use a more robust pattern that matches until the actual closing div
      englishMatch = html.match(/<div class=["']?text_details["']?>([\s\S]*?)<\/div>/);
    }
    let englishTranslation = '';
    if (englishMatch) {
      // Clean up the text - remove extra whitespace and HTML tags
      englishTranslation = englishMatch[1]
        .replace(/<[^>]+>/g, '') // Remove any HTML tags
        .replace(/\s+/g, ' ') // Normalize whitespace
        .trim();
    }

    // Extract Arabic sanad (chain of narrators) if it exists separately
    // Handle both quoted and unquoted class attributes, and handle class="arabic_sanad arabic"
    const arabicSanadMatch = html.match(/<span class=["']?arabic_sanad[^"']*["']?>([\s\S]*?)<\/span>/);
    let arabicSanad = '';
    if (arabicSanadMatch && arabicSanadMatch[1].trim()) {
      // Remove HTML tags but preserve the text content
      arabicSanad = arabicSanadMatch[1]
        .replace(/<a[^>]*>/g, '') // Remove opening anchor tags
        .replace(/<\/a>/g, '') // Remove closing anchor tags
        .replace(/<[^>]+>/g, '') // Remove any other HTML tags
        .replace(/\s+/g, ' ') // Normalize whitespace
        .trim();
    }

    // Extract Arabic hadith text (matn)
    // Handle both quoted and unquoted class attributes, and handle class="arabic_text_details arabic"
    let arabicTextMatch = html.match(/<span class=["']?arabic_text_details[^"']*["']?>([\s\S]*?)<\/span>/);
    // Also try arabic_hadith_full (used in some collections like Ibn Majah)
    if (!arabicTextMatch) {
      arabicTextMatch = html.match(/<div class=["']?arabic_hadith_full[^"']*["']?>([\s\S]*?)<\/div>/);
    }
    let arabicMatn = '';
    if (arabicTextMatch) {
      arabicMatn = arabicTextMatch[1]
        .replace(/<[^>]+>/g, '') // Remove any HTML tags
        .replace(/\s+/g, ' ') // Normalize whitespace
        .trim();
    }

    // Combine sanad and matn if both exist, otherwise use whichever has content
    let arabicText = '';
    if (arabicSanad && arabicMatn) {
      // Both exist - combine them
      arabicText = `${arabicSanad} ${arabicMatn}`.trim();
    } else if (arabicSanad) {
      // Only sanad exists
      arabicText = arabicSanad;
    } else if (arabicMatn) {
      // Only matn exists (or they're combined in arabic_text_details or arabic_hadith_full)
      arabicText = arabicMatn;
    }

    // Extract in-book reference if available
    const inBookRefMatch = html.match(/<tr><td>In-book reference<\/td><td>&nbsp;:&nbsp;([^<]+)<\/td><\/tr>/);
    const inBookReference = inBookRefMatch ? inBookRefMatch[1].trim() : undefined;

    // Validate that we have at least the essential data
    if (!reference || !englishTranslation || !arabicText) {
      return null;
    }

    return {
      reference,
      englishNarrator,
      englishTranslation,
      arabicText,
      inBookReference,
    };
  } catch (error) {
    console.error('Error parsing sunnah.com HTML:', error);
    return null;
  }
}

/**
 * Constructs a sunnah.com URL for a given collection and hadith number
 * @param collection - The collection name (e.g., 'bukhari', 'muslim')
 * @param hadithNumber - The hadith number (can be number or string like "8a")
 * @param isIntroduction - Whether this is an introduction narration
 * @returns The full URL
 */
export function buildSunnahURL(collection: string, hadithNumber: number | string, isIntroduction: boolean = false): string {
  if (isIntroduction) {
    return `https://sunnah.com/${collection}/introduction/${hadithNumber}`;
  }
  return `https://sunnah.com/${collection}:${hadithNumber}`;
}

