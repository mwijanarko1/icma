// Utility to fetch and parse narrator data from Shamela.ws
import type { ShamelaNarratorEntry } from './types';

interface FetchOptions {
  narratorId: number;
  timeout?: number;
}

/**
 * Fetch narrator data from Shamela.ws
 * @param narratorId - The narrator ID from the URL (e.g., 3654)
 * @returns Parsed narrator data in ShamelaNarratorEntry format
 */
export async function fetchShamelaNarrator(
  narratorId: number,
  options: { timeout?: number } = {}
): Promise<ShamelaNarratorEntry | null> {
  const url = `https://shamela.ws/narrator/${narratorId}`;
  
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'ar,en-US;q=0.9,en;q=0.8',
      },
      signal: AbortSignal.timeout(options.timeout || 30000), // 30 second timeout
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const html = await response.text();
    return parseShamelaHTML(html, narratorId);
  } catch (error) {
    console.error(`Error fetching narrator ${narratorId}:`, error);
    return null;
  }
}

/**
 * Parse HTML content from Shamela narrator page
 * Uses regex-based parsing for server-side compatibility
 */
function parseShamelaHTML(html: string, narratorId: number): ShamelaNarratorEntry | null {
  try {
    // Extract name from title using regex
    const titleMatch = html.match(/<h1>([^<]+)<\/h1>/);
    const fullNameArabic = titleMatch ? titleMatch[1].trim() : '';

    if (!fullNameArabic) {
      throw new Error('Could not extract narrator name from page title');
    }

    const data: Partial<ShamelaNarratorEntry> = {
      name: {
        arabic: fullNameArabic,
        english: '', // Will need translation or manual entry
        full: '',
      },
    };

    // Parse all data fields using regex
    // Pattern: <div><b>Label:</b> Value</div> or <div><b>Label: Value</b></div>
    // Handles both cases where colon is inside or outside the <b> tag
    const fieldPattern = /<div[^>]*><b>([^:<]+):?\s*<\/b>\s*([\s\S]*?)<\/div>/g;
    let match;
    
    while ((match = fieldPattern.exec(html)) !== null) {
      const label = match[1].trim();
      let value = match[2].trim();
      
      // Remove HTML tags but preserve text content
      value = value
        .replace(/<[^>]+>/g, ' ') // Remove HTML tags
        .replace(/&nbsp;/g, ' ')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/\s+/g, ' ') // Normalize whitespace
        .trim();

      // Parse different fields
      if (label.includes('الاسم')) {
        // Extract name - could be in parentheses
        const fullMatch = value.match(/\(([^)]+)\)/);
        if (fullMatch) {
          data.name!.full = fullMatch[1];
        }
        // Try to extract English name if present
        // This would need a translation service or manual mapping
      } else if (label.includes('اللقب')) {
        data.title = value;
      } else if (label.includes('الكنية')) {
        data.kunya = value;
      } else if (label.includes('النسب')) {
        data.lineage = value.split('،').map(l => l.trim());
      } else if (label.includes('بلد الإقامة')) {
        data.placeOfResidence = value;
      } else if (label.includes('علاقات الراوي')) {
        // Parse relationships
        if (!data.relationships) data.relationships = [];
        
        // Extract relationship type and narrators
        // Pattern could be: "صاحب: narrator1, narrator2" or just "يقال: description"
        const relationshipMatch = value.match(/([^:]+):\s*(.+)/);
        if (relationshipMatch) {
          const relType = mapRelationshipType(relationshipMatch[1].trim());
          const narrators = relationshipMatch[2].split(/[،,]/).map(n => n.trim()).filter(n => n);
          
          // Only add if we have narrators, otherwise it might just be a description
          if (narrators.length > 0) {
            data.relationships.push({
              type: relType,
              narrators,
              description: narrators.length === 0 ? value : undefined,
            });
          } else {
            // If no narrators found, treat the whole value as a description
            data.relationships.push({
              type: 'other',
              narrators: [],
              description: value,
            });
          }
        } else {
          // No colon found, treat entire value as description
          data.relationships.push({
            type: 'other',
            narrators: [],
            description: value,
          });
        }
      } else if (label.includes('تاريخ الميلاد') || label.includes('تاريخ الولادة')) {
        // Parse birth date - could be "100 هـ"
        const yearMatch = value.match(/(\d+)\s*هـ/);
        const altYearMatch = value.match(/أو\s*(\d+)\s*هـ/);
        
        const yearAH = yearMatch ? parseInt(yearMatch[1], 10) : undefined;
        const altYearAH = altYearMatch ? parseInt(altYearMatch[1], 10) : undefined;
        
        // Store birth date in notes for now (we can add a birthDate field to the type later if needed)
        if (yearAH !== undefined) {
          if (!data.notes) data.notes = '';
          data.notes += (data.notes ? ' | ' : '') + `تاريخ الميلاد: ${yearAH} هـ${altYearAH ? ` أو ${altYearAH} هـ` : ''}`;
        }
      } else if (label.includes('تاريخ الوفاة')) {
            // Parse death date - could be "219 هـ، أو 220 هـ" or "141 هـ، أو: 142 هـ، أو: 144 هـ"
            const yearMatch = value.match(/(\d+)\s*هـ/);
            // Look for first alternative (could be "أو" or "أو:")
            const altYearMatch = value.match(/أو\s*:?\s*(\d+)\s*هـ/);
            
            const yearAH = yearMatch ? parseInt(yearMatch[1], 10) : undefined;
            const altYearAH = altYearMatch ? parseInt(altYearMatch[1], 10) : undefined;
            
            if (yearAH !== undefined) {
              data.deathDate = {
                yearAH,
                ...(altYearAH !== undefined && { alternativeYearAH: altYearAH }),
              };
              
              // If there are more alternatives beyond the first one, note them
              // Pattern: "141 هـ، أو: 142 هـ، أو: 144 هـ" - we want to capture if there's a third alternative
              const allAlternatives = value.matchAll(/أو\s*:?\s*(\d+)\s*هـ/g);
              const alternatives: number[] = [];
              for (const match of allAlternatives) {
                alternatives.push(parseInt(match[1], 10));
              }
              
              // If we have more than one alternative, store additional ones in notes
              if (alternatives.length > 1) {
                const additionalYears = alternatives.slice(1).map(y => `${y} هـ`).join('، أو: ');
                if (!data.notes) data.notes = '';
                data.notes += (data.notes ? ' | ' : '') + `تاريخ الوفاة بدائل إضافية: ${additionalYears}`;
              }
            }
      } else if (label.includes('بلد الوفاة')) {
        if (!data.deathDate) data.deathDate = {};
        data.deathDate.place = value;
      } else if (label.includes('بلد الرحلة')) {
        data.placesTraveled = value.split('،').map(p => p.trim());
      } else if (label.includes('طبقة رواة التقريب')) {
        data.taqribCategory = value;
      } else if (label.includes('الرتبة عند ابن حجر')) {
        data.ibnHajarRank = value;
      } else if (label.includes('الرتبة عند الذهبي')) {
        data.dhahabiRank = value;
      } else if (label.includes('ملاحظات') || label.includes('ملاحظة') || label.includes('تعليق') || label.includes('نبذة')) {
        // Parse notes/remarks field
        if (!data.notes) data.notes = '';
        data.notes += (data.notes ? ' | ' : '') + value;
      }
      // If we encounter any other field we don't recognize, we could log it for debugging
      // but for now we'll skip it to avoid cluttering
    }

    // Parse scholarly opinions (Al-Jarh wa al-Ta'dil section)
    // Find the section starting with "الجرح والتعديل"
    const jarhSectionStart = html.indexOf('الجرح والتعديل');
    if (jarhSectionStart !== -1) {
      // Extract the section (everything after the header until the end of the container)
      const jarhSectionHTML = html.substring(jarhSectionStart);
      data.scholarlyOpinions = parseScholarlyOpinions(jarhSectionHTML);
    }

    // Validate required fields
    if (!data.name?.arabic) {
      throw new Error('Could not extract narrator name');
    }

    return data as ShamelaNarratorEntry;
  } catch (error) {
    console.error(`Error parsing HTML for narrator ${narratorId}:`, error);
    return null;
  }
}

