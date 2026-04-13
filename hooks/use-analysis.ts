/**
 * Custom hook quản lý phân tích địa điểm
 * Xử lý việc tạo, lưu, xóa và quản lý các analysis results
 */

import { useState, useCallback, useEffect } from "react";
import { AnalysisResult, AnalysisFilters } from "@/types/analysis";
import { useToast } from "@/components/ui/use-toast";

const STORAGE_KEY = "location-intelligence-analyses";

/**
 * Hook để quản lý các phân tích địa điểm
 * 
 * @returns Object chứa state và functions để quản lý analyses
 * 
 * @example
 * ```tsx
 * const { analyzeLocation, currentAnalysis, loading } = useAnalysis();
 * 
 * const handleAnalyze = async () => {
 *   const result = await analyzeLocation({
 *     businessModel: "fnb",
 *     targetRevenue: 50000000
 *   });
 * };
 * ```
 */
export function useAnalysis() {
  const [currentAnalysis, setCurrentAnalysis] = useState<AnalysisResult | null>(null);
  const [analyses, setAnalyses] = useState<AnalysisResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  /**
   * Load analyses từ localStorage khi component mount
   */
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setAnalyses(parsed);
      }
    } catch (err) {
      console.error("Lỗi khi load analyses từ localStorage:", err);
    }
  }, []);

  /**
   * Save analyses vào localStorage mỗi khi thay đổi
   */
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(analyses));
    } catch (err) {
      console.error("Lỗi khi save analyses vào localStorage:", err);
    }
  }, [analyses]);

  /**
   * Phân tích một địa điểm dựa trên filters
   * 
   * @param filters - Bộ lọc và thông số phân tích
   * @returns Promise resolve với AnalysisResult
   */
  const analyzeLocation = useCallback(async (filters: AnalysisFilters): Promise<AnalysisResult> => {
    setLoading(true);
    setError(null);

    try {
      // Gọi API phân tích
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(filters),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const result: AnalysisResult = await response.json();

      // Update current analysis
      setCurrentAnalysis(result);

      // Thêm vào danh sách analyses
      setAnalyses((prev) => {
        const filtered = prev.filter((a) => a.id !== result.id);
        return [result, ...filtered];
      });

      toast({
        title: "Phân tích thành công",
        description: `Đã hoàn thành phân tích cho ${result.location.address.full}`,
      });

      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Có lỗi xảy ra khi phân tích";
      setError(errorMessage);

      toast({
        title: "Lỗi phân tích",
        description: errorMessage,
        variant: "destructive",
      });

      throw err;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  /**
   * Lấy analysis theo ID
   * 
   * @param id - ID của analysis cần tìm
   * @returns AnalysisResult hoặc undefined nếu không tìm thấy
   */
  const getAnalysis = useCallback((id: string): AnalysisResult | undefined => {
    return analyses.find((a) => a.id === id);
  }, [analyses]);

  /**
   * Lưu/bookmark một analysis
   * 
   * @param id - ID của analysis cần lưu
   * @param notes - Ghi chú tùy chọn
   */
  const saveAnalysis = useCallback(async (id: string, notes?: string): Promise<void> => {
    try {
      setAnalyses((prev) =>
        prev.map((a) =>
          a.id === id
            ? {
                ...a,
                isSaved: true,
                notes: notes || a.notes,
                updatedAt: new Date().toISOString(),
              }
            : a
        )
      );

      // Update current analysis nếu đang hiển thị
      if (currentAnalysis?.id === id) {
        setCurrentAnalysis((prev) =>
          prev
            ? {
                ...prev,
                isSaved: true,
                notes: notes || prev.notes,
                updatedAt: new Date().toISOString(),
              }
            : null
        );
      }

      toast({
        title: "Đã lưu phân tích",
        description: "Phân tích đã được bookmark thành công",
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Có lỗi xảy ra khi lưu";
      toast({
        title: "Lỗi",
        description: errorMessage,
        variant: "destructive",
      });
      throw err;
    }
  }, [currentAnalysis, toast]);

  /**
   * Xóa một analysis
   * 
   * @param id - ID của analysis cần xóa
   */
  const deleteAnalysis = useCallback(async (id: string): Promise<void> => {
    try {
      setAnalyses((prev) => prev.filter((a) => a.id !== id));

      // Clear current analysis nếu đang hiển thị
      if (currentAnalysis?.id === id) {
        setCurrentAnalysis(null);
      }

      toast({
        title: "Đã xóa phân tích",
        description: "Phân tích đã được xóa khỏi danh sách",
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Có lỗi xảy ra khi xóa";
      toast({
        title: "Lỗi",
        description: errorMessage,
        variant: "destructive",
      });
      throw err;
    }
  }, [currentAnalysis, toast]);

  /**
   * Clear analysis hiện tại
   */
  const clearCurrentAnalysis = useCallback(() => {
    setCurrentAnalysis(null);
    setError(null);
  }, []);

  return {
    // State
    currentAnalysis,
    analyses,
    loading,
    error,

    // Functions
    analyzeLocation,
    getAnalysis,
    saveAnalysis,
    deleteAnalysis,
    clearCurrentAnalysis,
  };
}

/**
 * Type definitions cho hook
 */
export type UseAnalysisReturn = ReturnType<typeof useAnalysis>;
