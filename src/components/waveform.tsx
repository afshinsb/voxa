"use client";

import { useEffect, useRef, useState } from "react";
import { Download, Pause, Play } from "lucide-react";
import { cn } from "@/lib/cn";

function formatTime(value: number) {
  if (!Number.isFinite(value) || value <= 0) return "0:00";

  const minutes = Math.floor(value / 60);
  const seconds = Math.floor(value % 60);
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

export function Waveform({
  audioUrl,
  active,
  autoPlayKey = 0,
  downloadName,
  title,
}: {
  audioUrl?: string;
  active: boolean;
  autoPlayKey?: number;
  downloadName?: string;
  title?: string;
}) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const progress = duration > 0 ? currentTime / duration : 0;

  useEffect(() => {
    setPlaying(false);
    setCurrentTime(0);
    setDuration(0);
  }, [audioUrl]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !audioUrl || !autoPlayKey || active) return;

    audio.currentTime = 0;
    audio.play().catch(() => undefined);
  }, [active, audioUrl, autoPlayKey]);

  useEffect(() => {
    if (!playing) return;

    let frame = 0;
    const tick = () => {
      const audio = audioRef.current;
      if (audio) setCurrentTime(audio.currentTime);
      frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [playing]);

  const togglePlayback = async () => {
    const audio = audioRef.current;
    if (!audio || !audioUrl) return;

    if (playing) {
      audio.pause();
      return;
    }

    await audio.play();
  };

  const seek = (event: React.MouseEvent<HTMLButtonElement>) => {
    const audio = audioRef.current;
    if (!audio || !duration) return;

    const bounds = event.currentTarget.getBoundingClientRect();
    const ratio = Math.min(1, Math.max(0, (event.clientX - bounds.left) / bounds.width));
    audio.currentTime = ratio * duration;
  };

  return (
    <div
      className={cn(
        "grid min-w-0 grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-2 sm:gap-3",
      )}
    >
      <audio
        ref={audioRef}
        src={audioUrl || undefined}
        preload="metadata"
        onLoadedMetadata={(event) => setDuration(event.currentTarget.duration)}
        onTimeUpdate={(event) => setCurrentTime(event.currentTarget.currentTime)}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onEnded={() => setPlaying(false)}
      />

      <button
        type="button"
        onClick={togglePlayback}
        disabled={!audioUrl || active}
        className="grid h-9 w-9 place-items-center rounded-md bg-[rgba(var(--app-accent-rgb),0.1)] text-[var(--app-accent-contrast)] transition hover:bg-[rgba(var(--app-accent-rgb),0.16)] disabled:cursor-not-allowed disabled:opacity-45 sm:h-10 sm:w-10"
        aria-label={playing ? "Pause audio" : "Play audio"}
      >
        {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
      </button>

      <div className="min-w-0">
        <div className="mb-0.5 flex items-center justify-between gap-2 text-[11px] sm:mb-1.5 sm:gap-3 sm:text-xs">
          <span className="truncate font-medium text-foreground">{title ?? (audioUrl ? "Generated audio" : active ? "Generating audio" : "No voice generated yet")}</span>
          <span className="hidden shrink-0 text-muted-foreground min-[420px]:inline">
            {formatTime(currentTime)} / {formatTime(duration)}
          </span>
        </div>

        <button
          type="button"
          onClick={seek}
          disabled={!audioUrl || !duration}
          className="group relative h-5 w-full overflow-hidden px-1 transition disabled:cursor-default sm:h-7"
          aria-label="Seek audio"
        >
          <span className="absolute inset-x-1 top-1/2 h-px -translate-y-1/2 bg-foreground/12" />
          <span
            className="absolute left-1 top-1/2 h-0.5 -translate-y-1/2 rounded-full bg-[var(--app-accent-contrast)]"
            style={{ width: `calc((100% - 0.5rem) * ${audioUrl ? progress : 0})` }}
          />
          <span
            className="absolute top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[var(--app-accent-contrast)] shadow-sm"
            style={{ left: `calc(0.25rem + (100% - 0.5rem) * ${audioUrl ? progress : 0})` }}
          />
        </button>
      </div>

      <div className="flex items-center justify-end gap-2">
        {audioUrl ? (
          <a
            href={audioUrl}
            download={downloadName}
            aria-label="Download audio"
            className="inline-flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground transition hover:bg-[var(--app-muted-panel)] hover:text-foreground"
          >
            <Download className="h-3.5 w-3.5" />
          </a>
        ) : null}
      </div>
    </div>
  );
}
