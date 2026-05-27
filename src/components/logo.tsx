import { AudioLines } from "lucide-react";

export function Logo() {
  return (
    <div className="flex items-center gap-3">
      <div className="grid h-10 w-10 place-items-center rounded-lg border border-[rgba(var(--app-accent-rgb),0.28)] bg-[rgba(var(--app-accent-rgb),0.1)] shadow-glow">
        <AudioLines className="h-5 w-5 text-[var(--app-accent-contrast)]" />
      </div>
      <div>
        <div className="text-base font-semibold tracking-wide text-foreground">Voxa</div>
        <div className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">Voice Studio</div>
      </div>
    </div>
  );
}
