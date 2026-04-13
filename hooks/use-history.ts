/**
 * Custom hook quản lý lịch sử phân tích
 * Xử lý việc load, filter, delete và pagination cho history
 */

import { useState, useCallback, useEffect, useRef } from "react";
import { AnalysisResult, BusinessModel } from "@/types/analysis";
import { useToast } from "@/components/ui/use-toast";

const ITEMS_PER_PAGE = 10;
const AUTO_REFRESH_INTERVAL = 60000; // 60 seconds

/**
 * Filter options cho history
 */
export interface HistoryFilters {
  /** Lọc theo business model */
  businessModel?: BusinessModel;
  /** Lọc theo khoảng thời gian [từ ngày, đến ngày] */
  dateRange?: [Date, Date];
  /** Lọc theo recommendation level */
  recommendation?: "highly-recommended" | "recommended" | "neutral" | "not-recommended";
  /** Chỉ hiển thị các phân tích đã lưu */
  savedOnly?: boolean;
}

/**
 * Hook để quản lý lịch sử phân tích
 * 
 * @param autoRefresh - Tự động refresh mỗi 60s (default: true)
 * @returns Object chứa state và functions để quản lý history
 * 
 * @example
 * ```tsx
 * const { history, loadHistory, filterHistory, currentPage, totalPages } = useHistory();
 * 
 * useEffect(() => {
 *   loadHistory();
 * }, []);
 * 
 * const fnbAnalyses = filterHistory({ businessModel: "fnb" });
 * ```
 */
export function useHistory(autoRefresh = true) {
  const [history, setHistory] = useState<AnalysisResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const { toast } = useToast();
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null);

  /**
   * Load lịch sử phân tích từ API
   */
  const loadHistory = useCallback(async (): Promise<void> => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/history", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data: AnalysisResult[] = await response.json();

      // Sort theo createdAt mới nhất trước
      const sorted = data.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

      setHistory(sorted);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Có lỗi xảy ra khi load lịch sử";
      setError(errorMessage);

      toast({
        title: "Lỗi tải lịch sử",
        description: errorMessage,
        variant: "destructive",
      });

      throw err;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  /**
   * Lấy history item theo ID
   * 
   * @param id - ID của history item
   * @returns AnalysisResult hoặc undefined
   */
  const getHistoryById = useCallback(
    (id: string): AnalysisResult | undefined => {
      return history.find((item) => item.id === id);
    },
    [history]
  );

  /**
   * Xóa một history item
   * 
   * @param id - ID của item cần xóa
   */
  const deleteHistoryItem = useCallback(
    async (id: string): Promise<void> => {
      try {
        const response = await fetch(`/api/history?id=${id}`, {
          method: "DELETE",
        });

        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }

        // Update local state
        setHistory((prev) => prev.filter((item) => item.id !== id));

        toast({
          title: "Đã xóa",
          description: "Đã xóa phân tích khỏi lịch sử",
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
    },
    [toast]
  );

  /**
   * Xóa toàn bộ lịch sử
   */
  const clearHistory = useCallback(async (): Promise<void> => {
    try {
      const response = await fetch("/api/history", {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      setHistory([]);
      setCurrentPage(1);

      toast({
        title: "Đã xóa lịch sử",
        description: "Toàn bộ lịch sử phân tích đã được xóa",
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Có lỗi xảy ra khi xóa lịch sử";
      toast({
        title: "Lỗi",
        description: errorMessage,
        variant: "destructive",
      });
      throw err;
    }
  }, [toast]);

  /**
   * Filter history theo các tiêu chí
   * 
   * @param filters - Bộ lọc
   * @returns Danh sách history đã được filter
   */
  const filterHistory = useCallback(
    (filters: HistoryFilters): AnalysisResult[] => {
      let filtered = [...history];

      // Filter theo business model
      if (filters.businessModel) {
        filtered = filtered.filter(
          (item) => item.filters.businessModel === filters.businessModel
        );
      }

      // Filter theo date range
      if (filters.dateRange) {
        const [startDate, endDate] = filters.dateRange;
        filtered = filtered.filter((item) => {
          const itemDate = new Date(item.createdAt);
          return itemDate >= startDate && itemDate <= endDate;
        });
      }

      // Filter theo recommendation
      if (filters.recommendation) {
        filtered = filtered.filter(
          (item) => item.recommendation === filters.recommendation
        );
      }

      // Filter theo saved only
      if (filters.savedOnly) {
        filtered = filtered.filter((item) => item.isSaved);
      }

      return filtered;
    },
    [history]
  );

  /**
   * Tính tổng số trang
   */
  const totalPages = Math.ceil(history.length / ITEMS_PER_PAGE);

  /**
   * Lấy items cho trang hiện tại
   */
  const paginatedHistory = history.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  /**
   * Chuyển trang
   */
  const goToPage = useCallback((page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  }, [totalPages]);

  /**
   * Setup auto-refresh khi component mount
   */
  useEffect(() => {
    if (autoRefresh) {
      // Load ngay lần đầu
      loadHistory();

      // Setup interval
      refreshIntervalRef.current = setInterval(() => {
        loadHistory();
      }, AUTO_REFRESH_INTERVAL);

      return () => {
        if (refreshIntervalRef.current) {
          clearInterval(refreshIntervalRef.current);
        }
      };
    }
  }, [autoRefresh, loadHistory]);

  /**
   * Cleanup khi unmount
   */
  useEffect(() => {
    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
    };
  }, []);

  return {
    // State
    history,
    paginatedHistory,
    loading,
    error,
    currentPage,
    totalPages,
    itemsPerPage: ITEMS_PER_PAGE,

    // Functions
    loadHistory,
    getHistoryById,
    deleteHistoryItem,
    clearHistory,
    filterHistory,
    goToPage,
  };
}

/**
 * Type definitions cho hook
 */
export type UseHistoryReturn = ReturnType<typeof useHistory>;
