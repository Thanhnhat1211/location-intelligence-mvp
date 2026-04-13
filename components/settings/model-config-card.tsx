"use client";

/**
 * Model Configuration Card Component
 * Card cấu hình AI model và các tham số
 */

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Settings, RotateCcw, Save, Sliders, AlertCircle, Info } from "lucide-react";

/**
 * AI Model configuration
 */
export interface ModelConfig {
  /** AI model name */
  model: string;
  /** Temperature (0-1) - creativity/randomness */
  temperature: number;
  /** Maximum tokens for response */
  maxTokens: number;
  /** System prompt template */
  systemPrompt: string;
  /** Top P sampling (0-1) */
  topP: number;
  /** Frequency penalty (0-2) */
  frequencyPenalty: number;
  /** Presence penalty (0-2) */
  presencePenalty: number;
}

/**
 * Component props
 */
interface ModelConfigCardProps {
  /** Current model configuration */
  config: ModelConfig;
  /** Configuration change callback */
  onChange: (config: ModelConfig) => void;
  /** Reset to default callback */
  onReset: () => void;
  /** Save configuration callback */
  onSave: (config: ModelConfig) => Promise<void>;
  /** Default configuration for comparison */
  defaultConfig: ModelConfig;
  /** Optional loading state */
  loading?: boolean;
}

/**
 * Available AI models
 */
const AI_MODELS = [
  { value: "gpt-4-turbo-preview", label: "GPT-4 Turbo", description: "Mạnh nhất, chính xác cao" },
  { value: "gpt-4", label: "GPT-4", description: "Cân bằng giữa chất lượng và tốc độ" },
  { value: "gpt-3.5-turbo", label: "GPT-3.5 Turbo", description: "Nhanh, chi phí thấp" },
];

/**
 * Default system prompt
 */
const DEFAULT_SYSTEM_PROMPT = `Bạn là chuyên gia phân tích địa điểm kinh doanh tại Việt Nam. Nhiệm vụ của bạn là đánh giá các địa điểm kinh doanh dựa trên dữ liệu thị trường, nhân khẩu học, cạnh tranh và cơ sở hạ tầng. Hãy cung cấp phân tích chi tiết, khách quan và các khuyến nghị thiết thực.`;

