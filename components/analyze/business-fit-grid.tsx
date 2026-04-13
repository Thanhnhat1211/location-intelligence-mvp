/**
 * Business Fit Grid Component
 * Hiển thị lưới các điểm phù hợp cho tất cả mô hình kinh doanh
 */

"use client";

import { BusinessFitScore } from "@/types/analysis";
import { BusinessFitScoreCard } from "./business-fit-score-card";

interface BusinessFitGridProps {
  businessFitScores: BusinessFitScore[];
}

export function BusinessFitGrid({ businessFitScores }: BusinessFitGridProps) {
  if (businessFitScores.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p>Chưa có dữ liệu điểm phù hợp</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {businessFitScores.map((score) => (
        <BusinessFitScoreCard key={score.businessModel} businessFitScore={score} />
      ))}
    </div>
  );
}
