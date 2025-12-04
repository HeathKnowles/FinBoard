import { NextResponse } from "next/server";
import { intelligentCache } from "@/lib/cache";
import { dataReshaper, convertTimeSeriesData } from "@/lib/dataReshaper";

export const runtime = 'nodejs';

const RESPONSE_HEADERS = {
  'Cache-Control': 'public, s-maxage=10, stale-while-revalidate=30',
  'CDN-Cache-Control': 'public, s-maxage=60',
  'Vary': 'Accept-Encoding',
};

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { 
      url,
      method = "GET",
      headers = {},
      refreshInterval = 60, 
      maxAge = 3600, 
    } = body;

    if (!url) {
      return NextResponse.json(
        { success: false, error: "URL is required" },
        { status: 400 }
      );
    }

    const cacheOptions = {
      refreshInterval,
      maxAge,
    };

    const result = await intelligentCache.get(url, cacheOptions);
    
    // Convert Alpha Vantage time series to array format if needed
    const timeSeriesArray = convertTimeSeriesData(result.data);
    const processedData = timeSeriesArray || result.data;
    
    const flattened = dataReshaper(result.data);

    const response = NextResponse.json({
      success: true,
      raw: processedData, // Use converted data for widgets
      flattened,
      cached: result.cached,
      stale: result.stale || false,
      fromFallback: result.fromFallback || false,
      metadata: {
        refreshInterval,
        maxAge,
        timestamp: Date.now(),
        originalFormat: timeSeriesArray ? 'alpha-vantage-time-series' : 'standard',
        symbol: result.data?.['Meta Data']?.['2. Symbol'] || null,
      }
    });

    Object.entries(RESPONSE_HEADERS).forEach(([key, value]) => {
      response.headers.set(key, value);
    });

    return response;

  } catch (error: any) {
    console.error('Fetch error:', error.message);
    
    return NextResponse.json(
      {
        success: false,
        error: error?.message || "Fetch failed",
        timestamp: Date.now(),
      },
      { status: 400 }
    );
  }
}