export function ModelConfigCard({
  config,
  onChange,
  onReset,
  onSave,
  defaultConfig,
  loading = false
}: ModelConfigCardProps) {
  const [editedConfig, setEditedConfig] = useState<ModelConfig>(config);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  /**
   * Check if current config differs from default
   */
  const isDifferentFromDefault = () => {
    return JSON.stringify(editedConfig) !== JSON.stringify(defaultConfig);
  };

  /**
   * Handle configuration change
   */
  const handleConfigChange = <K extends keyof ModelConfig>(
    key: K,
    value: ModelConfig[K]
  ) => {
    const newConfig = { ...editedConfig, [key]: value };
    setEditedConfig(newConfig);
    setHasChanges(true);
    onChange(newConfig);
  };

  /**
   * Handle reset to default
   */
  const handleReset = () => {
    setEditedConfig(defaultConfig);
    setHasChanges(true);
    onChange(defaultConfig);
    onReset();
  };

  /**
   * Handle save
   */
  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave(editedConfig);
      setHasChanges(false);
    } catch (error) {
      console.error("Error saving model config:", error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Settings className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">Cấu hình AI Model</h3>
            <p className="text-sm text-muted-foreground">
              Tùy chỉnh model và tham số phân tích AI
            </p>
          </div>
        </div>
        {isDifferentFromDefault() && (
          <Badge variant="outline" className="flex items-center gap-1">
            <Info className="w-3 h-3" />
            Đã tùy chỉnh
          </Badge>
        )}
      </div>

      <div className="space-y-6">
        {/* Model Selection */}
        <div className="space-y-2">
          <Label htmlFor="model">AI Model</Label>
          <Select
            value={editedConfig.model}
            onValueChange={(value) => handleConfigChange("model", value)}
            disabled={loading || saving}
          >
            <SelectTrigger id="model">
              <SelectValue placeholder="Chọn AI model" />
            </SelectTrigger>
            <SelectContent>
              {AI_MODELS.map((model) => (
                <SelectItem key={model.value} value={model.value}>
                  <div className="flex flex-col">
                    <span className="font-medium">{model.label}</span>
                    <span className="text-xs text-muted-foreground">
                      {model.description}
                    </span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            Model hiện tại: <span className="font-medium">{editedConfig.model}</span>
            {editedConfig.model !== defaultConfig.model && (
              <span className="text-amber-600 ml-2">
                (Mặc định: {defaultConfig.model})
              </span>
            )}
          </p>
        </div>

        {/* Temperature */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label>Temperature: {editedConfig.temperature.toFixed(2)}</Label>
            {editedConfig.temperature !== defaultConfig.temperature && (
              <Badge variant="secondary" className="text-xs">
                Mặc định: {defaultConfig.temperature}
              </Badge>
            )}
          </div>
          <Slider
            value={[editedConfig.temperature]}
            onValueChange={([value]) => handleConfigChange("temperature", value)}
            min={0}
            max={1}
            step={0.01}
            disabled={loading || saving}
            className="w-full"
          />
          <p className="text-xs text-muted-foreground">
            Độ sáng tạo/ngẫu nhiên. Thấp (0.0-0.3): chính xác, nhất quán. 
            Cao (0.7-1.0): sáng tạo, đa dạng.
          </p>
        </div>

        {/* Max Tokens */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="max-tokens">Max Tokens</Label>
            {editedConfig.maxTokens !== defaultConfig.maxTokens && (
              <Badge variant="secondary" className="text-xs">
                Mặc định: {defaultConfig.maxTokens}
              </Badge>
            )}
          </div>
          <Input
            id="max-tokens"
            type="number"
            value={editedConfig.maxTokens}
            onChange={(e) => handleConfigChange("maxTokens", parseInt(e.target.value) || 0)}
            min={100}
            max={4000}
            step={100}
            disabled={loading || saving}
          />
          <p className="text-xs text-muted-foreground">
            Số token tối đa cho phản hồi. Khuyến nghị: 1000-2000 cho phân tích chi tiết.
          </p>
        </div>

        {/* Top P */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label>Top P: {editedConfig.topP.toFixed(2)}</Label>
            {editedConfig.topP !== defaultConfig.topP && (
              <Badge variant="secondary" className="text-xs">
                Mặc định: {defaultConfig.topP}
              </Badge>
            )}
          </div>
          <Slider
            value={[editedConfig.topP]}
            onValueChange={([value]) => handleConfigChange("topP", value)}
            min={0}
            max={1}
            step={0.01}
            disabled={loading || saving}
            className="w-full"
          />
          <p className="text-xs text-muted-foreground">
            Nucleus sampling. Khuyến nghị: 0.9-1.0 cho kết quả tốt nhất.
          </p>
        </div>

        {/* Frequency Penalty */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label>Frequency Penalty: {editedConfig.frequencyPenalty.toFixed(2)}</Label>
            {editedConfig.frequencyPenalty !== defaultConfig.frequencyPenalty && (
              <Badge variant="secondary" className="text-xs">
                Mặc định: {defaultConfig.frequencyPenalty}
              </Badge>
            )}
          </div>
          <Slider
            value={[editedConfig.frequencyPenalty]}
            onValueChange={([value]) => handleConfigChange("frequencyPenalty", value)}
            min={0}
            max={2}
            step={0.01}
            disabled={loading || saving}
            className="w-full"
          />
          <p className="text-xs text-muted-foreground">
            Giảm lặp lại từ. Cao hơn = ít lặp lại hơn.
          </p>
        </div>

        {/* Presence Penalty */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label>Presence Penalty: {editedConfig.presencePenalty.toFixed(2)}</Label>
            {editedConfig.presencePenalty !== defaultConfig.presencePenalty && (
              <Badge variant="secondary" className="text-xs">
                Mặc định: {defaultConfig.presencePenalty}
              </Badge>
            )}
          </div>
          <Slider
            value={[editedConfig.presencePenalty]}
            onValueChange={([value]) => handleConfigChange("presencePenalty", value)}
            min={0}
            max={2}
            step={0.01}
            disabled={loading || saving}
            className="w-full"
          />
          <p className="text-xs text-muted-foreground">
            Khuyến khích chủ đề mới. Cao hơn = đa dạng chủ đề hơn.
          </p>
        </div>

        {/* System Prompt */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="system-prompt">System Prompt</Label>
            {editedConfig.systemPrompt !== defaultConfig.systemPrompt && (
              <Badge variant="secondary" className="text-xs">
                Đã tùy chỉnh
              </Badge>
            )}
          </div>
          <textarea
            id="system-prompt"
            value={editedConfig.systemPrompt}
            onChange={(e) => handleConfigChange("systemPrompt", e.target.value)}
            rows={4}
            disabled={loading || saving}
            className="w-full px-3 py-2 text-sm border rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <p className="text-xs text-muted-foreground">
            Hướng dẫn cho AI về vai trò và cách phân tích.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-4 border-t">
          <Button
            variant="outline"
            onClick={handleReset}
            disabled={!isDifferentFromDefault() || loading || saving}
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Đặt lại mặc định
          </Button>
          <div className="flex items-center gap-3">
            <p className="text-sm text-muted-foreground">
              {hasChanges ? "Có thay đổi chưa lưu" : "Đã lưu"}
            </p>
            <Button
              onClick={handleSave}
              disabled={!hasChanges || loading || saving}
            >
              <Save className="w-4 h-4 mr-2" />
              {saving ? "Đang lưu..." : "Lưu cấu hình"}
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}
