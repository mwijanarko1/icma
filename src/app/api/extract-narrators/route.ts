import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from "@google/genai";

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

  async extractNarratorsFromHadith(hadithText: string): Promise<Narrator[]> {
    const prompt = `You are an expert in Islamic Hadith and Arabic textual analysis. Your task is to extract the complete chain of narrators (sanad) from a given Hadith text, identify the speaker of the Hadith, and the Hadith compiler. Then, present this information in a structured table.

**Input:**
You will receive a complete Hadith text, which includes the Arabic chain of narration, the Hadith text (matn), its English translation, and compiler information.

**Output:**
Your output must be a JSON array of narrator objects with this exact format:
[
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
]

**Instructions for Extraction and Table Generation:**

1.  **Identify the Speaker**: The ultimate source of the Hadith is \`رَسُولَ اللَّهِ\` (the Messenger of Allah). This individual is always the speaker of the Hadith and should be the first entry in your response.

2.  **Extract Narrator Chain (Sanad)**:
    *   Focus on the Arabic portion of the text that describes the transmission chain, from the earliest narrator to the Companion who heard the Hadith.
    *   Look for keywords that signify a new narrator in the chain. These typically include: \`حَدَّثَنَا\`, \`أَخْبَرَنَا\`, \`أَخْبَرَنِي\`, \`سَمِعْتُ\`, \`سَمِعَ\`, \`عَنْ\`, \`قَالَ\`, \`يَقُولُ\`.
    *   Extract the full name associated with each instance of these keywords. Names usually follow these keywords or are the object of the verb \`سَمِعَ\`/\`سَمِعْتُ\`.
    *   **Filter out extraneous phrases**: Exclude honorifics or prayers such as \`رَضِيَ اللَّهُ عَنْهُ\` or \`صَلَّى اللَّهُ عَلَيْهِ وَسَلَّمَ\` from the narrator names.

3.  **Identify the Hadith Compiler**: From the provided text (often near the "Sahih al-Bukhari 1" type of reference), identify the compiler. For "Sahih al-Bukhari", the compiler is \`الْإِمَامُ الْبُخَارِيُّ\`.

4.  **Order the JSON Entries**: The JSON array entries must be ordered as follows:
    *   1. \`رَسُولَ اللَّهِ\` (Speaker)
    *   2. The Companion who directly heard the Hadith from the Prophet.
    *   3. The subsequent narrators in the chain, ordered chronologically from the Companion down to the final narrator who transmitted the Hadith to the compiler.
    *   4. The Hadith Compiler.

5.  **Translate Names to English**: Provide a widely accepted English transliteration or translation for each Arabic narrator name.

6.  **Format the Output**: Return ONLY the JSON array, no additional text, explanations, or conversational elements.

Hadith text:
${hadithText}`;

    try {
      const response = await this.ai.models.generateContent({
        model: "gemini-2.0-flash",
        contents: prompt,
        config: {
          temperature: 0.1,
          maxOutputTokens: 2000,
        },
      });

      const raw = response.text?.trim() || "";
      if (!raw) {
        throw new Error("Empty response from Gemini API");
      }

      // Parse the JSON response robustly (strip code fences if present)
      const text = stripCodeFences(raw);
      const narrators = parseNarratorsJson(text) as Narrator[];

      // Validate the response structure
      if (!Array.isArray(narrators)) {
        throw new Error("Invalid response format: expected array");
      }

      // Validate each narrator object
      for (const narrator of narrators) {
        if (
          typeof narrator.number !== "number" ||
          typeof narrator.arabicName !== "string" ||
          typeof narrator.englishName !== "string"
        ) {
          throw new Error("Invalid narrator object structure");
        }
      }

      return narrators;
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
    // Try to extract first JSON array substring
    const start = text.indexOf("[");
    const end = text.lastIndexOf("]");
    if (start !== -1 && end !== -1 && end > start) {
      const slice = text.substring(start, end + 1);
      return JSON.parse(slice);
    }
    throw new Error("Response was not valid JSON array");
  }
}

export async function POST(request: NextRequest) {
  try {
    const { hadithText, apiKey } = await request.json();

    if (!hadithText || typeof hadithText !== 'string') {
      return NextResponse.json(
        { error: 'Hadith text is required and must be a string' },
        { status: 400 }
      );
    }

    if (!apiKey || typeof apiKey !== 'string') {
      return NextResponse.json(
        { error: 'API key is required and must be a string' },
        { status: 400 }
      );
    }

    const geminiService = new GeminiService(apiKey);
    const narrators = await geminiService.extractNarratorsFromHadith(hadithText);

    return NextResponse.json({ narrators });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'An error occurred while processing the request'
      },
      { status: 500 }
    );
  }
}