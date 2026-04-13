
/**
 * Dataset Stats Card Component
 * Card hiển thị thống kê tổng quan về dataset comparable properties
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { DatasetStats } from "@/types/dataset";
import {
  Database,
  TrendingUp,
  Calendar,
  CheckCircle,
  Home,
  DollarSign,
  Ruler,
  MapPin,
  RefreshCw
} from "lucide-react";
import { Separator } from "@/components/ui/separator";

interface DatasetStatsCardProps {
  /** Thống kê dataset */
  stats: DatasetStats;
  /** Callback khi nhấn làm mới dữ liệu */
  onRefresh?: () => void;
}

export function DatasetStatsCard({ stats, onRefresh }: DatasetStatsCardProps) {
  // Format currency
  const formatCurrency = (value: number): string => {
    if (value >= 1_000_000_000) {
      return `${(value / 1_000_000_000).toFixed(1)} tỷ`;
    } else if (value >= 1_000_000) {
      return `${(value / 1_000_000).toFixed(1)} tr`;
    }
    return value.toLocaleString("vi-VN");
  };

  // Format number
  const formatNumber = (value: number): string => {
    return value.toLocaleString("vi-VN");
  };

  // Calculate days ago
  const getDaysAgo = (dateString: string): number => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24));
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Thống Kê Dataset
            </CardTitle>
            <CardDescription>
              Tổng quan về dữ liệu comparable properties trong hệ thống
            </CardDescription>
          </div>
          {onRefresh && (
            <Button variant="outline" size="sm" onClick={onRefresh}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Làm mới
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Total Comps */}
        <div className="flex items-center justify-between p-4 bg-primary/5 rounded-lg">
          <div>
            <p className="text-sm text-muted-foreground">Tổng số comparable</p>
            <p className="text-3xl font-bold">{formatNumber(stats.totalComps)}</p>
          </div>
          <Database className="h-12 w-12 text-primary opacity-20" />
        </div>

        {/* Comps by Type */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Home className="h-4 w-4 text-muted-foreground" />
            <h4 className="font-medium">Phân bổ theo loại BĐS</h4>
          </div>
          <div className="space-y-2">
            {stats.compsByType.map((item) => (
              <div key={item.type} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="capitalize">{item.type}</span>
                  <span className="font-medium">
                    {item.count} ({item.percentage.toFixed(1)}%)
                  </span>
                </div>
                <Progress value={item.percentage} className="h-2" />
              </div>
            ))}
          </div>
        </div>

        <Separator />

        {/* Comps by Transaction Type */}
        <div className="space-y-3">
          <h4 className="font-medium">Phân bổ theo loại giao dịch</h4>
          <div className="flex flex-wrap gap-2">
            {stats.compsByTransactionType.map((item) => (
              <Badge key={item.transactionType} variant="outline" className="text-sm">
                {item.transactionType === "sale" ? "Bán" : item.transactionType === "rent" ? "Thuê" : "Cả hai"}:{" "}
                {item.count} ({item.percentage.toFixed(1)}%)
              </Badge>
            ))}
          </div>
        </div>

        <Separator />

        {/* Top Districts */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <h4 className="font-medium">Top Quận/Huyện</h4>
          </div>
          <div className="space-y-2">
            {stats.compsByDistrict.slice(0, 5).map((item) => (
              <div key={item.district} className="flex items-center justify-between text-sm">
                <span>{item.district}</span>
                <Badge variant="secondary">
                  {item.count} ({item.percentage.toFixed(1)}%)
                </Badge>
              </div>
            ))}
          </div>
        </div>

        <Separator />

        {/* Price Statistics */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-muted-foreground" />
            <h4 className="font-medium">Thống kê giá bán</h4>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-muted rounded-lg">
              <p className="text-xs text-muted-foreground">Trung bình</p>
              <p className="text-lg font-semibold">{formatCurrency(stats.priceStats.averagePrice)} đ</p>
            </div>
            <div className="p-3 bg-muted rounded-lg">
              <p className="text-xs text-muted-foreground">Trung vị</p>
              <p className="text-lg font-semibold">{formatCurrency(stats.priceStats.medianPrice)} đ</p>
            </div>
            <div className="p-3 bg-muted rounded-lg">
              <p className="text-xs text-muted-foreground">Thấp nhất</p>
              <p className="text-sm font-medium">{formatCurrency(stats.priceStats.minPrice)} đ</p>
            </div>
            <div className="p-3 bg-muted rounded-lg">
              <p className="text-xs text-muted-foreground">Cao nhất</p>
              <p className="text-sm font-medium">{formatCurrency(stats.priceStats.maxPrice)} đ</p>
            </div>
          </div>
          <div className="p-3 bg-primary/5 rounded-lg">
            <p className="text-xs text-muted-foreground">Trung bình/m²</p>
            <p className="text-lg font-semibold text-primary">
              {formatCurrency(stats.priceStats.averagePricePerSqm)} đ/m²
            </p>
          </div>
        </div>

        <Separator />

        {/* Rent Statistics */}
        <div className="space-y-3">
          <h4 className="font-medium">Thống kê giá thuê</h4>
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-muted rounded-lg">
              <p className="text-xs text-muted-foreground">TB/tháng</p>
              <p className="text-lg font-semibold">{formatCurrency(stats.rentStats.averageRent)} đ</p>
            </div>
            <div className="p-3 bg-muted rounded-lg">
              <p className="text-xs text-muted-foreground">Trung vị</p>
              <p className="text-lg font-semibold">{formatCurrency(stats.rentStats.medianRent)} đ</p>
            </div>
          </div>
          <div className="p-3 bg-primary/5 rounded-lg">
            <p className="text-xs text-muted-foreground">Trung bình/m²/tháng</p>
            <p className="text-lg font-semibold text-primary">
              {formatCurrency(stats.rentStats.averageRentPerSqm)} đ/m²
            </p>
          </div>
        </div>

        <Separator />

        {/* Area Statistics */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Ruler className="h-4 w-4 text-muted-foreground" />
            <h4 className="font-medium">Thống kê diện tích</h4>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-muted rounded-lg">
              <p className="text-xs text-muted-foreground">Trung bình</p>
              <p className="text-lg font-semibold">{stats.areaStats.averageArea.toFixed(1)} m²</p>
            </div>
            <div className="p-3 bg-muted rounded-lg">
              <p className="text-xs text-muted-foreground">Trung vị</p>
              <p className="text-lg font-semibold">{stats.areaStats.medianArea.toFixed(1)} m²</p>
            </div>
            <div className="p-3 bg-muted rounded-lg">
              <p className="text-xs text-muted-foreground">Nhỏ nhất</p>
              <p className="text-sm font-medium">{stats.areaStats.minArea.toFixed(1)} m²</p>
            </div>
            <div className="p-3 bg-muted rounded-lg">
              <p className="text-xs text-muted-foreground">Lớn nhất</p>
              <p className="text-sm font-medium">{stats.areaStats.maxArea.toFixed(1)} m²</p>
            </div>
          </div>
        </div>

        <Separator />

        {/* Data Quality */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
            <h4 className="font-medium">Chất lượng dữ liệu</h4>
          </div>
          <div className="space-y-2">
            <div className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span>Đã xác minh</span>
                <span className="font-medium">{stats.dataQuality.verifiedPercentage.toFixed(1)}%</span>
              </div>
              <Progress value={stats.dataQuality.verifiedPercentage} className="h-2" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span>Có tọa độ</span>
                <span className="font-medium">{stats.dataQuality.withCoordinatesPercentage.toFixed(1)}%</span>
              </div>
              <Progress value={stats.dataQuality.withCoordinatesPercentage} className="h-2" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span>Dữ liệu đầy đủ</span>
                <span className="font-medium">{stats.dataQuality.completeDataPercentage.toFixed(1)}%</span>
              </div>
              <Progress value={stats.dataQuality.completeDataPercentage} className="h-2" />
            </div>
          </div>
          <div className="p-3 bg-primary/5 rounded-lg">
            <p className="text-xs text-muted-foreground">Điểm hoàn thiện tổng thể</p>
            <p className="text-2xl font-bold text-primary">
              {stats.dataQuality.completenessScore.toFixed(0)}/100
            </p>
          </div>
        </div>

        <Separator />

        {/* Date Range */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <h4 className="font-medium">Phạm vi thời gian</h4>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Dữ liệu từ</span>
              <span className="font-medium">
                {new Date(stats.dateRange.earliestDate).toLocaleDateString("vi-VN")}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span>Đến</span>
              <span className="font-medium">
                {new Date(stats.dateRange.latestDate).toLocaleDateString("vi-VN")}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span>Độ mới</span>
              <Badge variant={stats.dateRange.recencyDays <= 7 ? "default" : "secondary"}>
                {stats.dateRange.recencyDays} ngày trước
              </Badge>
            </div>
          </div>
        </div>

        {/* Last Updated */}
        <div className="pt-2 border-t">
          <p className="text-xs text-muted-foreground text-center">
            Cập nhật lần cuối: {new Date(stats.lastUpdated).toLocaleString("vi-VN")}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
