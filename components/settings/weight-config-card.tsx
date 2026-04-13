"use client";

/**
 * Weight Configuration Card Component
 * Card cấu hình trọng số tính điểm cho các yếu tố
 */

import { useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Scale, 
  BarChart, 
  AlertTriangle, 
  Save, 
  RotateCcw,
  CheckCircle,
  Info
} from "lucide-react";

/**
 * Scoring weights configuration
 */
export interface ScoringWeights {
  /** Location/positioning weight (0-100) */
  locationWeight: number;
  /** Demographics weight (0-100) */
  demographicWeight: number;
  /** Competition weight (0-100) */
  competitionWeight: number;
  /** Foot traffic weight (0-100) */
  footTrafficWeight: number;
  /** Infrastructure weight (0-100) */
  infrastructureWeight: number;
}

/**
 * Weight preset configuration
 */
interface WeightPreset {
  id: string;
  name: string;
  description: string;
  weights: ScoringWeights;
}

/**
 * Component props
 */
interface WeightConfigCardProps {
  /** Current weights configuration */
  weights: ScoringWeights;
  /** Weights change callback */
  onChange: (weights: ScoringWeights) => void;
  /** Reset to default callback */
  onReset: () => void;
  /** Save weights callback */
  onSave: (weights: ScoringWeights) => Promise<void>;
  /** Default weights for comparison */
  defaultWeights: ScoringWeights;
  /** Optional loading state */
  loading?: boolean;
}

/**
 * Weight presets
 */
const WEIGHT_PRESETS: WeightPreset[] = [
  {
    id: "balanced",
    name: "Cân bằng",
    description: "Tất cả yếu tố có trọng số bằng nhau",
    weights: {
      locationWeight: 20,
      demographicWeight: 20,
      competitionWeight: 20,
      footTrafficWeight: 20,
      infrastructureWeight: 20,
    },
  },
  {
    id: "location-focused",
    name: "Tập trung vị trí",
    description: "Ưu tiên vị trí và giao thông",
    weights: {
      locationWeight: 35,
      demographicWeight: 15,
      competitionWeight: 15,
      footTrafficWeight: 25,
      infrastructureWeight: 10,
    },
  },
  {
    id: "market-focused",
    name: "Tập trung thị trường",
    description: "Ưu tiên nhân khẩu và cạnh tranh",
    weights: {
      locationWeight: 15,
      demographicWeight: 30,
      competitionWeight: 30,
      footTrafficWeight: 15,
      infrastructureWeight: 10,
    },
  },
  {
    id: "infrastructure-focused",
    name: "Tập trung cơ sở hạ tầng",
    description: "Ưu tiên giao thông và tiện ích",
    weights: {
      locationWeight: 20,
      demographicWeight: 15,
      competitionWeight: 15,
      footTrafficWeight: 20,
      infrastructureWeight: 30,
    },
  },
  {
    id: "fnb-optimized",
    name: "Tối ưu F&B",
    description: "Phù hợp với nhà hàng, quán ăn",
    weights: {
      locationWeight: 25,
      demographicWeight: 20,
      competitionWeight: 20,
      footTrafficWeight: 30,
      infrastructureWeight: 5,
    },
  },
  {
    id: "retail-optimized",
    name: "Tối ưu Bán lẻ",
    description: "Phù hợp với cửa hàng bán lẻ",
    weights: {
      locationWeight: 30,
      demographicWeight: 25,
      competitionWeight: 15,
      footTrafficWeight: 25,
      infrastructureWeight: 5,
    },
  },
];

/**
 * Weight factor metadata
 */
