import { ApiError } from "@/lib/http";
import { serverEnv } from "@/lib/env";
import { missingEnvFor } from "@/lib/provider-config";
import type { TtsProvider, TtsRequest, TtsResponse } from "./types";

const voiceMap: Record<string, string> = {
  Nova: "nova",
  Alloy: "alloy",
  Verse: "verse",
  Sage: "sage",
  Coral: "coral",
};

function voiceInstruction(voice: string) {
  if (voice === "Nova") {
    return [
      "Voice identity: sound like a confident teenage valley girl.",
      "Use a bright, youthful, conversational delivery with playful upspeak, light vocal fry, and breezy Los Angeles energy.",
      "Keep it polished and tasteful, not childish, not parody, not exaggerated, and never annoying.",
      "Use subtle 'like' energy in cadence, but do not add filler words unless they are already in the input text.",
    ].join(" ");
  }

  return "Keep the selected voice identity natural, premium, and studio-ready.";
}

function styleInstruction(style: string, voice: string) {
  const map: Record<string, string> = {
    Calm: "Speak with calm clarity and a relaxed premium studio tone.",
    Warm: "Speak warmly and naturally, with human closeness but no exaggeration.",
    Cheerful: "Speak with bright controlled optimism.",
    Whisper: "Use a soft intimate whisper-like delivery while remaining intelligible.",
    Energetic: "Speak with crisp energy and forward momentum.",
    Cinematic: "Speak with a composed cinematic trailer-like presence.",
    Intimate: "Speak quietly and personally, as if close to the listener.",
    Storyteller: "Speak with narrative pacing and expressive pauses.",
  };

  return `${voiceInstruction(voice)} ${map[style] ?? map.Calm}`;
}

export class OpenAiTtsProvider implements TtsProvider {
  name = "openai" as const;
  model = serverEnv("OPENAI_TTS_MODEL", "gpt-4o-mini-tts");

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
      body: JSON.stringify({
        model: this.model,
        voice: voiceMap[input.voice] ?? "nova",
        input: input.text,
        response_format: "mp3",
        speed: Math.min(Math.max(input.speed, 0.5), 2),
        instructions: styleInstruction(input.style, input.voice),
      }),
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
    };
  }
}
