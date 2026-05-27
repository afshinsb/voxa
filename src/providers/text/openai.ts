import { serverEnv } from "@/lib/env";
import { ApiError } from "@/lib/http";
import { detectLanguage } from "@/lib/language";
import { missingEnvFor } from "@/lib/provider-config";
import type { RewriteRequest, TextProvider, TextResult } from "./types";

function systemPrompt(mode: "rewrite" | "translate", targetLanguage?: "fa" | "en") {
  const target = targetLanguage === "fa" ? "Persian" : targetLanguage === "en" ? "English" : "the input language";

  return [
    "You are Voxa's speech editor for premium AI voice generation.",
    `Mode: ${mode}. Output language: ${target}.`,
    "Make the result sound natural when spoken aloud.",
    "Persian must be conversational, modern, and native-sounding, not formal or robotic.",
    "English must be native-sounding, concise, and voiceover-ready.",
    "Cute, warm, and flirty tones should be charming, modern, restrained, and classy.",
    "Avoid cringe, childish phrasing, sexual phrasing, cheesy slogans, markdown, labels, and explanations.",
    "Return only the final rewritten or translated text.",
  ].join(" ");
}

export class OpenAiTextProvider implements TextProvider {
  name = "openai" as const;
  model = serverEnv("OPENAI_TEXT_MODEL", "gpt-4o-mini");

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
    const apiKey = serverEnv("OPENAI_API_KEY");
    if (!apiKey) {
      throw new ApiError("Text provider API key is not configured.", 500, "provider_not_configured");
    }

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: this.model,
        temperature: input.tone === "Professional" ? 0.45 : 0.72,
        messages: [
          {
            role: "system",
            content: systemPrompt(mode, input.targetLanguage === "auto" ? undefined : input.targetLanguage),
          },
          {
            role: "user",
            content: `Tone: ${input.tone}\nText:\n${input.text}`,
          },
        ],
      }),
    });

    if (!response.ok) {
      const body = await response.json().catch(() => ({}));
      const message = body?.error?.message ?? "Text processing failed at the selected provider.";
      const code = response.status === 429 ? "quota_exceeded" : "provider_error";
      throw new ApiError(message, response.status, code);
    }

    const body = await response.json();
    const text = body?.choices?.[0]?.message?.content?.trim();
    if (!text) {
      throw new ApiError("The selected provider returned an empty text response.", 502, "empty_provider_response");
    }

    return {
      text,
      detectedLanguage: detectLanguage(input.text),
      provider: this.name,
      model: this.model,
    };
  }
}
