"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Map, History, Database, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

const navigation = [
  { name: "Dashboard", href: "/", icon: Home, description: "Tổng quan" },
  { name: "Phân tích", href: "/analyze", icon: Map, description: "Địa điểm mới" },
  { name: "Lịch sử", href: "/history", icon: History, description: "Kết quả cũ" },
  { name: "Dữ liệu", href: "/data", icon: Database, description: "Comps & CSV" },
  { name: "Cài đặt", href: "/settings", icon: Settings, description: "Cấu hình" },
];

export function SidebarNav() {
  const pathname = usePathname();

  return (
    <div className="flex h-full w-[260px] flex-col bg-[#344F3C]">
      {/* Logo Section */}
      <div className="flex h-16 items-center px-6">
        <Link href="/" className="flex items-center gap-3 no-underline">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/15 backdrop-blur-sm">
            <Map className="h-5 w-5 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="font-serif text-[15px] text-white leading-none tracking-wide">
              Location
            </span>
            <span className="text-[11px] text-white/60 leading-none mt-1 tracking-[0.5px] uppercase font-sans">
              Intelligence
            </span>
          </div>
        </Link>
      </div>

      {/* Divider */}
      <div className="mx-5 border-t border-white/10" />

      {/* Navigation Links */}
      <nav className="flex-1 space-y-1 px-4 pt-5">
        <p className="px-3 mb-3 text-[10px] font-semibold uppercase tracking-[1px] text-white/40">
          Menu
        </p>
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-150 no-underline",
                isActive
                  ? "bg-white/15 text-white shadow-sm backdrop-blur-sm"
                  : "text-white/60 hover:bg-white/8 hover:text-white/90"
              )}
            >
              <Icon className="h-[18px] w-[18px]" />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer Section */}
      <div className="p-4">
        <div className="rounded-xl bg-white/8 px-4 py-3">
          <p className="text-[10px] font-semibold uppercase tracking-[1px] text-white/40">
            Version
          </p>
          <p className="text-xs text-white/60 mt-0.5">MVP v1.0.0</p>
        </div>
      </div>
    </div>
  );
}
