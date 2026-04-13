"use client";

/**
 * Upload Comps Card Component
 * Card hiển thị vùng upload file CSV cho comparable properties
 */

import { useState, useCallback, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Upload, FileText, AlertCircle, CheckCircle, X, FileWarning } from "lucide-react";
import { UploadResult } from "@/types/dataset";
import { cn } from "@/lib/utils";

interface UploadCompsCardProps {
  /** Callback khi upload file thành công */
  onUpload: (file: File) => Promise<UploadResult>;
  /** Trạng thái đang upload */
  isUploading?: boolean;
}

export function UploadCompsCard({ onUpload, isUploading = false }: UploadCompsCardProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadResult, setUploadResult] = useState<UploadResult | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [validationError, setValidationError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Validate file
  const validateFile = (file: File): string | null => {
    // Check file type
    if (!file.name.endsWith(".csv")) {
      return "Chỉ chấp nhận file CSV";
    }

    // Check file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return "Kích thước file không được vượt quá 10MB";
    }

    return null;
  };

  // Handle file selection
  const handleFileSelect = useCallback((file: File) => {
    const error = validateFile(file);
    if (error) {
      setValidationError(error);
      setSelectedFile(null);
      return;
    }

    setValidationError(null);
    setSelectedFile(file);
    setUploadResult(null);
  }, []);

  // Handle drag events
  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      const files = e.dataTransfer.files;
      if (files.length > 0) {
        handleFileSelect(files[0]);
      }
    },
    [handleFileSelect]
  );

  // Handle file input change
  const handleFileInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (files && files.length > 0) {
        handleFileSelect(files[0]);
      }
    },
    [handleFileSelect]
  );

  // Handle upload
  const handleUpload = async () => {
    if (!selectedFile) return;

    try {
      setUploadProgress(0);
      
      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => Math.min(prev + 10, 90));
      }, 200);

      const result = await onUpload(selectedFile);
      
      clearInterval(progressInterval);
      setUploadProgress(100);
      setUploadResult(result);
      setSelectedFile(null);
      
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error) {
      console.error("Upload error:", error);
      setValidationError("Có lỗi xảy ra khi upload file");
      setUploadProgress(0);
    }
  };

  // Handle clear
  const handleClear = () => {
    setSelectedFile(null);
    setUploadResult(null);
    setValidationError(null);
    setUploadProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Upload Dữ Liệu Comparable
        </CardTitle>
        <CardDescription>
          Upload file CSV chứa dữ liệu comparable properties để bổ sung dataset
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Drag & Drop Zone */}
        <div
          onDragEnter={handleDragEnter}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={cn(
            "relative border-2 border-dashed rounded-lg p-8 transition-colors cursor-pointer",
            isDragging
              ? "border-primary bg-primary/5"
              : "border-muted-foreground/25 hover:border-muted-foreground/50",
            selectedFile && "border-primary bg-primary/5"
          )}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            onChange={handleFileInputChange}
            className="hidden"
          />

          <div className="flex flex-col items-center justify-center gap-3 text-center">
            {selectedFile ? (
              <>
                <FileText className="h-12 w-12 text-primary" />
                <div>
                  <p className="font-medium">{selectedFile.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {(selectedFile.size / 1024).toFixed(2)} KB
                  </p>
                </div>
              </>
            ) : (
              <>
                <Upload className="h-12 w-12 text-muted-foreground" />
                <div>
                  <p className="font-medium">Kéo thả file CSV vào đây</p>
                  <p className="text-sm text-muted-foreground">
                    hoặc click để chọn file (tối đa 10MB)
                  </p>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Validation Error */}
        {validationError && (
          <div className="flex items-start gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
            <AlertCircle className="h-5 w-5 text-destructive mt-0.5 flex-shrink-0" />
            <p className="text-sm text-destructive">{validationError}</p>
          </div>
        )}

        {/* Upload Progress */}
        {isUploading && uploadProgress > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Đang upload...</span>
              <span>{uploadProgress}%</span>
            </div>
            <Progress value={uploadProgress} />
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button
            onClick={handleUpload}
            disabled={!selectedFile || isUploading}
            className="flex-1"
          >
            <Upload className="h-4 w-4 mr-2" />
            {isUploading ? "Đang Upload..." : "Upload File"}
          </Button>
          {selectedFile && (
            <Button variant="outline" onClick={handleClear} disabled={isUploading}>
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Upload Result */}
        {uploadResult && (
          <div className="space-y-4 pt-4 border-t">
            <div className="flex items-start gap-2">
              {uploadResult.status === "completed" ? (
                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
              ) : uploadResult.status === "partial" ? (
                <FileWarning className="h-5 w-5 text-yellow-600 mt-0.5" />
              ) : (
                <AlertCircle className="h-5 w-5 text-destructive mt-0.5" />
              )}
              <div className="flex-1">
                <p className="font-medium">
                  {uploadResult.status === "completed"
                    ? "Upload thành công!"
                    : uploadResult.status === "partial"
                    ? "Upload hoàn tất với một số lỗi"
                    : "Upload thất bại"}
                </p>
                <p className="text-sm text-muted-foreground">
                  {uploadResult.fileMetadata.filename}
                </p>
              </div>
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-xs text-muted-foreground">Tổng số dòng</p>
                <p className="text-lg font-semibold">{uploadResult.totalRows}</p>
              </div>
              <div className="p-3 bg-green-50 dark:bg-green-950/20 rounded-lg">
                <p className="text-xs text-muted-foreground">Thành công</p>
                <p className="text-lg font-semibold text-green-700 dark:text-green-400">
                  {uploadResult.successCount}
                </p>
              </div>
              <div className="p-3 bg-red-50 dark:bg-red-950/20 rounded-lg">
                <p className="text-xs text-muted-foreground">Thất bại</p>
                <p className="text-lg font-semibold text-red-700 dark:text-red-400">
                  {uploadResult.failedCount}
                </p>
              </div>
              <div className="p-3 bg-yellow-50 dark:bg-yellow-950/20 rounded-lg">
                <p className="text-xs text-muted-foreground">Bỏ qua</p>
                <p className="text-lg font-semibold text-yellow-700 dark:text-yellow-400">
                  {uploadResult.skippedCount}
                </p>
              </div>
            </div>

            {/* Import Summary */}
            {uploadResult.summary && (
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline">
                  Mới: {uploadResult.summary.newComps}
                </Badge>
                <Badge variant="outline">
                  Cập nhật: {uploadResult.summary.updatedComps}
                </Badge>
                <Badge variant="outline">
                  Trùng lặp: {uploadResult.summary.duplicates}
                </Badge>
              </div>
            )}

            {/* Errors */}
            {uploadResult.errors && uploadResult.errors.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium text-destructive">
                  Lỗi ({uploadResult.errors.length}):
                </p>
                <div className="max-h-40 overflow-y-auto space-y-1">
                  {uploadResult.errors.slice(0, 10).map((error, idx) => (
                    <div
                      key={idx}
                      className="text-xs p-2 bg-destructive/10 rounded border border-destructive/20"
                    >
                      <span className="font-medium">Dòng {error.row}:</span>{" "}
                      {error.field && <span className="text-muted-foreground">{error.field} - </span>}
                      {error.message}
                    </div>
                  ))}
                  {uploadResult.errors.length > 10 && (
                    <p className="text-xs text-muted-foreground text-center py-1">
                      ... và {uploadResult.errors.length - 10} lỗi khác
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Warnings */}
            {uploadResult.warnings && uploadResult.warnings.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium text-yellow-700 dark:text-yellow-400">
                  Cảnh báo ({uploadResult.warnings.length}):
                </p>
                <div className="max-h-32 overflow-y-auto space-y-1">
                  {uploadResult.warnings.slice(0, 5).map((warning, idx) => (
                    <div
                      key={idx}
                      className="text-xs p-2 bg-yellow-50 dark:bg-yellow-950/20 rounded border border-yellow-200 dark:border-yellow-900"
                    >
                      <span className="font-medium">Dòng {warning.row}:</span>{" "}
                      {warning.field && <span className="text-muted-foreground">{warning.field} - </span>}
                      {warning.message}
                    </div>
                  ))}
                  {uploadResult.warnings.length > 5 && (
                    <p className="text-xs text-muted-foreground text-center py-1">
                      ... và {uploadResult.warnings.length - 5} cảnh báo khác
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Processing Time */}
            <p className="text-xs text-muted-foreground">
              Thời gian xử lý: {(uploadResult.processingTime / 1000).toFixed(2)}s
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
