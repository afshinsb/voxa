import * as React from "react";
import { cn } from "@/lib/cn";

export function Select({
  value,
  onChange,
  children,
  className,
  label,
}: {
  value: string;
  onChange: (value: string) => void;
  children: React.ReactNode;
  className?: string;
  label?: string;
}) {
  return (
    <label className={cn("grid gap-2 text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground", className)}>
      {label}
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-10 rounded-md border border-white/10 bg-black/35 px-3 text-sm normal-case tracking-normal text-foreground outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/15"
      >
        {children}
      </select>
    </label>
  );
}
