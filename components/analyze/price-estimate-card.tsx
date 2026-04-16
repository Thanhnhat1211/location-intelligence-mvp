/**
 * Price Estimate Card Component
 * Hiển thị ước tính giá thuê và xu hướng
 */

"use client";

import { PriceEstimate } from "@/types/analysis";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Minus,
  Building2,
  Clock,
} from "lucide-react";

interface PriceEstimateCardProps {
  priceEstimate: PriceEstimate;
}

export function PriceEstimateCard({ priceEstimate }: PriceEstimateCardProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      minimumFractionDigits: 0,
    }).format(value);
  };

  const getTrendIcon = () => {
    switch (priceEstimate.priceTrend) {
      case "increasing":
        return <TrendingUp className="w-4 h-4 text-green-600" />;
      case "decreasing":
        return <TrendingDown className="w-4 h-4 text-red-600" />;
      default:
        return <Minus className="w-4 h-4 text-yellow-600" />;
    }
  };

  const getTrendLabel = () => {
    switch (priceEstimate.priceTrend) {
      case "increasing":
        return "Tăng";
      case "decreasing":
        return "Giảm";
      default:
        return "Ổn định";
    }
  };

  const getTrendColor = () => {
    switch (priceEstimate.priceTrend) {
      case "increasing":
        return "text-green-600";
      case "decreasing":
        return "text-red-600";
      default:
        return "text-yellow-600";
    }
  };

  return (
    <Card className="p-6">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-lg font-semibold mb-1">Ước tính giá thuê</h3>
            <p className="text-sm text-muted-foreground">
              Dựa trên {priceEstimate.comparableCount} bất động sản tương tự
              {priceEstimate.compsMedianAgeDays !== undefined && (
                <span className="text-xs ml-1">
                  (giao dịch trung vị {priceEstimate.compsMedianAgeDays} ngày trước)
                </span>
              )}
            </p>
          </div>
          <div className="flex flex-col items-end gap-1.5">
            <Badge variant="outline" className="flex items-center gap-1">
              {getTrendIcon()}
              {getTrendLabel()}
            </Badge>
            {priceEstimate.priceSource === "comps" && (
              <Badge className="bg-green-600 hover:bg-green-700 text-white text-xs">
                Dữ liệu thật
              </Badge>
            )}
            {priceEstimate.priceSource === "mixed" && (
              <Badge className="bg-blue-600 hover:bg-blue-700 text-white text-xs">
                Một phần dữ liệu thật
              </Badge>
            )}
            {priceEstimate.priceSource === "district-average" && (
              <Badge variant="secondary" className="text-xs">
                Ước tính theo khu vực
              </Badge>
            )}
          </div>
        </div>

        {/* Monthly Rent */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <DollarSign className="w-4 h-4" />
            <span>Giá thuê hàng tháng</span>
          </div>
          <div className="text-3xl font-bold text-primary">
            {formatCurrency(priceEstimate.monthlyRent)}
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>Khoảng:</span>
            <span>
              {formatCurrency(priceEstimate.rentMin)} -{" "}
              {formatCurrency(priceEstimate.rentMax)}
            </span>
          </div>
        </div>

        {/* Price per SQM */}
        <div className="grid grid-cols-2 gap-4 pt-4 border-t">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Building2 className="w-4 h-4" />
              <span>Giá/m²/tháng</span>
            </div>
            <p className="text-xl font-semibold">
              {formatCurrency(priceEstimate.averageRentPerSqm)}
            </p>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <TrendingUp className="w-4 h-4" />
              <span>Dự đoán 6 tháng</span>
            </div>
            <p className={`text-xl font-semibold ${getTrendColor()}`}>
              {priceEstimate.predictedChangePercent > 0 ? "+" : ""}
              {priceEstimate.predictedChangePercent.toFixed(1)}%
            </p>
          </div>
        </div>

        {/* Property Price (if available) */}
        {priceEstimate.propertyPrice && (
          <div className="space-y-2 pt-4 border-t">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Building2 className="w-4 h-4" />
              <span>Giá mua (nếu mua)</span>
            </div>
            <div className="text-2xl font-bold">
              {formatCurrency(priceEstimate.propertyPrice)}
            </div>
            {priceEstimate.propertyPriceMin && priceEstimate.propertyPriceMax && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>Khoảng:</span>
                <span>
                  {formatCurrency(priceEstimate.propertyPriceMin)} -{" "}
                  {formatCurrency(priceEstimate.propertyPriceMax)}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Last Updated */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground pt-4 border-t">
          <Clock className="w-3 h-3" />
          <span>
            Cập nhật:{" "}
            {new Date(priceEstimate.lastUpdated).toLocaleDateString("vi-VN", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </span>
        </div>
      </div>
    </Card>
  );
}
