/**
 * Analyze Filters Panel Component
 */

"use client";

import { useState } from "react";
import { BusinessModel, AnalysisFilters } from "@/types/analysis";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { UtensilsCrossed, Home, Store, Search, MapPin, CheckCircle2 } from "lucide-react";
import type { Coordinates } from "@/types/location";

interface AnalyzeFiltersPanelProps {
  onAnalyze: (filters: AnalysisFilters) => void;
  isLoading?: boolean;
  initialFilters?: AnalysisFilters;
  selectedLocation?: { coords: Coordinates; address: string };
}

const businessModels: { value: BusinessModel; label: string; icon: React.ReactNode }[] = [
  { value: "fnb", label: "F&B / Nhà hàng", icon: <UtensilsCrossed className="w-4 h-4" /> },
  { value: "airbnb", label: "Airbnb / Homestay", icon: <Home className="w-4 h-4" /> },
  { value: "retail", label: "Bán lẻ / Cửa hàng", icon: <Store className="w-4 h-4" /> },
];

const districts = [
  "Quận 1",
  "Quận 2",
  "Quận 3",
  "Quận 4",
  "Quận 5",
  "Quận 6",
  "Quận 7",
  "Quận 8",
  "Quận 9",
  "Quận 10",
  "Quận 11",
  "Quận 12",
  "Thủ Đức",
  "Bình Thạnh",
  "Phú Nhuận",
  "Tân Bình",
  "Tân Phú",
  "Gò Vấp",
  "Bình Tân",
];

