"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Command,
  Download,
  ExternalLink,
  Gauge,
  History,
  KeyRound,
  Languages,
  Loader2,
  Mic2,
  MonitorCog,
  Moon,
  Play,
  Radio,
  RotateCcw,
  Sparkles,
  Sun,
  WandSparkles,
  Waves,
  X,
} from "lucide-react";
import { AnimatedBackground } from "@/components/animated-background";
import { CommandPalette } from "@/components/command-palette";
import { Logo } from "@/components/logo";
import { SettingsPanel } from "@/components/settings-panel";
import { TextTransformModal, type TransformMode } from "@/components/text-transform-modal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Waveform } from "@/components/waveform";
import { voiceProfiles, voiceStyles } from "@/lib/constants";
import { blobFromBase64, clearHistoryAudioCache, getHistoryAudioBlob, pruneHistoryAudioCache, saveHistoryAudio } from "@/lib/audio-cache";
import { cn } from "@/lib/cn";
import { HistoryItem, useStudioStore } from "@/store/studio-store";
import type { TtsChunkingMode, TtsGenerationMode } from "@/providers/tts/types";

type ProviderStatus = {
  active: { tts: string; text: string };
  selected?: {
    tts: { provider: string; label: string; model: string; configured: boolean; missingEnv: string[] };
    text: { provider: string; label: string; model: string; configured: boolean; missingEnv: string[] };
  };
  tts: Array<{ name: string; model: string; configured: boolean; active: boolean; missingEnv?: string[] }>;
  text: Array<{ name: string; model: string; configured: boolean; active: boolean; missingEnv?: string[] }>;
};

type TtsResponse = {
  audioBase64: string;
  mimeType: string;
  extension: string;
  provider: string;
  model: string;
};

type Toast = {
  id: string;
  title: string;
  detail?: string;
  tone?: "success" | "error" | "info";
  exiting?: boolean;
};

