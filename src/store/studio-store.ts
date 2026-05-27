"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { sampleText, voiceProfiles, voiceStyles } from "@/lib/constants";
import { getTonePreset, getVoiceCharacter, normalizeCharacterId, normalizeToneId } from "@/lib/voice-config";
import type { TonePresetId, VoiceCharacterId } from "@/lib/voice-config";
import type { TtsGenerationMode } from "@/providers/tts/types";

export interface HistoryItem {
  id: string;
  text: string;
  voice: VoiceCharacterId;
  style: TonePresetId;
  characterName?: string;
  toneName?: string;
  provider: string;
  model: string;
  audioUrl?: string;
  mimeType: string;
  extension: string;
  createdAt: string;
}

interface StudioState {
  text: string;
  voice: VoiceCharacterId;
  style: TonePresetId;
  speed: number;
  generationMode: TtsGenerationMode;
  history: HistoryItem[];
  setText: (text: string) => void;
  setVoice: (voice: VoiceCharacterId) => void;
  setStyle: (style: TonePresetId) => void;
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
      voice: voiceProfiles[0].id,
      style: voiceStyles[0].id,
      speed: 1,
      generationMode: "lowest_quota",
      history: [],
      setText: (text) => set({ text }),
      setVoice: (voice) => set({ voice: normalizeCharacterId(voice) }),
      setStyle: (style) => set({ style: normalizeToneId(style) }),
      setSpeed: (speed) => set({ speed }),
      setGenerationMode: (generationMode) => set({ generationMode }),
      addHistory: (item) =>
        set((state) => ({
          history: [
            {
              ...item,
              voice: normalizeCharacterId(item.voice),
              style: normalizeToneId(item.style),
              characterName: item.characterName ?? getVoiceCharacter(item.voice).displayName,
              toneName: item.toneName ?? getTonePreset(item.style).displayName,
            },
            ...state.history,
          ].slice(0, 12),
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
      version: 2,
      migrate: (persistedState, version) => {
        if (persistedState && typeof persistedState === "object") {
          const state = persistedState as Partial<StudioState>;
          const voice = normalizeCharacterId(state.voice);
          const style = normalizeToneId(state.style);
          return {
            ...state,
            voice,
            style,
            generationMode: state.generationMode ?? "lowest_quota",
            history: (state.history ?? []).map((item) => {
              const normalizedVoice = normalizeCharacterId(item.voice);
              const normalizedTone = normalizeToneId(item.style);
              return {
                ...item,
                voice: normalizedVoice,
                style: normalizedTone,
                characterName: getVoiceCharacter(normalizedVoice).displayName,
                toneName: getTonePreset(normalizedTone).displayName,
              };
            }),
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
