import { activeTtsProvider } from "@/lib/env";
import { TTS_PROVIDER_NAMES, type TtsProviderName } from "@/lib/provider-registry";
import { ElevenLabsTtsProvider } from "./elevenlabs";
import { GeminiTtsProvider } from "./gemini";
import { MockTtsProvider } from "./mock";
import { OpenAiTtsProvider } from "./openai";
import type { TtsProvider } from "./types";

export function createTtsProvider(name = activeTtsProvider()): TtsProvider {
  switch (name) {
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

function createKnownTtsProvider(name: TtsProviderName) {
  return createTtsProvider(name);
}

export function listTtsProviders() {
  return TTS_PROVIDER_NAMES.map(createKnownTtsProvider);
}

export type { TtsRequest, TtsResponse, VoiceStyle } from "./types";
