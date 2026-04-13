"use client";

import { useState, useEffect } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { AnalyzeFiltersPanel } from "@/components/analyze/analyze-filters-panel";
import { LocationMap } from "@/components/analyze/location-map";
import { BusinessFitGrid } from "@/components/analyze/business-fit-grid";
import { AreaSummaryCard } from "@/components/analyze/area-summary-card";
import { NearbyBusinessBreakdown } from "@/components/analyze/nearby-business-breakdown";
import { PriceEstimateCard } from "@/components/analyze/price-estimate-card";
import { RiskFlagsCard } from "@/components/analyze/risk-flags-card";
import { StrategyMemoCard } from "@/components/analyze/strategy-memo-card";
import { SaveAnalysisButton } from "@/components/analyze/save-analysis-button";
import { LoadingSkeleton } from "@/components/shared/loading-skeleton";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { AnalysisFilters, AnalysisResult } from "@/types/analysis";
import { Coordinates } from "@/types/location";
import { MapPin, Search } from "lucide-react";
import { useSearchParams } from "next/navigation";

export default function AnalyzeClient() {
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [selectedCoords, setSelectedCoords] = useState<Coordinates | null>(null);
  const [selectedAddress, setSelectedAddress] = useState<string>("");

  useEffect(() => {
    const analysisId = searchParams.get("id");
    if (analysisId) {
      loadAnalysis(analysisId);
    }
  }, [searchParams]);

  const loadAnalysis = async (id: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/history/${id}`);
      if (!response.ok) {
        throw new Error("Không thể tải phân tích");
      }
      const data = await response.json();
      setAnalysisResult(data);
      setSelectedCoords(data.location.coordinates);
      setSelectedAddress(data.location.address.full);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Đã xảy ra lỗi");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLocationSelect = (coords: Coordinates, address: string) => {
    setSelectedCoords(coords);
    setSelectedAddress(address);
  };

  const handleAnalyze = async (filters: AnalysisFilters) => {
    if (!selectedCoords) {
      setError("Vui lòng chọn vị trí trên bản đồ trước khi phân tích");
      return;
    }

    setIsLoading(true);
    setError(null);
    setAnalysisResult(null);

    try {
      const filtersWithCoords: AnalysisFilters = {
        ...filters,
        centerCoordinates: selectedCoords,
      };

      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(filtersWithCoords),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Phân tích thất bại");
      }

      const data = await response.json();
      setAnalysisResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Đã xảy ra lỗi khi phân tích");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRetry = () => {
    setError(null);
    setAnalysisResult(null);
  };

  const handleSaveToggle = async (isSaved: boolean) => {
    if (!analysisResult) return;

    try {
      const response = await fetch(`/api/history/${analysisResult.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isSaved }),
      });

      if (response.ok) {
        setAnalysisResult({ ...analysisResult, isSaved });
      }
    } catch (err) {
      console.error("Error saving analysis:", err);
    }
  };

  return (
    <AppShell>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Panel - Map + Filters */}
        <div className="lg:col-span-1 space-y-4">
          {/* Map for selecting location */}
          <LocationMap
            coordinates={selectedCoords}
            onLocationSelect={handleLocationSelect}
            nearbyBusinesses={analysisResult?.nearbyBusinesses}
          />

          {/* Filters */}
          <div className="sticky top-6">
            <AnalyzeFiltersPanel
              onAnalyze={handleAnalyze}
              isLoading={isLoading}
              initialFilters={analysisResult?.filters}
              selectedLocation={selectedCoords ? { coords: selectedCoords, address: selectedAddress } : undefined}
            />
          </div>
        </div>

        {/* Right Panel - Results */}
        <div className="lg:col-span-2">
          {isLoading ? (
            <div className="space-y-6">
              <LoadingSkeleton count={1} height={300} />
              <LoadingSkeleton count={2} height={200} />
              <LoadingSkeleton count={1} height={400} />
            </div>
          ) : error ? (
            <ErrorState
              title="Phân tích thất bại"
              description={error}
              onRetry={handleRetry}
            />
          ) : analysisResult ? (
            <div className="space-y-6">
              {/* Business Fit Scores */}
              <BusinessFitGrid businessFitScores={analysisResult.businessFitScores} />

              {/* Area Summary */}
              <AreaSummaryCard areaSummary={analysisResult.areaSummary} />

              {/* Nearby Businesses */}
              <NearbyBusinessBreakdown nearbyBusinesses={analysisResult.nearbyBusinesses} />

              {/* Price Estimate */}
              <PriceEstimateCard priceEstimate={analysisResult.priceEstimate} />

              {/* Risk Flags */}
              <RiskFlagsCard riskFlags={analysisResult.riskFlags} />

              {/* Strategy Memo */}
              <StrategyMemoCard strategyMemo={analysisResult.strategyMemo} />

              {/* Save Analysis Button */}
              <SaveAnalysisButton
                isSaved={analysisResult.isSaved}
                onToggle={handleSaveToggle}
                analysisId={analysisResult.id}
              />
            </div>
          ) : (
            <EmptyState
              icon={Search}
              title="Sẵn sàng phân tích"
              description="Chọn vị trí trên bản đồ và mô hình kinh doanh bên trái để bắt đầu phân tích thông minh"
            />
          )}
        </div>
      </div>
    </AppShell>
  );
}
