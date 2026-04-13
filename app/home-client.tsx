
"use client";

import { useState, useEffect } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { SectionHeader } from "@/components/shared/section-header";
import { HistoryCard } from "@/components/history/history-card";
import { LoadingSkeleton } from "@/components/shared/loading-skeleton";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { AnalysisResult } from "@/types/analysis";
import { BarChart3, Database, FileText, Upload, TrendingUp, MapPin, ArrowRight } from "lucide-react";

export default function HomeClient() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [recentAnalyses, setRecentAnalyses] = useState<AnalysisResult[]>([]);
  const [stats, setStats] = useState({
    totalAnalyses: 0,
    savedAnalyses: 0,
    totalComps: 0,
    avgConfidence: 0,
  });

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      const historyResponse = await fetch("/api/history?limit=5");
      if (historyResponse.ok) {
        const data = await historyResponse.json();
        setRecentAnalyses(data.analyses || []);

        const total = data.total || 0;
        const saved = (data.analyses || []).filter((a: AnalysisResult) => a.isSaved).length;
        const avgConf = total > 0
          ? (data.analyses || []).reduce((sum: number, a: AnalysisResult) => sum + a.confidenceScore, 0) / Math.min(5, total)
          : 0;

        setStats(prev => ({
          ...prev,
          totalAnalyses: total,
          savedAnalyses: saved,
          avgConfidence: Math.round(avgConf),
        }));
      }

      const datasetStats = localStorage.getItem("dataset-stats");
      if (datasetStats) {
        const parsed = JSON.parse(datasetStats);
        setStats(prev => ({ ...prev, totalComps: parsed.totalComps || 0 }));
      }
    } catch (error) {
      console.error("Error loading dashboard data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AppShell>
      <div className="space-y-8">
        {/* Hero Section */}
        <div className="rounded-2xl bg-[#344F3C] px-8 py-10 text-white">
          <p className="text-[11px] uppercase tracking-[2px] text-white/50 mb-3 font-sans font-semibold">
            Location Intelligence Platform
          </p>
          <h1 className="text-3xl lg:text-4xl font-serif text-white mb-3">
            Phân tích địa điểm kinh doanh
          </h1>
          <p className="text-white/70 text-[15px] max-w-xl leading-relaxed mb-6">
            Đánh giá tiềm năng kinh doanh tại Việt Nam dựa trên dữ liệu thị trường,
            nhân khẩu học, và phân tích AI.
          </p>
          <Button
            onClick={() => router.push("/analyze")}
            className="bg-white text-[#344F3C] hover:bg-white/90 hover:text-[#344F3C] shadow-lg"
            size="lg"
          >
            <MapPin className="h-4 w-4 mr-2" />
            Bắt đầu phân tích
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </div>

        {/* Quick Stats */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-5">
              <div className="flex items-center gap-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#344F3C]/10">
                  <BarChart3 className="h-5 w-5 text-[#344F3C]" />
                </div>
                <div>
                  <p className="text-[13px] text-muted-foreground">Tổng phân tích</p>
                  <p className="text-2xl font-serif">{stats.totalAnalyses}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-5">
              <div className="flex items-center gap-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-500/10">
                  <FileText className="h-5 w-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-[13px] text-muted-foreground">Đã lưu</p>
                  <p className="text-2xl font-serif">{stats.savedAnalyses}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-5">
              <div className="flex items-center gap-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-500/10">
                  <Database className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-[13px] text-muted-foreground">Dataset Comps</p>
                  <p className="text-2xl font-serif">{stats.totalComps}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-5">
              <div className="flex items-center gap-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500/10">
                  <TrendingUp className="h-5 w-5 text-emerald-600" />
                </div>
                <div>
                  <p className="text-[13px] text-muted-foreground">Độ tin cậy TB</p>
                  <p className="text-2xl font-serif">{stats.avgConfidence}%</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Hành động nhanh</CardTitle>
            <CardDescription>
              Bắt đầu phân tích hoặc upload dữ liệu mới
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-3">
            <Button
              onClick={() => router.push("/analyze")}
              className="flex items-center gap-2"
            >
              <MapPin className="h-4 w-4" />
              Phân tích địa điểm mới
            </Button>
            <Button
              variant="outline"
              onClick={() => router.push("/data")}
              className="flex items-center gap-2"
            >
              <Upload className="h-4 w-4" />
              Upload dữ liệu comps
            </Button>
            <Button
              variant="outline"
              onClick={() => router.push("/history")}
              className="flex items-center gap-2"
            >
              <FileText className="h-4 w-4" />
              Xem lịch sử phân tích
            </Button>
          </CardContent>
        </Card>

        {/* Recent Analyses */}
        <div>
          <SectionHeader
            title="Phân tích gần đây"
            description="5 phân tích mới nhất của bạn"
          />

          {isLoading ? (
            <div className="space-y-4 mt-4">
              <LoadingSkeleton count={3} height={120} />
            </div>
          ) : recentAnalyses.length === 0 ? (
            <EmptyState
              icon={BarChart3}
              title="Chưa có phân tích nào"
              description="Bắt đầu phân tích địa điểm đầu tiên của bạn"
              action={{
                label: "Phân tích ngay",
                onClick: () => router.push("/analyze"),
              }}
            />
          ) : (
            <div className="grid gap-4 mt-4">
              {recentAnalyses.map((analysis) => (
                <HistoryCard
                  key={analysis.id}
                  analysis={analysis}
                  onView={() => router.push(`/analyze?id=${analysis.id}`)}
                  onDelete={async () => {
                    await fetch(`/api/history/${analysis.id}`, {
                      method: "DELETE",
                    });
                    loadDashboardData();
                  }}
                />
              ))}
            </div>
          )}

          {recentAnalyses.length > 0 && (
            <div className="mt-4 text-center">
              <Button
                variant="ghost"
                onClick={() => router.push("/history")}
              >
                Xem tất cả phân tích
              </Button>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
