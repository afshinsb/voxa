"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { Activity, Keyboard, KeyRound, MonitorCog, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";
import { useStudioStore } from "@/store/studio-store";
import type { TtsGenerationMode } from "@/providers/tts/types";

const generationModeOptions: Array<{ value: TtsGenerationMode; label: string; detail: string }> = [
  { value: "lowest_quota", label: "Lowest quota usage", detail: "Single request, fewer retries, lighter processing." },
  { value: "balanced", label: "Balanced", detail: "Moderate request use and stable defaults." },
  { value: "highest_consistency", label: "Highest consistency", detail: "Allows chunking, retries, and stronger prompt reinforcement." },
];

export function SettingsPanel({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const generationMode = useStudioStore((state) => state.generationMode);
  const setGenerationMode = useStudioStore((state) => state.setGenerationMode);

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm" />
        <Dialog.Content className="fixed right-4 top-4 z-50 w-[calc(100vw-2rem)] max-w-[26.5rem] rounded-lg border border-[var(--app-border)] bg-[var(--app-panel-strong)] p-0 shadow-2xl outline-none">
          <div className="flex items-center justify-between border-b border-[var(--app-border)] px-4 py-3">
            <Dialog.Title className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <MonitorCog className="h-4 w-4 text-primary" />
              Studio settings
            </Dialog.Title>
            <Dialog.Close asChild>
              <Button variant="ghost" size="icon" aria-label="Close settings">
                <X className="h-4 w-4" />
              </Button>
            </Dialog.Close>
          </div>

          <div className="grid gap-4 p-4">
            <div className="mb-4 rounded-md border border-[var(--app-border)] bg-[var(--app-muted-panel)] p-4">
              <div className="mb-3 flex items-center gap-2 text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
                <KeyRound className="h-3.5 w-3.5" />
                Provider setup
              </div>
              <div className="grid gap-3 text-sm leading-6 text-muted-foreground">
                <p>OpenAI is the default stable provider. Gemini is experimental for expressive reads; ElevenLabs is reserved for premium voice consistency when configured.</p>
                <pre className="overflow-auto rounded-md border border-[var(--app-border)] bg-black/30 p-3 text-xs leading-5 text-foreground">{`# Stable default voice provider
TTS_PROVIDER=openai
OPENAI_API_KEY=<your-openai-api-key>
OPENAI_TTS_MODEL=gpt-4o-mini-tts

# Experimental expressive provider
TTS_PROVIDER=gemini
TEXT_PROVIDER=gemini
GEMINI_API_KEY=<your-gemini-api-key>
GEMINI_TTS_MODEL=gemini-2.5-flash-preview-tts
GEMINI_TEXT_MODEL=gemini-2.0-flash

# Demo mode
TTS_PROVIDER=mock
TEXT_PROVIDER=mock`}</pre>
              </div>
            </div>
            <div className="rounded-md border border-[var(--app-border)] bg-[var(--app-muted-panel)] p-4">
              <div className="mb-3 flex items-center gap-2 text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
                <Activity className="h-3.5 w-3.5" />
                Generation mode
              </div>
              <div className="grid gap-2">
                {generationModeOptions.map((item) => (
                  <button
                    key={item.value}
                    onClick={() => setGenerationMode(item.value)}
                    className={cn(
                      "rounded-md border px-3 py-2 text-left transition",
                      generationMode === item.value
                        ? "border-primary/45 bg-primary/10 text-foreground"
                        : "border-[var(--app-border)] bg-black/20 text-muted-foreground hover:border-primary/30 hover:text-foreground",
                    )}
                  >
                    <span className="block text-sm font-medium">{item.label}</span>
                    <span className="mt-1 block text-xs leading-5 text-muted-foreground">{item.detail}</span>
                  </button>
                ))}
              </div>
            </div>
            <div className="rounded-md border border-[var(--app-border)] bg-[var(--app-muted-panel)] p-4">
              <div className="mb-3 flex items-center gap-2 text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
                <Keyboard className="h-3.5 w-3.5" />
                Shortcuts
              </div>
              <div className="grid gap-2 text-sm">
                <div className="flex items-center justify-between gap-4">
                  <span className="text-muted-foreground">Generate voice</span>
                  <kbd className="rounded border border-[var(--app-border)] bg-black/30 px-2 py-1 text-xs text-foreground">Cmd/Ctrl Enter</kbd>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span className="text-muted-foreground">Command palette</span>
                  <kbd className="rounded border border-[var(--app-border)] bg-black/30 px-2 py-1 text-xs text-foreground">Cmd/Ctrl K</kbd>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span className="text-muted-foreground">Rewrite text</span>
                  <kbd className="rounded border border-[var(--app-border)] bg-black/30 px-2 py-1 text-xs text-foreground">Cmd/Ctrl Shift R</kbd>
                </div>
              </div>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
