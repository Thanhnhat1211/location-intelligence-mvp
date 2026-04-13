
import { NextRequest, NextResponse } from "next/server";
import { getAnalysisById, updateAnalysis, deleteAnalysis } from "@/lib/file-store";

export const runtime = "nodejs";

/**
 * GET /api/history/[id]
 * Lấy chi tiết một phân tích
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const analysis = await getAnalysisById(params.id);

    if (!analysis) {
      return NextResponse.json(
        { error: "Không tìm thấy phân tích" },
        { status: 404 }
      );
    }

    return NextResponse.json(analysis);
  } catch (error) {
    console.error("Error getting analysis:", error);
    return NextResponse.json(
      {
        error: "Không thể tải phân tích",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/history/[id]
 * Cập nhật phân tích (isSaved, notes)
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const updates = await request.json();

    // Validate updates
    const allowedFields = ["isSaved", "notes"];
    const invalidFields = Object.keys(updates).filter(
      (key) => !allowedFields.includes(key)
    );

    if (invalidFields.length > 0) {
      return NextResponse.json(
        { error: `Không thể cập nhật các trường: ${invalidFields.join(", ")}` },
        { status: 400 }
      );
    }

    const updatedAnalysis = await updateAnalysis(params.id, updates);

    if (!updatedAnalysis) {
      return NextResponse.json(
        { error: "Không tìm thấy phân tích" },
        { status: 404 }
      );
    }

    return NextResponse.json(updatedAnalysis);
  } catch (error) {
    console.error("Error updating analysis:", error);
    return NextResponse.json(
      {
        error: "Không thể cập nhật phân tích",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/history/[id]
 * Xóa một phân tích
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const deleted = await deleteAnalysis(params.id);

    if (!deleted) {
      return NextResponse.json(
        { error: "Không tìm thấy phân tích" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Đã xóa phân tích thành công",
    });
  } catch (error) {
    console.error("Error deleting analysis:", error);
    return NextResponse.json(
      {
        error: "Không thể xóa phân tích",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
