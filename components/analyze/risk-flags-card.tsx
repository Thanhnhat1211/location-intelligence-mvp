/**
 * Risk Flags Card Component
 * Hiển thị các cảnh báo rủi ro
 */

"use client";

import { useState } from "react";
import { RiskFlag, RiskSeverity } from "@/types/analysis";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  AlertTriangle,
  AlertCircle,
  Info,
  ChevronDown,
  ChevronUp,
  Shield,
} from "lucide-react";

interface RiskFlagsCardProps {
  riskFlags: RiskFlag[];
}

export function RiskFlagsCard({ riskFlags }: RiskFlagsCardProps) {
  const [expandedRisks, setExpandedRisks] = useState<Set<string>>(new Set());

  const toggleRisk = (id: string) => {
    const newExpanded = new Set(expandedRisks);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedRisks(newExpanded);
  };

  const getRiskIcon = (severity: RiskSeverity) => {
    switch (severity) {
      case "high":
        return <AlertTriangle className="w-5 h-5 text-red-600" />;
      case "medium":
        return <AlertCircle className="w-5 h-5 text-yellow-600" />;
      default:
        return <Info className="w-5 h-5 text-blue-600" />;
    }
  };

  const getRiskBadgeVariant = (severity: RiskSeverity) => {
    switch (severity) {
      case "high":
        return "destructive";
      case "medium":
        return "default";
      default:
        return "secondary";
    }
  };

  const getRiskLabel = (severity: RiskSeverity) => {
    switch (severity) {
      case "high":
        return "Cao";
      case "medium":
        return "Trung bình";
      default:
        return "Thấp";
    }
  };

  const getCategoryLabel = (category: RiskFlag["category"]) => {
    switch (category) {
      case "legal":
        return "Pháp lý";
      case "market":
        return "Thị trường";
      case "competition":
        return "Cạnh tranh";
      case "infrastructure":
        return "Hạ tầng";
      case "economic":
        return "Kinh tế";
      default:
        return category;
    }
  };

  const groupedRisks = {
    high: riskFlags.filter((r) => r.severity === "high"),
    medium: riskFlags.filter((r) => r.severity === "medium"),
    low: riskFlags.filter((r) => r.severity === "low"),
  };

  const totalRisks = riskFlags.length;

  return (
    <Card className="p-6">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-lg font-semibold mb-1">Cảnh báo rủi ro</h3>
            <p className="text-sm text-muted-foreground">
              {totalRisks} rủi ro tiềm ẩn đã được xác định
            </p>
          </div>
          <Badge variant="outline" className="flex items-center gap-1">
            <Shield className="w-3 h-3" />
            Phân tích rủi ro
          </Badge>
        </div>

        {/* Risk Summary */}
        <div className="flex gap-4 p-4 bg-muted rounded-lg">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-600" />
            <span className="text-sm font-medium">
              {groupedRisks.high.length} Cao
            </span>
          </div>
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-yellow-600" />
            <span className="text-sm font-medium">
              {groupedRisks.medium.length} TB
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-medium">
              {groupedRisks.low.length} Thấp
            </span>
          </div>
        </div>

        {/* Risk List */}
        <div className="space-y-3 max-h-[600px] overflow-y-auto">
          {totalRisks === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Shield className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>Không có rủi ro nào được phát hiện</p>
            </div>
          ) : (
            <>
              {/* High Severity Risks */}
              {groupedRisks.high.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-semibold text-red-600 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4" />
                    Rủi ro cao
                  </h4>
                  {groupedRisks.high.map((risk) => (
                    <RiskItem
                      key={risk.id}
                      risk={risk}
                      isExpanded={expandedRisks.has(risk.id)}
                      onToggle={() => toggleRisk(risk.id)}
                      getRiskIcon={getRiskIcon}
                      getRiskBadgeVariant={getRiskBadgeVariant}
                      getRiskLabel={getRiskLabel}
                      getCategoryLabel={getCategoryLabel}
                    />
                  ))}
                </div>
              )}

              {/* Medium Severity Risks */}
              {groupedRisks.medium.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-semibold text-yellow-600 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    Rủi ro trung bình
                  </h4>
                  {groupedRisks.medium.map((risk) => (
                    <RiskItem
                      key={risk.id}
                      risk={risk}
                      isExpanded={expandedRisks.has(risk.id)}
                      onToggle={() => toggleRisk(risk.id)}
                      getRiskIcon={getRiskIcon}
                      getRiskBadgeVariant={getRiskBadgeVariant}
                      getRiskLabel={getRiskLabel}
                      getCategoryLabel={getCategoryLabel}
                    />
                  ))}
                </div>
              )}

              {/* Low Severity Risks */}
              {groupedRisks.low.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-semibold text-blue-600 flex items-center gap-2">
                    <Info className="w-4 h-4" />
                    Rủi ro thấp
                  </h4>
                  {groupedRisks.low.map((risk) => (
                    <RiskItem
                      key={risk.id}
                      risk={risk}
                      isExpanded={expandedRisks.has(risk.id)}
                      onToggle={() => toggleRisk(risk.id)}
                      getRiskIcon={getRiskIcon}
                      getRiskBadgeVariant={getRiskBadgeVariant}
                      getRiskLabel={getRiskLabel}
                      getCategoryLabel={getCategoryLabel}
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </Card>
  );
}

interface RiskItemProps {
  risk: RiskFlag;
  isExpanded: boolean;
  onToggle: () => void;
  getRiskIcon: (severity: RiskSeverity) => React.ReactNode;
  getRiskBadgeVariant: (severity: RiskSeverity) => "destructive" | "default" | "secondary";
  getRiskLabel: (severity: RiskSeverity) => string;
  getCategoryLabel: (category: RiskFlag["category"]) => string;
}

function RiskItem({
  risk,
  isExpanded,
  onToggle,
  getRiskIcon,
  getRiskBadgeVariant,
  getRiskLabel,
  getCategoryLabel,
}: RiskItemProps) {
  return (
    <div className="border rounded-lg overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full p-4 flex items-start gap-3 hover:bg-muted/50 transition-colors text-left"
      >
        <div className="flex-shrink-0 mt-0.5">{getRiskIcon(risk.severity)}</div>
        <div className="flex-1 space-y-2">
          <div className="flex items-start justify-between gap-2">
            <h4 className="font-medium">{risk.title}</h4>
            <div className="flex items-center gap-2 flex-shrink-0">
              <Badge variant={getRiskBadgeVariant(risk.severity)}>
                {getRiskLabel(risk.severity)}
              </Badge>
              {isExpanded ? (
                <ChevronUp className="w-4 h-4 text-muted-foreground" />
              ) : (
                <ChevronDown className="w-4 h-4 text-muted-foreground" />
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              {getCategoryLabel(risk.category)}
            </Badge>
            <span className="text-xs text-muted-foreground">
              Xác suất: {(risk.probability * 100).toFixed(0)}%
            </span>
          </div>
        </div>
      </button>

      {isExpanded && (
        <div className="px-4 pb-4 space-y-3 border-t bg-muted/20">
          <div className="pt-3">
            <p className="text-sm text-muted-foreground">{risk.description}</p>
          </div>

          <div>
            <p className="text-sm font-medium mb-1">Tác động:</p>
            <p className="text-sm text-muted-foreground">{risk.impact}</p>
          </div>

          {risk.mitigation && (
            <div>
              <p className="text-sm font-medium mb-1 text-green-600">Giải pháp giảm thiểu:</p>
              <p className="text-sm text-muted-foreground">{risk.mitigation}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
