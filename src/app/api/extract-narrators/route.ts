/**
 * POST /api/extract-narrators
 * Extract narrator chains from hadith text using AI
 *
 * @swagger
 * /api/extract-narrators:
 *   post:
 *     summary: Extract narrators from hadith text
 *     description: Use AI to extract and identify narrators from Arabic hadith text, separating the chain (sanad) from the content (matn)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - hadithText
 *               - apiKey
 *             properties:
 *               hadithText:
 *                 type: string
 *                 minLength: 10
 *                 maxLength: 50000
 *                 description: Complete hadith text in Arabic containing both sanad and matn
 *                 example: "حَدَّثَنَا عُمَرُ بْنُ الْخَطَّابِ قَالَ: سَمِعْتُ رَسُولَ اللَّهِ صلى الله عليه وسلم يَقُولُ: إِنَّمَا الأَعْمَالُ بِالنِّيَّاتِ..."
 *               apiKey:
 *                 type: string
 *                 minLength: 10
 *                 maxLength: 200
 *                 description: Google Gemini API key for AI processing
 *                 example: "AIzaSy..."
 *     responses:
 *       200:
 *         description: Successful extraction
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 narrators:
 *                   type: array
 *                   description: Extracted narrator chain
 *                   items:
 *                     type: object
 *                     properties:
 *                       number:
 *                         type: integer
 *                         description: Position in the chain
 *                         example: 1
 *                       arabicName:
 *                         type: string
 *                         description: Arabic name
 *                         example: "رَسُولَ اللَّهِ"
 *                       englishName:
 *                         type: string
 *                         description: English name
 *                         example: "Messenger of Allah"
 *                 chainText:
 *                   type: string
 *                   description: Complete chain text (sanad)
 *                   example: "حَدَّثَنَا عُمَرُ بْنُ الْخَطَّابِ..."
 *                 matn:
 *                   type: string
 *                   description: Hadith content text
 *                   example: "إِنَّمَا الأَعْمَالُ بِالنِّيَّاتِ..."
 *       400:
 *         description: Bad request - missing or invalid parameters
 *       429:
 *         description: Rate limit exceeded
 *       500:
 *         description: AI processing error or internal server error
 *
 * @example
 * POST /api/extract-narrators
 * {
 *   "hadithText": "حَدَّثَنَا عُمَرُ بْنُ الْخَطَّابِ قَالَ: سَمِعْتُ رَسُولَ اللَّهِ صلى الله عليه وسلم يَقُولُ: إِنَّمَا الأَعْمَالُ بِالنِّيَّاتِ",
 *   "apiKey": "AIzaSy..."
 * }
 */

import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from "@google/genai";
import { handleValidationError } from '@/lib/validation/middleware';
import { validateString } from '@/lib/validation';
import { withRateLimit, rateLimiters } from '@/lib/rate-limit';

interface Narrator {
  number: number;
  arabicName: string;
  englishName: string;
}

class GeminiService {
  private ai: GoogleGenAI;

  constructor(apiKey: string) {
    if (!apiKey) {
      throw new Error("API key is required");
    }
    this.ai = new GoogleGenAI({ apiKey });
  }

