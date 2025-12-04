import { NextResponse } from "next/server";
import { intelligentCache } from "@/lib/cache";
import { dataReshaper } from "@/lib/dataReshaper";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { 
      url,
      method = "GET",
      headers = {},
      refreshInterval = 60, // Default refresh interval in seconds
      maxAge = 3600, // Maximum age before data is invalid (1 hour)
    } = body;

    if (!url) {
      return NextResponse.json(
        { success: false, error: "URL is required" },
        { status: 400 }
      );
    }

    // Use intelligent cache with configurable options
    const cacheOptions = {
      refreshInterval,
      maxAge,
    };

    const result = await intelligentCache.get(url, cacheOptions);
    const flattened = dataReshaper(result.data);

    return NextResponse.json({
      success: true,
      raw: result.data,
      flattened,
      cached: result.cached,
      stale: result.stale || false,
      fromFallback: result.fromFallback || false,
      metadata: {
        refreshInterval,
        maxAge,
        timestamp: Date.now(),
      }
    });

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
