"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { Eraser, FileText, Mic2, WandSparkles, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onGenerate: () => void;
  onRewrite: () => void;
  onTranslate: () => void;
  onSample: () => void;
}

export function CommandPalette({
  open,
  onOpenChange,
  onGenerate,
  onRewrite,
  onTranslate,
  onSample,
}: CommandPaletteProps) {
  const commands = [
    { label: "Generate voice", icon: Mic2, action: onGenerate, shortcut: "Cmd Enter" },
    { label: "Expressive rewrite", icon: WandSparkles, action: onRewrite, shortcut: "Cmd Shift R" },
    { label: "Translate text", icon: FileText, action: onTranslate, shortcut: "Auto" },
    { label: "Load studio sample", icon: Eraser, action: onSample, shortcut: "Sample" },
  ];

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm" />
        <Dialog.Content className="fixed left-1/2 top-[18%] z-50 w-[calc(100vw-2rem)] max-w-xl -translate-x-1/2 rounded-lg border border-[var(--app-border)] bg-[var(--app-panel-strong)] p-2 shadow-2xl outline-none">
          <div className="flex items-center justify-between border-b border-[var(--app-border)] px-3 py-2">
            <Dialog.Title className="text-sm font-medium text-foreground">Command palette</Dialog.Title>
            <Dialog.Close asChild>
              <Button variant="ghost" size="icon" aria-label="Close command palette">
                <X className="h-4 w-4" />
              </Button>
            </Dialog.Close>
          </div>
          <div className="grid gap-1 p-2">
            {commands.map((command) => {
              const Icon = command.icon;
              return (
                <button
                  key={command.label}
                  className="flex items-center justify-between rounded-md px-3 py-3 text-left text-sm text-foreground transition hover:bg-[var(--app-muted-panel)]"
                  onClick={() => {
                    onOpenChange(false);
                    command.action();
                  }}
                >
                  <span className="flex items-center gap-3">
                    <Icon className="h-4 w-4 text-[var(--app-accent-contrast)]" />
                    {command.label}
                  </span>
                  <span className="text-xs text-muted-foreground">{command.shortcut}</span>
                </button>
              );
            })}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
