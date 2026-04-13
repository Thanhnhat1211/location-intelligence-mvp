"use client";

/**
 * History Card Component
 */

import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AnalysisResult, BusinessModel } from "@/types/analysis";
import {
  MapPin,
  Calendar,
  TrendingUp,
  AlertTriangle,
  Eye,
  Trash2,
  Bookmark,
  Building2,
  DollarSign,
  Target,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";

interface HistoryCardProps {
  analysis: AnalysisResult;
  onView: (analysis: AnalysisResult) => void;
  onDelete: (analysisId: string) => void;
}

const businessModelLabels: Record<BusinessModel, string> = {
  fnb: "F&B - Nhà hàng",
  airbnb: "Airbnb - Homestay",
  retail: "Bán lẻ - Cửa hàng",
};

const recommendationConfig = {
  "highly-recommended": {
    label: "Rất phù hợp",
    variant: "default" as const,
    className: "bg-emerald-600 hover:bg-emerald-700 text-white border-0",
  },
  recommended: {
    label: "Phù hợp",
    variant: "secondary" as const,
    className: "bg-blue-600 hover:bg-blue-700 text-white border-0",
  },
  neutral: {
    label: "Trung bình",
    variant: "outline" as const,
    className: "border-amber-400 text-amber-700",
  },
  "not-recommended": {
    label: "Chưa phù hợp",
    variant: "destructive" as const,
    className: "",
  },
};

export function HistoryCard({ analysis, onView, onDelete }: HistoryCardProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const primaryBusinessModel = analysis.filters.businessModel;
  const primaryScore = analysis.businessFitScores.find(
    (score) => score.businessModel === primaryBusinessModel
  );

  const highRiskCount = analysis.riskFlags.filter(
    (flag) => flag.severity === "high"
  ).length;
  const mediumRiskCount = analysis.riskFlags.filter(
    (flag) => flag.severity === "medium"
  ).length;

  const formatPrice = (price: number) => {
    if (price >= 1000000000) {
      return `${(price / 1000000000).toFixed(1)} tỷ`;
    } else if (price >= 1000000) {
      return `${(price / 1000000).toFixed(1)} tr`;
    }
    return price.toLocaleString("vi-VN");
  };

  const formatDate = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), {
        addSuffix: true,
        locale: vi,
      });
    } catch {
      return new Date(dateString).toLocaleDateString("vi-VN");
    }
  };

  const recommendationStyle =
    recommendationConfig[analysis.recommendation] ||
    recommendationConfig.neutral;

  const handleDelete = () => {
    onDelete(analysis.id);
    setShowDeleteDialog(false);
  };

  return (
    <>
      <Card className="overflow-hidden hover:shadow-md transition-all duration-200 group">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="outline" className="font-medium text-[11px] uppercase tracking-[0.3px]">
                  {businessModelLabels[primaryBusinessModel]}
                </Badge>
                {analysis.isSaved && (
                  <Bookmark className="h-4 w-4 text-amber-500 fill-amber-500" />
                )}
              </div>
              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 text-[#344F3C] mt-1 flex-shrink-0" />
                <div>
                  <p className="font-medium text-[15px] line-clamp-1">
                    {analysis.location.address.street}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {analysis.location.address.ward},{" "}
                    {analysis.location.address.district}
                  </p>
                </div>
              </div>
            </div>

            <Badge
              variant={recommendationStyle.variant}
              className={recommendationStyle.className}
            >
              {recommendationStyle.label}
            </Badge>
          </div>

          {/* Quick stats grid */}
          <div className="grid grid-cols-2 gap-4 mb-4 p-4 bg-muted/40 rounded-xl">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-[#344F3C]/10">
                <Target className="h-4 w-4 text-[#344F3C]" />
              </div>
              <div>
                <p className="text-[11px] text-muted-foreground uppercase tracking-[0.3px]">Điểm phù hợp</p>
                <p className="text-lg font-serif text-[#344F3C]">
                  {primaryScore?.overallScore.toFixed(0) || "N/A"}/100
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-blue-500/10">
                <TrendingUp className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <p className="text-[11px] text-muted-foreground uppercase tracking-[0.3px]">Độ tin cậy</p>
                <p className="text-lg font-serif text-blue-600">
                  {analysis.confidenceScore.toFixed(0)}%
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-emerald-500/10">
                <DollarSign className="h-4 w-4 text-emerald-600" />
              </div>
              <div>
                <p className="text-[11px] text-muted-foreground uppercase tracking-[0.3px]">Giá thuê/tháng</p>
                <p className="text-sm font-semibold text-emerald-600">
                  {formatPrice(analysis.priceEstimate.monthlyRent)} đ
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-amber-500/10">
                <AlertTriangle className="h-4 w-4 text-amber-600" />
              </div>
              <div>
                <p className="text-[11px] text-muted-foreground uppercase tracking-[0.3px]">Rủi ro</p>
                <p className="text-sm font-semibold">
                  {highRiskCount > 0 && (
                    <span className="text-red-500">{highRiskCount} cao</span>
                  )}
                  {highRiskCount > 0 && mediumRiskCount > 0 && (
                    <span className="text-muted-foreground">, </span>
                  )}
                  {mediumRiskCount > 0 && (
                    <span className="text-amber-600">
                      {mediumRiskCount} TB
                    </span>
                  )}
                  {highRiskCount === 0 && mediumRiskCount === 0 && (
                    <span className="text-emerald-600">Thấp</span>
                  )}
                </p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between pt-4 border-t border-border/60">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-3.5 w-3.5" />
              <span>{formatDate(analysis.createdAt)}</span>
              {analysis.status === "processing" && (
                <Badge variant="outline" className="ml-2">
                  Đang xử lý
                </Badge>
              )}
              {analysis.status === "failed" && (
                <Badge variant="destructive" className="ml-2">
                  Thất bại
                </Badge>
              )}
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onView(analysis)}
                className="gap-2"
              >
                <Eye className="h-4 w-4" />
                Xem chi tiết
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowDeleteDialog(true)}
                className="gap-2 text-destructive hover:text-destructive hover:bg-destructive/10"
              >
                <Trash2 className="h-4 w-4" />
                Xóa
              </Button>
            </div>
          </div>

          {analysis.notes && (
            <div className="mt-3 p-3 bg-blue-50 border border-blue-200/60 rounded-xl">
              <p className="text-[11px] text-muted-foreground mb-1 uppercase tracking-[0.3px]">Ghi chú:</p>
              <p className="text-sm text-blue-900 line-clamp-2">
                {analysis.notes}
              </p>
            </div>
          )}
        </div>
      </Card>

      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xác nhận xóa phân tích</DialogTitle>
            <DialogDescription>
              Bạn có chắc chắn muốn xóa phân tích này không? Hành động này không
              thể hoàn tác.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="flex items-start gap-2 p-3 bg-muted rounded-xl">
              <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground flex-shrink-0" />
              <div>
                <p className="font-medium">
                  {analysis.location.address.street}
                </p>
                <p className="text-sm text-muted-foreground">
                  {analysis.location.address.ward},{" "}
                  {analysis.location.address.district}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {formatDate(analysis.createdAt)}
                </p>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
            >
              Hủy
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Xóa phân tích
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
