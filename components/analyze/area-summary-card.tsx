/**
 * Area Summary Card Component
 * Hiển thị thống kê tổng quan khu vực
 */

"use client";

import { AreaSummary } from "@/types/analysis";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Building2,
  TrendingUp,
  DollarSign,
  Users,
  Clock,
  AlertCircle,
} from "lucide-react";

interface AreaSummaryCardProps {
  areaSummary: AreaSummary;
}

export function AreaSummaryCard({ areaSummary }: AreaSummaryCardProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      minimumFractionDigits: 0,
    }).format(value);
  };

  const getSaturationColor = (saturation: number) => {
    if (saturation >= 75) return "text-red-600";
    if (saturation >= 50) return "text-yellow-600";
    return "text-green-600";
  };

  const getSaturationLabel = (saturation: number) => {
    if (saturation >= 75) return "Cao";
    if (saturation >= 50) return "Trung bình";
    return "Thấp";
  };

  return (
    <Card className="p-6">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h3 className="text-lg font-semibold mb-1">Tổng quan khu vực</h3>
          <p className="text-sm text-muted-foreground">
            Thống kê doanh nghiệp và thị trường
          </p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Building2 className="w-4 h-4" />
              <span>Tổng doanh nghiệp</span>
            </div>
            <p className="text-2xl font-bold">{areaSummary.totalBusinesses}</p>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Users className="w-4 h-4" />
              <span>Lưu lượng TB</span>
            </div>
            <p className="text-2xl font-bold">{areaSummary.averageFootTraffic}</p>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <DollarSign className="w-4 h-4" />
              <span>Giá thuê TB</span>
            </div>
            <p className="text-sm font-bold">
              {formatCurrency(areaSummary.averageRent)}
            </p>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <TrendingUp className="w-4 h-4" />
              <span>Tăng trưởng</span>
            </div>
            <p className="text-2xl font-bold text-green-600">
              +{areaSummary.growthRate}%
            </p>
          </div>
        </div>

        {/* Market Saturation */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Độ bão hòa thị trường</span>
            <Badge
              variant="outline"
              className={getSaturationColor(areaSummary.marketSaturation)}
            >
              {getSaturationLabel(areaSummary.marketSaturation)}
            </Badge>
          </div>
          <Progress value={areaSummary.marketSaturation} className="h-2" />
          <p className="text-xs text-muted-foreground">
            {areaSummary.marketSaturation}% - {areaSummary.vacancyRate}% tỷ lệ trống
          </p>
        </div>

        {/* Business Categories */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm font-medium">
            <Building2 className="w-4 h-4 text-muted-foreground" />
            <span>Phân loại doanh nghiệp</span>
          </div>
          <div className="space-y-2">
            {areaSummary.businessesByCategory.slice(0, 5).map((category, index) => (
              <div key={index} className="flex items-center gap-2">
                <div className="flex-1">
                  <div className="flex justify-between text-sm mb-1">
                    <span>{category.category}</span>
                    <span className="text-muted-foreground">
                      {category.count} ({category.percentage}%)
                    </span>
                  </div>
                  <Progress value={category.percentage} className="h-1" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Peak Hours */}
        {areaSummary.peakHours && areaSummary.peakHours.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Clock className="w-4 h-4 text-muted-foreground" />
              <span>Giờ cao điểm</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {areaSummary.peakHours.map((hour, index) => (
                <Badge key={index} variant="secondary">
                  {hour}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Seasonal Trends */}
        {areaSummary.seasonalTrends && areaSummary.seasonalTrends.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium">
              <AlertCircle className="w-4 h-4 text-muted-foreground" />
              <span>Xu hướng theo mùa</span>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {areaSummary.seasonalTrends.map((trend, index) => (
                <div
                  key={index}
                  className="text-center p-2 bg-muted rounded-lg"
                >
                  <p className="text-xs font-medium capitalize">{trend.season}</p>
                  <Badge
                    variant={
                      trend.demandLevel === "high"
                        ? "default"
                        : trend.demandLevel === "medium"
                        ? "secondary"
                        : "outline"
                    }
                    className="mt-1 text-xs"
                  >
                    {trend.demandLevel}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
