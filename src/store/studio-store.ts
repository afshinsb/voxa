"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { sampleText, voiceProfiles, voiceStyles } from "@/lib/constants";
import type { TtsGenerationMode } from "@/providers/tts/types";

export interface HistoryItem {
  id: string;
  text: string;
  voice: string;
  style: string;
  provider: string;
  model: string;
  audioUrl?: string;
  mimeType: string;
  extension: string;
  createdAt: string;
}

interface StudioState {
  text: string;
  voice: string;
  style: string;
  speed: number;
  generationMode: TtsGenerationMode;
  history: HistoryItem[];
  setText: (text: string) => void;
  setVoice: (voice: string) => void;
  setStyle: (style: string) => void;
  setSpeed: (speed: number) => void;
  setGenerationMode: (mode: TtsGenerationMode) => void;
  addHistory: (item: HistoryItem) => void;
  attachHistoryAudio: (id: string, audioUrl: string) => void;
  clearHistory: () => void;
  loadSample: () => void;
}

export const useStudioStore = create<StudioState>()(
  persist(
    (set) => ({
      text: sampleText,
      voice: voiceProfiles[0].name,
      style: voiceStyles[0],
      speed: 1,
      generationMode: "lowest_quota",
      history: [],
      setText: (text) => set({ text }),
      setVoice: (voice) => set({ voice }),
      setStyle: (style) => set({ style }),
      setSpeed: (speed) => set({ speed }),
      setGenerationMode: (generationMode) => set({ generationMode }),
      addHistory: (item) =>
        set((state) => ({
          history: [item, ...state.history].slice(0, 12),
        })),
      attachHistoryAudio: (id, audioUrl) =>
        set((state) => ({
          history: state.history.map((item) => (item.id === id ? { ...item, audioUrl } : item)),
        })),
      clearHistory: () => set({ history: [] }),
      loadSample: () => set({ text: sampleText }),
    }),
    {
      name: "voxa-studio",
      version: 1,
      migrate: (persistedState, version) => {
        if (version < 1 && persistedState && typeof persistedState === "object") {
          return {
            ...persistedState,
            generationMode: "lowest_quota",
          } as StudioState;
        }

        return persistedState as StudioState;
      },
      partialize: (state) => ({
        text: state.text,
        voice: state.voice,
        style: state.style,
        speed: state.speed,
        generationMode: state.generationMode,
        history: state.history.map(({ audioUrl: _audioUrl, ...item }) => item),
      }),
    },
  ),
);
