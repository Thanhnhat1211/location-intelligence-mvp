import { NextRequest, NextResponse } from "next/server";
import { readComps } from "@/lib/file-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/dataset/comps
 * Lấy danh sách comparable properties
 * Query params: ?limit=20
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const limitParam = searchParams.get("limit");
    const limit = limitParam ? parseInt(limitParam, 10) : undefined;

    const allComps = await readComps();
    
    // Sort by created date (newest first)
    const sortedComps = allComps.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    const comps = limit ? sortedComps.slice(0, limit) : sortedComps;

    return NextResponse.json({
      comps,
      total: allComps.length,
    });
  } catch (error) {
    console.error("Error reading comps:", error);
    return NextResponse.json(
      {
        error: "Không thể tải danh sách comps",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
