import { DEFAULT_TEXT_PROVIDER, DEFAULT_TTS_PROVIDER } from "@/lib/provider-registry";

export function serverEnv(name: string, fallback = "") {
  const value = process.env[name]?.trim();
  return value ? value : fallback;
}

export function activeTtsProvider() {
  return serverEnv("TTS_PROVIDER", DEFAULT_TTS_PROVIDER).toLowerCase();
}

export function activeTextProvider() {
  return serverEnv("TEXT_PROVIDER", DEFAULT_TEXT_PROVIDER).toLowerCase();
}

export function hasSecret(name: string) {
  return Boolean(process.env[name]?.trim());
}
