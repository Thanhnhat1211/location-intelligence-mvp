"use client";

import { ReactNode } from "react";
import { SidebarNav } from "./sidebar-nav";
import { Topbar } from "./topbar";

interface AppShellProps {
  children: ReactNode;
  showSearch?: boolean;
  onSearchChange?: (value: string) => void;
  searchPlaceholder?: string;
}

export function AppShell({
  children,
  showSearch = false,
  onSearchChange,
  searchPlaceholder,
}: AppShellProps) {
  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar Navigation */}
      <SidebarNav />

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top Bar */}
        <Topbar
          showSearch={showSearch}
          onSearchChange={onSearchChange}
          searchPlaceholder={searchPlaceholder}
        />

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto p-6">
          <div className="mx-auto max-w-7xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