/**
 * Parse scholarly opinions from the Al-Jarh wa al-Ta'dil section
 */
function parseScholarlyOpinions(html: string): ShamelaNarratorEntry['scholarlyOpinions'] {
  const opinions: ShamelaNarratorEntry['scholarlyOpinions'] = [];
  
  // Find all alert-info divs (scholar names)
  // Pattern: <div class="alert alert-info">Scholar Name</div>
  const scholarPattern = /<div class="alert alert-info"[^>]*>([^<]+)<\/div>/g;
  let scholarMatch;
  let lastScholarIndex = 0;
  
  while ((scholarMatch = scholarPattern.exec(html)) !== null) {
    const scholarName = scholarMatch[1].trim();
    const scholarStart = scholarMatch.index + scholarMatch[0].length;
    
    // Find the next scholar or end of section
        const nextScholarMatch = html.substring(scholarStart).match(/<div class="alert alert-info"/);
        const sectionEnd = nextScholarMatch && nextScholarMatch.index !== undefined
          ? scholarStart + nextScholarMatch.index
          : html.length;
    
    // Extract opinions between this scholar and the next
    const sectionHTML = html.substring(scholarStart, sectionEnd);
    
    // Find all opinion divs: <div><b>Opinion text</b> [Source]</div>
    const opinionPattern = /<div[^>]*><b>([^<]+)<\/b>([^<]*(?:\[[^\]]+\][^<]*)?)<\/div>/g;
    let opinionMatch;
    
    while ((opinionMatch = opinionPattern.exec(sectionHTML)) !== null) {
      const opinionText = opinionMatch[1].trim();
      const sourceText = opinionMatch[2].trim();
      
      // Extract source reference
      const sourceMatch = sourceText.match(/\[([^\]]+)\]/);
      const sourceRef = sourceMatch ? sourceMatch[1].trim() : undefined;
      
      // Try to extract book and volume
      let sourceBook: string | undefined;
      let sourceVolume: string | undefined;
      
      if (sourceRef) {
        // Try to match patterns like "تهذيب التهذيب (2/334)"
        const bookMatch = sourceRef.match(/([^(]+)\s*\((\d+\/\d+)\)/);
        if (bookMatch) {
          sourceBook = bookMatch[1].trim();
          sourceVolume = bookMatch[2].trim();
        } else {
          sourceBook = sourceRef;
        }
      }
      
      // Determine opinion type
      const opinionType = determineOpinionType(opinionText);
      
      opinions.push({
        scholar: scholarName,
        opinion: opinionText,
        source: sourceRef,
        sourceBook,
        sourceVolume,
        type: opinionType,
      });
    }
  }
  
  return opinions;
}

