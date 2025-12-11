/**
 * API routes for managing hadith chain collections
 *
 * @swagger
 * /api/chains:
 *   get:
 *     summary: List available chain collections
 *     description: Get a list of all saved hadith chain collections available for import
 *     responses:
 *       200:
 *         description: Successful response
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 chains:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       name:
 *                         type: string
 *                         description: Collection filename without extension
 *                         example: "sahih-bukhari-chains"
 *                       displayName:
 *                         type: string
 *                         description: Human-readable collection name
 *                         example: "Sahih Bukhari Chains"
 *                       path:
 *                         type: string
 *                         description: Full filename with extension
 *                         example: "sahih-bukhari-chains.json"
 *                       chainCount:
 *                         type: integer
 *                         description: Number of chains in the collection
 *                         example: 25
 *                       exportedAt:
 *                         type: string
 *                         format: date-time
 *                         nullable: true
 *                         description: When the collection was exported
 *   post:
 *     summary: Load a specific chain collection
 *     description: Load and import a saved hadith chain collection by filename
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - chainPath
 *             properties:
 *               chainPath:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 255
 *                 pattern: '^[a-zA-Z0-9\-_\.]+$'
 *                 description: Filename of the chain collection to load
 *                 example: "sahih-bukhari-chains.json"
 *     responses:
 *       200:
 *         description: Successful loading
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   description: Complete chain collection data
 *                   properties:
 *                     hadithText:
 *                       type: string
 *                       description: Original hadith text
 *                     chains:
 *                       type: array
 *                       description: Array of hadith chains
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                             description: Unique chain identifier
 *                           narrators:
 *                             type: array
 *                             description: Chain of narrators
 *                           chainText:
 *                             type: string
 *                             description: Arabic chain text
 *                           matn:
 *                             type: string
 *                             description: Hadith content text
 *                           title:
 *                             type: string
 *                             description: Chain title
 *                     activeTab:
 *                       type: string
 *                       description: Currently active tab
 *                     selectedChainIndex:
 *                       type: integer
 *                       description: Selected chain index
 *                     showVisualization:
 *                       type: boolean
 *                       description: Whether visualization is enabled
 *       400:
 *         description: Bad request - invalid chain path
 *       404:
 *         description: Chain collection not found
 *       429:
 *         description: Rate limit exceeded
 *       500:
 *         description: Internal server error
 *
 * @example
 * // List available collections
 * GET /api/chains
 *
 * @example
 * // Load a specific collection
 * POST /api/chains
 * {
 *   "chainPath": "sahih-bukhari-chains.json"
 * }
 */

import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { handleValidationError } from '@/lib/validation/middleware';
import { validateString } from '@/lib/validation';
import { withRateLimit, rateLimiters } from '@/lib/rate-limit';

const GETHandler = async () => {
  try {
    const chainsDir = path.join(process.cwd(), 'chains');

    // Read all JSON files from the chains directory
    const files = await fs.readdir(chainsDir);
    const jsonFiles = files.filter(file => file.endsWith('.json'));

    const chains = await Promise.all(
      jsonFiles.map(async (file) => {
        try {
          const filePath = path.join(chainsDir, file);
          const content = await fs.readFile(filePath, 'utf-8');
          const data = JSON.parse(content);

          // Extract metadata from the chain file
          const chainCount = data.chains ? data.chains.length : 0;
          const title = data.title || data.hadithText || file.replace('.json', '').replace(/-/g, ' ');

          return {
            name: file.replace('.json', ''),
            displayName: title.length > 50 ? title.substring(0, 50) + '...' : title,
            path: file,
            chainCount,
            hadithText: data.hadithText || '',
            exportedAt: data.exportedAt || null,
          };
        } catch (error) {
          console.warn(`Error reading chain file ${file}:`, error);
          return null;
        }
      })
    );

    // Filter out any null entries from failed reads
    const validChains = chains.filter(chain => chain !== null);

    return NextResponse.json({
      success: true,
      chains: validChains
    });
  } catch (error) {
    console.error('Error fetching chains:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch chains' },
      { status: 500 }
    );
  }
}

const POSTHandler = async (request: NextRequest) => {
  try {
    const body = await request.json();
    const { chainPath } = body;

    // Validate chainPath parameter
    const validation = validateString(chainPath, 'chainPath', {
      minLength: 1,
      maxLength: 255,
      pattern: /^[a-zA-Z0-9\-_\.]+$/
    });

    if (!validation.isValid) {
      return handleValidationError(validation.error!);
    }

    const chainsDir = path.join(process.cwd(), 'chains');
    const filePath = path.join(chainsDir, validation.sanitizedValue);

    // Verify the file exists and is within the chains directory
    const normalizedPath = path.resolve(filePath);
    const normalizedChainsDir = path.resolve(chainsDir);

    if (!normalizedPath.startsWith(normalizedChainsDir)) {
      return NextResponse.json(
        { success: false, error: 'Invalid chain path' },
        { status: 400 }
      );
    }

    const content = await fs.readFile(filePath, 'utf-8');
    const data = JSON.parse(content);

    return NextResponse.json({
      success: true,
      data
    });
  } catch (error) {
    console.error('Error loading chain:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to load chain' },
      { status: 500 }
    );
  }
};

// Export with rate limiting applied
export const GET = withRateLimit(GETHandler, rateLimiters.readOnly);
export const POST = withRateLimit(POSTHandler, rateLimiters.api);