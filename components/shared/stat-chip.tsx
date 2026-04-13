/**
 * Stat Chip Component
 * Component hiển thị metrics/thống kê dạng chip nhỏ gọn
 */

import { LucideIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type StatChipVariant = "default" | "success" | "warning" | "danger";

interface StatChipProps {
  /** Nhãn của stat */
  label: string;
  /** Giá trị hiển thị */
  value: string | number;
  /** Icon (tùy chọn) */
  icon?: LucideIcon;
  /** Biến thể màu sắc */
  variant?: StatChipVariant;
  /** Class name tùy chỉnh */
  className?: string;
}

/**
 * Lấy style theo variant
 */
const getVariantStyles = (variant: StatChipVariant) => {
  const styles = {
    default: {
      container: "bg-slate-100 dark:bg-slate-800",
      icon: "text-slate-600 dark:text-slate-400",
      label: "text-slate-600 dark:text-slate-400",
      value: "text-slate-900 dark:text-slate-100",
    },
    success: {
      container: "bg-green-100 dark:bg-green-950",
      icon: "text-green-600 dark:text-green-400",
      label: "text-green-700 dark:text-green-300",
      value: "text-green-900 dark:text-green-100",
    },
    warning: {
      container: "bg-amber-100 dark:bg-amber-950",
      icon: "text-amber-600 dark:text-amber-400",
      label: "text-amber-700 dark:text-amber-300",
      value: "text-amber-900 dark:text-amber-100",
    },
    danger: {
      container: "bg-red-100 dark:bg-red-950",
      icon: "text-red-600 dark:text-red-400",
      label: "text-red-700 dark:text-red-300",
      value: "text-red-900 dark:text-red-100",
    },
  };

  return styles[variant];
};

/**
 * Component hiển thị stat dạng chip
 * Sử dụng để hiển thị metrics nhỏ gọn với icon và màu sắc
 */
export function StatChip({
  label,
  value,
  icon: Icon,
  variant = "default",
  className,
}: StatChipProps) {
  const styles = getVariantStyles(variant);

  return (
    <div
      className={cn(
        "inline-flex items-center gap-2 rounded-full px-3 py-1.5",
        styles.container,
        className
      )}
    >
      {/* Icon */}
      {Icon && <Icon className={cn("h-4 w-4", styles.icon)} />}

      {/* Label and Value */}
      <div className="flex items-baseline gap-1.5">
        <span className={cn("text-xs font-medium", styles.label)}>
          {label}:
        </span>
        <span className={cn("text-sm font-bold", styles.value)}>
          {value}
        </span>
      </div>
    </div>
  );
}

/**
 * Stat Chip Group - để hiển thị nhiều stat chips cùng nhau
 */
interface StatChipGroupProps {
  /** Các stat chips */
  children: ReactNode;
  /** Class name tùy chỉnh */
  className?: string;
}

export function StatChipGroup({ children, className }: StatChipGroupProps) {
  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)}>
      {children}
    </div>
  );
}

/**
 * Export ReactNode type for StatChipGroup
 */
import { ReactNode } from "react";
