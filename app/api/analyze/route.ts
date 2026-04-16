import { NextRequest, NextResponse } from "next/server";
import { analyzeLocation } from "@/lib/analysis-engine";
import { enhanceStrategyMemo } from "@/lib/ai-client";
import { saveAnalysis } from "@/lib/file-store";
import type { AnalysisFilters } from "@/types/analysis";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const filters: AnalysisFilters = await request.json();

    // Validate required fields
    if (!filters.businessModel) {
      return NextResponse.json(
        { error: "Business model là bắt buộc" },
        { status: 400 }
      );
    }

    const coordinates = filters.centerCoordinates || {
      lat: 10.7756,
      lng: 106.7019,
    };

    // Use address from request or derive from coordinates
    const addressText = (filters as any).addressText || "Địa điểm được chọn";

    // 1. Deterministic engine — always succeeds
    const result = await analyzeLocation(
      { coordinates, addressText },
      filters
    );

    // 2. Optional AI enhancement of strategy memo text.
    //    Falls back to the deterministic memo automatically.
    const competitors = result.nearbyBusinesses.filter(
      (b) => b.type === "competitor"
    );

    result.strategyMemo = await enhanceStrategyMemo(
      result.strategyMemo,
      {
        address: result.location.address.full,
        district: result.location.address.district,
        businessModel: filters.businessModel,
        overallScore: result.confidenceScore,
        breakdown: {
          location: result.businessFitScores[0]?.locationScore ?? 0,
          demographics: result.businessFitScores[0]?.demographicScore ?? 0,
          competition: result.businessFitScores[0]?.competitionScore ?? 0,
          infrastructure: result.businessFitScores[0]?.infrastructureScore ?? 0,
        },
        competitorCount: competitors.length,
        averageRent: result.areaSummary.averageRent,
        medianIncome:
          result.priceEstimate.monthlyRent > 0
            ? result.priceEstimate.monthlyRent
            : 14_000_000,
        vacancyRate: result.areaSummary.vacancyRate,
        marketSaturation: result.areaSummary.marketSaturation,
      }
    );

    // 3. Save to file storage. On read-only filesystems (e.g. Vercel
    //    serverless), this throws — but the analysis itself is valid, so we
    //    return it anyway. History persistence simply won't work.
    let savedResult = result;
    try {
      savedResult = await saveAnalysis(result);
    } catch (err) {
      console.warn(
        "[analyze] saveAnalysis failed (likely read-only FS), returning unsaved result:",
        err instanceof Error ? err.message : err
      );
    }

    return NextResponse.json(savedResult, { status: 201 });
  } catch (error) {
    console.error("Error analyzing location:", error);
    return NextResponse.json(
      {
        error: "Đã xảy ra lỗi khi phân tích địa điểm",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
