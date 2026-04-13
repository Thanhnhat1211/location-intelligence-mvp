/**
 * Business Fit Score Card Component
 */

"use client";

import { BusinessFitScore } from "@/types/analysis";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { UtensilsCrossed, Home, Store, TrendingUp } from "lucide-react";

interface BusinessFitScoreCardProps {
  businessFitScore: BusinessFitScore;
}

const businessModelConfig = {
  fnb: { label: "F&B / Nhà hàng", icon: UtensilsCrossed, color: "text-orange-600", bg: "bg-orange-500/10" },
  airbnb: { label: "Airbnb / Homestay", icon: Home, color: "text-blue-600", bg: "bg-blue-500/10" },
  retail: { label: "Bán lẻ / Cửa hàng", icon: Store, color: "text-emerald-600", bg: "bg-emerald-500/10" },
};

export function BusinessFitScoreCard({ businessFitScore }: BusinessFitScoreCardProps) {
  const config = businessModelConfig[businessFitScore.businessModel];
  const Icon = config.icon;

  const getScoreColor = (score: number) => {
    if (score >= 76) return "text-emerald-600";
    if (score >= 51) return "text-amber-600";
    return "text-red-500";
  };

  const getScoreLabel = (score: number) => {
    if (score >= 76) return "Tốt";
    if (score >= 51) return "Trung bình";
    return "Thấp";
  };

  const getCircleColor = (score: number) => {
    if (score >= 76) return "stroke-emerald-500";
    if (score >= 51) return "stroke-amber-500";
    return "stroke-red-500";
  };

  return (
    <Card className="p-6 hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className={`p-2.5 rounded-xl ${config.bg}`}>
            <Icon className={`w-5 h-5 ${config.color}`} />
          </div>
          <div>
            <h3 className="font-serif text-base">{config.label}</h3>
            <p className="text-xs text-muted-foreground">
              Độ tin cậy: {(businessFitScore.confidence * 100).toFixed(0)}%
            </p>
          </div>
        </div>
        <Badge variant="outline" className={`${getScoreColor(businessFitScore.overallScore)} border-current/30`}>
          {getScoreLabel(businessFitScore.overallScore)}
        </Badge>
      </div>

      {/* Overall Score */}
      <div className="text-center mb-6">
        <div className="relative inline-flex items-center justify-center w-32 h-32">
          <svg className="w-32 h-32 transform -rotate-90">
            <circle
              cx="64"
              cy="64"
              r="56"
              strokeWidth="6"
              fill="none"
              className="stroke-muted"
            />
            <circle
              cx="64"
              cy="64"
              r="56"
              strokeWidth="6"
              fill="none"
              strokeDasharray={`${(businessFitScore.overallScore / 100) * 351.86} 351.86`}
              className={getCircleColor(businessFitScore.overallScore)}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute">
            <p className={`text-3xl font-serif ${getScoreColor(businessFitScore.overallScore)}`}>
              {businessFitScore.overallScore}
            </p>
            <p className="text-[11px] text-muted-foreground">/ 100</p>
          </div>
        </div>
      </div>

      {/* Score Breakdown */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-sm font-medium">
          <TrendingUp className="w-4 h-4 text-muted-foreground" />
          <span>Các chỉ số chi tiết</span>
        </div>

        <div className="space-y-3">
          {[
            { label: "Vị trí", value: businessFitScore.locationScore },
            { label: "Nhân khẩu học", value: businessFitScore.demographicScore },
            { label: "Cạnh tranh", value: businessFitScore.competitionScore },
            { label: "Lưu lượng khách", value: businessFitScore.footTrafficScore },
            { label: "Cơ sở hạ tầng", value: businessFitScore.infrastructureScore },
          ].map((item) => (
            <div key={item.label}>
              <div className="flex justify-between text-sm mb-1.5">
                <span className="text-muted-foreground">{item.label}</span>
                <span className={`font-medium ${getScoreColor(item.value)}`}>
                  {item.value}
                </span>
              </div>
              <Progress value={item.value} className="h-1.5" />
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}
