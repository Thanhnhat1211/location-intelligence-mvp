"use client";

/**
 * API Status Card
 *
 * Shows the server-side Claude API configuration status and lets the user
 * run a live connection test. The API key lives on the server (env var),
 * never in the browser — so this is read-only observability, not key entry.
 */

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Key,
  CheckCircle,
  XCircle,
  RefreshCw,
  AlertCircle,
  Info,
  Server,
} from "lucide-react";

export type ApiStatus =
  | "connected"
  | "not_configured"
  | "invalid_key"
  | "error"
  | "testing"
  | "unknown";

export interface ApiStatusInfo {
  status: ApiStatus;
  lastTested?: string;
  message?: string;
  latency?: number;
  model?: string;
}

interface ApiStatusCardProps {
  status: ApiStatusInfo;
  onTest: () => Promise<void>;
}

function getStatusDisplay(status: ApiStatus) {
  switch (status) {
    case "connected":
      return {
        icon: CheckCircle,
        text: "Đã kết nối",
        className: "bg-green-500 hover:bg-green-600 text-white",
      };
    case "not_configured":
      return {
        icon: AlertCircle,
        text: "Chưa cấu hình",
        className: "bg-amber-500 hover:bg-amber-600 text-white",
      };
    case "invalid_key":
      return {
        icon: XCircle,
        text: "API key không hợp lệ",
        className: "bg-red-500 hover:bg-red-600 text-white",
      };
    case "error":
      return {
        icon: XCircle,
        text: "Lỗi kết nối",
        className: "bg-red-500 hover:bg-red-600 text-white",
      };
    case "testing":
      return {
        icon: RefreshCw,
        text: "Đang kiểm tra...",
        className: "bg-blue-500 hover:bg-blue-600 text-white",
      };
    default:
      return {
        icon: AlertCircle,
        text: "Chưa kiểm tra",
        className: "",
      };
  }
}

function formatLastTested(timestamp?: string): string {
  if (!timestamp) return "Chưa kiểm tra";
  const diffMs = Date.now() - new Date(timestamp).getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return "Vừa xong";
  if (diffMins < 60) return `${diffMins} phút trước`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours} giờ trước`;
  return `${Math.floor(diffHours / 24)} ngày trước`;
}

export function ApiStatusCard({ status, onTest }: ApiStatusCardProps) {
  const [testing, setTesting] = useState(false);

  const handleTest = async () => {
    setTesting(true);
    try {
      await onTest();
    } finally {
      setTesting(false);
    }
  };

  const display = getStatusDisplay(testing ? "testing" : status.status);
  const StatusIcon = display.icon;

  return (
    <div className="space-y-4">
      {/* Claude API status */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Key className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">Claude API (Anthropic)</h3>
            <p className="text-sm text-muted-foreground">
              Dùng để nâng chất lượng văn bản của strategy memo
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 rounded-lg bg-muted/40">
            <div>
              <div className="text-sm font-medium">Trạng thái kết nối</div>
              <div className="text-xs text-muted-foreground mt-1">
                Kiểm tra lần cuối: {formatLastTested(status.lastTested)}
              </div>
              {status.message && (
                <div
                  className={`text-xs mt-1 ${
                    status.status === "connected"
                      ? "text-green-600"
                      : status.status === "not_configured"
                      ? "text-amber-600"
                      : "text-red-600"
                  }`}
                >
                  {status.message}
                </div>
              )}
            </div>
            <Badge
              className={`${display.className} flex items-center gap-1.5 px-3 py-1`}
            >
              <StatusIcon
                className={`w-3.5 h-3.5 ${testing ? "animate-spin" : ""}`}
              />
              {display.text}
            </Badge>
          </div>

          {status.model && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Model:</span>
              <span className="font-mono text-xs">{status.model}</span>
            </div>
          )}

          {status.latency !== undefined && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Độ trễ:</span>
              <span className="font-mono text-xs">{status.latency}ms</span>
            </div>
          )}

          <div className="flex items-center justify-between pt-2">
            <div className="text-xs text-muted-foreground flex items-start gap-1.5">
              <Info className="w-3.5 h-3.5 mt-0.5 shrink-0" />
              <span>
                API key được lưu trên server (biến môi trường{" "}
                <code className="font-mono bg-muted px-1 rounded">
                  ANTHROPIC_API_KEY
                </code>
                ), không lộ ra client.
              </span>
            </div>
            <Button
              variant="outline"
              onClick={handleTest}
              disabled={testing}
              className="shrink-0 ml-3"
            >
              <RefreshCw
                className={`w-4 h-4 mr-2 ${testing ? "animate-spin" : ""}`}
              />
              Kiểm tra ngay
            </Button>
          </div>
        </div>
      </Card>

      {/* Data sources (free APIs) — read-only info */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Server className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">Nguồn dữ liệu mở</h3>
            <p className="text-sm text-muted-foreground">
              Các API miễn phí, không cần key
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 rounded-md bg-muted/30">
            <div>
              <div className="text-sm font-medium">
                OpenStreetMap — Overpass API
              </div>
              <div className="text-xs text-muted-foreground">
                Lấy dữ liệu doanh nghiệp thật trong bán kính 500m
              </div>
            </div>
            <Badge className="bg-green-500 hover:bg-green-600 text-white">
              <CheckCircle className="w-3.5 h-3.5 mr-1" />
              Miễn phí
            </Badge>
          </div>

          <div className="flex items-center justify-between p-3 rounded-md bg-muted/30">
            <div>
              <div className="text-sm font-medium">
                OpenStreetMap — Nominatim
              </div>
              <div className="text-xs text-muted-foreground">
                Reverse geocoding lấy phường/quận chính xác
              </div>
            </div>
            <Badge className="bg-green-500 hover:bg-green-600 text-white">
              <CheckCircle className="w-3.5 h-3.5 mr-1" />
              Miễn phí
            </Badge>
          </div>
        </div>
      </Card>
    </div>
  );
}
