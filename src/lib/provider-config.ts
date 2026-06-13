import { activeTextProvider, activeTtsProvider, hasSecret, serverEnv } from "@/lib/env";
import { providerMetadata, type ProviderKind } from "@/lib/provider-registry";

const fallbackModels: Record<ProviderKind, string> = {
  tts: "local-mock-wav",
  text: "local-mock-text",
};

export function providerLabel(name: string) {
  return providerMetadata("tts", name)?.label ?? providerMetadata("text", name)?.label ?? name;
}

export function requiredEnvFor(kind: ProviderKind, provider: string) {
  return [...(providerMetadata(kind, provider)?.requiredEnv ?? [])];
}

export function missingEnvFor(kind: ProviderKind, provider: string) {
  return requiredEnvFor(kind, provider).filter((name) => !hasSecret(name));
}

export function isProviderConfigured(kind: ProviderKind, provider: string) {
  return missingEnvFor(kind, provider).length === 0;
}

export function modelForProvider(kind: ProviderKind, provider: string) {
  const model = providerMetadata(kind, provider)?.model;
  if (!model) return fallbackModels[kind];
  return model.env ? serverEnv(model.env, model.fallback) : model.fallback;
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
      model: modelForProvider("tts", tts),
      configured: ttsMissingEnv.length === 0,
      missingEnv: ttsMissingEnv,
    },
    text: {
      provider: text,
      label: providerLabel(text),
      model: modelForProvider("text", text),
      configured: textMissingEnv.length === 0,
      missingEnv: textMissingEnv,
    },
  };
}
