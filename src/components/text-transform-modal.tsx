"use client";

import { useEffect, useMemo, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { ArrowRight, Check, Languages, Loader2, WandSparkles, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { rewriteTones } from "@/lib/constants";
import { cn } from "@/lib/cn";
import { detectLanguage } from "@/lib/language";

export type TransformMode = "rewrite" | "translate";
type TargetLanguage = "fa" | "en";

type TextResponse = {
  text: string;
  detectedLanguage: string;
  provider: string;
  model: string;
};

async function apiPost<T>(url: string, body: unknown): Promise<T> {
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload.error ?? "Request failed.");
  }

  return payload as T;
}

function cleanUiError(message: string) {
  return message
    .replaceAll("OpenAI", "The selected provider")
    .replaceAll("Gemini", "The selected provider")
    .replaceAll("ElevenLabs", "The selected provider");
}

function languageLabel(language: string) {
  if (language === "fa") return "Persian";
  if (language === "en") return "English";
  return "Mixed";
}

export function TextTransformModal({
  open,
  mode,
  sourceText,
  onOpenChange,
  onApply,
}: {
  open: boolean;
  mode: TransformMode;
  sourceText: string;
  onOpenChange: (open: boolean) => void;
  onApply: (text: string) => void;
}) {
  const [draftText, setDraftText] = useState(sourceText);
  const detectedLanguage = useMemo(() => detectLanguage(draftText), [draftText]);
  const [targetLanguage, setTargetLanguage] = useState<TargetLanguage>(detectedLanguage === "fa" ? "en" : "fa");
  const [tone, setTone] = useState<(typeof rewriteTones)[number]>("Natural");
  const [preview, setPreview] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!open) return;
    const initialLanguage = detectLanguage(sourceText);
    setDraftText(sourceText);
    setTargetLanguage(initialLanguage === "fa" ? "en" : "fa");
    setPreview("");
    setError("");
    setProgress(0);
  }, [open, mode, sourceText]);

  useEffect(() => {
    if (!loading) return;
    setProgress(20);
    const timer = window.setInterval(() => setProgress((value) => Math.min(92, value + 12)), 280);
    return () => window.clearInterval(timer);
  }, [loading]);

  async function createPreview() {
    if (!draftText.trim() || loading) return;

    setLoading(true);
    setError("");
    try {
      const response = await apiPost<TextResponse>(mode === "rewrite" ? "/api/rewrite" : "/api/translate", {
        text: draftText,
        tone,
        targetLanguage: mode === "translate" ? targetLanguage : "auto",
      });
      setPreview(response.text);
      setProgress(100);
    } catch (err) {
      setError(err instanceof Error ? cleanUiError(err.message) : "Text transformation failed.");
    } finally {
      window.setTimeout(() => setLoading(false), 220);
    }
  }

  const title = mode === "rewrite" ? "Rewrite text" : "Translate text";
  const Icon = mode === "rewrite" ? WandSparkles : Languages;

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-black/70 backdrop-blur-md" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 grid max-h-[calc(100vh-1rem)] w-[calc(100vw-1rem)] max-w-5xl -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-xl border border-[var(--app-border)] bg-[var(--app-panel-strong)] shadow-2xl outline-none sm:max-h-[calc(100vh-2rem)] sm:w-[calc(100vw-2rem)] lg:grid-cols-[0.82fr_1.18fr] lg:overflow-hidden">
          <section className="border-b border-[var(--app-border)] bg-black/20 p-4 sm:p-5 lg:border-b-0 lg:border-r">
            <div className="flex items-start justify-between gap-4">
              <div>
                <Dialog.Title className="flex items-center gap-2 text-lg font-semibold text-foreground">
                  <span className="grid h-9 w-9 place-items-center rounded-md border border-primary/20 bg-primary/10">
                    <Icon className="h-4 w-4 text-primary" />
                  </span>
                  {title}
                </Dialog.Title>
                <Dialog.Description className="mt-2 text-sm leading-6 text-muted-foreground">
                  Text tools change the script only. Voice delivery is controlled on the main studio screen.
                </Dialog.Description>
              </div>
              <Dialog.Close asChild>
                <Button variant="ghost" size="icon" aria-label="Close text tools">
                  <X className="h-4 w-4" />
                </Button>
              </Dialog.Close>
            </div>

            <div className="mt-5 grid gap-4 sm:mt-6 sm:gap-5">
              <div className="rounded-lg border border-[var(--app-border)] bg-[var(--app-muted-panel)] p-4">
                <div className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">Source language</div>
                <div className="mt-2 flex items-center gap-2 text-sm text-foreground">
                  <span className="h-2 w-2 rounded-full bg-[var(--app-accent-contrast)]" />
                  Auto-detected: {languageLabel(detectedLanguage)}
                </div>
              </div>

              <div className="grid gap-2">
                <div className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">Target language</div>
                <div className="grid grid-cols-2 gap-2">
                  {(["fa", "en"] as const).map((language) => (
                    <button
                      key={language}
                      onClick={() => setTargetLanguage(language)}
                      disabled={mode === "rewrite"}
                      className={cn(
                        "rounded-md border px-3 py-3 text-left text-sm transition disabled:cursor-not-allowed disabled:opacity-45",
                        targetLanguage === language
                          ? "border-primary/45 bg-primary/10 text-foreground"
                          : "border-[var(--app-border)] bg-[var(--app-muted-panel)] text-muted-foreground hover:border-primary/30 hover:text-foreground",
                      )}
                    >
                      {language === "fa" ? "Persian" : "English"}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid gap-2">
                <div className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">Rewrite tone</div>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-2">
                  {rewriteTones.map((item) => (
                    <button
                      key={item}
                      onClick={() => setTone(item)}
                      className={cn(
                        "rounded-md border px-3 py-2 text-left text-xs transition",
                        tone === item
                          ? "border-primary/45 bg-primary/10 text-foreground"
                          : "border-[var(--app-border)] bg-[var(--app-muted-panel)] text-muted-foreground hover:border-primary/30 hover:text-foreground",
                      )}
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <section className="grid min-h-0 p-4 sm:p-5 lg:grid-rows-[auto_1fr_auto]">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <div className="text-sm font-medium text-foreground">Preview</div>
                <div className="text-xs text-muted-foreground">Generate a preview, then apply it to the editor.</div>
              </div>
              <Button onClick={createPreview} disabled={!draftText.trim() || loading}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
                Preview
              </Button>
            </div>

            <div className="grid min-h-0 gap-3">
              {error ? (
                <div className="mb-3 rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-red-100">{error}</div>
              ) : null}
              {loading ? <Progress value={progress} /> : null}
              <div className="grid gap-2">
                <div className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">Input</div>
                <Textarea
                  value={draftText}
                  onChange={(event) => setDraftText(event.target.value)}
                  placeholder="Paste or edit the text to transform..."
                  dir="auto"
                  className="min-h-[10rem] border-[var(--app-border)] bg-white/90 text-[15px] leading-7 dark:bg-black/20 lg:min-h-[12rem]"
                />
              </div>
              <div className="grid min-h-0 gap-2">
                <div className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">Output</div>
              <Textarea
                value={preview}
                onChange={(event) => setPreview(event.target.value)}
                placeholder="Your rewritten or translated preview will appear here..."
                dir="auto"
                className="min-h-[12rem] border-[var(--app-border)] bg-white/90 text-[15px] leading-7 dark:bg-black/20 lg:min-h-[17rem]"
              />
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between gap-3 border-t border-[var(--app-border)] pt-4">
              <div className="text-xs text-muted-foreground">Nothing changes until you apply the preview.</div>
              <Button
                disabled={!preview.trim()}
                onClick={() => {
                  onApply(preview);
                  onOpenChange(false);
                }}
              >
                <Check className="h-4 w-4" />
                Apply to editor
              </Button>
            </div>
          </section>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
