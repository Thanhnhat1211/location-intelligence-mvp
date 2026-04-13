import { NextRequest, NextResponse } from "next/server";
import { readAnalyses, clearAnalyses } from "@/lib/file-store";

export const runtime = "nodejs";

/**
 * GET /api/history
 * Lấy danh sách tất cả phân tích
 * Query params: ?limit=5
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const limitParam = searchParams.get("limit");
    const limit = limitParam ? parseInt(limitParam, 10) : undefined;

    const allAnalyses = await readAnalyses();
    const analyses = limit ? allAnalyses.slice(0, limit) : allAnalyses;

    return NextResponse.json({
      analyses,
      total: allAnalyses.length,
    });
  } catch (error) {
    console.error("Error reading analyses:", error);
    return NextResponse.json(
      {
        error: "Không thể tải lịch sử phân tích",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/history
 * Xóa tất cả phân tích
 */
export async function DELETE() {
  try {
    await clearAnalyses();

    return NextResponse.json({
      success: true,
      message: "Đã xóa tất cả lịch sử phân tích",
    });
  } catch (error) {
    console.error("Error clearing analyses:", error);
    return NextResponse.json(
      {
        error: "Không thể xóa lịch sử phân tích",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
