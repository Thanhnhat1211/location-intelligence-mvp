"use client";

/**
 * History List Component
 * Danh sách các phân tích đã thực hiện với filter và search
 */

import React, { useState, useMemo } from "react";
import { HistoryCard } from "./history-card";
import { AnalysisResult, BusinessModel } from "@/types/analysis";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { LoadingSkeleton } from "@/components/shared/loading-skeleton";
import { EmptyState } from "@/components/shared/empty-state";
import {
  Search,
  Filter,
  SortAsc,
  SortDesc,
  Grid3x3,
  List,
  Calendar,
  TrendingUp,
  History,
  X,
} from "lucide-react";

interface HistoryListProps {
  analyses: AnalysisResult[];
  onView: (analysis: AnalysisResult) => void;
  onDelete: (analysisId: string) => void;
  isLoading?: boolean;
}

type SortBy = "date-desc" | "date-asc" | "score-desc" | "score-asc";
type LayoutMode = "grid" | "list";

const businessModelLabels: Record<BusinessModel | "all", string> = {
  all: "Tất cả mô hình",
  fnb: "F&B - Nhà hàng",
  airbnb: "Airbnb - Homestay",
  retail: "Bán lẻ - Cửa hàng",
};

const sortOptions: Record<SortBy, string> = {
  "date-desc": "Mới nhất",
  "date-asc": "Cũ nhất",
  "score-desc": "Điểm cao nhất",
  "score-asc": "Điểm thấp nhất",
};

