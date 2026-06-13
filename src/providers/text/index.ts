import { activeTextProvider } from "@/lib/env";
import { TEXT_PROVIDER_NAMES, type TextProviderName } from "@/lib/provider-registry";
import { GeminiTextProvider } from "./gemini";
import { MockTextProvider } from "./mock";
import { OpenAiTextProvider } from "./openai";
import type { TextProvider } from "./types";

export function createTextProvider(name = activeTextProvider()): TextProvider {
  switch (name) {
    case "mock":
      return new MockTextProvider();
    case "gemini":
      return new GeminiTextProvider();
    case "openai":
    default:
      return new OpenAiTextProvider();
  }
}

function createKnownTextProvider(name: TextProviderName) {
  return createTextProvider(name);
}

export function listTextProviders() {
  return TEXT_PROVIDER_NAMES.map(createKnownTextProvider);
}

export type { RewriteRequest, RewriteTone, TargetLanguage, TextResult } from "./types";
