import type { TonePresetId, VoiceCharacterId } from "@/lib/voice-config";
import type { TtsProviderName } from "@/lib/provider-registry";

export type { TtsProviderName } from "@/lib/provider-registry";
export type TtsGenerationMode = "balanced" | "lowest_quota" | "highest_consistency";
export type TtsChunkingMode = "single" | "split";
export type VoiceStyle = TonePresetId;

export interface TtsRequest {
  text: string;
  voice: VoiceCharacterId;
  style: VoiceStyle;
  speed: number;
  language?: "fa" | "en" | "mixed";
  generationMode?: TtsGenerationMode;
  chunking?: TtsChunkingMode;
}

export interface TtsResponse {
  audioBase64: string;
  mimeType: string;
  extension: "mp3" | "wav";
  provider: TtsProviderName;
  model: string;
  character: { id: VoiceCharacterId; displayName: string };
  tone: { id: TonePresetId; displayName: string };
  durationHintSeconds?: number;
}

export interface TtsProvider {
  name: TtsProviderName;
  model: string;
  isConfigured(): boolean;
  generateSpeech(input: TtsRequest): Promise<TtsResponse>;
}
