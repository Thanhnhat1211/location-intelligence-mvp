"use client";

import { usePathname } from "next/navigation";
import { Search, ChevronRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface TopbarProps {
  showSearch?: boolean;
  onSearchChange?: (value: string) => void;
  searchPlaceholder?: string;
}

const routeTitles: Record<string, string> = {
  "/": "Dashboard",
  "/analyze": "Phân tích địa điểm",
  "/history": "Lịch sử phân tích",
  "/data": "Quản lý dữ liệu",
  "/settings": "Cài đặt",
};

const routeBreadcrumbs: Record<string, string[]> = {
  "/": ["Trang chủ"],
  "/analyze": ["Trang chủ", "Phân tích"],
  "/history": ["Trang chủ", "Lịch sử"],
  "/data": ["Trang chủ", "Dữ liệu"],
  "/settings": ["Trang chủ", "Cài đặt"],
};

export function Topbar({
  showSearch = false,
  onSearchChange,
  searchPlaceholder = "Tìm kiếm...",
}: TopbarProps) {
  const pathname = usePathname();
  const title = routeTitles[pathname] || "Location Intelligence";
  const breadcrumbs = routeBreadcrumbs[pathname] || ["Trang chủ"];

  return (
    <div className="flex h-16 items-center justify-between border-b border-border/60 bg-card/50 backdrop-blur-sm px-6">
      <div className="flex flex-col">
        <h1 className="text-lg font-serif leading-none">{title}</h1>
        <div className="mt-1.5 flex items-center gap-1 text-xs text-muted-foreground">
          {breadcrumbs.map((crumb, index) => (
            <span key={crumb} className="flex items-center gap-1">
              {index > 0 && <ChevronRight className="h-3 w-3 text-muted-foreground/50" />}
              <span
                className={cn(
                  index === breadcrumbs.length - 1 && "text-foreground font-medium"
                )}
              >
                {crumb}
              </span>
            </span>
          ))}
        </div>
      </div>

      {showSearch && (
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder={searchPlaceholder}
            className="pl-9 bg-background/60"
            onChange={(e) => onSearchChange?.(e.target.value)}
          />
        </div>
      )}
    </div>
  );
}
