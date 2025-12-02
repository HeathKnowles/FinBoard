import axios from "axios";
import { NextResponse } from "next/server";
import { apiCache } from "@/lib/cache";
import { dataReshaper } from "@/lib/dataReshaper";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { url, method = "GET", headers = {} } = body;

    const cached = apiCache.get(url);
    if (cached) {
      return NextResponse.json({
        success: true,
        raw: cached,
        flattened: dataReshaper(cached),
        cached: true,
      });
    }

    const response = await axios({ url, method, headers });
    const data = response.data;

    apiCache.set(url, data);

    const flattened = dataReshaper(data);

    return NextResponse.json({
      success: true,
      raw: data,
      flattened,
      cached: false,
    });

  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error?.message || "Fetch failed",
      },
      { status: 400 }
    );
  }
}
