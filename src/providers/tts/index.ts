import { activeTtsProvider } from "@/lib/env";
import { ElevenLabsTtsProvider } from "./elevenlabs";
import { GeminiTtsProvider } from "./gemini";
import { MockTtsProvider } from "./mock";
import { OpenAiTtsProvider } from "./openai";
import type { TtsProvider, TtsProviderName } from "./types";

export function createTtsProvider(name = activeTtsProvider()): TtsProvider {
  switch (name as TtsProviderName) {
    case "mock":
      return new MockTtsProvider();
    case "gemini":
      return new GeminiTtsProvider();
    case "elevenlabs":
      return new ElevenLabsTtsProvider();
    case "openai":
    default:
      return new OpenAiTtsProvider();
  }
}

export function listTtsProviders() {
  return [new OpenAiTtsProvider(), new GeminiTtsProvider(), new ElevenLabsTtsProvider(), new MockTtsProvider()];
}

export type { TtsRequest, TtsResponse, VoiceStyle } from "./types";
