import { NextResponse } from "next/server";
import { detectLanguage } from "@/lib/language";
import { ApiError, jsonError, parseJson } from "@/lib/http";
import { createTtsProvider } from "@/providers/tts";
import type { TtsRequest } from "@/providers/tts/types";

export async function POST(request: Request) {
  try {
    const body = await parseJson<Partial<TtsRequest> & { provider?: string }>(request);
    const text = body.text?.trim();

    if (!text) {
      throw new ApiError("Enter text before generating speech.", 400, "empty_text");
    }

    const provider = createTtsProvider(body.provider);
    const response = await provider.generateSpeech({
      text,
      voice: body.voice ?? "Nova",
      style: body.style ?? "Calm",
      speed: Number(body.speed ?? 1),
      language: body.language ?? detectLanguage(text),
      generationMode: body.generationMode ?? "balanced",
      chunking: body.chunking ?? "single",
    });

    return NextResponse.json(response);
  } catch (error) {
    return jsonError(error);
  }
}