  async extractNarratorsFromHadith(hadithText: string): Promise<{ narrators: Narrator[]; chainText: string; matn: string }> {
    const prompt = `You are an expert in Islamic Hadith and Arabic textual analysis. Your task is to:
1. Extract the complete chain of narrators (sanad) from a given Hadith text
2. Identify the speaker of the Hadith and the Hadith compiler

**Input:**
You will receive a complete Hadith text, which includes the Arabic chain of narration, the Hadith text (matn), its English translation, and compiler information.

**Output:**
Your output must be a JSON object with this exact format:
{
  "narrators": [
    {
      "number": 1,
      "arabicName": "رَسُولَ اللَّهِ",
      "englishName": "Messenger of Allah"
    },
    {
      "number": 2,
      "arabicName": "أَبُو بَكْرٍ الصِّدِّيقُ",
      "englishName": "Abu Bakr as-Siddiq"
    }
  ],
  "chainText": "حَدَّثَنَا الْحُمَيْدِيُّ عَبْدُ اللَّهِ بْنُ الزُّبَيْرِ..."
}

**Instructions:**

1.  **Extract Chain Text (Sanad)**:
    *   The **chainText (sanad)** is the transmission chain that lists all the narrators from the compiler back to the Prophet. It typically starts with words like \`حَدَّثَنَا\`, \`أَخْبَرَنَا\`, \`حَدَّثَنِي\`, etc., and includes all the narrator names and transmission phrases.
    *   Extract the complete chain text (sanad) as a single string, preserving all Arabic text from the beginning of the chain until the matn (hadith text content) begins.
    *   Focus ONLY on the chain (sanad) - do not include the matn (hadith text content) in the chainText.

2.  **Extract Narrator Chain (Sanad)**:
    *   Focus on the Arabic portion of the text that describes the transmission chain, from the earliest narrator to the Companion who heard the Hadith.
    *   Look for keywords that signify a new narrator in the chain. These typically include: \`حَدَّثَنَا\`, \`أَخْبَرَنَا\`, \`أَخْبَرَنِي\`, \`سَمِعْتُ\`, \`سَمِعَ\`, \`عَنْ\`, \`قَالَ\`, \`يَقُولُ\`.
    *   Extract the full name associated with each instance of these keywords. Names usually follow these keywords or are the object of the verb \`سَمِعَ\`/\`سَمِعْتُ\`.
    *   **Filter out extraneous phrases**: Exclude honorifics or prayers such as \`رَضِيَ اللَّهُ عَنْهُ\` or \`صَلَّى اللَّهُ عَلَيْهِ وَسَلَّمَ\` from the narrator names.

3.  **Identify the Speaker**: The ultimate source of the Hadith is \`رَسُولَ اللَّهِ\` (the Messenger of Allah). This individual is always the speaker of the Hadith and should be the first entry in the narrators array.

4.  **Identify the Hadith Compiler**: From the provided text (often near the "Sahih al-Bukhari 1" type of reference), identify the compiler. For "Sahih al-Bukhari", the compiler is \`الْإِمَامُ الْبُخَارِيُّ\`.

5.  **Order the Narrator Entries**: The narrators array entries must be ordered as follows:
    *   1. \`رَسُولَ اللَّهِ\` (Speaker)
    *   2. The Companion who directly heard the Hadith from the Prophet.
    *   3. The subsequent narrators in the chain, ordered chronologically from the Companion down to the final narrator who transmitted the Hadith to the compiler.
    *   4. The Hadith Compiler.

6.  **Translate Names to English**: Provide a widely accepted English transliteration or translation for each Arabic narrator name.

7.  **Format the Output**: Return ONLY the JSON object, no additional text, explanations, or conversational elements. Focus only on extracting the chain (sanad) and narrators - do not extract or include the matn (hadith text content).

Hadith text:
${hadithText}`;

    try {
      const response = await this.ai.models.generateContent({
        model: "gemini-2.0-flash",
        contents: prompt,
        config: {
          temperature: 0.1,
          maxOutputTokens: 3000, // Focused on chain extraction only
        },
      });

      const raw = response.text?.trim() || "";
      if (!raw) {
        throw new Error("Empty response from Gemini API");
      }

      // Parse the JSON response robustly (strip code fences if present)
      const text = stripCodeFences(raw);
      const parsed = parseNarratorsJson(text) as { narrators: Narrator[]; chainText: string; matn?: string };

      // Validate the response structure
      if (!parsed || typeof parsed !== 'object') {
        throw new Error("Invalid response format: expected object");
      }

      // Check if it's the old format (just an array) and convert
      if (Array.isArray(parsed)) {
        // Backward compatibility: old format returns just narrators array
        return {
          narrators: parsed as Narrator[],
          chainText: '',
          matn: ''
        };
      }

      // Validate narrators array
      if (!Array.isArray(parsed.narrators)) {
        throw new Error("Invalid response format: narrators must be an array");
      }

      // Validate each narrator object
      for (const narrator of parsed.narrators) {
        if (
          typeof narrator.number !== "number" ||
          typeof narrator.arabicName !== "string" ||
          typeof narrator.englishName !== "string"
        ) {
          throw new Error("Invalid narrator object structure");
        }
      }

      // Validate chainText
      if (typeof parsed.chainText !== "string") {
        parsed.chainText = '';
      }

      // Return empty matn since we're focusing only on chain analysis
      return {
        narrators: parsed.narrators,
        chainText: parsed.chainText || '',
        matn: ''
      };
    } catch (error) {
      console.error("Error extracting narrators with Gemini:", error);
      throw new Error(`Failed to extract narrators: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

function stripCodeFences(text: string): string {
  // Remove ```json ... ``` or ``` ... ``` wrappers if present
  const fenced = text.match(/^```(?:json)?[\r\n]+([\s\S]*?)```[\s\S]*$/i);
  if (fenced && fenced[1]) return fenced[1].trim();
  return text.trim();
}

function parseNarratorsJson(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    // Try to extract first JSON object or array substring
    // Look for object first (starts with {)
    const objectStart = text.indexOf("{");
    const objectEnd = text.lastIndexOf("}");
    if (objectStart !== -1 && objectEnd !== -1 && objectEnd > objectStart) {
      const slice = text.substring(objectStart, objectEnd + 1);
      try {
        return JSON.parse(slice);
      } catch {
        // Continue to try array
      }
    }
    
    // Try to extract JSON array substring
    const arrayStart = text.indexOf("[");
    const arrayEnd = text.lastIndexOf("]");
    if (arrayStart !== -1 && arrayEnd !== -1 && arrayEnd > arrayStart) {
      const slice = text.substring(arrayStart, arrayEnd + 1);
      return JSON.parse(slice);
    }
    
    throw new Error("Response was not valid JSON");
  }
}

const POSTHandler = async (request: NextRequest) => {
  try {
    const body = await request.json();
    const { hadithText, apiKey } = body;

    // Validate hadithText parameter
    const hadithValidation = validateString(hadithText, 'hadithText', {
      minLength: 10,
      maxLength: 50000, // Allow for very long hadith texts
      trim: false // Preserve whitespace in Arabic text
    });

    if (!hadithValidation.isValid) {
      return handleValidationError(hadithValidation.error!);
    }

    // Validate apiKey parameter
    const apiKeyValidation = validateString(apiKey, 'apiKey', {
      minLength: 10,
      maxLength: 200,
      pattern: /^[A-Za-z0-9_-]+$/
    });

    if (!apiKeyValidation.isValid) {
      return handleValidationError(apiKeyValidation.error!);
    }

    const geminiService = new GeminiService(apiKeyValidation.sanitizedValue);
    const { narrators, chainText, matn } = await geminiService.extractNarratorsFromHadith(hadithValidation.sanitizedValue);

    // Return narrators and chainText only (matn is empty for chain analyzer focus)
    // Matching will be done via the match modal
    return NextResponse.json({ narrators, chainText, matn });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'An error occurred while processing the request'
      },
      { status: 500 }
    );
  }
};

// Export with rate limiting applied
export const POST = withRateLimit(POSTHandler, rateLimiters.expensive);