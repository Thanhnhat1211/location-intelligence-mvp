/**
 * Error State Component
 * Component hiển thị trạng thái lỗi với thông tin chi tiết và tùy chọn thử lại
 */

"use client";

import { useState } from "react";
import { AlertTriangle, ChevronDown, ChevronUp, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ErrorStateProps {
  /** Tiêu đề lỗi */
  title: string;
  /** Mô tả lỗi */
  description: string;
  /** Đối tượng Error (tùy chọn) */
  error?: Error;
  /** Callback khi nhấn thử lại (tùy chọn) */
  onRetry?: () => void;
  /** Class name tùy chỉnh */
  className?: string;
}

/**
 * Component hiển thị trạng thái lỗi
 * Hiển thị thông báo lỗi với tùy chọn xem chi tiết và thử lại
 */
export function ErrorState({
  title,
  description,
  error,
  onRetry,
  className,
}: ErrorStateProps) {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <div
      className={cn(
        "flex min-h-[400px] w-full flex-col items-center justify-center rounded-lg border border-red-200 bg-red-50/50 px-6 py-12 text-center dark:border-red-900/50 dark:bg-red-950/20",
        className
      )}
    >
      {/* Error Icon */}
      <div className="mb-4 rounded-full bg-red-100 p-4 dark:bg-red-900/30">
        <AlertTriangle className="h-8 w-8 text-red-600 dark:text-red-500" />
      </div>

      {/* Title */}
      <h3 className="mb-2 text-lg font-semibold text-red-900 dark:text-red-300">
        {title}
      </h3>

      {/* Description */}
      <p className="mb-6 max-w-md text-sm text-red-700 dark:text-red-400">
        {description}
      </p>

      {/* Actions */}
      <div className="flex flex-col items-center gap-3">
        {/* Retry Button */}
        {onRetry && (
          <Button
            onClick={onRetry}
            variant="default"
            className="gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Thử lại
          </Button>
        )}

        {/* Show Technical Details */}
        {error && (
          <Button
            onClick={() => setShowDetails(!showDetails)}
            variant="ghost"
            size="sm"
            className="gap-1 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
          >
            {showDetails ? (
              <>
                <ChevronUp className="h-4 w-4" />
                Ẩn chi tiết kỹ thuật
              </>
            ) : (
              <>
                <ChevronDown className="h-4 w-4" />
                Xem chi tiết kỹ thuật
              </>
            )}
          </Button>
        )}
      </div>

      {/* Technical Details */}
      {error && showDetails && (
        <div className="mt-6 w-full max-w-2xl rounded-lg border border-red-300 bg-red-100/50 p-4 text-left dark:border-red-800 dark:bg-red-950/30">
          <h4 className="mb-2 text-sm font-semibold text-red-900 dark:text-red-300">
            Chi tiết lỗi:
          </h4>
          <pre className="overflow-x-auto text-xs text-red-800 dark:text-red-400">
            {error.message}
          </pre>
          {error.stack && (
            <>
              <h4 className="mb-2 mt-4 text-sm font-semibold text-red-900 dark:text-red-300">
                Stack trace:
              </h4>
              <pre className="overflow-x-auto text-xs text-red-800 dark:text-red-400">
                {error.stack}
              </pre>
            </>
          )}
        </div>
      )}
    </div>
  );
}
