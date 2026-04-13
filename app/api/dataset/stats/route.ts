import { NextResponse } from "next/server";
import { calculateDatasetStats } from "@/lib/file-store";

export const runtime = "nodejs";

/**
 * GET /api/dataset/stats
 * Lấy thống kê tổng quan về dataset comps
 */
export async function GET() {
  try {
    const stats = await calculateDatasetStats();
    return NextResponse.json(stats);
  } catch (error) {
    console.error("Error calculating dataset stats:", error);
    return NextResponse.json(
      {
        error: "Không thể tính toán thống kê dataset",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
