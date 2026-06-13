import { serverEnv } from "@/lib/env";
import { ApiError } from "@/lib/http";
import { detectLanguage } from "@/lib/language";
import { missingEnvFor, modelForProvider } from "@/lib/provider-config";
import type { RewriteRequest, TextProvider, TextResult } from "./types";

function prompt(mode: "rewrite" | "translate", input: RewriteRequest) {
  const target = input.targetLanguage === "fa" ? "Persian" : input.targetLanguage === "en" ? "English" : "the input language";
  return [
    "You are Voxa's speech editor for premium AI voice generation.",
    `Task: ${mode} for spoken delivery.`,
    `Output language: ${target}. Tone: ${input.tone}.`,
    "Keep it natural, human, native-sounding, and restrained. Avoid cringe, childish, sexual, cheesy, or robotic phrasing.",
    "Return only the final text.",
    input.text,
  ].join("\n\n");
}

export class GeminiTextProvider implements TextProvider {
  name = "gemini" as const;
  model = modelForProvider("text", this.name);

  isConfigured() {
    return missingEnvFor("text", this.name).length === 0;
  }

  async rewrite(input: RewriteRequest): Promise<TextResult> {
    return this.run("rewrite", input);
  }

  async translate(input: RewriteRequest & { targetLanguage: "fa" | "en" }): Promise<TextResult> {
    return this.run("translate", input);
  }

  private async run(mode: "rewrite" | "translate", input: RewriteRequest): Promise<TextResult> {
    const apiKey = serverEnv("GEMINI_API_KEY");
    if (!apiKey) {
      throw new ApiError("Text provider configuration is incomplete.", 500, "provider_not_configured");
    }

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${this.model}:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt(mode, input) }] }],
          generationConfig: { temperature: input.tone === "Professional" ? 0.45 : 0.7 },
        }),
      },
    );

    if (!response.ok) {
      const body = await response.json().catch(() => ({}));
      const message = body?.error?.message ?? "Gemini text processing failed.";
      const code = response.status === 429 ? "quota_exceeded" : "provider_error";
      throw new ApiError(message, response.status, code);
    }

    const body = await response.json();
    const text = body?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
    if (!text) {
      throw new ApiError("Gemini returned an empty text response.", 502, "empty_provider_response");
    }

    return {
      text,
      detectedLanguage: detectLanguage(input.text),
      provider: this.name,
      model: this.model,
    };
  }
}
