import { ApiError } from "@/lib/http";
import { serverEnv } from "@/lib/env";
import { missingEnvFor, modelForProvider } from "@/lib/provider-config";
import { getTonePreset, getVoiceCharacter } from "@/lib/voice-config";
import { buildOpenAiTtsPayload } from "./adapters/openai";
import type { TtsProvider, TtsRequest, TtsResponse } from "./types";

export class OpenAiTtsProvider implements TtsProvider {
  name = "openai" as const;
  model = modelForProvider("tts", this.name);

  isConfigured() {
    return missingEnvFor("tts", this.name).length === 0;
  }

  async generateSpeech(input: TtsRequest): Promise<TtsResponse> {
    const apiKey = serverEnv("OPENAI_API_KEY");
    if (!apiKey) {
      throw new ApiError("Speech provider API key is not configured.", 500, "provider_not_configured");
    }

    const response = await fetch("https://api.openai.com/v1/audio/speech", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(buildOpenAiTtsPayload(input, this.model)),
    });

    if (!response.ok) {
      const body = await response.json().catch(() => ({}));
      const message = body?.error?.message ?? "Speech generation failed at the selected provider.";
      const code = response.status === 429 ? "quota_exceeded" : "provider_error";
      throw new ApiError(message, response.status, code);
    }

    const buffer = Buffer.from(await response.arrayBuffer());

    return {
      audioBase64: buffer.toString("base64"),
      mimeType: "audio/mpeg",
      extension: "mp3",
      provider: this.name,
      model: this.model,
      character: {
        id: getVoiceCharacter(input.voice).id,
        displayName: getVoiceCharacter(input.voice).displayName,
      },
      tone: {
        id: getTonePreset(input.style).id,
        displayName: getTonePreset(input.style).displayName,
      },
    };
  }
}
