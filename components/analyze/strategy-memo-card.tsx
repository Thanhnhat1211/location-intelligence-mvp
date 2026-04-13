/**
 * Strategy Memo Card Component
 */

"use client";

import { StrategyMemo } from "@/types/analysis";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Lightbulb,
  TrendingUp,
  TrendingDown,
  Target,
  DollarSign,
  Calendar,
  Sparkles,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

interface StrategyMemoCardProps {
  strategyMemo: StrategyMemo;
}

export function StrategyMemoCard({ strategyMemo }: StrategyMemoCardProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      minimumFractionDigits: 0,
    }).format(value);
  };

  const getPriorityColor = (priority: "high" | "medium" | "low") => {
    switch (priority) {
      case "high":
        return "destructive";
      case "medium":
        return "default";
      default:
        return "secondary";
    }
  };

  const getPriorityLabel = (priority: "high" | "medium" | "low") => {
    switch (priority) {
      case "high":
        return "Cao";
      case "medium":
        return "TB";
      default:
        return "Thấp";
    }
  };

  return (
    <Card className="p-6">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-lg font-serif mb-1 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#344F3C]" />
              Chiến lược kinh doanh
            </h3>
            <p className="text-xs text-muted-foreground">
              Phân tích bởi {strategyMemo.generatedBy}
            </p>
          </div>
          <Badge variant="outline" className="flex items-center gap-1 text-[#344F3C] border-[#344F3C]/30">
            <Lightbulb className="w-3 h-3" />
            AI Analysis
          </Badge>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="summary" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="summary">Tóm tắt</TabsTrigger>
            <TabsTrigger value="swot">SWOT</TabsTrigger>
            <TabsTrigger value="recommendations">Khuyến nghị</TabsTrigger>
            <TabsTrigger value="roi">ROI</TabsTrigger>
          </TabsList>

          {/* Summary Tab */}
          <TabsContent value="summary" className="space-y-4">
            <div className="prose prose-sm max-w-none">
              <p className="text-muted-foreground leading-relaxed">{strategyMemo.summary}</p>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium text-emerald-600">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Điểm mạnh: {strategyMemo.strengths.length}</span>
                </div>
                <div className="flex items-center gap-2 text-sm font-medium text-blue-600">
                  <Target className="w-4 h-4" />
                  <span>Cơ hội: {strategyMemo.opportunities.length}</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium text-amber-600">
                  <AlertCircle className="w-4 h-4" />
                  <span>Điểm yếu: {strategyMemo.weaknesses.length}</span>
                </div>
                <div className="flex items-center gap-2 text-sm font-medium text-red-500">
                  <AlertCircle className="w-4 h-4" />
                  <span>Đe dọa: {strategyMemo.threats.length}</span>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* SWOT Tab */}
          <TabsContent value="swot" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Strengths */}
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200/60">
                <h4 className="font-serif text-base mb-3 flex items-center gap-2 text-emerald-700">
                  <TrendingUp className="w-4 h-4" />
                  Điểm mạnh
                </h4>
                <ul className="space-y-2">
                  {strategyMemo.strengths.map((strength, index) => (
                    <li key={index} className="text-sm flex items-start gap-2">
                      <span className="text-emerald-500 flex-shrink-0 mt-1">•</span>
                      <span>{strength}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Weaknesses */}
              <div className="p-4 rounded-xl bg-amber-50 border border-amber-200/60">
                <h4 className="font-serif text-base mb-3 flex items-center gap-2 text-amber-700">
                  <TrendingDown className="w-4 h-4" />
                  Điểm yếu
                </h4>
                <ul className="space-y-2">
                  {strategyMemo.weaknesses.map((weakness, index) => (
                    <li key={index} className="text-sm flex items-start gap-2">
                      <span className="text-amber-500 flex-shrink-0 mt-1">•</span>
                      <span>{weakness}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Opportunities */}
              <div className="p-4 rounded-xl bg-blue-50 border border-blue-200/60">
                <h4 className="font-serif text-base mb-3 flex items-center gap-2 text-blue-700">
                  <Target className="w-4 h-4" />
                  Cơ hội
                </h4>
                <ul className="space-y-2">
                  {strategyMemo.opportunities.map((opportunity, index) => (
                    <li key={index} className="text-sm flex items-start gap-2">
                      <span className="text-blue-500 flex-shrink-0 mt-1">•</span>
                      <span>{opportunity}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Threats */}
              <div className="p-4 rounded-xl bg-red-50 border border-red-200/60">
                <h4 className="font-serif text-base mb-3 flex items-center gap-2 text-red-700">
                  <AlertCircle className="w-4 h-4" />
                  Đe dọa
                </h4>
                <ul className="space-y-2">
                  {strategyMemo.threats.map((threat, index) => (
                    <li key={index} className="text-sm flex items-start gap-2">
                      <span className="text-red-500 flex-shrink-0 mt-1">•</span>
                      <span>{threat}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </TabsContent>

          {/* Recommendations Tab */}
          <TabsContent value="recommendations" className="space-y-3">
            {strategyMemo.recommendations.map((rec, index) => (
              <div
                key={index}
                className="p-4 border rounded-xl hover:bg-muted/30 transition-colors"
              >
                <div className="flex items-start gap-3">
                  <Badge variant={getPriorityColor(rec.priority)} className="mt-0.5">
                    {getPriorityLabel(rec.priority)}
                  </Badge>
                  <div className="flex-1 space-y-1">
                    <p className="font-medium text-[15px]">{rec.action}</p>
                    <p className="text-sm text-muted-foreground">{rec.expectedImpact}</p>
                  </div>
                </div>
              </div>
            ))}
          </TabsContent>

          {/* ROI Tab */}
          <TabsContent value="roi" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-5 rounded-xl border bg-card">
                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2 uppercase tracking-[0.5px] font-semibold">
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>Doanh thu dự kiến (tháng)</span>
                </div>
                <p className="text-2xl font-serif text-emerald-600">
                  {formatCurrency(strategyMemo.roiProjection.expectedRevenue)}
                </p>
              </div>

              <div className="p-5 rounded-xl border bg-card">
                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2 uppercase tracking-[0.5px] font-semibold">
                  <DollarSign className="w-3.5 h-3.5" />
                  <span>Chi phí dự kiến (tháng)</span>
                </div>
                <p className="text-2xl font-serif text-red-500">
                  {formatCurrency(strategyMemo.roiProjection.expectedCosts)}
                </p>
              </div>

              <div className="p-5 rounded-xl border bg-card">
                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2 uppercase tracking-[0.5px] font-semibold">
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>Lợi nhuận dự kiến (tháng)</span>
                </div>
                <p className="text-2xl font-serif text-[#344F3C]">
                  {formatCurrency(strategyMemo.roiProjection.expectedProfit)}
                </p>
              </div>

              <div className="p-5 rounded-xl border bg-card">
                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2 uppercase tracking-[0.5px] font-semibold">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Thời gian hoà vốn</span>
                </div>
                <p className="text-2xl font-serif">
                  {strategyMemo.roiProjection.breakEvenMonths} tháng
                </p>
              </div>
            </div>

            <div className="p-8 rounded-xl border bg-[#344F3C]/5">
              <div className="text-center">
                <p className="text-xs text-muted-foreground mb-2 uppercase tracking-[0.5px] font-semibold">
                  ROI hàng năm dự kiến
                </p>
                <p className="text-5xl font-serif text-[#344F3C]">
                  {strategyMemo.roiProjection.annualROI.toFixed(1)}%
                </p>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Footer */}
        <div className="pt-4 border-t text-xs text-muted-foreground text-center">
          Phân tích được tạo lúc{" "}
          {new Date(strategyMemo.generatedAt).toLocaleString("vi-VN", {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </div>
      </div>
    </Card>
  );
}
