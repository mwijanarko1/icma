import { NextRequest, NextResponse } from 'next/server';
import { fetchSunnahHadith, isValidCollection } from '@/services/sunnahService';

/**
 * API route to fetch hadith data from sunnah.com
 * GET /api/sunnah?collection=bukhari&hadith=1
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const collection = searchParams.get('collection');
    const hadithParam = searchParams.get('hadith');

    if (!collection || !hadithParam) {
      return NextResponse.json(
        { error: 'Missing required parameters: collection and hadith' },
        { status: 400 }
      );
    }

    if (!isValidCollection(collection)) {
      return NextResponse.json(
        { error: `Invalid collection: ${collection}. Supported collections: bukhari, muslim, nasai, abudawud, tirmidhi, ibnmajah, malik, ahmad, darimi` },
        { status: 400 }
      );
    }

    const hadithNumber = parseInt(hadithParam, 10);
    if (isNaN(hadithNumber) || hadithNumber < 1) {
      return NextResponse.json(
        { error: 'Hadith number must be a positive integer' },
        { status: 400 }
      );
    }

    const hadithData = await fetchSunnahHadith(collection, hadithNumber, {
      timeout: 10000,
      retries: 2,
    });

    if (!hadithData) {
      return NextResponse.json(
        { error: 'Failed to fetch or parse hadith data' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: hadithData,
    });
  } catch (error) {
    console.error('Error fetching hadith from sunnah.com:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'An error occurred while fetching hadith data',
      },
      { status: 500 }
    );
  }
}

