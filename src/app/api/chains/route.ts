import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

export async function GET() {
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

export async function POST(request: NextRequest) {
  try {
    const { chainPath } = await request.json();

    if (!chainPath) {
      return NextResponse.json(
        { success: false, error: 'Chain path is required' },
        { status: 400 }
      );
    }

    const chainsDir = path.join(process.cwd(), 'chains');
    const filePath = path.join(chainsDir, chainPath);

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
}