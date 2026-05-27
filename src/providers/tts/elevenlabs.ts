import { ApiError } from "@/lib/http";
import { serverEnv } from "@/lib/env";
import { missingEnvFor } from "@/lib/provider-config";
import { getTonePreset, getVoiceCharacter } from "@/lib/voice-config";
import { elevenLabsPayload, elevenLabsVoiceId } from "./adapters/elevenlabs";
import type { TtsProvider, TtsRequest, TtsResponse } from "./types";

export class ElevenLabsTtsProvider implements TtsProvider {
  name = "elevenlabs" as const;
  model = "eleven_multilingual_v2";

  isConfigured() {
    return missingEnvFor("tts", this.name).length === 0;
  }

  async generateSpeech(input: TtsRequest): Promise<TtsResponse> {
    const apiKey = serverEnv("ELEVENLABS_API_KEY");
    const voiceId = elevenLabsVoiceId(input);

    if (!apiKey || !voiceId) {
      throw new ApiError("ElevenLabs API key or voice id is not configured.", 500, "provider_not_configured");
    }

    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
      method: "POST",
      headers: {
        "xi-api-key": apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(elevenLabsPayload(input, this.model)),
    });

    if (!response.ok) {
      const body = await response.json().catch(() => ({}));
      const message = body?.detail?.message ?? "ElevenLabs speech generation failed.";
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
