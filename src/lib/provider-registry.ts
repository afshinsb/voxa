export const TTS_PROVIDER_NAMES = ["openai", "gemini", "elevenlabs", "mock"] as const;
export const TEXT_PROVIDER_NAMES = ["openai", "gemini", "mock"] as const;

export type ProviderKind = "tts" | "text";
export type TtsProviderName = (typeof TTS_PROVIDER_NAMES)[number];
export type TextProviderName = (typeof TEXT_PROVIDER_NAMES)[number];
export type ProviderName = TtsProviderName | TextProviderName;

export const DEFAULT_TTS_PROVIDER: TtsProviderName = "openai";
export const DEFAULT_TEXT_PROVIDER: TextProviderName = "openai";

type ProviderRegistry = {
  tts: Record<TtsProviderName, ProviderMetadata>;
  text: Record<TextProviderName, ProviderMetadata>;
};

type ProviderMetadata = {
  label: string;
  requiredEnv: readonly string[];
  model: {
    env?: string;
    fallback: string;
  };
};

export const providerRegistry = {
  tts: {
    openai: {
      label: "OpenAI stable provider",
      requiredEnv: ["OPENAI_API_KEY"],
      model: { env: "OPENAI_TTS_MODEL", fallback: "gpt-4o-mini-tts" },
    },
    gemini: {
      label: "Gemini experimental expressive provider",
      requiredEnv: ["GEMINI_API_KEY"],
      model: { env: "GEMINI_TTS_MODEL", fallback: "gemini-2.5-flash-preview-tts" },
    },
    elevenlabs: {
      label: "ElevenLabs premium voice consistency provider",
      requiredEnv: ["ELEVENLABS_API_KEY", "ELEVENLABS_VOICE_ID"],
      model: { fallback: "eleven_multilingual_v2" },
    },
    mock: {
      label: "Demo mode",
      requiredEnv: [],
      model: { fallback: "local-mock-wav" },
    },
  },
  text: {
    openai: {
      label: "OpenAI stable provider",
      requiredEnv: ["OPENAI_API_KEY"],
      model: { env: "OPENAI_TEXT_MODEL", fallback: "gpt-4o-mini" },
    },
    gemini: {
      label: "Gemini experimental expressive provider",
      requiredEnv: ["GEMINI_API_KEY"],
      model: { env: "GEMINI_TEXT_MODEL", fallback: "gemini-2.0-flash" },
    },
    mock: {
      label: "Demo mode",
      requiredEnv: [],
      model: { fallback: "local-mock-text" },
    },
  },
} as const satisfies ProviderRegistry;

export function providerMetadata(kind: "tts", provider: TtsProviderName): ProviderMetadata;
export function providerMetadata(kind: "text", provider: TextProviderName): ProviderMetadata;
export function providerMetadata(kind: ProviderKind, provider: string): ProviderMetadata | undefined;
export function providerMetadata(kind: ProviderKind, provider: string) {
  return (providerRegistry[kind] as Record<string, ProviderMetadata>)[provider];
}
