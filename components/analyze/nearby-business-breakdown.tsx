/**
 * Nearby Business Breakdown Component
 * Hiển thị danh sách các doanh nghiệp lân cận
 */

"use client";

import { useState } from "react";
import { NearbyBusiness } from "@/types/analysis";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, MapPin, DollarSign, TrendingUp } from "lucide-react";

interface NearbyBusinessBreakdownProps {
  nearbyBusinesses: NearbyBusiness[];
}

type FilterType = "all" | "competitor" | "complementary" | "neutral";

export function NearbyBusinessBreakdown({
  nearbyBusinesses,
}: NearbyBusinessBreakdownProps) {
  const [filter, setFilter] = useState<FilterType>("all");
  const [sortBy, setSortBy] = useState<"distance" | "rating" | "revenue">("distance");

  const filteredBusinesses = nearbyBusinesses.filter((business) => {
    if (filter === "all") return true;
    return business.type === filter;
  });

  const sortedBusinesses = [...filteredBusinesses].sort((a, b) => {
    switch (sortBy) {
      case "distance":
        return a.distance - b.distance;
      case "rating":
        return (b.rating || 0) - (a.rating || 0);
      case "revenue":
        return (b.estimatedRevenue || 0) - (a.estimatedRevenue || 0);
      default:
        return 0;
    }
  });

  const getTypeColor = (type: NearbyBusiness["type"]) => {
    switch (type) {
      case "competitor":
        return "destructive";
      case "complementary":
        return "default";
      default:
        return "secondary";
    }
  };

  const getTypeLabel = (type: NearbyBusiness["type"]) => {
    switch (type) {
      case "competitor":
        return "Đối thủ";
      case "complementary":
        return "Bổ trợ";
      default:
        return "Trung lập";
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      minimumFractionDigits: 0,
      notation: "compact",
    }).format(value);
  };

  const counts = {
    all: nearbyBusinesses.length,
    competitor: nearbyBusinesses.filter((b) => b.type === "competitor").length,
    complementary: nearbyBusinesses.filter((b) => b.type === "complementary").length,
    neutral: nearbyBusinesses.filter((b) => b.type === "neutral").length,
  };

  return (
    <Card className="p-6">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h3 className="text-lg font-semibold mb-1">Doanh nghiệp lân cận</h3>
          <p className="text-sm text-muted-foreground">
            {nearbyBusinesses.length} doanh nghiệp trong bán kính 2km
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2">
          <Button
            variant={filter === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("all")}
          >
            Tất cả ({counts.all})
          </Button>
          <Button
            variant={filter === "competitor" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("competitor")}
          >
            Đối thủ ({counts.competitor})
          </Button>
          <Button
            variant={filter === "complementary" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("complementary")}
          >
            Bổ trợ ({counts.complementary})
          </Button>
          <Button
            variant={filter === "neutral" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("neutral")}
          >
            Trung lập ({counts.neutral})
          </Button>
        </div>

        {/* Sort Options */}
        <div className="flex gap-2 text-sm">
          <span className="text-muted-foreground">Sắp xếp:</span>
          <button
            className={`${
              sortBy === "distance" ? "font-semibold text-primary" : "text-muted-foreground"
            }`}
            onClick={() => setSortBy("distance")}
          >
            Khoảng cách
          </button>
          <span className="text-muted-foreground">•</span>
          <button
            className={`${
              sortBy === "rating" ? "font-semibold text-primary" : "text-muted-foreground"
            }`}
            onClick={() => setSortBy("rating")}
          >
            Đánh giá
          </button>
          <span className="text-muted-foreground">•</span>
          <button
            className={`${
              sortBy === "revenue" ? "font-semibold text-primary" : "text-muted-foreground"
            }`}
            onClick={() => setSortBy("revenue")}
          >
            Doanh thu
          </button>
        </div>

        {/* Business List */}
        <div className="space-y-3 max-h-[600px] overflow-y-auto">
          {sortedBusinesses.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>Không có doanh nghiệp nào</p>
            </div>
          ) : (
            sortedBusinesses.map((business, index) => (
              <div
                key={index}
                className="flex items-start gap-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex-1 space-y-1">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="font-medium">{business.name}</h4>
                      <p className="text-sm text-muted-foreground">{business.category}</p>
                    </div>
                    <Badge variant={getTypeColor(business.type)} className="flex-shrink-0">
                      {getTypeLabel(business.type)}
                    </Badge>
                  </div>

                  <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      <span>{business.distance.toFixed(2)} km</span>
                    </div>

                    {business.rating && (
                      <div className="flex items-center gap-1">
                        <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                        <span>
                          {business.rating.toFixed(1)}
                          {business.reviewCount && ` (${business.reviewCount})`}
                        </span>
                      </div>
                    )}

                    {business.estimatedRevenue && (
                      <div className="flex items-center gap-1">
                        <TrendingUp className="w-3 h-3" />
                        <span>{formatCurrency(business.estimatedRevenue)}/tháng</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </Card>
  );
}