export function HistoryList({
  analyses,
  onView,
  onDelete,
  isLoading = false,
}: HistoryListProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [businessModelFilter, setBusinessModelFilter] = useState<
    BusinessModel | "all"
  >("all");
  const [sortBy, setSortBy] = useState<SortBy>("date-desc");
  const [layoutMode, setLayoutMode] = useState<LayoutMode>("grid");
  const [showFilters, setShowFilters] = useState(false);

  // Filter và sort analyses
  const filteredAndSortedAnalyses = useMemo(() => {
    let result = [...analyses];

    // Filter by business model
    if (businessModelFilter !== "all") {
      result = result.filter(
        (analysis) => analysis.filters.businessModel === businessModelFilter
      );
    }

    // Filter by search query (địa chỉ)
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      result = result.filter((analysis) => {
        const address = analysis.location.address;
        const fullAddress = `${address.street} ${address.ward} ${address.district} ${address.city}`.toLowerCase();
        return fullAddress.includes(query);
      });
    }

    // Sort
    result.sort((a, b) => {
      switch (sortBy) {
        case "date-desc":
          return (
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
        case "date-asc":
          return (
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          );
        case "score-desc":
          return b.confidenceScore - a.confidenceScore;
        case "score-asc":
          return a.confidenceScore - b.confidenceScore;
        default:
          return 0;
      }
    });

    return result;
  }, [analyses, businessModelFilter, searchQuery, sortBy]);

  // Statistics
  const stats = useMemo(() => {
    return {
      total: analyses.length,
      highlyRecommended: analyses.filter(
        (a) => a.recommendation === "highly-recommended"
      ).length,
      saved: analyses.filter((a) => a.isSaved).length,
      avgScore:
        analyses.length > 0
          ? analyses.reduce((sum, a) => sum + a.confidenceScore, 0) /
            analyses.length
          : 0,
    };
  }, [analyses]);

  const clearFilters = () => {
    setSearchQuery("");
    setBusinessModelFilter("all");
    setSortBy("date-desc");
  };

  const hasActiveFilters =
    searchQuery.trim() !== "" || businessModelFilter !== "all";

  if (isLoading) {
    return (
      <div className="space-y-6">
        <LoadingSkeleton count={3} height={200} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Statistics Bar */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 rounded-lg border border-blue-200 dark:border-blue-800">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500 rounded-lg">
              <History className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Tổng phân tích</p>
              <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                {stats.total}
              </p>
            </div>
          </div>
        </div>

        <div className="p-4 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 rounded-lg border border-green-200 dark:border-green-800">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-500 rounded-lg">
              <TrendingUp className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Rất phù hợp</p>
              <p className="text-2xl font-bold text-green-900 dark:text-green-100">
                {stats.highlyRecommended}
              </p>
            </div>
          </div>
        </div>

        <div className="p-4 bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-950 dark:to-yellow-900 rounded-lg border border-yellow-200 dark:border-yellow-800">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-500 rounded-lg">
              <Calendar className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Đã lưu</p>
              <p className="text-2xl font-bold text-yellow-900 dark:text-yellow-100">
                {stats.saved}
              </p>
            </div>
          </div>
        </div>

        <div className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 rounded-lg border border-purple-200 dark:border-purple-800">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-500 rounded-lg">
              <TrendingUp className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Điểm TB</p>
              <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">
                {stats.avgScore.toFixed(0)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Tìm kiếm theo địa chỉ..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-10"
            />
            {searchQuery && (
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-1 top-1/2 transform -translate-y-1/2 h-7 w-7 p-0"
                onClick={() => setSearchQuery("")}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>

          {/* Filter Toggle */}
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="gap-2"
          >
            <Filter className="h-4 w-4" />
            Bộ lọc
            {hasActiveFilters && (
              <Badge variant="secondary" className="ml-1">
                {(searchQuery ? 1 : 0) + (businessModelFilter !== "all" ? 1 : 0)}
              </Badge>
            )}
          </Button>

          {/* Layout Toggle */}
          <div className="flex gap-1 border rounded-lg p-1">
            <Button
              variant={layoutMode === "grid" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setLayoutMode("grid")}
              className="px-3"
            >
              <Grid3x3 className="h-4 w-4" />
            </Button>
            <Button
              variant={layoutMode === "list" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setLayoutMode("list")}
              className="px-3"
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Expandable Filters */}
        {showFilters && (
          <div className="p-4 border rounded-lg bg-muted/30 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Business Model Filter */}
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Mô hình kinh doanh
                </label>
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
                    {Object.entries(businessModelLabels).map(([key, label]) => (
                      <SelectItem key={key} value={key}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Sort By */}
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Sắp xếp theo
                </label>
                <Select
                  value={sortBy}
                  onValueChange={(value) => setSortBy(value as SortBy)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(sortOptions).map(([key, label]) => (
                      <SelectItem key={key} value={key}>
                        <div className="flex items-center gap-2">
                          {key.includes("desc") ? (
                            <SortDesc className="h-4 w-4" />
                          ) : (
                            <SortAsc className="h-4 w-4" />
                          )}
                          {label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Clear Filters */}
            {hasActiveFilters && (
              <Button
                variant="outline"
                size="sm"
                onClick={clearFilters}
                className="gap-2"
              >
                <X className="h-4 w-4" />
                Xóa bộ lọc
              </Button>
            )}
          </div>
        )}

        {/* Active filters display */}
        {hasActiveFilters && !showFilters && (
          <div className="flex flex-wrap gap-2">
            {businessModelFilter !== "all" && (
              <Badge variant="secondary" className="gap-2">
                {businessModelLabels[businessModelFilter]}
                <X
                  className="h-3 w-3 cursor-pointer"
                  onClick={() => setBusinessModelFilter("all")}
                />
              </Badge>
            )}
            {searchQuery && (
              <Badge variant="secondary" className="gap-2">
                Tìm kiếm: "{searchQuery}"
                <X
                  className="h-3 w-3 cursor-pointer"
                  onClick={() => setSearchQuery("")}
                />
              </Badge>
            )}
          </div>
        )}
      </div>

      {/* Results count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Hiển thị {filteredAndSortedAnalyses.length} / {analyses.length} phân
          tích
        </p>
      </div>

      {/* Analysis List/Grid */}
      {filteredAndSortedAnalyses.length === 0 ? (
        <EmptyState
          icon={History}
          title={
            hasActiveFilters
              ? "Không tìm thấy phân tích nào"
              : "Chưa có phân tích nào"
          }
          description={
            hasActiveFilters
              ? "Thử điều chỉnh bộ lọc hoặc tìm kiếm để xem kết quả khác."
              : "Bắt đầu phân tích địa điểm để xem lịch sử tại đây."
          }
          action={
            hasActiveFilters
              ? { label: "Xóa bộ lọc", onClick: clearFilters }
              : undefined
          }
        />
      ) : (
        <div
          className={
            layoutMode === "grid"
              ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              : "space-y-4"
          }
        >
          {filteredAndSortedAnalyses.map((analysis) => (
            <HistoryCard
              key={analysis.id}
              analysis={analysis}
              onView={onView}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}
