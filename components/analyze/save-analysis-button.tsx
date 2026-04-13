/**
 * Save Analysis Button Component
 * Nút lưu/bỏ lưu kết quả phân tích
 */

"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Bookmark, BookmarkCheck } from "lucide-react";

interface SaveAnalysisButtonProps {
  analysisId: string;
  isSaved: boolean;
  onToggle: (saved: boolean) => void | Promise<void>;
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg" | "icon";
  showLabel?: boolean;
}

export function SaveAnalysisButton({
  analysisId,
  isSaved: initialIsSaved,
  onToggle,
  variant = "outline",
  size = "default",
  showLabel = true,
}: SaveAnalysisButtonProps) {
  const [isSaved, setIsSaved] = useState(initialIsSaved);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleToggleSave = async () => {
    // Optimistic update
    const newSavedState = !isSaved;
    setIsSaved(newSavedState);
    setIsLoading(true);

    try {
      await onToggle(newSavedState);
      
      toast({
        title: newSavedState ? "Đã lưu phân tích" : "Đã bỏ lưu phân tích",
        description: newSavedState
          ? "Bạn có thể xem lại phân tích này trong phần đã lưu"
          : "Phân tích đã được xóa khỏi danh sách đã lưu",
      });
    } catch (error) {
      // Revert optimistic update on error
      setIsSaved(!newSavedState);
      
      toast({
        title: "Có lỗi xảy ra",
        description: "Không thể lưu phân tích. Vui lòng thử lại.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      variant={isSaved ? "default" : variant}
      size={size}
      onClick={handleToggleSave}
      disabled={isLoading}
      className={isSaved ? "gap-2" : "gap-2"}
    >
      {isSaved ? (
        <>
          <BookmarkCheck className="w-4 h-4" />
          {showLabel && <span>Đã lưu</span>}
        </>
      ) : (
        <>
          <Bookmark className="w-4 h-4" />
          {showLabel && <span>Lưu phân tích</span>}
        </>
      )}
    </Button>
  );
}
