
/**
 * Custom hook quản lý dataset comparable properties
 * Xử lý việc upload, load stats, filter và quản lý comps data
 */

import { useState, useCallback, useEffect } from "react";
import { DatasetStats, PropertyComp, UploadResult } from "@/types/dataset";
import { useToast } from "@/components/ui/use-toast";

const STATS_STORAGE_KEY = "location-intelligence-dataset-stats";
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

/**
 * Filter options cho comps
 */
export interface CompsFilters {
  /** Lọc theo quận/huyện */
  district?: string;
  /** Lọc theo loại property */
  propertyType?: string;
  /** Lọc theo transaction type */
  transactionType?: "sale" | "rent" | "both";
  /** Số lượng tối đa */
  limit?: number;
}

/**
 * Hook để quản lý dataset comparable properties
 * 
 * @returns Object chứa state và functions để quản lý dataset
 * 
 * @example
 * ```tsx
 * const { stats, uploadComps, loadStats, uploading } = useDataset();
 * 
 * const handleUpload = async (file: File) => {
 *   const result = await uploadComps(file);
 *   console.log(`Imported ${result.successCount} comps`);
 * };
 * ```
 */
export function useDataset() {
  const [stats, setStats] = useState<DatasetStats | null>(null);
  const [comps, setComps] = useState<PropertyComp[]>([]);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const { toast } = useToast();

  /**
   * Load stats từ sessionStorage khi mount
   */
  useEffect(() => {
    try {
      const stored = sessionStorage.getItem(STATS_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setStats(parsed);
      }
    } catch (err) {
      console.error("Lỗi khi load stats từ sessionStorage:", err);
    }
  }, []);

  /**
   * Save stats vào sessionStorage khi thay đổi
   */
  useEffect(() => {
    if (stats) {
      try {
        sessionStorage.setItem(STATS_STORAGE_KEY, JSON.stringify(stats));
      } catch (err) {
        console.error("Lỗi khi save stats vào sessionStorage:", err);
      }
    }
  }, [stats]);

  /**
   * Validate file trước khi upload
   * 
   * @param file - File cần validate
   * @throws Error nếu file không hợp lệ
   */
  const validateFile = useCallback((file: File): void => {
    // Check file type
    if (!file.name.endsWith('.csv')) {
      throw new Error("Chỉ chấp nhận file CSV");
    }

    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      throw new Error(`Kích thước file vượt quá ${MAX_FILE_SIZE / 1024 / 1024}MB`);
    }

    // Check if file is empty
    if (file.size === 0) {
      throw new Error("File rỗng");
    }
  }, []);

  /**
   * Load thống kê dataset từ API
   */
  const loadStats = useCallback(async (): Promise<void> => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/dataset/stats", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data: DatasetStats = await response.json();
      setStats(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Có lỗi xảy ra khi load thống kê";
      setError(errorMessage);

      toast({
        title: "Lỗi tải thống kê",
        description: errorMessage,
        variant: "destructive",
      });

      throw err;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  /**
   * Upload file CSV chứa comps data
   * 
   * @param file - File CSV cần upload
   * @returns Promise resolve với UploadResult
   */
  const uploadComps = useCallback(
    async (file: File): Promise<UploadResult> => {
      setUploading(true);
      setError(null);
      setUploadProgress(0);

      try {
        // Validate file
        validateFile(file);

        // Tạo FormData
        const formData = new FormData();
        formData.append("file", file);

        // Simulate progress (vì fetch API không hỗ trợ upload progress)
        const progressInterval = setInterval(() => {
          setUploadProgress((prev) => Math.min(prev + 10, 90));
        }, 200);

        const response = await fetch("/api/upload-comps", {
          method: "POST",
          body: formData,
        });

        clearInterval(progressInterval);
        setUploadProgress(100);

        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }

        const result: UploadResult = await response.json();

        // Reload stats sau khi upload
        await loadStats();

        // Show success toast
        toast({
          title: "Upload thành công",
          description: `Đã import ${result.successCount}/${result.totalRows} comps`,
        });

        // Show warnings nếu có
        if (result.warnings.length > 0) {
          toast({
            title: "Cảnh báo",
            description: `${result.warnings.length} dòng có cảnh báo`,
            variant: "default",
          });
        }

        // Show errors nếu có
        if (result.errors.length > 0) {
          toast({
            title: "Lỗi import",
            description: `${result.errors.length} dòng không thể import`,
            variant: "destructive",
          });
        }

        return result;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Có lỗi xảy ra khi upload";
        setError(errorMessage);

        toast({
          title: "Lỗi upload",
          description: errorMessage,
          variant: "destructive",
        });

        throw err;
      } finally {
        setUploading(false);
        setUploadProgress(0);
      }
    },
    [validateFile, loadStats, toast]
  );

  /**
   * Lấy danh sách comps với filter
   * 
   * @param filters - Bộ lọc tùy chọn
   * @returns Danh sách PropertyComp đã được filter
   */
  const getComps = useCallback(
    (filters?: CompsFilters): PropertyComp[] => {
      let filtered = [...comps];

      if (filters) {
        // Filter theo district
        if (filters.district) {
          filtered = filtered.filter(
            (comp) => comp.address.district === filters.district
          );
        }

        // Filter theo property type
        if (filters.propertyType) {
          filtered = filtered.filter(
            (comp) => comp.propertyType === filters.propertyType
          );
        }

        // Filter theo transaction type
        if (filters.transactionType) {
          filtered = filtered.filter(
            (comp) => comp.transactionType === filters.transactionType ||
                     comp.transactionType === "both"
          );
        }

        // Apply limit
        if (filters.limit) {
          filtered = filtered.slice(0, filters.limit);
        }
      }

      return filtered;
    },
    [comps]
  );

  /**
   * Xóa một comp theo ID
   * 
   * @param id - ID của comp cần xóa
   */
  const deleteComp = useCallback(
    async (id: string): Promise<void> => {
      try {
        const response = await fetch(`/api/dataset/comps?id=${id}`, {
          method: "DELETE",
        });

        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }

        // Update local state
        setComps((prev) => prev.filter((comp) => comp.id !== id));

        // Reload stats
        await loadStats();

        toast({
          title: "Đã xóa",
          description: "Đã xóa comp khỏi dataset",
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
    [loadStats, toast]
  );

  /**
   * Xóa toàn bộ dataset
   */
  const clearDataset = useCallback(async (): Promise<void> => {
    try {
      const response = await fetch("/api/dataset/comps", {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      setComps([]);
      setStats(null);
      sessionStorage.removeItem(STATS_STORAGE_KEY);

      toast({
        title: "Đã xóa dataset",
        description: "Toàn bộ dataset đã được xóa",
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Có lỗi xảy ra khi xóa dataset";
      toast({
        title: "Lỗi",
        description: errorMessage,
        variant: "destructive",
      });
      throw err;
    }
  }, [toast]);

  return {
    // State
    stats,
    comps,
    uploading,
    loading,
    error,
    uploadProgress,

    // Functions
    loadStats,
    uploadComps,
    getComps,
    deleteComp,
    clearDataset,
  };
}

/**
 * Type definitions cho hook
 */
export type UseDatasetReturn = ReturnType<typeof useDataset>;
