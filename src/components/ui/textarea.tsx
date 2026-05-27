import * as React from "react";
import { cn } from "@/lib/cn";

const Textarea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, ...props }, ref) => (
    <textarea
      ref={ref}
      className={cn(
        "min-h-40 w-full resize-none rounded-lg border border-[var(--app-border)] bg-white/85 px-4 py-4 text-sm leading-7 text-foreground shadow-inner outline-none transition placeholder:text-muted-foreground focus:border-primary/60 focus:ring-2 focus:ring-primary/15 dark:bg-black/30",
        className,
      )}
      {...props}
    />
  ),
);
Textarea.displayName = "Textarea";

export { Textarea };
