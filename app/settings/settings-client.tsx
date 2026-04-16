"use client";

import { useState, useEffect, useCallback } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { SectionHeader } from "@/components/shared/section-header";
import { ApiStatusCard } from "@/components/settings/api-status-card";
import { WeightConfigCard } from "@/components/settings/weight-config-card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { Settings as SettingsIcon, Key, Sliders } from "lucide-react";

import type {
  ApiStatus,
  ApiStatusInfo,
} from "@/components/settings/api-status-card";
import type { ScoringWeights } from "@/components/settings/weight-config-card";

const DEFAULT_WEIGHTS: ScoringWeights = {
  locationWeight: 25,
  demographicWeight: 25,
  competitionWeight: 20,
  footTrafficWeight: 15,
  infrastructureWeight: 15,
};

interface ClaudeTestResponse {
  status: ApiStatus;
  message?: string;
  latency?: number;
  model?: string;
}

export default function SettingsClient() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("api");

  const [apiStatus, setApiStatus] = useState<ApiStatusInfo>({
    status: "unknown",
  });
  const [weights, setWeights] = useState<ScoringWeights>(DEFAULT_WEIGHTS);

  useEffect(() => {
    const savedWeights = localStorage.getItem("analysis-weights");
    if (savedWeights) {
      try {
        setWeights(JSON.parse(savedWeights));
      } catch {
        /* ignore */
      }
    }
  }, []);

  const handleTestClaude = useCallback(async () => {
    setApiStatus((prev) => ({ ...prev, status: "testing" }));
    try {
      const res = await fetch("/api/test-claude", { cache: "no-store" });
      const data = (await res.json()) as ClaudeTestResponse;
      setApiStatus({
        status: data.status,
        message: data.message,
        latency: data.latency,
        model: data.model,
        lastTested: new Date().toISOString(),
      });
    } catch (err) {
      setApiStatus({
        status: "error",
        message:
          err instanceof Error
            ? err.message
            : "Không thể kết nối tới server",
        lastTested: new Date().toISOString(),
      });
    }
  }, []);

  const handleWeightsChange = (newWeights: ScoringWeights) => {
    setWeights(newWeights);
  };

  const handleSaveWeights = async (newWeights: ScoringWeights): Promise<void> => {
    const total = Object.values(newWeights).reduce((sum, v) => sum + v, 0);
    if (Math.abs(total - 100) > 0.01) {
      toast({
        title: "Lỗi trọng số",
        description: "Tổng trọng số phải bằng 100%",
        variant: "destructive",
      });
      return;
    }

    setWeights(newWeights);
    localStorage.setItem("analysis-weights", JSON.stringify(newWeights));
    toast({
      title: "Đã lưu trọng số",
      description: "Cấu hình trọng số phân tích đã được cập nhật",
    });
  };

  const handleResetWeights = () => {
    setWeights(DEFAULT_WEIGHTS);
    localStorage.setItem("analysis-weights", JSON.stringify(DEFAULT_WEIGHTS));
    toast({
      title: "Đã reset trọng số",
      description: "Trọng số đã được đặt về giá trị mặc định",
    });
  };

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <SettingsIcon className="h-6 w-6" />
          <div>
            <SectionHeader
              title="Cấu hình hệ thống"
              description="Quản lý kết nối API và tham số phân tích"
            />
          </div>
        </div>

        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-6"
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="api" className="flex items-center gap-2">
              <Key className="h-4 w-4" />
              Trạng thái API
            </TabsTrigger>
            <TabsTrigger value="weights" className="flex items-center gap-2">
              <Sliders className="h-4 w-4" />
              Trọng số chấm điểm
            </TabsTrigger>
          </TabsList>

          <TabsContent value="api" className="space-y-4">
            <ApiStatusCard status={apiStatus} onTest={handleTestClaude} />
          </TabsContent>

          <TabsContent value="weights" className="space-y-4">
            <WeightConfigCard
              weights={weights}
              onChange={handleWeightsChange}
              onReset={handleResetWeights}
              onSave={handleSaveWeights}
              defaultWeights={DEFAULT_WEIGHTS}
            />
          </TabsContent>
        </Tabs>
      </div>
    </AppShell>
  );
}