export function AnalyzeFiltersPanel({
  onAnalyze,
  isLoading = false,
  initialFilters,
  selectedLocation,
}: AnalyzeFiltersPanelProps) {
  const [filters, setFilters] = useState<AnalysisFilters>(
    initialFilters || { businessModel: "fnb" as BusinessModel }
  );
  const [maxRent, setMaxRent] = useState(filters.maxRent || 50000000);

  const onFiltersChange = (updated: AnalysisFilters) => {
    setFilters(updated);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      minimumFractionDigits: 0,
    }).format(value);
  };

  const handleBusinessModelChange = (value: BusinessModel) => {
    onFiltersChange({ ...filters, businessModel: value });
  };

  const handleTargetRevenueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^\d]/g, "");
    onFiltersChange({ ...filters, targetRevenue: value ? parseInt(value) : undefined });
  };

  const handleMaxRentChange = (value: number[]) => {
    const rent = value[0];
    setMaxRent(rent);
    onFiltersChange({ ...filters, maxRent: rent });
  };

  const handleMinAreaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    onFiltersChange({ ...filters, minArea: value ? parseInt(value) : undefined });
  };

  const handleMaxAreaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    onFiltersChange({ ...filters, maxArea: value ? parseInt(value) : undefined });
  };

  const handleDistrictChange = (value: string) => {
    const currentDistricts = filters.districts || [];
    const newDistricts = currentDistricts.includes(value)
      ? currentDistricts.filter((d) => d !== value)
      : [...currentDistricts, value];
    onFiltersChange({ ...filters, districts: newDistricts });
  };

  return (
    <Card className="p-6 space-y-6">
      <div>
        <h3 className="text-lg font-serif mb-1">Bộ lọc phân tích</h3>
        <p className="text-xs text-muted-foreground">Chọn tiêu chí đánh giá địa điểm</p>
      </div>

      {/* Selected Location */}
      <div className="space-y-2">
        <Label className="text-[11px] uppercase tracking-[0.5px] font-semibold text-muted-foreground">
          Vị trí đã chọn
        </Label>
        {selectedLocation ? (
          <div className="flex items-start gap-2 p-3 rounded-xl bg-emerald-50 border border-emerald-200/60">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-emerald-900 line-clamp-2">{selectedLocation.address}</p>
              <p className="text-[11px] text-emerald-600 mt-0.5">
                {selectedLocation.coords.lat.toFixed(4)}, {selectedLocation.coords.lng.toFixed(4)}
              </p>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2 p-3 rounded-xl bg-amber-50 border border-amber-200/60">
            <MapPin className="w-4 h-4 text-amber-600 flex-shrink-0" />
            <p className="text-sm text-amber-800">Click vào bản đồ để chọn vị trí</p>
          </div>
        )}
      </div>

      {/* Business Model Selector */}
      <div className="space-y-2">
        <Label className="text-[11px] uppercase tracking-[0.5px] font-semibold text-muted-foreground">
          Mô hình kinh doanh *
        </Label>
        <div className="grid grid-cols-1 gap-2">
          {businessModels.map((model) => (
            <Button
              key={model.value}
              variant={filters.businessModel === model.value ? "default" : "outline"}
              className="justify-start gap-2"
              onClick={() => handleBusinessModelChange(model.value)}
            >
              {model.icon}
              {model.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Target Revenue */}
      <div className="space-y-2">
        <Label htmlFor="targetRevenue" className="text-[11px] uppercase tracking-[0.5px] font-semibold text-muted-foreground">
          Doanh thu mục tiêu (tháng)
        </Label>
        <Input
          id="targetRevenue"
          type="text"
          placeholder="VD: 100,000,000"
          value={
            filters.targetRevenue
              ? new Intl.NumberFormat("vi-VN").format(filters.targetRevenue)
              : ""
          }
          onChange={handleTargetRevenueChange}
        />
        <p className="text-xs text-muted-foreground">
          {filters.targetRevenue ? formatCurrency(filters.targetRevenue) : "Chưa nhập"}
        </p>
      </div>

      {/* Max Rent Slider */}
      <div className="space-y-2">
        <Label htmlFor="maxRent" className="text-[11px] uppercase tracking-[0.5px] font-semibold text-muted-foreground">
          Giá thuê tối đa (tháng)
        </Label>
        <div className="pt-2">
          <Slider
            id="maxRent"
            min={5000000}
            max={100000000}
            step={1000000}
            value={[maxRent]}
            onValueChange={handleMaxRentChange}
          />
        </div>
        <p className="text-xs text-muted-foreground font-medium">{formatCurrency(maxRent)}</p>
      </div>

      {/* Area Size Range */}
      <div className="space-y-2">
        <Label className="text-[11px] uppercase tracking-[0.5px] font-semibold text-muted-foreground">
          Diện tích (m²)
        </Label>
        <div className="grid grid-cols-2 gap-2">
          <Input
            type="number"
            placeholder="Tối thiểu"
            value={filters.minArea || ""}
            onChange={handleMinAreaChange}
          />
          <Input
            type="number"
            placeholder="Tối đa"
            value={filters.maxArea || ""}
            onChange={handleMaxAreaChange}
          />
        </div>
      </div>

      {/* District Selector */}
      <div className="space-y-2">
        <Label htmlFor="district" className="text-[11px] uppercase tracking-[0.5px] font-semibold text-muted-foreground">
          Quận/Huyện
        </Label>
        <Select onValueChange={handleDistrictChange}>
          <SelectTrigger id="district">
            <SelectValue
              placeholder={
                filters.districts && filters.districts.length > 0
                  ? `${filters.districts.length} quận đã chọn`
                  : "Chọn quận/huyện"
              }
            />
          </SelectTrigger>
          <SelectContent>
            {districts.map((district) => (
              <SelectItem key={district} value={district}>
                {district}
                {filters.districts?.includes(district) && " ✓"}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {filters.districts && filters.districts.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {filters.districts.map((district) => (
              <span
                key={district}
                className="inline-flex items-center gap-1 px-2.5 py-1 text-xs bg-[#344F3C]/8 text-[#344F3C] rounded-lg font-medium"
              >
                {district}
                <button
                  onClick={() => handleDistrictChange(district)}
                  className="hover:text-destructive ml-0.5"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Analyze Button */}
      <Button
        className="w-full"
        size="lg"
        onClick={() => onAnalyze(filters)}
        disabled={!filters.businessModel || isLoading || !selectedLocation}
      >
        <Search className="w-4 h-4 mr-2" />
        {isLoading ? "Đang phân tích..." : !selectedLocation ? "Chọn vị trí trước" : "Phân tích địa điểm"}
      </Button>
    </Card>
  );
}
