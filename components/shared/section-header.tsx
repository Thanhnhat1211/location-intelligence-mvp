/**
 * Section Header Component
 */

import { ReactNode } from "react";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

interface SectionHeaderProps {
  title: string;
  description?: string;
  action?: ReactNode;
  showSeparator?: boolean;
  className?: string;
}

export function SectionHeader({
  title,
  description,
  action,
  showSeparator = true,
  className,
}: SectionHeaderProps) {
  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 space-y-1">
          <h2 className="text-2xl font-serif text-foreground">
            {title}
          </h2>
          {description && (
            <p className="text-sm text-muted-foreground">
              {description}
            </p>
          )}
        </div>

        {action && (
          <div className="flex-shrink-0">
            {action}
          </div>
        )}
      </div>

      {showSeparator && <Separator className="bg-border/60" />}
    </div>
  );
}
