"use client";

import { useState, useEffect } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { SectionHeader } from "@/components/shared/section-header";
import { UploadCompsCard } from "@/components/data/upload-comps-card";
import { DatasetStatsCard } from "@/components/data/dataset-stats-card";
import { CompTablePreview } from "@/components/data/comp-table-preview";
import { LoadingSkeleton } from "@/components/shared/loading-skeleton";
import { ErrorState } from "@/components/shared/error-state";
import { DatasetStats, UploadResult } from "@/types/dataset";
import { useToast } from "@/components/ui/use-toast";

export default function DataClient() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<DatasetStats | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Try to load from localStorage first
      const cachedStats = localStorage.getItem("dataset-stats");
      if (cachedStats) {
        setStats(JSON.parse(cachedStats));
      }

      // Then fetch fresh data
      const response = await fetch("/api/dataset/stats");
      if (response.ok) {
        const data = await response.json();
        setStats(data);
        localStorage.setItem("dataset-stats", JSON.stringify(data));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không thể tải thống kê dataset");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpload = async (file: File) => {
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/upload-comps", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Upload thất bại");
      }

      const result: UploadResult = await response.json();

      // Show success toast
      toast({
        title: "Upload thành công",
        description: `Đã import ${result.successCount}/${result.totalRows} dòng dữ liệu`,
      });

      // Reload stats
      await loadStats();

      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Đã xảy ra lỗi khi upload";
      toast({
        title: "Upload thất bại",
        description: errorMessage,
        variant: "destructive",
      });
      throw err;
    } finally {
      setIsUploading(false);
    }
  };

  const handleRetry = () => {
    loadStats();
  };

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Header */}
        <SectionHeader
          title="Quản lý Dataset"
          description="Upload và quản lý dữ liệu comparable properties cho phân tích"
        />

        {/* Upload Section */}
        <UploadCompsCard
          onUpload={handleUpload}
          isUploading={isUploading}
        />

        {/* Stats Section */}
        {isLoading && !stats ? (
          <LoadingSkeleton count={1} height={300} />
        ) : error && !stats ? (
          <ErrorState
            title="Không thể tải thống kê"
            description={error}
            onRetry={handleRetry}
          />
        ) : stats ? (
          <DatasetStatsCard stats={stats} onRefresh={loadStats} />
        ) : null}

        {/* Preview Section */}
        <div>
          <SectionHeader
            title="Dữ liệu gần đây"
            description="20 comparable properties mới nhất trong dataset"
          />
          <div className="mt-4">
            <CompTablePreview pageSize={20} />
          </div>
        </div>
      </div>
    </AppShell>
  );
}
