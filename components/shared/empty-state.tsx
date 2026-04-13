/**
 * Empty State Component
 */

import { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex min-h-[400px] w-full flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card/50 px-6 py-12 text-center",
        className
      )}
    >
      <div className="mb-4 rounded-2xl bg-[#344F3C]/8 p-4">
        <Icon className="h-8 w-8 text-[#344F3C]/60" />
      </div>

      <h3 className="mb-2 text-lg font-serif text-foreground">
        {title}
      </h3>

      <p className="mb-6 max-w-md text-sm text-muted-foreground">
        {description}
      </p>

      {action && (
        <Button onClick={action.onClick} size="default">
          {action.label}
        </Button>
      )}
    </div>
  );
}
