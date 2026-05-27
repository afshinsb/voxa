import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export function Badge({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <span className={cn("inline-flex items-center rounded-md border border-[var(--app-border)] bg-[var(--app-muted-panel)] px-2.5 py-1 text-xs text-muted-foreground", className)}>
      {children}
    </span>
  );
}
