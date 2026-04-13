"use client";

/**
 * API Status Card Component
 * Card hiển thị trạng thái kết nối API và cho phép cập nhật API keys
 */

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { 
  Key, 
  CheckCircle, 
  XCircle, 
  RefreshCw, 
  Eye, 
  EyeOff,
  Save,
  AlertCircle
} from "lucide-react";

/**
 * API connection status type
 */
export type ApiStatus = "connected" | "disconnected" | "testing" | "unknown";

/**
 * API keys configuration
 */
export interface ApiKeys {
  openaiKey: string;
  googleMapsKey: string;
}

/**
 * API test result
 */
export interface ApiTestResult {
  success: boolean;
  message: string;
  latency?: number;
}

/**
 * API status information
 */
export interface ApiStatusInfo {
  status: ApiStatus;
  lastTested?: string;
  message?: string;
}

/**
 * Component props
 */
interface ApiStatusCardProps {
  /** Current API keys */
  apiKeys: ApiKeys;
  /** API status for each service */
  apiStatus: {
    openai: ApiStatusInfo;
    googleMaps: ApiStatusInfo;
  };
  /** Test connection callback */
  onTest: (apiType: "openai" | "googleMaps") => Promise<ApiTestResult>;
  /** Save API keys callback */
  onSave: (keys: ApiKeys) => Promise<void>;
  /** Optional loading state */
  loading?: boolean;
}

/**
 * Get status badge variant and icon
 */
const getStatusDisplay = (status: ApiStatus) => {
  switch (status) {
    case "connected":
      return {
        variant: "default" as const,
        icon: CheckCircle,
        text: "Đã kết nối",
        className: "bg-green-500 hover:bg-green-600"
      };
    case "disconnected":
      return {
        variant: "destructive" as const,
        icon: XCircle,
        text: "Chưa kết nối",
        className: ""
      };
    case "testing":
      return {
        variant: "secondary" as const,
        icon: RefreshCw,
        text: "Đang kiểm tra...",
        className: "bg-yellow-500 hover:bg-yellow-600"
      };
    default:
      return {
        variant: "outline" as const,
        icon: AlertCircle,
        text: "Chưa rõ",
        className: ""
      };
  }
};

/**
 * Format timestamp for last tested display
 */
const formatLastTested = (timestamp?: string) => {
  if (!timestamp) return "Chưa kiểm tra";
  
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  
  if (diffMins < 1) return "Vừa xong";
  if (diffMins < 60) return `${diffMins} phút trước`;
  
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours} giờ trước`;
  
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays} ngày trước`;
};

