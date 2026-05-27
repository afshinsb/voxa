import { activeTextProvider, activeTtsProvider, hasSecret, serverEnv } from "@/lib/env";

type ProviderKind = "tts" | "text";

const providerLabels: Record<string, string> = {
  openai: "OpenAI stable provider",
  gemini: "Gemini experimental expressive provider",
  elevenlabs: "ElevenLabs premium voice consistency provider",
  mock: "Demo mode",
};

const requirements: Record<ProviderKind, Record<string, string[]>> = {
  tts: {
    openai: ["OPENAI_API_KEY"],
    gemini: ["GEMINI_API_KEY"],
    elevenlabs: ["ELEVENLABS_API_KEY", "ELEVENLABS_VOICE_ID"],
    mock: [],
  },
  text: {
    openai: ["OPENAI_API_KEY"],
    gemini: ["GEMINI_API_KEY"],
    mock: [],
  },
};

export function providerLabel(name: string) {
  return providerLabels[name] ?? name;
}

export function requiredEnvFor(kind: ProviderKind, provider: string) {
  return requirements[kind][provider] ?? [];
}

export function missingEnvFor(kind: ProviderKind, provider: string) {
  return requiredEnvFor(kind, provider).filter((name) => !hasSecret(name));
}

export function isProviderConfigured(kind: ProviderKind, provider: string) {
  return missingEnvFor(kind, provider).length === 0;
}

export function selectedProviderHealth() {
  const tts = activeTtsProvider();
  const text = activeTextProvider();
  const ttsMissingEnv = missingEnvFor("tts", tts);
  const textMissingEnv = missingEnvFor("text", text);

  return {
    tts: {
      provider: tts,
      label: providerLabel(tts),
      model: tts === "openai" ? serverEnv("OPENAI_TTS_MODEL", "gpt-4o-mini-tts") : tts === "gemini" ? serverEnv("GEMINI_TTS_MODEL", "gemini-2.5-flash-preview-tts") : tts === "elevenlabs" ? "eleven_multilingual_v2" : "local-mock-wav",
      configured: ttsMissingEnv.length === 0,
      missingEnv: ttsMissingEnv,
    },
    text: {
      provider: text,
      label: providerLabel(text),
      model: text === "openai" ? serverEnv("OPENAI_TEXT_MODEL", "gpt-4o-mini") : text === "gemini" ? serverEnv("GEMINI_TEXT_MODEL", "gemini-2.0-flash") : "local-mock-text",
      configured: textMissingEnv.length === 0,
      missingEnv: textMissingEnv,
    },
  };
}
