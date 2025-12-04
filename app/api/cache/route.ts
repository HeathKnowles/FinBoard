import { NextResponse } from "next/server";
import { intelligentCache } from "@/lib/cache";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const action = searchParams.get('action');
    const url = searchParams.get('url');

    switch (action) {
      case 'stats':
        const stats = url ? intelligentCache.getStats(url) : intelligentCache.getStats();
        return NextResponse.json({
          success: true,
          stats,
        });

      case 'cleanup':
        const maxAge = parseInt(searchParams.get('maxAge') || '3600');
        intelligentCache.cleanup(maxAge);
        return NextResponse.json({
          success: true,
          message: `Cleaned up entries older than ${maxAge} seconds`,
        });

      default:
        return NextResponse.json({
          success: true,
          stats: intelligentCache.getStats(),
        });
    }
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error?.message || "Cache operation failed",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const url = searchParams.get('url');
    const refreshInterval = parseInt(searchParams.get('refreshInterval') || '60');

    if (!url) {
      return NextResponse.json(
        { success: false, error: "URL is required for cache invalidation" },
        { status: 400 }
      );
    }

    intelligentCache.invalidate(url, { refreshInterval });

    return NextResponse.json({
      success: true,
      message: `Cache invalidated for ${url}`,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error?.message || "Cache invalidation failed",
      },
      { status: 500 }
    );
  }
}