/**
 * Map Arabic relationship types to English
 */
function mapRelationshipType(arabicType: string): string {
  const mapping: Record<string, string> = {
    'صاحب': 'companion_of',
    'شيخ': 'teacher',
    'تلميذ': 'student',
    'معاصر': 'contemporary',
  };
  
  return mapping[arabicType] || 'other';
}

/**
 * Determine opinion type from text
 */
function determineOpinionType(opinionText: string): 'jarh' | 'ta\'dil' | 'neutral' {
  const positiveKeywords = ['ثقة', 'إمام', 'حافظ', 'مأمون', 'صحيح', 'مقبول', 'صدوق', 'ثبت', 'أنبل', 'أجل', 'أوثق', 'آمن'];
  const negativeKeywords = ['ضعيف', 'متروك', 'كذاب', 'متهم', 'مجهول'];
  
  // Phrases that indicate praise even when mentioning negative terms
  const positiveContextPhrases = [
    'لا أقل رواية عن', // not less narration from (meaning fewer weak narrators)
    'لا أكثر رواية عن', // not more narration from
    'أقل رواية عن', // less narration from (fewer weak narrators)
    'ما علمناه حدث عن', // we don't know him to narrate from
    'لا رواية عن', // no narration from
    'لا يروي عن', // doesn't narrate from
    'لا يحدث عن', // doesn't narrate from
  ];
  
  // Negative constructions that negate the following word
  const negationWords = ['لا', 'ليس', 'ما', 'لم', 'لن', 'غير'];
  
  const lowerText = opinionText.toLowerCase();
  
  // First check for positive context phrases that mention avoiding weak narrators
  const hasPositiveContext = positiveContextPhrases.some(phrase => lowerText.includes(phrase));
  
  // Check for positive keywords
  const hasPositiveKeywords = positiveKeywords.some(kw => lowerText.includes(kw));
  
  // Check for negative keywords, but consider context
  let hasNegativeKeywords = false;
  let negativeInPositiveContext = false;
  
  for (const negKw of negativeKeywords) {
    const index = lowerText.indexOf(negKw);
    if (index !== -1) {
      hasNegativeKeywords = true;
      
      // Check if the negative keyword appears after a negation word
      // Look back up to 20 characters for negation words
      const contextBefore = lowerText.substring(Math.max(0, index - 20), index);
      const hasNegationBefore = negationWords.some(neg => contextBefore.includes(neg));
      
      // Check if it's in a positive context phrase
      if (hasPositiveContext || hasNegationBefore) {
        negativeInPositiveContext = true;
      }
    }
  }
  
  // If we have positive keywords or positive context, prioritize that
  if (hasPositiveKeywords || hasPositiveContext) {
    // Only mark as jarh if negative keywords appear WITHOUT positive context
    if (hasNegativeKeywords && !negativeInPositiveContext) {
      // Check if negative keywords are the main focus
      // Count occurrences - if positive keywords appear more, it's likely ta'dil
      const positiveCount = positiveKeywords.reduce((count, kw) => 
        count + (lowerText.match(new RegExp(kw, 'g')) || []).length, 0
      );
      const negativeCount = negativeKeywords.reduce((count, kw) => 
        count + (lowerText.match(new RegExp(kw, 'g')) || []).length, 0
      );
      
      // If significantly more positive than negative, it's ta'dil
      if (positiveCount > negativeCount * 2) {
        return 'ta\'dil';
      }
      
      // Otherwise, it might be mixed - check if negative is about avoiding weak narrators
      if (hasPositiveContext) {
        return 'ta\'dil';
      }
    }
    return 'ta\'dil';
  }
  
  // If we only have negative keywords without positive context, it's jarh
  if (hasNegativeKeywords && !negativeInPositiveContext) {
    return 'jarh';
  }
  
  return 'neutral';
}

/**
 * Batch fetch multiple narrators
 */
export async function fetchMultipleNarrators(
  narratorIds: number[],
  options: { delay?: number; timeout?: number } = {}
): Promise<Map<number, ShamelaNarratorEntry | null>> {
  const results = new Map<number, ShamelaNarratorEntry | null>();
  const delay = options.delay || 1000; // 1 second delay between requests
  
  for (const id of narratorIds) {
    const result = await fetchShamelaNarrator(id, { timeout: options.timeout });
    results.set(id, result);
    
    // Rate limiting
    if (narratorIds.indexOf(id) < narratorIds.length - 1) {
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  return results;
}

