"use client";

import { useState, useEffect } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { SectionHeader } from "@/components/shared/section-header";
import { ApiStatusCard } from "@/components/settings/api-status-card";
import { ModelConfigCard } from "@/components/settings/model-config-card";
import { WeightConfigCard } from "@/components/settings/weight-config-card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { Settings as SettingsIcon, Key, Brain, Sliders } from "lucide-react";

import type { ApiKeys, ApiStatus, ApiStatusInfo, ApiTestResult } from "@/components/settings/api-status-card";
import type { ModelConfig } from "@/components/settings/model-config-card";
import type { ScoringWeights } from "@/components/settings/weight-config-card";

// ---------------------------------------------------------------------------
// Defaults
// ---------------------------------------------------------------------------

const DEFAULT_MODEL_CONFIG: ModelConfig = {
  model: "gpt-4-turbo-preview",
  temperature: 0.7,
  maxTokens: 2000,
  systemPrompt:
    "Bạn là chuyên gia phân tích địa điểm kinh doanh tại Việt Nam. " +
    "Nhiệm vụ của bạn là đánh giá các địa điểm kinh doanh dựa trên dữ liệu " +
    "thị trường, nhân khẩu học, cạnh tranh và cơ sở hạ tầng. Hãy cung cấp " +
    "phân tích chi tiết, khách quan và các khuyến nghị thiết thực.",
  topP: 0.9,
  frequencyPenalty: 0,
  presencePenalty: 0,
};

const DEFAULT_WEIGHTS: ScoringWeights = {
  locationWeight: 25,
  demographicWeight: 25,
  competitionWeight: 20,
  footTrafficWeight: 15,
  infrastructureWeight: 15,
};

function defaultApiStatus(): { openai: ApiStatusInfo; googleMaps: ApiStatusInfo } {
  return {
    openai: { status: "unknown" as ApiStatus },
    googleMaps: { status: "unknown" as ApiStatus },
  };
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function SettingsClient() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("api");

  // API Keys State
  const [apiKeys, setApiKeys] = useState<ApiKeys>({
    openaiKey: "",
    googleMapsKey: "",
  });
  const [apiStatus, setApiStatus] = useState(defaultApiStatus);

  // Model Config State
  const [modelConfig, setModelConfig] = useState<ModelConfig>(DEFAULT_MODEL_CONFIG);

  // Weight Config State
  const [weights, setWeights] = useState<ScoringWeights>(DEFAULT_WEIGHTS);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = () => {
    const savedApiKeys = localStorage.getItem("api-keys");
    if (savedApiKeys) {
      try { setApiKeys(JSON.parse(savedApiKeys)); } catch { /* ignore */ }
    }

    const savedModelConfig = localStorage.getItem("model-config");
    if (savedModelConfig) {
      try { setModelConfig(JSON.parse(savedModelConfig)); } catch { /* ignore */ }
    }

    const savedWeights = localStorage.getItem("analysis-weights");
    if (savedWeights) {
      try { setWeights(JSON.parse(savedWeights)); } catch { /* ignore */ }
    }
  };

  // --- API Keys handlers ---

  const handleSaveApiKeys = async (keys: ApiKeys): Promise<void> => {
    setApiKeys(keys);
    localStorage.setItem("api-keys", JSON.stringify(keys));
    toast({
      title: "Đã lưu API keys",
      description: "Cấu hình API đã được cập nhật thành công",
    });
  };

  const handleTestApi = async (
    apiType: "openai" | "googleMaps"
  ): Promise<ApiTestResult> => {
    setApiStatus((prev) => ({
      ...prev,
      [apiType]: { ...prev[apiType], status: "testing" as ApiStatus },
    }));

    // Simulate test — real test would hit a server endpoint
    await new Promise((r) => setTimeout(r, 1000));

    const key = apiType === "openai" ? apiKeys.openaiKey : apiKeys.googleMapsKey;
    const success = key.length > 10;

    const result: ApiTestResult = success
      ? { success: true, message: "Kết nối thành công", latency: 200 }
      : { success: false, message: "API key không hợp lệ" };

    setApiStatus((prev) => ({
      ...prev,
      [apiType]: {
        status: (success ? "connected" : "disconnected") as ApiStatus,
        lastTested: new Date().toISOString(),
        message: result.message,
      },
    }));

    return result;
  };

  // --- Model Config handlers ---

  const handleModelChange = (config: ModelConfig) => {
    setModelConfig(config);
  };

  const handleSaveModelConfig = async (config: ModelConfig): Promise<void> => {
    setModelConfig(config);
    localStorage.setItem("model-config", JSON.stringify(config));
    toast({
      title: "Đã lưu cấu hình model",
      description: "Cài đặt AI model đã được cập nhật",
    });
  };

  const handleResetModelConfig = () => {
    setModelConfig(DEFAULT_MODEL_CONFIG);
    localStorage.setItem("model-config", JSON.stringify(DEFAULT_MODEL_CONFIG));
    toast({
      title: "Đã reset cấu hình model",
      description: "Cấu hình AI model đã được đặt về mặc định",
    });
  };

  // --- Weight Config handlers ---

  const handleWeightsChange = (newWeights: ScoringWeights) => {
    setWeights(newWeights);
  };

  const handleSaveWeights = async (newWeights: ScoringWeights): Promise<void> => {
    const total = Object.values(newWeights).reduce((sum, val) => sum + val, 0);
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
        {/* Header */}
        <div className="flex items-center gap-3">
          <SettingsIcon className="h-6 w-6" />
          <div>
            <SectionHeader
              title="Cấu hình hệ thống"
              description="Quản lý API keys, AI model và các tham số phân tích"
            />
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="api" className="flex items-center gap-2">
              <Key className="h-4 w-4" />
              API Keys
            </TabsTrigger>
            <TabsTrigger value="model" className="flex items-center gap-2">
              <Brain className="h-4 w-4" />
              AI Model
            </TabsTrigger>
            <TabsTrigger value="weights" className="flex items-center gap-2">
              <Sliders className="h-4 w-4" />
              Trọng số
            </TabsTrigger>
          </TabsList>

          {/* API Tab */}
          <TabsContent value="api" className="space-y-4">
            <ApiStatusCard
              apiKeys={apiKeys}
              apiStatus={apiStatus}
              onTest={handleTestApi}
              onSave={handleSaveApiKeys}
            />
          </TabsContent>

          {/* Model Tab */}
          <TabsContent value="model" className="space-y-4">
            <ModelConfigCard
              config={modelConfig}
              onChange={handleModelChange}
              onReset={handleResetModelConfig}
              onSave={handleSaveModelConfig}
              defaultConfig={DEFAULT_MODEL_CONFIG}
            />
          </TabsContent>

          {/* Weights Tab */}
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
