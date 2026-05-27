import { activeTextProvider } from "@/lib/env";
import { GeminiTextProvider } from "./gemini";
import { MockTextProvider } from "./mock";
import { OpenAiTextProvider } from "./openai";
import type { TextProvider, TextProviderName } from "./types";

export function createTextProvider(name = activeTextProvider()): TextProvider {
  switch (name as TextProviderName) {
    case "mock":
      return new MockTextProvider();
    case "gemini":
      return new GeminiTextProvider();
    case "openai":
    default:
      return new OpenAiTextProvider();
  }
}

export function listTextProviders() {
  return [new OpenAiTextProvider(), new GeminiTextProvider(), new MockTextProvider()];
}

export type { RewriteRequest, RewriteTone, TargetLanguage, TextResult } from "./types";