export function ApiStatusCard({
  apiKeys,
  apiStatus,
  onTest,
  onSave,
  loading = false
}: ApiStatusCardProps) {
  const [editedKeys, setEditedKeys] = useState<ApiKeys>(apiKeys);
  const [showKeys, setShowKeys] = useState({
    openai: false,
    googleMaps: false
  });
  const [testingApi, setTestingApi] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  /**
   * Handle API key input change
   */
  const handleKeyChange = (apiType: "openaiKey" | "googleMapsKey", value: string) => {
    setEditedKeys(prev => ({ ...prev, [apiType]: value }));
    setHasChanges(true);
  };

  /**
   * Toggle show/hide for API key
   */
  const toggleShowKey = (apiType: "openai" | "googleMaps") => {
    setShowKeys(prev => ({ ...prev, [apiType]: !prev[apiType] }));
  };

  /**
   * Test API connection
   */
  const handleTest = async (apiType: "openai" | "googleMaps") => {
    setTestingApi(apiType);
    try {
      const result = await onTest(apiType);
      // Parent component handles updating apiStatus
    } catch (error) {
      console.error(`Error testing ${apiType} API:`, error);
    } finally {
      setTestingApi(null);
    }
  };

  /**
   * Save API keys
   */
  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave(editedKeys);
      setHasChanges(false);
    } catch (error) {
      console.error("Error saving API keys:", error);
    } finally {
      setSaving(false);
    }
  };

  /**
   * Mask API key for display
   */
  const maskKey = (key: string) => {
    if (!key) return "";
    if (key.length <= 8) return "••••••••";
    return key.substring(0, 4) + "••••••••" + key.substring(key.length - 4);
  };

  return (
    <Card className="p-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-primary/10 rounded-lg">
          <Key className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h3 className="text-lg font-semibold">Trạng thái API</h3>
          <p className="text-sm text-muted-foreground">
            Quản lý và kiểm tra kết nối API
          </p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Claude API */}
        <div className="space-y-3 pb-6 border-b">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-base font-medium">Claude API</Label>
              <p className="text-sm text-muted-foreground mt-1">
                Sử dụng Claude AI cho phân tích và tạo strategy memo
              </p>
            </div>
            {(() => {
              const status = apiStatus.openai.status;
              const display = getStatusDisplay(status);
              const StatusIcon = display.icon;
              return (
                <Badge 
                  variant={display.variant}
                  className={`${display.className} flex items-center gap-1.5`}
                >
                  <StatusIcon className={`w-3.5 h-3.5 ${status === "testing" ? "animate-spin" : ""}`} />
                  {display.text}
                </Badge>
              );
            })()}
          </div>

          <div className="space-y-2">
            <Label htmlFor="openai-key">API Key</Label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Input
                  id="openai-key"
                  type={showKeys.openai ? "text" : "password"}
                  value={editedKeys.openaiKey}
                  onChange={(e) => handleKeyChange("openaiKey", e.target.value)}
                  placeholder="sk-..."
                  className="pr-10 font-mono text-sm"
                  disabled={loading || testingApi === "openai"}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                  onClick={() => toggleShowKey("openai")}
                >
                  {showKeys.openai ? (
                    <EyeOff className="w-4 h-4 text-muted-foreground" />
                  ) : (
                    <Eye className="w-4 h-4 text-muted-foreground" />
                  )}
                </Button>
              </div>
              <Button
                variant="outline"
                onClick={() => handleTest("openai")}
                disabled={!editedKeys.openaiKey || testingApi !== null || loading}
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${testingApi === "openai" ? "animate-spin" : ""}`} />
                Kiểm tra
              </Button>
            </div>
          </div>

          {apiStatus.openai.lastTested && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                Kiểm tra lần cuối: {formatLastTested(apiStatus.openai.lastTested)}
              </span>
              {apiStatus.openai.message && (
                <span className={apiStatus.openai.status === "connected" ? "text-green-600" : "text-red-600"}>
                  {apiStatus.openai.message}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Google Maps API */}
        <div className="space-y-3 pb-6 border-b">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-base font-medium">Google Maps API</Label>
              <p className="text-sm text-muted-foreground mt-1">
                Sử dụng cho bản đồ, geocoding và dữ liệu địa điểm
              </p>
            </div>
            {(() => {
              const status = apiStatus.googleMaps.status;
              const display = getStatusDisplay(status);
              const StatusIcon = display.icon;
              return (
                <Badge 
                  variant={display.variant}
                  className={`${display.className} flex items-center gap-1.5`}
                >
                  <StatusIcon className={`w-3.5 h-3.5 ${status === "testing" ? "animate-spin" : ""}`} />
                  {display.text}
                </Badge>
              );
            })()}
          </div>

          <div className="space-y-2">
            <Label htmlFor="google-maps-key">API Key</Label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Input
                  id="google-maps-key"
                  type={showKeys.googleMaps ? "text" : "password"}
                  value={editedKeys.googleMapsKey}
                  onChange={(e) => handleKeyChange("googleMapsKey", e.target.value)}
                  placeholder="AIza..."
                  className="pr-10 font-mono text-sm"
                  disabled={loading || testingApi === "googleMaps"}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                  onClick={() => toggleShowKey("googleMaps")}
                >
                  {showKeys.googleMaps ? (
                    <EyeOff className="w-4 h-4 text-muted-foreground" />
                  ) : (
                    <Eye className="w-4 h-4 text-muted-foreground" />
                  )}
                </Button>
              </div>
              <Button
                variant="outline"
                onClick={() => handleTest("googleMaps")}
                disabled={!editedKeys.googleMapsKey || testingApi !== null || loading}
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${testingApi === "googleMaps" ? "animate-spin" : ""}`} />
                Kiểm tra
              </Button>
            </div>
          </div>

          {apiStatus.googleMaps.lastTested && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                Kiểm tra lần cuối: {formatLastTested(apiStatus.googleMaps.lastTested)}
              </span>
              {apiStatus.googleMaps.message && (
                <span className={apiStatus.googleMaps.status === "connected" ? "text-green-600" : "text-red-600"}>
                  {apiStatus.googleMaps.message}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Save Button */}
        <div className="flex items-center justify-between pt-2">
          <p className="text-sm text-muted-foreground">
            {hasChanges ? "Có thay đổi chưa lưu" : "Tất cả thay đổi đã được lưu"}
          </p>
          <Button
            onClick={handleSave}
            disabled={!hasChanges || saving || testingApi !== null || loading}
          >
            <Save className="w-4 h-4 mr-2" />
            {saving ? "Đang lưu..." : "Lưu thay đổi"}
          </Button>
        </div>
      </div>
    </Card>
  );
}
