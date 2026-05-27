export type TtsProviderName = "openai" | "gemini" | "elevenlabs" | "mock";
export type TtsGenerationMode = "balanced" | "lowest_quota" | "highest_consistency";
export type TtsChunkingMode = "single" | "split";

export type VoiceStyle =
  | "Calm"
  | "Warm"
  | "Cheerful"
  | "Whisper"
  | "Energetic"
  | "Cinematic"
  | "Intimate"
  | "Storyteller";

export interface TtsRequest {
  text: string;
  voice: string;
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
  durationHintSeconds?: number;
}

export interface TtsProvider {
  name: TtsProviderName;
  model: string;
  isConfigured(): boolean;
  generateSpeech(input: TtsRequest): Promise<TtsResponse>;
}
