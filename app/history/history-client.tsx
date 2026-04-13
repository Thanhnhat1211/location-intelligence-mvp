"use client";

import { useState, useEffect } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { SectionHeader } from "@/components/shared/section-header";
import { HistoryList } from "@/components/history/history-list";
import { LoadingSkeleton } from "@/components/shared/loading-skeleton";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { AnalysisResult, BusinessModel } from "@/types/analysis";
import { FileText, Filter } from "lucide-react";
import { useRouter } from "next/navigation";

export default function HistoryClient() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [analyses, setAnalyses] = useState<AnalysisResult[]>([]);
  const [filteredAnalyses, setFilteredAnalyses] = useState<AnalysisResult[]>([]);
  
  // Filters
  const [businessModelFilter, setBusinessModelFilter] = useState<BusinessModel | "all">("all");
  const [savedOnlyFilter, setSavedOnlyFilter] = useState(false);
  const [dateRangeFilter, setDateRangeFilter] = useState<"all" | "today" | "week" | "month">("all");

  useEffect(() => {
    loadHistory();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [analyses, businessModelFilter, savedOnlyFilter, dateRangeFilter]);

  const loadHistory = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/history");
      if (!response.ok) {
        throw new Error("Không thể tải lịch sử phân tích");
      }
      const data = await response.json();
      setAnalyses(data.analyses || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Đã xảy ra lỗi");
    } finally {
      setIsLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...analyses];

    // Business model filter
    if (businessModelFilter !== "all") {
      filtered = filtered.filter(
        (a) => a.filters.businessModel === businessModelFilter
      );
    }

    // Saved only filter
    if (savedOnlyFilter) {
      filtered = filtered.filter((a) => a.isSaved);
    }

    // Date range filter
    if (dateRangeFilter !== "all") {
      const now = new Date();
      const cutoff = new Date();

      switch (dateRangeFilter) {
        case "today":
          cutoff.setHours(0, 0, 0, 0);
          break;
        case "week":
          cutoff.setDate(now.getDate() - 7);
          break;
        case "month":
          cutoff.setMonth(now.getMonth() - 1);
          break;
      }

      filtered = filtered.filter(
        (a) => new Date(a.createdAt) >= cutoff
      );
    }

    setFilteredAnalyses(filtered);
  };

  const handleView = (analysis: AnalysisResult) => {
    router.push(`/analyze?id=${analysis.id}`);
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/history/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setAnalyses(analyses.filter((a) => a.id !== id));
      }
    } catch (err) {
      console.error("Error deleting analysis:", err);
    }
  };

  const handleRetry = () => {
    loadHistory();
  };

  const clearFilters = () => {
    setBusinessModelFilter("all");
    setSavedOnlyFilter(false);
    setDateRangeFilter("all");
  };

  const hasActiveFilters =
    businessModelFilter !== "all" || savedOnlyFilter || dateRangeFilter !== "all";

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Header */}
        <SectionHeader
          title="Lịch sử phân tích"
          description="Xem lại và quản lý các phân tích địa điểm đã thực hiện"
        />

        {/* Filters */}
        <div className="bg-card rounded-lg border p-4 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <h3 className="font-medium">Bộ lọc</h3>
              {hasActiveFilters && (
                <Badge variant="secondary" className="ml-2">
                  {filteredAnalyses.length} / {analyses.length}
                </Badge>
              )}
            </div>
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
              >
                Xóa bộ lọc
              </Button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Business Model Filter */}
            <div className="space-y-2">
              <Label>Mô hình kinh doanh</Label>
              <Select
                value={businessModelFilter}
                onValueChange={(value) =>
                  setBusinessModelFilter(value as BusinessModel | "all")
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả</SelectItem>
                  <SelectItem value="fnb">F&B</SelectItem>
                  <SelectItem value="airbnb">Airbnb</SelectItem>
                  <SelectItem value="retail">Retail</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Date Range Filter */}
            <div className="space-y-2">
              <Label>Khoảng thời gian</Label>
              <Select
                value={dateRangeFilter}
                onValueChange={(value) =>
                  setDateRangeFilter(value as typeof dateRangeFilter)
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả</SelectItem>
                  <SelectItem value="today">Hôm nay</SelectItem>
                  <SelectItem value="week">7 ngày qua</SelectItem>
                  <SelectItem value="month">30 ngày qua</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Saved Only Filter */}
            <div className="space-y-2">
              <Label>Trạng thái lưu</Label>
              <Button
                variant={savedOnlyFilter ? "default" : "outline"}
                className="w-full justify-start"
                onClick={() => setSavedOnlyFilter(!savedOnlyFilter)}
              >
                {savedOnlyFilter ? "Chỉ đã lưu" : "Tất cả"}
              </Button>
            </div>
          </div>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="space-y-4">
            <LoadingSkeleton count={5} height={120} />
          </div>
        ) : error ? (
          <ErrorState
            title="Không thể tải lịch sử"
            description={error}
            onRetry={handleRetry}
          />
        ) : filteredAnalyses.length === 0 ? (
          <EmptyState
            icon={FileText}
            title={hasActiveFilters ? "Không tìm thấy kết quả" : "Chưa có phân tích nào"}
            description={
              hasActiveFilters
                ? "Thử điều chỉnh bộ lọc để xem nhiều kết quả hơn"
                : "Bắt đầu phân tích địa điểm đầu tiên của bạn"
            }
            action={{
              label: hasActiveFilters ? "Xóa bộ lọc" : "Phân tích ngay",
              onClick: hasActiveFilters ? clearFilters : () => router.push("/analyze"),
            }}
          />
        ) : (
          <HistoryList
            analyses={filteredAnalyses}
            onView={handleView}
            onDelete={handleDelete}
          />
        )}
      </div>
    </AppShell>
  );
}