const voiceMeta: Record<string, { accent: string; aura: string }> = {
  Nova: {
    accent: "from-[rgba(var(--app-accent-rgb),0.12)] via-white/5 to-transparent",
    aura: "shadow-[0_18px_54px_rgba(var(--app-accent-rgb),0.08)]",
  },
  Alloy: {
    accent: "from-[rgba(var(--app-accent-rgb),0.1)] via-white/5 to-transparent",
    aura: "shadow-[0_18px_54px_rgba(var(--app-accent-rgb),0.07)]",
  },
  Verse: {
    accent: "from-[rgba(var(--app-accent-rgb),0.11)] via-white/5 to-transparent",
    aura: "shadow-[0_18px_54px_rgba(var(--app-accent-rgb),0.07)]",
  },
  Sage: {
    accent: "from-[rgba(var(--app-accent-rgb),0.09)] via-white/5 to-transparent",
    aura: "shadow-[0_18px_54px_rgba(var(--app-accent-rgb),0.06)]",
  },
  Coral: {
    accent: "from-[rgba(var(--app-accent-rgb),0.1)] via-white/5 to-transparent",
    aura: "shadow-[0_18px_54px_rgba(var(--app-accent-rgb),0.06)]",
  },
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

function compactProviderLabel(label: string) {
  return label
    .replace(" stable provider", "")
    .replace(" experimental expressive provider", "")
    .replace(" premium voice consistency provider", "")
    .replace(" mode", "");
}

function estimateGenerationMs(text: string, isPreview = false) {
  if (isPreview) return 7000;

  const characters = Math.max(text.trim().length, 80);
  const estimatedSeconds = Math.min(95, Math.max(8, characters / 38));
  return estimatedSeconds * 1000;
}

function ProviderHealth({
  loading,
  status,
  ready,
}: {
  loading: boolean;
  status: ProviderStatus | null;
  ready: boolean;
}) {
  if (loading) {
    return (
      <div className="hidden h-9 w-56 overflow-hidden rounded-md border border-[var(--app-border)] bg-white/[0.045] md:block">
        <div className="relative h-full w-full -translate-x-full bg-gradient-to-r from-transparent via-white/12 to-transparent animate-[shimmer_1.4s_infinite]" />
      </div>
    );
  }

  const tts = status?.tts.find((provider) => provider.active);
  const text = status?.text.find((provider) => provider.active);
  const demoMode = tts?.name === "mock" && text?.name === "mock";
  const missing = Boolean((tts?.missingEnv?.length ?? 0) || (text?.missingEnv?.length ?? 0));
  const tone = ready || demoMode ? "text-[var(--app-accent-contrast)]" : "text-amber-700 dark:text-amber-200";
  const label = demoMode ? "Demo mode" : ready ? "Providers healthy" : missing ? "Not configured" : "Setup needed";
  const voiceLabel = compactProviderLabel(status?.selected?.tts.label ?? tts?.name ?? "None");
  const textLabel = compactProviderLabel(status?.selected?.text.label ?? text?.name ?? "None");

  return (
    <div className="hidden max-w-[34rem] items-center gap-2 rounded-md border border-[var(--app-border)] bg-white/[0.055] px-3 py-2 text-xs text-muted-foreground shadow-[var(--app-shadow-soft)] md:flex">
      <span className={cn("h-1.5 w-1.5 rounded-full", ready || demoMode ? "bg-[var(--app-accent-contrast)] shadow-[0_0_18px_rgba(var(--app-accent-rgb),0.5)]" : "bg-amber-600 dark:bg-amber-200")} />
      <span className={cn("shrink-0", tone)}>{label}</span>
      <span className="min-w-0 truncate text-muted-foreground">
        TTS {voiceLabel} / Text {textLabel}
      </span>
    </div>
  );
}

function SetupPanel({ onOpenGuide }: { onOpenGuide: () => void }) {
  return (
    <section className="overflow-hidden rounded-xl border border-[rgba(var(--app-accent-rgb),0.22)] bg-[linear-gradient(135deg,rgba(255,255,255,0.7),rgba(255,255,255,0.34))] shadow-[var(--app-shadow)] backdrop-blur-xl dark:bg-[linear-gradient(135deg,rgba(255,255,255,0.11),rgba(255,255,255,0.035))]">
      <div className="relative p-5 sm:p-6">
        <div className="absolute inset-x-0 top-0 h-28 bg-gradient-to-r from-[rgba(var(--app-accent-rgb),0.1)] via-white/5 to-transparent" />
        <div className="relative grid gap-5 lg:grid-cols-[1fr_auto] lg:items-end">
          <div>
            <Badge className="mb-4 border-amber-200/25 bg-amber-200/10 text-amber-300">
              <KeyRound className="mr-1.5 h-3.5 w-3.5" />
              Provider setup required
            </Badge>
            <h2 className="max-w-2xl text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">Connect your selected provider to start generating production audio.</h2>
            <div className="mt-5 grid gap-2 text-sm leading-6 text-muted-foreground">
              <div className="flex gap-3"><span className="text-[var(--app-accent-contrast)]">1.</span> Add your API key</div>
              <div className="flex gap-3"><span className="text-[var(--app-accent-contrast)]">2.</span> Select a provider</div>
              <div className="flex gap-3"><span className="text-[var(--app-accent-contrast)]">3.</span> Restart the app</div>
            </div>
          </div>
          <div className="grid gap-4 rounded-lg border border-[var(--app-border)] bg-black/20 p-4 shadow-[var(--app-shadow-soft)]">
            <div className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">Setup checklist</div>
            <div className="grid gap-2 text-sm text-foreground">
              {["Set TTS_PROVIDER", "Set TEXT_PROVIDER", "Add required credentials"].map((item) => (
                <div key={item} className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-[var(--app-accent-contrast)]" />
                  {item}
                </div>
              ))}
            </div>
            <Button onClick={onOpenGuide} variant="secondary">
              <ExternalLink className="h-4 w-4" />
              Open setup guide
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}

function ToastViewport({ toasts, onDismiss }: { toasts: Toast[]; onDismiss: (id: string) => void }) {
  return (
    <div className="fixed right-3 top-20 z-[60] grid w-[calc(100vw-1.5rem)] max-w-sm gap-2 sm:right-4 sm:w-[calc(100vw-2rem)]">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={cn(
            "rounded-lg border bg-[var(--app-panel-strong)] p-4 text-sm shadow-[var(--app-shadow)] backdrop-blur-xl transition duration-300 ease-out",
            toast.exiting ? "translate-x-3 opacity-0" : "translate-x-0 opacity-100",
            toast.tone === "error" ? "border-red-300/25" : toast.tone === "success" ? "border-[rgba(var(--app-accent-rgb),0.28)]" : "border-[var(--app-border)]",
          )}
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="font-medium text-foreground">{toast.title}</div>
              {toast.detail ? <div className="mt-1 leading-5 text-muted-foreground">{toast.detail}</div> : null}
            </div>
            <button onClick={() => onDismiss(toast.id)} aria-label="Dismiss notification" className="text-muted-foreground hover:text-foreground">
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

export function Studio() {
  const {
    text,
    voice,
    style,
    speed,
    generationMode,
    history,
    setText,
    setVoice,
    setStyle,
    setSpeed,
    addHistory,
    attachHistoryAudio,
    clearHistory,
    loadSample,
  } = useStudioStore();

  const [status, setStatus] = useState<ProviderStatus | null>(null);
  const [statusLoading, setStatusLoading] = useState(true);
  const [audioUrl, setAudioUrl] = useState("");
  const [downloadName, setDownloadName] = useState("voxa-audio.mp3");
  const [busy, setBusy] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [generationEstimateMs, setGenerationEstimateMs] = useState(estimateGenerationMs(""));
  const [error, setError] = useState("");
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(true);
  const [transformOpen, setTransformOpen] = useState(false);
  const [transformMode, setTransformMode] = useState<TransformMode>("rewrite");
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [themeReady, setThemeReady] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [geminiConsistencyNoticeDismissed, setGeminiConsistencyNoticeDismissed] = useState(false);
  const [geminiLongFormNoticeDismissed, setGeminiLongFormNoticeDismissed] = useState(false);

  const activeTts = useMemo(() => status?.tts.find((provider) => provider.active), [status]);
  const activeText = useMemo(() => status?.text.find((provider) => provider.active), [status]);
  const hasConfiguredRealVoiceProvider = useMemo(
    () => Boolean(status?.tts.some((provider) => provider.name !== "mock" && provider.configured)),
    [status],
  );
  const activeVoiceReady = Boolean(activeTts?.configured);
  const activeTextReady = Boolean(activeText?.configured);
  const demoMode = activeTts?.name === "mock" && activeText?.name === "mock";
  const providerReady = Boolean(activeVoiceReady && activeTextReady);
  const setupRequired = Boolean(status && !demoMode && (!activeVoiceReady || !activeTextReady));
  const canGenerate = text.trim().length > 0 && !busy;
  const isGeminiTts = activeTts?.name === "gemini";
  const voiceProfileLabel = isGeminiTts ? "Voice directions" : "Voices";
  const voiceProfileNoun = isGeminiTts ? "direction" : "voice";
  const estimatedDurationSeconds = Math.max(1, Math.round(text.trim().length / 13 / Math.max(speed, 0.5)));
  const showGeminiLongFormWarning = isGeminiTts && (text.length >= 900 || estimatedDurationSeconds >= 60);

  const notify = useCallback((toast: Omit<Toast, "id">) => {
    const id = crypto.randomUUID();
    setToasts((items) => [{ id, ...toast }, ...items].slice(0, 3));
    window.setTimeout(() => {
      setToasts((items) => items.map((item) => (item.id === id ? { ...item, exiting: true } : item)));
      window.setTimeout(() => {
        setToasts((items) => items.filter((item) => item.id !== id));
      }, 320);
    }, 3000);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((items) => items.map((item) => (item.id === id ? { ...item, exiting: true } : item)));
    window.setTimeout(() => {
      setToasts((items) => items.filter((item) => item.id !== id));
    }, 320);
  }, []);

  useEffect(() => {
    fetch("/api/providers")
      .then((response) => response.json())
      .then(setStatus)
      .catch(() => {
        setStatus(null);
        notify({ title: "Provider health unavailable", detail: "The studio could not read provider status.", tone: "error" });
      })
      .finally(() => setStatusLoading(false));
  }, [notify]);

  useEffect(() => {
    setGeminiConsistencyNoticeDismissed(localStorage.getItem("voxa-gemini-consistency-notice-dismissed") === "true");
    setGeminiLongFormNoticeDismissed(localStorage.getItem("voxa-gemini-long-form-notice-dismissed") === "true");
  }, []);

  useEffect(() => {
    const cookieTheme = document.cookie
      .split("; ")
      .find((item) => item.startsWith("voxa-theme="))
      ?.split("=")[1];
    const localTheme = localStorage.getItem("voxa-theme");
    const domTheme = document.documentElement.classList.contains("light") ? "light" : "dark";
    const nextTheme = localTheme === "light" || localTheme === "dark" ? localTheme : cookieTheme === "light" || cookieTheme === "dark" ? cookieTheme : domTheme;

    setTheme(nextTheme);
    setThemeReady(true);
  }, []);

  useEffect(() => {
    if (!themeReady) return;

    document.documentElement.classList.toggle("dark", theme === "dark");
    document.documentElement.classList.toggle("light", theme === "light");
    localStorage.setItem("voxa-theme", theme);
    document.cookie = `voxa-theme=${theme}; path=/; max-age=31536000; samesite=lax`;
  }, [theme, themeReady]);

  useEffect(() => {
    if (setupRequired) {
      notify({
        title: "Provider setup required",
        detail: hasConfiguredRealVoiceProvider ? "Check the selected provider variables in .env and restart the app." : "Add credentials for your selected provider before generating production audio.",
        tone: "info",
      });
    }
  }, [hasConfiguredRealVoiceProvider, notify, setupRequired]);

  useEffect(() => {
    return () => {
      if (audioUrl.startsWith("blob:")) URL.revokeObjectURL(audioUrl);
    };
  }, [audioUrl]);

  useEffect(() => {
    if (!busy) return;

    const startedAt = performance.now();
    const estimatedMs = generationEstimateMs;
    setGenerationProgress(2);

    const interval = window.setInterval(() => {
      const elapsed = performance.now() - startedAt;
      const ratio = elapsed / estimatedMs;
      const eased = 1 - Math.exp(-ratio * 2.4);
      setGenerationProgress(Math.min(96, Math.max(2, Math.round(eased * 100))));
    }, 180);

    return () => window.clearInterval(interval);
  }, [busy, generationEstimateMs]);

  useEffect(() => {
    let cancelled = false;

    async function hydrateHistoryAudio() {
      if (!history.length) return;

      pruneHistoryAudioCache(history.map((item) => item.id)).catch(() => undefined);

      for (const item of history) {
        if (item.audioUrl) continue;

        const blob = await getHistoryAudioBlob(item.id).catch(() => undefined);
        if (!blob || cancelled) continue;

        attachHistoryAudio(item.id, URL.createObjectURL(blob));
      }
    }

    hydrateHistoryAudio();

    return () => {
      cancelled = true;
    };
  }, [attachHistoryAudio, history]);

  const openTransform = useCallback((mode: TransformMode) => {
    setTransformMode(mode);
    setTransformOpen(true);
  }, []);

  const loadStudioSample = useCallback(() => {
    loadSample();
    notify({ title: "Sample loaded", detail: "A studio script is ready in the editor.", tone: "info" });
  }, [loadSample, notify]);

  const resolveHistoryAudio = useCallback(
    async (item: HistoryItem) => {
      if (item.audioUrl) return item.audioUrl;

      const blob = await getHistoryAudioBlob(item.id).catch(() => undefined);
      if (!blob) {
        notify({
          title: "Audio unavailable",
          detail: "This older history item does not have cached audio attached.",
          tone: "info",
        });
        return "";
      }

      const url = URL.createObjectURL(blob);
      attachHistoryAudio(item.id, url);
      return url;
    },
    [attachHistoryAudio, notify],
  );

  const loadHistoryItem = useCallback(
    async (item: HistoryItem) => {
      setText(item.text);
      setVoice(item.voice);
      setStyle(item.style);

      const url = await resolveHistoryAudio(item);
      if (!url) return;

      setAudioUrl(url);
      setDownloadName(`voxa-history-${item.id}.${item.extension}`);
    },
    [resolveHistoryAudio, setStyle, setText, setVoice],
  );

  const downloadHistoryItem = useCallback(
    async (item: HistoryItem) => {
      const url = await resolveHistoryAudio(item);
      if (!url) return;

      const link = document.createElement("a");
      link.href = url;
      link.download = `voxa-history-${item.id}.${item.extension}`;
      document.body.appendChild(link);
      link.click();
      link.remove();
    },
    [resolveHistoryAudio],
  );

  const generate = useCallback(async (options?: { chunking?: TtsChunkingMode; mode?: TtsGenerationMode }) => {
    if (!text.trim() || busy) return;
      if (setupRequired) {
        notify({
          title: "Provider setup required",
          detail: "Check the selected provider variables in .env and restart the app before generating audio.",
          tone: "info",
        });
      return;
    }

    setBusy(true);
    setGenerationEstimateMs(estimateGenerationMs(text));
    setGenerationProgress(2);
    setError("");

    try {
      const response = await apiPost<TtsResponse>("/api/tts", {
        text,
        voice,
        style,
        speed,
        generationMode: options?.mode ?? generationMode,
        chunking: options?.chunking ?? "single",
      });
      const blob = blobFromBase64(response.mimeType, response.audioBase64);
      const url = URL.createObjectURL(blob);
      const id = crypto.randomUUID();
      const item: HistoryItem = {
        id,
        text,
        voice,
        style,
        provider: response.provider,
        model: response.model,
        audioUrl: url,
        mimeType: response.mimeType,
        extension: response.extension,
        createdAt: new Date().toISOString(),
      };

      setAudioUrl((previous) => {
        if (previous.startsWith("blob:")) URL.revokeObjectURL(previous);
        return url;
      });
      setDownloadName(`voxa-${Date.now()}.${response.extension}`);
      addHistory(item);
      saveHistoryAudio(id, blob).catch(() => {
        notify({ title: "Audio cache unavailable", detail: "This generation will play now, but may not remain attached after refresh.", tone: "info" });
      });
      setGenerationProgress(100);
      notify({ title: "Voice generated", detail: `${voice} ${voiceProfileNoun} is ready in the audio dock.`, tone: "success" });
    } catch (err) {
      const message = err instanceof Error ? cleanUiError(err.message) : "Voice generation failed.";
      setError(message);
      notify({ title: "Generation failed", detail: message, tone: "error" });
    } finally {
      window.setTimeout(() => {
        setBusy(false);
        setGenerationProgress(0);
      }, 360);
    }
  }, [addHistory, busy, generationMode, notify, setupRequired, speed, style, text, voice, voiceProfileNoun]);

  const previewVoice = useCallback(
    async (selectedVoice: string) => {
      if (busy) return;
      if (setupRequired) {
        notify({
          title: "Provider setup required",
          detail: "Live previews need a configured voice provider.",
          tone: "info",
        });
        return;
      }

      setVoice(selectedVoice);
      setBusy(true);
      setGenerationEstimateMs(estimateGenerationMs("", true));
      setGenerationProgress(2);
      setError("");

      try {
        const response = await apiPost<TtsResponse>("/api/tts", {
          text: selectedVoice === "Nova" ? "Okay, so this is Nova. Bright, confident, and honestly kind of iconic." : "Voxa turns text into natural, studio-grade voice.",
          voice: selectedVoice,
          style,
          speed,
          generationMode,
          chunking: "single",
        });
        const url = URL.createObjectURL(blobFromBase64(response.mimeType, response.audioBase64));
        setAudioUrl((previous) => {
          if (previous.startsWith("blob:")) URL.revokeObjectURL(previous);
          return url;
        });
        setDownloadName(`voxa-preview-${Date.now()}.${response.extension}`);
        setGenerationProgress(100);
        notify({ title: "Preview ready", detail: `${selectedVoice} ${voiceProfileNoun} preview loaded in the audio dock.`, tone: "success" });
      } catch (err) {
        const message = err instanceof Error ? cleanUiError(err.message) : "Voice preview failed.";
        setError(message);
        notify({ title: "Preview failed", detail: message, tone: "error" });
      } finally {
        window.setTimeout(() => {
          setBusy(false);
          setGenerationProgress(0);
        }, 360);
      }
    },
    [busy, generationMode, notify, setVoice, setupRequired, speed, style, voiceProfileNoun],
  );

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const primary = event.metaKey || event.ctrlKey;
      if (!primary) return;

      if (event.key === "Enter") {
        event.preventDefault();
        generate();
      }

      if (event.key.toLowerCase() === "k") {
        event.preventDefault();
        setPaletteOpen((open) => !open);
      }

      if (event.shiftKey && event.key.toLowerCase() === "r") {
        event.preventDefault();
        openTransform("rewrite");
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [generate, openTransform]);

  return (
    <main className="app-shell relative min-h-screen overflow-hidden pb-24 text-foreground sm:pb-36">
      <AnimatedBackground />
      <CommandPalette
        open={paletteOpen}
        onOpenChange={setPaletteOpen}
        onGenerate={generate}
        onRewrite={() => openTransform("rewrite")}
        onTranslate={() => openTransform("translate")}
        onSample={loadStudioSample}
      />
      <SettingsPanel open={settingsOpen} onOpenChange={setSettingsOpen} />
      <TextTransformModal
        open={transformOpen}
        mode={transformMode}
        sourceText={text}
        onOpenChange={setTransformOpen}
        onApply={(value) => {
          setText(value);
          notify({ title: "Editor updated", detail: "The transformed script has been applied.", tone: "success" });
        }}
      />
      <ToastViewport toasts={toasts} onDismiss={dismissToast} />

      <header className="sticky top-0 z-20 border-b border-[var(--app-border)] bg-[color-mix(in_srgb,var(--app-panel-strong)_88%,transparent)] backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-[1500px] items-center justify-between px-4 sm:px-6 lg:px-8">
          <Logo />
          <div className="flex items-center gap-2">
            <ProviderHealth loading={statusLoading} status={status} ready={providerReady} />
            <Button
              variant="outline"
              size="icon"
              onClick={() => setTheme((value) => (value === "dark" ? "light" : "dark"))}
              aria-label="Toggle theme"
            >
              {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
            <Button variant="outline" size="sm" onClick={() => setSettingsOpen(true)}>
              <MonitorCog className="h-4 w-4" />
              <span className="hidden sm:inline">Settings</span>
            </Button>
            <Button variant="outline" size="sm" onClick={() => setPaletteOpen(true)}>
              <Command className="h-4 w-4" />
              <span className="hidden sm:inline">Cmd K</span>
            </Button>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-[1500px] gap-5 px-3 py-4 sm:px-6 sm:py-5 lg:grid-cols-[4.5rem_minmax(0,1fr)_25rem] lg:px-8">
        <nav className="hidden rounded-xl border border-[var(--app-border)] bg-black/24 p-2 shadow-2xl backdrop-blur-xl lg:grid lg:content-start lg:gap-2">
          <Button variant="ghost" size="icon" aria-label="Rewrite text" onClick={() => openTransform("rewrite")}>
            <WandSparkles className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" aria-label="Translate text" onClick={() => openTransform("translate")}>
            <Languages className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" aria-label="History" onClick={() => setHistoryOpen((open) => !open)}>
            <History className="h-4 w-4" />
          </Button>
        </nav>

        <section className="grid min-w-0 gap-5">
          {statusLoading ? (
            <div className="overflow-hidden rounded-xl border border-[var(--app-border)] bg-white/[0.055] p-6 shadow-[var(--app-shadow)]">
              <div className="relative h-28 -translate-x-full rounded-lg bg-gradient-to-r from-transparent via-white/14 to-transparent animate-[shimmer_1.4s_infinite]" />
            </div>
          ) : setupRequired ? (
            <SetupPanel onOpenGuide={() => setSettingsOpen(true)} />
          ) : null}

          {isGeminiTts && !geminiConsistencyNoticeDismissed ? (
            <section className="rounded-xl border border-amber-200/20 bg-amber-200/[0.055] p-4 text-sm leading-6 text-amber-100 shadow-[var(--app-shadow-soft)]">
              <div className="mb-1 flex items-start justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2 font-medium text-amber-100">
                  <AlertTriangle className="h-4 w-4" />
                  Experimental voice consistency
                </div>
                <button
                  type="button"
                  onClick={() => {
                    localStorage.setItem("voxa-gemini-consistency-notice-dismissed", "true");
                    setGeminiConsistencyNoticeDismissed(true);
                  }}
                  className="rounded-md p-1 text-muted-foreground transition hover:bg-white/10 hover:text-foreground"
                  aria-label="Dismiss Gemini consistency notice"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <p className="text-muted-foreground">Gemini can be expressive, but voice identity may vary between generations or long text.</p>
              <p className="mt-2 text-muted-foreground">For long narration, OpenAI or ElevenLabs may be more consistent.</p>
            </section>
          ) : null}

          <div className="rounded-xl border border-[var(--app-border)] bg-[linear-gradient(180deg,rgba(255,255,255,0.092),rgba(255,255,255,0.032))] p-4 shadow-[var(--app-shadow)] backdrop-blur-xl sm:p-6">
            <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <Badge className="mb-3 border-[rgba(var(--app-accent-rgb),0.24)] bg-[rgba(var(--app-accent-rgb),0.08)] text-[var(--app-accent-contrast)]">Studio canvas</Badge>
                <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">Write the script. Generate the voice.</h1>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">Text tools are separate. Voice controls only affect delivery.</p>
              </div>
            </div>

            {error ? (
              <div className="mb-4 flex items-start gap-3 rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-red-100">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            ) : null}

            <div className="relative overflow-hidden rounded-xl border border-[var(--app-border)] bg-white/90 shadow-inner dark:bg-black/30">
              <div className="flex items-center justify-between border-b border-[var(--app-border)] px-4 py-3 text-xs text-muted-foreground">
                <span>Script editor</span>
                <span>{text.length.toLocaleString()} characters</span>
              </div>
              <Textarea
                value={text}
                onChange={(event) => setText(event.target.value)}
                placeholder="Paste or write your script here..."
                dir="auto"
                className="script-editor-scrollbar min-h-[20rem] rounded-none border-0 bg-transparent px-4 py-4 text-[16px] leading-8 shadow-none focus:ring-0 sm:min-h-[31rem] sm:px-5 sm:py-5"
              />
            </div>

            <div className="mt-4 grid gap-2 sm:grid-cols-3">
              <Button variant="outline" className="w-full" onClick={() => openTransform("rewrite")} disabled={!text.trim()}>
                <WandSparkles className="h-4 w-4" />
                Rewrite text
              </Button>
              <Button variant="outline" className="w-full" onClick={() => openTransform("translate")} disabled={!text.trim()}>
                <Languages className="h-4 w-4" />
                Translate text
              </Button>
              <Button className="w-full" onClick={() => generate()} disabled={!canGenerate}>
                {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Mic2 className="h-4 w-4" />}
                {setupRequired ? "Connect provider" : "Generate audio"}
              </Button>
            </div>

            {showGeminiLongFormWarning && !geminiLongFormNoticeDismissed ? (
              <div className="mt-4 rounded-lg border border-amber-200/25 bg-black/20 p-4 text-sm">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-200" />
                    <div>
                      <div className="font-medium text-amber-100">Long Gemini generations may lose voice consistency.</div>
                      <div className="mt-1 text-muted-foreground">Estimated duration is about {estimatedDurationSeconds} seconds. Single request preserves quota; splitting can improve continuity but uses more requests.</div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      localStorage.setItem("voxa-gemini-long-form-notice-dismissed", "true");
                      setGeminiLongFormNoticeDismissed(true);
                    }}
                    className="rounded-md p-1 text-muted-foreground transition hover:bg-white/10 hover:text-foreground"
                    aria-label="Dismiss long Gemini generation warning"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ) : null}
          </div>

          <section className="grid gap-5 rounded-xl border border-[var(--app-border)] bg-black/22 p-4 shadow-[var(--app-shadow)] backdrop-blur-xl xl:grid-cols-[1.08fr_0.92fr]">
            <div>
              <div className="mb-4 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                <Mic2 className="h-4 w-4 text-[var(--app-accent-contrast)]" />
                {voiceProfileLabel}
                </div>
                <div className="flex items-center gap-2">
                  <Badge className="hidden border-white/10 bg-white/[0.055] sm:inline-flex">
                    <Radio className="mr-1.5 h-3.5 w-3.5 text-[var(--app-accent-contrast)]" />
                    {isGeminiTts ? "Voice prompts" : "Fixed voices"}
                  </Badge>
                </div>
              </div>
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2">
                {voiceProfiles.map((profile) => {
                  const meta = voiceMeta[profile.name] ?? voiceMeta.Nova;
                  const selected = voice === profile.name;
                  return (
                    <article
                      key={profile.name}
                      className={cn(
                        "group relative overflow-hidden rounded-lg border p-3 transition duration-300 hover:-translate-y-0.5 hover:border-[rgba(var(--app-accent-rgb),0.36)]",
                        selected
                          ? "border-[rgba(var(--app-accent-rgb),0.42)] bg-[rgba(var(--app-accent-rgb),0.08)] shadow-[0_0_0_1px_rgba(var(--app-accent-rgb),0.16),var(--app-shadow)]"
                          : "border-[var(--app-border)] bg-white/[0.052] shadow-[var(--app-shadow-soft)]",
                        meta.aura,
                      )}
                    >
                      <div className={cn("absolute inset-x-0 top-0 h-20 bg-gradient-to-br opacity-75 transition group-hover:opacity-95", meta.accent)} />

                      <div className="relative grid gap-2">
                        <div className="grid gap-2 min-[460px]:flex min-[460px]:items-center min-[460px]:justify-between min-[460px]:gap-3">
                          <div className="flex min-w-0 items-center gap-2">
                            <h3 className="truncate text-base font-semibold text-foreground">{profile.name}</h3>
                            {selected ? <Check className="h-4 w-4 shrink-0 text-primary" /> : null}
                          </div>

                          <div className="flex shrink-0 items-center gap-1.5">
                            {isGeminiTts ? null : <Badge className="hidden border-white/10 bg-black/20 text-[11px] text-muted-foreground 2xl:inline-flex">Provider voice</Badge>}
                            <Button variant="ghost" size="sm" className="h-8 px-2.5" onClick={() => previewVoice(profile.name)}>
                              <Play className="h-3.5 w-3.5" />
                              Preview
                            </Button>
                            <Button variant={selected ? "default" : "outline"} size="sm" className="h-8 px-2.5" onClick={() => setVoice(profile.name)}>
                              Select
                            </Button>
                          </div>
                        </div>

                        <div>
                          <p className="text-sm leading-5 text-muted-foreground">{profile.identity}</p>
                          {isGeminiTts ? null : <p className="mt-1 text-xs font-medium text-[var(--app-accent-contrast)]">{profile.role}</p>}
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            </div>

            <div className="grid content-start gap-5">
              <div>
                <div className="mb-3 flex items-center gap-2 text-sm font-medium text-foreground">
                  <Waves className="h-4 w-4 text-[var(--app-accent-contrast)]" />
                  Voice delivery style
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {voiceStyles.map((item) => (
                    <button
                      key={item}
                      onClick={() => setStyle(item)}
                      className={cn(
                        "rounded-lg border px-3 py-3 text-left text-sm transition hover:-translate-y-0.5",
                        style === item
                          ? "border-primary/45 bg-primary/10 text-foreground shadow-glow"
                          : "border-[var(--app-border)] bg-white/[0.045] text-muted-foreground hover:border-primary/30 hover:text-foreground",
                      )}
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>

              <div className="rounded-xl border border-[var(--app-border)] bg-white/[0.045] p-4">
                <div className="mb-3 flex items-center justify-between text-sm text-foreground">
                  <span className="flex items-center gap-2"><Gauge className="h-4 w-4 text-[var(--app-accent-contrast)]" /> Speed</span>
                  <span>{speed.toFixed(2)}x</span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="2"
                  step="0.05"
                  value={speed}
                  onChange={(event) => setSpeed(Number(event.target.value))}
                  className="h-8 w-full accent-[var(--app-accent-contrast)]"
                />
              </div>
            </div>
          </section>
        </section>

        <aside className={cn("min-w-0 transition lg:block", historyOpen ? "block" : "hidden")}>
          <section className="sticky top-20 rounded-xl border border-[var(--app-border)] bg-black/24 p-4 shadow-2xl backdrop-blur-xl">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                <History className="h-4 w-4 text-[var(--app-accent-contrast)]" />
                History
              </div>
              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    history.forEach((item) => {
                      if (item.audioUrl?.startsWith("blob:")) URL.revokeObjectURL(item.audioUrl);
                    });
                    clearHistoryAudioCache().catch(() => undefined);
                    clearHistory();
                  }}
                  disabled={!history.length}
                >
                  Clear
                </Button>
                <Button variant="ghost" size="icon" onClick={() => setHistoryOpen(false)} aria-label="Collapse history">
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="grid max-h-[calc(100vh-12rem)] gap-3 overflow-y-auto overflow-x-hidden pr-1">
              {history.length ? (
                history.map((item) => (
                  <article
                    key={item.id}
                    className="min-w-0 overflow-hidden rounded-lg border border-[var(--app-border)] bg-white/[0.045] p-3 transition hover:border-primary/35"
                  >
                    <button
                      type="button"
                      onClick={() => void loadHistoryItem(item)}
                      className="block w-full min-w-0 text-left"
                    >
                      <p className="line-clamp-3 min-w-0 break-words text-sm leading-6 text-foreground">{item.text}</p>
                    </button>
                    <div className="mt-3 flex min-w-0 items-center justify-between gap-2 text-xs text-muted-foreground">
                      <span className="min-w-0 truncate">{item.voice} / {item.style}</span>
                      <span className="shrink-0">{new Date(item.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div className="mt-3 flex gap-2">
                      <Button variant="ghost" size="sm" onClick={() => void loadHistoryItem(item)}>
                        <Play className="h-3.5 w-3.5" />
                        Play
                      </Button>
                      <Button variant="outline" size="icon" onClick={() => void downloadHistoryItem(item)} aria-label="Download history audio">
                        <Download className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </article>
                ))
              ) : (
                <div className="overflow-hidden rounded-lg border border-dashed border-[var(--app-border)] bg-white/[0.04] p-5 text-sm leading-6 text-muted-foreground">
                  <div className="mx-auto mb-4 grid h-24 w-32 items-end gap-1 rounded-lg border border-[var(--app-border)] bg-black/15 p-3">
                    <div className="flex h-16 items-end gap-1">
                      {Array.from({ length: 12 }, (_, index) => (
                        <span
                          key={index}
                          className="flex-1 rounded-full bg-gradient-to-t from-[rgba(var(--app-accent-rgb),0.18)] to-[rgba(var(--app-accent-rgb),0.58)] opacity-70"
                          style={{ height: `${22 + ((index * 23) % 56)}%` }}
                        />
                      ))}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="font-medium text-foreground">No sessions yet</div>
                    <div className="mt-1 text-xs leading-5">Generated voices will appear here locally.</div>
                  </div>
                </div>
              )}
            </div>
          </section>
        </aside>

        {!historyOpen ? (
          <button
            onClick={() => setHistoryOpen(true)}
            className="fixed right-4 top-24 z-20 hidden rounded-full border border-[var(--app-border)] bg-[var(--app-panel-strong)] p-3 text-muted-foreground shadow-2xl transition hover:text-foreground lg:block"
            aria-label="Open history"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
        ) : null}
      </div>

      <section className="fixed inset-x-0 bottom-0 z-30 overflow-hidden border-t border-[var(--app-border)] bg-[color-mix(in_srgb,var(--app-panel-strong)_92%,transparent)] px-3 py-2 backdrop-blur-xl sm:px-4 sm:py-3">
        {busy ? (
          <>
            <div
              className="absolute inset-y-0 left-0 bg-[linear-gradient(90deg,rgba(var(--app-accent-rgb),0.26),rgba(var(--app-accent-rgb),0.11))] shadow-[0_0_54px_rgba(var(--app-accent-rgb),0.26)] transition-[width] duration-200 ease-out"
              style={{ width: `${generationProgress}%` }}
            />
            <div className="pointer-events-none absolute inset-0 grid place-items-center text-sm font-medium text-foreground/60">
              {Math.round(generationProgress)}%
            </div>
          </>
        ) : null}
        <div className="relative mx-auto flex max-w-[1500px] items-center gap-2 sm:gap-3">
          <div className="min-w-0 flex-1">
            <Waveform
              audioUrl={audioUrl}
              active={busy}
              downloadName={downloadName}
              title={audioUrl ? `${voice} / ${style}` : busy ? `Generating ${voice} / ${style}` : "No voice generated yet"}
            />
          </div>
          <div className="hidden shrink-0 gap-2 sm:flex sm:justify-end">
            <Button variant="outline" className="w-full sm:w-auto" onClick={loadStudioSample}>
              <RotateCcw className="h-4 w-4" />
              Sample
            </Button>
          </div>
        </div>
      </section>
    </main>
  );
}