const WEIGHT_FACTORS = [
  {
    key: "locationWeight" as keyof ScoringWeights,
    label: "Vị trí",
    description: "Khoảng cách đến khách hàng mục tiêu, trung tâm thành phố",
    color: "bg-blue-500",
  },
  {
    key: "demographicWeight" as keyof ScoringWeights,
    label: "Nhân khẩu học",
    description: "Dân số, thu nhập, độ tuổi phù hợp",
    color: "bg-green-500",
  },
  {
    key: "competitionWeight" as keyof ScoringWeights,
    label: "Cạnh tranh",
    description: "Số lượng và chất lượng đối thủ",
    color: "bg-amber-500",
  },
  {
    key: "footTrafficWeight" as keyof ScoringWeights,
    label: "Lưu lượng người",
    description: "Mật độ người đi bộ, hoạt động khu vực",
    color: "bg-purple-500",
  },
  {
    key: "infrastructureWeight" as keyof ScoringWeights,
    label: "Cơ sở hạ tầng",
    description: "Giao thông công cộng, đường xá, tiện ích",
    color: "bg-red-500",
  },
];

export function WeightConfigCard({
  weights,
  onChange,
  onReset,
  onSave,
  defaultWeights,
  loading = false
}: WeightConfigCardProps) {
  const [editedWeights, setEditedWeights] = useState<ScoringWeights>(weights);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState<string>("custom");

  /**
   * Calculate total weight
   */
  const totalWeight = useMemo(() => {
    return Object.values(editedWeights).reduce((sum, weight) => sum + weight, 0);
  }, [editedWeights]);

  /**
   * Check if weights are valid (total = 100)
   */
  const isValid = totalWeight === 100;

  /**
   * Check if current weights match default
   */
  const isDifferentFromDefault = () => {
    return JSON.stringify(editedWeights) !== JSON.stringify(defaultWeights);
  };

  /**
   * Handle weight change
   */
  const handleWeightChange = (key: keyof ScoringWeights, value: number) => {
    const newWeights = { ...editedWeights, [key]: value };
    setEditedWeights(newWeights);
    setHasChanges(true);
    setSelectedPreset("custom");
    onChange(newWeights);
  };

  /**
   * Handle preset selection
   */
  const handlePresetChange = (presetId: string) => {
    setSelectedPreset(presetId);
    
    if (presetId === "custom") return;
    
    const preset = WEIGHT_PRESETS.find(p => p.id === presetId);
    if (preset) {
      setEditedWeights(preset.weights);
      setHasChanges(true);
      onChange(preset.weights);
    }
  };

  /**
   * Auto-normalize weights to total 100
   */
  const handleNormalize = () => {
    const total = totalWeight;
    if (total === 0) return;

    const normalized: ScoringWeights = Object.entries(editedWeights).reduce(
      (acc, [key, value]) => ({
        ...acc,
        [key]: Math.round((value / total) * 100),
      }),
      {} as ScoringWeights
    );

    // Adjust rounding errors to ensure total = 100
    const newTotal = Object.values(normalized).reduce((sum, w) => sum + w, 0);
    if (newTotal !== 100) {
      const diff = 100 - newTotal;
      normalized.locationWeight += diff;
    }

    setEditedWeights(normalized);
    setHasChanges(true);
    setSelectedPreset("custom");
    onChange(normalized);
  };

  /**
   * Handle reset to default
   */
  const handleReset = () => {
    setEditedWeights(defaultWeights);
    setHasChanges(true);
    setSelectedPreset("custom");
    onChange(defaultWeights);
    onReset();
  };

  /**
   * Handle save
   */
  const handleSave = async () => {
    if (!isValid) return;

    setSaving(true);
    try {
      await onSave(editedWeights);
      setHasChanges(false);
    } catch (error) {
      console.error("Error saving weights:", error);
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
            <Scale className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">Trọng số tính điểm</h3>
            <p className="text-sm text-muted-foreground">
              Tùy chỉnh mức độ quan trọng của từng yếu tố
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
        {/* Preset Selection */}
        <div className="space-y-2">
          <Label htmlFor="preset">Cấu hình sẵn</Label>
          <Select
            value={selectedPreset}
            onValueChange={handlePresetChange}
            disabled={loading || saving}
          >
            <SelectTrigger id="preset">
              <SelectValue placeholder="Chọn cấu hình" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="custom">
                <span className="font-medium">Tùy chỉnh</span>
              </SelectItem>
              {WEIGHT_PRESETS.map((preset) => (
                <SelectItem key={preset.id} value={preset.id}>
                  <div className="flex flex-col">
                    <span className="font-medium">{preset.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {preset.description}
                    </span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Total Weight Indicator */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="flex items-center gap-2">
              <BarChart className="w-4 h-4" />
              Tổng trọng số
            </Label>
            <div className="flex items-center gap-2">
              <span className={`text-lg font-bold ${isValid ? "text-green-600" : "text-red-600"}`}>
                {totalWeight}%
              </span>
              {isValid ? (
                <CheckCircle className="w-5 h-5 text-green-600" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-red-600" />
              )}
            </div>
          </div>
          <Progress value={Math.min(totalWeight, 100)} className="h-2" />
          {!isValid && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-red-600 flex items-center gap-1">
                <AlertTriangle className="w-4 h-4" />
                Tổng trọng số phải bằng 100%
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={handleNormalize}
                disabled={totalWeight === 0}
              >
                Tự động cân bằng
              </Button>
            </div>
          )}
        </div>

        {/* Weight Sliders */}
        <div className="space-y-6 pt-4 border-t">
          {WEIGHT_FACTORS.map((factor) => {
            const value = editedWeights[factor.key];
            const defaultValue = defaultWeights[factor.key];
            const percentage = totalWeight > 0 ? (value / totalWeight) * 100 : 0;

            return (
              <div key={factor.key} className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="font-medium">{factor.label}</Label>
                    <p className="text-xs text-muted-foreground mt-1">
                      {factor.description}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    {value !== defaultValue && (
                      <Badge variant="secondary" className="text-xs">
                        Mặc định: {defaultValue}
                      </Badge>
                    )}
                    <span className="text-lg font-semibold min-w-[60px] text-right">
                      {value}%
                    </span>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Slider
                    value={[value]}
                    onValueChange={([newValue]) => handleWeightChange(factor.key, newValue)}
                    min={0}
                    max={100}
                    step={1}
                    disabled={loading || saving}
                    className="w-full"
                  />
                  
                  {/* Visual distribution bar */}
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className={`h-full ${factor.color} transition-all duration-300`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Visual Distribution Summary */}
        <div className="space-y-3 pt-4 border-t">
          <Label className="flex items-center gap-2">
            <BarChart className="w-4 h-4" />
            Phân bố trọng số
          </Label>
          <div className="h-8 flex rounded-lg overflow-hidden">
            {WEIGHT_FACTORS.map((factor) => {
              const value = editedWeights[factor.key];
              const percentage = totalWeight > 0 ? (value / totalWeight) * 100 : 0;
              
              if (percentage === 0) return null;
              
              return (
                <div
                  key={factor.key}
                  className={`${factor.color} flex items-center justify-center text-xs font-medium text-white transition-all duration-300`}
                  style={{ width: `${percentage}%` }}
                  title={`${factor.label}: ${value}% (${percentage.toFixed(1)}% của tổng)`}
                >
                  {percentage >= 10 && `${value}%`}
                </div>
              );
            })}
          </div>
          <div className="grid grid-cols-2 gap-2">
            {WEIGHT_FACTORS.map((factor) => (
              <div key={factor.key} className="flex items-center gap-2 text-xs">
                <div className={`w-3 h-3 rounded ${factor.color}`} />
                <span className="text-muted-foreground">{factor.label}</span>
                <span className="font-medium ml-auto">{editedWeights[factor.key]}%</span>
              </div>
            ))}
          </div>
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
              disabled={!hasChanges || !isValid || loading || saving}
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
